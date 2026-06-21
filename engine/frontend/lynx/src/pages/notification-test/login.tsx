// ARKZEN GENERATED — notification-test/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:32.512Z
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:guest */

import { useState } from '@lynx-js/react'

const LoginLynxPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <view className="flex-1 items-center justify-center p-6">
      <view className="bg-white rounded-2xl border border-neutral-100 p-8 w-full" style={{ maxWidth: 384, gap: 20 }}>
        <view>
          <text className="text-xl font-bold">🔔 Notification Test</text>
          <text className="text-sm text-neutral-500 mt-1">
            Sign in to test notifications
          </text>
        </view>

        {error && (
          <view className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <text className="text-red-600 text-sm">{error}</text>
          </view>
        )}

        <view style={{ gap: 12 }}>
          <input
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-neutral-900"
            type="email"
            placeholder="Email"
            bindinput={e => setEmail(e.detail.value)}
          />
          <input
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-neutral-900"
            type="password"
            placeholder="Password"
            bindinput={e => setPassword(e.detail.value)}
          />
        </view>

        <view
          bindtap={isLoading ? undefined : handleLogin}
          className="w-full rounded-xl py-2.5 items-center"
          style={{ backgroundColor: '#171717', opacity: isLoading ? 0.6 : 1 }}
        >
          <text className="text-white text-sm font-medium">{isLoading ? 'Signing in...' : 'Sign in'}</text>
        </view>

        <text className="text-xs text-center text-neutral-400">
          No account?{' '}
          <text className="text-neutral-700" style={{ textDecorationLine: 'underline' }}>
            Register
          </text>
        </text>
      </view>
    </view>
  )
}

export const NotificationTestLogin = LoginLynxPage;
