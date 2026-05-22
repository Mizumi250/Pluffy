// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — notification-test
// React island components — rendered with client:load in .astro pages
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-22T05:32:13.565Z
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
const REVERB_HOST   = import.meta.env.PUBLIC_REVERB_HOST    ?? 'localhost'
const REVERB_PORT   = import.meta.env.PUBLIC_REVERB_PORT    ?? '8080'
const REVERB_SCHEME = import.meta.env.PUBLIC_REVERB_SCHEME  ?? 'ws'
const APP_KEY       = import.meta.env.PUBLIC_REVERB_APP_KEY ?? 'arkzen-key'
