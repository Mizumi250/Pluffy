// ============================================================
// ARKZEN GENERATED SCREEN — body-mail-notification/dashboard
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { AuthLayout }  from '@/layouts/AuthLayout'

import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

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

// ── Reusable input field ───────────────────────────────────────
const Field = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}: {
  placeholder:      string
  value:            string
  onChangeText:     (v: string) => void
  secureTextEntry?: boolean
  keyboardType?:    'default' | 'email-address'
}) => (
  <TextInput
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    placeholderTextColor="#a3a3a3"
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    autoCapitalize="none"
    autoCorrect={false}
  />
)

// ── Error box ──────────────────────────────────────────────────
const ErrorBox = ({ message }: { message: string }) => (
  <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
    <Text className="text-xs text-red-600">{message}</Text>
  </View>
)

// ── Primary button ─────────────────────────────────────────────
const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
  color = 'bg-neutral-900',
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
  color?:   string
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    className={`py-3.5 rounded-2xl items-center ${loading ? 'bg-neutral-300' : color}`}
  >
    {loading
      ? <ActivityIndicator size="small" color="#fff" />
      : <Text className="text-white text-sm font-semibold">{label}</Text>
    }
  </TouchableOpacity>
)

// ── Kind badge ─────────────────────────────────────────────────
const KindBadge = ({ kind }: { kind: string }) => (
  <View className={`px-2.5 py-0.5 rounded-full ${kind === 'mail' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
    <Text className={`text-xs font-bold ${kind === 'mail' ? 'text-blue-700' : 'text-yellow-700'}`}>
      {kind === 'mail' ? '✉ MAIL' : '🔔 NOTIF'}
    </Text>
  </View>
)

// ── Status dot ─────────────────────────────────────────────────
const StatusDot = ({ status }: { status: string }) => (
  <View
    className={`w-2 h-2 rounded-full mr-1.5 ${status === 'sent' ? 'bg-green-500' : 'bg-red-500'}`}
    style={{ marginTop: 1 }}
  />
)

// User screen (from @arkzen:native:page:dashboard)
const DashboardScreen = () => {
  const router           = useRouter()
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
      const res  = await arkzenFetch(`${BACKEND_URL}/api/body-mail-notification/log`)
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
      const res = await arkzenFetch(`${BACKEND_URL}/api/body-mail-notification/send-mail`, {
        method: 'POST',
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
      const res = await arkzenFetch(`${BACKEND_URL}/api/body-mail-notification/notify`, {
        method: 'POST',
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
      await arkzenFetch(`${BACKEND_URL}/api/body-mail-notification/log/clear`, { method: 'DELETE' })
      showToast('success', 'Log cleared')
      setLog([])
    } catch {
      showToast('error', 'Clear failed')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/body-mail-notification/login' as any)
  }

  const mailTypes: Array<{ key: 'welcome' | 'receipt' | 'alert'; label: string; desc: string }> = [
    { key: 'welcome', label: 'Welcome',  desc: 'Onboarding HTML via blade_body' },
    { key: 'receipt', label: 'Receipt',  desc: 'Table layout HTML via blade_body' },
    { key: 'alert',   label: 'Alert',    desc: 'CTA button HTML via blade_body'  },
  ]

  const notifTypes: Array<{ key: 'action-required' | 'summary'; label: string; desc: string }> = [
    { key: 'action-required', label: 'Action Required', desc: 'Custom toMail() chain via DSL body' },
    { key: 'summary',         label: 'Summary',         desc: 'Activity summary via DSL body'      },
  ]

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Toast */}
      {toast && (
        <View
          style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 50 }}
          className={`rounded-2xl px-5 py-3 flex-row items-center ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}
        >
          <Text className="text-white text-sm flex-1">{toast.msg}</Text>
        </View>
      )}

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-neutral-900">✉ Body Injection Test</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-xs text-neutral-400">Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Send Mail ─────────────────────────────────── */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
          Send Mail · blade_body injection
        </Text>

        {/* Mail type picker */}
        <View className="gap-y-2 mb-3">
          {mailTypes.map(({ key, label, desc }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setMailKind(key)}
              activeOpacity={0.8}
              className={`bg-white rounded-2xl border p-4 flex-row items-center justify-between ${mailKind === key ? 'border-neutral-900' : 'border-neutral-100'}`}
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold text-neutral-900">{label}</Text>
                <Text className="text-xs text-neutral-400 mt-0.5">{desc}</Text>
              </View>
              <View className={`w-4 h-4 rounded-full border-2 items-center justify-center ${mailKind === key ? 'border-neutral-900' : 'border-neutral-300'}`}>
                {mailKind === key && <View className="w-2 h-2 rounded-full bg-neutral-900" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Field
          placeholder="Recipient email"
          value={mailTo}
          onChangeText={setMailTo}
          keyboardType="email-address"
        />
        <View className="mt-2 mb-6">
          <PrimaryBtn label={sending ? 'Sending…' : 'Send Mail'} onPress={sendMail} loading={sending} />
        </View>

        {/* ── Send Notification ─────────────────────────── */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
          Send Notification · toMail_body injection
        </Text>

        {/* Notif type picker */}
        <View className="gap-y-2 mb-3">
          {notifTypes.map(({ key, label, desc }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setNotifKind(key)}
              activeOpacity={0.8}
              className={`bg-white rounded-2xl border p-4 flex-row items-center justify-between ${notifKind === key ? 'border-violet-600' : 'border-neutral-100'}`}
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold text-neutral-900">{label}</Text>
                <Text className="text-xs text-neutral-400 mt-0.5">{desc}</Text>
              </View>
              <View className={`w-4 h-4 rounded-full border-2 items-center justify-center ${notifKind === key ? 'border-violet-600' : 'border-neutral-300'}`}>
                {notifKind === key && <View className="w-2 h-2 rounded-full bg-violet-600" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Field
          placeholder="Custom message (optional)"
          value={notifMsg}
          onChangeText={setNotifMsg}
        />
        <View className="mt-2 mb-6">
          <PrimaryBtn label={notifying ? 'Sending…' : 'Send Notification'} onPress={sendNotif} loading={notifying} color="bg-violet-600" />
        </View>

        {/* ── Send Log ──────────────────────────────────── */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-4">
          <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="font-semibold text-sm text-neutral-900">Send Log</Text>
            <View className="flex-row gap-x-3">
              <TouchableOpacity onPress={loadLog}>
                <Text className="text-xs text-neutral-400">{loading ? 'Loading…' : 'Refresh'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearLog}>
                <Text className="text-xs text-red-400">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {log.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-neutral-400">
                {loading ? 'Loading…' : 'No entries yet — send a mail or notification above.'}
              </Text>
            </View>
          ) : (
            log.map((entry, i) => (
              <View
                key={entry.id}
                className={`px-4 py-3 flex-row items-center gap-x-3 ${i < log.length - 1 ? 'border-b border-neutral-50' : ''}`}
              >
                <KindBadge kind={entry.kind} />
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                    {entry.subject ?? '—'}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5" numberOfLines={1}>
                    {entry.to_email ?? '—'}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <StatusDot status={entry.status} />
                  <Text className="text-xs text-neutral-500">{entry.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info note */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-semibold mb-1">What's being tested</Text>
          <Text className="text-xs text-neutral-500 leading-5">
            {'✉️ blade_body — MailBuilder v3.1 generates Blade views from DSL HTML\n'}
            {'🔔 toMail_body — NotificationBuilder v3.9 injects custom MailMessage chain\n'}
            {'📋 send_log — every dispatch logged to DB with status + error'}
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_BodyMailNotification_Dashboard() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('body-mail-notification')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AuthLayout tatSlug="body-mail-notification" loginRoute="/body-mail-notification/login">
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

export default ArkzenScreen_BodyMailNotification_Dashboard
