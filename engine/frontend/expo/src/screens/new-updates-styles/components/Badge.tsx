// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Badge [Expo]
// Source: @arkzen:native:components (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T05:11:47.254Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Code, Layers, Palette, Zap } from 'lucide-react-native'
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'

/* @arkzen:resolved:import expo */
// ── Badge ─────────────────────────────────────────────────────
export const Badge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-blue-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-blue-600 tracking-wide">{label}</Text>
  </View>
)

// ── Primary button ────────────────────────────────────────────
