// Laravel-style validation: 'required|string|max:255', arrays, wildcards, unique/exists.
import type { Knex } from 'knex'
import { ValidationException } from './errors'
import { slugToConn } from './support'

type Rules = Record<string, string | string[]>
type Messages = Record<string, string>
interface Ctx { data: Record<string, any>; db?: Knex; slug?: string; files?: Record<string, any> }

const attr = (k: string) => k.replace(/\.\*/g, '').replace(/_/g, ' ').replace(/\./g, ' ')
const isEmpty = (v: any) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)
const getPath = (o: any, p: string) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o)

function expand(rules: Rules, data: any): Rules {
  const out: Rules = {}
  for (const [key, r] of Object.entries(rules)) {
    if (!key.includes('*')) { out[key] = r; continue }
    const walk = (prefix: string, rest: string[], cur: any) => {
      if (!rest.length) { out[prefix] = r; return }
      const [head, ...tail] = rest
      if (head === '*') {
        if (Array.isArray(cur)) cur.forEach((item, i) => walk(prefix ? `${prefix}.${i}` : String(i), tail, item))
      } else walk(prefix ? `${prefix}.${head}` : head, tail, cur?.[head])
    }
    walk('', key.split('.'), data)
  }
  return out
}

const MSG: Record<string, string> = {
  required: 'The :attribute field is required.',
  string: 'The :attribute field must be a string.',
  integer: 'The :attribute field must be an integer.',
  numeric: 'The :attribute field must be a number.',
  boolean: 'The :attribute field must be true or false.',
  email: 'The :attribute field must be a valid email address.',
  url: 'The :attribute field must be a valid URL.',
  array: 'The :attribute field must be an array.',
  date: 'The :attribute field must be a valid date.',
  json: 'The :attribute field must be a valid JSON string.',
  uuid: 'The :attribute field must be a valid UUID.',
  alpha: 'The :attribute field must only contain letters.',
  alpha_num: 'The :attribute field must only contain letters and numbers.',
  alpha_dash: 'The :attribute field must only contain letters, numbers, dashes, and underscores.',
  in: 'The selected :attribute is invalid.',
  not_in: 'The selected :attribute is invalid.',
  exists: 'The selected :attribute is invalid.',
  unique: 'The :attribute has already been taken.',
  regex: 'The :attribute field format is invalid.',
  confirmed: 'The :attribute field confirmation does not match.',
  same: 'The :attribute field and :other must match.',
  different: 'The :attribute field and :other must be different.',
  accepted: 'The :attribute field must be accepted.',
  filled: 'The :attribute field must have a value.',
  digits: 'The :attribute field must be :digits digits.',
  ip: 'The :attribute field must be a valid IP address.',
  file: 'The :attribute field must be a file.',
  image: 'The :attribute field must be an image.',
  mimes: 'The :attribute field must be a file of type: :values.',
}

function sizeOf(v: any, numeric: boolean): number {
  if (typeof v === 'number') return v
  if (numeric && v !== '' && !isNaN(Number(v))) return Number(v)
  if (Array.isArray(v)) return v.length
  if (v && typeof v === 'object' && 'size' in v) return Math.round(v.size / 1024)
  return String(v ?? '').length
}

function sizeMsg(rule: string, v: any, numeric: boolean, key: string, p: string[]): string {
  const kind = Array.isArray(v) ? 'array' : (typeof v === 'number' || numeric) ? 'numeric' : (v && typeof v === 'object' && 'size' in v) ? 'file' : 'string'
  const a = attr(key)
  const unit = { numeric: '', string: ' characters', array: ' items', file: ' kilobytes' }[kind]
  if (rule === 'min')  return `The ${a} field must be at least ${p[0]}${unit}.`
  if (rule === 'max')  return `The ${a} field must not be greater than ${p[0]}${unit}.`
  if (rule === 'size') return `The ${a} field must be ${p[0]}${unit}.`
  if (rule === 'between') return `The ${a} field must be between ${p[0]} and ${p[1]}${unit}.`
  return ''
}

async function check(rule: string, p: string[], v: any, key: string, ctx: Ctx, numeric: boolean): Promise<string | null> {
  const fail = () => (MSG[rule] ?? `The :attribute field is invalid.`).replace(':attribute', attr(key))
  switch (rule) {
    case 'string':  return typeof v === 'string' ? null : fail()
    case 'integer': return (typeof v === 'number' ? Number.isInteger(v) : /^-?\d+$/.test(String(v))) ? null : fail()
    case 'numeric': return v !== '' && v !== null && !isNaN(Number(v)) && typeof v !== 'boolean' ? null : fail()
    case 'boolean': return [true, false, 1, 0, '1', '0', 'true', 'false'].includes(v) ? null : fail()
    case 'accepted': return ['yes', 'on', 1, '1', true, 'true'].includes(v) ? null : fail()
    case 'email':   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) ? null : fail()
    case 'url':     try { new URL(String(v)); return null } catch { return fail() }
    case 'array':   return Array.isArray(v) ? null : fail()
    case 'date':    return !isNaN(Date.parse(String(v))) ? null : fail()
    case 'json':    try { JSON.parse(String(v)); return null } catch { return fail() }
    case 'uuid':    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v)) ? null : fail()
    case 'alpha':   return /^[A-Za-z]+$/.test(String(v)) ? null : fail()
    case 'alpha_num': return /^[A-Za-z0-9]+$/.test(String(v)) ? null : fail()
    case 'alpha_dash': return /^[A-Za-z0-9_-]+$/.test(String(v)) ? null : fail()
    case 'ip':      return /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+$/i.test(String(v)) ? null : fail()
    case 'digits':  return new RegExp(`^\\d{${p[0]}}$`).test(String(v)) ? null : fail().replace(':digits', p[0])
    case 'min':     return sizeOf(v, numeric) >= Number(p[0]) ? null : sizeMsg('min', v, numeric, key, p)
    case 'max':     return sizeOf(v, numeric) <= Number(p[0]) ? null : sizeMsg('max', v, numeric, key, p)
    case 'size':    return sizeOf(v, numeric) === Number(p[0]) ? null : sizeMsg('size', v, numeric, key, p)
    case 'between': { const n = sizeOf(v, numeric); return n >= Number(p[0]) && n <= Number(p[1]) ? null : sizeMsg('between', v, numeric, key, p) }
    case 'gt': case 'gte': case 'lt': case 'lte': {
      const other = isNaN(Number(p[0])) ? Number(getPath(ctx.data, p[0])) : Number(p[0]); const n = Number(v)
      const ok = rule === 'gt' ? n > other : rule === 'gte' ? n >= other : rule === 'lt' ? n < other : n <= other
      return ok ? null : `The ${attr(key)} field must be ${{ gt: 'greater than', gte: 'greater than or equal to', lt: 'less than', lte: 'less than or equal to' }[rule]} ${p[0]}.`
    }
    case 'in':      return p.includes(String(v)) ? null : fail()
    case 'not_in':  return !p.includes(String(v)) ? null : fail()
    case 'regex':   { const m = p.join(',').match(/^\/(.*)\/([a-z]*)$/s); return m && new RegExp(m[1], m[2]).test(String(v)) ? null : fail() }
    case 'confirmed': return v === ctx.data[`${key}_confirmation`] ? null : fail()
    case 'same':    return v === getPath(ctx.data, p[0]) ? null : fail().replace(':other', p[0])
    case 'different': return v !== getPath(ctx.data, p[0]) ? null : fail().replace(':other', p[0])
    case 'file':    return v && typeof v === 'object' && 'size' in v ? null : fail()
    case 'image':   return v && typeof v === 'object' && String(v.mimetype ?? '').startsWith('image/') ? null : fail()
    case 'mimes': case 'mimetypes': {
      const ext = String(v?.originalname ?? '').split('.').pop()?.toLowerCase()
      return v && (p.includes(String(ext)) || p.includes(String(v.mimetype))) ? null : fail().replace(':values', p.join(', '))
    }
    case 'unique': {
      if (!ctx.db) return null
      const [table, col = key.split('.').pop()!, ignore, idCol = 'id'] = p
      const t = await resolveTable(ctx, table)
      const q = ctx.db(t).where(col, v)
      if (ignore && ignore !== 'NULL') q.whereNot(idCol, ignore)
      return (await q.first()) ? fail() : null
    }
    case 'exists': {
      if (!ctx.db) return null
      const [table, col = key.split('.').pop()!] = p
      const t = await resolveTable(ctx, table)
      return (await ctx.db(t).where(col, v).first()) ? null : fail()
    }
    default: return null
  }
}

async function resolveTable(ctx: Ctx, table: string): Promise<string> {
  const t = table.includes('\\') ? table.split('\\').pop()!.toLowerCase() + 's' : table
  if (await ctx.db!.schema.hasTable(t)) return t
  const prefixed = ctx.slug ? `${slugToConn(ctx.slug)}_${t}` : t
  return prefixed
}

export interface ValidateOptions { db?: Knex; slug?: string; messages?: Messages; files?: Record<string, any> }

/** Returns only the keys that have rules (like Laravel's validated()). Throws ValidationException (422). */
export async function validate(data: Record<string, any>, rules: Rules, opts: ValidateOptions = {}): Promise<Record<string, any>> {
  const ctx: Ctx = { data: { ...data, ...(opts.files ?? {}) }, db: opts.db, slug: opts.slug }
  const errors: Record<string, string[]> = {}
  const validated: Record<string, any> = {}

  for (const [key, spec] of Object.entries(expand(rules, ctx.data))) {
    const list = (Array.isArray(spec) ? spec : String(spec).split('|')).map(String).filter(Boolean)
    const parsed = list.map(r => { const i = r.indexOf(':'); return i === -1 ? { n: r, p: [] as string[] } : { n: r.slice(0, i), p: r.slice(i + 1).split(',') } })
    const names = parsed.map(r => r.n)
    const v = getPath(ctx.data, key)

    if (names.includes('sometimes') && v === undefined) continue
    const missing = isEmpty(v)
    const requiredIf = parsed.find(r => r.n === 'required_if')
    const mustHave = names.includes('required') || (requiredIf && String(getPath(ctx.data, requiredIf.p[0])) === requiredIf.p[1])
    if (missing) {
      if (mustHave) (errors[key] ??= []).push(opts.messages?.[`${key}.required`] ?? MSG.required.replace(':attribute', attr(key)))
      else if (names.includes('filled') && v !== undefined) (errors[key] ??= []).push(MSG.filled.replace(':attribute', attr(key)))
      continue
    }
    const numeric = names.includes('numeric') || names.includes('integer')
    for (const r of parsed) {
      if (['required', 'nullable', 'sometimes', 'bail', 'filled', 'required_if'].includes(r.n)) continue
      const m = await check(r.n, r.p, v, key, ctx, numeric)
      if (m) { (errors[key] ??= []).push(opts.messages?.[`${key}.${r.n}`] ?? m); if (names.includes('bail')) break }
    }
    if (!errors[key]) {
      const parts = key.split('.'); let cur = validated
      parts.forEach((pt, i) => { if (i === parts.length - 1) cur[pt] = v; else cur = (cur[pt] ??= /^\d+$/.test(parts[i + 1]) ? [] : {}) })
    }
  }
  if (Object.keys(errors).length) throw new ValidationException(errors)
  return validated
}
