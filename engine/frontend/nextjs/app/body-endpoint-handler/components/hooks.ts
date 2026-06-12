'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — body-endpoint-handler
// Source: @arkzen:components (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T14:35:57.842Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

export function useToast() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const show = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }, [])
  return {
    toast,
    success: (msg: string) => show('success', msg),
    error:   (msg: string) => show('error', msg),
  }
}

type ProbeResult = {
  id:         number
  source:     string
  probe:      string
  payload:    string | null
  result:     string | null
  ok:         boolean
  created_at: string
}

type Stats = {
  injected: boolean
  builder:  string
  method:   string
  total:    number
  passed:   number
  failed:   number
  sources:  string[]
}
