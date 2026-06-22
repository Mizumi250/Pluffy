// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — broadcast-test [React+Vite]
// Source: @arkzen:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T05:22:12.235Z
// ============================================================

import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Radio } from 'lucide-react'

export const REVERB_HOST   = import.meta.env.VITE_REVERB_HOST    ?? 'localhost'

export const REVERB_PORT   = import.meta.env.VITE_REVERB_PORT    ?? '8080'

export const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME  ?? 'ws'

export const APP_KEY       = import.meta.env.VITE_REVERB_APP_KEY ?? 'arkzen-key'

// ── ChannelPanel — top-level memo so it never remounts on parent re-render.
// Defined outside DashboardPage to preserve input focus on mobile (Android keyboard
// dismisses when a component is unmounted/remounted, which happens if Panel is an
// inline const inside a parent that re-renders on every keystroke).
