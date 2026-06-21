// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatusDot
// Source: @arkzen:native:components:lynx:* (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T12:05:06.411Z
// ============================================================

import { useCallback, useEffect, useRef, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import type { WsStatus } from './types'

// ── Status dot — dynamic bg color can't be a static Tailwind class, use inline
export const StatusDot = ({ status }: { status: WsStatus }) => {
  const color = status === 'connected' ? '#4ade80' : status === 'connecting' ? '#facc15' : '#f87171'
  return <view style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
}

// ── Channel card ──────────────────────────────────────────────
