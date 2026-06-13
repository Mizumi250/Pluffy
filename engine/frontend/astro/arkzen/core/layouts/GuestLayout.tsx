// ============================================================
// ARKZEN ENGINE — SHARED GUEST LAYOUT v1.4
// Framework-agnostic. Router calls injected via useArkzenRouter().
//
// v1.4 — Wraps children in ToastProvider so useToast() works
//   inside any page using GuestLayout, on all stacks.
//
// v1.3 — Two-phase guard: one-shot mount check + reactive watch
//   for post-login redirect.
// v1.2 — One-shot ref to prevent fetchMe loop.
// v1.1 — useAuthStoreHydrated() gate for MPA stacks.
//
// This file lives in engine/shared and is sync-copied into
// each stack's arkzen/core/layouts/ by shared-sync.ts.
// DO NOT import from next/navigation or react-router-dom here.
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { useArkzenRouter, useArkzenPathname } from '../adapters/router'
import { useAuthStore, setActiveTatemono, useAuthStoreHydrated } from '../stores/authStore'
import { ToastProvider } from '../components/Toast'

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
  const [checking, setChecking] = useState(shouldGuard)
  const [ready, setReady]       = useState(false)
  const checked                 = useRef(false)

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

    const segments = pathname.split('/').filter(Boolean)
    const tatemono = segments[0] ?? ''
    if (tatemono) setActiveTatemono(tatemono)

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

  // Phase 2 — reactive: redirect when login() succeeds while on this page
  useEffect(() => {
    if (!ready) return
    if (!shouldGuard) return
    if (!isAuthenticated) return
    router.replace(getDashboard())
  }, [isAuthenticated, ready])

  const content = checking ? (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
    </div>
  ) : (
    <div className={className}>
      {children}
    </div>
  )

  return (
    <ToastProvider position="top-right">
      {content}
    </ToastProvider>
  )
}