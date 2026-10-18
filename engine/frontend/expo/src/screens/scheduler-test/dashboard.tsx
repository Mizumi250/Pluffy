// ============================================================
// ARKZEN GENERATED SCREEN — scheduler-test/dashboard
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Activity, BarChart3, Clock3, RefreshCw, Trash2 } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { BACKEND_URL } from './components/constants'
import { exitCodeStyle, triggeredStyle } from './components/utils'
import type { CommandRun } from './components/types'

// User screen (from @arkzen:native:page:dashboard)
const DashboardScreen = () => {
  const commands = [
    { key: 'cleanup-temp',    label: 'Cleanup Temp',    signature: 'scheduler-test:cleanup-temp',    schedule: 'Every hour',    icon: <Trash2    size={14} color="#d97706" /> },
    { key: 'generate-report', label: 'Generate Report', signature: 'scheduler-test:generate-report', schedule: 'Daily at 8am', icon: <BarChart3  size={14} color="#7c3aed" /> },
    { key: 'ping-health',     label: 'Ping Health',     signature: 'scheduler-test:ping-health',     schedule: 'Every 5 min',  icon: <Activity  size={14} color="#dc2626" /> },
    { key: 'sync-data',       label: 'Sync Data',       signature: 'scheduler-test:sync-data',       schedule: 'Every 15 min', icon: <RefreshCw size={14} color="#0284c7" /> },
  ]

  const [runs,      setRuns]      = useState<CommandRun[]>([])
  const [loading,   setLoading]   = useState(false)
  const [running,   setRunning]   = useState<string | null>(null)
  const [clearing,  setClearing]  = useState(false)

  const loadRuns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await arkzenFetch(`${BACKEND_URL}/api/scheduler-test/runs?per_page=50`)
      const d   = await res.json()
      setRuns(Array.isArray(d) ? d : (d?.data ?? []))
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadRuns() }, [loadRuns])

  const runCommand = async (cmdKey: string) => {
    setRunning(cmdKey)
    try {
      await arkzenFetch(`${BACKEND_URL}/api/scheduler-test/run`, {
        method: 'POST',
        body:   JSON.stringify({ command: cmdKey, triggered_by: 'manual' }),
      })
      await loadRuns()
    } catch {}
    finally { setRunning(null) }
  }

  const clearRuns = async () => {
    setClearing(true)
    try {
      await arkzenFetch(`${BACKEND_URL}/api/scheduler-test/runs`, { method: 'DELETE' })
      setRuns([])
    } catch {}
    finally { setClearing(false) }
  }

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <View className="flex-row items-center gap-2">
          <Clock3 size={18} color="#0f172a" />
          <Text className="text-lg font-bold text-neutral-900">Scheduler Test</Text>
        </View>
        <Text className="text-xs text-neutral-500 mt-0.5">
          Run commands manually or let the scheduler fire them.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Command cards — 2 column grid */}
        <View className="flex-row flex-wrap gap-3">
          {commands.map(cmd => (
            <View key={cmd.key} className="bg-white rounded-2xl border border-neutral-100 p-4" style={{ width: '47.5%' }}>
              <View className="flex-row items-center gap-2 mb-1">
                {cmd.icon}
                <Text className="text-sm font-semibold text-neutral-900 flex-1" numberOfLines={1}>{cmd.label}</Text>
              </View>
              <Text className="text-xs text-neutral-400 font-mono mb-1" numberOfLines={1}>{cmd.signature}</Text>
              <View className="flex-row items-center gap-1 mb-3">
                <Clock3 size={11} color="#a3a3a3" />
                <Text className="text-xs text-neutral-500">{cmd.schedule}</Text>
              </View>
              <TouchableOpacity
                onPress={() => runCommand('/api/scheduler-test/run', { command: cmd.key, triggered_by: 'manual' })}
                disabled={!!running}
                activeOpacity={0.8}
                className={`py-2 rounded-xl items-center ${runningKey?.command === cmd.key ? 'bg-neutral-200' : 'bg-neutral-900'}`}
              >
                {runningKey?.command === cmd.key
                  ? <ActivityIndicator size="small" color="#737373" />
                  : <Text className="text-white text-xs font-semibold">Run now</Text>
                }
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Execution history */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-3.5 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-900">Execution history</Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={loadRuns} className="p-1.5">
                {loading
                  ? <ActivityIndicator size="small" color="#a3a3a3" />
                  : <RefreshCw size={14} color="#a3a3a3" />
                }
              </TouchableOpacity>
              {runs.length > 0 && (
                <TouchableOpacity onPress={clearRuns} disabled={clearing} className="p-1.5">
                  {clearing
                    ? <ActivityIndicator size="small" color="#f87171" />
                    : <Trash2 size={14} color="#f87171" />
                  }
                </TouchableOpacity>
              )}
            </View>
          </View>

          {runs.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-neutral-400">No runs yet.</Text>
              <Text className="text-xs text-neutral-300 mt-1">Click "Run now" on any command above.</Text>
            </View>
          ) : (
            runs.map((r, i) => {
              const exit    = exitCodeStyle(r.exit_code)
              const trigger = triggeredStyle(r.triggered_by)
              return (
                <View
                  key={r.id}
                  className={`px-5 py-3.5 ${i < runs.length - 1 ? 'border-b border-neutral-50' : ''}`}
                >
                  <View className="flex-row items-center justify-between gap-2 mb-1">
                    <Text className="text-xs font-mono font-medium text-neutral-700 flex-1" numberOfLines={1}>
                      {r.signature}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      {r.duration_ms != null && (
                        <Text className="text-xs text-neutral-400">{r.duration_ms}ms</Text>
                      )}
                      <View className={`px-1.5 py-0.5 rounded-md ${trigger.bg}`}>
                        <Text className={`text-xs font-medium ${trigger.text}`}>{r.triggered_by}</Text>
                      </View>
                      <View className={`px-1.5 py-0.5 rounded-md ${exit.bg}`}>
                        <Text className={`text-xs font-medium ${exit.text}`}>exit {r.exit_code}</Text>
                      </View>
                    </View>
                  </View>
                  {r.output && (
                    <View className="bg-neutral-50 rounded-lg px-3 py-2 mt-1">
                      <Text className="text-xs text-neutral-400">{r.output}</Text>
                    </View>
                  )}
                  <Text className="text-xs text-neutral-300 mt-1">{r.created_at}</Text>
                </View>
              )
            })
          )}
        </View>

        {/* Info */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            backend: /api/scheduler-test{'\n'}
            cron: * * * * * php artisan schedule:run
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_SchedulerTest_Dashboard() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('scheduler-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ArkzenStatusBar style="dark" />
      
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

export default ArkzenScreen_SchedulerTest_Dashboard
