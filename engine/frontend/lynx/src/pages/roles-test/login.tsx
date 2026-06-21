// ARKZEN GENERATED — roles-test/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:58.114Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
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
    <view className="min-h-screen bg-neutral-50 items-center justify-center p-6">
      <view className="bg-white rounded-2xl border border-neutral-100 p-8 w-full max-w-sm" style={{ gap: 20 }}>
        {/* Header */}
        <view>
          <text className="text-xl font-bold" style={{ gap: 8 }}>
            🛡️ Roles Test
          </text>
          <text className="text-sm text-neutral-500 mt-1">
            Sign in to test role-based access control
          </text>
        </view>

        {error && <ErrorBox message={error} />}

        {/* Form */}
        <view style={{ gap: 12 }}>
          <Field placeholder="Email" value={email} onInput={setEmail} />
          <Field placeholder="Password" value={password} onInput={setPassword} secureTextEntry />
          <PrimaryBtn label={isLoading ? 'Signing in...' : 'Sign in'} onPress={handleLogin} loading={isLoading} />
        </view>

        {/* Footer */}
        <view className="items-center" style={{ gap: 12 }}>
          <text className="text-xs text-neutral-400">
            No account?{' '}
            <text className="text-neutral-700 font-medium">Register</text>
          </text>
          <view className="bg-neutral-100 rounded-xl px-4 py-2.5 w-full">
            <text className="text-xs text-neutral-400 font-mono">
              admin@roles-test.com / password123{'\n'}
              user@roles-test.com / password123
            </text>
          </view>
        </view>
      </view>
    </view>
  )
}

export const RolesTestLogin = LoginLynxPage;
