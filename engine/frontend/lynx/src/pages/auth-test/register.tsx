// ARKZEN GENERATED — auth-test/register (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:45.614Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

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
    <scroll-view className="flex-1 bg-neutral-50">
      <view className="flex-1 justify-center px-6 py-12">

        {/* Header */}
        <view className="mb-8">
          <view className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <text className="text-white text-lg font-bold">🔒</text>
          </view>
          <text className="text-2xl font-bold text-neutral-900">Auth Test</text>
          <text className="text-sm text-neutral-500 mt-1">Create an account</text>
        </view>

        {/* Form */}
        <view className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field placeholder="Name"             value={name}     onInput={setName}     />
          <Field placeholder="Email"            value={email}    onInput={setEmail}    />
          <Field placeholder="Password"         value={password} onInput={setPassword} secureTextEntry />
          <Field placeholder="Confirm password" value={confirm}  onInput={setConfirm}  secureTextEntry />

          <PrimaryBtn label="Create account" onPress={handleRegister} loading={isLoading} />
        </view>
      </view>
    </scroll-view>
  )
}

export const AuthTestRegister = RegisterScreen;
