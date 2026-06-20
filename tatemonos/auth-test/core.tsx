/* @arkzen:meta
name: auth-test
version: 1.0.0
description: Tests core authentication — register, login, logout, and protected dashboard.
auth: true
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
  auth:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ShieldCheck } from 'lucide-react'
import { useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'

// Activate the correct isolated auth context for this Tatemono
if (typeof window !== 'undefined') {
  setActiveTatemono('auth-test')
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:login */
/* @arkzen:web:page:layout:guest */
const LoginPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)

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
          <h1 className="text-xl font-bold flex items-center gap-2"><Lock size={18} /> Auth Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to access the protected dashboard
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
          <a href="/auth-test/register" className="text-neutral-700 underline underline-offset-2">
            Register
          </a>
        </p>

        <div className="text-xs text-neutral-400 text-center border-t border-neutral-100 pt-4">
          Test credentials: test@arkzen.local / password
        </div>
      </div>
    </div>
  )
}
/* @arkzen:web:page:login:end */

/* @arkzen:web:page:register */
/* @arkzen:web:page:layout:guest */
const RegisterPage = () => {
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('Test User')
  const [email, setEmail] = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
  const [confirm, setConfirm] = useState('password')
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      await register(name, email, password, confirm)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Lock size={18} /> Auth Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create an account
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
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
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
          <input
            className="arkzen-input w-full"
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </div>

        <button className="arkzen-btn w-full" onClick={handleRegister} disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-xs text-center text-neutral-400">
          Already have an account?{' '}
          <a href="/auth-test/login" className="text-neutral-700 underline underline-offset-2">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
/* @arkzen:web:page:register:end */

/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:auth */
const DashboardPage = () => {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout();
    router.refresh();
    router.replace('/auth-test/login');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck size={20} /> Auth Test — Dashboard</h1>
            <p className="text-sm text-neutral-500 mt-1">
              You are authenticated as <span className="font-medium">{user?.email}</span>
            </p>
          </div>
          <button
            className="text-xs text-neutral-400 hover:text-neutral-700"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
          <div className="text-4xl mb-4 flex justify-center"><ShieldCheck size={36} className="text-emerald-600" /></div>
          <h2 className="text-lg font-semibold mb-2">Authentication successful</h2>
          <p className="text-sm text-neutral-500">
            This page is protected by the <code>auth</code> layout.
            <br />
            Only signed‑in users can see it.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <h3 className="font-medium mb-3">User info</h3>
          <pre className="text-xs bg-neutral-50 rounded-xl p-4 overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4">
          <strong>What this tests:</strong><br />
          • Registration with name/email/password<br />
          • Login with Sanctum token issuance<br />
          • Protected routes via <code>auth</code> layout<br />
          • Logout and token revocation<br />
          • Isolated auth — users are scoped to the <code>auth-test</code> SQLite database
        </div>
      </div>
    </div>
  )
}
/* @arkzen:web:page:dashboard:end */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore, setActiveTatemono, useAuthStoreHydrated } from '@/arkzen/core/stores/authStore'

setActiveTatemono('auth-test')

const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from '@react-navigation/native'
import { useAuthStore, setActiveTatemono, useAuthStoreHydrated } from '@/arkzen/core/stores/authStore'

setActiveTatemono('auth-test')

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:rn:end */

// ── Input field ───────────────────────────────────────────────
const Field = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}: {
  placeholder:      string
  value:            string
  onChangeText:     (v: string) => void
  secureTextEntry?: boolean
  keyboardType?:    'default' | 'email-address' | 'numeric'
}) => (
  <TextInput
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    placeholderTextColor="#a3a3a3"
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    autoCapitalize="none"
    autoCorrect={false}
  />
)

// ── Error box ─────────────────────────────────────────────────
const ErrorBox = ({ message }: { message: string }) => (
  <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
    <Text className="text-xs text-red-600">{message}</Text>
  </View>
)

// ── Primary button ────────────────────────────────────────────
const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    className={`py-3.5 rounded-2xl items-center ${loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
  >
    {loading
      ? <ActivityIndicator size="small" color="#fff" />
      : <Text className="text-white text-sm font-semibold">{label}</Text>
    }
  </TouchableOpacity>
)

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:login */
/* @arkzen:native:page:layout:guest */

const LoginScreen = () => {
  const router             = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
  const [error,    setError]    = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
      // No navigation here — GuestLayout handles redirect on isAuthenticated change
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        {/* Header */}
        <View className="mb-8">
          <View className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Text className="text-white text-lg font-bold">🔒</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Auth Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">
            Sign in to access the protected dashboard
          </Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Field
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryBtn label="Sign in" onPress={handleLogin} loading={isLoading} />
        </View>

        {/* Footer */}
        <View className="mt-6 items-center gap-y-3">
          <TouchableOpacity onPress={() => router.push('/auth-test/register' as any)}>
            <Text className="text-xs text-neutral-400">
              No account?{' '}
              <Text className="text-neutral-700 font-medium">Register</Text>
            </Text>
          </TouchableOpacity>

          <View className="bg-neutral-100 rounded-xl px-4 py-2.5">
            <Text className="text-xs text-neutral-400 font-mono">
              test@arkzen.local / password
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* @arkzen:native:page:login:end */

/* @arkzen:native:page:register */
/* @arkzen:native:page:layout:guest */

const RegisterScreen = () => {
  const router                  = useRouter()
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
      // No navigation here — GuestLayout handles redirect on isAuthenticated change
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        {/* Header */}
        <View className="mb-8">
          <View className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Text className="text-white text-lg font-bold">🔒</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Auth Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">Create an account</Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field placeholder="Name"             value={name}     onChangeText={setName}     />
          <Field placeholder="Email"            value={email}    onChangeText={setEmail}    keyboardType="email-address" />
          <Field placeholder="Password"         value={password} onChangeText={setPassword} secureTextEntry />
          <Field placeholder="Confirm password" value={confirm}  onChangeText={setConfirm}  secureTextEntry />

          <PrimaryBtn label="Create account" onPress={handleRegister} loading={isLoading} />
        </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <TouchableOpacity onPress={() => router.push('/auth-test/login' as any)}>
            <Text className="text-xs text-neutral-400">
              Already have an account?{' '}
              <Text className="text-neutral-700 font-medium">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* @arkzen:native:page:register:end */

/* @arkzen:native:page:dashboard */
/* @arkzen:native:page:layout:auth */

const DashboardScreen = () => {
  const router          = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.replace('/auth-test/login' as any)
  }

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-neutral-900">✅ Auth Test</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-xs text-neutral-400">Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success card */}
        <View className="mx-4 mt-6 bg-white rounded-2xl border border-neutral-100 p-8 items-center">
          <Text className="text-4xl mb-3">🛡️</Text>
          <Text className="text-base font-semibold text-neutral-900 mb-1">
            Authentication successful
          </Text>
          <Text className="text-xs text-neutral-500 text-center leading-5">
            This screen is protected by the auth layout.{'\n'}
            Only signed-in users can see it.
          </Text>
        </View>

        {/* User info */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-5">
          <Text className="text-sm font-semibold text-neutral-900 mb-3">User info</Text>
          <View className="bg-neutral-50 rounded-xl p-4">
            <Text className="text-xs font-mono text-neutral-500 leading-5">
              {JSON.stringify(user, null, 2)}
            </Text>
          </View>
        </View>

        {/* Footer note */}
        <View className="mx-4 mt-4 mb-8 bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            token: Sanctum Bearer{'\n'}
            scope: auth-test SQLite{'\n'}
            shared: web ↔ native same token
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

/* @arkzen:native:page:dashboard:end */

/* @arkzen:native:components:lynx:shared */

import { useState, useEffect } from '@lynx-js/react'
import { useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'

setActiveTatemono('auth-test')

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

// ── Input field ───────────────────────────────────────────────
const Field = ({
  placeholder,
  value,
  onInput,
  secureTextEntry = false,
}: {
  placeholder:      string
  value:            string
  onInput:          (v: string) => void
  secureTextEntry?: boolean
}) => (
  <input
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    bindinput={e => onInput(e.detail.value)}
    type={secureTextEntry ? 'password' : 'text'}
  />
)

// ── Error box ─────────────────────────────────────────────────
const ErrorBox = ({ message }: { message: string }) => (
  <view className="p-3 bg-red-50 border border-red-100 rounded-xl">
    <text className="text-xs text-red-600">{message}</text>
  </view>
)

// ── Primary button ────────────────────────────────────────────
const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
}) => (
  <view
    bindtap={loading ? undefined : onPress}
    className={`py-3.5 rounded-2xl items-center ${loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
  >
    <text className="text-white text-sm font-semibold">
      {loading ? 'Loading…' : label}
    </text>
  </view>
)

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:login */

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
    <scroll-view className="flex-1 bg-neutral-50">
      <view className="flex-1 justify-center px-6 py-12">

        {/* Header */}
        <view className="mb-8">
          <view className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <text className="text-white text-lg font-bold">🔒</text>
          </view>
          <text className="text-2xl font-bold text-neutral-900">Auth Test</text>
          <text className="text-sm text-neutral-500 mt-1">
            Sign in to access the protected dashboard
          </text>
        </view>

        {/* Form */}
        <view className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field placeholder="Email"    value={email}    onInput={setEmail}    />
          <Field placeholder="Password" value={password} onInput={setPassword} secureTextEntry />

          <PrimaryBtn label="Sign in" onPress={handleLogin} loading={isLoading} />
        </view>

        {/* Footer */}
        <view className="mt-6 items-center">
          <view className="bg-neutral-100 rounded-xl px-4 py-2.5">
            <text className="text-xs text-neutral-400 font-mono">
              test@arkzen.local / password
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  )
}

/* @arkzen:native:page:lynx:login:end */

/* @arkzen:native:page:lynx:register */

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

/* @arkzen:native:page:lynx:register:end */

/* @arkzen:native:page:lynx:dashboard */

const DashboardScreen = () => {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <view>
          <text className="text-base font-semibold text-neutral-900">✅ Auth Test</text>
          <text className="text-xs text-neutral-400 mt-0.5">{user?.email}</text>
        </view>
        <view bindtap={handleLogout}>
          <text className="text-xs text-neutral-400">Sign out</text>
        </view>
      </view>

      <scroll-view className="flex-1">
        {/* Success card */}
        <view className="m-4 bg-white rounded-3xl border border-neutral-100 p-8 items-center">
          <text className="text-4xl mb-3">🛡️</text>
          <text className="text-base font-semibold text-neutral-900 mb-1.5">
            Authentication successful
          </text>
          <text className="text-xs text-neutral-500 text-center leading-5">
            {`This screen is protected by the auth layout.\nOnly signed-in users can see it.`}
          </text>
        </view>

        {/* User info */}
        <view className="mx-4 mt-1 bg-white rounded-3xl border border-neutral-100 p-5">
          <text className="text-sm font-semibold text-neutral-900 mb-3">User info</text>
          <view className="bg-neutral-50 rounded-xl p-4">
            <text className="text-xs font-mono text-neutral-500 leading-5">
              {JSON.stringify(user, null, 2)}
            </text>
          </view>
        </view>

        {/* Footer note */}
        <view className="mx-4 mt-4 mb-8 bg-neutral-100 rounded-2xl px-4 py-3">
          <text className="text-xs text-neutral-500 font-mono leading-5">
            {`token: Sanctum Bearer\nscope: auth-test SQLite\nshared: web ↔ native same token`}
          </text>
        </view>
      </scroll-view>
    </view>
  )
}

/* @arkzen:native:page:lynx:dashboard:end */
