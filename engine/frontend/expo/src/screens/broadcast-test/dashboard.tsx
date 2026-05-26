// ============================================================
// ARKZEN GENERATED SCREEN — broadcast-test/dashboard [Expo]
// Layout: auth | Auth required: true
// DO NOT EDIT — edit tatemono @arkzen:native:page:dashboard instead
// Generated: 2026-05-26T09:29:46.875Z
// ============================================================

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthLayout }  from '@/layouts/AuthLayout'

export function DashboardScreen() {
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
        const DashboardPage = () => {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  // ── per-channel state ──────────────────────────────────────
  const [publicMsgs,   setPublicMsgs]   = useState<Message[]>([])
  const [privateMsgs,  setPrivateMsgs]  = useState<Message[]>([])
  const [presenceMsgs, setPresenceMsgs] = useState<Message[]>([])
  const [members,      setMembers]      = useState<{id:number;name:string}[]>([])

  const [publicStatus,   setPublicStatus]   = useState<WsStatus>('connecting')
  const [privateStatus,  setPrivateStatus]  = useState<WsStatus>('connecting')
  const [presenceStatus, setPresenceStatus] = useState<WsStatus>('connecting')

  // Input state removed — ChannelPanel uses uncontrolled refs to prevent
  // keyboard dismiss on Android when parent re-renders on keystroke.

  const [publicCount,   setPublicCount]   = useState(0)
  const [privateCount,  setPrivateCount]  = useState(0)
  const [presenceCount, setPresenceCount] = useState(0)

  // one shared raw WS — all three channels multiplexed over a single Reverb connection
  const wsRef            = useRef<WebSocket | null>(null)
  const mountedRef       = useRef(true)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── helpers ───────────────────────────────────────────────
  const addMsg = (setter: React.Dispatch<React.SetStateAction<Message[]>>, msg: Message) =>
    setter(prev => [msg, ...prev].slice(0, 50))

  const send = async (channelType: string, content: string, clearFn: () => void) => {
    if (!content.trim()) return
    try {
      await arkzenFetch('/api/broadcast-test/messages', {
        method: 'POST',
        body:   JSON.stringify({ content, channel_type: channelType }),
      })
      clearFn()
    } catch (e) { console.error(e) }
  }

  // ── WebSocket — single connection, three subscriptions ────
  const connectReverb = async (userId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setPublicStatus('connecting')
    setPrivateStatus('connecting')
    setPresenceStatus('connecting')

    const ws = new WebSocket(`${REVERB_SCHEME}://${REVERB_HOST}:${REVERB_PORT}/app/${APP_KEY}`)
    wsRef.current = ws

    ws.onopen = () => { /* wait for connection_established */ }

    ws.onmessage = async (event) => {
      if (!mountedRef.current) return
      let msg: { event: string; data: unknown; channel?: string }
      try { msg = JSON.parse(event.data) } catch { return }

      // ── connection established → subscribe to all three channels ──
      if (msg.event === 'pusher:connection_established') {
        const connData  = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const socketId  = (connData as any).socket_id as string

        // 1. public — no auth needed
        setPublicStatus('connected')
        ws.send(JSON.stringify({
          event: 'pusher:subscribe',
          data:  { channel: 'broadcast-test-public' },
        }))

        // 2. private — needs HMAC auth
        try {
          const privateAuth = await arkzenFetch('/api/broadcast-test/auth/broadcasting/auth', {
            method: 'POST',
            body:   JSON.stringify({ socket_id: socketId, channel_name: `private-broadcast-test.${userId}` }),
          })
          if (privateAuth.ok) {
            const { auth } = await privateAuth.json()
            ws.send(JSON.stringify({
              event: 'pusher:subscribe',
              data:  { channel: `private-broadcast-test.${userId}`, auth },
            }))
            setPrivateStatus('connected')
          } else {
            setPrivateStatus('error')
          }
        } catch { setPrivateStatus('error') }

        // 3. presence — needs HMAC auth (same endpoint, different channel name)
        // The backend signs socketId:channelName:channelData and returns both
        // auth + channel_data. We must use the server's channel_data in the
        // subscribe message so Reverb can verify the signature matches.
        try {
          const presenceAuth = await arkzenFetch('/api/broadcast-test/auth/broadcasting/auth', {
            method: 'POST',
            body:   JSON.stringify({
              socket_id:    socketId,
              channel_name: 'presence-broadcast-test-presence',
            }),
          })
          if (presenceAuth.ok) {
            const { auth, channel_data } = await presenceAuth.json()
            ws.send(JSON.stringify({
              event: 'pusher:subscribe',
              data:  {
                channel:      'presence-broadcast-test-presence',
                auth,
                channel_data, // use server-issued channel_data — must match what was signed
              },
            }))
            setPresenceStatus('connected')
          } else {
            setPresenceStatus('error')
          }
        } catch { setPresenceStatus('error') }
      }

      // ── debug — log every message ─────────────────────────
      console.log('[Reverb RX]', msg.event, msg.channel, msg.data)

      // ── public message ──────────────────────────────────────
      if (msg.event === 'broadcast-test.message-sent-public' || msg.channel === 'broadcast-test-public') {
        const payload = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        addMsg(setPublicMsgs, payload as Message)
        setPublicCount(c => c + 1)
      }

      // ── private message ─────────────────────────────────────
      if (msg.event === 'broadcast-test.message-sent-private') {
        const payload = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        addMsg(setPrivateMsgs, payload as Message)
        setPrivateCount(c => c + 1)
      }

      // ── presence message ────────────────────────────────────
      if (msg.event === 'broadcast-test.message-sent-presence') {
        const payload = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        addMsg(setPresenceMsgs, payload as Message)
        setPresenceCount(c => c + 1)
      }

      // ── presence member joined ──────────────────────────────
      if (msg.event === 'pusher_internal:member_added') {
        const d = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        setMembers(prev => [...prev.filter(m => m.id !== (d as any).user_id), { id: (d as any).user_id, name: (d as any).user_info?.name ?? 'Unknown' }])
      }

      // ── presence member left ────────────────────────────────
      if (msg.event === 'pusher_internal:member_removed') {
        const d = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        setMembers(prev => prev.filter(m => m.id !== (d as any).user_id))
      }

      // ── presence subscription succeeded (initial member list) ──
      if (msg.event === 'pusher_internal:subscription_succeeded' && msg.channel === 'presence-broadcast-test-presence') {
        const d = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const hash = (d as any).presence?.hash ?? {}
        setMembers(Object.entries(hash).map(([id, info]: [string, any]) => ({ id: Number(id), name: info?.name ?? 'Unknown' })))
      }
    }

    ws.onerror = () => ws.close()

    ws.onclose = () => {
      if (!mountedRef.current) return
      setPublicStatus('error')
      setPrivateStatus('error')
      setPresenceStatus('error')
      reconnectTimeout.current = setTimeout(() => {
        if (mountedRef.current) connectReverb(userId)
      }, 3000)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    if (user?.id) {
      const t = setTimeout(() => { if (mountedRef.current) connectReverb(user.id) }, 50)
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
    router.refresh()
    router.replace('/broadcast-test/login')
  }

  // ── useCallback send handlers — stable references, won't cause ChannelPanel to re-render
  const sendPublic   = useCallback((val: string) => send('public',   val, () => {}), [user?.id])
  const sendPrivate  = useCallback((val: string) => send('private',  val, () => {}), [user?.id])
  const sendPresence = useCallback((val: string) => send('presence', val, () => {}), [user?.id])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Radio size={20} /> Broadcast Test</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Signed in as <span className="font-medium">{user?.name}</span>
            </p>
          </div>
          <button className="text-xs text-neutral-400 hover:text-neutral-700" onClick={handleLogout}>
            Sign out
          </button>
        </div>

        {/* ── Public channel ───────────────────────────────── */}
        <ChannelPanel
          title="Public channel"
          badge="public"
          badgeColor="bg-blue-500"
          description="broadcast-test-public · No auth required. All visitors receive these messages."
          status={publicStatus}
          count={publicCount}
          msgs={publicMsgs}
          onSend={sendPublic}
        />

        {/* ── Private channel ──────────────────────────────── */}
        <ChannelPanel
          title="Private channel"
          badge="private"
          badgeColor="bg-purple-500"
          description={`private-broadcast-test.${user?.id} · Only you receive these — HMAC-signed per user.`}
          status={privateStatus}
          count={privateCount}
          msgs={privateMsgs}
          onSend={sendPrivate}
        />

        {/* ── Presence channel ─────────────────────────────── */}
        <ChannelPanel
          title="Presence channel"
          badge="presence"
          badgeColor="bg-green-500"
          description="presence-broadcast-test-presence · Auth + member roster. Open two tabs to see both members."
          status={presenceStatus}
          count={presenceCount}
          msgs={presenceMsgs}
          onSend={sendPresence}
          footer={
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-400">Online:</span>
              {members.length === 0
                ? <span className="text-xs text-neutral-300">No members yet</span>
                : members.map(m => (
                    <span key={m.id} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                      {m.name}
                    </span>
                  ))
              }
            </div>
          }
        />

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4 space-y-1">
          <p><strong>How each type works:</strong></p>
          <p><strong>Public</strong> — open channel, any WebSocket client subscribes freely, no auth handshake.</p>
          <p><strong>Private</strong> — channel name is scoped to your user ID. Reverb verifies ownership via HMAC before subscribing.</p>
          <p><strong>Presence</strong> — like private but Reverb also tracks a live member roster, firing member_added / member_removed events.</p>
          <p className="pt-1 text-neutral-300">Run <code>php artisan reverb:start</code> + <code>php artisan queue:work</code> for full functionality.</p>
        </div>

      </div>
    </div>
  )
}
      </ScrollView>
      </AuthLayout>
    </SafeAreaView>
  )
}

export default DashboardScreen
