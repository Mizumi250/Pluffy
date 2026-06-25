// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — CatBadge [Expo]
// Source: @arkzen:native:components (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:31:09.350Z
// ============================================================

import React from 'react'
import { Image, ScrollView, Text, View } from 'react-native'

// ── Category badge ────────────────────────────────────────────
export const CatBadge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-indigo-600 tracking-wide">{label}</Text>
  </View>
)

// ── Asset row ─────────────────────────────────────────────────
// Shows image preview for image assets, plain row for everything else
