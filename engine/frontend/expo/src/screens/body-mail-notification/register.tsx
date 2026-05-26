// ============================================================
// ARKZEN GENERATED SCREEN — body-mail-notification/register [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:register instead
// Generated: 2026-05-26T09:29:46.203Z
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
      <GuestLayout tatSlug="body-mail-notification" dashboardRoute="/body-mail-notification/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const RegisterPage = () => {
  const { register } = useAuthStore()
  const router       = useRouter()
  const { toast, success: toastSuccess, error: toastError } = useToast()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    try {
      await register(name, email, password, password)
      toastSuccess('Account created')
      router.push('/body-mail-notification/dashboard')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>{toast.msg}</div>}
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Create Account</h1>
        {[['Name', name, setName, 'text'], ['Email', email, setEmail, 'email'], ['Password', password, setPassword, 'password']].map(([label, val, setter, type]: any) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
            <input type={type} value={val} onChange={e => setter(e.target.value)} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        ))}
        <button onClick={handleRegister} disabled={loading} style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
          {loading ? 'Creating…' : 'Register'}
        </button>
      </div>
    </div>
  )
}
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default RegisterScreen
