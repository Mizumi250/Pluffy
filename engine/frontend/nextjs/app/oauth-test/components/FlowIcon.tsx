'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — FlowIcon
// Source: @arkzen:components (oauth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:04:07.431Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Check, CircleCheck, CircleDashed, Copy, KeyRound, LogOut, RefreshCw, Server, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'
import type { OAuthProviderInfo } from './types'

export const FlowIcon = ({ kind }: { kind: 'key' | 'shield' | 'phone' }) => {
  if (kind === 'shield') return <ShieldCheck size={18} />
  if (kind === 'phone') return <Smartphone size={18} />
  return <KeyRound size={18} />
}
