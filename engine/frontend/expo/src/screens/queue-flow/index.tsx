// ============================================================
// ARKZEN GENERATED SCREEN — queue-flow/index
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppLayout } from '../../../arkzen/core/layouts/custom/queue-flow-app'
import { SpinRing } from './components/SpinRing'
import { StatCard } from './components/StatCard'
import { StatusPill } from './components/StatusPill'
import { TicketRowNative } from './components/TicketRowNative'
import { BACKEND_URL } from './components/constants'
import { fmtWait } from './components/utils'
import type { NativeQueueStatus } from './components/types'
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native'import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono, arkzenFetch } from '../../../arkzen/core/stores/authStore'
import * as Speech from 'expo-speech'
import { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const [status, setStatus] = useState<NativeQueueStatus | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const prevServing = useRef<string | null>(null)

  const QUEUE_ID = 1

  const load = useCallback(async () => {
    try {
      const res  = await arkzenFetch(`${BACKEND_URL}/api/queue-flow/status/${QUEUE_ID}`)
      const data = await res.json() as NativeQueueStatus
      setStatus(data)
      if (data.serving && data.serving.ticket_number !== prevServing.current) {
        prevServing.current = data.serving.ticket_number
        Speech.speak(`Now serving ${data.serving.ticket_number}`, { rate: 0.85, pitch: 1.0 })
      }
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load])

  const onRefresh = () => { setRefreshing(true); load() }

  const riskLabel = !status ? '…'
    : status.total_waiting === 0 ? 'Clear'
    : status.total_waiting < 5  ? 'Low'
    : status.total_waiting < 10 ? 'Moderate' : 'High'

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>

      {/* Header */}
      <View style={{ backgroundColor: 'rgba(255,255,255,0.75)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text className="text-base font-semibold text-neutral-900">⏳ QueueFlow</Text>
        <Text className="text-xs text-neutral-400 mt-0.5">Live display · auto-refreshes every 5s</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a4c5f5" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a4c5f5" />}
        >

          {/* Risk ring card */}
          <View className="bg-white rounded-3xl border border-neutral-100 overflow-hidden">
            <SpinRing label={riskLabel} sub="queue risk level" />
            <View className="px-5 pb-4">
              <Text className="text-center text-xs text-neutral-400">
                {status?.total_waiting === 0
                  ? 'No one is waiting right now'
                  : `${status?.total_waiting} waiting · avg ${fmtWait(status?.queue?.avg_wait_minutes ?? 5)}`
                }
              </Text>
            </View>
          </View>

          {/* Stats row */}
          <View className="flex-row gap-3">
            <StatCard label="Waiting" value={status?.total_waiting ?? 0} />
            <StatCard label="Served"  value={status?.done_count ?? 0} />
            <StatCard label="Avg Wait" value={fmtWait(status?.queue?.avg_wait_minutes ?? 5)} />
          </View>

          {/* Now serving */}
          <View className="bg-white rounded-2xl border border-neutral-100 p-5">
            <Text className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Now Serving</Text>
            {status?.serving ? (
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-4xl font-black text-neutral-900">{status.serving.ticket_number}</Text>
                  <Text className="text-sm text-neutral-400 mt-1">{status.serving.customer_name ?? 'Guest'}</Text>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center">
                  <Text className="text-xl">✓</Text>
                </View>
              </View>
            ) : (
              <Text className="text-neutral-400">Queue is empty</Text>
            )}
          </View>

          {/* Waiting list */}
          {(status?.waiting?.length ?? 0) > 0 && (
            <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              <View className="px-5 py-3 border-b border-neutral-100">
                <Text className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Up Next</Text>
              </View>
              {status!.waiting.slice(0, 8).map((t, i) => (
                <TicketRowNative key={t.id} ticket={t} position={i + 1} />
              ))}
              {status!.waiting.length > 8 && (
                <View className="px-5 py-3">
                  <Text className="text-xs text-neutral-400 text-center">+{status!.waiting.length - 8} more in queue</Text>
                </View>
              )}
            </View>
          )}

          {/* Live badge */}
          <View className="items-center py-2">
            <View className="flex-row items-center gap-2 bg-white border border-neutral-100 rounded-full px-4 py-2">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-xs font-medium text-neutral-500">Live</Text>
            </View>
          </View>

        </ScrollView>
      )}
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_QueueFlow_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('queue-flow')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AppLayout tatSlug="queue-flow">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <IndexScreen />
      </ScrollView>
      </AppLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_QueueFlow_Index
