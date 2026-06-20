// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — GhostBtn
// Source: @arkzen:native:components:lynx:* (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.990Z
// ============================================================

import React from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import React, { useEffect, useState } from 'react'

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
  <button
    onClick={onPress}
    disabled={loading}
    className="py-3 px-5 rounded-2xl text-sm font-medium border border-neutral-200 bg-white text-neutral-600 transition-colors disabled:opacity-50"
  >
    {loading ? '...' : label}
  </button>
)

// ── Role badge ────────────────────────────────────────────────
