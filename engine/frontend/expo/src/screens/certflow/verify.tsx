// ============================================================
// ARKZEN GENERATED SCREEN — certflow/verify [Expo]
// Layout: app | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:verify instead
// Generated: 2026-05-25T08:28:09.675Z
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
// No layout wrapper — blank screen

export function VerifyScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const VerifyPage = () => {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const [data, setData]     = useState<{ submission: Submission; template: Template; form_data: Record<string, string> } | null>(null)

  useEffect(() => {
    const parts = window.location.pathname.split('/')
    const t = parts[parts.length - 1]
    fetch(`/api/certflow/verify/${t}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setStatus('valid') })
      .catch(() => setStatus('invalid'))
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eaf3fa 0%, #f5e8fe 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px',
      color: '#0f172a',
    }}>
      {status === 'loading' && (
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1' }} />
        </motion.div>
      )}

      {status === 'invalid' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Invalid Certificate</h1>
          <p style={{ color: '#64748b' }}>This QR code is not valid or the certificate was revoked.</p>
        </div>
      )}

      {status === 'valid' && data && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 480, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.9)', padding: '36px 32px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px' }}>✅</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Verified Certificate</h1>
            <p style={{ color: '#64748b', fontSize: 13 }}>{data.template?.name}</p>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px 20px' }}>
            {Object.entries(data.form_data ?? {}).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', minWidth: 120, textTransform: 'uppercase', letterSpacing: 0.5, paddingTop: 2 }}>{k}</span>
                <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, fontSize: 11, color: '#94a3b8', textAlign: 'center', fontFamily: 'monospace' }}>
            {data.submission?.submission_token?.slice(0, 32)}…
          </div>
        </motion.div>
      )}
    </div>
  )
}
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default VerifyScreen
