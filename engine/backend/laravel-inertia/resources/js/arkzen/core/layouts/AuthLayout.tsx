// ============================================================
// ARKZEN ENGINE — SHARED AUTH LAYOUT v1.0
// Framework-agnostic. Router calls injected via useArkzenRouter().
//
// Each stack ships adapters/router.ts that maps:
//   useArkzenRouter() → useRouter/useNavigate
//   useArkzenPathname() → usePathname/useLocation().pathname
//
// This file lives in engine/shared and is sync-copied into
// each stack's arkzen/core/layouts/ by shared-sync.ts.
// DO NOT import from next/navigation or react-router-dom here.
// ============================================================

import React, { useEffect, useState } from 'react'
import { useArkzenRouter, useArkzenPathname } from '../adapters/router'
import { useAuthStore, setActiveTatemono } from '../stores/authStore'

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
  const router                              = useArkzenRouter()
  const pathname                            = useArkzenPathname()
  const { fetchMe, token }                  = useAuthStore()
  const [checking, setChecking]             = useState(requireAuth)

  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean)
    const tatemono = segments[0] ?? ''
    if (tatemono) setActiveTatemono(tatemono)

    if (!requireAuth) { setChecking(false); return }

    const check = async () => {
      if (!token) {
        const loginPage = redirectTo ?? (tatemono ? `/${tatemono}/login` : '/login')
        router.replace(loginPage)
        return
      }

      await fetchMe()

      if (!useAuthStore.getState().isAuthenticated) {
        const loginPage = redirectTo ?? (tatemono ? `/${tatemono}/login` : '/login')
        router.replace(loginPage)
        return
      }

      setChecking(false)
    }

    check()
  }, [requireAuth, token])

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
