"""Pluff FastAPI backend: same /arkzen engine contract as the Laravel and Express backends.

Run:  python -m uvicorn pluff.server:app --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import json
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .engine.build import build_tatemono, load_all_generated, remove_tatemono, routers
from .runtime.broadcast import start_realtime
from .runtime.http import to_starlette, JsonResponse
from .runtime.storage import STORAGE_ROOT
from .runtime.support import REPO_ROOT, Log, ensure_dir, env


@asynccontextmanager
async def lifespan(_app: FastAPI):
    load_all_generated()
    await start_realtime()
    Log.info(f"FastAPI backend on http://localhost:{env('PORT', '8000')}")
    yield


app = FastAPI(title="Pluff FastAPI backend", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
ensure_dir(STORAGE_ROOT)
app.mount("/storage", StaticFiles(directory=str(STORAGE_ROOT)), name="storage")

SECRET = env("ARKZEN_ENGINE_SECRET", "arkzen-engine-secret")


def _guard(request: Request):
    if request.headers.get("x-arkzen-secret") != SECRET:
        return JSONResponse({"message": "Invalid engine secret."}, status_code=403)
    return None


@app.get("/arkzen/health")
async def health():
    return {"status": "ok", "engine": "Pluff FastAPI Backend Engine", "backend": "fastapi", "variant": "py", "version": "1.0.0"}


@app.get("/arkzen/registry")
async def registry(request: Request):
    if (bad := _guard(request)):
        return bad
    f = REPO_ROOT / "arkzen.json"
    return json.loads(f.read_text("utf-8")) if f.exists() else {"project": REPO_ROOT.name}


@app.post("/arkzen/build")
async def build(request: Request):
    if (bad := _guard(request)):
        return bad
    status, body = await build_tatemono(await request.json())
    return JSONResponse(body, status_code=status)


@app.post("/arkzen/remove")
async def remove(request: Request):
    if (bad := _guard(request)):
        return bad
    return JSONResponse(await remove_tatemono(await request.json()))


async def _read_body(request: Request):
    ctype = request.headers.get("content-type", "")
    if "multipart/form-data" in ctype:
        form = await request.form()
        body = {}
        files = {}
        for key, value in form.multi_items():
            if hasattr(value, "filename"):
                name = key[:-2] if key.endswith("[]") else key
                content = await value.read()
                upload = {"originalname": value.filename or "upload",
                          "mimetype": value.content_type or "application/octet-stream",
                          "size": len(content), "buffer": content}
                files.setdefault(name, []).append(upload)
            else:
                body[key] = value
        body.update(files)
        return body, files

    raw = await request.body()
    if not raw:
        return {}, {}
    try:
        if "json" in ctype:
            data = json.loads(raw)
            return (data if isinstance(data, dict) else {}), {}
        if "x-www-form-urlencoded" in ctype:
            from urllib.parse import parse_qs
            return {k: (v[-1] if v else "") for k, v in parse_qs(raw.decode(), keep_blank_values=True).items()}, {}
    except ValueError:
        return {}, {}
    return {}, {}


# /api/<tatemono>/... is dispatched to that tatemono's generated router (hot-swapped on rebuild).
@app.api_route("/api/{rest:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def api(request: Request, rest: str):
    path = request.url.path
    m = re.match(r"^/api/([^/]+)", path)
    router = m and routers.get(m.group(1))
    body, files = await _read_body(request)
    candidates = ([router] if router else []) + [candidate for candidate in routers.values() if candidate is not router]
    for candidate in candidates:
        out = await candidate.dispatch(request, path, body, files)
        if out is not None:
            return out
    return to_starlette(JsonResponse({"message": "Not Found"}, 404))


@app.exception_handler(404)
async def not_found(_request: Request, _exc):
    return JSONResponse({"message": "Not Found"}, status_code=404)
