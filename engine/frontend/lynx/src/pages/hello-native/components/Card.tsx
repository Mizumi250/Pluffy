// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Card
// Source: @arkzen:native:components:lynx:* (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:51.469Z
// ============================================================

import React, { Text, TouchableOpacity, View, useState } from '@lynx-js/react'

// ── Section card ──────────────────────────────────────────────
export const Card = ({
  title,
  body,
}: {
  title: string
  body: string
}) => (
  <View className="bg-white rounded-2xl p-5 border border-neutral-100 mb-3">
    <Text className="text-sm font-semibold text-neutral-800 mb-1">{title}</Text>
    <Text className="text-sm text-neutral-500 leading-5">{body}</Text>
  </View>
)
