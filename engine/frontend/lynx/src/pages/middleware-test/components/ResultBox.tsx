// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ResultBox
// Source: @arkzen:native:components:lynx:* (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.072Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'
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
