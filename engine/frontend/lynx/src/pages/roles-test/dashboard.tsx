// ARKZEN GENERATED — roles-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.998Z
import { GhostBtn } from './components/GhostBtn'
import { PrimaryBtn } from './components/PrimaryBtn'
import { RoleBadge } from './components/RoleBadge'
import { useEffect, useState } from 'react'
import { arkzenFetch, useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:auth */

import React from 'react'

const DashboardLynxPage = () => {
  const { user, logout, refreshUser } = useAuthStore()

  type TestResult = { status: 'idle' | 'pass' | 'fail'; message: string }

  const [adminResult, setAdminResult] = React.useState<TestResult>({ status: 'idle', message: '' })
  const [userResult,  setUserResult]  = React.useState<TestResult>({ status: 'idle', message: '' })
  const [logs,        setLogs]        = React.useState<any[]>([])
  const [promoting,   setPromoting]   = React.useState(false)

  const currentRole = (user as any)?.role ?? 'user'

  const loadLogs = async () => {
    try {
      const res = await arkzenFetch('/api/roles-test/logs')
      const d   = await res.json()
      setLogs(d.data ?? [])
    } catch {}
  }

  React.useEffect(() => { loadLogs() }, [])

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
    window.location.href = '/roles-test/login'
  }

  const resultBg = (s: TestResult['status']) =>
    s === 'pass' ? 'bg-green-50 border-green-200' :
    s === 'fail' ? 'bg-red-50 border-red-200' :
    'bg-neutral-50 border-neutral-200'

  const resultText = (s: TestResult['status']) =>
    s === 'pass' ? 'text-green-700' :
    s === 'fail' ? 'text-red-700' :
    'text-neutral-500'

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-base font-semibold text-neutral-900">🛡️ Roles Test</div>
          <div className="text-xs text-neutral-400 mt-0.5">{user?.email}</div>
        </div>
        <button onClick={handleLogout} className="text-xs text-neutral-400 hover:text-neutral-600">
          Sign out
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Current user card */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="text-xs text-neutral-400 mb-1">Signed in as</div>
          <div className="font-semibold text-neutral-900 mb-3">{user?.name} · {user?.email}</div>
          <div className="flex items-center justify-between">
            <RoleBadge role={currentRole} />
            <div className="flex gap-2">
              {currentRole !== 'admin' && (
                <PrimaryBtn
                  label="Promote to admin"
                  onPress={() => promoteOrDemote('promote')}
                  loading={promoting}
                />
              )}
              {currentRole === 'admin' && (
                <GhostBtn
                  label="Demote to user"
                  onPress={() => promoteOrDemote('demote')}
                  loading={promoting}
                />
              )}
            </div>
          </div>
        </div>

        {/* Route tests */}
        <div className="space-y-3">

          {/* Admin-only route */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-900">Admin-only route</div>
                <code className="text-xs text-neutral-400 mt-0.5">
                  GET /api/roles-test/admin-only
                </code>
              </div>
              <button
                onClick={() => testRoute('/api/roles-test/admin-only', setAdminResult)}
                className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-800"
              >
                Test
              </button>
            </div>
            {adminResult.message !== '' && (
              <div className={`p-3 rounded-xl border ${resultBg(adminResult.status)}`}>
                <p className={`text-xs ${resultText(adminResult.status)}`}>
                  {adminResult.message}
                </p>
              </div>
            )}
          </div>

          {/* User route */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-900">User route</div>
                <code className="text-xs text-neutral-400 mt-0.5">
                  GET /api/roles-test/user-only
                </code>
              </div>
              <button
                onClick={() => testRoute('/api/roles-test/user-only', setUserResult)}
                className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-800"
              >
                Test
              </button>
            </div>
            {userResult.message !== '' && (
              <div className={`p-3 rounded-xl border ${resultBg(userResult.status)}`}>
                <p className={`text-xs ${resultText(userResult.status)}`}>
                  {userResult.message}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Audit log */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="font-semibold text-sm text-neutral-900">Access audit log</div>
            <button onClick={loadLogs} className="text-xs text-neutral-400 hover:text-neutral-600">
              Refresh
            </button>
          </div>
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-neutral-400">No access attempts yet.</p>
            </div>
          ) : (
            <div>
              {logs.map((l, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between border-b border-neutral-50">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{l.action}</p>
                    <p className="text-xs text-neutral-400">Requires: {l.role_required}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    l.granted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {l.granted ? 'granted' : 'denied'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="bg-neutral-100 rounded-2xl px-4 py-3">
          <p className="text-xs text-neutral-500 font-mono leading-5">
            middleware: [auth, role:admin]<br/>
            token: Sanctum Bearer<br/>
            scope: roles-test SQLite
          </p>
        </div>

      </div>
    </div>
  )
}
