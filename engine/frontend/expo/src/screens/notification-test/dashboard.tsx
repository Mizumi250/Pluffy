// ============================================================
// ARKZEN GENERATED SCREEN — notification-test/dashboard
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AuthLayout }  from '@/layouts/AuthLayout'
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { StatusDot } from './components/StatusDot'
import { APP_KEY, BACKEND_URL, REVERB_HOST, REVERB_PORT, REVERB_SCHEME } from './components/constants'
import { channelDesc, channelEmoji, channelLabel } from './components/utils'
import type { WsStatus } from './components/types'
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:dashboard)
const DashboardScreen = () => {
  const router         = useRouter()
  const { user, logout } = useAuthStore()

  const [inbox,       setInbox]       = useState<any[]>([])
  const [unread,      setUnread]      = useState(0)
  const [loading,     setLoading]     = useState(false)
  const [sending,     setSending]     = useState<string | null>(null)
  const [wsStatus,    setWsStatus]    = useState<WsStatus>('connecting')
  const [toast,       setToast]       = useState<string | null>(null)

  const wsRef            = useRef<WebSocket | null>(null)
  const mountedRef       = useRef(true)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const notifTypes = [
    'database-ping',
    'mail-ping',
    'broadcast-ping',
    'broadcast-ping-public',
    'all-channels',
  ]

  // ── Show a temporary toast ─────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // ── Load inbox from backend ────────────────────────────────
  const loadInbox = async () => {
    setLoading(true)
    try {
      const res = await arkzenFetch(`${BACKEND_URL}/api/notification-test/inbox`)
      const d   = await res.json()
      const items = d.data ?? []
      setInbox(items)
      setUnread(items.filter((n: any) => !n.read_at).length)
    } catch (err) {
      console.error('[notification-test] Failed to load inbox:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Connect to Reverb ──────────────────────────────────────
  // Subscribes to:
  //   private-notification-test.<userId>   (private broadcast pings)
  //   notification-test.notifications      (public broadcast pings)
  const connectReverb = async (userId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setWsStatus('connecting')

    const raw = await AsyncStorage.getItem('arkzen-auth-tokens')
    const map: Record<string, string> = raw ? JSON.parse(raw) : {}
    if (!map['notification-test']) {
      setWsStatus('error')
      return
    }

    const ws = new WebSocket(`${REVERB_SCHEME}://${REVERB_HOST}:${REVERB_PORT}/app/${APP_KEY}`)
    wsRef.current = ws

    ws.onopen = () => { /* wait for pusher:connection_established */ }

    ws.onmessage = async (event) => {
      if (!mountedRef.current) return
      let msg: { event: string; data: unknown; channel?: string }
      try { msg = JSON.parse(event.data) } catch { return }

      if (msg.event === 'pusher:connection_established') {
        setWsStatus('connected')
        const connData = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const socketId = (connData as any).socket_id as string

        // 1. Subscribe to private channel (auth required)
        try {
          const res = await arkzenFetch(
            `${BACKEND_URL}/api/notification-test/auth/broadcasting/auth`,
            {
              method: 'POST',
              body: JSON.stringify({
                socket_id:    socketId,
                channel_name: `private-notification-test.${userId}`,
              }),
            }
          )
          if (res.ok) {
            const { auth } = await res.json()
            ws.send(JSON.stringify({
              event: 'pusher:subscribe',
              data:  { channel: `private-notification-test.${userId}`, auth },
            }))
          } else {
            console.error('[notification-test] private channel auth failed:', res.status)
          }
        } catch (e) {
          console.error('[notification-test] private auth error:', e)
        }

        // 2. Subscribe to public notification channel (no auth)
        ws.send(JSON.stringify({
          event: 'pusher:subscribe',
          data:  { channel: 'notification-test.notifications' },
        }))
      }

      // Incoming broadcast notification on either channel
      if (msg.event === 'notification-test.notification') {
        const payload = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        showToast((payload as any).message ?? 'New notification received!')
        setTimeout(loadInbox, 400)
      }
    }

    ws.onerror = () => { ws.close() }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setWsStatus('error')
      reconnectTimeout.current = setTimeout(() => {
        if (mountedRef.current) connectReverb(userId)
      }, 3000)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    loadInbox()

    if (user?.id) {
      const t = setTimeout(() => {
        if (mountedRef.current) connectReverb(user.id)
      }, 50)
      return () => clearTimeout(t)
    }

    return () => {
      mountedRef.current = false
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
      wsRef.current?.close()
    }
  }, [user?.id])

  // ── Trigger a notification ─────────────────────────────────
  const trigger = async (key: string) => {
    setSending(key)
    try {
      await arkzenFetch(`${BACKEND_URL}/api/notification-test/trigger`, {
        method: 'POST',
        body:   JSON.stringify({ notification: key }),
      })
      // Non-broadcast types don't push via WS — show feedback immediately
      if (!['broadcast-ping', 'broadcast-ping-public', 'all-channels'].includes(key)) {
        showToast(`${channelLabel[key]} notification sent!`)
      }
      setTimeout(loadInbox, 800)
    } catch (err) {
      console.error('[notification-test] trigger failed:', err)
    } finally {
      setSending(null)
    }
  }

  // ── Mark all read ──────────────────────────────────────────
  const readAll = async () => {
    try {
      await arkzenFetch(`${BACKEND_URL}/api/notification-test/inbox/read-all`, { method: 'POST' })
      loadInbox()
    } catch {}
  }

  // ── Delete a single notification ───────────────────────────
  const deleteNotif = async (id: string) => {
    try {
      await arkzenFetch(`${BACKEND_URL}/api/notification-test/inbox/${id}`, { method: 'DELETE' })
      loadInbox()
    } catch {}
  }

  const handleLogout = async () => {
    wsRef.current?.close()
    await logout()
    router.replace('/notification-test/login' as any)
  }

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Toast */}
      {toast && (
        <View
          style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 50 }}
          className="bg-neutral-900 rounded-2xl px-5 py-3 flex-row items-center gap-x-2"
        >
          <Text className="text-white text-sm flex-1">{toast}</Text>
        </View>
      )}

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-neutral-900">🔔 Notification Test</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">{user?.email}</Text>
        </View>
        <View className="flex-row items-center gap-x-3">
          <View className="flex-row items-center gap-x-1.5">
            <StatusDot status={wsStatus} />
            <Text className="text-xs text-neutral-400 capitalize">{wsStatus}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Text className="text-xs text-neutral-400">Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Stats row */}
        <View className="flex-row gap-x-3 mb-4">
          <View className="flex-1 bg-white rounded-2xl border border-neutral-100 p-4 items-center">
            <Text className="text-2xl font-bold text-neutral-900">{unread}</Text>
            <Text className="text-xs text-neutral-500 mt-0.5">Unread</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl border border-neutral-100 p-4 items-center">
            <Text className="text-2xl font-bold text-neutral-900">{inbox.length}</Text>
            <Text className="text-xs text-neutral-500 mt-0.5">Total</Text>
          </View>
        </View>

        {/* Trigger cards */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
          Trigger Notifications
        </Text>
        <View className="gap-y-3 mb-5">
          {notifTypes.map((key) => (
            <View key={key} className="bg-white rounded-2xl border border-neutral-100 p-4 flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center gap-x-2 mb-0.5">
                  <Text className="text-sm">{channelEmoji[key]}</Text>
                  <Text className="text-sm font-semibold text-neutral-900">{channelLabel[key]}</Text>
                </View>
                <Text className="text-xs text-neutral-400">{channelDesc[key]}</Text>
              </View>
              <TouchableOpacity
                onPress={() => trigger(key)}
                disabled={!!sending}
                activeOpacity={0.8}
                className={`px-4 py-2 rounded-xl ${sending === key ? 'bg-neutral-200' : 'bg-neutral-900'}`}
              >
                {sending === key
                  ? <ActivityIndicator size="small" color="#737373" />
                  : <Text className="text-white text-xs font-semibold">Trigger</Text>
                }
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Inbox */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-4">
          <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="font-semibold text-sm text-neutral-900">
              Inbox ({unread} unread)
            </Text>
            <View className="flex-row gap-x-3">
              {unread > 0 && (
                <TouchableOpacity onPress={readAll}>
                  <Text className="text-xs text-neutral-500">Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={loadInbox}>
                <Text className="text-xs text-neutral-400">{loading ? 'Loading…' : 'Refresh'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {inbox.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-neutral-400">No notifications yet. Trigger one above.</Text>
            </View>
          ) : (
            inbox.map((n, i) => {
              const data = n.data && typeof n.data === 'string' ? JSON.parse(n.data) : (n.data ?? {})
              return (
                <View
                  key={n.id}
                  className={`px-5 py-3 flex-row items-center gap-x-3 ${i < inbox.length - 1 ? 'border-b border-neutral-50' : ''} ${!n.read_at ? 'bg-blue-50/40' : ''}`}
                >
                  {/* Unread dot */}
                  <View className={`w-1.5 h-1.5 rounded-full shrink-0 ${!n.read_at ? 'bg-blue-500' : 'bg-transparent'}`} />

                  <View className="flex-1 min-w-0">
                    <Text className="text-sm text-neutral-700" numberOfLines={1}>
                      {data.message ?? 'Notification'}
                    </Text>
                    <Text className="text-xs text-neutral-400 mt-0.5">
                      {data.subject ?? n.type} · {n.created_at?.slice(0, 19).replace('T', ' ')}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => deleteNotif(n.id)}>
                    <Text className="text-xs text-red-400">Delete</Text>
                  </TouchableOpacity>
                </View>
              )
            })
          )}
        </View>

        {/* Reverb warning */}
        {wsStatus === 'error' && (
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <Text className="text-xs text-amber-800 font-semibold mb-1">WebSocket not connected</Text>
            <Text className="text-xs text-amber-700 font-mono">php artisan reverb:start</Text>
          </View>
        )}

        {/* Info note */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-semibold mb-1">Channels tested</Text>
          <Text className="text-xs text-neutral-500 leading-5">
            {'🗄️ database — notifications table inbox\n'}
            {'✉️ mail — check Mailtrap for emails\n'}
            {'📡 broadcast private — private-notification-test.{userId}\n'}
            {'🌐 broadcast public — notification-test.notifications\n'}
          </Text>
          <Text className="text-xs text-neutral-400 font-mono mt-2">
            {'php artisan reverb:start\nphp artisan queue:work'}
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_NotificationTest_Dashboard() {
  setActiveTatemono('notification-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AuthLayout tatSlug="notification-test" loginRoute="/notification-test/login">
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

export default ArkzenScreen_NotificationTest_Dashboard
