"""Sanctum-style token auth + role middleware, per tatemono."""
from __future__ import annotations

import hashlib
import secrets

import bcrypt

from .database import connection
from .errors import AuthenticationException, HttpException
from .http import JsonResponse, Request
from .model import Model
from .support import prefixed_table, sql_now

__all__ = ["Hash", "user_model_for", "create_token", "auth_middleware", "optional_auth", "role_middleware",
           "resolve_user_from_request", "register_auth_routes"]


class _Hash:
    @staticmethod
    def make(plain: str) -> str:
        return bcrypt.hashpw(str(plain).encode()[:72], bcrypt.gensalt(10)).decode()

    @staticmethod
    def check(plain: str, hashed: str) -> bool:
        try:
            h = str(hashed)
            if h.startswith("$2y$"):
                h = "$2b$" + h[4:]
            return bcrypt.checkpw(str(plain).encode()[:72], h.encode())
        except (ValueError, TypeError):
            return False


Hash = _Hash()

_user_models: dict[str, type] = {}


def user_model_for(slug: str, fillable=None, hidden=None, casts=None) -> type:
    """The tatemono's user model: table `<prefix>_users`. Created at module load by generated code."""
    if slug in _user_models:
        return _user_models[slug]
    _fillable = fillable or ["name", "email", "password", "role"]
    _hidden = hidden or ["password", "remember_token"]
    _casts = casts or {}
    tokens_table = prefixed_table(slug, "personal_access_tokens")

    class _Tokens:
        def __init__(self, user): self.user = user
        async def delete(self):
            connection(slug).execute(f'DELETE FROM "{tokens_table}" WHERE "tokenable_id" = :i', {"i": self.user.id})

    class _Current:
        def __init__(self, tok): self.tok = tok
        async def delete(self):
            if self.tok:
                connection(slug).execute(f'DELETE FROM "{tokens_table}" WHERE "id" = :i', {"i": self.tok["id"]})

    class User(Model):
        table = prefixed_table(slug, "users")
        connection_name = slug
        fillable = _fillable
        hidden = _hidden
        casts = _casts

        def current_access_token(self): return _Current(getattr(self, "_token", None))
        def tokens(self): return _Tokens(self)
        async def create_token(self, name: str = "arkzen-token"):
            return {"plain_text_token": await create_token(slug, self.id, name)}

    _user_models[slug] = User
    return User


async def create_token(slug: str, user_id, name: str = "arkzen-token") -> str:
    plain = secrets.token_hex(20)
    digest = hashlib.sha256(plain.encode()).hexdigest()
    ts = sql_now()
    new_id = connection(slug).insert(prefixed_table(slug, "personal_access_tokens"), {
        "tokenable_type": "user", "tokenable_id": user_id, "name": name, "token": digest,
        "abilities": '["*"]', "created_at": ts, "updated_at": ts})
    return f"{new_id}|{plain}"


async def _resolve_user(slug: str, bearer: str | None):
    if not bearer:
        return None
    id_part, plain = bearer.split("|", 1) if "|" in bearer else (None, bearer)
    digest = hashlib.sha256(plain.encode()).hexdigest()
    q = connection(slug).table(prefixed_table(slug, "personal_access_tokens")).where("token", digest)
    if id_part:
        q = q.where("id", id_part)
    tok = await q.first()
    if not tok:
        return None
    if tok.get("expires_at"):
        import datetime as dt
        try:
            if dt.datetime.fromisoformat(str(tok["expires_at"]).replace(" ", "T")).replace(tzinfo=dt.timezone.utc) < dt.datetime.now(dt.timezone.utc):
                return None
        except ValueError:
            pass
    user = await user_model_for(slug).find(tok["tokenable_id"])
    if user:
        user._token = tok
    return user


def auth_middleware(slug: str):
    """auth:sanctum equivalent. Sets request.user()."""
    async def run(request: Request):
        user = await _resolve_user(slug, request.bearer_token())
        if not user:
            raise AuthenticationException()
        request.set_user(user)
    return run


def optional_auth(slug: str):
    """Resolves the user when a token is present but never rejects (optional auth)."""
    async def run(request: Request):
        try:
            request.set_user(await _resolve_user(slug, request.bearer_token()))
        except Exception:                                  # noqa: BLE001 - guest
            pass
    return run


def role_middleware(*roles: str):
    """role:admin,editor equivalent. Must run after auth_middleware."""
    async def run(request: Request):
        user = request.user()
        if not user:
            raise AuthenticationException()
        if user.role not in roles:
            raise HttpException(403, "Forbidden")
    return run


async def resolve_user_from_request(request: Request):
    return await _resolve_user(request.slug, request.bearer_token())


def register_auth_routes(r, slug: str, prefix: str) -> None:
    """register / login / logout / me / broadcasting auth, same bodies as the Laravel AuthController."""
    from .errors import ValidationException
    from .broadcast import sign_channel

    User = user_model_for(slug)
    auth = auth_middleware(slug)

    async def register(request: Request):
        v = await request.validate({"name": "required|string|max:255", "email": "required|email|unique:users,email",
                                    "password": "required|string|min:8|confirmed"})
        user = await User.create({"name": v["name"], "email": v["email"], "password": Hash.make(v["password"])})
        token = await create_token(slug, user.id)
        return JsonResponse({"user": user, "token": token}, 201)

    async def login(request: Request):
        v = await request.validate({"email": "required|email", "password": "required|string"})
        user = await User.where("email", v["email"]).first()
        if not user or not Hash.check(v["password"], user.password):
            raise ValidationException.with_messages({"email": ["The provided credentials are incorrect."]})
        await user.tokens().delete()
        token = await create_token(slug, user.id)
        return JsonResponse({"user": user, "token": token})

    async def logout(request: Request):
        await request.user().current_access_token().delete()
        return JsonResponse({"message": "Logged out successfully"})

    async def me(request: Request):
        return JsonResponse(request.user())

    async def broadcasting_auth(request: Request):
        user = request.user()
        socket_id, channel = request.input("socket_id"), request.input("channel_name")
        if not socket_id or not channel:
            return JsonResponse({"message": "Missing socket_id or channel_name."}, 422)
        if str(channel).startswith(f"presence-{slug}"):
            import json
            data = json.dumps({"user_id": user.id, "user_info": {"name": user.name or user.email}}, separators=(",", ":"))
            return JsonResponse({"auth": sign_channel(socket_id, channel, data), "channel_data": data})
        pfx = f"private-{slug}."
        if not str(channel).startswith(pfx):
            return JsonResponse({"message": "Invalid channel prefix."}, 403)
        try:
            same = int(str(channel)[len(pfx):]) == int(user.id)
        except ValueError:
            same = False
        if not same:
            return JsonResponse({"message": "Forbidden."}, 403)
        return JsonResponse({"auth": sign_channel(socket_id, channel)})

    r.add("POST", f"{prefix}/auth/register", [], register)
    r.add("POST", f"{prefix}/auth/login", [], login)
    r.add("POST", f"{prefix}/auth/logout", [auth], logout)
    r.add("GET", f"{prefix}/auth/me", [auth], me)
    r.add("POST", f"{prefix}/auth/broadcasting/auth", [auth], broadcasting_auth)
