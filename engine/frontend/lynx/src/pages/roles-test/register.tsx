// ARKZEN GENERATED — roles-test/register (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.996Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { useState } from 'react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:guest */

import React from 'react'

const RegisterLynxPage = () => {
  const { register, isLoading } = useAuthStore()
  const [name,     setName]     = React.useState('')
  const [email,    setEmail]    = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirm,  setConfirm]  = React.useState('')
  const [error,    setError]    = React.useState<string | null>(null)

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
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">🛡️ Roles Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create an account — you'll start as{' '}
            <span className="font-medium text-blue-600">user</span>
          </p>
        </div>

        {error && <ErrorBox message={error} />}

        {/* Form */}
        <div className="space-y-3">
          <Field placeholder="Name" value={name} onChangeText={setName} />
          <Field placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email" />
          <Field placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Field placeholder="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />

          <PrimaryBtn label={isLoading ? 'Creating account...' : 'Create account'} onPress={handleRegister} loading={isLoading} />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-center text-neutral-400">
            Already have an account?{' '}
            <a href="/roles-test/login" className="text-neutral-700 font-medium underline underline-offset-2">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
