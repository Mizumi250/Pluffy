// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryBtn
// Source: @arkzen:native:components:lynx:* (auth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T05:22:10.420Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import { setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

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
    className={`py-3.5 rounded-2xl items-center ${loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
  >
    <text className="text-white text-sm font-semibold">
      {loading ? 'Loading…' : label}
    </text>
  </view>
)
