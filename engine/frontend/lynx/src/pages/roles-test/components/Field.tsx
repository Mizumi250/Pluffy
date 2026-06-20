// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Field
// Source: @arkzen:native:components:lynx:* (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:27:35.552Z
// ============================================================

import React, { useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

// ── Input field ───────────────────────────────────────────────
export const Field = ({
  placeholder,
  value,
  onInput,
  secureTextEntry = false,
}: {
  placeholder: string
  value: string
  onInput: (v: string) => void
  secureTextEntry?: boolean
}) => (
  <input
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 w-full"
    placeholder={placeholder}
    value={value}
    bindinput={e => onInput(e.detail.value)}
    type={secureTextEntry ? 'password' : 'text'}
  />
)

// ── Error box ─────────────────────────────────────────────────
