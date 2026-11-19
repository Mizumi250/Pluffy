"""Social sign-in (OAuth 2.0 / OIDC) layered on top of the per-tatemono token auth.

Opt-in through the @arkzen:oauth DSL block; email + password keeps working untouched.
Providers: google, github, twitter (X), apple, microsoft, facebook, instagram, discord.
Secrets come from .env only (OAUTH_<PROVIDER>_CLIENT_ID / _CLIENT_SECRET), never from a tatemono.

Routes registered per tatemono (prefix /api/<slug>/auth/oauth):
  GET      /providers               which providers are configured
  GET      /{provider}/redirect     starts the flow (302 to the provider)
  GET|POST /{provider}/callback     provider returns here (Apple uses POST form_post)
"""
from __future__ import annotations

import asyncio
import base64
import hashlib
import hmac
import json
import os
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any, Awaitable, Callable

from .auth import Hash, create_token
from .database import connection, qi
from .http import JsonResponse, RawResponse, Request
from .support import Log, prefixed_table, sql_now

__all__ = ["register_oauth_routes", "PROVIDERS", "resolve_oauth_user", "OAuthProfile"]

UA = "Pluff-OAuth/1.0"
STATE_TTL_SECONDS = 600
OAUTH_ACCOUNTS = "oauth_accounts"


@dataclass
class OAuthProfile:
    id: str
    email: str | None = None
    email_verified: bool = False
    name: str | None = None
    avatar: str | None = None


# ── small helpers ────────────────────────────────────────────────────────────

def _env(key: str, default: str = "") -> str:
    return os.environ.get(key) or default


def _b64url(data: bytes | str) -> str:
    if isinstance(data, str):
        data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


_fallback_key = secrets.token_bytes(32)


def _state_key() -> bytes:
    configured = _env("OAUTH_STATE_SECRET") or _env("ARKZEN_ENGINE_SECRET")
    return configured.encode() if configured else _fallback_key      # per-process key: flows across a restart just retry


def _hmac(data: str) -> str:
    return _b64url(hmac.new(_state_key(), data.encode(), hashlib.sha256).digest())


def _safe_eq(a: str, b: str) -> bool:
    return hmac.compare_digest(str(a).encode(), str(b).encode())


def _pkce_verifier(nonce: str) -> str:
    return _hmac(f"pkce:{nonce}")


def _sign_state(payload: dict) -> str:
    body = _b64url(json.dumps(payload, separators=(",", ":")))
    return f"v1.{body}.{_hmac('state:' + body)}"


def _read_state(token: str) -> dict | None:
    parts = str(token or "").split(".")
    if len(parts) != 3 or parts[0] != "v1" or not _safe_eq(parts[2], _hmac(f"state:{parts[1]}")):
        return None
    try:
        p = json.loads(_b64url_decode(parts[1]))
    except (ValueError, TypeError):
        return None
    return p if isinstance(p, dict) and isinstance(p.get("e"), int) and p["e"] > int(time.time()) else None


def _cookies(header: str | None) -> dict[str, str]:
    out: dict[str, str] = {}
    for part in (header or "").split(";"):
        k, sep, v = part.partition("=")
        if sep and k.strip():
            out[k.strip()] = v.strip()
    return out


def _state_cookie_name(slug: str) -> str:
    return f"arkzen-oauth-{slug}"


def _state_cookie(slug: str, nonce: str, provider: str) -> str:
    # Apple answers with a cross-site POST, which only carries a SameSite=None cookie (and that requires Secure).
    same = "None; Secure" if provider == "apple" else "Lax"
    return f"{_state_cookie_name(slug)}={nonce}; Path=/; HttpOnly; Max-Age={STATE_TTL_SECONDS}; SameSite={same}"


def _clear_state_cookie(slug: str, provider: str) -> str:
    same = "None; Secure" if provider == "apple" else "Lax"
    return f"{_state_cookie_name(slug)}=; Path=/; HttpOnly; Max-Age=0; SameSite={same}"


def _client_id(p: str) -> str:
    return _env(f"OAUTH_{p.upper()}_CLIENT_ID")


def _client_secret(p: str) -> str:
    return _env(f"OAUTH_{p.upper()}_CLIENT_SECRET")


def _is_configured(p: str) -> bool:
    if not _client_id(p):
        return False
    if p == "apple":
        return bool(_env("OAUTH_APPLE_TEAM_ID") and _env("OAUTH_APPLE_KEY_ID") and _env("OAUTH_APPLE_PRIVATE_KEY"))
    return bool(_client_secret(p))


def _apple_client_secret() -> str:
    team, key_id = _env("OAUTH_APPLE_TEAM_ID"), _env("OAUTH_APPLE_KEY_ID")
    pem = _env("OAUTH_APPLE_PRIVATE_KEY").replace("\\n", "\n")
    if not (team and key_id and pem):
        raise RuntimeError("Apple needs OAUTH_APPLE_TEAM_ID, OAUTH_APPLE_KEY_ID and OAUTH_APPLE_PRIVATE_KEY")
    try:
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import ec
        from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
    except ImportError as e:          # only Apple needs it
        raise RuntimeError("Sign in with Apple needs the 'cryptography' package: pip install cryptography") from e
    now = int(time.time())
    head = _b64url(json.dumps({"alg": "ES256", "kid": key_id, "typ": "JWT"}, separators=(",", ":")))
    body = _b64url(json.dumps({"iss": team, "iat": now, "exp": now + 300, "aud": "https://appleid.apple.com",
                               "sub": _client_id("apple")}, separators=(",", ":")))
    key = serialization.load_pem_private_key(pem.encode(), password=None)
    r, s = decode_dss_signature(key.sign(f"{head}.{body}".encode(), ec.ECDSA(hashes.SHA256())))
    return f"{head}.{body}.{_b64url(r.to_bytes(32, 'big') + s.to_bytes(32, 'big'))}"


# ── HTTP (stdlib only, run off the event loop; tests replace _http) ──────────

def _http(method: str, url: str, headers: dict | None = None, data: bytes | None = None) -> tuple[int, str]:
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=15) as res:       # noqa: S310 - https provider URLs only
            return res.status, res.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


async def _get_json(url: str, headers: dict | None = None) -> Any:
    status, text = await asyncio.to_thread(_http, "GET", url, {"Accept": "application/json", "User-Agent": UA, **(headers or {})}, None)
    try:
        data = json.loads(text)
    except ValueError:
        data = None
    if not (200 <= status < 300) or data is None:
        raise RuntimeError(f"Provider request failed ({status}) at {urllib.parse.urlparse(url).netloc}")
    return data


def _bearer(t: dict) -> dict:
    return {"Authorization": f"Bearer {t['access_token']}"}


def _jwt_payload(jwt: str) -> dict:
    """Decodes a JWT payload WITHOUT verifying its signature. Only used on an id_token received directly
    from the provider's token endpoint over TLS (allowed by OIDC Core 3.1.3.7)."""
    parts = str(jwt).split(".")
    if len(parts) < 2:
        raise RuntimeError("Malformed id_token")
    return json.loads(_b64url_decode(parts[1]))


def _truthy(v) -> bool:
    return v is True or v == "true"


# ── providers ────────────────────────────────────────────────────────────────

def _graph_version(p: str) -> str:
    return _env(f"OAUTH_{p}_API_VERSION", "v25.0")


async def _p_google(t, c):
    u = await _get_json("https://openidconnect.googleapis.com/v1/userinfo", _bearer(t))
    return OAuthProfile(str(u["sub"]), u.get("email"), _truthy(u.get("email_verified")), u.get("name"), u.get("picture"))


async def _p_github(t, c):
    h = {**_bearer(t), "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    u = await _get_json("https://api.github.com/user", h)
    email, verified = u.get("email"), False
    try:
        lst = await _get_json("https://api.github.com/user/emails", h)
        pick = next((e for e in lst if e.get("primary") and e.get("verified")), None) or next((e for e in lst if e.get("verified")), None)
        if pick:
            email, verified = pick["email"], True
    except Exception:       # noqa: BLE001 - user:email scope missing or denied: keep the public email, unverified
        pass
    return OAuthProfile(str(u["id"]), email, verified, u.get("name") or u.get("login"), u.get("avatar_url"))


async def _p_twitter(t, c):
    r = await _get_json("https://api.x.com/2/users/me?user.fields=profile_image_url,confirmed_email", _bearer(t))
    u = r.get("data") or {}
    # X returns an email only when the app has the permission; we never treat it as verified.
    return OAuthProfile(str(u["id"]), u.get("confirmed_email"), False, u.get("name") or u.get("username"), u.get("profile_image_url"))


async def _p_apple(t, c):
    claims = _jwt_payload(t["id_token"])
    if claims.get("iss") != "https://appleid.apple.com":
        raise RuntimeError("Apple id_token has the wrong issuer")
    if claims.get("aud") != _client_id("apple"):
        raise RuntimeError("Apple id_token was issued for another client")
    if not claims.get("exp") or claims["exp"] < int(time.time()):
        raise RuntimeError("Apple id_token has expired")
    if claims.get("nonce") != c["nonce"]:
        raise RuntimeError("Apple id_token nonce mismatch")
    name = None
    try:    # Apple sends the name once, on first authorization, as a JSON form field.
        u = json.loads(c["apple_user"]) if c.get("apple_user") else None
        if u and u.get("name"):
            name = " ".join(x for x in (u["name"].get("firstName"), u["name"].get("lastName")) if x) or None
    except (ValueError, AttributeError):
        pass
    return OAuthProfile(str(claims["sub"]), claims.get("email"), _truthy(claims.get("email_verified")), name, None)


async def _p_microsoft(t, c):
    u = await _get_json("https://graph.microsoft.com/oidc/userinfo", _bearer(t))
    # Microsoft emails are not proven to belong to the user ("nOAuth"), so they are never auto-linked.
    return OAuthProfile(str(u["sub"]), u.get("email"), False, u.get("name"), None)


async def _p_facebook(t, c):
    v = _graph_version("FACEBOOK")
    u = await _get_json(f"https://graph.facebook.com/{v}/me?fields=id,name,email,picture.type(large)&access_token={urllib.parse.quote(t['access_token'])}")
    return OAuthProfile(str(u["id"]), u.get("email"), False, u.get("name"), ((u.get("picture") or {}).get("data") or {}).get("url"))


async def _p_instagram(t, c):
    v = _graph_version("INSTAGRAM")
    u = await _get_json(f"https://graph.instagram.com/{v}/me?fields=user_id,username,name,profile_picture_url&access_token={urllib.parse.quote(t['access_token'])}")
    return OAuthProfile(str(u.get("user_id") or u.get("id")), None, False, u.get("name") or u.get("username"), u.get("profile_picture_url"))


async def _p_discord(t, c):
    u = await _get_json("https://discord.com/api/users/@me", _bearer(t))
    avatar = f"https://cdn.discordapp.com/avatars/{u['id']}/{u['avatar']}.png" if u.get("avatar") else None
    return OAuthProfile(str(u["id"]), u.get("email"), u.get("verified") is True, u.get("global_name") or u.get("username"), avatar)


@dataclass
class ProviderDef:
    id: str
    name: str
    authorize_url: Callable[[], str]
    token_url: Callable[[], str]
    scope: str
    pkce: bool
    client_auth: str                       # 'body' | 'basic'
    profile: Callable[[dict, dict], Awaitable[OAuthProfile]]
    authorize_extra: dict | None = None


def _tenant() -> str:
    return _env("OAUTH_MICROSOFT_TENANT", "common")


PROVIDERS: dict[str, ProviderDef] = {
    "google": ProviderDef("google", "Google", lambda: "https://accounts.google.com/o/oauth2/v2/auth", lambda: "https://oauth2.googleapis.com/token",
                          "openid email profile", True, "body", _p_google, {"access_type": "online", "prompt": "select_account"}),
    "github": ProviderDef("github", "GitHub", lambda: "https://github.com/login/oauth/authorize", lambda: "https://github.com/login/oauth/access_token",
                          "read:user user:email", False, "body", _p_github),
    # X: authorization code + PKCE is mandatory; confidential clients authenticate with HTTP Basic.
    "twitter": ProviderDef("twitter", "X (Twitter)", lambda: "https://x.com/i/oauth2/authorize", lambda: "https://api.x.com/2/oauth2/token",
                           "users.read tweet.read users.email", True, "basic", _p_twitter),
    # Apple: client_secret is a signed JWT, the callback is a form_post, and the identity is in the id_token.
    "apple": ProviderDef("apple", "Apple", lambda: "https://appleid.apple.com/auth/authorize", lambda: "https://appleid.apple.com/auth/token",
                         "name email", False, "body", _p_apple, {"response_mode": "form_post"}),
    "microsoft": ProviderDef("microsoft", "Microsoft", lambda: f"https://login.microsoftonline.com/{_tenant()}/oauth2/v2.0/authorize",
                             lambda: f"https://login.microsoftonline.com/{_tenant()}/oauth2/v2.0/token",
                             "openid profile email User.Read", True, "body", _p_microsoft, {"response_mode": "query", "prompt": "select_account"}),
    "facebook": ProviderDef("facebook", "Facebook", lambda: f"https://www.facebook.com/{_graph_version('FACEBOOK')}/dialog/oauth",
                            lambda: f"https://graph.facebook.com/{_graph_version('FACEBOOK')}/oauth/access_token",
                            "email,public_profile", False, "body", _p_facebook),
    # Instagram API with Instagram Login (Basic Display API is gone). Professional accounts only, and no email is ever shared.
    "instagram": ProviderDef("instagram", "Instagram", lambda: "https://www.instagram.com/oauth/authorize", lambda: "https://api.instagram.com/oauth/access_token",
                             "instagram_business_basic", False, "body", _p_instagram),
    "discord": ProviderDef("discord", "Discord", lambda: "https://discord.com/oauth2/authorize", lambda: "https://discord.com/api/oauth2/token",
                           "identify email", True, "body", _p_discord, {"prompt": "consent"}),
}


# ── flow ─────────────────────────────────────────────────────────────────────

def _redirect_base() -> str:
    return (_env("OAUTH_REDIRECT_BASE") or _env("APP_URL", "http://localhost:8000")).rstrip("/")


def _frontend_url() -> str:
    return _env("OAUTH_FRONTEND_URL", "http://localhost:3000").rstrip("/")


def _callback_url(slug: str, provider: str) -> str:
    return f"{_redirect_base()}/api/{slug}/auth/oauth/{provider}/callback"


def _build_authorize_url(slug: str, provider: str) -> tuple[str, str]:
    d = PROVIDERS[provider]
    nonce = _b64url(secrets.token_bytes(24))
    state = _sign_state({"n": nonce, "p": provider, "s": slug, "e": int(time.time()) + STATE_TTL_SECONDS})
    q = {"client_id": _client_id(provider), "redirect_uri": _callback_url(slug, provider), "response_type": "code",
         "scope": d.scope, "state": state, **(d.authorize_extra or {})}
    if d.pkce:
        q["code_challenge"] = _b64url(hashlib.sha256(_pkce_verifier(nonce).encode()).digest())
        q["code_challenge_method"] = "S256"
    if provider == "apple":
        q["nonce"] = nonce
    return f"{d.authorize_url()}?{urllib.parse.urlencode(q)}", nonce


async def _exchange_code(slug: str, provider: str, code: str, nonce: str) -> dict:
    d = PROVIDERS[provider]
    form = {"grant_type": "authorization_code", "code": code, "redirect_uri": _callback_url(slug, provider)}
    headers = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json", "User-Agent": UA}
    secret = _apple_client_secret() if provider == "apple" else _client_secret(provider)
    if d.client_auth == "basic":
        headers["Authorization"] = "Basic " + base64.b64encode(f"{_client_id(provider)}:{secret}".encode()).decode()
    else:
        form["client_id"], form["client_secret"] = _client_id(provider), secret
    if d.pkce:
        form["code_verifier"] = _pkce_verifier(nonce)
        if d.client_auth == "basic":
            form["client_id"] = _client_id(provider)
    status, text = await asyncio.to_thread(_http, "POST", d.token_url(), headers, urllib.parse.urlencode(form).encode())
    try:
        data = json.loads(text)
    except ValueError:
        data = {k: v[-1] for k, v in urllib.parse.parse_qs(text).items()}      # some providers answer form-encoded
    if isinstance(data, dict) and isinstance(data.get("data"), list) and data["data"]:
        data = data["data"][0]                                                   # Instagram variant
    if not (200 <= status < 300) or not isinstance(data, dict) or not (data.get("access_token") or data.get("id_token")):
        raise RuntimeError(f"Token exchange failed ({status})")
    return data


async def resolve_oauth_user(slug: str, provider: str, p: OAuthProfile, link_verified_email: bool) -> dict:
    """Finds, links or creates the local user for a provider profile."""
    db = connection(slug)
    users, accounts = prefixed_table(slug, "users"), prefixed_table(slug, OAUTH_ACCOUNTS)
    tokens = prefixed_table(slug, "personal_access_tokens")
    ts = sql_now()

    def one(sql: str, params: dict) -> dict | None:
        rows = db.select(sql, params)
        return rows[0] if rows else None

    linked = one(f"SELECT * FROM {qi(accounts)} WHERE provider = :p AND provider_user_id = :i", {"p": provider, "i": p.id})
    if linked:
        user = one(f"SELECT * FROM {qi(users)} WHERE id = :i", {"i": linked["user_id"]})
        if user:
            db.execute(f"UPDATE {qi(accounts)} SET email = :e, avatar = :a, updated_at = :t WHERE id = :i",
                       {"e": p.email, "a": p.avatar, "t": ts, "i": linked["id"]})
            return user
        db.execute(f"DELETE FROM {qi(accounts)} WHERE id = :i", {"i": linked["id"]})     # orphaned link: re-create below

    random_password = lambda: Hash.make(secrets.token_hex(32))      # noqa: E731
    email = p.email.lower() if p.email else None
    user = None

    if email and p.email_verified and link_verified_email:
        user = one(f"SELECT * FROM {qi(users)} WHERE lower(email) = :e", {"e": email})
        if user:
            # Pre-hijack defence: this account may have been registered by someone else with this email before its
            # owner ever signed in with the provider (the users table has no verified-email flag). Revoke every
            # session and replace the password so only the provider-verified owner can continue.
            db.execute(f'DELETE FROM {qi(tokens)} WHERE "tokenable_id" = :i', {"i": user["id"]})
            db.execute(f"UPDATE {qi(users)} SET password = :p, updated_at = :t WHERE id = :i",
                       {"p": random_password(), "t": ts, "i": user["id"]})

    if not user:
        # Providers without a usable email (Instagram, X without permission) get a reserved, non-routable address.
        own = email
        if own and one(f"SELECT id FROM {qi(users)} WHERE lower(email) = :e", {"e": own}):
            own = None                                                   # taken and not linkable
        own = own or f"{provider}-{p.id}@oauth.invalid".lower()
        name = (p.name or own.split("@")[0])[:255]
        new_id = db.insert(users, {"name": name, "email": own, "password": random_password(), "role": "user",
                                   "email_verified_at": ts if p.email_verified else None, "created_at": ts, "updated_at": ts})
        user = one(f"SELECT * FROM {qi(users)} WHERE id = :i", {"i": new_id})

    db.insert(accounts, {"user_id": user["id"], "provider": provider, "provider_user_id": p.id, "email": p.email,
                         "avatar": p.avatar, "created_at": ts, "updated_at": ts})
    return user


# ── routes ───────────────────────────────────────────────────────────────────

def _hash(params: dict) -> str:
    return urllib.parse.urlencode(params)


def _go(url: str, cookie: str | None = None) -> RawResponse:
    headers = {"Location": url, "Cache-Control": "no-store"}
    if cookie:
        headers["Set-Cookie"] = cookie
    return RawResponse("", 302, headers)


def register_oauth_routes(r, slug: str, prefix: str, cfg: dict) -> None:
    base = f"{prefix}/auth/oauth"
    enabled = list(cfg.get("providers") or [])
    ok_redirect = cfg.get("redirect") or "/"
    err_redirect = cfg.get("errorRedirect") or "/"
    link_verified = cfg.get("linkVerifiedEmail", True) is not False

    def fail(provider: str, message: str) -> RawResponse:
        return _go(f"{_frontend_url()}{err_redirect}#{_hash({'arkzen_oauth_error': message})}", _clear_state_cookie(slug, provider))

    async def providers(request: Request):
        return JsonResponse({"providers": [{"id": i, "name": PROVIDERS[i].name, "enabled": _is_configured(i)} for i in enabled]})

    async def start(request: Request):
        provider = str(request.route("provider"))
        if provider not in enabled:
            return JsonResponse({"message": "Unknown OAuth provider."}, 404)
        if not _is_configured(provider):
            return fail(provider, f"{PROVIDERS[provider].name} sign-in is not configured on this server.")
        url, nonce = _build_authorize_url(slug, provider)
        return _go(url, _state_cookie(slug, nonce, provider))

    async def callback(request: Request):
        provider = str(request.route("provider"))
        if provider not in enabled:
            return JsonResponse({"message": "Unknown OAuth provider."}, 404)
        try:
            if request.input("error"):
                return fail(provider, f"{PROVIDERS[provider].name} sign-in was cancelled or denied.")
            st = _read_state(str(request.input("state") or ""))
            cookie_nonce = _cookies(request.header("cookie")).get(_state_cookie_name(slug))
            if not st or st.get("p") != provider or st.get("s") != slug or not cookie_nonce or not _safe_eq(cookie_nonce, str(st.get("n"))):
                return fail(provider, "Sign-in session expired or was tampered with. Please try again.")
            code = request.input("code")
            if not isinstance(code, str) or not code:
                return fail(provider, "The provider did not return an authorization code.")

            tokens = await _exchange_code(slug, provider, code, st["n"])
            apple_user = request.input("user")
            profile = await PROVIDERS[provider].profile(tokens, {"nonce": st["n"], "apple_user": apple_user if isinstance(apple_user, str) else None})
            if not profile.id or profile.id == "None":
                raise RuntimeError("Provider returned no user id")

            user = await resolve_oauth_user(slug, provider, profile, link_verified)
            token = await create_token(slug, user["id"])
            return _go(f"{_frontend_url()}{ok_redirect}#{_hash({'arkzen_oauth_token': token, 'arkzen_oauth_slug': slug})}",
                       _clear_state_cookie(slug, provider))
        except Exception as e:      # noqa: BLE001 - never leak provider or database detail to the browser
            Log.error(f"[oauth:{provider}] {e}")
            return fail(provider, "Sign-in failed. Please try again.")

    r.add("GET", f"{base}/providers", [], providers)
    r.add("GET", f"{base}/{{provider}}/redirect", [], start)
    r.add("GET", f"{base}/{{provider}}/callback", [], callback)
    r.add("POST", f"{base}/{{provider}}/callback", [], callback)
