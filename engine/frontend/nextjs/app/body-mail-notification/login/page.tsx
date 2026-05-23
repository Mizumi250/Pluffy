'use client'
// ============================================================
// ARKZEN GENERATED PAGE — body-mail-notification/login
// Layout: guest | Auth guard: false | Guest-only: true
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T08:36:24.076Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { useRouter } from 'next/navigation'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Utilities, types, and helper functions from @arkzen:components
function useToast() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const show = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }, [])
  return {
    toast,
    success: (msg: string) => show('success', msg),
    error:   (msg: string) => show('error', msg),
  }
}

if (typeof window !== 'undefined') {
  setActiveTatemono('body-mail-notification')
}

type SendLogEntry = {
  id:         number
  kind:       'mail' | 'notification'
  subject:    string | null
  to_email:   string | null
  mail_class: string | null
  status:     'sent' | 'failed'
  error:      string | null
  created_at: string
}

const KindBadge = ({ kind }: { kind: string }) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: kind === 'mail' ? '#dbeafe' : '#fef9c3',
    color:      kind === 'mail' ? '#1d4ed8' : '#a16207',
    letterSpacing: 0.5,
  }}>
    {kind === 'mail' ? '✉ MAIL' : '🔔 NOTIF'}
  </span>
)

const StatusDot = ({ status }: { status: string }) => (
  <span style={{
    display: 'inline-block',
    width: 8, height: 8,
    borderRadius: '50%',
    background: status === 'sent' ? '#22c55e' : '#ef4444',
    marginRight: 6,
    verticalAlign: 'middle',
  }} />
)

// Page component code (from @arkzen:page:login)
const LoginPage = () => {
  const { login }  = useAuthStore()
  const router     = useRouter()
  const { toast, success: toastSuccess, error: toastError } = useToast()
  const [email, setEmail]       = useState('test@body-mail-notification.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await login(email, password)
      toastSuccess('Logged in')
      router.push('/body-mail-notification/dashboard')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>{toast.msg}</div>}
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Body Injection Test</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>MailBuilder blade_body · NotificationBuilder toMail_body</p>
        <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
        <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 14, marginBottom: 20, boxSizing: 'border-box' }} />
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_BodyMailNotification_Login = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <GuestLayout guestOnly={true}>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <LoginPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_BodyMailNotification_Login
