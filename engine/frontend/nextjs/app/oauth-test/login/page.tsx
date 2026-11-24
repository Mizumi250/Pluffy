'use client'
// ============================================================
// ARKZEN GENERATED PAGE — oauth-test/login
// Layout: guest | Auth guard: false | Guest-only: true
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T11:53:49.466Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BrandIcon } from '../components/BrandIcon'
import { BrandMark } from '../components/BrandMark'
import { CopyButton } from '../components/CopyButton'
import { ErrorNote } from '../components/ErrorNote'
import { FlowIcon } from '../components/FlowIcon'
import { ProviderButtons } from '../components/ProviderButtons'
import { ProviderStatus } from '../components/ProviderStatus'
import type { OAuthProviderInfo } from '../components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'

// Page component code (from @arkzen:page:login)
const LoginPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('haruka@oauth-test.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)

  // A failed provider round trip leaves its message behind for us
  useEffect(() => {
    setError(consumeOAuthError())
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <BrandMark size={40} />
          <div>
            <h1 className="text-xl font-bold text-neutral-900">OAuth Test</h1>
            <p className="text-sm text-neutral-500">Sign in with email or a provider</p>
          </div>
        </div>

        {error && <ErrorNote message={error} />}

        <ProviderButtons />

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-neutral-400">
          <span className="h-px flex-1 bg-neutral-200" />
          or use the seeded account
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label htmlFor="oauth-email" className="mb-1 block text-xs font-medium text-neutral-600">Email</label>
            <input id="oauth-email" className="arkzen-input w-full" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="oauth-password" className="mb-1 block text-xs font-medium text-neutral-600">Password</label>
            <input id="oauth-password" className="arkzen-input w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="arkzen-btn-primary w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <a href="/oauth-test/register" className="underline underline-offset-2 hover:text-neutral-900">Create an account</a>
          <a href="/oauth-test/setup" className="underline underline-offset-2 hover:text-neutral-900">Provider setup</a>
        </div>
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_OauthTest_Login = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
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

export default ArkzenPage_OauthTest_Login
