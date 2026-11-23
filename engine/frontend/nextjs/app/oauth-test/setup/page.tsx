'use client'
// ============================================================
// ARKZEN GENERATED PAGE — oauth-test/setup
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:04:35.694Z
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
import { ENV_BASE_LINES, OAUTH_PROVIDER_LIST } from '../components/constants'
import type { OAuthProviderInfo } from '../components/types'
import { callbackUrlFor, envKeysFor } from '../components/utils'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { Check, CircleCheck, CircleDashed, Copy, KeyRound, LogOut, RefreshCw, Server, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'

// Page component code (from @arkzen:page:setup)
const SetupPage = () => {
  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size={36} />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Provider setup</h1>
              <p className="text-sm text-neutral-500">What the backend .env needs before a button turns on</p>
            </div>
          </div>
          <a href="/oauth-test/login" className="text-sm underline underline-offset-2 text-neutral-600 hover:text-neutral-900">Back to sign in</a>
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Backend .env, shared by every provider</h2>
            <CopyButton text={ENV_BASE_LINES} label="Copy shared env lines" />
          </div>
          <pre className="overflow-x-auto rounded-xl bg-neutral-50 p-4 text-xs text-neutral-800">{ENV_BASE_LINES}</pre>
          <p className="mt-3 text-xs text-neutral-500">
            Testing the mobile apps? Set <code>OAUTH_FRONTEND_URL=arkzen://oauth</code> instead (Expo scheme <code>arkzen</code>).
            The backend appends the redirect path and puts the token in the URL hash.
          </p>
        </section>

        <section className="space-y-3">
          {OAUTH_PROVIDER_LIST.map(p => {
            const callback = callbackUrlFor(p.id)
            return (
              <div key={p.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <BrandIcon provider={p} size={20} />
                  <h3 className="font-semibold text-neutral-900">{p.label}</h3>
                </div>
                <div className="mb-3">
                  <div className="mb-1 text-xs font-medium text-neutral-500">Redirect URI to register with the provider</div>
                  <div className="flex items-center gap-1 rounded-lg bg-neutral-50 px-3 py-2">
                    <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-neutral-800">{callback}</code>
                    <CopyButton text={callback} label={`Copy ${p.label} redirect URI`} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium text-neutral-500">Env keys</div>
                  <ul className="space-y-1">
                    {envKeysFor(p).map(k => (
                      <li key={k} className="text-xs"><code className="text-neutral-800">{k}=</code></li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </section>

        <p className="text-xs text-neutral-500">
          Apple needs HTTPS and a real domain for its redirect URI. Microsoft addresses are never auto-linked to an existing account.
        </p>
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_OauthTest_Setup = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <SetupPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_OauthTest_Setup
