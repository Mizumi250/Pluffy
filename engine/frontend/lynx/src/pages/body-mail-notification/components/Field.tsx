// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Field
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:49.057Z
// ============================================================

import React, { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'

// ── Input field ───────────────────────────────────────────────
export const Field = ({
  placeholder,
  value,
  onChangeText,
  type = 'text',
}: {
  placeholder:  string
  value:        string
  onChangeText: (v: string) => void
  type?:        string
}) => (
  <input
    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={e => onChangeText((e.target as HTMLInputElement).value)}
  />
)

// ── Error box ─────────────────────────────────────────────────
