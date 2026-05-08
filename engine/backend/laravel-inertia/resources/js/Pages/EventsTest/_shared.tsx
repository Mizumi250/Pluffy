// ============================================================
// ARKZEN GENERATED SHARED — events-test [React+Inertia]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-08T01:35:29.472Z
// ============================================================

import { Flame, Zap } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

interface EventLogEntry {
  id:           number
  event_name:   string
  listener_name: string
  status:       string
  payload:      string | null
  duration_ms:  number | null
  created_at:   string
}
