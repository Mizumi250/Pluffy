// Social sign-in (OAuth 2.0 / OIDC) layered on top of the per-tatemono token auth.
// Opt-in through the @arkzen:oauth DSL block; email + password keeps working untouched.
//
// Providers: google, github, twitter (X), apple, microsoft, facebook, instagram, discord.
// Secrets come from .env only (OAUTH_<PROVIDER>_CLIENT_ID / _CLIENT_SECRET), never from a tatemono.
//
// Routes registered per tatemono (prefix /api/<slug>/auth/oauth):
//   GET  /providers               which providers are configured
//   GET  /:provider/redirect      starts the flow (302 to the provider)
//   GET|POST /:provider/callback  provider returns here (Apple uses POST form_post)
import * as crypto from 'crypto'
import type { Router, Request as ExReq, Response as ExRes } from 'express'
import { connection } from './database'
import { Hash, createToken, authCookie } from './auth'
import { prefixedTable, sqlNow, Log } from './support'

const env = (key: string, def = ''): string => process.env[key] ?? def

type Any = Record<string, any>

export interface OAuthConfig {
  providers: string[]
  redirect: string
  errorRedirect: string
  linkVerifiedEmail: boolean
}

export interface OAuthProfile {
  id: string
  email: string | null
  emailVerified: boolean
  name: string | null
  avatar: string | null
}

interface ProviderDef {
  id: string
  name: string
  authorizeUrl: (c: Any) => string
  tokenUrl: (c: Any) => string
  scope: string
  scopeSeparator?: string
  pkce: boolean
  clientAuth: 'body' | 'basic'
  authorizeExtra?: Record<string, string>
  /** Instagram's token endpoint answers with { data: [ {...} ] } on some versions. */
  profile: (tokens: Any, c: Any) => Promise<OAuthProfile>
}

const UA = 'Pluff-OAuth/1.0'
const STATE_TTL_SECONDS = 600

// ─── small helpers ───────────────────────────────────────────────────────────

const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64url')
const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest()

function stateKey(): Buffer {
  const configured = env('OAUTH_STATE_SECRET', '') || env('ARKZEN_ENGINE_SECRET', '')
  if (configured) return Buffer.from(configured)
  // No secret configured: use a per-process key. Flows that straddle a restart simply fail and can be retried.
  return (stateKey as any).__fallback ??= crypto.randomBytes(32)
}

function hmac(data: string): string {
  return b64url(crypto.createHmac('sha256', stateKey()).update(data).digest())
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

function pkceVerifier(nonce: string): string {
  return hmac(`pkce:${nonce}`)
}

function signState(payload: Any): string {
  const body = b64url(JSON.stringify(payload))
  return `v1.${body}.${hmac(`state:${body}`)}`
}

function readState(token: string): Any | null {
  const parts = String(token ?? '').split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return null
  if (!safeEqual(parts[2], hmac(`state:${parts[1]}`))) return null
  try {
    const p = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
    return typeof p?.e === 'number' && p.e > Math.floor(Date.now() / 1000) ? p : null
  } catch { return null }
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of String(header ?? '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  }
  return out
}

const stateCookieName = (slug: string) => `arkzen-oauth-${slug}`

function stateCookie(slug: string, nonce: string, provider: string): string {
  // Apple answers with a cross-site POST, which only carries a SameSite=None cookie (and that requires Secure).
  const cross = provider === 'apple'
  return `${stateCookieName(slug)}=${nonce}; Path=/; HttpOnly; Max-Age=${STATE_TTL_SECONDS}; SameSite=${cross ? 'None; Secure' : 'Lax'}`
}

function clearStateCookie(slug: string, provider: string): string {
  const cross = provider === 'apple'
  return `${stateCookieName(slug)}=; Path=/; HttpOnly; Max-Age=0; SameSite=${cross ? 'None; Secure' : 'Lax'}`
}

const upper = (p: string) => p.toUpperCase()
const clientId = (p: string) => env(`OAUTH_${upper(p)}_CLIENT_ID`, '')
const clientSecret = (p: string) => env(`OAUTH_${upper(p)}_CLIENT_SECRET`, '')

/** Apple's client secret is a short-lived ES256 JWT signed with the team's .p8 key. */
function appleClientSecret(): string {
  const teamId = env('OAUTH_APPLE_TEAM_ID', ''), keyId = env('OAUTH_APPLE_KEY_ID', '')
  const pem = env('OAUTH_APPLE_PRIVATE_KEY', '').replace(/\\n/g, '\n')
  if (!teamId || !keyId || !pem) throw new Error('Apple needs OAUTH_APPLE_TEAM_ID, OAUTH_APPLE_KEY_ID and OAUTH_APPLE_PRIVATE_KEY')
  const now = Math.floor(Date.now() / 1000)
  const head = b64url(JSON.stringify({ alg: 'ES256', kid: keyId, typ: 'JWT' }))
  const body = b64url(JSON.stringify({ iss: teamId, iat: now, exp: now + 300, aud: 'https://appleid.apple.com', sub: clientId('apple') }))
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${body}`), { key: pem, dsaEncoding: 'ieee-p1363' })
  return `${head}.${body}.${b64url(sig)}`
}

function isConfigured(p: string): boolean {
  if (!clientId(p)) return false
  if (p === 'apple') return !!(env('OAUTH_APPLE_TEAM_ID', '') && env('OAUTH_APPLE_KEY_ID', '') && env('OAUTH_APPLE_PRIVATE_KEY', ''))
  return !!clientSecret(p)
}

async function getJson(url: string, headers: Record<string, string> = {}): Promise<Any> {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA, ...headers } })
  const text = await res.text()
  let data: any = null
  try { data = JSON.parse(text) } catch { /* handled below */ }
  if (!res.ok || data === null) throw new Error(`Provider request failed (${res.status}) at ${new URL(url).host}`)
  return data
}

const bearer = (t: Any) => ({ Authorization: `Bearer ${t.access_token}` })

/** Decodes a JWT payload WITHOUT verifying its signature. Only used on an id_token that was
 *  received directly from the provider's token endpoint over TLS (allowed by OIDC Core 3.1.3.7). */
function jwtPayload(jwt: string): Any {
  const part = String(jwt).split('.')[1]
  if (!part) throw new Error('Malformed id_token')
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
}

// ─── providers ───────────────────────────────────────────────────────────────

const graphVersion = (p: 'FACEBOOK' | 'INSTAGRAM') => env(`OAUTH_${p}_API_VERSION`, 'v25.0')

export const PROVIDERS: Record<string, ProviderDef> = {
  google: {
    id: 'google', name: 'Google', pkce: true, clientAuth: 'body', scope: 'openid email profile',
    authorizeUrl: () => 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: () => 'https://oauth2.googleapis.com/token',
    authorizeExtra: { access_type: 'online', prompt: 'select_account' },
    async profile(t) {
      const u = await getJson('https://openidconnect.googleapis.com/v1/userinfo', bearer(t))
      return { id: String(u.sub), email: u.email ?? null, emailVerified: u.email_verified === true || u.email_verified === 'true', name: u.name ?? null, avatar: u.picture ?? null }
    },
  },
  github: {
    id: 'github', name: 'GitHub', pkce: false, clientAuth: 'body', scope: 'read:user user:email',
    authorizeUrl: () => 'https://github.com/login/oauth/authorize',
    tokenUrl: () => 'https://github.com/login/oauth/access_token',
    async profile(t) {
      const h = { ...bearer(t), Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
      const u = await getJson('https://api.github.com/user', h)
      let email: string | null = u.email ?? null, verified = false
      try {
        const list: Any[] = await getJson('https://api.github.com/user/emails', h) as any
        const primary = Array.isArray(list) ? list.find(e => e.primary && e.verified) ?? list.find(e => e.verified) : null
        if (primary) { email = primary.email; verified = true }
      } catch { /* user:email scope missing or denied: keep the public email, unverified */ }
      return { id: String(u.id), email, emailVerified: verified, name: u.name ?? u.login ?? null, avatar: u.avatar_url ?? null }
    },
  },
  twitter: {
    // X: authorization code + PKCE is mandatory; confidential clients authenticate with HTTP Basic.
    id: 'twitter', name: 'X (Twitter)', pkce: true, clientAuth: 'basic', scope: 'users.read tweet.read users.email',
    authorizeUrl: () => 'https://x.com/i/oauth2/authorize',
    tokenUrl: () => 'https://api.x.com/2/oauth2/token',
    async profile(t) {
      const r = await getJson('https://api.x.com/2/users/me?user.fields=profile_image_url,confirmed_email', bearer(t))
      const u = r.data ?? {}
      // X returns an email only when the app has the permission; we never treat it as verified.
      return { id: String(u.id), email: u.confirmed_email ?? null, emailVerified: false, name: u.name ?? u.username ?? null, avatar: u.profile_image_url ?? null }
    },
  },
  apple: {
    // Apple: client_secret is a signed JWT, the callback is a form_post, and the identity is in the id_token.
    id: 'apple', name: 'Apple', pkce: false, clientAuth: 'body', scope: 'name email',
    authorizeUrl: () => 'https://appleid.apple.com/auth/authorize',
    tokenUrl: () => 'https://appleid.apple.com/auth/token',
    authorizeExtra: { response_mode: 'form_post' },
    async profile(t, c) {
      const claims = jwtPayload(t.id_token)
      if (claims.iss !== 'https://appleid.apple.com') throw new Error('Apple id_token has the wrong issuer')
      if (claims.aud !== clientId('apple')) throw new Error('Apple id_token was issued for another client')
      if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000)) throw new Error('Apple id_token has expired')
      if (claims.nonce !== c.nonce) throw new Error('Apple id_token nonce mismatch')
      let name: string | null = null
      try {   // Apple sends the name once, on first authorization, as a JSON form field.
        const u = c.appleUser ? JSON.parse(c.appleUser) : null
        name = u?.name ? [u.name.firstName, u.name.lastName].filter(Boolean).join(' ') || null : null
      } catch { /* ignore */ }
      return { id: String(claims.sub), email: claims.email ?? null, emailVerified: claims.email_verified === true || claims.email_verified === 'true', name, avatar: null }
    },
  },
  microsoft: {
    id: 'microsoft', name: 'Microsoft', pkce: true, clientAuth: 'body', scope: 'openid profile email User.Read',
    authorizeUrl: () => `https://login.microsoftonline.com/${env('OAUTH_MICROSOFT_TENANT', 'common')}/oauth2/v2.0/authorize`,
    tokenUrl: () => `https://login.microsoftonline.com/${env('OAUTH_MICROSOFT_TENANT', 'common')}/oauth2/v2.0/token`,
    authorizeExtra: { response_mode: 'query', prompt: 'select_account' },
    async profile(t) {
      const u = await getJson('https://graph.microsoft.com/oidc/userinfo', bearer(t))
      // Microsoft emails are not proven to belong to the user ("nOAuth"), so they are never auto-linked.
      return { id: String(u.sub), email: u.email ?? null, emailVerified: false, name: u.name ?? null, avatar: null }
    },
  },
  facebook: {
    id: 'facebook', name: 'Facebook', pkce: false, clientAuth: 'body', scope: 'email,public_profile', scopeSeparator: ',',
    authorizeUrl: () => `https://www.facebook.com/${graphVersion('FACEBOOK')}/dialog/oauth`,
    tokenUrl: () => `https://graph.facebook.com/${graphVersion('FACEBOOK')}/oauth/access_token`,
    async profile(t) {
      const u = await getJson(`https://graph.facebook.com/${graphVersion('FACEBOOK')}/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(t.access_token)}`)
      return { id: String(u.id), email: u.email ?? null, emailVerified: false, name: u.name ?? null, avatar: u.picture?.data?.url ?? null }
    },
  },
  instagram: {
    // Instagram API with Instagram Login (Basic Display API is gone). Professional (Business/Creator) accounts only,
    // and Instagram never reveals an email address.
    id: 'instagram', name: 'Instagram', pkce: false, clientAuth: 'body', scope: 'instagram_business_basic', scopeSeparator: ',',
    authorizeUrl: () => 'https://www.instagram.com/oauth/authorize',
    tokenUrl: () => 'https://api.instagram.com/oauth/access_token',
    async profile(t) {
      const u = await getJson(`https://graph.instagram.com/${graphVersion('INSTAGRAM')}/me?fields=user_id,username,name,profile_picture_url&access_token=${encodeURIComponent(t.access_token)}`)
      return { id: String(u.user_id ?? u.id), email: null, emailVerified: false, name: u.name ?? u.username ?? null, avatar: u.profile_picture_url ?? null }
    },
  },
  discord: {
    id: 'discord', name: 'Discord', pkce: true, clientAuth: 'body', scope: 'identify email',
    authorizeUrl: () => 'https://discord.com/oauth2/authorize',
    tokenUrl: () => 'https://discord.com/api/oauth2/token',
    authorizeExtra: { prompt: 'consent' },
    async profile(t) {
      const u = await getJson('https://discord.com/api/users/@me', bearer(t))
      const avatar = u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png` : null
      return { id: String(u.id), email: u.email ?? null, emailVerified: u.verified === true, name: u.global_name ?? u.username ?? null, avatar }
    },
  },
}

// ─── flow ────────────────────────────────────────────────────────────────────

const redirectBase = () => env('OAUTH_REDIRECT_BASE', '') || env('APP_URL', 'http://localhost:8000')
const frontendUrl  = () => (env('OAUTH_FRONTEND_URL', 'http://localhost:3000')).replace(/\/+$/, '')
const callbackUrl  = (slug: string, provider: string) => `${redirectBase().replace(/\/+$/, '')}/api/${slug}/auth/oauth/${provider}/callback`

export function buildAuthorizeUrl(slug: string, provider: string): { url: string; nonce: string } {
  const def = PROVIDERS[provider]
  const nonce = b64url(crypto.randomBytes(24))
  const state = signState({ n: nonce, p: provider, s: slug, e: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS })
  const q = new URLSearchParams({
    client_id: clientId(provider), redirect_uri: callbackUrl(slug, provider), response_type: 'code',
    scope: def.scope, state, ...(def.authorizeExtra ?? {}),
  })
  if (def.pkce) { q.set('code_challenge', b64url(sha256(pkceVerifier(nonce)))); q.set('code_challenge_method', 'S256') }
  if (provider === 'apple') q.set('nonce', nonce)
  return { url: `${def.authorizeUrl({})}?${q}`, nonce }
}

async function exchangeCode(slug: string, provider: string, code: string, nonce: string): Promise<Any> {
  const def = PROVIDERS[provider]
  const form = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: callbackUrl(slug, provider) })
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', 'User-Agent': UA }
  const secret = provider === 'apple' ? appleClientSecret() : clientSecret(provider)
  if (def.clientAuth === 'basic') headers.Authorization = `Basic ${Buffer.from(`${clientId(provider)}:${secret}`).toString('base64')}`
  else { form.set('client_id', clientId(provider)); form.set('client_secret', secret) }
  if (def.pkce) { form.set('code_verifier', pkceVerifier(nonce)); if (def.clientAuth === 'basic') form.set('client_id', clientId(provider)) }

  const res = await fetch(def.tokenUrl({}), { method: 'POST', headers, body: form })
  const text = await res.text()
  let data: any = null
  try { data = JSON.parse(text) } catch { /* some providers answer form-encoded */ data = Object.fromEntries(new URLSearchParams(text)) }
  if (Array.isArray(data?.data) && data.data[0]) data = data.data[0]       // Instagram variant
  if (!res.ok || !data || (!data.access_token && !data.id_token)) throw new Error(`Token exchange failed (${res.status})`)
  return data
}

const OAUTH_ACCOUNTS = 'oauth_accounts'

/** Finds, links or creates the local user for a provider profile. Returns the user row and whether it is new. */
export async function resolveOAuthUser(slug: string, provider: string, p: OAuthProfile, linkVerifiedEmail: boolean): Promise<Any> {
  const db = connection(slug)
  const users = prefixedTable(slug, 'users'), accounts = prefixedTable(slug, OAUTH_ACCOUNTS), tokens = prefixedTable(slug, 'personal_access_tokens')
  const ts = sqlNow()

  const linked: Any | undefined = await db(accounts).where({ provider, provider_user_id: p.id }).first()
  if (linked) {
    const user = await db(users).where({ id: linked.user_id }).first()
    if (user) {
      await db(accounts).where({ id: linked.id }).update({ email: p.email, avatar: p.avatar, updated_at: ts })
      return user
    }
    await db(accounts).where({ id: linked.id }).delete()        // orphaned link: fall through and re-create
  }

  const randomPassword = () => Hash.make(crypto.randomBytes(32).toString('hex'))
  const email = p.email ? p.email.toLowerCase() : null
  let user: Any | undefined

  if (email && p.emailVerified && linkVerifiedEmail) {
    user = await db(users).whereRaw('lower(email) = ?', [email]).first()
    if (user) {
      // Pre-hijack defence: this account may have been registered by someone else with this email before its
      // owner ever signed in with the provider (the users table has no verified-email flag). Revoke every
      // session and replace the password so only the provider-verified owner can continue.
      await db(tokens).where({ tokenable_id: user.id }).delete()
      await db(users).where({ id: user.id }).update({ password: randomPassword(), updated_at: ts })
    }
  }

  if (!user) {
    // Providers without a usable email (Instagram, X without permission) get a reserved, non-routable address.
    let own = email
    if (own && (await db(users).whereRaw('lower(email) = ?', [own]).first())) own = null   // taken and not linkable
    own ??= `${provider}-${p.id}@oauth.invalid`.toLowerCase()
    const name = (p.name ?? own.split('@')[0]).slice(0, 255)
    const r: any = await db(users).insert({ name, email: own, password: randomPassword(), role: 'user', email_verified_at: p.emailVerified ? ts : null, created_at: ts, updated_at: ts })
    const id = typeof r[0] === 'object' ? r[0].id : r[0]
    user = await db(users).where({ id }).first()
  }

  await db(accounts).insert({ user_id: user!.id, provider, provider_user_id: p.id, email: p.email, avatar: p.avatar, created_at: ts, updated_at: ts })
  return user!
}

const hashParams = (o: Record<string, string>) => new URLSearchParams(o).toString()

function fail(res: ExRes, cfg: OAuthConfig, slug: string, provider: string, message: string, extra: string[] = []) {
  res.setHeader('Set-Cookie', [clearStateCookie(slug, provider), ...extra])
  res.redirect(302, `${frontendUrl()}${cfg.errorRedirect}#${hashParams({ arkzen_oauth_error: message })}`)
}

// ─── routes ──────────────────────────────────────────────────────────────────

export function registerOAuth(router: Router, slug: string, cfg: OAuthConfig, prefix: string): void {
  const base = `${prefix}/auth/oauth`
  const enabled = new Set(cfg.providers)

  router.get(`${base}/providers`, (_req: ExReq, res: ExRes) => {
    res.json({ providers: cfg.providers.map(id => ({ id, name: PROVIDERS[id].name, enabled: isConfigured(id) })) })
  })

  router.get(`${base}/:provider/redirect`, (req: ExReq, res: ExRes) => {
    const provider = String(req.params.provider)
    if (!enabled.has(provider)) return void res.status(404).json({ message: 'Unknown OAuth provider.' })
    if (!isConfigured(provider)) return fail(res, cfg, slug, provider, `${PROVIDERS[provider].name} sign-in is not configured on this server.`)
    const { url, nonce } = buildAuthorizeUrl(slug, provider)
    res.setHeader('Set-Cookie', stateCookie(slug, nonce, provider))
    res.redirect(302, url)
  })

  const callback = async (req: ExReq, res: ExRes) => {
    const provider = String(req.params.provider)
    if (!enabled.has(provider)) return void res.status(404).json({ message: 'Unknown OAuth provider.' })
    const params: Any = { ...(req.query as Any), ...((req.body && typeof req.body === 'object') ? req.body : {}) }
    try {
      if (params.error) return fail(res, cfg, slug, provider, `${PROVIDERS[provider].name} sign-in was cancelled or denied.`)
      const st = readState(String(params.state ?? ''))
      const cookieNonce = parseCookies(req.headers.cookie)[stateCookieName(slug)]
      if (!st || st.p !== provider || st.s !== slug || !cookieNonce || !safeEqual(String(cookieNonce), String(st.n))) {
        return fail(res, cfg, slug, provider, 'Sign-in session expired or was tampered with. Please try again.')
      }
      if (typeof params.code !== 'string' || !params.code) return fail(res, cfg, slug, provider, 'The provider did not return an authorization code.')

      const tokens  = await exchangeCode(slug, provider, params.code, st.n)
      const profile = await PROVIDERS[provider].profile(tokens, { nonce: st.n, appleUser: typeof params.user === 'string' ? params.user : null })
      if (!profile.id || profile.id === 'undefined') throw new Error('Provider returned no user id')

      const user  = await resolveOAuthUser(slug, provider, profile, cfg.linkVerifiedEmail)
      const token = await createToken(slug, user.id)
      res.setHeader('Set-Cookie', [clearStateCookie(slug, provider), authCookie(slug, token)])
      res.redirect(302, `${frontendUrl()}${cfg.redirect}#${hashParams({ arkzen_oauth_token: token, arkzen_oauth_slug: slug })}`)
    } catch (e: any) {
      Log.error(`[oauth:${provider}] ${e?.message ?? e}`)
      fail(res, cfg, slug, provider, 'Sign-in failed. Please try again.')
    }
  }
  router.get(`${base}/:provider/callback`, callback)
  router.post(`${base}/:provider/callback`, callback)
}
