// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Field
// Source: @arkzen:native:components:lynx:* (auth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:48.267Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'
import { setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'

// ── Input field ───────────────────────────────────────────────
export const Field = ({
  placeholder,
  value,
  onInput,
  secureTextEntry = false,
}: {
  placeholder:      string
  value:            string
  onInput:          (v: string) => void
  secureTextEntry?: boolean
}) => (
  <TextInput
    style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 13, color: '#171717' }}
    placeholder={placeholder}
    value={value}
    onInput={e => onInput(e.detail.value)}
    type={secureTextEntry ? 'password' : 'text'}
  />
)

// ── Error box ─────────────────────────────────────────────────
