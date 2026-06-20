// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — middleware-test
// Source: @arkzen:native:components:lynx:* (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:04.445Z
// ============================================================

import React, { useEffect, useState } from '@lynx-js/react'
import { BACKEND_URL } from './constants'

export async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
  })
}

// ── Primary button ────────────────────────────────────────────
