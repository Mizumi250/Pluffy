// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — GhostBtn
// Source: @arkzen:native:components:lynx:* (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.070Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'
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
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    className="flex-1 py-3 rounded-2xl items-center border border-neutral-200"
  >
    {loading
      ? <Text className="text-neutral-400 text-xs font-medium">Loading…</Text>
      : <Text className="text-neutral-600 text-xs font-medium">{label}</Text>
    }
  </TouchableOpacity>
)

// ── Result box ────────────────────────────────────────────────
