//! Social sign-in (OAuth 2.0 / OIDC) layered on top of the per-tatemono token auth.
//!
//! Opt-in through the `@arkzen:oauth` DSL block; email + password keeps working untouched.
//! Providers: google, github, twitter (X), apple, microsoft, facebook, instagram, discord.
//! Secrets come from the environment only (`OAUTH_<PROVIDER>_CLIENT_ID` / `_CLIENT_SECRET`).
//!
//! Routes (prefix `/api/<slug>/auth/oauth`):
//!   GET      /providers               which providers are configured
//!   GET      /{provider}/redirect     starts the flow (302 to the provider)
//!   GET|POST /{provider}/callback     provider returns here (Apple uses POST form_post)

use crate::auth::{self, User};
use crate::db::{params, Connection, OptionalExtension};
use axum::{http::StatusCode, response::IntoResponse};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD as B64, Engine as _};
use hmac::{Hmac, Mac};
use p256::{
    ecdsa::{signature::Signer, Signature, SigningKey},
    pkcs8::DecodePrivateKey,
};
use serde_json::{json, Map, Value};
use sha2::{Digest, Sha256};
use std::{
    path::Path,
    sync::{Arc, Mutex},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

const UA: &str = "Pluff-OAuth/1.0";
const STATE_TTL_SECONDS: u64 = 600;
pub const PROVIDER_IDS: [&str; 8] = [
    "google",
    "github",
    "twitter",
    "apple",
    "microsoft",
    "facebook",
    "instagram",
    "discord",
];

// ── HTTP seam (tests replace it; production uses ureq) ───────────────────────

type HttpFn = dyn Fn(&str, &str, &[(String, String)], Option<&str>) -> (u16, String) + Send + Sync;
static HTTP_HOOK: Mutex<Option<Arc<HttpFn>>> = Mutex::new(None);

#[doc(hidden)]
pub fn set_http_hook(hook: Option<Arc<HttpFn>>) {
    *HTTP_HOOK.lock().unwrap() = hook;
}

fn http(
    method: &str,
    url: &str,
    headers: &[(String, String)],
    body: Option<&str>,
) -> Result<(u16, String), String> {
    let hook = HTTP_HOOK.lock().unwrap().clone();
    if let Some(hook) = hook {
        return Ok(hook(method, url, headers, body));
    }
    let agent = ureq::AgentBuilder::new()
        .timeout(Duration::from_secs(15))
        .build();
    let mut request = agent.request(method, url);
    for (name, value) in headers {
        request = request.set(name, value);
    }
    let result = match body {
        Some(body) => request.send_string(body),
        None => request.call(),
    };
    match result {
        Ok(response) => {
            let status = response.status();
            Ok((status, response.into_string().unwrap_or_default()))
        }
        Err(ureq::Error::Status(status, response)) => {
            Ok((status, response.into_string().unwrap_or_default()))
        }
        Err(error) => Err(format!(
            "Provider request failed at {}: {error}",
            url.split('/').nth(2).unwrap_or("?")
        )),
    }
}

fn header(name: &str, value: &str) -> (String, String) {
    (name.to_owned(), value.to_owned())
}

fn get_json(url: &str, extra: &[(String, String)]) -> Result<Value, String> {
    let mut headers = vec![
        header("Accept", "application/json"),
        header("User-Agent", UA),
    ];
    headers.extend_from_slice(extra);
    let (status, text) = http("GET", url, &headers, None)?;
    match serde_json::from_str::<Value>(&text) {
        Ok(value) if (200..300).contains(&status) => Ok(value),
        _ => Err(format!(
            "Provider request failed ({status}) at {}",
            url.split('/').nth(2).unwrap_or("?")
        )),
    }
}

// ── small helpers ────────────────────────────────────────────────────────────

fn env(key: &str) -> String {
    std::env::var(key).unwrap_or_default()
}

fn env_or(key: &str, default: &str) -> String {
    let value = env(key);
    if value.is_empty() {
        default.to_owned()
    } else {
        value
    }
}

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or_default()
}

fn random_bytes(len: usize) -> Result<Vec<u8>, String> {
    let mut bytes = vec![0_u8; len];
    getrandom::getrandom(&mut bytes).map_err(|error| format!("Random source failed: {error}"))?;
    Ok(bytes)
}

fn random_hex(len: usize) -> Result<String, String> {
    Ok(random_bytes(len)?
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect())
}

fn b64(data: impl AsRef<[u8]>) -> String {
    B64.encode(data)
}

fn state_key() -> Vec<u8> {
    for key in ["OAUTH_STATE_SECRET", "ARKZEN_ENGINE_SECRET"] {
        let value = env(key);
        if !value.is_empty() {
            return value.into_bytes();
        }
    }
    // No secret configured: a per-process key. Flows that straddle a restart simply fail and can be retried.
    static FALLBACK: std::sync::OnceLock<Vec<u8>> = std::sync::OnceLock::new();
    FALLBACK
        .get_or_init(|| random_bytes(32).unwrap_or_else(|_| b"arkzen-oauth".to_vec()))
        .clone()
}

fn hmac_b64(data: &str) -> String {
    let mut mac = <Hmac<Sha256> as Mac>::new_from_slice(&state_key()).expect("HMAC accepts any key length");
    mac.update(data.as_bytes());
    b64(mac.finalize().into_bytes())
}

fn safe_eq(a: &str, b: &str) -> bool {
    let (a, b) = (a.as_bytes(), b.as_bytes());
    a.len() == b.len() && a.iter().zip(b).fold(0_u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

fn pkce_verifier(nonce: &str) -> String {
    hmac_b64(&format!("pkce:{nonce}"))
}

fn sign_state(payload: &Value) -> String {
    let body = b64(serde_json::to_vec(payload).unwrap_or_default());
    format!("v1.{body}.{}", hmac_b64(&format!("state:{body}")))
}

fn read_state(token: &str) -> Option<Value> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 || parts[0] != "v1" || !safe_eq(parts[2], &hmac_b64(&format!("state:{}", parts[1]))) {
        return None;
    }
    let payload: Value = serde_json::from_slice(&B64.decode(parts[1]).ok()?).ok()?;
    (payload.get("e")?.as_u64()? > now_secs()).then_some(payload)
}

fn state_cookie_name(slug: &str) -> String {
    format!("arkzen-oauth-{slug}")
}

fn same_site(provider: &str) -> &'static str {
    // Apple answers with a cross-site POST, which only carries a SameSite=None cookie (and that requires Secure).
    if provider == "apple" {
        "None; Secure"
    } else {
        "Lax"
    }
}

fn state_cookie(slug: &str, nonce: &str, provider: &str) -> String {
    format!(
        "{}={nonce}; Path=/; HttpOnly; Max-Age={STATE_TTL_SECONDS}; SameSite={}",
        state_cookie_name(slug),
        same_site(provider)
    )
}

fn clear_state_cookie(slug: &str, provider: &str) -> String {
    format!(
        "{}=; Path=/; HttpOnly; Max-Age=0; SameSite={}",
        state_cookie_name(slug),
        same_site(provider)
    )
}

fn client_id(provider: &str) -> String {
    env(&format!("OAUTH_{}_CLIENT_ID", provider.to_uppercase()))
}

fn client_secret(provider: &str) -> String {
    env(&format!("OAUTH_{}_CLIENT_SECRET", provider.to_uppercase()))
}

fn is_configured(provider: &str) -> bool {
    if client_id(provider).is_empty() {
        return false;
    }
    if provider == "apple" {
        return !env("OAUTH_APPLE_TEAM_ID").is_empty()
            && !env("OAUTH_APPLE_KEY_ID").is_empty()
            && !env("OAUTH_APPLE_PRIVATE_KEY").is_empty();
    }
    !client_secret(provider).is_empty()
}

fn provider_name(provider: &str) -> &'static str {
    match provider {
        "google" => "Google",
        "github" => "GitHub",
        "twitter" => "X (Twitter)",
        "apple" => "Apple",
        "microsoft" => "Microsoft",
        "facebook" => "Facebook",
        "instagram" => "Instagram",
        "discord" => "Discord",
        _ => "Provider",
    }
}

fn redirect_base() -> String {
    env_or("OAUTH_REDIRECT_BASE", &env_or("APP_URL", "http://localhost:8000"))
        .trim_end_matches('/')
        .to_owned()
}

fn frontend_url() -> String {
    env_or("OAUTH_FRONTEND_URL", "http://localhost:3000")
        .trim_end_matches('/')
        .to_owned()
}

fn callback_url(slug: &str, provider: &str) -> String {
    format!("{}/api/{slug}/auth/oauth/{provider}/callback", redirect_base())
}

fn graph_version(provider: &str) -> String {
    env_or(&format!("OAUTH_{provider}_API_VERSION"), "v25.0")
}

fn form(pairs: &[(&str, &str)]) -> String {
    let mut serializer = form_urlencoded::Serializer::new(String::new());
    for (key, value) in pairs {
        serializer.append_pair(key, value);
    }
    serializer.finish()
}

fn urlencode(value: &str) -> String {
    form_urlencoded::byte_serialize(value.as_bytes()).collect()
}

/// Apple's client secret is a short-lived ES256 JWT signed with the team's .p8 key.
fn apple_client_secret() -> Result<String, String> {
    let (team, key_id) = (env("OAUTH_APPLE_TEAM_ID"), env("OAUTH_APPLE_KEY_ID"));
    let pem = env("OAUTH_APPLE_PRIVATE_KEY").replace("\\n", "\n");
    if team.is_empty() || key_id.is_empty() || pem.is_empty() {
        return Err("Apple needs OAUTH_APPLE_TEAM_ID, OAUTH_APPLE_KEY_ID and OAUTH_APPLE_PRIVATE_KEY".to_owned());
    }
    let now = now_secs();
    let head = b64(json!({"alg": "ES256", "kid": key_id, "typ": "JWT"}).to_string());
    let body = b64(
        json!({"iss": team, "iat": now, "exp": now + 300, "aud": "https://appleid.apple.com", "sub": client_id("apple")})
            .to_string(),
    );
    let key = SigningKey::from_pkcs8_pem(&pem)
        .map_err(|error| format!("OAUTH_APPLE_PRIVATE_KEY is not a valid PKCS#8 EC key: {error}"))?;
    let signature: Signature = key.sign(format!("{head}.{body}").as_bytes());
    Ok(format!("{head}.{body}.{}", b64(signature.to_bytes())))
}

// ── provider table ───────────────────────────────────────────────────────────

struct Def {
    authorize: String,
    token: String,
    scope: &'static str,
    pkce: bool,
    basic_auth: bool,
    extra: Vec<(&'static str, &'static str)>,
}

fn def(provider: &str) -> Option<Def> {
    let tenant = env_or("OAUTH_MICROSOFT_TENANT", "common");
    let fb = graph_version("FACEBOOK");
    let d = |authorize: &str, token: &str, scope, pkce, basic_auth, extra| Def {
        authorize: authorize.to_owned(),
        token: token.to_owned(),
        scope,
        pkce,
        basic_auth,
        extra,
    };
    Some(match provider {
        "google" => d(
            "https://accounts.google.com/o/oauth2/v2/auth",
            "https://oauth2.googleapis.com/token",
            "openid email profile",
            true,
            false,
            vec![("access_type", "online"), ("prompt", "select_account")],
        ),
        "github" => d(
            "https://github.com/login/oauth/authorize",
            "https://github.com/login/oauth/access_token",
            "read:user user:email",
            false,
            false,
            vec![],
        ),
        // X: authorization code + PKCE is mandatory; confidential clients authenticate with HTTP Basic.
        "twitter" => d(
            "https://x.com/i/oauth2/authorize",
            "https://api.x.com/2/oauth2/token",
            "users.read tweet.read users.email",
            true,
            true,
            vec![],
        ),
        // Apple: client_secret is a signed JWT, the callback is a form_post, the identity is in the id_token.
        "apple" => d(
            "https://appleid.apple.com/auth/authorize",
            "https://appleid.apple.com/auth/token",
            "name email",
            false,
            false,
            vec![("response_mode", "form_post")],
        ),
        "microsoft" => d(
            &format!("https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize"),
            &format!("https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"),
            "openid profile email User.Read",
            true,
            false,
            vec![("response_mode", "query"), ("prompt", "select_account")],
        ),
        "facebook" => d(
            &format!("https://www.facebook.com/{fb}/dialog/oauth"),
            &format!("https://graph.facebook.com/{fb}/oauth/access_token"),
            "email,public_profile",
            false,
            false,
            vec![],
        ),
        // Instagram API with Instagram Login (Basic Display API is gone). Professional accounts only; no email is shared.
        "instagram" => d(
            "https://www.instagram.com/oauth/authorize",
            "https://api.instagram.com/oauth/access_token",
            "instagram_business_basic",
            false,
            false,
            vec![],
        ),
        "discord" => d(
            "https://discord.com/oauth2/authorize",
            "https://discord.com/api/oauth2/token",
            "identify email",
            true,
            false,
            vec![("prompt", "consent")],
        ),
        _ => return None,
    })
}

fn authorize_url(slug: &str, provider: &str) -> Result<(String, String), String> {
    let d = def(provider).ok_or("Unknown OAuth provider")?;
    let nonce = b64(random_bytes(24)?);
    let state = sign_state(&json!({"n": nonce, "p": provider, "s": slug, "e": now_secs() + STATE_TTL_SECONDS}));
    let (id, redirect) = (client_id(provider), callback_url(slug, provider));
    let mut pairs: Vec<(String, String)> = vec![
        ("client_id".into(), id),
        ("redirect_uri".into(), redirect),
        ("response_type".into(), "code".into()),
        ("scope".into(), d.scope.into()),
        ("state".into(), state),
    ];
    pairs.extend(d.extra.iter().map(|(k, v)| (k.to_string(), v.to_string())));
    if d.pkce {
        pairs.push(("code_challenge".into(), b64(Sha256::digest(pkce_verifier(&nonce).as_bytes()))));
        pairs.push(("code_challenge_method".into(), "S256".into()));
    }
    if provider == "apple" {
        pairs.push(("nonce".into(), nonce.clone()));
    }
    let query: String = pairs
        .iter()
        .map(|(k, v)| format!("{}={}", urlencode(k), urlencode(v)))
        .collect::<Vec<_>>()
        .join("&");
    Ok((format!("{}?{query}", d.authorize), nonce))
}

fn exchange_code(slug: &str, provider: &str, code: &str, nonce: &str) -> Result<Value, String> {
    let d = def(provider).ok_or("Unknown OAuth provider")?;
    let secret = if provider == "apple" {
        apple_client_secret()?
    } else {
        client_secret(provider)
    };
    let redirect = callback_url(slug, provider);
    let id = client_id(provider);
    let mut headers = vec![
        header("Content-Type", "application/x-www-form-urlencoded"),
        header("Accept", "application/json"),
        header("User-Agent", UA),
    ];
    let mut pairs: Vec<(&str, &str)> = vec![
        ("grant_type", "authorization_code"),
        ("code", code),
        ("redirect_uri", &redirect),
    ];
    if d.basic_auth {
        headers.push(header("Authorization", &format!("Basic {}", base64::engine::general_purpose::STANDARD.encode(format!("{id}:{secret}")))));
        pairs.push(("client_id", &id));
    } else {
        pairs.push(("client_id", &id));
        pairs.push(("client_secret", &secret));
    }
    let verifier;
    if d.pkce {
        verifier = pkce_verifier(nonce);
        pairs.push(("code_verifier", &verifier));
    }
    let (status, text) = http("POST", &d.token, &headers, Some(&form(&pairs)))?;
    let mut data = serde_json::from_str::<Value>(&text).unwrap_or_else(|_| {
        // some providers answer form-encoded
        Value::Object(
            form_urlencoded::parse(text.as_bytes())
                .map(|(k, v)| (k.into_owned(), Value::String(v.into_owned())))
                .collect::<Map<_, _>>(),
        )
    });
    if let Some(first) = data.get("data").and_then(Value::as_array).and_then(|a| a.first()).cloned() {
        data = first; // Instagram variant
    }
    let has_token = data.get("access_token").and_then(Value::as_str).is_some_and(|v| !v.is_empty())
        || data.get("id_token").and_then(Value::as_str).is_some_and(|v| !v.is_empty());
    if !(200..300).contains(&status) || !has_token {
        return Err(format!("Token exchange failed ({status})"));
    }
    Ok(data)
}

// ── profiles ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq)]
pub struct Profile {
    pub id: String,
    pub email: Option<String>,
    pub email_verified: bool,
    pub name: Option<String>,
    pub avatar: Option<String>,
}

fn text(value: &Value, key: &str) -> Option<String> {
    match value.get(key) {
        Some(Value::String(s)) if !s.is_empty() => Some(s.clone()),
        Some(Value::Number(n)) => Some(n.to_string()),
        _ => None,
    }
}

fn truthy(value: Option<&Value>) -> bool {
    matches!(value, Some(Value::Bool(true))) || matches!(value, Some(Value::String(s)) if s == "true")
}

fn bearer(tokens: &Value) -> Vec<(String, String)> {
    vec![header("Authorization", &format!("Bearer {}", tokens["access_token"].as_str().unwrap_or_default()))]
}

fn profile(provider: &str, tokens: &Value, nonce: &str, apple_user: Option<&str>) -> Result<Profile, String> {
    let token = tokens["access_token"].as_str().unwrap_or_default();
    let missing = |what: &str| format!("{} returned no {what}", provider_name(provider));
    match provider {
        "google" => {
            let u = get_json("https://openidconnect.googleapis.com/v1/userinfo", &bearer(tokens))?;
            Ok(Profile {
                id: text(&u, "sub").ok_or_else(|| missing("user id"))?,
                email: text(&u, "email"),
                email_verified: truthy(u.get("email_verified")),
                name: text(&u, "name"),
                avatar: text(&u, "picture"),
            })
        }
        "github" => {
            let mut headers = bearer(tokens);
            headers.push(header("Accept", "application/vnd.github+json"));
            headers.push(header("X-GitHub-Api-Version", "2022-11-28"));
            let u = get_json("https://api.github.com/user", &headers)?;
            let (mut email, mut verified) = (text(&u, "email"), false);
            // user:email scope missing or denied: keep the public email, unverified.
            if let Ok(Value::Array(list)) = get_json("https://api.github.com/user/emails", &headers) {
                let pick = list
                    .iter()
                    .find(|e| truthy(e.get("primary")) && truthy(e.get("verified")))
                    .or_else(|| list.iter().find(|e| truthy(e.get("verified"))));
                if let Some(e) = pick {
                    email = text(e, "email");
                    verified = true;
                }
            }
            Ok(Profile {
                id: text(&u, "id").ok_or_else(|| missing("user id"))?,
                email,
                email_verified: verified,
                name: text(&u, "name").or_else(|| text(&u, "login")),
                avatar: text(&u, "avatar_url"),
            })
        }
        "twitter" => {
            let r = get_json(
                "https://api.x.com/2/users/me?user.fields=profile_image_url,confirmed_email",
                &bearer(tokens),
            )?;
            let u = r.get("data").cloned().unwrap_or(Value::Null);
            // X returns an email only when the app has the permission; it is never treated as verified.
            Ok(Profile {
                id: text(&u, "id").ok_or_else(|| missing("user id"))?,
                email: text(&u, "confirmed_email"),
                email_verified: false,
                name: text(&u, "name").or_else(|| text(&u, "username")),
                avatar: text(&u, "profile_image_url"),
            })
        }
        "apple" => {
            let jwt = tokens["id_token"].as_str().unwrap_or_default();
            let part = jwt.split('.').nth(1).ok_or("Malformed id_token")?;
            // Signature is not re-verified: the token came straight from Apple's token endpoint over TLS (OIDC Core 3.1.3.7).
            let claims: Value = serde_json::from_slice(&B64.decode(part).map_err(|_| "Malformed id_token")?)
                .map_err(|_| "Malformed id_token")?;
            if claims["iss"] != "https://appleid.apple.com" {
                return Err("Apple id_token has the wrong issuer".into());
            }
            if claims["aud"] != client_id("apple").as_str() {
                return Err("Apple id_token was issued for another client".into());
            }
            if claims["exp"].as_u64().is_none_or(|exp| exp < now_secs()) {
                return Err("Apple id_token has expired".into());
            }
            if claims["nonce"] != nonce {
                return Err("Apple id_token nonce mismatch".into());
            }
            // Apple sends the name once, on first authorization, as a JSON form field.
            let name = apple_user
                .and_then(|raw| serde_json::from_str::<Value>(raw).ok())
                .and_then(|u| {
                    let n = [text(&u["name"], "firstName"), text(&u["name"], "lastName")]
                        .into_iter()
                        .flatten()
                        .collect::<Vec<_>>()
                        .join(" ");
                    (!n.is_empty()).then_some(n)
                });
            Ok(Profile {
                id: text(&claims, "sub").ok_or_else(|| missing("user id"))?,
                email: text(&claims, "email"),
                email_verified: truthy(claims.get("email_verified")),
                name,
                avatar: None,
            })
        }
        "microsoft" => {
            let u = get_json("https://graph.microsoft.com/oidc/userinfo", &bearer(tokens))?;
            // Microsoft emails are not proven to belong to the user ("nOAuth"), so they are never auto-linked.
            Ok(Profile {
                id: text(&u, "sub").ok_or_else(|| missing("user id"))?,
                email: text(&u, "email"),
                email_verified: false,
                name: text(&u, "name"),
                avatar: None,
            })
        }
        "facebook" => {
            let v = graph_version("FACEBOOK");
            let u = get_json(
                &format!("https://graph.facebook.com/{v}/me?fields=id,name,email,picture.type(large)&access_token={}", urlencode(token)),
                &[],
            )?;
            Ok(Profile {
                id: text(&u, "id").ok_or_else(|| missing("user id"))?,
                email: text(&u, "email"),
                email_verified: false,
                name: text(&u, "name"),
                avatar: u["picture"]["data"]["url"].as_str().map(str::to_owned),
            })
        }
        "instagram" => {
            let v = graph_version("INSTAGRAM");
            let u = get_json(
                &format!("https://graph.instagram.com/{v}/me?fields=user_id,username,name,profile_picture_url&access_token={}", urlencode(token)),
                &[],
            )?;
            Ok(Profile {
                id: text(&u, "user_id").or_else(|| text(&u, "id")).ok_or_else(|| missing("user id"))?,
                email: None,
                email_verified: false,
                name: text(&u, "name").or_else(|| text(&u, "username")),
                avatar: text(&u, "profile_picture_url"),
            })
        }
        "discord" => {
            let u = get_json("https://discord.com/api/users/@me", &bearer(tokens))?;
            let id = text(&u, "id").ok_or_else(|| missing("user id"))?;
            let avatar = text(&u, "avatar").map(|hash| format!("https://cdn.discordapp.com/avatars/{id}/{hash}.png"));
            Ok(Profile {
                id,
                email: text(&u, "email"),
                email_verified: matches!(u.get("verified"), Some(Value::Bool(true))),
                name: text(&u, "global_name").or_else(|| text(&u, "username")),
                avatar,
            })
        }
        _ => Err("Unknown OAuth provider".into()),
    }
}

// ── users ────────────────────────────────────────────────────────────────────

/// Creates the identity table. Called from `auth::prepare_module` when `@arkzen:oauth` is declared.
pub fn ensure_tables(connection: &Connection) -> Result<(), String> {
    connection
        .execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS "oauth_accounts" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "user_id" INTEGER NOT NULL,
                "provider" TEXT NOT NULL,
                "provider_user_id" TEXT NOT NULL,
                "email" TEXT NULL,
                "avatar" TEXT NULL,
                "created_at" TEXT NULL,
                "updated_at" TEXT NULL,
                UNIQUE ("provider","provider_user_id")
            );
            CREATE INDEX IF NOT EXISTS "oauth_accounts_user_id_index" ON "oauth_accounts" ("user_id");
            "#,
        )
        .map_err(|error| format!("Could not create oauth_accounts: {error}"))
}

fn db_err(what: &'static str) -> impl Fn(crate::db::Error) -> String {
    move |e| format!("{what}: {e}")
}

/// Finds, links or creates the local user for a provider profile.
pub fn resolve_user(connection: &Connection, provider: &str, p: &Profile, link_verified_email: bool) -> Result<User, String> {
    let now = connection.now_iso().map_err(|e| format!("Unable to read current time: {e}"))?;
    let db = db_err;

    let linked: Option<(i64, i64)> = connection
        .query_row(
            r#"SELECT "id","user_id" FROM "oauth_accounts" WHERE "provider"=?1 AND "provider_user_id"=?2"#,
            params![provider, p.id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(db("Unable to look up OAuth account"))?;
    if let Some((account_id, user_id)) = linked {
        if let Some(user) = auth::get_user(connection, user_id)? {
            connection
                .execute(
                    r#"UPDATE "oauth_accounts" SET "email"=?1,"avatar"=?2,"updated_at"=?3 WHERE "id"=?4"#,
                    params![p.email, p.avatar, now, account_id],
                )
                .map_err(db("Unable to refresh OAuth account"))?;
            return Ok(user);
        }
        connection
            .execute(r#"DELETE FROM "oauth_accounts" WHERE "id"=?1"#, params![account_id])
            .map_err(db("Unable to drop orphaned OAuth account"))?; // orphaned link: re-create below
    }

    let email = p.email.as_ref().map(|e| e.to_lowercase());
    let find_by_email = |email: &str| -> Result<Option<i64>, String> {
        connection
            .query_row(r#"SELECT "id" FROM "users" WHERE lower("email")=?1"#, params![email], |row| row.get(0))
            .optional()
            .map_err(db("Unable to look up user by email"))
    };
    let mut user: Option<User> = None;

    if let (Some(email), true, true) = (&email, p.email_verified, link_verified_email) {
        if let Some(id) = find_by_email(email)? {
            // Pre-hijack defence: this account may have been registered by someone else with this email before its
            // owner ever signed in with the provider (the users table has no verified-email flag). Revoke every
            // session and replace the password so only the provider-verified owner can continue.
            connection
                .execute(r#"DELETE FROM "personal_access_tokens" WHERE "tokenable_id"=?1 AND "tokenable_type"='user'"#, params![id])
                .map_err(db("Unable to revoke sessions"))?;
            let password = auth::hash_password_public(&random_hex(32)?)?;
            connection
                .execute(r#"UPDATE "users" SET "password"=?1,"updated_at"=?2 WHERE "id"=?3"#, params![password, now, id])
                .map_err(db("Unable to rotate password"))?;
            user = auth::get_user(connection, id)?;
        }
    }

    let user = match user {
        Some(user) => user,
        None => {
            // Providers without a usable email (Instagram, X without permission) get a reserved, non-routable address.
            let mut own = email.clone();
            if let Some(candidate) = &own {
                if find_by_email(candidate)?.is_some() {
                    own = None; // taken and not linkable
                }
            }
            let own = own.unwrap_or_else(|| format!("{provider}-{}@oauth.invalid", p.id).to_lowercase());
            let name: String = p
                .name
                .clone()
                .unwrap_or_else(|| own.split('@').next().unwrap_or("user").to_owned())
                .chars()
                .take(255)
                .collect();
            let password = auth::hash_password_public(&random_hex(32)?)?;
            let verified_at = p.email_verified.then(|| now.clone());
            connection
                .execute(
                    r#"INSERT INTO "users" ("name","email","password","role","email_verified_at","created_at","updated_at")
                       VALUES (?1,?2,?3,'user',?4,?5,?5)"#,
                    params![name, own, password, verified_at, now],
                )
                .map_err(db("Unable to create user"))?;
            let id = connection.last_insert_rowid();
            auth::get_user(connection, id)?.ok_or("Created user could not be read back")?
        }
    };

    connection
        .execute(
            r#"INSERT INTO "oauth_accounts" ("user_id","provider","provider_user_id","email","avatar","created_at","updated_at")
               VALUES (?1,?2,?3,?4,?5,?6,?6)"#,
            params![user.id, provider, p.id, p.email, p.avatar, now],
        )
        .map_err(db("Unable to link OAuth account"))?;
    Ok(user)
}

// ── request handling ─────────────────────────────────────────────────────────

pub struct OAuthRequest<'a> {
    pub method: &'a str,
    pub query: &'a str,
    /// Raw `application/x-www-form-urlencoded` body (Apple's form_post callback).
    pub form: &'a str,
    pub cookie: Option<&'a str>,
}

pub struct OAuthReply {
    pub status: StatusCode,
    pub headers: Vec<(String, String)>,
    pub body: Option<Value>,
}

impl IntoResponse for OAuthReply {
    fn into_response(self) -> axum::response::Response {
        use axum::http::header::{HeaderName, HeaderValue};
        let mut response = match self.body {
            Some(body) => (self.status, axum::Json(body)).into_response(),
            None => self.status.into_response(),
        };
        for (name, value) in self.headers {
            if let (Ok(name), Ok(value)) = (HeaderName::from_bytes(name.as_bytes()), HeaderValue::from_str(&value)) {
                response.headers_mut().append(name, value);
            }
        }
        response
    }
}

/// `/api/<slug>/auth/oauth/<rest>` -> (`slug`, `rest`)
pub fn match_path(path: &str) -> Option<(&str, &str)> {
    let rest = path.strip_prefix("/api/")?;
    let (slug, tail) = rest.split_once("/auth/oauth/")?;
    (!slug.is_empty() && !slug.contains('/')).then_some((slug, tail))
}

pub fn module_config(module: &Value) -> Option<&Value> {
    if module.get("auth").and_then(Value::as_bool) != Some(true) {
        return None;
    }
    let cfg = module.get("oauth")?;
    cfg.get("providers")?.as_array().filter(|list| !list.is_empty())?;
    Some(cfg)
}

fn json_reply(status: StatusCode, body: Value) -> OAuthReply {
    OAuthReply { status, headers: vec![], body: Some(body) }
}

fn go(url: String, cookie: Option<String>) -> OAuthReply {
    let mut headers = vec![header("Location", &url), header("Cache-Control", "no-store")];
    if let Some(cookie) = cookie {
        headers.push(("Set-Cookie".to_owned(), cookie));
    }
    OAuthReply { status: StatusCode::FOUND, headers, body: None }
}

fn path_of(cfg: &Value, key: &str) -> String {
    match cfg.get(key).and_then(Value::as_str) {
        Some(p) if p.starts_with('/') && !p.starts_with("//") => p.to_owned(),
        _ => "/".to_owned(),
    }
}

fn fail(cfg: &Value, slug: &str, provider: &str, message: &str) -> OAuthReply {
    go(
        format!("{}{}#{}", frontend_url(), path_of(cfg, "errorRedirect"), form(&[("arkzen_oauth_error", message)])),
        Some(clear_state_cookie(slug, provider)),
    )
}

fn cookie_value(header: Option<&str>, name: &str) -> Option<String> {
    header?
        .split(';')
        .filter_map(|part| part.split_once('='))
        .find(|(key, _)| key.trim() == name)
        .map(|(_, value)| value.trim().to_owned())
}

pub fn handle(database_dir: &Path, slug: &str, cfg: &Value, rest: &str, request: &OAuthRequest<'_>) -> OAuthReply {
    let enabled: Vec<&str> = cfg["providers"].as_array().map(|a| a.iter().filter_map(Value::as_str).collect()).unwrap_or_default();
    let not_found = || json_reply(StatusCode::NOT_FOUND, json!({"message": "Unknown OAuth provider."}));
    let wrong_method = || json_reply(StatusCode::METHOD_NOT_ALLOWED, json!({"message": "Method not allowed"}));
    let is_get = request.method.eq_ignore_ascii_case("GET");

    if rest == "providers" {
        if !is_get {
            return wrong_method();
        }
        let list: Vec<Value> = enabled
            .iter()
            .map(|id| json!({"id": id, "name": provider_name(id), "enabled": is_configured(id)}))
            .collect();
        return json_reply(StatusCode::OK, json!({"providers": list}));
    }

    let Some((provider, action)) = rest.split_once('/') else {
        return not_found();
    };
    if !enabled.contains(&provider) || !PROVIDER_IDS.contains(&provider) {
        return not_found();
    }

    match action {
        "redirect" => {
            if !is_get {
                return wrong_method();
            }
            if !is_configured(provider) {
                return fail(cfg, slug, provider, &format!("{} sign-in is not configured on this server.", provider_name(provider)));
            }
            match authorize_url(slug, provider) {
                Ok((url, nonce)) => go(url, Some(state_cookie(slug, &nonce, provider))),
                Err(error) => {
                    tracing::error!("[oauth:{provider}] {error}");
                    fail(cfg, slug, provider, "Sign-in failed. Please try again.")
                }
            }
        }
        "callback" => {
            if !is_get && !request.method.eq_ignore_ascii_case("POST") {
                return wrong_method();
            }
            match callback(database_dir, slug, cfg, provider, request) {
                Ok(reply) => reply,
                Err(CallbackError::User(message)) => fail(cfg, slug, provider, &message),
                Err(CallbackError::Internal(error)) => {
                    tracing::error!("[oauth:{provider}] {error}");
                    fail(cfg, slug, provider, "Sign-in failed. Please try again.")
                }
            }
        }
        _ => not_found(),
    }
}

enum CallbackError {
    User(String),
    Internal(String),
}

impl From<String> for CallbackError {
    fn from(error: String) -> Self {
        CallbackError::Internal(error)
    }
}

fn callback(database_dir: &Path, slug: &str, cfg: &Value, provider: &str, request: &OAuthRequest<'_>) -> Result<OAuthReply, CallbackError> {
    let mut params: Vec<(String, String)> = form_urlencoded::parse(request.query.as_bytes()).into_owned().collect();
    if request.method.eq_ignore_ascii_case("POST") {
        params.extend(form_urlencoded::parse(request.form.as_bytes()).into_owned());
    }
    let param = |name: &str| params.iter().find(|(k, _)| k == name).map(|(_, v)| v.as_str());

    if param("error").is_some() {
        return Err(CallbackError::User(format!("{} sign-in was cancelled or denied.", provider_name(provider))));
    }
    let expired = || CallbackError::User("Sign-in session expired or was tampered with. Please try again.".to_owned());
    let state = read_state(param("state").unwrap_or_default()).ok_or_else(expired)?;
    let cookie_nonce = cookie_value(request.cookie, &state_cookie_name(slug)).ok_or_else(expired)?;
    let nonce = state["n"].as_str().unwrap_or_default();
    if state["p"] != provider || state["s"] != slug || cookie_nonce.is_empty() || !safe_eq(&cookie_nonce, nonce) {
        return Err(expired());
    }
    let code = param("code")
        .filter(|c| !c.is_empty())
        .ok_or_else(|| CallbackError::User("The provider did not return an authorization code.".to_owned()))?;

    let tokens = exchange_code(slug, provider, code, nonce)?;
    let profile = profile(provider, &tokens, nonce, param("user"))?;

    let link_verified = cfg.get("linkVerifiedEmail").and_then(Value::as_bool) != Some(false);
    let connection = crate::db::open_module(database_dir, slug)?;
    let user = resolve_user(&connection, provider, &profile, link_verified)?;
    let (_, issued) = auth::write_token(&connection, &user, StatusCode::OK)?;
    let token = issued["token"].as_str().unwrap_or_default().to_owned();

    Ok(go(
        format!(
            "{}{}#{}",
            frontend_url(),
            path_of(cfg, "redirect"),
            form(&[("arkzen_oauth_token", &token), ("arkzen_oauth_slug", slug)])
        ),
        Some(clear_state_cookie(slug, provider)),
    ))
}

// ── tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use p256::ecdsa::{signature::Verifier, VerifyingKey};
    use p256::pkcs8::EncodePrivateKey;
    use std::sync::Mutex as StdMutex;

    // Environment variables and the HTTP hook are process-wide: serialise every test that touches them.
    static LOCK: StdMutex<()> = StdMutex::new(());
    const SLUG: &str = "oauth-selftest";

    type Seen = Arc<Mutex<Vec<(String, String, Vec<(String, String)>, Option<String>)>>>;

    fn setup(pem: &str, routes: impl Fn(&str, &str) -> (u16, String) + Send + Sync + 'static) -> Seen {
        for (k, v) in [
            ("OAUTH_STATE_SECRET", "test-state-secret"),
            ("OAUTH_REDIRECT_BASE", "http://app.test"),
            ("OAUTH_FRONTEND_URL", "http://web.test"),
            ("OAUTH_GOOGLE_CLIENT_ID", "g-id"),
            ("OAUTH_GOOGLE_CLIENT_SECRET", "g-secret"),
            ("OAUTH_GITHUB_CLIENT_ID", "gh-id"),
            ("OAUTH_GITHUB_CLIENT_SECRET", "gh-secret"),
            ("OAUTH_TWITTER_CLIENT_ID", "x-id"),
            ("OAUTH_TWITTER_CLIENT_SECRET", "x-secret"),
            ("OAUTH_INSTAGRAM_CLIENT_ID", "ig-id"),
            ("OAUTH_INSTAGRAM_CLIENT_SECRET", "ig-secret"),
            ("OAUTH_APPLE_CLIENT_ID", "com.example.services"),
            ("OAUTH_APPLE_TEAM_ID", "TEAM123456"),
            ("OAUTH_APPLE_KEY_ID", "KEY1234567"),
        ] {
            std::env::set_var(k, v);
        }
        std::env::set_var("OAUTH_APPLE_PRIVATE_KEY", pem.replace('\n', "\\n"));
        std::env::remove_var("OAUTH_DISCORD_CLIENT_ID");
        let seen: Seen = Arc::new(Mutex::new(vec![]));
        let log = seen.clone();
        set_http_hook(Some(Arc::new(move |method, url, headers, body| {
            log.lock().unwrap().push((method.to_owned(), url.to_owned(), headers.to_vec(), body.map(str::to_owned)));
            routes(method, url)
        })));
        seen
    }

    fn payload() -> Value {
        json!({"name": SLUG, "auth": true, "oauth": {"providers": ["google","github","twitter","apple","microsoft","instagram"],
               "redirect": "/dashboard", "errorRedirect": "/login", "linkVerifiedEmail": true}})
    }

    fn fresh() -> tempfile::TempDir {
        let dir = tempfile::tempdir().unwrap();
        auth::prepare_module(dir.path(), SLUG, &payload()).unwrap();
        dir
    }

    fn call(dir: &Path, rest: &str, method: &str, query: &str, form_body: &str, cookie: Option<&str>) -> OAuthReply {
        handle(dir, SLUG, &payload()["oauth"], rest, &OAuthRequest { method, query, form: form_body, cookie })
    }

    fn loc(reply: &OAuthReply) -> String {
        reply.headers.iter().find(|(k, _)| k == "Location").unwrap().1.clone()
    }

    fn cookie(reply: &OAuthReply) -> String {
        reply.headers.iter().find(|(k, _)| k == "Set-Cookie").unwrap().1.split(';').next().unwrap().to_owned()
    }

    fn query_of(url: &str) -> Vec<(String, String)> {
        form_urlencoded::parse(url.split_once('?').unwrap().1.as_bytes()).into_owned().collect()
    }

    fn q(pairs: &[(String, String)], key: &str) -> String {
        pairs.iter().find(|(k, _)| k == key).unwrap().1.clone()
    }

    fn fragment(reply: &OAuthReply) -> Vec<(String, String)> {
        form_urlencoded::parse(loc(reply).split_once('#').unwrap().1.as_bytes()).into_owned().collect()
    }

    /// redirect -> callback, returning the final reply.
    fn sign_in(dir: &Path, provider: &str, post: bool, tamper: bool, drop_cookie: bool, extra: &str) -> (OAuthReply, String) {
        let start = call(dir, &format!("{provider}/redirect"), "GET", "", "", None);
        assert_eq!(start.status, StatusCode::FOUND, "{provider} redirect");
        let url = loc(&start);
        let mut state = q(&query_of(&url), "state");
        if tamper {
            state.truncate(state.len() - 2);
            state.push_str("AA");
        }
        let body = format!("code=the-code&state={}{extra}", urlencode(&state));
        let ck = cookie(&start);
        let ck = (!drop_cookie).then_some(ck.as_str());
        let reply = if post {
            call(dir, &format!("{provider}/callback"), "POST", "", &body, ck)
        } else {
            call(dir, &format!("{provider}/callback"), "GET", &body, "", ck)
        };
        (reply, url)
    }

    fn me(dir: &Path, token: &str) -> Option<Value> {
        let bearer = format!("Bearer {token}");
        match auth::handle_auth_route(dir, SLUG, "GET", &format!("/api/{SLUG}/auth/me"), &Value::Null, Some(&bearer)) {
            Some((StatusCode::OK, user)) => Some(user),
            _ => None,
        }
    }

    fn token_of(reply: &OAuthReply) -> String {
        q(&fragment(reply), "arkzen_oauth_token")
    }

    fn pem() -> (String, SigningKey) {
        let key = SigningKey::random(&mut p256::elliptic_curve::rand_core::OsRng);
        (key.to_pkcs8_pem(Default::default()).unwrap().to_string(), key)
    }

    fn google(profile: Value) -> impl Fn(&str, &str) -> (u16, String) + Send + Sync + 'static {
        move |_, url| {
            if url.starts_with("https://oauth2.googleapis.com/token") {
                (200, json!({"access_token": "at"}).to_string())
            } else if url.starts_with("https://openidconnect.googleapis.com") {
                (200, profile.to_string())
            } else {
                (404, "{}".into())
            }
        }
    }

    #[test]
    fn state_is_signed_expiring_and_tamper_proof() {
        let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
        std::env::set_var("OAUTH_STATE_SECRET", "test-state-secret");
        let good = sign_state(&json!({"n": "abc", "e": now_secs() + 60}));
        assert_eq!(read_state(&good).unwrap()["n"], "abc");
        let mut bad = good.clone();
        bad.truncate(bad.len() - 2);
        bad.push_str("AA");
        assert!(read_state(&bad).is_none());
        assert!(read_state(&sign_state(&json!({"n": "abc", "e": now_secs() - 1}))).is_none());
        assert!(read_state("nope").is_none());
        std::env::set_var("OAUTH_STATE_SECRET", "another-secret");
        assert!(read_state(&good).is_none(), "different secret rejects");
        std::env::set_var("OAUTH_STATE_SECRET", "test-state-secret");
    }

    #[test]
    fn paths_and_module_config() {
        assert_eq!(match_path("/api/demo/auth/oauth/google/redirect"), Some(("demo", "google/redirect")));
        assert_eq!(match_path("/api/demo/auth/oauth/providers"), Some(("demo", "providers")));
        assert_eq!(match_path("/api/demo/auth/login"), None);
        assert!(module_config(&json!({"auth": true, "oauth": {"providers": ["google"]}})).is_some());
        assert!(module_config(&json!({"auth": false, "oauth": {"providers": ["google"]}})).is_none());
        assert!(module_config(&json!({"auth": true, "oauth": {"providers": []}})).is_none());
    }

    #[test]
    fn lists_providers_and_builds_pkce_authorize_url() {
        let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let (pem, _) = pem();
        setup(&pem, |_, _| (404, "{}".into()));
        let dir = fresh();
        let body = call(dir.path(), "providers", "GET", "", "", None).body.unwrap();
        let on: Vec<(String, bool)> = body["providers"].as_array().unwrap().iter().map(|p| (p["id"].as_str().unwrap().to_owned(), p["enabled"].as_bool().unwrap())).collect();
        assert!(on.contains(&("google".into(), true)) && on.contains(&("microsoft".into(), false)) && on.contains(&("apple".into(), true)));

        let start = call(dir.path(), "google/redirect", "GET", "", "", None);
        let url = loc(&start);
        let pairs = query_of(&url);
        assert!(url.starts_with("https://accounts.google.com/o/oauth2/v2/auth?"));
        assert_eq!(q(&pairs, "client_id"), "g-id");
        assert_eq!(q(&pairs, "redirect_uri"), format!("http://app.test/api/{SLUG}/auth/oauth/google/callback"));
        assert_eq!(q(&pairs, "code_challenge_method"), "S256");
        let nonce = read_state(&q(&pairs, "state")).unwrap()["n"].as_str().unwrap().to_owned();
        assert_eq!(q(&pairs, "code_challenge"), b64(Sha256::digest(pkce_verifier(&nonce).as_bytes())));
        let set = start.headers.iter().find(|(k, _)| k == "Set-Cookie").unwrap().1.clone();
        assert!(set.contains(&format!("arkzen-oauth-{SLUG}=")) && set.contains("HttpOnly") && set.contains("SameSite=Lax"));

        assert_eq!(call(dir.path(), "myspace/redirect", "GET", "", "", None).status, StatusCode::NOT_FOUND);
        assert_eq!(call(dir.path(), "discord/redirect", "GET", "", "", None).status, StatusCode::NOT_FOUND, "not declared in the DSL");
        let unconfigured = call(dir.path(), "microsoft/redirect", "GET", "", "", None);
        assert!(loc(&unconfigured).starts_with("http://web.test/login#arkzen_oauth_error="));
        set_http_hook(None);
    }

    #[test]
    fn google_creates_then_reuses_account_and_rejects_bad_state() {
        let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let (pem, _) = pem();
        let seen = setup(&pem, google(json!({"sub": "g-1", "email": "Ada@Example.com", "email_verified": true, "name": "Ada", "picture": "http://p/1.png"})));
        let dir = fresh();

        let (reply, _) = sign_in(dir.path(), "google", false, false, false, "");
        assert!(loc(&reply).starts_with("http://web.test/dashboard#"));
        assert_eq!(q(&fragment(&reply), "arkzen_oauth_slug"), SLUG);
        let user = me(dir.path(), &token_of(&reply)).expect("token works");
        assert_eq!(user["email"], "ada@example.com");
        assert_eq!(user["name"], "Ada");
        assert!(user.get("password").is_none());

        let token_call = seen.lock().unwrap().iter().rev().find(|c| c.1 == "https://oauth2.googleapis.com/token").cloned().unwrap();
        let sent = form_urlencoded::parse(token_call.3.unwrap().as_bytes()).into_owned().collect::<Vec<_>>();
        assert!(!q(&sent, "code_verifier").is_empty());
        assert_eq!(q(&sent, "client_secret"), "g-secret");

        let (again, _) = sign_in(dir.path(), "google", false, false, false, "");
        assert_eq!(me(dir.path(), &token_of(&again)).unwrap()["id"], user["id"], "same account reused");

        for (label, (r, _)) in [
            ("tampered", sign_in(dir.path(), "google", false, true, false, "")),
            ("missing cookie", sign_in(dir.path(), "google", false, false, true, "")),
        ] {
            assert!(loc(&r).contains("arkzen_oauth_error"), "{label} must fail");
            assert!(!loc(&r).contains("arkzen_oauth_token"), "{label} must not mint a token");
        }
        let denied = call(dir.path(), "google/callback", "GET", "error=access_denied", "", None);
        assert!(loc(&denied).starts_with("http://web.test/login#arkzen_oauth_error="));

        // state minted for google cannot be replayed against github
        let start = call(dir.path(), "google/redirect", "GET", "", "", None);
        let state = q(&query_of(&loc(&start)), "state");
        let cross = call(dir.path(), "github/callback", "GET", &format!("code=c&state={}", urlencode(&state)), "", Some(&cookie(&start)));
        assert!(loc(&cross).contains("arkzen_oauth_error"));
        set_http_hook(None);
    }

    fn register(dir: &Path, email: &str) -> Value {
        let body = json!({"name": "Bob", "email": email, "password": "hunter2hunter2", "password_confirmation": "hunter2hunter2"});
        let (status, payload) = auth::handle_auth_route(dir, SLUG, "POST", &format!("/api/{SLUG}/auth/register"), &body, None).unwrap();
        assert_eq!(status, StatusCode::CREATED, "{payload}");
        payload
    }

    #[test]
    fn verified_email_links_and_revokes_unverified_never_links() {
        let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let (pem, _) = pem();
        setup(&pem, google(json!({"sub": "g-bob", "email": "bob@example.com", "email_verified": true, "name": "Bob G"})));
        let dir = fresh();
        let reg = register(dir.path(), "bob@example.com");
        let old_token = reg["token"].as_str().unwrap().to_owned();

        let (reply, _) = sign_in(dir.path(), "google", false, false, false, "");
        assert_eq!(me(dir.path(), &token_of(&reply)).unwrap()["id"], reg["user"]["id"], "linked, not duplicated");
        assert!(me(dir.path(), &old_token).is_none(), "old session revoked");
        let login = auth::handle_auth_route(dir.path(), SLUG, "POST", &format!("/api/{SLUG}/auth/login"), &json!({"email": "bob@example.com", "password": "hunter2hunter2"}), None).unwrap();
        assert_eq!(login.0, StatusCode::UNPROCESSABLE_ENTITY, "old password no longer works");

        // unverified GitHub email must not link to an existing password account
        register(dir.path(), "carol@example.com");
        setup(&pem, |_, url| match url {
            u if u.starts_with("https://github.com/login/oauth/access_token") => (200, json!({"access_token": "gh"}).to_string()),
            "https://api.github.com/user/emails" => (200, json!([{"email": "carol@example.com", "primary": true, "verified": false}]).to_string()),
            "https://api.github.com/user" => (200, json!({"id": 4242, "login": "carol-gh", "name": "Carol GH", "email": "carol@example.com"}).to_string()),
            _ => (404, "{}".into()),
        });
        let (gh, _) = sign_in(dir.path(), "github", false, false, false, "");
        assert_eq!(me(dir.path(), &token_of(&gh)).unwrap()["email"], "github-4242@oauth.invalid");
        set_http_hook(None);
    }

    #[test]
    fn x_uses_basic_auth_and_instagram_data_variant_has_no_email() {
        let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let (pem, _) = pem();
        let seen = setup(&pem, |_, url| match url {
            "https://api.x.com/2/oauth2/token" => (200, json!({"access_token": "x"}).to_string()),
            u if u.starts_with("https://api.x.com/2/users/me") => (200, json!({"data": {"id": "777", "name": "Xavier", "username": "xav"}}).to_string()),
            "https://api.instagram.com/oauth/access_token" => (200, json!({"data": [{"access_token": "ig", "user_id": 99}]}).to_string()),
            u if u.starts_with("https://graph.instagram.com/") => (200, json!({"user_id": "99", "username": "insta_user"}).to_string()),
            _ => (404, "{}".into()),
        });
        let dir = fresh();
        let (x, url) = sign_in(dir.path(), "twitter", false, false, false, "");
        assert!(url.starts_with("https://x.com/i/oauth2/authorize?") && q(&query_of(&url), "scope").contains("users.read"));
        let call_x = seen.lock().unwrap().iter().rev().find(|c| c.1 == "https://api.x.com/2/oauth2/token").cloned().unwrap();
        assert!(call_x.2.contains(&("Authorization".to_owned(), format!("Basic {}", base64::engine::general_purpose::STANDARD.encode("x-id:x-secret")))));
        let body = call_x.3.unwrap();
        assert!(body.contains("code_verifier=") && body.contains("client_id=x-id") && !body.contains("client_secret"));
        assert_eq!(me(dir.path(), &token_of(&x)).unwrap()["email"], "twitter-777@oauth.invalid");

        let (ig, _) = sign_in(dir.path(), "instagram", false, false, false, "");
        let user = me(dir.path(), &token_of(&ig)).unwrap();
        assert_eq!(user["email"], "instagram-99@oauth.invalid");
        assert_eq!(user["name"], "insta_user");
        assert!(seen.lock().unwrap().iter().any(|c| c.1.starts_with("https://graph.instagram.com/v25.0/me?")));
        set_http_hook(None);
    }

    #[test]
    fn apple_form_post_es256_secret_and_id_token_checks() {
        let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let (pem, key) = pem();
        let nonce = Arc::new(Mutex::new(String::new()));
        let n2 = nonce.clone();
        let id_token = move |n: &str, over: Value| {
            let mut claims = json!({"iss": "https://appleid.apple.com", "aud": "com.example.services", "exp": now_secs() + 600,
                "sub": "apple-001", "email": "tim@privaterelay.appleid.com", "email_verified": "true", "nonce": n});
            for (k, v) in over.as_object().cloned().unwrap_or_default() {
                claims[k] = v;
            }
            format!("{}.{}.sig", b64(r#"{"alg":"RS256"}"#), b64(claims.to_string()))
        };
        let tok = id_token.clone();
        let seen = setup(&pem, move |_, url| {
            if url.starts_with("https://appleid.apple.com/auth/token") {
                (200, json!({"id_token": tok(&n2.lock().unwrap(), json!({})), "access_token": "a"}).to_string())
            } else {
                (404, "{}".into())
            }
        });
        let dir = fresh();

        let start = call(dir.path(), "apple/redirect", "GET", "", "", None);
        let pairs = query_of(&loc(&start));
        assert_eq!(q(&pairs, "response_mode"), "form_post");
        assert!(pairs.iter().all(|(k, _)| k != "code_challenge"));
        assert!(start.headers.iter().any(|(k, v)| k == "Set-Cookie" && v.contains("SameSite=None; Secure")));
        *nonce.lock().unwrap() = q(&pairs, "nonce");

        let body = format!("code=c&state={}&user={}", urlencode(&q(&pairs, "state")), urlencode(r#"{"name":{"firstName":"Tim","lastName":"A"}}"#));
        let done = call(dir.path(), "apple/callback", "POST", "", &body, Some(&cookie(&start)));
        let user = me(dir.path(), &token_of(&done)).expect("apple login works");
        assert_eq!(user["name"], "Tim A");
        assert_eq!(user["email"], "tim@privaterelay.appleid.com");

        let sent = seen.lock().unwrap().iter().rev().find(|c| c.1 == "https://appleid.apple.com/auth/token").cloned().unwrap();
        let secret = q(&form_urlencoded::parse(sent.3.unwrap().as_bytes()).into_owned().collect::<Vec<_>>(), "client_secret");
        let parts: Vec<&str> = secret.split('.').collect();
        let claims: Value = serde_json::from_slice(&B64.decode(parts[1]).unwrap()).unwrap();
        assert_eq!((claims["iss"].as_str(), claims["sub"].as_str(), claims["aud"].as_str()), (Some("TEAM123456"), Some("com.example.services"), Some("https://appleid.apple.com")));
        assert_eq!(serde_json::from_slice::<Value>(&B64.decode(parts[0]).unwrap()).unwrap()["kid"], "KEY1234567");
        let raw = B64.decode(parts[2]).unwrap();
        assert_eq!(raw.len(), 64);
        VerifyingKey::from(&key)
            .verify(format!("{}.{}", parts[0], parts[1]).as_bytes(), &Signature::from_slice(&raw).unwrap())
            .expect("client secret signature verifies");

        // wrong nonce, audience, issuer and expiry are all refused
        for over in [json!({"nonce": "other"}), json!({"aud": "x"}), json!({"iss": "https://evil"}), json!({"exp": 1})] {
            let bad = id_token("N", over.clone());
            let result = profile("apple", &json!({"id_token": bad}), "N", None);
            if over.get("nonce").is_some() {
                assert!(profile("apple", &json!({"id_token": id_token("other", json!({}))}), "N", None).is_err());
            } else {
                assert!(result.is_err(), "{over} must be refused");
            }
        }
        set_http_hook(None);
    }
}
