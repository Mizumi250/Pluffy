// ============================================================
// ARKZEN ENGINE — VITE TYPES v1.0
// arkzen/types/index.ts
// Re-exports all types from nextjs types — DSL is identical.
// Vite-specific additions below the re-export block.
// ============================================================

// Re-export everything from the canonical Next.js types
// (Single source of truth — all stacks share the same ParsedTatemono)
export type {
  ArkzenAuthSeedUser,
  ArkzenPWAMeta,
  ArkzenMeta,
  ArkzenConfigOverride,
  ArkzenColumn,
  ArkzenIndex,
  ArkzenSeederItem,
  ArkzenDatabase,
  ArkzenEndpointValidation,
  ArkzenEndpointQuery,
  ArkzenEndpointResponse,
  ArkzenEndpoint,
  ArkzenApi,
  ArkzenCustomRouteEntry,
  ArkzenCustomRoute,
  ArkzenMiddlewareSnippets,
  ArkzenStore,
  ArkzenRealtime,
  ArkzenEvent,
  ArkzenJob,
  ArkzenNotification,
  ArkzenMail,
  ArkzenConsole,
  ArkzenSection,
  ArkzenPageLayout,
  ArkzenPage,
  ArkzenErrorHandlerType,
  ArkzenErrorHandler,
  ArkzenLayout,
  ArkzenStyle,
  ParsedTatemono,
  ArkzenRegistry,
  ArkzenRegistryEntry,
  BuildResult,
  BuildStep,
  ValidationResult,
} from '../../../frontend/nextjs/arkzen/types'

// ─── Vite-specific types ──────────────────────────────────────────────────────

export interface ViteBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}

export interface ViteRoute {
  tatName:  string
  pageName: string
  path:     string
  auth:     boolean
}