// ============================================================
// ARKZEN ENGINE — ASTRO ROUTER ADAPTER
// arkzen/core/adapters/router.ts  (Astro stack)
//
// Implements useArkzenRouter / useArkzenPathname for React
// island components running inside Astro pages.
//
// Astro islands are hydrated React components — they run in
// the browser with full DOM access. Navigation uses the native
// History API (pushState / replaceState) to avoid a full page
// reload, the same way a SPA would. Astro View Transitions
// handles the visual transition between pages.
// ============================================================

import { useState, useEffect } from 'react'

export interface ArkzenRouter {
  replace: (path: string) => void
  push:    (path: string) => void
}

export function useArkzenRouter(): ArkzenRouter {
  return {
    replace: (path: string) => {
      window.history.replaceState(null, '', path)
      // Dispatch popstate so useArkzenPathname subscribers update
      window.dispatchEvent(new PopStateEvent('popstate'))
    },
    push: (path: string) => {
      window.history.pushState(null, '', path)
      window.dispatchEvent(new PopStateEvent('popstate'))
    },
  }
}

export function useArkzenPathname(): string {
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  )

  useEffect(() => {
    const handler = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  return pathname
}