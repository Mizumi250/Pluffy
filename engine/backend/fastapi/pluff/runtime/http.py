"""Request / response layer: Laravel-shaped request helpers, a tiny router and JSON error rendering."""
from __future__ import annotations

import datetime as _dt
import inspect
import json
import re
from decimal import Decimal
from urllib.parse import parse_qs

from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse

from .database import connection
from .errors import (AuthenticationException, AuthorizationException, HttpException,
                     ModelNotFoundException, ValidationException)
from .support import Log, to_iso_micro
from .validation import validate

__all__ = ["JsonResponse", "RawResponse", "response", "Request", "Router", "handle", "middleware", "render_error", "to_starlette"]


class JsonResponse:
    def __init__(self, body, status: int = 200, headers: dict | None = None):
        self.body, self.status, self.headers = body, status, headers or {}


class RawResponse:
    def __init__(self, body, status: int = 200, headers: dict | None = None):
        self.body, self.status, self.headers = body, status, headers or {}


class _ResponseFactory:
    """`response.json(...)`, same shape as Laravel's response()->json(...)"""

    @staticmethod
    def json(data, status: int = 200, headers: dict | None = None):
        return JsonResponse(data, status, headers)

    @staticmethod
    def no_content(status: int = 204):
        return RawResponse("", status)

    @staticmethod
    def make(body, status: int = 200, headers: dict | None = None):
        return RawResponse(body, status, headers)


response = _ResponseFactory()
ResponseFactory = _ResponseFactory


def _enc(o):
    if hasattr(o, "to_json"):
        return o.to_json()
    if isinstance(o, Decimal):
        return float(o) if o % 1 else int(o)
    if isinstance(o, (_dt.datetime, _dt.date)):
        return to_iso_micro(o)
    if isinstance(o, (set, tuple)):
        return list(o)
    if isinstance(o, bytes):
        return o.decode("utf-8", "replace")
    raise TypeError(f"Object of type {type(o).__name__} is not JSON serializable")


def dumps(data) -> str:
    return json.dumps(data, default=_enc, ensure_ascii=False, separators=(",", ":"))


class Request:
    """Laravel-style request. Unknown attributes read the input (request.title == request.input('title'))."""

    def __init__(self, raw: StarletteRequest, slug: str = "", body=None, params: dict | None = None,
                 files: dict | None = None):
        self.raw = raw
        self.slug = slug
        self._body = body if isinstance(body, dict) else {}
        self._params = params or {}
        self._files = files or {}
        self._user = None
        self._query = {k: (v[-1] if v else None) for k, v in parse_qs(raw.url.query, keep_blank_values=True).items()}

    def __getattr__(self, name: str):
        if name.startswith("_"):
            raise AttributeError(name)
        return self.input(name)

    # ── input ──
    def all(self) -> dict:
        return {**self._query, **self._body, **self._params}

    def input(self, key: str | None = None, default=None):
        if not key:
            return self.all()
        v = self.all().get(key, _NO)
        return default if v is _NO else v

    get = input

    def query(self, key: str | None = None, default=None):
        return self._query.get(key, default) if key else self._query

    def has(self, key) -> bool:
        a = self.all()
        return all(k in a for k in (key if isinstance(key, (list, tuple)) else [key]))

    def filled(self, key: str) -> bool:
        v = self.all().get(key)
        return not (v is None or v == "")

    def boolean(self, key: str) -> bool:
        return self.all().get(key) in ("1", "true", "on", "yes", 1, True)

    def only(self, *keys) -> dict:
        a = self.all()
        flat = [k for ks in keys for k in (ks if isinstance(ks, (list, tuple)) else [ks])]
        return {k: a[k] for k in flat if k in a}

    def except_(self, *keys) -> dict:
        a = self.all()
        for ks in keys:
            for k in (ks if isinstance(ks, (list, tuple)) else [ks]):
                a.pop(k, None)
        return a

    def files(self, key: str | None = None):
        if key is None:
            return self._files
        return self._files.get(key, [])

    def file(self, key: str):
        value = self._files.get(key, [])
        return value[0] if value else None

    def merge(self, obj: dict):
        self._body.update(obj)
        return self

    def route(self, name: str | None = None):
        p = self._params
        if not name:
            return p
        if name in p:
            return p[name]
        return p.get("id", next(iter(p.values()), None))

    # ── headers / url ──
    def header(self, name: str, default=None):
        return self.raw.headers.get(name, default)

    def bearer_token(self) -> str | None:
        h = self.raw.headers.get("authorization", "")
        return h[7:].strip() if h.lower().startswith("bearer ") else None

    def is_json(self) -> bool:
        return "json" in self.raw.headers.get("content-type", "")

    def wants_json(self) -> bool:
        return True

    def method(self) -> str:
        return self.raw.method

    def ip(self):
        return self.raw.client.host if self.raw.client else None

    def path(self) -> str:
        return self.raw.url.path.lstrip("/")

    def url(self) -> str:
        host = self.raw.headers.get("host", "localhost")
        return f"{self.raw.url.scheme}://{host}{self.raw.url.path}"

    # ── auth ──
    def user(self):
        return self._user

    async def auth_user(self):
        """$request->user('sanctum'): resolves the bearer token even when no auth middleware ran."""
        if self._user:
            return self._user
        from .auth import resolve_user_from_request
        return await resolve_user_from_request(self)

    def set_user(self, u):
        self._user = u
        return self

    async def validate(self, rules: dict, messages: dict | None = None) -> dict:
        db = connection(self.slug) if self.slug else None
        return await validate(self.all(), rules, db=db, slug=self.slug or None, messages=messages,
                              files=self._files)


_NO = object()


def _to_starlette(out) -> StarletteResponse:
    if isinstance(out, JsonResponse):
        return StarletteResponse(dumps(out.body), status_code=out.status, media_type="application/json", headers=out.headers)
    if isinstance(out, RawResponse):
        body = out.body if isinstance(out.body, (str, bytes)) else dumps(out.body)
        return StarletteResponse(body, status_code=out.status, headers=out.headers)
    if out is None:
        return StarletteResponse(status_code=204)
    if isinstance(out, str):
        return StarletteResponse(out, status_code=200)
    return StarletteResponse(dumps(out), status_code=200, media_type="application/json")


to_starlette = _to_starlette


def render_error(e: BaseException) -> StarletteResponse:
    """Maps an exception to Laravel's JSON error body."""
    if isinstance(e, ValidationException):
        return _to_starlette(JsonResponse({"message": e.summary(), "errors": e.errors}, 422))
    if isinstance(e, AuthenticationException):
        return _to_starlette(JsonResponse({"message": "Unauthenticated."}, 401))
    if isinstance(e, AuthorizationException):
        return _to_starlette(JsonResponse({"message": e.message}, 403))
    if isinstance(e, ModelNotFoundException):
        return _to_starlette(JsonResponse({"message": e.message}, 404))
    if isinstance(e, HttpException):
        fallback = {401: "Unauthenticated.", 403: "This action is unauthorized.", 404: "Not Found",
                    415: "Unsupported Media Type", 429: "Too Many Requests"}
        return _to_starlette(JsonResponse({"message": e.message or fallback.get(e.status) or "Error"}, e.status, e.headers))
    import traceback
    Log.error("".join(traceback.format_exception(type(e), e, e.__traceback__)))
    return _to_starlette(JsonResponse({"message": str(e) or "Server Error"}, 500))


async def _maybe_await(v):
    return await v if inspect.isawaitable(v) else v


def handle(slug: str, fn):
    """Wraps a Laravel-style handler (request, response) -> value into a router handler."""
    async def run(request: Request):
        return await _maybe_await(fn(request, response))
    return run


def middleware(slug: str, fn):
    """Wraps middleware written as (request, response, next). `return await next()` continues the chain."""
    async def run(request: Request):
        called = False

        async def nxt():
            nonlocal called
            called = True

        out = await _maybe_await(fn(request, response, nxt))
        if called:
            return None
        return out if out is not None else JsonResponse(None, 204)
    return run


class Router:
    """Per-tatemono router, hot-swapped on rebuild. `{id}` path params, middleware chain per route."""

    def __init__(self, slug: str = ""):
        self.slug = slug
        self.routes: list[tuple[str, re.Pattern, list, object]] = []

    def add(self, method: str, path: str, chain: list, handler) -> None:
        path = re.sub(r"/+", "/", path)
        if path != "/":
            path = path.rstrip("/")
        if path == "/":
            pat = re.compile(r"^/?$")
        else:
            escaped = re.sub(r"([.+*?^$()|\\])", r"\\\1", path).replace("\\{", "{").replace("\\}", "}")
            pat = re.compile("^" + re.sub(r"\{(\w+)\??\}", r"(?P<\1>[^/]+)", escaped) + "/?$")
        route = (method.upper(), pat, chain, handler)
        if re.search(r"\{\w+\??\}", path):
            self.routes.append(route)
        else:
            dynamic_index = next((i for i, existing in enumerate(self.routes) if re.search(r"\(\?P<", existing[1].pattern)), len(self.routes))
            self.routes.insert(dynamic_index, route)

    async def dispatch(self, raw: StarletteRequest, path: str, body, files: dict | None = None) -> StarletteResponse | None:
        for method, pat, chain, handler in self.routes:
            if method != raw.method:
                continue
            m = pat.match(path)
            if not m:
                continue
            request = Request(raw, self.slug, body, m.groupdict(), files)
            try:
                for mw in chain:
                    out = await mw(request)
                    if out is not None:
                        return _to_starlette(out)
                return _to_starlette(await handler(request))
            except Exception as e:                      # noqa: BLE001 - rendered as Laravel-style JSON
                return render_error(e)
        return None
