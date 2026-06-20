// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryBtn
// Source: @arkzen:native:components:lynx:* (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.988Z
// ============================================================

import React from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import React, { useEffect, useState } from 'react'

// ── Primary button ─────────────────────────────────────────────
export const PrimaryBtn = ({
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
    className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold transition-colors disabled:opacity-50"
    style={{ backgroundColor: loading ? '#a3a3a3' : '#171717' }}
  >
    {loading ? '...' : label}
  </button>
)

// ── Ghost button ──────────────────────────────────────────────
