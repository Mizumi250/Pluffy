// Shared helpers for the Express runtime (Laravel-like support layer).
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

export const BACKEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const REPO_ROOT   = path.resolve(BACKEND_DIR, '..', '..', '..')
dotenv.config({ path: path.join(BACKEND_DIR, '.env') })

export const studly      = (s: string) => s.replace(/[-_]+/g, ' ').replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1)).replace(/\s+/g, '')
export const slugToConn  = (slug: string) => slug.replace(/-/g, '_')
export const prefixedTable = (slug: string, raw: string) => {
  const p = slugToConn(slug)
  return raw.startsWith(p + '_') ? raw : `${p}_${raw}`
}
export const lcfirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
export const snake   = (s: string) => s.replace(/(?<!^)[A-Z]/g, m => '_' + m).toLowerCase()

/** 'YYYY-MM-DD HH:mm:ss' in UTC, the format Laravel writes to sqlite. */
export function sqlNow(d: Date = new Date()): string {
  return d.toISOString().slice(0, 19).replace('T', ' ')
}
export const now = () => new Date()

/** Laravel serialises timestamps as 2026-10-30T07:54:06.000000Z */
export function toIsoMicro(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null
  let d: Date
  if (v instanceof Date) d = v
  else {
    const s = String(v)
    d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s.replace(' ', 'T') + 'Z')
  }
  if (isNaN(d.getTime())) return String(v)
  return d.toISOString().replace('Z', '000Z')
}

export const Log = {
  info:  (m: string, ctx?: unknown) => console.log(`[Pluff] ${m}`, ctx ?? ''),
  warn:  (m: string, ctx?: unknown) => console.warn(`[Pluff] ⚠ ${m}`, ctx ?? ''),
  error: (m: string, ctx?: unknown) => console.error(`[Pluff] ✖ ${m}`, ctx ?? ''),
}

export const env = (key: string, def?: string) => process.env[key] ?? def

export function ensureDir(dir: string) { fs.mkdirSync(dir, { recursive: true }) }
