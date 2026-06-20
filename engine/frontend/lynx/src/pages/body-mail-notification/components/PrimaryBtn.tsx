// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryBtn
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:49.061Z
// ============================================================

import React, { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'

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
  <button
    onClick={onPress}
    disabled={loading}
    className={`w-full py-3.5 rounded-2xl text-white text-sm font-semibold ${loading ? 'bg-neutral-300' : className}`}
  >
    {loading ? '…' : label}
  </button>
)

// ── Kind badge ────────────────────────────────────────────────
