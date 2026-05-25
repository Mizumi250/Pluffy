// ============================================================
// ARKZEN GENERATED SCREEN — church-community/login [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:login instead
// Generated: 2026-05-25T07:15:04.030Z
// ============================================================

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GuestLayout } from '@/layouts/GuestLayout'

export function LoginScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="church-community" dashboardRoute="/church-community/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const LoginPage = () => {
  const { T, mode, toggle } = useTheme()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('All fields required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/church-community/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      window.location.href = '/church-community'
    } catch { setError('Invalid credentials') }
    finally { setLoading(false) }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '13px 16px', borderRadius: 14, fontSize: 14, background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.textPrimary, outline: 'none', boxSizing: 'border-box' }

  return (
    <>
      <style>{`@keyframes gc-shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }`}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: T.bgGrad, transition: 'background 0.35s' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: T.purpleGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: T.shadowPurp, fontSize: 22, color: '#fff' }}>✝</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.04em', fontFamily: 'Georgia,serif' }}>
              Grace<span style={{ color: T.purple }}>Community</span>
            </h1>
            <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Sign in to your account</p>
          </div>
          <div style={{ background: T.surface, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: `1px solid ${T.border}`, padding: '28px 24px', boxShadow: T.shadow }}>
            {error && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} />
              <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inp} />
              <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 13, borderRadius: 50, background: T.purpleGrad, color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: T.shadowPurp, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted, marginTop: 18 }}>
              Don't have an account?{' '}
              <a href="/church-community/register" style={{ color: T.purple, fontWeight: 700, textDecoration: 'none' }}>Register</a>
            </p>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {mode === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default LoginScreen
