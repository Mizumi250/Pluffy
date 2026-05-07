// ============================================================
// ARKZEN ENGINE — INERTIA TYPES
// arkzen/types/index.ts
//
// Re-exports from Next.js canonical type source — same pattern
// as react-vite stack. Next.js types are the single source of
// truth for ParsedTatemono and all DSL types.
// ============================================================

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

// ─── Inertia-specific types ───────────────────────────────────────────────────

export interface InertiaBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}
