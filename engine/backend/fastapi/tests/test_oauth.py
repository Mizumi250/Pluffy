"""End-to-end test for social sign-in. Runs the real generator, schema, routes and database;
only the provider HTTP calls are replaced by an in-process mock.

    cd engine/backend/fastapi && python -m pytest tests/test_oauth.py -q
"""
import asyncio
import base64
import json
import os
import time
import urllib.parse

import pytest
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature

SLUG = "oauth-selftest"
_key = ec.generate_private_key(ec.SECP256R1())
_pem = _key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()).decode()

os.environ.update({
    "ARKZEN_DB_DRIVER": "sqlite", "OAUTH_STATE_SECRET": "test-state-secret",
    "OAUTH_REDIRECT_BASE": "http://app.test", "OAUTH_FRONTEND_URL": "http://web.test",
    "OAUTH_GOOGLE_CLIENT_ID": "g-id", "OAUTH_GOOGLE_CLIENT_SECRET": "g-secret",
    "OAUTH_GITHUB_CLIENT_ID": "gh-id", "OAUTH_GITHUB_CLIENT_SECRET": "gh-secret",
    "OAUTH_TWITTER_CLIENT_ID": "x-id", "OAUTH_TWITTER_CLIENT_SECRET": "x-secret",
    "OAUTH_INSTAGRAM_CLIENT_ID": "ig-id", "OAUTH_INSTAGRAM_CLIENT_SECRET": "ig-secret",
    "OAUTH_APPLE_CLIENT_ID": "com.example.services", "OAUTH_APPLE_TEAM_ID": "TEAM123456", "OAUTH_APPLE_KEY_ID": "KEY1234567",
    "OAUTH_APPLE_PRIVATE_KEY": _pem.replace("\n", "\\n"),
})

from fastapi.testclient import TestClient          # noqa: E402

from pluff.engine.build import build_tatemono, remove_tatemono   # noqa: E402
from pluff.runtime import oauth as oauth_mod                      # noqa: E402
from pluff.runtime.database import drop_database                  # noqa: E402
from pluff.server import app                                      # noqa: E402

seen: list[tuple[str, str, dict, bytes | None]] = []
mock = lambda method, url, headers, data: (404, "{}")            # noqa: E731


def fake_http(method, url, headers=None, data=None):
    seen.append((method, url, headers or {}, data))
    return mock(method, urllib.parse.urlparse(url), headers or {}, data)


@pytest.fixture(scope="module")
def client():
    oauth_mod._http = fake_http
    status, body = asyncio.run(build_tatemono({
        "name": SLUG, "version": "1.0.0", "auth": True, "databases": [], "apis": [],
        "oauth": {"providers": ["google", "github", "twitter", "apple", "microsoft", "instagram"],
                  "redirect": "/dashboard", "errorRedirect": "/login", "linkVerifiedEmail": True},
    }))
    assert status == 200, body
    with TestClient(app, base_url="http://testserver", follow_redirects=False) as c:
        yield c
    asyncio.run(remove_tatemono({"name": SLUG}))
    drop_database(SLUG)


A = f"/api/{SLUG}/auth"


def get(client, path, **kw):
    client.cookies.clear()
    return client.get(f"{A}{path}", **kw)


def sign_in(client, provider, method="GET", tamper=False, drop_cookie=False, extra=None):
    start = get(client, f"/oauth/{provider}/redirect")
    assert start.status_code == 302
    loc = urllib.parse.urlparse(start.headers["location"])
    q = dict(urllib.parse.parse_qsl(loc.query))
    cookie = start.headers["set-cookie"].split(";")[0]
    state = q["state"]
    if tamper:
        state = state[:-2] + ("BB" if state.endswith("AA") else "AA")
    params = {"code": "the-code", "state": state, **(extra or {})}
    headers = {} if drop_cookie else {"cookie": cookie}
    client.cookies.clear()
    if method == "POST":
        res = client.post(f"{A}/oauth/{provider}/callback", data=params, headers=headers)
    else:
        res = client.get(f"{A}/oauth/{provider}/callback", params=params, headers=headers)
    where = urllib.parse.urlparse(res.headers["location"])
    return res, loc, q, where, dict(urllib.parse.parse_qsl(where.fragment))


def me(client, token):
    client.cookies.clear()
    return client.get(f"{A}/me", headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})


def google_mock(profile):
    def m(method, url, headers, data):
        if url.netloc == "oauth2.googleapis.com":
            return 200, json.dumps({"access_token": "at"})
        if url.netloc == "openidconnect.googleapis.com":
            return 200, json.dumps(profile)
        return 404, "{}"
    return m


def register(client, name, email, password="hunter2hunter2"):
    client.cookies.clear()
    return client.post(f"{A}/register", json={"name": name, "email": email, "password": password, "password_confirmation": password})


def test_lists_configured_providers_only_as_enabled(client):
    body = get(client, "/oauth/providers").json()
    assert {p["id"]: p["enabled"] for p in body["providers"]} == {
        "google": True, "github": True, "twitter": True, "apple": True, "microsoft": False, "instagram": True}


def test_redirect_builds_pkce_state_url_and_binds_cookie(client):
    r = get(client, "/oauth/google/redirect")
    loc = urllib.parse.urlparse(r.headers["location"])
    q = dict(urllib.parse.parse_qsl(loc.query))
    assert f"{loc.scheme}://{loc.netloc}{loc.path}" == "https://accounts.google.com/o/oauth2/v2/auth"
    assert q["client_id"] == "g-id" and q["redirect_uri"] == f"http://app.test/api/{SLUG}/auth/oauth/google/callback"
    assert q["code_challenge_method"] == "S256"
    assert f"arkzen-oauth-{SLUG}=" in r.headers["set-cookie"] and "HttpOnly" in r.headers["set-cookie"]


def test_unknown_or_undeclared_provider_404_and_unconfigured_returns_error(client):
    assert get(client, "/oauth/myspace/redirect").status_code == 404
    assert get(client, "/oauth/discord/redirect").status_code == 404        # not declared in the DSL
    r = get(client, "/oauth/microsoft/redirect")                              # declared, no credentials
    assert r.status_code == 302 and r.headers["location"].startswith("http://web.test/login#arkzen_oauth_error=")


def test_google_creates_user_then_reuses_account(client):
    global mock
    mock = google_mock({"sub": "g-1", "email": "Ada@Example.com", "email_verified": True, "name": "Ada", "picture": "http://p/1.png"})
    _, _, _, where, h = sign_in(client, "google")
    assert f"{where.scheme}://{where.netloc}{where.path}" == "http://web.test/dashboard" and h["arkzen_oauth_slug"] == SLUG
    u = me(client, h["arkzen_oauth_token"]).json()
    assert u["email"] == "ada@example.com" and u["name"] == "Ada" and "password" not in u
    form = dict(urllib.parse.parse_qsl(next(d for m, url, hd, d in reversed(seen) if url == "https://oauth2.googleapis.com/token").decode()))
    assert form["code_verifier"] and form["client_secret"] == "g-secret"
    _, _, _, _, h2 = sign_in(client, "google")
    assert me(client, h2["arkzen_oauth_token"]).json()["id"] == u["id"]


def test_state_rejected_when_tampered_missing_cookie_or_cross_provider(client):
    global mock
    mock = google_mock({"sub": "g-2", "email": "x@example.com", "email_verified": True})
    assert "arkzen_oauth_error" in sign_in(client, "google", tamper=True)[4]
    assert "arkzen_oauth_error" in sign_in(client, "google", drop_cookie=True)[4]
    start = get(client, "/oauth/google/redirect")
    state = dict(urllib.parse.parse_qsl(urllib.parse.urlparse(start.headers["location"]).query))["state"]
    client.cookies.clear()
    cross = client.get(f"{A}/oauth/github/callback", params={"code": "c", "state": state}, headers={"cookie": start.headers["set-cookie"].split(";")[0]})
    assert "arkzen_oauth_error" in cross.headers["location"]


def test_provider_error_returns_to_frontend(client):
    r = get(client, "/oauth/google/callback", params={"error": "access_denied"})
    assert r.headers["location"].startswith("http://web.test/login#arkzen_oauth_error=")


def test_verified_email_links_existing_account_and_revokes_sessions_and_password(client):
    global mock
    reg = register(client, "Bob", "bob@example.com").json()
    mock = google_mock({"sub": "g-bob", "email": "bob@example.com", "email_verified": True, "name": "Bob G"})
    _, _, _, _, h = sign_in(client, "google")
    assert me(client, h["arkzen_oauth_token"]).json()["id"] == reg["user"]["id"], "linked, not duplicated"
    assert me(client, reg["token"]).status_code == 401, "old session revoked"
    client.cookies.clear()
    bad = client.post(f"{A}/login", json={"email": "bob@example.com", "password": "hunter2hunter2"})
    assert bad.status_code == 422, "old password no longer works"


def test_unverified_email_is_never_linked(client):
    global mock
    register(client, "Carol", "carol@example.com")

    def m(method, url, headers, data):
        if url.netloc == "github.com":
            return 200, json.dumps({"access_token": "gh-at"})
        if url.path == "/user/emails":
            return 200, json.dumps([{"email": "carol@example.com", "primary": True, "verified": False}])
        if url.path == "/user":
            return 200, json.dumps({"id": 4242, "login": "carol-gh", "name": "Carol GH", "email": "carol@example.com"})
        return 404, "{}"
    mock = m
    _, _, _, _, h = sign_in(client, "github")
    assert me(client, h["arkzen_oauth_token"]).json()["email"] == "github-4242@oauth.invalid"
    hdrs = next(hd for mth, url, hd, d in reversed(seen) if url.startswith("https://github.com/login/oauth/access_token"))
    assert hdrs["Accept"] == "application/json"


def test_x_uses_basic_auth_and_pkce_and_has_no_email(client):
    global mock

    def m(method, url, headers, data):
        if url.netloc == "api.x.com" and url.path == "/2/oauth2/token":
            return 200, json.dumps({"access_token": "x-at"})
        if url.path == "/2/users/me":
            return 200, json.dumps({"data": {"id": "777", "name": "Xavier", "username": "xav"}})
        return 404, "{}"
    mock = m
    _, loc, q, _, h = sign_in(client, "twitter")
    assert f"{loc.scheme}://{loc.netloc}{loc.path}" == "https://x.com/i/oauth2/authorize" and "users.read" in q["scope"]
    hd = next(hd for mth, url, hd, d in reversed(seen) if url == "https://api.x.com/2/oauth2/token")
    assert hd["Authorization"] == "Basic " + base64.b64encode(b"x-id:x-secret").decode()
    assert me(client, h["arkzen_oauth_token"]).json()["email"] == "twitter-777@oauth.invalid"


def test_instagram_data_array_token_variant_and_no_email(client):
    global mock

    def m(method, url, headers, data):
        if url.netloc == "api.instagram.com":
            return 200, json.dumps({"data": [{"access_token": "ig-at", "user_id": 99}]})
        if url.netloc == "graph.instagram.com":
            return 200, json.dumps({"user_id": "99", "username": "insta_user"})
        return 404, "{}"
    mock = m
    _, _, _, _, h = sign_in(client, "instagram")
    u = me(client, h["arkzen_oauth_token"]).json()
    assert u["email"] == "instagram-99@oauth.invalid" and u["name"] == "insta_user"
    assert "/v25.0/me?" in next(url for mth, url, hd, d in reversed(seen) if url.startswith("https://graph.instagram.com"))


def _b64(o):
    return base64.urlsafe_b64encode(json.dumps(o).encode()).rstrip(b"=").decode()


def test_apple_form_post_es256_client_secret_and_id_token_checks(client):
    global mock
    nonce = {"v": ""}

    def id_token(n, **over):
        claims = {"iss": "https://appleid.apple.com", "aud": "com.example.services", "exp": int(time.time()) + 600,
                  "sub": "apple-001", "email": "tim@privaterelay.appleid.com", "email_verified": "true", "nonce": n, **over}
        return f"{_b64({'alg': 'RS256'})}.{_b64(claims)}.sig"

    mock = lambda method, url, headers, data: (200, json.dumps({"id_token": id_token(nonce["v"]), "access_token": "a"})) if url.netloc == "appleid.apple.com" else (404, "{}")   # noqa: E731
    start = get(client, "/oauth/apple/redirect")
    q = dict(urllib.parse.parse_qsl(urllib.parse.urlparse(start.headers["location"]).query))
    assert q["response_mode"] == "form_post" and "SameSite=None; Secure" in start.headers["set-cookie"]
    nonce["v"] = q["nonce"]
    client.cookies.clear()
    post = client.post(f"{A}/oauth/apple/callback", headers={"cookie": start.headers["set-cookie"].split(";")[0]},
                       data={"code": "c", "state": q["state"], "user": json.dumps({"name": {"firstName": "Tim", "lastName": "A"}})})
    h = dict(urllib.parse.parse_qsl(urllib.parse.urlparse(post.headers["location"]).fragment))
    u = me(client, h["arkzen_oauth_token"]).json()
    assert u["name"] == "Tim A" and u["email"] == "tim@privaterelay.appleid.com"

    body = dict(urllib.parse.parse_qsl(next(d for m_, url, hd, d in reversed(seen) if url == "https://appleid.apple.com/auth/token").decode()))
    head, claims_b, sig = body["client_secret"].split(".")
    pad = lambda s: s + "=" * (-len(s) % 4)       # noqa: E731
    claims = json.loads(base64.urlsafe_b64decode(pad(claims_b)))
    assert claims["iss"] == "TEAM123456" and claims["sub"] == "com.example.services" and claims["aud"] == "https://appleid.apple.com"
    assert json.loads(base64.urlsafe_b64decode(pad(head)))["kid"] == "KEY1234567"
    raw = base64.urlsafe_b64decode(pad(sig))
    der = encode_dss_signature(int.from_bytes(raw[:32], "big"), int.from_bytes(raw[32:], "big"))
    _key.public_key().verify(der, f"{head}.{claims_b}".encode(), ec.ECDSA(hashes.SHA256()))   # raises if invalid

    mock = lambda method, url, headers, data: (200, json.dumps({"id_token": id_token("someone-elses-nonce")})) if url.netloc == "appleid.apple.com" else (404, "{}")   # noqa: E731
    assert "arkzen_oauth_error" in sign_in(client, "apple", method="POST")[4]
