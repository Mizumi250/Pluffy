'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — KindBadge
// Source: @arkzen:components (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T15:23:54.713Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { useRouter } from 'next/navigation'

export const KindBadge = ({ kind }: { kind: string }) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: kind === 'mail' ? '#dbeafe' : '#fef9c3',
    color:      kind === 'mail' ? '#1d4ed8' : '#a16207',
    letterSpacing: 0.5,
  }}>
    {kind === 'mail' ? '✉ MAIL' : '🔔 NOTIF'}
  </span>
)
