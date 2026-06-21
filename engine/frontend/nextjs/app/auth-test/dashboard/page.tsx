'use client'
// ============================================================
// ARKZEN GENERATED PAGE — auth-test/dashboard
// Layout: auth | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:51.348Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'
import { useRouter } from 'next/navigation'
import { Lock, ShieldCheck } from 'lucide-react'
import { useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'

// Page component code (from @arkzen:page:dashboard)
const DashboardPage = () => {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout();
    router.refresh();
    router.replace('/auth-test/login');
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

// Wrapper for animation + layout
const ArkzenPage_AuthTest_Dashboard = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
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

export default ArkzenPage_AuthTest_Dashboard
