// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — events-test
// React island components — rendered with client:load in .astro pages
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-30T07:25:35.731Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Flame, Zap } from 'lucide-react'

interface EventLogEntry {
  id:            number
  event_name:    string
  listener_name: string
  status:        string
  payload:       string | null
  duration_ms:   number | null
  created_at:    string
}
