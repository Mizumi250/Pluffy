// ============================================================
// ARKZEN ENGINE — LYNX ROUTER v3.1
//
// v3.1 — Two remaining gaps vs expo-router.ts closed:
//   1. Default/index route guarantee. Expo always makes /${tatName}
//      resolve (app/{tat}/index.tsx auto-redirects to the first real page
//      when no literal "index" page is declared). Lynx's LYNX_ROUTES table
//      had no equivalent — a tatemono with only login/register/dashboard
//      pages (no "index") had zero route entries for { page: 'index' }.
//      regenerateRoutesFile() now aliases the first page's already-imported
//      component under page: 'index' whenever no literal index page exists
//      — no new files, no new imports, just one extra table row. New
//      getDefaultPage(tatName) helper exported alongside getLoginRoute /
//      getDashboardRoute for any caller that wants the resolved page name.
//   2. Stale dual-extension sidecar files. Expo hit this in v4.4: an older
//      generator run writes e.g. constants.ts, a newer run switches to
//      constants.tsx, and the stale .ts sibling never gets removed —
//      bundler resolution order can let it silently shadow the correct
//      file. generateIndividualLynxComponentFiles() now calls
//      removeStaleSiblingExt() next to every constants/hooks/utils/types
//      write-or-delete decision, the same defensive pattern Expo uses.
//
// v3.0 — FULL EXPO PARITY PASS
// Brings Lynx component/page generation up to the same machinery
// expo-router.ts actually uses (not just the same file layout):
//
//   - Import resolution (resolveImports / flattenMultilineImports /
//     stripTemplateLiterals) — merges & dedupes imports instead of
//     pasting blocks verbatim.
//   - Per-export extractors (components / shared constants /
//     destructured constants / namespace imports / named imports by
//     module / custom hooks / shared types / utility functions) —
//     mirrors extractNative*Names but reads tatemono.nativeLynxComponents.
//   - splitLynxComponentDeclarations + generateIndividualLynxComponentFiles
//     — splits a multi-export `:lynx:name` block (e.g. the common
//     `:lynx:shared` block with several components in one DSL block)
//     into one real file per component/hook/constant/type, with
//     each file importing only what it actually references.
//   - generatePageFile now resolves imports the same way: it finds
//     every component/constant/hook/type/util the page body actually
//     references (via findReferencedNames) and imports it from the
//     generated per-file output — instead of the v2.1 behaviour of
//     matching the *block name* against the page source, which silently
//     produced ZERO imports for any multi-component named block (e.g.
//     a `:lynx:shared` block named "shared" never matches against page
//     JSX that uses `Badge`, `PrimaryButton`, etc., since the literal
//     string "shared" never appears in the page body). That was a real
//     bug — pages referencing such components had no import and would
//     fail to compile. v3.0 fixes it.
//   - Layout resolution (parseLynxLayoutDecl / resolveLynxLayoutChain /
//     getLynxLayoutImport / getLynxLayoutComponent) now mirrors Expo's
//     native layout helpers and additionally handles the COMPOUND
//     `+auth:name` / `+guest:name` guard+custom-layout declaration that
//     the Lynx parser (parseAllNativeLynxPages) already accepts via
//     `@arkzen:native:page:lynx:layout:+auth:shell` — v2.1's
//     regenerateRoutesFile() did a naive `route.layout === 'auth'`
//     string check, so a compound declaration fell through to the
//     "custom layout" branch and tried to import a layout file literally
//     named e.g. `{tat}-+auth:shell.tsx`, which never exists. v3.0
//     parses the compound syntax properly and — since App.tsx is static
//     and a route can only reference ONE layout component — synthesises
//     a small composite wrapper file under
//     generated/_layout-composites/ when more than one layer (guard +
//     custom, or in the future a resolved parent chain) needs to nest.
//   - getLoginRoute / getDashboardRoute exported helpers, mirroring
//     Expo's routes.ts, for any other engine code that wants the
//     programmatic form instead of reading the baked LYNX_ROUTES table.
//
// NOTE ON SCOPE: this does NOT port Expo's generateScreenFile wrapper
// scaffold (SafeAreaView / StatusBar / useRouter / setActiveTatemono
// inlined into every screen). That scaffold is Expo-Router-specific —
// Lynx has its own single-entry-point (App.tsx) + LYNX_ROUTES table
// architecture, which already serves the same purpose without forcing
// every page through a React Native navigation wrapper. Porting that
// part 1:1 would mean inventing Lynx-specific primitives this codebase
// doesn't define anywhere yet. What WAS ported is everything to do with
// resolving/injecting imports correctly, which is the part that was
// actually broken.
//
// NOTE ON LAYOUT PARENT CHAINS: resolveLynxLayoutChain walks a `.parent`
// field, exactly like Expo's resolveNativeLayoutChain — but neither
// stack's native layout parser (parseAllNativeLayouts / 
// parseAllNativeLynxLayouts) currently extracts a `parent:` YAML key for
// native layouts (only the WEB layout parser does, v11.0). So on both
// stacks today the chain always resolves to a single link. The function
// is still here, structurally identical to Expo, so the day `parent:`
// extraction gets added to the native layout parsers (a parser.ts change,
// out of scope for this file), both routers start resolving real chains
// with zero further changes needed here.
//
// Mirrors expo-router.ts but targets Lynx (ReactLynx / @lynx-js/react).
// Key differences from Expo (still true in v3.0):
//   - No Expo Router file-based routes — Lynx uses a single App.tsx
//     entry point with manual navigation via lynx-router or state.
//   - Pages go to: src/pages/{tatName}/{pageName}.tsx
//   - Components go to: src/pages/{tatName}/components/{name}.tsx
//   - Styles (CSS) go to: src/arkzen/generated/{tatName}.lynx-styles.css
//   - Animations go to: src/arkzen/generated/{tatName}.lynx-animations.ts
//   - Scripts go to: src/arkzen/generated/{tatName}.lynx-utils.ts
//   - Route metadata (structured, source of truth): written to
//     src/arkzen/generated/routes.meta.json and consumed directly
//     by regenerateRoutesFile().
//   - routes.ts is still generated (derived from the meta JSON) for
//     any other code that wants type-safe access to the route table.
//   - App.tsx entry: src/App.tsx (static — never regenerated).
//
// DSL blocks consumed (Lynx namespace only):
//   @arkzen:native:page:lynx:name              (+ optional :layout: tag,
//                                                  supports +auth/+guest
//                                                  and +auth:name/+guest:name)
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

// Lynx-specific shape of a named section: the parser tacks `name` onto every
// ArkzenSection at runtime (extractAllNamedSections) even though the shared
// ArkzenSection type doesn't declare it. `parent` is included for structural
// parity with Expo's ArkzenLayout — see NOTE ON LAYOUT PARENT CHAINS above;
// it will simply always be undefined until the parser populates it.
type NamedLynxSection = ArkzenSection & { name?: string; parent?: string }

// ─── Paths (resolved from engine/frontend/lynx/) ──────────────────────────────

const SRC_DIR             = path.resolve(process.cwd(), 'src')
const PAGES_DIR           = path.join(SRC_DIR, 'pages')
const GENERATED_DIR       = path.join(SRC_DIR, 'arkzen', 'generated')
const LAYOUT_COMPOSITE_DIR = path.join(GENERATED_DIR, '_layout-composites')
// App.tsx is static now — not generated. See regenerateRoutesFile() below.
const LYNX_ASSETS_DIR     = path.join(SRC_DIR, 'assets')
const NATIVE_LAYOUTS_DIR  = path.join(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
const ROUTES_META_PATH    = path.join(GENERATED_DIR, 'routes.meta.json')
const ROUTES_TS_PATH      = path.join(GENERATED_DIR, 'routes.ts')

// ─── Basic helpers ──────────────────────────────────────────────────────────

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

// v3.1: defends against the same class of bug Expo hit in v4.4 — an older
// generator run writing e.g. constants.ts, a newer one switching to
// constants.tsx, and the stale .ts sibling surviving every regeneration
// because nothing ever looked for it. TS/bundler resolution order would let
// the stale file silently shadow the correct one. Call this any time a
// sidecar file's canonical extension is decided, passing the OTHER
// extension(s) that must not be allowed to linger.
function removeStaleSiblingExt(dir: string, baseName: string, staleExts: string[]): void {
  for (const ext of staleExts) {
    const p = path.join(dir, `${baseName}${ext}`)
    if (fs.existsSync(p)) {
      fs.unlinkSync(p)
      console.log(`[Arkzen Lynx Router] 🧹 Removed stale sidecar: ${baseName}${ext}`)
    }
  }
}

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

// ─── Template literal stripper ────────────────────────────────────────────────
// Replaces template literal STATIC content char-for-char with whitespace so
// character indices are preserved for splitLynxComponentDeclarations slicing.
// Identical to expo-router.ts's copy — kept local (not imported from parser.ts)
// for the same reason Expo keeps its own copy: this file owns its own slicing
// guarantees independent of parser internals.

function stripTemplateLiterals(src: string): string {
  let result = ''
  let i = 0
  while (i < src.length) {
    if (src[i] === '`') {
      result += ' '
      i++
      while (i < src.length) {
        if (src[i] === '\\') { result += '  '; i += 2; continue }
        if (src[i] === '`') { result += ' '; i++; break }
        if (src[i] === '$' && src[i + 1] === '{') {
          result += '  '
          i += 2
          let depth = 1
          while (i < src.length && depth > 0) {
            if (src[i] === '{') depth++
            else if (src[i] === '}') {
              depth--
              if (depth === 0) { result += '}'; i++; break }
            }
            result += src[i]
            i++
          }
          continue
        }
        result += ' '
        i++
      }
    } else {
      result += src[i]
      i++
    }
  }
  return result
}

// ─── flattenMultilineImports ───────────────────────────────────────────────────

function flattenMultilineImports(code: string): string {
  const lines = code.split('\n')
  const out: string[] = []
  let inImport = false
  let buffer = ''
  let depth = 0

  const isCompleteImport = (s: string): boolean =>
    /^import\s+(?:(?:[\w*\s{},]+)\s+from\s+['"][^'"]+['"]|['"][^'"]+['"])\s*;?\s*$/.test(s)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!inImport && /^\s*import\s/.test(line)) {
      inImport = true
      buffer = trimmed
      depth += (trimmed.match(/\{/g) || []).length
      depth -= (trimmed.match(/\}/g) || []).length
      const collapsed = buffer.replace(/\s+/g, ' ')
      if (depth === 0 && isCompleteImport(collapsed)) {
        out.push(collapsed)
        inImport = false
        buffer = ''
        depth = 0
      }
      continue
    }

    if (inImport) {
      buffer += ' ' + trimmed
      depth += (trimmed.match(/\{/g) || []).length
      depth -= (trimmed.match(/\}/g) || []).length
      const collapsed = buffer.replace(/\s+/g, ' ')
      if (depth === 0 && isCompleteImport(collapsed)) {
        out.push(collapsed)
        inImport = false
        buffer = ''
        depth = 0
      }
      continue
    }

    out.push(line)
  }

  if (inImport && buffer.trim()) out.push(buffer.replace(/\s+/g, ' '))
  return out.join('\n')
}

// ─── resolveImports ───────────────────────────────────────────────────────────
// Lynx equivalent of expo-router.ts's resolveImports. The one real difference:
// @lynx-js/react has NO default export (verbatimModuleSyntax in tsconfig
// forbids faking one via esModuleInterop), and Lynx uses the automatic JSX
// runtime, so components never need `React` in scope at all. Hooks/named
// imports merge onto '@lynx-js/react' as named-only — no default import is
// ever emitted for this module.

const LYNX_CORE_MODULE = '@lynx-js/react'

interface ResolvedImports {
  canonicalBlock:  string
  strippedSources: string[]
}

function resolveImports(
  sources: string[],
  engineRequired: {
    coreHooks?: string[]
    // module → named exports that the engine always needs
    engineNamed?: Record<string, string[]>
    // namespace alias → module, e.g. { Lottie: '@lynx-js/lottie' }
    engineNamespaces?: Record<string, string>
    extra?: string
  } = {}
): ResolvedImports {
  const importMap = new Map<string, { defaultImport?: string; named: Set<string> }>()
  const getEntry = (mod: string) => {
    if (!importMap.has(mod)) importMap.set(mod, { named: new Set() })
    return importMap.get(mod)!
  }

  const coreEntry = getEntry(LYNX_CORE_MODULE)
  ;(engineRequired.coreHooks ?? []).forEach(h => coreEntry.named.add(h))

  for (const [mod, names] of Object.entries(engineRequired.engineNamed ?? {})) {
    const entry = getEntry(mod)
    names.forEach(n => entry.named.add(n))
  }

  for (const [ns, mod] of Object.entries(engineRequired.engineNamespaces ?? {})) {
    getEntry(mod).defaultImport = `* as ${ns}`
  }

  // Normalise module specifiers so @/arkzen/* paths (written by tatemono
  // authors) collapse to the same importMap key as the relative
  // ../../../../arkzen/* paths engineNamed uses. Depth is fixed at 4 here
  // since resolveImports is only ever called from the component-splitting
  // path in this file, and component files live at
  // src/pages/{tat}/components/{Name}.tsx — 4 directories below the Lynx
  // project root (src/pages/{tat}/components), unlike Expo's app/{tat}/
  // /components which is only 3 deep. Page-level normalisation is done
  // separately in generatePageFile with depth 3.
  //
  // Bare 'react' imports are also folded onto LYNX_CORE_MODULE here: tatemono
  // component blocks are sometimes copy-shared from the Expo/RN versions of
  // the same component, which legitimately import from 'react'. Lynx has no
  // real 'react' package — without this alias those imports survive
  // resolveImports untouched and get re-emitted as a second, colliding
  // `import React ... from 'react'` line alongside the merged
  // `@lynx-js/react` line (TS2300: Duplicate identifier 'React').
  const normaliseMod = (mod: string): string => {
    if (mod === 'react') return LYNX_CORE_MODULE
    return mod.replace(/^@\/arkzen\//, '../../../../arkzen/')
  }

  const defaultImportRe   = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/
  const namedImportRe     = /^import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  const mixedImportRe     = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*,\s*\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  const namespaceImportRe = /^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/
  const sideEffectRe      = /^import\s+['"]([^'"]+)['"]\s*;?/

  const sideEffects: string[] = []

  for (const source of sources) {
    const flattened = flattenMultilineImports(source)
    for (const rawLine of flattened.split('\n')) {
      const line = rawLine.trim()
      if (!line.startsWith('import ')) continue

      let m: RegExpMatchArray | null

      m = line.match(mixedImportRe)
      if (m) {
        const [, def, namedStr, rawMod] = m
        const mod = normaliseMod(rawMod)
        const entry = getEntry(mod)
        if (mod !== LYNX_CORE_MODULE) entry.defaultImport = def
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      m = line.match(namespaceImportRe)
      if (m) {
        const [, ns, rawMod] = m
        getEntry(normaliseMod(rawMod)).defaultImport = `* as ${ns}`
        continue
      }

      m = line.match(namedImportRe)
      if (m) {
        const [, namedStr, rawMod] = m
        const mod = normaliseMod(rawMod)
        const entry = getEntry(mod)
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      m = line.match(defaultImportRe)
      if (m) {
        const [, def, rawMod] = m
        const mod = normaliseMod(rawMod)
        if (mod === LYNX_CORE_MODULE) continue
        getEntry(mod).defaultImport = def
        continue
      }

      m = line.match(sideEffectRe)
      if (m) {
        sideEffects.push(`import '${normaliseMod(m[1])}'`)
        continue
      }
    }
  }

  const lines: string[] = []

  const coreNamed = [...(importMap.get(LYNX_CORE_MODULE)?.named ?? [])]
    .filter(n => n !== 'React')
    .sort()
  if (coreNamed.length > 0) {
    lines.push(`import { ${coreNamed.join(', ')} } from '${LYNX_CORE_MODULE}'`)
  }

  const otherModules = [...importMap.keys()]
    .filter(m => m !== LYNX_CORE_MODULE)
    .sort()

  for (const mod of otherModules) {
    const { defaultImport, named } = importMap.get(mod)!
    const namedArr = [...named].sort()
    if (defaultImport?.startsWith('* as ')) {
      lines.push(`import ${defaultImport} from '${mod}'`)
    } else if (defaultImport && namedArr.length > 0) {
      lines.push(`import ${defaultImport}, { ${namedArr.join(', ')} } from '${mod}'`)
    } else if (defaultImport) {
      lines.push(`import ${defaultImport} from '${mod}'`)
    } else if (namedArr.length > 0) {
      lines.push(`import { ${namedArr.join(', ')} } from '${mod}'`)
    }
  }

  sideEffects.forEach(s => lines.push(s))

  if (engineRequired.extra) lines.push(engineRequired.extra)

  const canonicalBlock = lines.filter(Boolean).join('\n')

  const stripRaw = (src: string) =>
    src
      .replace(/^\s*import\s[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .trim()

  const strippedSources = sources.map(stripRaw)

  return { canonicalBlock, strippedSources }
}

// Quick identifier-only extraction of whatever a source ALREADY imports —
// used so generatePageFile doesn't double-import a name the page block
// already brought in itself (Lynx pages, unlike Expo screens, keep their
// own import statements verbatim rather than going through resolveImports).
function extractAlreadyImportedNames(source: string): Set<string> {
  const names = new Set<string>()
  const flattened = flattenMultilineImports(source)
  const namedImportRe = /^import\s+(?:[A-Za-z_$][A-Za-z0-9_$]*\s*,\s*)?\{([^}]*)\}\s+from\s+['"][^'"]+['"]\s*;?/
  const defaultImportRe = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"][^'"]+['"]\s*;?/
  const namespaceImportRe = /^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"][^'"]+['"]\s*;?/

  for (const rawLine of flattened.split('\n')) {
    const line = rawLine.trim()
    if (!line.startsWith('import ')) continue
    let m = line.match(namedImportRe)
    if (m) {
      m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => names.add(n.split(/\s+as\s+/)[0].trim()))
      continue
    }
    m = line.match(namespaceImportRe)
    if (m) { names.add(m[1]); continue }
    m = line.match(defaultImportRe)
    if (m) { names.add(m[1]); continue }
  }
  return names
}

// ─── Route metadata (JSON source of truth) ────────────────────────────────────

interface LynxRouteEntry {
  page:   string
  layout: string   // 'default' | 'auth' | 'guest' | '+auth' | '+auth:name' | '+guest:name' | <custom layout name>
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

// ─── Layout resolution v3.0 ────────────────────────────────────────────────
// Mirrors expo-router.ts's parseNativeLayoutDecl / resolveNativeLayoutChain /
// getNativeLayoutImport / getNativeLayoutComponent. Built-in guards ('auth' /
// 'guest') resolve to the static AuthLayout / GuestLayout scaffold files. Any
// other layout name is a custom layout sourced from
// @arkzen:native:layout:lynx:<name> and must export `${PascalCase(name)}Layout`.
//
// Handles the compound `+auth:name` / `+guest:name` syntax that
// parseAllNativeLynxPages already accepts from
// `@arkzen:native:page:lynx:layout:+auth:shell` — v2.1 never parsed this on
// the router side, so a compound declaration silently broke (treated as a
// literal, nonexistent custom layout file name).

function isBuiltinLayout(layout: string): layout is 'auth' | 'guest' {
  return layout === 'auth' || layout === 'guest'
}

function parseLynxLayoutDecl(raw: string): { guard?: 'auth' | 'guest'; layout?: string } {
  const t = (raw ?? '').trim()
  const m = t.match(/^\+?(auth|guest)(?::([a-zA-Z0-9_-]+))?$/)
  if (m) return { guard: m[1] as 'auth' | 'guest', layout: m[2] ?? undefined }
  if (t === 'auth')  return { guard: 'auth' }
  if (t === 'guest') return { guard: 'guest' }
  if (t === 'default' || t === '') return {}
  return { layout: t || undefined }
}

// Walks `.parent` links from innermost layout outward. See NOTE ON LAYOUT
// PARENT CHAINS at the top of this file — `parent` is never populated for
// native layouts today (on either stack), so this always resolves to a
// single-element chain in practice. Kept structurally identical to Expo so
// the moment parser.ts grows `parent:` extraction for native layouts, both
// routers pick it up automatically.
function resolveLynxLayoutChain(layoutName: string, allLayouts: NamedLynxSection[]): string[] {
  const chain: string[] = []
  const visited = new Set<string>()
  let current: string | undefined = layoutName
  while (current) {
    if (visited.has(current)) throw new Error(`[Arkzen Lynx Router] Native layout chain cycle at: "${current}"`)
    visited.add(current)
    chain.unshift(current)
    current = allLayouts.find(l => l.name === current)?.parent
  }
  return chain
}

function getLynxLayoutImport(layout: string, tatName: string, fromDepth: '_layout-composites' | 'app-routes'): string {
  // app-routes.ts lives directly in GENERATED_DIR; composite wrappers live one
  // level deeper in GENERATED_DIR/_layout-composites/, so they need one extra '../'.
  const up = fromDepth === '_layout-composites' ? '../../../../' : '../../../'
  switch (layout) {
    case 'auth':  return `import { AuthLayout }  from '${up}arkzen/core/layouts/AuthLayout'`
    case 'guest': return `import { GuestLayout } from '${up}arkzen/core/layouts/GuestLayout'`
    default:      return `import { ${toPascalCase(layout)}Layout } from '${up}arkzen/core/layouts/custom/${tatName}-${layout}'`
  }
}

function getLynxLayoutComponent(layout: string): string {
  switch (layout) {
    case 'auth':  return 'AuthLayout'
    case 'guest': return 'GuestLayout'
    default:      return `${toPascalCase(layout)}Layout`
  }
}

// Resolves a route's raw layout declaration (e.g. 'auth', 'sidebar',
// '+auth:sidebar') into a single component name + the import line(s) needed
// for app-routes.ts. The route table only carries ONE `layout` component per
// route, so when more than one layer needs to nest (guard + custom layout, or
// a future multi-link parent chain) this synthesises a small composite
// wrapper file under generated/_layout-composites/ and points the route at
// that instead.
function resolveLynxRouteLayout(
  rawLayout: string,
  tatName: string,
  nativeLynxLayouts: NamedLynxSection[],
): { component: string; imports: string[] } {
  const decl = parseLynxLayoutDecl(rawLayout)

  const chain = decl.layout ? resolveLynxLayoutChain(decl.layout, nativeLynxLayouts) : []
  // Guard wraps innermost (closest to the page content) — same ordering as
  // expo-router.ts's buildNativeLayoutJSX.
  const layers = [...chain, ...(decl.guard ? [decl.guard] : [])]

  if (layers.length === 0) return { component: 'null', imports: [] }

  if (layers.length === 1) {
    const layer = layers[0]
    return {
      component: getLynxLayoutComponent(layer),
      imports:   [getLynxLayoutImport(layer, tatName, 'app-routes')],
    }
  }

  // Composite case: synthesise nested-wrapper file.
  const key = layers.join('-')
  const compositeName = `${toPascalCase(tatName)}${layers.map(toPascalCase).join('')}LayoutChain`
  const compositeFile = `${tatName}-${key}`
  const compositePath = path.join(LAYOUT_COMPOSITE_DIR, `${compositeFile}.tsx`)

  const imports = layers.map(l => getLynxLayoutImport(l, tatName, '_layout-composites'))
  const opens   = layers.map(l => `<${getLynxLayoutComponent(l)}>`)
  const closes  = [...layers].reverse().map(l => `</${getLynxLayoutComponent(l)}>`)

  const content = `// ARKZEN GENERATED — composite layout chain for ${tatName} (${layers.join(' → ')})
// DO NOT EDIT DIRECTLY. Synthesised by lynx-router because a route needs more
// than one layout layer (guard + custom layout, or a resolved parent chain)
// and app-routes.ts can only reference a single layout component per route.
${imports.join('\n')}

export function ${compositeName}({ children }: { children: JSX.Element }) {
  return (
    ${opens.join('\n    ')}
      {children}
    ${closes.join('\n    ')}
  )
}
`
  writeIfChanged(compositePath, content)
  console.log(`[Arkzen Lynx Router] ✓ Composite layout chain: ${compositeFile}.tsx (${layers.join(' → ')})`)

  return {
    component: compositeName,
    imports:   [`import { ${compositeName} } from './_layout-composites/${compositeFile}'`],
  }
}

function cleanCompositeLayouts(tatName: string): void {
  if (!fs.existsSync(LAYOUT_COMPOSITE_DIR)) return
  const prefix = `${tatName}-`
  for (const entry of fs.readdirSync(LAYOUT_COMPOSITE_DIR)) {
    if (entry.startsWith(prefix) && entry.endsWith('.tsx')) {
      fs.unlinkSync(path.join(LAYOUT_COMPOSITE_DIR, entry))
      console.log(`[Arkzen Lynx Router] ✓ Removed stale composite layout: ${entry}`)
    }
  }
}

// Generates arkzen/core/layouts/custom/{tat}-{layout}.tsx for every
// @arkzen:native:layout:lynx:name block. Self-contained (author writes
// their own imports), same as components/pages in the Lynx DSL.
function generateCustomLynxLayouts(tatemono: ParsedTatemono): Set<string> {
  const tatName = tatemono.meta.name
  const layouts = (tatemono.nativeLynxLayouts ?? []) as NamedLynxSection[]
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

// ─── Component extractors v3.0 ─────────────────────────────────────────────
// Mirror expo-router.ts's extractNative*Names exactly, but read
// tatemono.nativeLynxComponents instead of tatemono.nativeComponents. No
// isExpoTargeted-equivalent filter is needed: Lynx blocks are already
// exclusively scoped via the `:lynx:` namespace at the parser level
// (parseAllNativeLynxComponents / extractNativeImportLine confirms Lynx
// blocks never carry the @arkzen:import:expo / @arkzen:import:rn markers
// those functions strip — "Lynx pages use a separate tag and never appear
// here").

function lynxComponentBlocks(tatemono: ParsedTatemono): NamedLynxSection[] {
  return (tatemono.nativeLynxComponents ?? []) as NamedLynxSection[]
}

function extractLynxComponentNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of lynxComponentBlocks(tatemono)) {
    const stripped = stripTemplateLiterals(component.raw)
    const constMatches = stripped.match(/(?:export\s+)?const\s+([A-Z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of constMatches) {
      const name = match.match(/const\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^[A-Z_]+$/.test(name)) names.add(name)
    }
    const fnMatches = stripped.match(/(?:export\s+)?function\s+([A-Z][A-Za-z0-9_$]*)\s*[(<]/g) || []
    for (const match of fnMatches) {
      const name = match.match(/function\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

function extractLynxSharedConstantNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of lynxComponentBlocks(tatemono)) {
    const stripped = stripTemplateLiterals(component.raw)
    const matches = stripped.match(/^(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*[=:]/gm) || []
    for (const match of matches) {
      const name = match.match(/const\s+([A-Z][A-Z0-9_]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

// Top-level destructured const declarations, e.g.:
//   const { width: SW, height: SH } = SystemInfo.get()
// These bind multiple names from a single statement and don't fit the
// `const NAME = ...` pattern, so splitLynxComponentDeclarations can't isolate
// them — they'd otherwise be silently absorbed into whichever chunk happens
// to follow them in source order.
function extractLynxDestructuredConstants(tatemono: ParsedTatemono): { names: Set<string>; statements: string[] } {
  const names = new Set<string>()
  const statements: string[] = []
  const seen = new Set<string>()

  for (const component of lynxComponentBlocks(tatemono)) {
    const stripped = stripTemplateLiterals(component.raw)
    const lines = stripped.split('\n')
    const re = /^(?:export\s+)?const\s*\{([^}]*)\}\s*=\s*[^;\n]+;?\s*$/

    lines.forEach(line => {
      const m = line.match(re)
      if (!m) return
      if (seen.has(line.trim())) return
      seen.add(line.trim())

      const bindings = m[1].split(',').map(s => s.trim()).filter(Boolean)
      for (const binding of bindings) {
        const bound = binding.includes(':') ? binding.split(':')[1].trim() : binding
        const cleanName = bound.split('=')[0].trim()
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cleanName)) names.add(cleanName)
      }

      statements.push(line.trim())
    })
  }

  return { names, statements }
}

// Namespace imports declared in @arkzen:native:components:lynx blocks, e.g.:
//   import * as Lottie from '@lynx-js/lottie'
// Per-file generation splits components out, but page blocks may still
// reference these namespaces, so generatePageFile must detect such
// references and inject the matching `import * as X from 'mod'` itself.
function extractLynxNamespaceImports(tatemono: ParsedTatemono): Map<string, string> {
  const out = new Map<string, string>()
  const re = /^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/m

  for (const component of lynxComponentBlocks(tatemono)) {
    const stripped = stripTemplateLiterals(component.raw)
    for (const rawLine of stripped.split('\n')) {
      const line = rawLine.trim()
      if (!line.startsWith('import ')) continue
      const m = line.match(re)
      if (m) out.set(m[1], m[2].replace(/^@\/arkzen\//, '../../../arkzen/'))
    }
  }
  return out
}

// Named imports declared in @arkzen:native:components:lynx blocks, e.g.:
//   import { Mail, Send, XCircle } from 'lucide-react'
// Same root cause as namespace imports above — these fall through every
// local-declaration check, so we map module -> Set<importedName> for
// generatePageFile to detect references and inject the import itself.
function extractLynxNamedImportsByModule(tatemono: ParsedTatemono): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>()
  const namedImportRe = /^import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  const mixedImportRe = /^import\s+[A-Za-z_$][A-Za-z0-9_$]*\s*,\s*\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/

  for (const component of lynxComponentBlocks(tatemono)) {
    const flattened = flattenMultilineImports(stripTemplateLiterals(component.raw))
    for (const rawLine of flattened.split('\n')) {
      const line = rawLine.trim()
      if (!line.startsWith('import ')) continue

      let m = line.match(mixedImportRe) ?? line.match(namedImportRe)
      if (!m) continue

      const [, namedStr, rawMod] = m
      const mod = rawMod.replace(/^@\/arkzen\//, '../../../arkzen/')
      if (!out.has(mod)) out.set(mod, new Set())
      const entry = out.get(mod)!
      namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
        if (n !== 'React') entry.add(n.split(/\s+as\s+/)[0].trim())
      })
    }
  }
  return out
}

function extractLynxCustomHookNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of lynxComponentBlocks(tatemono)) {
    const stripped = stripTemplateLiterals(component.raw)
    const fnMatches = stripped.match(/(?:export\s+)?function\s+(use[A-Z][A-Za-z0-9_$]*)\s*[(<]/g) || []
    for (const match of fnMatches) {
      const name = match.match(/function\s+(use[A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
    const constMatches = stripped.match(/(?:export\s+)?const\s+(use[A-Z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of constMatches) {
      const name = match.match(/const\s+(use[A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

function extractLynxSharedTypeNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of lynxComponentBlocks(tatemono)) {
    const stripped = stripTemplateLiterals(component.raw)
    const typeMatches = stripped.match(/(?:export\s+)?type\s+([A-Z][A-Za-z0-9_$]*)\s*[=<{]/g) || []
    for (const match of typeMatches) {
      const name = match.match(/type\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
    const ifaceMatches = stripped.match(/(?:export\s+)?interface\s+([A-Z][A-Za-z0-9_$]*)\s*[{<]/g) || []
    for (const match of ifaceMatches) {
      const name = match.match(/interface\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

function extractLynxUtilityFunctionNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of lynxComponentBlocks(tatemono)) {
    const stripped = stripTemplateLiterals(component.raw)
    // Top-level only (anchored, zero leading whitespace) — excludes nested
    // locals inside component bodies/event handlers.
    const constMatches = stripped.match(/^(?:export\s+)?const\s+([a-z][A-Za-z0-9_$]*)\s*[=:(]/gm) || []
    for (const match of constMatches) {
      const name = match.match(/const\s+([a-z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^use[A-Z]/.test(name)) names.add(name)
    }
    const fnMatches = stripped.match(/^(?:export\s+)?(?:async\s+)?function\s+([a-z][A-Za-z0-9_$]*)\s*[(<]/gm) || []
    for (const match of fnMatches) {
      const name = match.match(/function\s+([a-z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^use[A-Z]/.test(name)) names.add(name)
    }
  }
  return names
}

function findReferencedNames(strippedSource: string, names: Set<string>): string[] {
  const found: string[] = []
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`[^\\w$]${escaped}\\b`).test(' ' + strippedSource)) {
      found.push(name)
    }
  }
  return found
}

function splitLynxComponentDeclarations(rawSource: string, names: Set<string>): Map<string, string> {
  const out = new Map<string, string>()
  if (names.size === 0) return out

  const scanSource = stripTemplateLiterals(rawSource)
  const nameAlt = [...names].map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const re = new RegExp(`^(?:export\\s+)?(?:async\\s+)?(const|function|interface|type)\\s+(${nameAlt})\\b`, 'gm')

  const starts: { index: number; name: string }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(scanSource)) !== null) {
    starts.push({ index: m.index, name: m[2] })
  }
  if (starts.length === 0) return out

  for (let i = 0; i < starts.length; i++) {
    const { index, name } = starts[i]
    let chunkStart = index
    const before = scanSource.slice(0, index)
    const lines = before.split('\n')
    let li = lines.length - 1
    let consumed = 0
    while (li >= 0) {
      const line = lines[li].trim()
      if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        consumed += lines[li].length + 1
        li--
      } else {
        break
      }
    }
    if (consumed > 0) chunkStart = Math.max(0, index - consumed)
    const chunkEnd = i + 1 < starts.length ? starts[i + 1].index : rawSource.length
    out.set(name, rawSource.slice(chunkStart, chunkEnd).trim())
  }
  return out
}

function normaliseLynxImports(block: string, upLevels: number): string {
  const prefix = '../'.repeat(upLevels)
  return block.replace(/from\s+'@\/arkzen\//g, `from '${prefix}arkzen/`)
              .replace(/from\s+"@\/arkzen\//g, `from "${prefix}arkzen/`)
}

// ─── Per-file native component generation v3.0 ─────────────────────────────
// Mirrors expo-router.ts's generateIndividualNativeComponentFiles. Each
// exported component, hook, shared constant, shared type, and utility
// function declared inside ANY @arkzen:native:components:lynx:* block for
// this tatemono gets its own real file under
// src/pages/{tat}/components/{Name}.tsx, importing only what it references.
// This is the fix for the v2.1 bug: a `:lynx:shared` block containing four
// components in one DSL block now produces Badge.tsx, PrimaryButton.tsx,
// GhostButton.tsx, Card.tsx individually, instead of one opaque shared.tsx
// that pages could never correctly import from.

function generateIndividualLynxComponentFiles(
  tatemono: ParsedTatemono,
  pageDir:  string,
  animExports:   string[],
  scriptExports: string[],
  hasStyles:     boolean,
): void {
  const tatName = tatemono.meta.name
  const nativeLynxComponents = lynxComponentBlocks(tatemono)
  const componentsDir = path.join(pageDir, 'components')

  if (nativeLynxComponents.length === 0) {
    if (fs.existsSync(componentsDir)) {
      fs.rmSync(componentsDir, { recursive: true })
      console.log(`[Arkzen Lynx Router] 🧹 Removed stale components/ (no @arkzen:native:components:lynx)`)
    }
    return
  }

  ensureDir(componentsDir)

  const rawSources = nativeLynxComponents.map(c => c.raw.trim())
  const { canonicalBlock, strippedSources } = resolveImports(rawSources)

  // Component files live at src/pages/{tat}/components/{Name}.tsx — 4 levels
  // up to project root (one deeper than expo-router.ts's app/{tat}/components,
  // since Lynx nests pages under src/pages instead of app directly). The
  // @/arkzen/ -> relative rewrite already happens inside resolveImports'
  // normaliseMod above, so canonicalBlock should no longer contain any
  // @/arkzen/ specifiers by this point — this second pass is just a safety
  // net in case a future source slips one through untouched.
  const normalisedCanonicalBlock = normaliseLynxImports(canonicalBlock, 4)

  const extractedComponents = extractLynxComponentNames(tatemono)
  const sharedConstants     = extractLynxSharedConstantNames(tatemono)
  const customHooks         = extractLynxCustomHookNames(tatemono)
  const sharedTypes         = extractLynxSharedTypeNames(tatemono)
  const utilityFunctions    = extractLynxUtilityFunctionNames(tatemono)
  const allDeclaredNames    = new Set([...extractedComponents, ...sharedConstants, ...customHooks, ...sharedTypes, ...utilityFunctions])

  // Animation hooks (@arkzen:native:animation:lynx) and script utils
  // (@arkzen:native:script:lynx) live in generated/{tatName}.lynx-animations
  // and generated/{tatName}.lynx-utils respectively — NOT in the components
  // block — so they're absent from allDeclaredNames above. Per-component
  // files may call these directly without their own import; track names so
  // each component file can import what it actually uses.
  const animationHookNames = new Set(animExports)
  const scriptUtilNames    = new Set(scriptExports)

  const declarationsByName = new Map<string, string>()
  for (const stripped of strippedSources) {
    for (const [name, code] of splitLynxComponentDeclarations(stripped, allDeclaredNames)) {
      declarationsByName.set(name, code)
    }
  }

  const { names: destructuredNames, statements: destructuredStatements } = extractLynxDestructuredConstants(tatemono)
  for (const name of destructuredNames) sharedConstants.add(name)
  if (destructuredStatements.length > 0) {
    for (const [name, code] of declarationsByName) {
      let cleaned = code
      for (const stmt of destructuredStatements) {
        cleaned = cleaned.split(stmt).join('').trim()
      }
      if (cleaned !== code) declarationsByName.set(name, cleaned)
    }
  }

  const exportify = (chunk: string, name: string, kwAlt: string) => {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return chunk.replace(
      new RegExp(`^(\\s*)(export\\s+)?(${kwAlt})(\\s+${esc}\\b)`, 'm'),
      (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
    )
  }

  // ── Shared constants file ──────────────────────────────────────────────
  const destructuredChunksFixed = destructuredStatements.map(stmt =>
    stmt.startsWith('export ') ? stmt : `export ${stmt}`
  )

  if (sharedConstants.size > 0 || destructuredChunksFixed.length > 0) {
    const constChunks = [...sharedConstants]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => exportify(chunk, name, 'const'))

    if (constChunks.length > 0 || destructuredChunksFixed.length > 0) {
      const allConstChunks = [...constChunks, ...destructuredChunksFixed]
      const allConstChunksJoined = allConstChunks.join('\n\n')

      const constReferencedTypes = findReferencedNames(allConstChunksJoined, sharedTypes)
      const constTypesImport = constReferencedTypes.length > 0
        ? `import type { ${constReferencedTypes.sort().join(', ')} } from './types'\n`
        : ''

      const content = `// ============================================================
// ARKZEN GENERATED LYNX SHARED CONSTANTS — ${tatName}
// Source: @arkzen:native:components:lynx:* (${tatName})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${normalisedCanonicalBlock}
${constTypesImport}
${allConstChunksJoined}
`
      writeIfChanged(path.join(componentsDir, 'constants.tsx'), content)
      removeStaleSiblingExt(componentsDir, 'constants', ['.ts'])
      console.log(`[Arkzen Lynx Router] ✓ Lynx shared constants: constants.tsx`)
    }
  } else {
    const p = path.join(componentsDir, 'constants.tsx')
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Lynx Router] 🧹 Removed stale constants.tsx`) }
    removeStaleSiblingExt(componentsDir, 'constants', ['.ts'])
  }

  // ── Custom hooks file ──────────────────────────────────────────────────
  if (customHooks.size > 0) {
    const hookChunks = [...customHooks]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => exportify(chunk, name, 'const|(?:async\\s+)?function'))

    if (hookChunks.length > 0) {
      const hookChunksJoined = hookChunks.join('\n\n')

      const hookReferencedConstants = findReferencedNames(hookChunksJoined, sharedConstants)
      const hookConstantsImport = hookReferencedConstants.length > 0
        ? `import { ${hookReferencedConstants.sort().join(', ')} } from './constants'\n`
        : ''

      const hookReferencedTypes = findReferencedNames(hookChunksJoined, sharedTypes)
      const hookTypesImport = hookReferencedTypes.length > 0
        ? `import type { ${hookReferencedTypes.sort().join(', ')} } from './types'\n`
        : ''

      const content = `// ============================================================
// ARKZEN GENERATED LYNX CUSTOM HOOKS — ${tatName}
// Source: @arkzen:native:components:lynx:* (${tatName})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${normalisedCanonicalBlock}
${hookConstantsImport}${hookTypesImport}
${hookChunksJoined}
`
      writeIfChanged(path.join(componentsDir, 'hooks.tsx'), content)
      removeStaleSiblingExt(componentsDir, 'hooks', ['.ts'])
      console.log(`[Arkzen Lynx Router] ✓ Lynx custom hooks: hooks.tsx (${[...customHooks].join(', ')})`)
    }
  } else {
    const p = path.join(componentsDir, 'hooks.tsx')
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Lynx Router] 🧹 Removed stale hooks.tsx`) }
    removeStaleSiblingExt(componentsDir, 'hooks', ['.ts'])
  }

  // ── Utility functions file ──────────────────────────────────────────────
  if (utilityFunctions.size > 0) {
    const utilChunks = [...utilityFunctions]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => exportify(chunk, name, 'const|(?:async\\s+)?function'))

    if (utilChunks.length > 0) {
      const utilChunksJoined = utilChunks.join('\n\n')

      const utilReferencedConstants = findReferencedNames(utilChunksJoined, sharedConstants)
      const utilConstantsImport = utilReferencedConstants.length > 0
        ? `import { ${utilReferencedConstants.sort().join(', ')} } from './constants'\n`
        : ''

      const utilReferencedTypes = findReferencedNames(utilChunksJoined, sharedTypes)
      const utilTypesImport = utilReferencedTypes.length > 0
        ? `import type { ${utilReferencedTypes.sort().join(', ')} } from './types'\n`
        : ''

      const utilReferencedHooks = findReferencedNames(utilChunksJoined, customHooks)
      const utilHooksImport = utilReferencedHooks.length > 0
        ? `import { ${utilReferencedHooks.sort().join(', ')} } from './hooks'\n`
        : ''

      const content = `// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — ${tatName}
// Source: @arkzen:native:components:lynx:* (${tatName})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${normalisedCanonicalBlock}
${utilConstantsImport}${utilTypesImport}${utilHooksImport}
${utilChunksJoined}
`
      writeIfChanged(path.join(componentsDir, 'utils.tsx'), content)
      removeStaleSiblingExt(componentsDir, 'utils', ['.ts'])
      console.log(`[Arkzen Lynx Router] ✓ Lynx utility functions: utils.tsx (${[...utilityFunctions].join(', ')})`)
    }
  } else {
    const p = path.join(componentsDir, 'utils.tsx')
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Lynx Router] 🧹 Removed stale utils.tsx`) }
    removeStaleSiblingExt(componentsDir, 'utils', ['.ts'])
  }

  // ── Shared types file ────────────────────────────────────────────────────
  if (sharedTypes.size > 0) {
    const typeChunks = [...sharedTypes]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => exportify(chunk, name, 'type|interface'))

    if (typeChunks.length > 0) {
      const content = `// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — ${tatName}
// Source: @arkzen:native:components:lynx:* (${tatName})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${typeChunks.join('\n\n')}
`
      writeIfChanged(path.join(componentsDir, 'types.ts'), content)
      removeStaleSiblingExt(componentsDir, 'types', ['.tsx'])
      console.log(`[Arkzen Lynx Router] ✓ Lynx shared types: types.ts (${[...sharedTypes].join(', ')})`)
    }
  } else {
    const p = path.join(componentsDir, 'types.ts')
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Lynx Router] 🧹 Removed stale types.ts`) }
    removeStaleSiblingExt(componentsDir, 'types', ['.tsx'])
  }

  // ── One real file per component containing its actual code ──────────────
  for (const compName of extractedComponents) {
    const declaration = declarationsByName.get(compName)
    if (!declaration) {
      console.log(`[Arkzen Lynx Router] ⚠ Could not isolate declaration for ${compName}, skipping file`)
      continue
    }

    const fileName = `${compName}.tsx`
    const filePath = path.join(componentsDir, fileName)
    const exportedDeclaration = exportify(declaration, compName, 'const|(?:async\\s+)?function')

    const referencedConstants = findReferencedNames(declaration, sharedConstants)
    const constantsImport = referencedConstants.length > 0
      ? `import { ${referencedConstants.sort().join(', ')} } from './constants'\n`
      : ''

    const referencedHooks = findReferencedNames(declaration, customHooks)
    const hooksImport = referencedHooks.length > 0
      ? `import { ${referencedHooks.sort().join(', ')} } from './hooks'\n`
      : ''

    // Animation hooks live in src/arkzen/generated/{tatName}.lynx-animations
    // — three levels up from src/pages/{tat}/components/{Name}.tsx.
    const referencedAnimationHooks = findReferencedNames(declaration, animationHookNames)
    const animationHooksImport = referencedAnimationHooks.length > 0
      ? `import { ${referencedAnimationHooks.sort().join(', ')} } from '../../../arkzen/generated/${tatName}.lynx-animations'\n`
      : ''

    // Script utils live in src/arkzen/generated/{tatName}.lynx-utils — same
    // depth as animation hooks. (Distinct from the local ./utils.tsx file
    // above, which holds plain helper functions defined alongside components
    // rather than @arkzen:native:script:lynx blocks.)
    const referencedScriptUtils = findReferencedNames(declaration, scriptUtilNames)
    const scriptUtilsImport = referencedScriptUtils.length > 0
      ? `import { ${referencedScriptUtils.sort().join(', ')} } from '../../../arkzen/generated/${tatName}.lynx-utils'\n`
      : ''

    const stylesImport = (hasStyles && /className\s*=/.test(declaration))
      ? `import '../../../arkzen/generated/${tatName}.lynx-styles.css'\n`
      : ''

    const referencedTypes = findReferencedNames(declaration, sharedTypes)
    const typesImport = referencedTypes.length > 0
      ? `import type { ${referencedTypes.sort().join(', ')} } from './types'\n`
      : ''

    const otherComponents = new Set(extractedComponents)
    otherComponents.delete(compName)
    const referencedComponents = findReferencedNames(declaration, otherComponents)
    const siblingImportBlock = referencedComponents.length > 0
      ? referencedComponents.sort().map(name => `import { ${name} } from './${name}'`).join('\n') + '\n'
      : ''

    const referencedUtils = findReferencedNames(declaration, utilityFunctions)
    const utilsImport = referencedUtils.length > 0
      ? `import { ${referencedUtils.sort().join(', ')} } from './utils'\n`
      : ''

    const content = `// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ${compName}
// Source: @arkzen:native:components:lynx:* (${tatName})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${normalisedCanonicalBlock}
${constantsImport}${hooksImport}${animationHooksImport}${scriptUtilsImport}${stylesImport}${utilsImport}${typesImport}${siblingImportBlock}
${exportedDeclaration}
`
    writeIfChanged(filePath, content)
    console.log(`[Arkzen Lynx Router] ✓ Lynx component: ${fileName}`)
  }

  // ── Clean up stale files ──────────────────────────────────────────────────
  try {
    const files = fs.readdirSync(componentsDir)
    for (const file of files) {
      const base = file.replace(/\.(tsx|ts)$/, '')
      if (['hooks.tsx', 'types.ts', 'constants.tsx', 'utils.tsx'].includes(file)) continue
      if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !extractedComponents.has(base)) {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen Lynx Router] 🧹 Removed stale Lynx component: ${file}`)
      }
    }
  } catch {
    // ignore
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

  // Same reference resolution generatePageFile already does for index/etc
  // pages — error-404.tsx/error-500.tsx live at the same directory depth
  // (src/pages/{tat}/) and need the same './components/*' imports for
  // anything the handler body references (e.g. a shared LynxErrorScreen).
  const allComponentNames = extractLynxComponentNames(tatemono)
  const sharedConstants    = extractLynxSharedConstantNames(tatemono)
  const customHooks        = extractLynxCustomHookNames(tatemono)
  const utilityFunctions   = extractLynxUtilityFunctionNames(tatemono)
  const sharedTypes        = extractLynxSharedTypeNames(tatemono)

  for (const h of handlers) {
    const code     = h.type === '404' ? '404' : '500'
    if (code === '404') has404 = true
    if (code === '500') has500 = true

    const raw = h.raw.trim()
    const nameMatch = raw.match(/^(?:export\s+)?(?:const|function)\s+(\w+)/)
    const compName  = nameMatch ? nameMatch[1] : null
    if (!compName) {
      console.log(`[Arkzen Lynx Router] ⚠ Could not isolate a component name for ${tatName} error ${code}; app-routes.ts expects a default export here`)
    }

    const strippedForRefs = stripTemplateLiterals(raw)
    const alreadyImported  = extractAlreadyImportedNames(raw)

    const referencedComponents = findReferencedNames(strippedForRefs, allComponentNames).filter(n => !alreadyImported.has(n))
    const compImports = referencedComponents.length > 0
      ? referencedComponents.sort().map(n => `import { ${n} } from './components/${n}'`).join('\n') + '\n'
      : ''

    const referencedConstants = findReferencedNames(strippedForRefs, sharedConstants).filter(n => !alreadyImported.has(n))
    const constantsImport = referencedConstants.length > 0
      ? `import { ${referencedConstants.sort().join(', ')} } from './components/constants'\n`
      : ''

    const referencedHooks = findReferencedNames(strippedForRefs, customHooks).filter(n => !alreadyImported.has(n))
    const hooksImport = referencedHooks.length > 0
      ? `import { ${referencedHooks.sort().join(', ')} } from './components/hooks'\n`
      : ''

    const referencedUtils = findReferencedNames(strippedForRefs, utilityFunctions).filter(n => !alreadyImported.has(n))
    const utilsImport = referencedUtils.length > 0
      ? `import { ${referencedUtils.sort().join(', ')} } from './components/utils'\n`
      : ''

    const referencedTypes = findReferencedNames(strippedForRefs, sharedTypes).filter(n => !alreadyImported.has(n))
    const typesImport = referencedTypes.length > 0
      ? `import type { ${referencedTypes.sort().join(', ')} } from './components/types'\n`
      : ''

    const exportDefault = compName ? `\nexport default ${compName}\n` : ''

    const outPath  = path.join(PAGES_DIR, tatemono.meta.name, `error-${code}.tsx`)
    const content  = `// ARKZEN GENERATED — ${tatName} error ${code} (Lynx)
// DO NOT EDIT DIRECTLY.
${compImports}${constantsImport}${hooksImport}${utilsImport}${typesImport}
${raw}
${exportDefault}`
    writeIfChanged(outPath, content)
    console.log(`[Arkzen Lynx Router] ✓ Error ${code}: ${tatName}/error-${code}.tsx`)
  }

  return { has404, has500 }
}

// ─── Page file generation v3.0 ─────────────────────────────────────────────
// v2.1 matched the *block name* against the page source to decide which
// component imports to add — broken for any multi-export named block (see
// header comment). v3.0 instead finds every component/constant/hook/type/util
// the page body actually references and imports each one individually from
// the per-file output generateIndividualLynxComponentFiles produces.

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

  const pageStrippedForRefs = stripTemplateLiterals(page.raw)
  const alreadyImported = extractAlreadyImportedNames(page.raw)

  // ── Per-component imports ──────────────────────────────────────────────
  const allComponentNames = extractLynxComponentNames(tatemono)
  const referencedComponents = findReferencedNames(pageStrippedForRefs, allComponentNames)
    .filter(n => !alreadyImported.has(n))
  const compImports = referencedComponents.length > 0
    ? referencedComponents.sort().map(n => `import { ${n} } from './components/${n}'`).join('\n') + '\n'
    : ''

  // ── Smart imports for constants / hooks / utils / types ────────────────
  const sharedConstants    = extractLynxSharedConstantNames(tatemono)
  const referencedConstants = findReferencedNames(pageStrippedForRefs, sharedConstants).filter(n => !alreadyImported.has(n))
  const constantsImport = referencedConstants.length > 0
    ? `import { ${referencedConstants.sort().join(', ')} } from './components/constants'\n`
    : ''

  const customHooks     = extractLynxCustomHookNames(tatemono)
  const referencedHooks = findReferencedNames(pageStrippedForRefs, customHooks).filter(n => !alreadyImported.has(n))
  const hooksImport = referencedHooks.length > 0
    ? `import { ${referencedHooks.sort().join(', ')} } from './components/hooks'\n`
    : ''

  const utilityFunctions = extractLynxUtilityFunctionNames(tatemono)
  const referencedUtils  = findReferencedNames(pageStrippedForRefs, utilityFunctions).filter(n => !alreadyImported.has(n))
  const utilsImport = referencedUtils.length > 0
    ? `import { ${referencedUtils.sort().join(', ')} } from './components/utils'\n`
    : ''

  const sharedTypes     = extractLynxSharedTypeNames(tatemono)
  const referencedTypes = findReferencedNames(pageStrippedForRefs, sharedTypes).filter(n => !alreadyImported.has(n))
  const typesImport = referencedTypes.length > 0
    ? `import type { ${referencedTypes.sort().join(', ')} } from './components/types'\n`
    : ''

  // ── Namespace + named imports ──────────────────────────────────────────
  const namespaceImports = extractLynxNamespaceImports(tatemono)
  const referencedNamespaces = findReferencedNames(pageStrippedForRefs, new Set(namespaceImports.keys()))
    .filter(n => !alreadyImported.has(n))
  const namespaceImportLines = referencedNamespaces
    .map(ns => `import * as ${ns} from '${normaliseLynxImports(namespaceImports.get(ns)!, 0)}'`)
    .join('\n')

  const namedImportsByModule = extractLynxNamedImportsByModule(tatemono)
  const namedImportLines: string[] = []
  for (const [mod, names] of namedImportsByModule) {
    const referenced = findReferencedNames(pageStrippedForRefs, names).filter(n => !alreadyImported.has(n))
    if (referenced.length > 0) {
      namedImportLines.push(`import { ${referenced.sort().join(', ')} } from '${normaliseLynxImports(mod, 0)}'`)
    }
  }

  // ─── Extract the user's component name ──────────────────────────────────
  const userCode = page.raw.trim()
  const stripped = stripTemplateLiterals(userCode)
  const constMatches = [...stripped.matchAll(/^(?:export\s+)?const\s+([A-Z][A-Za-z0-9_$]*)\s*(?::[^=]*)?\s*=/gm)]
  const funcMatches  = [...stripped.matchAll(/^(?:export\s+)?function\s+([A-Z][A-Za-z0-9_$]*)\s*[(<]/gm)]
  const allPascal = [...constMatches, ...funcMatches]
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  const lastPascal = allPascal[allPascal.length - 1]
  let componentName: string

  if (lastPascal) {
    componentName = lastPascal[1]
  } else {
    // Fallback: use page name
    componentName = `${toPascalCase(pageName)}Page`
  }

  // ─── Expected named export name ────────────────────────────────────────
  const expectedExportName = `${toPascalCase(tatName)}${toPascalCase(pageName)}`

  // ─── Assemble final content ─────────────────────────────────────────────
  const content = `// ARKZEN GENERATED — ${tatName}/${pageName} (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
${animImport}${scriptImport}${styleImport}${compImports}${constantsImport}${hooksImport}${utilsImport}${typesImport}${namespaceImportLines ? namespaceImportLines + '\n' : ''}${namedImportLines.length > 0 ? namedImportLines.join('\n') + '\n' : ''}
${userCode}

export const ${expectedExportName} = ${componentName};
`

  writeIfChanged(outPath, content)
  console.log(`[Arkzen Lynx Router] ✓ Page: ${tatName}/${pageName}.tsx`)
}

// ─── App routes regeneration v3.0 ──────────────────────────────────────────
// Mirrors react-vite's src/arkzen/generated/routes.ts exactly: a pure data
// file (component imports + a route table), never App.tsx itself. App.tsx
// is static — written once, never regenerated. v3.0 routes layout
// resolution through resolveLynxRouteLayout so compound `+auth:name` /
// `+guest:name` declarations resolve correctly instead of being treated as
// a literal (nonexistent) custom layout file name.

const APP_ROUTES_PATH = path.join(GENERATED_DIR, 'app-routes.ts')

function regenerateRoutesFile(tatemono?: ParsedTatemono): void {
  const meta = readRoutesMeta()
  const tatNames = Object.keys(meta)

  const imports: string[]      = []
  const layoutImports: string[] = []
  const errorImports: string[] = []
  const routeEntries: string[] = []
  const layoutImportSeen       = new Set<string>()
  const errorImportSeen        = new Set<string>()

  // resolveLynxRouteLayout needs each tatemono's nativeLynxLayouts for chain
  // resolution. regenerateRoutesFile is called once per register/unregister
  // with only the CURRENT tatemono in hand — for every other tatemono in the
  // registry we only have what's in routes.meta.json (no layout blocks), so
  // their custom layouts resolve as single-link chains by name only, which
  // matches actual behaviour today (chain length is always 1 in practice —
  // see NOTE ON LAYOUT PARENT CHAINS).
  const layoutsByTat = new Map<string, NamedLynxSection[]>()
  if (tatemono) layoutsByTat.set(tatemono.meta.name, (tatemono.nativeLynxLayouts ?? []) as NamedLynxSection[])

  for (const tat of tatNames) {
    const { pages, has404, has500 } = meta[tat]
    const nativeLynxLayouts = layoutsByTat.get(tat) ?? []

    const loginPage = pages.find(p => p.page === 'login')?.page
      ?? pages.find(p => p.layout === 'guest')?.page
      ?? 'index'
    const dashboardPage = pages.find(p => p.page === 'dashboard')?.page
      ?? pages.find(p => p.layout === 'auth')?.page
      ?? 'index'
    const loginRoute     = `/${tat}/${loginPage}`
    const dashboardRoute = `/${tat}/${dashboardPage}`

    let firstPageComponentName: string | null = null
    let firstPageLayoutComponent: string | null = null
    const hasLiteralIndex = pages.some(p => p.page === 'index')

    for (const route of pages) {
      const componentName = `${toPascalCase(tat)}${toPascalCase(route.page)}`
      imports.push(`import { ${componentName} } from '../../pages/${tat}/${route.page}'`)

      const { component: layoutComponent, imports: layoutImportLines } =
        resolveLynxRouteLayout(route.layout, tat, nativeLynxLayouts)

      for (const importLine of layoutImportLines) {
        const key = `${tat}:${importLine}`
        if (!layoutImportSeen.has(key)) {
          layoutImportSeen.add(key)
          layoutImports.push(importLine)
        }
      }

      if (firstPageComponentName === null) {
        firstPageComponentName  = componentName
        firstPageLayoutComponent = layoutComponent
      }

      routeEntries.push(
        `  { module: '${tat}', page: '${route.page}', component: ${componentName}, layout: ${layoutComponent}, loginRoute: '${loginRoute}', dashboardRoute: '${dashboardRoute}' },`
      )
    }

    // v3.1: default/index route guarantee — mirrors Expo's root redirect
    // (app/{tat}/index.tsx → first page when no literal "index" page is
    // declared). Lynx has no file-based root to redirect FROM, so instead
    // of generating a new file we just alias the existing first-page
    // component under page: 'index' in the route table itself — zero extra
    // imports, zero extra generated files, but any caller that does
    // LYNX_ROUTES.find(r => r.module === X && r.page === 'index') (the Lynx
    // equivalent of visiting bare /${tat}) now resolves exactly like Expo's
    // /${tat} always does, instead of silently finding nothing.
    if (!hasLiteralIndex && firstPageComponentName) {
      routeEntries.push(
        `  { module: '${tat}', page: 'index', component: ${firstPageComponentName}, layout: ${firstPageLayoutComponent}, loginRoute: '${loginRoute}', dashboardRoute: '${dashboardRoute}' },`
      )
    }

    if (has404 && !errorImportSeen.has(`${tat}:404`)) {
      errorImportSeen.add(`${tat}:404`)
      const errComp = `${toPascalCase(tat)}Error404`
      errorImports.push(`import { default as ${errComp} } from '../../pages/${tat}/error-404'`)
    }
    if (has500 && !errorImportSeen.has(`${tat}:500`)) {
      errorImportSeen.add(`${tat}:500`)
      const errComp = `${toPascalCase(tat)}Error500`
      errorImports.push(`import { default as ${errComp} } from '../../pages/${tat}/error-500'`)
    }
  }

  const error404Map = tatNames
    .filter(t => meta[t].has404)
    .map(t => `  '${t}': ${toPascalCase(t)}Error404,`)
    .join('\n')

  const error500Map = tatNames
    .filter(t => meta[t].has500)
    .map(t => `  '${t}': ${toPascalCase(t)}Error500,`)
    .join('\n')

  const content = `// ============================================================
// ARKZEN GENERATED — Lynx App Routes (src/arkzen/generated/app-routes.ts)
// DO NOT EDIT DIRECTLY. Managed by arkzen lynx-router.
// Generated: ${new Date().toISOString()}
//
// Pure data — component imports + the route table. Mirrors React+Vite's
// src/arkzen/generated/routes.ts. src/App.tsx is static and imports from
// this file; the generator never touches App.tsx.
// ============================================================
${layoutImports.join('\n')}
${imports.join('\n')}
${errorImports.join('\n')}

export interface LynxAppRoute {
  module:         string
  page:           string
  component:      any
  layout:         any
  loginRoute:     string
  dashboardRoute: string
}

export const LYNX_ROUTES: LynxAppRoute[] = [
${routeEntries.join('\n')}
]

export const LYNX_ERROR_404: Record<string, any> = {
${error404Map}
}

export const LYNX_ERROR_500: Record<string, any> = {
${error500Map}
}

// NOTE on error-500 wiring: Lynx renders through a custom dual-thread
// reconciler (not ReactDOM), so support for class-component error
// boundaries (componentDidCatch) is unconfirmed for this target — shipping
// an unverified boundary here would risk silently breaking every route if
// the renderer doesn't implement that lifecycle. LYNX_ERROR_500 is exposed
// below so a tatemono's error-500 page can be rendered manually (e.g. from
// a try/catch inside the page itself, or wired into a confirmed boundary
// once Lynx error-boundary support is verified against a real build).
export function getLynxError500Page(tatName: string) {
  return LYNX_ERROR_500[tatName] ?? null
}

// ── Programmatic route helpers — mirrors Expo's routes.ts ──────────────────
// (LYNX_ROUTES entries already carry loginRoute/dashboardRoute baked in, but
// these are exposed for any other engine code — authStore, etc. — that wants
// to compute them without first locating the right route entry.)
export function getLoginRoute(tatName: string): string {
  const route = LYNX_ROUTES.find(r => r.module === tatName)
  return route?.loginRoute ?? \`/\${tatName}\`
}

export function getDashboardRoute(tatName: string): string {
  const route = LYNX_ROUTES.find(r => r.module === tatName)
  return route?.dashboardRoute ?? \`/\${tatName}\`
}

// v3.1: programmatic equivalent of visiting bare /\${tatName} in Expo —
// resolves to the literal "index" page if one exists, otherwise the first
// registered page (which regenerateRoutesFile() above already aliased
// under page: 'index' for exactly this case).
export function getDefaultPage(tatName: string): string {
  const route = LYNX_ROUTES.find(r => r.module === tatName && r.page === 'index')
  return route?.page ?? LYNX_ROUTES.find(r => r.module === tatName)?.page ?? 'index'
}
`

  writeIfChanged(APP_ROUTES_PATH, content)
  console.log(`[Arkzen Lynx Router] ✓ app-routes.ts regenerated (${routeEntries.length} route(s))`)
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
  cleanCompositeLayouts(tatName)
  cleanLynxAssets(tatName, LYNX_ASSETS_DIR)

  removeFromRoutesRegistry(tatName)
  regenerateRoutesFile()
}

// ─── Main register function ───────────────────────────────────────────────────

export function registerLynxPages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name
  const pages   = tatemono.nativeLynxPages ?? []
  const pageDir = path.join(PAGES_DIR, tatName)

  fs.mkdirSync(pageDir, { recursive: true })
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

  // v3.0: per-file component generation (replaces v2.1's single-file-per-block)
  generateIndividualLynxComponentFiles(tatemono, pageDir, animExports, utilExports, hasStyles)

  const { has404, has500 } = generateErrorFiles(tatemono)

  // Generate each page
  for (const page of pages) {
    generatePageFile(page, tatemono, animExports, utilExports, hasStyles)
  }

  // Update route registry (with layout metadata) + app-routes.ts
  const routeEntries: LynxRouteEntry[] = pages.map(p => ({ page: p.name, layout: p.layout ?? 'default' }))
  updateRoutesRegistry(tatName, routeEntries, has404, has500)
  regenerateRoutesFile(tatemono)

  console.log(`[Arkzen Lynx Router] ✓ Registered ${pages.length} page(s) for: ${tatName}`)
}

export function unregisterLynxPages(tatName: string): void {
  cleanupTatemono(tatName)
  console.log(`[Arkzen Lynx Router] ✓ Unregistered: ${tatName}`)
}