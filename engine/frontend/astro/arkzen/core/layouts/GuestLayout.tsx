// ============================================================
// ARKZEN ENGINE — SHARED GUEST LAYOUT v1.3
// Framework-agnostic. Router calls injected via useArkzenRouter().
//
// TWO GUARD MODES:
//   redirectIfAuth / guestOnly → bounce authed users to dashboard
//   Neither                    → fully public, no redirect
//
// v1.3 — Two-phase guard:
//   Phase 1 (mount, one-shot): checks auth state after hydration.
//     If already authenticated → redirect to dashboard immediately.
//     If token but not authenticated → fetchMe once to verify.
//     If no token → show the page (guest is welcome).
//   Phase 2 (reactive): watches isAuthenticated in the store.
//     Handles the case where login() succeeds while on this page —
//     the page component calls login() but doesn't navigate itself,
//     so GuestLayout detects the state change and redirects.
//     Skipped until phase 1 is done to avoid acting on stale state.
//
// This file lives in engine/shared and is sync-copied into
// each stack's arkzen/core/layouts/ by shared-sync.ts.
// DO NOT import from next/navigation or react-router-dom here.
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { useArkzenRouter, useArkzenPathname } from '../adapters/router'
import { useAuthStore, useAuthStoreHydrated } from '../stores/authStore'

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
  const router              = useArkzenRouter()
  const pathname            = useArkzenPathname()
  const hydrated            = useAuthStoreHydrated()
  const { isAuthenticated } = useAuthStore()
  const shouldGuard         = redirectIfAuth || guestOnly
  const [checking, setChecking]   = useState(shouldGuard)
  const [ready, setReady]         = useState(false)   // phase 1 complete
  const checked                   = useRef(false)

  const getDashboard = () => {
    const segments = pathname.split('/').filter(Boolean)
    const tatemono = segments[0] ?? ''
    return redirectTo ?? (tatemono ? `/${tatemono}/dashboard` : '/dashboard')
  }

  // Phase 1 — one-shot mount check after hydration
  useEffect(() => {
    if (!hydrated) return
    if (checked.current) return
    checked.current = true

    if (!shouldGuard) { setChecking(false); setReady(true); return }

    const check = async () => {
      const { token, isAuthenticated, fetchMe } = useAuthStore.getState()

      if (isAuthenticated) {
        router.replace(getDashboard())
        return
      }

      if (token) {
        await fetchMe()
        if (useAuthStore.getState().isAuthenticated) {
          router.replace(getDashboard())
          return
        }
      }

      setChecking(false)
      setReady(true)
    }

    check()
  }, [hydrated])

  // Phase 2 — reactive watch: redirect if login() succeeds while on this page
  useEffect(() => {
    if (!ready) return           // don't act until phase 1 has resolved
    if (!shouldGuard) return
    if (!isAuthenticated) return
    router.replace(getDashboard())
  }, [isAuthenticated, ready])

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