// ============================================================
// ARKZEN GENERATED SHARED — mail-test [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-10T12:24:59.164Z
// ============================================================

import React, { useState, useEffect } from 'react'
import { Mail, Send, RefreshCw, LogOut, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

if (typeof window !== 'undefined') {
  setActiveTatemono('mail-test')
}

interface MailLog {
  id:         number
  to_email:   string
  subject:    string
  mail_class: string
  status:     string
  error:      string | null
  created_at: string
}

interface MailType {
  key:    string
  label:  string
  desc:   string
  fields: Record<string, string>
}
