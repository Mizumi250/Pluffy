// ============================================================
// ARKZEN GENERATED SCREEN — hello-native/about
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, TouchableOpacity, View, ScrollView } from 'react-native'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
// ── Pill badge ────────────────────────────────────────────────
export const Badge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-indigo-600 tracking-wide">
      {label}
    </Text>
  </View>
)

// ── Primary button ────────────────────────────────────────────
export const PrimaryButton = ({
  label,
  onPress,
  disabled = false,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.82}
    className={`rounded-2xl py-4 px-6 items-center ${
      disabled ? 'bg-indigo-200' : 'bg-indigo-500'
    }`}
  >
    <Text className="text-white font-semibold text-base tracking-wide">
      {label}
    </Text>
  </TouchableOpacity>
)

// ── Ghost button ──────────────────────────────────────────────
export const GhostButton = ({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}) => (
  <Pressable onPress={onPress} className="rounded-2xl py-4 px-6 items-center border border-neutral-200">
    <Text className="text-neutral-600 font-medium text-base">{label}</Text>
  </Pressable>
)

// ── Section card ──────────────────────────────────────────────
export const Card = ({
  title,
  body,
}: {
  title: string
  body: string
}) => (
  <View className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm mb-3">
    <Text className="text-sm font-semibold text-neutral-800 mb-1">{title}</Text>
    <Text className="text-sm text-neutral-500 leading-5">{body}</Text>
  </View>
)

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
      <StatusBar style="dark" />
      
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
