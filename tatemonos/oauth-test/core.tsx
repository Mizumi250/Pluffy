/* @arkzen:meta
name: oauth-test
version: 1.0.0
description: End to end test for social sign-in (@arkzen:oauth) on every web, mobile and desktop frontend, against every backend.
auth: true
auth_seed:
  users:
    - name: Haruka Matsuda
      email: haruka@oauth-test.local
      password: password123
      role: admin
    - name: Lukas Brandt
      email: lukas@oauth-test.local
      password: password123
      role: user
*/

/* @arkzen:meta:web
title: OAuth Test | Social sign-in check
label: OAuth Test
description: Try Google, GitHub, X, Apple, Microsoft, Facebook, Instagram and Discord sign-in against the active backend.
favicon: /tatemonos/oauth-test/assets/images/favicon.svg
*/

/* @arkzen:meta:native
label: OAuth Test
description: Social sign-in check for Pluffy
expo:
  bundle_id: com.pluffy.oauthtest
  version: 1.0.0
  orientation: portrait
  status_bar_style: dark
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "min-h-screen bg-[#eef2f0]"
  auth:
    className: "min-h-screen bg-[#eef2f0]"
*/

/* @arkzen:desktop:config
window:
  width: 1100
  height: 780
  min_width: 420
  min_height: 640
  resizable: true
  title: OAuth Test
*/

/* @arkzen:oauth
providers: [google, github, twitter, apple, microsoft, facebook, instagram, discord]
redirect: /oauth-test/dashboard
error_redirect: /oauth-test/login
link_verified_email: true
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { KeyRound, ShieldCheck, LogOut, RefreshCw, TriangleAlert, CircleCheck, CircleDashed, Copy, Check, Smartphone, Server } from 'lucide-react'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { useAuthStore, setActiveTatemono, getOAuthProviders, oauthLoginUrl, consumeOAuthError } from '@/arkzen/core/stores/authStore'

// Activate the isolated auth context for this Tatemono
if (typeof window !== 'undefined') {
  setActiveTatemono('oauth-test')
}

export interface OAuthProviderInfo {
  id:    string
  label: string
  env:   string
  color: string
  vb:    string
  d:     string
}

// Brand glyphs: Simple Icons (CC0) and Font Awesome Free brands (CC BY 4.0)
export const OAUTH_PROVIDER_LIST: OAuthProviderInfo[] = [
  { id: 'google',    label: 'Google',      env: 'GOOGLE',    color: '#4285F4', vb: '0 0 24 24',    d: 'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z' },
  { id: 'github',    label: 'GitHub',      env: 'GITHUB',    color: '#181717', vb: '0 0 24 24',    d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
  { id: 'twitter',   label: 'X (Twitter)', env: 'TWITTER',   color: '#111111', vb: '0 0 24 24',   d: 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z' },
  { id: 'apple',     label: 'Apple',       env: 'APPLE',     color: '#111111', vb: '0 0 24 24',     d: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701' },
  { id: 'microsoft', label: 'Microsoft',   env: 'MICROSOFT', color: '#0078D4', vb: '0 0 448 512', d: 'M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z' },
  { id: 'facebook',  label: 'Facebook',    env: 'FACEBOOK',  color: '#1877F2', vb: '0 0 24 24',  d: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z' },
  { id: 'instagram', label: 'Instagram',   env: 'INSTAGRAM', color: '#E4405F', vb: '0 0 24 24', d: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077' },
  { id: 'discord',   label: 'Discord',     env: 'DISCORD',   color: '#5865F2', vb: '0 0 24 24',   d: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z' },
]

export const ENV_BASE_LINES = [
  'OAUTH_REDIRECT_BASE=http://localhost:8000',
  'OAUTH_FRONTEND_URL=http://localhost:3000',
  'OAUTH_STATE_SECRET=<long random value>',
].join('\n')

export const envKeysFor = (p: OAuthProviderInfo): string[] => {
  if (p.id === 'apple') {
    return ['OAUTH_APPLE_CLIENT_ID', 'OAUTH_APPLE_TEAM_ID', 'OAUTH_APPLE_KEY_ID', 'OAUTH_APPLE_PRIVATE_KEY']
  }
  const keys = [`OAUTH_${p.env}_CLIENT_ID`, `OAUTH_${p.env}_CLIENT_SECRET`]
  if (p.id === 'microsoft') keys.push('OAUTH_MICROSOFT_TENANT')
  return keys
}

export const callbackUrlFor = (id: string): string =>
  oauthLoginUrl(id).replace(/\/redirect$/, '/callback')

export const BrandIcon = ({ provider, size = 18 }: { provider: OAuthProviderInfo; size?: number }) => (
  <svg width={size} height={size} viewBox={provider.vb} fill={provider.color} aria-hidden="true" focusable="false">
    <path d={provider.d} />
  </svg>
)

// Same key mark as the favicon
export const BrandMark = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect width="32" height="32" rx="7" fill="#1f3a34" />
    <circle cx="16" cy="12.5" r="5.4" fill="#f4c95d" />
    <path d="M13.1 17.2h5.8l1.7 9.1h-9.2z" fill="#f4c95d" />
    <circle cx="16" cy="12.5" r="1.9" fill="#1f3a34" />
  </svg>
)

export const useOAuthProviders = () => {
  const [enabled, setEnabled] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const list = await getOAuthProviders()
    setEnabled(Array.isArray(list) ? list : [])
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  return { enabled, loading, reload }
}

export const useSignOut = () => {
  const router = useArkzenRouter()
  const { logout } = useAuthStore()
  return async () => {
    await logout()
    router.replace('/oauth-test/login')
  }
}

export const ProviderButtons = () => {
  const { enabled, loading } = useOAuthProviders()
  const [busy, setBusy] = useState<string | null>(null)

  const start = (id: string) => {
    setBusy(id)
    window.location.href = oauthLoginUrl(id)
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {OAUTH_PROVIDER_LIST.map(p => {
          const on = enabled.includes(p.id)
          return (
            <button
              key={p.id}
              type="button"
              disabled={!on || loading || busy !== null}
              onClick={() => start(p.id)}
              aria-label={`Continue with ${p.label}`}
              className={
                'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ' +
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a34] ' +
                (on
                  ? 'border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50'
                  : 'border-dashed border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed')
              }
            >
              <span className={on ? '' : 'opacity-40'}><BrandIcon provider={p} /></span>
              <span className="truncate">{busy === p.id ? 'Redirecting…' : p.label}</span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-neutral-500">
        {loading
          ? 'Checking which providers the backend has keys for…'
          : enabled.length === 0
            ? 'No providers reported. The backend is unreachable or has no keys in its .env yet.'
            : `${enabled.length} of ${OAUTH_PROVIDER_LIST.length} providers have keys in the backend .env.`}
      </p>
    </div>
  )
}

export const ProviderStatus = () => {
  const { enabled, loading, reload } = useOAuthProviders()
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-neutral-900"><Server size={16} /> Provider status</h3>
        <button
          type="button"
          onClick={reload}
          aria-label="Refresh provider status"
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a34]"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <ul className="divide-y divide-neutral-100">
        {OAUTH_PROVIDER_LIST.map(p => {
          const on = enabled.includes(p.id)
          return (
            <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
              <BrandIcon provider={p} size={16} />
              <span className="flex-1 text-neutral-800">{p.label}</span>
              {on
                ? <span className="flex items-center gap-1 text-emerald-700"><CircleCheck size={15} /> Keys found</span>
                : <span className="flex items-center gap-1 text-neutral-400"><CircleDashed size={15} /> No keys</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1500)
    } catch {
      // clipboard can be blocked; nothing else to do
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="shrink-0 rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a34]"
    >
      {done ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
    </button>
  )
}

export const ErrorNote = ({ message }: { message: string }) => (
  <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
    <TriangleAlert size={16} className="mt-0.5 shrink-0" />
    <span>{message}</span>
  </div>
)

export const FlowIcon = ({ kind }: { kind: 'key' | 'shield' | 'phone' }) => {
  if (kind === 'shield') return <ShieldCheck size={18} />
  if (kind === 'phone') return <Smartphone size={18} />
  return <KeyRound size={18} />
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:login */
/* @arkzen:web:page:layout:guest */
const LoginPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('haruka@oauth-test.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)

  // A failed provider round trip leaves its message behind for us
  useEffect(() => {
    setError(consumeOAuthError())
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <BrandMark size={40} />
          <div>
            <h1 className="text-xl font-bold text-neutral-900">OAuth Test</h1>
            <p className="text-sm text-neutral-500">Sign in with email or a provider</p>
          </div>
        </div>

        {error && <ErrorNote message={error} />}

        <ProviderButtons />

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-neutral-400">
          <span className="h-px flex-1 bg-neutral-200" />
          or use the seeded account
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label htmlFor="oauth-email" className="mb-1 block text-xs font-medium text-neutral-600">Email</label>
            <input id="oauth-email" className="arkzen-input w-full" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="oauth-password" className="mb-1 block text-xs font-medium text-neutral-600">Password</label>
            <input id="oauth-password" className="arkzen-input w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="arkzen-btn-primary w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <a href="/oauth-test/register" className="underline underline-offset-2 hover:text-neutral-900">Create an account</a>
          <a href="/oauth-test/setup" className="underline underline-offset-2 hover:text-neutral-900">Provider setup</a>
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
  const [name, setName] = useState('Nikolai Volkov')
  const [email, setEmail] = useState('nikolai@oauth-test.local')
  const [password, setPassword] = useState('password123')
  const [confirm, setConfirm] = useState('password123')
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      await register(name, email, password, confirm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <BrandMark size={40} />
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Create an account</h1>
            <p className="text-sm text-neutral-500">Email and password, no provider needed</p>
          </div>
        </div>

        {error && <ErrorNote message={error} />}

        <form onSubmit={handleRegister} className="space-y-3">
          <input className="arkzen-input w-full" placeholder="Name" aria-label="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="arkzen-input w-full" type="email" placeholder="Email" aria-label="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="arkzen-input w-full" type="password" placeholder="Password" aria-label="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <input className="arkzen-input w-full" type="password" placeholder="Confirm password" aria-label="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          <button className="arkzen-btn-primary w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          Already registered?{' '}
          <a href="/oauth-test/login" className="underline underline-offset-2 hover:text-neutral-900">Sign in</a>
        </p>
      </div>
    </div>
  )
}
/* @arkzen:web:page:register:end */

/* @arkzen:web:page:setup */
/* @arkzen:web:page:layout:guest */
const SetupPage = () => {
  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size={36} />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Provider setup</h1>
              <p className="text-sm text-neutral-500">What the backend .env needs before a button turns on</p>
            </div>
          </div>
          <a href="/oauth-test/login" className="text-sm underline underline-offset-2 text-neutral-600 hover:text-neutral-900">Back to sign in</a>
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Backend .env, shared by every provider</h2>
            <CopyButton text={ENV_BASE_LINES} label="Copy shared env lines" />
          </div>
          <pre className="overflow-x-auto rounded-xl bg-neutral-50 p-4 text-xs text-neutral-800">{ENV_BASE_LINES}</pre>
          <p className="mt-3 text-xs text-neutral-500">
            Testing the mobile apps? Set <code>OAUTH_FRONTEND_URL=arkzen://oauth</code> instead (Expo scheme <code>arkzen</code>).
            The backend appends the redirect path and puts the token in the URL hash.
          </p>
        </section>

        <section className="space-y-3">
          {OAUTH_PROVIDER_LIST.map(p => {
            const callback = callbackUrlFor(p.id)
            return (
              <div key={p.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <BrandIcon provider={p} size={20} />
                  <h3 className="font-semibold text-neutral-900">{p.label}</h3>
                </div>
                <div className="mb-3">
                  <div className="mb-1 text-xs font-medium text-neutral-500">Redirect URI to register with the provider</div>
                  <div className="flex items-center gap-1 rounded-lg bg-neutral-50 px-3 py-2">
                    <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-neutral-800">{callback}</code>
                    <CopyButton text={callback} label={`Copy ${p.label} redirect URI`} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium text-neutral-500">Env keys</div>
                  <ul className="space-y-1">
                    {envKeysFor(p).map(k => (
                      <li key={k} className="text-xs"><code className="text-neutral-800">{k}=</code></li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </section>

        <p className="text-xs text-neutral-500">
          Apple needs HTTPS and a real domain for its redirect URI. Microsoft addresses are never auto-linked to an existing account.
        </p>
      </div>
    </div>
  )
}
/* @arkzen:web:page:setup:end */

/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:auth */
const DashboardPage = () => {
  const { user } = useAuthStore()
  const signOut = useSignOut()

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size={36} />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">You are signed in</h1>
              <p className="text-sm text-neutral-500">
                {user?.name ?? 'Unknown user'} <span className="text-neutral-400">({user?.email ?? 'no email'})</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a34]"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <ShieldCheck size={22} className="mt-0.5 shrink-0 text-emerald-700" />
          <div className="text-sm text-emerald-900">
            <div className="font-semibold">The token reached the store</div>
            This page sits behind the auth guard. If you got here through a provider button, the backend
            redirected with the token in the URL hash, the store saved it, and <code>fetchMe()</code> loaded this profile.
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ProviderStatus />

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-neutral-900"><KeyRound size={16} /> Session user</h3>
            <pre className="overflow-x-auto rounded-xl bg-neutral-50 p-4 text-xs text-neutral-800">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-700">
          <h3 className="mb-2 font-semibold text-neutral-900">Checklist for each provider</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Sign out, then press the provider button on the login page.</li>
            <li>Approve at the provider and land back here without an error banner.</li>
            <li>Confirm the user above shows the provider email and name.</li>
            <li>Sign in again with the same provider and check that no second account appears.</li>
            <li>Sign in with the seeded email and password to confirm email login still works.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
/* @arkzen:web:page:dashboard:end */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import Svg, { Path, Rect, Circle } from 'react-native-svg'
import { KeyRound, ShieldCheck, LogOut, RefreshCw, TriangleAlert, CircleCheck, CircleDashed } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { useAuthStore, setActiveTatemono, getOAuthProviders, oauthSignIn, consumeOAuthError } from '@/arkzen/core/stores/authStore'

setActiveTatemono('oauth-test')
WebBrowser.maybeCompleteAuthSession()

export const useNav = () => {
  const r = useRouter()
  return {
    go: (p: string) => r.push(`/oauth-test/${p}` as any),
    replace: (p: string) => r.replace(`/oauth-test/${p}` as any),
  }
}

// Opens the system browser and resolves with the deep link the backend redirects to
export const openOAuthBrowser = async (loginUrl: string): Promise<string | null> => {
  const result = await WebBrowser.openAuthSessionAsync(loginUrl, Linking.createURL('oauth'))
  return result.type === 'success' ? result.url : null
}

export const getDeepLinkBase = (): string => Linking.createURL('oauth')
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native'
import Svg, { Path, Rect, Circle } from 'react-native-svg'
import { KeyRound, ShieldCheck, LogOut, RefreshCw, TriangleAlert, CircleCheck, CircleDashed } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuthStore, setActiveTatemono, getOAuthProviders, oauthSignIn, consumeOAuthError } from '@/arkzen/core/stores/authStore'

setActiveTatemono('oauth-test')

export const useNav = () => {
  const n = useNavigation<any>()
  return {
    go: (p: string) => n.navigate(`oauth-test/${p}`),
    replace: (p: string) => n.navigate(`oauth-test/${p}`),
  }
}

// Bare React Native has no browser package: open the URL and wait for the deep link.
// The app must register the arkzen:// scheme natively for the link to come back.
export const openOAuthBrowser = (loginUrl: string): Promise<string | null> =>
  new Promise(resolve => {
    let finished = false
    const finish = (value: string | null) => {
      if (finished) return
      finished = true
      sub.remove()
      clearTimeout(timer)
      resolve(value)
    }
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('arkzen_oauth_')) finish(url)
    })
    const timer = setTimeout(() => finish(null), 120000)
    Linking.openURL(loginUrl).catch(() => finish(null))
  })

export const getDeepLinkBase = (): string => 'arkzen://oauth'
/* @arkzen:import:rn:end */

export interface OAuthProviderInfo {
  id:    string
  label: string
  color: string
  vb:    string
  d:     string
}

export const OAUTH_PROVIDER_LIST: OAuthProviderInfo[] = [
  { id: 'google',    label: 'Google',      color: '#4285F4', vb: '0 0 24 24',    d: 'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z' },
  { id: 'github',    label: 'GitHub',      color: '#181717', vb: '0 0 24 24',    d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
  { id: 'twitter',   label: 'X (Twitter)', color: '#111111', vb: '0 0 24 24',   d: 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z' },
  { id: 'apple',     label: 'Apple',       color: '#111111', vb: '0 0 24 24',     d: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701' },
  { id: 'microsoft', label: 'Microsoft',   color: '#0078D4', vb: '0 0 448 512', d: 'M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z' },
  { id: 'facebook',  label: 'Facebook',    color: '#1877F2', vb: '0 0 24 24',  d: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z' },
  { id: 'instagram', label: 'Instagram',   color: '#E4405F', vb: '0 0 24 24', d: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077' },
  { id: 'discord',   label: 'Discord',     color: '#5865F2', vb: '0 0 24 24',   d: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z' },
]

export const BrandIcon = ({ provider, size = 18 }: { provider: OAuthProviderInfo; size?: number }) => (
  <Svg width={size} height={size} viewBox={provider.vb}>
    <Path d={provider.d} fill={provider.color} />
  </Svg>
)

// Same key mark as the web favicon
export const BrandMark = ({ size = 40 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Rect width={32} height={32} rx={7} fill="#1f3a34" />
    <Circle cx={16} cy={12.5} r={5.4} fill="#f4c95d" />
    <Path d="M13.1 17.2h5.8l1.7 9.1h-9.2z" fill="#f4c95d" />
    <Circle cx={16} cy={12.5} r={1.9} fill="#1f3a34" />
  </Svg>
)

export const useOAuthProviders = () => {
  const [enabled, setEnabled] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const list = await getOAuthProviders()
    setEnabled(Array.isArray(list) ? list : [])
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  return { enabled, loading, reload }
}

export const Field = ({
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
  keyboardType?:    'default' | 'email-address'
}) => (
  <TextInput
    className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    placeholderTextColor="#a3a3a3"
    accessibilityLabel={placeholder}
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    autoCapitalize="none"
    autoCorrect={false}
  />
)

export const ErrorBox = ({ message }: { message: string }) => (
  <View className="flex-row items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
    <TriangleAlert size={16} color="#b91c1c" />
    <Text className="flex-1 text-xs text-red-700">{message}</Text>
  </View>
)

export const PrimaryBtn = ({ label, onPress, loading = false }: { label: string; onPress: () => void; loading?: boolean }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    accessibilityRole="button"
    className={`items-center rounded-2xl py-3.5 ${loading ? 'bg-neutral-300' : 'bg-[#1f3a34]'}`}
  >
    {loading
      ? <ActivityIndicator size="small" color="#fff" />
      : <Text className="text-sm font-semibold text-white">{label}</Text>}
  </TouchableOpacity>
)

export const ProviderButtons = ({ onError }: { onError: (message: string | null) => void }) => {
  const { enabled, loading } = useOAuthProviders()
  const [busy, setBusy] = useState<string | null>(null)

  const start = async (id: string) => {
    setBusy(id)
    onError(null)
    try {
      const ok = await oauthSignIn(id, openOAuthBrowser)
      if (!ok) {
        const message = consumeOAuthError()
        if (message) onError(message)
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Sign-in failed')
    }
    setBusy(null)
  }

  return (
    <View className="gap-y-2">
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {OAUTH_PROVIDER_LIST.map(p => {
          const on = enabled.includes(p.id)
          return (
            <TouchableOpacity
              key={p.id}
              disabled={!on || loading || busy !== null}
              onPress={() => start(p.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Continue with ${p.label}`}
              className={`flex-row items-center gap-2 rounded-xl border px-3 py-2.5 ${on ? 'border-neutral-200 bg-white' : 'border-dashed border-neutral-200 bg-neutral-50'}`}
              style={{ width: '48%' }}
            >
              <View style={{ opacity: on ? 1 : 0.4 }}><BrandIcon provider={p} /></View>
              <Text numberOfLines={1} className={`flex-1 text-sm font-medium ${on ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {busy === p.id ? 'Opening…' : p.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
      <Text className="text-xs text-neutral-500">
        {loading
          ? 'Checking which providers the backend has keys for…'
          : enabled.length === 0
            ? 'No providers reported. The backend is unreachable or has no keys yet.'
            : `${enabled.length} of ${OAUTH_PROVIDER_LIST.length} providers have keys in the backend .env.`}
      </Text>
    </View>
  )
}

export const ProviderStatus = () => {
  const { enabled, loading, reload } = useOAuthProviders()
  return (
    <View className="mx-4 mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-neutral-900">Provider status</Text>
        <TouchableOpacity onPress={reload} accessibilityRole="button" accessibilityLabel="Refresh provider status" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          {loading ? <ActivityIndicator size="small" color="#1f3a34" /> : <RefreshCw size={16} color="#525252" />}
        </TouchableOpacity>
      </View>
      {OAUTH_PROVIDER_LIST.map(p => {
        const on = enabled.includes(p.id)
        return (
          <View key={p.id} className="flex-row items-center gap-3 border-t border-neutral-100 py-2.5">
            <BrandIcon provider={p} size={16} />
            <Text className="flex-1 text-sm text-neutral-800">{p.label}</Text>
            {on ? <CircleCheck size={16} color="#047857" /> : <CircleDashed size={16} color="#a3a3a3" />}
            <Text className={`text-xs ${on ? 'text-emerald-700' : 'text-neutral-400'}`}>{on ? 'Keys found' : 'No keys'}</Text>
          </View>
        )
      })}
    </View>
  )
}

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:login */
/* @arkzen:native:page:layout:guest */

const LoginScreen = () => {
  const { go } = useNav()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('haruka@oauth-test.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
      // GuestLayout redirects once isAuthenticated flips
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#eef2f0]" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled" className="px-6">
        <View className="mb-6 flex-row items-center gap-3">
          <BrandMark size={44} />
          <View>
            <Text className="text-2xl font-bold text-neutral-900">OAuth Test</Text>
            <Text className="text-sm text-neutral-500">Sign in with email or a provider</Text>
          </View>
        </View>

        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <ProviderButtons onError={setError} />

          <Text className="my-1 text-center text-xs uppercase text-neutral-400">or use the seeded account</Text>

          <Field placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Field placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <PrimaryBtn label="Sign in" onPress={handleLogin} loading={isLoading} />
        </View>

        <View className="mt-6 items-center gap-y-3">
          <TouchableOpacity onPress={() => go('register')} accessibilityRole="button">
            <Text className="text-xs text-neutral-500">
              No account? <Text className="font-medium text-neutral-800">Register</Text>
            </Text>
          </TouchableOpacity>
          <View className="rounded-xl bg-white px-4 py-2.5">
            <Text className="text-xs text-neutral-500">Backend .env for this app:</Text>
            <Text className="font-mono text-xs text-neutral-800">OAUTH_FRONTEND_URL={getDeepLinkBase()}</Text>
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
  const { go } = useNav()
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('Nikolai Volkov')
  const [email, setEmail] = useState('nikolai@oauth-test.local')
  const [password, setPassword] = useState('password123')
  const [confirm, setConfirm] = useState('password123')
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
    <KeyboardAvoidingView className="flex-1 bg-[#eef2f0]" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled" className="px-6">
        <View className="mb-6 flex-row items-center gap-3">
          <BrandMark size={44} />
          <View>
            <Text className="text-2xl font-bold text-neutral-900">Create an account</Text>
            <Text className="text-sm text-neutral-500">Email and password, no provider needed</Text>
          </View>
        </View>

        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}
          <Field placeholder="Name" value={name} onChangeText={setName} />
          <Field placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Field placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Field placeholder="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />
          <PrimaryBtn label="Create account" onPress={handleRegister} loading={isLoading} />
        </View>

        <View className="mt-6 items-center">
          <TouchableOpacity onPress={() => go('login')} accessibilityRole="button">
            <Text className="text-xs text-neutral-500">
              Already registered? <Text className="font-medium text-neutral-800">Sign in</Text>
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
  const { replace } = useNav()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    replace('login')
  }

  return (
    <View className="flex-1 bg-[#eef2f0]">
      <View className="flex-row items-center justify-between border-b border-neutral-200 bg-white px-5 py-4">
        <View className="flex-row items-center gap-3">
          <BrandMark size={32} />
          <View>
            <Text className="text-base font-semibold text-neutral-900">{user?.name ?? 'Signed in'}</Text>
            <Text className="text-xs text-neutral-500">{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Sign out" className="flex-row items-center gap-1.5">
          <LogOut size={15} color="#525252" />
          <Text className="text-xs text-neutral-600">Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="mx-4 mt-4 flex-row items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <ShieldCheck size={22} color="#047857" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-emerald-900">The token reached the store</Text>
            <Text className="mt-1 text-xs leading-5 text-emerald-900">
              This screen sits behind the auth guard. A provider sign-in comes back through the deep link,
              the store saves the token, and fetchMe loads this profile.
            </Text>
          </View>
        </View>

        <ProviderStatus />

        <View className="mx-4 mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <View className="mb-3 flex-row items-center gap-2">
            <KeyRound size={16} color="#171717" />
            <Text className="text-sm font-semibold text-neutral-900">Session user</Text>
          </View>
          <View className="rounded-xl bg-neutral-50 p-4">
            <Text className="font-mono text-xs leading-5 text-neutral-700">{JSON.stringify(user, null, 2)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

/* @arkzen:native:page:dashboard:end */

/* @arkzen:native:components:lynx:shared */

import { useState, useEffect } from '@lynx-js/react'
import { Icon } from '@/arkzen/core/components/Icon'
import { openURL } from '@/arkzen/core/native-bridge'
import { useAuthStore, setActiveTatemono, getOAuthProviders, oauthLoginUrl, completeOAuthFromUrl, consumeOAuthError } from '@/arkzen/core/stores/authStore'

setActiveTatemono('oauth-test')

interface LynxProvider {
  id:    string
  label: string
  fa:    string
  color: string
}

const LYNX_PROVIDERS: LynxProvider[] = [
  { id: 'google',    label: 'Google',      fa: 'google',    color: '#4285F4' },
  { id: 'github',    label: 'GitHub',      fa: 'github',    color: '#181717' },
  { id: 'twitter',   label: 'X (Twitter)', fa: 'x-twitter', color: '#111111' },
  { id: 'apple',     label: 'Apple',       fa: 'apple',     color: '#111111' },
  { id: 'microsoft', label: 'Microsoft',   fa: 'microsoft', color: '#0078D4' },
  { id: 'facebook',  label: 'Facebook',    fa: 'facebook',  color: '#1877F2' },
  { id: 'instagram', label: 'Instagram',   fa: 'instagram', color: '#E4405F' },
  { id: 'discord',   label: 'Discord',     fa: 'discord',   color: '#5865F2' },
]

const useLynxProviders = () => {
  const [enabled, setEnabled] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    setLoading(true)
    const list = await getOAuthProviders()
    setEnabled(Array.isArray(list) ? list : [])
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  return { enabled, loading, reload }
}

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
    className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    bindinput={e => onInput(e.detail.value)}
    type={secureTextEntry ? 'password' : 'text'}
  />
)

const ErrorBox = ({ message }: { message: string }) => (
  <view className="flex-row items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
    <Icon set="lucide" name="triangle-alert" size={16} color="#b91c1c" />
    <text className="flex-1 text-xs text-red-700">{message}</text>
  </view>
)

const PrimaryBtn = ({ label, onPress, loading = false }: { label: string; onPress: () => void; loading?: boolean }) => (
  <view
    bindtap={loading ? undefined : onPress}
    className={`items-center rounded-2xl py-3.5 ${loading ? 'bg-neutral-300' : 'bg-[#1f3a34]'}`}
  >
    <text className="text-sm font-semibold text-white">{loading ? 'Loading…' : label}</text>
  </view>
)

// Lynx has no built-in browser or deep-link listener. The button opens the sign-in URL
// through the native ArkzenBridge. Paste the final arkzen:// link below to finish.
const LynxProviderButtons = ({ onError }: { onError: (message: string | null) => void }) => {
  const { enabled, loading } = useLynxProviders()
  const [pasted, setPasted] = useState('')
  const [working, setWorking] = useState(false)

  const start = (id: string) => {
    onError(null)
    openURL(oauthLoginUrl(id))
  }

  const finish = async () => {
    setWorking(true)
    onError(null)
    try {
      const ok = await completeOAuthFromUrl(pasted.trim())
      if (!ok) onError(consumeOAuthError() ?? 'That link did not contain a sign-in token.')
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Sign-in failed')
    }
    setWorking(false)
  }

  return (
    <view className="gap-y-2">
      <view className="flex-row flex-wrap" style={{ gap: 8 }}>
        {LYNX_PROVIDERS.map(p => {
          const on = enabled.includes(p.id)
          return (
            <view
              key={p.id}
              bindtap={on && !loading ? () => start(p.id) : undefined}
              className={`flex-row items-center gap-2 rounded-xl border px-3 py-2.5 ${on ? 'border-neutral-200 bg-white' : 'border-dashed border-neutral-200 bg-neutral-50'}`}
              style={{ width: '48%' }}
            >
              <Icon set="fab" name={p.fa} size={16} color={on ? p.color : '#d4d4d4'} />
              <text className={`flex-1 text-sm font-medium ${on ? 'text-neutral-900' : 'text-neutral-400'}`}>{p.label}</text>
            </view>
          )
        })}
      </view>
      <text className="text-xs text-neutral-500">
        {loading
          ? 'Checking which providers the backend has keys for…'
          : `${enabled.length} of ${LYNX_PROVIDERS.length} providers have keys in the backend .env.`}
      </text>

      <view className="mt-2 gap-y-2 rounded-xl bg-white p-3">
        <text className="text-xs font-medium text-neutral-700">Finish by pasting the redirect link</text>
        <Field placeholder="arkzen://oauth/oauth-test/dashboard#arkzen_oauth_token=..." value={pasted} onInput={setPasted} />
        <PrimaryBtn label="Complete sign-in" onPress={finish} loading={working} />
      </view>
    </view>
  )
}

const LynxProviderStatus = () => {
  const { enabled, loading, reload } = useLynxProviders()
  return (
    <view className="mx-4 mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <view className="mb-3 flex-row items-center justify-between">
        <text className="text-sm font-semibold text-neutral-900">Provider status</text>
        <view bindtap={reload}>
          <Icon set="lucide" name="refresh-cw" size={16} color={loading ? '#a3a3a3' : '#525252'} />
        </view>
      </view>
      {LYNX_PROVIDERS.map(p => {
        const on = enabled.includes(p.id)
        return (
          <view key={p.id} className="flex-row items-center gap-3 border-t border-neutral-100 py-2.5">
            <Icon set="fab" name={p.fa} size={16} color={p.color} />
            <text className="flex-1 text-sm text-neutral-800">{p.label}</text>
            <Icon set="lucide" name={on ? 'circle-check' : 'circle-dashed'} size={16} color={on ? '#047857' : '#a3a3a3'} />
            <text className={`text-xs ${on ? 'text-emerald-700' : 'text-neutral-400'}`}>{on ? 'Keys found' : 'No keys'}</text>
          </view>
        )
      })}
    </view>
  )
}

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:login */
/* @arkzen:native:page:layout:guest */

const LoginScreen = () => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('haruka@oauth-test.local')
  const [password, setPassword] = useState('password123')
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
    <scroll-view className="flex-1 bg-[#eef2f0]">
      <view className="flex-1 justify-center px-6 py-12">
        <view className="mb-6 flex-row items-center gap-3">
          <view className="h-11 w-11 items-center justify-center rounded-xl bg-[#1f3a34]">
            <Icon set="lucide" name="key-round" size={22} color="#f4c95d" />
          </view>
          <view>
            <text className="text-2xl font-bold text-neutral-900">OAuth Test</text>
            <text className="text-sm text-neutral-500">Sign in with email or a provider</text>
          </view>
        </view>

        <view className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <LynxProviderButtons onError={setError} />

          <text className="my-1 text-center text-xs uppercase text-neutral-400">or use the seeded account</text>

          <Field placeholder="Email" value={email} onInput={setEmail} />
          <Field placeholder="Password" value={password} onInput={setPassword} secureTextEntry />
          <PrimaryBtn label="Sign in" onPress={handleLogin} loading={isLoading} />
        </view>
      </view>
    </scroll-view>
  )
}

/* @arkzen:native:page:lynx:login:end */

/* @arkzen:native:page:lynx:register */
/* @arkzen:native:page:layout:guest */

const RegisterScreen = () => {
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('Nikolai Volkov')
  const [email, setEmail] = useState('nikolai@oauth-test.local')
  const [password, setPassword] = useState('password123')
  const [confirm, setConfirm] = useState('password123')
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
    <scroll-view className="flex-1 bg-[#eef2f0]">
      <view className="flex-1 justify-center px-6 py-12">
        <view className="mb-6 flex-row items-center gap-3">
          <view className="h-11 w-11 items-center justify-center rounded-xl bg-[#1f3a34]">
            <Icon set="lucide" name="key-round" size={22} color="#f4c95d" />
          </view>
          <view>
            <text className="text-2xl font-bold text-neutral-900">Create an account</text>
            <text className="text-sm text-neutral-500">Email and password, no provider needed</text>
          </view>
        </view>

        <view className="gap-y-3">
          {error && <ErrorBox message={error} />}
          <Field placeholder="Name" value={name} onInput={setName} />
          <Field placeholder="Email" value={email} onInput={setEmail} />
          <Field placeholder="Password" value={password} onInput={setPassword} secureTextEntry />
          <Field placeholder="Confirm password" value={confirm} onInput={setConfirm} secureTextEntry />
          <PrimaryBtn label="Create account" onPress={handleRegister} loading={isLoading} />
        </view>
      </view>
    </scroll-view>
  )
}

/* @arkzen:native:page:lynx:register:end */

/* @arkzen:native:page:lynx:dashboard */
/* @arkzen:native:page:layout:auth */

const DashboardScreen = () => {
  const { user, logout } = useAuthStore()

  return (
    <view className="flex-1 bg-[#eef2f0]">
      <view className="flex-row items-center justify-between border-b border-neutral-200 bg-white px-5 py-4">
        <view className="flex-row items-center gap-3">
          <view className="h-8 w-8 items-center justify-center rounded-lg bg-[#1f3a34]">
            <Icon set="lucide" name="key-round" size={16} color="#f4c95d" />
          </view>
          <view>
            <text className="text-base font-semibold text-neutral-900">{user?.name ?? 'Signed in'}</text>
            <text className="text-xs text-neutral-500">{user?.email}</text>
          </view>
        </view>
        <view className="flex-row items-center gap-1.5" bindtap={() => logout()}>
          <Icon set="lucide" name="log-out" size={15} color="#525252" />
          <text className="text-xs text-neutral-600">Sign out</text>
        </view>
      </view>

      <scroll-view className="flex-1">
        <view className="mx-4 mt-4 flex-row items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <Icon set="lucide" name="shield-check" size={22} color="#047857" />
          <view className="flex-1">
            <text className="text-sm font-semibold text-emerald-900">The token reached the store</text>
            <text className="mt-1 text-xs leading-5 text-emerald-900">
              This screen sits behind the auth guard. The link you pasted carried the token, the store saved it, and fetchMe loaded this profile.
            </text>
          </view>
        </view>

        <LynxProviderStatus />

        <view className="mx-4 mb-8 mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <text className="mb-3 text-sm font-semibold text-neutral-900">Session user</text>
          <view className="rounded-xl bg-neutral-50 p-4">
            <text className="font-mono text-xs leading-5 text-neutral-700">{JSON.stringify(user, null, 2)}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  )
}

/* @arkzen:native:page:lynx:dashboard:end */
