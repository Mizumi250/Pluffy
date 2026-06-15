// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — GuideRow [Expo]
// Source: @arkzen:native:components (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T06:17:26.991Z
// ============================================================

import React from 'react'
import { Image, ScrollView, Text, View } from 'react-native'

// ── Guide row ─────────────────────────────────────────────────
export const GuideRow = ({ folder, desc }: { folder: string; desc: string }) => (
  <View className="py-2.5 border-b border-neutral-100">
    <Text className="text-xs font-mono text-indigo-500 mb-0.5">{folder}</Text>
    <Text className="text-xs text-neutral-400">{desc}</Text>
  </View>
)
