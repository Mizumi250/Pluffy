// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — PrimaryButton [Expo]
// Source: @arkzen:native:components (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T05:11:46.318Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'

// ── Primary button ────────────────────────────────────────────
export const PrimaryButton = ({
  label,
  onPress,
  disabled = false,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.82}
    className={`rounded-2xl py-4 px-6 items-center ${
      disabled ? 'bg-indigo-200' : 'bg-indigo-500'
    }`}
  >
    <Text className="text-white font-semibold text-base tracking-wide">
      {label}
    </Text>
  </TouchableOpacity>
)

// ── Ghost button ──────────────────────────────────────────────
