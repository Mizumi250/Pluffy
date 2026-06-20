// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Badge
// Source: @arkzen:native:components:lynx:* (hello-native)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:03.921Z
// ============================================================

import { useState } from '@lynx-js/react'

// ── Pill badge ────────────────────────────────────────────────
export const Badge = ({ label }: { label: string }) => (
  <view className="px-3 py-1 bg-indigo-100 rounded-full self-start">
    <text className="text-xs font-semibold text-indigo-600 tracking-wide">
      {label}
    </text>
  </view>
)

// ── Primary button ────────────────────────────────────────────
