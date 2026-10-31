// ============================================================
// ARKZEN GENERATED TYPES — events-test
// Source: @arkzen:components (events-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:20:56.538Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Flame, Zap } from 'lucide-react'

export interface EventLogEntry {
  id:            number
  event_name:    string
  listener_name: string
  status:        string
  payload:       string | null
  duration_ms:   number | null
  created_at:    string
}
