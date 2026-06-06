// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — notification-test [React+Vite]
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-06T18:28:12.533Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Bell, BellRing, Database, Globe, Mail, Radio } from 'lucide-react'

if (typeof window !== 'undefined') {
  setActiveTatemono('notification-test')
}

// ─────────────────────────────────────────────
// REVERB CONFIG — read from env, same as useWebSocket.ts
// ─────────────────────────────────────────────
export const REVERB_HOST   = import.meta.env.VITE_REVERB_HOST    ?? 'localhost'
export const REVERB_PORT   = import.meta.env.VITE_REVERB_PORT    ?? '8080'
export const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME  ?? 'ws'
export const APP_KEY       = import.meta.env.VITE_REVERB_APP_KEY ?? 'arkzen-key'
