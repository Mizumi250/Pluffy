// ============================================================
// ARKZEN GENERATED PAGE — auth-test/register [React+Inertia]
// Layout: guest | Auth: false | Guest-only: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-17T13:37:04.403Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Lock, ShieldCheck } from 'lucide-react'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { usePage, router } from '@inertiajs/react'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'

// Props passed from Laravel via Inertia::render()
export type AuthTestRegisterProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Shared components from @arkzen:components ─────────────────────────────────
// Activate the correct isolated auth context for this Tatemono
if (typeof window !== 'undefined') {
  setActiveTatemono('auth-test')
}

// ── Page component from @arkzen:page:register ─────────────────────────────
const RegisterPage = () => {
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('Test User')
  const [email, setEmail] = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
  const [confirm, setConfirm] = useState('password')
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
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
          <h1 className="text-xl font-bold flex items-center gap-2"><Lock size={18} /> Auth Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create an account
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
          <a href="/auth-test/login" className="text-neutral-700 underline underline-offset-2">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_AuthTest_Register() {
  const props   = usePage<AuthTestRegisterProps>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  const content = (
    <motion.div
      ref={pageRef}
      variants={{}}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <RegisterPage {...props} />
    </motion.div>
  )

  return <GuestLayout guestOnly={true}>{content}</GuestLayout>
}

export default ArkzenPage_AuthTest_Register
