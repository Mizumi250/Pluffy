// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Card [Expo]
// Source: @arkzen:native:components (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T07:05:50.028Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'

// ── Section card ──────────────────────────────────────────────
export const Card = ({
  title,
  body,
}: {
  title: string
  body: string
}) => (
  <View className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm mb-3">
    <Text className="text-sm font-semibold text-neutral-800 mb-1">{title}</Text>
    <Text className="text-sm text-neutral-500 leading-5">{body}</Text>
  </View>
)
