"""artisan-style runner: python -m pluff.cli express-test:ping   (or `list`)"""
from __future__ import annotations

import asyncio
import sys

from .engine.build import load_all_generated
from .runtime.commands import commands, run_command


def main() -> int:
    load_all_generated()
    sig = sys.argv[1] if len(sys.argv) > 1 else "list"
    if sig == "list":
        for s, (tatemono, _) in commands.items():
            print(f"{s}  ({tatemono})")
        return 0
    return asyncio.run(run_command(sig))


if __name__ == "__main__":
    sys.exit(main())
