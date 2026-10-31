// Eloquent-like Model + QueryBuilder on top of knex.
import type { Knex } from 'knex'
import { connection, isPg } from './database'
import { sqlNow, toIsoMicro } from './support'
import { ModelNotFoundException } from './errors'

type Attrs = Record<string, any>

export interface Paginator<T = any> {
  current_page: number; data: T[]; first_page_url: string; from: number | null
  last_page: number; last_page_url: string
  links: { url: string | null; label: string; active: boolean }[]
  next_page_url: string | null; path: string; per_page: number
  prev_page_url: string | null; to: number | null; total: number
}

const DATE_COLS = ['created_at', 'updated_at', 'deleted_at']

export class QueryBuilder<M extends Model = Model> {
  constructor(public modelClass: typeof Model, public q: Knex.QueryBuilder, private scoped = true) {
    if (scoped && modelClass.softDeletes) this.q.whereNull(`${modelClass.table}.deleted_at`)
  }

  // ── where family ──
  private wrap(fn: (qb: QueryBuilder<any>) => void) {
    const mc = this.modelClass
    return function (this: Knex.QueryBuilder) { fn(new QueryBuilder(mc, this, false)) }
  }
  where(col: string | Attrs | ((qb: QueryBuilder<any>) => void), opOrVal?: any, val?: any): this {
    if (typeof col === 'function') this.q.where(this.wrap(col as (qb: QueryBuilder<any>) => void))
    else if (typeof col === 'object') this.q.where(this.prepare(col))
    else if (val === undefined) this.q.where(col, this.prep(opOrVal))
    else this.q.where(col, opOrVal, this.prep(val))
    return this
  }
  orWhere(col: string | ((qb: QueryBuilder<any>) => void), opOrVal?: any, val?: any): this {
    if (typeof col === 'function') this.q.orWhere(this.wrap(col))
    else if (val === undefined) this.q.orWhere(col, this.prep(opOrVal))
    else this.q.orWhere(col, opOrVal, this.prep(val))
    return this
  }
  whereIn(col: string, vals: any[])    { this.q.whereIn(col, vals); return this }
  whereNotIn(col: string, vals: any[]) { this.q.whereNotIn(col, vals); return this }
  whereNull(col: string)     { this.q.whereNull(col); return this }
  whereNotNull(col: string)  { this.q.whereNotNull(col); return this }
  whereBetween(col: string, r: [any, any]) { this.q.whereBetween(col, r); return this }
  whereRaw(sql: string, b: any[] = []) { this.q.whereRaw(sql, b); return this }
  when(cond: any, cb: (qb: this, v: any) => void): this { if (cond) cb(this, cond); return this }

  // ── shaping ──
  select(...cols: string[]) { this.q.select(...cols); return this }
  orderBy(col: string, dir: 'asc' | 'desc' = 'asc') { this.q.orderBy(col, dir); return this }
  latest(col = 'created_at')  { this.q.orderBy(col, 'desc'); return this }
  oldest(col = 'created_at')  { this.q.orderBy(col, 'asc'); return this }
  limit(n: number)  { this.q.limit(n); return this }
  take(n: number)   { return this.limit(n) }
  offset(n: number) { this.q.offset(n); return this }
  withTrashed() {
    // rebuild without the soft-delete scope
    this.q = connection(this.modelClass.connectionName).table(this.modelClass.table)
    return this
  }

  // ── reads ──
  async get(): Promise<M[]> {
    const rows = await this.q
    return rows.map((r: Attrs) => this.modelClass.hydrate(r) as M)
  }
  async first(): Promise<M | null> {
    const r = await this.q.clone().first()
    return r ? (this.modelClass.hydrate(r) as M) : null
  }
  async firstOrFail(): Promise<M> {
    const m = await this.first()
    if (!m) throw new ModelNotFoundException(this.modelClass.name)
    return m
  }
  async find(id: any): Promise<M | null> { return this.where(this.modelClass.primaryKey, id).first() }
  async findOrFail(id: any): Promise<M> {
    const m = await this.find(id)
    if (!m) throw new ModelNotFoundException(this.modelClass.name, [id])
    return m
  }
  async count(col = '*'): Promise<number> {
    const r: any = await this.q.clone().clearSelect().clearOrder().count({ c: col }).first()
    return Number(r?.c ?? 0)
  }
  async sum(col: string) { const r: any = await this.q.clone().clearOrder().sum({ v: col }).first(); return Number(r?.v ?? 0) }
  async max(col: string) { const r: any = await this.q.clone().clearOrder().max({ v: col }).first(); return r?.v ?? null }
  async min(col: string) { const r: any = await this.q.clone().clearOrder().min({ v: col }).first(); return r?.v ?? null }
  async avg(col: string) { const r: any = await this.q.clone().clearOrder().avg({ v: col }).first(); return r?.v === null ? null : Number(r?.v) }
  async exists() { return (await this.count()) > 0 }
  async pluck(col: string) { return (await this.q.clone().pluck(col)) as any[] }

  async paginate(perPage = 15, page = 1, path = ''): Promise<Paginator<M>> {
    perPage = Math.max(1, Number(perPage) || 15)
    page    = Math.max(1, Number(page) || 1)
    const total = await this.count()
    const rows  = await this.q.clone().limit(perPage).offset((page - 1) * perPage)
    const data  = rows.map((r: Attrs) => this.modelClass.hydrate(r) as M)
    const last  = Math.max(1, Math.ceil(total / perPage))
    const url   = (p: number) => `${path}?page=${p}`
    const links: Paginator['links'] = [{ url: page > 1 ? url(page - 1) : null, label: '&laquo; Previous', active: false }]
    for (let p = 1; p <= last; p++) links.push({ url: url(p), label: String(p), active: p === page })
    links.push({ url: page < last ? url(page + 1) : null, label: 'Next &raquo;', active: false })
    return {
      current_page: page, data, first_page_url: url(1),
      from: data.length ? (page - 1) * perPage + 1 : null,
      last_page: last, last_page_url: url(last), links,
      next_page_url: page < last ? url(page + 1) : null, path, per_page: perPage,
      prev_page_url: page > 1 ? url(page - 1) : null,
      to: data.length ? (page - 1) * perPage + data.length : null, total,
    }
  }

  // ── writes ──
  async update(attrs: Attrs): Promise<number> {
    const row = this.modelClass.serializeForWrite({ ...attrs })
    if (this.modelClass.timestamps) row.updated_at = sqlNow()
    return await this.q.update(row)
  }
  async delete(): Promise<number> {
    if (this.modelClass.softDeletes) return await this.q.update({ deleted_at: sqlNow() })
    return await this.q.delete()
  }

  private prep(v: any) { return typeof v === 'boolean' && !isPg() ? (v ? 1 : 0) : v }
  private prepare(o: Attrs) { return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, this.prep(v)])) }
  toSql() { return this.q.toSQL().sql }
}

export class Model {
  static table = ''
  static connectionName = ''
  static primaryKey = 'id'
  static fillable: string[] = []
  static hidden: string[] = []
  static casts: Record<string, string> = {}
  static timestamps = true
  static softDeletes = false;

  [key: string]: any
  __attrs: Attrs = {}
  __orig:  Attrs = {}
  exists = false

  constructor(attrs: Attrs = {}) {
    this.fill(attrs)
    return new Proxy(this, {
      get: (t, p: string | symbol, r) => {
        if (typeof p === 'symbol' || p in t) return Reflect.get(t, p, r)
        return t.getAttribute(p)
      },
      set: (t, p: string | symbol, v, r) => {
        if (typeof p === 'symbol' || p in t || p.startsWith('__')) return Reflect.set(t, p, v, r)
        t.setAttribute(p, v); return true
      },
    })
  }

  private get cls() { return this.constructor as typeof Model }

  // ── static entry points ──
  static conn(): Knex { return connection(this.connectionName) }
  static query<T extends Model>(this: new (a?: Attrs) => T): QueryBuilder<T> {
    const c = this as unknown as typeof Model
    return new QueryBuilder<T>(c, c.conn().table(c.table))
  }
  static hydrate(row: Attrs): Model {
    const m = new this(); m.exists = true
    m.__attrs = this.castFromDb(row); m.__orig = { ...m.__attrs }
    return m
  }
  static async all<T extends Model>(this: new (a?: Attrs) => T): Promise<T[]> { return (this as any).query().get() }
  static where<T extends Model>(this: new (a?: Attrs) => T, ...a: any[]) { return (this as any).query().where(...a) as QueryBuilder<T> }
  static whereIn<T extends Model>(this: new (a?: Attrs) => T, c: string, v: any[]) { return (this as any).query().whereIn(c, v) as QueryBuilder<T> }
  static orderBy<T extends Model>(this: new (a?: Attrs) => T, c: string, d?: 'asc' | 'desc') { return (this as any).query().orderBy(c, d) as QueryBuilder<T> }
  static latest<T extends Model>(this: new (a?: Attrs) => T, c?: string) { return (this as any).query().latest(c) as QueryBuilder<T> }
  static async find<T extends Model>(this: new (a?: Attrs) => T, id: any): Promise<T | null> { return id == null ? null : (this as any).query().find(id) }
  static async findOrFail<T extends Model>(this: new (a?: Attrs) => T, id: any): Promise<T> { return (this as any).query().findOrFail(id) }
  static async first<T extends Model>(this: new (a?: Attrs) => T): Promise<T | null> { return (this as any).query().first() }
  static async count(this: any) { return this.query().count() }
  static async create<T extends Model>(this: new (a?: Attrs) => T, attrs: Attrs): Promise<T> {
    const m = new this(attrs); await m.save(); return m
  }
  static async firstOrCreate<T extends Model>(this: any, where: Attrs, extra: Attrs = {}): Promise<T> {
    return (await this.query().where(where).first()) ?? this.create({ ...where, ...extra })
  }
  static async updateOrCreate<T extends Model>(this: any, where: Attrs, values: Attrs): Promise<T> {
    const m = await this.query().where(where).first()
    if (m) { await m.update(values); return m }
    return this.create({ ...where, ...values })
  }
  static async destroy(this: any, id: any) { const m = await this.find(id); if (m) await m.delete(); return m ? 1 : 0 }
  static async insert(this: any, rows: Attrs[]) {
    const prepared = rows.map(r => {
      const row = this.serializeForWrite({ ...r })
      if (this.timestamps) { row.created_at ??= sqlNow(); row.updated_at ??= sqlNow() }
      return row
    })
    await this.conn().table(this.table).insert(prepared)
  }
  static async truncate(this: any) { await this.conn().table(this.table).del() }

  // ── casting ──
  static castFromDb(row: Attrs): Attrs {
    const out: Attrs = {}
    for (const [k, v] of Object.entries(row)) {
      const c = this.casts[k]
      if (v === null || v === undefined) { out[k] = null; continue }
      switch (c) {
        case 'boolean':  out[k] = v === true || v === 1 || v === '1' || v === 't' || v === 'true'; break
        case 'integer':  out[k] = parseInt(String(v), 10); break
        case 'float':    out[k] = parseFloat(String(v)); break
        case 'decimal:2': out[k] = Number(v).toFixed(2); break
        case 'array':    out[k] = typeof v === 'string' ? safeJson(v) : v; break
        default:         out[k] = v
      }
    }
    return out
  }
  static serializeForWrite(row: Attrs): Attrs {
    for (const [k, v] of Object.entries(row)) {
      if (typeof v === 'boolean') row[k] = isPg() ? v : (v ? 1 : 0)
      else if (v instanceof Date) row[k] = sqlNow(v)
      else if (v !== null && typeof v === 'object') row[k] = JSON.stringify(v)
    }
    return row
  }

  // ── instance ──
  fill(attrs: Attrs): this {
    for (const [k, v] of Object.entries(attrs)) {
      if (this.cls.fillable.length === 0 || this.cls.fillable.includes(k)) this.__attrs[k] = v
    }
    return this
  }
  getAttribute(k: string)         { return this.__attrs[k] }
  setAttribute(k: string, v: any) { this.__attrs[k] = v }
  get id() { return this.__attrs[this.cls.primaryKey] }
  isDirty() { return JSON.stringify(this.__attrs) !== JSON.stringify(this.__orig) }

  async save(): Promise<this> {
    const c = this.cls
    const ts = sqlNow()
    if (!this.exists) {
      if (c.timestamps) { this.__attrs.created_at ??= ts; this.__attrs.updated_at ??= ts }
      const row = c.serializeForWrite({ ...this.__attrs })
      if (isPg()) {
        const r = await c.conn().table(c.table).insert(row).returning(c.primaryKey)
        const first: any = r[0]
        this.__attrs[c.primaryKey] = typeof first === 'object' ? first[c.primaryKey] : first
      } else {
        const r = await c.conn().table(c.table).insert(row)
        if (this.__attrs[c.primaryKey] === undefined) this.__attrs[c.primaryKey] = r[0]
      }
      this.exists = true
    } else {
      if (c.timestamps) this.__attrs.updated_at = ts
      const row = c.serializeForWrite({ ...this.__attrs })
      delete row[c.primaryKey]
      await c.conn().table(c.table).where(c.primaryKey, this.id).update(row)
    }
    this.__orig = { ...this.__attrs }
    return this
  }
  async update(attrs: Attrs): Promise<this> { this.fill(attrs); return this.save() }
  async delete(): Promise<boolean> {
    const c = this.cls
    if (c.softDeletes) await c.conn().table(c.table).where(c.primaryKey, this.id).update({ deleted_at: sqlNow() })
    else await c.conn().table(c.table).where(c.primaryKey, this.id).delete()
    this.exists = false
    return true
  }
  async fresh(): Promise<this | null> { return (await (this.cls as any).find(this.id)) as this | null }
  async refresh(): Promise<this> { const f = await this.fresh(); if (f) { this.__attrs = f.__attrs; this.__orig = { ...f.__attrs } } return this }

  // ── relations (generated models call these) ──
  belongsTo<R extends typeof Model>(related: R, fk: string): QueryBuilder<any> {
    return (related as any).query().where(related.primaryKey, this.__attrs[fk])
  }
  hasMany<R extends typeof Model>(related: R, fk: string): QueryBuilder<any> {
    return (related as any).query().where(fk, this.id)
  }

  toJSON(): Attrs {
    const c = this.cls
    const out: Attrs = {}
    for (const [k, v] of Object.entries(this.__attrs)) {
      if (c.hidden.includes(k)) continue
      if (DATE_COLS.includes(k) || ['date', 'datetime'].includes(c.casts[k])) out[k] = toIsoMicro(v)
      else out[k] = v
    }
    return out
  }
}

function safeJson(s: string) { try { return JSON.parse(s) } catch { return s } }
