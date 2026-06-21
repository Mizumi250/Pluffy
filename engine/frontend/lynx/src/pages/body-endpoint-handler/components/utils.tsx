// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — body-endpoint-handler
// Source: @arkzen:native:components:lynx:* (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:50.686Z
// ============================================================

import { useCallback, useEffect, useState } from '@lynx-js/react'
import { BACKEND_URL } from './constants'

export const sourceColor = (s: string) =>
  s === 'handler-body'   ? '#7c3aed' :
  s === 'endpoint-body'  ? '#0891b2' : '#64748b'

// ── Badge ─────────────────────────────────────────────────────

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
