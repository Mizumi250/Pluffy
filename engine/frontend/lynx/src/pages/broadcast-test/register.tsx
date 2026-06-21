// ARKZEN GENERATED — broadcast-test/register (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T09:47:13.579Z
import { useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

const RegisterScreen = () => {
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
    <scroll-view className="flex-1 bg-neutral-50">
      <view className="flex-1 justify-center px-6 py-12">

        {/* Header */}
        <view className="mb-8">
          <view className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <text className="text-white text-lg">📡</text>
          </view>
          <text className="text-2xl font-bold text-neutral-900">Broadcast Test</text>
          <text className="text-sm text-neutral-500 mt-1">Create an account to test private + presence channels</text>
        </view>

        {/* Form */}
        <view className="gap-y-3">
          {error && (
            <view className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <text className="text-xs text-red-600">{error}</text>
            </view>
          )}
          {([
            { ph: 'Name',             val: name,     set: setName,     type: 'text'     },
            { ph: 'Email',            val: email,    set: setEmail,    type: 'email'    },
            { ph: 'Password',         val: password, set: setPassword, type: 'password' },
            { ph: 'Confirm password', val: confirm,  set: setConfirm,  type: 'password' },
          ] as const).map(f => (
            <input
              key={f.ph}
              className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder={f.ph}
              bindinput={e => f.set(e.detail.value)}
              type={f.type}
            />
          ))}
          {/* disabled state changes bg — dynamic value, use inline */}
          <view
            bindtap={isLoading ? undefined : handleRegister}
            className="py-3.5 rounded-2xl items-center"
            style={{ backgroundColor: isLoading ? '#d4d4d4' : '#171717' }}
          >
            <text className="text-white text-sm font-semibold">
              {isLoading ? 'Creating account…' : 'Create account'}
            </text>
          </view>
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

export const BroadcastTestRegister = RegisterScreen;
