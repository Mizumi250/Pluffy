"""Per-tatemono isolated databases (sqlite file or Postgres database), same model as Laravel's ArkzenDatabase.

SQLAlchemy is only the driver / DDL layer here. Queries are built by `QueryBuilder` (model.py) as flat,
parameterised SQL so `where(a).or_where(b).where(c)` means `a OR b AND c`, exactly like Laravel / knex.
"""
from __future__ import annotations

import os
import re
from pathlib import Path

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.engine import Engine

from .support import BACKEND_DIR, Log, ensure_dir, env, slug_to_conn

__all__ = [
    "driver", "is_pg", "sqlite_file", "pg_database_name", "connection", "main_connection",
    "ensure_database", "drop_database", "DB", "Connection", "qi",
]

_IDENT = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def qi(name: str) -> str:
    """Quote an identifier ('t.col' and '*' allowed). Rejects anything that is not a plain identifier."""
    if name == "*":
        return "*"
    # SQLite silently treats a double-quoted unknown identifier as a string literal ("name" -> 'name'),
    # which would turn a wrong column into an empty result. Backticks make it a real "no such column" error.
    quote = '"' if is_pg() else "`"
    parts = str(name).split(".")
    out = []
    for p in parts:
        if p == "*":
            out.append("*")
        elif _IDENT.match(p):
            out.append(f"{quote}{p}{quote}")
        else:
            raise ValueError(f"Invalid identifier: {name!r}")
    return ".".join(out)


def driver() -> str:
    return "pgsql" if env("ARKZEN_DB_DRIVER", "sqlite") == "pgsql" else "sqlite"


def is_pg() -> bool:
    return driver() == "pgsql"


def sqlite_file(slug: str) -> Path:
    return BACKEND_DIR / "database" / "arkzen" / f"{slug}.sqlite"


def pg_database_name(slug: str) -> str:
    return f"{env('ARKZEN_DB_PREFIX', 'pluff')}_{slug_to_conn(slug)}".lower()


def _pg_url(database: str) -> str:
    from urllib.parse import quote_plus
    user = quote_plus(env("DB_USERNAME", "postgres") or "postgres")
    pw = quote_plus(env("DB_PASSWORD", "") or "")
    host = env("DB_HOST", "127.0.0.1")
    port = env("DB_PORT", "5432")
    auth = f"{user}:{pw}" if pw else user
    return f"postgresql+psycopg://{auth}@{host}:{port}/{database}"


def _make_engine(database: str, file: Path | None) -> Engine:
    if is_pg():
        return create_engine(_pg_url(database), pool_size=5, max_overflow=0)
    eng = create_engine(f"sqlite:///{file}", connect_args={"timeout": 15, "check_same_thread": False})

    @event.listens_for(eng, "connect")
    def _pragmas(dbapi_con, _rec):          # knex/better-sqlite3 enforce foreign keys; keep that behaviour
        cur = dbapi_con.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()

    return eng


class Connection:
    """Thin wrapper around an Engine: parameterised SQL in, plain dicts out."""

    def __init__(self, engine: Engine, slug: str):
        self.engine = engine
        self.slug = slug

    # ── raw SQL ──
    def select(self, sql: str, params: dict | None = None) -> list[dict]:
        with self.engine.begin() as c:
            res = c.execute(text(sql), params or {})
            return [dict(r._mapping) for r in res]

    def execute(self, sql: str, params: dict | None = None) -> int:
        with self.engine.begin() as c:
            return c.execute(text(sql), params or {}).rowcount

    def insert(self, table: str, row: dict, pk: str = "id"):
        """INSERT one row and return the new primary key (None when the table has no auto key)."""
        cols = list(row.keys())
        if cols:
            sql = f"INSERT INTO {qi(table)} ({', '.join(qi(c) for c in cols)}) VALUES ({', '.join(':i' + str(i) for i in range(len(cols)))})"
            params = {f"i{i}": row[c] for i, c in enumerate(cols)}
        else:
            sql, params = f"INSERT INTO {qi(table)} DEFAULT VALUES", {}
        with self.engine.begin() as c:
            if is_pg():
                res = c.execute(text(sql + f" RETURNING {qi(pk)}"), params)
                r = res.first()
                return r[0] if r else None
            return c.execute(text(sql), params).lastrowid

    # ── schema helpers ──
    def has_table(self, name: str) -> bool:
        return inspect(self.engine).has_table(name)

    def column_names(self, table: str) -> list[str]:
        return [c["name"] for c in inspect(self.engine).get_columns(table)]

    def has_column(self, table: str, column: str) -> bool:
        return column in self.column_names(table)

    def table(self, name: str):
        """DB('slug').table('x').where(...).get(): fluent access without a model (rows come back as dicts)."""
        from .model import QueryBuilder
        return QueryBuilder(None, self, name)

    def dispose(self) -> None:
        self.engine.dispose()


_conns: dict[str, Connection] = {}
_main: Connection | None = None


def connection(slug: str) -> Connection:
    """Connection for one tatemono. Call ensure_database() first when the database may not exist."""
    c = _conns.get(slug)
    if c is None:
        c = Connection(_make_engine(pg_database_name(slug), sqlite_file(slug)), slug)
        _conns[slug] = c
    return c


def main_connection() -> Connection:
    """Main app database: queue tables, failed jobs."""
    global _main
    if _main is None:
        ensure_dir(BACKEND_DIR / "database")
        _main = Connection(_make_engine(env("DB_DATABASE", "pluff") or "pluff", BACKEND_DIR / "database" / "pluff.sqlite"), "main")
    return _main


def ensure_database(slug: str) -> Connection:
    if is_pg():
        name = pg_database_name(slug)
        admin = create_engine(_pg_url("postgres"), isolation_level="AUTOCOMMIT")
        try:
            with admin.connect() as c:
                exists = c.execute(text("select 1 from pg_database where datname = :n"), {"n": name}).first()
                if not exists:
                    c.execute(text(f'create database "{name}"'))
                    Log.info(f"Created isolated Postgres database: {name}")
        finally:
            admin.dispose()
    else:
        f = sqlite_file(slug)
        ensure_dir(f.parent)
        if not f.exists():
            f.write_text("")
            Log.info(f"Created isolated DB: database/arkzen/{slug}.sqlite")
    return connection(slug)


def drop_database(slug: str) -> None:
    c = _conns.pop(slug, None)
    if c:
        c.dispose()
    if is_pg():
        admin = create_engine(_pg_url("postgres"), isolation_level="AUTOCOMMIT")
        try:
            with admin.connect() as conn:
                conn.execute(text(f'drop database if exists "{pg_database_name(slug)}" with (force)'))
        finally:
            admin.dispose()
    f = sqlite_file(slug)
    for suffix in ("", "-wal", "-shm", "-journal"):
        p = Path(str(f) + suffix)
        if p.exists():
            os.remove(p)


def DB(slug: str) -> Connection:
    """Shorthand used inside :py bodies: DB('my-app').table('x')"""
    return connection(slug)
