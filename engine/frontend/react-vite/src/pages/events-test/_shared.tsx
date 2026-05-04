// ============================================================
// ARKZEN GENERATED SHARED — events-test [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-04T11:25:51.260Z
// ============================================================

import React, { useState, useEffect } from 'react'
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
