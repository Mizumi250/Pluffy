// ============================================================
// ARKZEN GENERATED SHARED — scheduler-test [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-04T11:25:52.929Z
// ============================================================

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
