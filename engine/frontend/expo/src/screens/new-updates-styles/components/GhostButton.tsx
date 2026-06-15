// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — GhostButton [Expo]
// Source: @arkzen:native:components (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T06:14:54.391Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Code, Layers, Palette, Zap } from 'lucide-react-native'
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import type { Feature } from './types'

// ── Ghost button ─────────────────────────────────────────────
export const GhostButton = ({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}) => (
  <Pressable
    onPress={onPress}
    className="rounded-2xl py-4 px-6 items-center border border-neutral-200"
  >
    <Text className="text-neutral-600 font-medium text-base">{label}</Text>
  </Pressable>
)

// ── Feature card ─────────────────────────────────────────────
