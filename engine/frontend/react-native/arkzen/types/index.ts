// ============================================================
// ARKZEN ENGINE — TYPE DEFINITIONS v7.0 (React Native — bare)
//
// Fully self-contained — no cross-stack import. Every stack
// (nextjs, react-vite, astro, tanstack-start, react-inertia,
// expo, react-native) owns its own complete copy of these
// types, kept in sync by hand whenever the shared parser.ts
// in engine/shared/arkzen/engine-core/ adds a field.
//
// This copy matches the v7.0 schema (same as Expo/Next.js):
//   - ArkzenNativeMeta / ArkzenNativeConfig: native app config
//   - ParsedTatemono: native* fields (nativePages, nativeLayouts,
//     nativeStyles, nativeAnimationRN, etc.) — same shape Expo's
//     builder already reads from @arkzen:native:* blocks.
// ============================================================

export interface ArkzenAuthSeedUser {
  name: string
  email: string
  password: string
  role: string
}

export interface ArkzenPWAMeta {
  name: string
  short_name: string
  description: string
  theme_color: string
  background_color: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  orientation?: 'portrait' | 'landscape' | 'any'
  start_url: string
  offline: boolean
  icons?: { src: string; sizes: string; type: string; purpose?: string }[]
}

// Web-only meta — declared via @arkzen:meta:web block
export interface ArkzenWebMeta {
  title?:       string
  label?:       string
  description?: string
  favicon?:     string
  og?: {
    title?:       string
    description?: string
    image?:       string
    url?:         string
    type?:        string
  }
  twitter?: {
    card?:        string
    title?:       string
    description?: string
    image?:       string
  }
  pwa?:         ArkzenPWAMeta
}

// Native-only meta — declared via @arkzen:meta:native block
// Covers app.json / Info.plist / AndroidManifest-level values.
export interface ArkzenNativeMeta {
  label?:       string
  description?: string
  expo?: {
    bundle_id?:       string
    icon?:            string
    scheme?:          string
    version?:         string
    orientation?:     'portrait' | 'landscape' | 'default'
    status_bar_style?: 'default' | 'light-content' | 'dark-content'
    permissions?:     string[]
    splash?: {
      image?:            string
      background_color?: string
      resize_mode?:      string
    }
  }
}

// Native config — declared via @arkzen:native:config block
export interface ArkzenNativeConfig {
  theme?: Record<string, unknown>
  fonts?: Record<string, string>
  [key: string]: unknown
}

export interface ArkzenMeta {
  name:         string
  version:      string
  description:  string
  auth:         boolean
  dependencies: string[]
  authSeed?: {
    users: ArkzenAuthSeedUser[]
  }
  /** @deprecated — move to @arkzen:meta:web */
  favicon?:     string
  /** @deprecated — move to @arkzen:meta:web */
  pwa?:         ArkzenPWAMeta
}

export interface ArkzenConfigOverride {
  modal?: {
    borderRadius?: string
    backdrop?: string
    animation?: string
  }
  toast?: {
    position?: string
    duration?: number
    style?: string
  }
  table?: {
    striped?: boolean
    hoverable?: boolean
    border?: string
  }
  breadcrumb?: {
    separator?: string
    style?: string
  }
  dialog?: {
    size?: string
    animation?: string
  }
  layout?: {
    guest?: {
      className?: string
      container?: string
    }
    auth?: {
      className?: string
      container?: string
    }
    [customLayout: string]: {
      className?: string
      container?: string
    } | undefined
  }
}

export interface ArkzenColumn {
  type: string
  length?: number
  nullable?: boolean
  default?: string | number | boolean
  unique?: boolean
  primary?: boolean
  autoIncrement?: boolean
  foreign?: string
  onDelete?: string
  precision?: number
  scale?: number
  unsigned?: boolean
}

export interface ArkzenIndex {
  columns: string[]
  unique: boolean
}

export interface ArkzenSeederItem {
  [key: string]: string | number | boolean | null
}

export interface ArkzenDatabase {
  table: string
  timestamps: boolean
  softDeletes: boolean
  columns: Record<string, ArkzenColumn>
  indexes?: ArkzenIndex[]
  seeder?: {
    count: number
    data?: ArkzenSeederItem[]
  }
}

export interface ArkzenEndpointValidation {
  [field: string]: string
}

export interface ArkzenEndpointQuery {
  [param: string]: string
}

export interface ArkzenEndpointResponse {
  type: 'paginated' | 'single' | 'collection' | 'message'
  resource?: string
  value?: string
}

export interface ArkzenEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  route: string
  description: string
  validation?: ArkzenEndpointValidation
  query?: ArkzenEndpointQuery
  response: ArkzenEndpointResponse
  body?: string
}

export interface ArkzenApi {
  model: string
  controller: string
  prefix: string
  middleware: string[]
  endpoints: Record<string, ArkzenEndpoint>
  resource?: boolean
  policy?: boolean
  factory?: boolean
}

export interface ArkzenCustomRouteEntry {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  route: string
  handler: string
  body?: string
}

export interface ArkzenCustomRoute {
  controller: string
  middleware: string[]
  routes: ArkzenCustomRouteEntry[]
}

export interface ArkzenMiddlewareSnippets {
  [middlewareName: string]: string
}

export interface ArkzenStore {
  [key: string]: unknown
}

export interface ArkzenRealtime {
  [key: string]: unknown
}

export interface ArkzenEvent {
  [key: string]: unknown
}

export interface ArkzenJob {
  [key: string]: unknown
}

export interface ArkzenNotification {
  [key: string]: unknown
}

export interface ArkzenMail {
  [key: string]: unknown
}

export interface ArkzenConsole {
  signature: string
  description: string
  schedule?: string
  [key: string]: unknown
}

export interface ArkzenSection {
  raw: string
  start: number
  end: number
}

export type ArkzenPageLayout = 'guest' | 'auth' | string

export interface ArkzenPage {
  name: string
  layout: ArkzenPageLayout
  raw: string
  start: number
  end: number
}

export type ArkzenErrorHandlerType = '404' | '500'

export interface ArkzenErrorHandler {
  type: ArkzenErrorHandlerType
  raw: string
}

export interface ArkzenLayout {
  name: string
  raw: string
  parent?: string
  start: number
  end: number
}

export interface ArkzenStyle {
  name?: string
  raw: string
  start: number
  end: number
}

export interface ParsedTatemono {
  filePath: string
  fileName: string
  meta:     ArkzenMeta
  webMeta?:      ArkzenWebMeta
  nativeMeta?:   ArkzenNativeMeta
  config?:       ArkzenConfigOverride
  nativeConfig?: ArkzenNativeConfig

  databases:          ArkzenDatabase[]
  apis:               ArkzenApi[]
  customRoutes:       ArkzenCustomRoute[]
  pages:              ArkzenPage[]
  layouts:            ArkzenLayout[]

  errorHandlers:       ArkzenErrorHandler[]
  nativeErrorHandlers: ArkzenErrorHandler[]

  stores:             ArkzenStore[]
  realtimes:          ArkzenRealtime[]
  events:             ArkzenEvent[]
  jobs:               ArkzenJob[]
  notifications:      ArkzenNotification[]
  mails:              ArkzenMail[]
  consoles:           ArkzenConsole[]
  components:         ArkzenSection[]
  styles:             ArkzenStyle[]
  middlewareSnippets: ArkzenMiddlewareSnippets
  policySnippets:     Record<string, string>

  animation?: ArkzenSection
  script?:    ArkzenSection
  scripts:    ArkzenSection[]

  // Native platform blocks (Expo / React Native) — same shape both
  // native stacks read from. Bare RN's builder should consume these
  // exactly like expo-builder.ts does, instead of falling back to `pages`.
  nativePages:      ArkzenPage[]
  nativeComponents: ArkzenSection[]
  nativeLayouts:    ArkzenSection[]
  nativeStyles:     ArkzenSection[]
  nativeAnimationRN?:   ArkzenSection
  nativeAnimationLynx?: ArkzenSection
  nativeScript?:    ArkzenSection
  nativeScripts:    ArkzenSection[]
}

export interface ArkzenRegistry {
  engine: string
  project: string
  modules: ArkzenRegistryEntry[]
}

export interface ArkzenRegistryEntry {
  name: string
  version: string
  status: 'active' | 'inactive' | 'error'
  filePath: string
  pages: string[]
  registered: string
  lastUpdated: string
  auth?: boolean
}

export interface BuildResult {
  success: boolean
  tatemono: string
  steps: BuildStep[]
  errors: string[]
}

export interface BuildStep {
  name: string
  status: 'success' | 'failed' | 'skipped'
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  summary?: {
    tables: string[]
    pages: string[]
    resources: string[]
  }
}

// ─── React Native (bare) specific additions ──────────────────────────────────
// Not part of the shared parser output — local to this stack's own
// builder/router/hooks.

export interface NativeScreenDef {
  /** tatemono name */
  tatemono: string
  /** screen name from @arkzen:native:page:name */
  screen:   string
  /** React Navigation route key e.g. 'my-app/dashboard' */
  routeKey: string
  /** Whether auth is required */
  auth:     boolean
}

export type NavigationProp = {
  navigate: (screen: string, params?: Record<string, unknown>) => void
  goBack:   () => void
  push:     (screen: string, params?: Record<string, unknown>) => void
  replace:  (screen: string, params?: Record<string, unknown>) => void
}

export interface ArkzenNativeAuthState {
  token:     string | null
  user:      { id: number; name: string; email: string; role?: string } | null
  isLoading: boolean
}