/* @arkzen:meta
name: go-concurrency-lab
version: 1.0.0
description: "Demonstrates Go net/http handling with a sequential-versus-parallel read burst and a validated SQLite-backed task API."
backend: go
auth: false
*/

/* @arkzen:database:tasks
table: tasks
timestamps: true
columns:
  title:
    type: string
    length: 120
    nullable: false
  priority:
    type: integer
    default: 3
  status:
    type: string
    default: queued
*/

/* @arkzen:api:tasks
model: Task
controller: TaskController
table: tasks
prefix: /api/go-concurrency-lab/tasks
middleware: []
endpoints:
  index:
    method: GET
    route: /
    response:
      type: paginated
  store:
    method: POST
    route: /
    validation:
      title: required|string|max:120
      priority: required|integer|min:1|max:5
      status: required|in:queued,done
*/

/* @arkzen:web:page:index */
'use client'

import React, { useCallback, useEffect, useState } from 'react'

type Task = {
  id: number
  title: string
  priority: number
  status: string
}

type ReadResult = {
  mode: 'Sequential' | 'Parallel'
  completed: number
  failed: number
  elapsedMs: number
  requestsPerSecond: number
}

const API = '/api/go-concurrency-lab/tasks'
const BURST_SIZE = 24

const IndexPage = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('3')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReadResult | null>(null)

  const loadTasks = useCallback(async () => {
    const response = await fetch(`${API}?per_page=10`, { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message ?? 'Could not load tasks.')
    setTasks(data.data ?? [])
  }, [])

  useEffect(() => {
    loadTasks()
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Could not load tasks.'))
      .finally(() => setLoading(false))
  }, [loadTasks])

  const createTask = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ title, priority: Number(priority), status: 'queued' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.errors?.join(', ') ?? data?.message ?? 'Could not save task.')
      setTitle('')
      await loadTasks()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save task.')
    } finally {
      setSaving(false)
    }
  }

  const runReadBurst = async (mode: ReadResult['mode']) => {
    setTesting(true)
    setError('')
    setResult(null)
    const startedAt = performance.now()
    let completed = 0

    const readOnce = async () => {
      const response = await fetch(`${API}?per_page=10`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`Read failed (${response.status})`)
      await response.json()
      completed += 1
    }

    try {
      if (mode === 'Parallel') {
        await Promise.allSettled(Array.from({ length: BURST_SIZE }, readOnce))
      } else {
        for (let request = 0; request < BURST_SIZE; request += 1) {
          try {
            await readOnce()
          } catch {
            // Count individual failures and finish the full sequential sample.
          }
        }
      }

      const elapsedMs = performance.now() - startedAt
      setResult({
        mode,
        completed,
        failed: BURST_SIZE - completed,
        elapsedMs,
        requestsPerSecond: completed / (elapsedMs / 1000),
      })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Read test failed.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Go · net/http · Chi</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Concurrency Lab</h1>
          <p className="max-w-2xl text-slate-300">
            Compare sequential and parallel reads against Go&apos;s HTTP API, then create tasks through its validated SQLite CRUD route.
          </p>
        </header>

        <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold">Request burst</p>
            <p className="mt-1 text-sm text-slate-400">{BURST_SIZE} reads against the same paginated endpoint.</p>
          </div>
          <button
            type="button"
            disabled={testing}
            onClick={() => runReadBurst('Sequential')}
            className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            Run sequential
          </button>
          <button
            type="button"
            disabled={testing}
            onClick={() => runReadBurst('Parallel')}
            className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
          >
            Run parallel
          </button>
        </section>

        {result && (
          <section aria-live="polite" className="grid gap-4 rounded-2xl border border-cyan-900 bg-cyan-950/40 p-5 sm:grid-cols-4">
            <div><p className="text-xs uppercase tracking-wider text-cyan-200">Mode</p><p className="mt-1 text-xl font-bold">{result.mode}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-cyan-200">Completed</p><p className="mt-1 text-xl font-bold">{result.completed}/{BURST_SIZE}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-cyan-200">Elapsed</p><p className="mt-1 text-xl font-bold">{result.elapsedMs.toFixed(1)} ms</p></div>
            <div><p className="text-xs uppercase tracking-wider text-cyan-200">Observed rate</p><p className="mt-1 text-xl font-bold">{result.requestsPerSecond.toFixed(1)} req/s</p></div>
            {result.failed > 0 && <p className="sm:col-span-4 text-sm text-amber-300">{result.failed} requests failed. Check that the Go backend is running and active.</p>}
            <p className="sm:col-span-4 text-xs text-slate-400">Browser-to-server sample, not a controlled benchmark; host load and SQLite affect timings.</p>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <form onSubmit={createTask} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div>
              <h2 className="text-lg font-semibold">Validated task writes</h2>
              <p className="mt-1 text-sm text-slate-400">Required title and priority (1–5) are checked by the Go API.</p>
            </div>
            <label className="block space-y-2 text-sm">
              <span>Task title</span>
              <input required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-cyan-400" />
            </label>
            <label className="block space-y-2 text-sm">
              <span>Priority</span>
              <select value={priority} onChange={event => setPriority(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-cyan-400">
                {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <button disabled={saving} className="w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-200 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save task'}
            </button>
          </form>

          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5" aria-label="Recent tasks">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Recent tasks</h2>
                <p className="mt-1 text-sm text-slate-400">Go-backed SQLite records · first 10</p>
              </div>
              <button type="button" onClick={() => loadTasks().catch(reason => setError(reason instanceof Error ? reason.message : 'Could not reload tasks.'))} className="rounded-lg border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800">Refresh</button>
            </div>
            {loading ? <p className="text-sm text-slate-400">Loading tasks…</p>
              : tasks.length ? <ul className="divide-y divide-slate-800">{tasks.map(task => (
                <li key={task.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="truncate text-sm">{task.title}</span>
                  <span className="shrink-0 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-cyan-200">P{task.priority} · {task.status}</span>
                </li>
              ))}</ul>
              : <p className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">No tasks yet. Add one to exercise the Go CRUD route.</p>}
          </section>
        </section>

        {error && <p role="alert" className="rounded-lg border border-rose-900 bg-rose-950/50 p-3 text-sm text-rose-200">{error}</p>}
      </div>
    </main>
  )
}
/* @arkzen:web:page:index:end */
