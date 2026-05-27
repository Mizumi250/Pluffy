// ============================================================
// ARKZEN GENERATED SCREEN — church-community/register [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:register instead
// Generated: 2026-05-27T12:27:33.840Z
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

export function RegisterScreen() {
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
        const RegisterPage = () => {
  const { T, mode, toggle } = useTheme()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError('All fields required'); return }
    if (form.password !== form.password_confirmation) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/church-community/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      window.location.href = '/church-community'
    } catch { setError('Registration failed. Try again.') }
    finally { setLoading(false) }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '13px 16px', borderRadius: 14, fontSize: 14, background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.textPrimary, outline: 'none', boxSizing: 'border-box' }

  return (
    <>
      <style>{`@keyframes gc-shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }`}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: T.bgGrad }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: T.purpleGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: T.shadowPurp, fontSize: 22, color: '#fff' }}>✝</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.04em', fontFamily: 'Georgia,serif' }}>
              Join<span style={{ color: T.purple }}>Grace</span>
            </h1>
            <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Create your church account</p>
          </div>
          <div style={{ background: T.surface, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: `1px solid ${T.border}`, padding: '28px 24px', boxShadow: T.shadow }}>
            {error && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} />
              <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} />
              <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inp} />
              <input type="password" placeholder="Confirm Password" value={form.password_confirmation} onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))} style={inp} />
              <button onClick={handleRegister} disabled={loading} style={{ width: '100%', padding: 13, borderRadius: 50, background: T.purpleGrad, color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: T.shadowPurp, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Account'}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted, marginTop: 18 }}>
              Already a member?{' '}
              <a href="/church-community/login" style={{ color: T.purple, fontWeight: 700, textDecoration: 'none' }}>Sign in</a>
            </p>
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

export default RegisterScreen
