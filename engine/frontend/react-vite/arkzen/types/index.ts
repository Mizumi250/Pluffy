// ============================================================
// ARKZEN ENGINE — VITE TYPES v2.0
// arkzen/types/index.ts
//
// v2.0: Types now imported from the engine-level shared types
//       (engine/frontend/nextjs/arkzen/types) which is the
//       single source of truth for ParsedTatemono and all DSL
//       types. Vite-specific additions below the re-export.
//
// NOTE: The nextjs types file is the canonical DSL type source.
//       All stacks re-export from it. When we move types to
//       engine/shared in v9, this import path updates there.
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

// ─── Vite-specific types ──────────────────────────────────────────────────────
