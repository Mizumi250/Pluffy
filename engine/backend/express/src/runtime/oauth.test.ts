// End-to-end test for social sign-in. Runs the real generator, schema, routes and database;
// only the provider hosts are replaced by an in-process mock.
//   cd engine/backend/express && npx tsx --test src/runtime/oauth.test.ts
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import * as crypto from 'crypto'
import type { AddressInfo } from 'net'

const SLUG = 'oauth-selftest'
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' })

Object.assign(process.env, {
  ARKZEN_DB_DRIVER: 'sqlite', ARKZEN_DB_PREFIX: 'pluff', OAUTH_STATE_SECRET: 'test-state-secret',
  OAUTH_REDIRECT_BASE: 'http://app.test', OAUTH_FRONTEND_URL: 'http://web.test',
  OAUTH_GOOGLE_CLIENT_ID: 'g-id', OAUTH_GOOGLE_CLIENT_SECRET: 'g-secret',
  OAUTH_GITHUB_CLIENT_ID: 'gh-id', OAUTH_GITHUB_CLIENT_SECRET: 'gh-secret',
  OAUTH_TWITTER_CLIENT_ID: 'x-id', OAUTH_TWITTER_CLIENT_SECRET: 'x-secret',
  OAUTH_INSTAGRAM_CLIENT_ID: 'ig-id', OAUTH_INSTAGRAM_CLIENT_SECRET: 'ig-secret',
  OAUTH_APPLE_CLIENT_ID: 'com.example.services', OAUTH_APPLE_TEAM_ID: 'TEAM123456', OAUTH_APPLE_KEY_ID: 'KEY1234567',
  OAUTH_APPLE_PRIVATE_KEY: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString().replace(/\n/g, '\\n'),
  // discord, microsoft, facebook intentionally left unconfigured
})

let base = ''
let server: any
let removeTatemono: (p: any) => Promise<any>
const realFetch = globalThis.fetch
const seen: { url: string; init?: RequestInit }[] = []
let mock: (url: URL, init?: RequestInit) => any = () => ({ status: 404, body: {} })

before(async () => {
  globalThis.fetch = (async (input: any, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input.url ?? String(input))
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return realFetch(input, init)
    seen.push({ url: url.toString(), init })
    const r = mock(url, init)
    return new Response(JSON.stringify(r.body), { status: r.status ?? 200, headers: { 'Content-Type': 'application/json' } })
  }) as any

  const { app } = await import('../server')
  const build = await import('../engine/build')
  removeTatemono = build.removeTatemono
  const out = await build.buildTatemono({
    name: SLUG, version: '1.0.0', auth: true, databases: [], apis: [],
    oauth: { providers: ['google', 'github', 'twitter', 'apple', 'microsoft', 'instagram'], redirect: '/dashboard', errorRedirect: '/login', linkVerifiedEmail: true },
  })
  assert.equal(out.status, 200, JSON.stringify(out.body))
  server = app.listen(0)
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/${SLUG}/auth`
})

after(async () => {
  globalThis.fetch = realFetch
  server?.close()
  await removeTatemono?.({ name: SLUG })
  const { dropDatabase } = await import('../runtime/database')
  await dropDatabase(SLUG).catch(() => {})
})

const get = (path: string, init: RequestInit = {}) => realFetch(`${base}${path}`, { redirect: 'manual', ...init })

/** Runs redirect -> provider -> callback and returns the final response plus the parsed #hash. */
async function signIn(provider: string, opts: { method?: 'GET' | 'POST'; tamper?: boolean; dropCookie?: boolean; extra?: Record<string, string> } = {}) {
  const start = await get(`/oauth/${provider}/redirect`)
  assert.equal(start.status, 302)
  const loc = new URL(start.headers.get('location')!)
  const cookie = (start.headers.get('set-cookie') ?? '').split(';')[0]
  let state = loc.searchParams.get('state')!
  if (opts.tamper) state = state.slice(0, -2) + (state.endsWith('AA') ? 'BB' : 'AA')
  const params = new URLSearchParams({ code: 'the-code', state, ...(opts.extra ?? {}) })
  const headers: Record<string, string> = opts.dropCookie ? {} : { cookie }
  const res = opts.method === 'POST'
    ? await get(`/oauth/${provider}/callback`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params })
    : await get(`/oauth/${provider}/callback?${params}`, { headers })
  const where = new URL(res.headers.get('location')!)
  return { res, authorize: loc, where, hash: new URLSearchParams(where.hash.slice(1)) }
}

const googleMock = (profile: Record<string, any>) => (url: URL) => {
  if (url.hostname === 'oauth2.googleapis.com') return { body: { access_token: 'at', token_type: 'Bearer' } }
  if (url.hostname === 'openidconnect.googleapis.com') return { body: profile }
  return { status: 404, body: {} }
}

test('lists configured providers only as enabled', async () => {
  const body: any = await (await get('/oauth/providers')).json()
  const on = Object.fromEntries(body.providers.map((p: any) => [p.id, p.enabled]))
  assert.deepEqual(on, { google: true, github: true, twitter: true, apple: true, microsoft: false, instagram: true })
})

test('redirect builds a PKCE + state authorize URL and binds a cookie', async () => {
  const start = await get('/oauth/google/redirect')
  const loc = new URL(start.headers.get('location')!)
  assert.equal(loc.origin + loc.pathname, 'https://accounts.google.com/o/oauth2/v2/auth')
  assert.equal(loc.searchParams.get('client_id'), 'g-id')
  assert.equal(loc.searchParams.get('redirect_uri'), `http://app.test/api/${SLUG}/auth/oauth/google/callback`)
  assert.equal(loc.searchParams.get('code_challenge_method'), 'S256')
  assert.match(start.headers.get('set-cookie')!, /arkzen-oauth-oauth-selftest=.+HttpOnly/)
})

test('unknown or undeclared provider is a 404; unconfigured provider returns to the frontend with an error', async () => {
  assert.equal((await get('/oauth/myspace/redirect')).status, 404)
  assert.equal((await get('/oauth/discord/redirect')).status, 404)            // configured in .env? no, and not declared in the DSL
  const r = await get('/oauth/microsoft/redirect')                            // declared but no credentials
  assert.equal(r.status, 302)
  assert.match(r.headers.get('location')!, /^http:\/\/web\.test\/login#arkzen_oauth_error=/)
})

test('google: creates a user, returns a working token, and a second login reuses the account', async () => {
  mock = googleMock({ sub: 'g-1', email: 'Ada@Example.com', email_verified: true, name: 'Ada', picture: 'http://p/1.png' })
  const a = await signIn('google')
  assert.equal(a.where.origin + a.where.pathname, 'http://web.test/dashboard')
  assert.equal(a.hash.get('arkzen_oauth_slug'), SLUG)
  const token = a.hash.get('arkzen_oauth_token')!
  const me: any = await (await get('/me', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })).json()
  assert.equal(me.email, 'ada@example.com'); assert.equal(me.name, 'Ada'); assert.equal(me.password, undefined)

  const tokenCall = seen.filter(s => s.url === 'https://oauth2.googleapis.com/token').at(-1)!
  const form = new URLSearchParams(String(tokenCall.init!.body))
  assert.ok(form.get('code_verifier'), 'PKCE verifier is sent'); assert.equal(form.get('client_secret'), 'g-secret')

  const b = await signIn('google')
  const me2: any = await (await get('/me', { headers: { Authorization: `Bearer ${b.hash.get('arkzen_oauth_token')}` } })).json()
  assert.equal(me2.id, me.id)
})

test('state is rejected when tampered, when the cookie is missing, or when replayed for another provider', async () => {
  mock = googleMock({ sub: 'g-2', email: 'x@example.com', email_verified: true })
  const bad = await signIn('google', { tamper: true })
  assert.match(bad.where.hash, /arkzen_oauth_error/); assert.equal(bad.hash.get('arkzen_oauth_token'), null)
  const noCookie = await signIn('google', { dropCookie: true })
  assert.match(noCookie.where.hash, /arkzen_oauth_error/)

  const start = await get('/oauth/google/redirect')
  const state = new URL(start.headers.get('location')!).searchParams.get('state')!
  const cookie = start.headers.get('set-cookie')!.split(';')[0]
  const cross = await get(`/oauth/github/callback?code=c&state=${encodeURIComponent(state)}`, { headers: { cookie } })
  assert.match(cross.headers.get('location')!, /arkzen_oauth_error/)
})

test('provider error (user denied) returns to the frontend error page', async () => {
  const r = await get('/oauth/google/callback?error=access_denied')
  assert.match(r.headers.get('location')!, /^http:\/\/web\.test\/login#arkzen_oauth_error=/)
})

test('a verified email links to an existing password account and revokes its sessions and password', async () => {
  const reg = await realFetch(`${base}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ name: 'Bob', email: 'bob@example.com', password: 'hunter2hunter2', password_confirmation: 'hunter2hunter2' }) })
  const { user, token: oldToken }: any = await reg.json()

  mock = googleMock({ sub: 'g-bob', email: 'bob@example.com', email_verified: true, name: 'Bob G' })
  const s = await signIn('google')
  const me: any = await (await get('/me', { headers: { Authorization: `Bearer ${s.hash.get('arkzen_oauth_token')}` } })).json()
  assert.equal(me.id, user.id, 'linked, not duplicated')
  assert.equal((await get('/me', { headers: { Authorization: `Bearer ${oldToken}` } })).status, 401, 'old session revoked')
  const login = await realFetch(`${base}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: 'bob@example.com', password: 'hunter2hunter2' }) })
  assert.equal(login.status, 422, 'old password no longer works')
})

test('an unverified email is never linked: a separate account is created', async () => {
  await realFetch(`${base}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ name: 'Carol', email: 'carol@example.com', password: 'hunter2hunter2', password_confirmation: 'hunter2hunter2' }) })
  mock = (url) => {
    if (url.hostname === 'github.com') return { body: { access_token: 'gh-at' } }
    if (url.pathname === '/user/emails') return { body: [{ email: 'carol@example.com', primary: true, verified: false }] }
    if (url.pathname === '/user') return { body: { id: 4242, login: 'carol-gh', name: 'Carol GH', email: 'carol@example.com', avatar_url: 'http://a/c.png' } }
    return { status: 404, body: {} }
  }
  const s = await signIn('github')
  const me: any = await (await get('/me', { headers: { Authorization: `Bearer ${s.hash.get('arkzen_oauth_token')}` } })).json()
  assert.equal(me.email, 'github-4242@oauth.invalid')
  const tokenCall = seen.filter(s => s.url.startsWith('https://github.com/login/oauth/access_token')).at(-1)!
  assert.equal(new Headers(tokenCall.init!.headers).get('accept'), 'application/json')
})

test('x (twitter): HTTP Basic client auth + PKCE, no email', async () => {
  mock = (url) => {
    if (url.hostname === 'api.x.com' && url.pathname === '/2/oauth2/token') return { body: { access_token: 'x-at' } }
    if (url.pathname === '/2/users/me') return { body: { data: { id: '777', name: 'Xavier', username: 'xav' } } }
    return { status: 404, body: {} }
  }
  const s = await signIn('twitter')
  assert.equal(s.authorize.origin + s.authorize.pathname, 'https://x.com/i/oauth2/authorize')
  assert.match(s.authorize.searchParams.get('scope')!, /users\.read/)
  const call = seen.filter(x => x.url === 'https://api.x.com/2/oauth2/token').at(-1)!
  assert.equal(new Headers(call.init!.headers).get('authorization'), `Basic ${Buffer.from('x-id:x-secret').toString('base64')}`)
  const me: any = await (await get('/me', { headers: { Authorization: `Bearer ${s.hash.get('arkzen_oauth_token')}` } })).json()
  assert.equal(me.email, 'twitter-777@oauth.invalid')
})

test('instagram: handles the { data: [...] } token variant and has no email', async () => {
  mock = (url) => {
    if (url.hostname === 'api.instagram.com') return { body: { data: [{ access_token: 'ig-at', user_id: 99 }] } }
    if (url.hostname === 'graph.instagram.com') return { body: { user_id: '99', username: 'insta_user' } }
    return { status: 404, body: {} }
  }
  const s = await signIn('instagram')
  const me: any = await (await get('/me', { headers: { Authorization: `Bearer ${s.hash.get('arkzen_oauth_token')}` } })).json()
  assert.equal(me.email, 'instagram-99@oauth.invalid'); assert.equal(me.name, 'insta_user')
  assert.match(seen.filter(x => x.url.startsWith('https://graph.instagram.com')).at(-1)!.url, /\/v25\.0\/me\?/)
})

test('apple: form_post callback, ES256 client secret, id_token checked (iss, aud, exp, nonce)', async () => {
  const idToken = (nonce: string, over: Record<string, any> = {}) => {
    const enc = (o: any) => Buffer.from(JSON.stringify(o)).toString('base64url')
    return `${enc({ alg: 'RS256' })}.${enc({ iss: 'https://appleid.apple.com', aud: 'com.example.services', exp: Math.floor(Date.now() / 1000) + 600,
      sub: 'apple-001', email: 'tim@privaterelay.appleid.com', email_verified: 'true', nonce, ...over })}.sig`
  }
  let nonce = ''
  mock = (url) => url.hostname === 'appleid.apple.com' ? { body: { id_token: idToken(nonce), access_token: 'a' } } : { status: 404, body: {} }

  const start = await get('/oauth/apple/redirect')
  const loc = new URL(start.headers.get('location')!)
  assert.equal(loc.searchParams.get('response_mode'), 'form_post')
  assert.match(start.headers.get('set-cookie')!, /SameSite=None; Secure/)
  nonce = loc.searchParams.get('nonce')!
  const cookie = start.headers.get('set-cookie')!.split(';')[0]
  const post = await get('/oauth/apple/callback', { method: 'POST', headers: { cookie, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code: 'c', state: loc.searchParams.get('state')!, user: JSON.stringify({ name: { firstName: 'Tim', lastName: 'A' } }) }) })
  const hash = new URLSearchParams(new URL(post.headers.get('location')!).hash.slice(1))
  const me: any = await (await get('/me', { headers: { Authorization: `Bearer ${hash.get('arkzen_oauth_token')}` } })).json()
  assert.equal(me.name, 'Tim A'); assert.equal(me.email, 'tim@privaterelay.appleid.com')

  const secret = new URLSearchParams(String(seen.filter(x => x.url === 'https://appleid.apple.com/auth/token').at(-1)!.init!.body)).get('client_secret')!
  const [h, b, sig] = secret.split('.')
  const claims = JSON.parse(Buffer.from(b, 'base64url').toString())
  assert.equal(claims.iss, 'TEAM123456'); assert.equal(claims.sub, 'com.example.services'); assert.equal(claims.aud, 'https://appleid.apple.com')
  assert.equal(JSON.parse(Buffer.from(h, 'base64url').toString()).kid, 'KEY1234567')
  assert.ok(crypto.verify('sha256', Buffer.from(`${h}.${b}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64url')), 'client secret signature verifies')

  // a token minted for the wrong nonce is refused
  nonce = 'wrong'
  mock = (url) => url.hostname === 'appleid.apple.com' ? { body: { id_token: idToken('someone-elses-nonce') } } : { status: 404, body: {} }
  const bad = await signIn('apple', { method: 'POST' })
  assert.match(bad.where.hash, /arkzen_oauth_error/)
})
