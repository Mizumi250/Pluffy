'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ProviderStatus
// Source: @arkzen:components (oauth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:40:39.881Z
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

export const ProviderStatus = () => {
  const { enabled, loading, reload } = useOAuthProviders()
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-neutral-900"><Server size={16} /> Provider status</h3>
        <button
          type="button"
          onClick={reload}
          aria-label="Refresh provider status"
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a34]"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <ul className="divide-y divide-neutral-100">
        {OAUTH_PROVIDER_LIST.map(p => {
          const on = enabled.includes(p.id)
          return (
            <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
              <BrandIcon provider={p} size={16} />
              <span className="flex-1 text-neutral-800">{p.label}</span>
              {on
                ? <span className="flex items-center gap-1 text-emerald-700"><CircleCheck size={15} /> Keys found</span>
                : <span className="flex items-center gap-1 text-neutral-400"><CircleDashed size={15} /> No keys</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
