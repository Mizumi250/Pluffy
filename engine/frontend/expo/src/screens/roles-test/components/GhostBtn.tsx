// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — GhostBtn [Expo]
// Source: @arkzen:native:components (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T09:28:05.400Z
// ============================================================

import React, { useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

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
    className="py-3 px-5 rounded-2xl items-center border border-neutral-200"
  >
    {loading
      ? <ActivityIndicator size="small" color="#737373" />
      : <Text className="text-neutral-600 text-sm font-medium">{label}</Text>
    }
  </TouchableOpacity>
)

// ── Role badge ────────────────────────────────────────────────
