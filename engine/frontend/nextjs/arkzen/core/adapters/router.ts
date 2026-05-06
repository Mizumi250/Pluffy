// ============================================================
// ARKZEN ENGINE — NEXTJS ROUTER ADAPTER
// arkzen/core/adapters/router.ts  (Next.js stack)
// Concrete implementation of useArkzenRouter / useArkzenPathname.
// Shared layouts import from '../adapters/router' — this file
// satisfies that import for the Next.js stack.
// ============================================================

'use client'

import { useRouter, usePathname } from 'next/navigation'

export interface ArkzenRouter {
  replace: (path: string) => void
  push:    (path: string) => void
}

export function useArkzenRouter(): ArkzenRouter {
  const router = useRouter()
  return {
    replace: (path: string) => router.replace(path),
    push:    (path: string) => router.push(path),
  }
}

export function useArkzenPathname(): string {
  return usePathname()
}
