// ============================================================
// ARKZEN GENERATED PAGE — broadcast-test/login [React+Vite]
// Layout: guest | Auth: false | Guest-only: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-04T11:25:50.515Z
// ============================================================

import React, { useRef, useEffect, useState, memo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GuestLayout } from '@/layouts/GuestLayout'


// ── Shared components from @arkzen:components:shared ──────────────────────────
import { Radio } from 'lucide-react'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

if (typeof window !== 'undefined') {
  setActiveTatemono('broadcast-test')
}

const REVERB_HOST   = import.meta.env.VITE_REVERB_HOST    ?? 'localhost'
const REVERB_PORT   = import.meta.env.VITE_REVERB_PORT    ?? '8080'
const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME  ?? 'ws'
const APP_KEY       = import.meta.env.VITE_REVERB_APP_KEY ?? 'arkzen-key'

// ── ChannelPanel — top-level memo so it never remounts on parent re-render.
// Defined outside DashboardPage to preserve input focus on mobile (Android keyboard
// dismisses when a component is unmounted/remounted, which happens if Panel is an
// inline const inside a parent that re-renders on every keystroke).
type WsStatus = 'connecting' | 'connected' | 'error'

interface Message {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}

const dot = (s: WsStatus) => ({
  connecting: 'bg-yellow-400',
  connected:  'bg-green-400',
  error:      'bg-red-400',
}[s])

const ChannelPanel = memo(({
  title, badge, badgeColor, description, status, count, msgs, onSend, footer,
}: {
  title: string; badge: string; badgeColor: string; description: string
  status: WsStatus; count: number; msgs: Message[]
  onSend: (value: string) => void
  footer?: React.ReactNode
}) => {
  // Uncontrolled input with ref — keystrokes never bubble up to parent state,
  // so the parent doesn't re-render and the mobile keyboard stays open.
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const val = inputRef.current?.value?.trim()
    if (!val) return
    onSend(val)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${badgeColor}`}>{badge}</span>
            <h2 className="font-semibold text-sm">{title}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <div className={`w-1.5 h-1.5 rounded-full ${dot(status)}`} />
            <span>{status}</span>
            <span className="text-neutral-300">·</span>
            <span>{count} received</span>
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-1">{description}</p>
      </div>

      <div className="px-5 py-3 border-b border-neutral-50 flex gap-2">
        <input
          ref={inputRef}
          className="arkzen-input flex-1 text-sm"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type and press Enter..."
        />
        <button className="arkzen-btn text-sm" onClick={handleSend}>Send</button>
      </div>

      {footer && <div className="px-5 py-2 border-b border-neutral-50">{footer}</div>}

      <div className="max-h-48 overflow-y-auto">
        {msgs.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-300">No messages yet</div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {msgs.map((m, i) => (
              <div key={i} className="px-5 py-2.5 flex items-start gap-2">
                <p className="text-sm text-neutral-700 flex-1">{m.content}</p>
                <span className="text-xs text-neutral-300 shrink-0">{m.created_at?.slice(11, 19)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
ChannelPanel.displayName = 'ChannelPanel'

// ── Page component from @arkzen:page:login ─────────────────────────────
const LoginPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try { await login(email, password) }
    catch (e) { setError(e instanceof Error ? e.message : 'Login failed') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Radio size={18} /> Broadcast Test</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to test all channel types</p>
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
        )}
        <div className="space-y-3">
          <input className="arkzen-input w-full" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="arkzen-input w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        <button className="arkzen-btn w-full" onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-xs text-center text-neutral-400">
          No account?{' '}
          <a href="/broadcast-test/register" className="text-neutral-700 underline underline-offset-2">Register</a>
        </p>
      </div>
    </div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_BroadcastTest_Login = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <GuestLayout guestOnly={true}>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <LoginPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_BroadcastTest_Login
