// ============================================================
// ARKZEN GENERATED SCREEN — queue-flow/join
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

// User screen (from @arkzen:native:page:join)
const JoinScreen = () => {
  const [step,      setStep]      = useState<'form' | 'ticket'>('form')
  const [name,      setName]      = useState('')
  const [loading,   setLoading]   = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [myTicket,  setMyTicket]  = useState<MyTicketData | null>(null)

  const QUEUE_ID = 1

  const refreshTicket = useCallback(async (queueId: number, ticketNumber: string) => {
    try {
      const res  = await arkzenFetch(`${BACKEND_URL}/api/queue-flow/my-ticket/${queueId}/${ticketNumber}`)
      const data = await res.json() as MyTicketData
      if (data?.ticket) setMyTicket(data)
    } catch {}
  }, [])

  // Poll when on ticket step
  useEffect(() => {
    if (step !== 'ticket' || !myTicket?.ticket) return
    const t        = myTicket.ticket
    const interval = setInterval(() => refreshTicket(t.queue_id, t.ticket_number), 5000)
    return () => clearInterval(interval)
  }, [step, myTicket])

  const join = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res  = await arkzenFetch(`${BACKEND_URL}/api/queue-flow/join`, {
        method: 'POST',
        body:   JSON.stringify({ queue_id: QUEUE_ID, customer_name: name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to join queue')
      const ticketData: MyTicketData = {
        ticket:         data.ticket,
        position:       data.position,
        estimated_wait: data.estimated_wait,
        is_serving:     false,
        is_done:        false,
      }
      setMyTicket(ticketData)
      setStep('ticket')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join queue')
    } finally {
      setLoading(false)
    }
  }

  const leave = () => {
    setMyTicket(null)
    setStep('form')
    setName('')
    setError(null)
  }

  const onRefresh = () => {
    if (!myTicket?.ticket) return
    setRefreshing(true)
    refreshTicket(myTicket.ticket.queue_id, myTicket.ticket.ticket_number)
      .finally(() => setRefreshing(false))
  }

  // ── Ticket view ───────────────────────────────────────────────────────────
  if (step === 'ticket' && myTicket?.ticket) {
    const { ticket, position, estimated_wait, is_serving, is_done } = myTicket

    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>

        {/* Header */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.75)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text className="text-base font-semibold text-neutral-900">⏳ Your Ticket</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">auto-refreshes every 5s</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a4c5f5" />}
        >

          {/* Big ticket card */}
          <View className={`rounded-3xl border p-8 items-center gap-4 ${
            is_serving ? 'bg-emerald-50 border-emerald-200' :
            is_done    ? 'bg-neutral-100 border-neutral-200' :
                         'bg-white border-neutral-100'
          }`}>
            {/* Position circle */}
            <View className={`w-32 h-32 rounded-full items-center justify-center ${
              is_serving ? 'bg-emerald-100' :
              is_done    ? 'bg-neutral-200' :
                           'bg-blue-50'
            }`}>
              <Text className={`text-5xl font-black ${
                is_serving ? 'text-emerald-600' :
                is_done    ? 'text-neutral-400' :
                             'text-blue-600'
              }`}>
                {is_done ? '✓' : position}
              </Text>
              <Text className={`text-xs font-bold mt-1 ${
                is_serving ? 'text-emerald-500' :
                is_done    ? 'text-neutral-400' :
                             'text-blue-400'
              }`}>
                {is_serving ? 'YOUR TURN' : is_done ? 'SERVED' : 'position'}
              </Text>
            </View>

            {/* Ticket number + name */}
            <View className="items-center gap-1">
              <Text className="text-3xl font-black text-neutral-900">{ticket.ticket_number}</Text>
              <Text className="text-sm text-neutral-400">{ticket.customer_name ?? 'Guest'}</Text>
            </View>

            {/* Status message */}
            <View className={`w-full rounded-2xl px-4 py-3 items-center ${
              is_serving ? 'bg-emerald-100' :
              is_done    ? 'bg-neutral-200' :
                           'bg-blue-50'
            }`}>
              {is_serving ? (
                <Text className="text-emerald-700 font-semibold text-sm">Please proceed to the counter</Text>
              ) : is_done ? (
                <Text className="text-neutral-500 font-medium text-sm">Thank you for your patience</Text>
              ) : (
                <>
                  <Text className="text-blue-600 font-semibold text-sm">Estimated wait</Text>
                  <Text className="text-blue-400 text-sm mt-0.5">{fmtWait(estimated_wait)}</Text>
                </>
              )}
            </View>
          </View>

          {/* Info card */}
          <View className="bg-white rounded-2xl border border-neutral-100 px-5 py-4">
            <Text className="text-xs text-neutral-400 font-mono leading-5">
              queue: General{'\n'}
              ticket: {ticket.ticket_number}{'\n'}
              status: {ticket.status}
            </Text>
          </View>

          {/* Leave / Done button */}
          {!is_done && !is_serving && (
            <TouchableOpacity
              onPress={leave}
              activeOpacity={0.8}
              className="py-4 rounded-2xl items-center border border-red-200 bg-white"
            >
              <Text className="text-red-500 font-semibold text-sm">Leave Queue</Text>
            </TouchableOpacity>
          )}
          {is_done && (
            <TouchableOpacity
              onPress={leave}
              activeOpacity={0.8}
              className="py-4 rounded-2xl items-center bg-neutral-900"
            >
              <Text className="text-white font-semibold text-sm">Done</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </View>
    )
  }

  // ── Join form ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>

      {/* Header */}
      <View style={{ backgroundColor: 'rgba(255,255,255,0.75)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text className="text-base font-semibold text-neutral-900">⏳ Join Queue</Text>
        <Text className="text-xs text-neutral-400 mt-0.5">Enter your name to get a ticket</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12 }}>

        {error && (
          <View className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <Text className="text-xs text-red-600">{error}</Text>
          </View>
        )}

        {/* Name input card */}
        <View className="bg-white rounded-2xl border border-neutral-100 p-5 gap-3">
          <Text className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Your Name</Text>
          <TextInput
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="e.g. Maria Santos"
            placeholderTextColor="#a3a3a3"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={join}
          />
          <Text className="text-xs text-neutral-400">
            You'll join the General queue (queue #1)
          </Text>
        </View>

        {/* Get ticket button */}
        <TouchableOpacity
          onPress={join}
          disabled={!name.trim() || loading}
          activeOpacity={0.8}
          className={`py-4 rounded-2xl items-center ${!name.trim() || loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
        >
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text className="text-white font-semibold text-sm">Get My Ticket</Text>
          }
        </TouchableOpacity>

        {/* Info note */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            backend: /api/queue-flow/join{'\n'}
            queue: General (prefix G){'\n'}
            no auth required
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_QueueFlow_Join() {
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
        <JoinScreen />
      </ScrollView>
      </AppLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_QueueFlow_Join
