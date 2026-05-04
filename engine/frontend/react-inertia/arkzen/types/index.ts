// ============================================================
// ARKZEN ENGINE — INERTIA TYPES v1.0
// arkzen/types/index.ts
// Re-exports from nextjs types + adds Inertia-specific types
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

// ─── Inertia-specific types ───────────────────────────────────────────────────

export interface InertiaPageDef {
  /** Laravel Inertia component name e.g. 'MyApp/Dashboard' */
  name:     string
  /** tatemono name */
  tatemono: string
  /** Page name from @arkzen:page:name */
  page:     string
  /** Whether auth middleware should be applied */
  auth:     boolean
  /** Laravel route path e.g. '/my-app/dashboard' */
  route:    string
}

export interface InertiaBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}

// ─── Inertia shared props (what Laravel always passes) ───────────────────────

export interface InertiaSharedProps {
  auth: {
    user: {
      id:    number
      name:  string
      email: string
      role?: string
    } | null
  }
  flash: {
    success?: string
    error?:   string
    warning?: string
  }
  errors: Record<string, string>
}