// ARKZEN GENERATED — mail-test/register (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:49.386Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'
import { Icon } from '@sigx/lynx-icons'

/* @arkzen:native:page:layout:guest */

const RegisterScreen = () => {
  const { register, isLoading } = useAuthStore()
  const [name,     setName]     = useState('Test User')
  const [email,    setEmail]    = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
  const [confirm,  setConfirm]  = useState('password')
  const [error,    setError]    = useState<string | null>(null)

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
    <scroll-view className="flex-1 bg-neutral-50 px-6">
      <view className="flex-1 justify-center">
        {/* Header */}
        <view className="mb-8">
          <view className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Icon set="fas" name="envelope" size={22} color="#fff" />
          </view>
          <text className="text-2xl font-bold text-neutral-900">Mail Test</text>
          <text className="text-sm text-neutral-500 mt-1">
            Create an account to start testing email delivery
          </text>
        </view>

        {/* Form */}
        <view className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field
            placeholder="Name"
            onChangeText={setName}
          />
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
          <Field
            placeholder="Confirm password"
            onChangeText={setConfirm}
            secureTextEntry
          />

          <PrimaryBtn label="Create account" onPress={handleRegister} loading={isLoading} />
        </view>

        {/* Footer */}
        <view className="mt-6 items-center">
          <text className="text-xs text-neutral-400">
            Already have an account?{' '}
            <text className="text-neutral-700 font-medium">Sign in</text>
          </text>
        </view>
      </view>
    </scroll-view>
  )
}

export const MailTestRegister = RegisterScreen;
