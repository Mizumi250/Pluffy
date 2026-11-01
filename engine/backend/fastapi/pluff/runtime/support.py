"""Shared helpers for the FastAPI runtime (Laravel-like support layer)."""
from __future__ import annotations

import datetime as _dt
import os
import re
import sys
from decimal import Decimal
from pathlib import Path

from dotenv import load_dotenv

# .../engine/backend/fastapi/pluff/runtime/support.py
BACKEND_DIR = Path(__file__).resolve().parents[2]      # engine/backend/fastapi
REPO_ROOT = BACKEND_DIR.parents[2]                     # repo root
load_dotenv(BACKEND_DIR / ".env")

__all__ = [
    "BACKEND_DIR", "REPO_ROOT", "studly", "slug_to_conn", "prefixed_table", "lcfirst", "snake",
    "sql_now", "now", "to_iso_micro", "Log", "env", "ensure_dir", "js_str", "to_int",
]


def env(key: str, default: str | None = None) -> str | None:
    v = os.environ.get(key)
    return default if v is None else v


def ensure_dir(path) -> None:
    Path(path).mkdir(parents=True, exist_ok=True)


def studly(s: str) -> str:
    """'welcome-mail' / 'welcome_mail' -> 'WelcomeMail'."""
    return "".join(w[:1].upper() + w[1:] for w in re.split(r"[-_\s]+", s) if w)


def slug_to_conn(slug: str) -> str:
    return slug.replace("-", "_")


def prefixed_table(slug: str, raw: str) -> str:
    p = slug_to_conn(slug)
    return raw if raw.startswith(p + "_") else f"{p}_{raw}"


def lcfirst(s: str) -> str:
    return s[:1].lower() + s[1:]


def snake(s: str) -> str:
    """'JobResult' -> 'job_result'."""
    return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower()


def sql_now(d: _dt.datetime | None = None) -> str:
    """'YYYY-MM-DD HH:mm:ss' in UTC, the format Laravel writes to sqlite."""
    d = d or _dt.datetime.now(_dt.timezone.utc)
    if d.tzinfo is not None:
        d = d.astimezone(_dt.timezone.utc)
    return d.strftime("%Y-%m-%d %H:%M:%S")


def now() -> _dt.datetime:
    return _dt.datetime.now(_dt.timezone.utc)


def to_iso_micro(v) -> str | None:
    """Laravel serialises timestamps as 2026-10-30T07:54:06.000000Z"""
    if v is None or v == "":
        return None
    if isinstance(v, _dt.datetime):
        d = v
    elif isinstance(v, _dt.date):
        d = _dt.datetime(v.year, v.month, v.day)
    else:
        s = str(v)
        try:
            if re.search(r"[zZ]$|[+-]\d\d:?\d\d$", s):
                d = _dt.datetime.fromisoformat(s.replace("Z", "+00:00").replace("z", "+00:00"))
            else:
                d = _dt.datetime.fromisoformat(s.replace(" ", "T"))
        except ValueError:
            return s
    if d.tzinfo is not None:
        d = d.astimezone(_dt.timezone.utc)
    return d.strftime("%Y-%m-%dT%H:%M:%S.") + f"{d.microsecond:06d}Z"


def js_str(v) -> str:
    """String(v) as JavaScript would print it (used where Laravel compares loosely)."""
    if v is True:
        return "true"
    if v is False:
        return "false"
    if v is None:
        return "null"
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    if isinstance(v, Decimal):
        return format(v, "f")
    return str(v)


def to_int(v, default: int) -> int:
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return default


class _Log:
    @staticmethod
    def _p(prefix: str, m, ctx, stream) -> None:
        extra = "" if ctx is None else f" {ctx}"
        message = f"[Pluff] {prefix}{m}{extra}"
        try:
            print(message, file=stream, flush=True)
        except UnicodeEncodeError:
            encoding = getattr(stream, "encoding", None) or "utf-8"
            safe_message = message.encode(encoding, errors="backslashreplace").decode(encoding)
            print(safe_message, file=stream, flush=True)

    def info(self, m, ctx=None):  self._p("", m, ctx, sys.stdout)
    def warn(self, m, ctx=None):  self._p("⚠ ", m, ctx, sys.stderr)
    def error(self, m, ctx=None): self._p("✖ ", m, ctx, sys.stderr)


Log = _Log()
