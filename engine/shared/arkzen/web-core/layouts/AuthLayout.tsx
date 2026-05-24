// ============================================================
// ARKZEN ENGINE — SHARED AUTH LAYOUT v1.3
// Framework-agnostic. Router calls injected via useArkzenRouter().
//
// v1.3 — Wraps children in ToastProvider so useToast() works
//   inside any page using AuthLayout, on all stacks. On SPA
//   stacks the app-level ToastProvider takes precedence (React
//   context lookup walks up — inner provider is a no-op there).
//
// v1.2 — One-shot ref + smart fetchMe skip to prevent loops.
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

export interface AuthLayoutProps {
  children:     React.ReactNode
  requireAuth?: boolean
  redirectTo?:  string
  className?:   string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  requireAuth = true,
  redirectTo,
  className = '',
}) => {
  const router              = useArkzenRouter()
  const pathname            = useArkzenPathname()
  const hydrated            = useAuthStoreHydrated()
  const [checking, setChecking] = useState(requireAuth)
  const checked = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    if (checked.current) return
    checked.current = true

    const segments = pathname.split('/').filter(Boolean)
    const tatemono = segments[0] ?? ''
    if (tatemono) setActiveTatemono(tatemono)

    if (!requireAuth) { setChecking(false); return }

    const check = async () => {
      const { token, isAuthenticated, fetchMe } = useAuthStore.getState()

      if (!token) {
        const loginPage = redirectTo ?? (tatemono ? `/${tatemono}/login` : '/login')
        router.replace(loginPage)
        return
      }

      if (!isAuthenticated) {
        await fetchMe()
      }

      if (!useAuthStore.getState().isAuthenticated) {
        const loginPage = redirectTo ?? (tatemono ? `/${tatemono}/login` : '/login')
        router.replace(loginPage)
        return
      }

      setChecking(false)
    }

    check()
  }, [hydrated])

  if (checking) {
    return (
      <ToastProvider position="top-right">
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
        </div>
      </ToastProvider>
    )
  }

  return (
    <ToastProvider position="top-right">
      <div className={className}>
        {children}
      </div>
    </ToastProvider>
  )
}