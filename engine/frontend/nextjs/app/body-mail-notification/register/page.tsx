'use client'
// ============================================================
// ARKZEN GENERATED PAGE — body-mail-notification/register
// Layout: guest | Auth guard: false | Guest-only: true
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:50.646Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { KindBadge } from '../components/KindBadge'
import { StatusDot } from '../components/StatusDot'
import { useToast } from '../components/hooks'
import { useRouter } from 'next/navigation'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

// Page component code (from @arkzen:page:register)
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

// Wrapper for animation + layout
const ArkzenPage_BodyMailNotification_Register = () => {
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
        <RegisterPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_BodyMailNotification_Register
