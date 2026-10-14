// ARKZEN GENERATED — body-mail-notification/register (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.687Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:guest */

import { useState } from '@lynx-js/react'

const RegisterLynxPage = () => {
  const { register, isLoading } = useAuthStore()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
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
    <view className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <view className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full" style={{ maxWidth: 384, gap: 20 }}>
        <view>
          <view className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
            <text className="text-white text-lg font-bold">✉</text>
          </view>
          <text className="text-xl font-bold text-neutral-900">Body Injection Test</text>
          <text className="text-sm text-neutral-500 mt-1">
            Create an account to test mail &amp; notification injection
          </text>
        </view>

        {error && <ErrorBox message={error} />}

        <view style={{ gap: 12 }}>
          <Field placeholder="Name"             value={name}     onChangeText={setName}     />
          <Field placeholder="Email"            value={email}    onChangeText={setEmail}    type="email"    />
          <Field placeholder="Password"         value={password} onChangeText={setPassword} type="password" />
          <Field placeholder="Confirm password" value={confirm}  onChangeText={setConfirm}  type="password" />
        </view>

        <PrimaryBtn label={isLoading ? 'Creating…' : 'Create account'} onPress={handleRegister} loading={isLoading} />

        <text className="text-xs text-center text-neutral-400">
          Already have an account?{' '}
          <text className="text-neutral-700" style={{ textDecorationLine: 'underline' }}>
            Sign in
          </text>
        </text>
      </view>
    </view>
  )
}

export const BodyMailNotificationRegister = RegisterLynxPage;
