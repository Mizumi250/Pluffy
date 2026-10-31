// Per-tatemono isolated databases (sqlite file or Postgres database), same
// model as Laravel's ArkzenDatabase.
import knexLib, { Knex } from 'knex'
import * as fs from 'fs'
import * as path from 'path'
import { BACKEND_DIR, slugToConn, env, ensureDir, Log } from './support'

const conns = new Map<string, Knex>()
let main: Knex | null = null

export const driver = (): 'pgsql' | 'sqlite' => env('ARKZEN_DB_DRIVER', 'sqlite') === 'pgsql' ? 'pgsql' : 'sqlite'
export const isPg   = () => driver() === 'pgsql'

export const sqliteFile  = (slug: string) => path.join(BACKEND_DIR, 'database', 'arkzen', `${slug}.sqlite`)
export const pgDatabaseName = (slug: string) => `${env('ARKZEN_DB_PREFIX', 'pluff')}_${slugToConn(slug)}`.toLowerCase()

function pgConfig(database: string) {
  return {
    host:     env('DB_HOST', '127.0.0.1'),
    port:     Number(env('DB_PORT', '5432')),
    user:     env('DB_USERNAME', 'postgres'),
    password: env('DB_PASSWORD', ''),
    database,
  }
}

function make(database: string, file?: string): Knex {
  if (isPg()) return knexLib({ client: 'pg', connection: pgConfig(database), pool: { min: 0, max: 5 } })
  return knexLib({ client: 'better-sqlite3', connection: { filename: file! }, useNullAsDefault: true })
}

/** Connection for one tatemono. Sync: call ensureDatabase() first when the database may not exist. */
export function connection(slug: string): Knex {
  let c = conns.get(slug)
  if (!c) {
    c = make(pgDatabaseName(slug), sqliteFile(slug))
    conns.set(slug, c)
  }
  return c
}

/** Main app database: queue tables, failed jobs. */
export function mainConnection(): Knex {
  if (!main) {
    ensureDir(path.join(BACKEND_DIR, 'database'))
    main = make(env('DB_DATABASE', 'pluff')!, path.join(BACKEND_DIR, 'database', 'pluff.sqlite'))
  }
  return main
}

export async function ensureDatabase(slug: string): Promise<Knex> {
  if (isPg()) {
    const name  = pgDatabaseName(slug)
    const admin = knexLib({ client: 'pg', connection: pgConfig('postgres') })
    try {
      const r = await admin.raw('select 1 from pg_database where datname = ?', [name])
      if (!r.rows.length) { await admin.raw(`create database "${name}"`); Log.info(`Created isolated Postgres database: ${name}`) }
    } finally { await admin.destroy() }
  } else {
    const file = sqliteFile(slug)
    ensureDir(path.dirname(file))
    if (!fs.existsSync(file)) { fs.writeFileSync(file, ''); Log.info(`Created isolated DB: database/arkzen/${slug}.sqlite`) }
  }
  return connection(slug)
}

export async function dropDatabase(slug: string): Promise<void> {
  const c = conns.get(slug)
  if (c) { await c.destroy(); conns.delete(slug) }
  if (isPg()) {
    const admin = knexLib({ client: 'pg', connection: pgConfig('postgres') })
    try { await admin.raw(`drop database if exists "${pgDatabaseName(slug)}" with (force)`) } finally { await admin.destroy() }
  }
  const file = sqliteFile(slug)
  if (fs.existsSync(file)) fs.rmSync(file)
}

/** Shorthand used inside :ts bodies: DB('my-app').table('x') */
export const DB = (slug: string) => connection(slug)
