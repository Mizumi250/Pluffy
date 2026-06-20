/* @arkzen:meta
name: roles-test
version: 2.1.0
description: "Tests role-based access control with real Sanctum auth. Two roles (admin, user), protected routes, role-gated UI. v2.1: middleware now declares [auth, role:admin] at the DSL level to exercise MiddlewareBuilder v6.0 scoped CheckRole generation."
auth: true
auth_seed:
  users:
    - name: Admin User
      email: admin@roles-test.com
      password: password123
      role: admin
    - name: Regular User
      email: user@roles-test.com
      password: password123
      role: user
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 4000
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
  auth:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:database:role_audit_logs
table: role_audit_logs
columns:
  user_id:
    type: integer
    nullable: true
  action:
    type: string
  role_required:
    type: string
  granted:
    type: boolean
timestamps: true
*/

/* @arkzen:api:role_audit_logs
model: RoleAuditLog
controller: RoleAuditLogController
prefix: /api/roles-test
middleware: [auth]
endpoints:
  index:
    method: GET
    route: /logs
    description: Audit log of all access attempts
    response:
      type: collection
  adminOnly:
    method: GET
    route: /admin-only
    description: Admin-only route — role check performed in controller body ($user->role === 'admin')
    type: role_admin_only
    response:
      type: single
  userOnly:
    method: GET
    route: /user-only
    description: Any authenticated user — no role gate
    type: role_user_only
    response:
      type: single
  promote:
    method: POST
    route: /promote
    description: Promote the authenticated user to admin role
    type: role_promote
    response:
      type: message
      value: Promoted to admin
  demote:
    method: POST
    route: /demote
    description: Demote the authenticated user back to user role
    type: role_demote
    response:
      type: message
      value: Demoted to user
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

if (typeof window !== 'undefined') {
  setActiveTatemono('roles-test')
}

/* @arkzen:web:components:shared:end */



/* @arkzen:web:page:login */
/* @arkzen:web:page:layout:guest */
const LoginPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Shield size={18} /> Roles Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to test role-based access control
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
          <a href="/roles-test/register" className="text-neutral-700 underline underline-offset-2">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
/* @arkzen:web:page:login:end */



/* @arkzen:web:page:register */
/* @arkzen:web:page:layout:guest */
const RegisterPage = () => {
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Shield size={18} /> Roles Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create an account — you'll start as{' '}
            <span className="font-medium text-blue-600">user</span>
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
          <a href="/roles-test/login" className="text-neutral-700 underline underline-offset-2">
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
  const { user, logout, refreshUser } = useAuthStore()

  type TestResult = { status: 'idle' | 'pass' | 'fail'; message: string }

  const [adminResult, setAdminResult] = useState<TestResult>({ status: 'idle', message: '' })
  const [userResult,  setUserResult]  = useState<TestResult>({ status: 'idle', message: '' })
  const [logs,        setLogs]        = useState<any[]>([])
  const [promoting,   setPromoting]   = useState(false)

  const currentRole = user?.role ?? 'user'

  const loadLogs = async () => {
    try {
      const res = await arkzenFetch('/api/roles-test/logs')
      const d   = await res.json()
      setLogs(d.data ?? [])
    } catch {}
  }

  useEffect(() => { loadLogs() }, [])

  const testRoute = async (
    route: string,
    setter: React.Dispatch<React.SetStateAction<TestResult>>
  ) => {
    setter({ status: 'idle', message: 'Testing...' })
    try {
      const res = await arkzenFetch(route)
      const d   = await res.json()
      if (res.ok) {
        setter({ status: 'pass', message: d.message ?? '✓ Access granted' })
      } else {
        setter({ status: 'fail', message: d.message ?? '✗ Access denied' })
      }
      setTimeout(loadLogs, 400)
    } catch (e) {
      setter({ status: 'fail', message: e instanceof Error ? e.message : 'Request failed' })
    }
  }

  const promoteOrDemote = async (action: 'promote' | 'demote') => {
    setPromoting(true)
    try {
      await arkzenFetch(`/api/roles-test/${action}`, { method: 'POST' })
      await refreshUser()
    } catch {} finally {
      setPromoting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.refresh()
    router.replace('/roles-test/login')
  }

  const resultStyle = (s: TestResult['status']) =>
    s === 'pass' ? 'bg-green-50 border-green-200 text-green-700' :
    s === 'fail' ? 'bg-red-50 border-red-200 text-red-700' :
    'bg-neutral-50 border-neutral-200 text-neutral-500'

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield size={20} /> Roles Test</h1>
          <button
            className="text-xs text-neutral-400 hover:text-neutral-700"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>

        {/* Current user card */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-500">Signed in as</div>
            <div className="font-semibold">{user?.name} · {user?.email}</div>
            <div className="mt-1">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                currentRole === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {currentRole}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {currentRole !== 'admin' && (
              <button
                className="arkzen-btn text-sm"
                onClick={() => promoteOrDemote('promote')}
                disabled={promoting}
              >
                {promoting ? '...' : 'Promote to admin'}
              </button>
            )}
            {currentRole === 'admin' && (
              <button
                className="arkzen-btn-ghost text-sm"
                onClick={() => promoteOrDemote('demote')}
                disabled={promoting}
              >
                {promoting ? '...' : 'Demote to user'}
              </button>
            )}
          </div>
        </div>

        {/* Route tests */}
        <div className="space-y-3">

          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-sm">Admin-only route</div>
                <code className="text-xs text-neutral-400">
                  GET /api/roles-test/admin-only · middleware: [auth, role:admin]
                </code>
              </div>
              <button
                className="arkzen-btn text-sm"
                onClick={() => testRoute('/api/roles-test/admin-only', setAdminResult)}
              >
                Test
              </button>
            </div>
            {adminResult.message && (
              <div className={`p-3 rounded-xl border text-sm ${resultStyle(adminResult.status)}`}>
                {adminResult.message}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-sm">User route (any authenticated)</div>
                <code className="text-xs text-neutral-400">
                  GET /api/roles-test/user-only · middleware: [auth]
                </code>
              </div>
              <button
                className="arkzen-btn text-sm"
                onClick={() => testRoute('/api/roles-test/user-only', setUserResult)}
              >
                Test
              </button>
            </div>
            {userResult.message && (
              <div className={`p-3 rounded-xl border text-sm ${resultStyle(userResult.status)}`}>
                {userResult.message}
              </div>
            )}
          </div>

        </div>

        {/* Audit log */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Access audit log</h2>
            <button className="text-xs text-neutral-400" onClick={loadLogs}>Refresh</button>
          </div>
          {logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">No access attempts yet.</div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {logs.map((l, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{l.action}</span>
                    <p className="text-xs text-neutral-500">Requires: {l.role_required}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    l.granted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {l.granted ? 'granted' : 'denied'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4 space-y-1.5">
          <p>
            <strong>How it works:</strong> This Tatemono uses <code>auth: true</code> — Arkzen
            generates Sanctum routes scoped to <code>roles-test</code> (login, register, logout, me).
          </p>
          <p>
            The <code>role:admin</code> middleware (CheckRole.php) reads{' '}
            <code>$request→user()→role</code> from the Sanctum-authenticated user.
            Without real auth there is no <code>$request→user()</code> — every role check
            returns 401, which is why the v1 session-based approach was broken.
          </p>
          <p>
            Promote/Demote update the <code>role</code> column on the scoped users table,
            then call <code>refreshUser()</code> which re-fetches <code>/auth/me</code> so
            the store reflects the new role without a page reload.
          </p>
        </div>

      </div>
    </div>
  )
}
/* @arkzen:web:page:dashboard:end */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect } from 'react'
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
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

setActiveTatemono('roles-test')
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect } from 'react'
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
import { useNavigation } from '@react-navigation/native'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

setActiveTatemono('roles-test')
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

// ── Primary button ─────────────────────────────────────────────
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

// ── Ghost button ──────────────────────────────────────────────
const GhostBtn = ({
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
    className="py-3 px-5 rounded-2xl items-center border border-neutral-200"
  >
    {loading
      ? <ActivityIndicator size="small" color="#737373" />
      : <Text className="text-neutral-600 text-sm font-medium">{label}</Text>
    }
  </TouchableOpacity>
)

// ── Role badge ────────────────────────────────────────────────
const RoleBadge = ({ role }: { role: string }) => (
  <View className={`px-2.5 py-1 rounded-full self-start ${
    role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
  }`}>
    <Text className={`text-xs font-bold ${
      role === 'admin' ? 'text-purple-700' : 'text-blue-700'
    }`}>
      {role}
    </Text>
  </View>
)

/* @arkzen:native:components:shared:end */


/* @arkzen:native:page:login */
/* @arkzen:native:page:layout:guest */

const LoginScreen = () => {
  const router               = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
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
            <Text className="text-white text-lg font-bold">🛡️</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Roles Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">
            Sign in to test role-based access control
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
          <TouchableOpacity onPress={() => router.push('/roles-test/register' as any)}>
            <Text className="text-xs text-neutral-400">
              No account?{' '}
              <Text className="text-neutral-700 font-medium">Register</Text>
            </Text>
          </TouchableOpacity>

          <View className="bg-neutral-100 rounded-xl px-4 py-2.5 w-full">
            <Text className="text-xs text-neutral-400 font-mono">
              admin@roles-test.com / password123{'\n'}
              user@roles-test.com  / password123
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
            <Text className="text-white text-lg font-bold">🛡️</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Roles Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">
            Create an account — you'll start as{' '}
            <Text className="font-semibold text-blue-600">user</Text>
          </Text>
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
          <TouchableOpacity onPress={() => router.push('/roles-test/login' as any)}>
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
  const router                         = useRouter()
  const { user, logout, refreshUser }  = useAuthStore()

  type TestResult = { status: 'idle' | 'pass' | 'fail'; message: string }

  const [adminResult, setAdminResult] = useState<TestResult>({ status: 'idle', message: '' })
  const [userResult,  setUserResult]  = useState<TestResult>({ status: 'idle', message: '' })
  const [logs,        setLogs]        = useState<any[]>([])
  const [promoting,   setPromoting]   = useState(false)

  const currentRole = (user as any)?.role ?? 'user'

  const loadLogs = async () => {
    try {
      const res = await arkzenFetch('/api/roles-test/logs')
      const d   = await res.json()
      setLogs(d.data ?? [])
    } catch {}
  }

  useEffect(() => { loadLogs() }, [])

  const testRoute = async (
    route: string,
    setter: React.Dispatch<React.SetStateAction<TestResult>>
  ) => {
    setter({ status: 'idle', message: 'Testing...' })
    try {
      const res = await arkzenFetch(route)
      const d   = await res.json()
      if (res.ok) {
        setter({ status: 'pass', message: d.message ?? '✓ Access granted' })
      } else {
        setter({ status: 'fail', message: d.message ?? '✗ Access denied' })
      }
      setTimeout(loadLogs, 400)
    } catch (e) {
      setter({ status: 'fail', message: e instanceof Error ? e.message : 'Request failed' })
    }
  }

  const promoteOrDemote = async (action: 'promote' | 'demote') => {
    setPromoting(true)
    try {
      await arkzenFetch(`/api/roles-test/${action}`, { method: 'POST' })
      await refreshUser()
    } catch {} finally {
      setPromoting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/roles-test/login' as any)
  }

  const resultBg = (s: TestResult['status']) =>
    s === 'pass' ? 'bg-green-50 border-green-200' :
    s === 'fail' ? 'bg-red-50 border-red-200' :
    'bg-neutral-50 border-neutral-200'

  const resultText = (s: TestResult['status']) =>
    s === 'pass' ? 'text-green-700' :
    s === 'fail' ? 'text-red-700' :
    'text-neutral-500'

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-neutral-900">🛡️ Roles Test</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-xs text-neutral-400">Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Current user card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-5">
          <Text className="text-xs text-neutral-400 mb-1">Signed in as</Text>
          <Text className="font-semibold text-neutral-900 mb-2">{user?.name} · {user?.email}</Text>
          <View className="flex-row items-center justify-between">
            <RoleBadge role={currentRole} />
            <View className="flex-row gap-x-2">
              {currentRole !== 'admin' && (
                <PrimaryBtn
                  label="Promote to admin"
                  onPress={() => promoteOrDemote('promote')}
                  loading={promoting}
                />
              )}
              {currentRole === 'admin' && (
                <GhostBtn
                  label="Demote to user"
                  onPress={() => promoteOrDemote('demote')}
                  loading={promoting}
                />
              )}
            </View>
          </View>
        </View>

        {/* Route tests */}
        <View className="mx-4 mt-4 gap-y-3">

          {/* Admin-only route */}
          <View className="bg-white rounded-2xl border border-neutral-100 p-5">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold text-neutral-900">Admin-only route</Text>
                <Text className="text-xs text-neutral-400 font-mono mt-0.5">
                  GET /api/roles-test/admin-only
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => testRoute('/api/roles-test/admin-only', setAdminResult)}
                className="bg-neutral-900 px-4 py-2 rounded-xl"
              >
                <Text className="text-white text-xs font-semibold">Test</Text>
              </TouchableOpacity>
            </View>
            {adminResult.message !== '' && (
              <View className={`p-3 rounded-xl border ${resultBg(adminResult.status)}`}>
                <Text className={`text-xs ${resultText(adminResult.status)}`}>
                  {adminResult.message}
                </Text>
              </View>
            )}
          </View>

          {/* User route */}
          <View className="bg-white rounded-2xl border border-neutral-100 p-5">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold text-neutral-900">User route</Text>
                <Text className="text-xs text-neutral-400 font-mono mt-0.5">
                  GET /api/roles-test/user-only
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => testRoute('/api/roles-test/user-only', setUserResult)}
                className="bg-neutral-900 px-4 py-2 rounded-xl"
              >
                <Text className="text-white text-xs font-semibold">Test</Text>
              </TouchableOpacity>
            </View>
            {userResult.message !== '' && (
              <View className={`p-3 rounded-xl border ${resultBg(userResult.status)}`}>
                <Text className={`text-xs ${resultText(userResult.status)}`}>
                  {userResult.message}
                </Text>
              </View>
            )}
          </View>

        </View>

        {/* Audit log */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="font-semibold text-sm text-neutral-900">Access audit log</Text>
            <TouchableOpacity onPress={loadLogs}>
              <Text className="text-xs text-neutral-400">Refresh</Text>
            </TouchableOpacity>
          </View>
          {logs.length === 0 ? (
            <View className="p-8 items-center">
              <Text className="text-sm text-neutral-400">No access attempts yet.</Text>
            </View>
          ) : (
            logs.map((l, i) => (
              <View key={i} className="px-5 py-3 flex-row items-center justify-between border-b border-neutral-50">
                <View>
                  <Text className="text-sm font-medium text-neutral-900">{l.action}</Text>
                  <Text className="text-xs text-neutral-400">Requires: {l.role_required}</Text>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${l.granted ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Text className={`text-xs font-semibold ${l.granted ? 'text-green-700' : 'text-red-700'}`}>
                    {l.granted ? 'granted' : 'denied'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info note */}
        <View className="mx-4 mt-4 bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            middleware: [auth, role:admin]{'\n'}
            token: Sanctum Bearer{'\n'}
            scope: roles-test SQLite
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

/* @arkzen:native:page:dashboard:end */

// ─────────────────────────────────────────────────────────────────────────────
// LYNX NATIVE COMPONENTS & PAGES
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:components:lynx:shared */

import { useState, useEffect } from '@lynx-js/react'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

setActiveTatemono('roles-test')

// ── Input field ───────────────────────────────────────────────
const Field = ({
  placeholder,
  value,
  onInput,
  secureTextEntry = false,
}: {
  placeholder: string
  value: string
  onInput: (v: string) => void
  secureTextEntry?: boolean
}) => (
  <input
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 w-full"
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

// ── Primary button ─────────────────────────────────────────────
const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label: string
  onPress: () => void
  loading?: boolean
}) => (
  <view
    bindtap={loading ? undefined : onPress}
    className="w-full py-3.5 rounded-2xl items-center"
    style={{ backgroundColor: loading ? '#a3a3a3' : '#171717' }}
  >
    <text className="text-white text-sm font-semibold">{loading ? '...' : label}</text>
  </view>
)

// ── Ghost button ──────────────────────────────────────────────
const GhostBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label: string
  onPress: () => void
  loading?: boolean
}) => (
  <view
    bindtap={loading ? undefined : onPress}
    className="py-3 px-5 rounded-2xl border border-neutral-200 items-center"
    style={{ backgroundColor: '#ffffff' }}
  >
    <text className="text-neutral-600 text-sm font-medium">{loading ? '...' : label}</text>
  </view>
)

// ── Role badge ────────────────────────────────────────────────
const RoleBadge = ({ role }: { role: string }) => (
  <view className={`px-2.5 py-1 rounded-full ${role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
    <text className={`text-xs font-bold ${role === 'admin' ? 'text-purple-700' : 'text-blue-700'}`}>
      {role}
    </text>
  </view>
)

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:login */
/* @arkzen:native:page:layout:guest */

import { useState } from '@lynx-js/react'

const LoginLynxPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <view className="min-h-screen bg-neutral-50 items-center justify-center p-6">
      <view className="bg-white rounded-2xl border border-neutral-100 p-8 w-full max-w-sm" style={{ gap: 20 }}>
        {/* Header */}
        <view>
          <text className="text-xl font-bold" style={{ gap: 8 }}>
            🛡️ Roles Test
          </text>
          <text className="text-sm text-neutral-500 mt-1">
            Sign in to test role-based access control
          </text>
        </view>

        {error && <ErrorBox message={error} />}

        {/* Form */}
        <view style={{ gap: 12 }}>
          <Field placeholder="Email" value={email} onInput={setEmail} />
          <Field placeholder="Password" value={password} onInput={setPassword} secureTextEntry />
          <PrimaryBtn label={isLoading ? 'Signing in...' : 'Sign in'} onPress={handleLogin} loading={isLoading} />
        </view>

        {/* Footer */}
        <view className="items-center" style={{ gap: 12 }}>
          <text className="text-xs text-neutral-400">
            No account?{' '}
            <text className="text-neutral-700 font-medium">Register</text>
          </text>
          <view className="bg-neutral-100 rounded-xl px-4 py-2.5 w-full">
            <text className="text-xs text-neutral-400 font-mono">
              admin@roles-test.com / password123{'\n'}
              user@roles-test.com / password123
            </text>
          </view>
        </view>
      </view>
    </view>
  )
}

/* @arkzen:native:page:lynx:login:end */

/* @arkzen:native:page:lynx:register */
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

/* @arkzen:native:page:lynx:register:end */

/* @arkzen:native:page:lynx:dashboard */
/* @arkzen:native:page:layout:auth */

import { useState, useEffect } from '@lynx-js/react'

const DashboardLynxPage = () => {
  const { user, logout, refreshUser } = useAuthStore()

  type TestResult = { status: 'idle' | 'pass' | 'fail'; message: string }

  const [adminResult, setAdminResult] = useState<TestResult>({ status: 'idle', message: '' })
  const [userResult, setUserResult] = useState<TestResult>({ status: 'idle', message: '' })
  const [logs, setLogs] = useState<any[]>([])
  const [promoting, setPromoting] = useState(false)

  const currentRole = (user as any)?.role ?? 'user'

  const loadLogs = async () => {
    try {
      const res = await arkzenFetch('/api/roles-test/logs')
      const d = await res.json()
      setLogs(d.data ?? [])
    } catch {}
  }

  useEffect(() => { loadLogs() }, [])

  const testRoute = async (
    route: string,
    setter: (s: TestResult) => void
  ) => {
    setter({ status: 'idle', message: 'Testing...' })
    try {
      const res = await arkzenFetch(route)
      const d = await res.json()
      if (res.ok) {
        setter({ status: 'pass', message: d.message ?? '✓ Access granted' })
      } else {
        setter({ status: 'fail', message: d.message ?? '✗ Access denied' })
      }
      setTimeout(loadLogs, 400)
    } catch (e) {
      setter({ status: 'fail', message: e instanceof Error ? e.message : 'Request failed' })
    }
  }

  const promoteOrDemote = async (action: 'promote' | 'demote') => {
    setPromoting(true)
    try {
      await arkzenFetch(`/api/roles-test/${action}`, { method: 'POST' })
      await refreshUser()
    } catch {} finally {
      setPromoting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const resultBg = (s: TestResult['status']) =>
    s === 'pass' ? 'bg-green-50 border-green-200' :
    s === 'fail' ? 'bg-red-50 border-red-200' :
    'bg-neutral-50 border-neutral-200'

  const resultText = (s: TestResult['status']) =>
    s === 'pass' ? 'text-green-700' :
    s === 'fail' ? 'text-red-700' :
    'text-neutral-500'

  return (
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <view>
          <text className="text-base font-semibold text-neutral-900">🛡️ Roles Test</text>
          <text className="text-xs text-neutral-400 mt-0.5">{user?.email}</text>
        </view>
        <view bindtap={handleLogout}>
          <text className="text-xs text-neutral-400">Sign out</text>
        </view>
      </view>

      <scroll-view className="flex-1 p-4 pb-8">

        {/* Current user card */}
        <view className="bg-white rounded-2xl border border-neutral-100 p-5 mb-4">
          <text className="text-xs text-neutral-400 mb-1">Signed in as</text>
          <text className="font-semibold text-neutral-900 mb-2">{user?.name} · {user?.email}</text>
          <view className="flex-row items-center justify-between">
            <RoleBadge role={currentRole} />
            <view className="flex-row" style={{ gap: 8 }}>
              {currentRole !== 'admin' && (
                <PrimaryBtn
                  label="Promote to admin"
                  onPress={() => promoteOrDemote('promote')}
                  loading={promoting}
                />
              )}
              {currentRole === 'admin' && (
                <GhostBtn
                  label="Demote to user"
                  onPress={() => promoteOrDemote('demote')}
                  loading={promoting}
                />
              )}
            </view>
          </view>
        </view>

        {/* Route tests */}
        <view style={{ gap: 12 }}>

          {/* Admin-only route */}
          <view className="bg-white rounded-2xl border border-neutral-100 p-5">
            <view className="flex-row items-start justify-between mb-3">
              <view className="flex-1">
                <text className="text-sm font-semibold text-neutral-900">Admin-only route</text>
                <text className="text-xs text-neutral-400 font-mono mt-0.5">
                  GET /api/roles-test/admin-only
                </text>
              </view>
              <view
                bindtap={() => testRoute('/api/roles-test/admin-only', setAdminResult)}
                className="bg-neutral-900 px-4 py-2 rounded-xl"
              >
                <text className="text-white text-xs font-semibold">Test</text>
              </view>
            </view>
            {adminResult.message !== '' && (
              <view className={`p-3 rounded-xl border ${resultBg(adminResult.status)}`}>
                <text className={`text-xs ${resultText(adminResult.status)}`}>
                  {adminResult.message}
                </text>
              </view>
            )}
          </view>

          {/* User route */}
          <view className="bg-white rounded-2xl border border-neutral-100 p-5">
            <view className="flex-row items-start justify-between mb-3">
              <view className="flex-1">
                <text className="text-sm font-semibold text-neutral-900">User route</text>
                <text className="text-xs text-neutral-400 font-mono mt-0.5">
                  GET /api/roles-test/user-only
                </text>
              </view>
              <view
                bindtap={() => testRoute('/api/roles-test/user-only', setUserResult)}
                className="bg-neutral-900 px-4 py-2 rounded-xl"
              >
                <text className="text-white text-xs font-semibold">Test</text>
              </view>
            </view>
            {userResult.message !== '' && (
              <view className={`p-3 rounded-xl border ${resultBg(userResult.status)}`}>
                <text className={`text-xs ${resultText(userResult.status)}`}>
                  {userResult.message}
                </text>
              </view>
            )}
          </view>

        </view>

        {/* Audit log */}
        <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mt-4">
          <view className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <text className="font-semibold text-sm text-neutral-900">Access audit log</text>
            <view bindtap={loadLogs}>
              <text className="text-xs text-neutral-400">Refresh</text>
            </view>
          </view>
          {logs.length === 0 ? (
            <view className="p-8 items-center">
              <text className="text-sm text-neutral-400">No access attempts yet.</text>
            </view>
          ) : (
            logs.map((l, i) => (
              <view key={i} className="px-5 py-3 flex-row items-center justify-between border-b border-neutral-50">
                <view>
                  <text className="text-sm font-medium text-neutral-900">{l.action}</text>
                  <text className="text-xs text-neutral-400">Requires: {l.role_required}</text>
                </view>
                <view className={`px-2.5 py-1 rounded-full ${l.granted ? 'bg-green-100' : 'bg-red-100'}`}>
                  <text className={`text-xs font-semibold ${l.granted ? 'text-green-700' : 'text-red-700'}`}>
                    {l.granted ? 'granted' : 'denied'}
                  </text>
                </view>
              </view>
            ))
          )}
        </view>

        {/* Info note */}
        <view className="bg-neutral-100 rounded-2xl px-4 py-3 mt-4">
          <text className="text-xs text-neutral-500 font-mono leading-5">
            middleware: [auth, role:admin]{'\n'}
            token: Sanctum Bearer{'\n'}
            scope: roles-test SQLite
          </text>
        </view>

      </scroll-view>
    </view>
  )
}

/* @arkzen:native:page:lynx:dashboard:end */