'use client'
// ============================================================
// ARKZEN GENERATED PAGE — express-test/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:20:58.763Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
const API = 'http://localhost:8000/api/express-test'

type Result = { label: string; status: number | string; body: string; ok: boolean }

const IndexPage = () => {
  const [email, setEmail] = useState('tester@example.com')
  const [password, setPassword] = useState('password123')
  const [token, setToken] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [ticketId, setTicketId] = useState('1')
  const [title, setTitle] = useState('My test ticket')
  const [results, setResults] = useState<Result[]>([])

  const call = async (
    label: string,
    method: string,
    path: string,
    opts: { body?: unknown; auth?: boolean; json?: boolean } = {},
  ) => {
    const { body, auth = true, json = true } = opts
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (json) headers['Content-Type'] = 'application/json'
    if (auth && token) headers['Authorization'] = 'Bearer ' + token
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
    const ok = typeof status === 'number' && status >= 200 && status < 300
    setResults(prev => [{ label, status, body: data ? JSON.stringify(data, null, 2) : text, ok }, ...prev])
    return data
  }

  const register = async () => {
    const d = await call('POST /auth/register', 'POST', '/auth/register', {
      auth: false,
      body: { name: 'Tester', email, password, password_confirmation: password },
    })
    if (d?.token) { setToken(d.token); setUserId(d.user?.id ?? null) }
  }
  const login = async () => {
    const d = await call('POST /auth/login', 'POST', '/auth/login', { auth: false, body: { email, password } })
    if (d?.token) { setToken(d.token); setUserId(d.user?.id ?? null) }
  }
  const me = async () => {
    const d = await call('GET /auth/me', 'GET', '/auth/me')
    if (d?.id) setUserId(d.id)
  }
  const logout = async () => {
    await call('POST /auth/logout', 'POST', '/auth/logout')
  }
  const createTicket = async (mine: boolean) => {
    const payload: Record<string, unknown> = { title, priority: 2 }
    if (mine && userId !== null) payload.user_id = userId
    const d = await call(mine ? 'POST /tickets (owned by me)' : 'POST /tickets', 'POST', '/tickets', { body: payload })
    const created = d?.data ?? d
    if (created?.id) setTicketId(String(created.id))
  }

  const btn = 'rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100'
  const input = 'rounded border border-neutral-300 px-2 py-1 text-sm'
  const group = 'mb-5'
  const h2 = 'mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500'

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Express backend test</h1>
      <p className="mb-1 text-neutral-600">Click the buttons to exercise the :ts variants. Backend: {API}</p>
      <p className="mb-6 text-sm text-neutral-500">
        {token ? 'Logged in' + (userId !== null ? ' as user #' + userId : '') : 'Not logged in'}
      </p>

      <div className={group}>
        <div className={h2}>No login needed</div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={() => call('GET /probe/hello (custom route)', 'GET', '/probe/hello', { auth: false })}>Probe route</button>
          <button className={btn} onClick={() => call('GET /ping with JSON header -> 200', 'GET', '/ping', { auth: false })}>Ping (JSON, expect 200)</button>
          <button className={btn} onClick={() => call('GET /ping without JSON header -> 415', 'GET', '/ping', { auth: false, json: false })}>Ping (no JSON, expect 415)</button>
          <button className={btn} onClick={() => call('GET /tickets without token -> 401', 'GET', '/tickets', { auth: false })}>Tickets without token (expect 401)</button>
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
          <button className={btn} onClick={me}>Who am I</button>
          <button className={btn} onClick={logout}>Logout</button>
          <button className={btn} onClick={() => call('POST /auth/register invalid -> 422', 'POST', '/auth/register', { auth: false, body: { email: 'nope' } })}>Register with bad data (expect 422)</button>
        </div>
      </div>

      <div className={group}>
        <div className={h2}>Tickets (login first)</div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <input className={input} value={title} onChange={e => setTitle(e.target.value)} placeholder="ticket title" />
          <span className="text-sm text-neutral-500">ticket id</span>
          <input className={input + ' w-16'} value={ticketId} onChange={e => setTicketId(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={() => call('GET /tickets', 'GET', '/tickets')}>List tickets</button>
          <button className={btn} onClick={() => call('GET /tickets?status=closed', 'GET', '/tickets?status=closed')}>Only closed</button>
          <button className={btn} onClick={() => createTicket(true)}>Create ticket (mine)</button>
          <button className={btn} onClick={() => createTicket(false)}>Create ticket (no owner)</button>
          <button className={btn} onClick={() => call('POST /tickets empty -> 422', 'POST', '/tickets', { body: {} })}>Create empty (expect 422)</button>
          <button className={btn} onClick={() => call('GET /tickets/' + ticketId, 'GET', '/tickets/' + ticketId)}>Show ticket</button>
          <button className={btn} onClick={() => call('PUT /tickets/' + ticketId + ' (needs to be mine)', 'PUT', '/tickets/' + ticketId, { body: { status: 'closed' } })}>Close ticket</button>
          <button className={btn} onClick={() => call('DELETE /tickets/' + ticketId + ' (non-admin -> 403)', 'DELETE', '/tickets/' + ticketId)}>Delete ticket (expect 403)</button>
          <button className={btn} onClick={() => call('GET /stats (custom endpoint)', 'GET', '/stats')}>Stats</button>
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
const ArkzenPage_ExpressTest_Index = () => {
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

export default ArkzenPage_ExpressTest_Index
