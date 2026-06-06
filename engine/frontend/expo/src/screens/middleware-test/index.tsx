// ============================================================
// ARKZEN GENERATED SCREEN — middleware-test/index
// ============================================================

import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

type PingLog = {
  id:         number
  message:    string
  headers_ok: boolean
  created_at: string
}

type ResultStatus = 'idle' | 'pass' | 'blocked' | 'fail'
type Result = { status: ResultStatus; text: string }

async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
  })
}

// ── Primary button ────────────────────────────────────────────
const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    className={`flex-1 py-3 rounded-2xl items-center ${loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
  >
    {loading
      ? <ActivityIndicator size="small" color="#fff" />
      : <Text className="text-white text-xs font-semibold">{label}</Text>
    }
  </TouchableOpacity>
)

// ── Ghost button ──────────────────────────────────────────────
const GhostBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    className="flex-1 py-3 rounded-2xl items-center border border-neutral-200"
  >
    {loading
      ? <ActivityIndicator size="small" color="#737373" />
      : <Text className="text-neutral-600 text-xs font-medium">{label}</Text>
    }
  </TouchableOpacity>
)

// ── Result box ────────────────────────────────────────────────
const ResultBox = ({ result }: { result: Result }) => {
  if (!result.text) return null
  const bgStyles: Record<ResultStatus, string> = {
    pass:    'bg-green-50 border-green-200',
    blocked: 'bg-amber-50 border-amber-200',
    fail:    'bg-red-50 border-red-200',
    idle:    'bg-neutral-50 border-neutral-200',
  }
  const textStyles: Record<ResultStatus, string> = {
    pass:    'text-green-700',
    blocked: 'text-amber-700',
    fail:    'text-red-700',
    idle:    'text-neutral-500',
  }
  return (
    <View className={`p-3 rounded-xl border ${bgStyles[result.status]}`}>
      <Text className={`text-xs ${textStyles[result.status]}`}>{result.text}</Text>
    </View>
  )
}

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const [logs,    setLogs]    = useState<PingLog[]>([])
  const [message, setMessage] = useState('')
  const [result,  setResult]  = useState<Result>({ status: 'idle', text: '' })
  const [loading, setLoading] = useState(false)

  const loadLogs = async () => {
    try {
      const res = await apiFetch('/api/middleware-test/ping', {
        headers: { 'Content-Type': 'application/json' },
      })
      const d = await res.json()
      setLogs(d.data ?? d ?? [])
    } catch {}
  }

  useEffect(() => { loadLogs() }, [])

  const sendPing = async (withCorrectHeader: boolean) => {
    setLoading(true)
    setResult({ status: 'idle', text: 'Sending…' })
    try {
      const headers: Record<string, string> = {}
      if (withCorrectHeader) headers['Content-Type'] = 'application/json'

      const res = await apiFetch('/api/middleware-test/ping', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: message.trim() || 'Test ping', headers_ok: withCorrectHeader }),
      })
      const d = await res.json()
      if (res.ok) {
        setResult({ status: 'pass', text: '✓ Request passed — Content-Type was application/json' })
        setMessage('')
        setTimeout(loadLogs, 300)
      } else if (res.status === 415) {
        setResult({ status: 'blocked', text: `✗ Blocked by requireJson — ${d.message}` })
      } else {
        setResult({ status: 'fail', text: d.message ?? '✗ Request failed' })
      }
    } catch (e) {
      setResult({ status: 'fail', text: e instanceof Error ? e.message : 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <Text className="text-base font-semibold text-neutral-900">🛡️ Middleware Test</Text>
        <Text className="text-xs text-neutral-400 mt-0.5">
          Tests requireJson middleware body injection
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >

        {/* What was generated */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-5">
          <Text className="text-sm font-semibold text-neutral-900 mb-2">What Arkzen generated</Text>
          <Text className="text-xs text-neutral-500 leading-5">
            <Text className="font-mono text-neutral-700">@arkzen:middleware:requireJson</Text>
            {' '}injects real PHP into{' '}
            <Text className="font-mono text-neutral-700">handle()</Text>.
            {' '}Alias registered in route file so Laravel resolves it correctly.
          </Text>
          <View className="mt-2 bg-neutral-50 rounded-xl px-3 py-2">
            <Text className="text-xs font-mono text-neutral-500">
              POST without Content-Type → 415{'\n'}
              POST with Content-Type: application/json → 200
            </Text>
          </View>
        </View>

        {/* Test panel */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-5 gap-y-3">
          <Text className="text-sm font-semibold text-neutral-900">Test the middleware</Text>

          <TextInput
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Optional message"
            placeholderTextColor="#a3a3a3"
            value={message}
            onChangeText={setMessage}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View className="flex-row gap-x-2">
            <PrimaryBtn
              label="✓ With JSON header"
              onPress={() => sendPing(true)}
              loading={loading}
            />
            <GhostBtn
              label="✗ Without JSON header"
              onPress={() => sendPing(false)}
              loading={loading}
            />
          </View>

          <ResultBox result={result} />
        </View>

        {/* Ping log */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="font-semibold text-sm text-neutral-900">Ping log</Text>
            <TouchableOpacity onPress={loadLogs}>
              <Text className="text-xs text-neutral-400">Refresh</Text>
            </TouchableOpacity>
          </View>
          {logs.length === 0 ? (
            <View className="p-8 items-center">
              <Text className="text-sm text-neutral-400">No pings yet.</Text>
            </View>
          ) : (
            logs.map((l, i) => (
              <View key={i} className="px-5 py-3 flex-row items-center justify-between border-b border-neutral-50">
                <Text className="text-sm text-neutral-900 flex-1" numberOfLines={1}>{l.message}</Text>
                <View className={`px-2.5 py-1 rounded-full ml-3 ${l.headers_ok ? 'bg-green-100' : 'bg-neutral-100'}`}>
                  <Text className={`text-xs font-semibold ${l.headers_ok ? 'text-green-700' : 'text-neutral-500'}`}>
                    {l.headers_ok ? 'json ✓' : 'no header'}
                  </Text>
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
export function ArkzenScreen_MiddlewareTest_Index() {
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <IndexScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_MiddlewareTest_Index
