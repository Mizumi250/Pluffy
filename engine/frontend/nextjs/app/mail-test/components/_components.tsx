'use client'
// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — mail-test
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-13T13:31:36.069Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { CheckCircle, Clock, LogOut, Mail, RefreshCw, Send, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
