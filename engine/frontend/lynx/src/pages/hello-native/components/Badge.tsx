// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Badge
// Source: @arkzen:native:components:lynx:* (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:51.456Z
// ============================================================

import React, { Text, TouchableOpacity, View, useState } from '@lynx-js/react'

// ── Pill badge ────────────────────────────────────────────────
export const Badge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-indigo-600 tracking-wide">
      {label}
    </Text>
  </View>
)

// ── Primary button ────────────────────────────────────────────
