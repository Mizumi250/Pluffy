// ============================================================
// ARKZEN ENGINE — TYPE DEFINITIONS v5.3 [React+Vite]
// Canonical copy — no longer a cross-stack re-export from nextjs.
// Vite-specific type (ViteBuildResult) appended at the bottom.
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

export interface ArkzenMeta {
  name: string
  version: string
  description: string
  auth: boolean
  dependencies: string[]
  favicon?: string
  pwa?: ArkzenPWAMeta
  authSeed?: { users: ArkzenAuthSeedUser[] }
}

export interface ArkzenConfigOverride {
  modal?: { borderRadius?: string; backdrop?: string; animation?: string }
  toast?: { position?: string; duration?: number; style?: string }
  table?: { striped?: boolean; hoverable?: boolean; border?: string }
  breadcrumb?: { separator?: string; style?: string }
  dialog?: { size?: string; animation?: string }
  layout?: {
    guest?: { className?: string; container?: string }
    auth?: { className?: string; container?: string }
    [customLayout: string]: { className?: string; container?: string } | undefined
  }
}

export interface ArkzenColumn {
  type: string; length?: number; nullable?: boolean; default?: string | number | boolean
  unique?: boolean; primary?: boolean; autoIncrement?: boolean; foreign?: string
  onDelete?: string; precision?: number; scale?: number; unsigned?: boolean
}

export interface ArkzenIndex { columns: string[]; unique: boolean }
export interface ArkzenSeederItem { [key: string]: string | number | boolean | null }

export interface ArkzenDatabase {
  table: string; timestamps: boolean; softDeletes: boolean
  columns: Record<string, ArkzenColumn>; indexes?: ArkzenIndex[]
  seeder?: { count: number; data?: ArkzenSeederItem[] }
}

export interface ArkzenEndpointValidation { [field: string]: string }
export interface ArkzenEndpointQuery { [param: string]: string }
export interface ArkzenEndpointResponse {
  type: 'paginated' | 'single' | 'collection' | 'message'
  resource?: string; value?: string
}

export interface ArkzenEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  route: string; description: string
  validation?: ArkzenEndpointValidation; query?: ArkzenEndpointQuery
  response: ArkzenEndpointResponse; body?: string
}

export interface ArkzenApi {
  model: string; controller: string; prefix: string; middleware: string[]
  endpoints: Record<string, ArkzenEndpoint>
  resource?: boolean; policy?: boolean; factory?: boolean
}

export interface ArkzenCustomRouteEntry {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  route: string; handler: string; body?: string
}

export interface ArkzenCustomRoute {
  controller: string; middleware: string[]; routes: ArkzenCustomRouteEntry[]
}

export interface ArkzenMiddlewareSnippets { [middlewareName: string]: string }
export interface ArkzenStore { [key: string]: unknown }
export interface ArkzenRealtime { [key: string]: unknown }
export interface ArkzenEvent { [key: string]: unknown }
export interface ArkzenJob { [key: string]: unknown }
export interface ArkzenNotification { [key: string]: unknown }
export interface ArkzenMail { [key: string]: unknown }
export interface ArkzenConsole {
  signature: string; description: string; schedule?: string; [key: string]: unknown
}

export interface ArkzenSection { raw: string; start: number; end: number }
export type ArkzenPageLayout = 'guest' | 'auth' | string
export interface ArkzenPage {
  name: string; layout: ArkzenPageLayout; raw: string; start: number; end: number
}
export type ArkzenErrorHandlerType = '404' | '500'
export interface ArkzenErrorHandler { type: ArkzenErrorHandlerType; raw: string }
export interface ArkzenLayout { name: string; raw: string; start: number; end: number }
export interface ArkzenStyle { name?: string; raw: string; start: number; end: number }

export interface ParsedTatemono {
  filePath: string; fileName: string; meta: ArkzenMeta; config?: ArkzenConfigOverride
  databases: ArkzenDatabase[]; apis: ArkzenApi[]; customRoutes: ArkzenCustomRoute[]
  pages: ArkzenPage[]; layouts: ArkzenLayout[]; errorHandlers: ArkzenErrorHandler[]
  stores: ArkzenStore[]; realtimes: ArkzenRealtime[]; events: ArkzenEvent[]
  jobs: ArkzenJob[]; notifications: ArkzenNotification[]; mails: ArkzenMail[]
  consoles: ArkzenConsole[]; components: ArkzenSection[]; styles: ArkzenStyle[]
  middlewareSnippets: ArkzenMiddlewareSnippets; animation?: ArkzenSection
}

export interface ArkzenRegistry { engine: string; project: string; modules: ArkzenRegistryEntry[] }
export interface ArkzenRegistryEntry {
  name: string; version: string; status: 'active' | 'inactive' | 'error'
  filePath: string; pages: string[]; registered: string; lastUpdated: string; auth?: boolean
}

export interface BuildResult { success: boolean; tatemono: string; steps: BuildStep[]; errors: string[] }
export interface BuildStep { name: string; status: 'success' | 'failed' | 'skipped'; message: string }
export interface ValidationResult {
  valid: boolean; errors: string[]; warnings: string[]
  summary?: { tables: string[]; pages: string[]; resources: string[] }
}

// ─── Vite-specific ────────────────────────────────────────────────────────────

export interface ViteBuildResult {
  success: boolean; tatemono: string; errors: string[]
  steps: { name: string; status: 'success' | 'failed'; message?: string }[]
}
