// ============================================================
// ARKZEN ENGINE — TYPE DEFINITIONS v10.4 (Expo)
// v10.4: Stack-split animation and script fields.
//        nativeAnimationExpo added (was previously merged into :rn).
//        nativeScript / nativeScripts replaced by per-stack variants.
//        nativeLynx* fields added (parser produces them; Expo builder ignores them).
// v10.3: Lynx block fields added to ParsedTatemono.
//        nativeErrorHandlers added.
// v7.0:  Native platform fields added to ParsedTatemono.
//        - ArkzenNativeMeta: expo app config (bundle_id, icon, splash, etc.)
//        - ArkzenNativeConfig: NativeWind / theme / font config
//        - ParsedTatemono: added nativeMeta, nativeConfig, nativeComponents,
//          nativeLayouts, nativeStyles, nativeAnimationRN, nativeAnimationLynx,
//          nativeScript, nativeScripts, nativePages, nativeErrorHandlers, script, scripts.
// v6.0 (kept): @arkzen:meta:web separation.
//       - ArkzenWebMeta: new interface for web-only meta (favicon, title,
//         label, og, pwa). Replaces favicon + pwa in ArkzenMeta.
//       - ArkzenMeta: removed favicon, pwa. Kept: name, version,
//         description, auth, dependencies, authSeed.
//       - ParsedTatemono: added webMeta?: ArkzenWebMeta
// v5.3 (kept): Body injection for endpoints, routes, middleware.
// v5.2 (kept): authSeed in ArkzenMeta.
// v5.1 (kept): ArkzenCustomRoute + customRoutes.
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
  pwa?:         ArkzenPWAMeta
}

// v7.0: Native-only meta — declared via @arkzen:meta:native block
// Covers Expo app.json / app.config.js values that only make sense on native.
export interface ArkzenNativeMeta {
  label?:       string                    // Human-readable app name
  description?: string                    // App store description
  expo?: {
    bundle_id?:       string              // iOS bundle ID / Android app ID
    icon?:            string              // Path to app icon
    scheme?:          string              // Deep link scheme
    version?:         string              // App version string
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

// v7.0: Native config — declared via @arkzen:native:config block
// NativeWind theme, custom fonts, gesture handler settings, etc.
export interface ArkzenNativeConfig {
  theme?: Record<string, unknown>
  fonts?: Record<string, string>
  [key: string]: unknown
}

export interface ArkzenDesktopConfig {
  window?: {
    width?: number
    height?: number
    min_width?: number
    min_height?: number
    resizable?: boolean
    fullscreenable?: boolean
    title?: string
  }
}

export interface ArkzenMeta {
  name:         string
  version:      string
  description:  string                    // general description — shared across platforms
  auth:         boolean
  dependencies: string[]
  authSeed?: {
    users: ArkzenAuthSeedUser[]
  }
  // v6.0: favicon + pwa moved to ArkzenWebMeta. Kept here as deprecated
  // optional fields so old tatemonos don't hard-crash before migration.
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
  signature?: string
  description?: string
  schedule?: string
  [key: string]: unknown
}

export interface ArkzenSection {
  name?: string
  raw: string
  start: number
  end: number
  [key: string]: unknown
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
  webMeta?:      ArkzenWebMeta       // v6.0: from @arkzen:meta:web block
  nativeMeta?:   ArkzenNativeMeta    // v7.0: from @arkzen:meta:native block
  config?:       ArkzenConfigOverride
  nativeConfig?: ArkzenNativeConfig  // v7.0: from @arkzen:native:config block
  desktopConfig?: ArkzenDesktopConfig

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
  styles:             ArkzenStyle[]           // web: @arkzen:web:style
  middlewareSnippets: ArkzenMiddlewareSnippets
  policySnippets:     Record<string, string>  // base64-encoded PHP policy bodies

  animation?: ArkzenSection  // web: @arkzen:web:animation — GSAP + framer pageVariants
  script?:    ArkzenSection  // web: global @arkzen:web:script block
  scripts:    ArkzenSection[] // web: named @arkzen:web:script:name blocks

  // ── Expo + Bare RN shared blocks ──────────────────────────────
  // @arkzen:native:page:name, layout, components carry an embedded
  // /* @arkzen:import:expo */ line re-emitted by the parser as
  // /* @arkzen:resolved:import expo */ at the top of raw.
  nativePages:      ArkzenPage[]     // @arkzen:native:page:name
  nativeComponents:   ArkzenSection[]  // @arkzen:native:components:name
  nativeLayouts:      ArkzenSection[]  // @arkzen:native:layout:name
  nativeStyleGlobal?: ArkzenSection    // @arkzen:native:style (global, unnamed) — v10.6
  nativeStyles:       ArkzenSection[]  // @arkzen:native:style:name

  // ── Expo-specific blocks ───────────────────────────────────────
  nativeAnimationExpo?:  ArkzenSection   // @arkzen:native:animation:expo
  nativeScriptExpo?:     ArkzenSection   // @arkzen:native:script:expo (global)
  nativeScriptsExpo:     ArkzenSection[] // @arkzen:native:script:expo:name (named)

  // ── Bare RN-specific blocks (present in parsed output; Expo builder ignores) ──
  nativeAnimationRN?:  ArkzenSection   // @arkzen:native:animation:rn
  nativeScriptRN?:     ArkzenSection   // @arkzen:native:script:rn (global)
  nativeScriptsRN:     ArkzenSection[] // @arkzen:native:script:rn:name (named)

  // ── Lynx blocks (present in parsed output; Expo builder ignores) ──────────
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
  desktopConfig?: ArkzenDesktopConfig
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