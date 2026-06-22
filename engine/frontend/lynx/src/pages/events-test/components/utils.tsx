// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — events-test
// Source: @arkzen:native:components:lynx:* (events-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T00:05:28.534Z
// ============================================================

import { useCallback, useEffect, useRef, useState } from '@lynx-js/react'
import { Icon } from '../../../../arkzen/core/components/Icon'
import { BACKEND_URL } from './constants'

export const statusStyle = (s: string) => ({
  completed: { bg: 'bg-green-100',   text: 'text-green-700'   },
  running:   { bg: 'bg-yellow-100',  text: 'text-yellow-700'  },
  failed:    { bg: 'bg-red-100',     text: 'text-red-600'     },
}[s] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' })

export const eventColor = (key: string) => ({
  'user-signed-up': { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  'order-placed':   { bg: 'bg-green-50',  text: 'text-green-600'  },
  'data-exported':  { bg: 'bg-purple-50', text: 'text-purple-600' },
}[key] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' })

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
