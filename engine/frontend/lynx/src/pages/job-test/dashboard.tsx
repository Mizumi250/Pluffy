// ARKZEN GENERATED — job-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.455Z
import { BACKEND_URL } from './components/constants'
import { dotBg, statusBg, statusText } from './components/utils'
import type { JobResult } from './components/types'
import { ScrollView, Text, TouchableOpacity, View, useEffect, useRef, useState } from '@lynx-js/react'
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
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <View className="flex-row items-center gap-2">
          <Icon set="lucide" name="cpu" size={18} color="#0f172a" />
          <Text className="text-lg font-bold text-neutral-900">Job Test</Text>
        </View>
        <Text className="text-xs text-neutral-500 font-mono mt-0.5">
          php artisan queue:work
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12 }}>

        {/* Job cards */}
        {jobs.map(job => (
          <View key={job.name} className="bg-white rounded-2xl border border-neutral-100 p-4 flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-3 flex-1">
              {/* dynamic color per job — use inline */}
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotBg(job.color) }} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-neutral-900">{job.label}</Text>
                <Text className="text-xs text-neutral-500 mt-0.5" numberOfLines={1}>
                  {job.desc} · queue: {job.queue}
                </Text>
              </View>
            </View>
            {/* dynamic bg when dispatching — use inline */}
            <TouchableOpacity
              onPress={() => dispatch(job.name)}
              disabled={dispatching === job.name}
              className="px-4 py-2 rounded-xl items-center justify-center"
              style={{ backgroundColor: dispatching === job.name ? '#e5e5e5' : '#171717' }}
            >
              <Text className={dispatching === job.name ? 'text-neutral-400 text-xs font-semibold' : 'text-white text-xs font-semibold'}>
                {dispatching === job.name ? 'Dispatching…' : 'Dispatch'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Results */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-3.5 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-900">Results</Text>
            <TouchableOpacity onPress={loadResults} className="p-1.5">
              {loading
                ? <Text className="text-xs text-neutral-400">Loading…</Text>
                : <Icon set="lucide" name="refresh-cw" size={14} color="#a3a3a3" />
              }
            </TouchableOpacity>
          </View>

          {results.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-neutral-400">No jobs dispatched yet.</Text>
            </View>
          ) : (
            results.map((r, i) => (
              <View
                key={r.id}
                className={`px-5 py-3.5 flex-row items-center justify-between gap-3 ${
                  i < results.length - 1 ? 'border-b border-neutral-50' : ''
                }`}
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-neutral-900">{r.job_name}</Text>
                  {r.result && (
                    <Text className="text-xs text-neutral-500 mt-0.5" numberOfLines={2}>{r.result}</Text>
                  )}
                </View>
                {/* dynamic status color — use inline */}
                <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: statusBg(r.status) }}>
                  <Text className="text-xs font-medium" style={{ color: statusText(r.status) }}>{r.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            {'backend: /api/job-test\nfailed jobs: failed_jobs table'}
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}
