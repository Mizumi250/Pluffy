'use client'
// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — events-test
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T23:45:59.850Z
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
