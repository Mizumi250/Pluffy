"""Orchestrates one tatemono build: validate -> database -> generate -> import -> load."""
from __future__ import annotations

import importlib.util
import re
import shutil
import sys
import traceback

from ..runtime.commands import register_command, unregister_tatemono_commands
from ..runtime.database import connection, drop_database, ensure_database
from ..runtime.queue import LoadedModule, modules
from ..runtime.support import BACKEND_DIR, Log, ensure_dir, slug_to_conn
from .generate import generate
from .schema import apply_auth_tables, apply_schema, seed_auth_users, seed_tables

Any = dict
routers: dict = {}
GEN_DIR = BACKEND_DIR / "pluff" / "generated"
_loads = 0


def validate_payload(p: Any) -> list[str]:
    errors: list[str] = []
    name = p.get("name")
    if not name or not isinstance(name, str):
        errors.append('Missing "name"')
    elif not re.match(r"^[a-z0-9][a-z0-9-]*$", name):
        errors.append(f'Invalid tatemono name "{name}" (lowercase letters, digits, dashes)')
    if p.get("backendVariant") and p["backendVariant"] != "py":
        errors.append(f"Payload was parsed for the :{p['backendVariant']} variant but this backend (fastapi) reads :py. "
                      "Switch the active backend and let the watcher rebuild.")
    for d in p.get("databases") or []:
        if not d.get("table"):
            errors.append("database block without a table")
    for a in p.get("apis") or []:
        if not a.get("model") or not a.get("controller"):
            errors.append("api block needs model and controller")
    return errors


def load_module(slug: str) -> None:
    """Imports pluff/generated/<slug> under a fresh package name (hot swap) and registers it.

    A syntax error in a :py body fails here, the same way an esbuild error does on the Express backend."""
    global _loads
    _loads += 1
    pkg = f"pluff_gen_{slug_to_conn(slug)}_{_loads}"
    d = GEN_DIR / slug
    for f in d.rglob("*.py"):                           # surface syntax errors with file + line before importing
        try:
            compile(f.read_text(), str(f), "exec")
        except SyntaxError as e:
            raise RuntimeError(f"{f.name}:{e.lineno}: {e.msg}") from None
    spec = importlib.util.spec_from_file_location(pkg, d / "__init__.py", submodule_search_locations=[str(d)])
    mod = importlib.util.module_from_spec(spec)
    sys.modules[pkg] = mod
    try:
        spec.loader.exec_module(mod)
    except BaseException:
        for k in [k for k in sys.modules if k == pkg or k.startswith(pkg + ".")]:
            del sys.modules[k]
        raise
    prefix = f"pluff_gen_{slug_to_conn(slug)}_"
    for k in [k for k in sys.modules if k.startswith(prefix) and not (k == pkg or k.startswith(pkg + "."))]:
        del sys.modules[k]
    routers[slug] = mod.router
    modules[slug] = LoadedModule(slug, mod.jobs, mod.listeners, mod.events, mod.listener_map)
    unregister_tatemono_commands(slug)
    for C in getattr(mod, "commands", []):
        register_command(slug, C)


def load_all_generated() -> None:
    if not GEN_DIR.exists():
        return
    for d in sorted(GEN_DIR.iterdir()):
        if not (d / "__init__.py").exists() or d.name.startswith("__"):
            continue
        try:
            load_module(d.name)
            Log.info(f"Loaded module: {d.name}")
        except Exception as e:                          # noqa: BLE001
            Log.error(f"Failed to load {d.name}: {e}")


async def build_tatemono(p: Any) -> tuple[int, Any]:
    steps: list[str] = []
    errors: list[str] = []
    bad = validate_payload(p)
    if bad:
        return 422, {"success": False, "message": "Validation failed", "errors": bad, "steps": steps}
    slug: str = p["name"]
    Log.info(f"═══ Building: {slug} (fastapi) ═══")

    def run(label: str, fn) -> None:
        try:
            fn()
            steps.append(label)
        except Exception as e:                          # noqa: BLE001
            errors.append(f"{label}: {e}")
            Log.error(f"{label}: {e}")
            if not isinstance(e, (RuntimeError, SyntaxError)):
                Log.error(traceback.format_exc())

    g = generate(p)
    has_notifications = bool(p.get("notifications"))
    dbs: list[Any] = p.get("databases") or []
    db_steps: list[str] = []

    run("Database ready", lambda: ensure_database(slug))
    db = connection(slug)
    run("Migrations", lambda: apply_schema(db, slug, dbs, db_steps))
    if p.get("auth"):
        run("Auth tables", lambda: apply_auth_tables(db, slug, has_notifications, db_steps))
        run("Auth seed", lambda: seed_auth_users(db, slug, p.get("authSeed"), db_steps))
    elif has_notifications:
        run("Notification table", lambda: apply_auth_tables(db, slug, True, db_steps))
    run("Seeders", lambda: seed_tables(db, slug, dbs, db_steps))
    steps.extend(db_steps)

    def write() -> None:
        d = GEN_DIR / slug
        shutil.rmtree(d, ignore_errors=True)
        ensure_dir(d)
        for f, content in g["files"].items():
            (d / f).write_text(content, encoding="utf-8")

    run(f"Generate {len(g['files'])} files", write)
    run("Import + load routes", lambda: load_module(slug))

    ok = not errors
    return (200 if ok else 500), {"success": ok, "message": "Build complete" if ok else "Build finished with errors",
                                 "steps": steps, "errors": errors, "registry": g["registry"]}


async def remove_tatemono(p: Any) -> Any:
    slug: str = p["name"]
    steps: list[str] = []
    routers.pop(slug, None)
    modules.pop(slug, None)
    unregister_tatemono_commands(slug)
    shutil.rmtree(GEN_DIR / slug, ignore_errors=True)
    shutil.rmtree(BACKEND_DIR / "database" / "migrations" / "arkzen" / slug, ignore_errors=True)
    steps.append("Routes + generated files removed")
    drop_database(slug)
    steps.append("Isolated database dropped")
    return {"success": True, "message": f"Removed {slug}", "steps": steps, "errors": []}
