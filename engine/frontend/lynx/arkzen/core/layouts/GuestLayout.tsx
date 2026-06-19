// ============================================================
// ARKZEN — GuestLayout (Lynx) v2.0
// arkzen/core/layouts/GuestLayout.tsx
//
// Lynx port of native-core/layouts/GuestLayout.tsx.
// Styling: Tailwind className (rsbuild-plugin-tailwindcss).
// NO expo-router, NO SafeAreaView, NO KeyboardAvoidingView,
// NO ScrollView (react-native), NO react-native primitives.
//
// Navigation via useArkzenRouter (adapters/router.ts shim).
// Primitives: <view>, <scroll-view> from @lynx-js/react.
// Keyboard-avoidance: Lynx's <scroll-view> + flex layout
// handles this natively on both platforms; no manual
// KeyboardAvoidingView equivalent needed.
// Auth: useAuthStore + setActiveTatemono from stores/authStore.
// ============================================================

import React, { useEffect, useRef } from '@lynx-js/react'
import { useArkzenRouter }   from '../adapters/router'
import { useAuthStore, setActiveTatemono } from '../stores/authStore'

interface GuestLayoutProps {
  children:       any
  tatSlug:        string
  dashboardRoute: string
}

export function GuestLayout({ children, tatSlug, dashboardRoute }: GuestLayoutProps) {
  const router          = useArkzenRouter()
  const isLoading       = useAuthStore(s => s.isLoading)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
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
      if (!finalLoading && finalAuth) {
        router.replace(dashboardRoute)
      }

      isRedirectingRef.current = false
    }

    restoreAndRedirect()
    return () => { active = false }
  }, [tatSlug, dashboardRoute])

  if (isLoading) {
    return (
      <view className="flex-1 items-center justify-center bg-neutral-50">
        <text className="text-2xl text-neutral-400">⏳</text>
      </view>
    )
  }

  if (isAuthenticated) {
    return (
      <view className="flex-1 items-center justify-center bg-neutral-50">
        <text className="text-2xl text-neutral-400">⏳</text>
      </view>
    )
  }

  return (
    <view className="flex-1 bg-neutral-50">
      <scroll-view className="flex-1" scroll-y show-scrollbar={false}>
        <view className="flex-1 items-center justify-center px-6 py-12 min-h-full">
          {children}
        </view>
      </scroll-view>
    </view>
  )
}

export default GuestLayout
