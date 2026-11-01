"""Eloquent-like Model + QueryBuilder (flat SQL, same precedence rules as Laravel / knex)."""
from __future__ import annotations

import datetime as _dt
import json
import math
from decimal import Decimal
from typing import Any, Callable

from .database import Connection, connection, is_pg, qi
from .errors import ModelNotFoundException
from .support import sql_now, to_int, to_iso_micro

__all__ = ["QueryBuilder", "Model"]

_U = object()                       # "argument not given" (None is a real value for where())
DATE_COLS = ("created_at", "updated_at", "deleted_at")
_OPS = {"=", "<", ">", "<=", ">=", "<>", "!=", "like", "not like", "ilike", "not ilike"}


class _Params:
    def __init__(self):
        self.n = 0
        self.values: dict[str, Any] = {}

    def add(self, v) -> str:
        name = f"p{self.n}"
        self.n += 1
        self.values[name] = _bind(v)
        return ":" + name


def _bind(v):
    if isinstance(v, (_dt.datetime,)):
        return sql_now(v)
    if isinstance(v, (dict, list)):
        return json.dumps(v)
    return v


class QueryBuilder:
    def __init__(self, model_class, conn: Connection, table: str, scoped: bool = True, params: _Params | None = None):
        self.model_class = model_class                  # None -> rows come back as plain dicts
        self.conn = conn
        self.table = table
        self._params = params or _Params()
        self._wheres: list[tuple[str, str]] = []
        self._select: list[str] = ["*"]
        self._orders: list[tuple[str, str]] = []
        self._limit: int | None = None
        self._offset: int | None = None
        self._scope: tuple[str, str] | None = None
        if scoped and model_class is not None and model_class.soft_deletes:
            self._scope = ("and", f"{qi(table)}.{qi('deleted_at')} IS NULL")
            self._wheres.append(self._scope)

    # ── where family ──
    def _add(self, boolean: str, sql: str) -> "QueryBuilder":
        self._wheres.append((boolean, sql))
        return self

    def _cmp(self, boolean: str, col: str, op: str, v) -> "QueryBuilder":
        op = str(op).lower()
        if op not in _OPS:
            raise ValueError(f"Unsupported operator: {op!r}")
        if v is None and op in ("=", "!=", "<>"):
            return self._add(boolean, f"{qi(col)} IS {'NOT ' if op != '=' else ''}NULL")
        return self._add(boolean, f"{qi(col)} {op.upper()} {self._params.add(v)}")

    def _group(self, boolean: str, fn: Callable[["QueryBuilder"], Any]) -> "QueryBuilder":
        child = QueryBuilder(self.model_class, self.conn, self.table, scoped=False, params=self._params)
        fn(child)
        sql = child._where_sql()
        return self._add(boolean, f"({sql})") if sql else self

    def where(self, col, op_or_val=_U, val=_U) -> "QueryBuilder":
        if callable(col):
            return self._group("and", col)
        if isinstance(col, dict):
            for k, v in col.items():
                self._cmp("and", k, "=", v)
            return self
        if op_or_val is _U:
            raise TypeError("where() needs a value")
        if val is _U:
            return self._cmp("and", col, "=", op_or_val)
        return self._cmp("and", col, op_or_val, val)

    def or_where(self, col, op_or_val=_U, val=_U) -> "QueryBuilder":
        if callable(col):
            return self._group("or", col)
        if op_or_val is _U:
            raise TypeError("or_where() needs a value")
        if val is _U:
            return self._cmp("or", col, "=", op_or_val)
        return self._cmp("or", col, op_or_val, val)

    def where_in(self, col: str, vals: list) -> "QueryBuilder":
        vals = list(vals)
        if not vals:
            return self._add("and", "1 = 0")
        return self._add("and", f"{qi(col)} IN ({', '.join(self._params.add(v) for v in vals)})")

    def where_not_in(self, col: str, vals: list) -> "QueryBuilder":
        vals = list(vals)
        if not vals:
            return self._add("and", "1 = 1")
        return self._add("and", f"{qi(col)} NOT IN ({', '.join(self._params.add(v) for v in vals)})")

    def where_null(self, col: str) -> "QueryBuilder":
        return self._add("and", f"{qi(col)} IS NULL")

    def where_not_null(self, col: str) -> "QueryBuilder":
        return self._add("and", f"{qi(col)} IS NOT NULL")

    def where_between(self, col: str, rng) -> "QueryBuilder":
        a, b = rng
        return self._add("and", f"{qi(col)} BETWEEN {self._params.add(a)} AND {self._params.add(b)}")

    def where_raw(self, sql: str, bindings: list | None = None) -> "QueryBuilder":
        parts = sql.split("?")
        out = parts[0]
        for i, b in enumerate(bindings or []):
            out += self._params.add(b) + parts[i + 1]
        return self._add("and", f"({out})")

    def when(self, cond, cb) -> "QueryBuilder":
        if cond:
            cb(self, cond)
        return self

    def _where_sql(self) -> str:
        out = ""
        for i, (b, sql) in enumerate(self._wheres):
            out += sql if i == 0 else f" {b.upper()} {sql}"
        return out

    # ── shaping ──
    def select(self, *cols: str) -> "QueryBuilder":
        self._select = list(cols) or ["*"]
        return self

    def order_by(self, col: str, direction: str = "asc") -> "QueryBuilder":
        d = str(direction).lower()
        self._orders.append((col, "DESC" if d == "desc" else "ASC"))
        return self

    def latest(self, col: str = "created_at") -> "QueryBuilder":
        return self.order_by(col, "desc")

    def oldest(self, col: str = "created_at") -> "QueryBuilder":
        return self.order_by(col, "asc")

    def limit(self, n: int) -> "QueryBuilder":
        self._limit = int(n)
        return self

    def take(self, n: int) -> "QueryBuilder":
        return self.limit(n)

    def offset(self, n: int) -> "QueryBuilder":
        self._offset = int(n)
        return self

    def with_trashed(self) -> "QueryBuilder":
        if self._scope is not None and self._scope in self._wheres:
            self._wheres.remove(self._scope)
            self._scope = None
        return self

    # ── SQL ──
    def _from_where(self) -> str:
        w = self._where_sql()
        return f"FROM {qi(self.table)}" + (f" WHERE {w}" if w else "")

    def _compile(self, limit: int | None = None, offset: int | None = None) -> str:
        sql = f"SELECT {', '.join(qi(c) for c in self._select)} {self._from_where()}"
        if self._orders:
            sql += " ORDER BY " + ", ".join(f"{qi(c)} {d}" for c, d in self._orders)
        lim = self._limit if limit is None else limit
        off = self._offset if offset is None else offset
        if lim is not None:
            sql += f" LIMIT {int(lim)}"
        if off is not None:
            if lim is None and not is_pg():
                sql += " LIMIT -1"
            sql += f" OFFSET {int(off)}"
        return sql

    def to_sql(self) -> str:
        return self._compile()

    def _rows(self, sql: str) -> list[dict]:
        return self.conn.select(sql, self._params.values)

    def _wrap(self, row: dict):
        return self.model_class.hydrate(row) if self.model_class is not None else row

    # ── reads ──
    async def get(self) -> list:
        return [self._wrap(r) for r in self._rows(self._compile())]

    async def first(self):
        rows = self._rows(self._compile(limit=1))
        return self._wrap(rows[0]) if rows else None

    async def first_or_fail(self):
        m = await self.first()
        if m is None:
            raise ModelNotFoundException(self.model_class.__name__ if self.model_class else self.table)
        return m

    async def find(self, id_):
        pk = self.model_class.primary_key if self.model_class else "id"
        return await self.where(pk, id_).first()

    async def find_or_fail(self, id_):
        m = await self.find(id_)
        if m is None:
            raise ModelNotFoundException(self.model_class.__name__ if self.model_class else self.table, [id_])
        return m

    async def count(self, col: str = "*") -> int:
        rows = self._rows(f"SELECT COUNT({qi(col)}) AS c {self._from_where()}")
        return int(rows[0]["c"] or 0) if rows else 0

    def _agg(self, fn: str, col: str):
        rows = self._rows(f"SELECT {fn}({qi(col)}) AS v {self._from_where()}")
        return rows[0]["v"] if rows else None

    async def sum(self, col: str):
        v = self._agg("SUM", col)
        return 0 if v is None else (float(v) if isinstance(v, (Decimal, float)) else v)

    async def max(self, col: str):
        return self._agg("MAX", col)

    async def min(self, col: str):
        return self._agg("MIN", col)

    async def avg(self, col: str):
        v = self._agg("AVG", col)
        return None if v is None else float(v)

    async def exists(self) -> bool:
        return (await self.count()) > 0

    async def pluck(self, col: str) -> list:
        saved = self._select
        self._select = [col]
        try:
            return [r[col.split(".")[-1]] for r in self._rows(self._compile())]
        finally:
            self._select = saved

    async def paginate(self, per_page=15, page=1, path: str = "") -> dict:
        per_page = max(1, to_int(per_page, 15) or 15)
        page = max(1, to_int(page, 1) or 1)
        total = await self.count()
        rows = self._rows(self._compile(limit=per_page, offset=(page - 1) * per_page))
        data = [self._wrap(r) for r in rows]
        last = max(1, math.ceil(total / per_page))
        url = lambda p: f"{path}?page={p}"
        links = [{"url": url(page - 1) if page > 1 else None, "label": "&laquo; Previous", "active": False}]
        for p in range(1, last + 1):
            links.append({"url": url(p), "label": str(p), "active": p == page})
        links.append({"url": url(page + 1) if page < last else None, "label": "Next &raquo;", "active": False})
        return {
            "current_page": page, "data": data, "first_page_url": url(1),
            "from": (page - 1) * per_page + 1 if data else None,
            "last_page": last, "last_page_url": url(last), "links": links,
            "next_page_url": url(page + 1) if page < last else None, "path": path, "per_page": per_page,
            "prev_page_url": url(page - 1) if page > 1 else None,
            "to": (page - 1) * per_page + len(data) if data else None, "total": total,
        }

    # ── writes ──
    async def update(self, attrs: dict) -> int:
        row = self.model_class.serialize_for_write(dict(attrs)) if self.model_class else _plain(dict(attrs))
        if self.model_class is not None and self.model_class.timestamps:
            row["updated_at"] = sql_now()
        if not row:
            return 0
        sets = ", ".join(f"{qi(k)} = {self._params.add(v)}" for k, v in row.items())
        w = self._where_sql()
        return self.conn.execute(f"UPDATE {qi(self.table)} SET {sets}" + (f" WHERE {w}" if w else ""), self._params.values)

    async def delete(self) -> int:
        if self.model_class is not None and self.model_class.soft_deletes:
            return await self.update_raw({"deleted_at": sql_now()})
        w = self._where_sql()
        return self.conn.execute(f"DELETE FROM {qi(self.table)}" + (f" WHERE {w}" if w else ""), self._params.values)

    async def update_raw(self, row: dict) -> int:
        sets = ", ".join(f"{qi(k)} = {self._params.add(v)}" for k, v in row.items())
        w = self._where_sql()
        return self.conn.execute(f"UPDATE {qi(self.table)} SET {sets}" + (f" WHERE {w}" if w else ""), self._params.values)

    async def insert(self, row: dict):
        return self.conn.insert(self.table, _plain(dict(row)))


def _plain(row: dict) -> dict:
    for k, v in list(row.items()):
        if isinstance(v, (dict, list)):
            row[k] = json.dumps(v)
        elif isinstance(v, _dt.datetime):
            row[k] = sql_now(v)
    return row


class Model:
    table = ""
    connection_name = ""
    primary_key = "id"
    fillable: list[str] = []
    hidden: list[str] = []
    casts: dict[str, str] = {}
    timestamps = True
    soft_deletes = False

    def __init__(self, attrs: dict | None = None):
        object.__setattr__(self, "_attrs", {})
        object.__setattr__(self, "_orig", {})
        object.__setattr__(self, "exists", False)
        self.fill(attrs or {})

    # attribute access: unknown names read / write the row (None when missing, like undefined in JS)
    def __getattr__(self, name: str):
        if name.startswith("_"):
            raise AttributeError(name)
        return self._attrs.get(name)

    def __setattr__(self, name: str, value) -> None:
        if name.startswith("_") or name == "exists" or hasattr(type(self), name):
            object.__setattr__(self, name, value)
        else:
            self._attrs[name] = value

    def __getitem__(self, key):
        return self._attrs.get(key)

    def __setitem__(self, key, value):
        self._attrs[key] = value

    def __repr__(self):
        return f"<{type(self).__name__} {self._attrs}>"

    # ── static entry points ──
    @classmethod
    def conn(cls) -> Connection:
        return connection(cls.connection_name)

    @classmethod
    def query(cls) -> QueryBuilder:
        return QueryBuilder(cls, cls.conn(), cls.table)

    @classmethod
    def hydrate(cls, row: dict):
        m = cls()
        object.__setattr__(m, "exists", True)
        object.__setattr__(m, "_attrs", cls.cast_from_db(row))
        object.__setattr__(m, "_orig", dict(m._attrs))
        return m

    @classmethod
    async def all(cls) -> list:
        return await cls.query().get()

    @classmethod
    def where(cls, *a) -> QueryBuilder:
        return cls.query().where(*a)

    @classmethod
    def where_in(cls, col: str, vals: list) -> QueryBuilder:
        return cls.query().where_in(col, vals)

    @classmethod
    def order_by(cls, col: str, direction: str = "asc") -> QueryBuilder:
        return cls.query().order_by(col, direction)

    @classmethod
    def latest(cls, col: str = "created_at") -> QueryBuilder:
        return cls.query().latest(col)

    @classmethod
    async def find(cls, id_):
        return None if id_ is None else await cls.query().find(id_)

    @classmethod
    async def find_or_fail(cls, id_):
        return await cls.query().find_or_fail(id_)

    @classmethod
    async def first(cls):
        return await cls.query().first()

    @classmethod
    async def count(cls) -> int:
        return await cls.query().count()

    @classmethod
    async def create(cls, attrs: dict):
        m = cls(attrs)
        await m.save()
        return m

    @classmethod
    async def first_or_create(cls, where: dict, extra: dict | None = None):
        found = await cls.query().where(where).first()
        return found if found else await cls.create({**where, **(extra or {})})

    @classmethod
    async def update_or_create(cls, where: dict, values: dict):
        m = await cls.query().where(where).first()
        if m:
            await m.update(values)
            return m
        return await cls.create({**where, **values})

    @classmethod
    async def destroy(cls, id_) -> int:
        m = await cls.find(id_)
        if m:
            await m.delete()
        return 1 if m else 0

    @classmethod
    async def insert(cls, rows: list[dict]) -> None:
        for r in rows:
            row = cls.serialize_for_write(dict(r))
            if cls.timestamps:
                if row.get("created_at") is None:
                    row["created_at"] = sql_now()
                if row.get("updated_at") is None:
                    row["updated_at"] = sql_now()
            cls.conn().insert(cls.table, row, cls.primary_key)

    @classmethod
    async def truncate(cls) -> None:
        cls.conn().execute(f"DELETE FROM {qi(cls.table)}")

    # ── casting ──
    @classmethod
    def cast_from_db(cls, row: dict) -> dict:
        out: dict = {}
        for k, v in row.items():
            c = cls.casts.get(k)
            if v is None:
                out[k] = None
            elif c == "boolean":
                out[k] = v is True or v in (1, "1", "t", "true")
            elif c == "integer":
                out[k] = to_int(v, 0)
            elif c == "float":
                out[k] = float(v)
            elif c == "decimal:2":
                out[k] = f"{float(v):.2f}"
            elif c == "array":
                out[k] = _safe_json(v) if isinstance(v, str) else v
            else:
                out[k] = v
        return out

    @classmethod
    def serialize_for_write(cls, row: dict) -> dict:
        for k, v in list(row.items()):
            if isinstance(v, bool):
                row[k] = v if is_pg() else int(v)
            elif isinstance(v, _dt.datetime):
                row[k] = sql_now(v)
            elif isinstance(v, Decimal):
                row[k] = str(v)
            elif isinstance(v, (dict, list)):
                row[k] = json.dumps(v)
        return row

    # ── instance ──
    def fill(self, attrs: dict):
        c = type(self)
        for k, v in attrs.items():
            if not c.fillable or k in c.fillable:
                self._attrs[k] = v
        return self

    @property
    def id(self):
        return self._attrs.get(type(self).primary_key)

    @id.setter
    def id(self, v):
        self._attrs[type(self).primary_key] = v

    def is_dirty(self) -> bool:
        return self._attrs != self._orig

    async def save(self):
        c = type(self)
        ts = sql_now()
        if not self.exists:
            if c.timestamps:
                if self._attrs.get("created_at") is None:
                    self._attrs["created_at"] = ts
                if self._attrs.get("updated_at") is None:
                    self._attrs["updated_at"] = ts
            row = c.serialize_for_write(dict(self._attrs))
            new_id = c.conn().insert(c.table, row, c.primary_key)
            if self._attrs.get(c.primary_key) is None and new_id is not None:
                self._attrs[c.primary_key] = new_id
            object.__setattr__(self, "exists", True)
        else:
            if c.timestamps:
                self._attrs["updated_at"] = ts
            row = c.serialize_for_write(dict(self._attrs))
            row.pop(c.primary_key, None)
            if row:
                sets = ", ".join(f"{qi(k)} = :v{i}" for i, k in enumerate(row))
                params = {f"v{i}": v for i, v in enumerate(row.values())}
                params["pk"] = self.id
                c.conn().execute(f"UPDATE {qi(c.table)} SET {sets} WHERE {qi(c.primary_key)} = :pk", params)
        object.__setattr__(self, "_orig", dict(self._attrs))
        return self

    async def update(self, attrs: dict):
        self.fill(attrs)
        return await self.save()

    async def delete(self) -> bool:
        c = type(self)
        if c.soft_deletes:
            c.conn().execute(f"UPDATE {qi(c.table)} SET {qi('deleted_at')} = :t WHERE {qi(c.primary_key)} = :pk", {"t": sql_now(), "pk": self.id})
        else:
            c.conn().execute(f"DELETE FROM {qi(c.table)} WHERE {qi(c.primary_key)} = :pk", {"pk": self.id})
        object.__setattr__(self, "exists", False)
        return True

    async def fresh(self):
        return await type(self).find(self.id)

    async def refresh(self):
        f = await self.fresh()
        if f:
            object.__setattr__(self, "_attrs", f._attrs)
            object.__setattr__(self, "_orig", dict(f._attrs))
        return self

    # ── relations (generated models call these) ──
    def belongs_to(self, related, fk: str) -> QueryBuilder:
        return related.query().where(related.primary_key, self._attrs.get(fk))

    def has_many(self, related, fk: str) -> QueryBuilder:
        return related.query().where(fk, self.id)

    def to_json(self) -> dict:
        c = type(self)
        out: dict = {}
        for k, v in self._attrs.items():
            if k in c.hidden:
                continue
            if k in DATE_COLS or c.casts.get(k) in ("date", "datetime"):
                out[k] = to_iso_micro(v)
            else:
                out[k] = v
        return out

    to_dict = to_json


def _safe_json(s: str):
    try:
        return json.loads(s)
    except ValueError:
        return s
