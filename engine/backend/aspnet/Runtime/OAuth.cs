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

using System.Data.Common;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Http;

namespace Pluff.AspNet.Runtime;

public static class OAuth
{
    public static readonly string[] Providers =
        ["google", "github", "twitter", "apple", "microsoft", "facebook", "instagram", "discord"];

    private const string UserAgent = "Pluff-OAuth/1.0";
    private const long StateTtlSeconds = 600;
    private const string DefaultEngineSecret = "arkzen-engine-secret";

    // ── config ─────────────────────────────────────────────────────────────────

    /// <summary>The `@arkzen:oauth` block as sent by the parser. It never carries secrets.</summary>
    public sealed record Config(IReadOnlyList<string> Providers, string Redirect, string ErrorRedirect, bool LinkVerifiedEmail);

    public static Config? ConfigFrom(JsonNode? module)
    {
        if (module?["oauth"] is not JsonObject raw) return null;
        var providers = new List<string>();
        if (raw["providers"] is JsonArray list)
            foreach (var item in list) providers.Add(Text(item));
        if (providers.Count == 0) return null;
        var link = raw["linkVerifiedEmail"];
        return new Config(providers, Text(raw["redirect"]), Text(raw["errorRedirect"]),
            link is null || Truthy(link));
    }

    /// <summary>True when the payload declares an `@arkzen:oauth` block with at least one provider.</summary>
    public static bool IsEnabled(JsonNode? module) => ConfigFrom(module) is not null;

    /// <summary>Build-time validation of the payload's oauth block. Returns human-readable problems (empty = fine).</summary>
    public static List<string> Validate(JsonObject payload)
    {
        var problems = new List<string>();
        var raw = payload["oauth"];
        if (raw is null) return problems;
        if (raw is not JsonObject block)
        {
            problems.Add("oauth must be an object");
            return problems;
        }
        if (!Truthy(payload["auth"])) problems.Add("oauth requires auth to be enabled");
        if (block["providers"] is not JsonArray { Count: > 0 } list)
        {
            problems.Add("oauth.providers must be a non-empty array");
            return problems;
        }
        foreach (var provider in list)
            if (!Providers.Contains(Text(provider))) problems.Add($"Unknown OAuth provider \"{Text(provider)}\"");
        return problems;
    }

    // ── seams (tests replace these; production uses the defaults) ──────────────

    public sealed record HttpResult(int Status, string Body);

    public delegate Task<HttpResult> HttpSender(string method, string url, IDictionary<string, string> headers, string? body, CancellationToken cancellationToken);

    private static readonly HttpClient Client = new(new HttpClientHandler { AllowAutoRedirect = false })
    {
        Timeout = TimeSpan.FromSeconds(15)
    };

    internal static HttpSender Send = async (method, url, headers, body, cancellationToken) =>
    {
        using var request = new HttpRequestMessage(new HttpMethod(method), url);
        foreach (var (name, value) in headers)
        {
            if (name.Equals("Content-Type", StringComparison.OrdinalIgnoreCase)) continue;
            request.Headers.TryAddWithoutValidation(name, value);
        }
        if (!string.IsNullOrEmpty(body))
            request.Content = new StringContent(body, Encoding.UTF8, new MediaTypeHeaderValue("application/x-www-form-urlencoded"));
        using var response = await Client.SendAsync(request, cancellationToken);
        var data = await response.Content.ReadAsStringAsync(cancellationToken);
        if (data.Length > 2_000_000) data = data[..2_000_000];
        return new HttpResult((int)response.StatusCode, data);
    };

    /// <summary>Environment seam: process env / .env in production, a fixed map in tests.</summary>
    internal static Func<string, string?> EnvLookup = Environment.GetEnvironmentVariable;

    /// <summary>Password hashing seam: PBKDF2 in production, replaced in tests to keep them fast.</summary>
    internal static Func<string, string> PasswordHasher = PasswordHash.Create;

    /// <summary>Builds the store for one request. Tests replace it with an in-memory store.</summary>
    internal static Func<DbConnection, string, IOAuthStore> StoreFactory = (connection, slug) => new SqlOAuthStore(connection, slug);

    private static string Env(string key) => EnvLookup(key)?.Trim() ?? "";

    private static string Host(string target)
    {
        try { return new Uri(target).Host; } catch (UriFormatException) { return "?"; }
    }

    private static async Task<HttpResult> CallAsync(string method, string target, IDictionary<string, string> headers, string? body, CancellationToken cancellationToken)
    {
        try
        {
            return await Send(method, target, headers, body, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            throw new InvalidOperationException($"provider request failed at {Host(target)}");
        }
    }

    private static JsonNode? ParseJson(string body)
    {
        try { return JsonNode.Parse(body); } catch (System.Text.Json.JsonException) { return null; }
    }

    private static async Task<JsonNode> GetJsonAsync(string target, IDictionary<string, string>? extra, CancellationToken cancellationToken)
    {
        var headers = new Dictionary<string, string> { ["Accept"] = "application/json", ["User-Agent"] = UserAgent };
        if (extra is not null) foreach (var (key, value) in extra) headers[key] = value;
        var result = await CallAsync("GET", target, headers, null, cancellationToken);
        var value2 = ParseJson(result.Body);
        if (value2 is null || result.Status is < 200 or > 299)
            throw new InvalidOperationException($"provider request failed ({result.Status}) at {Host(target)}");
        return value2;
    }

    // ── small helpers ──────────────────────────────────────────────────────────

    /// <summary>Scalar JSON values as text; objects, arrays and null become "".</summary>
    private static string Text(JsonNode? value) => value is JsonValue scalar ? scalar.ToString() : "";

    private static bool Truthy(JsonNode? value) =>
        value is JsonValue scalar && (scalar.TryGetValue<bool>(out var flag) ? flag : scalar.ToString() == "true");

    private static bool StrictTrue(JsonNode? value) =>
        value is JsonValue scalar && scalar.TryGetValue<bool>(out var flag) && flag;

    private static JsonObject Obj(JsonNode? value) => value as JsonObject ?? new JsonObject();

    private static string First(params string?[] values) => values.FirstOrDefault(value => !string.IsNullOrEmpty(value)) ?? "";

    private static long ToLong(JsonNode? value)
    {
        var text = Text(value);
        if (long.TryParse(text, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var whole)) return whole;
        return double.TryParse(text, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var real) ? (long)real : 0;
    }

    private static string B64(byte[] data) => Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[] B64Decode(string value)
    {
        var padded = value.Replace('-', '+').Replace('_', '/');
        padded = padded.PadRight(padded.Length + (4 - padded.Length % 4) % 4, '=');
        return Convert.FromBase64String(padded);
    }

    private static string Encode(string value) => WebUtility.UrlEncode(value);

    private static string Form(IEnumerable<KeyValuePair<string, string>> values) =>
        string.Join("&", values.Select(pair => $"{Encode(pair.Key)}={Encode(pair.Value)}"));

    private static string Trim(string value) => value.TrimEnd('/');

    private static byte[]? _fallbackKey;
    private static readonly object FallbackLock = new();

    private static byte[] StateKey()
    {
        var configured = Env("OAUTH_STATE_SECRET");
        if (configured.Length > 0) return Encoding.UTF8.GetBytes(configured);
        // The engine secret ships with a public default; only trust it once the operator changed it.
        var engine = Env("ARKZEN_ENGINE_SECRET");
        if (engine.Length > 0 && engine != DefaultEngineSecret) return Encoding.UTF8.GetBytes(engine);
        // No secret configured: a per-process key. Flows that straddle a restart simply fail and can be retried.
        lock (FallbackLock) return _fallbackKey ??= RandomNumberGenerator.GetBytes(32);
    }

    private static string Hmac(string data) => B64(HMACSHA256.HashData(StateKey(), Encoding.UTF8.GetBytes(data)));

    private static bool SafeEquals(string a, string b) =>
        CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(a), Encoding.UTF8.GetBytes(b));

    private static string PkceVerifier(string nonce) => Hmac("pkce:" + nonce);

    private static string PkceChallenge(string nonce) => B64(SHA256.HashData(Encoding.UTF8.GetBytes(PkceVerifier(nonce))));

    // ── state + cookie ─────────────────────────────────────────────────────────

    internal sealed record State(string Nonce, string Provider, string Slug, long Expires);

    internal static string SignState(State state)
    {
        var payload = new JsonObject { ["n"] = state.Nonce, ["p"] = state.Provider, ["s"] = state.Slug, ["e"] = state.Expires };
        var body = B64(Encoding.UTF8.GetBytes(payload.ToJsonString()));
        return $"v1.{body}.{Hmac("state:" + body)}";
    }

    internal static State? ReadState(string? token)
    {
        if (string.IsNullOrEmpty(token)) return null;
        var parts = token.Split('.');
        if (parts.Length != 3 || parts[0] != "v1" || !SafeEquals(parts[2], Hmac("state:" + parts[1]))) return null;
        try
        {
            if (JsonNode.Parse(Encoding.UTF8.GetString(B64Decode(parts[1]))) is not JsonObject raw) return null;
            var expires = ToLong(raw["e"]);
            if (expires <= DateTimeOffset.UtcNow.ToUnixTimeSeconds()) return null;
            return new State(Text(raw["n"]), Text(raw["p"]), Text(raw["s"]), expires);
        }
        catch (Exception exception) when (exception is FormatException or System.Text.Json.JsonException)
        {
            return null;
        }
    }

    internal static string CookieName(string slug) => "arkzen-oauth-" + slug;

    /// <summary>Apple answers with a cross-site POST, which only carries a SameSite=None cookie (and that requires Secure).</summary>
    internal static string Cookie(string slug, string provider, string value, long maxAge) =>
        $"{CookieName(slug)}={value}; Path=/; HttpOnly; Max-Age={Math.Max(maxAge, 0)}" +
        (provider == "apple" ? "; SameSite=None; Secure" : "; SameSite=Lax");

    // ── env-derived settings ───────────────────────────────────────────────────

    internal static string ClientId(string provider) => Env($"OAUTH_{provider.ToUpperInvariant()}_CLIENT_ID");

    internal static string ClientSecret(string provider) => Env($"OAUTH_{provider.ToUpperInvariant()}_CLIENT_SECRET");

    internal static bool Configured(string provider)
    {
        if (ClientId(provider).Length == 0) return false;
        if (provider == "apple")
            return Env("OAUTH_APPLE_TEAM_ID").Length > 0 && Env("OAUTH_APPLE_KEY_ID").Length > 0 && Env("OAUTH_APPLE_PRIVATE_KEY").Length > 0;
        return ClientSecret(provider).Length > 0;
    }

    internal static string ProviderName(string provider) => provider switch
    {
        "google" => "Google",
        "github" => "GitHub",
        "twitter" => "X (Twitter)",
        "apple" => "Apple",
        "microsoft" => "Microsoft",
        "facebook" => "Facebook",
        "instagram" => "Instagram",
        "discord" => "Discord",
        _ => "Provider"
    };

    internal static string RedirectBase()
    {
        var value = Env("OAUTH_REDIRECT_BASE");
        if (value.Length == 0) value = Env("APP_URL");
        if (value.Length == 0) value = "http://localhost:8000";
        return Trim(value);
    }

    internal static string FrontendUrl()
    {
        var value = Env("OAUTH_FRONTEND_URL");
        return Trim(value.Length == 0 ? "http://localhost:3000" : value);
    }

    internal static string CallbackUrl(string slug, string provider) =>
        $"{RedirectBase()}/api/{slug}/auth/oauth/{provider}/callback";

    private static string GraphVersion(string provider)
    {
        var value = Env($"OAUTH_{provider}_API_VERSION");
        return value.Length == 0 ? "v25.0" : value;
    }

    /// <summary>Apple's client secret is a short-lived ES256 JWT signed with the team's .p8 key.</summary>
    internal static string AppleClientSecret()
    {
        var team = Env("OAUTH_APPLE_TEAM_ID");
        var keyId = Env("OAUTH_APPLE_KEY_ID");
        var pem = Env("OAUTH_APPLE_PRIVATE_KEY").Replace("\\n", "\n");
        if (team.Length == 0 || keyId.Length == 0 || pem.Length == 0)
            throw new InvalidOperationException("Apple needs OAUTH_APPLE_TEAM_ID, OAUTH_APPLE_KEY_ID and OAUTH_APPLE_PRIVATE_KEY");
        try
        {
            var der = System.Text.RegularExpressions.Regex.Replace(
                System.Text.RegularExpressions.Regex.Replace(pem, "-----[A-Z ]+-----", ""), @"\s+", "");
            using var key = ECDsa.Create();
            key.ImportPkcs8PrivateKey(Convert.FromBase64String(der), out _);
            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var head = B64(Encoding.UTF8.GetBytes(new JsonObject { ["alg"] = "ES256", ["kid"] = keyId, ["typ"] = "JWT" }.ToJsonString()));
            var body = B64(Encoding.UTF8.GetBytes(new JsonObject
            {
                ["iss"] = team, ["iat"] = now, ["exp"] = now + 300,
                ["aud"] = "https://appleid.apple.com", ["sub"] = ClientId("apple")
            }.ToJsonString()));
            var signingInput = $"{head}.{body}";
            // JWT ES256 wants the raw r||s form, which is .NET's default signature format.
            var signature = key.SignData(Encoding.UTF8.GetBytes(signingInput), HashAlgorithmName.SHA256);
            return $"{signingInput}.{B64(signature)}";
        }
        catch (Exception exception) when (exception is FormatException or CryptographicException)
        {
            throw new InvalidOperationException("OAUTH_APPLE_PRIVATE_KEY is not a valid PKCS#8 EC key");
        }
    }

    // ── provider table ─────────────────────────────────────────────────────────

    internal sealed record Def(string Authorize, string Token, string Scope, bool Pkce, bool BasicAuth, (string, string)[] Extra);

    internal static Def? Definition(string provider)
    {
        var tenant = Env("OAUTH_MICROSOFT_TENANT");
        if (tenant.Length == 0) tenant = "common";
        var fb = GraphVersion("FACEBOOK");
        return provider switch
        {
            "google" => new Def("https://accounts.google.com/o/oauth2/v2/auth", "https://oauth2.googleapis.com/token",
                "openid email profile", true, false, [("access_type", "online"), ("prompt", "select_account")]),
            "github" => new Def("https://github.com/login/oauth/authorize", "https://github.com/login/oauth/access_token",
                "read:user user:email", false, false, []),
            // X: authorization code + PKCE is mandatory; confidential clients authenticate with HTTP Basic.
            "twitter" => new Def("https://x.com/i/oauth2/authorize", "https://api.x.com/2/oauth2/token",
                "users.read tweet.read users.email", true, true, []),
            // Apple: client_secret is a signed JWT, the callback is a form_post, the identity is in the id_token.
            "apple" => new Def("https://appleid.apple.com/auth/authorize", "https://appleid.apple.com/auth/token",
                "name email", false, false, [("response_mode", "form_post")]),
            "microsoft" => new Def($"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize",
                $"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token", "openid profile email User.Read", true, false,
                [("response_mode", "query"), ("prompt", "select_account")]),
            "facebook" => new Def($"https://www.facebook.com/{fb}/dialog/oauth",
                $"https://graph.facebook.com/{fb}/oauth/access_token", "email,public_profile", false, false, []),
            // Instagram API with Instagram Login (Basic Display API is gone). Professional accounts only; no email is shared.
            "instagram" => new Def("https://www.instagram.com/oauth/authorize", "https://api.instagram.com/oauth/access_token",
                "instagram_business_basic", false, false, []),
            "discord" => new Def("https://discord.com/oauth2/authorize", "https://discord.com/api/oauth2/token",
                "identify email", true, false, [("prompt", "consent")]),
            _ => null
        };
    }

    /// <summary>Returns the authorize URL and the nonce that goes into the cookie.</summary>
    internal static (string Url, string Nonce) AuthorizeUrl(string slug, string provider)
    {
        var def = Definition(provider) ?? throw new InvalidOperationException("Unknown OAuth provider");
        var nonce = B64(RandomNumberGenerator.GetBytes(24));
        var state = SignState(new State(nonce, provider, slug, DateTimeOffset.UtcNow.ToUnixTimeSeconds() + StateTtlSeconds));
        var query = new List<KeyValuePair<string, string>>
        {
            new("client_id", ClientId(provider)),
            new("redirect_uri", CallbackUrl(slug, provider)),
            new("response_type", "code"),
            new("scope", def.Scope),
            new("state", state)
        };
        foreach (var (key, value) in def.Extra) query.Add(new(key, value));
        if (def.Pkce)
        {
            query.Add(new("code_challenge", PkceChallenge(nonce)));
            query.Add(new("code_challenge_method", "S256"));
        }
        if (provider == "apple") query.Add(new("nonce", nonce));
        return ($"{def.Authorize}?{Form(query)}", nonce);
    }

    internal static async Task<JsonObject> ExchangeCodeAsync(string slug, string provider, string code, string nonce, CancellationToken cancellationToken)
    {
        var def = Definition(provider) ?? throw new InvalidOperationException("Unknown OAuth provider");
        var secret = provider == "apple" ? AppleClientSecret() : ClientSecret(provider);
        var id = ClientId(provider);
        var headers = new Dictionary<string, string>
        {
            ["Content-Type"] = "application/x-www-form-urlencoded",
            ["Accept"] = "application/json",
            ["User-Agent"] = UserAgent
        };
        var body = new List<KeyValuePair<string, string>>
        {
            new("grant_type", "authorization_code"),
            new("code", code),
            new("redirect_uri", CallbackUrl(slug, provider)),
            new("client_id", id)
        };
        if (def.BasicAuth)
            headers["Authorization"] = "Basic " + Convert.ToBase64String(Encoding.UTF8.GetBytes($"{id}:{secret}"));
        else body.Add(new("client_secret", secret));
        if (def.Pkce) body.Add(new("code_verifier", PkceVerifier(nonce)));

        var result = await CallAsync("POST", def.Token, headers, Form(body), cancellationToken);
        var data = new JsonObject();
        var parsed = ParseJson(result.Body);
        if (parsed is JsonObject parsedObject) data = parsedObject;
        else if (parsed is null)
        {
            // some providers answer form-encoded
            foreach (var part in result.Body.Split('&'))
            {
                var split = part.IndexOf('=');
                if (split > 0) data[WebUtility.UrlDecode(part[..split])] = WebUtility.UrlDecode(part[(split + 1)..]);
            }
        }
        if (data["data"] is JsonArray { Count: > 0 } wrapped && wrapped[0] is JsonObject inner) data = inner; // Instagram variant
        if (result.Status is < 200 or > 299 || (Text(data["access_token"]).Length == 0 && Text(data["id_token"]).Length == 0))
            throw new InvalidOperationException($"token exchange failed ({result.Status})");
        return data;
    }

    // ── profiles ───────────────────────────────────────────────────────────────

    internal sealed record Profile(string Id, string Email, bool EmailVerified, string Name, string Avatar);

    private static Dictionary<string, string> Bearer(JsonObject tokens) =>
        new() { ["Authorization"] = "Bearer " + Text(tokens["access_token"]) };

    private static InvalidOperationException Missing(string provider, string what) =>
        new($"{ProviderName(provider)} returned no {what}");

    internal static async Task<Profile> FetchProfileAsync(string provider, JsonObject tokens, string nonce, string? appleUser, CancellationToken cancellationToken)
    {
        var token = Text(tokens["access_token"]);
        switch (provider)
        {
            case "google":
            {
                var u = Obj(await GetJsonAsync("https://openidconnect.googleapis.com/v1/userinfo", Bearer(tokens), cancellationToken));
                if (Text(u["sub"]).Length == 0) throw Missing(provider, "user id");
                return new Profile(Text(u["sub"]), Text(u["email"]), Truthy(u["email_verified"]), Text(u["name"]), Text(u["picture"]));
            }
            case "github":
            {
                var headers = Bearer(tokens);
                headers["Accept"] = "application/vnd.github+json";
                headers["X-GitHub-Api-Version"] = "2022-11-28";
                var u = Obj(await GetJsonAsync("https://api.github.com/user", headers, cancellationToken));
                if (Text(u["id"]).Length == 0) throw Missing(provider, "user id");
                var email = Text(u["email"]);
                var verified = false;
                // user:email scope missing or denied: keep the public email, unverified.
                try
                {
                    if (await GetJsonAsync("https://api.github.com/user/emails", headers, cancellationToken) is JsonArray entries)
                    {
                        var candidates = entries.Select(Obj).ToList();
                        var pick = candidates.FirstOrDefault(entry => Truthy(entry["primary"]) && Truthy(entry["verified"]))
                                   ?? candidates.FirstOrDefault(entry => Truthy(entry["verified"]));
                        if (pick is not null) { email = Text(pick["email"]); verified = true; }
                    }
                }
                catch (InvalidOperationException) { /* keep the public email, unverified */ }
                return new Profile(Text(u["id"]), email, verified, First(Text(u["name"]), Text(u["login"])), Text(u["avatar_url"]));
            }
            case "twitter":
            {
                var envelope = Obj(await GetJsonAsync("https://api.x.com/2/users/me?user.fields=profile_image_url,confirmed_email", Bearer(tokens), cancellationToken));
                var u = Obj(envelope["data"]);
                if (Text(u["id"]).Length == 0) throw Missing(provider, "user id");
                // X returns an email only when the app has the permission; it is never treated as verified.
                return new Profile(Text(u["id"]), Text(u["confirmed_email"]), false,
                    First(Text(u["name"]), Text(u["username"])), Text(u["profile_image_url"]));
            }
            case "apple":
                return AppleProfile(tokens, nonce, appleUser);
            case "microsoft":
            {
                var u = Obj(await GetJsonAsync("https://graph.microsoft.com/oidc/userinfo", Bearer(tokens), cancellationToken));
                if (Text(u["sub"]).Length == 0) throw Missing(provider, "user id");
                // Microsoft emails are not proven to belong to the user ("nOAuth"), so they are never auto-linked.
                return new Profile(Text(u["sub"]), Text(u["email"]), false, Text(u["name"]), "");
            }
            case "facebook":
            {
                var u = Obj(await GetJsonAsync($"https://graph.facebook.com/{GraphVersion("FACEBOOK")}/me?fields=id,name,email,picture.type(large)&access_token={Encode(token)}", null, cancellationToken));
                if (Text(u["id"]).Length == 0) throw Missing(provider, "user id");
                var avatar = Text(Obj(Obj(u["picture"])["data"])["url"]);
                return new Profile(Text(u["id"]), Text(u["email"]), false, Text(u["name"]), avatar);
            }
            case "instagram":
            {
                var u = Obj(await GetJsonAsync($"https://graph.instagram.com/{GraphVersion("INSTAGRAM")}/me?fields=user_id,username,name,profile_picture_url&access_token={Encode(token)}", null, cancellationToken));
                var id = First(Text(u["user_id"]), Text(u["id"]));
                if (id.Length == 0) throw Missing(provider, "user id");
                return new Profile(id, "", false, First(Text(u["name"]), Text(u["username"])), Text(u["profile_picture_url"]));
            }
            case "discord":
            {
                var u = Obj(await GetJsonAsync("https://discord.com/api/users/@me", Bearer(tokens), cancellationToken));
                var id = Text(u["id"]);
                if (id.Length == 0) throw Missing(provider, "user id");
                var hash = Text(u["avatar"]);
                var avatar = hash.Length == 0 ? "" : $"https://cdn.discordapp.com/avatars/{id}/{hash}.png";
                return new Profile(id, Text(u["email"]), StrictTrue(u["verified"]), First(Text(u["global_name"]), Text(u["username"])), avatar);
            }
            default:
                throw new InvalidOperationException("Unknown OAuth provider");
        }
    }

    private static Profile AppleProfile(JsonObject tokens, string nonce, string? appleUser)
    {
        var parts = Text(tokens["id_token"]).Split('.');
        if (parts.Length < 2) throw new InvalidOperationException("Malformed id_token");
        JsonObject claims;
        try
        {
            claims = JsonNode.Parse(Encoding.UTF8.GetString(B64Decode(parts[1].TrimEnd('=')))) as JsonObject
                     ?? throw new InvalidOperationException("Malformed id_token");
        }
        catch (Exception exception) when (exception is FormatException or System.Text.Json.JsonException)
        {
            throw new InvalidOperationException("Malformed id_token");
        }
        // Signature is not re-verified: the token came straight from Apple's token endpoint over TLS (OIDC Core 3.1.3.7).
        if (Text(claims["iss"]) != "https://appleid.apple.com") throw new InvalidOperationException("Apple id_token has the wrong issuer");
        if (Text(claims["aud"]) != ClientId("apple")) throw new InvalidOperationException("Apple id_token was issued for another client");
        if (ToLong(claims["exp"]) < DateTimeOffset.UtcNow.ToUnixTimeSeconds()) throw new InvalidOperationException("Apple id_token has expired");
        if (Text(claims["nonce"]) != nonce) throw new InvalidOperationException("Apple id_token nonce mismatch");
        // Apple sends the name once, on first authorization, as a JSON form field.
        var name = "";
        if (!string.IsNullOrEmpty(appleUser))
        {
            var nameObject = Obj(Obj(ParseJson(appleUser))["name"]);
            name = $"{Text(nameObject["firstName"])} {Text(nameObject["lastName"])}".Trim();
        }
        if (Text(claims["sub"]).Length == 0) throw new InvalidOperationException("Apple returned no user id");
        return new Profile(Text(claims["sub"]), Text(claims["email"]), Truthy(claims["email_verified"]), name, "");
    }

    // ── users ──────────────────────────────────────────────────────────────────

    /// <summary>Persistence seam. <see cref="SqlOAuthStore"/> is what production uses; tests use an in-memory one.</summary>
    internal interface IOAuthStore
    {
        Task<(long Id, long UserId)?> FindAccountAsync(string provider, string providerUserId, CancellationToken cancellationToken);
        Task<bool> UserExistsAsync(long userId, CancellationToken cancellationToken);
        Task TouchAccountAsync(long accountId, string? email, string? avatar, CancellationToken cancellationToken);
        Task DeleteAccountAsync(long accountId, CancellationToken cancellationToken);
        Task<long?> FindUserIdByEmailAsync(string email, CancellationToken cancellationToken);
        Task RevokeTokensAsync(long userId, CancellationToken cancellationToken);
        Task SetPasswordAsync(long userId, string hash, CancellationToken cancellationToken);
        Task<long> CreateUserAsync(string name, string email, string passwordHash, DateTime? verifiedAt, CancellationToken cancellationToken);
        Task LinkAccountAsync(long userId, string provider, string providerUserId, string? email, string? avatar, CancellationToken cancellationToken);
        Task<string> IssueTokenAsync(long userId, CancellationToken cancellationToken);
    }

    private static string? Nullable(string? value) => string.IsNullOrEmpty(value) ? null : value;

    private static string RandomPasswordHash() => PasswordHasher(Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant());

    /// <summary>Finds, links or creates the local user for a provider profile and returns their id.</summary>
    internal static async Task<long> ResolveUserAsync(IOAuthStore store, string provider, Profile profile, bool linkVerifiedEmail, CancellationToken cancellationToken)
    {
        var account = await store.FindAccountAsync(provider, profile.Id, cancellationToken);
        if (account is { } found)
        {
            if (await store.UserExistsAsync(found.UserId, cancellationToken))
            {
                await store.TouchAccountAsync(found.Id, Nullable(profile.Email), Nullable(profile.Avatar), cancellationToken);
                return found.UserId;
            }
            await store.DeleteAccountAsync(found.Id, cancellationToken); // orphaned link: drop it and re-create below
        }

        var email = (profile.Email ?? "").Trim().ToLowerInvariant();
        long? userId = null;

        if (email.Length > 0 && profile.EmailVerified && linkVerifiedEmail)
        {
            var existing = await store.FindUserIdByEmailAsync(email, cancellationToken);
            if (existing is { } existingId)
            {
                // Pre-hijack defence: this account may have been registered by someone else with this email before its
                // owner ever signed in with the provider (the users table has no verified-email flag). Revoke every
                // session and replace the password so only the provider-verified owner can continue.
                await store.RevokeTokensAsync(existingId, cancellationToken);
                await store.SetPasswordAsync(existingId, RandomPasswordHash(), cancellationToken);
                userId = existingId;
            }
        }

        if (userId is null)
        {
            // Providers without a usable email (Instagram, X without permission) get a reserved, non-routable address.
            var own = email;
            if (own.Length > 0 && await store.FindUserIdByEmailAsync(own, cancellationToken) is not null) own = ""; // taken and not linkable
            if (own.Length == 0) own = $"{provider}-{profile.Id}@oauth.invalid".ToLowerInvariant();
            var name = (profile.Name ?? "").Trim();
            if (name.Length == 0) name = own[..own.IndexOf('@')];
            if (name.Length > 255) name = name[..255];
            userId = await store.CreateUserAsync(name, own, RandomPasswordHash(), profile.EmailVerified ? DateTime.UtcNow : null, cancellationToken);
        }

        await store.LinkAccountAsync(userId.Value, provider, profile.Id, Nullable(profile.Email), Nullable(profile.Avatar), cancellationToken);
        return userId.Value;
    }

    /// <summary>SQL-backed store over the tatemono's isolated tables.</summary>
    internal sealed class SqlOAuthStore(DbConnection connection, string slug) : IOAuthStore
    {
        private readonly string _users = TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "users"));
        private readonly string _accounts = TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "oauth_accounts"));
        private readonly string _tokens = TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "personal_access_tokens"));

        private async Task<int> ExecuteAsync(string sql, CancellationToken cancellationToken, params (string Name, object? Value)[] parameters)
        {
            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            foreach (var (name, value) in parameters) TatemonoDatabase.AddParameter(command, name, value);
            return await command.ExecuteNonQueryAsync(cancellationToken);
        }

        private async Task<object?> ScalarAsync(string sql, CancellationToken cancellationToken, params (string Name, object? Value)[] parameters)
        {
            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            foreach (var (name, value) in parameters) TatemonoDatabase.AddParameter(command, name, value);
            var value2 = await command.ExecuteScalarAsync(cancellationToken);
            return value2 is DBNull ? null : value2;
        }

        private static long AsLong(object value) => Convert.ToInt64(value, System.Globalization.CultureInfo.InvariantCulture);

        public async Task<(long Id, long UserId)?> FindAccountAsync(string provider, string providerUserId, CancellationToken cancellationToken)
        {
            await using var command = connection.CreateCommand();
            command.CommandText = $"SELECT \"id\", \"user_id\" FROM {_accounts} WHERE \"provider\" = @provider AND \"provider_user_id\" = @provider_user_id LIMIT 1";
            TatemonoDatabase.AddParameter(command, "@provider", provider);
            TatemonoDatabase.AddParameter(command, "@provider_user_id", providerUserId);
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            if (!await reader.ReadAsync(cancellationToken)) return null;
            return (AsLong(reader.GetValue(0)), AsLong(reader.GetValue(1)));
        }

        public async Task<bool> UserExistsAsync(long userId, CancellationToken cancellationToken) =>
            await ScalarAsync($"SELECT \"id\" FROM {_users} WHERE \"id\" = @id LIMIT 1", cancellationToken, ("@id", userId)) is not null;

        public Task TouchAccountAsync(long accountId, string? email, string? avatar, CancellationToken cancellationToken) =>
            ExecuteAsync($"UPDATE {_accounts} SET \"email\" = @email, \"avatar\" = @avatar, \"updated_at\" = @updated WHERE \"id\" = @id",
                cancellationToken, ("@email", email), ("@avatar", avatar), ("@updated", DateTime.UtcNow), ("@id", accountId));

        public Task DeleteAccountAsync(long accountId, CancellationToken cancellationToken) =>
            ExecuteAsync($"DELETE FROM {_accounts} WHERE \"id\" = @id", cancellationToken, ("@id", accountId));

        public async Task<long?> FindUserIdByEmailAsync(string email, CancellationToken cancellationToken)
        {
            var value = await ScalarAsync($"SELECT \"id\" FROM {_users} WHERE lower(\"email\") = @email LIMIT 1", cancellationToken, ("@email", email));
            return value is null ? null : AsLong(value);
        }

        public Task RevokeTokensAsync(long userId, CancellationToken cancellationToken) =>
            ExecuteAsync($"DELETE FROM {_tokens} WHERE \"tokenable_id\" = @id AND \"tokenable_type\" = 'user'", cancellationToken, ("@id", userId));

        public Task SetPasswordAsync(long userId, string hash, CancellationToken cancellationToken) =>
            ExecuteAsync($"UPDATE {_users} SET \"password\" = @password, \"updated_at\" = @updated WHERE \"id\" = @id",
                cancellationToken, ("@password", hash), ("@updated", DateTime.UtcNow), ("@id", userId));

        public async Task<long> CreateUserAsync(string name, string email, string passwordHash, DateTime? verifiedAt, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var id = await ScalarAsync($"""
                INSERT INTO {_users} ("name", "email", "password", "role", "email_verified_at", "created_at", "updated_at")
                VALUES (@name, @email, @password, 'user', @verified, @created, @updated)
                RETURNING "id"
                """, cancellationToken,
                ("@name", name), ("@email", email), ("@password", passwordHash), ("@verified", verifiedAt), ("@created", now), ("@updated", now));
            return AsLong(id ?? throw new InvalidOperationException("user insert returned no id"));
        }

        public Task LinkAccountAsync(long userId, string provider, string providerUserId, string? email, string? avatar, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            return ExecuteAsync($"""
                INSERT INTO {_accounts} ("user_id", "provider", "provider_user_id", "email", "avatar", "created_at", "updated_at")
                VALUES (@user_id, @provider, @provider_user_id, @email, @avatar, @created, @updated)
                """, cancellationToken,
                ("@user_id", userId), ("@provider", provider), ("@provider_user_id", providerUserId),
                ("@email", email), ("@avatar", avatar), ("@created", now), ("@updated", now));
        }

        // Same token format as email + password sign-in: "<id>|<plain>", only the SHA-256 is stored.
        public async Task<string> IssueTokenAsync(long userId, CancellationToken cancellationToken)
        {
            var plain = Convert.ToHexString(RandomNumberGenerator.GetBytes(20)).ToLowerInvariant();
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(plain))).ToLowerInvariant();
            var now = DateTime.UtcNow;
            var id = await ScalarAsync($"""
                INSERT INTO {_tokens} ("tokenable_type", "tokenable_id", "name", "token", "abilities", "created_at", "updated_at")
                VALUES ('user', @user_id, 'arkzen-token', @token, '["*"]', @created, @updated)
                RETURNING "id"
                """, cancellationToken, ("@user_id", userId), ("@token", hash), ("@created", now), ("@updated", now));
            return $"{AsLong(id ?? throw new InvalidOperationException("token insert returned no id"))}|{plain}";
        }
    }

    // ── request handling ───────────────────────────────────────────────────────

    /// <summary>A failure whose message is safe to show to the person signing in.</summary>
    internal sealed class UserError(string message) : Exception(message);

    private static string SafePath(string? configured, string fallback) =>
        !string.IsNullOrEmpty(configured) && configured.StartsWith('/') && !configured.StartsWith("//") && !configured.Contains('\\')
            ? configured
            : fallback;

    private static Task RedirectAsync(HttpContext context, string target, string? cookie)
    {
        context.Response.StatusCode = StatusCodes.Status302Found;
        context.Response.Headers.Location = target;
        context.Response.Headers.CacheControl = "no-store";
        if (cookie is not null) context.Response.Headers.SetCookie = cookie;
        return Task.CompletedTask;
    }

    private static Task FailAsync(HttpContext context, Config config, string slug, string provider, string message) =>
        RedirectAsync(context,
            FrontendUrl() + SafePath(config.ErrorRedirect, "/") + "#" + Form([new("arkzen_oauth_error", message)]),
            Cookie(slug, provider, "", 0));

    private static bool Enabled(Config config, string provider) => Providers.Contains(provider) && config.Providers.Contains(provider);

    private static async Task JsonAsync(HttpContext context, object body, int status = 200) =>
        await Results.Json(body, statusCode: status).ExecuteAsync(context);

    /// <summary>
    /// Handles the OAuth routes of one tatemono. Returns true when the request was an OAuth route (and was answered),
    /// false when it is none of this module's business so the engine can keep dispatching.
    /// </summary>
    public static async Task<bool> TryHandleAsync(
        HttpContext context,
        JsonObject module,
        string method,
        string path,
        string slug,
        Func<CancellationToken, Task<DbConnection>> openConnection)
    {
        var config = ConfigFrom(module);
        if (config is null) return false;
        var prefix = $"/api/{slug}/auth/oauth";
        if (!path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) return false;
        var rest = path[prefix.Length..].Trim('/');
        var segments = rest.Length == 0 ? [] : rest.Split('/');

        if (method == "GET" && segments is ["providers"])
        {
            await JsonAsync(context, new
            {
                providers = config.Providers.Select(id => new { id, name = ProviderName(id), enabled = Configured(id) }).ToArray()
            });
            return true;
        }
        if (segments.Length != 2) return false;
        var provider = segments[0].ToLowerInvariant();
        var action = segments[1].ToLowerInvariant();

        if (method == "GET" && action == "redirect")
        {
            if (!Enabled(config, provider))
            {
                await JsonAsync(context, new { message = "Unknown OAuth provider." }, StatusCodes.Status404NotFound);
                return true;
            }
            if (!Configured(provider))
            {
                await FailAsync(context, config, slug, provider, $"{ProviderName(provider)} sign-in is not configured on this server.");
                return true;
            }
            try
            {
                var (url, nonce) = AuthorizeUrl(slug, provider);
                await RedirectAsync(context, url, Cookie(slug, provider, nonce, StateTtlSeconds));
            }
            catch (InvalidOperationException exception)
            {
                Console.Error.WriteLine($"[oauth:{provider}] {exception.Message}");
                await FailAsync(context, config, slug, provider, "Sign-in failed. Please try again.");
            }
            return true;
        }

        if (action == "callback" && method is "GET" or "POST")
        {
            if (!Enabled(config, provider))
            {
                await JsonAsync(context, new { message = "Unknown OAuth provider." }, StatusCodes.Status404NotFound);
                return true;
            }
            try
            {
                var token = await HandleCallbackAsync(context, config, slug, provider, openConnection);
                var fragment = Form([new("arkzen_oauth_token", token), new("arkzen_oauth_slug", slug)]);
                await RedirectAsync(context, FrontendUrl() + SafePath(config.Redirect, "/") + "#" + fragment, Cookie(slug, provider, "", 0));
            }
            catch (UserError exception)
            {
                await FailAsync(context, config, slug, provider, exception.Message);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                Console.Error.WriteLine($"[oauth:{provider}] {exception.Message}");
                await FailAsync(context, config, slug, provider, "Sign-in failed. Please try again.");
            }
            return true;
        }
        return false;
    }

    private static async Task<string> HandleCallbackAsync(
        HttpContext context, Config config, string slug, string provider, Func<CancellationToken, Task<DbConnection>> openConnection)
    {
        var cancellationToken = context.RequestAborted;
        // Apple answers with a form_post; everyone else with a query string.
        var form = context.Request.HasFormContentType ? await context.Request.ReadFormAsync(cancellationToken) : null;
        string Input(string name)
        {
            var fromForm = form?[name].ToString();
            return string.IsNullOrEmpty(fromForm) ? context.Request.Query[name].ToString() : fromForm;
        }

        if (Input("error").Length > 0)
            throw new UserError($"{ProviderName(provider)} sign-in was cancelled or denied.");
        var expired = new UserError("Sign-in session expired or was tampered with. Please try again.");
        var state = ReadState(Input("state")) ?? throw expired;
        var cookie = context.Request.Cookies[CookieName(slug)];
        if (string.IsNullOrEmpty(cookie)) throw expired;
        if (state.Provider != provider || state.Slug != slug || !SafeEquals(cookie, state.Nonce)) throw expired;
        var code = Input("code");
        if (code.Length == 0) throw new UserError("The provider did not return an authorization code.");

        var tokens = await ExchangeCodeAsync(slug, provider, code, state.Nonce, cancellationToken);
        var profile = await FetchProfileAsync(provider, tokens, state.Nonce, Input("user"), cancellationToken);
        await using var connection = await openConnection(cancellationToken);
        var store = StoreFactory(connection, slug);
        var userId = await ResolveUserAsync(store, provider, profile, config.LinkVerifiedEmail, cancellationToken);
        return await store.IssueTokenAsync(userId, cancellationToken);
    }
}
