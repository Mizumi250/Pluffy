"""artisan-like commands + scheduler (cron expressions via croniter)."""
from __future__ import annotations

import asyncio
import datetime as dt
import inspect
import sys

from croniter import croniter

from .support import Log

__all__ = ["Command", "commands", "register_command", "run_command", "start_scheduler", "scheduler_loop", "unregister_tatemono_commands"]


class Command:
    SUCCESS = 0
    FAILURE = 1
    signature = ""
    description = ""
    schedule: str | None = None

    def info(self, m): print(f"[cmd] {m}", flush=True)
    def line(self, m): print(m, flush=True)
    def warn(self, m): print(f"[cmd] ⚠ {m}", file=sys.stderr, flush=True)
    def error(self, m): print(f"[cmd] ✖ {m}", file=sys.stderr, flush=True)

    async def handle(self):
        return Command.SUCCESS


commands: dict[str, tuple[str, type]] = {}              # signature -> (tatemono, class)
_tasks: dict[str, dict] = {}                            # signature -> {"expr", "next"}
_scheduler_on = False


def register_command(tatemono: str, cmd_cls: type) -> None:
    inst = cmd_cls()
    commands[inst.signature] = (tatemono, cmd_cls)
    if inst.schedule:
        _start_task(inst.signature, inst.schedule)


async def run_command(signature: str) -> int:
    entry = commands.get(signature)
    if entry is None:
        Log.error(f'Command "{signature}" is not defined.')
        return 1
    code = entry[1]().handle()
    if inspect.isawaitable(code):
        code = await code
    return code if isinstance(code, int) else 0


def start_scheduler() -> None:
    global _scheduler_on
    _scheduler_on = True
    for sig, (_, cls) in commands.items():
        c = cls()
        if c.schedule:
            _start_task(sig, c.schedule)


def _start_task(signature: str, expr: str) -> None:
    if not _scheduler_on:                               # only the worker process runs schedules
        return
    if not croniter.is_valid(expr):
        Log.warn(f'Invalid cron "{expr}" for {signature}')
        return
    nxt = croniter(expr, dt.datetime.now()).get_next(dt.datetime)
    _tasks[signature] = {"expr": expr, "next": nxt}
    Log.info(f"Schedule registered: {signature} ({expr})")


async def scheduler_loop() -> None:
    """Fires due commands. Runs inside the worker next to the queue loop."""
    while True:
        now = dt.datetime.now()
        for sig, t in list(_tasks.items()):
            if now >= t["next"]:
                t["next"] = croniter(t["expr"], now).get_next(dt.datetime)
                asyncio.create_task(_safe_run(sig))
        await asyncio.sleep(1)


async def _safe_run(sig: str) -> None:
    try:
        await run_command(sig)
    except Exception as e:                              # noqa: BLE001
        Log.error(f"{sig}: {e}")


def unregister_tatemono_commands(tatemono: str) -> None:
    for sig, (t, _) in list(commands.items()):
        if t == tatemono:
            _tasks.pop(sig, None)
            commands.pop(sig, None)
