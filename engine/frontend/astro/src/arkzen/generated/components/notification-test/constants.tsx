// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — notification-test
// Source: @arkzen:components (notification-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T06:43:55.194Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Bell, BellRing, Database, Globe, Mail, Radio } from 'lucide-react'

// ─────────────────────────────────────────────
// REVERB CONFIG — read from env, same as useWebSocket.ts
// ─────────────────────────────────────────────
export const REVERB_HOST   = import.meta.env.PUBLIC_REVERB_HOST    ?? 'localhost'

export const REVERB_PORT   = import.meta.env.PUBLIC_REVERB_PORT    ?? '8080'

export const REVERB_SCHEME = import.meta.env.PUBLIC_REVERB_SCHEME  ?? 'ws'

export const APP_KEY       = import.meta.env.PUBLIC_REVERB_APP_KEY ?? 'arkzen-key'
