// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryButton
// Source: @arkzen:native:components:lynx:* (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:40.578Z
// ============================================================

import { useState } from '@lynx-js/react'

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
  <view
    bindtap={disabled ? undefined : onPress}
    className={`rounded-2xl py-4 px-6 items-center ${
      disabled ? 'bg-indigo-200' : 'bg-indigo-500'
    }`}
  >
    <text className="text-white font-semibold text-base tracking-wide">
      {label}
    </text>
  </view>
)

// ── Ghost button ──────────────────────────────────────────────
