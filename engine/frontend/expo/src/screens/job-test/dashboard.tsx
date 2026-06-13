// ============================================================
// ARKZEN GENERATED SCREEN — job-test/dashboard
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { BACKEND_URL } from './components/constants'
import { dotColor, statusStyle } from './components/utils'
import type { JobResult } from './components/types'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono, arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { useEffect, useRef, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { Cpu, RefreshCw } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:dashboard)
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

// Engine wrapper
export function ArkzenScreen_JobTest_Dashboard() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('job-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <DashboardScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_JobTest_Dashboard
