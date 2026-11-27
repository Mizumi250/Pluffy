'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — BrandIcon
// Source: @arkzen:components (oauth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:14:59.139Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Check, CircleCheck, CircleDashed, Copy, KeyRound, LogOut, RefreshCw, Server, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'
import type { OAuthProviderInfo } from './types'

export const BrandIcon = ({ provider, size = 18 }: { provider: OAuthProviderInfo; size?: number }) => (
  <svg width={size} height={size} viewBox={provider.vb} fill={provider.color} aria-hidden="true" focusable="false">
    <path d={provider.d} />
  </svg>
)

// Same key mark as the favicon
