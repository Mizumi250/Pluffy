// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryBtn
// Source: @arkzen:native:components:lynx:* (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T02:50:32.259Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

// ── Primary button ─────────────────────────────────────────────
export const PrimaryBtn = ({
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
    className="w-full py-3.5 rounded-2xl items-center"
    style={{ backgroundColor: loading ? '#a3a3a3' : '#171717' }}
  >
    <text className="text-white text-sm font-semibold">{loading ? '...' : label}</text>
  </view>
)

// ── Ghost button ──────────────────────────────────────────────
