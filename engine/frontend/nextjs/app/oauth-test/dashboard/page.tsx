'use client'
// ============================================================
// ARKZEN GENERATED PAGE — oauth-test/dashboard
// Layout: auth | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:14:59.246Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { BrandIcon } from '../components/BrandIcon'
import { BrandMark } from '../components/BrandMark'
import { CopyButton } from '../components/CopyButton'
import { ErrorNote } from '../components/ErrorNote'
import { FlowIcon } from '../components/FlowIcon'
import { ProviderButtons } from '../components/ProviderButtons'
import { ProviderStatus } from '../components/ProviderStatus'
import { useSignOut } from '../components/hooks'
import type { OAuthProviderInfo } from '../components/types'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Check, CircleCheck, CircleDashed, Copy, KeyRound, LogOut, RefreshCw, Server, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'

// Page component code (from @arkzen:page:dashboard)
const DashboardPage = () => {
  const { user } = useAuthStore()
  const signOut = useSignOut()

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size={36} />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">You are signed in</h1>
              <p className="text-sm text-neutral-500">
                {user?.name ?? 'Unknown user'} <span className="text-neutral-400">({user?.email ?? 'no email'})</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a34]"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <ShieldCheck size={22} className="mt-0.5 shrink-0 text-emerald-700" />
          <div className="text-sm text-emerald-900">
            <div className="font-semibold">The token reached the store</div>
            This page sits behind the auth guard. If you got here through a provider button, the backend
            redirected with the token in the URL hash, the store saved it, and <code>fetchMe()</code> loaded this profile.
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ProviderStatus />

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-neutral-900"><KeyRound size={16} /> Session user</h3>
            <pre className="overflow-x-auto rounded-xl bg-neutral-50 p-4 text-xs text-neutral-800">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-700">
          <h3 className="mb-2 font-semibold text-neutral-900">Checklist for each provider</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Sign out, then press the provider button on the login page.</li>
            <li>Approve at the provider and land back here without an error banner.</li>
            <li>Confirm the user above shows the provider email and name.</li>
            <li>Sign in again with the same provider and check that no second account appears.</li>
            <li>Sign in with the seeded email and password to confirm email login still works.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_OauthTest_Dashboard = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <AuthLayout requireAuth={true}>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <DashboardPage />
      </motion.div>
    </AuthLayout>
  )
}

export default ArkzenPage_OauthTest_Dashboard
