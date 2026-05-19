// ============================================================
// ARKZEN ENGINE — ASTRO ROUTER ADAPTER
// arkzen/core/adapters/router.ts  (Astro stack)
//
// Implements useArkzenRouter / useArkzenPathname for React
// island components running inside Astro pages.
//
// Astro islands are hydrated React components. Unlike full SPAs,
// Astro requires full page reloads to re-render islands and
// re-fetch server data. This matches the behavior of Vite/Next/Inertia.
// ============================================================

export interface ArkzenRouter {
  replace: (path: string) => void
  push:    (path: string) => void
}

export function useArkzenRouter(): ArkzenRouter {
  return {
    replace: (path: string) => {
      window.location.href = path
    },
    push: (path: string) => {
      window.location.href = path
    },
  }
}

export function useArkzenPathname(): string {
  return typeof window !== 'undefined' ? window.location.pathname : '/'
}