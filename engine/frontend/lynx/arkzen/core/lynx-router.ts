// ============================================================
// ARKZEN ENGINE — LYNX ROUTER v2.0
//
// Generates Lynx pages and supporting files from parsed tatemono.
// Brings the Lynx stack to functional parity with expo-router.ts:
//   - Layout / auth-guard wrapping (AuthLayout, GuestLayout, custom
//     named layouts) — previously parsed but completely unused.
//   - Tatemono asset distribution (copyAssetsToLynx/cleanLynxAssets
//     were defined but never called).
//   - Per-component import injection for animation hooks / script
//     utils referenced inside split component files (mirrors the
//     expo-router v4.5/v4.6 fixes, adapted for Lynx's CSS-based
//     styling — there is no RN StyleSheet `s` object to inject here).
//   - Error handler wiring: error-404 is used as the App.tsx
//     fallback for unmatched routes; error-500 wraps the active
//     page in a lightweight error boundary.
//   - The Arkzen Hub (arkzen/core/components/ArkzenHub.tsx) is now
//     always the default route, mirroring the Expo/Next.js hub —
//     previously App.tsx defaulted to the first registered
//     tatemono's first page, and was left as the stock Lynx
//     counter/flappy-bird template when no tatemonos were
//     registered at all.
//
// Mirrors expo-router.ts but targets Lynx (ReactLynx / @lynx-js/react).
// Key differences from Expo (still true in v2.0):
//   - No Expo Router file-based routes — Lynx uses a single App.tsx
//     entry point with manual navigation via lynx-router or state.
//   - Pages go to: src/pages/{tatName}/{pageName}.tsx
//   - Components go to: src/pages/{tatName}/components/{name}.tsx
//   - Styles (CSS) go to: src/arkzen/generated/{tatName}.lynx-styles.css
//   - Animations go to: src/arkzen/generated/{tatName}.lynx-animations.ts
//   - Scripts go to: src/arkzen/generated/{tatName}.lynx-utils.ts
//   - Route metadata (structured, source of truth): written to
//     src/arkzen/generated/routes.meta.json and consumed directly
//     by regenerateAppEntry() — far more robust than the v1.0
//     approach of regex-parsing a hand-rolled object literal back
//     out of routes.ts.
//   - routes.ts is still generated (derived from the meta JSON) for
//     any other code that wants type-safe access to the route table.
//   - App.tsx entry: src/App.tsx  (regenerated on every build)
//
// DSL blocks consumed (Lynx namespace only):
//   @arkzen:native:page:lynx:name              (+ optional :layout: tag)
//   @arkzen:native:layout:lynx:name            (custom named layouts)
//   @arkzen:native:components:lynx:name
//   @arkzen:native:style:lynx          (global CSS)
//   @arkzen:native:style:lynx:name     (named CSS)
//   @arkzen:native:animation:lynx
//   @arkzen:native:script:lynx         (global utils)
//   @arkzen:native:script:lynx:name    (named utils)
//   @arkzen:native:error:404:lynx
//   @arkzen:native:error:500:lynx
// ============================================================

import * as path from 'path'
import * as fs   from 'fs'
import type { ParsedTatemono, ArkzenSection, ArkzenPage, ArkzenErrorHandler } from '../types'
import { copyAssetsToLynx, cleanLynxAssets } from './assets'

// ─── Paths (resolved from engine/frontend/lynx/) ──────────────────────────────

const SRC_DIR            = path.resolve(process.cwd(), 'src')
const PAGES_DIR          = path.join(SRC_DIR, 'pages')
const GENERATED_DIR      = path.join(SRC_DIR, 'arkzen', 'generated')
const APP_ENTRY          = path.join(SRC_DIR, 'App.tsx')
const LYNX_ASSETS_DIR    = path.join(SRC_DIR, 'assets')
const NATIVE_LAYOUTS_DIR = path.join(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
const ROUTES_META_PATH   = path.join(GENERATED_DIR, 'routes.meta.json')
const ROUTES_TS_PATH     = path.join(GENERATED_DIR, 'routes.ts')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function writeIfChanged(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : ''
  if (existing !== content) fs.writeFileSync(filePath, content, 'utf-8')
}

function extractExportNames(raw: string): string[] {
  const names: string[] = []
  const re = /^\s*export\s+(?:function|const|class|let|var)\s+([A-Za-z_$][\w$]*)/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) names.push(m[1])
  return names
}

function toPascalCase(str: string): string {
  return str.replace(/(^|[-_])([a-z])/g, (_, __, c) => c.toUpperCase())
}

// Word-boundary "does this source reference this identifier" check —
// used to decide whether a split component file needs an extra import.
function referencesIdentifier(src: string, name: string): boolean {
  return new RegExp(`\\b${name}\\b`).test(src)
}

// ─── Route metadata (JSON source of truth) ────────────────────────────────────
// Structured per-tatemono route state, persisted to
// src/arkzen/generated/routes.meta.json. Used by regenerateAppEntry()
// to wire layouts, error fallbacks, and navigation without ever having
// to regex-parse a TS object literal back out of a generated file.

interface LynxRouteEntry {
  page:   string
  layout: string   // 'default' | 'auth' | 'guest' | <custom layout name>
}

interface LynxTatemonoRoutes {
  pages:  LynxRouteEntry[]
  has404: boolean
  has500: boolean
}

type LynxRoutesMeta = Record<string, LynxTatemonoRoutes>

function readRoutesMeta(): LynxRoutesMeta {
  if (!fs.existsSync(ROUTES_META_PATH)) return {}
  try {
    return JSON.parse(fs.readFileSync(ROUTES_META_PATH, 'utf-8')) as LynxRoutesMeta
  } catch {
    return {}
  }
}

function writeRoutesMeta(meta: LynxRoutesMeta): void {
  fs.mkdirSync(GENERATED_DIR, { recursive: true })
  fs.writeFileSync(ROUTES_META_PATH, JSON.stringify(meta, null, 2), 'utf-8')
}

// Regenerates the human-readable / type-safe routes.ts from the meta JSON.
// This file is purely derived output — nothing reads it back in. Anything
// that needs the route table programmatically (App.tsx generation) reads
// routes.meta.json directly.
function regenerateRoutesTs(meta: LynxRoutesMeta): void {
  const tatNames = Object.keys(meta).sort()

  const routesEntries = tatNames
    .map(tat => {
      const pages = meta[tat].pages
        .map(p => `    { page: '${p.page}', layout: '${p.layout}' },`)
        .join('\n')
      return `  '${tat}': [\n${pages}\n  ],`
    })
    .join('\n')

  const errorEntries = tatNames
    .map(tat => `  '${tat}': { has404: ${meta[tat].has404}, has500: ${meta[tat].has500} },`)
    .join('\n')

  const content = `// ============================================================
// ARKZEN GENERATED — LYNX ROUTE REGISTRY
// DO NOT EDIT DIRECTLY. Managed by arkzen lynx-router.
// Derived from routes.meta.json — the source of truth.
// ============================================================

export interface LynxRouteEntry {
  page:   string
  layout: string
}

export const lynxRoutes: Record<string, LynxRouteEntry[]> = {
${routesEntries}
}

export const lynxErrorFlags: Record<string, { has404: boolean; has500: boolean }> = {
${errorEntries}
}

export type LynxRouteName = keyof typeof lynxRoutes
`

  writeIfChanged(ROUTES_TS_PATH, content)
}

function updateRoutesRegistry(
  tatName: string,
  pages:   LynxRouteEntry[],
  has404:  boolean,
  has500:  boolean,
): void {
  const meta = readRoutesMeta()
  meta[tatName] = { pages, has404, has500 }
  writeRoutesMeta(meta)
  regenerateRoutesTs(meta)
  console.log(`[Arkzen Lynx Router] ✓ Route registry updated: ${tatName} (${pages.length} page(s))`)
}

function removeFromRoutesRegistry(tatName: string): void {
  const meta = readRoutesMeta()
  if (!(tatName in meta)) return
  delete meta[tatName]
  writeRoutesMeta(meta)
  regenerateRoutesTs(meta)
}

// ─── Layout resolution ─────────────────────────────────────────────────────
// Built-in guards ('auth' / 'guest') resolve to the static AuthLayout /
// GuestLayout scaffold files. Any other layout name is treated as a custom
// layout sourced from @arkzen:native:layout:lynx:<name> and must export a
// component named `${PascalCase(name)}Layout` — same convention
// expo-router.ts uses for its custom native layouts.

function isBuiltinLayout(layout: string): layout is 'auth' | 'guest' {
  return layout === 'auth' || layout === 'guest'
}

// Generates arkzen/core/layouts/custom/{tat}-{layout}.tsx for every
// @arkzen:native:layout:lynx:name block. Self-contained (author writes
// their own imports), same as components/pages in the Lynx DSL.
function generateCustomLynxLayouts(tatemono: ParsedTatemono): Set<string> {
  const tatName = tatemono.meta.name
  const layouts = (tatemono.nativeLynxLayouts ?? []) as (ArkzenSection & { name?: string })[]
  const written = new Set<string>()

  for (const layout of layouts) {
    if (!layout.name) continue
    const fileName = `${tatName}-${layout.name}.tsx`
    const filePath = path.join(NATIVE_LAYOUTS_DIR, fileName)
    const content = `// ARKZEN GENERATED — ${tatName}/${layout.name} (Lynx custom layout)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Must export a component named ${toPascalCase(layout.name)}Layout.
${layout.raw.trim()}
`
    writeIfChanged(filePath, content)
    written.add(layout.name)
    console.log(`[Arkzen Lynx Router] ✓ Custom layout: ${fileName}`)
  }

  return written
}

function cleanCustomLynxLayouts(tatName: string): void {
  if (!fs.existsSync(NATIVE_LAYOUTS_DIR)) return
  const prefix = `${tatName}-`
  for (const entry of fs.readdirSync(NATIVE_LAYOUTS_DIR)) {
    if (entry.startsWith(prefix) && entry.endsWith('.tsx')) {
      fs.unlinkSync(path.join(NATIVE_LAYOUTS_DIR, entry))
      console.log(`[Arkzen Lynx Router] ✓ Removed custom layout: ${entry}`)
    }
  }
}

// ─── Component file generation ────────────────────────────────────────────────

function generateComponentFiles(
  tatemono:      ParsedTatemono,
  animExports:   string[],
  scriptExports: string[],
  hasStyles:     boolean,
): void {
  const tatName    = tatemono.meta.name
  const components = (tatemono.nativeLynxComponents ?? []) as (ArkzenSection & { name?: string })[]
  if (components.length === 0) return

  const compDir = path.join(PAGES_DIR, tatName, 'components')

  for (const comp of components) {
    if (!comp.name) continue
    const filePath = path.join(compDir, `${comp.name}.tsx`)

    // v2.0: inject animation-hook / script-util imports if this component
    // references identifiers exported from the generated animation/utils
    // files. Lynx styling is CSS-based (no RN `StyleSheet.create` object
    // to inject), so the only extra import surface is animation + scripts,
    // plus the stylesheet itself if the component uses non-trivial classes.
    const extraImports: string[] = []
    const usedAnim = animExports.filter(n => referencesIdentifier(comp.raw, n))
    if (usedAnim.length > 0) {
      extraImports.push(`import { ${usedAnim.join(', ')} } from '../../../arkzen/generated/${tatName}.lynx-animations'`)
    }
    const usedScript = scriptExports.filter(n => referencesIdentifier(comp.raw, n))
    if (usedScript.length > 0) {
      extraImports.push(`import { ${usedScript.join(', ')} } from '../../../arkzen/generated/${tatName}.lynx-utils'`)
    }
    if (hasStyles && /className\s*=/.test(comp.raw)) {
      extraImports.push(`import '../../../arkzen/generated/${tatName}.lynx-styles.css'`)
    }

    const importBlock = extraImports.length > 0 ? extraImports.join('\n') + '\n\n' : ''

    const content = `// ARKZEN GENERATED — ${tatName}/${comp.name} (Lynx component)
// DO NOT EDIT DIRECTLY.
${importBlock}${comp.raw.trim()}
`
    writeIfChanged(filePath, content)
    console.log(`[Arkzen Lynx Router] ✓ Component: ${tatName}/components/${comp.name}.tsx`)
  }
}

// ─── Style file generation ────────────────────────────────────────────────────
// Lynx uses CSS (not StyleSheet.create) — global and named blocks are merged
// into one .css file per tatemono.

function generateStyleFile(tatemono: ParsedTatemono): string | null {
  const tatName = tatemono.meta.name
  const blocks: ArkzenSection[] = [
    ...(tatemono.nativeLynxStyleGlobal ? [tatemono.nativeLynxStyleGlobal] : []),
    ...(tatemono.nativeLynxStyles ?? []),
  ]

  const outPath = path.join(GENERATED_DIR, `${tatName}.lynx-styles.css`)

  if (blocks.length === 0) {
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath)
      console.log(`[Arkzen Lynx Router] ✓ Removed stale: ${tatName}.lynx-styles.css`)
    }
    return null
  }

  const css = blocks.map(b => b.raw.trim()).join('\n\n')
  const output = `/* ============================================================
   ARKZEN GENERATED LYNX STYLES — ${tatName}
   Source: @arkzen:native:style:lynx / @arkzen:native:style:lynx:*
   DO NOT EDIT DIRECTLY.
   Generated: ${new Date().toISOString()}
   ============================================================ */

${css}
`

  writeIfChanged(outPath, output)
  console.log(`[Arkzen Lynx Router] ✓ ${tatName}.lynx-styles.css`)
  return outPath
}

// ─── Animation file generation ────────────────────────────────────────────────

function generateAnimationFile(tatemono: ParsedTatemono): string[] {
  const tatName = tatemono.meta.name
  const block   = tatemono.nativeAnimationLynx
  const outPath = path.join(GENERATED_DIR, `${tatName}.lynx-animations.ts`)

  if (!block) {
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath)
      console.log(`[Arkzen Lynx Router] ✓ Removed stale: ${tatName}.lynx-animations.ts`)
    }
    return []
  }

  const output = `// ============================================================
// ARKZEN GENERATED LYNX ANIMATIONS — ${tatName}
// Source: @arkzen:native:animation:lynx
// DO NOT EDIT DIRECTLY.
// Generated: ${new Date().toISOString()}
// ============================================================

${block.raw.trim()}
`

  writeIfChanged(outPath, output)
  console.log(`[Arkzen Lynx Router] ✓ ${tatName}.lynx-animations.ts`)
  return extractExportNames(block.raw)
}

// ─── Script (utils) file generation ───────────────────────────────────────────

function generateScriptFile(tatemono: ParsedTatemono): string[] {
  const tatName = tatemono.meta.name
  const blocks: ArkzenSection[] = [
    ...(tatemono.nativeScriptLynx ? [tatemono.nativeScriptLynx] : []),
    ...(tatemono.nativeScriptsLynx ?? []),
  ]
  const outPath = path.join(GENERATED_DIR, `${tatName}.lynx-utils.ts`)

  if (blocks.length === 0) {
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath)
      console.log(`[Arkzen Lynx Router] ✓ Removed stale: ${tatName}.lynx-utils.ts`)
    }
    return []
  }

  const body = blocks.map(b => b.raw.trim()).join('\n\n')
  const output = `// ============================================================
// ARKZEN GENERATED LYNX UTILS — ${tatName}
// Source: @arkzen:native:script:lynx / @arkzen:native:script:lynx:*
// DO NOT EDIT DIRECTLY.
// Generated: ${new Date().toISOString()}
// ============================================================

${body}
`

  writeIfChanged(outPath, output)
  console.log(`[Arkzen Lynx Router] ✓ ${tatName}.lynx-utils.ts`)

  const allNames: string[] = []
  for (const b of blocks) allNames.push(...extractExportNames(b.raw))
  return allNames
}

// ─── Error handler file generation ───────────────────────────────────────────

function generateErrorFiles(tatemono: ParsedTatemono): { has404: boolean; has500: boolean } {
  const tatName  = tatemono.meta.name
  const handlers = (tatemono.nativeLynxErrorHandlers ?? []) as ArkzenErrorHandler[]

  let has404 = false
  let has500 = false

  for (const h of handlers) {
    const code     = h.type === '404' ? '404' : '500'
    if (code === '404') has404 = true
    if (code === '500') has500 = true
    const outPath  = path.join(PAGES_DIR, tatName, `error-${code}.tsx`)
    const content  = `// ARKZEN GENERATED — ${tatName} error ${code} (Lynx)
// DO NOT EDIT DIRECTLY.
${h.raw.trim()}
`
    writeIfChanged(outPath, content)
    console.log(`[Arkzen Lynx Router] ✓ Error ${code}: ${tatName}/error-${code}.tsx`)
  }

  return { has404, has500 }
}

// ─── Page file generation ─────────────────────────────────────────────────────

function generatePageFile(
  page:           ArkzenPage,
  tatemono:       ParsedTatemono,
  animExports:    string[],
  scriptExports:  string[],
  hasStyles:      boolean,
): void {
  const tatName  = tatemono.meta.name
  const pageName = page.name
  const outPath  = path.join(PAGES_DIR, tatName, `${pageName}.tsx`)

  const animImport = animExports.length > 0
    ? `import { ${animExports.join(', ')} } from '../../arkzen/generated/${tatName}.lynx-animations'\n`
    : ''

  const scriptImport = scriptExports.length > 0
    ? `import { ${scriptExports.join(', ')} } from '../../arkzen/generated/${tatName}.lynx-utils'\n`
    : ''

  const styleImport = hasStyles
    ? `import '../../arkzen/generated/${tatName}.lynx-styles.css'\n`
    : ''

  // Component imports
  const compNames = ((tatemono.nativeLynxComponents ?? []) as (ArkzenSection & { name?: string })[])
    .filter(c => c.name && page.raw.includes(c.name))
    .map(c => c.name!)

  const compImports = compNames.length > 0
    ? compNames.map(n => `import { ${toPascalCase(n)} } from './components/${n}'`).join('\n') + '\n'
    : ''

  const content = `// ARKZEN GENERATED — ${tatName}/${pageName} (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
${animImport}${scriptImport}${styleImport}${compImports}
${page.raw.trim()}
`

  writeIfChanged(outPath, content)
  console.log(`[Arkzen Lynx Router] ✓ Page: ${tatName}/${pageName}.tsx`)
}

// ─── App.tsx regeneration ─────────────────────────────────────────────────────
// Lynx has a single entry point (src/App.tsx). Arkzen owns it and regenerates
// it to import all registered pages plus the Arkzen Hub, and wires up:
//   - Hub as the default route (mirrors Expo/Next.js — was previously the
//     first registered tatemono's first page, or the stock template).
//   - Layout / auth-guard wrapping per route (AuthLayout / GuestLayout /
//     custom named layouts — previously parsed but never applied).
//   - error-404 page as the fallback for unmatched module/page targets.
//   - error-500 page (if present) as a lightweight per-tatemono error
//     boundary around the active page.
// Simple stack-based navigation — no external router dep needed.

function regenerateAppEntry(): void {
  const meta = readRoutesMeta()
  const tatNames = Object.keys(meta)

  const imports: string[]      = []
  const layoutImports: string[] = []
  const errorImports: string[] = []
  const routeEntries: string[] = []
  const layoutImportSeen       = new Set<string>()
  const errorImportSeen        = new Set<string>()

  let usesAuthLayout  = false
  let usesGuestLayout = false

  for (const tat of tatNames) {
    const { pages, has404, has500 } = meta[tat]

    const loginPage = pages.find(p => p.page === 'login')?.page
      ?? pages.find(p => p.layout === 'guest')?.page
      ?? 'index'
    const dashboardPage = pages.find(p => p.page === 'dashboard')?.page
      ?? pages.find(p => p.layout === 'auth')?.page
      ?? 'index'
    const loginRoute     = `/${tat}/${loginPage}`
    const dashboardRoute = `/${tat}/${dashboardPage}`

    for (const route of pages) {
      const componentName = `${toPascalCase(tat)}${toPascalCase(route.page)}`
      imports.push(`import { ${componentName} } from './pages/${tat}/${route.page}'`)

      let layoutComponent = 'null'
      if (route.layout === 'auth') {
        usesAuthLayout = true
        layoutComponent = 'AuthLayout'
      } else if (route.layout === 'guest') {
        usesGuestLayout = true
        layoutComponent = 'GuestLayout'
      } else if (route.layout && route.layout !== 'default') {
        const layoutFileKey = `${tat}-${route.layout}`
        const layoutCompName = `${toPascalCase(tat)}${toPascalCase(route.layout)}Layout`
        if (!layoutImportSeen.has(layoutFileKey)) {
          layoutImportSeen.add(layoutFileKey)
          layoutImports.push(
            `import { ${toPascalCase(route.layout)}Layout as ${layoutCompName} } from '../arkzen/core/layouts/custom/${layoutFileKey}'`
          )
        }
        layoutComponent = layoutCompName
      }

      routeEntries.push(
        `  { module: '${tat}', page: '${route.page}', component: ${componentName}, layout: ${layoutComponent}, loginRoute: '${loginRoute}', dashboardRoute: '${dashboardRoute}' },`
      )
    }

    if (has404 && !errorImportSeen.has(`${tat}:404`)) {
      errorImportSeen.add(`${tat}:404`)
      const errComp = `${toPascalCase(tat)}Error404`
      errorImports.push(`import { default as ${errComp} } from './pages/${tat}/error-404'`)
    }
    if (has500 && !errorImportSeen.has(`${tat}:500`)) {
      errorImportSeen.add(`${tat}:500`)
      const errComp = `${toPascalCase(tat)}Error500`
      errorImports.push(`import { default as ${errComp} } from './pages/${tat}/error-500'`)
    }
  }

  if (usesAuthLayout)  layoutImports.unshift(`import { AuthLayout }  from '../arkzen/core/layouts/AuthLayout'`)
  if (usesGuestLayout) layoutImports.unshift(`import { GuestLayout } from '../arkzen/core/layouts/GuestLayout'`)

  const error404Map = tatNames
    .filter(t => meta[t].has404)
    .map(t => `  '${t}': ${toPascalCase(t)}Error404,`)
    .join('\n')

  const error500Map = tatNames
    .filter(t => meta[t].has500)
    .map(t => `  '${t}': ${toPascalCase(t)}Error500,`)
    .join('\n')

  const appContent = `// ============================================================
// ARKZEN GENERATED — Lynx App Entry (src/App.tsx)
// DO NOT EDIT DIRECTLY. Managed by arkzen lynx-router.
// Generated: ${new Date().toISOString()}
// ============================================================

import { useState, useEffect, useCallback } from '@lynx-js/react'
import { setGlobalNavigate } from '../arkzen/core/adapters/router'
import { ArkzenHub } from '../arkzen/core/components/ArkzenHub'
${layoutImports.join('\n')}
${imports.join('\n')}
${errorImports.join('\n')}

// All registered routes
const _routes = [
${routeEntries.join('\n')}
]

const _error404: Record<string, any> = {
${error404Map}
}

const _error500: Record<string, any> = {
${error500Map}
}

type RouteKey = { module: string; page: string }

// NOTE on error-500 wiring: Lynx renders through a custom dual-thread
// reconciler (not ReactDOM), so support for class-component error
// boundaries (componentDidCatch) is unconfirmed for this target — shipping
// an unverified boundary here would risk silently breaking every route if
// the renderer doesn't implement that lifecycle. _error500 is exposed below
// so a tatemono's error-500 page can be rendered manually (e.g. from a
// try/catch inside the page itself, or wired into a confirmed boundary
// once Lynx error-boundary support is verified against a real build).
export function getError500Page(tatName: string) {
  return _error500[tatName] ?? null
}

export function App() {
  const [current, setCurrent] = useState<RouteKey>({ module: '__hub__', page: 'index' })

  const navigate = useCallback((target: RouteKey) => setCurrent(target), [])

  useEffect(() => { setGlobalNavigate(setCurrent) }, [])

  if (current.module === '__hub__') {
    return <ArkzenHub navigate={navigate} />
  }

  const match = _routes.find(
    r => r.module === current.module && r.page === current.page
  )

  if (!match) {
    const Fallback = _error404[current.module]
    if (Fallback) return <Fallback />
    return <ArkzenHub navigate={navigate} />
  }

  const ActivePage = match.component
  const Layout      = match.layout

  return Layout
    ? <Layout tatSlug={match.module} loginRoute={match.loginRoute} dashboardRoute={match.dashboardRoute}>
        <ActivePage navigate={navigate} />
      </Layout>
    : <ActivePage navigate={navigate} />
}
`

  writeIfChanged(APP_ENTRY, appContent)
  console.log(`[Arkzen Lynx Router] ✓ App.tsx regenerated (${routeEntries.length} route(s), hub default)`)
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

function cleanupTatemono(tatName: string): void {
  const tatDir = path.join(PAGES_DIR, tatName)
  if (fs.existsSync(tatDir)) {
    fs.rmSync(tatDir, { recursive: true, force: true })
    console.log(`[Arkzen Lynx Router] ✓ Removed pages: ${tatName}/`)
  }

  const generated = [
    path.join(GENERATED_DIR, `${tatName}.lynx-styles.css`),
    path.join(GENERATED_DIR, `${tatName}.lynx-animations.ts`),
    path.join(GENERATED_DIR, `${tatName}.lynx-utils.ts`),
  ]
  for (const f of generated) {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f)
      console.log(`[Arkzen Lynx Router] ✓ Removed: ${path.basename(f)}`)
    }
  }

  cleanCustomLynxLayouts(tatName)
  cleanLynxAssets(tatName, LYNX_ASSETS_DIR)

  removeFromRoutesRegistry(tatName)
  regenerateAppEntry()
}

// ─── Main register function ───────────────────────────────────────────────────

export function registerLynxPages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name
  const pages   = tatemono.nativeLynxPages ?? []

  fs.mkdirSync(path.join(PAGES_DIR, tatName), { recursive: true })
  fs.mkdirSync(GENERATED_DIR, { recursive: true })

  // Distribute tatemono assets — src/assets/tatemonos/{tatName}/
  const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
  const assetsPath   = path.join(tatemonosDir, tatName, 'assets')
  const hasAssets     = copyAssetsToLynx(tatName, assetsPath, LYNX_ASSETS_DIR)
  if (!hasAssets) {
    console.log(`[Arkzen Lynx Router] No assets folder for ${tatName}`)
  }

  // Generate custom named layouts (@arkzen:native:layout:lynx:name)
  generateCustomLynxLayouts(tatemono)

  // Generate supporting files first
  const hasStyles   = generateStyleFile(tatemono) !== null
  const animExports = generateAnimationFile(tatemono)
  const utilExports  = generateScriptFile(tatemono)
  generateComponentFiles(tatemono, animExports, utilExports, hasStyles)
  const { has404, has500 } = generateErrorFiles(tatemono)

  // Generate each page
  for (const page of pages) {
    generatePageFile(page, tatemono, animExports, utilExports, hasStyles)
  }

  // Update route registry (with layout metadata) + App.tsx
  const routeEntries: LynxRouteEntry[] = pages.map(p => ({ page: p.name, layout: p.layout ?? 'default' }))
  updateRoutesRegistry(tatName, routeEntries, has404, has500)
  regenerateAppEntry()

  console.log(`[Arkzen Lynx Router] ✓ Registered ${pages.length} page(s) for: ${tatName}`)
}

export function unregisterLynxPages(tatName: string): void {
  cleanupTatemono(tatName)
  console.log(`[Arkzen Lynx Router] ✓ Unregistered: ${tatName}`)
}