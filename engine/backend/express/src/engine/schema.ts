// Applies the DSL `database:<table>` blocks to the tatemono's isolated database.
// Same behavior as Laravel's MigrationBuilder: create missing tables, add missing columns,
// parents before children, plus the isolated auth / notification tables.
import type { Knex } from 'knex'
import * as fs from 'fs'
import * as path from 'path'
import { BACKEND_DIR, ensureDir, prefixedTable, slugToConn, sqlNow } from '../runtime/support'
import { Hash } from '../runtime/auth'
import { isPg } from '../runtime/database'

type Any = Record<string, any>

export function sortByDependency(dbs: Any[]): Any[] {
  const byTable = new Map(dbs.map(d => [d.table, d]))
  const out: Any[] = []; const seen = new Set<string>()
  const visit = (d: Any, stack: string[] = []) => {
    if (seen.has(d.table) || stack.includes(d.table)) return
    for (const c of Object.values(d.columns ?? {}) as Any[]) {
      const ref = c.foreign ? String(c.foreign).split('.')[0] : null
      if (ref && ref !== d.table && byTable.has(ref)) visit(byTable.get(ref)!, [...stack, d.table])
    }
    seen.add(d.table); out.push(d)
  }
  dbs.forEach(d => visit(d))
  return out
}

function addColumn(t: Knex.CreateTableBuilder | Knex.AlterTableBuilder, slug: string, name: string, c: Any, alter: boolean) {
  const type = c.type ?? 'string'
  let col: Knex.ColumnBuilder
  if (c.primary && c.autoIncrement !== false && ['integer', 'bigInteger', 'foreignId', undefined].includes(c.type)) {
    (t as Knex.CreateTableBuilder).increments(name); return
  }
  switch (type) {
    case 'integer':    col = t.integer(name); break
    case 'bigInteger': col = t.bigInteger(name); break
    case 'foreignId':  col = t.bigInteger(name).unsigned(); break
    case 'string':     col = t.string(name, c.length ?? 255); break
    case 'text': case 'longText': col = t.text(name, type === 'longText' ? 'longtext' : 'text'); break
    case 'decimal':    col = t.decimal(name, c.precision ?? 8, c.scale ?? 2); break
    case 'float':      col = t.float(name); break
    case 'boolean':    col = t.boolean(name); break
    case 'date':       col = t.date(name); break
    case 'datetime':   col = t.datetime(name); break
    case 'timestamp':  col = t.timestamp(name); break
    case 'json':       col = t.json(name); break
    case 'uuid':       col = t.uuid(name); break
    default:           col = t.string(name)
  }
  if (c.primary) col.primary()
  if (c.nullable || alter) col.nullable(); else if (!c.primary) col.notNullable()
  if (c.default !== undefined && c.default !== null) col.defaultTo(c.default)
  if (c.unique) col.unique()
  if (c.foreign && !alter) {
    const [refTable, refCol = 'id'] = String(c.foreign).split('.')
    col.references(refCol).inTable(prefixedTable(slug, refTable)).onDelete(c.onDelete ?? 'cascade')
  }
}

async function ensureTable(db: Knex, slug: string, d: Any, steps: string[]) {
  const table = prefixedTable(slug, d.table)
  if (!(await db.schema.hasTable(table))) {
    await db.schema.createTable(table, t => {
      // Laravel's $table->id(): added unless the block declares its own primary key.
      if (!Object.values(d.columns ?? {}).some((c: any) => c.primary)) t.increments('id')
      for (const [name, c] of Object.entries(d.columns ?? {}) as [string, Any][]) addColumn(t, slug, name, c, false)
      if (d.timestamps !== false && !d.columns?.created_at) { t.timestamp('created_at').nullable(); t.timestamp('updated_at').nullable() }
      if (d.softDeletes && !d.columns?.deleted_at) t.timestamp('deleted_at').nullable()
      for (const idx of d.indexes ?? []) {
        const cols = Array.isArray(idx) ? idx : (idx.columns ?? idx.column ?? [])
        const list = Array.isArray(cols) ? cols : [cols]
        if (list.length) (idx.unique ? t.unique(list) : t.index(list))
      }
    })
    steps.push(`Table created: ${table}`)
  } else {
    const info = await db(table).columnInfo()
    const missing = Object.entries(d.columns ?? {}).filter(([n]) => !(n in info)) as [string, Any][]
    if (missing.length) {
      await db.schema.alterTable(table, t => { for (const [n, c] of missing) addColumn(t, slug, n, c, true) })
      steps.push(`Table updated: ${table} (+${missing.map(m => m[0]).join(', ')})`)
    }
  }
  const dir = path.join(BACKEND_DIR, 'database', 'migrations', 'arkzen', slug)
  ensureDir(dir)
  fs.writeFileSync(path.join(dir, `${d.table}.json`), JSON.stringify(d, null, 2))
}

export async function applySchema(db: Knex, slug: string, dbs: Any[], steps: string[]) {
  for (const d of sortByDependency(dbs)) await ensureTable(db, slug, d, steps)
}

export async function applyAuthTables(db: Knex, slug: string, hasNotifications: boolean, steps: string[]) {
  const users = prefixedTable(slug, 'users'), tokens = prefixedTable(slug, 'personal_access_tokens'), notifs = prefixedTable(slug, 'notifications')
  if (!(await db.schema.hasTable(users))) {
    await db.schema.createTable(users, t => {
      t.increments('id'); t.string('name').notNullable(); t.string('email').notNullable().unique()
      t.timestamp('email_verified_at').nullable(); t.string('password').notNullable()
      t.string('role', 20).notNullable().defaultTo('user'); t.string('remember_token', 100).nullable()
      t.timestamp('created_at').nullable(); t.timestamp('updated_at').nullable()
    })
    steps.push(`Auth table created: ${users}`)
  } else if (!(await db.schema.hasColumn(users, 'role'))) {
    await db.schema.alterTable(users, t => t.string('role', 20).defaultTo('user')); steps.push(`Added role column: ${users}`)
  }
  if (!(await db.schema.hasTable(tokens))) {
    await db.schema.createTable(tokens, t => {
      t.increments('id'); t.string('tokenable_type').notNullable(); t.bigInteger('tokenable_id').notNullable().index()
      t.string('name').notNullable(); t.string('token', 64).notNullable().unique(); t.text('abilities').nullable()
      t.timestamp('last_used_at').nullable(); t.timestamp('expires_at').nullable()
      t.timestamp('created_at').nullable(); t.timestamp('updated_at').nullable()
    })
    steps.push(`Auth table created: ${tokens}`)
  }
  if (hasNotifications && !(await db.schema.hasTable(notifs))) {
    await db.schema.createTable(notifs, t => {
      t.uuid('id').primary(); t.string('type').notNullable(); t.string('notifiable_type').notNullable(); t.bigInteger('notifiable_id').notNullable()
      t.text('data').notNullable(); t.timestamp('read_at').nullable(); t.timestamp('created_at').nullable(); t.timestamp('updated_at').nullable()
    })
    steps.push(`Table created: ${notifs}`)
  }
}

export async function seedAuthUsers(db: Knex, slug: string, seed: Any[] | null | undefined, steps: string[]) {
  if (!Array.isArray(seed)) return
  const users = prefixedTable(slug, 'users')
  for (const u of seed) {
    const email = u.email; if (!email) continue
    const row = { name: u.name ?? email, email, password: Hash.make(u.password ?? 'password'), role: u.role ?? 'user', updated_at: sqlNow() }
    const existing = await db(users).where({ email }).first()
    if (existing) await db(users).where({ email }).update(row)
    else await db(users).insert({ ...row, created_at: sqlNow() })
    steps.push(`Seeded user: ${email} (role: ${row.role})`)
  }
}

export async function seedTables(db: Knex, slug: string, dbs: Any[], steps: string[]) {
  for (const d of dbs) {
    const rows: Any[] = d.seeder?.data ?? []
    if (!rows.length) continue
    const table = prefixedTable(slug, d.table)
    const c: any = await db(table).count({ c: '*' }).first()
    if (Number(c?.c ?? 0) > 0) continue
    const ts = sqlNow()
    await db(table).insert(rows.map(r => {
      const row: Any = { ...r }
      for (const [k, v] of Object.entries(row)) if (typeof v === 'boolean' && !isPg()) row[k] = v ? 1 : 0; else if (v && typeof v === 'object') row[k] = JSON.stringify(v)
      if (d.timestamps !== false) { row.created_at ??= ts; row.updated_at ??= ts }
      return row
    }))
    steps.push(`Seeded ${rows.length} rows: ${table}`)
  }
  void slugToConn
}
