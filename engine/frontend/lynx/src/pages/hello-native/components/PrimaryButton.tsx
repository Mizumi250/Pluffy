// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryButton
// Source: @arkzen:native:components:lynx:* (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:51.466Z
// ============================================================

import React, { Text, TouchableOpacity, View, useState } from '@lynx-js/react'

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
