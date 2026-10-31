'use client'
// ============================================================
// ARKZEN GENERATED PAGE — job-test/dashboard
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:21:08.187Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Cpu } from 'lucide-react'

// Page component code (from @arkzen:page:dashboard)
const DashboardPage = () => {
  const [results, setResults]   = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [dispatching, setDispatching] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  const jobs = [
    { name: 'process-data',       label: 'Process Data',       desc: 'Normal job, succeeds in ~2s', queue: 'default', color: 'bg-blue-500' },
    { name: 'heavy-computation',  label: 'Heavy Computation',  desc: 'Slow job, 5s timeout simulation', queue: 'heavy', color: 'bg-purple-500' },
    { name: 'always-fails',       label: 'Always Fails',       desc: 'Tests the failed jobs handler', queue: 'default', color: 'bg-red-500' },
  ]

  const loadResults = async () => {
    setLoading(true)
    try {
      const res = await arkzenFetch('/api/job-test/results')
      const d   = await res.json()
      // Laravel pagination returns { data: [...], meta: {...} }
      const items = Array.isArray(d) ? d : (d?.data ?? [])
      setResults(items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadResults() }, [])

  // Auto-poll results every 500ms while dispatching
  useEffect(() => {
    if (!isPolling) return
    const interval = setInterval(loadResults, 500)
    return () => clearInterval(interval)
  }, [isPolling])

  const dispatch = async (jobName: string) => {
    setDispatching(jobName)
    setIsPolling(true)
    try {
      await arkzenFetch('/api/job-test/dispatch', {
        method: 'POST',
        body: JSON.stringify({ job: jobName })
      })
      // Continue polling for 10 seconds to see job complete
      setTimeout(() => setIsPolling(false), 10000)
    } catch (e) {
      console.error(e)
      setIsPolling(false)
    } finally {
      setDispatching(null)
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      processing: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    }
    return map[status] ?? 'bg-neutral-100 text-neutral-600'
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Cpu size={20} /> Job Test</h1>
            <p className="text-sm text-neutral-500 mt-1">Queue: <code>php artisan queue:work</code></p>
          </div>
        </div>

        <div className="grid gap-3">
          {jobs.map(job => (
            <div key={job.name} className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${job.color}`} />
                <div>
                  <div className="font-medium text-sm">{job.label}</div>
                  <div className="text-xs text-neutral-500">{job.desc} · queue: {job.queue}</div>
                </div>
              </div>
              <button
                className="arkzen-btn text-sm"
                onClick={() => dispatch(job.name)}
                disabled={dispatching === job.name}
              >
                {dispatching === job.name ? 'Dispatching...' : 'Dispatch'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Results</h2>
            <button className="text-xs text-neutral-400 hover:text-neutral-700" onClick={loadResults}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">No jobs dispatched yet.</div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {results.map((r, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{r.job_name}</span>
                    <p className="text-xs text-neutral-500">{r.result}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge(r.status)}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4">
          <strong>How to test:</strong> Run <code>php artisan queue:work</code> in a terminal, then dispatch jobs here. Results update after ~2s. The "Always Fails" job will appear in the failed_jobs table.
        </div>
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_JobTest_Dashboard = () => {
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
        <DashboardPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_JobTest_Dashboard
