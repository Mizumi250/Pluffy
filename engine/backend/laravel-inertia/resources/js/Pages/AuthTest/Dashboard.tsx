// ============================================================
// ARKZEN GENERATED PAGE — auth-test/dashboard [React+Inertia]
// Layout: auth | Auth: true | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-13T07:49:29.605Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'
import { usePage, router } from '@inertiajs/react'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
import { Lock, ShieldCheck } from 'lucide-react'
import { useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'

// Props passed from Laravel via Inertia::render()
export type AuthTestDashboardProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:dashboard ─────────────────────────────
const DashboardPage = () => {
  const router = useArkzenRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout();
    window.location.reload();
    router.visit('/auth-test/login', { replace: true });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck size={20} /> Auth Test — Dashboard</h1>
            <p className="text-sm text-neutral-500 mt-1">
              You are authenticated as <span className="font-medium">{user?.email}</span>
            </p>
          </div>
          <button
            className="text-xs text-neutral-400 hover:text-neutral-700"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
          <div className="text-4xl mb-4 flex justify-center"><ShieldCheck size={36} className="text-emerald-600" /></div>
          <h2 className="text-lg font-semibold mb-2">Authentication successful</h2>
          <p className="text-sm text-neutral-500">
            This page is protected by the <code>auth</code> layout.
            <br />
            Only signed‑in users can see it.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <h3 className="font-medium mb-3">User info</h3>
          <pre className="text-xs bg-neutral-50 rounded-xl p-4 overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4">
          <strong>What this tests:</strong><br />
          • Registration with name/email/password<br />
          • Login with Sanctum token issuance<br />
          • Protected routes via <code>auth</code> layout<br />
          • Logout and token revocation<br />
          • Isolated auth — users are scoped to the <code>auth-test</code> SQLite database
        </div>
      </div>
    </div>
  )
}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_AuthTest_Dashboard() {
  const props   = usePage<AuthTestDashboardProps>().props
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
      <DashboardPage {...props} />
    </motion.div>
  )

  return <AuthLayout requireAuth={true}>{content}</AuthLayout>
}

export default ArkzenPage_AuthTest_Dashboard
