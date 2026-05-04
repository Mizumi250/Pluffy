// ============================================================
// ARKZEN ENGINE — NATIVE TYPES v1.0
// arkzen/types/index.ts
// Re-exports from nextjs types + adds RN-specific types
// ============================================================

// Re-export all shared types from the Next.js engine
export type {
  ParsedTatemono,
  ArkzenPage,
  ArkzenComponent,
  ArkzenLayout,
  ArkzenDatabase,
  ArkzenApi,
  ArkzenMeta,
  BuildResult,
  BuildStep,
} from '../../../frontend/nextjs/arkzen/types'

// ─── React Native specific types ─────────────────────────────────────────────

export interface NativeScreenDef {
  /** tatemono name */
  tatemono:   string
  /** screen name from @arkzen:page:name */
  screen:     string
  /** React Navigation route key e.g. 'my-app/dashboard' */
  routeKey:   string
  /** Whether auth is required */
  auth:       boolean
}

export interface NativeBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}

// ─── React Navigation types ───────────────────────────────────────────────────

export type NavigationProp = {
  navigate: (screen: string, params?: Record<string, unknown>) => void
  goBack:   () => void
  push:     (screen: string, params?: Record<string, unknown>) => void
  replace:  (screen: string, params?: Record<string, unknown>) => void
}

// ─── Arkzen Native API client types ──────────────────────────────────────────
// Same as web — the Laravel backend API is identical

export interface ArkzenNativeAuthState {
  token:    string | null
  user:     { id: number; name: string; email: string; role?: string } | null
  isLoading: boolean
}