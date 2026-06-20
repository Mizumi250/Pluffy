// ARKZEN GENERATED — mail-test/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T15:23:56.402Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'
import { Icon } from 'sigx/lynx-icons-lucide'

/* @arkzen:native:page:layout:guest */

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
    <scroll-view className="flex-1 bg-neutral-50 px-6">
      <view className="flex-1 justify-center">
        {/* Header */}
        <view className="mb-8">
          <view className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Icon set="lucide" name="mail" size={22} color="#fff" />
          </view>
          <text className="text-2xl font-bold text-neutral-900">Mail Test</text>
          <text className="text-sm text-neutral-500 mt-1">
            Sign in to start testing email delivery
          </text>
        </view>

        {/* Form */}
        <view className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field
            placeholder="Email"
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Field
            placeholder="Password"
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryBtn label="Sign in" onPress={handleLogin} loading={isLoading} />
        </view>

        {/* Footer */}
        <view className="mt-6 items-center gap-y-3">
          <text className="text-xs text-neutral-400">
            No account?{' '}
            <text className="text-neutral-700 font-medium">Register</text>
          </text>

          <view className="bg-neutral-100 rounded-xl px-4 py-2.5">
            <text className="text-xs text-neutral-500 text-center">
              Default: test@arkzen.local / password
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  )
}

export const MailTestLogin = LoginScreen;
