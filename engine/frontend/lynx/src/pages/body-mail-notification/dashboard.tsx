// ARKZEN GENERATED — body-mail-notification/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:49.124Z
import { Field } from './components/Field'
import { KindBadge } from './components/KindBadge'
import { PrimaryBtn } from './components/PrimaryBtn'
import { StatusDot } from './components/StatusDot'
import type { SendLogEntry } from './components/types'

/* @arkzen:native:page:layout:auth */

import { useState, useEffect, useCallback } from '@lynx-js/react'
import { useAuthStore, arkzenFetch } from '@/arkzen/core/stores/authStore'

const DashboardLynxPage = () => {
  const { user, logout } = useAuthStore()

  const [log,       setLog]       = useState<SendLogEntry[]>([])
  const [loading,   setLoading]   = useState(false)
  const [toast,     setToast]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Mail send state
  const [mailKind,  setMailKind]  = useState<'welcome' | 'receipt' | 'alert'>('welcome')
  const [mailTo,    setMailTo]    = useState('')
  const [sending,   setSending]   = useState(false)

  // Notification state
  const [notifKind, setNotifKind] = useState<'action-required' | 'summary'>('action-required')
  const [notifMsg,  setNotifMsg]  = useState('')
  const [notifying, setNotifying] = useState(false)

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const loadLog = async () => {
    setLoading(true)
    try {
      const res  = await arkzenFetch('/api/body-mail-notification/log')
      const data = await res.json()
      setLog(Array.isArray(data) ? data : (data?.data ?? []))
    } catch {
      showToast('error', 'Failed to load log')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLog() }, [])

  const sendMail = async () => {
    if (!mailTo) { showToast('error', 'Enter a recipient email'); return }
    setSending(true)
    try {
      const res = await arkzenFetch('/api/body-mail-notification/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: mailKind, to: mailTo }),
      })
      if (res.ok) { showToast('success', `${mailKind} mail sent`); loadLog() }
      else        { const e = await res.json(); showToast('error', e.message ?? 'Mail failed') }
    } catch {
      showToast('error', 'Mail request failed')
    } finally {
      setSending(false)
    }
  }

  const sendNotif = async () => {
    setNotifying(true)
    try {
      const res = await arkzenFetch('/api/body-mail-notification/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification: notifKind, message: notifMsg || undefined }),
      })
      if (res.ok) { showToast('success', `${notifKind} notification sent`); loadLog() }
      else        { const e = await res.json(); showToast('error', e.message ?? 'Notification failed') }
    } catch {
      showToast('error', 'Notification request failed')
    } finally {
      setNotifying(false)
    }
  }

  const clearLog = async () => {
    try {
      await arkzenFetch('/api/body-mail-notification/log/clear', { method: 'DELETE' })
      showToast('success', 'Log cleared')
      setLog([])
    } catch {
      showToast('error', 'Clear failed')
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/body-mail-notification/login'
  }

  const mailTypes = [
    { key: 'welcome' as const, label: 'Welcome',  desc: 'Onboarding HTML via blade_body'     },
    { key: 'receipt' as const, label: 'Receipt',  desc: 'Table layout HTML via blade_body'   },
    { key: 'alert'   as const, label: 'Alert',    desc: 'CTA button HTML via blade_body'     },
  ]

  const notifTypes = [
    { key: 'action-required' as const, label: 'Action Required', desc: 'Custom toMail() chain via DSL body' },
    { key: 'summary'         as const, label: 'Summary',         desc: 'Activity summary via DSL body'      },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 text-white text-sm rounded-2xl px-5 py-3 shadow-xl ${
          toast.type === 'success' ? 'bg-neutral-900' : 'bg-red-500'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-neutral-900">✉ Body Injection Test</h1>
          <p className="text-xs text-neutral-400 mt-0.5">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-neutral-400 hover:text-neutral-700"
        >
          Sign out
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* ── Send Mail ─────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Send Mail · blade_body injection
          </p>

          {/* Mail type picker */}
          <div className="space-y-2 mb-3">
            {mailTypes.map(({ key, label, desc }) => (
              <div
                key={key}
                onClick={() => setMailKind(key)}
                className={`bg-white rounded-2xl border p-4 flex items-center justify-between cursor-pointer ${
                  mailKind === key ? 'border-neutral-900' : 'border-neutral-100'
                }`}
              >
                <div className="flex-1 mr-3">
                  <p className="text-sm font-semibold text-neutral-900">{label}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  mailKind === key ? 'border-neutral-900' : 'border-neutral-300'
                }`}>
                  {mailKind === key && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
                </div>
              </div>
            ))}
          </div>

          <Field
            placeholder="Recipient email"
            value={mailTo}
            onChangeText={setMailTo}
            type="email"
          />
          <div className="mt-2">
            <PrimaryBtn label={sending ? 'Sending…' : 'Send Mail'} onPress={sendMail} loading={sending} />
          </div>
        </div>

        {/* ── Send Notification ─────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Send Notification · toMail_body injection
          </p>

          {/* Notif type picker */}
          <div className="space-y-2 mb-3">
            {notifTypes.map(({ key, label, desc }) => (
              <div
                key={key}
                onClick={() => setNotifKind(key)}
                className={`bg-white rounded-2xl border p-4 flex items-center justify-between cursor-pointer ${
                  notifKind === key ? 'border-violet-600' : 'border-neutral-100'
                }`}
              >
                <div className="flex-1 mr-3">
                  <p className="text-sm font-semibold text-neutral-900">{label}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  notifKind === key ? 'border-violet-600' : 'border-neutral-300'
                }`}>
                  {notifKind === key && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                </div>
              </div>
            ))}
          </div>

          <Field
            placeholder="Custom message (optional)"
            value={notifMsg}
            onChangeText={setNotifMsg}
          />
          <div className="mt-2">
            <PrimaryBtn
              label={notifying ? 'Sending…' : 'Send Notification'}
              onPress={sendNotif}
              loading={notifying}
              className="bg-violet-600"
            />
          </div>
        </div>

        {/* ── Send Log ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-neutral-900">Send Log</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={loadLog}
                className="text-xs text-neutral-400 hover:text-neutral-700"
              >
                {loading ? 'Loading…' : 'Refresh'}
              </button>
              <button
                onClick={clearLog}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Clear
              </button>
            </div>
          </div>

          {log.length === 0 ? (
            <div className="p-10 text-center text-sm text-neutral-400">
              {loading ? 'Loading…' : 'No entries yet — send a mail or notification above.'}
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {log.map(entry => (
                <div key={entry.id} className="px-5 py-3 flex items-center gap-3">
                  <KindBadge kind={entry.kind} />
                  <span className="flex-1 text-sm font-semibold text-neutral-900 truncate">
                    {entry.subject ?? '—'}
                  </span>
                  <span className="text-xs text-neutral-400 truncate">{entry.to_email ?? '—'}</span>
                  <span className="flex items-center text-xs text-neutral-500">
                    <StatusDot status={entry.status} />
                    {entry.status}
                  </span>
                  <span className="text-xs text-neutral-300">
                    {entry.created_at?.slice(11, 19)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="bg-neutral-100 rounded-2xl px-4 py-3">
          <p className="text-xs text-neutral-500 font-semibold mb-1">What's being tested</p>
          <p className="text-xs text-neutral-500 leading-5">
            ✉️ blade_body — MailBuilder v3.1 generates Blade views from DSL HTML{'\n'}
            🔔 toMail_body — NotificationBuilder v3.9 injects custom MailMessage chain{'\n'}
            📋 send_log — every dispatch logged to DB with status + error
          </p>
        </div>

      </div>
    </div>
  )
}
