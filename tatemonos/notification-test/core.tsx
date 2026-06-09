/* @arkzen:meta
name: notification-test
version: 2.1.0
description: Tests Laravel Notifications across all three channels — database (bell), mail, and broadcast (real-time popup). Uses Laravel's native notifications table.
auth: true
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 5000
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
  auth:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:api:notifications
model: Notification
controller: NotificationController
prefix: /api/notification-test
middleware: [auth]
endpoints:
  index:
    method: GET
    route: /inbox
    description: Get all notifications for the authenticated user
    response:
      type: collection
  store:
    method: POST
    route: /trigger
    description: Trigger a notification
    type: notification_trigger
    validation:
      notification: required|string
    response:
      type: single
  destroy:
    method: DELETE
    route: /inbox/{id}
    description: Delete a notification
    response:
      type: message
      value: Notification deleted
  readAll:
    method: POST
    route: /inbox/read-all
    description: Mark all notifications as read
    response:
      type: message
      value: All notifications marked as read
*/

/* @arkzen:notifications:database-ping
channels: [database]
message: "You have a new database notification"
subject: "Database Ping"
*/
/* @arkzen:notifications:database-ping:end */

/* @arkzen:notifications:mail-ping
channels: [mail]
message: "This is a test mail notification"
subject: "Mail Ping from Arkzen"
*/
/* @arkzen:notifications:mail-ping:end */

/* @arkzen:notifications:broadcast-ping
channels: [broadcast, database]
channel_type: private
message: "Real-time notification received on your private channel!"
subject: "Broadcast Ping (Private)"
*/
/* @arkzen:notifications:broadcast-ping:end */

/* @arkzen:notifications:broadcast-ping-public
channels: [broadcast, database]
channel_type: public
message: "This broadcast went to the public notification channel!"
subject: "Broadcast Ping (Public)"
*/
/* @arkzen:notifications:broadcast-ping-public:end */

/* @arkzen:notifications:all-channels
channels: [database, mail, broadcast]
channel_type: private
message: "This notification was sent to all three channels simultaneously"
subject: "All Channels Test"
*/
/* @arkzen:notifications:all-channels:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BellRing, Database, Globe, Mail, Radio } from 'lucide-react'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

if (typeof window !== 'undefined') {
  setActiveTatemono('notification-test')
}

// ─────────────────────────────────────────────
// REVERB CONFIG — read from env, same as useWebSocket.ts
// ─────────────────────────────────────────────
const REVERB_HOST   = process.env.NEXT_PUBLIC_REVERB_HOST    ?? 'localhost'
const REVERB_PORT   = process.env.NEXT_PUBLIC_REVERB_PORT    ?? '8080'
const REVERB_SCHEME = process.env.NEXT_PUBLIC_REVERB_SCHEME  ?? 'ws'
const APP_KEY       = process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? 'arkzen-key'

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:login */
/* @arkzen:web:page:layout:guest */
const LoginPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Bell size={18} /> Notification Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to test notifications
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            className="arkzen-input w-full"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="arkzen-input w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button className="arkzen-btn w-full" onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-xs text-center text-neutral-400">
          No account?{' '}
          <a href="/notification-test/register" className="text-neutral-700 underline underline-offset-2">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
/* @arkzen:web:page:login:end */

/* @arkzen:web:page:register */
/* @arkzen:web:page:layout:guest */
const RegisterPage = () => {
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try {
      await register(name, email, password, confirm)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Bell size={18} /> Notification Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create an account to test notifications
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            className="arkzen-input w-full"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="arkzen-input w-full"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="arkzen-input w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <input
            className="arkzen-input w-full"
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </div>

        <button className="arkzen-btn w-full" onClick={handleRegister} disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-xs text-center text-neutral-400">
          Already have an account?{' '}
          <a href="/notification-test/login" className="text-neutral-700 underline underline-offset-2">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
/* @arkzen:web:page:register:end */

/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:auth */
const DashboardPage = () => {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [inbox, setInbox] = useState<any[]>([])
  const [popup, setPopup] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const notifTypes = [
    { key: 'database-ping',         label: 'Database',            channels: ['database'],                      color: 'bg-blue-500',   icon: <Database size={14} className="text-blue-600" /> },
    { key: 'mail-ping',             label: 'Mail',                channels: ['mail'],                          color: 'bg-green-500',  icon: <Mail size={14} className="text-green-600" /> },
    { key: 'broadcast-ping',        label: 'Broadcast (private)', channels: ['broadcast', 'database'],         color: 'bg-purple-500', icon: <Radio size={14} className="text-purple-600" /> },
    { key: 'broadcast-ping-public', label: 'Broadcast (public)',  channels: ['broadcast', 'database'],         color: 'bg-sky-500',    icon: <Globe size={14} className="text-sky-600" /> },
    { key: 'all-channels',          label: 'All Channels',        channels: ['database', 'mail', 'broadcast'], color: 'bg-orange-500', icon: <BellRing size={14} className="text-orange-600" /> },
  ]

  const loadInbox = async () => {
    setLoading(true)
    try {
      const res = await arkzenFetch('/api/notification-test/inbox')
      const d = await res.json()
      const items = d.data ?? []
      setInbox(items)
      setUnread(items.filter((n: any) => !n.read_at).length)
    } catch (err) {
      console.error('Failed to load inbox:', err)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // RAW WEBSOCKET — Reverb private channel, no pusher-js
  //
  // Flow (Pusher protocol over raw WS):
  //   1. Open WS to Reverb
  //   2. Receive pusher:connection_established → get socket_id
  //   3. POST /broadcasting/auth with socket_id + channel name
  //      (using the tatemono-scoped token via arkzenFetch)
  //   4. Send pusher:subscribe with the auth signature from step 3
  //   5. Listen for .notification-test.notification events
  // ─────────────────────────────────────────────
  const connectReverb = (userId: number, token: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setWsStatus('connecting')
    const channelName = `private-notification-test.${userId}`
    const url = `${REVERB_SCHEME}://${REVERB_HOST}:${REVERB_PORT}/app/${APP_KEY}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      // Reverb will respond with pusher:connection_established containing the socket_id
    }

    ws.onmessage = async (event) => {
      if (!mountedRef.current) return
      try {
        const msg = JSON.parse(event.data) as { event: string; data: unknown }

        if (msg.event === 'pusher:connection_established') {
          // Step 2: got socket_id — now authenticate the private channel
          setWsStatus('connected')
          const connData = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data
          const socketId = (connData as any).socket_id as string

          // Step 3: POST to Laravel's broadcasting auth endpoint
          // arkzenFetch already attaches the Bearer token + correct headers
          const authRes = await arkzenFetch('/api/notification-test/auth/broadcasting/auth', {
            method: 'POST',
            body: JSON.stringify({ socket_id: socketId, channel_name: channelName }),
          })

          if (!authRes.ok) {
            console.error('[Arkzen WS] Channel auth failed:', authRes.status)
            setWsStatus('error')
            return
          }

          const authData = await authRes.json()

          // Step 4: subscribe with the signed auth token from Laravel
          ws.send(JSON.stringify({
            event: 'pusher:subscribe',
            data: {
              channel: channelName,
              auth: authData.auth,
            },
          }));
          
          // Subscribe to public notification channel (no auth required)
          ws.send(JSON.stringify({
            event: 'pusher:subscribe',
            data: { channel: 'notification-test.notifications' }
          }));
        }

        // Step 5: incoming broadcast notification
        if (msg.event === 'notification-test.notification') {
          const payload = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data
          setPopup((payload as any).message ?? 'New notification received!')
          setTimeout(() => setPopup(null), 4000)
          loadInbox()
        }
      } catch (err) {
        console.error('[Arkzen WS] Failed to parse message:', err)
      }
    }

    ws.onerror = () => {
      // Connection will be closed and automatically reconnected via onclose
      ws.close()
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setWsStatus('error')
      // Auto-reconnect after 3 s — same pattern as useWebSocket.ts
      reconnectTimeout.current = setTimeout(() => {
        if (mountedRef.current) connectReverb(userId, token)
      }, 3000)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    loadInbox()

    const token = useAuthStore.getState().token
    if (token && user?.id) {
      // Delay connection to avoid Strict Mode double-mount race condition
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) connectReverb(user.id, token)
      }, 50)
      return () => clearTimeout(timeoutId)
    }

    return () => {
      mountedRef.current = false
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
      wsRef.current?.close()
    }
  }, [user?.id])

  const trigger = async (key: string) => {
    setSending(key)
    try {
      await arkzenFetch('/api/notification-test/trigger', {
        method: 'POST',
        body: JSON.stringify({ notification: key }),
      })
      const notif = notifTypes.find(n => n.key === key)
      const hasBroadcast = notif?.channels.includes('broadcast')
      if (!hasBroadcast) {
        setPopup(notif?.label ? `${notif.label} notification sent!` : 'Notification sent!')
        setTimeout(() => setPopup(null), 4000)
      }
      setTimeout(loadInbox, 800)
    } catch (err) {
      console.error('Failed to trigger notification:', err)
    } finally {
      setSending(null)
    }
  }

  const readAll = async () => {
    try {
      await arkzenFetch('/api/notification-test/inbox/read-all', { method: 'POST' })
      loadInbox()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      await arkzenFetch(`/api/notification-test/inbox/${id}`, { method: 'DELETE' })
      loadInbox()
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const handleLogout = async () => {
    wsRef.current?.close()
    await logout()
    router.refresh()
    router.replace('/notification-test/login')
  }

  const statusColor = {
    connecting: 'bg-yellow-400',
    connected:  'bg-green-400',
    error:      'bg-red-400',
  }

  return (
    <div className="min-h-screen p-8">
      {popup && (
        <div className="fixed top-5 right-5 z-50 bg-neutral-900 text-white text-sm rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2 animate-fade-in">
           <Bell size={16} /> {popup}
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Bell size={20} /> Notification Test</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Signed in as <span className="font-medium">{user?.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${statusColor[wsStatus]}`} />
              <span className="text-neutral-500 capitalize">{wsStatus}</span>
            </div>
            <button
              className="text-xs text-neutral-400 hover:text-neutral-700"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-neutral-900">{unread}</div>
              <div className="text-sm text-neutral-500">Unread notifications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{inbox.length}</div>
              <div className="text-sm text-neutral-500">Total notifications</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {notifTypes.map(n => (
            <div key={n.key} className="bg-white rounded-2xl border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{n.icon}</span>
                <span className="font-medium text-sm">{n.label}</span>
              </div>
              <div className="text-xs text-neutral-400 mb-3">{n.channels.join(' + ')}</div>
              <button
                className="arkzen-btn w-full text-sm"
                onClick={() => trigger(n.key)}
                disabled={!!sending}
              >
                {sending === n.key ? 'Sending...' : 'Trigger'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Database inbox ({unread} unread)</h2>
            <div className="flex gap-3">
              {unread > 0 && (
                <button className="text-xs text-neutral-500 hover:text-neutral-900" onClick={readAll}>
                  Mark all read
                </button>
              )}
              <button className="text-xs text-neutral-400 hover:text-neutral-700" onClick={loadInbox}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          {inbox.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">
              No notifications yet. Trigger one above.
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {inbox.map((n) => {
                const data = n.data && typeof n.data === 'string' ? JSON.parse(n.data) : (n.data || {})
                return (
                  <div key={n.id} className={`px-5 py-3 flex items-center gap-3 ${!n.read_at ? 'bg-blue-50/40' : ''}`}>
                    {!n.read_at && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                    {n.read_at && <div className="w-1.5 h-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-700 truncate">
                        {data.message ?? 'Notification'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {data.subject ?? n.type} · {n.created_at?.slice(0, 19).replace('T', ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {n.read_at && <span className="text-xs text-neutral-300">read</span>}
                      <button
                        className="text-xs text-red-400 hover:text-red-600"
                        onClick={() => deleteNotification(n.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {wsStatus === 'error' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
            <strong>WebSocket not connected.</strong> Make sure Laravel Reverb is running:{' '}
            <code className="bg-amber-100 px-1 rounded">php artisan reverb:start</code>
          </div>
        )}

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4">
          <strong>Channels tested:</strong><br/>
          <strong>database</strong> — stored in native notifications table, shown in inbox above<br/>
          <strong>mail</strong> — sent to {user?.email} (check Mailtrap)<br/>
          <strong>broadcast (private)</strong> — fires on <code>private-notification-test.{'{'}userId{'}'}</code> — only you receive it<br/>
          <strong>broadcast (public)</strong> — fires on <code>notification-test.notifications</code> — anyone subscribed receives it<br/>
          Run <code>php artisan reverb:start</code> for broadcast + <code>php artisan queue:work</code> for mail.
        </div>
      </div>
    </div>
  )
}
/* @arkzen:web:page:dashboard:end */
/* @arkzen:native:components:shared */

import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'
import AsyncStorage from '@react-native-async-storage/async-storage'

setActiveTatemono('notification-test')

const BACKEND_URL   = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
const REVERB_HOST   = process.env.EXPO_PUBLIC_REVERB_HOST        ?? 'localhost'
const REVERB_PORT   = process.env.EXPO_PUBLIC_REVERB_PORT        ?? '8080'
const REVERB_SCHEME = process.env.EXPO_PUBLIC_REVERB_SCHEME      ?? 'ws'
const APP_KEY       = process.env.EXPO_PUBLIC_REVERB_APP_KEY     ?? 'arkzen-key'

type WsStatus = 'connecting' | 'connected' | 'error'

// ── Reusable input field ───────────────────────────────────────
const Field = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}: {
  placeholder:      string
  value:            string
  onChangeText:     (v: string) => void
  secureTextEntry?: boolean
  keyboardType?:    'default' | 'email-address'
}) => (
  <TextInput
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    placeholderTextColor="#a3a3a3"
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    autoCapitalize="none"
    autoCorrect={false}
  />
)

// ── Error box ──────────────────────────────────────────────────
const ErrorBox = ({ message }: { message: string }) => (
  <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
    <Text className="text-xs text-red-600">{message}</Text>
  </View>
)

// ── Primary button ─────────────────────────────────────────────
const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    className={`py-3.5 rounded-2xl items-center ${loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
  >
    {loading
      ? <ActivityIndicator size="small" color="#fff" />
      : <Text className="text-white text-sm font-semibold">{label}</Text>
    }
  </TouchableOpacity>
)

// ── WS status dot ──────────────────────────────────────────────
const StatusDot = ({ status }: { status: WsStatus }) => {
  const color =
    status === 'connected'  ? '#4ade80' :
    status === 'connecting' ? '#facc15' : '#f87171'
  return (
    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
  )
}

// ── Channel icon emoji ─────────────────────────────────────────
const channelEmoji: Record<string, string> = {
  'database-ping':         '🗄️',
  'mail-ping':             '✉️',
  'broadcast-ping':        '📡',
  'broadcast-ping-public': '🌐',
  'all-channels':          '🔔',
}

const channelLabel: Record<string, string> = {
  'database-ping':         'Database',
  'mail-ping':             'Mail',
  'broadcast-ping':        'Broadcast (private)',
  'broadcast-ping-public': 'Broadcast (public)',
  'all-channels':          'All Channels',
}

const channelDesc: Record<string, string> = {
  'database-ping':         'Stored in notifications table',
  'mail-ping':             'Sent to your email (Mailtrap)',
  'broadcast-ping':        'Private Reverb channel per user',
  'broadcast-ping-public': 'Public Reverb channel for all',
  'all-channels':          'Database + Mail + Broadcast',
}

/* @arkzen:native:components:shared:end */


/* @arkzen:native:page:login */
/* @arkzen:native:page:layout:guest */

const LoginScreen = () => {
  const router               = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
      // No navigation here — GuestLayout handles redirect on isAuthenticated change
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        {/* Header */}
        <View className="mb-8">
          <View className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Text className="text-white text-lg font-bold">🔔</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Notification Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">
            Sign in to test notifications
          </Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Field
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryBtn label="Sign in" onPress={handleLogin} loading={isLoading} />
        </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <TouchableOpacity onPress={() => router.push('/notification-test/register' as any)}>
            <Text className="text-xs text-neutral-400">
              No account?{' '}
              <Text className="text-neutral-700 font-medium">Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* @arkzen:native:page:login:end */


/* @arkzen:native:page:register */
/* @arkzen:native:page:layout:guest */

const RegisterScreen = () => {
  const router                  = useRouter()
  const { register, isLoading } = useAuthStore()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try {
      await register(name, email, password, confirm)
      // No navigation here — GuestLayout handles redirect on isAuthenticated change
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        {/* Header */}
        <View className="mb-8">
          <View className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Text className="text-white text-lg font-bold">🔔</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Notification Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">
            Create an account to test notifications
          </Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field placeholder="Name"     value={name}     onChangeText={setName}     />
          <Field placeholder="Email"    value={email}    onChangeText={setEmail}    keyboardType="email-address" />
          <Field placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Field placeholder="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />

          <PrimaryBtn label="Create account" onPress={handleRegister} loading={isLoading} />
        </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <TouchableOpacity onPress={() => router.push('/notification-test/login' as any)}>
            <Text className="text-xs text-neutral-400">
              Already have an account?{' '}
              <Text className="text-neutral-700 font-medium">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* @arkzen:native:page:register:end */


/* @arkzen:native:page:dashboard */
/* @arkzen:native:page:layout:auth */

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

/* @arkzen:native:page:dashboard:end */
