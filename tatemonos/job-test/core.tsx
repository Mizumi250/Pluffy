/* @arkzen:meta
name: job-test
version: 1.0.0
description: Tests Laravel Queue Jobs. Dispatch a job, watch it process, see the result. Tests sync, default, and failed queues.
auth: false
*/

/* @arkzen:database
table: job_results
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  job_name:
    type: string
    length: 100
    nullable: false
  status:
    type: string
    length: 50
    nullable: false
  result:
    type: text
    nullable: true
  processed_at:
    type: datetime
    nullable: true
*/

/* @arkzen:api
model: JobResult
controller: JobResultController
prefix: /api/job-test
middleware: []
resource: false
policy: false
factory: false

endpoints:
  index:
    method: GET
    route: /results
    description: Get all job results
    response:
      type: paginated

  store:
    method: POST
    route: /dispatch
    description: Dispatch a job
    type: job_dispatch
    validation:
      job: required|string
    response:
      type: single
*/

/* @arkzen:endpoint:index
*/
$query = \App\Models\Arkzen\JobTest\JobResult::query();
$query->orderBy('created_at', 'desc');
$perPage = $request->get('per_page', 15);
$results = $query->paginate($perPage);
return response()->json($results);
/* @arkzen:endpoint:index:end */

/* @arkzen:jobs:process-data
queue: default
tries: 3
timeout: 30
*/
public function handle(): void
{
    $start = microtime(true);
    // Simulate work
    sleep(2);
    \App\Models\Arkzen\JobTest\JobResult::create([
        'job_name'     => 'process-data',
        'status'       => 'completed',
        'result'       => 'Data processed successfully in ' . round((microtime(true) - $start) * 1000) . 'ms',
        'processed_at' => now(),
    ]);
}
/* @arkzen:jobs:process-data:end */

/* @arkzen:jobs:heavy-computation
queue: heavy
tries: 1
timeout: 120
*/
public function handle(): void
{
    $start = microtime(true);
    // Simulate heavy work
    sleep(5);
    \App\Models\Arkzen\JobTest\JobResult::create([
        'job_name'     => 'heavy-computation',
        'status'       => 'completed',
        'result'       => 'Heavy computation completed in ' . round((microtime(true) - $start) * 1000) . 'ms',
        'processed_at' => now(),
    ]);
}
/* @arkzen:jobs:heavy-computation:end */

/* @arkzen:jobs:always-fails
queue: default
tries: 2
timeout: 10
*/
public function handle(): void
{
    throw new \Exception('This job always fails');
}
/* @arkzen:jobs:always-fails:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect } from 'react'
import { Cpu } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:guest */
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
/* @arkzen:web:page:dashboard:end */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Cpu, RefreshCw } from 'lucide-react-native'

const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Cpu, RefreshCw } from 'lucide-react-native'

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:rn:end */

interface JobResult {
  id:           number
  job_name:     string
  status:       string
  result:       string | null
  processed_at: string | null
  created_at:   string
}

const statusStyle = (s: string) => ({
  completed:  { bg: 'bg-green-100',  text: 'text-green-700'  },
  processing: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  failed:     { bg: 'bg-red-100',    text: 'text-red-600'    },
}[s] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' })

const dotColor = (color: string) => ({
  blue:   'bg-blue-500',
  purple: 'bg-purple-500',
  red:    'bg-red-500',
}[color] ?? 'bg-neutral-400')

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:dashboard */
/* @arkzen:native:page:layout:default */

const DashboardScreen = () => {
  const jobs = [
    { name: 'process-data',      label: 'Process Data',      desc: 'Normal job, succeeds in ~2s',       queue: 'default', color: 'blue'   },
    { name: 'heavy-computation', label: 'Heavy Computation', desc: 'Slow job, 5s timeout simulation',   queue: 'heavy',   color: 'purple' },
    { name: 'always-fails',      label: 'Always Fails',      desc: 'Tests the failed jobs handler',     queue: 'default', color: 'red'    },
  ]

  const [results,     setResults]     = useState<JobResult[]>([])
  const [loading,     setLoading]     = useState(false)
  const [dispatching, setDispatching] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
          <Cpu size={18} color="#0f172a" />
          <Text className="text-lg font-bold text-neutral-900">Job Test</Text>
        </View>
        <Text className="text-xs text-neutral-500 mt-0.5 font-mono">
          php artisan queue:work
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Job cards */}
        {jobs.map(job => (
          <View key={job.name} className="bg-white rounded-2xl border border-neutral-100 p-4 flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-3 flex-1 min-w-0">
              <View className={`w-2 h-2 rounded-full ${dotColor(job.color)}`} />
              <View className="flex-1 min-w-0">
                <Text className="text-sm font-semibold text-neutral-900">{job.label}</Text>
                <Text className="text-xs text-neutral-500 mt-0.5" numberOfLines={1}>
                  {job.desc} · queue: {job.queue}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => dispatch(job.name)}
              disabled={dispatching === job.name}
              activeOpacity={0.8}
              className={`px-4 py-2 rounded-xl items-center justify-center ${
                dispatching === job.name ? 'bg-neutral-200' : 'bg-neutral-900'
              }`}
            >
              {dispatching === job.name
                ? <ActivityIndicator size="small" color="#737373" />
                : <Text className="text-white text-xs font-semibold">Dispatch</Text>
              }
            </TouchableOpacity>
          </View>
        ))}

        {/* Results */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-3.5 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-900">Results</Text>
            <TouchableOpacity onPress={loadResults} className="p-1.5">
              {loading
                ? <ActivityIndicator size="small" color="#a3a3a3" />
                : <RefreshCw size={14} color="#a3a3a3" />
              }
            </TouchableOpacity>
          </View>

          {results.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-neutral-400">No jobs dispatched yet.</Text>
            </View>
          ) : (
            results.map((r, i) => {
              const st = statusStyle(r.status)
              return (
                <View
                  key={r.id}
                  className={`px-5 py-3.5 flex-row items-center justify-between gap-3 ${
                    i < results.length - 1 ? 'border-b border-neutral-50' : ''
                  }`}
                >
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-semibold text-neutral-900">{r.job_name}</Text>
                    {r.result && (
                      <Text className="text-xs text-neutral-500 mt-0.5" numberOfLines={2}>{r.result}</Text>
                    )}
                  </View>
                  <View className={`px-2 py-0.5 rounded-full ${st.bg}`}>
                    <Text className={`text-xs font-medium ${st.text}`}>{r.status}</Text>
                  </View>
                </View>
              )
            })
          )}
        </View>

        {/* Info */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            backend: /api/job-test{'\n'}
            failed jobs: failed_jobs table
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

/* @arkzen:native:page:dashboard:end */

/* @arkzen:native:components:lynx:shared */

import { useState, useEffect, useRef } from '@lynx-js/react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Icon } from '@sigx/lynx-icons'
const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

interface JobResult {
  id:           number
  job_name:     string
  status:       string
  result:       string | null
  processed_at: string | null
  created_at:   string
}

// status badge classes — dynamic status value, use inline bg color
const statusBg = (s: string) => ({
  completed:  '#dcfce7',
  processing: '#fef9c3',
  failed:     '#fee2e2',
}[s] ?? '#f5f5f5')

const statusText = (s: string) => ({
  completed:  '#15803d',
  processing: '#a16207',
  failed:     '#dc2626',
}[s] ?? '#525252')

// dot color — dynamic per job, use inline
const dotBg = (color: string) => ({
  blue:   '#3b82f6',
  purple: '#a855f7',
  red:    '#ef4444',
}[color] ?? '#a3a3a3')

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:dashboard */

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

/* @arkzen:native:page:lynx:dashboard:end */
