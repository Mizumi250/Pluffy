// ============================================================
// ARKZEN GENERATED SCREEN — errors-test/index
// ============================================================

import React, { useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeErrorScreen } from './components/NativeErrorScreen'
import { ResultBanner } from './components/ResultBanner'
import { BACKEND_URL, NATIVE_ERRORS } from './components/constants'

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
