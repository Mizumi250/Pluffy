'use client'
// ============================================================
// ARKZEN GENERATED PAGE — notification-test/register
// Layout: guest | Auth guard: false | Guest-only: true
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-03T02:58:33.225Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'


// Utilities, types, and helper functions from @arkzen:components
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

// Page component code (from @arkzen:page:register)
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

// Wrapper for animation + layout
const ArkzenPage_NotificationTest_Register = () => {
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

export default ArkzenPage_NotificationTest_Register
