// ============================================================
// ARKZEN GENERATED SCREEN — roles-test/dashboard
// ============================================================

import React, { useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { arkzenFetch, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthLayout }  from '@/layouts/AuthLayout'
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { GhostBtn } from './components/GhostBtn'
import { PrimaryBtn } from './components/PrimaryBtn'
import { RoleBadge } from './components/RoleBadge'

// User screen (from @arkzen:native:page:dashboard)
const DashboardScreen = () => {
  const router                         = useRouter()
  const { user, logout, refreshUser }  = useAuthStore()

  type TestResult = { status: 'idle' | 'pass' | 'fail'; message: string }

  const [adminResult, setAdminResult] = useState<TestResult>({ status: 'idle', message: '' })
  const [userResult,  setUserResult]  = useState<TestResult>({ status: 'idle', message: '' })
  const [logs,        setLogs]        = useState<any[]>([])
  const [promoting,   setPromoting]   = useState(false)

  const currentRole = (user as any)?.role ?? 'user'

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
    router.replace('/roles-test/login' as any)
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
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-neutral-900">🛡️ Roles Test</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-xs text-neutral-400">Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Current user card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-5">
          <Text className="text-xs text-neutral-400 mb-1">Signed in as</Text>
          <Text className="font-semibold text-neutral-900 mb-2">{user?.name} · {user?.email}</Text>
          <View className="flex-row items-center justify-between">
            <RoleBadge role={currentRole} />
            <View className="flex-row gap-x-2">
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
            </View>
          </View>
        </View>

        {/* Route tests */}
        <View className="mx-4 mt-4 gap-y-3">

          {/* Admin-only route */}
          <View className="bg-white rounded-2xl border border-neutral-100 p-5">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold text-neutral-900">Admin-only route</Text>
                <Text className="text-xs text-neutral-400 font-mono mt-0.5">
                  GET /api/roles-test/admin-only
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => testRoute('/api/roles-test/admin-only', setAdminResult)}
                className="bg-neutral-900 px-4 py-2 rounded-xl"
              >
                <Text className="text-white text-xs font-semibold">Test</Text>
              </TouchableOpacity>
            </View>
            {adminResult.message !== '' && (
              <View className={`p-3 rounded-xl border ${resultBg(adminResult.status)}`}>
                <Text className={`text-xs ${resultText(adminResult.status)}`}>
                  {adminResult.message}
                </Text>
              </View>
            )}
          </View>

          {/* User route */}
          <View className="bg-white rounded-2xl border border-neutral-100 p-5">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold text-neutral-900">User route</Text>
                <Text className="text-xs text-neutral-400 font-mono mt-0.5">
                  GET /api/roles-test/user-only
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => testRoute('/api/roles-test/user-only', setUserResult)}
                className="bg-neutral-900 px-4 py-2 rounded-xl"
              >
                <Text className="text-white text-xs font-semibold">Test</Text>
              </TouchableOpacity>
            </View>
            {userResult.message !== '' && (
              <View className={`p-3 rounded-xl border ${resultBg(userResult.status)}`}>
                <Text className={`text-xs ${resultText(userResult.status)}`}>
                  {userResult.message}
                </Text>
              </View>
            )}
          </View>

        </View>

        {/* Audit log */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="font-semibold text-sm text-neutral-900">Access audit log</Text>
            <TouchableOpacity onPress={loadLogs}>
              <Text className="text-xs text-neutral-400">Refresh</Text>
            </TouchableOpacity>
          </View>
          {logs.length === 0 ? (
            <View className="p-8 items-center">
              <Text className="text-sm text-neutral-400">No access attempts yet.</Text>
            </View>
          ) : (
            logs.map((l, i) => (
              <View key={i} className="px-5 py-3 flex-row items-center justify-between border-b border-neutral-50">
                <View>
                  <Text className="text-sm font-medium text-neutral-900">{l.action}</Text>
                  <Text className="text-xs text-neutral-400">Requires: {l.role_required}</Text>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${l.granted ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Text className={`text-xs font-semibold ${l.granted ? 'text-green-700' : 'text-red-700'}`}>
                    {l.granted ? 'granted' : 'denied'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info note */}
        <View className="mx-4 mt-4 bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            middleware: [auth, role:admin]{'\n'}
            token: Sanctum Bearer{'\n'}
            scope: roles-test SQLite
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_RolesTest_Dashboard() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('roles-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AuthLayout tatSlug="roles-test" loginRoute="/roles-test/login">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <DashboardScreen />
      </ScrollView>
      </AuthLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_RolesTest_Dashboard
