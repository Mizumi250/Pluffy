// ============================================================
// ARKZEN GENERATED TYPES — oauth-test
// Source: @arkzen:components (oauth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:04:07.408Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Check, CircleCheck, CircleDashed, Copy, KeyRound, LogOut, RefreshCw, Server, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'

export interface OAuthProviderInfo {
  id:    string
  label: string
  env:   string
  color: string
  vb:    string
  d:     string
}

// Brand glyphs: Simple Icons (CC0) and Font Awesome Free brands (CC BY 4.0)
