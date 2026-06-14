// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — SpinRing [Expo]
// Source: @arkzen:native:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T03:19:10.480Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import * as Speech from 'expo-speech'
import { Volume2 } from 'lucide-react-native'
import { ActivityIndicator, Animated, Easing, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ─── Spinning ring for Display screen ────────────────────────────────────────

export const SpinRing = ({ label, sub }: { label: string; sub: string }) => {
  const spin = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })
    ).start()
  }, [])
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  return (
    <View className="items-center py-6">
      <View className="relative w-36 h-36 items-center justify-center">
        <Animated.View
          style={{ transform: [{ rotate }] }}
          className="absolute inset-0 rounded-full border-4 border-transparent"
          // We fake the arc with border-t coloured
        >
          <View
            className="w-full h-full rounded-full"
            style={{ borderWidth: 3, borderColor: 'transparent', borderTopColor: '#a4c5f5' }}
          />
        </Animated.View>
        <View className="items-center">
          <Text className="text-2xl font-black text-blue-900">{label}</Text>
          <Text className="text-xs text-blue-400 font-medium mt-0.5">{sub}</Text>
        </View>
      </View>
    </View>
  )
}
