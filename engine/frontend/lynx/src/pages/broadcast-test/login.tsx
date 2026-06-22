// ARKZEN GENERATED — broadcast-test/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T00:05:27.542Z
import { useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

const LoginScreen = () => {
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <scroll-view className="flex-1 bg-neutral-50">
      <view className="flex-1 justify-center px-6 py-12">

        {/* Header */}
        <view className="mb-8">
          <view className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <text className="text-white text-lg">📡</text>
          </view>
          <text className="text-2xl font-bold text-neutral-900">Broadcast Test</text>
          <text className="text-sm text-neutral-500 mt-1">Sign in to test all channel types</text>
        </view>

        {/* Form */}
        <view className="gap-y-3">
          {error && (
            <view className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <text className="text-xs text-red-600">{error}</text>
            </view>
          )}
          <input
            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Email"
            bindinput={e => setEmail(e.detail.value)}
            type="email"
          />
          <input
            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Password"
            bindinput={e => setPassword(e.detail.value)}
            type="password"
          />
          {/* disabled state changes bg — dynamic value, use inline */}
          <view
            bindtap={isLoading ? undefined : handleLogin}
            className="py-3.5 rounded-2xl items-center"
            style={{ backgroundColor: isLoading ? '#d4d4d4' : '#171717' }}
          >
            <text className="text-white text-sm font-semibold">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </text>
          </view>
        </view>

        {/* Footer */}
        <view className="mt-6 items-center">
          <text className="text-xs text-neutral-400">
            No account?{' '}
            <text className="text-neutral-700 font-medium">Register</text>
          </text>
        </view>
      </view>
    </scroll-view>
  )
}

export const BroadcastTestLogin = LoginScreen;
