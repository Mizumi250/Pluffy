// ============================================================
// ARKZEN GENERATED SCREEN — errors-test/index
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

type NativeErrorDef = {
  code:    number
  title:   string
  message: string
  color:   string
  bg:      string
  border:  string
}

const NATIVE_ERRORS: NativeErrorDef[] = [
  { code: 400, title: 'Bad Request',         message: 'The server could not understand your request.',               color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-100'  },
  { code: 401, title: 'Unauthorized',        message: 'You need to be signed in to access this.',                    color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100'    },
  { code: 403, title: 'Forbidden',           message: 'You do not have permission to access this resource.',         color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-100'  },
  { code: 404, title: 'Not Found',           message: 'The resource you are looking for does not exist.',            color: 'text-neutral-700', bg: 'bg-neutral-50', border: 'border-neutral-100' },
  { code: 409, title: 'Conflict',            message: 'A conflict occurred with the current state of the resource.', color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-100'  },
  { code: 422, title: 'Validation Error',    message: 'The data you submitted is invalid.',                          color: 'text-pink-700',    bg: 'bg-pink-50',    border: 'border-pink-100'    },
  { code: 429, title: 'Too Many Requests',   message: 'You have made too many requests. Wait before trying again.',  color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
  { code: 500, title: 'Server Error',        message: 'Something went wrong on our end.',                            color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-100'     },
  { code: 503, title: 'Service Unavailable', message: 'The service is temporarily offline for maintenance.',         color: 'text-slate-700',   bg: 'bg-slate-50',   border: 'border-slate-100'   },
]

// Shared native error screen — used by +not-found.tsx, error-boundary, and index
export const NativeErrorScreen = ({ code, reset }: { code: number; reset?: () => void }) => {
  const router = useRouter()
  const err = NATIVE_ERRORS.find(e => e.code === code) ?? {
    code,
    title: 'Error',
    message: 'An unexpected error occurred.',
    color: 'text-neutral-700',
    bg:    'bg-neutral-50',
    border: 'border-neutral-100',
  }

  return (
    <View className={`flex-1 items-center justify-center px-8 ${err.bg}`}>
      <Text className={`text-8xl font-black mb-2 ${err.color}`}>{err.code}</Text>
      <Text className="text-xl font-bold text-neutral-900 mb-3">{err.title}</Text>
      <Text className="text-sm text-neutral-500 text-center leading-6 mb-10">{err.message}</Text>
      <View className="flex-row gap-x-3">
        {reset && (
          <TouchableOpacity
            onPress={reset}
            activeOpacity={0.8}
            className="bg-neutral-900 px-6 py-3 rounded-2xl"
          >
            <Text className="text-white text-sm font-semibold">Try again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => router.replace('/' as any)}
          activeOpacity={0.8}
          className="border border-neutral-200 bg-white px-6 py-3 rounded-2xl"
        >
          <Text className="text-neutral-600 text-sm font-medium">Home</Text>
        </TouchableOpacity>
      </View>
      <Text className="mt-10 text-xs text-neutral-300">Error {err.code}</Text>
    </View>
  )
}

// ── Result banner ─────────────────────────────────────────────
const ResultBanner = ({ result }: { result: { code: number; body: string } | null }) => {
  if (!result) return null
  const err = NATIVE_ERRORS.find(e => e.code === result.code)
  return (
    <View className={`mx-4 mt-3 p-4 rounded-2xl border ${err ? err.border + ' ' + err.bg : 'bg-neutral-50 border-neutral-100'}`}>
      <Text className={`text-xs font-semibold mb-1 ${err ? err.color : 'text-neutral-600'}`}>
        HTTP {result.code}{err ? ` — ${err.title}` : ''}
      </Text>
      <Text className="text-xs text-neutral-500 font-mono" numberOfLines={4}>{result.body}</Text>
    </View>
  )
}

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const router = useRouter()
  const [simulating,   setSimulating]   = useState<number | null>(null)
  const [result,       setResult]       = useState<{ code: number; body: string } | null>(null)
  const [shouldCrash,  setShouldCrash]  = useState(false)

  if (shouldCrash) throw new Error('Intentional crash to trigger error-boundary')

  const simulate = async (code: number) => {
    setSimulating(code)
    setResult(null)
    try {
      const res  = await fetch(`${BACKEND_URL}/api/errors-test/simulate/${code}`, {
        headers: { Accept: 'application/json' },
      })
      const text = await res.text()
      setResult({ code: res.status, body: text })
    } catch (e) {
      setResult({ code: 0, body: e instanceof Error ? e.message : 'Network error' })
    } finally {
      setSimulating(null)
    }
  }

  const triggerCrash = () => setShouldCrash(true)

  const API_CODES  = [400, 401, 403, 409, 422, 429, 503]

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <Text className="text-base font-semibold text-neutral-900">⚠️ Error Handler Test</Text>
        <Text className="text-xs text-neutral-400 mt-0.5">
          Simulate all 9 HTTP error codes against the API
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >

        <ResultBanner result={result} />

        {/* Expo Router error handlers */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-4 border-b border-neutral-100">
            <Text className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Expo Router Handlers
            </Text>
          </View>

          <View className="px-5 py-4 flex-row items-center justify-between border-b border-neutral-50">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center gap-x-2 mb-0.5">
                <Text className="text-sm font-bold text-neutral-700">404</Text>
                <Text className="text-sm text-neutral-700">Not Found</Text>
              </View>
              <Text className="text-xs text-neutral-400">Navigates to a non-existent route</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/errors-test/fake-route' as any)}
              activeOpacity={0.7}
              className="px-4 py-2 rounded-xl items-center bg-neutral-900"
            >
              <Text className="text-white text-xs font-semibold">Trigger</Text>
            </TouchableOpacity>
          </View>

          <View className="px-5 py-4 flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center gap-x-2 mb-0.5">
                <Text className="text-sm font-bold text-red-700">500</Text>
                <Text className="text-sm text-neutral-700">Server Error</Text>
              </View>
              <Text className="text-xs text-neutral-400">Crashes the component to trigger error boundary</Text>
            </View>
            <TouchableOpacity
              onPress={triggerCrash}
              activeOpacity={0.7}
              className="px-4 py-2 rounded-xl items-center bg-red-600"
            >
              <Text className="text-white text-xs font-semibold">Trigger</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* API simulate codes */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-4 border-b border-neutral-100">
            <Text className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              API Response Codes
            </Text>
          </View>

          {NATIVE_ERRORS.filter(e => API_CODES.includes(e.code)).map((err, i) => (
            <View
              key={err.code}
              className={`px-5 py-4 flex-row items-center justify-between ${
                i < API_CODES.length - 1 ? 'border-b border-neutral-50' : ''
              }`}
            >
              <View className="flex-1 mr-4">
                <View className="flex-row items-center gap-x-2 mb-0.5">
                  <Text className={`text-sm font-bold ${err.color}`}>{err.code}</Text>
                  <Text className="text-sm text-neutral-700">{err.title}</Text>
                </View>
                <Text className="text-xs text-neutral-400" numberOfLines={1}>{err.message}</Text>
              </View>

              <TouchableOpacity
                onPress={() => simulate(err.code)}
                disabled={simulating === err.code}
                activeOpacity={0.7}
                className={`px-4 py-2 rounded-xl items-center ${
                  simulating === err.code ? 'bg-neutral-200' : 'bg-neutral-900'
                }`}
              >
                {simulating === err.code
                  ? <ActivityIndicator size="small" color="#737373" />
                  : <Text className="text-white text-xs font-semibold">Simulate</Text>
                }
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_ErrorsTest_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('errors-test')
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

export default ArkzenScreen_ErrorsTest_Index
