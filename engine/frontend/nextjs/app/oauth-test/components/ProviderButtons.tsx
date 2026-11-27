'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ProviderButtons
// Source: @arkzen:components (oauth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T06:51:44.416Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { consumeOAuthError, getOAuthProviders, oauthLoginUrl, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Check, CircleCheck, CircleDashed, Copy, KeyRound, LogOut, RefreshCw, Server, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'
import { OAUTH_PROVIDER_LIST } from './constants'
import { useOAuthProviders } from './hooks'
import type { OAuthProviderInfo } from './types'
import { BrandIcon } from './BrandIcon'

export const ProviderButtons = () => {
  const { enabled, loading } = useOAuthProviders()
  const [busy, setBusy] = useState<string | null>(null)

  const start = (id: string) => {
    setBusy(id)
    window.location.href = oauthLoginUrl(id)
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {OAUTH_PROVIDER_LIST.map(p => {
          const on = enabled.includes(p.id)
          return (
            <button
              key={p.id}
              type="button"
              disabled={!on || loading || busy !== null}
              onClick={() => start(p.id)}
              aria-label={`Continue with ${p.label}`}
              className={
                'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ' +
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a34] ' +
                (on
                  ? 'border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50'
                  : 'border-dashed border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed')
              }
            >
              <span className={on ? '' : 'opacity-40'}><BrandIcon provider={p} /></span>
              <span className="truncate">{busy === p.id ? 'Redirecting…' : p.label}</span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-neutral-500">
        {loading
          ? 'Checking which providers the backend has keys for…'
          : enabled.length === 0
            ? 'No providers reported. The backend is unreachable or has no keys in its .env yet.'
            : `${enabled.length} of ${OAUTH_PROVIDER_LIST.length} providers have keys in the backend .env.`}
      </p>
    </div>
  )
}
