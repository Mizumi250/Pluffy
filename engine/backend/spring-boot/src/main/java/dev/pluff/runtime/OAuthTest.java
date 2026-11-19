package dev.pluff.runtime;

import jakarta.servlet.http.HttpServletRequest;

import java.lang.reflect.Proxy;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.Signature;
import java.security.spec.ECGenParameterSpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Self-contained checks for social sign-in (no JUnit needed). Providers are mocked through the HTTP seam and the
 * user table is an in-memory store, so no network, no .env and no database are touched.
 *
 * Run (after `mvn compile`):
 *   java -cp "target/classes:$(mvn -q dependency:build-classpath -Dmdep.outputFile=/dev/stdout)" dev.pluff.runtime.OAuthTest
 */
public final class OAuthTest {
  private static int passed = 0, failed = 0;

  private static void check(String name, boolean ok) {
    if (ok) { passed++; System.out.println("  ok   " + name); }
    else { failed++; System.out.println("  FAIL " + name); }
  }

  // ── fakes ──────────────────────────────────────────────────────────────────

  static final class MemoryStore implements OAuth.Store {
    final Map<Object, Map<String, Object>> users = new LinkedHashMap<>();
    final List<Map<String, Object>> accounts = new ArrayList<>();
    final List<Object> revoked = new ArrayList<>();
    final List<Object> issued = new ArrayList<>();
    long nextUser = 1, nextAccount = 1;

    Object addUser(String email, String hash) {
      Object id = nextUser++;
      users.put(id, new LinkedHashMap<>(Map.of("email", email, "password", hash, "name", "pre")));
      return id;
    }

    public Map<String, Object> findAccount(String provider, String pid) {
      for (Map<String, Object> a : accounts)
        if (a.get("provider").equals(provider) && a.get("provider_user_id").equals(pid)) return a;
      return null;
    }
    public boolean userExists(Object id) { return users.containsKey(id); }
    public void touchAccount(Object id, String email, String avatar) {}
    public void deleteAccount(Object id) { accounts.removeIf(a -> a.get("id").equals(id)); }
    public Object findUserIdByEmail(String email) {
      for (Map.Entry<Object, Map<String, Object>> e : users.entrySet())
        if (String.valueOf(e.getValue().get("email")).equalsIgnoreCase(email)) return e.getKey();
      return null;
    }
    public void revokeTokens(Object id) { revoked.add(id); }
    public void setPassword(Object id, String hash) { users.get(id).put("password", hash); }
    public Object createUser(String name, String email, String hash, String verifiedAt) {
      Object id = nextUser++;
      users.put(id, new LinkedHashMap<>(Map.of("email", email, "password", hash, "name", name)));
      return id;
    }
    public void linkAccount(Object userId, String provider, String pid, String email, String avatar) {
      accounts.add(new LinkedHashMap<>(Map.of("id", nextAccount++, "user_id", userId, "provider", provider, "provider_user_id", pid)));
    }
    public String issueToken(Object userId) { issued.add(userId); return userId + "|tok" + issued.size(); }
  }

  record Sent(String method, String url, Map<String, String> headers, String body) {}

  static final List<Sent> sent = new ArrayList<>();
  static final Map<String, OAuth.HttpResult> routes = new LinkedHashMap<>();

  static void route(String urlPrefix, int status, String body) { routes.put(urlPrefix, new OAuth.HttpResult(status, body)); }

  static Sent lastTo(String urlPrefix) {
    for (int i = sent.size() - 1; i >= 0; i--) if (sent.get(i).url().startsWith(urlPrefix)) return sent.get(i);
    return null;
  }

  static Map<String, String> formOf(String body) {
    Map<String, String> out = new LinkedHashMap<>();
    if (body == null) return out;
    for (String part : body.split("&")) {
      int i = part.indexOf('=');
      if (i > 0) out.put(URLDecoder.decode(part.substring(0, i), StandardCharsets.UTF_8), URLDecoder.decode(part.substring(i + 1), StandardCharsets.UTF_8));
    }
    return out;
  }

  static Request request(String method, String uri, String query, Map<String, String> headers, Map<String, Object> body) {
    Map<String, String> lower = new LinkedHashMap<>();
    headers.forEach((k, v) -> lower.put(k.toLowerCase(), v));
    HttpServletRequest raw = (HttpServletRequest) Proxy.newProxyInstance(OAuthTest.class.getClassLoader(),
        new Class<?>[] {HttpServletRequest.class}, (proxy, m, args) -> switch (m.getName()) {
          case "getHeader" -> lower.get(String.valueOf(args[0]).toLowerCase());
          case "getHeaderNames" -> Collections.enumeration(lower.keySet());
          case "getContentType" -> lower.get("content-type");
          case "getMethod" -> method;
          case "getRequestURI" -> uri;
          case "getRequestURL" -> new StringBuffer("http://localhost:8000" + uri);
          case "getQueryString" -> query;
          case "getRemoteAddr" -> "127.0.0.1";
          default -> null;
        });
    return new Request(raw, "demo", body, Map.of(), null);
  }

  private static String method; // set per request() call through the helpers below

  static Response.Result dispatch(Router router, String httpMethod, String path, String query, Map<String, String> headers, Map<String, Object> body) throws Exception {
    method = httpMethod;
    Router.Dispatch result = router.dispatch(request(httpMethod, path, query, headers, body), new Response());
    if (!result.matched) return null;
    return (Response.Result) result.result;
  }

  static String location(Response.Result r) { return r.headers.get("Location"); }

  static String param(String url, String name) {
    int q = url.indexOf('?');
    return q < 0 ? null : formOf(url.substring(q + 1)).get(name);
  }

  static String fragment(String url, String name) {
    int h = url.indexOf('#');
    return h < 0 ? null : formOf(url.substring(h + 1)).get(name);
  }

  static String cookieValue(Response.Result r) {
    String header = r.headers.get("Set-Cookie");
    if (header == null) return null;
    String first = header.split(";")[0];
    return first.substring(first.indexOf('=') + 1);
  }

  static String sha256b64(String value) throws Exception {
    return Base64.getUrlEncoder().withoutPadding().encodeToString(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
  }

  static Map<String, String> env = new LinkedHashMap<>();
  static MemoryStore store;

  static void reset() {
    sent.clear();
    routes.clear();
    store = new MemoryStore();
    env.clear();
    env.put("OAUTH_STATE_SECRET", "test-state-secret");
    env.put("OAUTH_REDIRECT_BASE", "https://api.example.test");
    env.put("OAUTH_FRONTEND_URL", "https://app.example.test");
    env.put("OAUTH_GOOGLE_CLIENT_ID", "gid");
    env.put("OAUTH_GOOGLE_CLIENT_SECRET", "gsecret");
    OAuth.envLookup = key -> env.get(key);
    OAuth.passwordHasher = plain -> "hash:" + plain;
    OAuth.storeFactory = slug -> store;
    OAuth.http = (m, url, headers, body) -> {
      sent.add(new Sent(m, url, headers, body));
      for (Map.Entry<String, OAuth.HttpResult> e : routes.entrySet()) if (url.startsWith(e.getKey())) return e.getValue();
      return new OAuth.HttpResult(404, "{}");
    };
  }

  static Router mounted(String configJson) {
    Router router = new Router("demo");
    OAuth.mount(router, "demo", configJson);
    return router;
  }

  static final String CONFIG = "{\"providers\":[\"google\",\"github\",\"twitter\",\"apple\",\"microsoft\",\"instagram\"],"
      + "\"redirect\":\"/dashboard\",\"errorRedirect\":\"/login\",\"linkVerifiedEmail\":true}";

  /** Runs redirect -> callback for a provider and returns the callback response. */
  static Response.Result signIn(Router router, String provider, boolean post, Map<String, String> extraParams) throws Exception {
    Response.Result start = dispatch(router, "GET", "/api/demo/auth/oauth/" + provider + "/redirect", null, Map.of(), Map.of());
    String state = param(location(start), "state");
    Map<String, String> headers = new LinkedHashMap<>();
    headers.put("Cookie", "arkzen-oauth-demo=" + cookieValue(start));
    Map<String, String> params = new LinkedHashMap<>();
    params.put("code", "the-code");
    params.put("state", state);
    params.putAll(extraParams);
    if (post) {
      headers.put("Content-Type", "application/x-www-form-urlencoded");
      return dispatch(router, "POST", "/api/demo/auth/oauth/" + provider + "/callback", null, headers, new LinkedHashMap<>(params));
    }
    StringBuilder query = new StringBuilder();
    for (Map.Entry<String, String> e : params.entrySet()) {
      if (query.length() > 0) query.append('&');
      query.append(java.net.URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8)).append('=')
          .append(java.net.URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8));
    }
    return dispatch(router, "GET", "/api/demo/auth/oauth/" + provider + "/callback", query.toString(), headers, Map.of());
  }

  // ── tests ──────────────────────────────────────────────────────────────────

  static void testProviders() throws Exception {
    System.out.println("providers + config");
    reset();
    Router router = mounted(CONFIG);
    Response.Result r = dispatch(router, "GET", "/api/demo/auth/oauth/providers", null, Map.of(), Map.of());
    String json = Json.stringify(r.body);
    check("lists configured providers", json.contains("\"id\":\"google\"") && json.contains("\"enabled\":true"));
    check("unconfigured provider is disabled", json.contains("\"id\":\"github\",\"name\":\"GitHub\",\"enabled\":false"));
    Response.Result unknown = dispatch(router, "GET", "/api/demo/auth/oauth/discord/redirect", null, Map.of(), Map.of());
    check("provider not in the tatemono config is 404", unknown.status == 404);
    Response.Result bogus = dispatch(router, "GET", "/api/demo/auth/oauth/nope/redirect", null, Map.of(), Map.of());
    check("unknown provider is 404", bogus.status == 404);

    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("auth", false);
    payload.put("oauth", Map.of("providers", List.of("google", "myspace")));
    List<String> problems = OAuth.validate(payload);
    check("validation: needs auth", problems.stream().anyMatch(p -> p.contains("requires auth")));
    check("validation: unknown provider", problems.stream().anyMatch(p -> p.contains("myspace")));
    check("validation: absent block is fine", OAuth.validate(Map.of()).isEmpty());
  }

  static void testGoogleFlow() throws Exception {
    System.out.println("google flow with PKCE");
    reset();
    Router router = mounted(CONFIG);
    Response.Result start = dispatch(router, "GET", "/api/demo/auth/oauth/google/redirect", null, Map.of(), Map.of());
    String target = location(start);
    check("redirect is 302 to Google", start.status == 302 && target.startsWith("https://accounts.google.com/o/oauth2/v2/auth?"));
    check("carries client_id, redirect_uri and S256 challenge", "gid".equals(param(target, "client_id"))
        && "https://api.example.test/api/demo/auth/oauth/google/callback".equals(param(target, "redirect_uri"))
        && "S256".equals(param(target, "code_challenge_method")) && param(target, "code_challenge") != null);
    String cookie = start.headers.get("Set-Cookie");
    check("state cookie is HttpOnly + SameSite=Lax", cookie.contains("HttpOnly") && cookie.contains("SameSite=Lax") && !cookie.contains("Secure"));

    route("https://oauth2.googleapis.com/token", 200, "{\"access_token\":\"at\"}");
    route("https://openidconnect.googleapis.com/v1/userinfo", 200,
        "{\"sub\":\"g-1\",\"email\":\"Ann@Example.com\",\"email_verified\":true,\"name\":\"Ann\",\"picture\":\"http://p/a.png\"}");
    Response.Result done = signIn(router, "google", false, Map.of());
    String back = location(done);
    check("success redirects to the frontend with a token fragment",
        back.startsWith("https://app.example.test/dashboard#") && fragment(back, "arkzen_oauth_token") != null
            && "demo".equals(fragment(back, "arkzen_oauth_slug")));
    check("token has the id|secret shape", fragment(back, "arkzen_oauth_token").matches("\\d+\\|tok\\d+"));
    Sent exchange = lastTo("https://oauth2.googleapis.com/token");
    Map<String, String> form = formOf(exchange.body());
    check("token request sends code, secret and a verifier matching the challenge",
        "the-code".equals(form.get("code")) && "gsecret".equals(form.get("client_secret")) && form.get("code_verifier") != null);
    check("cookie is cleared after the callback", done.headers.get("Set-Cookie").contains("Max-Age=0"));
    check("a user was created with a lowercased email", store.users.size() == 1
        && "ann@example.com".equals(store.users.get(1L).get("email")));

    signIn(router, "google", false, Map.of());
    check("second sign-in reuses the same account", store.users.size() == 1 && store.accounts.size() == 1 && store.issued.size() == 2);
  }

  static void testPkceMatches() throws Exception {
    System.out.println("pkce");
    reset();
    Router router = mounted(CONFIG);
    Response.Result start = dispatch(router, "GET", "/api/demo/auth/oauth/google/redirect", null, Map.of(), Map.of());
    String challenge = param(location(start), "code_challenge");
    route("https://oauth2.googleapis.com/token", 200, "{\"access_token\":\"at\"}");
    route("https://openidconnect.googleapis.com/v1/userinfo", 200, "{\"sub\":\"g-2\",\"email\":\"b@example.com\",\"email_verified\":true}");
    Map<String, String> headers = Map.of("Cookie", "arkzen-oauth-demo=" + cookieValue(start));
    dispatch(router, "GET", "/api/demo/auth/oauth/google/callback",
        "code=c&state=" + java.net.URLEncoder.encode(param(location(start), "state"), StandardCharsets.UTF_8), headers, Map.of());
    String verifier = formOf(lastTo("https://oauth2.googleapis.com/token").body()).get("code_verifier");
    check("sha256(code_verifier) equals the code_challenge", verifier != null && sha256b64(verifier).equals(challenge));
  }

  static void testStateDefences() throws Exception {
    System.out.println("state, cookie and error handling");
    reset();
    Router router = mounted(CONFIG);
    Response.Result start = dispatch(router, "GET", "/api/demo/auth/oauth/google/redirect", null, Map.of(), Map.of());
    String state = param(location(start), "state");
    String nonce = cookieValue(start);
    String enc = java.net.URLEncoder.encode(state, StandardCharsets.UTF_8);

    Response.Result tampered = dispatch(router, "GET", "/api/demo/auth/oauth/google/callback",
        "code=c&state=" + java.net.URLEncoder.encode(state.substring(0, state.length() - 2) + "xx", StandardCharsets.UTF_8),
        Map.of("Cookie", "arkzen-oauth-demo=" + nonce), Map.of());
    check("tampered state is rejected", fragment(location(tampered), "arkzen_oauth_error") != null && store.issued.isEmpty());
    check("failure goes to the configured error page", location(tampered).startsWith("https://app.example.test/login#"));

    Response.Result noCookie = dispatch(router, "GET", "/api/demo/auth/oauth/google/callback", "code=c&state=" + enc, Map.of(), Map.of());
    check("missing cookie is rejected", fragment(location(noCookie), "arkzen_oauth_error") != null);

    Response.Result wrongCookie = dispatch(router, "GET", "/api/demo/auth/oauth/google/callback", "code=c&state=" + enc,
        Map.of("Cookie", "arkzen-oauth-demo=someone-elses-nonce"), Map.of());
    check("cookie that does not match the state is rejected", fragment(location(wrongCookie), "arkzen_oauth_error") != null);

    String expired = OAuth.signState(new OAuth.State(nonce, "google", "demo", System.currentTimeMillis() / 1000 - 5));
    Response.Result late = dispatch(router, "GET", "/api/demo/auth/oauth/google/callback",
        "code=c&state=" + java.net.URLEncoder.encode(expired, StandardCharsets.UTF_8), Map.of("Cookie", "arkzen-oauth-demo=" + nonce), Map.of());
    check("expired state is rejected", fragment(location(late), "arkzen_oauth_error") != null);

    String otherProvider = OAuth.signState(new OAuth.State(nonce, "github", "demo", System.currentTimeMillis() / 1000 + 60));
    Response.Result swapped = dispatch(router, "GET", "/api/demo/auth/oauth/google/callback",
        "code=c&state=" + java.net.URLEncoder.encode(otherProvider, StandardCharsets.UTF_8), Map.of("Cookie", "arkzen-oauth-demo=" + nonce), Map.of());
    check("state minted for another provider is rejected", fragment(location(swapped), "arkzen_oauth_error") != null);

    Response.Result denied = dispatch(router, "GET", "/api/demo/auth/oauth/google/callback", "error=access_denied&state=" + enc,
        Map.of("Cookie", "arkzen-oauth-demo=" + nonce), Map.of());
    check("user cancelling shows a friendly message", fragment(location(denied), "arkzen_oauth_error").contains("cancelled"));

    route("https://oauth2.googleapis.com/token", 400, "{\"error\":\"invalid_grant\"}");
    Response.Result bad = signIn(router, "google", false, Map.of());
    String msg = fragment(location(bad), "arkzen_oauth_error");
    check("provider failure gives a generic message (no internals leaked)", msg != null && !msg.contains("invalid_grant") && store.issued.isEmpty());
  }

  static void testRedirectSafety() throws Exception {
    System.out.println("open redirect");
    reset();
    Router router = mounted("{\"providers\":[\"google\"],\"redirect\":\"//evil.example\",\"errorRedirect\":\"https://evil.example\"}");
    route("https://oauth2.googleapis.com/token", 200, "{\"access_token\":\"at\"}");
    route("https://openidconnect.googleapis.com/v1/userinfo", 200, "{\"sub\":\"g-3\",\"email\":\"c@example.com\",\"email_verified\":true}");
    String back = location(signIn(router, "google", false, Map.of()));
    check("a protocol-relative redirect path falls back to /", back.startsWith("https://app.example.test/#"));
    route("https://oauth2.googleapis.com/token", 500, "{}");
    String failed = location(signIn(router, "google", false, Map.of()));
    check("an absolute error redirect falls back to /", failed.startsWith("https://app.example.test/#"));
  }

  static void testApple() throws Exception {
    System.out.println("apple form_post + signed client secret");
    reset();
    KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
    generator.initialize(new ECGenParameterSpec("secp256r1"));
    KeyPair pair = generator.generateKeyPair();
    String pem = "-----BEGIN PRIVATE KEY-----\n" + Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(pair.getPrivate().getEncoded())
        + "\n-----END PRIVATE KEY-----";
    env.put("OAUTH_APPLE_CLIENT_ID", "com.example.web");
    env.put("OAUTH_APPLE_TEAM_ID", "TEAM123");
    env.put("OAUTH_APPLE_KEY_ID", "KEY123");
    env.put("OAUTH_APPLE_PRIVATE_KEY", pem.replace("\n", "\\n")); // .env style: literal \n escapes
    Router router = mounted(CONFIG);

    Response.Result start = dispatch(router, "GET", "/api/demo/auth/oauth/apple/redirect", null, Map.of(), Map.of());
    String cookie = start.headers.get("Set-Cookie");
    check("apple cookie is SameSite=None; Secure (needed for the cross-site POST)", cookie.contains("SameSite=None") && cookie.contains("Secure"));
    check("apple asks for form_post and sends a nonce",
        "form_post".equals(param(location(start), "response_mode")) && param(location(start), "nonce") != null);
    String nonce = cookieValue(start);

    long exp = System.currentTimeMillis() / 1000 + 600;
    String claims = Base64.getUrlEncoder().withoutPadding().encodeToString(Json.stringify(Support.mapOf(
        "iss", "https://appleid.apple.com", "aud", "com.example.web", "exp", exp, "nonce", nonce,
        "sub", "apple-sub-1", "email", "relay@privaterelay.appleid.com", "email_verified", "true")).getBytes(StandardCharsets.UTF_8));
    route("https://appleid.apple.com/auth/token", 200, "{\"id_token\":\"x." + claims + ".y\"}");

    Map<String, String> headers = new LinkedHashMap<>();
    headers.put("Cookie", "arkzen-oauth-demo=" + nonce);
    headers.put("Content-Type", "application/x-www-form-urlencoded");
    Map<String, Object> form = new LinkedHashMap<>();
    form.put("code", "apple-code");
    form.put("state", param(location(start), "state"));
    form.put("user", "{\"name\":{\"firstName\":\"Ada\",\"lastName\":\"Lovelace\"}}");
    Response.Result done = dispatch(router, "POST", "/api/demo/auth/oauth/apple/callback", null, headers, form);

    check("POST callback signs the user in", location(done).startsWith("https://app.example.test/dashboard#") && store.issued.size() == 1);
    check("name from the one-time user field is used", "Ada Lovelace".equals(store.users.get(1L).get("name")));

    String secret = formOf(lastTo("https://appleid.apple.com/auth/token").body()).get("client_secret");
    String[] jwt = secret.split("\\.");
    Signature verify = Signature.getInstance("SHA256withECDSAinP1363Format");
    verify.initVerify(pair.getPublic());
    verify.update((jwt[0] + "." + jwt[1]).getBytes(StandardCharsets.UTF_8));
    boolean valid = verify.verify(Base64.getUrlDecoder().decode(jwt[2]));
    Map<String, Object> head = Json.parseObject(new String(Base64.getUrlDecoder().decode(jwt[0])));
    Map<String, Object> body = Json.parseObject(new String(Base64.getUrlDecoder().decode(jwt[1])));
    check("client_secret is a valid ES256 JWT for the team and key", valid && "ES256".equals(head.get("alg")) && "KEY123".equals(head.get("kid"))
        && "TEAM123".equals(body.get("iss")) && "com.example.web".equals(body.get("sub")));
    check("apple's relay address is not auto-linked unless apple marks it verified", store.users.size() == 1);

    // wrong audience must be refused
    String wrongAud = Base64.getUrlEncoder().withoutPadding().encodeToString(Json.stringify(Support.mapOf(
        "iss", "https://appleid.apple.com", "aud", "someone.else", "exp", exp, "nonce", nonce, "sub", "z")).getBytes(StandardCharsets.UTF_8));
    route("https://appleid.apple.com/auth/token", 200, "{\"id_token\":\"x." + wrongAud + ".y\"}");
    Response.Result bad = signIn(router, "apple", true, Map.of());
    check("id_token for another client is rejected", fragment(location(bad), "arkzen_oauth_error") != null);
  }

  static void testTwitter() throws Exception {
    System.out.println("x (twitter) basic auth + large ids");
    reset();
    env.put("OAUTH_TWITTER_CLIENT_ID", "xid");
    env.put("OAUTH_TWITTER_CLIENT_SECRET", "xsecret");
    Router router = mounted(CONFIG);
    route("https://api.x.com/2/oauth2/token", 200, "{\"access_token\":\"at\"}");
    route("https://api.x.com/2/users/me", 200, "{\"data\":{\"id\":1234567890123456789,\"name\":\"Xavier\",\"username\":\"xav\"}}");
    Response.Result done = signIn(router, "twitter", false, Map.of());
    Sent token = lastTo("https://api.x.com/2/oauth2/token");
    String expected = "Basic " + Base64.getEncoder().encodeToString("xid:xsecret".getBytes(StandardCharsets.UTF_8));
    check("token request uses HTTP Basic and no client_secret in the body",
        expected.equals(token.headers().get("Authorization")) && !formOf(token.body()).containsKey("client_secret"));
    check("PKCE verifier is sent", formOf(token.body()).get("code_verifier") != null);
    check("19-digit id survives exactly", "1234567890123456789".equals(store.accounts.get(0).get("provider_user_id")));
    check("no email: reserved non-routable address", "twitter-1234567890123456789@oauth.invalid".equals(store.users.get(1L).get("email")));
    check("sign-in succeeded", location(done).contains("arkzen_oauth_token="));
  }

  static void testEmailLinking() throws Exception {
    System.out.println("email linking and pre-registration takeover defence");
    reset();
    Object victim = store.addUser("owner@example.com", "attacker-chosen-hash");
    Router router = mounted(CONFIG);
    route("https://oauth2.googleapis.com/token", 200, "{\"access_token\":\"at\"}");
    route("https://openidconnect.googleapis.com/v1/userinfo", 200,
        "{\"sub\":\"g-owner\",\"email\":\"owner@example.com\",\"email_verified\":true,\"name\":\"Real Owner\"}");
    signIn(router, "google", false, Map.of());
    check("verified email links to the existing account", store.users.size() == 1 && store.accounts.size() == 1
        && store.accounts.get(0).get("user_id").equals(victim));
    check("existing sessions are revoked", store.revoked.contains(victim));
    check("the pre-set password is replaced", !"attacker-chosen-hash".equals(store.users.get(victim).get("password")));

    reset();
    Object existing = store.addUser("someone@example.com", "their-hash");
    env.put("OAUTH_MICROSOFT_CLIENT_ID", "mid");
    env.put("OAUTH_MICROSOFT_CLIENT_SECRET", "msecret");
    Router ms = mounted(CONFIG);
    route("https://login.microsoftonline.com/common/oauth2/v2.0/token", 200, "{\"access_token\":\"at\"}");
    route("https://graph.microsoft.com/oidc/userinfo", 200, "{\"sub\":\"m-1\",\"email\":\"someone@example.com\",\"name\":\"Mallory\"}");
    signIn(ms, "microsoft", false, Map.of());
    check("microsoft emails are never auto-linked", store.users.size() == 2 && !store.accounts.get(0).get("user_id").equals(existing));
    check("the existing account is untouched", "their-hash".equals(store.users.get(existing).get("password")) && store.revoked.isEmpty());
    check("the new account does not steal the address", "microsoft-m-1@oauth.invalid".equals(store.users.get(2L).get("email")));

    reset();
    Object kept = store.addUser("keep@example.com", "kept-hash");
    Router off = mounted("{\"providers\":[\"google\"],\"redirect\":\"/\",\"errorRedirect\":\"/\",\"linkVerifiedEmail\":false}");
    route("https://oauth2.googleapis.com/token", 200, "{\"access_token\":\"at\"}");
    route("https://openidconnect.googleapis.com/v1/userinfo", 200, "{\"sub\":\"g-k\",\"email\":\"keep@example.com\",\"email_verified\":true}");
    signIn(off, "google", false, Map.of());
    check("link_verified_email: false never links", store.users.size() == 2 && "kept-hash".equals(store.users.get(kept).get("password")));
  }

  static void testInstagram() throws Exception {
    System.out.println("instagram (no email) and form-encoded token response");
    reset();
    env.put("OAUTH_INSTAGRAM_CLIENT_ID", "iid");
    env.put("OAUTH_INSTAGRAM_CLIENT_SECRET", "isecret");
    Router router = mounted(CONFIG);
    route("https://api.instagram.com/oauth/access_token", 200, "{\"data\":[{\"access_token\":\"igtok\",\"user_id\":\"1784\"}]}");
    route("https://graph.instagram.com/", 200, "{\"user_id\":\"1784\",\"username\":\"pic\"}");
    Response.Result done = signIn(router, "instagram", false, Map.of());
    check("data[] token variant is understood", location(done).contains("arkzen_oauth_token="));
    check("username becomes the display name", "pic".equals(store.users.get(1L).get("name")));

    reset();
    Router google = mounted(CONFIG);
    route("https://oauth2.googleapis.com/token", 200, "access_token=formtok&token_type=bearer");
    route("https://openidconnect.googleapis.com/v1/userinfo", 200, "{\"sub\":\"g-form\"}");
    Response.Result form = signIn(google, "google", false, Map.of());
    check("form-encoded token response is understood", location(form).contains("arkzen_oauth_token="));
  }

  static void testGithub() throws Exception {
    System.out.println("github email selection");
    reset();
    env.put("OAUTH_GITHUB_CLIENT_ID", "ghid");
    env.put("OAUTH_GITHUB_CLIENT_SECRET", "ghsecret");
    Router router = mounted(CONFIG);
    route("https://github.com/login/oauth/access_token", 200, "{\"access_token\":\"at\"}");
    route("https://api.github.com/user/emails", 200,
        "[{\"email\":\"old@example.com\",\"primary\":false,\"verified\":true},{\"email\":\"main@example.com\",\"primary\":true,\"verified\":true}]");
    route("https://api.github.com/user", 200, "{\"id\":42,\"login\":\"octo\",\"email\":null,\"avatar_url\":\"http://a\"}");
    signIn(router, "github", false, Map.of());
    check("primary verified email is chosen", "main@example.com".equals(store.users.get(1L).get("email")));
    check("login is the fallback name", "octo".equals(store.users.get(1L).get("name")));
  }

  static void testGeneratedWiring() {
    System.out.println("generated-module wiring");
    java.util.Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("name", "demo");
    payload.put("auth", true);
    payload.put("oauth", Support.mapOf("providers", List.of("google"), "redirect", "/dashboard", "errorRedirect", "/login", "linkVerifiedEmail", true));
    String json = Json.stringify(payload.get("oauth"));
    checkConfig(json);
  }

  static void checkConfig(String json) {
    OAuth.Config config = OAuth.configFrom(Json.parseObject(json));
    check("config round-trips through the generated JSON literal", config.providers.equals(List.of("google"))
        && "/dashboard".equals(config.redirect) && "/login".equals(config.errorRedirect) && config.linkVerifiedEmail);
  }

  public static void main(String[] args) throws Exception {
    testProviders();
    testGoogleFlow();
    testPkceMatches();
    testStateDefences();
    testRedirectSafety();
    testApple();
    testTwitter();
    testEmailLinking();
    testInstagram();
    testGithub();
    testGeneratedWiring();
    System.out.println("\n" + passed + " passed, " + failed + " failed");
    if (failed > 0) System.exit(1);
  }
}
