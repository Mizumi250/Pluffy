// ============================================================
// ARKZEN GENERATED PAGE — roles-test/dashboard [React+Inertia]
// Layout: auth | Auth: true | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-18T09:39:41.379Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Shield } from 'lucide-react'
import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'
import { usePage, router } from '@inertiajs/react'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'

// Props passed from Laravel via Inertia::render()
export type RolesTestDashboardProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Shared components from @arkzen:components ─────────────────────────────────
if (typeof window !== 'undefined') {
  setActiveTatemono('roles-test')
}

// ── Page component from @arkzen:page:dashboard ─────────────────────────────
const DashboardPage = () => {
  const router = useArkzenRouter()
  const { user, logout, refreshUser } = useAuthStore()

  type TestResult = { status: 'idle' | 'pass' | 'fail'; message: string }

  const [adminResult, setAdminResult] = useState<TestResult>({ status: 'idle', message: '' })
  const [userResult,  setUserResult]  = useState<TestResult>({ status: 'idle', message: '' })
  const [logs,        setLogs]        = useState<any[]>([])
  const [promoting,   setPromoting]   = useState(false)

  const currentRole = user?.role ?? 'user'

  const loadLogs = async () => {
    try {
      const res = await arkzenFetch('/api/roles-test/logs')
      const d   = await res.json()
      setLogs(d.data ?? [])
    } catch {}
  }

  useEffect(() => { loadLogs() }, [])

  const testRoute = async (
    route: string,
    setter: React.Dispatch<React.SetStateAction<TestResult>>
  ) => {
    setter({ status: 'idle', message: 'Testing...' })
    try {
      const res = await arkzenFetch(route)
      const d   = await res.json()
      if (res.ok) {
        setter({ status: 'pass', message: d.message ?? '✓ Access granted' })
      } else {
        setter({ status: 'fail', message: d.message ?? '✗ Access denied' })
      }
      setTimeout(loadLogs, 400)
    } catch (e) {
      setter({ status: 'fail', message: e instanceof Error ? e.message : 'Request failed' })
    }
  }

  const promoteOrDemote = async (action: 'promote' | 'demote') => {
    setPromoting(true)
    try {
      await arkzenFetch(`/api/roles-test/${action}`, { method: 'POST' })
      await refreshUser()
    } catch {} finally {
      setPromoting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.refresh()
    router('/roles-test/login')
  }

  const resultStyle = (s: TestResult['status']) =>
    s === 'pass' ? 'bg-green-50 border-green-200 text-green-700' :
    s === 'fail' ? 'bg-red-50 border-red-200 text-red-700' :
    'bg-neutral-50 border-neutral-200 text-neutral-500'

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield size={20} /> Roles Test</h1>
          <button
            className="text-xs text-neutral-400 hover:text-neutral-700"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>

        {/* Current user card */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-500">Signed in as</div>
            <div className="font-semibold">{user?.name} · {user?.email}</div>
            <div className="mt-1">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                currentRole === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {currentRole}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {currentRole !== 'admin' && (
              <button
                className="arkzen-btn text-sm"
                onClick={() => promoteOrDemote('promote')}
                disabled={promoting}
              >
                {promoting ? '...' : 'Promote to admin'}
              </button>
            )}
            {currentRole === 'admin' && (
              <button
                className="arkzen-btn-ghost text-sm"
                onClick={() => promoteOrDemote('demote')}
                disabled={promoting}
              >
                {promoting ? '...' : 'Demote to user'}
              </button>
            )}
          </div>
        </div>

        {/* Route tests */}
        <div className="space-y-3">

          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-sm">Admin-only route</div>
                <code className="text-xs text-neutral-400">
                  GET /api/roles-test/admin-only · middleware: [auth, role:admin]
                </code>
              </div>
              <button
                className="arkzen-btn text-sm"
                onClick={() => testRoute('/api/roles-test/admin-only', setAdminResult)}
              >
                Test
              </button>
            </div>
            {adminResult.message && (
              <div className={`p-3 rounded-xl border text-sm ${resultStyle(adminResult.status)}`}>
                {adminResult.message}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-sm">User route (any authenticated)</div>
                <code className="text-xs text-neutral-400">
                  GET /api/roles-test/user-only · middleware: [auth]
                </code>
              </div>
              <button
                className="arkzen-btn text-sm"
                onClick={() => testRoute('/api/roles-test/user-only', setUserResult)}
              >
                Test
              </button>
            </div>
            {userResult.message && (
              <div className={`p-3 rounded-xl border text-sm ${resultStyle(userResult.status)}`}>
                {userResult.message}
              </div>
            )}
          </div>

        </div>

        {/* Audit log */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Access audit log</h2>
            <button className="text-xs text-neutral-400" onClick={loadLogs}>Refresh</button>
          </div>
          {logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">No access attempts yet.</div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {logs.map((l, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{l.action}</span>
                    <p className="text-xs text-neutral-500">Requires: {l.role_required}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    l.granted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {l.granted ? 'granted' : 'denied'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4 space-y-1.5">
          <p>
            <strong>How it works:</strong> This Tatemono uses <code>auth: true</code> — Arkzen
            generates Sanctum routes scoped to <code>roles-test</code> (login, register, logout, me).
          </p>
          <p>
            The <code>role:admin</code> middleware (CheckRole.php) reads{' '}
            <code>$request→user()→role</code> from the Sanctum-authenticated user.
            Without real auth there is no <code>$request→user()</code> — every role check
            returns 401, which is why the v1 session-based approach was broken.
          </p>
          <p>
            Promote/Demote update the <code>role</code> column on the scoped users table,
            then call <code>refreshUser()</code> which re-fetches <code>/auth/me</code> so
            the store reflects the new role without a page reload.
          </p>
        </div>

      </div>
    </div>
  )
}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_RolesTest_Dashboard() {
  const props   = usePage<RolesTestDashboardProps>().props
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

export default ArkzenPage_RolesTest_Dashboard
