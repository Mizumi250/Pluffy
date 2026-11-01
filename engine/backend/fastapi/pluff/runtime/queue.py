"""Database queue (same idea as Laravel's `jobs` table) + job / listener / event classes."""
from __future__ import annotations

import asyncio
import inspect
import json
import time
import traceback
from typing import Any

from .database import is_pg, main_connection
from .support import Log, env, sql_now

__all__ = ["Job", "Event", "Listener", "modules", "run_payload", "dispatch", "event", "work_once"]


class Job:
    tatemono = ""
    tries = 3
    timeout = 60
    queue = "default"

    def __init__(self, data: Any = None):
        self.data = data if data is not None else {}

    async def handle(self) -> None:
        return None


class Event:
    tatemono = ""

    def __init__(self, data: dict | None = None):
        self.data = data if data is not None else {}


class Listener:
    tries = 3
    queue = "default"

    async def handle(self, event: "Event") -> None:
        return None


class LoadedModule:
    def __init__(self, name, jobs, listeners, events, listener_map):
        self.name, self.jobs, self.listeners, self.events, self.listener_map = name, jobs, listeners, events, listener_map


modules: dict[str, LoadedModule] = {}
_ready = False


def _ensure_tables() -> None:
    global _ready
    if _ready:
        return
    db = main_connection()
    pk = "SERIAL PRIMARY KEY" if is_pg() else "INTEGER PRIMARY KEY AUTOINCREMENT"
    if not db.has_table("jobs"):
        db.execute(f'CREATE TABLE "jobs" ("id" {pk}, "queue" VARCHAR(255) NOT NULL, "payload" TEXT NOT NULL, '
                   '"attempts" INTEGER NOT NULL DEFAULT 0, "reserved_at" INTEGER NULL, "available_at" INTEGER NOT NULL, "created_at" INTEGER NOT NULL)')
        db.execute('CREATE INDEX IF NOT EXISTS "jobs_queue_index" ON "jobs" ("queue")')
    if not db.has_table("failed_jobs"):
        db.execute(f'CREATE TABLE "failed_jobs" ("id" {pk}, "queue" VARCHAR(255), "payload" TEXT, "exception" TEXT, "failed_at" VARCHAR(40))')
    _ready = True


def _now_sec() -> int:
    return int(time.time())


def _is_sync() -> bool:
    return env("QUEUE_CONNECTION", "database") == "sync"


def _push(queue: str, payload: dict, delay: int = 0) -> None:
    _ensure_tables()
    main_connection().insert("jobs", {"queue": queue, "payload": json.dumps(payload), "attempts": 0,
                                      "reserved_at": None, "available_at": _now_sec() + delay, "created_at": _now_sec()})


async def run_payload(p: dict) -> None:
    mod = modules.get(p["tatemono"])
    if mod is None:
        raise RuntimeError(f'Tatemono "{p["tatemono"]}" is not loaded')
    if p["kind"] == "job":
        C = mod.jobs.get(p["class"])
        if C is None:
            raise RuntimeError(f"Unknown job {p['class']}")
        await C(p.get("data")).handle()
    else:
        L = mod.listeners.get(p["class"])
        if L is None:
            raise RuntimeError(f"Unknown listener {p['class']}")
        E = mod.events.get(p["event"]["class"], Event)
        await L().handle(E(p["event"]["data"]))


async def dispatch(job: Job, delay_sec: int = 0):
    """dispatch(MyJob(data)): the job class is tagged by generated code with `tatemono`."""
    payload = {"tatemono": type(job).tatemono, "kind": "job", "class": type(job).__name__, "data": job.data,
               "tries": job.tries, "timeout": job.timeout}
    if _is_sync():
        return await run_payload(payload)
    _push(job.queue, payload, delay_sec)


async def event(e: Event) -> None:
    """event(SomethingHappened(data)): runs every registered listener (queued, like ShouldQueue)."""
    tatemono = type(e).tatemono
    mod = modules.get(tatemono)
    if mod is None:
        return
    for lname in mod.listener_map.get(type(e).__name__, []):
        L = mod.listeners.get(lname)
        if L is None:
            continue
        inst = L()
        payload = {"tatemono": tatemono, "kind": "listener", "class": lname,
                   "event": {"class": type(e).__name__, "data": e.data}, "tries": inst.tries, "timeout": 60}
        if _is_sync():
            await run_payload(payload)
        else:
            _push(inst.queue, payload)


async def work_once(queue: str = "default") -> bool:
    """One poll step of the worker. Returns True when a job was processed."""
    _ensure_tables()
    db = main_connection()
    rows = db.select('SELECT * FROM "jobs" WHERE "queue" = :q AND "reserved_at" IS NULL AND "available_at" <= :t ORDER BY "id" LIMIT 1',
                     {"q": queue, "t": _now_sec()})
    if not rows:
        return False
    row = rows[0]
    claimed = db.execute('UPDATE "jobs" SET "reserved_at" = :t, "attempts" = :a WHERE "id" = :i AND "reserved_at" IS NULL',
                         {"t": _now_sec(), "a": row["attempts"] + 1, "i": row["id"]})
    if not claimed:
        return True
    p = json.loads(row["payload"])
    try:
        await asyncio.wait_for(run_payload(p), timeout=p.get("timeout") or 60)
        db.execute('DELETE FROM "jobs" WHERE "id" = :i', {"i": row["id"]})
        Log.info(f"Processed {p['class']} ({p['tatemono']})")
    except BaseException as e:                              # noqa: BLE001 - includes timeouts
        if isinstance(e, (KeyboardInterrupt, SystemExit)):
            raise
        msg = "Job timed out" if isinstance(e, asyncio.TimeoutError) else str(e)
        if row["attempts"] + 1 >= (p.get("tries") or 1):
            db.insert("failed_jobs", {"queue": queue, "payload": row["payload"],
                                      "exception": "".join(traceback.format_exception(type(e), e, e.__traceback__)),
                                      "failed_at": sql_now()})
            db.execute('DELETE FROM "jobs" WHERE "id" = :i', {"i": row["id"]})
            Log.error(f"Failed {p['class']}: {msg}")
        else:
            db.execute('UPDATE "jobs" SET "reserved_at" = NULL, "available_at" = :t WHERE "id" = :i', {"t": _now_sec() + 5, "i": row["id"]})
            Log.warn(f"Retrying {p['class']} (attempt {row['attempts'] + 1}/{p.get('tries')}): {msg}")
    return True
