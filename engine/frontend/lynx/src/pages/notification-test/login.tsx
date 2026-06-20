// ARKZEN GENERATED — notification-test/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.642Z
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:guest */

import React from 'react'

const LoginLynxPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">🔔 Notification Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to test notifications
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            className="arkzen-input w-full"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="arkzen-input w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button className="arkzen-btn w-full" onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-xs text-center text-neutral-400">
          No account?{' '}
          <a href="/notification-test/register" className="text-neutral-700 underline underline-offset-2">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
