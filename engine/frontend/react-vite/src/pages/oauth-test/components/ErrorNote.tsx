// ============================================================
// ARKZEN GENERATED COMPONENT — ErrorNote [React+Vite]
// Source: @arkzen:components (oauth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-21T15:26:02.190Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Check, CircleCheck, CircleDashed, Copy, KeyRound, LogOut, RefreshCw, Server, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'

export const ErrorNote = ({ message }: { message: string }) => (
  <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
    <TriangleAlert size={16} className="mt-0.5 shrink-0" />
    <span>{message}</span>
  </div>
);
