// ============================================================
// ARKZEN ENGINE — SHARED GUEST LAYOUT v1.0
// Framework-agnostic. Router calls injected via useArkzenRouter().
//
// TWO GUARD MODES:
//   redirectIfAuth / guestOnly → bounce authed users to dashboard
//   Neither                    → fully public, no redirect
//
// This file lives in engine/shared and is sync-copied into
// each stack's arkzen/core/layouts/ by shared-sync.ts.
// DO NOT import from next/navigation or react-router-dom here.
// ============================================================

import React, { useEffect, useState } from 'react'
import { useArkzenRouter, useArkzenPathname } from '../adapters/router'
import { useAuthStore } from '../stores/authStore'

export interface GuestLayoutProps {
  children:        React.ReactNode
  redirectIfAuth?: boolean
  guestOnly?:      boolean
  redirectTo?:     string
  className?:      string
}

export const GuestLayout: React.FC<GuestLayoutProps> = ({
  children,
  redirectIfAuth = false,
  guestOnly      = false,
  redirectTo,
  className = '',
}) => {
  const router                              = useArkzenRouter()
  const pathname                            = useArkzenPathname()
  const { isAuthenticated, fetchMe, token } = useAuthStore()
  const shouldGuard                         = redirectIfAuth || guestOnly
  const [checking, setChecking]             = useState(shouldGuard)

  useEffect(() => {
    if (!shouldGuard) { setChecking(false); return }

    if (useAuthStore.getState().isAuthenticated) {
      const segments = pathname.split('/').filter(Boolean)
      const tatemono = segments[0] ?? ''
      router.replace(redirectTo ?? (tatemono ? `/${tatemono}/dashboard` : '/dashboard'))
      return
    }

    const check = async () => {
      if (token && !isAuthenticated) await fetchMe()
      if (useAuthStore.getState().isAuthenticated) {
        const segments = pathname.split('/').filter(Boolean)
        const tatemono = segments[0] ?? ''
        router.replace(redirectTo ?? (tatemono ? `/${tatemono}/dashboard` : '/dashboard'))
      } else {
        setChecking(false)
      }
    }

    check()
  }, [shouldGuard, token])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}
