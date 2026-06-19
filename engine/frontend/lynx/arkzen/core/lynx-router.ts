// ============================================================
// ARKZEN ENGINE — LYNX ROUTER v1.0
//
// Generates Lynx pages and supporting files from parsed tatemono.
//
// Mirrors expo-router.ts but targets Lynx (ReactLynx / @lynx-js/react).
// Key differences from Expo:
//   - No Expo Router file-based routes — Lynx uses a single App.tsx
//     entry point with manual navigation via lynx-router or state.
//   - Pages go to: src/pages/{tatName}/{pageName}.tsx
//   - Components go to: src/pages/{tatName}/components/{name}.tsx
//   - Styles (CSS) go to: src/arkzen/generated/{tatName}.lynx-styles.css
//   - Animations go to: src/arkzen/generated/{tatName}.lynx-animations.ts
//   - Scripts go to: src/arkzen/generated/{tatName}.lynx-utils.ts
//   - Route registry: src/arkzen/generated/routes.ts
//   - App.tsx entry: src/App.tsx  (regenerated on each build)
//
// DSL blocks consumed (Lynx namespace only):
//   @arkzen:native:page:lynx:name
//   @arkzen:native:layout:lynx:name   (bypassed for now — no RN/Expo deps)
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
import type { ParsedTatemono, ArkzenSection, ArkzenPage } from '../types'

// ─── Paths (resolved from engine/frontend/lynx/) ──────────────────────────────

const SRC_DIR       = path.resolve(process.cwd(), 'src')
const PAGES_DIR     = path.join(SRC_DIR, 'pages')
const GENERATED_DIR = path.join(SRC_DIR, 'arkzen', 'generated')
const APP_ENTRY     = path.join(SRC_DIR, 'App.tsx')

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

// ─── Route registry ───────────────────────────────────────────────────────────
// Maintains src/arkzen/generated/routes.ts — a simple map of module → page names
// that App.tsx can import to drive navigation.

function buildRoutesRegistry(allTatemonos: Map<string, string[]>): string {
  const entries = [...allTatemonos.entries()]
    .map(([tat, pages]) => `  '${tat}': [${pages.map(p => `'${p}'`).join(', ')}],`)
    .join('\n')

  return `// ============================================================
// ARKZEN GENERATED — LYNX ROUTE REGISTRY
// DO NOT EDIT DIRECTLY. Managed by arkzen lynx-router.
// ============================================================

export const lynxRoutes: Record<string, string[]> = {
${entries}
}

export type LynxRouteName = keyof typeof lynxRoutes
`
}

function updateRoutesRegistry(tatName: string, pages: string[]): void {
  const registryPath = path.join(GENERATED_DIR, 'routes.ts')
  fs.mkdirSync(GENERATED_DIR, { recursive: true })

  // Read existing registry
  let existing: Record<string, string[]> = {}
  if (fs.existsSync(registryPath)) {
    const content = fs.readFileSync(registryPath, 'utf-8')
    const m = content.match(/export const lynxRoutes[^{]*\{([\s\S]*?)\}\s*\n/)
    if (m) {
      const inner = m[1]
      const lineRe = /^\s*'([^']+)':\s*\[([^\]]*)\]/gm
      let lm: RegExpExecArray | null
      while ((lm = lineRe.exec(inner)) !== null) {
        const name   = lm[1]
        const pagesRaw = lm[2]
        existing[name] = pagesRaw
          ? pagesRaw.split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean)
          : []
      }
    }
  }

  existing[tatName] = pages
  const all = new Map(Object.entries(existing))
  writeIfChanged(registryPath, buildRoutesRegistry(all))
  console.log(`[Arkzen Lynx Router] ✓ Route registry updated: ${tatName} (${pages.length} page(s))`)
}

function removeFromRoutesRegistry(tatName: string): void {
  const registryPath = path.join(GENERATED_DIR, 'routes.ts')
  if (!fs.existsSync(registryPath)) return

  const content = fs.readFileSync(registryPath, 'utf-8')
  const m = content.match(/export const lynxRoutes[^{]*\{([\s\S]*?)\}\s*\n/)
  if (!m) return

  const existing: Record<string, string[]> = {}
  const inner = m[1]
  const lineRe = /^\s*'([^']+)':\s*\[([^\]]*)\]/gm
  let lm: RegExpExecArray | null
  while ((lm = lineRe.exec(inner)) !== null) {
    const name = lm[1]
    if (name === tatName) continue
    const pagesRaw = lm[2]
    existing[name] = pagesRaw
      ? pagesRaw.split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean)
      : []
  }

  const all = new Map(Object.entries(existing))
  writeIfChanged(registryPath, buildRoutesRegistry(all))
}

// ─── Component file generation ────────────────────────────────────────────────

function generateComponentFiles(tatemono: ParsedTatemono): void {
  const tatName    = tatemono.meta.name
  const components = tatemono.nativeLynxComponents ?? []
  if (components.length === 0) return

  const compDir = path.join(PAGES_DIR, tatName, 'components')

  for (const comp of components) {
    if (!comp.name) continue
    const filePath = path.join(compDir, `${comp.name}.tsx`)
    const content  = `// ARKZEN GENERATED — ${tatName}/${comp.name} (Lynx component)
// DO NOT EDIT DIRECTLY.
${comp.raw.trim()}
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

// ─── Script / utils file generation ──────────────────────────────────────────
// Global + named script:lynx blocks merged into one utils file per tatemono.

function generateScriptFile(tatemono: ParsedTatemono): string[] {
  const tatName = tatemono.meta.name
  const blocks: { raw: string }[] = [
    ...(tatemono.nativeScriptLynx    ? [tatemono.nativeScriptLynx]    : []),
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

function generateErrorFiles(tatemono: ParsedTatemono): void {
  const tatName  = tatemono.meta.name
  const handlers = tatemono.nativeLynxErrorHandlers ?? []

  for (const h of handlers) {
    const code     = h.type === 404 ? '404' : '500'
    const outPath  = path.join(PAGES_DIR, tatName, `error-${code}.tsx`)
    const content  = `// ARKZEN GENERATED — ${tatName} error ${code} (Lynx)
// DO NOT EDIT DIRECTLY.
${h.raw.trim()}
`
    writeIfChanged(outPath, content)
    console.log(`[Arkzen Lynx Router] ✓ Error ${code}: ${tatName}/error-${code}.tsx`)
  }
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
  const compNames = (tatemono.nativeLynxComponents ?? [])
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
// it to import all registered pages and wire up navigation.
// Simple stack-based navigation — no external router dep needed.

function regenerateAppEntry(): void {
  const registryPath = path.join(GENERATED_DIR, 'routes.ts')
  if (!fs.existsSync(registryPath)) return

  const content = fs.readFileSync(registryPath, 'utf-8')
  const m = content.match(/export const lynxRoutes[^{]*\{([\s\S]*?)\}\s*\n/)
  if (!m) return

  const modules: Record<string, string[]> = {}
  const lineRe = /^\s*'([^']+)':\s*\[([^\]]*)\]/gm
  let lm: RegExpExecArray | null
  while ((lm = lineRe.exec(m[1])) !== null) {
    const name     = lm[1]
    const pagesRaw = lm[2]
    modules[name]  = pagesRaw
      ? pagesRaw.split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean)
      : []
  }

  const entries = Object.entries(modules)
  if (entries.length === 0) return

  // Import all page components
  const imports: string[] = []
  const routes: string[]  = []

  for (const [tat, pages] of entries) {
    for (const page of pages) {
      const componentName = `${toPascalCase(tat)}${toPascalCase(page)}`
      imports.push(`import { ${componentName} } from './pages/${tat}/${page}'`)
      routes.push(`  { module: '${tat}', page: '${page}', component: ${componentName} },`)
    }
  }

  // First registered page is the default
  const firstTat  = entries[0][0]
  const firstPage = entries[0][1][0] ?? 'index'
  const defaultComponent = `${toPascalCase(firstTat)}${toPascalCase(firstPage)}`

  const appContent = `// ============================================================
// ARKZEN GENERATED — Lynx App Entry (src/App.tsx)
// DO NOT EDIT DIRECTLY. Managed by arkzen lynx-router.
// Generated: ${new Date().toISOString()}
// ============================================================

import { useState } from '@lynx-js/react'
${imports.join('\n')}

// All registered routes
const _routes = [
${routes.join('\n')}
]

type RouteKey = { module: string; page: string }

export function App() {
  const [current, setCurrent] = useState<RouteKey>({ module: '${firstTat}', page: '${firstPage}' })

  const ActivePage = _routes.find(
    r => r.module === current.module && r.page === current.page
  )?.component ?? ${defaultComponent}

  return <ActivePage navigate={setCurrent} />
}
`

  writeIfChanged(APP_ENTRY, appContent)
  console.log(`[Arkzen Lynx Router] ✓ App.tsx regenerated (${_routes?.length ?? routes.length} route(s))`)
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

  removeFromRoutesRegistry(tatName)
  regenerateAppEntry()
}

// ─── Main register function ───────────────────────────────────────────────────

export function registerLynxPages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name
  const pages   = tatemono.nativeLynxPages ?? []

  fs.mkdirSync(path.join(PAGES_DIR, tatName), { recursive: true })
  fs.mkdirSync(GENERATED_DIR, { recursive: true })

  // Generate supporting files first
  generateComponentFiles(tatemono)
  const hasStyles   = generateStyleFile(tatemono) !== null
  const animExports = generateAnimationFile(tatemono)
  const utilExports = generateScriptFile(tatemono)
  generateErrorFiles(tatemono)

  // Generate each page
  for (const page of pages) {
    generatePageFile(page, tatemono, animExports, utilExports, hasStyles)
  }

  // Update route registry + App.tsx
  updateRoutesRegistry(tatName, pages.map(p => p.name))
  regenerateAppEntry()

  console.log(`[Arkzen Lynx Router] ✓ Registered ${pages.length} page(s) for: ${tatName}`)
}

export function unregisterLynxPages(tatName: string): void {
  cleanupTatemono(tatName)
  console.log(`[Arkzen Lynx Router] ✓ Unregistered: ${tatName}`)
}