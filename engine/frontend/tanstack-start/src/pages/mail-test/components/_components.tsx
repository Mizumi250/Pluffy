// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — mail-test [TanStack]
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T13:04:09.528Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { CheckCircle, Clock, LogOut, Mail, RefreshCw, Send, XCircle } from 'lucide-react'

if (typeof window !== 'undefined') {
  setActiveTatemono('mail-test')
}

export interface MailLog {
  id:         number
  to_email:   string
  subject:    string
  mail_class: string
  status:     string
  error:      string | null
  created_at: string
}

export interface MailType {
  key:    string
  label:  string
  desc:   string
  fields: Record<string, string>
}
