// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — GhostBtn [Expo]
// Source: @arkzen:native:components (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T06:15:39.032Z
// ============================================================

import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { Result } from './types'

// ── Ghost button ──────────────────────────────────────────────
export const GhostBtn = ({
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
    className="flex-1 py-3 rounded-2xl items-center border border-neutral-200"
  >
    {loading
      ? <ActivityIndicator size="small" color="#737373" />
      : <Text className="text-neutral-600 text-xs font-medium">{label}</Text>
    }
  </TouchableOpacity>
)

// ── Result box ────────────────────────────────────────────────
