package dev.pluff.runtime;

// Social sign-in (OAuth 2.0 / OIDC) layered on top of the per-tatemono token auth.
//
// Opt-in through the `@arkzen:oauth` DSL block; email + password keeps working untouched.
// Providers: google, github, twitter (X), apple, microsoft, facebook, instagram, discord.
// Secrets come from the environment only (OAUTH_<PROVIDER>_CLIENT_ID / _CLIENT_SECRET).
//
// Routes (prefix /api/<slug>/auth/oauth):
//   GET       /providers               which providers are configured
//   GET       /{provider}/redirect     starts the flow (302 to the provider)
//   GET|POST  /{provider}/callback     provider returns here (Apple uses a POST form_post)

import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class OAuth {
  private OAuth() {}

  public static final List<String> PROVIDERS =
      List.of("google", "github", "twitter", "apple", "microsoft", "facebook", "instagram", "discord");

  private static final String USER_AGENT = "Pluff-OAuth/1.0";
  private static final long STATE_TTL_SECONDS = 600;
  private static final String DEFAULT_ENGINE_SECRET = "arkzen-engine-secret";
  private static final SecureRandom RANDOM = new SecureRandom();

  // ── config ─────────────────────────────────────────────────────────────────

  /** The `@arkzen:oauth` block as sent by the parser. It never carries secrets. */
  public static final class Config {
    public final List<String> providers;
    public final String redirect;
    public final String errorRedirect;
    public final boolean linkVerifiedEmail;

    Config(List<String> providers, String redirect, String errorRedirect, boolean linkVerifiedEmail) {
      this.providers = providers;
      this.redirect = redirect;
      this.errorRedirect = errorRedirect;
      this.linkVerifiedEmail = linkVerifiedEmail;
    }
  }

  @SuppressWarnings("unchecked")
  public static Config configFrom(Map<String, Object> raw) {
    List<String> providers = new ArrayList<>();
    if (raw.get("providers") instanceof List<?> list)
      for (Object item : list) providers.add(String.valueOf(item));
    Object link = raw.get("linkVerifiedEmail");
    return new Config(providers, text(raw.get("redirect")), text(raw.get("errorRedirect")),
        link == null || Boolean.TRUE.equals(link) || "true".equals(String.valueOf(link)));
  }

  /** Build-time validation of the payload's oauth block. Returns human-readable problems (empty = fine). */
  @SuppressWarnings("unchecked")
  public static List<String> validate(Map<String, Object> payload) {
    List<String> problems = new ArrayList<>();
    Object raw = payload.get("oauth");
    if (raw == null) return problems;
    if (!(raw instanceof Map)) {
      problems.add("oauth must be an object");
      return problems;
    }
    if (!Boolean.TRUE.equals(payload.get("auth"))) problems.add("oauth requires auth to be enabled");
    Object providers = ((Map<String, Object>) raw).get("providers");
    if (!(providers instanceof List<?> list) || list.isEmpty()) {
      problems.add("oauth.providers must be a non-empty array");
      return problems;
    }
    for (Object provider : list)
      if (!PROVIDERS.contains(String.valueOf(provider))) problems.add("Unknown OAuth provider \"" + provider + "\"");
    return problems;
  }

  // ── HTTP seam (tests replace `http`; production uses the JDK client) ───────

  public record HttpResult(int status, String body) {}

  @FunctionalInterface
  public interface Http {
    HttpResult send(String method, String url, Map<String, String> headers, String body) throws Exception;
  }

  private static final HttpClient CLIENT = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  static volatile Http http = (method, url, headers, body) -> {
    HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(15));
    headers.forEach(builder::header);
    builder.method(method, body == null || body.isEmpty()
        ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body));
    HttpResponse<String> response = CLIENT.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    String data = response.body();
    if (data != null && data.length() > 2_000_000) data = data.substring(0, 2_000_000);
    return new HttpResult(response.statusCode(), data == null ? "" : data);
  };

  /** Password hashing seam: bcrypt in production, replaced in tests to keep them fast. */
  static volatile Function<String, String> passwordHasher = Hash::make;

  private static String host(String target) {
    try { return URI.create(target).getHost(); } catch (RuntimeException e) { return "?"; }
  }

  private static HttpResult call(String method, String target, Map<String, String> headers, String body) {
    try {
      return http.send(method, target, headers, body);
    } catch (Exception e) {
      throw new IllegalStateException("provider request failed at " + host(target));
    }
  }

  private static Object parseJson(String body) {
    try { return Json.parse(body); } catch (RuntimeException e) { return null; }
  }

  private static Object getJson(String target, Map<String, String> extra) {
    Map<String, String> headers = new LinkedHashMap<>();
    headers.put("Accept", "application/json");
    headers.put("User-Agent", USER_AGENT);
    if (extra != null) headers.putAll(extra);
    HttpResult result = call("GET", target, headers, null);
    Object value = parseJson(result.body());
    if (value == null || result.status() < 200 || result.status() > 299)
      throw new IllegalStateException("provider request failed (" + result.status() + ") at " + host(target));
    return value;
  }

  // ── small helpers ──────────────────────────────────────────────────────────

  /** Environment seam: process env / .env in production, a fixed map in tests. */
  static volatile Function<String, String> envLookup = key -> Support.env(key, "");

  private static String env(String key) {
    String value = envLookup.apply(key);
    return value == null ? "" : value.trim();
  }

  private static String text(Object value) {
    return value == null ? "" : String.valueOf(value);
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> object(Object value) {
    return value instanceof Map ? (Map<String, Object>) value : new LinkedHashMap<>();
  }

  private static boolean truthy(Object value) {
    return Boolean.TRUE.equals(value) || "true".equals(value);
  }

  private static String first(String... values) {
    for (String value : values) if (value != null && !value.isEmpty()) return value;
    return "";
  }

  private static String b64(byte[] data) { return Base64.getUrlEncoder().withoutPadding().encodeToString(data); }

  private static byte[] randomBytes(int length) {
    byte[] value = new byte[length];
    RANDOM.nextBytes(value);
    return value;
  }

  private static byte[] fallbackKey;

  private static synchronized byte[] stateKey() {
    String configured = env("OAUTH_STATE_SECRET");
    if (!configured.isEmpty()) return configured.getBytes(StandardCharsets.UTF_8);
    // The engine secret ships with a public default; only trust it once the operator changed it.
    String engine = env("ARKZEN_ENGINE_SECRET");
    if (!engine.isEmpty() && !engine.equals(DEFAULT_ENGINE_SECRET)) return engine.getBytes(StandardCharsets.UTF_8);
    // No secret configured: a per-process key. Flows that straddle a restart simply fail and can be retried.
    if (fallbackKey == null) fallbackKey = randomBytes(32);
    return fallbackKey;
  }

  private static String hmac(String data) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(stateKey(), "HmacSHA256"));
      return b64(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new IllegalStateException("HMAC is unavailable", e);
    }
  }

  private static boolean safeEquals(String a, String b) {
    return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
  }

  private static String pkceVerifier(String nonce) { return hmac("pkce:" + nonce); }

  private static String pkceChallenge(String nonce) {
    try {
      return b64(MessageDigest.getInstance("SHA-256").digest(pkceVerifier(nonce).getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new IllegalStateException("SHA-256 is unavailable", e);
    }
  }

  // ── state + cookie ─────────────────────────────────────────────────────────

  record State(String nonce, String provider, String slug, long expires) {}

  static String signState(State state) {
    Map<String, Object> payload = Support.mapOf("n", state.nonce(), "p", state.provider(), "s", state.slug(), "e", state.expires());
    String body = b64(Json.stringify(payload).getBytes(StandardCharsets.UTF_8));
    return "v1." + body + "." + hmac("state:" + body);
  }

  static State readState(String token) {
    if (token == null) return null;
    String[] parts = token.split("\\.", -1);
    if (parts.length != 3 || !parts[0].equals("v1") || !safeEquals(parts[2], hmac("state:" + parts[1]))) return null;
    try {
      Map<String, Object> raw = Json.parseObject(new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8));
      long expires = Support.toLong(raw.get("e"), 0);
      if (expires <= System.currentTimeMillis() / 1000) return null;
      return new State(text(raw.get("n")), text(raw.get("p")), text(raw.get("s")), expires);
    } catch (RuntimeException e) {
      return null;
    }
  }

  static String cookieName(String slug) { return "arkzen-oauth-" + slug; }

  /** Apple answers with a cross-site POST, which only carries a SameSite=None cookie (and that requires Secure). */
  static String cookie(String slug, String provider, String value, long maxAge) {
    StringBuilder out = new StringBuilder(cookieName(slug)).append('=').append(value)
        .append("; Path=/; HttpOnly; Max-Age=").append(Math.max(maxAge, 0));
    out.append("apple".equals(provider) ? "; SameSite=None; Secure" : "; SameSite=Lax");
    return out.toString();
  }

  static String readCookie(String header, String name) {
    if (header == null) return null;
    for (String part : header.split(";")) {
      String trimmed = part.trim();
      int split = trimmed.indexOf('=');
      if (split > 0 && trimmed.substring(0, split).equals(name)) return trimmed.substring(split + 1);
    }
    return null;
  }

  // ── env-derived settings ───────────────────────────────────────────────────

  static String clientId(String provider) { return env("OAUTH_" + provider.toUpperCase() + "_CLIENT_ID"); }

  static String clientSecret(String provider) { return env("OAUTH_" + provider.toUpperCase() + "_CLIENT_SECRET"); }

  static boolean configured(String provider) {
    if (clientId(provider).isEmpty()) return false;
    if (provider.equals("apple"))
      return !env("OAUTH_APPLE_TEAM_ID").isEmpty() && !env("OAUTH_APPLE_KEY_ID").isEmpty() && !env("OAUTH_APPLE_PRIVATE_KEY").isEmpty();
    return !clientSecret(provider).isEmpty();
  }

  static String providerName(String provider) {
    return switch (provider) {
      case "google" -> "Google";
      case "github" -> "GitHub";
      case "twitter" -> "X (Twitter)";
      case "apple" -> "Apple";
      case "microsoft" -> "Microsoft";
      case "facebook" -> "Facebook";
      case "instagram" -> "Instagram";
      case "discord" -> "Discord";
      default -> "Provider";
    };
  }

  private static String trimEnd(String value) { return value.replaceAll("/+$", ""); }

  static String redirectBase() {
    String base = env("OAUTH_REDIRECT_BASE");
    if (base.isEmpty()) base = env("APP_URL");
    if (base.isEmpty()) base = "http://localhost:8000";
    return trimEnd(base);
  }

  static String frontendUrl() {
    String base = env("OAUTH_FRONTEND_URL");
    return trimEnd(base.isEmpty() ? "http://localhost:3000" : base);
  }

  static String callbackUrl(String slug, String provider) {
    return redirectBase() + "/api/" + slug + "/auth/oauth/" + provider + "/callback";
  }

  private static String graphVersion(String provider) {
    String value = env("OAUTH_" + provider + "_API_VERSION");
    return value.isEmpty() ? "v25.0" : value;
  }

  /** Apple's client secret is a short-lived ES256 JWT signed with the team's .p8 key. */
  static String appleClientSecret() {
    String team = env("OAUTH_APPLE_TEAM_ID"), keyId = env("OAUTH_APPLE_KEY_ID");
    String pem = env("OAUTH_APPLE_PRIVATE_KEY").replace("\\n", "\n");
    if (team.isEmpty() || keyId.isEmpty() || pem.isEmpty())
      throw new IllegalStateException("Apple needs OAUTH_APPLE_TEAM_ID, OAUTH_APPLE_KEY_ID and OAUTH_APPLE_PRIVATE_KEY");
    try {
      String der = pem.replaceAll("-----[A-Z ]+-----", "").replaceAll("\\s+", "");
      PrivateKey key = KeyFactory.getInstance("EC").generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(der)));
      long now = System.currentTimeMillis() / 1000;
      String head = b64(Json.stringify(Support.mapOf("alg", "ES256", "kid", keyId, "typ", "JWT")).getBytes(StandardCharsets.UTF_8));
      String body = b64(Json.stringify(Support.mapOf("iss", team, "iat", now, "exp", now + 300,
          "aud", "https://appleid.apple.com", "sub", clientId("apple"))).getBytes(StandardCharsets.UTF_8));
      String signingInput = head + "." + body;
      Signature signature = Signature.getInstance("SHA256withECDSAinP1363Format");
      signature.initSign(key);
      signature.update(signingInput.getBytes(StandardCharsets.UTF_8));
      return signingInput + "." + b64(signature.sign());
    } catch (IllegalArgumentException | java.security.GeneralSecurityException e) {
      throw new IllegalStateException("OAUTH_APPLE_PRIVATE_KEY is not a valid PKCS#8 EC key", e);
    }
  }

  // ── provider table ─────────────────────────────────────────────────────────

  record Def(String authorize, String token, String scope, boolean pkce, boolean basicAuth, String[][] extra) {}

  static Def definition(String provider) {
    String tenant = env("OAUTH_MICROSOFT_TENANT");
    if (tenant.isEmpty()) tenant = "common";
    String fb = graphVersion("FACEBOOK");
    return switch (provider) {
      case "google" -> new Def("https://accounts.google.com/o/oauth2/v2/auth", "https://oauth2.googleapis.com/token",
          "openid email profile", true, false, new String[][] {{"access_type", "online"}, {"prompt", "select_account"}});
      case "github" -> new Def("https://github.com/login/oauth/authorize", "https://github.com/login/oauth/access_token",
          "read:user user:email", false, false, new String[0][]);
      // X: authorization code + PKCE is mandatory; confidential clients authenticate with HTTP Basic.
      case "twitter" -> new Def("https://x.com/i/oauth2/authorize", "https://api.x.com/2/oauth2/token",
          "users.read tweet.read users.email", true, true, new String[0][]);
      // Apple: client_secret is a signed JWT, the callback is a form_post, the identity is in the id_token.
      case "apple" -> new Def("https://appleid.apple.com/auth/authorize", "https://appleid.apple.com/auth/token",
          "name email", false, false, new String[][] {{"response_mode", "form_post"}});
      case "microsoft" -> new Def("https://login.microsoftonline.com/" + tenant + "/oauth2/v2.0/authorize",
          "https://login.microsoftonline.com/" + tenant + "/oauth2/v2.0/token", "openid profile email User.Read", true, false,
          new String[][] {{"response_mode", "query"}, {"prompt", "select_account"}});
      case "facebook" -> new Def("https://www.facebook.com/" + fb + "/dialog/oauth",
          "https://graph.facebook.com/" + fb + "/oauth/access_token", "email,public_profile", false, false, new String[0][]);
      // Instagram API with Instagram Login (Basic Display API is gone). Professional accounts only; no email is shared.
      case "instagram" -> new Def("https://www.instagram.com/oauth/authorize", "https://api.instagram.com/oauth/access_token",
          "instagram_business_basic", false, false, new String[0][]);
      case "discord" -> new Def("https://discord.com/oauth2/authorize", "https://discord.com/api/oauth2/token",
          "identify email", true, false, new String[][] {{"prompt", "consent"}});
      default -> null;
    };
  }

  private static Map<String, String> strings(String... kv) {
    Map<String, String> out = new LinkedHashMap<>();
    for (int i = 0; i < kv.length; i += 2) out.put(kv[i], kv[i + 1]);
    return out;
  }

  private static String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }

  private static String form(Map<String, String> values) {
    StringBuilder out = new StringBuilder();
    for (Map.Entry<String, String> entry : values.entrySet()) {
      if (out.length() > 0) out.append('&');
      out.append(encode(entry.getKey())).append('=').append(encode(entry.getValue()));
    }
    return out.toString();
  }

  /** Returns {authorizeUrl, nonce}. */
  static String[] authorizeUrl(String slug, String provider) {
    Def def = definition(provider);
    if (def == null) throw new IllegalStateException("Unknown OAuth provider");
    String nonce = b64(randomBytes(24));
    String state = signState(new State(nonce, provider, slug, System.currentTimeMillis() / 1000 + STATE_TTL_SECONDS));
    Map<String, String> query = new LinkedHashMap<>();
    query.put("client_id", clientId(provider));
    query.put("redirect_uri", callbackUrl(slug, provider));
    query.put("response_type", "code");
    query.put("scope", def.scope());
    query.put("state", state);
    for (String[] pair : def.extra()) query.put(pair[0], pair[1]);
    if (def.pkce()) {
      query.put("code_challenge", pkceChallenge(nonce));
      query.put("code_challenge_method", "S256");
    }
    if (provider.equals("apple")) query.put("nonce", nonce);
    return new String[] {def.authorize() + "?" + form(query), nonce};
  }

  static Map<String, Object> exchangeCode(String slug, String provider, String code, String nonce) {
    Def def = definition(provider);
    if (def == null) throw new IllegalStateException("Unknown OAuth provider");
    String secret = provider.equals("apple") ? appleClientSecret() : clientSecret(provider);
    String id = clientId(provider);
    Map<String, String> headers = new LinkedHashMap<>();
    headers.put("Content-Type", "application/x-www-form-urlencoded");
    headers.put("Accept", "application/json");
    headers.put("User-Agent", USER_AGENT);
    Map<String, String> body = new LinkedHashMap<>();
    body.put("grant_type", "authorization_code");
    body.put("code", code);
    body.put("redirect_uri", callbackUrl(slug, provider));
    body.put("client_id", id);
    if (def.basicAuth())
      headers.put("Authorization", "Basic " + Base64.getEncoder().encodeToString((id + ":" + secret).getBytes(StandardCharsets.UTF_8)));
    else body.put("client_secret", secret);
    if (def.pkce()) body.put("code_verifier", pkceVerifier(nonce));

    HttpResult result = call("POST", def.token(), headers, form(body));
    Map<String, Object> data = new LinkedHashMap<>();
    Object parsed = parseJson(result.body());
    if (parsed instanceof Map) data = object(parsed);
    else if (parsed == null) { // some providers answer form-encoded
      for (String part : result.body().split("&")) {
        int split = part.indexOf('=');
        if (split > 0) data.put(URLDecoder.decode(part.substring(0, split), StandardCharsets.UTF_8),
            URLDecoder.decode(part.substring(split + 1), StandardCharsets.UTF_8));
      }
    }
    if (data.get("data") instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Map) data = object(list.get(0)); // Instagram variant
    if (result.status() < 200 || result.status() > 299 || (text(data.get("access_token")).isEmpty() && text(data.get("id_token")).isEmpty()))
      throw new IllegalStateException("token exchange failed (" + result.status() + ")");
    return data;
  }

  // ── profiles ───────────────────────────────────────────────────────────────

  record Profile(String id, String email, boolean emailVerified, String name, String avatar) {}

  private static Map<String, String> bearer(Map<String, Object> tokens) {
    Map<String, String> headers = new LinkedHashMap<>();
    headers.put("Authorization", "Bearer " + text(tokens.get("access_token")));
    return headers;
  }

  private static IllegalStateException missing(String provider, String what) {
    return new IllegalStateException(providerName(provider) + " returned no " + what);
  }

  static Profile fetchProfile(String provider, Map<String, Object> tokens, String nonce, String appleUser) {
    String token = text(tokens.get("access_token"));
    switch (provider) {
      case "google": {
        Map<String, Object> u = object(getJson("https://openidconnect.googleapis.com/v1/userinfo", bearer(tokens)));
        if (text(u.get("sub")).isEmpty()) throw missing(provider, "user id");
        return new Profile(text(u.get("sub")), text(u.get("email")), truthy(u.get("email_verified")), text(u.get("name")), text(u.get("picture")));
      }
      case "github": {
        Map<String, String> headers = bearer(tokens);
        headers.put("Accept", "application/vnd.github+json");
        headers.put("X-GitHub-Api-Version", "2022-11-28");
        Map<String, Object> u = object(getJson("https://api.github.com/user", headers));
        if (text(u.get("id")).isEmpty()) throw missing(provider, "user id");
        String email = text(u.get("email"));
        boolean verified = false;
        // user:email scope missing or denied: keep the public email, unverified.
        try {
          if (getJson("https://api.github.com/user/emails", headers) instanceof List<?> entries) {
            Map<String, Object> pick = null;
            for (Object entry : entries) {
              Map<String, Object> candidate = object(entry);
              if (truthy(candidate.get("primary")) && truthy(candidate.get("verified"))) { pick = candidate; break; }
            }
            if (pick == null)
              for (Object entry : entries) {
                Map<String, Object> candidate = object(entry);
                if (truthy(candidate.get("verified"))) { pick = candidate; break; }
              }
            if (pick != null) { email = text(pick.get("email")); verified = true; }
          }
        } catch (IllegalStateException ignored) { /* keep the public email, unverified */ }
        return new Profile(text(u.get("id")), email, verified, first(text(u.get("name")), text(u.get("login"))), text(u.get("avatar_url")));
      }
      case "twitter": {
        Map<String, Object> u = object(object(getJson("https://api.x.com/2/users/me?user.fields=profile_image_url,confirmed_email", bearer(tokens))).get("data"));
        if (text(u.get("id")).isEmpty()) throw missing(provider, "user id");
        // X returns an email only when the app has the permission; it is never treated as verified.
        return new Profile(text(u.get("id")), text(u.get("confirmed_email")), false,
            first(text(u.get("name")), text(u.get("username"))), text(u.get("profile_image_url")));
      }
      case "apple":
        return appleProfile(tokens, nonce, appleUser);
      case "microsoft": {
        Map<String, Object> u = object(getJson("https://graph.microsoft.com/oidc/userinfo", bearer(tokens)));
        if (text(u.get("sub")).isEmpty()) throw missing(provider, "user id");
        // Microsoft emails are not proven to belong to the user ("nOAuth"), so they are never auto-linked.
        return new Profile(text(u.get("sub")), text(u.get("email")), false, text(u.get("name")), "");
      }
      case "facebook": {
        Map<String, Object> u = object(getJson("https://graph.facebook.com/" + graphVersion("FACEBOOK")
            + "/me?fields=id,name,email,picture.type(large)&access_token=" + encode(token), null));
        if (text(u.get("id")).isEmpty()) throw missing(provider, "user id");
        String avatar = text(object(object(u.get("picture")).get("data")).get("url"));
        return new Profile(text(u.get("id")), text(u.get("email")), false, text(u.get("name")), avatar);
      }
      case "instagram": {
        Map<String, Object> u = object(getJson("https://graph.instagram.com/" + graphVersion("INSTAGRAM")
            + "/me?fields=user_id,username,name,profile_picture_url&access_token=" + encode(token), null));
        String id = first(text(u.get("user_id")), text(u.get("id")));
        if (id.isEmpty()) throw missing(provider, "user id");
        return new Profile(id, "", false, first(text(u.get("name")), text(u.get("username"))), text(u.get("profile_picture_url")));
      }
      case "discord": {
        Map<String, Object> u = object(getJson("https://discord.com/api/users/@me", bearer(tokens)));
        String id = text(u.get("id"));
        if (id.isEmpty()) throw missing(provider, "user id");
        String hash = text(u.get("avatar"));
        String avatar = hash.isEmpty() ? "" : "https://cdn.discordapp.com/avatars/" + id + "/" + hash + ".png";
        return new Profile(id, text(u.get("email")), Boolean.TRUE.equals(u.get("verified")),
            first(text(u.get("global_name")), text(u.get("username"))), avatar);
      }
      default:
        throw new IllegalStateException("Unknown OAuth provider");
    }
  }

  private static Profile appleProfile(Map<String, Object> tokens, String nonce, String appleUser) {
    String[] parts = text(tokens.get("id_token")).split("\\.");
    if (parts.length < 2) throw new IllegalStateException("Malformed id_token");
    Map<String, Object> claims;
    try {
      claims = Json.parseObject(new String(Base64.getUrlDecoder().decode(parts[1].replaceAll("=+$", "")), StandardCharsets.UTF_8));
    } catch (RuntimeException e) {
      throw new IllegalStateException("Malformed id_token");
    }
    // Signature is not re-verified: the token came straight from Apple's token endpoint over TLS (OIDC Core 3.1.3.7).
    if (!text(claims.get("iss")).equals("https://appleid.apple.com")) throw new IllegalStateException("Apple id_token has the wrong issuer");
    if (!text(claims.get("aud")).equals(clientId("apple"))) throw new IllegalStateException("Apple id_token was issued for another client");
    if (Support.toLong(claims.get("exp"), 0) < System.currentTimeMillis() / 1000) throw new IllegalStateException("Apple id_token has expired");
    if (!text(claims.get("nonce")).equals(nonce)) throw new IllegalStateException("Apple id_token nonce mismatch");
    // Apple sends the name once, on first authorization, as a JSON form field.
    String name = "";
    if (appleUser != null && !appleUser.isEmpty()) {
      Object parsed = parseJson(appleUser);
      Map<String, Object> nameObject = object(object(parsed).get("name"));
      name = (text(nameObject.get("firstName")) + " " + text(nameObject.get("lastName"))).trim();
    }
    if (text(claims.get("sub")).isEmpty()) throw new IllegalStateException("Apple returned no user id");
    return new Profile(text(claims.get("sub")), text(claims.get("email")), truthy(claims.get("email_verified")), name, "");
  }

  // ── users ──────────────────────────────────────────────────────────────────

  /** Persistence seam. The SQL implementation below is what production uses; tests use an in-memory one. */
  interface Store {
    Map<String, Object> findAccount(String provider, String providerUserId);
    boolean userExists(Object userId);
    void touchAccount(Object accountId, String email, String avatar);
    void deleteAccount(Object accountId);
    Object findUserIdByEmail(String email);
    void revokeTokens(Object userId);
    void setPassword(Object userId, String hash);
    Object createUser(String name, String email, String passwordHash, String verifiedAt);
    void linkAccount(Object userId, String provider, String providerUserId, String email, String avatar);
    String issueToken(Object userId);
  }

  private static String nullable(String value) { return value == null || value.isEmpty() ? null : value; }

  private static String randomPasswordHash() {
    return passwordHasher.apply(HexFormat.of().formatHex(randomBytes(32)));
  }

  /** Finds, links or creates the local user for a provider profile and returns their id. */
  static Object resolveUser(Store store, String provider, Profile profile, boolean linkVerifiedEmail) {
    Map<String, Object> account = store.findAccount(provider, profile.id());
    if (account != null) {
      if (store.userExists(account.get("user_id"))) {
        store.touchAccount(account.get("id"), nullable(profile.email()), nullable(profile.avatar()));
        return account.get("user_id");
      }
      store.deleteAccount(account.get("id")); // orphaned link: drop it and re-create below
    }

    String email = profile.email() == null ? "" : profile.email().trim().toLowerCase();
    Object userId = null;

    if (!email.isEmpty() && profile.emailVerified() && linkVerifiedEmail) {
      Object existing = store.findUserIdByEmail(email);
      if (existing != null) {
        // Pre-hijack defence: this account may have been registered by someone else with this email before its
        // owner ever signed in with the provider (the users table has no verified-email flag). Revoke every
        // session and replace the password so only the provider-verified owner can continue.
        store.revokeTokens(existing);
        store.setPassword(existing, randomPasswordHash());
        userId = existing;
      }
    }

    if (userId == null) {
      // Providers without a usable email (Instagram, X without permission) get a reserved, non-routable address.
      String own = email;
      if (!own.isEmpty() && store.findUserIdByEmail(own) != null) own = ""; // taken and not linkable
      if (own.isEmpty()) own = (provider + "-" + profile.id() + "@oauth.invalid").toLowerCase();
      String name = profile.name() == null ? "" : profile.name().trim();
      if (name.isEmpty()) name = own.substring(0, own.indexOf('@'));
      if (name.length() > 255) name = name.substring(0, 255);
      userId = store.createUser(name, own, randomPasswordHash(), profile.emailVerified() ? Support.sqlNow() : null);
    }

    store.linkAccount(userId, provider, profile.id(), nullable(profile.email()), nullable(profile.avatar()));
    return userId;
  }

  /** SQL-backed store over the tatemono's isolated tables. */
  static final class SqlStore implements Store {
    private final String slug;
    private final Conn db;
    private final String users, accounts, tokens;

    SqlStore(String slug) {
      this.slug = slug;
      this.db = Database.connection(slug);
      this.users = Database.qi(Support.prefixedTable(slug, "users"));
      this.accounts = Database.qi(Support.prefixedTable(slug, "oauth_accounts"));
      this.tokens = Database.qi(Support.prefixedTable(slug, "personal_access_tokens"));
    }

    public Map<String, Object> findAccount(String provider, String providerUserId) {
      List<Map<String, Object>> rows = db.select("SELECT \"id\", \"user_id\" FROM " + accounts
          + " WHERE \"provider\" = ? AND \"provider_user_id\" = ? LIMIT 1", new ArrayList<>(List.of(provider, providerUserId)));
      return rows.isEmpty() ? null : rows.get(0);
    }

    public boolean userExists(Object userId) {
      return !db.select("SELECT \"id\" FROM " + users + " WHERE \"id\" = ? LIMIT 1", new ArrayList<>(List.of(userId))).isEmpty();
    }

    public void touchAccount(Object accountId, String email, String avatar) {
      List<Object> params = new ArrayList<>();
      params.add(email);
      params.add(avatar);
      params.add(Support.sqlNow());
      params.add(accountId);
      db.execute("UPDATE " + accounts + " SET \"email\" = ?, \"avatar\" = ?, \"updated_at\" = ? WHERE \"id\" = ?", params);
    }

    public void deleteAccount(Object accountId) {
      db.execute("DELETE FROM " + accounts + " WHERE \"id\" = ?", new ArrayList<>(List.of(accountId)));
    }

    public Object findUserIdByEmail(String email) {
      List<Map<String, Object>> rows = db.select("SELECT \"id\" FROM " + users + " WHERE lower(\"email\") = ? LIMIT 1",
          new ArrayList<>(List.of(email)));
      return rows.isEmpty() ? null : rows.get(0).get("id");
    }

    public void revokeTokens(Object userId) {
      db.execute("DELETE FROM " + tokens + " WHERE \"tokenable_id\" = ? AND \"tokenable_type\" = 'user'", new ArrayList<>(List.of(userId)));
    }

    public void setPassword(Object userId, String hash) {
      db.execute("UPDATE " + users + " SET \"password\" = ?, \"updated_at\" = ? WHERE \"id\" = ?",
          new ArrayList<>(List.of(hash, Support.sqlNow(), userId)));
    }

    public Object createUser(String name, String email, String passwordHash, String verifiedAt) {
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("name", name);
      row.put("email", email);
      row.put("password", passwordHash);
      row.put("role", "user");
      row.put("email_verified_at", verifiedAt);
      row.put("created_at", Support.sqlNow());
      row.put("updated_at", Support.sqlNow());
      return db.insert(Support.prefixedTable(slug, "users"), row, "id");
    }

    public void linkAccount(Object userId, String provider, String providerUserId, String email, String avatar) {
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("user_id", userId);
      row.put("provider", provider);
      row.put("provider_user_id", providerUserId);
      row.put("email", email);
      row.put("avatar", avatar);
      row.put("created_at", Support.sqlNow());
      row.put("updated_at", Support.sqlNow());
      db.insert(Support.prefixedTable(slug, "oauth_accounts"), row, "id");
    }

    public String issueToken(Object userId) { return Auth.createToken(slug, userId); }
  }

  // ── request handling ───────────────────────────────────────────────────────

  /** A failure whose message is safe to show to the person signing in. */
  static final class UserError extends RuntimeException {
    UserError(String message) { super(message); }
  }

  /** Builds the store for a slug. Tests replace it. */
  static volatile Function<String, Store> storeFactory = SqlStore::new;

  private static String safePath(String configured, String fallback) {
    return configured != null && configured.startsWith("/") && !configured.startsWith("//") && !configured.contains("\\") ? configured : fallback;
  }

  private static Object redirect(Response response, String target, String cookie) {
    Response.Result result = response.json(null, 302);
    result = response.withHeader(result, "Location", target);
    result = response.withHeader(result, "Cache-Control", "no-store");
    if (cookie != null) result = response.withHeader(result, "Set-Cookie", cookie);
    return result;
  }

  private static Object fail(Response response, Config config, String slug, String provider, String message) {
    String target = frontendUrl() + safePath(config.errorRedirect, "/") + "#" + form(strings("arkzen_oauth_error", message));
    return redirect(response, target, cookie(slug, provider, "", 0));
  }

  private static boolean enabled(Config config, String provider) {
    return PROVIDERS.contains(provider) && config.providers.contains(provider);
  }

  /** Mounts the OAuth routes on a tatemono router. Called by the generated module when `@arkzen:oauth` is declared. */
  public static void mount(Router router, String slug, String configJson) {
    Config config = configFrom(Json.parseObject(configJson));
    String base = "/api/" + slug + "/auth/oauth";
    router.add("GET", base + "/providers", (request, response) -> {
      List<Map<String, Object>> list = new ArrayList<>();
      for (String id : config.providers)
        list.add(Support.mapOf("id", id, "name", providerName(id), "enabled", configured(id)));
      return response.json(Support.mapOf("providers", list));
    });
    router.add("GET", base + "/{provider}/redirect", (request, response) -> {
      String provider = text(request.route("provider"));
      if (!enabled(config, provider)) return response.json(Map.of("message", "Unknown OAuth provider."), 404);
      if (!configured(provider))
        return fail(response, config, slug, provider, providerName(provider) + " sign-in is not configured on this server.");
      try {
        String[] started = authorizeUrl(slug, provider);
        return redirect(response, started[0], cookie(slug, provider, started[1], STATE_TTL_SECONDS));
      } catch (RuntimeException e) {
        Log.error("[oauth:" + provider + "] " + e.getMessage());
        return fail(response, config, slug, provider, "Sign-in failed. Please try again.");
      }
    });
    Router.Handler callback = (request, response) -> {
      String provider = text(request.route("provider"));
      if (!enabled(config, provider)) return response.json(Map.of("message", "Unknown OAuth provider."), 404);
      try {
        String token = handleCallback(request, config, slug, provider);
        String fragment = form(strings("arkzen_oauth_token", token, "arkzen_oauth_slug", slug));
        return redirect(response, frontendUrl() + safePath(config.redirect, "/") + "#" + fragment, cookie(slug, provider, "", 0));
      } catch (UserError e) {
        return fail(response, config, slug, provider, e.getMessage());
      } catch (RuntimeException e) {
        Log.error("[oauth:" + provider + "] " + e.getMessage());
        return fail(response, config, slug, provider, "Sign-in failed. Please try again.");
      }
    };
    router.add("GET", base + "/{provider}/callback", callback);
    router.add("POST", base + "/{provider}/callback", callback);
  }

  private static String handleCallback(Request request, Config config, String slug, String provider) {
    if (!text(request.input("error")).isEmpty())
      throw new UserError(providerName(provider) + " sign-in was cancelled or denied.");
    UserError expired = new UserError("Sign-in session expired or was tampered with. Please try again.");
    State state = readState(text(request.input("state")));
    if (state == null) throw expired;
    String cookie = readCookie(request.header("Cookie"), cookieName(slug));
    if (cookie == null || cookie.isEmpty()) throw expired;
    if (!state.provider().equals(provider) || !state.slug().equals(slug) || !safeEquals(cookie, state.nonce())) throw expired;
    String code = text(request.input("code"));
    if (code.isEmpty()) throw new UserError("The provider did not return an authorization code.");

    Map<String, Object> tokens = exchangeCode(slug, provider, code, state.nonce());
    Profile profile = fetchProfile(provider, tokens, state.nonce(), text(request.input("user")));
    Store store = storeFactory.apply(slug);
    Object userId = resolveUser(store, provider, profile, config.linkVerifiedEmail);
    return store.issueToken(userId);
  }
}
