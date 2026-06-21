// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — GhostBtn
// Source: @arkzen:native:components:lynx:* (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T02:50:31.415Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import type { Result } from './types'

// ── Ghost button ──────────────────────────────────────────────
export const GhostBtn = ({
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
    className="flex-1 py-3 rounded-2xl items-center border border-neutral-200"
  >
    {loading
      ? <text className="text-neutral-400 text-xs font-medium">Loading…</text>
      : <text className="text-neutral-600 text-xs font-medium">{label}</text>
    }
  </view>
)

// ── Result box ────────────────────────────────────────────────
