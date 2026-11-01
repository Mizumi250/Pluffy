"""Applies the DSL `database:<table>` blocks to the tatemono's isolated database.

Same behaviour as Laravel's MigrationBuilder: create missing tables, add missing columns, parents before
children, plus the isolated auth / notification tables. DDL is written per dialect (sqlite / postgres).
"""
from __future__ import annotations

import json

from ..runtime.auth import Hash
from ..runtime.database import Connection, is_pg, qi
from ..runtime.support import BACKEND_DIR, ensure_dir, prefixed_table, sql_now

Any = dict


def sort_by_dependency(dbs: list[Any]) -> list[Any]:
    by_table = {d["table"]: d for d in dbs}
    out: list[Any] = []
    seen: set[str] = set()

    def visit(d: Any, stack: tuple = ()):
        if d["table"] in seen or d["table"] in stack:
            return
        for c in (d.get("columns") or {}).values():
            ref = str(c["foreign"]).split(".")[0] if c.get("foreign") else None
            if ref and ref != d["table"] and ref in by_table:
                visit(by_table[ref], stack + (d["table"],))
        seen.add(d["table"])
        out.append(d)

    for d in dbs:
        visit(d)
    return out


def _sql_type(c: Any) -> str:
    t = c.get("type") or "string"
    pg = is_pg()
    if t == "integer":
        return "INTEGER"
    if t in ("bigInteger", "foreignId"):
        return "BIGINT"
    if t == "string":
        return f"VARCHAR({int(c.get('length') or 255)})"
    if t in ("text", "longText"):
        return "TEXT"
    if t == "decimal":
        return f"NUMERIC({int(c.get('precision') or 8)},{int(c.get('scale') or 2)})"
    if t == "float":
        return "DOUBLE PRECISION" if pg else "REAL"
    if t == "boolean":
        return "BOOLEAN"
    if t == "date":
        return "DATE"
    if t in ("datetime", "timestamp"):
        return "TIMESTAMP" if pg else "DATETIME"
    if t == "json":
        return "JSON" if pg else "TEXT"
    if t == "uuid":
        return "UUID" if pg else "VARCHAR(36)"
    return "VARCHAR(255)"


def _lit(v) -> str:
    if isinstance(v, bool):
        return ("true" if v else "false") if is_pg() else ("1" if v else "0")
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def _column_sql(slug: str, name: str, c: Any, alter: bool) -> str:
    t = c.get("type")
    if c.get("primary") and c.get("autoIncrement") is not False and t in (None, "integer", "bigInteger", "foreignId"):
        return f'{qi(name)} {"SERIAL" if is_pg() else "INTEGER"} PRIMARY KEY' + ("" if is_pg() else " AUTOINCREMENT")
    parts = [qi(name), _sql_type(c)]
    if c.get("primary"):
        parts.append("PRIMARY KEY")
    if c.get("nullable") or alter:
        parts.append("NULL")
    elif not c.get("primary"):
        parts.append("NOT NULL")
    if c.get("default") is not None:
        parts.append(f"DEFAULT {_lit(c['default'])}")
    if c.get("unique"):
        parts.append("UNIQUE")
    if c.get("foreign") and not alter:
        ref_table, _, ref_col = str(c["foreign"]).partition(".")
        parts.append(f"REFERENCES {qi(prefixed_table(slug, ref_table))} ({qi(ref_col or 'id')}) ON DELETE {str(c.get('onDelete') or 'cascade').upper()}")
    return " ".join(parts)


def _ensure_table(db: Connection, slug: str, d: Any, steps: list[str]) -> None:
    table = prefixed_table(slug, d["table"])
    cols: Any = d.get("columns") or {}
    if not db.has_table(table):
        lines: list[str] = []
        # Laravel's $table->id(): added unless the block declares its own primary key.
        if not any(c.get("primary") for c in cols.values()):
            lines.append(f'{qi("id")} {"SERIAL PRIMARY KEY" if is_pg() else "INTEGER PRIMARY KEY AUTOINCREMENT"}')
        for name, c in cols.items():
            lines.append(_column_sql(slug, name, c, False))
        ts = "TIMESTAMP" if is_pg() else "DATETIME"
        if d.get("timestamps") is not False and "created_at" not in cols:
            lines += [f'{qi("created_at")} {ts} NULL', f'{qi("updated_at")} {ts} NULL']
        if d.get("softDeletes") and "deleted_at" not in cols:
            lines.append(f'{qi("deleted_at")} {ts} NULL')
        db.execute(f"CREATE TABLE {qi(table)} (\n  " + ",\n  ".join(lines) + "\n)")
        for idx in d.get("indexes") or []:
            raw = idx if isinstance(idx, list) else (idx.get("columns") or idx.get("column") or [])
            lst = raw if isinstance(raw, list) else [raw]
            if lst:
                unique = isinstance(idx, dict) and idx.get("unique")
                name = f"{table}_{'_'.join(lst)}_{'unique' if unique else 'index'}"
                db.execute(f"CREATE {'UNIQUE ' if unique else ''}INDEX {qi(name)} ON {qi(table)} ({', '.join(qi(x) for x in lst)})")
        steps.append(f"Table created: {table}")
    else:
        have = set(db.column_names(table))
        missing = [(n, c) for n, c in cols.items() if n not in have]
        for n, c in missing:
            db.execute(f"ALTER TABLE {qi(table)} ADD COLUMN {_column_sql(slug, n, c, True)}")
        if missing:
            steps.append(f"Table updated: {table} (+{', '.join(m[0] for m in missing)})")
    out = BACKEND_DIR / "database" / "migrations" / "arkzen" / slug
    ensure_dir(out)
    (out / f"{d['table']}.json").write_text(json.dumps(d, indent=2))


def apply_schema(db: Connection, slug: str, dbs: list[Any], steps: list[str]) -> None:
    for d in sort_by_dependency(dbs):
        _ensure_table(db, slug, d, steps)


def apply_auth_tables(db: Connection, slug: str, has_notifications: bool, steps: list[str]) -> None:
    users = prefixed_table(slug, "users")
    tokens = prefixed_table(slug, "personal_access_tokens")
    notifs = prefixed_table(slug, "notifications")
    pk = "SERIAL PRIMARY KEY" if is_pg() else "INTEGER PRIMARY KEY AUTOINCREMENT"
    ts = "TIMESTAMP" if is_pg() else "DATETIME"
    if not db.has_table(users):
        db.execute(f"""CREATE TABLE {qi(users)} (
  "id" {pk}, "name" VARCHAR(255) NOT NULL, "email" VARCHAR(255) NOT NULL UNIQUE,
  "email_verified_at" {ts} NULL, "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(20) NOT NULL DEFAULT 'user', "remember_token" VARCHAR(100) NULL,
  "created_at" {ts} NULL, "updated_at" {ts} NULL)""")
        steps.append(f"Auth table created: {users}")
    elif not db.has_column(users, "role"):
        db.execute(f"ALTER TABLE {qi(users)} ADD COLUMN \"role\" VARCHAR(20) DEFAULT 'user'")
        steps.append(f"Added role column: {users}")
    if not db.has_table(tokens):
        db.execute(f"""CREATE TABLE {qi(tokens)} (
  "id" {pk}, "tokenable_type" VARCHAR(255) NOT NULL, "tokenable_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL, "token" VARCHAR(64) NOT NULL UNIQUE, "abilities" TEXT NULL,
  "last_used_at" {ts} NULL, "expires_at" {ts} NULL, "created_at" {ts} NULL, "updated_at" {ts} NULL)""")
        db.execute(f'CREATE INDEX {qi(tokens + "_tokenable_id_index")} ON {qi(tokens)} ("tokenable_id")')
        steps.append(f"Auth table created: {tokens}")
    if has_notifications and not db.has_table(notifs):
        db.execute(f"""CREATE TABLE {qi(notifs)} (
  "id" {"UUID" if is_pg() else "VARCHAR(36)"} PRIMARY KEY, "type" VARCHAR(255) NOT NULL,
  "notifiable_type" VARCHAR(255) NOT NULL, "notifiable_id" BIGINT NOT NULL, "data" TEXT NOT NULL,
  "read_at" {ts} NULL, "created_at" {ts} NULL, "updated_at" {ts} NULL)""")
        steps.append(f"Table created: {notifs}")


def seed_auth_users(db: Connection, slug: str, seed, steps: list[str]) -> None:
    users_seed = seed if isinstance(seed, list) else seed.get("users") if isinstance(seed, dict) else None
    if not isinstance(users_seed, list):
        return
    users = prefixed_table(slug, "users")
    for u in users_seed:
        email = u.get("email")
        if not email:
            continue
        row = {"name": u.get("name") or email, "email": email, "password": Hash.make(u.get("password") or "password"),
               "role": u.get("role") or "user", "updated_at": sql_now()}
        existing = db.select(f"SELECT {qi('id')} FROM {qi(users)} WHERE {qi('email')} = :e", {"e": email})
        if existing:
            sets = ", ".join(f"{qi(k)} = :{k}" for k in row)
            db.execute(f"UPDATE {qi(users)} SET {sets} WHERE {qi('email')} = :_e", {**row, "_e": email})
        else:
            db.insert(users, {**row, "created_at": sql_now()})
        steps.append(f"Seeded user: {email} (role: {row['role']})")


def seed_tables(db: Connection, slug: str, dbs: list[Any], steps: list[str]) -> None:
    for d in dbs:
        rows = (d.get("seeder") or {}).get("data") or []
        if not rows:
            continue
        table = prefixed_table(slug, d["table"])
        db.execute(f"DELETE FROM {qi(table)}")
        ts = sql_now()
        for r in rows:
            row = dict(r)
            for k, v in list(row.items()):
                if isinstance(v, bool) and not is_pg():
                    row[k] = 1 if v else 0
                elif isinstance(v, (dict, list)):
                    row[k] = json.dumps(v)
            if d.get("timestamps") is not False:
                row.setdefault("created_at", ts)
                row.setdefault("updated_at", ts)
            db.insert(table, row)
        steps.append(f"Seeded {len(rows)} rows: {table}")
