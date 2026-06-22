// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Field
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T05:22:11.129Z
// ============================================================

import { useCallback, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

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
  type?:        'text' | 'password' | 'email' | 'number' | 'tel' | 'digit'
}) => (
  <input
    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    type={type}
    placeholder={placeholder}
    bindinput={e => onChangeText(e.detail.value)}
  />
)

// ── Error box ─────────────────────────────────────────────────
