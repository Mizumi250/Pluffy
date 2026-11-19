package backend

// Social sign-in (OAuth 2.0 / OIDC) layered on top of the per-tatemono token auth.
//
// Opt-in through the `@arkzen:oauth` DSL block; email + password keeps working untouched.
// Providers: google, github, twitter (X), apple, microsoft, facebook, instagram, discord.
// Secrets come from the environment only (OAUTH_<PROVIDER>_CLIENT_ID / _CLIENT_SECRET).
//
// Routes (prefix /api/<slug>/auth/oauth):
//
//	GET       /providers               which providers are configured
//	GET       /{provider}/redirect     starts the flow (302 to the provider)
//	GET|POST  /{provider}/callback     provider returns here (Apple uses a POST form_post)

import (
	"crypto/ecdsa"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"crypto/x509"
	"database/sql"
	"encoding/asn1"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

const (
	oauthUserAgent       = "Pluff-OAuth/1.0"
	oauthStateTTL        = 600 * time.Second
	oauthMaxCallbackBody = 1 << 20
)

var oauthProviderIDs = []string{"google", "github", "twitter", "apple", "microsoft", "facebook", "instagram", "discord"}

// OAuthConfig is the `@arkzen:oauth` block as sent by the parser. It never carries secrets.
type OAuthConfig struct {
	Providers         []string `json:"providers"`
	Redirect          string   `json:"redirect"`
	ErrorRedirect     string   `json:"errorRedirect"`
	LinkVerifiedEmail *bool    `json:"linkVerifiedEmail"`
}

func oauthKnownProvider(id string) bool {
	for _, known := range oauthProviderIDs {
		if known == id {
			return true
		}
	}
	return false
}

func validateOAuthConfig(payload BuildPayload) []string {
	if payload.OAuth == nil {
		return nil
	}
	var problems []string
	if !payload.Auth {
		problems = append(problems, "oauth requires auth to be enabled")
	}
	if len(payload.OAuth.Providers) == 0 {
		problems = append(problems, "oauth.providers must be a non-empty array")
	}
	for _, provider := range payload.OAuth.Providers {
		if !oauthKnownProvider(provider) {
			problems = append(problems, fmt.Sprintf("Unknown OAuth provider %q", provider))
		}
	}
	return problems
}

// ── HTTP seam (tests swap the client's transport; production uses the default) ──

var oauthHTTPClient = &http.Client{Timeout: 15 * time.Second}

func oauthDo(method, target string, headers map[string]string, body string) (int, string, error) {
	var reader io.Reader
	if body != "" {
		reader = strings.NewReader(body)
	}
	request, err := http.NewRequest(method, target, reader)
	if err != nil {
		return 0, "", err
	}
	for name, value := range headers {
		request.Header.Set(name, value)
	}
	response, err := oauthHTTPClient.Do(request)
	if err != nil {
		host := "?"
		if parsed, parseErr := url.Parse(target); parseErr == nil {
			host = parsed.Host
		}
		return 0, "", fmt.Errorf("provider request failed at %s", host)
	}
	defer response.Body.Close()
	data, _ := io.ReadAll(io.LimitReader(response.Body, 2<<20))
	return response.StatusCode, string(data), nil
}

func oauthDecodeJSON(text string) (any, bool) {
	decoder := json.NewDecoder(strings.NewReader(text))
	decoder.UseNumber() // provider ids (X, Discord) exceed float64 precision
	var value any
	if err := decoder.Decode(&value); err != nil {
		return nil, false
	}
	return value, true
}

func oauthGetJSON(target string, extra map[string]string) (any, error) {
	headers := map[string]string{"Accept": "application/json", "User-Agent": oauthUserAgent}
	for name, value := range extra {
		headers[name] = value
	}
	status, text, err := oauthDo(http.MethodGet, target, headers, "")
	if err != nil {
		return nil, err
	}
	value, ok := oauthDecodeJSON(text)
	if !ok || status < 200 || status > 299 {
		host := "?"
		if parsed, parseErr := url.Parse(target); parseErr == nil {
			host = parsed.Host
		}
		return nil, fmt.Errorf("provider request failed (%d) at %s", status, host)
	}
	return value, nil
}

// ── small helpers ────────────────────────────────────────────────────────────

func oauthEnv(key string) string { return strings.TrimSpace(envOr(key, "")) }

func oauthB64(data []byte) string { return base64.RawURLEncoding.EncodeToString(data) }

func oauthRandomBytes(length int) ([]byte, error) {
	value := make([]byte, length)
	if _, err := rand.Read(value); err != nil {
		return nil, fmt.Errorf("random source failed: %w", err)
	}
	return value, nil
}

func oauthRandomHex(length int) (string, error) {
	value, err := oauthRandomBytes(length)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(value), nil
}

var (
	oauthFallbackKeyOnce sync.Once
	oauthFallbackKey     []byte
)

func oauthStateKey() []byte {
	if value := oauthEnv("OAUTH_STATE_SECRET"); value != "" {
		return []byte(value)
	}
	// The engine secret ships with a public default; only trust it once the operator changed it.
	if value := oauthEnv("ARKZEN_ENGINE_SECRET"); value != "" && value != defaultEngineSecret {
		return []byte(value)
	}
	// No secret configured: a per-process key. Flows that straddle a restart simply fail and can be retried.
	oauthFallbackKeyOnce.Do(func() {
		key, err := oauthRandomBytes(32)
		if err != nil {
			key = []byte("arkzen-oauth")
		}
		oauthFallbackKey = key
	})
	return oauthFallbackKey
}

func oauthHMAC(data string) string {
	mac := hmac.New(sha256.New, oauthStateKey())
	mac.Write([]byte(data))
	return oauthB64(mac.Sum(nil))
}

func oauthSafeEq(a, b string) bool {
	return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}

func oauthPKCEVerifier(nonce string) string { return oauthHMAC("pkce:" + nonce) }

func oauthPKCEChallenge(nonce string) string {
	sum := sha256.Sum256([]byte(oauthPKCEVerifier(nonce)))
	return oauthB64(sum[:])
}

type oauthState struct {
	Nonce    string `json:"n"`
	Provider string `json:"p"`
	Slug     string `json:"s"`
	Expires  int64  `json:"e"`
}

func oauthSignState(state oauthState) string {
	raw, _ := json.Marshal(state)
	body := oauthB64(raw)
	return "v1." + body + "." + oauthHMAC("state:"+body)
}

func oauthReadState(token string) (oauthState, bool) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 || parts[0] != "v1" || !oauthSafeEq(parts[2], oauthHMAC("state:"+parts[1])) {
		return oauthState{}, false
	}
	raw, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return oauthState{}, false
	}
	var state oauthState
	if err := json.Unmarshal(raw, &state); err != nil || state.Expires <= time.Now().Unix() {
		return oauthState{}, false
	}
	return state, true
}

func oauthCookieName(slug string) string { return "arkzen-oauth-" + slug }

// Apple answers with a cross-site POST, which only carries a SameSite=None cookie (and that requires Secure).
func oauthCookie(slug, provider, value string, maxAge int) *http.Cookie {
	cookie := &http.Cookie{
		Name:     oauthCookieName(slug),
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   maxAge,
		SameSite: http.SameSiteLaxMode,
	}
	if provider == "apple" {
		cookie.SameSite = http.SameSiteNoneMode
		cookie.Secure = true
	}
	if maxAge <= 0 {
		cookie.MaxAge = -1
	}
	return cookie
}

func oauthClientID(provider string) string {
	return oauthEnv("OAUTH_" + strings.ToUpper(provider) + "_CLIENT_ID")
}

func oauthClientSecret(provider string) string {
	return oauthEnv("OAUTH_" + strings.ToUpper(provider) + "_CLIENT_SECRET")
}

func oauthConfigured(provider string) bool {
	if oauthClientID(provider) == "" {
		return false
	}
	if provider == "apple" {
		return oauthEnv("OAUTH_APPLE_TEAM_ID") != "" && oauthEnv("OAUTH_APPLE_KEY_ID") != "" && oauthEnv("OAUTH_APPLE_PRIVATE_KEY") != ""
	}
	return oauthClientSecret(provider) != ""
}

func oauthProviderName(provider string) string {
	switch provider {
	case "google":
		return "Google"
	case "github":
		return "GitHub"
	case "twitter":
		return "X (Twitter)"
	case "apple":
		return "Apple"
	case "microsoft":
		return "Microsoft"
	case "facebook":
		return "Facebook"
	case "instagram":
		return "Instagram"
	case "discord":
		return "Discord"
	}
	return "Provider"
}

func oauthRedirectBase() string {
	base := oauthEnv("OAUTH_REDIRECT_BASE")
	if base == "" {
		base = oauthEnv("APP_URL")
	}
	if base == "" {
		base = "http://localhost:8000"
	}
	return strings.TrimRight(base, "/")
}

func oauthFrontendURL() string {
	base := oauthEnv("OAUTH_FRONTEND_URL")
	if base == "" {
		base = "http://localhost:3000"
	}
	return strings.TrimRight(base, "/")
}

func oauthCallbackURL(slug, provider string) string {
	return fmt.Sprintf("%s/api/%s/auth/oauth/%s/callback", oauthRedirectBase(), slug, provider)
}

func oauthGraphVersion(provider string) string {
	value := oauthEnv("OAUTH_" + provider + "_API_VERSION")
	if value == "" {
		return "v25.0"
	}
	return value
}

// Apple's client secret is a short-lived ES256 JWT signed with the team's .p8 key.
func oauthAppleClientSecret() (string, error) {
	team, keyID := oauthEnv("OAUTH_APPLE_TEAM_ID"), oauthEnv("OAUTH_APPLE_KEY_ID")
	pemText := strings.ReplaceAll(oauthEnv("OAUTH_APPLE_PRIVATE_KEY"), `\n`, "\n")
	if team == "" || keyID == "" || pemText == "" {
		return "", errors.New("Apple needs OAUTH_APPLE_TEAM_ID, OAUTH_APPLE_KEY_ID and OAUTH_APPLE_PRIVATE_KEY")
	}
	block, _ := pem.Decode([]byte(pemText))
	if block == nil {
		return "", errors.New("OAUTH_APPLE_PRIVATE_KEY is not valid PEM")
	}
	parsed, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return "", fmt.Errorf("OAUTH_APPLE_PRIVATE_KEY is not a valid PKCS#8 EC key: %w", err)
	}
	key, ok := parsed.(*ecdsa.PrivateKey)
	if !ok {
		return "", errors.New("OAUTH_APPLE_PRIVATE_KEY is not a valid PKCS#8 EC key")
	}
	now := time.Now().Unix()
	head, _ := json.Marshal(map[string]any{"alg": "ES256", "kid": keyID, "typ": "JWT"})
	body, _ := json.Marshal(map[string]any{
		"iss": team, "iat": now, "exp": now + 300,
		"aud": "https://appleid.apple.com", "sub": oauthClientID("apple"),
	})
	signingInput := oauthB64(head) + "." + oauthB64(body)
	digest := sha256.Sum256([]byte(signingInput))
	der, err := ecdsa.SignASN1(rand.Reader, key, digest[:])
	if err != nil {
		return "", fmt.Errorf("could not sign Apple client secret: %w", err)
	}
	var rs struct{ R, S *big.Int }
	if _, err := asn1.Unmarshal(der, &rs); err != nil {
		return "", fmt.Errorf("could not encode Apple client secret: %w", err)
	}
	raw := make([]byte, 64)
	rs.R.FillBytes(raw[:32])
	rs.S.FillBytes(raw[32:])
	return signingInput + "." + oauthB64(raw), nil
}

// ── provider table ───────────────────────────────────────────────────────────

type oauthDef struct {
	authorize string
	token     string
	scope     string
	pkce      bool
	basicAuth bool
	extra     [][2]string
}

func oauthDefinition(provider string) (oauthDef, bool) {
	tenant := oauthEnv("OAUTH_MICROSOFT_TENANT")
	if tenant == "" {
		tenant = "common"
	}
	fb := oauthGraphVersion("FACEBOOK")
	switch provider {
	case "google":
		return oauthDef{"https://accounts.google.com/o/oauth2/v2/auth", "https://oauth2.googleapis.com/token", "openid email profile", true, false,
			[][2]string{{"access_type", "online"}, {"prompt", "select_account"}}}, true
	case "github":
		return oauthDef{"https://github.com/login/oauth/authorize", "https://github.com/login/oauth/access_token", "read:user user:email", false, false, nil}, true
	case "twitter":
		// X: authorization code + PKCE is mandatory; confidential clients authenticate with HTTP Basic.
		return oauthDef{"https://x.com/i/oauth2/authorize", "https://api.x.com/2/oauth2/token", "users.read tweet.read users.email", true, true, nil}, true
	case "apple":
		// Apple: client_secret is a signed JWT, the callback is a form_post, the identity is in the id_token.
		return oauthDef{"https://appleid.apple.com/auth/authorize", "https://appleid.apple.com/auth/token", "name email", false, false,
			[][2]string{{"response_mode", "form_post"}}}, true
	case "microsoft":
		return oauthDef{
			"https://login.microsoftonline.com/" + tenant + "/oauth2/v2.0/authorize",
			"https://login.microsoftonline.com/" + tenant + "/oauth2/v2.0/token",
			"openid profile email User.Read", true, false,
			[][2]string{{"response_mode", "query"}, {"prompt", "select_account"}}}, true
	case "facebook":
		return oauthDef{
			"https://www.facebook.com/" + fb + "/dialog/oauth",
			"https://graph.facebook.com/" + fb + "/oauth/access_token",
			"email,public_profile", false, false, nil}, true
	case "instagram":
		// Instagram API with Instagram Login (Basic Display API is gone). Professional accounts only; no email is shared.
		return oauthDef{"https://www.instagram.com/oauth/authorize", "https://api.instagram.com/oauth/access_token", "instagram_business_basic", false, false, nil}, true
	case "discord":
		return oauthDef{"https://discord.com/oauth2/authorize", "https://discord.com/api/oauth2/token", "identify email", true, false,
			[][2]string{{"prompt", "consent"}}}, true
	}
	return oauthDef{}, false
}

func oauthAuthorizeURL(slug, provider string) (string, string, error) {
	def, ok := oauthDefinition(provider)
	if !ok {
		return "", "", errors.New("Unknown OAuth provider")
	}
	nonceBytes, err := oauthRandomBytes(24)
	if err != nil {
		return "", "", err
	}
	nonce := oauthB64(nonceBytes)
	state := oauthSignState(oauthState{Nonce: nonce, Provider: provider, Slug: slug, Expires: time.Now().Add(oauthStateTTL).Unix()})
	query := url.Values{}
	query.Set("client_id", oauthClientID(provider))
	query.Set("redirect_uri", oauthCallbackURL(slug, provider))
	query.Set("response_type", "code")
	query.Set("scope", def.scope)
	query.Set("state", state)
	for _, pair := range def.extra {
		query.Set(pair[0], pair[1])
	}
	if def.pkce {
		query.Set("code_challenge", oauthPKCEChallenge(nonce))
		query.Set("code_challenge_method", "S256")
	}
	if provider == "apple" {
		query.Set("nonce", nonce)
	}
	return def.authorize + "?" + query.Encode(), nonce, nil
}

func oauthExchangeCode(slug, provider, code, nonce string) (map[string]any, error) {
	def, ok := oauthDefinition(provider)
	if !ok {
		return nil, errors.New("Unknown OAuth provider")
	}
	secret := oauthClientSecret(provider)
	if provider == "apple" {
		var err error
		if secret, err = oauthAppleClientSecret(); err != nil {
			return nil, err
		}
	}
	id := oauthClientID(provider)
	headers := map[string]string{
		"Content-Type": "application/x-www-form-urlencoded",
		"Accept":       "application/json",
		"User-Agent":   oauthUserAgent,
	}
	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("redirect_uri", oauthCallbackURL(slug, provider))
	form.Set("client_id", id)
	if def.basicAuth {
		headers["Authorization"] = "Basic " + base64.StdEncoding.EncodeToString([]byte(id+":"+secret))
	} else {
		form.Set("client_secret", secret)
	}
	if def.pkce {
		form.Set("code_verifier", oauthPKCEVerifier(nonce))
	}
	status, text, err := oauthDo(http.MethodPost, def.token, headers, form.Encode())
	if err != nil {
		return nil, err
	}
	data := map[string]any{}
	if value, ok := oauthDecodeJSON(text); ok {
		if object, isObject := value.(map[string]any); isObject {
			data = object
		}
	} else if values, parseErr := url.ParseQuery(text); parseErr == nil { // some providers answer form-encoded
		for key := range values {
			data[key] = values.Get(key)
		}
	}
	if list, isList := data["data"].([]any); isList && len(list) > 0 { // Instagram variant
		if first, isObject := list[0].(map[string]any); isObject {
			data = first
		}
	}
	if status < 200 || status > 299 || (oauthText(data, "access_token") == "" && oauthText(data, "id_token") == "") {
		return nil, fmt.Errorf("token exchange failed (%d)", status)
	}
	return data, nil
}

// ── profiles ─────────────────────────────────────────────────────────────────

type oauthProfile struct {
	ID            string
	Email         string
	EmailVerified bool
	Name          string
	Avatar        string
}

func oauthText(object map[string]any, key string) string {
	switch value := object[key].(type) {
	case string:
		return value
	case json.Number:
		return value.String()
	}
	return ""
}

func oauthTruthy(value any) bool {
	switch typed := value.(type) {
	case bool:
		return typed
	case string:
		return typed == "true"
	}
	return false
}

func oauthObject(value any) map[string]any {
	if object, ok := value.(map[string]any); ok {
		return object
	}
	return map[string]any{}
}

func oauthFirst(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

func oauthBearer(tokens map[string]any) map[string]string {
	return map[string]string{"Authorization": "Bearer " + oauthText(tokens, "access_token")}
}

func oauthFetchProfile(provider string, tokens map[string]any, nonce, appleUser string) (oauthProfile, error) {
	missing := func(what string) error {
		return fmt.Errorf("%s returned no %s", oauthProviderName(provider), what)
	}
	token := oauthText(tokens, "access_token")
	switch provider {
	case "google":
		raw, err := oauthGetJSON("https://openidconnect.googleapis.com/v1/userinfo", oauthBearer(tokens))
		if err != nil {
			return oauthProfile{}, err
		}
		u := oauthObject(raw)
		if oauthText(u, "sub") == "" {
			return oauthProfile{}, missing("user id")
		}
		return oauthProfile{ID: oauthText(u, "sub"), Email: oauthText(u, "email"), EmailVerified: oauthTruthy(u["email_verified"]),
			Name: oauthText(u, "name"), Avatar: oauthText(u, "picture")}, nil
	case "github":
		headers := oauthBearer(tokens)
		headers["Accept"] = "application/vnd.github+json"
		headers["X-GitHub-Api-Version"] = "2022-11-28"
		raw, err := oauthGetJSON("https://api.github.com/user", headers)
		if err != nil {
			return oauthProfile{}, err
		}
		u := oauthObject(raw)
		if oauthText(u, "id") == "" {
			return oauthProfile{}, missing("user id")
		}
		email, verified := oauthText(u, "email"), false
		// user:email scope missing or denied: keep the public email, unverified.
		if list, listErr := oauthGetJSON("https://api.github.com/user/emails", headers); listErr == nil {
			if entries, isList := list.([]any); isList {
				var pick map[string]any
				for _, entry := range entries {
					object := oauthObject(entry)
					if oauthTruthy(object["primary"]) && oauthTruthy(object["verified"]) {
						pick = object
						break
					}
				}
				if pick == nil {
					for _, entry := range entries {
						object := oauthObject(entry)
						if oauthTruthy(object["verified"]) {
							pick = object
							break
						}
					}
				}
				if pick != nil {
					email, verified = oauthText(pick, "email"), true
				}
			}
		}
		return oauthProfile{ID: oauthText(u, "id"), Email: email, EmailVerified: verified,
			Name: oauthFirst(oauthText(u, "name"), oauthText(u, "login")), Avatar: oauthText(u, "avatar_url")}, nil
	case "twitter":
		raw, err := oauthGetJSON("https://api.x.com/2/users/me?user.fields=profile_image_url,confirmed_email", oauthBearer(tokens))
		if err != nil {
			return oauthProfile{}, err
		}
		u := oauthObject(oauthObject(raw)["data"])
		if oauthText(u, "id") == "" {
			return oauthProfile{}, missing("user id")
		}
		// X returns an email only when the app has the permission; it is never treated as verified.
		return oauthProfile{ID: oauthText(u, "id"), Email: oauthText(u, "confirmed_email"),
			Name: oauthFirst(oauthText(u, "name"), oauthText(u, "username")), Avatar: oauthText(u, "profile_image_url")}, nil
	case "apple":
		return oauthAppleProfile(tokens, nonce, appleUser)
	case "microsoft":
		raw, err := oauthGetJSON("https://graph.microsoft.com/oidc/userinfo", oauthBearer(tokens))
		if err != nil {
			return oauthProfile{}, err
		}
		u := oauthObject(raw)
		if oauthText(u, "sub") == "" {
			return oauthProfile{}, missing("user id")
		}
		// Microsoft emails are not proven to belong to the user ("nOAuth"), so they are never auto-linked.
		return oauthProfile{ID: oauthText(u, "sub"), Email: oauthText(u, "email"), Name: oauthText(u, "name")}, nil
	case "facebook":
		target := "https://graph.facebook.com/" + oauthGraphVersion("FACEBOOK") + "/me?fields=id,name,email,picture.type(large)&access_token=" + url.QueryEscape(token)
		raw, err := oauthGetJSON(target, nil)
		if err != nil {
			return oauthProfile{}, err
		}
		u := oauthObject(raw)
		if oauthText(u, "id") == "" {
			return oauthProfile{}, missing("user id")
		}
		avatar := oauthText(oauthObject(oauthObject(u["picture"])["data"]), "url")
		return oauthProfile{ID: oauthText(u, "id"), Email: oauthText(u, "email"), Name: oauthText(u, "name"), Avatar: avatar}, nil
	case "instagram":
		target := "https://graph.instagram.com/" + oauthGraphVersion("INSTAGRAM") + "/me?fields=user_id,username,name,profile_picture_url&access_token=" + url.QueryEscape(token)
		raw, err := oauthGetJSON(target, nil)
		if err != nil {
			return oauthProfile{}, err
		}
		u := oauthObject(raw)
		id := oauthFirst(oauthText(u, "user_id"), oauthText(u, "id"))
		if id == "" {
			return oauthProfile{}, missing("user id")
		}
		return oauthProfile{ID: id, Name: oauthFirst(oauthText(u, "name"), oauthText(u, "username")), Avatar: oauthText(u, "profile_picture_url")}, nil
	case "discord":
		raw, err := oauthGetJSON("https://discord.com/api/users/@me", oauthBearer(tokens))
		if err != nil {
			return oauthProfile{}, err
		}
		u := oauthObject(raw)
		id := oauthText(u, "id")
		if id == "" {
			return oauthProfile{}, missing("user id")
		}
		avatar := ""
		if hash := oauthText(u, "avatar"); hash != "" {
			avatar = "https://cdn.discordapp.com/avatars/" + id + "/" + hash + ".png"
		}
		verified, _ := u["verified"].(bool)
		return oauthProfile{ID: id, Email: oauthText(u, "email"), EmailVerified: verified,
			Name: oauthFirst(oauthText(u, "global_name"), oauthText(u, "username")), Avatar: avatar}, nil
	}
	return oauthProfile{}, errors.New("Unknown OAuth provider")
}

func oauthAppleProfile(tokens map[string]any, nonce, appleUser string) (oauthProfile, error) {
	parts := strings.Split(oauthText(tokens, "id_token"), ".")
	if len(parts) < 2 {
		return oauthProfile{}, errors.New("Malformed id_token")
	}
	raw, err := base64.RawURLEncoding.DecodeString(strings.TrimRight(parts[1], "="))
	if err != nil {
		return oauthProfile{}, errors.New("Malformed id_token")
	}
	value, ok := oauthDecodeJSON(string(raw))
	if !ok {
		return oauthProfile{}, errors.New("Malformed id_token")
	}
	claims := oauthObject(value)
	// Signature is not re-verified: the token came straight from Apple's token endpoint over TLS (OIDC Core 3.1.3.7).
	if oauthText(claims, "iss") != "https://appleid.apple.com" {
		return oauthProfile{}, errors.New("Apple id_token has the wrong issuer")
	}
	if oauthText(claims, "aud") != oauthClientID("apple") {
		return oauthProfile{}, errors.New("Apple id_token was issued for another client")
	}
	exp, expErr := json.Number(oauthText(claims, "exp")).Int64()
	if expErr != nil || exp < time.Now().Unix() {
		return oauthProfile{}, errors.New("Apple id_token has expired")
	}
	if oauthText(claims, "nonce") != nonce {
		return oauthProfile{}, errors.New("Apple id_token nonce mismatch")
	}
	// Apple sends the name once, on first authorization, as a JSON form field.
	name := ""
	if appleUser != "" {
		if userValue, ok := oauthDecodeJSON(appleUser); ok {
			nameObject := oauthObject(oauthObject(userValue)["name"])
			name = strings.TrimSpace(oauthText(nameObject, "firstName") + " " + oauthText(nameObject, "lastName"))
		}
	}
	if oauthText(claims, "sub") == "" {
		return oauthProfile{}, errors.New("Apple returned no user id")
	}
	return oauthProfile{ID: oauthText(claims, "sub"), Email: oauthText(claims, "email"), EmailVerified: oauthTruthy(claims["email_verified"]), Name: name}, nil
}

// ── users ────────────────────────────────────────────────────────────────────

// ensureOAuthTables creates the identity table. Called from Service.Build when `@arkzen:oauth` is declared.
func ensureOAuthTables(storageDir, module string) error {
	db, err := openModuleDatabase(storageDir, module)
	if err != nil {
		return fmt.Errorf("open OAuth database: %w", err)
	}
	defer db.Close()
	idType, userType := "INTEGER PRIMARY KEY AUTOINCREMENT", "INTEGER"
	if configuredDialect() == postgresDialect {
		idType, userType = "BIGSERIAL PRIMARY KEY", "BIGINT"
	}
	if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS "oauth_accounts" (
		"id" ` + idType + `,
		"user_id" ` + userType + ` NOT NULL,
		"provider" TEXT NOT NULL,
		"provider_user_id" TEXT NOT NULL,
		"email" TEXT NULL,
		"avatar" TEXT NULL,
		"created_at" TEXT NULL,
		"updated_at" TEXT NULL,
		UNIQUE ("provider","provider_user_id")
	)`); err != nil {
		return fmt.Errorf("create oauth_accounts: %w", err)
	}
	if _, err := db.Exec(`CREATE INDEX IF NOT EXISTS "oauth_accounts_user_id_index" ON "oauth_accounts" ("user_id")`); err != nil {
		return fmt.Errorf("index oauth_accounts: %w", err)
	}
	return nil
}

func oauthNullable(value string) any {
	if value == "" {
		return nil
	}
	return value
}

func oauthInsertReturningID(db *sql.DB, query string, args ...any) (int64, error) {
	if configuredDialect() == postgresDialect {
		var id int64
		err := db.QueryRow(query+` RETURNING "id"`, args...).Scan(&id)
		return id, err
	}
	result, err := db.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func oauthGetUser(db *sql.DB, id int64) (authUser, bool, error) {
	var user authUser
	err := db.QueryRow(`SELECT "id","name","email","role","email_verified_at","created_at","updated_at" FROM "users" WHERE "id" = ?`, id).
		Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.EmailVerifiedAt, &user.CreatedAt, &user.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return authUser{}, false, nil
	}
	if err != nil {
		return authUser{}, false, err
	}
	return user, true, nil
}

func oauthFindUserByEmail(db *sql.DB, email string) (int64, bool, error) {
	var id int64
	err := db.QueryRow(`SELECT "id" FROM "users" WHERE lower("email") = ?`, email).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, false, nil
	}
	return id, err == nil, err
}

// oauthResolveUser finds, links or creates the local user for a provider profile.
func oauthResolveUser(db *sql.DB, provider string, profile oauthProfile, linkVerifiedEmail bool) (authUser, error) {
	now := time.Now().UTC().Format(time.RFC3339Nano)

	var accountID, linkedUserID int64
	err := db.QueryRow(`SELECT "id","user_id" FROM "oauth_accounts" WHERE "provider" = ? AND "provider_user_id" = ?`, provider, profile.ID).
		Scan(&accountID, &linkedUserID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return authUser{}, fmt.Errorf("unable to look up OAuth account: %w", err)
	}
	if err == nil {
		user, found, getErr := oauthGetUser(db, linkedUserID)
		if getErr != nil {
			return authUser{}, fmt.Errorf("unable to read linked user: %w", getErr)
		}
		if found {
			if _, execErr := db.Exec(`UPDATE "oauth_accounts" SET "email" = ?,"avatar" = ?,"updated_at" = ? WHERE "id" = ?`,
				oauthNullable(profile.Email), oauthNullable(profile.Avatar), now, accountID); execErr != nil {
				return authUser{}, fmt.Errorf("unable to refresh OAuth account: %w", execErr)
			}
			return user, nil
		}
		// orphaned link: drop it and re-create below
		if _, execErr := db.Exec(`DELETE FROM "oauth_accounts" WHERE "id" = ?`, accountID); execErr != nil {
			return authUser{}, fmt.Errorf("unable to drop orphaned OAuth account: %w", execErr)
		}
	}

	email := strings.ToLower(strings.TrimSpace(profile.Email))
	var user authUser
	linkedExisting := false

	if email != "" && profile.EmailVerified && linkVerifiedEmail {
		existingID, found, findErr := oauthFindUserByEmail(db, email)
		if findErr != nil {
			return authUser{}, fmt.Errorf("unable to look up user by email: %w", findErr)
		}
		if found {
			// Pre-hijack defence: this account may have been registered by someone else with this email before its
			// owner ever signed in with the provider (the users table has no verified-email flag). Revoke every
			// session and replace the password so only the provider-verified owner can continue.
			if _, execErr := db.Exec(`DELETE FROM "personal_access_tokens" WHERE "tokenable_id" = ? AND "tokenable_type" = 'user'`, existingID); execErr != nil {
				return authUser{}, fmt.Errorf("unable to revoke sessions: %w", execErr)
			}
			randomPassword, randErr := oauthRandomHex(32)
			if randErr != nil {
				return authUser{}, randErr
			}
			hash, hashErr := hashPassword(randomPassword)
			if hashErr != nil {
				return authUser{}, fmt.Errorf("unable to hash password: %w", hashErr)
			}
			if _, execErr := db.Exec(`UPDATE "users" SET "password" = ?,"updated_at" = ? WHERE "id" = ?`, hash, now, existingID); execErr != nil {
				return authUser{}, fmt.Errorf("unable to rotate password: %w", execErr)
			}
			existing, ok, getErr := oauthGetUser(db, existingID)
			if getErr != nil || !ok {
				return authUser{}, fmt.Errorf("unable to read linked user: %v", getErr)
			}
			user, linkedExisting = existing, true
		}
	}

	if !linkedExisting {
		// Providers without a usable email (Instagram, X without permission) get a reserved, non-routable address.
		own := email
		if own != "" {
			if _, taken, findErr := oauthFindUserByEmail(db, own); findErr != nil {
				return authUser{}, fmt.Errorf("unable to look up user by email: %w", findErr)
			} else if taken {
				own = "" // taken and not linkable
			}
		}
		if own == "" {
			own = strings.ToLower(provider + "-" + profile.ID + "@oauth.invalid")
		}
		name := strings.TrimSpace(profile.Name)
		if name == "" {
			name = strings.SplitN(own, "@", 2)[0]
		}
		if runes := []rune(name); len(runes) > 255 {
			name = string(runes[:255])
		}
		randomPassword, randErr := oauthRandomHex(32)
		if randErr != nil {
			return authUser{}, randErr
		}
		hash, hashErr := hashPassword(randomPassword)
		if hashErr != nil {
			return authUser{}, fmt.Errorf("unable to hash password: %w", hashErr)
		}
		var verifiedAt any
		if profile.EmailVerified {
			verifiedAt = now
		}
		id, insertErr := oauthInsertReturningID(db,
			`INSERT INTO "users" ("name","email","password","role","email_verified_at","created_at","updated_at") VALUES (?,?,?,'user',?,?,?)`,
			name, own, hash, verifiedAt, now, now)
		if insertErr != nil {
			return authUser{}, fmt.Errorf("unable to create user: %w", insertErr)
		}
		created, ok, getErr := oauthGetUser(db, id)
		if getErr != nil || !ok {
			return authUser{}, fmt.Errorf("created user could not be read back: %v", getErr)
		}
		user = created
	}

	if _, err := db.Exec(`INSERT INTO "oauth_accounts" ("user_id","provider","provider_user_id","email","avatar","created_at","updated_at") VALUES (?,?,?,?,?,?,?)`,
		user.ID, provider, profile.ID, oauthNullable(profile.Email), oauthNullable(profile.Avatar), now, now); err != nil {
		return authUser{}, fmt.Errorf("unable to link OAuth account: %w", err)
	}
	return user, nil
}

// oauthIssueToken creates a personal access token in the same "id|plain" shape the password flow returns.
func oauthIssueToken(db *sql.DB, user authUser) (string, error) {
	token, err := randomToken()
	if err != nil {
		return "", err
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	id, err := oauthInsertReturningID(db,
		`INSERT INTO "personal_access_tokens" ("tokenable_type","tokenable_id","name","token","abilities","created_at","updated_at") VALUES ('user',?,'arkzen-token',?,'["*"]',?,?)`,
		user.ID, hashToken(token), now, now)
	if err != nil {
		return "", fmt.Errorf("unable to persist access token: %w", err)
	}
	return fmt.Sprintf("%d|%s", id, token), nil
}

// ── request handling ─────────────────────────────────────────────────────────

type oauthUserError string

func (e oauthUserError) Error() string { return string(e) }

func oauthPath(configured, fallback string) string {
	if strings.HasPrefix(configured, "/") && !strings.HasPrefix(configured, "//") && !strings.Contains(configured, `\`) {
		return configured
	}
	return fallback
}

func oauthRedirect(w http.ResponseWriter, r *http.Request, target string, cookie *http.Cookie) {
	w.Header().Set("Cache-Control", "no-store")
	if cookie != nil {
		http.SetCookie(w, cookie)
	}
	http.Redirect(w, r, target, http.StatusFound)
}

func oauthFail(w http.ResponseWriter, r *http.Request, config *OAuthConfig, slug, provider, message string) {
	fragment := url.Values{"arkzen_oauth_error": {message}}.Encode()
	target := oauthFrontendURL() + oauthPath(config.ErrorRedirect, "/") + "#" + fragment
	oauthRedirect(w, r, target, oauthCookie(slug, provider, "", 0))
}

func oauthLinkVerified(config *OAuthConfig) bool {
	return config.LinkVerifiedEmail == nil || *config.LinkVerifiedEmail
}

func oauthEnabled(config *OAuthConfig, provider string) bool {
	if !oauthKnownProvider(provider) {
		return false
	}
	for _, enabled := range config.Providers {
		if enabled == provider {
			return true
		}
	}
	return false
}

// serveOAuthRoute handles everything under /api/<slug>/auth/oauth/. `rest` is the part after that prefix.
func (h *Handler) serveOAuthRoute(w http.ResponseWriter, r *http.Request, registration Registration, rest string) {
	config := registration.OAuth
	rest = strings.Trim(rest, "/")
	if rest == "providers" {
		if r.Method != http.MethodGet {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"message": "Method not allowed"})
			return
		}
		list := make([]map[string]any, 0, len(config.Providers))
		for _, id := range config.Providers {
			list = append(list, map[string]any{"id": id, "name": oauthProviderName(id), "enabled": oauthConfigured(id)})
		}
		writeJSON(w, http.StatusOK, map[string]any{"providers": list})
		return
	}
	provider, action, found := strings.Cut(rest, "/")
	if !found || !oauthEnabled(config, provider) {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Unknown OAuth provider."})
		return
	}
	slug := registration.Name
	switch action {
	case "redirect":
		if r.Method != http.MethodGet {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"message": "Method not allowed"})
			return
		}
		if !oauthConfigured(provider) {
			oauthFail(w, r, config, slug, provider, oauthProviderName(provider)+" sign-in is not configured on this server.")
			return
		}
		target, nonce, err := oauthAuthorizeURL(slug, provider)
		if err != nil {
			log.Printf("[oauth:%s] %v", provider, err)
			oauthFail(w, r, config, slug, provider, "Sign-in failed. Please try again.")
			return
		}
		oauthRedirect(w, r, target, oauthCookie(slug, provider, nonce, int(oauthStateTTL.Seconds())))
	case "callback":
		if r.Method != http.MethodGet && r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"message": "Method not allowed"})
			return
		}
		token, err := h.oauthCallback(w, r, registration, provider)
		var userError oauthUserError
		switch {
		case errors.As(err, &userError):
			oauthFail(w, r, config, slug, provider, string(userError))
		case err != nil:
			log.Printf("[oauth:%s] %v", provider, err)
			oauthFail(w, r, config, slug, provider, "Sign-in failed. Please try again.")
		default:
			fragment := url.Values{"arkzen_oauth_token": {token}, "arkzen_oauth_slug": {slug}}.Encode()
			oauthRedirect(w, r, oauthFrontendURL()+oauthPath(config.Redirect, "/")+"#"+fragment, oauthCookie(slug, provider, "", 0))
		}
	default:
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Unknown OAuth provider."})
	}
}

func (h *Handler) oauthCallback(w http.ResponseWriter, r *http.Request, registration Registration, provider string) (string, error) {
	slug := registration.Name
	params := url.Values{}
	for key, values := range r.URL.Query() {
		params[key] = values
	}
	if r.Method == http.MethodPost {
		r.Body = http.MaxBytesReader(w, r.Body, oauthMaxCallbackBody)
		if err := r.ParseForm(); err != nil {
			return "", oauthUserError("The provider response could not be read.")
		}
		for key, values := range r.PostForm {
			params[key] = values
		}
	}
	if params.Get("error") != "" {
		return "", oauthUserError(oauthProviderName(provider) + " sign-in was cancelled or denied.")
	}
	expired := oauthUserError("Sign-in session expired or was tampered with. Please try again.")
	state, ok := oauthReadState(params.Get("state"))
	if !ok {
		return "", expired
	}
	cookie, err := r.Cookie(oauthCookieName(slug))
	if err != nil || cookie.Value == "" {
		return "", expired
	}
	if state.Provider != provider || state.Slug != slug || !oauthSafeEq(cookie.Value, state.Nonce) {
		return "", expired
	}
	code := params.Get("code")
	if code == "" {
		return "", oauthUserError("The provider did not return an authorization code.")
	}

	tokens, err := oauthExchangeCode(slug, provider, code, state.Nonce)
	if err != nil {
		return "", err
	}
	profile, err := oauthFetchProfile(provider, tokens, state.Nonce, params.Get("user"))
	if err != nil {
		return "", err
	}

	db, err := openModuleDatabase(h.service.storageDir, slug)
	if err != nil {
		return "", fmt.Errorf("unable to open auth database: %w", err)
	}
	defer db.Close()
	user, err := oauthResolveUser(db, provider, profile, oauthLinkVerified(registration.OAuth))
	if err != nil {
		return "", err
	}
	return oauthIssueToken(db, user)
}
