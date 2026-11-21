// ============================================================
// ARKZEN GENERATED PAGE — oauth-test/register [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-11-21T15:26:02.239Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BrandIcon } from './components/BrandIcon'
import { BrandMark } from './components/BrandMark'
import { CopyButton } from './components/CopyButton'
import { ErrorNote } from './components/ErrorNote'
import { FlowIcon } from './components/FlowIcon'
import { ProviderButtons } from './components/ProviderButtons'
import { ProviderStatus } from './components/ProviderStatus'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { useNavigate } from 'react-router'

// ── Page component from @arkzen:page:register ─────────────────────────────
const RegisterPage = () => {
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('Nikolai Volkov')
  const [email, setEmail] = useState('nikolai@oauth-test.local')
  const [password, setPassword] = useState('password123')
  const [confirm, setConfirm] = useState('password123')
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      await register(name, email, password, confirm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <BrandMark size={40} />
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Create an account</h1>
            <p className="text-sm text-neutral-500">Email and password, no provider needed</p>
          </div>
        </div>

        {error && <ErrorNote message={error} />}

        <form onSubmit={handleRegister} className="space-y-3">
          <input className="arkzen-input w-full" placeholder="Name" aria-label="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="arkzen-input w-full" type="email" placeholder="Email" aria-label="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="arkzen-input w-full" type="password" placeholder="Password" aria-label="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <input className="arkzen-input w-full" type="password" placeholder="Confirm password" aria-label="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          <button className="arkzen-btn-primary w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          Already registered?{' '}
          <a href="/oauth-test/login" className="underline underline-offset-2 hover:text-neutral-900">Sign in</a>
        </p>
      </div>
    </div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_OauthTest_Register = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animation is managed by the page or not defined
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

export default ArkzenPage_OauthTest_Register
