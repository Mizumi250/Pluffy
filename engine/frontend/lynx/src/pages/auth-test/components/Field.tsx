// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Field
// Source: @arkzen:native:components:lynx:* (auth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:45.606Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import { setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

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
  <input
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    bindinput={e => onInput(e.detail.value)}
    type={secureTextEntry ? 'password' : 'text'}
  />
)

// ── Error box ─────────────────────────────────────────────────
