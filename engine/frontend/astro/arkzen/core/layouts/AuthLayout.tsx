// ============================================================
// ARKZEN ENGINE — SHARED AUTH LAYOUT v1.2
// Framework-agnostic. Router calls injected via useArkzenRouter().
//
// Each stack ships adapters/router.ts that maps:
//   useArkzenRouter() → useRouter/useNavigate
//   useArkzenPathname() → usePathname/useLocation().pathname
//
// v1.2 — Fixes infinite loop on Astro caused by:
//   1. fetchMe() clearing token → re-triggering the effect → loop
//   2. fetchMe() called even when isAuthenticated is already true
//      (persist restores token but not user; login restores both)
//   Fix: use a one-shot ref so the check only ever runs once per
//   mount. If already authenticated, skip fetchMe entirely.
//   Only call fetchMe for the cold-start case: token present but
//   user/isAuthenticated not yet restored (e.g. page refresh with
//   only the token in localStorage).
//
// v1.1 — Gates the auth check behind useAuthStoreHydrated() so that
//   MPA stacks (Astro) don't redirect to /login before zustand/persist
//   has finished restoring the token from localStorage on cold mount.
//   SPA stacks (Next.js, Vite, Inertia) are unaffected.
//
// This file lives in engine/shared and is sync-copied into
// each stack's arkzen/core/layouts/ by shared-sync.ts.
// DO NOT import from next/navigation or react-router-dom here.
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { useArkzenRouter, useArkzenPathname } from '../adapters/router'
import { useAuthStore, setActiveTatemono, useAuthStoreHydrated } from '../stores/authStore'

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
  // One-shot ref: ensures the auth check runs exactly once per mount,
  // regardless of how many times the effect fires due to dep changes.
  const checked = useRef(false)

  useEffect(() => {
    // Wait for zustand/persist to finish rehydrating from localStorage.
    // On SPA stacks this is synchronously true. On Astro (MPA) the store
    // is re-created cold on every page load so hydration is async.
    if (!hydrated) return

    // One-shot: never re-run after the first successful check.
    // This prevents the effect from looping when fetchMe clears the
    // token (which would change deps and re-trigger the effect).
    if (checked.current) return
    checked.current = true

    const segments = pathname.split('/').filter(Boolean)
    const tatemono = segments[0] ?? ''
    if (tatemono) setActiveTatemono(tatemono)

    if (!requireAuth) { setChecking(false); return }

    const check = async () => {
      // Read state at check time (not from closure) to get the
      // post-hydration values.
      const { token, isAuthenticated, fetchMe } = useAuthStore.getState()

      if (!token) {
        const loginPage = redirectTo ?? (tatemono ? `/${tatemono}/login` : '/login')
        router.replace(loginPage)
        return
      }

      // If login() already set isAuthenticated + user, skip fetchMe.
      // Only call fetchMe for cold-start: token restored from localStorage
      // but user object not yet populated.
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