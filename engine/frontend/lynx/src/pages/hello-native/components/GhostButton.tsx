// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — GhostButton
// Source: @arkzen:native:components:lynx:* (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:51.468Z
// ============================================================

import React, { Text, TouchableOpacity, View, useState } from '@lynx-js/react'

// ── Ghost button ──────────────────────────────────────────────
export const GhostButton = ({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="rounded-2xl py-4 px-6 items-center border border-neutral-200"
  >
    <Text className="text-neutral-600 font-medium text-base">{label}</Text>
  </TouchableOpacity>
)

// ── Section card ──────────────────────────────────────────────
