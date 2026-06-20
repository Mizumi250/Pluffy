// ARKZEN GENERATED — job-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:05.390Z
import { BACKEND_URL } from './components/constants'
import { dotBg, statusBg, statusText } from './components/utils'
import type { JobResult } from './components/types'
import { useEffect, useRef, useState } from '@lynx-js/react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { Icon } from '@sigx/lynx-icons'

const DashboardScreen = () => {
  const jobs = [
    { name: 'process-data',      label: 'Process Data',      desc: 'Normal job, succeeds in ~2s',     queue: 'default', color: 'blue'   },
    { name: 'heavy-computation', label: 'Heavy Computation', desc: 'Slow job, 5s timeout simulation', queue: 'heavy',   color: 'purple' },
    { name: 'always-fails',      label: 'Always Fails',      desc: 'Tests the failed jobs handler',   queue: 'default', color: 'red'    },
  ]

  const [results,     setResults]     = useState<JobResult[]>([])
  const [loading,     setLoading]     = useState(false)
  const [dispatching, setDispatching] = useState<string | null>(null)
  const pollingRef = useRef<any>(null)

  const loadResults = async () => {
    setLoading(true)
    try {
      const res = await arkzenFetch(`${BACKEND_URL}/api/job-test/results`)
      const d   = await res.json()
      setResults(Array.isArray(d) ? d : (d?.data ?? []))
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    loadResults()
    return () => {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
    }
  }, [])

  const dispatch = async (jobName: string) => {
    setDispatching(jobName)
    try {
      await arkzenFetch(`${BACKEND_URL}/api/job-test/dispatch`, {
        method: 'POST',
        body:   JSON.stringify({ job: jobName }),
      })
      if (pollingRef.current) clearInterval(pollingRef.current)
      loadResults()
      pollingRef.current = setInterval(loadResults, 500)
      setTimeout(() => {
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
      }, 10000)
    } catch {}
    finally { setDispatching(null) }
  }

  return (
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4">
        <view className="flex-row items-center gap-2">
          <Icon set="lucide" name="cpu" size={18} color="#0f172a" />
          <text className="text-lg font-bold text-neutral-900">Job Test</text>
        </view>
        <text className="text-xs text-neutral-500 font-mono mt-0.5">
          php artisan queue:work
        </text>
      </view>

      <scroll-view className="flex-1 p-4 gap-y-3">

        {/* Job cards */}
        {jobs.map(job => (
          <view key={job.name} className="bg-white rounded-2xl border border-neutral-100 p-4 flex-row items-center justify-between gap-3">
            <view className="flex-row items-center gap-3 flex-1">
              {/* dynamic color per job — use inline */}
              <view style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotBg(job.color) }} />
              <view className="flex-1">
                <text className="text-sm font-semibold text-neutral-900">{job.label}</text>
                <text className="text-xs text-neutral-500 mt-0.5">
                  {job.desc} · queue: {job.queue}
                </text>
              </view>
            </view>
            {/* dynamic bg when dispatching — use inline */}
            <view
              bindtap={() => dispatching === job.name ? null : dispatch(job.name)}
              className="px-4 py-2 rounded-xl items-center justify-center"
              style={{ backgroundColor: dispatching === job.name ? '#e5e5e5' : '#171717' }}
            >
              <text className={dispatching === job.name ? 'text-neutral-400 text-xs font-semibold' : 'text-white text-xs font-semibold'}>
                {dispatching === job.name ? 'Dispatching…' : 'Dispatch'}
              </text>
            </view>
          </view>
        ))}

        {/* Results */}
        <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <view className="px-5 py-3.5 border-b border-neutral-100 flex-row items-center justify-between">
            <text className="text-sm font-semibold text-neutral-900">Results</text>
            <view bindtap={loadResults} className="p-1.5">
              {loading
                ? <text className="text-xs text-neutral-400">Loading…</text>
                : <Icon set="lucide" name="refresh-cw" size={14} color="#a3a3a3" />
              }
            </view>
          </view>

          {results.length === 0 ? (
            <view className="py-10 items-center">
              <text className="text-sm text-neutral-400">No jobs dispatched yet.</text>
            </view>
          ) : (
            results.map((r, i) => (
              <view
                key={r.id}
                className={`px-5 py-3.5 flex-row items-center justify-between gap-3 ${
                  i < results.length - 1 ? 'border-b border-neutral-50' : ''
                }`}
              >
                <view className="flex-1">
                  <text className="text-sm font-semibold text-neutral-900">{r.job_name}</text>
                  {r.result && (
                    <text className="text-xs text-neutral-500 mt-0.5">{r.result}</text>
                  )}
                </view>
                {/* dynamic status color — use inline */}
                <view className="px-2 py-0.5 rounded-full" style={{ backgroundColor: statusBg(r.status) }}>
                  <text className="text-xs font-medium" style={{ color: statusText(r.status) }}>{r.status}</text>
                </view>
              </view>
            ))
          )}
        </view>

        {/* Info */}
        <view className="bg-neutral-100 rounded-2xl px-4 py-3">
          <text className="text-xs text-neutral-500 font-mono leading-5">
            {'backend: /api/job-test\nfailed jobs: failed_jobs table'}
          </text>
        </view>

      </scroll-view>
    </view>
  )
}
