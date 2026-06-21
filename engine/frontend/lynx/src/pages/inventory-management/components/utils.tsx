// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — inventory-management
// Source: @arkzen:native:components:lynx:* (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:47.917Z
// ============================================================

import { useCallback, useEffect, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'
import { BACKEND_URL } from './constants'
import type { FormState } from './types'

export const emptyForm: FormState = { name: '', sku: '', quantity: '', price: '', category: '', description: '' }

export async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
  })
}

// ── Stat card ─────────────────────────────────────────────────
