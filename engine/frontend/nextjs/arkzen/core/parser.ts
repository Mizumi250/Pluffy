// ============================================================
// ARKZEN ENGINE — PARSER v10.1
// v6.3: Body injection support for middleware, custom route handlers,
//       and custom controller endpoints.
//       - parseAllMiddlewareSnippets(): @arkzen:middleware:name ... :end
//         Extracts PHP body per middleware name, base64-encoded.
//         MiddlewareBuilder injects into handle() instead of // TODO stub.
//       - parseAllHandlerSnippets(): @arkzen:handler:name ... :end
//         Extracts PHP body per handler name, base64-encoded.
//         CustomRouteBuilder injects into handler method.
//       - parseAllEndpointBodies(): @arkzen:endpoint:name ... :end
//         Extracts PHP body per endpoint name, base64-encoded.
//         ControllerBuilder injects into generateCustomMethod().
//       - parseAllCustomRoutes() updated to attach handler body from
//         handler snippets map into each ArkzenCustomRouteEntry.
//       - parseTatemono() wires all three + passes middlewareSnippets.
//
// v7.0: Multi-platform DSL prefix support.
//       All web-frontend blocks now use @arkzen:web: prefix.
//
// v9.0: @arkzen:meta:web separation. parseWebMeta() added.
//       pwa moved to @arkzen:meta:web. favicon + pwa deprecated in meta.
//       YAML_ONLY_TAGS: added 'meta:web'.
//       script blocks moved to web: prefix.
//
// v10.0: Native DSL support — @arkzen:native:* blocks.
//        New block: @arkzen:meta:native (YAML_ONLY, Type A).
//        parseNativeMeta() added — reads expo config, bundle_id, etc.
//        New parsers (all mirror web equivalents):
//          parseNativeConfig()           — @arkzen:native:config
//          parseAllNativeComponents()    — @arkzen:native:components:name
//          parseAllNativeLayouts()       — @arkzen:native:layout:name
//          parseAllNativeStyles()        — @arkzen:native:style:name
//          parseAllNativePages()         — @arkzen:native:page:name
//          parseGlobalNativeAnimation()  — @arkzen:native:animation
//          parseGlobalNativeScript()     — @arkzen:native:script
//          parseAllNamedNativeScripts()  — @arkzen:native:script:name
//        CODE_BLOCK_TAGS updated: native equivalents added.
//        YAML_ONLY_TAGS updated: 'meta:native', 'native:config' added.
//        ParsedTatemono: nativeMeta, nativeConfig, nativePages,
//          nativeLayouts, nativeComponents, nativeStyles,
//          nativeAnimation, nativeScript, nativeScripts.
//        validatePages() updated: native-only tatemonos are valid.
//        hasSections() updated: native checks added.
//        parseTatemono() logs native blocks.
//
// v10.1: Removed hasNative boolean — builders detect platform from array lengths.
//        parsed.pages.length === 0 → skip in web builders.
//        parsed.nativePages.length === 0 → skip in expo builder.
//        No boolean flags, no cross-platform pollution.
//
// v6.1 (kept): Added parseAllNotifications() and parseAllMails().
// v5.1 (kept): Added parseAllCustomRoutes() for @arkzen:routes blocks.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'
import type {
  ParsedTatemono,
  ArkzenMeta,
  ArkzenWebMeta,
  ArkzenNativeMeta,
  ArkzenNativeConfig,
  ArkzenConfigOverride,
  ArkzenDatabase,
  ArkzenApi,
  ArkzenCustomRoute,
  ArkzenCustomRouteEntry,
  ArkzenMiddlewareSnippets,
  ArkzenSection,
  ArkzenPage,
  ArkzenLayout,
  ArkzenStyle,
  ArkzenScript,
  ArkzenErrorHandler,
  ArkzenErrorHandlerType,
} from '../types'

// ─────────────────────────────────────────────
// SINGLE SECTION EXTRACTOR
// ─────────────────────────────────────────────

function extractSection(content: string, marker: string): string | null {
  const startMarker = `/* @arkzen:${marker}`
  const endMarker   = `/* @arkzen:${marker}:end */`

  const startIndex = content.indexOf(startMarker)
  if (startIndex === -1) return null

  const openingEnd = content.indexOf('*/', startIndex)
  if (openingEnd === -1) return null

  const endIndex = content.indexOf(endMarker)

  if (endIndex === -1) {
    return content.slice(startIndex + startMarker.length, openingEnd).trim()
  }

  return content.slice(openingEnd + 2, endIndex).trim()
}

function extractSectionWithPosition(content: string, marker: string): ArkzenSection | null {
  const openMarker  = `/* @arkzen:${marker}`
  const closeMarker = `/* @arkzen:${marker}:end */`

  const start = content.indexOf(openMarker)
  if (start === -1) return null

  const openingEnd = content.indexOf('*/', start)
  if (openingEnd === -1) return null

  const end = content.indexOf(closeMarker)
  if (end === -1) return null

  const raw = content.slice(openingEnd + 2, end).trim()
  return { raw, start, end }
}

// Finds the closing */ for an opening /* @arkzen:... comment.
// Handles both one-line openers (`/* @arkzen:components:x */`) and
// multiline YAML comments, while skipping inline cron fragments like `*/5`.
function findOpeningCommentEnd(content: string, openIdx: number, searchFrom: number): number {
  const firstLineBreak = content.indexOf('\n', openIdx)
  let cursor = searchFrom

  while (true) {
    const candidate = content.indexOf('*/', cursor)
    if (candidate === -1) return -1

    // One-line opener: */ appears before the first newline after openIdx.
    const isOneLineClose = firstLineBreak !== -1 && candidate < firstLineBreak
    // Multiline opener: real closing */ is on its own line.
    const isMultilineClose = candidate > 0 && content[candidate - 1] === '\n'
    // Defensive: comment starts with /* right away.
    const isImmediateClose = candidate === openIdx + 2

    if (isOneLineClose || isMultilineClose || isImmediateClose) {
      return candidate
    }

    // Skip inline `*/` fragments (e.g. cron values like "*/5 * * * *")
    cursor = candidate + 2
  }
}

// ─────────────────────────────────────────────
// MULTI SECTION EXTRACTOR — YAML blocks (no identifiers)
// For @arkzen:database and @arkzen:api (YAML comment blocks)
// ─────────────────────────────────────────────

function extractAllSections(content: string, marker: string): string[] {
  const startMarker = `/* @arkzen:${marker}`
  const results: string[] = []
  let searchFrom = 0

  while (true) {
    const startIndex = content.indexOf(startMarker, searchFrom)
    if (startIndex === -1) break

    // FIXED: Find the REAL closing */ — the one on its own line (preceded by \n or start).
    // Naive content.indexOf('*/') breaks on cron expressions like "*/5 * * * *" which
    // contain "*/" mid-string, causing the parser to split one block into many fragments.
    // The real closing marker is always "\n*/" (newline then */), never inline.
    let openingEnd = -1
    let searchPos = startIndex + startMarker.length
    while (true) {
      const candidate = content.indexOf('*/', searchPos)
      if (candidate === -1) break
      // Accept if preceded by newline (real block close) or if it's right after the opening /*
      const charBefore = candidate > 0 ? content[candidate - 1] : '\n'
      if (charBefore === '\n' || candidate === startIndex + 2) {
        openingEnd = candidate
        break
      }
      // Skip this */ — it's inline (e.g. inside a cron string "*/5 * * * *")
      searchPos = candidate + 2
    }
    if (openingEnd === -1) break

    // Slice everything between the marker keyword and the closing */
    // This may start with :identifier (e.g. ":products\ntable: products")
    // or be plain YAML (v4 compat). Strip the identifier prefix line if present.
    let rawSlice = content
      .slice(startIndex + startMarker.length, openingEnd)
      .trim()

    // If the content starts with :identifier, strip that first token
    // e.g. ":products\ntable: products" → "table: products"
    rawSlice = rawSlice.replace(/^:[a-zA-Z0-9_-]+\s*\n?/, '').trim()

    if (rawSlice) {
      results.push(rawSlice)
    }

    searchFrom = openingEnd + 2
  }

  return results
}

// ─────────────────────────────────────────────
// TEMPLATE LITERAL STRIPPER
// Replaces backtick template literal content with whitespace so DSL marker
// searches (indexOf) don't match markers that appear inside demo strings,
// <code> blocks, or other string literals in the tatemono source.
// Positions in the stripped string correspond 1:1 with the original so
// start/end indices can be used directly on the original content.
// ─────────────────────────────────────────────

function stripTemplateLiterals(src: string): string {
  let result = ''
  let i = 0
  while (i < src.length) {
    if (src[i] === '`') {
      result += ' '     // replace opening backtick
      i++
      while (i < src.length) {
        if (src[i] === '\\') { result += '  '; i += 2; continue }  // escaped char
        if (src[i] === '`')  { result += ' '; i++; break }          // closing backtick
        // Skip ${...} expressions — shallow (1 level)
        if (src[i] === '$' && src[i + 1] === '{') {
          let depth = 1
          result += '  '; i += 2
          while (i < src.length && depth > 0) {
            if (src[i] === '{') depth++
            else if (src[i] === '}') depth--
            result += ' '; i++
          }
          continue
        }
        result += ' '; i++  // replace literal content with space (preserves length)
      }
    } else {
      result += src[i]
      i++
    }
  }
  return result
}

// ─────────────────────────────────────────────
// NAMED SECTION EXTRACTOR — v5
// For @arkzen:marker:name ... @arkzen:marker:name:end
// Returns array of { name, raw, start, end }
// ─────────────────────────────────────────────

function extractAllNamedSections(content: string, marker: string): ArkzenSection[] {
  const results: ArkzenSection[] = []
  let searchFrom = 0
  const safe = stripTemplateLiterals(content)  // use for indexOf only; raw extracted from original

  while (true) {
    // Find next opening: /* @arkzen:marker:
    const openPattern = `/* @arkzen:${marker}:`
    const openIdx = safe.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    // Extract the identifier (everything until whitespace or */)
    const afterOpen = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]

    // Skip :end markers
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    // Find end of opening comment.
    // Guard against inline cron fragments like "*/5 * * * *" in YAML.
    const openCommentEnd = findOpeningCommentEnd(safe, openIdx, openIdx + openPattern.length)
    if (openCommentEnd === -1) break

    // Find closing marker: /* @arkzen:marker:identifier:end */
    const closeMarker = `/* @arkzen:${marker}:${identifier}:end */`
    const closeIdx = safe.indexOf(closeMarker, openCommentEnd)
    if (closeIdx === -1) { searchFrom = openCommentEnd + 2; continue }

    // Extract raw content between opening comment close and closing marker
    // Also handle per-page layout declarations inside the block
    const raw = content.slice(openCommentEnd + 2, closeIdx).trim()

    results.push({
      raw,
      start: openIdx,
      end:   closeIdx + closeMarker.length,
    })

    searchFrom = closeIdx + closeMarker.length
  }

  return results
}

// ─────────────────────────────────────────────
// YAML SECTION PARSERS
// ─────────────────────────────────────────────

function parseMeta(content: string): ArkzenMeta {
  const raw = extractSection(content, 'meta')
  if (!raw) throw new Error('[Arkzen Parser] Missing @arkzen:meta section')

  const parsed = yaml.load(raw) as Record<string, unknown>

  if (!parsed.name) throw new Error('[Arkzen Parser] meta.name is required')

  // v9.0: favicon and pwa have moved to @arkzen:meta:web.
  // Keep reading them here as deprecated fallbacks so old tatemonos
  // don't hard-crash before migration. Emit a warning if found.
  const pwaRaw = parsed.pwa as Record<string, any> | undefined
  if (parsed.favicon) {
    console.warn(`[Arkzen Parser] ⚠ "${parsed.name}": favicon in @arkzen:meta is deprecated — move to @arkzen:meta:web`)
  }
  if (pwaRaw) {
    console.warn(`[Arkzen Parser] ⚠ "${parsed.name}": pwa in @arkzen:meta is deprecated — move to @arkzen:meta:web`)
  }

  return {
    name:         String(parsed.name),
    version:      String(parsed.version ?? '1.0.0'),
    description:  String(parsed.description ?? ''),
    auth:         Boolean(parsed.auth ?? false),
    dependencies: (parsed.dependencies as string[]) ?? [],
    // deprecated fallbacks
    favicon:      parsed.favicon ? String(parsed.favicon) : undefined,
    pwa:          pwaRaw ? {
      name:             String(pwaRaw.name             ?? parsed.name),
      short_name:       String(pwaRaw.short_name       ?? parsed.name),
      description:      String(pwaRaw.description      ?? parsed.description ?? ''),
      theme_color:      String(pwaRaw.theme_color      ?? '#0a0a0a'),
      background_color: String(pwaRaw.background_color ?? '#ffffff'),
      display:         (pwaRaw.display                 ?? 'standalone') as any,
      orientation:     (pwaRaw.orientation             ?? 'any') as any,
      start_url:        String(pwaRaw.start_url        ?? '/' + String(parsed.name)),
      offline:          Boolean(pwaRaw.offline         ?? true),
      icons:            pwaRaw.icons ?? undefined,
    } : undefined,
    authSeed:     parsed.auth_seed
      ? {
          users: ((parsed.auth_seed as any).users ?? []).map((u: any) => ({
            name:     String(u.name),
            email:    String(u.email),
            password: String(u.password),
            role:     String(u.role ?? 'user'),
          })),
        }
      : undefined,
  }
}

// ─────────────────────────────────────────────
// PARSE WEB META — v9.0
// Extracts @arkzen:meta:web block — web-only metadata.
// Contains: title, label, description, favicon, og, twitter, pwa.
// All fields optional. If block is absent returns undefined.
// ─────────────────────────────────────────────

function parseWebMeta(content: string): ArkzenWebMeta | undefined {
  // @arkzen:meta:web is a YAML_ONLY block — extractSection handles it
  // by stripping everything after `/* @arkzen:meta:web` up to the closing `*/`
  const raw = extractSection(content, 'meta:web')
  if (!raw) return undefined

  const parsed = yaml.load(raw) as Record<string, unknown>
  if (!parsed) return undefined

  const ogRaw      = parsed.og      as Record<string, any> | undefined
  const twitterRaw = parsed.twitter as Record<string, any> | undefined
  const pwaRaw     = parsed.pwa     as Record<string, any> | undefined

  const webMeta: ArkzenWebMeta = {}

  if (parsed.title)       webMeta.title       = String(parsed.title)
  if (parsed.label)       webMeta.label       = String(parsed.label)
  if (parsed.description) webMeta.description = String(parsed.description)
  if (parsed.favicon)     webMeta.favicon     = String(parsed.favicon)

  if (ogRaw) {
    webMeta.og = {}
    if (ogRaw.title)       webMeta.og.title       = String(ogRaw.title)
    if (ogRaw.description) webMeta.og.description = String(ogRaw.description)
    if (ogRaw.image)       webMeta.og.image       = String(ogRaw.image)
    if (ogRaw.url)         webMeta.og.url         = String(ogRaw.url)
    if (ogRaw.type)        webMeta.og.type        = String(ogRaw.type)
  }

  if (twitterRaw) {
    webMeta.twitter = {}
    if (twitterRaw.card)        webMeta.twitter.card        = String(twitterRaw.card)
    if (twitterRaw.title)       webMeta.twitter.title       = String(twitterRaw.title)
    if (twitterRaw.description) webMeta.twitter.description = String(twitterRaw.description)
    if (twitterRaw.image)       webMeta.twitter.image       = String(twitterRaw.image)
  }

  if (pwaRaw) {
    const tatName = String((yaml.load(extractSection(content, 'meta') ?? '') as any)?.name ?? '')
    webMeta.pwa = {
      name:             String(pwaRaw.name             ?? webMeta.label ?? tatName),
      short_name:       String(pwaRaw.short_name       ?? tatName),
      description:      String(pwaRaw.description      ?? webMeta.description ?? ''),
      theme_color:      String(pwaRaw.theme_color      ?? '#0a0a0a'),
      background_color: String(pwaRaw.background_color ?? '#ffffff'),
      display:         (pwaRaw.display                 ?? 'standalone') as any,
      orientation:     (pwaRaw.orientation             ?? 'any') as any,
      start_url:        String(pwaRaw.start_url        ?? `/${tatName}`),
      offline:          Boolean(pwaRaw.offline         ?? true),
      icons:            pwaRaw.icons ?? undefined,
    }
  }

  return webMeta
}

function parseConfig(content: string): ArkzenConfigOverride | undefined {
  // v7.0: @arkzen:web:config — strict, no fallback
  const raw = extractSection(content, 'web:config')
  if (!raw) return undefined
  return yaml.load(raw) as ArkzenConfigOverride
}

// ─────────────────────────────────────────────
// NATIVE PARSERS — v10.0
// All mirror their web equivalents exactly.
// @arkzen:meta:native  — YAML_ONLY, Type A — expo app config
// @arkzen:native:config  — YAML_ONLY, Type A — NativeWind, fonts, theme
// @arkzen:native:components:name  — CODE_BLOCK, Type B
// @arkzen:native:layout:name      — CODE_BLOCK, Type B
// @arkzen:native:style:name       — CODE_BLOCK, Type B
// @arkzen:native:page:name        — CODE_BLOCK, Type B
// @arkzen:native:animation        — CODE_BLOCK, Type B (global, one per tatemono)
// @arkzen:native:script           — CODE_BLOCK, Type B (global)
// @arkzen:native:script:name      — CODE_BLOCK, Type B (named, multiple)
// ─────────────────────────────────────────────

function parseNativeMeta(content: string): ArkzenNativeMeta | undefined {
  const raw = extractSection(content, 'meta:native')
  if (!raw) return undefined

  const parsed = yaml.load(raw) as Record<string, unknown>
  if (!parsed) return undefined

  const expoRaw = parsed.expo as Record<string, any> | undefined
  const nativeMeta: ArkzenNativeMeta = {}

  if (parsed.label)       nativeMeta.label       = String(parsed.label)
  if (parsed.description) nativeMeta.description = String(parsed.description)

  if (expoRaw) {
    nativeMeta.expo = {}
    if (expoRaw.bundle_id)  nativeMeta.expo.bundle_id  = String(expoRaw.bundle_id)
    if (expoRaw.icon)       nativeMeta.expo.icon        = String(expoRaw.icon)
    if (expoRaw.scheme)     nativeMeta.expo.scheme      = String(expoRaw.scheme)
    if (expoRaw.version)    nativeMeta.expo.version     = String(expoRaw.version)
    if (expoRaw.splash) {
      const s = expoRaw.splash as Record<string, any>
      nativeMeta.expo.splash = {
        image:            s.image            ? String(s.image)            : undefined,
        background_color: s.background_color ? String(s.background_color) : '#ffffff',
        resize_mode:      s.resize_mode      ? String(s.resize_mode)      : 'contain',
      }
    }
    if (expoRaw.orientation)       nativeMeta.expo.orientation       = String(expoRaw.orientation) as any
    if (expoRaw.status_bar_style)  nativeMeta.expo.status_bar_style  = String(expoRaw.status_bar_style) as any
    if (Array.isArray(expoRaw.permissions)) {
      nativeMeta.expo.permissions = expoRaw.permissions.map(String)
    }
  }

  return nativeMeta
}

function parseNativeConfig(content: string): ArkzenNativeConfig | undefined {
  const raw = extractSection(content, 'native:config')
  if (!raw) return undefined
  return yaml.load(raw) as ArkzenNativeConfig
}

function parseAllNativeComponents(content: string): ArkzenSection[] {
  return extractAllNamedSections(content, 'native:components')
}

function parseAllNativeLayouts(content: string): ArkzenSection[] {
  return extractAllNamedSections(content, 'native:layout')
}

function parseAllNativeStyles(content: string): ArkzenSection[] {
  return extractAllNamedSections(content, 'native:style')
}

function parseAllNativePages(content: string): ArkzenPage[] {
  const sections = extractAllNamedSections(content, 'native:page')
  return sections.map(section => {
    // Check for layout declaration: /* @arkzen:native:page:layout:name */
    const layoutMatch = section.raw.match(/\/\* @arkzen:native:page:layout:([a-zA-Z0-9_-]+) \*\//)
    return {
      name:   section.name!,
      raw:    section.raw,
      layout: layoutMatch?.[1] ?? 'default',
      start:  section.start,
      end:    section.end,
    }
  })
}

function parseGlobalNativeAnimation(content: string): ArkzenSection | undefined {
  return extractSectionWithPosition(content, 'native:animation') ?? undefined
}

function parseGlobalNativeScript(content: string): ArkzenSection | undefined {
  const globalMarker  = `/* @arkzen:native:script`
  const safe          = stripTemplateLiterals(content)
  const globalIdx     = safe.indexOf(globalMarker)
  if (globalIdx === -1) return undefined

  const afterMarker = content.slice(globalIdx + globalMarker.length)
  if (!afterMarker[0] || !/[\s*]/.test(afterMarker[0])) return undefined

  const openCommentEnd = safe.indexOf('*/', globalIdx)
  if (openCommentEnd === -1) return undefined

  const endMarker = `/* @arkzen:native:script:end */`
  const endIdx = safe.indexOf(endMarker, openCommentEnd)
  if (endIdx === -1) return undefined

  const raw = content.slice(openCommentEnd + 2, endIdx).trim()
  return { raw, start: globalIdx, end: endIdx + endMarker.length }
}

function parseAllNamedNativeScripts(content: string): ArkzenSection[] {
  return extractAllNamedSections(content, 'native:script')
}

// ─────────────────────────────────────────────
// PARSE ALL DATABASE BLOCKS
// ─────────────────────────────────────────────

function parseAllDatabases(content: string): ArkzenDatabase[] {
  const raws   = extractAllSections(content, 'database')
  const result: ArkzenDatabase[] = []

  for (const raw of raws) {
    const parsed = yaml.load(raw) as Record<string, unknown>
    if (!parsed || !parsed.table) continue

    const table = String(parsed.table)
    if (table === '_none' || table === '' || table === 'null') continue
    if (!parsed.columns) {
      throw new Error(`[Arkzen Parser] database.columns is required for table: ${table}`)
    }

    result.push({
      table,
      timestamps:  Boolean(parsed.timestamps  ?? true),
      softDeletes: Boolean(parsed.softDeletes ?? false),
      columns:     parsed.columns as ArkzenDatabase['columns'],
      indexes:     (parsed.indexes as ArkzenDatabase['indexes']) ?? [],
      seeder:      parsed.seeder as ArkzenDatabase['seeder'],
    })
  }

  // v5: Topological sort — auto-order by foreign key dependencies
  return topologicalSort(result)
}

// ─────────────────────────────────────────────
// TOPOLOGICAL SORT — v5 Decision 7
// Auto-orders migrations so parent tables run before children
// ─────────────────────────────────────────────

function topologicalSort(databases: ArkzenDatabase[]): ArkzenDatabase[] {
  const tableNames = new Set(databases.map(d => d.table))
  const dependsOn  = new Map<string, Set<string>>()

  for (const db of databases) {
    const deps = new Set<string>()
    for (const col of Object.values(db.columns)) {
      if (col.foreign) {
        const refTable = col.foreign.split('.')[0]
        if (tableNames.has(refTable) && refTable !== db.table) {
          deps.add(refTable)
        }
      }
    }
    dependsOn.set(db.table, deps)
  }

  const sorted: ArkzenDatabase[] = []
  const visited = new Set<string>()

  function visit(table: string): void {
    if (visited.has(table)) return
    visited.add(table)
    for (const dep of dependsOn.get(table) ?? []) {
      visit(dep)
    }
    const db = databases.find(d => d.table === table)
    if (db) sorted.push(db)
  }

  for (const db of databases) {
    visit(db.table)
  }

  return sorted
}

// ─────────────────────────────────────────────
// PARSE ALL API BLOCKS — FIXED
// Now includes resource, policy, factory fields
// ─────────────────────────────────────────────

function parseAllApis(content: string): ArkzenApi[] {
  const raws   = extractAllSections(content, 'api')
  const result: ArkzenApi[] = []

  for (const raw of raws) {
    const parsed = yaml.load(raw) as Record<string, unknown>
    if (!parsed || !parsed.model) continue

    const model = String(parsed.model)
    if (model === '_none' || model === '' || model === 'null') continue

    if (!parsed.controller) throw new Error(`[Arkzen Parser] api.controller is required for model: ${model}`)
    if (!parsed.prefix)     throw new Error(`[Arkzen Parser] api.prefix is required for model: ${model}`)

    result.push({
      model,
      controller: String(parsed.controller),
      prefix:     String(parsed.prefix),
      middleware: (parsed.middleware as string[]) ?? [],
      endpoints:  (parsed.endpoints  as ArkzenApi['endpoints']) ?? {},
      resource:   parsed.resource ?? false,
      policy:     parsed.policy ?? false,
      factory:    parsed.factory ?? false,
    })
  }

  return result
}

// ─────────────────────────────────────────────
// PARSE ALL CUSTOM ROUTES — v5.1
//
// Handles @arkzen:routes blocks — lightweight one-off endpoints
// that don't require a model, database, or full resource controller.
//
// DSL format (self-closing YAML comment block):
//   /* @arkzen:routes
//   controller: SimulateController
//   middleware: []
//   routes:
//     - method: GET
//       route: /api/errors-test/simulate/{code}
//       handler: simulate
//   */
//
// Multiple @arkzen:routes blocks are supported — each becomes one
// ArkzenCustomRoute entry. The controller is auto-generated by
// CustomRouteBuilder with a method stub per handler entry.
//
// Handler methods receive route parameters as variadic $params:
//   public function simulate(Request $request, mixed ...$params): JsonResponse
//   { $code = (int)($params[0] ?? 200); return response()->json([...], $code); }
// ─────────────────────────────────────────────

function parseAllCustomRoutes(content: string): ArkzenCustomRoute[] {
  const raws   = extractAllSections(content, 'routes')
  const result: ArkzenCustomRoute[] = []

  // Build a handler-name → base64 body map from @arkzen:handler:name blocks
  // so each route entry can carry its injected PHP body.
  const handlerBodies = parseAllHandlerSnippets(content)

  for (const raw of raws) {
    const parsed = yaml.load(raw) as Record<string, unknown>
    if (!parsed) continue

    const controller = String(parsed.controller ?? 'CustomController')
    const middleware = (parsed.middleware as string[]) ?? []
    const rawRoutes  = (parsed.routes as Record<string, unknown>[]) ?? []

    if (rawRoutes.length === 0) continue

    const routes: ArkzenCustomRouteEntry[] = rawRoutes.map(r => {
      const handler = String(r.handler ?? 'handle')
      const entry: ArkzenCustomRouteEntry = {
        method:  (String(r.method ?? 'GET').toUpperCase()) as ArkzenCustomRouteEntry['method'],
        route:   String(r.route ?? '/'),
        handler,
      }
      // Attach body if a @arkzen:handler:name block exists for this handler
      if (handlerBodies[handler]) {
        entry.body = handlerBodies[handler]
      }
      return entry
    })

    result.push({ controller, middleware, routes })
  }

  return result
}

// ─────────────────────────────────────────────
// PARSE ALL MIDDLEWARE SNIPPETS — v6.3
// Extracts @arkzen:middleware:name ... :end blocks.
// YAML config in the opening comment (currently unused — reserved for
// future options like `params`, `priority`).
// PHP body between */ and :end is base64-encoded and stored by name.
// MiddlewareBuilder reads this map to inject into handle() instead of stub.
//
// Format:
//   /* @arkzen:middleware:requireJson
//   */
//   if (!$request->isJson()) {
//       return response()->json(['message' => 'Content-Type: application/json required'], 415);
//   }
//   return $next($request);
//   /* @arkzen:middleware:requireJson:end */
// ─────────────────────────────────────────────

function parseAllMiddlewareSnippets(content: string): ArkzenMiddlewareSnippets {
  const snippets: ArkzenMiddlewareSnippets = {}
  const openPattern = `/* @arkzen:middleware:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen  = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    const closeMarker = `/* @arkzen:middleware:${identifier}:end */`
    const closeIdx    = content.indexOf(closeMarker, openCommentEnd)

    const body        = closeIdx !== -1
      ? content.slice(openCommentEnd + 2, closeIdx).trim()
      : ''

    if (body) {
      snippets[identifier] = Buffer.from(body).toString('base64')
    }

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  return snippets
}

// ─────────────────────────────────────────────
// PARSE ALL POLICY SNIPPETS — v6.0
// Extracts @arkzen:policy:methodName ... :end blocks.
// YAML config in the opening comment (currently unused — reserved for
// future options like `ability`, `conditions`).
// PHP body between */ and :end is base64-encoded and stored by method name.
// PolicyBuilder reads this map to inject into methods like update() instead of stub.
//
// Format:
//   /* @arkzen:policy:update
//   */
//   return $user->id === $product->user_id && !$product->archived;
//   /* @arkzen:policy:update:end */
//
//   /* @arkzen:policy:delete
//   */
//   return $user->id === $product->user_id && !$product->archived;
//   /* @arkzen:policy:delete:end */
// ─────────────────────────────────────────────

function parseAllPolicySnippets(content: string): Record<string, string> {
  const snippets: Record<string, string> = {}
  const openPattern = `/* @arkzen:policy:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen  = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    const closeMarker = `/* @arkzen:policy:${identifier}:end */`
    const closeIdx    = content.indexOf(closeMarker, openCommentEnd)

    const body        = closeIdx !== -1
      ? content.slice(openCommentEnd + 2, closeIdx).trim()
      : ''

    if (body) {
      snippets[identifier] = Buffer.from(body).toString('base64')
      console.log(`[Parser] ✓ Policy snippet extracted: ${identifier}`)
    }

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  if (Object.keys(snippets).length > 0) {
    console.log(`[Parser] Policy snippets found: ${Object.keys(snippets).join(', ')}`)
  }

  return snippets
}

// ─────────────────────────────────────────────
// PARSE ALL HANDLER SNIPPETS — v6.3
// Extracts @arkzen:handler:name ... :end blocks.
// Used by parseAllCustomRoutes() to attach PHP bodies to route entries.
// Returns a map of handler name → base64-encoded PHP body.
//
// Format:
//   /* @arkzen:handler:myHandler
//   */
//   $result = MyModel::where('active', true)->get();
//   return response()->json(['data' => $result]);
//   /* @arkzen:handler:myHandler:end */
// ─────────────────────────────────────────────

function parseAllHandlerSnippets(content: string): Record<string, string> {
  const snippets: Record<string, string> = {}
  const openPattern = `/* @arkzen:handler:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen  = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    const closeMarker = `/* @arkzen:handler:${identifier}:end */`
    const closeIdx    = content.indexOf(closeMarker, openCommentEnd)

    const body        = closeIdx !== -1
      ? content.slice(openCommentEnd + 2, closeIdx).trim()
      : ''

    if (body) {
      snippets[identifier] = Buffer.from(body).toString('base64')
    }

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  return snippets
}

// ─────────────────────────────────────────────
// PARSE ALL ENDPOINT BODIES — v6.3
// Extracts @arkzen:endpoint:name ... :end blocks.
// Used to attach PHP bodies to custom @arkzen:api endpoints so
// ControllerBuilder injects them into generateCustomMethod().
// Returns a map of endpoint name → base64-encoded PHP body.
//
// Format:
//   /* @arkzen:endpoint:myCustomAction
//   */
//   $user = $request->user();
//   return response()->json(['role' => $user->role, 'id' => $user->id]);
//   /* @arkzen:endpoint:myCustomAction:end */
// ─────────────────────────────────────────────

function parseAllEndpointBodies(content: string): Record<string, string> {
  const bodies: Record<string, string> = {}
  const openPattern = `/* @arkzen:endpoint:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen  = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    const closeMarker = `/* @arkzen:endpoint:${identifier}:end */`
    const closeIdx    = content.indexOf(closeMarker, openCommentEnd)

    const body        = closeIdx !== -1
      ? content.slice(openCommentEnd + 2, closeIdx).trim()
      : ''

    if (body) {
      bodies[identifier] = Buffer.from(body).toString('base64')
    }

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  return bodies
}

// ─────────────────────────────────────────────
// PARSE ALL PAGES — v5
// Extracts @arkzen:page:name blocks with per-page layout
// Layout declared as: /* @arkzen:page:layout:guest */
// ─────────────────────────────────────────────

function parseAllPages(content: string): ArkzenPage[] {
  const results: ArkzenPage[] = []
  let searchFrom = 0

  // v7.0: @arkzen:web:page: — strict, no fallback
  const openPattern   = `/* @arkzen:web:page:`
  const closePrefix   = `web:page`
  const layoutPattern = `@arkzen:web:page:layout:`

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const pageName = identMatch[1]

    if (pageName === 'end' || pageName === 'layout') {
      searchFrom = openIdx + openPattern.length
      continue
    }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    const closeMarker = `/* @arkzen:${closePrefix}:${pageName}:end */`
    const closeIdx = content.indexOf(closeMarker, openCommentEnd)
    if (closeIdx === -1) { searchFrom = openCommentEnd + 2; continue }

    let raw = content.slice(openCommentEnd + 2, closeIdx).trim()

    let layout: string = 'guest'
    const blockContent = content.slice(openCommentEnd + 2, closeIdx)
    const layoutMatch  = blockContent.match(new RegExp(`\\/\\* ${layoutPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([a-zA-Z0-9_-]+) \\*\\/`))
    if (layoutMatch) {
      layout = layoutMatch[1]
      raw = raw.replace(new RegExp(`\\/\\* ${layoutPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[a-zA-Z0-9_-]+ \\*\\/\\n?`), '').trim()
    }

    results.push({
      name:   pageName,
      layout,
      raw,
      start:  openIdx,
      end:    closeIdx + closeMarker.length,
    })

    searchFrom = closeIdx + closeMarker.length
  }

  return results
}

// ─────────────────────────────────────────────
// PARSE ALL CUSTOM LAYOUTS — v5
// @arkzen:layout:name ... @arkzen:layout:name:end
// ─────────────────────────────────────────────

function parseAllLayouts(content: string): ArkzenLayout[] {
  // v7.0: @arkzen:web:layout: — strict, no fallback
  const sections = extractAllNamedSections(content, 'web:layout')
  return sections.map(s => {
    const seg = content.slice(s.start)
    const nameMatch = seg.match(/\/\* @arkzen:web:layout:([a-zA-Z0-9_-]+)/)
    const name = nameMatch ? nameMatch[1] : 'unknown'
    return { name, raw: s.raw, start: s.start, end: s.end }
  })
}

// ─────────────────────────────────────────────
// PARSE ALL NAMED CODE SECTIONS (events, jobs, console, etc.)
// v5.2 FIX: Two valid block shapes exist for these markers:
//
//   Shape A — plain self-closing YAML block (no identifier):
//     /* @arkzen:events
//     order-placed:
//       listeners: [SendOrderConfirmation]
//     */
//
//   Shape B — named YAML-comment block (identifier in marker, :end closer):
//     /* @arkzen:console:cleanup-temp
//     signature: scheduler-test:cleanup-temp
//     description: Deletes temporary files
//     schedule: "0 * * * *"
//     */
//     /* @arkzen:console:cleanup-temp:end */
//
// Shape A: YAML is between the marker */ and the next block.
//          Handled by extractAllSections() — strips :identifier prefix.
//
// Shape B: YAML is INSIDE the opening comment (between marker line and */).
//          The :end block is empty — nothing sits between */ and :end.
//          extractAllSections() picks up both the opening content AND
//          the bare ":end */" text as separate entries, which breaks parsing.
//
// Solution: detect Shape B blocks first (those that have a matching :name:end),
// extract their YAML from inside the opening comment, then fall back to
// extractAllSections() for any remaining Shape A blocks.
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// PARSE ALL NOTIFICATIONS — v6.1
// @arkzen:notifications:name blocks use the new named marker pattern:
// YAML config lives inside the opening comment, no PHP body.
//
// Format:
//   /* @arkzen:notifications:database-ping
//   channels: [database]
//   message: "You have a new notification"
//   subject: "Database Ping"
//   */
//   /* @arkzen:notifications:database-ping:end */
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// PARSE ALL NOTIFICATIONS — v6.3
// v6.3: Body extraction added. PHP body between */ and :end is
// base64-encoded and embedded as `toMail_body` in the YAML so
// NotificationBuilder can inject it into toMail() instead of the stub.
// If no body is written, the stub is used as before.
// ─────────────────────────────────────────────

function parseAllNotifications(content: string): ArkzenSection[] {
  const results: ArkzenSection[] = []
  const openPattern = `/* @arkzen:notifications:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    const yamlRaw = content
      .slice(openIdx + openPattern.length + identifier.length, openCommentEnd)
      .trim()

    const closeMarker = `/* @arkzen:notifications:${identifier}:end */`
    const closeIdx = content.indexOf(closeMarker, openCommentEnd)

    // v6.3: capture PHP body between */ and :end
    const body = closeIdx !== -1
      ? content.slice(openCommentEnd + 2, closeIdx).trim()
      : ''

    const bodyEncoded = Buffer.from(body).toString('base64')
    const raw = `${identifier}:\n` +
      yamlRaw.split('\n').map(l => `  ${l}`).join('\n') +
      `\n  toMail_body: '${bodyEncoded}'`

    results.push({ raw, start: openIdx, end: closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2 })

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  return results
}

// ─────────────────────────────────────────────
// PARSE ALL MAILS — v6.1
// Same pattern as notifications — YAML inside opening comment, no body.
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// PARSE ALL MAILS — v6.3
// v6.3: Blade view body added. HTML/Blade between */ and :end is
// base64-encoded and embedded as `blade_body` so MailBuilder can
// inject it into the generated Blade view instead of the generic stub.
// ─────────────────────────────────────────────

function parseAllMails(content: string): ArkzenSection[] {
  const results: ArkzenSection[] = []
  const openPattern = `/* @arkzen:mail:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    const yamlRaw = content
      .slice(openIdx + openPattern.length + identifier.length, openCommentEnd)
      .trim()

    const closeMarker = `/* @arkzen:mail:${identifier}:end */`
    const closeIdx = content.indexOf(closeMarker, openCommentEnd)

    // v6.3: capture Blade/HTML body between */ and :end
    const body = closeIdx !== -1
      ? content.slice(openCommentEnd + 2, closeIdx).trim()
      : ''

    const bodyEncoded = Buffer.from(body).toString('base64')
    const raw = `${identifier}:\n` +
      yamlRaw.split('\n').map(l => `  ${l}`).join('\n') +
      `\n  blade_body: '${bodyEncoded}'`

    results.push({ raw, start: openIdx, end: closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2 })

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  return results
}

// ─────────────────────────────────────────────
// PARSE ALL STYLES — v6.4
// Parses both @arkzen:style (global) and @arkzen:style:name (CSS Modules).
// Global style: no name, CSS is written directly between */ and :end
// Component styles: have name, CSS Module content between */ and :end
// ─────────────────────────────────────────────

function parseAllStyles(content: string): ArkzenStyle[] {
  const results: ArkzenStyle[] = []
  // v7.0: @arkzen:web:style — strict, no fallback
  const baseTag = 'web:style'

  // ── First pass: global (no name) ─────────────────────────────────────
  const globalMarker = `/* @arkzen:${baseTag}`
  const globalIdx = content.indexOf(globalMarker)
  if (globalIdx !== -1) {
    const afterMarker = content.slice(globalIdx + globalMarker.length)
    if (afterMarker[0] && /[\s*]/.test(afterMarker[0])) {
      const openCommentEnd = content.indexOf('*/', globalIdx)
      if (openCommentEnd !== -1) {
        const endMarker = `/* @arkzen:${baseTag}:end */`
        const endIdx = content.indexOf(endMarker, openCommentEnd)
        if (endIdx !== -1) {
          const raw = content.slice(openCommentEnd + 2, endIdx).trim()
          results.push({ raw, start: globalIdx, end: endIdx + endMarker.length })
        }
      }
    }
  }

  // ── Second pass: named (CSS Modules) ─────────────────────────────────
  const namedPattern = `/* @arkzen:${baseTag}:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(namedPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen = content.slice(openIdx + namedPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + namedPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + namedPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    const closeMarker = `/* @arkzen:${baseTag}:${identifier}:end */`
    const closeIdx = content.indexOf(closeMarker, openCommentEnd)
    if (closeIdx === -1) { searchFrom = openCommentEnd + 2; continue }

    const raw = content.slice(openCommentEnd + 2, closeIdx).trim()
    results.push({
      name: identifier,
      raw,
      start: openIdx,
      end: closeIdx + closeMarker.length,
    })

    searchFrom = closeIdx + closeMarker.length
  }

  return results
}

// ─────────────────────────────────────────────
// PARSE ALL SCRIPTS — v8.0
// v8.0: moved to @arkzen:web:script / @arkzen:web:script:name prefix.
// Script blocks are web-frontend utilities — Three.js scenes, canvas
// setups, GSAP factories, shared constants — that only make sense on web.
// Native and desktop will have their own @arkzen:native:script etc.
//
// Two shapes:
//   Global  — /* @arkzen:web:script */ ... /* @arkzen:web:script:end */
//             → one per tatemono, exported as {name}.scripts.ts
//   Named   — /* @arkzen:web:script:name */ ... /* @arkzen:web:script:name:end */
//             → multiple allowed, each exported as {name}.{scriptName}.script.ts
//
// Opening tags must have */ on the same line (CODE_BLOCK_TAGS rule).
// ─────────────────────────────────────────────

function parseGlobalScript(content: string): ArkzenSection | undefined {
  // v8.0: @arkzen:web:script — strict, no fallback
  // Check first char after `/* @arkzen:web:script` — if it's NOT ':' it's the global block.
  // ':' means named block (/* @arkzen:web:script:name */), space/* means global.
  const globalMarker = `/* @arkzen:web:script`
  const safe = stripTemplateLiterals(content)
  const globalIdx = safe.indexOf(globalMarker)
  if (globalIdx === -1) return undefined

  const afterMarker = content.slice(globalIdx + globalMarker.length)
  if (!afterMarker[0] || !/[\s*]/.test(afterMarker[0])) return undefined

  const openCommentEnd = safe.indexOf('*/', globalIdx)
  if (openCommentEnd === -1) return undefined

  const endMarker = `/* @arkzen:web:script:end */`
  const endIdx = safe.indexOf(endMarker, openCommentEnd)
  if (endIdx === -1) return undefined

  const raw = content.slice(openCommentEnd + 2, endIdx).trim()
  return { raw, start: globalIdx, end: endIdx + endMarker.length }
}

function parseAllNamedScripts(content: string): ArkzenSection[] {
  // v8.0: @arkzen:web:script:name — strict, no fallback
  return extractAllNamedSections(content, 'web:script')
}

// ─────────────────────────────────────────────
// PARSE ALL NAMED CODE (generic fallback for sections without :name pattern)
// ─────────────────────────────────────────────

function parseAllNamedCode(content: string, marker: string): ArkzenSection[] {
  const results: ArkzenSection[] = []
  const openPattern = `/* @arkzen:${marker}:`

  // ── Pass 1: collect all Shape B named blocks ──────────────────────────────
  // These have /* @arkzen:marker:name\n...yaml...\n*/ and a separate :end block.
  // YAML lives inside the opening comment, keyed under the block name.
  const namedMerged: Record<string, unknown> = {}
  let searchFrom = 0
  const usedRanges: Array<[number, number]> = []

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen  = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    // Only handle if a matching :end exists (Shape B)
    const endMarker = `/* @arkzen:${marker}:${identifier}:end */`
    const endIdx    = content.indexOf(endMarker, openIdx)
    if (endIdx === -1) { searchFrom = openIdx + openPattern.length; continue }

    // Extract YAML from inside the opening comment
    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1 || openCommentEnd > endIdx) { searchFrom = openIdx + openPattern.length; continue }

    // Content between ":identifier\n" and closing "*/"
    const rawSlice = content
      .slice(openIdx + openPattern.length + identifier.length, openCommentEnd)
      .trim()

    if (rawSlice) {
      // Wrap under the identifier key so it merges into the flat map correctly
      namedMerged[identifier] = rawSlice
        .split('\n')
        .reduce((acc: Record<string, string>, line) => {
          const colonIdx = line.indexOf(':')
          if (colonIdx === -1) return acc
          const key = line.slice(0, colonIdx).trim()
          const val = line.slice(colonIdx + 1).trim().replace(/^[\"']|[\"']$/g, '')
          acc[key] = val
          return acc
        }, {})
    }

    // Mark the full range (open marker → end marker) as consumed
    usedRanges.push([openIdx, endIdx + endMarker.length])
    searchFrom = endIdx + endMarker.length
  }

  // If any named blocks were found, emit one merged section
  if (Object.keys(namedMerged).length > 0) {
    // Rebuild as YAML string for the backend — but actually we push the
    // parsed object directly. ModuleReader v7 calls Yaml::parse() on each
    // raw string, so we must emit valid YAML, not a JS object.
    // Build one YAML string with all named entries.
    const yamlLines: string[] = []
    for (const [name, cfg] of Object.entries(namedMerged)) {
      yamlLines.push(`${name}:`)
      if (cfg && typeof cfg === 'object') {
        for (const [k, v] of Object.entries(cfg as Record<string, string>)) {
          // Quote values that contain special YAML characters
          const needsQuote = /[:#\[\]{},&*?|<>=!%@`]/.test(String(v)) || String(v).includes('"')
          yamlLines.push(`  ${k}: ${needsQuote ? `'${String(v).replace(/'/g, "''")}'` : v}`)
        }
      }
    }
    results.push({ raw: yamlLines.join('\n'), start: 0, end: 0 })
  }

  // ── Pass 2: Shape A — plain /* @arkzen:marker ... */ blocks ───────────────
  // Use extractAllSections but skip any content overlapping Shape B ranges.
  const plainRaws = extractAllSections(content, marker)
  for (const raw of plainRaws) {
    // Filter out ":end */" bleed-through — these are bare strings that start
    // with ":end" or are empty after stripping, produced when extractAllSections
    // matches the closing comment of a Shape B block.
    const trimmed = raw.trim()
    if (!trimmed || trimmed.startsWith(':end') || trimmed === '*/' ) continue
    // Also skip if this raw content was already captured as a Shape B block
    // (heuristic: if every top-level key matches a namedMerged key, skip it)
    results.push({ raw: trimmed, start: 0, end: 0 })
  }

  return results
}

// ─────────────────────────────────────────────
// PARSE ALL CONSOLE BLOCKS — v6.0
// @arkzen:console:name blocks work like @arkzen:page:name —
// named blocks with :end, YAML config in the opening comment,
// PHP handle() body between */ and :end.
//
// Each block emits a raw YAML string with an extra `body` key
// carrying the handle() code. ModuleReader + ConsoleBuilder
// read config keys (signature, description, schedule) AND body.
//
// Format:
//   /* @arkzen:console:cleanup-temp
//   signature: scheduler-test:cleanup-temp
//   description: Deletes temporary files
//   schedule: '0 * * * *'
//   */
//   public function handle(): int { ... }
//   /* @arkzen:console:cleanup-temp:end */
// ─────────────────────────────────────────────

function parseAllConsoles(content: string): ArkzenSection[] {
  const results: ArkzenSection[] = []
  const openPattern = `/* @arkzen:console:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen  = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    // Find closing */ of opening comment (cron-safe).
    const openCommentEnd = findOpeningCommentEnd(content, openIdx, openIdx + openPattern.length)
    if (openCommentEnd === -1) break

    // YAML config lives inside the opening comment
    const yamlRaw = content
      .slice(openIdx + openPattern.length + identifier.length, openCommentEnd)
      .trim()

    // PHP body lives between */ and :end
    const closeMarker = `/* @arkzen:console:${identifier}:end */`
    const closeIdx    = content.indexOf(closeMarker, openCommentEnd)
    const body        = closeIdx !== -1
      ? content.slice(openCommentEnd + 2, closeIdx).trim()
      : ''

    // Emit as a YAML string with name as top-level key and body embedded
    // Body is base64-encoded to safely embed multiline PHP inside YAML
    const bodyEncoded = Buffer.from(body).toString('base64')
    const raw = `${identifier}:\n` +
      yamlRaw.split('\n').map(l => `  ${l}`).join('\n') +
      `\n  body: '${bodyEncoded}'`

    results.push({ raw, start: openIdx, end: closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2 })

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  return results
}



function parseAllJobs(content: string): ArkzenSection[] {
  const results: ArkzenSection[] = []
  const openPattern = `/* @arkzen:jobs:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    // YAML config inside the opening comment
    const yamlRaw = content
      .slice(openIdx + openPattern.length + identifier.length, openCommentEnd)
      .trim()

    // PHP body between */ and :end
    const closeMarker = `/* @arkzen:jobs:${identifier}:end */`
    const closeIdx = content.indexOf(closeMarker, openCommentEnd)
    const body = closeIdx !== -1
      ? content.slice(openCommentEnd + 2, closeIdx).trim()
      : ''

    const bodyEncoded = Buffer.from(body).toString('base64')
    const raw = `${identifier}:\n` +
      yamlRaw.split('\n').map(l => `  ${l}`).join('\n') +
      `\n  body: '${bodyEncoded}'`

    results.push({ raw, start: openIdx, end: closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2 })

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  return results
}


// ─────────────────────────────────────────────
// PARSE ALL LISTENER BODIES — v6.3
// Extracts @arkzen:listener:name ... :end blocks.
// Returns map of listener class name → base64-encoded PHP handle() body.
// ListenerBuilder uses this to inject real logic instead of log-and-record stub.
//
// Format:
//   /* @arkzen:listener:SendWelcomeEmail
//   */
//   Mail::to($event->data['email'] ?? '')->send(new WelcomeMail($event->data));
//   /* @arkzen:listener:SendWelcomeEmail:end */
// ─────────────────────────────────────────────

function parseAllListenerBodies(content: string): Record<string, string> {
  const bodies: Record<string, string> = {}
  const openPattern = `/* @arkzen:listener:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen  = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    const closeMarker = `/* @arkzen:listener:${identifier}:end */`
    const closeIdx    = content.indexOf(closeMarker, openCommentEnd)

    const body = closeIdx !== -1
      ? content.slice(openCommentEnd + 2, closeIdx).trim()
      : ''

    if (body) {
      bodies[identifier] = Buffer.from(body).toString('base64')
    }

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  return bodies
}

function parseAllEvents(content: string): ArkzenSection[] {
  const results: ArkzenSection[] = []
  const openPattern = `/* @arkzen:events:`
  let searchFrom = 0

  // v6.3: gather listener bodies to embed into each event's YAML
  const listenerBodies = parseAllListenerBodies(content)

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    const yamlRaw = content
      .slice(openIdx + openPattern.length + identifier.length, openCommentEnd)
      .trim()

    // Events don't have a PHP body — body is '' (kept for compat)
    const closeMarker = `/* @arkzen:events:${identifier}:end */`
    const closeIdx = content.indexOf(closeMarker, openCommentEnd)
    const bodyEncoded = Buffer.from('').toString('base64')

    // v6.3: embed serialized listener bodies map as YAML-safe base64
    const listenerBodiesEncoded = Buffer.from(JSON.stringify(listenerBodies)).toString('base64')

    const raw = `${identifier}:\n` +
      yamlRaw.split('\n').map(l => `  ${l}`).join('\n') +
      `\n  body: '${bodyEncoded}'` +
      `\n  listener_bodies: '${listenerBodiesEncoded}'`

    results.push({ raw, start: openIdx, end: closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2 })

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  return results
}




function parseAllRealtime(content: string): ArkzenSection[] {
  const results: ArkzenSection[] = []
  const openPattern = `/* @arkzen:realtime:`
  let searchFrom = 0

  while (true) {
    const openIdx = content.indexOf(openPattern, searchFrom)
    if (openIdx === -1) break

    const afterOpen = content.slice(openIdx + openPattern.length)
    const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
    if (!identMatch) { searchFrom = openIdx + openPattern.length; continue }

    const identifier = identMatch[1]
    if (identifier === 'end') { searchFrom = openIdx + openPattern.length; continue }

    const openCommentEnd = content.indexOf('*/', openIdx)
    if (openCommentEnd === -1) break

    // YAML config inside the opening comment
    const yamlRaw = content
      .slice(openIdx + openPattern.length + identifier.length, openCommentEnd)
      .trim()

    // No PHP body for realtime sections
    const closeMarker = `/* @arkzen:realtime:${identifier}:end */`
    const closeIdx = content.indexOf(closeMarker, openCommentEnd)
    const body = ''

    const bodyEncoded = Buffer.from(body).toString('base64')
    const raw = `${identifier}:\n` +
      yamlRaw.split('\n').map(l => `  ${l}`).join('\n') +
      `\n  body: '${bodyEncoded}'`

    results.push({ raw, start: openIdx, end: closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2 })

    searchFrom = closeIdx !== -1 ? closeIdx + closeMarker.length : openCommentEnd + 2
  }

  return results
}




function parseAllComponents(content: string): ArkzenSection[] {
  // v7.0: @arkzen:web:components: — strict, no fallback
  return extractAllNamedSections(content, 'web:components')
}

// ─────────────────────────────────────────────
// PARSE ERROR HANDLERS — v6
// Extracts @arkzen:error:404 and @arkzen:error:500 blocks.
// These generate Next.js segment-scoped not-found.tsx / error.tsx
// rather than routed pages. Each has an :end closer.
//
// Format:
//   /* @arkzen:error:404 */
//   const NotFoundPage = () => <ErrorScreen code={404} />
//   /* @arkzen:error:404:end */
// ─────────────────────────────────────────────

function parseAllErrorHandlers(content: string): ArkzenErrorHandler[] {
  const results: ArkzenErrorHandler[] = []
  const validTypes: ArkzenErrorHandlerType[] = ['404', '500']
  // v7.0: @arkzen:web:error: — strict, no fallback
  const prefix = 'web:error'

  for (const type of validTypes) {
    const openMarker  = `/* @arkzen:${prefix}:${type} */`
    const closeMarker = `/* @arkzen:${prefix}:${type}:end */`

    const openIdx = content.indexOf(openMarker)
    if (openIdx === -1) continue

    const closeIdx = content.indexOf(closeMarker, openIdx)
    if (closeIdx === -1) continue

    const raw = content.slice(openIdx + openMarker.length, closeIdx).trim()
    if (!raw) continue

    results.push({ type, raw })
  }

  return results
}

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// DSL TAG VALIDATOR v1.0
// Catches missing */ on code block opening tags and missing :end */ closing tags
// Runs BEFORE any parsing so errors are clear, not cascaded TypeScript crashes
// ─────────────────────────────────────────────

interface DslTagError {
  line:    number
  tag:     string
  problem: string
  fix:     string
}

// v7.0: updated for web: prefix. tagType now captures e.g. "web" from @arkzen:web:page:index
// so CODE_BLOCK_TAGS etc. match on the full prefix:subtype string instead.
const CODE_BLOCK_TAGS = [
  // web
  'web:components', 'web:layout', 'web:animation', 'web:script', 'web:page', 'web:style', 'web:error',
  // native — v10.0
  'native:components', 'native:layout', 'native:animation', 'native:script', 'native:page', 'native:style',
]
const BODY_SEP_TAGS   = ['endpoint', 'handler', 'middleware', 'policy']
const YAML_ONLY_TAGS  = [
  'meta', 'meta:web', 'meta:native',
  'web:config', 'native:config',
  'database', 'api', 'routes', 'realtime', 'events', 'notifications', 'mail',
]

function validateDslTags(content: string, filePath: string): void {
  const lines     = content.split('\n')
  const errors: DslTagError[] = []
  const tatemono  = path.basename(path.dirname(filePath))

  for (let i = 0; i < lines.length; i++) {
    const line    = lines[i]
    const lineNum = i + 1
    const trimmed = line.trim()

    if (!trimmed.startsWith('/* @arkzen:')) continue
    if (trimmed.includes(':end */'))        continue
    // v7.0: skip web:page:layout: inline declarations (no :end needed)
    if (trimmed.match(/^\/\* @arkzen:web:page:layout:/)) continue
    // v10.1: skip native:page:layout: inline declarations (same pattern as web)
    if (trimmed.match(/^\/\* @arkzen:native:page:layout:/)) continue

    // v7.0: capture full type including web: prefix e.g. "web:page", "web:style", "script"
    const tagMatch = trimmed.match(/^\/\* @arkzen:((?:web|native|desktop):)?([a-zA-Z]+)/)
    if (!tagMatch) continue
    const tagType = tagMatch[1] ? `${tagMatch[1]}${tagMatch[2]}` : tagMatch[2]

    const hasInlineClose = trimmed.endsWith('*/')

    // Code blocks must have */ on same line
    if (CODE_BLOCK_TAGS.includes(tagType) && !hasInlineClose) {
      const fullTag = trimmed.replace('/* ', '').trim()
      errors.push({
        line:    lineNum,
        tag:     fullTag,
        problem: `Missing \`*/\` on opening tag`,
        fix:     `Change to: ${trimmed.trimEnd()} */`,
      })
    }

    // Body separator blocks must have */ on the next line
    if (BODY_SEP_TAGS.includes(tagType) && !hasInlineClose) {
      const nextLine = lines[i + 1]?.trim() ?? ''
      if (nextLine !== '*/') {
        const fullTag = trimmed.replace('/* ', '').trim()
        errors.push({
          line:    lineNum,
          tag:     fullTag,
          problem: `Missing body separator \`*/\` on line ${lineNum + 1}`,
          fix:     `Add \`*/\` on the line immediately after the opening tag`,
        })
      }
    }

    // Every non-YAML block must have a matching :end */
    if (YAML_ONLY_TAGS.includes(tagType)) continue

    const identMatch = trimmed.match(/^\/\* @arkzen:([a-zA-Z][a-zA-Z0-9:_\-{}.]*)/);
    if (!identMatch) continue
    const fullIdent = identMatch[1].replace(/\s*\*\/$/, '').trim()

    const endMarker = `/* @arkzen:${fullIdent}:end */`
    if (!content.includes(endMarker)) {
      errors.push({
        line:    lineNum,
        tag:     `@arkzen:${fullIdent}`,
        problem: `Missing closing tag`,
        fix:     `Add \`/* @arkzen:${fullIdent}:end */\` after the block content`,
      })
    }
  }

  if (errors.length === 0) return

  // Terminal output
  const R = '\x1b[31m', Y = '\x1b[33m', C = '\x1b[36m', B = '\x1b[1m', X = '\x1b[0m', D = '\x1b[2m'

  console.error(`\n${R}${B}╔════════════════════════════════════════════════════╗`)
  console.error(`║         ARKZEN DSL ERROR — ${tatemono.padEnd(23)}║`)
  console.error(`╚════════════════════════════════════════════════════╝${X}`)
  console.error(`${D}  ${filePath}${X}\n`)

  for (const err of errors) {
    console.error(`  ${R}✖${X} ${B}Line ${err.line}${X} — ${C}${err.tag}${X}`)
    console.error(`    ${Y}Problem:${X} ${err.problem}`)
    console.error(`    ${Y}Fix:${X}     ${err.fix}`)
    console.error()
  }

  console.error(`${R}${B}  ${errors.length} DSL error(s). Fix these before the engine runs.${X}\n`)

  // Write error JSON for UI overlay
  try {
    const errorDir = path.resolve(__dirname, '../../public/arkzen-errors')
    fs.mkdirSync(errorDir, { recursive: true })
    fs.writeFileSync(
      path.join(errorDir, `${tatemono}.json`),
      JSON.stringify({ tatemono, filePath, errors, timestamp: Date.now() }, null, 2),
      'utf-8'
    )
  } catch { /* silently skip */ }

  throw new Error(`[Arkzen DSL Error] ${tatemono}: ${errors.length} tag error(s). See terminal for details.`)
}

function validateFileName(filePath: string, meta: ArkzenMeta): void {
  const fileName = path.basename(filePath, '.tsx')
  if (fileName === 'core') return
  if (fileName !== meta.name) {
    throw new Error(
      `[Arkzen Parser] File name "${fileName}" does not match meta.name "${meta.name}".`
    )
  }
}

function validateTableNames(databases: ArkzenDatabase[]): void {
  for (const db of databases) {
    if (!/^[a-z][a-z0-9_]*$/.test(db.table)) {
      throw new Error(
        `[Arkzen Parser] Table name "${db.table}" must be lowercase snake_case`
      )
    }
  }
}

function validateNoDuplicateTables(databases: ArkzenDatabase[]): void {
  const seen = new Set<string>()
  for (const db of databases) {
    if (seen.has(db.table)) {
      throw new Error(`[Arkzen Parser] Duplicate table declared: "${db.table}"`)
    }
    seen.add(db.table)
  }
}

function validateNoDuplicateControllers(apis: ArkzenApi[]): void {
  const seen = new Set<string>()
  for (const api of apis) {
    if (seen.has(api.controller)) {
      throw new Error(`[Arkzen Parser] Duplicate controller declared: "${api.controller}"`)
    }
    seen.add(api.controller)
  }
}

function validatePages(
  pages:         ArkzenPage[],
  errorHandlers: ArkzenErrorHandler[],
  nativePages:   ArkzenPage[]
): void {
  // v10.0: valid if has web pages, native pages, or error handlers
  // A native-only tatemono has zero web pages — that's fine
  if (pages.length === 0 && errorHandlers.length === 0 && nativePages.length === 0) {
    throw new Error('[Arkzen Parser] At least one @arkzen:web:page:name or @arkzen:native:page:name section is required')
  }
  const seen = new Set<string>()
  for (const page of pages) {
    if (seen.has(page.name)) {
      throw new Error(`[Arkzen Parser] Duplicate web page declared: "${page.name}"`)
    }
    seen.add(page.name)
  }
  const nativeSeen = new Set<string>()
  for (const page of nativePages) {
    if (nativeSeen.has(page.name)) {
      throw new Error(`[Arkzen Parser] Duplicate native page declared: "${page.name}"`)
    }
    nativeSeen.add(page.name)
  }
}

// ─────────────────────────────────────────────
// MAIN PARSER
// ─────────────────────────────────────────────

export function parseTatemono(filePath: string): ParsedTatemono {
  console.log(`[Arkzen Parser] Parsing: ${filePath}`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`[Arkzen Parser] File not found: ${filePath}`)
  }

  if (!filePath.endsWith('.tsx')) {
    throw new Error(`[Arkzen Parser] Tatemono files must be .tsx: ${filePath}`)
  }

  const content  = fs.readFileSync(filePath, 'utf-8')
  const fileName = path.basename(filePath, '.tsx')

  const meta         = parseMeta(content)
  const webMeta      = parseWebMeta(content)      // v9.0: @arkzen:meta:web
  const nativeMeta   = parseNativeMeta(content)   // v10.0: @arkzen:meta:native
  const config       = parseConfig(content)
  const nativeConfig = parseNativeConfig(content) // v10.0: @arkzen:native:config
  const databases    = parseAllDatabases(content)
  const customRoutes = parseAllCustomRoutes(content)  // internally calls parseAllHandlerSnippets
  const pages        = parseAllPages(content)
  const layouts      = parseAllLayouts(content)
  const components   = parseAllComponents(content)
  const styles       = parseAllStyles(content)  // ← v6.4: CSS + CSS Modules
  const errorHandlers = parseAllErrorHandlers(content)

  // v6.3: parse endpoint bodies BEFORE apis so we can attach them
  const endpointBodies = parseAllEndpointBodies(content)
  const apisRaw        = parseAllApis(content)
  const apis = apisRaw.map(api => ({
    ...api,
    endpoints: Object.fromEntries(
      Object.entries(api.endpoints).map(([name, endpoint]) => [
        name,
        endpointBodies[name] ? { ...endpoint, body: endpointBodies[name] } : endpoint,
      ])
    ),
  }))

  // v6.3: middleware snippets (name → base64 PHP body)
  const middlewareSnippets = parseAllMiddlewareSnippets(content)

  // v6.0: policy snippets (methodName → base64 PHP body)
  const policySnippets = parseAllPolicySnippets(content)

  // Repeatable sections
  const stores        = parseAllNamedCode(content, 'store')
  const realtimes     = parseAllRealtime(content)
  const events        = parseAllEvents(content)
  const jobs          = parseAllJobs(content)
  const notifications = parseAllNotifications(content)  // ← v6.1: dedicated parser
  const mails         = parseAllMails(content)          // ← v6.1: dedicated parser
  const consoles      = parseAllConsoles(content)

  // v7.0: @arkzen:web:animation — strict, no fallback
  const animation = extractSectionWithPosition(content, 'web:animation') ?? undefined

  // v8.0: @arkzen:web:script (global) + @arkzen:web:script:name (named)
  const script  = parseGlobalScript(content)
  const scripts = parseAllNamedScripts(content)

  // v10.0: native blocks
  const nativeComponents = parseAllNativeComponents(content)
  const nativeLayouts    = parseAllNativeLayouts(content)
  const nativeStyles     = parseAllNativeStyles(content)
  const nativePages      = parseAllNativePages(content)
  const nativeAnimation  = parseGlobalNativeAnimation(content)
  const nativeScript     = parseGlobalNativeScript(content)
  const nativeScripts    = parseAllNamedNativeScripts(content)



  validateDslTags(content, filePath)

  // Clear any existing DSL error file for this tatemono on successful parse
  try {
    const tatemono  = path.basename(path.dirname(filePath))
    const errorFile = path.resolve(__dirname, '../../public/arkzen-errors', `${tatemono}.json`)
    if (fs.existsSync(errorFile)) fs.unlinkSync(errorFile)
  } catch { /* ignore */ }

  validateFileName(filePath, meta)
  validateTableNames(databases)
  validateNoDuplicateTables(databases)
  validateNoDuplicateControllers(apis)
  validatePages(pages, errorHandlers, nativePages)

  const hasBackend =
    databases.length     > 0 ||
    apis.length          > 0 ||
    customRoutes.length  > 0 ||
    stores.length        > 0 ||
    events.length        > 0 ||
    realtimes.length     > 0 ||
    jobs.length          > 0 ||
    notifications.length > 0 ||
    mails.length         > 0 ||
    consoles.length      > 0

  const isStatic = !hasBackend

  const parsed: ParsedTatemono = {
    filePath,
    fileName,
    meta,
    webMeta,       // v9.0
    nativeMeta,    // v10.0
    config,
    nativeConfig,  // v10.0
    databases,
    apis,
    customRoutes,
    pages,
    layouts,
    components,
    styles,
    errorHandlers,
    stores,
    realtimes,
    events,
    jobs,
    notifications,
    mails,
    consoles,
    middlewareSnippets,
    policySnippets,
    animation,
    script,
    scripts,
    // v10.0: native platform blocks
    nativePages,
    nativeLayouts,
    nativeComponents,
    nativeStyles,
    nativeAnimation,
    nativeScript,
    nativeScripts,
  }

  console.log(`[Arkzen Parser] ✓ Parsed: ${meta.name} v${meta.version}`)
  console.log(`[Arkzen Parser]   Auth: ${meta.auth} | Static: ${isStatic}`)
  if (webMeta) {
    const webMetaParts = [
      webMeta.title       && `title`,
      webMeta.favicon     && `favicon`,
      webMeta.label       && `label`,
      webMeta.og          && `og`,
      webMeta.twitter     && `twitter`,
      webMeta.pwa         && `pwa`,
    ].filter(Boolean)
    console.log(`[Arkzen Parser]   Web meta: ${webMetaParts.join(', ') || 'present'}`)
  }
  console.log(`[Arkzen Parser]   Pages (${pages.length}): ${pages.map(p => `${p.name}[${p.layout}]`).join(', ')}`)
  if (errorHandlers.length)  console.log(`[Arkzen Parser]   Error handlers (${errorHandlers.length}): ${errorHandlers.map(e => e.type).join(', ')}`)
  if (databases.length)      console.log(`[Arkzen Parser]   Tables (${databases.length}): ${databases.map(d => d.table).join(', ')}`)
  if (apis.length)           console.log(`[Arkzen Parser]   Resources (${apis.length}): ${apis.map(a => a.model).join(', ')}`)
  if (customRoutes.length)   console.log(`[Arkzen Parser]   Custom routes (${customRoutes.length}): ${customRoutes.map(c => c.controller).join(', ')}`)
  if (events.length)         console.log(`[Arkzen Parser]   Events (${events.length}): ${events.length} block(s)`)
  if (realtimes.length)      console.log(`[Arkzen Parser]   Realtime (${realtimes.length}): ${realtimes.length} block(s)`)
  if (jobs.length)           console.log(`[Arkzen Parser]   Jobs (${jobs.length}): ${jobs.length} block(s)`)
  if (notifications.length)  console.log(`[Arkzen Parser]   Notifications (${notifications.length}): ${notifications.length} block(s)`)
  if (mails.length)          console.log(`[Arkzen Parser]   Mail (${mails.length}): ${mails.length} block(s)`)
  if (consoles.length)       console.log(`[Arkzen Parser]   Console (${consoles.length}): ${consoles.length} block(s)`)
  if (styles.length)         console.log(`[Arkzen Parser]   Styles (${styles.length}): ${styles.filter(s => !s.name).length} global + ${styles.filter(s => s.name).length} module(s)`)
  if (Object.keys(middlewareSnippets).length > 0)
    console.log(`[Arkzen Parser]   Middleware snippets: ${Object.keys(middlewareSnippets).join(', ')}`)
  if (Object.keys(policySnippets).length > 0)
    console.log(`[Arkzen Parser]   Policy snippets: ${Object.keys(policySnippets).join(', ')}`)
  if (script)                console.log(`[Arkzen Parser]   Script: global web`)
  if (scripts.length > 0)   console.log(`[Arkzen Parser]   Scripts (${scripts.length}): named web blocks`)
  if (nativePages.length > 0 || nativeComponents.length > 0 || nativeMeta) {
    console.log(`[Arkzen Parser]   ── Native (Expo) ──`)
    if (nativeMeta)                      console.log(`[Arkzen Parser]   Native meta: ${nativeMeta.expo?.bundle_id ?? 'present'}`)
    if (nativePages.length)              console.log(`[Arkzen Parser]   Native pages (${nativePages.length}): ${nativePages.map(p => `${p.name}[${p.layout}]`).join(', ')}`)
    if (nativeComponents.length)         console.log(`[Arkzen Parser]   Native components (${nativeComponents.length})`)
    if (nativeLayouts.length)            console.log(`[Arkzen Parser]   Native layouts (${nativeLayouts.length})`)
    if (nativeStyles.length)             console.log(`[Arkzen Parser]   Native styles (${nativeStyles.length})`)
    if (nativeAnimation)                 console.log(`[Arkzen Parser]   Native animation: global`)
    if (nativeScript)                    console.log(`[Arkzen Parser]   Native script: global`)
    if (nativeScripts.length)            console.log(`[Arkzen Parser]   Native scripts (${nativeScripts.length}): named blocks`)
  }

  return parsed
}

export function hasSections(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  return {
    // shared
    meta:               content.includes('/* @arkzen:meta'),
    database:           content.includes('/* @arkzen:database'),
    api:                content.includes('/* @arkzen:api'),
    routes:             content.includes('/* @arkzen:routes'),
    store:              content.includes('/* @arkzen:store:'),
    // web
    metaWeb:            content.includes('/* @arkzen:meta:web'),
    config:             content.includes('/* @arkzen:web:config'),
    components:         content.includes('/* @arkzen:web:components:'),
    page:               content.includes('/* @arkzen:web:page:'),
    animation:          content.includes('/* @arkzen:web:animation'),
    script:             content.includes('/* @arkzen:web:script'),
    errorHandler:       content.includes('/* @arkzen:web:error:'),
    // native — v10.0
    metaNative:         content.includes('/* @arkzen:meta:native'),
    nativeConfig:       content.includes('/* @arkzen:native:config'),
    nativeComponents:   content.includes('/* @arkzen:native:components:'),
    nativePage:         content.includes('/* @arkzen:native:page:'),
    nativeAnimation:    content.includes('/* @arkzen:native:animation'),
    nativeScript:       content.includes('/* @arkzen:native:script'),
    nativeLayout:       content.includes('/* @arkzen:native:layout:'),
    nativeStyle:        content.includes('/* @arkzen:native:style:'),
  }
}