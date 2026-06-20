// ARKZEN GENERATED — body-mail-notification/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:49.093Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'

/* @arkzen:native:page:layout:guest */

import { useState } from '@lynx-js/react'
import { useAuthStore } from '@/arkzen/core/stores/authStore'

const LoginLynxPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('test@body-mail-notification.com')
  const [password, setPassword] = useState('password123')
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
            <span className="text-white text-lg font-bold">✉</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900">Body Injection Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            MailBuilder blade_body · NotificationBuilder toMail_body
          </p>
        </div>

        {error && <ErrorBox message={error} />}

        <div className="space-y-3">
          <Field placeholder="Email"    value={email}    onChangeText={setEmail}    type="email"    />
          <Field placeholder="Password" value={password} onChangeText={setPassword} type="password" />
        </div>

        <PrimaryBtn label={isLoading ? 'Signing in…' : 'Sign in'} onPress={handleLogin} loading={isLoading} />

        <p className="text-xs text-center text-neutral-400">
          No account?{' '}
          <a href="/body-mail-notification/register" className="text-neutral-700 underline underline-offset-2">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
