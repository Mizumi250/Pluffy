"""Queue worker + scheduler (Laravel: `queue:work` + `schedule:work`). Run with: python -m pluff.worker"""
from __future__ import annotations

import asyncio

from .engine.build import load_all_generated
from .runtime.commands import scheduler_loop, start_scheduler
from .runtime.queue import work_once
from .runtime.support import Log, env


async def main() -> None:
    load_all_generated()
    start_scheduler()
    Log.info("Queue worker + scheduler running")
    asyncio.create_task(scheduler_loop())
    queues = [q.strip() for q in (env("QUEUE_NAMES", "default,heavy") or "default").split(",")]
    while True:
        worked = False
        for q in queues:
            worked = (await work_once(q)) or worked
        if not worked:
            await asyncio.sleep(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
