"""Laravel-style validation: 'required|string|max:255', arrays, wildcards, unique/exists.

Same rules, same messages, same 422 bodies as the Laravel and Express backends.
"""
from __future__ import annotations

import datetime as _dt
import json
import re
from urllib.parse import urlparse

from .database import Connection
from .errors import ValidationException
from .support import slug_to_conn

__all__ = ["validate"]

_MISSING = object()


def _attr(k: str) -> str:
    return k.replace(".*", "").replace("_", " ").replace(".", " ")


def _is_empty(v) -> bool:
    return v is _MISSING or v is None or (isinstance(v, str) and v.strip() == "") or (isinstance(v, list) and len(v) == 0)


def _get_path(o, p: str):
    cur = o
    for k in p.split("."):
        if cur is _MISSING or cur is None:
            return _MISSING
        if isinstance(cur, dict):
            cur = cur.get(k, _MISSING)
        elif isinstance(cur, list):
            try:
                cur = cur[int(k)]
            except (ValueError, IndexError):
                return _MISSING
        else:
            return _MISSING
    return cur


def _expand(rules: dict, data) -> dict:
    out: dict = {}
    for key, r in rules.items():
        if "*" not in key:
            out[key] = r
            continue

        def walk(prefix: str, rest: list[str], cur):
            if not rest:
                out[prefix] = r
                return
            head, tail = rest[0], rest[1:]
            if head == "*":
                if isinstance(cur, list):
                    for i, item in enumerate(cur):
                        walk(f"{prefix}.{i}" if prefix else str(i), tail, item)
            else:
                nxt = cur.get(head) if isinstance(cur, dict) else None
                walk(f"{prefix}.{head}" if prefix else head, tail, nxt)

        walk("", key.split("."), data)
    return out


MSG = {
    "required": "The :attribute field is required.",
    "string": "The :attribute field must be a string.",
    "integer": "The :attribute field must be an integer.",
    "numeric": "The :attribute field must be a number.",
    "boolean": "The :attribute field must be true or false.",
    "email": "The :attribute field must be a valid email address.",
    "url": "The :attribute field must be a valid URL.",
    "array": "The :attribute field must be an array.",
    "date": "The :attribute field must be a valid date.",
    "json": "The :attribute field must be a valid JSON string.",
    "uuid": "The :attribute field must be a valid UUID.",
    "alpha": "The :attribute field must only contain letters.",
    "alpha_num": "The :attribute field must only contain letters and numbers.",
    "alpha_dash": "The :attribute field must only contain letters, numbers, dashes, and underscores.",
    "in": "The selected :attribute is invalid.",
    "not_in": "The selected :attribute is invalid.",
    "exists": "The selected :attribute is invalid.",
    "unique": "The :attribute has already been taken.",
    "regex": "The :attribute field format is invalid.",
    "confirmed": "The :attribute field confirmation does not match.",
    "same": "The :attribute field and :other must match.",
    "different": "The :attribute field and :other must be different.",
    "accepted": "The :attribute field must be accepted.",
    "filled": "The :attribute field must have a value.",
    "digits": "The :attribute field must be :digits digits.",
    "ip": "The :attribute field must be a valid IP address.",
    "file": "The :attribute field must be a file.",
    "image": "The :attribute field must be an image.",
    "mimes": "The :attribute field must be a file of type: :values.",
}


def _is_num(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _to_number(v):
    if isinstance(v, bool):
        return float("nan")
    try:
        return float(v)
    except (TypeError, ValueError):
        return float("nan")


def _js_str(v) -> str:
    if v is True:
        return "true"
    if v is False:
        return "false"
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v)


def _size_of(v, numeric: bool) -> float:
    if _is_num(v):
        return v
    if numeric and v != "" and v is not None and _to_number(v) == _to_number(v):
        return _to_number(v)
    if isinstance(v, list):
        return len(v)
    if isinstance(v, dict) and "size" in v:
        return round(v["size"] / 1024)
    return len(_js_str(v))


def _size_msg(rule: str, v, numeric: bool, key: str, p: list[str]) -> str:
    if isinstance(v, list):
        kind = "array"
    elif _is_num(v) or numeric:
        kind = "numeric"
    elif isinstance(v, dict) and "size" in v:
        kind = "file"
    else:
        kind = "string"
    a = _attr(key)
    unit = {"numeric": "", "string": " characters", "array": " items", "file": " kilobytes"}[kind]
    if rule == "min":
        return f"The {a} field must be at least {p[0]}{unit}."
    if rule == "max":
        return f"The {a} field must not be greater than {p[0]}{unit}."
    if rule == "size":
        return f"The {a} field must be {p[0]}{unit}."
    if rule == "between":
        return f"The {a} field must be between {p[0]} and {p[1]}{unit}."
    return ""


def _parse_date(s: str) -> bool:
    s = s.strip()
    try:
        _dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
        return True
    except ValueError:
        pass
    for fmt in ("%Y/%m/%d", "%m/%d/%Y", "%d-%m-%Y", "%Y-%m-%d %H:%M:%S", "%b %d, %Y", "%B %d, %Y"):
        try:
            _dt.datetime.strptime(s, fmt)
            return True
        except ValueError:
            continue
    return False


_UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)
_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_IP = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+$", re.I)


async def _resolve_table(ctx: dict, table: str) -> str:
    t = table.split("\\")[-1].lower() + "s" if "\\" in table else table
    if ctx["db"].has_table(t):
        return t
    return f"{slug_to_conn(ctx['slug'])}_{t}" if ctx.get("slug") else t


async def _check(rule: str, p: list[str], v, key: str, ctx: dict, numeric: bool):
    def fail() -> str:
        return MSG.get(rule, "The :attribute field is invalid.").replace(":attribute", _attr(key))

    sv = _js_str(v)
    if rule == "string":
        return None if isinstance(v, str) else fail()
    if rule == "integer":
        if isinstance(v, bool):
            return fail()
        ok = (float(v).is_integer()) if isinstance(v, (int, float)) else bool(re.fullmatch(r"-?\d+", sv))
        return None if ok else fail()
    if rule == "numeric":
        return None if (v != "" and v is not None and not isinstance(v, bool) and _to_number(v) == _to_number(v)) else fail()
    if rule == "boolean":
        return None if (v in (True, False, 1, 0, "1", "0", "true", "false") and not isinstance(v, (dict, list))) else fail()
    if rule == "accepted":
        return None if (v in ("yes", "on", 1, "1", True, "true") and not isinstance(v, (dict, list))) else fail()
    if rule == "email":
        return None if _EMAIL.match(sv) else fail()
    if rule == "url":
        u = urlparse(sv)
        return None if (u.scheme and (u.netloc or u.path)) else fail()
    if rule == "array":
        return None if isinstance(v, (list, dict)) else fail()
    if rule == "date":
        return None if _parse_date(sv) else fail()
    if rule == "json":
        try:
            json.loads(sv)
            return None
        except ValueError:
            return fail()
    if rule == "uuid":
        return None if _UUID.match(sv) else fail()
    if rule == "alpha":
        return None if re.fullmatch(r"[A-Za-z]+", sv) else fail()
    if rule == "alpha_num":
        return None if re.fullmatch(r"[A-Za-z0-9]+", sv) else fail()
    if rule == "alpha_dash":
        return None if re.fullmatch(r"[A-Za-z0-9_-]+", sv) else fail()
    if rule == "ip":
        return None if _IP.match(sv) else fail()
    if rule == "digits":
        return None if re.fullmatch(r"\d{%s}" % p[0], sv) else fail().replace(":digits", p[0])
    if rule == "min":
        return None if _size_of(v, numeric) >= _to_number(p[0]) else _size_msg("min", v, numeric, key, p)
    if rule == "max":
        return None if _size_of(v, numeric) <= _to_number(p[0]) else _size_msg("max", v, numeric, key, p)
    if rule == "size":
        return None if _size_of(v, numeric) == _to_number(p[0]) else _size_msg("size", v, numeric, key, p)
    if rule == "between":
        n = _size_of(v, numeric)
        return None if _to_number(p[0]) <= n <= _to_number(p[1]) else _size_msg("between", v, numeric, key, p)
    if rule in ("gt", "gte", "lt", "lte"):
        other = _to_number(p[0]) if _to_number(p[0]) == _to_number(p[0]) else _to_number(_get_path(ctx["data"], p[0]))
        n = _to_number(v)
        ok = n > other if rule == "gt" else n >= other if rule == "gte" else n < other if rule == "lt" else n <= other
        word = {"gt": "greater than", "gte": "greater than or equal to", "lt": "less than", "lte": "less than or equal to"}[rule]
        return None if ok else f"The {_attr(key)} field must be {word} {p[0]}."
    if rule == "in":
        return None if sv in p else fail()
    if rule == "not_in":
        return None if sv not in p else fail()
    if rule == "regex":
        m = re.match(r"^/(.*)/([a-z]*)$", ",".join(p), re.S)
        if not m:
            return fail()
        flags = (re.I if "i" in m.group(2) else 0) | (re.M if "m" in m.group(2) else 0) | (re.S if "s" in m.group(2) else 0)
        try:
            return None if re.search(m.group(1), sv, flags) else fail()
        except re.error:
            return fail()
    if rule == "confirmed":
        return None if v == ctx["data"].get(f"{key}_confirmation") else fail()
    if rule == "same":
        return None if v == _get_path(ctx["data"], p[0]) else fail().replace(":other", p[0])
    if rule == "different":
        return None if v != _get_path(ctx["data"], p[0]) else fail().replace(":other", p[0])
    if rule == "file":
        return None if isinstance(v, dict) and "size" in v else fail()
    if rule == "image":
        return None if isinstance(v, dict) and str(v.get("mimetype", "")).startswith("image/") else fail()
    if rule in ("mimes", "mimetypes"):
        ext = str((v or {}).get("originalname", "")).rsplit(".", 1)[-1].lower() if isinstance(v, dict) else ""
        return None if v and (ext in p or str(v.get("mimetype")) in p) else fail().replace(":values", ", ".join(p))
    if rule == "unique":
        db: Connection | None = ctx.get("db")
        if db is None:
            return None
        table = p[0]
        col = p[1] if len(p) > 1 and p[1] else key.split(".")[-1]
        ignore = p[2] if len(p) > 2 else None
        id_col = p[3] if len(p) > 3 else "id"
        t = await _resolve_table(ctx, table)
        q = db.table(t).where(col, v)
        if ignore and ignore != "NULL":
            q = q.where(id_col, "!=", ignore)
        return fail() if await q.first() else None
    if rule == "exists":
        db = ctx.get("db")
        if db is None:
            return None
        table = p[0]
        col = p[1] if len(p) > 1 and p[1] else key.split(".")[-1]
        t = await _resolve_table(ctx, table)
        return None if await db.table(t).where(col, v).first() else fail()
    return None


def _set_path(root: dict, key: str, v) -> None:
    parts = key.split(".")
    cur = root
    for i, pt in enumerate(parts):
        last = i == len(parts) - 1
        nxt_is_idx = (not last) and parts[i + 1].isdigit()
        if isinstance(cur, list):
            idx = int(pt)
            while len(cur) <= idx:
                cur.append(None)
            if last:
                cur[idx] = v
            else:
                if cur[idx] is None:
                    cur[idx] = [] if nxt_is_idx else {}
                cur = cur[idx]
        else:
            if last:
                cur[pt] = v
            else:
                if pt not in cur or cur[pt] is None:
                    cur[pt] = [] if nxt_is_idx else {}
                cur = cur[pt]


async def validate(data: dict, rules: dict, db: Connection | None = None, slug: str | None = None,
                   messages: dict | None = None, files: dict | None = None) -> dict:
    """Returns only the keys that have rules (like Laravel's validated()). Raises ValidationException (422)."""
    messages = messages or {}
    ctx = {"data": {**data, **(files or {})}, "db": db, "slug": slug}
    errors: dict[str, list[str]] = {}
    validated: dict = {}

    for key, spec in _expand(rules, ctx["data"]).items():
        items = spec if isinstance(spec, list) else str(spec).split("|")
        lst = [str(s) for s in items if str(s)]
        parsed = []
        for r in lst:
            i = r.find(":")
            parsed.append((r, []) if i == -1 else (r[:i], r[i + 1:].split(",")))
        names = [n for n, _ in parsed]
        v = _get_path(ctx["data"], key)

        if "sometimes" in names and v is _MISSING:
            continue
        missing = _is_empty(v)
        required_if = next((pr for pr in parsed if pr[0] == "required_if"), None)
        must_have = "required" in names or (
            required_if is not None and len(required_if[1]) > 1
            and _js_str(_get_path(ctx["data"], required_if[1][0])) == required_if[1][1])
        if missing:
            if must_have:
                errors.setdefault(key, []).append(messages.get(f"{key}.required") or MSG["required"].replace(":attribute", _attr(key)))
            elif "filled" in names and v is not _MISSING:
                errors.setdefault(key, []).append(MSG["filled"].replace(":attribute", _attr(key)))
            continue
        numeric = "numeric" in names or "integer" in names
        for n, p in parsed:
            if n in ("required", "nullable", "sometimes", "bail", "filled", "required_if"):
                continue
            m = await _check(n, p, v, key, ctx, numeric)
            if m:
                errors.setdefault(key, []).append(messages.get(f"{key}.{n}") or m)
                if "bail" in names:
                    break
        if key not in errors:
            _set_path(validated, key, v)

    if errors:
        raise ValidationException(errors)
    return validated
