'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — body-mail-notification
// Source: @arkzen:components (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T01:34:02.937Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { useRouter } from 'next/navigation'

export function useToast() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const show = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }, [])
  return {
    toast,
    success: (msg: string) => show('success', msg),
    error:   (msg: string) => show('error', msg),
  }
}

if (typeof window !== 'undefined') {
  setActiveTatemono('body-mail-notification')
}

type SendLogEntry = {
  id:         number
  kind:       'mail' | 'notification'
  subject:    string | null
  to_email:   string | null
  mail_class: string | null
  status:     'sent' | 'failed'
  error:      string | null
  created_at: string
}
