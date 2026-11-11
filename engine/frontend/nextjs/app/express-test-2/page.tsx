'use client'
// ============================================================
// ARKZEN GENERATED PAGE — express-test-2/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:27.880Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { arkzenFetch, setActiveTatemono, useAuthStore, useAuthStoreHydrated } from '@/arkzen/core/stores/authStore'

// Page component code (from @arkzen:page:index)
const ExpressParityPage = () => {
  setActiveTatemono('express-test-2')
  const { login, user, token, logout, isLoading } = useAuthStore()
  const hydrated = useAuthStoreHydrated()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('express-test-2@example.com')
  const [password, setPassword] = useState('password123')
  const [records, setRecords] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [tab, setTab] = useState('crud')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ title: '', status: 'open', priority: 1 })

  const api = async (path: string, init: RequestInit = {}) => {
    const res = await arkzenFetch(`/api/express-test-2${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`)
    return data
  }
  const custom = async (path: string, init: RequestInit = {}) => {
    const res = await arkzenFetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`)
    return data
  }
  const refresh = async () => {
    try {
      const [r, f, l] = await Promise.all([
        api('/records'), api('/files'), api('/commands'),
      ])
      setRecords(r.data ?? r)
      setFiles(f.data ?? f)
      setLogs(l.data ?? l)
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Refresh failed') }
  }
  useEffect(() => {
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    const { token, fetchMe } = useAuthStore.getState()
    if (token && !user) void fetchMe()
  }, [hydrated, user])
  useEffect(() => { if (user) refresh() }, [user])
  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setMessage('')
    try { await fn(); await refresh() } catch (e) { setMessage(e instanceof Error ? e.message : 'Request failed') }
    finally { setBusy(false) }
  }
  const createRecord = () => run(async () => {
    await api('/records', { method: 'POST', body: JSON.stringify({ ...form, priority: Number(form.priority) }) })
    setForm({ title: '', status: 'open', priority: 1 })
  })
  const updateRecord = (record: any) => run(async () => {
    await api(`/records/${record.id}`, { method: 'PUT', body: JSON.stringify({ status: record.status === 'open' ? 'closed' : 'open' }) })
  })
  const deleteRecord = (id: number) => run(async () => {
    await api(`/records/${id}`, { method: 'DELETE' })
  })
  const upload = (list: FileList | null) => run(async () => {
    if (!list?.length) return
    const body = new FormData()
    Array.from(list).forEach(file => body.append('files[]', file))
    const res = await arkzenFetch('/api/express-test-2/files', { method: 'POST', body })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message ?? `Upload failed (${res.status})`)
  })
  const action = (path: string, body: Record<string, any>) => run(async () => {
    const result = await api(path, { method: 'POST', body: JSON.stringify(body) })
    setMessage(JSON.stringify(result))
  })

  if (!mounted || !hydrated || (token && !user)) return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border p-7 w-full max-w-sm text-center">
        <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-700" />
        <p className="text-sm text-neutral-500">Restoring your Express session…</p>
      </div>
    </main>
  )

  if (!user) return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <form className="bg-white rounded-2xl border p-7 w-full max-w-sm space-y-4" onSubmit={e => {
        e.preventDefault(); run(async () => { await login(email, password) })
      }}>
        <h1 className="text-2xl font-bold">Express parity lab</h1>
        <p className="text-sm text-neutral-500">Laravel test workflows, backed by Express.</p>
        <input className="arkzen-input w-full" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="arkzen-input w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="arkzen-btn w-full" disabled={busy || isLoading}>{busy ? 'Signing in…' : 'Sign in as test user'}</button>
        {message && <p className="text-sm text-red-600">{message}</p>}
      </form>
    </main>
  )

  return (
    <main className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-bold">Express parity lab</h1><p className="text-sm text-neutral-500">CRUD · uploads · queues · events · mail · notifications · realtime</p></div>
          <div className="flex gap-2"><button className="arkzen-btn-ghost" onClick={() => run(refresh)}>Refresh</button><button className="arkzen-btn-ghost" onClick={logout}>Sign out</button></div>
        </header>
        <nav className="flex flex-wrap gap-2">
          {['crud', 'uploads', 'async', 'messaging'].map(name => <button key={name} className={tab === name ? 'arkzen-btn' : 'arkzen-btn-ghost'} onClick={() => setTab(name)}>{name}</button>)}
        </nav>
        {message && <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{message}</div>}
        {tab === 'crud' && <section className="space-y-4">
          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-semibold">Create record</h2>
            <div className="grid md:grid-cols-4 gap-2">
              <input className="arkzen-input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <select className="arkzen-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>open</option><option>closed</option></select>
              <input className="arkzen-input" type="number" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })} />
              <button className="arkzen-btn" onClick={createRecord} disabled={busy}>Create</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border divide-y">{records.map(record => <div key={record.id} className="p-4 flex items-center gap-3"><span className="flex-1">{record.title}</span><span className="text-sm text-neutral-500">{record.status} · P{record.priority}</span><button className="text-xs text-blue-600" onClick={() => updateRecord(record)}>Toggle</button><button className="text-xs text-red-600" onClick={() => deleteRecord(record.id)}>Delete</button></div>)}{!records.length && <p className="p-6 text-neutral-500">No records loaded.</p>}</div>
          <div className="flex flex-wrap gap-2"><button className="arkzen-btn-ghost" onClick={() => run(async () => { const result = await api('/records/stats'); setMessage(JSON.stringify(result)) })}>Load stats</button><button className="arkzen-btn-ghost" onClick={() => run(async () => { const result = await custom('/api/express-test-2/health/ui'); setMessage(JSON.stringify(result)) })}>Probe custom route</button><button className="arkzen-btn-ghost" onClick={() => run(async () => { const result = await custom('/api/express-test-2/echo', { method: 'POST', body: JSON.stringify({ source: 'dashboard' }) }); setMessage(JSON.stringify(result)) })}>Probe echo</button></div>
        </section>}
        {tab === 'uploads' && <section className="bg-white rounded-2xl border p-5 space-y-4">
          <h2 className="font-semibold">Multipart uploads</h2>
          <input type="file" multiple onChange={e => upload(e.target.files)} />
          <div className="divide-y">{files.map(file => <div key={file.id} className="py-3 flex items-center gap-3"><span className="flex-1">{file.original_name}</span><a className="text-blue-600" href={file.url ?? `/api/express-test-2/files/${file.id}/url`}>Download</a><button className="text-xs text-red-600" onClick={() => run(async () => { await api(`/files/${file.id}`, { method: 'DELETE' }) })}>Delete</button></div>)}</div>
        </section>}
        {tab === 'async' && <section className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-semibold">Commands, jobs, and events</h2>
          <div className="flex flex-wrap gap-2"><button className="arkzen-btn" onClick={() => action('/commands/run', { command: 'cleanup' })}>Run command</button><button className="arkzen-btn" onClick={() => action('/jobs/dispatch', { job: 'process-record', data: { record_id: records[0]?.id } })}>Dispatch job</button><button className="arkzen-btn" onClick={() => action('/events/fire', { event: 'record-created', payload: { source: 'ui' } })}>Fire event</button></div>
          <pre className="bg-neutral-950 text-green-300 rounded-xl p-4 text-xs overflow-auto">{JSON.stringify(logs, null, 2)}</pre>
        </section>}
        {tab === 'messaging' && <section className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-semibold">Mail, notifications, broadcast, and SSE</h2>
          <div className="flex flex-wrap gap-2"><button className="arkzen-btn" onClick={() => action('/mail', { mail: 'welcome', to: email, data: { username: user.email, app_name: 'Express parity lab' } })}>Send mail</button><button className="arkzen-btn" onClick={() => action('/notify', { notification: 'record-alert' })}>Notify user</button><button className="arkzen-btn" onClick={() => action('/broadcast', { channel_type: 'public', target: 'express-test-2-public' })}>Broadcast</button><a className="arkzen-btn-ghost" href="/api/express-test-2/sse/public" target="_blank">Open SSE stream</a></div>
        </section>}
      </div>
    </main>
  )
}

// Wrapper for animation + layout
const ArkzenPage_ExpressTest2_Index = () => {
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
        <ExpressParityPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_ExpressTest2_Index
