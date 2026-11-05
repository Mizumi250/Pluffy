// ============================================================
// ARKZEN GENERATED SCREEN — mobile-sdui/index
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Alert, AppState, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { SduiButton } from './components/SduiButton'

// User screen (from @arkzen:native:page:index)
/* @arkzen:resolved:import expo */
type DynamicButton = {
  id: string
  label: string
  action: 'alert'
  message: string
}

type UiRelease = {
  id: number
  configuration: string
  activate_at: string
  buttons: DynamicButton[]
}

const API_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL
  ?? process.env.EXPO_PUBLIC_API_URL
  ?? 'http://localhost:8000'
const RELEASES_URL = `${API_URL}/api/mobile-sdui/releases`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const errorMessage = (value: unknown, fallback: string): string =>
  isRecord(value) && typeof value.message === 'string' ? value.message : fallback

const parseRelease = (value: unknown): UiRelease => {
  if (!isRecord(value) || typeof value.configuration !== 'string' || typeof value.activate_at !== 'string') {
    throw new Error('The server returned a malformed UI release.')
  }

  const activationTime = Date.parse(value.activate_at)
  if (!Number.isFinite(activationTime)) throw new Error('A UI release has an invalid activation time.')

  let configuration: unknown
  try {
    configuration = JSON.parse(value.configuration)
  } catch {
    throw new Error('A UI release contains invalid JSON.')
  }

  if (!isRecord(configuration) || !Array.isArray(configuration.buttons)) {
    throw new Error('A UI release must contain a buttons array.')
  }

  const buttons = configuration.buttons.map((button): DynamicButton => {
    if (
      !isRecord(button)
      || typeof button.id !== 'string'
      || typeof button.label !== 'string'
      || button.action !== 'alert'
      || typeof button.message !== 'string'
    ) {
      throw new Error('A UI release contains an unsupported button definition.')
    }
    return { id: button.id, label: button.label, action: 'alert', message: button.message }
  })

  return {
    id: typeof value.id === 'number' ? value.id : 0,
    configuration: value.configuration,
    activate_at: value.activate_at,
    buttons,
  }
}

const UserScreen = () => {
  const router = useRouter()
  const [releases, setReleases] = useState<UiRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReleases = useCallback(async () => {
    try {
      const response = await fetch(`${RELEASES_URL}?per_page=100`, {
        headers: { Accept: 'application/json' },
      })
      const payload: unknown = await response.json()
      if (!response.ok) throw new Error(errorMessage(payload, `Could not load UI releases (${response.status}).`))

      const rows: unknown[] | null = isRecord(payload) && Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload) ? payload : null
      if (!rows) throw new Error('The server returned an invalid UI release list.')

      setReleases(rows.map(parseRelease))
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load the mobile UI.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadReleases()
    const timer = setInterval(() => { void loadReleases() }, 30000)
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void loadReleases()
    })
    return () => {
      clearInterval(timer)
      subscription.remove()
    }
  }, [loadReleases])

  const now = Date.now()
  const activeRelease = releases
    .filter(release => Date.parse(release.activate_at) <= now)
    .sort((a, b) =>
      Date.parse(b.activate_at) - Date.parse(a.activate_at) || b.id - a.id,
    )[0]

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 24, paddingTop: 56, flexGrow: 1 }}>
      <View className="mb-8 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Mobile SDUI</Text>
          <Text className="mt-2 text-3xl font-bold text-slate-900">Your actions</Text>
        </View>
        <SduiButton label="Admin" variant="secondary" onPress={() => router.push('/mobile-sdui/admin')} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" />
      ) : error ? (
        <View className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <Text className="font-semibold text-red-700">Could not load the buttons</Text>
          <Text className="mt-2 text-sm text-red-600">{error}</Text>
          <Pressable onPress={() => { setLoading(true); void loadReleases() }} className="mt-4 self-start rounded-xl bg-red-700 px-4 py-3">
            <Text className="font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      ) : !activeRelease ? (
        <Text className="rounded-2xl bg-white p-5 text-slate-500">No button layout is active yet.</Text>
      ) : activeRelease.buttons.length === 0 ? (
        <Text className="rounded-2xl bg-white p-5 text-slate-500">There are no actions in the active layout.</Text>
      ) : (
        <View className="gap-y-3">
          {activeRelease.buttons.map(button => (
            <SduiButton
              key={button.id}
              label={button.label}
              onPress={() => Alert.alert(button.label, button.message)}
            />
          ))}
        </View>
      )}
      <Text className="mt-auto pt-8 text-center text-xs text-slate-400">
        Button layouts refresh automatically while the app is open.
      </Text>
    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_MobileSdui_Index() {
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
        <UserScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_MobileSdui_Index
