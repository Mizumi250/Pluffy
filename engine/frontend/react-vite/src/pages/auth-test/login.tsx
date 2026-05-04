// ============================================================
// ARKZEN GENERATED PAGE — auth-test/login [React+Vite]
// Layout: guest | Auth: false | Guest-only: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-04T08:31:07.363Z
// ============================================================

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GuestLayout } from '@/layouts/GuestLayout'


// ── Shared components from @arkzen:components:shared ──────────────────────────
import { Lock, ShieldCheck } from 'lucide-react'
import { useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'

// Activate the correct isolated auth context for this Tatemono
if (typeof window !== 'undefined') {
  setActiveTatemono('auth-test')
}

// ── Page component from @arkzen:page:login ─────────────────────────────
const LoginPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
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
          <h1 className="text-xl font-bold flex items-center gap-2"><Lock size={18} /> Auth Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to access the protected dashboard
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
          <a href="/auth-test/register" className="text-neutral-700 underline underline-offset-2">
            Register
          </a>
        </p>

        <div className="text-xs text-neutral-400 text-center border-t border-neutral-100 pt-4">
          Test credentials: test@arkzen.local / password
        </div>
      </div>
    </div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_AuthTest_Login = () => {
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

export default ArkzenPage_AuthTest_Login
