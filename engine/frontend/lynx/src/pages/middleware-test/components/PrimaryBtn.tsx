// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryBtn
// Source: @arkzen:native:components:lynx:* (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.068Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'

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
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    className={`flex-1 py-3 rounded-2xl items-center ${loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
  >
    {loading
      ? <Text className="text-neutral-500 text-xs font-semibold">Loading…</Text>
      : <Text className="text-white text-xs font-semibold">{label}</Text>
    }
  </TouchableOpacity>
)

// ── Ghost button ──────────────────────────────────────────────
