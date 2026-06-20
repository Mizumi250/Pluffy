/* @arkzen:meta
name: middleware-test
version: 2.1.0
description: "Tests MiddlewareBuilder v7.0 body injection. Declares [requireJson] with real logic injected via @arkzen:middleware:requireJson DSL block. Also tests alias registration fix — previously requireJson was never registered as an alias so Laravel 500'd at runtime."
auth: false
*/

/* @arkzen:database:ping_logs
table: ping_logs
timestamps: true
softDeletes: false
columns:
  message:
    type: string
    nullable: false
  headers_ok:
    type: boolean
    default: false
seeder:
  count: 2
  data:
    - message: First ping
      headers_ok: true
    - message: Second ping
      headers_ok: false
*/

/* @arkzen:api:ping_logs
model: PingLog
controller: PingLogController
prefix: /api/middleware-test
middleware: [requireJson]
endpoints:
  index:
    method: GET
    route: /ping
    description: Returns all ping logs — passes through requireJson middleware
    response:
      type: collection
  store:
    method: POST
    route: /ping
    description: Create a ping log entry — blocked by requireJson if Content-Type is wrong
    validation:
      message: required|string|max:255
      headers_ok: sometimes|boolean
    response:
      type: single
*/

/* @arkzen:middleware:requireJson
*/
if (!$request->isJson()) {
    return response()->json([
        'message' => 'Content-Type: application/json is required for this endpoint.',
        'hint'    => 'Set the Content-Type header to application/json',
    ], 415);
}
return $next($request);
/* @arkzen:middleware:requireJson:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const [logs,    setLogs]    = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [result,  setResult]  = useState<{ status: 'idle' | 'pass' | 'fail' | 'blocked'; text: string }>({ status: 'idle', text: '' })
  const [loading, setLoading] = useState(false)

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/middleware-test/ping', {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      })
      const d = await res.json()
      setLogs(d.data ?? d ?? [])
    } catch {}
  }

  useEffect(() => { loadLogs() }, [])

  const sendPing = async (withCorrectHeader: boolean) => {
    setLoading(true)
    setResult({ status: 'idle', text: 'Sending...' })
    try {
      const headers: Record<string, string> = { 'Accept': 'application/json' }
      if (withCorrectHeader) headers['Content-Type'] = 'application/json'

      const res = await fetch('/api/middleware-test/ping', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: message || 'Test ping', headers_ok: withCorrectHeader }),
      })
      const d = await res.json()
      if (res.ok) {
        setResult({ status: 'pass', text: '✓ Request passed — Content-Type was application/json' })
        setMessage('')
        setTimeout(loadLogs, 300)
      } else if (res.status === 415) {
        setResult({ status: 'blocked', text: `✗ Blocked by requireJson middleware — ${d.message}` })
      } else {
        setResult({ status: 'fail', text: d.message ?? '✗ Request failed' })
      }
    } catch (e) {
      setResult({ status: 'fail', text: e instanceof Error ? e.message : 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  const resultStyle =
    result.status === 'pass'    ? 'bg-green-50 border-green-200 text-green-700' :
    result.status === 'blocked' ? 'bg-amber-50 border-amber-200 text-amber-700' :
    result.status === 'fail'    ? 'bg-red-50 border-red-200 text-red-700' :
    'bg-neutral-50 border-neutral-200 text-neutral-500'

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck size={20} /> Middleware Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Tests <code>MiddlewareBuilder</code> v7.0 body injection + alias fix.
          </p>
        </div>

        {/* What was generated */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-2">
          <div className="font-medium text-sm">What Arkzen generated</div>
          <div className="text-xs text-neutral-500 space-y-1">
            <p>
              <code>@arkzen:middleware:requireJson</code> block provided real PHP logic.
              MiddlewareBuilder v7.0 decoded it and injected into <code>handle()</code>.
            </p>
            <code className="block bg-neutral-50 rounded-lg p-2 text-neutral-700">
              app/Http/Middleware/Arkzen/MiddlewareTest/RequireJson.php
            </code>
            <p>
              Alias registered in route file (v7.0 fix):
            </p>
            <code className="block bg-neutral-50 rounded-lg p-2 text-neutral-700">
              {"app('router')->aliasMiddleware('requireJson', RequireJson::class);"}
            </code>
          </div>
        </div>

        {/* Test buttons */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-3">
          <div className="font-medium text-sm">Test the middleware</div>
          <input
            className="arkzen-input w-full"
            placeholder="Optional message"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="arkzen-btn flex-1 text-sm"
              onClick={() => sendPing(true)}
              disabled={loading}
            >
              ✓ Send with JSON header
            </button>
            <button
              className="arkzen-btn-ghost flex-1 text-sm"
              onClick={() => sendPing(false)}
              disabled={loading}
            >
              ✗ Send without JSON header
            </button>
          </div>
          {result.text && (
            <div className={`p-3 rounded-xl border text-sm ${resultStyle}`}>
              {result.text}
            </div>
          )}
        </div>

        {/* Log table */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Ping log</h2>
            <button className="text-xs text-neutral-400" onClick={loadLogs}>Refresh</button>
          </div>
          {logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">No pings yet.</div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {logs.map((l, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-sm">{l.message}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    l.headers_ok ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {l.headers_ok ? 'json ✓' : 'no header'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
/* @arkzen:web:page:index:end */


/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'

const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:rn:end */

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

/* @arkzen:native:components:shared:end */


/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:default */

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

/* @arkzen:native:page:index:end */

/* @arkzen:native:components:lynx:shared */

import { useState, useEffect } from '@lynx-js/react'

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

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
  <view
    bindtap={loading ? undefined : onPress}
    className={`flex-1 py-3 rounded-2xl items-center ${loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
  >
    {loading
      ? <text className="text-neutral-500 text-xs font-semibold">Loading…</text>
      : <text className="text-white text-xs font-semibold">{label}</text>
    }
  </view>
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
  <view
    bindtap={loading ? undefined : onPress}
    className="flex-1 py-3 rounded-2xl items-center border border-neutral-200"
  >
    {loading
      ? <text className="text-neutral-400 text-xs font-medium">Loading…</text>
      : <text className="text-neutral-600 text-xs font-medium">{label}</text>
    }
  </view>
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
    <view className={`p-3 rounded-xl border ${bgStyles[result.status]}`}>
      <text className={`text-xs ${textStyles[result.status]}`}>{result.text}</text>
    </view>
  )
}

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:index */
/* @arkzen:native:page:layout:default */

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
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4">
        <text className="text-base font-semibold text-neutral-900">🛡️ Middleware Test</text>
        <text className="text-xs text-neutral-400 mt-0.5">
          Tests requireJson middleware body injection
        </text>
      </view>

      <scroll-view className="flex-1 pb-8">

        {/* What was generated */}
        <view className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-5">
          <text className="text-sm font-semibold text-neutral-900 mb-2">What Arkzen generated</text>
          <text className="text-xs text-neutral-500 leading-5">
            <text className="font-mono text-neutral-700">@arkzen:middleware:requireJson</text>
            {' '}injects real PHP into{' '}
            <text className="font-mono text-neutral-700">handle()</text>.
            {' '}Alias registered in route file so Laravel resolves it correctly.
          </text>
          <view className="mt-2 bg-neutral-50 rounded-xl px-3 py-2">
            <text className="text-xs font-mono text-neutral-500">
              POST without Content-Type → 415{'\n'}
              POST with Content-Type: application/json → 200
            </text>
          </view>
        </view>

        {/* Test panel */}
        <view className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-5 gap-y-3">
          <text className="text-sm font-semibold text-neutral-900">Test the middleware</text>

          <input
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Optional message"
            value={message}
            bindinput={e => setMessage(e.detail.value)}
            type="text"
          />

          <view className="flex-row gap-x-2">
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
          </view>

          <ResultBox result={result} />
        </view>

        {/* Ping log */}
        <view className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <view className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <text className="font-semibold text-sm text-neutral-900">Ping log</text>
            <view bindtap={loadLogs}>
              <text className="text-xs text-neutral-400">Refresh</text>
            </view>
          </view>
          {logs.length === 0 ? (
            <view className="p-8 items-center">
              <text className="text-sm text-neutral-400">No pings yet.</text>
            </view>
          ) : (
            logs.map((l, i) => (
              <view key={i} className="px-5 py-3 flex-row items-center justify-between border-b border-neutral-50">
                <text className="text-sm text-neutral-900 flex-1">{l.message}</text>
                <view className={`px-2.5 py-1 rounded-full ml-3 ${l.headers_ok ? 'bg-green-100' : 'bg-neutral-100'}`}>
                  <text className={`text-xs font-semibold ${l.headers_ok ? 'text-green-700' : 'text-neutral-500'}`}>
                    {l.headers_ok ? 'json ✓' : 'no header'}
                  </text>
                </view>
              </view>
            ))
          )}
        </view>

      </scroll-view>
    </view>
  )
}

/* @arkzen:native:page:lynx:index:end */
