// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryBtn
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:29.278Z
// ============================================================

import { useCallback, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

// ── Primary button ────────────────────────────────────────────
export const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
  className = 'bg-neutral-900',
}: {
  label:      string
  onPress:    () => void
  loading?:   boolean
  className?: string
}) => (
  <view
    bindtap={loading ? undefined : onPress}
    className={`w-full py-3.5 rounded-2xl items-center ${loading ? 'bg-neutral-300' : className}`}
  >
    <text className="text-white text-sm font-semibold">
      {loading ? '…' : label}
    </text>
  </view>
)

// ── Kind badge ────────────────────────────────────────────────
