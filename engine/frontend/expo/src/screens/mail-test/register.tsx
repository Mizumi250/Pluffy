// ============================================================
// ARKZEN GENERATED SCREEN — mail-test/register [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:register instead
// Generated: 2026-05-25T08:28:12.083Z
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
import { GuestLayout } from '@/layouts/GuestLayout'

export function RegisterScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="mail-test" dashboardRoute="/mail-test/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const RegisterPage = () => {
  const { register, isLoading } = useAuthStore()
  const [name, setName]         = useState('Test User')
  const [email, setEmail]       = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
  const [confirm, setConfirm]   = useState('password')
  const [error, setError]       = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try {
      await register(name, email, password, confirm)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
            <Mail size={15} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-neutral-900">Mail Test</span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Create account</h1>
            <p className="text-sm text-neutral-500 mt-0.5">to start testing email delivery</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-2.5">
            <input
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-neutral-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-xs text-center text-neutral-400">
            Already have an account?{' '}
            <a href="/mail-test/login" className="text-neutral-600 underline underline-offset-2">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default RegisterScreen
