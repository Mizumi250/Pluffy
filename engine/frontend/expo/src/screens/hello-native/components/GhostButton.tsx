// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — GhostButton [Expo]
// Source: @arkzen:native:components (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T03:23:49.043Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'

// ── Ghost button ──────────────────────────────────────────────
export const GhostButton = ({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}) => (
  <Pressable onPress={onPress} className="rounded-2xl py-4 px-6 items-center border border-neutral-200">
    <Text className="text-neutral-600 font-medium text-base">{label}</Text>
  </Pressable>
)

// ── Section card ──────────────────────────────────────────────
