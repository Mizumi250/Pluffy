// ============================================================
// ARKZEN GENERATED SHARED — events-test [React+Inertia]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-08T02:18:55.458Z
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
