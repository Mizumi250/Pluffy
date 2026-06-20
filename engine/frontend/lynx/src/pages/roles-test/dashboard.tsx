// ARKZEN GENERATED — roles-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:06.994Z
import { GhostBtn } from './components/GhostBtn'
import { PrimaryBtn } from './components/PrimaryBtn'
import { RoleBadge } from './components/RoleBadge'
import { arkzenFetch, useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:auth */

import { useState, useEffect } from '@lynx-js/react'

const DashboardLynxPage = () => {
  const { user, logout, refreshUser } = useAuthStore()

  type TestResult = { status: 'idle' | 'pass' | 'fail'; message: string }

  const [adminResult, setAdminResult] = useState<TestResult>({ status: 'idle', message: '' })
  const [userResult, setUserResult] = useState<TestResult>({ status: 'idle', message: '' })
  const [logs, setLogs] = useState<any[]>([])
  const [promoting, setPromoting] = useState(false)

  const currentRole = (user as any)?.role ?? 'user'

  const loadLogs = async () => {
    try {
      const res = await arkzenFetch('/api/roles-test/logs')
      const d = await res.json()
      setLogs(d.data ?? [])
    } catch {}
  }

  useEffect(() => { loadLogs() }, [])

  const testRoute = async (
    route: string,
    setter: (s: TestResult) => void
  ) => {
    setter({ status: 'idle', message: 'Testing...' })
    try {
      const res = await arkzenFetch(route)
      const d = await res.json()
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
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <view>
          <text className="text-base font-semibold text-neutral-900">🛡️ Roles Test</text>
          <text className="text-xs text-neutral-400 mt-0.5">{user?.email}</text>
        </view>
        <view bindtap={handleLogout}>
          <text className="text-xs text-neutral-400">Sign out</text>
        </view>
      </view>

      <scroll-view className="flex-1 p-4 pb-8">

        {/* Current user card */}
        <view className="bg-white rounded-2xl border border-neutral-100 p-5 mb-4">
          <text className="text-xs text-neutral-400 mb-1">Signed in as</text>
          <text className="font-semibold text-neutral-900 mb-2">{user?.name} · {user?.email}</text>
          <view className="flex-row items-center justify-between">
            <RoleBadge role={currentRole} />
            <view className="flex-row" style={{ gap: 8 }}>
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
            </view>
          </view>
        </view>

        {/* Route tests */}
        <view style={{ gap: 12 }}>

          {/* Admin-only route */}
          <view className="bg-white rounded-2xl border border-neutral-100 p-5">
            <view className="flex-row items-start justify-between mb-3">
              <view className="flex-1">
                <text className="text-sm font-semibold text-neutral-900">Admin-only route</text>
                <text className="text-xs text-neutral-400 font-mono mt-0.5">
                  GET /api/roles-test/admin-only
                </text>
              </view>
              <view
                bindtap={() => testRoute('/api/roles-test/admin-only', setAdminResult)}
                className="bg-neutral-900 px-4 py-2 rounded-xl"
              >
                <text className="text-white text-xs font-semibold">Test</text>
              </view>
            </view>
            {adminResult.message !== '' && (
              <view className={`p-3 rounded-xl border ${resultBg(adminResult.status)}`}>
                <text className={`text-xs ${resultText(adminResult.status)}`}>
                  {adminResult.message}
                </text>
              </view>
            )}
          </view>

          {/* User route */}
          <view className="bg-white rounded-2xl border border-neutral-100 p-5">
            <view className="flex-row items-start justify-between mb-3">
              <view className="flex-1">
                <text className="text-sm font-semibold text-neutral-900">User route</text>
                <text className="text-xs text-neutral-400 font-mono mt-0.5">
                  GET /api/roles-test/user-only
                </text>
              </view>
              <view
                bindtap={() => testRoute('/api/roles-test/user-only', setUserResult)}
                className="bg-neutral-900 px-4 py-2 rounded-xl"
              >
                <text className="text-white text-xs font-semibold">Test</text>
              </view>
            </view>
            {userResult.message !== '' && (
              <view className={`p-3 rounded-xl border ${resultBg(userResult.status)}`}>
                <text className={`text-xs ${resultText(userResult.status)}`}>
                  {userResult.message}
                </text>
              </view>
            )}
          </view>

        </view>

        {/* Audit log */}
        <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mt-4">
          <view className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <text className="font-semibold text-sm text-neutral-900">Access audit log</text>
            <view bindtap={loadLogs}>
              <text className="text-xs text-neutral-400">Refresh</text>
            </view>
          </view>
          {logs.length === 0 ? (
            <view className="p-8 items-center">
              <text className="text-sm text-neutral-400">No access attempts yet.</text>
            </view>
          ) : (
            logs.map((l, i) => (
              <view key={i} className="px-5 py-3 flex-row items-center justify-between border-b border-neutral-50">
                <view>
                  <text className="text-sm font-medium text-neutral-900">{l.action}</text>
                  <text className="text-xs text-neutral-400">Requires: {l.role_required}</text>
                </view>
                <view className={`px-2.5 py-1 rounded-full ${l.granted ? 'bg-green-100' : 'bg-red-100'}`}>
                  <text className={`text-xs font-semibold ${l.granted ? 'text-green-700' : 'text-red-700'}`}>
                    {l.granted ? 'granted' : 'denied'}
                  </text>
                </view>
              </view>
            ))
          )}
        </view>

        {/* Info note */}
        <view className="bg-neutral-100 rounded-2xl px-4 py-3 mt-4">
          <text className="text-xs text-neutral-500 font-mono leading-5">
            middleware: [auth, role:admin]{'\n'}
            token: Sanctum Bearer{'\n'}
            scope: roles-test SQLite
          </text>
        </view>

      </scroll-view>
    </view>
  )
}
