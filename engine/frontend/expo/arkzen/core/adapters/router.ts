// ============================================================
// ARKZEN ENGINE — EXPO ROUTER ADAPTER v1.0
// arkzen/core/adapters/router.ts  (Expo stack)
//
// Concrete implementation of useArkzenRouter / useArkzenPathname.
// Shared layouts import from '../adapters/router' — this file
// satisfies that import for the Expo stack.
//
// Uses expo-router instead of next/navigation or react-router-dom.
// API is intentionally identical to the Next.js adapter so shared
// layouts work without modification.
// ============================================================

import { useRouter, usePathname } from 'expo-router'

export interface ArkzenRouter {
  replace: (path: string) => void
  push:    (path: string) => void
}

export function useArkzenRouter(): ArkzenRouter {
  const router = useRouter()
  return {
    replace: (path: string) => router.replace(path as any),
    push:    (path: string) => router.push(path as any),
  }
}

export function useArkzenPathname(): string {
  return usePathname()
}
