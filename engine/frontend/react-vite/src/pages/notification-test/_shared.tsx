// ============================================================
// ARKZEN GENERATED SHARED — notification-test [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-04T02:57:32.907Z
// ============================================================

import React, { useState, useEffect, useRef } from 'react'import { Bell, BellRing, Database, Globe, Mail, Radio } from 'lucide-react'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

if (typeof window !== 'undefined') {
  setActiveTatemono('notification-test')
}

// ─────────────────────────────────────────────
// REVERB CONFIG — read from env, same as useWebSocket.ts
// ─────────────────────────────────────────────
const REVERB_HOST   = import.meta.env.VITE_REVERB_HOST    ?? 'localhost'
const REVERB_PORT   = import.meta.env.VITE_REVERB_PORT    ?? '8080'
const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME  ?? 'ws'
const APP_KEY       = import.meta.env.VITE_REVERB_APP_KEY ?? 'arkzen-key'
