// ARKZEN GENERATED — auth-test/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T05:22:10.429Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

const LoginScreen = () => {
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
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
            <text className="text-white text-lg font-bold">🔒</text>
          </view>
          <text className="text-2xl font-bold text-neutral-900">Auth Test</text>
          <text className="text-sm text-neutral-500 mt-1">
            Sign in to access the protected dashboard
          </text>
        </view>

        {/* Form */}
        <view className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field placeholder="Email"    value={email}    onInput={setEmail}    />
          <Field placeholder="Password" value={password} onInput={setPassword} secureTextEntry />

          <PrimaryBtn label="Sign in" onPress={handleLogin} loading={isLoading} />
        </view>

        {/* Footer */}
        <view className="mt-6 items-center">
          <view className="bg-neutral-100 rounded-xl px-4 py-2.5">
            <text className="text-xs text-neutral-400 font-mono">
              test@arkzen.local / password
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  )
}

export const AuthTestLogin = LoginScreen;
