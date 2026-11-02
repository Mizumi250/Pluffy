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
_HUB_BACKEND_LABELS = {
    "laravel": "Laravel",
    "laravel-inertia": "Laravel",
    "express": "Express",
    "fastapi": "FastAPI / Django",
    "django": "FastAPI / Django",
    "spring-boot": "Spring Boot",
    "aspnet": "ASP.NET",
}
_HUB_VARIANT_LABELS = {
    "php": "Laravel",
    "ts": "Express",
    "py": "FastAPI / Django",
    "java": "Spring Boot",
    "cs": "ASP.NET",
}
_HUB_CODE_MARKERS = "endpoint|handler|middleware|policy|listener|listeners|job|jobs|console|mail|notification|notifications"


def _hub_page_names(source: str) -> list[str]:
    return list(dict.fromkeys(
        match.group(1)
        for match in re.finditer(r"/\* @arkzen:(?:web|native):page:(?!layout:)([a-zA-Z0-9_-]+)", source)
        if match.group(1) not in {"end", "layout"}
    ))


def _hub_backend_variants(source: str, active_backend: str) -> list[str]:
    variants = []
    pattern = re.compile(
        rf"^/\* @arkzen:({_HUB_CODE_MARKERS}):(?:(php|ts|py|java|cs):)?([a-zA-Z0-9_-]+)(?:\s+\*/)?\s*$",
        re.MULTILINE,
    )
    for match in pattern.finditer(source):
        marker, variant, name = match.groups()
        closing = (
            f"/* @arkzen:{marker}:{variant}:{name}:end */"
            if variant else f"/* @arkzen:{marker}:{name}:end */"
        )
        inline_close = match.group(0).find("*/")
        opening_end = match.start() + inline_close if inline_close >= 0 else source.find("*/", match.end())
        if opening_end < 0:
            continue
        closing_start = source.find(closing, opening_end + 2)
        if closing_start < 0 or not source[opening_end + 2:closing_start].strip():
            continue
        variants.append(_HUB_VARIANT_LABELS[variant or "php"])

    variants = list(dict.fromkeys(variants))
    has_backend = re.search(
        r"auth:\s*true|@arkzen:(?:api|database|auth|jobs|events|mail|notifications|routes|realtime|console|store)",
        source,
    )
    if not variants and has_backend:
        variants.append(_HUB_BACKEND_LABELS.get(active_backend, "Laravel"))
    return variants


def _enrich_hub_registry(registry: dict) -> dict:
    active_stack = registry.get("activeStack", "nextjs")
    active_backend = "laravel-inertia" if active_stack == "react-inertia" else registry.get("activeBackend", "laravel")
    modules = {}
    for source_file in (REPO_ROOT / "tatemonos").glob("*/core.tsx"):
        source = source_file.read_text("utf-8")
        meta_match = re.search(r"/\* @arkzen:meta\b([\s\S]*?)\*/", source)
        if not meta_match:
            continue
        meta = meta_match.group(1)
        name_match = re.search(r"^\s*name:\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s#]+))", meta, re.MULTILINE)
        if not name_match:
            continue
        name = next(value for value in name_match.groups() if value is not None)
        version_match = re.search(r"^\s*version:\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s#]+))", meta, re.MULTILINE)
        version = next((value for value in version_match.groups() if value is not None), "1.0.0") if version_match else "1.0.0"
        existing = modules.setdefault(name, {})
        existing.update({
            "name": name,
            "version": version,
            "status": existing.get("status", "active"),
            "filePath": source_file.relative_to(REPO_ROOT).as_posix(),
            "pages": _hub_page_names(source),
            "auth": bool(re.search(r"^\s*auth:\s*true\s*$", meta, re.MULTILINE | re.IGNORECASE)),
        })

    for module in registry.get("modules", []):
        if isinstance(module, dict) and module.get("name"):
            modules.setdefault(module["name"], {}).update(module)

    for module in modules.values():
        file_path = module.get("filePath", f"tatemonos/{module['name']}/core.tsx")
        source_file = (REPO_ROOT / file_path).resolve()
        try:
            source_file.relative_to(REPO_ROOT.resolve())
        except ValueError:
            module.update({"frontend": [], "backend": []})
            continue
        if not source_file.is_file():
            module.update({"frontend": [], "backend": []})
            continue
        source = source_file.read_text("utf-8")
        has_web = bool(re.search(r"@arkzen:(?:web:|meta:web\b)", source))
        has_app = bool(re.search(r"@arkzen:(?:native:|meta:native\b)", source))
        frontend = []
        if has_web:
            frontend.extend(["Next.js", "React + Vite", "React + Inertia", "Astro", "TanStack Start", "Tauri", "Electron"])
        if has_app:
            frontend.extend(["Expo", "React Native", "Lynx"])
        module["frontend"] = list(dict.fromkeys(frontend))
        module["backend"] = _hub_backend_variants(source, active_backend)

    registry["activeBackend"] = active_backend
    registry["activeStack"] = active_stack
    registry["activeDatabase"] = registry.get("activeDatabase", "sqlite")
    registry["modules"] = list(modules.values())
    return registry


def _guard(request: Request):
    if request.headers.get("x-arkzen-secret") != SECRET:
        return JSONResponse({"message": "Invalid engine secret."}, status_code=403)
    return None


@app.get("/arkzen/health")
async def health():
    return {"status": "ok", "engine": "Pluff FastAPI Backend Engine", "backend": "fastapi", "variant": "py", "version": "1.0.0"}


# Registry routes are public (no engine secret), same as Laravel and Express:
# the Hubs poll them from the browser/device and cannot send x-arkzen-secret.
@app.get("/arkzen/registry")
async def registry():
    f = REPO_ROOT / "arkzen.json"
    data = json.loads(f.read_text("utf-8")) if f.exists() else {"project": REPO_ROOT.name}
    return _enrich_hub_registry(data)


# Expo Hub polls this every 3s. Reads expo-registry.json written by the Expo watcher.
@app.get("/arkzen/expo-registry")
async def expo_registry():
    empty = {"engine": "1.0.0", "project": "expo", "modules": []}
    f = REPO_ROOT / "engine" / "frontend" / "expo" / "expo-registry.json"
    if not f.exists():
        return empty
    try:
        return json.loads(f.read_text("utf-8"))
    except ValueError as e:
        return JSONResponse({**empty, "error": str(e)}, status_code=500)


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