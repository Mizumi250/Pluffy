// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — NativeErrorScreen [Expo]
// Source: @arkzen:native:components (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T14:55:58.444Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { NATIVE_ERRORS } from './constants'

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
