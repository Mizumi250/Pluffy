// ============================================================
// ARKZEN GENERATED SCREEN — certflow/login [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:login instead
// Generated: 2026-05-27T12:27:33.169Z
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
      <GuestLayout tatSlug="certflow" dashboardRoute="/certflow/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const LoginPage = () => {
  const { login, isLoading } = useAuthStore()
  const router = useRouter()
  const { push: toast } = useToastStore()
  const [email, setEmail]       = useState('admin@certflow.com')
  const [password, setPassword] = useState('certflow123')
  const [error, setError]       = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    FONT_OPTIONS.slice(0, 3).forEach(loadGoogleFont)
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 32, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' })
    }
    if (logoRef.current) {
      gsap.fromTo(logoRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 })
    }
  }, [])

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
      toast('Welcome back!', 'ok')
      router.push('/certflow/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eaf3fa 0%, #f5e8fe 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <ToastStack />

      {/* Logo */}
      <div ref={logoRef} style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}>
          <GraduationCap size={28} color="#6366f1" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5, margin: 0 }}>CertFlow</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Admin Portal</p>
      </div>

      {/* Card */}
      <div ref={cardRef} style={{
        width: '100%',
        maxWidth: 400,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        padding: '36px 32px',
      }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', margin: '0 0 22px' }}>Sign in</h2>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <XCircle size={14} />
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Email</label>
          <input
            style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.border = '1px solid #6366f1' }}
            onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.border = '1px solid #e2e8f0' }}
          />
        </div>

        <div style={{ marginBottom: 26 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Password</label>
          <input
            style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.border = '1px solid #6366f1' }}
            onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.border = '1px solid #e2e8f0' }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            transition: 'opacity 0.2s',
          }}
        >
          {isLoading ? 'Signing in…' : 'Sign in →'}
        </motion.button>

        <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 18, fontFamily: 'monospace' }}>
          admin@certflow.com · certflow123
        </p>
      </div>
    </div>
  )
}
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default LoginScreen
