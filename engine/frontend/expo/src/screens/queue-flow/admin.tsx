// ============================================================
// ARKZEN GENERATED SCREEN — queue-flow/admin
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import * as Speech from 'expo-speech'
import { Volume2 } from 'lucide-react-native'
import { ActivityIndicator, Animated, Easing, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { AppLayout } from '../../../arkzen/core/layouts/custom/queue-flow-app'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NativeQueue {
  id:               number
  name:             string
  description:      string | null
  prefix:           string
  is_active:        boolean
  avg_wait_minutes: number
}

interface NativeTicket {
  id:            number
  queue_id:      number
  ticket_number: string
  customer_name: string | null
  status:        'waiting' | 'serving' | 'done' | 'skipped'
  position:      number
  called_at:     string | null
  served_at:     string | null
  created_at:    string
}

interface NativeQueueStatus {
  queue:         NativeQueue
  serving:       NativeTicket | null
  waiting:       NativeTicket[]
  done_count:    number
  total_waiting: number
}

interface MyTicketData {
  ticket:         NativeTicket
  position:       number
  estimated_wait: number
  is_serving:     boolean
  is_done:        boolean
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const fmtWait = (mins: number) =>
  mins <= 0 ? 'Now' : mins < 60 ? `~${mins}m` : `~${Math.round(mins / 60)}h`

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

const StatusPill = ({ status }: { status: NativeTicket['status'] }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    waiting: { bg: 'bg-blue-50',    text: 'text-blue-600',   label: 'waiting'  },
    serving: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'serving' },
    done:    { bg: 'bg-neutral-100', text: 'text-neutral-500', label: 'done'   },
    skipped: { bg: 'bg-amber-50',   text: 'text-amber-600',  label: 'skipped'  },
  }
  const s = map[status] ?? map.waiting
  return (
    <View className={`px-2.5 py-1 rounded-full ${s.bg}`}>
      <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
    </View>
  )
}

const TicketRowNative = ({ ticket, position }: { ticket: NativeTicket; position: number }) => (
  <View className="flex-row items-center gap-3 px-5 py-3 border-b border-neutral-50">
    <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
      <Text className="text-xs font-bold text-blue-500">#{position}</Text>
    </View>
    <View className="flex-1 min-w-0">
      <Text className="text-sm font-semibold text-neutral-900">{ticket.ticket_number}</Text>
      <Text className="text-xs text-neutral-400" numberOfLines={1}>{ticket.customer_name ?? 'Guest'}</Text>
    </View>
    <StatusPill status={ticket.status} />
  </View>
)

const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <View className="flex-1 bg-white rounded-2xl border border-neutral-100 p-4 items-center gap-1">
    <Text className="text-2xl font-black text-neutral-900">{value}</Text>
    <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</Text>
    {sub ? <Text className="text-xs text-neutral-300">{sub}</Text> : null}
  </View>
)

// ─── Spinning ring for Display screen ────────────────────────────────────────

const SpinRing = ({ label, sub }: { label: string; sub: string }) => {
  const spin = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })
    ).start()
  }, [])
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  return (
    <View className="items-center py-6">
      <View className="relative w-36 h-36 items-center justify-center">
        <Animated.View
          style={{ transform: [{ rotate }] }}
          className="absolute inset-0 rounded-full border-4 border-transparent"
          // We fake the arc with border-t coloured
        >
          <View
            className="w-full h-full rounded-full"
            style={{ borderWidth: 3, borderColor: 'transparent', borderTopColor: '#a4c5f5' }}
          />
        </Animated.View>
        <View className="items-center">
          <Text className="text-2xl font-black text-blue-900">{label}</Text>
          <Text className="text-xs text-blue-400 font-medium mt-0.5">{sub}</Text>
        </View>
      </View>
    </View>
  )
}

// User screen (from @arkzen:native:page:admin)
const AdminScreen = () => {
  const announce = (text: string) => Speech.speak(text, { rate: 0.85, pitch: 1.0 })

  const [status,   setStatus]   = useState<NativeQueueStatus | null>(null)
  const [calling,  setCalling]  = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toast,    setToast]    = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const QUEUE_ID = 1

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    try {
      const res  = await arkzenFetch(`${BACKEND_URL}/api/queue-flow/status/${QUEUE_ID}`)
      const data = await res.json() as NativeQueueStatus
      setStatus(data)
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [load])

  const callNext = async () => {
    setCalling(true)
    try {
      const res  = await arkzenFetch(`${BACKEND_URL}/api/queue-flow/call-next`, {
        method: 'POST',
        body:   JSON.stringify({ queue_id: QUEUE_ID }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed')
      if (data.ticket) {
        const name = data.ticket.customer_name ?? 'Guest'
        showToast('success', `Now serving ${data.ticket.ticket_number}`)
        announce(`Now serving ${data.ticket.ticket_number}, ${name}, please proceed to the counter.`)
      } else {
        showToast('error', 'No more tickets in queue')
      }
      load()
    } catch (e) {
      showToast('error', e instanceof Error ? e.message : 'Call failed')
    } finally {
      setCalling(false)
    }
  }

  const onRefresh = () => { setRefreshing(true); load() }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>

      {/* Header */}
      <View style={{ backgroundColor: 'rgba(255,255,255,0.75)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text className="text-base font-semibold text-neutral-900">⚙️ Admin</Text>
        <Text className="text-xs text-neutral-400 mt-0.5">Manage the queue · auto-refreshes every 3s</Text>
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

          {/* Toast */}
          {toast && (
            <View className={`flex-row items-center gap-2 px-4 py-3 rounded-2xl border ${
              toast.type === 'success'
                ? 'bg-white border-emerald-200'
                : 'bg-white border-red-200'
            }`}>
              <Text className={`text-lg`}>{toast.type === 'success' ? '✓' : '✗'}</Text>
              <Text className={`text-sm font-medium flex-1 ${
                toast.type === 'success' ? 'text-emerald-700' : 'text-red-600'
              }`}>{toast.msg}</Text>
            </View>
          )}

          {/* Now serving card */}
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
              <Text className="text-neutral-400">No one being served</Text>
            )}
          </View>

          {/* Announce button — mirrors web AnnounceBadge */}
          {status?.serving && (
            <TouchableOpacity
              onPress={() => {
                const t = status.serving!
                announce(`Now serving ${t.ticket_number}, ${t.customer_name ?? 'Guest'}, please proceed to the counter.`)
              }}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.45)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.70)',
                alignSelf: 'flex-start',
              }}
            >
              <Volume2 size={14} color="#4a72c8" />
              <Text style={{ fontSize: 13, color: '#4a72c8', fontWeight: '500' }}>Announce</Text>
            </TouchableOpacity>
          )}

          {/* Call next button */}
          <TouchableOpacity
            onPress={callNext}
            disabled={calling || status?.total_waiting === 0}
            activeOpacity={0.8}
            className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 ${
              calling || status?.total_waiting === 0
                ? 'bg-neutral-200'
                : 'bg-neutral-900'
            }`}
          >
            {calling
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text className="text-xl">⏭</Text>
            }
            <Text className={`font-bold text-sm ${
              calling || status?.total_waiting === 0 ? 'text-neutral-400' : 'text-white'
            }`}>
              {calling ? 'Calling…' : 'Call Next'}
            </Text>
          </TouchableOpacity>

          {/* Stats */}
          <View className="flex-row gap-3">
            <StatCard label="Waiting" value={status?.total_waiting ?? 0} />
            <StatCard label="Served"  value={status?.done_count ?? 0} />
            <StatCard label="Avg"     value={fmtWait(status?.queue?.avg_wait_minutes ?? 5)} />
          </View>

          {/* Waiting list */}
          {(status?.waiting?.length ?? 0) > 0 ? (
            <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              <View className="px-5 py-3 border-b border-neutral-100 flex-row items-center justify-between">
                <Text className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Waiting</Text>
                <Text className="text-xs text-neutral-300">{status!.waiting.length} ticket{status!.waiting.length !== 1 ? 's' : ''}</Text>
              </View>
              {status!.waiting.map((t, i) => (
                <TicketRowNative key={t.id} ticket={t} position={i + 1} />
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-2xl border border-neutral-100 p-8 items-center">
              <Text className="text-3xl mb-3">🎉</Text>
              <Text className="text-sm text-neutral-400">Queue is clear!</Text>
            </View>
          )}

          {/* Info */}
          <View className="bg-neutral-100 rounded-2xl px-4 py-3">
            <Text className="text-xs text-neutral-500 font-mono leading-5">
              backend: /api/queue-flow/call-next{'\n'}
              queue_id: {QUEUE_ID}{'\n'}
              no auth required
            </Text>
          </View>

        </ScrollView>
      )}
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_QueueFlow_Admin() {
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
        <AdminScreen />
      </ScrollView>
      </AppLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_QueueFlow_Admin
