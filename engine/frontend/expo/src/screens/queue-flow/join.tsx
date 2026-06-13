// ============================================================
// ARKZEN GENERATED SCREEN — queue-flow/join
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppLayout } from '../../../arkzen/core/layouts/custom/queue-flow-app'
import { SpinRing } from './components/SpinRing'
import { StatCard } from './components/StatCard'
import { StatusPill } from './components/StatusPill'
import { TicketRowNative } from './components/TicketRowNative'
import { BACKEND_URL } from './components/constants'
import { fmtWait } from './components/utils'
import type { MyTicketData } from './components/types'

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
