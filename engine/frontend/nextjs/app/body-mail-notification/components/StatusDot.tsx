'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — StatusDot
// Source: @arkzen:components (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:15.855Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { useRouter } from 'next/navigation'
import type { SendLogEntry } from './types'

export const StatusDot = ({ status }: { status: string }) => (
  <span style={{
    display: 'inline-block',
    width: 8, height: 8,
    borderRadius: '50%',
    background: status === 'sent' ? '#22c55e' : '#ef4444',
    marginRight: 6,
    verticalAlign: 'middle',
  }} />
)
