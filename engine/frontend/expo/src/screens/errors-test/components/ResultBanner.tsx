// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ResultBanner [Expo]
// Source: @arkzen:native:components (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:11:58.532Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { NATIVE_ERRORS } from './constants'

export const ResultBanner = ({ result }: { result: { code: number; body: string } | null }) => {
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
