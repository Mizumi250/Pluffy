// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ResultBox [Expo]
// Source: @arkzen:native:components (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T02:27:40.520Z
// ============================================================

import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { Result, ResultStatus } from './types'

// ── Result box ────────────────────────────────────────────────
export const ResultBox = ({ result }: { result: Result }) => {
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
