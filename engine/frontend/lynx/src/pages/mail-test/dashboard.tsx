// ARKZEN GENERATED — mail-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T03:18:59.187Z
import { Field } from './components/Field'
import { BACKEND_URL } from './components/constants'
import type { MailLog, MailType } from './components/types'
import { useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { Icon } from '../../../arkzen/core/components/Icon'

/* @arkzen:native:page:layout:auth */

const DashboardScreen = () => {
  const { user, logout } = useAuthStore()

  const mailTypes: MailType[] = [
    {
      key:    'welcome-mail',
      label:  'Welcome Mail',
      desc:   'Onboarding email with username and app name',
      fields: { username: user?.name ?? 'User', app_name: 'Arkzen' },
    },
    {
      key:    'order-confirmation',
      label:  'Order Confirmation',
      desc:   'Transactional receipt with order details',
      fields: { order_id: 'ORD-1234', total: '$99.00', customer_name: user?.name ?? 'Customer' },
    },
    {
      key:    'password-reset',
      label:  'Password Reset',
      desc:   'Security email with reset link and expiry',
      fields: { reset_link: 'https://example.com/reset/fake-token', expires_in: '60 minutes' },
    },
  ]

  const [toEmail,     setToEmail]     = useState(user?.email ?? '')
  const [sending,     setSending]     = useState<string | null>(null)
  const [logs,        setLogs]        = useState<MailLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [toast,       setToast]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const res   = await arkzenFetch(`${BACKEND_URL}/api/mail-test/logs`)
      const d     = await res.json()
      const items = Array.isArray(d) ? d : (d?.data ?? [])
      setLogs(items)
    } catch {}
    finally { setLoadingLogs(false) }
  }

  useEffect(() => { loadLogs() }, [])

  const send = async (mailKey: string, fields: Record<string, string>) => {
    if (!toEmail) { showToast('error', 'Enter a recipient email first'); return }
    setSending(mailKey)
    try {
      const res = await arkzenFetch(`${BACKEND_URL}/api/mail-test/send`, {
        method: 'POST',
        body:   JSON.stringify({ mail: mailKey, to: toEmail, data: fields }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.message ?? 'Failed to send')
      showToast('success', 'Mail queued — check your inbox')
      setTimeout(loadLogs, 2500)
    } catch (e) {
      showToast('error', e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(null)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    catch { return ts }
  }

  return (
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <view className="flex-row items-center gap-3">
          <view className="w-9 h-9 bg-neutral-900 rounded-xl items-center justify-center">
            <Icon set="fas" name="envelope" size={16} color="#fff" />
          </view>
          <view>
            <text className="text-base font-semibold text-neutral-900">Mail Test</text>
            <text className="text-xs text-neutral-400 mt-0.5">{user?.email}</text>
          </view>
        </view>
        <view bindtap={handleLogout} className="flex-row items-center gap-1">
          <Icon set="fas" name="right-from-bracket" size={13} color="#a3a3a3" />
          <text className="text-xs text-neutral-400">Sign out</text>
        </view>
      </view>

      <scroll-view className="flex-1 p-4 gap-y-3">

        {/* Toast */}
        {toast && (
          <view className={`flex-row items-center gap-2 px-4 py-3 rounded-2xl border ${
            toast.type === 'success'
              ? 'bg-white border-emerald-200'
              : 'bg-white border-red-200'
          }`}>
            {toast.type === 'success'
              ? <Icon set="fas" name="circle-check" size={15} color="#10b981" />
              : <Icon set="fas" name="circle-xmark" size={15} color="#ef4444" />
            }
            <text className={`text-sm font-medium flex-1 ${
              toast.type === 'success' ? 'text-emerald-700' : 'text-red-600'
            }`}>
              {toast.msg}
            </text>
          </view>
        )}

        {/* Recipient */}
        <view className="bg-white rounded-2xl border border-neutral-100 p-4">
          <text className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Recipient
          </text>
          <Field
            placeholder="recipient@example.com"
            onChangeText={setToEmail}
            keyboardType="email-address"
          />
          <text className="text-xs text-neutral-400 mt-2">
            Use Mailtrap or a real address. Configure MAIL_* in .env
          </text>
        </view>

        {/* Mailables */}
        <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <view className="px-5 py-3.5 border-b border-neutral-100">
            <text className="text-sm font-semibold text-neutral-900">Mailables</text>
            <text className="text-xs text-neutral-400 mt-0.5">3 templates registered via @arkzen:mail</text>
          </view>
          {mailTypes.map((m, i) => (
            <view
              key={m.key}
              className={`px-5 py-4 flex-row items-center justify-between gap-3 ${
                i < mailTypes.length - 1 ? 'border-b border-neutral-50' : ''
              }`}
            >
              <view className="flex-1 min-w-0">
                <text className="text-sm font-medium text-neutral-800">{m.label}</text>
                <text className="text-xs text-neutral-400 mt-0.5">{m.desc}</text>
                <text className="text-xs font-mono text-neutral-300 mt-1">{m.key}</text>
              </view>
              <view
                bindtap={!!sending || !toEmail ? undefined : () => send(m.key, m.fields)}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${
                  !!sending || !toEmail ? 'bg-neutral-200' : 'bg-neutral-900'
                }`}
              >
                {sending === m.key
                  ? <text className="text-white text-xs">…</text>
                  : <Icon set="fas" name="paper-plane" size={11} color="#fff" />
                }
                <text className="text-white text-xs font-medium">
                  {sending === m.key ? 'Sending' : 'Send'}
                </text>
              </view>
            </view>
          ))}
        </view>

        {/* Send Log */}
        <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <view className="px-5 py-3.5 border-b border-neutral-100 flex-row items-center justify-between">
            <view>
              <text className="text-sm font-semibold text-neutral-900">Send log</text>
              <text className="text-xs text-neutral-400 mt-0.5">{logs.length} entries</text>
            </view>
            <view
              bindtap={loadingLogs ? undefined : loadLogs}
              className="p-1.5 rounded-lg"
            >
              {loadingLogs
                ? <text className="text-xs text-neutral-400">…</text>
                : <Icon set="fas" name="arrows-rotate" size={14} color="#a3a3a3" />
              }
            </view>
          </view>

          {logs.length === 0 ? (
            <view className="py-12 items-center">
              <Icon set="fas" name="envelope" size={28} color="#e5e5e5" />
              <text className="text-sm text-neutral-400 mt-3">No mail sent yet</text>
              <text className="text-xs text-neutral-300 mt-1">Send a mail above to see logs here</text>
            </view>
          ) : (
            logs.map((l, i) => (
              <view
                key={l.id}
                className={`px-5 py-3.5 flex-row items-start justify-between gap-3 ${
                  i < logs.length - 1 ? 'border-b border-neutral-50' : ''
                }`}
              >
                <view className="flex-1 min-w-0">
                  <text className="text-sm font-medium text-neutral-800">
                    {l.mail_class}
                  </text>
                  <text className="text-xs text-neutral-400 mt-0.5">
                    To: {l.to_email}
                  </text>
                  {l.error && (
                    <text className="text-xs text-red-500 mt-0.5">{l.error}</text>
                  )}
                </view>
                <view className="items-end gap-1">
                  <view className={`px-2 py-0.5 rounded-full ${
                    l.status === 'sent' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}>
                    <text className={`text-xs font-medium ${
                      l.status === 'sent' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {l.status}
                    </text>
                  </view>
                  <view className="flex-row items-center gap-1">
                    <Icon set="fas" name="clock" size={10} color="#d4d4d4" />
                    <text className="text-xs text-neutral-300">{formatTime(l.created_at)}</text>
                  </view>
                </view>
              </view>
            ))
          )}
        </view>

      </scroll-view>
    </view>
  )
}

export const MailTestDashboard = DashboardScreen;
