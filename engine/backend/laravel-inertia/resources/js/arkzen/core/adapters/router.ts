// ============================================================
// ARKZEN ENGINE — REACT+INERTIA ROUTER ADAPTER
// arkzen/core/adapters/router.ts  (React+Inertia stack)
// Concrete implementation of useArkzenRouter / useArkzenPathname.
// Shared layouts import from '../adapters/router' — this file
// satisfies that import for the React+Inertia stack.
// ============================================================

import { router, usePage } from '@inertiajs/react'

export interface ArkzenRouter {
  replace: (path: string) => void
  push:    (path: string) => void
}

export function useArkzenRouter(): ArkzenRouter {
  return {
    replace: (path: string) => router.visit(path, { replace: true }),
    push:    (path: string) => router.visit(path),
  }
}

export function useArkzenPathname(): string {
  const page = usePage()
  return new URL(page.url, window.location.origin).pathname
}
