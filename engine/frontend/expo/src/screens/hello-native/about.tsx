// ============================================================
// ARKZEN GENERATED SCREEN — hello-native/about
// ============================================================

import React, { useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { Badge } from './components/Badge'
import { Card } from './components/Card'
import { GhostButton } from './components/GhostButton'
import { PrimaryButton } from './components/PrimaryButton'

// User screen (from @arkzen:native:page:about)
const AboutScreen = () => {
  const router = useRouter()
  const [count, setCount] = useState(0)

  return (
    <View className="flex-1 bg-neutral-50 px-6 pt-14 pb-10">

      {/* Back */}
      <GhostButton label="← Back" onPress={() => router.back()} />

      {/* Heading */}
      <View className="mt-8 mb-8">
        <Badge label="about" />
        <Text className="text-3xl font-bold text-neutral-900 mt-4">
          About this tatemono
        </Text>
        <Text className="text-sm text-neutral-500 mt-2 leading-6">
          A minimal native module scaffolded by the Arkzen engine. Pure React Native + NativeWind — no web code.
        </Text>
      </View>

      {/* Interactive counter — quick state smoke test */}
      <View className="bg-white rounded-2xl border border-neutral-100 p-6 items-center mb-6">
        <Text className="text-xs text-neutral-400 uppercase tracking-widest mb-2">
          State check
        </Text>
        <Text className="text-5xl font-bold text-indigo-500 mb-4">{count}</Text>
        <View className="flex-row gap-x-3">
          <TouchableOpacity
            onPress={() => setCount(c => Math.max(0, c - 1))}
            className="w-12 h-12 rounded-2xl bg-neutral-100 items-center justify-center"
          >
            <Text className="text-xl font-bold text-neutral-600">−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCount(c => c + 1)}
            className="w-12 h-12 rounded-2xl bg-indigo-500 items-center justify-center"
          >
            <Text className="text-xl font-bold text-white">+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stack info */}
      <View className="bg-neutral-100 rounded-2xl px-5 py-4">
        <Text className="text-xs font-mono text-neutral-500 leading-6">
          stack: expo{'\n'}
          engine: arkzen v10.1{'\n'}
          tatemono: hello-native{'\n'}
          screens: index, about
        </Text>
      </View>

    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_HelloNative_About() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('hello-native')
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
        <AboutScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_HelloNative_About
