// Sanctum-style token auth + role middleware, per tatemono.
import bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import type { RequestHandler, Request as ExReq, Response as ExRes, NextFunction } from 'express'
import { connection } from './database'
import { Model } from './model'
import { Request, renderError } from './http'
import { AuthenticationException, HttpException } from './errors'
import { prefixedTable, sqlNow } from './support'

export const Hash = {
  make:  (plain: string) => bcrypt.hashSync(plain, 10),
  check: (plain: string, hash: string) => { try { return bcrypt.compareSync(plain, hash.replace(/^\$2y\$/, '$2a$')) } catch { return false } },
}

export interface AuthConfig { fillable: string[]; hidden: string[]; casts: Record<string, string> }
const userModels = new Map<string, typeof Model>()

/** The tatemono's user model: table `<prefix>_users`. Created at module load by generated code. */
export function userModelFor(slug: string, cfg: AuthConfig = { fillable: ['name', 'email', 'password', 'role'], hidden: ['password', 'remember_token'], casts: {} }): typeof Model {
  let M = userModels.get(slug)
  if (M) return M
  M = class User extends Model {
    static table = prefixedTable(slug, 'users')
    static connectionName = slug
    static fillable = cfg.fillable
    static hidden = cfg.hidden
    static casts = cfg.casts
    __token: any = null
    currentAccessToken() {
      const tok = this.__token
      return { delete: async () => { if (tok) await connection(slug).table(prefixedTable(slug, 'personal_access_tokens')).where('id', tok.id).delete() } }
    }
    tokens() {
      return { delete: async () => { await connection(slug).table(prefixedTable(slug, 'personal_access_tokens')).where({ tokenable_id: this.id }).delete() } }
    }
    async createToken(name = 'arkzen-token') { return { plainTextToken: await createToken(slug, this.id, name) } }
  } as unknown as typeof Model
  userModels.set(slug, M)
  return M
}

export async function createToken(slug: string, userId: number, name = 'arkzen-token'): Promise<string> {
  const plain = crypto.randomBytes(20).toString('hex')
  const hash  = crypto.createHash('sha256').update(plain).digest('hex')
  const ts = sqlNow()
  const r = await connection(slug).table(prefixedTable(slug, 'personal_access_tokens')).insert({
    tokenable_type: 'user', tokenable_id: userId, name, token: hash, abilities: '["*"]', created_at: ts, updated_at: ts,
  })
  const id = typeof r[0] === 'object' ? (r[0] as any).id : r[0]
  return `${id}|${plain}`
}

async function resolveUser(slug: string, bearer: string | null) {
  if (!bearer) return null
  const [idPart, plain] = bearer.includes('|') ? bearer.split('|') : [null, bearer]
  const hash = crypto.createHash('sha256').update(plain).digest('hex')
  const q = connection(slug).table(prefixedTable(slug, 'personal_access_tokens')).where('token', hash)
  if (idPart) q.where('id', idPart)
  const tok: any = await q.first()
  if (!tok) return null
  if (tok.expires_at && new Date(String(tok.expires_at).replace(' ', 'T') + 'Z') < new Date()) return null
  const User = userModelFor(slug)
  const user: any = await (User as any).find(tok.tokenable_id)
  if (user) user.__token = tok
  return user
}

/** auth:sanctum equivalent. Sets request.user(). */
export function authMiddleware(slug: string): RequestHandler {
  return async (req: ExReq, res: ExRes, next: NextFunction) => {
    try {
      const request: Request = (req as any).__pluff ??= new Request(req, slug)
      const user = await resolveUser(slug, request.bearerToken())
      if (!user) throw new AuthenticationException()
      request.setUser(user)
      next()
    } catch (e) { renderError(res, e) }
  }
}

/** Resolves the user when a token is present but never rejects (optional auth). */
export function optionalAuth(slug: string): RequestHandler {
  return async (req: ExReq, _res: ExRes, next: NextFunction) => {
    const request: Request = (req as any).__pluff ??= new Request(req, slug)
    try { request.setUser(await resolveUser(slug, request.bearerToken())) } catch { /* guest */ }
    next()
  }
}

/** role:admin,editor equivalent. Must run after authMiddleware. */
export function roleMiddleware(...roles: string[]): RequestHandler {
  return (req: ExReq, res: ExRes, next: NextFunction) => {
    const request: Request = (req as any).__pluff
    const user = request?.user()
    if (!user) return renderError(res, new AuthenticationException())
    if (!roles.includes(user.role)) return renderError(res, new HttpException(403, 'Forbidden'))
    next()
  }
}

export async function resolveUserFromRequest(request: Request) {
  return resolveUser(request.slug, request.bearerToken())
}
