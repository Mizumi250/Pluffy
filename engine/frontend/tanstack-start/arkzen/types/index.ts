// ============================================================
// ARKZEN ENGINE — TYPE DEFINITIONS v6.0 [TanStack Start]
// v6.0: ArkzenWebMeta added. ParsedTatemono.webMeta? added. ArkzenMeta.favicon+pwa deprecated.
// v6.0: ArkzenWebMeta added. ParsedTatemono.webMeta? added. ArkzenMeta.favicon+pwa deprecated.
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

// v15.0 — frame blocks: per-target parent chrome (see parser parseFrames)
export type ArkzenFrameTarget = 'expo' | 'rn' | 'lynx' | 'electron' | 'tauri'

export interface ArkzenFrame {
  target: ArkzenFrameTarget
  raw:    string   // the code body, verbatim
  start:  number
  end:    number
}

export type ArkzenFrames = Partial<Record<ArkzenFrameTarget, ArkzenFrame>>

// v17.0 - browser extension blocks (@arkzen:ext:*). See parser parseExt.
// A code block keeps its YAML header and its body apart. A YAML block keeps the
// parsed value: a mapping for project, rules, locale and export, a list for
// commands and menus (the validator checks the shape).
export interface ArkzenExtCodeBlock {
  header: Record<string, unknown>   // YAML in the opening comment ({} when the opener closes with */ on the same line)
  raw:    string                    // the code body, verbatim and trimmed
  start:  number
  end:    number
}

export interface ArkzenExtNamedCodeBlock extends ArkzenExtCodeBlock {
  name: string
}

export interface ArkzenExtYamlBlock {
  data:  unknown
  start: number
  end:   number
}

export interface ArkzenExtNamedYamlBlock extends ArkzenExtYamlBlock {
  name: string
}

export interface ArkzenExt {
  project?:    ArkzenExtYamlBlock         // @arkzen:ext:project
  popup?:      ArkzenExtCodeBlock         // @arkzen:ext:popup
  sidepanel?:  ArkzenExtCodeBlock         // @arkzen:ext:sidepanel
  background?: ArkzenExtCodeBlock         // @arkzen:ext:background
  pages:       ArkzenExtNamedCodeBlock[]  // @arkzen:ext:page:<name>
  contents:    ArkzenExtNamedCodeBlock[]  // @arkzen:ext:content:<name>
  scripts:     ArkzenExtNamedCodeBlock[]  // @arkzen:ext:script:<name>
  commands?:   ArkzenExtYamlBlock         // @arkzen:ext:commands
  menus?:      ArkzenExtYamlBlock         // @arkzen:ext:menus
  rules?:      ArkzenExtYamlBlock         // @arkzen:ext:rules
  locales:     ArkzenExtNamedYamlBlock[]  // @arkzen:ext:locale:<code>
  export?:     ArkzenExtYamlBlock         // @arkzen:ext:export
}

// v19.0 - terminal (CLI and TUI) blocks (@arkzen:term:*). See parser parseTerm.
// YAML blocks keep the parsed value (a mapping for most blocks; the validator checks the
// shape). Code blocks keep their YAML header and body apart, like the ext blocks.
export interface ArkzenTermYamlBlock {
  data:  unknown
  start: number
  end:   number
}

export interface ArkzenTermNamedYamlBlock extends ArkzenTermYamlBlock {
  name: string
}

// @arkzen:term:keymap[:name]: the name is optional (an unnamed keymap is the global one)
export interface ArkzenTermKeymapBlock extends ArkzenTermYamlBlock {
  name?: string
}

// @arkzen:term:runtime:<lang>
export interface ArkzenTermRuntimeBlock extends ArkzenTermYamlBlock {
  lang: string
}

export interface ArkzenTermCodeBlock {
  header: Record<string, unknown>   // YAML in the opening comment ({} when the opener closes with */ on the same line)
  raw:    string                    // the code body, verbatim and trimmed
  start:  number
  end:    number
}

// @arkzen:term:handler|view|script|test:<lang>:<name>
export interface ArkzenTermLangCodeBlock extends ArkzenTermCodeBlock {
  lang: string
  name: string
}

export interface ArkzenTerm {
  project?:  ArkzenTermYamlBlock          // @arkzen:term:project
  config?:   ArkzenTermYamlBlock          // @arkzen:term:config
  theme?:    ArkzenTermYamlBlock          // @arkzen:term:theme
  assets?:   ArkzenTermYamlBlock          // @arkzen:term:assets
  export?:   ArkzenTermYamlBlock          // @arkzen:term:export
  runtimes:  ArkzenTermRuntimeBlock[]     // @arkzen:term:runtime:<lang>
  keymaps:   ArkzenTermKeymapBlock[]      // @arkzen:term:keymap[:name]
  commands:  ArkzenTermNamedYamlBlock[]   // @arkzen:term:command:<name> (dotted for subcommands)
  prompts:   ArkzenTermNamedYamlBlock[]   // @arkzen:term:prompt:<name>
  screens:   ArkzenTermNamedYamlBlock[]   // @arkzen:term:screen:<name>
  data:      ArkzenTermNamedYamlBlock[]   // @arkzen:term:data:<name>
  loops:     ArkzenTermNamedYamlBlock[]   // @arkzen:term:loop:<name>
  handlers:  ArkzenTermLangCodeBlock[]    // @arkzen:term:handler:<lang>:<name>
  views:     ArkzenTermLangCodeBlock[]    // @arkzen:term:view:<lang>:<name>
  scripts:   ArkzenTermLangCodeBlock[]    // @arkzen:term:script:<lang>:<name>
  tests:     ArkzenTermLangCodeBlock[]    // @arkzen:term:test:<lang>:<name>
  readme?:   ArkzenTermCodeBlock          // @arkzen:term:readme
}

// v20.0 - operating system blocks (@arkzen:os:*). See parser parseOs.
// YAML blocks keep the parsed value (a mapping for most blocks; the validator checks the
// shape). Code blocks keep their YAML header and body apart, like the ext and term blocks.
export interface ArkzenOsYamlBlock {
  data:  unknown
  start: number
  end:   number
}

export interface ArkzenOsNamedYamlBlock extends ArkzenOsYamlBlock {
  name: string
}

// @arkzen:os:project[:id]: the id is optional (an unnamed project is the default one)
export interface ArkzenOsProjectBlock extends ArkzenOsYamlBlock {
  name?: string
}

export interface ArkzenOsCodeBlock {
  header: Record<string, unknown>   // YAML in the opening comment ({} when the opener closes with */ on the same line)
  raw:    string                    // the code body, verbatim and trimmed
  start:  number
  end:    number
}

// @arkzen:os:source:<lang>:<name>
export interface ArkzenOsSourceBlock extends ArkzenOsCodeBlock {
  lang: string
  name: string
}

export interface ArkzenOs {
  projects:   ArkzenOsProjectBlock[]      // @arkzen:os:project[:id]
  targets:    ArkzenOsNamedYamlBlock[]    // @arkzen:os:target:<arch>
  config?:     ArkzenOsYamlBlock          // @arkzen:os:config
  boot?:       ArkzenOsYamlBlock          // @arkzen:os:boot
  memory?:     ArkzenOsYamlBlock          // @arkzen:os:memory
  interrupts?: ArkzenOsYamlBlock          // @arkzen:os:interrupts
  scheduler?:  ArkzenOsYamlBlock          // @arkzen:os:scheduler
  syscalls:   ArkzenOsNamedYamlBlock[]    // @arkzen:os:syscall:<name>
  drivers:    ArkzenOsNamedYamlBlock[]    // @arkzen:os:driver:<name>
  fs?:         ArkzenOsYamlBlock          // @arkzen:os:fs
  userland:   ArkzenOsNamedYamlBlock[]    // @arkzen:os:userland:<name>
  shell?:      ArkzenOsYamlBlock          // @arkzen:os:shell
  image?:      ArkzenOsYamlBlock          // @arkzen:os:image
  run?:        ArkzenOsYamlBlock          // @arkzen:os:run
  tests:      ArkzenOsNamedYamlBlock[]    // @arkzen:os:test:<name>
  assets?:     ArkzenOsYamlBlock          // @arkzen:os:assets
  distro?:     ArkzenOsYamlBlock          // @arkzen:os:distro
  board?:      ArkzenOsYamlBlock          // @arkzen:os:board
  sources:    ArkzenOsSourceBlock[]       // @arkzen:os:source:<lang>:<name>
  readme?:     ArkzenOsCodeBlock          // @arkzen:os:readme
}

// ─────────────────────────────────────────────
// PACKAGE BLOCKS - v18.0
// @arkzen:pkg:* blocks describe a reusable package (npm, PyPI, crates.io, ...).
// The parser records structure only; validator.ts checks the contracts.
// ─────────────────────────────────────────────
export interface ArkzenPkgBlock {
  kind:      string                       // project | target | exports | build | verify | sdk | types | validators | openapi | backend | assets | template | plugin | readme | source | test
  marker:    string                       // the marker without "@arkzen:", e.g. "pkg:source:ts:index"
  id?:       string                       // package id for the [:id] blocks
  registry?: string                       // pkg:target:<registry>
  lang?:     string                       // pkg:source|test:<lang>:<name>
  name?:     string                       // pkg:source|test:<lang>:<name>
  data?:     unknown                      // YAML blocks: the parsed value
  header?:   Record<string, unknown>      // code blocks: YAML in the opening comment ({} when none)
  raw?:      string                       // code blocks: the body, verbatim and trimmed
  start:     number
  end:       number
}

export interface ArkzenPkg {
  blocks: ArkzenPkgBlock[]
}

export interface ArkzenMeta {
  name: string
  version: string
  description: string
  auth: boolean
  dependencies: string[]
  // v6.0: favicon + pwa moved to ArkzenWebMeta. Kept as deprecated fallbacks.
  /** @deprecated move to @arkzen:meta:web */
  favicon?:     string
  /** @deprecated move to @arkzen:meta:web */
  pwa?:         ArkzenPWAMeta
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
export interface ArkzenLayout { name: string; raw: string; parent?: string; start: number; end: number }
export interface ArkzenStyle { name?: string; raw: string; start: number; end: number }

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

export interface ParsedTatemono {
  filePath: string; fileName: string; meta: ArkzenMeta
  webMeta?: ArkzenWebMeta  // v6.0: from @arkzen:meta:web block — parser.ts: parseWebMeta()
  config?: ArkzenConfigOverride
  desktopConfig?: ArkzenDesktopConfig
  frames?:        ArkzenFrames        // v15.0: @arkzen:native:frame:* / @arkzen:desktop:frame:*
  ext?:           ArkzenExt           // v17.0: @arkzen:ext:* browser extension blocks
  term?:          ArkzenTerm          // v19.0: @arkzen:term:* terminal (CLI/TUI) blocks
  os?:            ArkzenOs            // v20.0: @arkzen:os:* operating system blocks
  pkg?:           ArkzenPkg           // v18.0: @arkzen:pkg:* package blocks
  databases: ArkzenDatabase[]; apis: ArkzenApi[]; customRoutes: ArkzenCustomRoute[]
  pages: ArkzenPage[]; layouts: ArkzenLayout[]; errorHandlers: ArkzenErrorHandler[]; realtimes: ArkzenRealtime[]; events: ArkzenEvent[]
  jobs: ArkzenJob[]; notifications: ArkzenNotification[]; mails: ArkzenMail[]
  consoles: ArkzenConsole[]; components: ArkzenSection[]; styles: ArkzenStyle[]
  middlewareSnippets: ArkzenMiddlewareSnippets; policySnippets: Record<string, string>
  animation?: ArkzenSection

  // v6.5: @arkzen:script (global) + @arkzen:script:name (named, multiple)
  script?:  ArkzenSection        // global script block
  scripts:  ArkzenSection[]      // named script blocks
}

export interface ArkzenRegistry { engine: string; project: string; modules: ArkzenRegistryEntry[] }
export interface ArkzenRegistryEntry {
  name: string; version: string; status: 'active' | 'inactive' | 'error'
  filePath: string; pages: string[]; registered: string; lastUpdated: string; auth?: boolean
  desktopConfig?: ArkzenDesktopConfig
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
