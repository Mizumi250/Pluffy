// ARKZEN GENERATED — roles-test/register (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T15:23:58.010Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:guest */

import { useState } from '@lynx-js/react'

const RegisterLynxPage = () => {
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

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
    <view className="min-h-screen bg-neutral-50 items-center justify-center p-6">
      <view className="bg-white rounded-2xl border border-neutral-100 p-8 w-full max-w-sm" style={{ gap: 20 }}>
        {/* Header */}
        <view>
          <text className="text-xl font-bold" style={{ gap: 8 }}>
            🛡️ Roles Test
          </text>
          <text className="text-sm text-neutral-500 mt-1">
            Create an account — you'll start as{' '}
            <text className="font-medium text-blue-600">user</text>
          </text>
        </view>

        {error && <ErrorBox message={error} />}

        {/* Form */}
        <view style={{ gap: 12 }}>
          <Field placeholder="Name" value={name} onInput={setName} />
          <Field placeholder="Email" value={email} onInput={setEmail} />
          <Field placeholder="Password" value={password} onInput={setPassword} secureTextEntry />
          <Field placeholder="Confirm password" value={confirm} onInput={setConfirm} secureTextEntry />
          <PrimaryBtn label={isLoading ? 'Creating account...' : 'Create account'} onPress={handleRegister} loading={isLoading} />
        </view>

        {/* Footer */}
        <view className="items-center">
          <text className="text-xs text-neutral-400">
            Already have an account?{' '}
            <text className="text-neutral-700 font-medium">Sign in</text>
          </text>
        </view>
      </view>
    </view>
  )
}

export const RolesTestRegister = RegisterLynxPage;
