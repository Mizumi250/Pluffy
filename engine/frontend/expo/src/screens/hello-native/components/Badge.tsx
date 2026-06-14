// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Badge [Expo]
// Source: @arkzen:native:components (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T04:19:50.751Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'

// ── Pill badge ────────────────────────────────────────────────
export const Badge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-indigo-600 tracking-wide">
      {label}
    </Text>
  </View>
)

// ── Primary button ────────────────────────────────────────────
