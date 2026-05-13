'use client'
// ============================================================
// ARKZEN GENERATED PAGE — body-mail-notification/dashboard
// Layout: auth | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-13T10:27:05.191Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'


// Utilities, types, and helper functions from @arkzen:components
import { useRouter } from 'next/navigation'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

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

// Page component code (from @arkzen:page:dashboard)
const DashboardPage = () => {
  const { user, logout } = useAuthStore()
  const router           = useRouter()
  const { toast, success: toastSuccess, error: toastError } = useToast()

  const [log,     setLog]     = useState<SendLogEntry[]>([])
  const [loading, setLoading] = useState(false)

  // Mail send state
  const [mailKind, setMailKind]   = useState<'welcome' | 'receipt' | 'alert'>('welcome')
  const [mailTo,   setMailTo]     = useState('')
  const [sending,  setSending]    = useState(false)

  // Notification state
  const [notifKind, setNotifKind] = useState<'action-required' | 'summary'>('action-required')
  const [notifMsg,  setNotifMsg]  = useState('')
  const [notifying, setNotifying] = useState(false)

  const loadLog = async () => {
    setLoading(true)
    try {
      const res  = await arkzenFetch('/api/body-mail-notification/log')
      const data = await res.json()
      // Laravel pagination returns { data: [...], meta: {...} }
      const items = Array.isArray(data) ? data : (data?.data ?? [])
      setLog(items)
    } catch { toastError('Failed to load log') }
    setLoading(false)
  }

  useEffect(() => { loadLog() }, [])

  const sendMail = async () => {
    if (!mailTo) { toastError('Enter a recipient email'); return }
    setSending(true)
    try {
      const res = await arkzenFetch('/api/body-mail-notification/send-mail', {
        method: 'POST',
        body: JSON.stringify({ mail: mailKind, to: mailTo }),
      })
      if (res.ok) { toastSuccess(`${mailKind} mail sent`); loadLog() }
      else        { const e = await res.json(); toastError(e.message ?? 'Mail failed') }
    } catch { toastError('Mail request failed') }
    setSending(false)
  }

  const sendNotif = async () => {
    setNotifying(true)
    try {
      const res = await arkzenFetch('/api/body-mail-notification/notify', {
        method: 'POST',
        body: JSON.stringify({ notification: notifKind, message: notifMsg || undefined }),
      })
      if (res.ok) { toastSuccess(`${notifKind} notification sent`); loadLog() }
      else        { const e = await res.json(); toastError(e.message ?? 'Notification failed') }
    } catch { toastError('Notification request failed') }
    setNotifying(false)
  }

  const clearLog = async () => {
    try {
      await arkzenFetch('/api/body-mail-notification/log/clear', { method: 'DELETE' })
      toastSuccess('Log cleared')
      setLog([])
    } catch { toastError('Clear failed') }
  }

  const handleLogout = async () => { await logout(); router.push('/body-mail-notification') }

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 14, padding: 28,
    boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20,
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8,
    padding: '9px 12px', fontSize: 13, boxSizing: 'border-box',
  }
  const selectStyle: React.CSSProperties = { ...inputStyle }
  const btn = (color = '#0f172a'): React.CSSProperties => ({
    background: color, color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>{toast.msg}</div>}
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Body Injection Dashboard</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              MailBuilder <code>blade_body</code> · NotificationBuilder <code>toMail_body</code>
            </p>
          </div>
          <button onClick={handleLogout} style={{ ...btn('#64748b'), fontSize: 12 }}>Logout</button>
        </div>

        {/* Send Mail */}
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: 4 }}>
            ✉ Send Mail <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>blade_body injection</span>
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Each mail has a custom Blade HTML view injected via <code>blade_body</code> in the DSL block. Verifies MailBuilder v3.1 generates views from body instead of stub.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Mail Type</label>
              <select value={mailKind} onChange={e => setMailKind(e.target.value as any)} style={selectStyle}>
                <option value="welcome">welcome — onboarding HTML</option>
                <option value="receipt">receipt — table layout HTML</option>
                <option value="alert">alert — CTA button HTML</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Recipient Email</label>
              <input value={mailTo} onChange={e => setMailTo(e.target.value)} placeholder="you@example.com" style={inputStyle} />
            </div>
          </div>
          <button onClick={sendMail} disabled={sending} style={btn()}>
            {sending ? 'Sending…' : 'Send Mail'}
          </button>
        </div>

        {/* Send Notification */}
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: 4 }}>
            🔔 Send Notification <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>toMail_body injection</span>
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Both notifications have a custom <code>toMail()</code> body injected via the DSL block. Verifies NotificationBuilder v3.9 uses the body instead of the stub.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Notification Type</label>
              <select value={notifKind} onChange={e => setNotifKind(e.target.value as any)} style={selectStyle}>
                <option value="action-required">action-required</option>
                <option value="summary">summary</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Custom Message (optional)</label>
              <input value={notifMsg} onChange={e => setNotifMsg(e.target.value)} placeholder="Override default message…" style={inputStyle} />
            </div>
          </div>
          <button onClick={sendNotif} disabled={notifying} style={btn('#7c3aed')}>
            {notifying ? 'Sending…' : 'Send Notification'}
          </button>
        </div>

        {/* Log */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Send Log</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={loadLog} style={{ ...btn('#0ea5e9'), padding: '7px 14px', fontSize: 12 }}>Refresh</button>
              <button onClick={clearLog} style={{ ...btn('#ef4444'), padding: '7px 14px', fontSize: 12 }}>Clear</button>
            </div>
          </div>
          {loading ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading…</p>
          ) : log.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No entries yet — send a mail or notification above.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {log.map(entry => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
                  <KindBadge kind={entry.kind} />
                  <span style={{ fontWeight: 600, color: '#0f172a', flex: 1 }}>{entry.subject ?? '—'}</span>
                  <span style={{ color: '#64748b' }}>{entry.to_email ?? '—'}</span>
                  <span><StatusDot status={entry.status} />{entry.status}</span>
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>{new Date(entry.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_BodyMailNotification_Dashboard = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <AuthLayout requireAuth={true}>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <DashboardPage />
      </motion.div>
    </AuthLayout>
  )
}

export default ArkzenPage_BodyMailNotification_Dashboard
