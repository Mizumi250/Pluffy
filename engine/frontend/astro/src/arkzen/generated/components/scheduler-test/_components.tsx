// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — scheduler-test
// React island components — rendered with client:load in .astro pages
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-30T14:56:49.846Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/arkzen/core/components/Toast'
import { useMutation } from '@/arkzen/core/hooks/useMutation'
import { useQuery } from '@/arkzen/core/hooks/useQuery'
import { Activity, BarChart3, Clock3, RefreshCw, Trash2 } from 'lucide-react'

interface CommandRun {
  id:           number
  command_name: string
  signature:    string
  exit_code:    number
  output:       string | null
  triggered_by: string
  duration_ms:  number | null
  created_at:   string
}
