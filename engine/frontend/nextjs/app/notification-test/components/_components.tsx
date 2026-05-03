'use client'
// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — notification-test
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-03T02:58:33.225Z
// ============================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BellRing, Database, Globe, Mail, Radio } from 'lucide-react'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

if (typeof window !== 'undefined') {
  setActiveTatemono('notification-test')
}

// ─────────────────────────────────────────────
// REVERB CONFIG — read from env, same as useWebSocket.ts
// ─────────────────────────────────────────────
const REVERB_HOST   = process.env.NEXT_PUBLIC_REVERB_HOST    ?? 'localhost'
const REVERB_PORT   = process.env.NEXT_PUBLIC_REVERB_PORT    ?? '8080'
const REVERB_SCHEME = process.env.NEXT_PUBLIC_REVERB_SCHEME  ?? 'ws'
const APP_KEY       = process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? 'arkzen-key'
