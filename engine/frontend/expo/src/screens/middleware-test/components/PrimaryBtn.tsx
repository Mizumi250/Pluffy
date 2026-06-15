// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — PrimaryBtn [Expo]
// Source: @arkzen:native:components (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T06:14:54.197Z
// ============================================================

import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Primary button ────────────────────────────────────────────
export const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    className={`flex-1 py-3 rounded-2xl items-center ${loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
  >
    {loading
      ? <ActivityIndicator size="small" color="#fff" />
      : <Text className="text-white text-xs font-semibold">{label}</Text>
    }
  </TouchableOpacity>
)

// ── Ghost button ──────────────────────────────────────────────
