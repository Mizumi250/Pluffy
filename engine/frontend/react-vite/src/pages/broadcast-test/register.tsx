// ============================================================
// ARKZEN GENERATED PAGE — broadcast-test/register [React+Vite]
// Layout: guest | Auth: false | Guest-only: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-13T03:29:34.063Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate } from 'react-router'
import { ChannelPanel } from './components/ChannelPanel'
import { Radio } from 'lucide-react'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

// ── Page component from @arkzen:page:register ─────────────────────────────
const RegisterPage = () => {
  const { register, isLoading } = useAuthStore()
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]     = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try { await register(name, email, password, confirm) }
    catch (e) { setError(e instanceof Error ? e.message : 'Registration failed') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Radio size={18} /> Broadcast Test</h1>
          <p className="text-sm text-neutral-500 mt-1">Create an account to test private + presence channels</p>
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
        )}
        <div className="space-y-3">
          <input className="arkzen-input w-full" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="arkzen-input w-full" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="arkzen-input w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <input className="arkzen-input w-full" type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        </div>
        <button className="arkzen-btn w-full" onClick={handleRegister} disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
        <p className="text-xs text-center text-neutral-400">
          Already have an account?{' '}
          <a href="/broadcast-test/login" className="text-neutral-700 underline underline-offset-2">Sign in</a>
        </p>
      </div>
    </div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_BroadcastTest_Register = () => {
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
        <RegisterPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_BroadcastTest_Register
