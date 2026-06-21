// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — crud-test
// Source: @arkzen:native:components:lynx:* (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T10:20:19.932Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import { BACKEND_URL } from './constants'
import type { FormData } from './types'

export const emptyForm: FormData = { name: '', description: '', status: 'active', priority: '0', tags: '' }

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

// ── Status badge ──────────────────────────────────────────────
