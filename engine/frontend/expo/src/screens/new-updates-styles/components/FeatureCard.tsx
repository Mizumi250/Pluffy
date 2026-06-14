// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — FeatureCard [Expo]
// Source: @arkzen:native:components (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:28:51.858Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Code, Layers, Palette, Zap } from 'lucide-react-native'
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { COLOR_MAP } from './constants'
import type { NativeColor } from './types'

export const FeatureCard = ({
  icon,
  title,
  description,
  color,
  onPress,
  expanded = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: NativeColor
  onPress?: () => void
  expanded?: boolean
}) => {
  const c = COLOR_MAP[color]
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`rounded-2xl border-2 p-5 mb-3 ${c.bg} ${c.border}`}
    >
      <View className="mb-2">{icon}</View>
      <Text className={`font-bold text-base mb-1 ${c.text}`}>{title}</Text>
      <Text className={`text-sm leading-5 opacity-80 ${c.text}`}>{description}</Text>
      {expanded && (
        <View className="mt-3 bg-white/60 rounded-xl p-3">
          <Text className="text-xs text-neutral-500">Tap another card to explore more features.</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

// ── Data ─────────────────────────────────────────────────────
