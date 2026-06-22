// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — GhostBtn
// Source: @arkzen:native:components:lynx:* (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T05:22:16.031Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

// ── Ghost button ──────────────────────────────────────────────
export const GhostBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label: string
  onPress: () => void
  loading?: boolean
}) => (
  <view
    bindtap={loading ? undefined : onPress}
    className="py-3 px-5 rounded-2xl border border-neutral-200 items-center"
    style={{ backgroundColor: '#ffffff' }}
  >
    <text className="text-neutral-600 text-sm font-medium">{loading ? '...' : label}</text>
  </view>
)

// ── Role badge ────────────────────────────────────────────────
