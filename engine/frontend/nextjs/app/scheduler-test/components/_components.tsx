'use client'
// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — scheduler-test
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-13T10:27:11.418Z
// ============================================================

'use client'

import React                        from 'react'
import { Activity, BarChart3, Clock3, RefreshCw, Trash2 } from 'lucide-react'
import { useMutation }              from '@/arkzen/core/hooks/useMutation'
import { useQuery }                 from '@/arkzen/core/hooks/useQuery'
import { useToast }                 from '@/arkzen/core/components/Toast'

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
