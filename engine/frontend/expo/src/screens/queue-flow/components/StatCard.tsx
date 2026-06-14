// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StatCard [Expo]
// Source: @arkzen:native:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T07:22:19.021Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import * as Speech from 'expo-speech'
import { Volume2 } from 'lucide-react-native'
import { ActivityIndicator, Animated, Easing, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <View className="flex-1 bg-white rounded-2xl border border-neutral-100 p-4 items-center gap-1">
    <Text className="text-2xl font-black text-neutral-900">{value}</Text>
    <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</Text>
    {sub ? <Text className="text-xs text-neutral-300">{sub}</Text> : null}
  </View>
)

// ─── Spinning ring for Display screen ────────────────────────────────────────
