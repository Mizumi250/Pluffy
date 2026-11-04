/* @arkzen:meta
name: mobile-sdui
version: 1.0.0
description: Mobile-only server-driven UI demo. Admins publish safe button definitions now or at a scheduled time; the user screen refreshes without an app update. Shared database/API DSL supports Laravel, Express, FastAPI, Spring Boot, ASP.NET, Go, and Rust.
auth: false
*/

/* @arkzen:meta:native
label: Mobile Server-Driven UI
description: Publish mobile button layouts from the admin screen without rebuilding the app.
expo:
  bundle_id: com.arkzen.mobilesdui
  scheme: mobilesdui
  version: 1.0.0
  orientation: portrait
  status_bar_style: dark
*/

/* @arkzen:native:config
theme:
  primary: "#4f46e5"
  background: "#f8fafc"
  surface: "#ffffff"
  text: "#0f172a"
  muted: "#64748b"
*/

/* @arkzen:native:components:shared */
/* @arkzen:import:expo */
import React from 'react'
import { Pressable, Text } from 'react-native'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React from 'react'
import { Pressable, Text } from 'react-native'
/* @arkzen:import:rn:end */

export const SduiButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    className={variant === 'primary'
      ? `min-h-14 w-full items-center justify-center rounded-2xl px-5 py-4 ${disabled ? 'bg-indigo-300' : 'bg-indigo-600 active:bg-indigo-700'}`
      : 'self-start rounded-xl border border-slate-200 bg-white px-4 py-3'}
  >
    <Text className={variant === 'primary' ? 'font-semibold text-white' : 'font-semibold text-slate-700'}>
      {label}
    </Text>
  </Pressable>
)
/* @arkzen:native:components:shared:end */

/* @arkzen:database:ui_releases
table: ui_releases
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  configuration:
    type: text
    nullable: false
  activate_at:
    type: string
    length: 40
    nullable: false
seeder:
  count: 1
  data:
    - configuration: '{"buttons":[{"id":"daily-check-in","label":"Daily check-in","action":"alert","message":"Thanks for checking in!"},{"id":"view-updates","label":"View updates","action":"alert","message":"You are all caught up."}]}'
      activate_at: '2000-01-01T00:00:00.000Z'
*/

/* @arkzen:api:ui_releases
model: UiRelease
controller: UiReleaseController
prefix: /api/mobile-sdui
middleware: []
endpoints:
  index:
    method: GET
    route: /releases
    description: List published and scheduled mobile UI releases
    query:
      per_page: integer|default:100
    response:
      type: collection
  store:
    method: POST
    route: /releases
    description: Publish a validated mobile button configuration
    validation:
      configuration: required|string|max:10000
      activate_at: required|string|max:40
    response:
      type: single
*/

/* @arkzen:native:page:index */
/* @arkzen:import:expo */
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  AppState,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
/* @arkzen:import:expo:end */

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

export default UserScreen
/* @arkzen:native:page:index:end */

/* @arkzen:native:page:admin */
/* @arkzen:import:expo */
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
/* @arkzen:import:expo:end */

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

export default AdminScreen
/* @arkzen:native:page:admin:end */
