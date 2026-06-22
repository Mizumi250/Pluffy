// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — GhostButton
// Source: @arkzen:native:components:lynx:* (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T00:05:28.673Z
// ============================================================

import { useState } from '@lynx-js/react'

// ── Ghost button ──────────────────────────────────────────────
export const GhostButton = ({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}) => (
  <view
    bindtap={onPress}
    className="rounded-2xl py-4 px-6 items-center border border-neutral-200"
  >
    <text className="text-neutral-600 font-medium text-base">{label}</text>
  </view>
)

// ── Section card ──────────────────────────────────────────────
