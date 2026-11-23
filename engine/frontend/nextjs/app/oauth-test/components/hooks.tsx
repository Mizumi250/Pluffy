'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — oauth-test
// Source: @arkzen:components (oauth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:04:35.620Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Check, CircleCheck, CircleDashed, Copy, KeyRound, LogOut, RefreshCw, Server, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'
import type { OAuthProviderInfo } from './types'

export const useOAuthProviders = () => {
  const [enabled, setEnabled] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const list = await getOAuthProviders()
    setEnabled(Array.isArray(list) ? list : [])
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  return { enabled, loading, reload }
}

export const useSignOut = () => {
  const router = useArkzenRouter()
  const { logout } = useAuthStore()
  return async () => {
    await logout()
    router.replace('/oauth-test/login')
  }
}
