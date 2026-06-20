// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryBtn
// Source: @arkzen:native:components:lynx:* (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:06.175Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'

// ── Primary button ────────────────────────────────────────────
export const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
}) => (
  <view
    bindtap={loading ? undefined : onPress}
    className={`flex-1 py-3 rounded-2xl items-center ${loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
  >
    {loading
      ? <text className="text-neutral-500 text-xs font-semibold">Loading…</text>
      : <text className="text-white text-xs font-semibold">{label}</text>
    }
  </view>
)

// ── Ghost button ──────────────────────────────────────────────
