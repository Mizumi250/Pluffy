// ============================================================
// ARKZEN — AuthLayout (Lynx) v2.0
// arkzen/core/layouts/AuthLayout.tsx
//
// Lynx port of native-core/layouts/AuthLayout.tsx.
// Styling: Tailwind className (rsbuild-plugin-tailwindcss).
// NO expo-router, NO SafeAreaView, NO ActivityIndicator,
// NO react-native primitives.
//
// Navigation via useArkzenRouter (adapters/router.ts shim).
// Primitives: <view>, <text> from @lynx-js/react.
// Auth: useAuthStore + setActiveTatemono from stores/authStore.
// ============================================================

import React, { useEffect, useRef } from '@lynx-js/react'
import { useArkzenRouter }   from '../adapters/router'
import { useAuthStore, setActiveTatemono } from '../stores/authStore'

interface AuthLayoutProps {
  children:   any
  tatSlug:    string
  loginRoute: string
}

export function AuthLayout({ children, tatSlug, loginRoute }: AuthLayoutProps) {
  const router          = useArkzenRouter()
  const isLoading       = useAuthStore(s => s.isLoading)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user            = useAuthStore(s => s.user)
  const logout          = useAuthStore(s => s.logout)
  const fetchMe         = useAuthStore(s => s.fetchMe)

  useEffect(() => {
    setActiveTatemono(tatSlug)
  }, [tatSlug])

  const isRedirectingRef = useRef(false)

  useEffect(() => {
    let active = true
    const restoreAndRedirect = async () => {
      if (isRedirectingRef.current) return
      isRedirectingRef.current = true

      await fetchMe()

      if (!active) return

      const { isAuthenticated: finalAuth, isLoading: finalLoading } = useAuthStore.getState()
      if (!finalLoading && !finalAuth) {
        router.replace(loginRoute)
      }

      isRedirectingRef.current = false
    }

    restoreAndRedirect()
    return () => { active = false }
  }, [tatSlug, loginRoute])

  if (isLoading) {
    return (
      <view className="flex-1 items-center justify-center bg-neutral-50">
        <text className="text-2xl text-neutral-400">⏳</text>
      </view>
    )
  }

  if (!isAuthenticated) {
    return (
      <view className="flex-1 items-center justify-center bg-neutral-50">
        <text className="text-2xl text-neutral-400">⏳</text>
      </view>
    )
  }

  return (
    <view className="flex-1 bg-neutral-50">
      {/* Top bar */}
      <view className="h-14 flex-row items-center justify-between px-5 bg-white/90 border-b border-black/5">
        <text className="text-sm font-semibold text-neutral-900 tracking-tight">
          Arkzen
        </text>
        <view className="flex-row items-center gap-3">
          {user && (
            <text className="text-xs text-neutral-400 max-w-36" numberOfLines={1}>
              {user.email}
            </text>
          )}
          <view
            bindtap={logout}
            className="px-3 py-1.5 rounded-md border border-neutral-200 bg-white active:opacity-70"
          >
            <text className="text-xs text-neutral-600">
              Logout
            </text>
          </view>
        </view>
      </view>

      {/* Screen content */}
      <view className="flex-1">
        {children}
      </view>
    </view>
  )
}

export default AuthLayout
