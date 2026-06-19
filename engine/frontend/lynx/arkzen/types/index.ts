// ============================================================
// ARKZEN ENGINE — TYPE DEFINITIONS v10.4 (Lynx)
//
// Fully self-contained — no cross-stack import. Every stack
// (nextjs, react-vite, astro, tanstack-start, react-inertia,
// expo, react-native, lynx) owns its own complete copy of these
// types, kept in sync by hand whenever the shared parser.ts
// in engine/shared/arkzen/engine-core/ adds a field.
//
// v10.4 (initial Lynx copy):
//   Lynx is a separate renderer — not React Native, not web.
//   Its DSL blocks live under the :lynx: namespace.
//   nativeLynx* fields are primary for this stack's builder.
//   Expo/Bare RN fields are present (parser always produces them)
//   but Lynx builder ignores them.
//   ArkzenNativeMeta.expo is reused for now — Lynx-specific meta
//   fields (e.g. rspeedy config) can be added here when needed.
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

// v6.0: Web-only meta — declared via @arkzen:meta:web block
// Covers everything the browser/SEO layer needs that has no meaning on native/desktop.
export interface ArkzenWebMeta {
  title?:       string                    // <title> tag — defaults to label ?? name
  label?:       string                    // Human-readable app name (used in nav, PWA name fallback)
  description?: string                    // <meta name="description"> — overrides meta.description for web
  favicon?:     string                    // <link rel="icon"> — emoji, URL, or path
  og?: {
    title?:       string
    description?: string
    image?:       string
    url?:         string
    type?:        string                  // defaults to 'website'
  }
  twitter?: {
    card?:        string                  // 'summary' | 'summary_large_image'
    title?:       string
    description?: string
    image?:       string
  }
  pwa?: ArkzenPWAMeta
}

// v7.0: Native meta — declared via @arkzen:meta:native block
// Shared by Expo, Bare RN, and Lynx. Lynx-specific config
// (rspeedy, lynx.config.ts values) will be added here when needed.
export interface ArkzenNativeMeta {
  label?:       string                    // Human-readable app name
  description?: string                    // App store description
  expo?: {
    bundle_id?:        string             // iOS bundle ID / Android app ID
    icon?:             string             // Path to app icon
    scheme?:           string             // Deep link scheme
    version?:          string             // App version string
    orientation?:      'portrait' | 'landscape' | 'default'
    status_bar_style?: 'default' | 'light-content' | 'dark-content'
    permissions?:      string[]
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
  favicon?: string
  /** @deprecated — move to @arkzen:meta:web */
  pwa?:     ArkzenPWAMeta
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
    guest?: { className?: string; container?: string }
    auth?:  { className?: string; container?: string }
    [customLayout: string]: { className?: string; container?: string } | undefined
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
  // v5.3: optional PHP body for custom endpoints.
  // Populated by @arkzen:endpoint:name ... :end blocks in the tatemono.
  // Base64-encoded by parser.ts, decoded by ControllerBuilder.
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

// ─────────────────────────────────────────────
// CUSTOM ROUTES — v5.1 / v5.3
// v5.3: handler bodies declared via @arkzen:handler:name ... :end blocks.
// Base64-encoded PHP injected into the handler method by CustomRouteBuilder.
//
// Example DSL:
//   /* @arkzen:routes
//   controller: MyController
//   middleware: []
//   routes:
//     - method: GET
//       route: /api/my-module/do-thing
//       handler: doThing
//   */
//
//   /* @arkzen:handler:doThing
//   */
//   $result = MyModel::where('active', true)->count();
//   return response()->json(['count' => $result]);
//   /* @arkzen:handler:doThing:end */
// ─────────────────────────────────────────────

export interface ArkzenCustomRouteEntry {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  route: string
  handler: string
  body?: string  // v5.3: base64-encoded PHP body for this handler
}

export interface ArkzenCustomRoute {
  controller: string
  middleware: string[]
  routes: ArkzenCustomRouteEntry[]
}

// ─────────────────────────────────────────────
// MIDDLEWARE SNIPPETS — v5.3
// Map of middleware name → base64-encoded PHP handle() body.
// Declared via @arkzen:middleware:name ... :end blocks.
// MiddlewareBuilder injects the body instead of // TODO stub.
//
// Example DSL:
//   /* @arkzen:middleware:requireJson
//   */
//   if (!$request->isJson()) {
//       return response()->json(['message' => 'Content-Type: application/json required'], 415);
//   }
//   return $next($request);
//   /* @arkzen:middleware:requireJson:end */
// ─────────────────────────────────────────────

export interface ArkzenMiddlewareSnippets {
  [middlewareName: string]: string  // base64-encoded PHP body
}

// Interfaces for parsed named sections
export interface ArkzenStore       { [key: string]: unknown }
export interface ArkzenRealtime    { [key: string]: unknown }
export interface ArkzenEvent       { [key: string]: unknown }
export interface ArkzenJob         { [key: string]: unknown }
export interface ArkzenNotification { [key: string]: unknown }
export interface ArkzenMail        { [key: string]: unknown }

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
  parent?: string  // v11.0: optional parent layout name for chain resolution
  start: number
  end: number
}

export interface ArkzenStyle {
  name?: string  // undefined for global @arkzen:style, defined for @arkzen:style:name
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

  errorHandlers:       ArkzenErrorHandler[]  // web: @arkzen:web:error:404/500
  nativeErrorHandlers: ArkzenErrorHandler[]  // @arkzen:native:error:404/500 (Expo + Bare RN)

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

  animation?: ArkzenSection  // web: @arkzen:web:animation
  script?:    ArkzenSection  // web: global @arkzen:web:script
  scripts:    ArkzenSection[] // web: named @arkzen:web:script:name

  // ── Expo + Bare RN shared blocks (present; Lynx builder ignores) ──
  nativePages:        ArkzenPage[]     // @arkzen:native:page:name
  nativeComponents:   ArkzenSection[]  // @arkzen:native:components:name
  nativeLayouts:      ArkzenSection[]  // @arkzen:native:layout:name
  nativeStyleGlobal?: ArkzenSection    // @arkzen:native:style (global, unnamed) — v10.6
  nativeStyles:       ArkzenSection[]  // @arkzen:native:style:name

  // ── Expo-specific (present; Lynx builder ignores) ──────────────
  nativeAnimationExpo?:  ArkzenSection
  nativeScriptExpo?:     ArkzenSection
  nativeScriptsExpo:     ArkzenSection[]

  // ── Bare RN-specific (present; Lynx builder ignores) ───────────
  nativeAnimationRN?:  ArkzenSection
  nativeScriptRN?:     ArkzenSection
  nativeScriptsRN:     ArkzenSection[]

  // ── Lynx-specific blocks (PRIMARY for this stack's builder) ────
  nativeLynxPages:         ArkzenPage[]    // @arkzen:native:page:lynx:name
  nativeLynxLayouts:       ArkzenSection[] // @arkzen:native:layout:lynx:name
  nativeLynxComponents:    ArkzenSection[] // @arkzen:native:components:lynx:name
  nativeLynxStyleGlobal?:  ArkzenSection   // @arkzen:native:style:lynx (global)
  nativeLynxStyles:        ArkzenSection[] // @arkzen:native:style:lynx:name
  nativeLynxErrorHandlers: ArkzenErrorHandler[] // @arkzen:native:error:404:lynx / :500:lynx
  nativeAnimationLynx?:    ArkzenSection   // @arkzen:native:animation:lynx
  nativeScriptLynx?:       ArkzenSection   // @arkzen:native:script:lynx (global)
  nativeScriptsLynx:       ArkzenSection[] // @arkzen:native:script:lynx:name (named)
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