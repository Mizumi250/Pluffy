// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryBtn
// Source: @arkzen:native:components:lynx:* (mail-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:27:34.266Z
// ============================================================

import React, { useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { Icon } from '@sigx/lynx-icons'

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
