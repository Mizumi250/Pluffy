// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Field
// Source: @arkzen:native:components:lynx:* (mail-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:27:34.263Z
// ============================================================

import React, { useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { Icon } from '@sigx/lynx-icons'

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
  keyboardType?:    'default' | 'email-address' | 'numeric'
}) => (
  <input
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    value={value}
    bindinput={e => onChangeText(e.detail.value)}
    type={secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : 'text'}
  />
)

// ── Error box ─────────────────────────────────────────────────
