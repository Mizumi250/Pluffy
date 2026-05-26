// ============================================================
// ARKZEN GENERATED SCREEN — auth-test/dashboard [Expo]
// Layout: auth | Auth required: true
// DO NOT EDIT — edit tatemono @arkzen:native:page:dashboard instead
// Generated: 2026-05-26T09:29:44.350Z
// ============================================================

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthLayout }  from '@/layouts/AuthLayout'

export function DashboardScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AuthLayout tatSlug="auth-test" loginRoute="/auth-test/login">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
      </ScrollView>
      </AuthLayout>
    </SafeAreaView>
  )
}

export default DashboardScreen
