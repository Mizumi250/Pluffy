// ============================================================
// ARKZEN GENERATED SCREEN — mobile-sdui/admin
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Alert, AppState, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { SduiButton } from './components/SduiButton'

// User screen (from @arkzen:native:page:admin)
/* @arkzen:resolved:import expo */
type AdminButton = {
  id: string
  label: string
  action: 'alert'
  message: string
}

const API_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL
  ?? process.env.EXPO_PUBLIC_API_URL
  ?? 'http://localhost:8000'
const RELEASES_URL = `${API_URL}/api/mobile-sdui/releases`
const STARTER_JSON = JSON.stringify({
  buttons: [
    { id: 'daily-check-in', label: 'Daily check-in', action: 'alert', message: 'Thanks for checking in!' },
    { id: 'view-updates', label: 'View updates', action: 'alert', message: 'You are all caught up.' },
  ],
}, null, 2)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const responseMessage = (value: unknown, fallback: string): string =>
  isRecord(value) && typeof value.message === 'string' ? value.message : fallback

const validateButtonConfig = (source: string): AdminButton[] => {
  let value: unknown
  try {
    value = JSON.parse(source)
  } catch {
    throw new Error('Enter valid JSON before publishing.')
  }

  if (!isRecord(value) || !Array.isArray(value.buttons)) {
    throw new Error('The JSON must be an object with a buttons array.')
  }

  const ids = new Set<string>()
  return value.buttons.map((button): AdminButton => {
    if (
      !isRecord(button)
      || typeof button.id !== 'string'
      || !/^[a-z0-9-]{1,48}$/.test(button.id)
      || ids.has(button.id)
      || typeof button.label !== 'string'
      || button.label.trim().length === 0
      || button.label.length > 60
      || button.action !== 'alert'
      || typeof button.message !== 'string'
      || button.message.length > 240
    ) {
      throw new Error('Each button needs a unique id, a label (max 60 characters), action "alert", and a message (max 240 characters).')
    }
    ids.add(button.id)
    return {
      id: button.id,
      label: button.label.trim(),
      action: 'alert',
      message: button.message,
    }
  })
}

const AdminScreen = () => {
  const router = useRouter()
  const [configuration, setConfiguration] = useState(STARTER_JSON)
  const [activateAt, setActivateAt] = useState(new Date().toISOString())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [releaseCount, setReleaseCount] = useState(0)

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const response = await fetch(`${RELEASES_URL}?per_page=100`, {
          headers: { Accept: 'application/json' },
        })
        const payload: unknown = await response.json()
        if (!response.ok) throw new Error(responseMessage(payload, `Could not load releases (${response.status}).`))
        const rows: unknown[] | null = isRecord(payload) && Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload) ? payload : null
        if (!rows) throw new Error('The server returned an invalid release list.')

        const latest = rows
          .filter(isRecord)
          .filter(row => typeof row.configuration === 'string' && typeof row.activate_at === 'string')
          .sort((a, b) =>
            Date.parse(String(b.activate_at)) - Date.parse(String(a.activate_at))
              || Number(b.id ?? 0) - Number(a.id ?? 0),
          )[0]
        setReleaseCount(rows.length)
        if (latest) {
          setConfiguration(String(latest.configuration))
        }
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not load the saved UI.')
      } finally {
        setLoading(false)
      }
    }
    void loadLatest()
  }, [])

  const scheduleNextMidnight = () => {
    const next = new Date()
    next.setHours(24, 0, 0, 0)
    setActivateAt(next.toISOString())
    setNotice('Scheduled for your device’s next local midnight.')
    setError('')
  }

  const publish = async () => {
    setError('')
    setNotice('')
    let buttons: AdminButton[]
    try {
      buttons = validateButtonConfig(configuration)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The button configuration is invalid.')
      return
    }

    const activationTime = new Date(activateAt)
    if (!Number.isFinite(activationTime.getTime())) {
      setError('Enter a valid activation date and time.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(RELEASES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          configuration: JSON.stringify({ buttons }),
          activate_at: activationTime.toISOString(),
        }),
      })
      const payload: unknown = await response.json()
      if (!response.ok) throw new Error(responseMessage(payload, `Could not publish the UI (${response.status}).`))

      setReleaseCount(count => count + 1)
      setNotice(`Published ${buttons.length} button${buttons.length === 1 ? '' : 's'} for ${activationTime.toLocaleString()}.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not publish the UI.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-7 flex-row items-center">
        <View className="mr-4">
          <SduiButton label="Back" variant="secondary" onPress={() => router.back()} />
        </View>
        <View>
          <Text className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Mobile SDUI</Text>
          <Text className="mt-1 text-2xl font-bold text-slate-900">Admin editor</Text>
        </View>
      </View>

      <Text className="mb-2 text-sm font-semibold text-slate-700">Button configuration (JSON)</Text>
      <Text className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
        Demo editor: this example has no admin authentication. Keep it local until you add your app’s access controls.
      </Text>
      <TextInput
        value={configuration}
        onChangeText={setConfiguration}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        textAlignVertical="top"
        className="min-h-64 rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm text-slate-800"
        accessibilityLabel="Button configuration JSON"
      />
      <Text className="mb-6 mt-2 text-xs leading-5 text-slate-500">
        Supported action: alert. Only declarative button data is accepted; scripts and executable code are not.
      </Text>

      <Text className="mb-2 text-sm font-semibold text-slate-700">Activate at (ISO 8601)</Text>
      <TextInput
        value={activateAt}
        onChangeText={setActivateAt}
        autoCapitalize="none"
        autoCorrect={false}
        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800"
        placeholder="2026-11-05T00:00:00.000Z"
        accessibilityLabel="Activation date and time"
      />
      <View className="mt-3">
        <SduiButton label="Schedule next local midnight" variant="secondary" onPress={scheduleNextMidnight} />
      </View>

      {loading && <ActivityIndicator className="mt-5" color="#4f46e5" />}
      {error !== '' && <Text accessibilityRole="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</Text>}
      {notice !== '' && <Text className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</Text>}

      <SduiButton
        onPress={() => { void publish() }}
        label={saving ? 'Publishing…' : 'Publish UI release'}
        disabled={saving}
      />
      <Text className="mt-4 text-center text-xs text-slate-400">
        {releaseCount} saved release{releaseCount === 1 ? '' : 's'} · the user screen checks for changes every 30 seconds.
      </Text>
    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_MobileSdui_Admin() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('mobile-sdui')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ArkzenStatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AdminScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_MobileSdui_Admin
