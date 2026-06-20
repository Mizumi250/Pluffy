// ARKZEN GENERATED — roles-test/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.994Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { useState } from 'react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:guest */

import React from 'react'

const LoginLynxPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error,    setError]    = React.useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">🛡️ Roles Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to test role-based access control
          </p>
        </div>

        {error && <ErrorBox message={error} />}

        {/* Form */}
        <div className="space-y-3">
          <Field
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email"
          />
          <Field
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryBtn label={isLoading ? 'Signing in...' : 'Sign in'} onPress={handleLogin} loading={isLoading} />
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-xs text-center text-neutral-400">
            No account?{' '}
            <a href="/roles-test/register" className="text-neutral-700 font-medium underline underline-offset-2">
              Register
            </a>
          </p>

          <div className="bg-neutral-100 rounded-xl px-4 py-2.5 w-full">
            <p className="text-xs text-neutral-400 font-mono">
              admin@roles-test.com / password123<br/>
              user@roles-test.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
