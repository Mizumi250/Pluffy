'use client'
// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — notification-test
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T23:46:01.821Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Bell, BellRing, Database, Globe, Mail, Radio } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
