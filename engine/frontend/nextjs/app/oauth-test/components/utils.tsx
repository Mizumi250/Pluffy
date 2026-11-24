// ============================================================
// ARKZEN GENERATED UTILITIES — oauth-test
// Source: @arkzen:components (oauth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T11:53:49.430Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Check, CircleCheck, CircleDashed, Copy, KeyRound, LogOut, RefreshCw, Server, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'
import type { OAuthProviderInfo } from './types'


export const envKeysFor = (p: OAuthProviderInfo): string[] => {
  if (p.id === 'apple') {
    return ['OAUTH_APPLE_CLIENT_ID', 'OAUTH_APPLE_TEAM_ID', 'OAUTH_APPLE_KEY_ID', 'OAUTH_APPLE_PRIVATE_KEY']
  }
  const keys = [`OAUTH_${p.env}_CLIENT_ID`, `OAUTH_${p.env}_CLIENT_SECRET`]
  if (p.id === 'microsoft') keys.push('OAUTH_MICROSOFT_TENANT')
  return keys
}

export const callbackUrlFor = (id: string): string =>
  oauthLoginUrl(id).replace(/\/redirect$/, '/callback')
