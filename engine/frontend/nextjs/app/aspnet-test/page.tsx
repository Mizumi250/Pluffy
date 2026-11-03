'use client'
// ============================================================
// ARKZEN GENERATED PAGE — aspnet-test/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-03T17:58:57.070Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
const API = 'http://localhost:8000/api/aspnet-test'

type Result = { label: string; status: number | string; body: string; ok: boolean }
type Step = { label: string; expect: number; pass: boolean; status: number | string }

const IndexPage = () => {
  const [email, setEmail] = useState('tester@example.com')
  const [password, setPassword] = useState('password123')
  const [token, setToken] = useState('')
  const [role, setRole] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [checkId, setCheckId] = useState('1')
  const [name, setName] = useState('My test check')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [suite, setSuite] = useState<Step[]>([])
  const [running, setRunning] = useState(false)

  const request = async (
    method: string,
    path: string,
    opts: { body?: unknown; token?: string; json?: boolean } = {},
  ) => {
    const { body, token: bearer, json = true } = opts
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (json) headers['Content-Type'] = 'application/json'
    if (bearer) headers['Authorization'] = 'Bearer ' + bearer
    let status: number | string = 'network error'
    let text = ''
    let data: any = null
    try {
      const res = await fetch(API + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      status = res.status
      text = await res.text()
      try { data = JSON.parse(text) } catch { data = null }
    } catch (e: any) {
      text = 'Could not reach ' + API + ' - is the backend running? (' + (e?.message ?? e) + ')'
    }
    return { status, data, text }
  }

  const call = async (
    label: string,
    method: string,
    path: string,
    opts: { body?: unknown; auth?: boolean; json?: boolean } = {},
  ) => {
    const { body, auth = true, json = true } = opts
    const r = await request(method, path, { body, json, token: auth ? token : undefined })
    const ok = typeof r.status === 'number' && r.status >= 200 && r.status < 300
    setResults(prev => [{ label, status: r.status, body: r.data ? JSON.stringify(r.data, null, 2) : r.text, ok }, ...prev])
    return r.data
  }

  const adopt = (d: any) => {
    if (d?.token) {
      setToken(d.token)
      setUserId(d.user?.id ?? null)
      setRole(d.user?.role ?? '')
    }
  }

  const register = async () => adopt(await call('POST /auth/register', 'POST', '/auth/register', {
    auth: false,
    body: { name: 'Tester', email, password, password_confirmation: password },
  }))
  const login = async () => adopt(await call('POST /auth/login', 'POST', '/auth/login', { auth: false, body: { email, password } }))
  const loginAdmin = async () => adopt(await call('POST /auth/login (seeded admin)', 'POST', '/auth/login', {
    auth: false,
    body: { email: 'admin@aspnet-test.local', password: 'password' },
  }))
  const me = async () => {
    const d = await call('GET /auth/me', 'GET', '/auth/me')
    if (d?.id) { setUserId(d.id); setRole(d.role ?? '') }
  }
  const logout = async () => {
    await call('POST /auth/logout', 'POST', '/auth/logout')
    setToken(''); setRole(''); setUserId(null)
  }
  const createCheck = async (mine: boolean) => {
    const payload: Record<string, unknown> = { name, priority: 2 }
    if (mine && userId !== null) payload.user_id = userId
    const d = await call(mine ? 'POST /checks (owned by me)' : 'POST /checks', 'POST', '/checks', { body: payload })
    if (d?.id) setCheckId(String(d.id))
  }

  const runSuite = async () => {
    setRunning(true)
    setSuite([])
    const steps: Step[] = []
    const record = (label: string, expect: number, status: number | string) => {
      steps.push({ label, expect, pass: status === expect, status })
      setSuite([...steps])
    }
    const stamp = Date.now()

    record('GET /health (public)', 200, (await request('GET', '/health')).status)
    record('GET /ping with JSON header', 200, (await request('GET', '/ping')).status)
    record('GET /ping without JSON header (custom middleware)', 415, (await request('GET', '/ping', { json: false })).status)
    record('GET /probe/hello (custom route)', 200, (await request('GET', '/probe/hello')).status)
    record('GET /checks without token', 401, (await request('GET', '/checks')).status)

    const adminLogin = await request('POST', '/auth/login', { body: { email: 'admin@aspnet-test.local', password: 'password' } })
    record('POST /auth/login (seeded admin)', 200, adminLogin.status)
    const adminToken: string = adminLogin.data?.token ?? ''
    const adminId = adminLogin.data?.user?.id

    record('POST /checks empty body (validation)', 422, (await request('POST', '/checks', { token: adminToken, body: {} })).status)
    record('POST /checks bad status (in: rule)', 422, (await request('POST', '/checks', { token: adminToken, body: { name: 'x', status: 'nope' } })).status)
    const created = await request('POST', '/checks', { token: adminToken, body: { name: 'Suite check ' + stamp, priority: 2, user_id: adminId } })
    record('POST /checks valid', 201, created.status)
    const id = created.data?.id

    record('GET /checks?search=Suite', 200, (await request('GET', '/checks?search=Suite&per_page=5', { token: adminToken })).status)
    record('GET /checks?status=passed (filter)', 200, (await request('GET', '/checks?status=passed', { token: adminToken })).status)
    record('PUT /checks/{id} as owner', 200, (await request('PUT', '/checks/' + id, { token: adminToken, body: { status: 'failed' } })).status)
    record('POST /checks/{id}/pass (transaction + audit row)', 200, (await request('POST', '/checks/' + id + '/pass', { token: adminToken })).status)
    record('POST /checks/999999/pass (missing row)', 404, (await request('POST', '/checks/999999/pass', { token: adminToken })).status)
    record('GET /stats (custom endpoint)', 200, (await request('GET', '/stats', { token: adminToken })).status)
    record('GET /admin/audit as admin', 200, (await request('GET', '/admin/audit', { token: adminToken })).status)

    const reg = await request('POST', '/auth/register', {
      body: { name: 'Suite User', email: 'suite+' + stamp + '@example.com', password: 'password123', password_confirmation: 'password123' },
    })
    record('POST /auth/register', 201, reg.status)
    const userToken: string = reg.data?.token ?? ''

    record('GET /admin/audit as plain user (role middleware)', 403, (await request('GET', '/admin/audit', { token: userToken })).status)
    record('DELETE /checks/{id} as plain user (policy)', 403, (await request('DELETE', '/checks/' + id, { token: userToken })).status)
    record('DELETE /checks/{id} as admin', 200, (await request('DELETE', '/checks/' + id, { token: adminToken })).status)
    record('GET /checks/{id} after delete', 404, (await request('GET', '/checks/' + id, { token: adminToken })).status)

    setRunning(false)
  }

  const passed = suite.filter(s => s.pass).length

  const btn = 'rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50'
  const input = 'rounded border border-neutral-300 px-2 py-1 text-sm'
  const group = 'mb-5'
  const h2 = 'mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500'

  return (
    <div className="mx-auto max-w-3xl p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">ASP.NET Core - C#</p>
      <h1 className="text-2xl font-semibold">ASP.NET backend test</h1>
      <p className="mb-1 text-neutral-600">Click the buttons to exercise the :cs variants. Backend: {API}</p>
      <p className="mb-6 text-sm text-neutral-500">
        {token ? 'Logged in' + (userId !== null ? ' as user #' + userId : '') + (role ? ' (' + role + ')' : '') : 'Not logged in'}
      </p>

      <div className="mb-6 rounded border border-violet-200 bg-violet-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold text-violet-900">Contract suite</div>
          <button className={btn} disabled={running} onClick={runSuite}>{running ? 'Running...' : 'Run full suite'}</button>
        </div>
        <p className="mb-2 text-sm text-violet-900/80">
          Logs in as the seeded admin and checks every status code the engine should return: auth, validation, filters, policies, role and custom middleware, the C# endpoints and the transaction.
        </p>
        {suite.length > 0 && (
          <>
            <p className="mb-2 text-sm font-medium">{passed} of {suite.length} passed</p>
            <ul className="space-y-1 text-sm">
              {suite.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className={s.pass ? 'text-green-700' : 'text-red-700'}>{s.pass ? 'PASS' : 'FAIL'}</span>
                  <span className="flex-1">{s.label}</span>
                  <span className="text-neutral-500">{String(s.status)}{s.pass ? '' : ' (expected ' + s.expect + ')'}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={group}>
        <div className={h2}>No login needed</div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={() => call('GET /health (C# endpoint)', 'GET', '/health', { auth: false })}>Health</button>
          <button className={btn} onClick={() => call('GET /probe/hello (custom route)', 'GET', '/probe/hello?x=1', { auth: false })}>Probe route</button>
          <button className={btn} onClick={() => call('GET /ping with JSON header -> 200', 'GET', '/ping', { auth: false })}>Ping (JSON, expect 200)</button>
          <button className={btn} onClick={() => call('GET /ping without JSON header -> 415', 'GET', '/ping', { auth: false, json: false })}>Ping (no JSON, expect 415)</button>
          <button className={btn} onClick={() => call('GET /checks without token -> 401', 'GET', '/checks', { auth: false })}>Checks without token (expect 401)</button>
        </div>
      </div>

      <div className={group}>
        <div className={h2}>Account</div>
        <div className="mb-2 flex flex-wrap gap-2">
          <input className={input} value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
          <input className={input} value={password} onChange={e => setPassword(e.target.value)} placeholder="password (8+ chars)" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={register}>Register</button>
          <button className={btn} onClick={login}>Login</button>
          <button className={btn} onClick={loginAdmin}>Login as seeded admin</button>
          <button className={btn} onClick={me}>Who am I</button>
          <button className={btn} onClick={logout}>Logout</button>
          <button className={btn} onClick={() => call('POST /auth/register invalid -> 422', 'POST', '/auth/register', { auth: false, body: { email: 'nope' } })}>Register with bad data (expect 422)</button>
        </div>
      </div>

      <div className={group}>
        <div className={h2}>Checks (login first)</div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <input className={input} value={name} onChange={e => setName(e.target.value)} placeholder="check name" />
          <input className={input} value={search} onChange={e => setSearch(e.target.value)} placeholder="search" />
          <span className="text-sm text-neutral-500">check id</span>
          <input className={input + ' w-16'} value={checkId} onChange={e => setCheckId(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={() => call('GET /checks', 'GET', '/checks')}>List checks</button>
          <button className={btn} onClick={() => call('GET /checks?search=' + search, 'GET', '/checks?search=' + encodeURIComponent(search))}>Search</button>
          <button className={btn} onClick={() => call('GET /checks?status=passed', 'GET', '/checks?status=passed')}>Only passed</button>
          <button className={btn} onClick={() => call('GET /checks?per_page=2', 'GET', '/checks?per_page=2')}>Page size 2</button>
          <button className={btn} onClick={() => createCheck(true)}>Create check (mine)</button>
          <button className={btn} onClick={() => createCheck(false)}>Create check (no owner)</button>
          <button className={btn} onClick={() => call('POST /checks empty -> 422', 'POST', '/checks', { body: {} })}>Create empty (expect 422)</button>
          <button className={btn} onClick={() => call('GET /checks/' + checkId, 'GET', '/checks/' + checkId)}>Show check</button>
          <button className={btn} onClick={() => call('PUT /checks/' + checkId + ' (owner or admin)', 'PUT', '/checks/' + checkId, { body: { status: 'failed' } })}>Fail check</button>
          <button className={btn} onClick={() => call('POST /checks/' + checkId + '/pass (transaction)', 'POST', '/checks/' + checkId + '/pass')}>Pass check (transaction)</button>
          <button className={btn} onClick={() => call('DELETE /checks/' + checkId + ' (admin only)', 'DELETE', '/checks/' + checkId)}>Delete check (admin only)</button>
          <button className={btn} onClick={() => call('GET /stats (custom endpoint)', 'GET', '/stats')}>Stats</button>
          <button className={btn} onClick={() => call('GET /admin/audit (role:admin)', 'GET', '/admin/audit')}>Audit log (admin only)</button>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <div className={h2 + ' mb-0'}>Results</div>
        <button className="text-sm text-neutral-500 underline" onClick={() => setResults([])}>Clear</button>
      </div>
      {results.length === 0 && <p className="text-sm text-neutral-500">Nothing yet. Click a button above.</p>}
      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="rounded border border-neutral-200 p-3">
            <div className="text-sm font-medium">
              <span className={r.ok ? 'text-green-700' : 'text-red-700'}>{String(r.status)}</span> {r.label}
            </div>
            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-neutral-700">{r.body}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_AspnetTest_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_AspnetTest_Index
