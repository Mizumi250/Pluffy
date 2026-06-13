// ============================================================
// ARKZEN GENERATED SCREEN — broadcast-test/dashboard
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AuthLayout }  from '@/layouts/AuthLayout'
import { ChannelCard } from './components/ChannelCard'
import { StatusDot } from './components/StatusDot'
import { APP_KEY, BACKEND_URL, REVERB_HOST, REVERB_PORT, REVERB_SCHEME } from './components/constants'
import type { NativeMessage, WsStatus } from './components/types'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:dashboard)
const DashboardScreen = () => {
  const router                          = useRouter()
  const { user, logout }                = useAuthStore()
  console.log('[broadcast-test] user:', user?.id, user?.email)

  const [publicMsgs,   setPublicMsgs]   = useState<NativeMessage[]>([])
  const [privateMsgs,  setPrivateMsgs]  = useState<NativeMessage[]>([])
  const [presenceMsgs, setPresenceMsgs] = useState<NativeMessage[]>([])
  const [members,      setMembers]      = useState<{ id: number; name: string }[]>([])

  const [publicStatus,   setPublicStatus]   = useState<WsStatus>('connecting')
  const [privateStatus,  setPrivateStatus]  = useState<WsStatus>('connecting')
  const [presenceStatus, setPresenceStatus] = useState<WsStatus>('connecting')

  const [publicCount,   setPublicCount]   = useState(0)
  const [privateCount,  setPrivateCount]  = useState(0)
  const [presenceCount, setPresenceCount] = useState(0)

  const wsRef            = useRef<WebSocket | null>(null)
  const mountedRef       = useRef(true)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const addMsg = (setter: React.Dispatch<React.SetStateAction<NativeMessage[]>>, msg: NativeMessage) =>
    setter(prev => [msg, ...prev].slice(0, 50))

  const send = useCallback(async (channelType: string, content: string) => {
    if (!content.trim()) return
    try {
      await arkzenFetch(`${BACKEND_URL}/api/broadcast-test/messages`, {
        method: 'POST',
        body:   JSON.stringify({ content, channel_type: channelType }),
      })
    } catch (e) { console.error(e) }
  }, [])

  const connectReverb = useCallback(async (userId: number, authToken: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setPublicStatus('connecting')
    setPrivateStatus('connecting')
    setPresenceStatus('connecting')

    const ws = new WebSocket(`${REVERB_SCHEME}://${REVERB_HOST}:${REVERB_PORT}/app/${APP_KEY}`)
    wsRef.current = ws

    ws.onopen = () => { /* wait for pusher:connection_established */ }

    ws.onmessage = async (event) => {
      if (!mountedRef.current) return
      let msg: { event: string; data: unknown; channel?: string }
      try { msg = JSON.parse(event.data) } catch { return }

      if (msg.event === 'pusher:connection_established') {
        const connData = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const socketId = (connData as any).socket_id as string

        // 1. public — no auth needed
        setPublicStatus('connected')
        ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: 'broadcast-test-public' } }))

        // 2. private — use arkzenFetch, handles auth token automatically from map
        try {
          const res = await arkzenFetch(`${BACKEND_URL}/api/broadcast-test/auth/broadcasting/auth`, {
            method: 'POST',
            body:   JSON.stringify({ socket_id: socketId, channel_name: `private-broadcast-test.${userId}` }),
          })
          if (res.ok) {
            const { auth } = await res.json()
            ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: `private-broadcast-test.${userId}`, auth } }))
            setPrivateStatus('connected')
          } else { setPrivateStatus('error') }
        } catch (e) { console.error('[broadcast-test] private auth error:', e); setPrivateStatus('error') }

        // 3. presence — use arkzenFetch, handles auth token automatically from map
        try {
          const res = await arkzenFetch(`${BACKEND_URL}/api/broadcast-test/auth/broadcasting/auth`, {
            method: 'POST',
            body:   JSON.stringify({ socket_id: socketId, channel_name: 'presence-broadcast-test-presence' }),
          })
          if (res.ok) {
            const { auth, channel_data } = await res.json()
            ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: 'presence-broadcast-test-presence', auth, channel_data } }))
            setPresenceStatus('connected')
          } else { setPresenceStatus('error') }
        } catch (e) { console.error('[broadcast-test] presence auth error:', e); setPresenceStatus('error') }
      }

      if (msg.event === 'broadcast-test.message-sent-public' || msg.channel === 'broadcast-test-public') {
        const p = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        addMsg(setPublicMsgs, p as NativeMessage); setPublicCount(c => c + 1)
      }
      if (msg.event === 'broadcast-test.message-sent-private') {
        const p = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        addMsg(setPrivateMsgs, p as NativeMessage); setPrivateCount(c => c + 1)
      }
      if (msg.event === 'broadcast-test.message-sent-presence') {
        const p = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        addMsg(setPresenceMsgs, p as NativeMessage); setPresenceCount(c => c + 1)
      }
      if (msg.event === 'pusher_internal:member_added') {
        const d = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        setMembers(prev => [...prev.filter(m => m.id !== (d as any).user_id), { id: (d as any).user_id, name: (d as any).user_info?.name ?? 'Unknown' }])
      }
      if (msg.event === 'pusher_internal:member_removed') {
        const d = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        setMembers(prev => prev.filter(m => m.id !== (d as any).user_id))
      }
      if (msg.event === 'pusher_internal:subscription_succeeded' && msg.channel === 'presence-broadcast-test-presence') {
        const d    = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const hash = (d as any).presence?.hash ?? {}
        setMembers(Object.entries(hash).map(([id, info]: [string, any]) => ({ id: Number(id), name: info?.name ?? 'Unknown' })))
      }
    }

    ws.onerror = (e) => { console.error('[broadcast-test] ws error:', e); ws.close() }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setPublicStatus('error'); setPrivateStatus('error'); setPresenceStatus('error')
      reconnectTimeout.current = setTimeout(() => {
        if (mountedRef.current) connectReverb(userId, authToken)
      }, 3000)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    if (user?.id) {
      // Read token fresh from AsyncStorage map — store.token is not
      // persisted and may be null even when the user is authenticated.
      const run = async () => {
        const raw = await AsyncStorage.getItem('arkzen-auth-tokens')
        const map: Record<string, string> = raw ? JSON.parse(raw) : {}
        const authToken = map['broadcast-test'] ?? null
        if (authToken && mountedRef.current) connectReverb(user.id, authToken)
      }
      const t = setTimeout(run, 50)
      return () => clearTimeout(t)
    }
    return () => {
      mountedRef.current = false
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
      wsRef.current?.close()
    }
  }, [user?.id])

  const handleLogout = async () => {
    wsRef.current?.close()
    await logout()
    router.replace('/broadcast-test/login' as any)
  }

  const sendPublic   = useCallback((val: string) => send('public',   val), [send])
  const sendPrivate  = useCallback((val: string) => send('private',  val), [send])
  const sendPresence = useCallback((val: string) => send('presence', val), [send])

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-neutral-900">📡 Broadcast Test</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-xs text-neutral-400">Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <ChannelCard
          title="Public channel" badge="public" badgeColor="bg-blue-500"
          description="broadcast-test-public · No auth required."
          status={publicStatus} count={publicCount} msgs={publicMsgs} onSend={sendPublic}
        />

        <ChannelCard
          title="Private channel" badge="private" badgeColor="bg-purple-500"
          description={`private-broadcast-test.${user?.id} · HMAC-signed per user.`}
          status={privateStatus} count={privateCount} msgs={privateMsgs} onSend={sendPrivate}
        />

        <ChannelCard
          title="Presence channel" badge="presence" badgeColor="bg-green-500"
          description="presence-broadcast-test-presence · Auth + member roster."
          status={presenceStatus} count={presenceCount} msgs={presenceMsgs} onSend={sendPresence}
          footer={
            <View className="flex-row flex-wrap items-center gap-1.5">
              <Text className="text-xs text-neutral-400">Online:</Text>
              {members.length === 0
                ? <Text className="text-xs text-neutral-300">No members yet</Text>
                : members.map(m => (
                    <View key={m.id} className="bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                      <Text className="text-xs text-green-700">{m.name}</Text>
                    </View>
                  ))
              }
            </View>
          }
        />

        <View className="bg-neutral-100 rounded-2xl px-4 py-3 mt-2">
          <Text className="text-xs text-neutral-500 font-semibold mb-1.5">How each type works</Text>
          <Text className="text-xs text-neutral-500 leading-5">
            <Text className="font-semibold">Public</Text> — open channel, no auth handshake.{'\n'}
            <Text className="font-semibold">Private</Text> — scoped to your user ID, HMAC-verified.{'\n'}
            <Text className="font-semibold">Presence</Text> — like private + live member roster.
          </Text>
          <Text className="text-xs text-neutral-400 font-mono mt-2">
            php artisan reverb:start{'\n'}php artisan queue:work
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_BroadcastTest_Dashboard() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('broadcast-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AuthLayout tatSlug="broadcast-test" loginRoute="/broadcast-test/login">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <DashboardScreen />
      </ScrollView>
      </AuthLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_BroadcastTest_Dashboard
