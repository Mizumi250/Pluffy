// ============================================================
// ARKZEN GENERATED SCREEN — mail-test/dashboard
// ============================================================

import React, { useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { CheckCircle, Clock, LogOut, Mail, RefreshCw, Send, XCircle } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthLayout }  from '@/layouts/AuthLayout'
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { BACKEND_URL } from './components/constants'
import type { MailLog, MailType } from './components/types'

// User screen (from @arkzen:native:page:dashboard)
const DashboardScreen = () => {
  const router           = useRouter()
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
    router.replace('/mail-test/login' as any)
  }

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    catch { return ts }
  }

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-9 h-9 bg-neutral-900 rounded-xl items-center justify-center">
            <Mail size={16} color="#fff" />
          </View>
          <View>
            <Text className="text-base font-semibold text-neutral-900">Mail Test</Text>
            <Text className="text-xs text-neutral-400 mt-0.5">{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} className="flex-row items-center gap-1">
          <LogOut size={13} color="#a3a3a3" />
          <Text className="text-xs text-neutral-400">Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12 }}>

        {/* Toast */}
        {toast && (
          <View className={`flex-row items-center gap-2 px-4 py-3 rounded-2xl border ${
            toast.type === 'success'
              ? 'bg-white border-emerald-200'
              : 'bg-white border-red-200'
          }`}>
            {toast.type === 'success'
              ? <CheckCircle size={15} color="#10b981" />
              : <XCircle    size={15} color="#ef4444" />
            }
            <Text className={`text-sm font-medium flex-1 ${
              toast.type === 'success' ? 'text-emerald-700' : 'text-red-600'
            }`}>
              {toast.msg}
            </Text>
          </View>
        )}

        {/* Recipient */}
        <View className="bg-white rounded-2xl border border-neutral-100 p-4">
          <Text className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Recipient
          </Text>
          <Field
            placeholder="recipient@example.com"
            value={toEmail}
            onChangeText={setToEmail}
            keyboardType="email-address"
          />
          <Text className="text-xs text-neutral-400 mt-2">
            Use Mailtrap or a real address. Configure MAIL_* in .env
          </Text>
        </View>

        {/* Mailables */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-3.5 border-b border-neutral-100">
            <Text className="text-sm font-semibold text-neutral-900">Mailables</Text>
            <Text className="text-xs text-neutral-400 mt-0.5">3 templates registered via @arkzen:mail</Text>
          </View>
          {mailTypes.map((m, i) => (
            <View
              key={m.key}
              className={`px-5 py-4 flex-row items-center justify-between gap-3 ${
                i < mailTypes.length - 1 ? 'border-b border-neutral-50' : ''
              }`}
            >
              <View className="flex-1 min-w-0">
                <Text className="text-sm font-medium text-neutral-800">{m.label}</Text>
                <Text className="text-xs text-neutral-400 mt-0.5" numberOfLines={1}>{m.desc}</Text>
                <Text className="text-xs font-mono text-neutral-300 mt-1">{m.key}</Text>
              </View>
              <TouchableOpacity
                onPress={() => send(m.key, m.fields)}
                disabled={!!sending || !toEmail}
                activeOpacity={0.8}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${
                  !!sending || !toEmail ? 'bg-neutral-200' : 'bg-neutral-900'
                }`}
              >
                {sending === m.key
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Send size={11} color="#fff" />
                }
                <Text className="text-white text-xs font-medium">
                  {sending === m.key ? 'Sending' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Send Log */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-3.5 border-b border-neutral-100 flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-semibold text-neutral-900">Send log</Text>
              <Text className="text-xs text-neutral-400 mt-0.5">{logs.length} entries</Text>
            </View>
            <TouchableOpacity
              onPress={loadLogs}
              disabled={loadingLogs}
              className="p-1.5 rounded-lg"
            >
              {loadingLogs
                ? <ActivityIndicator size="small" color="#a3a3a3" />
                : <RefreshCw size={14} color="#a3a3a3" />
              }
            </TouchableOpacity>
          </View>

          {logs.length === 0 ? (
            <View className="py-12 items-center">
              <Mail size={28} color="#e5e5e5" />
              <Text className="text-sm text-neutral-400 mt-3">No mail sent yet</Text>
              <Text className="text-xs text-neutral-300 mt-1">Send a mail above to see logs here</Text>
            </View>
          ) : (
            logs.map((l, i) => (
              <View
                key={l.id}
                className={`px-5 py-3.5 flex-row items-start justify-between gap-3 ${
                  i < logs.length - 1 ? 'border-b border-neutral-50' : ''
                }`}
              >
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-medium text-neutral-800" numberOfLines={1}>
                    {l.mail_class}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5" numberOfLines={1}>
                    To: {l.to_email}
                  </Text>
                  {l.error && (
                    <Text className="text-xs text-red-500 mt-0.5" numberOfLines={1}>{l.error}</Text>
                  )}
                </View>
                <View className="items-end gap-1">
                  <View className={`px-2 py-0.5 rounded-full ${
                    l.status === 'sent' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      l.status === 'sent' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {l.status}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Clock size={10} color="#d4d4d4" />
                    <Text className="text-xs text-neutral-300">{formatTime(l.created_at)}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_MailTest_Dashboard() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('mail-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AuthLayout tatSlug="mail-test" loginRoute="/mail-test/login">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <DashboardScreen />
      </ScrollView>
      </AuthLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_MailTest_Dashboard
