// ============================================================
// ARKZEN ENGINE — TANSTACK START ROUTER ADAPTER
// arkzen/core/adapters/router.ts  (TanStack Start stack)
//
// Concrete implementation of useArkzenRouter / useArkzenPathname.
// Shared layouts import from '../adapters/router' — this file
// satisfies that import for the TanStack Start stack.
// ============================================================

import { useRouter, useLocation } from '@tanstack/react-router'

export interface ArkzenRouter {
  replace: (path: string) => void
  push:    (path: string) => void
}

export function useArkzenRouter(): ArkzenRouter {
  const router = useRouter()
  return {
    replace: (path: string) => router.navigate({ to: path, replace: true }),
    push:    (path: string) => router.navigate({ to: path }),
  }
}

export function useArkzenPathname(): string {
  return useLocation().pathname
}
