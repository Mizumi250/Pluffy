// Request / response layer: Laravel-shaped request helpers on top of Express.
import type { Request as ExReq, Response as ExRes, NextFunction, RequestHandler } from 'express'
import { connection } from './database'
import { validate } from './validation'
import { HttpException, ValidationException, AuthenticationException, AuthorizationException, ModelNotFoundException } from './errors'
import { Log } from './support'

export class JsonResponse {
  constructor(public body: any, public status = 200, public headers: Record<string, string> = {}) {}
}
export class RawResponse {
  constructor(public body: any, public status = 200, public headers: Record<string, string> = {}) {}
}

/** `response.json(...)`, same shape as Laravel's response()->json(...) */
export const response = {
  json:      (data: any, status = 200, headers: Record<string, string> = {}) => new JsonResponse(data, status, headers),
  noContent: (status = 204) => new RawResponse('', status),
  make:      (body: any, status = 200, headers: Record<string, string> = {}) => new RawResponse(body, status, headers),
}
export type ResponseFactory = typeof response

export class Request {
  [key: string]: any
  user_: any = null
  constructor(public raw: ExReq, public slug = '') {
    return new Proxy(this, {
      get: (t, p: string | symbol, r) => (typeof p === 'symbol' || p in t) ? Reflect.get(t, p, r) : t.input(p),
    })
  }
  get method_() { return this.raw.method }
  all(): Record<string, any> { return { ...(this.raw.query as any), ...(this.raw.body ?? {}), ...(this.raw.params ?? {}) } }
  input(key?: string, def: any = null) {
    if (!key) return this.all()
    const v = this.all()[key]
    return v === undefined ? def : v
  }
  get(key: string, def: any = null) { return this.input(key, def) }
  query(key?: string, def: any = null) { return key ? (this.raw.query[key] ?? def) : this.raw.query }
  has(key: string | string[]) { return (Array.isArray(key) ? key : [key]).every(k => this.all()[k] !== undefined) }
  filled(key: string) { const v = this.all()[key]; return !(v === undefined || v === null || v === '') }
  boolean(key: string) { return ['1', 'true', 'on', 'yes', 1, true].includes(this.all()[key]) }
  only(...keys: string[]) { const a = this.all(); return Object.fromEntries(keys.flat().filter(k => k in a).map(k => [k, a[k]])) }
  except(...keys: string[]) { const a = this.all(); for (const k of keys.flat()) delete a[k]; return a }
  merge(obj: Record<string, any>) { Object.assign(this.raw.body ??= {}, obj); return this }
  route(name?: string) {
    const p = this.raw.params as Record<string, string>
    if (!name) return p
    return p[name] ?? p.id ?? Object.values(p)[0]
  }
  header(name: string, def: any = null) { return this.raw.header(name) ?? def }
  bearerToken(): string | null {
    const h = this.raw.header('authorization') ?? ''
    return h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : null
  }
  isJson() { return String(this.raw.header('content-type') ?? '').includes('json') }
  wantsJson() { return true }
  ip() { return this.raw.ip }
  path() { return this.raw.path.replace(/^\//, '') }
  url() { return `${this.raw.protocol}://${this.raw.get('host')}${this.raw.baseUrl}${this.raw.path}` }
  file(name: string) { const f: any = this.raw.files; return Array.isArray(f) ? f.find(x => x.fieldname === name) : (this.raw as any).file?.fieldname === name ? (this.raw as any).file : f?.[name]?.[0] }
  files(name: string) { const f: any = this.raw.files; return Array.isArray(f) ? f.filter(x => x.fieldname === name || x.fieldname === `${name}[]`) : (f?.[name] ?? []) }
  user() { return this.user_ }
  /** $request->user('sanctum'): resolves the bearer token even when no auth middleware ran. */
  async authUser() { if (this.user_) return this.user_; const { resolveUserFromRequest } = await import('./auth'); return resolveUserFromRequest(this) }
  setUser(u: any) { this.user_ = u; return this }
  async validate(rules: Record<string, string | string[]>, messages?: Record<string, string>) {
    const files: Record<string, any> = {}
    for (const f of (Array.isArray(this.raw.files) ? this.raw.files : [])) files[f.fieldname.replace(/\[\]$/, '')] = files[f.fieldname.replace(/\[\]$/, '')] ?? f
    return validate(this.all(), rules, { db: this.slug ? connection(this.slug) : undefined, slug: this.slug, messages, files })
  }
}

type Handler = (request: Request, response: ResponseFactory) => any

function send(res: ExRes, out: any) {
  if (res.headersSent) return
  if (out instanceof JsonResponse) { for (const [k, v] of Object.entries(out.headers)) res.setHeader(k, v); res.status(out.status).json(out.body); return }
  if (out instanceof RawResponse)  { for (const [k, v] of Object.entries(out.headers)) res.setHeader(k, v); res.status(out.status).send(out.body); return }
  if (out === undefined || out === null) { res.status(204).end(); return }
  if (typeof out === 'string') { res.status(200).send(out); return }
  res.status(200).json(out)
}

/** Maps an exception to Laravel's JSON error body. */
export function renderError(res: ExRes, e: any) {
  if (res.headersSent) return
  if (e instanceof ValidationException) return void res.status(422).json({ message: e.summary(), errors: e.errors })
  if (e instanceof AuthenticationException) return void res.status(401).json({ message: 'Unauthenticated.' })
  if (e instanceof AuthorizationException)  return void res.status(403).json({ message: e.message })
  if (e instanceof ModelNotFoundException)  return void res.status(404).json({ message: e.message })
  if (e instanceof HttpException) {
    for (const [k, v] of Object.entries(e.headers)) res.setHeader(k, v)
    const fallback: Record<number, string> = { 401: 'Unauthenticated.', 403: 'This action is unauthorized.', 404: 'Not Found', 415: 'Unsupported Media Type', 429: 'Too Many Requests' }
    return void res.status(e.status).json({ message: e.message || fallback[e.status] || 'Error' })
  }
  Log.error(e?.stack ?? String(e))
  res.status(500).json({ message: e?.message ?? 'Server Error' })
}

/** Wraps a Laravel-style handler (request, response) => value for Express. */
export function handle(slug: string, fn: Handler): RequestHandler {
  return async (req: ExReq, res: ExRes) => {
    try {
      const request: Request = (req as any).__pluff ?? new Request(req, slug)
      send(res, await fn(request, response))
    } catch (e) { renderError(res, e) }
  }
}

/** Wraps middleware written as (request, response, next). `return next()` continues the chain. */
export function middleware(slug: string, fn: (request: Request, response: ResponseFactory, next: () => Promise<any>) => any): RequestHandler {
  return async (req: ExReq, res: ExRes, nextFn: NextFunction) => {
    try {
      const request: Request = (req as any).__pluff ?? ((req as any).__pluff = new Request(req, slug))
      let called = false
      const out = await fn(request, response, async () => { called = true })
      if (called && out === undefined) return nextFn()
      if (called) return nextFn()
      send(res, out)
    } catch (e) { renderError(res, e) }
  }
}
