package backend

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"io"
	"math/big"
	"net/http"
	"net/http/httptest"
	"net/url"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

type oauthRoundTrip func(*http.Request) (int, string)

func (f oauthRoundTrip) RoundTrip(r *http.Request) (*http.Response, error) {
	status, body := f(r)
	return &http.Response{
		StatusCode: status,
		Body:       io.NopCloser(strings.NewReader(body)),
		Header:     make(http.Header),
		Request:    r,
	}, nil
}

func oauthMockProviders(t *testing.T, routes func(r *http.Request, body string) (int, string)) {
	t.Helper()
	previous := oauthHTTPClient
	oauthHTTPClient = &http.Client{Transport: oauthRoundTrip(func(r *http.Request) (int, string) {
		body := ""
		if r.Body != nil {
			raw, _ := io.ReadAll(r.Body)
			body = string(raw)
		}
		return routes(r, body)
	})}
	t.Cleanup(func() { oauthHTTPClient = previous })
}

func oauthTestEnv(t *testing.T) {
	t.Helper()
	t.Setenv("OAUTH_STATE_SECRET", "test-state-secret")
	t.Setenv("OAUTH_REDIRECT_BASE", "http://localhost:8000")
	t.Setenv("OAUTH_FRONTEND_URL", "http://localhost:3000")
	t.Setenv("OAUTH_GOOGLE_CLIENT_ID", "google-id")
	t.Setenv("OAUTH_GOOGLE_CLIENT_SECRET", "google-secret")
	t.Setenv("OAUTH_GITHUB_CLIENT_ID", "github-id")
	t.Setenv("OAUTH_GITHUB_CLIENT_SECRET", "github-secret")
	t.Setenv("OAUTH_TWITTER_CLIENT_ID", "x-id")
	t.Setenv("OAUTH_TWITTER_CLIENT_SECRET", "x-secret")
	t.Setenv("OAUTH_DISCORD_CLIENT_ID", "discord-id")
	t.Setenv("OAUTH_DISCORD_CLIENT_SECRET", "discord-secret")
	// microsoft is listed in the tatemono but deliberately left unconfigured
}

func oauthTestHandler(t *testing.T, build string) (*Handler, string) {
	t.Helper()
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	return handler, storage
}

const oauthBuild = `{"name":"oauth-test","backendVariant":"go","auth":true,
	"oauth":{"providers":["google","github","twitter","apple","microsoft","discord"],"redirect":"/dashboard","errorRedirect":"/login","linkVerifiedEmail":true}}`

func oauthRedirectStart(t *testing.T, handler *Handler, provider string) (*url.URL, *http.Cookie) {
	t.Helper()
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/oauth-test/auth/oauth/"+provider+"/redirect", nil))
	if recorder.Code != http.StatusFound {
		t.Fatalf("%s redirect status = %d: %s", provider, recorder.Code, recorder.Body.String())
	}
	location, err := url.Parse(recorder.Header().Get("Location"))
	if err != nil {
		t.Fatal(err)
	}
	var state *http.Cookie
	for _, cookie := range recorder.Result().Cookies() {
		if cookie.Name == "arkzen-oauth-oauth-test" {
			state = cookie
		}
	}
	if state == nil || state.Value == "" || !state.HttpOnly {
		t.Fatalf("%s redirect must set an HttpOnly state cookie, got %v", provider, recorder.Header()["Set-Cookie"])
	}
	return location, state
}

func oauthCallback(handler *Handler, method, provider, query, form string, cookie *http.Cookie) *httptest.ResponseRecorder {
	target := "/api/oauth-test/auth/oauth/" + provider + "/callback"
	if query != "" {
		target += "?" + query
	}
	var request *http.Request
	if method == http.MethodPost {
		request = httptest.NewRequest(method, target, strings.NewReader(form))
		request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	} else {
		request = httptest.NewRequest(method, target, nil)
	}
	if cookie != nil {
		request.AddCookie(&http.Cookie{Name: cookie.Name, Value: cookie.Value})
	}
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	return recorder
}

func oauthFragment(t *testing.T, recorder *httptest.ResponseRecorder) (string, url.Values) {
	t.Helper()
	if recorder.Code != http.StatusFound {
		t.Fatalf("callback status = %d: %s", recorder.Code, recorder.Body.String())
	}
	location, err := url.Parse(recorder.Header().Get("Location"))
	if err != nil {
		t.Fatal(err)
	}
	values, err := url.ParseQuery(location.Fragment)
	if err != nil {
		t.Fatal(err)
	}
	return location.Scheme + "://" + location.Host + location.Path, values
}

func oauthMe(handler *Handler, token string) *httptest.ResponseRecorder {
	request := httptest.NewRequest(http.MethodGet, "/api/oauth-test/auth/me", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	return recorder
}

func oauthMeUser(t *testing.T, handler *Handler, token string) authUser {
	t.Helper()
	recorder := oauthMe(handler, token)
	if recorder.Code != http.StatusOK {
		t.Fatalf("/me status = %d: %s", recorder.Code, recorder.Body.String())
	}
	var user authUser
	if err := json.Unmarshal(recorder.Body.Bytes(), &user); err != nil {
		t.Fatal(err)
	}
	return user
}

func oauthCountRows(t *testing.T, storage, query string) int {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(storage, "databases", "oauth-test.sqlite"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	var count int
	if err := db.QueryRow(query).Scan(&count); err != nil {
		t.Fatal(err)
	}
	return count
}

func TestOAuthGoogleFlowCreatesThenReusesAccount(t *testing.T) {
	oauthTestEnv(t)
	var verifier string
	oauthMockProviders(t, func(r *http.Request, body string) (int, string) {
		switch r.URL.Host + r.URL.Path {
		case "oauth2.googleapis.com/token":
			form, _ := url.ParseQuery(body)
			verifier = form.Get("code_verifier")
			if form.Get("code") != "good-code" || form.Get("client_secret") != "google-secret" ||
				form.Get("redirect_uri") != "http://localhost:8000/api/oauth-test/auth/oauth/google/callback" {
				return 400, `{"error":"bad"}`
			}
			return 200, `{"access_token":"g-access","token_type":"Bearer"}`
		case "openidconnect.googleapis.com/v1/userinfo":
			if r.Header.Get("Authorization") != "Bearer g-access" {
				return 401, `{}`
			}
			return 200, `{"sub":"1234567890123456789","email":"Ada@Example.com","email_verified":true,"name":"Ada Lovelace","picture":"https://img/ada.png"}`
		}
		return 404, `{}`
	})
	handler, storage := oauthTestHandler(t, oauthBuild)

	providers := httptest.NewRecorder()
	handler.ServeHTTP(providers, httptest.NewRequest(http.MethodGet, "/api/oauth-test/auth/oauth/providers", nil))
	var listing struct {
		Providers []struct {
			ID      string `json:"id"`
			Enabled bool   `json:"enabled"`
		} `json:"providers"`
	}
	if err := json.Unmarshal(providers.Body.Bytes(), &listing); err != nil || len(listing.Providers) != 6 {
		t.Fatalf("providers listing = %s", providers.Body.String())
	}
	enabled := map[string]bool{}
	for _, provider := range listing.Providers {
		enabled[provider.ID] = provider.Enabled
	}
	if !enabled["google"] || !enabled["github"] || enabled["microsoft"] || enabled["apple"] {
		t.Fatalf("enabled flags follow the environment, got %v", enabled)
	}

	location, cookie := oauthRedirectStart(t, handler, "google")
	query := location.Query()
	if location.Host != "accounts.google.com" || query.Get("client_id") != "google-id" || query.Get("response_type") != "code" ||
		query.Get("code_challenge_method") != "S256" || query.Get("scope") != "openid email profile" {
		t.Fatalf("authorize URL = %s", location)
	}

	callback := oauthCallback(handler, http.MethodGet, "google",
		url.Values{"code": {"good-code"}, "state": {query.Get("state")}}.Encode(), "", cookie)
	base, fragment := oauthFragment(t, callback)
	if base != "http://localhost:3000/dashboard" || fragment.Get("arkzen_oauth_slug") != "oauth-test" {
		t.Fatalf("success redirect = %s %v", base, fragment)
	}
	sum := sha256.Sum256([]byte(verifier))
	if base64.RawURLEncoding.EncodeToString(sum[:]) != query.Get("code_challenge") {
		t.Fatal("PKCE verifier sent to the token endpoint does not match the challenge")
	}
	if !strings.Contains(strings.Join(callback.Header()["Set-Cookie"], ";"), "arkzen-oauth-oauth-test=;") &&
		!strings.Contains(strings.Join(callback.Header()["Set-Cookie"], ";"), "Max-Age=0") {
		t.Fatalf("state cookie must be cleared, got %v", callback.Header()["Set-Cookie"])
	}

	token := fragment.Get("arkzen_oauth_token")
	user := oauthMeUser(t, handler, token)
	if user.Email != "ada@example.com" || user.Name != "Ada Lovelace" || user.EmailVerifiedAt == nil {
		t.Fatalf("created user = %+v", user)
	}

	// signing in again must reuse the linked account, not create a second user
	location, cookie = oauthRedirectStart(t, handler, "google")
	again := oauthCallback(handler, http.MethodGet, "google",
		url.Values{"code": {"good-code"}, "state": {location.Query().Get("state")}}.Encode(), "", cookie)
	_, fragment = oauthFragment(t, again)
	if second := oauthMeUser(t, handler, fragment.Get("arkzen_oauth_token")); second.ID != user.ID {
		t.Fatalf("second sign-in made user %d, want %d", second.ID, user.ID)
	}
	if n := oauthCountRows(t, storage, `SELECT COUNT(*) FROM "users"`); n != 1 {
		t.Fatalf("users = %d, want 1", n)
	}
	if n := oauthCountRows(t, storage, `SELECT COUNT(*) FROM "oauth_accounts"`); n != 1 {
		t.Fatalf("oauth_accounts = %d, want 1", n)
	}
}

func TestOAuthRejectsTamperedStateMissingCookieAndProviderErrors(t *testing.T) {
	oauthTestEnv(t)
	oauthMockProviders(t, func(r *http.Request, body string) (int, string) { return 500, `{}` })
	handler, _ := oauthTestHandler(t, oauthBuild)

	location, cookie := oauthRedirectStart(t, handler, "google")
	state := location.Query().Get("state")

	cases := map[string]*httptest.ResponseRecorder{
		"tampered state":     oauthCallback(handler, http.MethodGet, "google", url.Values{"code": {"c"}, "state": {state + "x"}}.Encode(), "", cookie),
		"missing cookie":     oauthCallback(handler, http.MethodGet, "google", url.Values{"code": {"c"}, "state": {state}}.Encode(), "", nil),
		"wrong cookie":       oauthCallback(handler, http.MethodGet, "google", url.Values{"code": {"c"}, "state": {state}}.Encode(), "", &http.Cookie{Name: cookie.Name, Value: "other"}),
		"wrong provider":     oauthCallback(handler, http.MethodGet, "github", url.Values{"code": {"c"}, "state": {state}}.Encode(), "", cookie),
		"user denied":        oauthCallback(handler, http.MethodGet, "google", url.Values{"error": {"access_denied"}}.Encode(), "", cookie),
		"missing code":       oauthCallback(handler, http.MethodGet, "google", url.Values{"state": {state}}.Encode(), "", cookie),
		"token exchange 500": oauthCallback(handler, http.MethodGet, "google", url.Values{"code": {"c"}, "state": {state}}.Encode(), "", cookie),
	}
	for name, recorder := range cases {
		base, fragment := oauthFragment(t, recorder)
		if base != "http://localhost:3000/login" || fragment.Get("arkzen_oauth_error") == "" || fragment.Get("arkzen_oauth_token") != "" {
			t.Fatalf("%s: redirect = %s %v", name, base, fragment)
		}
	}

	expired := oauthState{Nonce: "n", Provider: "google", Slug: "oauth-test", Expires: time.Now().Add(-time.Minute).Unix()}
	late := oauthCallback(handler, http.MethodGet, "google",
		url.Values{"code": {"c"}, "state": {oauthSignState(expired)}}.Encode(), "", &http.Cookie{Name: cookie.Name, Value: "n"})
	if _, fragment := oauthFragment(t, late); !strings.Contains(fragment.Get("arkzen_oauth_error"), "expired") {
		t.Fatalf("expired state must be refused, got %v", fragment)
	}

	// a provider listed in the tatemono but without credentials fails softly
	unconfigured := httptest.NewRecorder()
	handler.ServeHTTP(unconfigured, httptest.NewRequest(http.MethodGet, "/api/oauth-test/auth/oauth/microsoft/redirect", nil))
	if _, fragment := oauthFragment(t, unconfigured); !strings.Contains(fragment.Get("arkzen_oauth_error"), "not configured") {
		t.Fatalf("unconfigured provider redirect = %v", fragment)
	}

	// providers the tatemono did not enable, unknown providers and wrong methods
	for target, want := range map[string]int{
		"/api/oauth-test/auth/oauth/facebook/redirect": http.StatusNotFound,
		"/api/oauth-test/auth/oauth/nope/redirect":     http.StatusNotFound,
		"/api/oauth-test/auth/oauth/google/other":      http.StatusNotFound,
	} {
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, target, nil))
		if recorder.Code != want {
			t.Fatalf("%s status = %d, want %d", target, recorder.Code, want)
		}
	}
	wrong := httptest.NewRecorder()
	handler.ServeHTTP(wrong, httptest.NewRequest(http.MethodPost, "/api/oauth-test/auth/oauth/google/redirect", nil))
	if wrong.Code != http.StatusMethodNotAllowed {
		t.Fatalf("POST redirect status = %d", wrong.Code)
	}
}

func TestOAuthVerifiedEmailTakesOverPreRegisteredAccountAndRevokesItsSessions(t *testing.T) {
	oauthTestEnv(t)
	oauthMockProviders(t, func(r *http.Request, body string) (int, string) {
		switch r.URL.Host + r.URL.Path {
		case "oauth2.googleapis.com/token":
			return 200, `{"access_token":"g"}`
		case "openidconnect.googleapis.com/v1/userinfo":
			return 200, `{"sub":"owner-sub","email":"victim@example.com","email_verified":true,"name":"Real Owner"}`
		case "github.com/login/oauth/access_token":
			return 200, `{"access_token":"gh"}`
		case "api.github.com/user":
			return 200, `{"id":9001,"login":"squatter","name":"Squatter","avatar_url":"https://a/b.png","email":"victim@example.com"}`
		case "api.github.com/user/emails":
			return 404, `{}` // scope denied: the public email stays unverified
		}
		return 404, `{}`
	})
	handler, _ := oauthTestHandler(t, oauthBuild)

	registered := perform(handler, http.MethodPost, "/api/oauth-test/auth/register",
		`{"name":"Attacker","email":"victim@example.com","password":"attackerpass","password_confirmation":"attackerpass"}`, "")
	if registered.Code != http.StatusCreated {
		t.Fatalf("register status = %d: %s", registered.Code, registered.Body.String())
	}
	var issued struct {
		User  authUser `json:"user"`
		Token string   `json:"token"`
	}
	if err := json.Unmarshal(registered.Body.Bytes(), &issued); err != nil {
		t.Fatal(err)
	}

	// GitHub without a verified email must NOT attach to the existing account
	location, cookie := oauthRedirectStart(t, handler, "github")
	callback := oauthCallback(handler, http.MethodGet, "github",
		url.Values{"code": {"c"}, "state": {location.Query().Get("state")}}.Encode(), "", cookie)
	_, fragment := oauthFragment(t, callback)
	githubUser := oauthMeUser(t, handler, fragment.Get("arkzen_oauth_token"))
	if githubUser.ID == issued.User.ID || githubUser.Email != "github-9001@oauth.invalid" {
		t.Fatalf("unverified provider email must not link: %+v", githubUser)
	}
	if oauthMe(handler, issued.Token).Code != http.StatusOK {
		t.Fatal("the pre-registered session must survive an unverified sign-in")
	}

	// Google with a verified email links, revokes sessions and rotates the password
	location, cookie = oauthRedirectStart(t, handler, "google")
	callback = oauthCallback(handler, http.MethodGet, "google",
		url.Values{"code": {"c"}, "state": {location.Query().Get("state")}}.Encode(), "", cookie)
	_, fragment = oauthFragment(t, callback)
	googleUser := oauthMeUser(t, handler, fragment.Get("arkzen_oauth_token"))
	if googleUser.ID != issued.User.ID {
		t.Fatalf("verified email should link user %d, got %d", issued.User.ID, googleUser.ID)
	}
	if oauthMe(handler, issued.Token).Code != http.StatusUnauthorized {
		t.Fatal("pre-existing session must be revoked after the takeover defence")
	}
	login := perform(handler, http.MethodPost, "/api/oauth-test/auth/login", `{"email":"victim@example.com","password":"attackerpass"}`, "")
	if login.Code != http.StatusUnprocessableEntity {
		t.Fatalf("old password must stop working, login status = %d", login.Code)
	}
}

func TestOAuthAppleFormPostWithSignedClientSecret(t *testing.T) {
	oauthTestEnv(t)
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	der, err := x509.MarshalPKCS8PrivateKey(key)
	if err != nil {
		t.Fatal(err)
	}
	pemText := string(pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: der}))
	t.Setenv("OAUTH_APPLE_CLIENT_ID", "com.example.web")
	t.Setenv("OAUTH_APPLE_TEAM_ID", "TEAM123")
	t.Setenv("OAUTH_APPLE_KEY_ID", "KEY123")
	t.Setenv("OAUTH_APPLE_PRIVATE_KEY", strings.ReplaceAll(strings.TrimSpace(pemText), "\n", `\n`)) // .env style escapes

	var nonce string
	oauthMockProviders(t, func(r *http.Request, body string) (int, string) {
		if r.URL.Host+r.URL.Path != "appleid.apple.com/auth/token" {
			return 404, `{}`
		}
		form, _ := url.ParseQuery(body)
		parts := strings.Split(form.Get("client_secret"), ".")
		if len(parts) != 3 {
			return 400, `{"error":"invalid_client"}`
		}
		raw, _ := base64.RawURLEncoding.DecodeString(parts[2])
		digest := sha256.Sum256([]byte(parts[0] + "." + parts[1]))
		if len(raw) != 64 || !ecdsa.Verify(&key.PublicKey, digest[:], new(big.Int).SetBytes(raw[:32]), new(big.Int).SetBytes(raw[32:])) {
			return 400, `{"error":"invalid_client"}`
		}
		claimsRaw, _ := base64.RawURLEncoding.DecodeString(parts[1])
		var claims map[string]any
		_ = json.Unmarshal(claimsRaw, &claims)
		if claims["iss"] != "TEAM123" || claims["sub"] != "com.example.web" || claims["aud"] != "https://appleid.apple.com" {
			return 400, `{"error":"invalid_client"}`
		}
		idClaims, _ := json.Marshal(map[string]any{
			"iss": "https://appleid.apple.com", "aud": "com.example.web", "exp": time.Now().Add(time.Hour).Unix(),
			"sub": "apple-sub-1", "email": "tim@privaterelay.appleid.com", "email_verified": "true", "nonce": nonce,
		})
		idToken := "e30." + base64.RawURLEncoding.EncodeToString(idClaims) + ".sig"
		return 200, `{"id_token":"` + idToken + `","access_token":"apple-access"}`
	})
	handler, _ := oauthTestHandler(t, oauthBuild)

	location, cookie := oauthRedirectStart(t, handler, "apple")
	query := location.Query()
	nonce = query.Get("nonce")
	if query.Get("response_mode") != "form_post" || nonce == "" || query.Get("scope") != "name email" {
		t.Fatalf("apple authorize URL = %s", location)
	}
	if !cookie.Secure || cookie.SameSite != http.SameSiteNoneMode {
		t.Fatalf("apple state cookie must be SameSite=None; Secure, got %+v", cookie)
	}

	form := url.Values{
		"code": {"apple-code"}, "state": {query.Get("state")},
		"user": {`{"name":{"firstName":"Tim","lastName":"Cook"},"email":"tim@privaterelay.appleid.com"}`},
	}.Encode()
	callback := oauthCallback(handler, http.MethodPost, "apple", "", form, cookie)
	base, fragment := oauthFragment(t, callback)
	if base != "http://localhost:3000/dashboard" {
		t.Fatalf("apple callback redirect = %s %v", base, fragment)
	}
	user := oauthMeUser(t, handler, fragment.Get("arkzen_oauth_token"))
	if user.Name != "Tim Cook" || user.Email != "tim@privaterelay.appleid.com" {
		t.Fatalf("apple user = %+v", user)
	}

	// an id_token minted for another nonce must be refused
	location, cookie = oauthRedirectStart(t, handler, "apple")
	nonce = "someone-elses-nonce"
	bad := oauthCallback(handler, http.MethodPost, "apple", "",
		url.Values{"code": {"apple-code"}, "state": {location.Query().Get("state")}}.Encode(), cookie)
	if _, fragment := oauthFragment(t, bad); fragment.Get("arkzen_oauth_error") == "" || fragment.Get("arkzen_oauth_token") != "" {
		t.Fatalf("nonce mismatch must fail, got %v", fragment)
	}
}

func TestOAuthTwitterUsesBasicAuthAndKeepsLargeIDsExact(t *testing.T) {
	oauthTestEnv(t)
	oauthMockProviders(t, func(r *http.Request, body string) (int, string) {
		switch r.URL.Host + r.URL.Path {
		case "api.x.com/2/oauth2/token":
			want := "Basic " + base64.StdEncoding.EncodeToString([]byte("x-id:x-secret"))
			form, _ := url.ParseQuery(body)
			if r.Header.Get("Authorization") != want || form.Get("code_verifier") == "" || form.Get("client_secret") != "" {
				return 401, `{"error":"invalid_client"}`
			}
			return 200, `{"access_token":"x-access"}`
		case "api.x.com/2/users/me":
			return 200, `{"data":{"id":"1700000000000000001","name":"Ex User","username":"exuser","profile_image_url":"https://x/p.png"}}`
		}
		return 404, `{}`
	})
	handler, storage := oauthTestHandler(t, oauthBuild)

	location, cookie := oauthRedirectStart(t, handler, "twitter")
	if location.Host != "x.com" || location.Query().Get("code_challenge_method") != "S256" {
		t.Fatalf("twitter authorize URL = %s", location)
	}
	callback := oauthCallback(handler, http.MethodGet, "twitter",
		url.Values{"code": {"c"}, "state": {location.Query().Get("state")}}.Encode(), "", cookie)
	_, fragment := oauthFragment(t, callback)
	user := oauthMeUser(t, handler, fragment.Get("arkzen_oauth_token"))
	if user.Email != "twitter-1700000000000000001@oauth.invalid" || user.Name != "Ex User" || user.EmailVerifiedAt != nil {
		t.Fatalf("twitter user = %+v", user)
	}
	if n := oauthCountRows(t, storage, `SELECT COUNT(*) FROM "oauth_accounts" WHERE "provider_user_id" = '1700000000000000001'`); n != 1 {
		t.Fatalf("exact provider id was not stored, rows = %d", n)
	}
}

func TestOAuthIsAbsentWhenTheTatemonoDoesNotDeclareIt(t *testing.T) {
	oauthTestEnv(t)
	handler, _ := oauthTestHandler(t, `{"name":"oauth-test","backendVariant":"go","auth":true}`)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/oauth-test/auth/oauth/providers", nil))
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("oauth routes must not exist without @arkzen:oauth, got %d", recorder.Code)
	}
}

func TestOAuthBuildValidation(t *testing.T) {
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
	for name, build := range map[string]string{
		"oauth without auth": `{"name":"oauth-test","backendVariant":"go","auth":false,"oauth":{"providers":["google"]}}`,
		"unknown provider":   `{"name":"oauth-test","backendVariant":"go","auth":true,"oauth":{"providers":["myspace"]}}`,
		"empty providers":    `{"name":"oauth-test","backendVariant":"go","auth":true,"oauth":{"providers":[]}}`,
	} {
		response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret")
		if response.Code < 400 || !bytes.Contains(response.Body.Bytes(), []byte("oauth")) && !bytes.Contains(response.Body.Bytes(), []byte("OAuth")) {
			t.Fatalf("%s: status %d body %s", name, response.Code, response.Body.String())
		}
	}
}

func TestOAuthAuthorizeURLsForEveryProvider(t *testing.T) {
	oauthTestEnv(t)
	t.Setenv("OAUTH_APPLE_CLIENT_ID", "svc")
	for _, id := range oauthProviderIDs {
		t.Setenv("OAUTH_"+strings.ToUpper(id)+"_CLIENT_ID", "id-"+id)
		t.Setenv("OAUTH_"+strings.ToUpper(id)+"_CLIENT_SECRET", "secret-"+id)
		built, nonce, err := oauthAuthorizeURL("demo", id)
		if err != nil || nonce == "" {
			t.Fatalf("%s: %v", id, err)
		}
		parsed, err := url.Parse(built)
		if err != nil || parsed.Scheme != "https" {
			t.Fatalf("%s authorize URL = %q (%v)", id, built, err)
		}
		query := parsed.Query()
		if query.Get("client_id") != "id-"+id || query.Get("redirect_uri") != "http://localhost:8000/api/demo/auth/oauth/"+id+"/callback" {
			t.Fatalf("%s authorize query = %v", id, query)
		}
		if state, ok := oauthReadState(query.Get("state")); !ok || state.Provider != id || state.Slug != "demo" || state.Nonce != nonce {
			t.Fatalf("%s state does not round-trip: %+v", id, state)
		}
	}
}
