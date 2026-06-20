// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Field
// Source: @arkzen:native:components:lynx:* (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.986Z
// ============================================================

import React from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import React, { useEffect, useState } from 'react'

// ── Input field ───────────────────────────────────────────────
export const Field = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}: {
  placeholder:      string
  value:            string
  onChangeText:     (v: string) => void
  secureTextEntry?: boolean
  keyboardType?:    'default' | 'email' | 'numeric'
}) => (
  <input
    type={secureTextEntry ? 'password' : keyboardType === 'email' ? 'email' : 'text'}
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 w-full"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChangeText(e.target.value)}
    autoCapitalize="none"
    autoCorrect="off"
  />
)

// ── Error box ─────────────────────────────────────────────────
