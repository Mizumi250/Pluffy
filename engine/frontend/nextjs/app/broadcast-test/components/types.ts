// ============================================================
// ARKZEN GENERATED TYPES — broadcast-test
// Source: @arkzen:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:17.711Z
// ============================================================

import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Radio } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ── ChannelPanel — top-level memo so it never remounts on parent re-render.
// Defined outside DashboardPage to preserve input focus on mobile (Android keyboard
// dismisses when a component is unmounted/remounted, which happens if Panel is an
// inline const inside a parent that re-renders on every keystroke).
export type WsStatus = 'connecting' | 'connected' | 'error'

export interface Message {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}
