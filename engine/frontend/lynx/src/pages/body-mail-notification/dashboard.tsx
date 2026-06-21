// ARKZEN GENERATED — body-mail-notification/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T12:05:05.764Z
import { Field } from './components/Field'
import { KindBadge } from './components/KindBadge'
import { PrimaryBtn } from './components/PrimaryBtn'
import { StatusDot } from './components/StatusDot'
import type { SendLogEntry } from './components/types'
import { arkzenFetch, useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:auth */

import { useState, useEffect, useCallback } from '@lynx-js/react'

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
    <view className="min-h-screen bg-neutral-50">

      {/* Toast */}
      {toast && (
        <view className={`fixed top-5 right-5 z-50 text-white text-sm rounded-2xl px-5 py-3 shadow-xl ${
          toast.type === 'success' ? 'bg-neutral-900' : 'bg-red-500'
        }`}>
          <text>{toast.msg}</text>
        </view>
      )}

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <view>
          <text className="text-base font-semibold text-neutral-900">✉ Body Injection Test</text>
          <text className="text-xs text-neutral-400 mt-0.5">{user?.email}</text>
        </view>
        <view bindtap={handleLogout} className="text-xs text-neutral-400">
          <text className="text-xs text-neutral-400">Sign out</text>
        </view>
      </view>

      <view className="max-w-2xl mx-auto p-6" style={{ gap: 24 }}>

        {/* ── Send Mail ─────────────────────────────────── */}
        <view>
          <text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Send Mail · blade_body injection
          </text>

          {/* Mail type picker */}
          <view style={{ gap: 8 }} className="mb-3">
            {mailTypes.map(({ key, label, desc }) => (
              <view
                key={key}
                bindtap={() => setMailKind(key)}
                className={`bg-white rounded-2xl border p-4 flex-row items-center justify-between ${
                  mailKind === key ? 'border-neutral-900' : 'border-neutral-100'
                }`}
              >
                <view className="flex-1 mr-3">
                  <text className="text-sm font-semibold text-neutral-900">{label}</text>
                  <text className="text-xs text-neutral-400 mt-0.5">{desc}</text>
                </view>
                <view className={`w-4 h-4 rounded-full border-2 items-center justify-center ${
                  mailKind === key ? 'border-neutral-900' : 'border-neutral-300'
                }`}>
                  {mailKind === key && <view className="w-2 h-2 rounded-full bg-neutral-900" />}
                </view>
              </view>
            ))}
          </view>

          <Field
            placeholder="Recipient email"
            value={mailTo}
            onChangeText={setMailTo}
            type="email"
          />
          <view className="mt-2">
            <PrimaryBtn label={sending ? 'Sending…' : 'Send Mail'} onPress={sendMail} loading={sending} />
          </view>
        </view>

        {/* ── Send Notification ─────────────────────────── */}
        <view>
          <text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Send Notification · toMail_body injection
          </text>

          {/* Notif type picker */}
          <view style={{ gap: 8 }} className="mb-3">
            {notifTypes.map(({ key, label, desc }) => (
              <view
                key={key}
                bindtap={() => setNotifKind(key)}
                className={`bg-white rounded-2xl border p-4 flex-row items-center justify-between ${
                  notifKind === key ? 'border-violet-600' : 'border-neutral-100'
                }`}
              >
                <view className="flex-1 mr-3">
                  <text className="text-sm font-semibold text-neutral-900">{label}</text>
                  <text className="text-xs text-neutral-400 mt-0.5">{desc}</text>
                </view>
                <view className={`w-4 h-4 rounded-full border-2 items-center justify-center ${
                  notifKind === key ? 'border-violet-600' : 'border-neutral-300'
                }`}>
                  {notifKind === key && <view className="w-2 h-2 rounded-full bg-violet-600" />}
                </view>
              </view>
            ))}
          </view>

          <Field
            placeholder="Custom message (optional)"
            value={notifMsg}
            onChangeText={setNotifMsg}
          />
          <view className="mt-2">
            <PrimaryBtn
              label={notifying ? 'Sending…' : 'Send Notification'}
              onPress={sendNotif}
              loading={notifying}
              className="bg-violet-600"
            />
          </view>
        </view>

        {/* ── Send Log ──────────────────────────────────── */}
        <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <view className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <text className="font-semibold text-sm text-neutral-900">Send Log</text>
            <view className="flex-row items-center" style={{ gap: 16 }}>
              <text
                className="text-xs text-neutral-400"
                bindtap={loading ? undefined : loadLog}
              >
                {loading ? 'Loading…' : 'Refresh'}
              </text>
              <text
                className="text-xs text-red-400"
                bindtap={clearLog}
              >
                Clear
              </text>
            </view>
          </view>

          {log.length === 0 ? (
            <view className="p-10 items-center">
              <text className="text-sm text-neutral-400">
                {loading ? 'Loading…' : 'No entries yet — send a mail or notification above.'}
              </text>
            </view>
          ) : (
            <view className="divide-y divide-neutral-50">
              {log.map(entry => (
                <view key={entry.id} className="px-5 py-3 flex-row items-center" style={{ gap: 12 }}>
                  <KindBadge kind={entry.kind} />
                  <view className="flex-1 min-w-0">
                    <text className="text-sm font-semibold text-neutral-900">
                      {entry.subject ?? '—'}
                    </text>
                    <text className="text-xs text-neutral-400 mt-0.5">
                      {entry.to_email ?? '—'}
                    </text>
                  </view>
                  <view className="flex-row items-center">
                    <StatusDot status={entry.status} />
                    <text className="text-xs text-neutral-500">{entry.status}</text>
                  </view>
                </view>
              ))}
            </view>
          )}
        </view>

        {/* Info note */}
        <view className="bg-neutral-100 rounded-2xl px-4 py-3">
          <text className="text-xs text-neutral-500 font-semibold mb-1">What's being tested</text>
          <text className="text-xs text-neutral-500 leading-5">
            ✉️ blade_body — MailBuilder v3.1 generates Blade views from DSL HTML{'\n'}
            🔔 toMail_body — NotificationBuilder v3.9 injects custom MailMessage chain{'\n'}
            📋 send_log — every dispatch logged to DB with status + error
          </text>
        </view>

      </view>
    </view>
  )
}

export const BodyMailNotificationDashboard = DashboardLynxPage;
