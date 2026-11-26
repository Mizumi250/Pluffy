'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — BrandMark
// Source: @arkzen:components (oauth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:50.235Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Check, CircleCheck, CircleDashed, Copy, KeyRound, LogOut, RefreshCw, Server, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'
import type { OAuthProviderInfo } from './types'

// Same key mark as the favicon
export const BrandMark = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect width="32" height="32" rx="7" fill="#1f3a34" />
    <circle cx="16" cy="12.5" r="5.4" fill="#f4c95d" />
    <path d="M13.1 17.2h5.8l1.7 9.1h-9.2z" fill="#f4c95d" />
    <circle cx="16" cy="12.5" r="1.9" fill="#1f3a34" />
  </svg>
)
