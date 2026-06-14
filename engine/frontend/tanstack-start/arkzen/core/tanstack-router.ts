// ============================================================
// ARKZEN ENGINE — TANSTACK START ROUTER v3.0
// arkzen/core/tanstack-router.ts
//
// TanStack Start equivalent of vite-router.ts (full feature parity).
// Reads ParsedTatemono, generates:
//   src/pages/{tatName}/{pageName}.tsx              ← page components
//   src/pages/{tatName}/components/{Name}.tsx       ← per-component (real code)
//   src/pages/{tatName}/components/constants.tsx    ← shared constants
//   src/pages/{tatName}/components/hooks.tsx        ← custom hooks
//   src/pages/{tatName}/components/utils.tsx        ← utility functions
//   src/pages/{tatName}/components/types.ts         ← shared types
//   src/pages/{tatName}/not-found.tsx               ← 404 (if declared)
//   src/pages/{tatName}/error-boundary.tsx          ← 500 (if declared)
//   src/routes/{tatName}/{pageName}.tsx             ← TanStack file-based routes
//   src/arkzen/generated/routeTree.ts               ← assembled route tree
//   src/arkzen/generated/{name}.animations.ts       ← GSAP animations
//
// v3.0 — PER-FILE COMPONENT GENERATION (parity with vite-router.ts v2.0):
//   • generateIndividualComponentFiles() now writes REAL code into each
//     component file (not re-exports from a _components.tsx barrel).
//   • splitComponentDeclarations() splits component blocks into one chunk per name.
//   • extractSharedConstantNames, extractCustomHookNames, extractSharedTypeNames,
//     extractUtilityFunctionNames, findReferencedNames — all ported from vite-router.
//   • generatePageFile() no longer inlines component code — imports each component
//     individually via `import { X } from './components/X'`.
//   • Stale _components.tsx / index.ts barrels are cleaned up automatically.
//
// KEY DIFFERENCE from vite-router.ts:
//   TanStack Start uses FILE-BASED ROUTING — each page gets its own
//   route file in src/routes/{tatName}/{pageName}.tsx that wraps the
//   page component in createFileRoute(). The routeTree.ts then imports
//   and assembles all routes into the router.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage, ArkzenLayout, ArkzenErrorHandler } from '../types'
import { emitTatemonoStyles } from './lib/dsl-style-emitter'
import { copyAssetsToPublic, cleanOldAssets } from './assets'
import { writeSitemap } from './sitemap'
import { getRegistry } from './registry'

const SRC_DIR       = path.resolve(process.cwd(), 'src')
const PUBLIC_DIR    = path.resolve(process.cwd(), 'public')
const PAGES_DIR     = path.join(SRC_DIR, 'pages')
const ROUTES_DIR    = path.join(SRC_DIR, 'routes')
const GENERATED_DIR = path.join(SRC_DIR, 'arkzen', 'generated')
const LAYOUTS_DIR   = path.join(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
const ROUTE_TREE    = path.join(GENERATED_DIR, 'routeTree.ts')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

function toCamelCase(str: string): string {
  const p = toPascalCase(str)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

function toSafeComponentName(name: string): string {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// ─── TanStack-specific normalizations ──────────────────────────────────────────

function normalizeForTanStack(raw: string): string {
  let out = raw
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/navigation['"]\s*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/router['"]\s*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/link['"]\s*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+Link\s+from\s+['"]next\/link['"]\s*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/image['"]\s*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*['"]use client['"]\s*;?[ \t]*\r?\n?/gm, '')
    .replace(/\buseRouter\(\)/g, 'useNavigate()')
    .replace(/\busePathname\(\)/g, 'useLocation().pathname')
    .replace(/(<Link\b[^>]*?)\bhref=/g, '$1to=')
    .replace(/process\.env\.NEXT_PUBLIC_(\w+)/g, 'import.meta.env.VITE_$1')

  const navigateVars = [...out.matchAll(/\bconst\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*useNavigate\(\)/g)]
    .map(m => m[1])

  for (const varName of navigateVars) {
    out = out
      .replace(new RegExp(`\\b${varName}\\.push\\(`, 'g'), `${varName}(`)
      .replace(new RegExp(`\\b${varName}\\.replace\\(`, 'g'), `${varName}(`)
      .replace(new RegExp(`\\b${varName}\\.refresh\\(\\)`, 'g'), `window.location.reload()`)
  }

  return out
}

// ─── Production-grade import resolver ─────────────────────────────────────────

const ENGINE_OWNED_MODULES = new Set(['react', 'framer-motion'])

interface ResolvedImports {
  canonicalBlock: string
  strippedSources: string[]
}

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
      }
      continue
    }

    out.push(line)
  }

  if (inImport && buffer.trim()) {
    out.push(buffer.replace(/\s+/g, ' '))
  }

  return out.join('\n')
}

function resolveImports(
  sources: string[],
  engineRequired: {
    reactHooks?: string[]
    framerNamed?: string[]
    extra?: string
  } = {}
): ResolvedImports {
  const importMap = new Map<string, { defaultImport?: string; named: Set<string> }>()

  const getEntry = (mod: string) => {
    if (!importMap.has(mod)) importMap.set(mod, { named: new Set() })
    return importMap.get(mod)!
  }

  const reactEntry = getEntry('react')
  ;(engineRequired.reactHooks ?? ['useRef', 'useEffect']).forEach(h => reactEntry.named.add(h))

  const framerEntry = getEntry('framer-motion')
  ;(engineRequired.framerNamed ?? ['motion']).forEach(n => framerEntry.named.add(n))

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
        const [, def, namedStr, mod] = m
        const entry = getEntry(mod)
        if (mod !== 'react') entry.defaultImport = def
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      m = line.match(namespaceImportRe)
      if (m) {
        const [, ns, mod] = m
        getEntry(mod).defaultImport = `* as ${ns}`
        continue
      }

      m = line.match(namedImportRe)
      if (m) {
        const [, namedStr, mod] = m
        const entry = getEntry(mod)
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      m = line.match(defaultImportRe)
      if (m) {
        const [, def, mod] = m
        if (mod === 'react') continue
        getEntry(mod).defaultImport = def
        continue
      }

      m = line.match(sideEffectRe)
      if (m) {
        sideEffects.push(`import '${m[1]}'`)
        continue
      }
    }
  }

  const lines: string[] = []

  const reactNamed = [...(importMap.get('react')?.named ?? [])]
    .filter(h => h !== 'React')
    .sort()
  lines.push(
    reactNamed.length > 0
      ? `import React, { ${reactNamed.join(', ')} } from 'react'`
      : `import React from 'react'`
  )

  const framerNamed = [...(importMap.get('framer-motion')?.named ?? [])].sort()
  if (framerNamed.length > 0) {
    lines.push(`import { ${framerNamed.join(', ')} } from 'framer-motion'`)
  }

  const otherModules = [...importMap.keys()]
    .filter(m => m !== 'react' && m !== 'framer-motion')
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

  if (engineRequired.extra) {
    lines.push(engineRequired.extra)
  }

  const canonicalBlock = lines.filter(Boolean).join('\n')

  const stripRaw = (src: string) =>
    src
      .replace(/^\s*['"]use client['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .trim()

  const strippedSources = sources.map(stripRaw)

  return { canonicalBlock, strippedSources }
}

// ─── Template literal stripper ────────────────────────────────────────────────
// Replaces template literal STATIC content char-for-char with whitespace so
// character indices are preserved for splitComponentDeclarations slicing.
// ${...} expression content is kept verbatim so identifiers inside them
// remain visible to findReferencedNames.

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

// ─── Component / declaration name extractors ──────────────────────────────────

function extractComponentNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of tatemono.components) {
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

function extractSharedConstantNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of tatemono.components) {
    const stripped = stripTemplateLiterals(component.raw)
    const matches = stripped.match(/^(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*[=:]/gm) || []
    for (const match of matches) {
      const name = match.match(/const\s+([A-Z][A-Z0-9_]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

function extractCustomHookNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of tatemono.components) {
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

function extractSharedTypeNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of tatemono.components) {
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

function extractUtilityFunctionNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  const componentNames = extractComponentNames(tatemono)
  for (const component of tatemono.components) {
    const stripped = stripTemplateLiterals(component.raw)
    let src = stripped
    for (const compName of componentNames) {
      const esc = compName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      src = src.replace(
        new RegExp(
          `(?:export\\s+)?const\\s+${esc}\\s*=[\\s\\S]*?(?=(?:export\\s+)?(?:const|function|type|interface)\\s+[A-Za-z_$]|$)`,
          'g'
        ),
        ''
      )
    }
    const constMatches = src.match(/(?:export\s+)?const\s+([a-z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of constMatches) {
      const name = match.match(/const\s+([a-z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^use[A-Z]/.test(name)) names.add(name)
    }
    const fnMatches = src.match(/(?:export\s+)?function\s+([a-z][A-Za-z0-9_$]*)\s*[(<]/g) || []
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

function splitComponentDeclarations(rawSource: string, names: Set<string>): Map<string, string> {
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

// ─── Per-file component generation ────────────────────────────────────────────
// Full parity with vite-router.ts v2.0 / next.js router.ts v5.1:
//   • Each component gets its OWN file containing its actual code (not a re-export)
//   • Shared constants → components/constants.tsx
//   • Custom hooks     → components/hooks.tsx
//   • Utility fns      → components/utils.tsx
//   • Shared types     → components/types.ts
//   • Stale _components.tsx / index.ts barrels are cleaned up

function generateIndividualComponentFiles(tatemono: ParsedTatemono, tatDir: string): void {
  const componentsDir = path.join(tatDir, 'components')

  if (tatemono.components.length === 0) {
    if (fs.existsSync(componentsDir)) {
      fs.rmSync(componentsDir, { recursive: true })
      console.log(`[Arkzen TanStack] 🧹 Removed stale components/ (no @arkzen:components)`)
    }
    return
  }

  fs.mkdirSync(componentsDir, { recursive: true })

  // Normalize + resolve imports across ALL component blocks
  const rawSources = tatemono.components.map(c => normalizeForTanStack(c.raw.trim()))

  // Detect router needs across all component sources
  const combinedComponentRaw = rawSources.join('\n')
  const compNeedsNavigate = /\buseNavigate\s*\(/.test(combinedComponentRaw)
  const compNeedsLocation = /\buseLocation\s*\(/.test(combinedComponentRaw)
  const compNeedsLink     = /<Link\b/.test(combinedComponentRaw)
  // useNavigate / useLocation → adapters/router  (same as page-level)
  // Link → adapters/Link  (NOT router — Link is not exported from router.ts)
  const routerAdapterSpecifiers = [
    compNeedsNavigate && 'useNavigate',
    compNeedsLocation && 'useLocation',
  ].filter(Boolean) as string[]
  const routerImportExtra = routerAdapterSpecifiers.length > 0
    ? `import { ${routerAdapterSpecifiers.join(', ')} } from '@/arkzen/core/adapters/router'`
    : undefined
  const compLinkImportExtra = compNeedsLink
    ? `import { Link } from '@/arkzen/core/adapters/Link'`
    : undefined

  const extraImports = [routerImportExtra, compLinkImportExtra].filter(Boolean) as string[]
  const sourcesWithRouter = extraImports.length > 0
    ? [...extraImports, ...rawSources]
    : rawSources

  const { canonicalBlock, strippedSources: allStripped } = resolveImports(sourcesWithRouter)
  const strippedSources = allStripped.slice(extraImports.length)

  // CSS-module map
  const stylesByComponent = new Map<string, string>()
  for (const style of tatemono.styles.filter((s): s is typeof s & { name: string } => !!s.name)) {
    stylesByComponent.set(style.name, style.name)
  }

  const extractedComponents = extractComponentNames(tatemono)
  const sharedConstants     = extractSharedConstantNames(tatemono)
  const customHooks         = extractCustomHookNames(tatemono)
  const sharedTypes         = extractSharedTypeNames(tatemono)
  const utilityFunctions    = extractUtilityFunctionNames(tatemono)
  const allDeclaredNames    = new Set([...extractedComponents, ...sharedConstants, ...customHooks, ...sharedTypes, ...utilityFunctions])

  // Split each stripped source into per-declaration chunks
  const declarationsByName = new Map<string, string>()
  for (const stripped of strippedSources) {
    for (const [name, code] of splitComponentDeclarations(stripped, allDeclaredNames)) {
      declarationsByName.set(name, code)
    }
  }

  // ── Shared constants file ──────────────────────────────────────────────────
  if (sharedConstants.size > 0) {
    const constChunks = [...sharedConstants]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const)(\\s+${esc}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })
    if (constChunks.length > 0) {
      const content = `// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — ${tatemono.meta.name} [TanStack]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${constChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'constants.tsx'), content, 'utf-8')
      console.log(`[Arkzen TanStack] ✓ Shared constants: constants.tsx`)
    }
  } else {
    for (const stale of ['constants.tsx', 'constants.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen TanStack] 🧹 Removed stale ${stale}`) }
    }
  }

  // ── Custom hooks file ──────────────────────────────────────────────────────
  if (customHooks.size > 0) {
    const hookChunks = [...customHooks]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const|function)(\\s+${esc}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })
    if (hookChunks.length > 0) {
      const content = `// ============================================================
// ARKZEN GENERATED HOOKS — ${tatemono.meta.name} [TanStack]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${hookChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'hooks.tsx'), content, 'utf-8')
      console.log(`[Arkzen TanStack] ✓ Custom hooks: hooks.tsx (${[...customHooks].join(', ')})`)
    }
  } else {
    for (const stale of ['hooks.tsx', 'hooks.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen TanStack] 🧹 Removed stale ${stale}`) }
    }
  }

  // ── Utility functions file ─────────────────────────────────────────────────
  if (utilityFunctions.size > 0) {
    const utilChunks = [...utilityFunctions]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const|function)(\\s+${esc}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })
    if (utilChunks.length > 0) {
      const content = `// ============================================================
// ARKZEN GENERATED UTILITIES — ${tatemono.meta.name} [TanStack]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${utilChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'utils.tsx'), content, 'utf-8')
      console.log(`[Arkzen TanStack] ✓ Utility functions: utils.tsx (${[...utilityFunctions].join(', ')})`)
    }
  } else {
    for (const stale of ['utils.tsx', 'utils.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen TanStack] 🧹 Removed stale ${stale}`) }
    }
  }

  // ── Shared types file ──────────────────────────────────────────────────────
  if (sharedTypes.size > 0) {
    const typeChunks = [...sharedTypes]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(type|interface)(\\s+${esc}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })
    if (typeChunks.length > 0) {
      const content = `// ============================================================
// ARKZEN GENERATED TYPES — ${tatemono.meta.name} [TanStack]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${typeChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'types.ts'), content, 'utf-8')
      console.log(`[Arkzen TanStack] ✓ Shared types: types.ts (${[...sharedTypes].join(', ')})`)
    }
  } else {
    const p = path.join(componentsDir, 'types.ts')
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen TanStack] 🧹 Removed stale types.ts`) }
  }

  // ── One real file per component containing its actual code ─────────────────
  for (const compName of extractedComponents) {
    const declaration = declarationsByName.get(compName)
    if (!declaration) {
      console.log(`[Arkzen TanStack] ⚠ Could not isolate declaration for ${compName}, skipping file`)
      continue
    }

    const fileName = `${compName}.tsx`
    const filePath = path.join(componentsDir, fileName)

    const cssImport = stylesByComponent.has(compName)
      ? `import styles from '../styles/${compName}.module.css'\n`
      : ''

    const escapedName = compName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const exportedDeclaration = declaration.replace(
      new RegExp(`^(\\s*)(export\\s+)?(const|function)(\\s+${escapedName}\\b)`, 'm'),
      (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
    )

    const referencedConstants = findReferencedNames(declaration, sharedConstants)
    const constantsImport = referencedConstants.length > 0
      ? `import { ${referencedConstants.sort().join(', ')} } from './constants'\n`
      : ''

    const referencedHooks = findReferencedNames(declaration, customHooks)
    const hooksImport = referencedHooks.length > 0
      ? `import { ${referencedHooks.sort().join(', ')} } from './hooks'\n`
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
// ARKZEN GENERATED COMPONENT — ${compName} [TanStack]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}
${cssImport}${constantsImport}${hooksImport}${utilsImport}${typesImport}${siblingImportBlock}
${exportedDeclaration}
`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen TanStack] ✓ Component: ${fileName}`)
  }

  // ── Clean up stale files ───────────────────────────────────────────────────
  // Remove old _components.tsx / index.ts barrels and any component files
  // for components that no longer exist.
  try {
    const files = fs.readdirSync(componentsDir)
    for (const file of files) {
      const base = file.replace(/\.(tsx|ts)$/, '')
      if (file === '_components.tsx' || file === 'index.ts') {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen TanStack] 🧹 Removed stale ${file}`)
        continue
      }
      if (['hooks.ts','hooks.tsx','types.ts','constants.ts','constants.tsx','utils.ts','utils.tsx'].includes(file)) continue
      if (file.endsWith('.tsx') && !extractedComponents.has(base)) {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen TanStack] 🧹 Removed stale component: ${file}`)
      }
    }
  } catch (e) {
    // ignore
  }
}

// ─── Page file generator ──────────────────────────────────────────────────────
// v3.0: page sources ONLY — component code is never inlined.
// Imports each component individually via `import { X } from './components/X'`.

function extractComponentName(pageName: string, raw: string): string {
  const match = raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  if (match) return match[1]
  return toSafeComponentName(pageName) + 'Page'
}

// ─── Layout helpers v11.0 ─────────────────────────────────────────────────────

function parsePageLayoutDecl(raw: string): { guard?: 'auth' | 'guest'; layout?: string } {
  const t = raw.trim()
  const m = t.match(/^\+?(auth|guest)(?::([a-zA-Z0-9_-]+))?$/)
  if (m) return { guard: m[1] as 'auth' | 'guest', layout: m[2] ?? undefined }
  if (t === 'auth')  return { guard: 'auth' }
  if (t === 'guest') return { guard: 'guest' }
  return { layout: t || undefined }
}

function resolveLayoutChain(layoutName: string, allLayouts: ArkzenLayout[]): string[] {
  const chain: string[] = []
  const visited = new Set<string>()
  let current: string | undefined = layoutName
  while (current) {
    if (visited.has(current)) throw new Error(`[Arkzen TanStack] Layout chain cycle at: "${current}"`)
    visited.add(current)
    chain.unshift(current)
    current = allLayouts.find(l => l.name === current)?.parent
  }
  return chain
}

function getLayoutImport(layout: string, tatName: string): string {
  switch (layout) {
    case 'guest': return `import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'`
    case 'auth':  return `import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'`
    default:
      return `import { ${toPascalCase(layout)}Layout } from '@/arkzen/core/layouts/custom/${tatName}-${layout}'`
  }
}

function getLayoutComponent(layout: string): string {
  switch (layout) {
    case 'guest': return 'GuestLayout'
    case 'auth':  return 'AuthLayout'
    default:      return `${toPascalCase(layout)}Layout`
  }
}

function buildLayoutJSX(
  page: ArkzenPage,
  tatemono: ParsedTatemono
): { imports: string[]; openTags: string; closeTags: string } {
  const decl    = parsePageLayoutDecl(page.layout)
  const imports: string[] = []
  const opens:   string[] = []
  const closes:  string[] = []
  const tatName  = tatemono.meta.name

  if (decl.layout) {
    for (const name of resolveLayoutChain(decl.layout, tatemono.layouts)) {
      imports.push(getLayoutImport(name, tatName))
      const comp = getLayoutComponent(name)
      opens.push(`<${comp}>`)
      closes.unshift(`</${comp}>`)
    }
  }
  if (decl.guard) {
    const isGuestOnly = decl.guard === 'guest' && tatemono.meta.auth &&
      ['login', 'register', 'forgot-password', 'reset-password'].includes(page.name)
    imports.push(getLayoutImport(decl.guard, tatName))
    const comp  = getLayoutComponent(decl.guard)
    const props = decl.guard === 'auth' ? ' requireAuth={true}' : isGuestOnly ? ' guestOnly={true}' : ''
    opens.push(`<${comp}${props}>`)
    closes.unshift(`</${comp}>`)
  }
  return { imports, openTags: opens.join('\n    '), closeTags: closes.join('\n    ') }
}

function generatePageFile(
  tatemono: ParsedTatemono,
  page: ArkzenPage,
  animationFnName: string | null,
  hasGlobalStyle: boolean = false,
): string {
  const componentName = extractComponentName(page.name, page.raw)
  const decl          = parsePageLayoutDecl(page.layout)
  const isAuthLayout  = decl.guard === 'auth'
  const isGuestLayout = decl.guard === 'guest'
  const { imports: layoutImports, openTags: layoutOpen, closeTags: layoutClose } = buildLayoutJSX(page, tatemono)

  // Page sources ONLY — no component blocks merged in
  const allSources = [normalizeForTanStack(page.raw.trim())]

  // Scrape framer-motion names from BOTH component and page sources
  const framerNeeded = new Set(['motion'])
  const framerRe = /import\s+\{([^}]*)\}\s+from\s+['"]framer-motion['"]/g
  const framerSources = [...tatemono.components.map(c => c.raw.trim()), ...allSources]
  for (const src of framerSources) {
    let m: RegExpMatchArray | null
    while ((m = framerRe.exec(src)) !== null) {
      m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => framerNeeded.add(n))
    }
  }

  // Detect React hooks actually used in the page's own source
  const KNOWN_REACT_HOOKS = [
    'useState', 'useCallback', 'useMemo', 'useContext', 'useReducer',
    'useLayoutEffect', 'useImperativeHandle', 'useTransition', 'useDeferredValue',
    'useId', 'useSyncExternalStore', 'useInsertionEffect',
  ]
  const pageStrippedForHooks = stripTemplateLiterals(normalizeForTanStack(page.raw))
  const usedReactHooks = KNOWN_REACT_HOOKS.filter(hook =>
    new RegExp(`[^\\w$]${hook}\\s*[(<]`).test(pageStrippedForHooks)
  )

  // Detect TanStack adapter imports needed from page source
  const needsNavigate = /\buseNavigate\s*\(/.test(pageStrippedForHooks)
  const needsLocation = /\buseLocation\s*\(/.test(pageStrippedForHooks)
  const needsLink     = /<Link\b/.test(pageStrippedForHooks)
  const tanstackAdapterSpecifiers = [
    needsNavigate && 'useNavigate',
    needsLocation && 'useLocation',
  ].filter(Boolean).join(', ')
  const tanstackAdapterImportLine = tanstackAdapterSpecifiers
    ? `import { ${tanstackAdapterSpecifiers} } from '@/arkzen/core/adapters/router'`
    : ''
  const linkImportLine = needsLink
    ? `import { Link } from '@/arkzen/core/adapters/Link'`
    : ''

  const animImportLine = animationFnName
    ? `import { ${animationFnName}, pageVariants } from '@/arkzen/generated/${tatemono.meta.name}.animations'`
    : ''

  const styleImport = hasGlobalStyle ? `import './styles/global.css'` : ''

  // Per-component imports — one import line per component file
  const componentNames = extractComponentNames(tatemono)
  const componentImportLines = [...componentNames]
    .sort()
    .map(name => `import { ${name} } from './components/${name}'`)
    .join('\n')

  // Forward non-react/framer-motion imports from component blocks that the page references
  const forwardedImportLines = (() => {
    const seen = new Set<string>()
    const lines: string[] = []
    for (const component of tatemono.components) {
      const flattened = flattenMultilineImports(component.raw.trim())
      for (const rawLine of flattened.split('\n')) {
        const line = rawLine.trim()
        if (!line.startsWith('import ')) continue
        if (/from\s+['\"](react|framer-motion)['\"]/.test(line)) continue

        const idents: string[] = []
        let m = line.match(/^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*,\s*\{([^}]*)\}\s+from/)
        if (m) {
          idents.push(m[1], ...m[2].split(',').map(s => s.trim()).filter(Boolean))
        } else if ((m = line.match(/^import\s+\{([^}]*)\}\s+from/))) {
          idents.push(...m[1].split(',').map(s => s.trim()).filter(Boolean))
        } else if ((m = line.match(/^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from/))) {
          idents.push(m[1])
        } else if ((m = line.match(/^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from/))) {
          idents.push(m[1])
        } else {
          continue
        }

        const referenced = idents.some(ident =>
          new RegExp(`[^\\w$]${ident.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(' ' + pageStrippedForHooks)
        )
        if (referenced && !seen.has(line)) {
          seen.add(line)
          lines.push(line)
        }
      }
    }
    return lines.join('\n')
  })()

  // Smart imports for shared constants / hooks / utils / types
  const sharedConstants    = extractSharedConstantNames(tatemono)
  const referencedConstants = findReferencedNames(stripTemplateLiterals(normalizeForTanStack(page.raw)), sharedConstants)
  const constantsImportLine = referencedConstants.length > 0
    ? `import { ${referencedConstants.sort().join(', ')} } from './components/constants'`
    : ''

  const customHooks       = extractCustomHookNames(tatemono)
  const referencedHooks   = findReferencedNames(pageStrippedForHooks, customHooks)
  const hooksImportLine   = referencedHooks.length > 0
    ? `import { ${referencedHooks.sort().join(', ')} } from './components/hooks'`
    : ''

  const utilityFunctions  = extractUtilityFunctionNames(tatemono)
  const referencedUtils   = findReferencedNames(pageStrippedForHooks, utilityFunctions)
  const utilsImportLine   = referencedUtils.length > 0
    ? `import { ${referencedUtils.sort().join(', ')} } from './components/utils'`
    : ''

  const sharedTypes       = extractSharedTypeNames(tatemono)
  const referencedTypes   = findReferencedNames(stripTemplateLiterals(normalizeForTanStack(page.raw)), sharedTypes)
  const typesImportLine   = referencedTypes.length > 0
    ? `import type { ${referencedTypes.sort().join(', ')} } from './components/types'`
    : ''

  const extraLines = [
    ...layoutImports,
    animImportLine,
    tanstackAdapterImportLine,
    linkImportLine,
    styleImport,
    componentImportLines,
    constantsImportLine,
    hooksImportLine,
    utilsImportLine,
    typesImportLine,
    forwardedImportLines,
  ].filter(Boolean).join('\n')

  const { canonicalBlock: rawCanonicalBlock, strippedSources } = resolveImports(allSources, {
    reactHooks:  ['useRef', 'useEffect', ...usedReactHooks],
    framerNamed: [...framerNeeded],
    extra:       extraLines,
  })

  const canonicalBlock = rawCanonicalBlock.replace(
    /from\s+['"]\.\/([\w-]+\.scripts|[\w-]+\.[\w-]+\.script)['"]/g,
    `from '@/arkzen/generated/$1'`
  )

  const strippedPageCode = (strippedSources[0] ?? '')
    .replace(
      /useEffect\(\(\)\s*=>\s*\{\s*\n?\s*return\s*\(\)\s*=>\s*\{\s*isMounted\.current\s*=\s*false\s*\}\s*\n?\s*\},\s*\[\]\)/g,
      `useEffect(() => {\n    isMounted.current = true\n    return () => { isMounted.current = false }\n  }, [])`
    )
    .trim()

  return `// ============================================================
// ARKZEN GENERATED PAGE — ${tatemono.meta.name}/${page.name} [TanStack]
// Layout: ${page.layout} | Auth guard: ${isAuthLayout} | Guest: ${isGuestLayout}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

// Page component code (from @arkzen:page:${page.name})
${strippedPageCode}

// Wrapper for animation + layout
const ArkzenPage_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)} = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    ${animationFnName ? `const cleanup = ${animationFnName}(pageRef)\n    return cleanup` : '// No animations'}
  }, [])

  return (
    ${layoutOpen}
      <motion.div
        ref={pageRef}
        variants={${animationFnName ? 'pageVariants' : '{}'}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <${componentName} />
      </motion.div>
    ${layoutClose}
  )
}

export default ArkzenPage_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)}
`
}

// ─── TanStack route file generator ────────────────────────────────────────────

function routePathForPage(tatName: string, page: ArkzenPage): string {
  if (page.name === 'index' || page.name === '__root_redirect') return `/${tatName}`
  if (page.name === 'not-found') return `/${tatName}/$`
  return `/${tatName}/${page.name}`
}

function generateTanStackRouteFile(
  tatName: string,
  page: ArkzenPage,
  errorBoundaryClass?: string,
): string {
  if (!page.name) {
    throw new Error(`[TanStack] Page missing name in ${tatName}`)
  }

  const routePath = routePathForPage(tatName, page)
  const importPath = `@/pages/${tatName}/${page.name}`

  if (!routePath) {
    throw new Error(`[TanStack] Cannot generate route path for ${tatName}/${page.name}`)
  }

  const errorComponentBlock = errorBoundaryClass
    ? `  errorComponent: lazyRouteComponent(() =>\n    import('@/pages/${tatName}/error-boundary').then(m => ({ default: m.${errorBoundaryClass} }))\n  ),\n`
    : ''

  return `// ============================================================
// ARKZEN GENERATED — TanStack Route: ${routePath}
// Auto-generated by Arkzen engine (tanstack-router.ts)
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('${routePath}')({
  component: lazyRouteComponent(() =>
    import('${importPath}').then(m => ({ default: m.default }))
  ),
${errorComponentBlock}})
`
}

// ─── Error pages ──────────────────────────────────────────────────────────────

function generateErrorPages(
  tatemono: ParsedTatemono,
  tatDir: string,
): { has404: boolean; has500: boolean } {
  let has404 = false
  let has500 = false

  for (const handler of tatemono.errorHandlers) {
    const { strippedSources } = resolveImports(
      [normalizeForTanStack(handler.raw)],
      { reactHooks: [], framerNamed: [] }
    )
    const cleanRaw = strippedSources[0].trim()

    if (handler.type === '404') {
      has404 = true

      const content = `// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/not-found [TanStack]
// Rendered by the wildcard route /${tatemono.meta.name}/* for any
// unmatched sub-path under this tatemono prefix.
// DO NOT EDIT — edit @arkzen:error:404 in tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import React from 'react'
import { ErrorScreen } from './components/ErrorScreen'

${cleanRaw}

export default NotFoundPage
`
      fs.writeFileSync(path.join(tatDir, 'not-found.tsx'), content, 'utf-8')
      console.log(`[Arkzen TanStack] ✓ Not-found page: /${tatemono.meta.name}/* → not-found.tsx`)
    }

    if (handler.type === '500') {
      has500 = true
      const boundaryClassName = `ArkzenErrorBoundary_${toPascalCase(tatemono.meta.name)}`

      const content = `// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/error-boundary [TanStack]
// Class-based React ErrorBoundary wrapping all routes for this tatemono.
// DO NOT EDIT — edit @arkzen:error:500 in tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import React, { Component, ReactNode } from 'react'
import { ErrorScreen } from './components/ErrorScreen'

${cleanRaw}

interface ArkzenErrorBoundaryState { hasError: boolean }

export class ${boundaryClassName} extends Component<
  { children: ReactNode },
  ArkzenErrorBoundaryState
> {
  state: ArkzenErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ArkzenErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[Arkzen] ${tatemono.meta.name} error boundary caught:', error, info)
  }

  reset = (): void => {
    this.setState({ hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ServerErrorPage reset={this.reset} />
    }
    return this.props.children
  }
}
`
      fs.writeFileSync(path.join(tatDir, 'error-boundary.tsx'), content, 'utf-8')
      console.log(`[Arkzen TanStack] ✓ Error boundary: ${tatemono.meta.name}/error-boundary.tsx`)
    }
  }

  return { has404, has500 }
}

// ─── GENERATE GLOBAL SCRIPT FILE — v6.5 ──────────────────────────────────────

function generateScriptFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.script) return null

  const { strippedSources } = resolveImports([tatemono.script.raw], {
    reactHooks:  [],
    framerNamed: [],
  })

  const cleanScript = strippedSources[0]
    .replace(/\*\/\s*$/, '')
    .trim()

  return `// ============================================================
// ARKZEN GENERATED SCRIPT — ${tatemono.meta.name}
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${cleanScript}
`
}

// ─── GENERATE NAMED SCRIPT FILES — v6.5 ──────────────────────────────────────

function generateNamedScriptFiles(tatemono: ParsedTatemono, generatedDir: string): void {
  for (const section of tatemono.scripts) {
    const fileContent = fs.readFileSync(tatemono.filePath, 'utf-8')
    const openPattern = `/* @arkzen:script:`
    let searchFrom = 0
    let scriptName: string | null = null

    while (true) {
      const openIdx = fileContent.indexOf(openPattern, searchFrom)
      if (openIdx === -1) break
      if (openIdx === section.start) {
        const afterOpen = fileContent.slice(openIdx + openPattern.length)
        const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
        if (identMatch && identMatch[1] !== 'end') {
          scriptName = identMatch[1]
        }
        break
      }
      searchFrom = openIdx + openPattern.length
    }

    if (!scriptName) continue

    const { strippedSources } = resolveImports([section.raw], {
      reactHooks:  [],
      framerNamed: [],
    })

    const cleanScript = strippedSources[0]
      .replace(/\*\/\s*$/, '')
      .trim()

    const fileName = `${tatemono.meta.name}.${scriptName}.script.ts`
    const filePath = path.join(generatedDir, fileName)
    const fileOut  = `// ============================================================
// ARKZEN GENERATED SCRIPT — ${tatemono.meta.name}/${scriptName}
// Source: @arkzen:script:${scriptName}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${cleanScript}
`
    fs.writeFileSync(filePath, fileOut, 'utf-8')
    console.log(`[Arkzen TanStack] ✓ Named script: ${fileName}`)
  }
}

// ─── CLEANUP SCRIPT FILES ──────────────────────────────────────────────────────

function cleanScriptFiles(generatedDir: string, tatName: string): void {
  const scriptPath = path.join(generatedDir, `${tatName}.scripts.ts`)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath)
    console.log(`[Arkzen TanStack] ✓ Global script file removed`)
  }
  try {
    const files = fs.readdirSync(generatedDir)
    for (const file of files) {
      if (file.startsWith(`${tatName}.`) && file.endsWith('.script.ts')) {
        fs.unlinkSync(path.join(generatedDir, file))
        console.log(`[Arkzen TanStack] ✓ Named script removed: ${file}`)
      }
    }
  } catch { /* ignore */ }
}

// ─── Custom layouts ────────────────────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (tatemono.layouts.length === 0) return
  ensureDir(LAYOUTS_DIR)

  for (const layout of tatemono.layouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(LAYOUTS_DIR, fileName)

    const normalizedRaw = normalizeForTanStack(layout.raw.trim())

    const { canonicalBlock, strippedSources } = resolveImports(
      [normalizedRaw],
      { reactHooks: [], framerNamed: [] }
    )

    const needsNavigate = /\buseNavigate\s*\(/.test(normalizedRaw)
    const needsLocation = /\buseLocation\s*\(/.test(normalizedRaw)
    const adapterSpecifiers = [
      needsNavigate && 'useNavigate',
      needsLocation && 'useLocation',
    ].filter(Boolean).join(', ')
    const adapterImport = adapterSpecifiers
      ? `import { ${adapterSpecifiers} } from '../../adapters/router'`
      : ''

    const content = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [TanStack]\n\n${canonicalBlock}${adapterImport ? '\n' + adapterImport : ''}\n\n${strippedSources[0]}\n`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen TanStack] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Root redirect ─────────────────────────────────────────────────────────────

function generateRootRedirectPage(tatemono: ParsedTatemono): { fileName: string; routePath: string } | null {
  const hasIndex = tatemono.pages.some(p => p.name === 'index')
  if (hasIndex) return null

  const firstGuest = tatemono.pages.find(p => p.layout === 'guest')
  const firstAuth  = tatemono.pages.find(p => p.layout === 'auth')
  const firstPage  = tatemono.pages[0]

  const target = tatemono.meta.auth
    ? (firstGuest ?? firstAuth ?? firstPage)
    : (firstGuest ?? firstAuth ?? firstPage)

  if (!target) return null

  const tatName     = tatemono.meta.name
  const destination = `/${tatName}/${target.name}`
  const fileName    = '__root_redirect'

  const routeContent = `// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — ${tatName} [TanStack]
// Visiting /${tatName} redirects to ${destination}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/${tatName}')({
  beforeLoad: () => {
    throw redirect({ to: '${destination}', replace: true })
  },
})
`

  const routeDir = path.join(ROUTES_DIR, tatName)
  ensureDir(routeDir)
  fs.writeFileSync(path.join(routeDir, `${fileName}.tsx`), routeContent, 'utf-8')
  console.log(`[Arkzen TanStack] ✓ Root redirect: /${tatName} → ${destination}`)

  return { fileName, routePath: `/${tatName}` }
}

// ─── Route tree writer ─────────────────────────────────────────────────────────

interface RouteEntry {
  tatName:  string
  page:     ArkzenPage
  routeVar: string
  filePath: string
}

interface RouteTree {
  routes: RouteEntry[]
  authTatemonos: string[]
}

function readExistingRouteTree(): RouteTree {
  if (!fs.existsSync(ROUTE_TREE)) {
    return { routes: [], authTatemonos: [] }
  }

  const content = fs.readFileSync(ROUTE_TREE, 'utf-8')

  const authMatch = content.match(/export const AUTH_TATEMONOS.*?\[([^\]]*)\]/)
  const authTatemonos = authMatch
    ? authMatch[1]
        .split('\n')
        .map(line => line.trim().replace(/[",]/g, ''))
        .filter(Boolean)
    : []

  const routes: RouteEntry[] = []

  if (fs.existsSync(ROUTES_DIR)) {
    const tatDirs = fs.readdirSync(ROUTES_DIR)
    for (const tatName of tatDirs) {
      const tatRoutesDir = path.join(ROUTES_DIR, tatName)
      const stat = fs.statSync(tatRoutesDir)
      if (!stat.isDirectory()) continue

      const files = fs.readdirSync(tatRoutesDir)
      for (const file of files) {
        if (file.endsWith('.tsx')) {
          const pageName = file.replace('.tsx', '')
          routes.push({
            tatName,
            page: { name: pageName, layout: 'none', raw: '' } as ArkzenPage,
            routeVar: `Route_${toPascalCase(tatName)}_${toPascalCase(pageName)}`,
            filePath: `${tatName}/${pageName}`,
          })
        }
      }
    }
  }

  return { routes, authTatemonos }
}

function writeRouteTree(entries: RouteEntry[], authTatemonos: string[]): void {
  if (!fs.existsSync(ROUTE_TREE)) {
    console.error(`[Arkzen TanStack] ✗ Route tree file not found: ${ROUTE_TREE}`)
    throw new Error(`Route tree file not found: ${ROUTE_TREE}`)
  }

  let content = fs.readFileSync(ROUTE_TREE, 'utf-8')

  const importLines = entries.map(e => {
    if (!e.tatName || !e.routeVar || !e.page?.name) {
      throw new Error(`Invalid route entry: tatName=${e.tatName}, routeVar=${e.routeVar}, page.name=${e.page?.name}`)
    }
    return `import { Route as ${e.routeVar} } from '../../routes/${e.tatName}/${e.page.name}'`
  }).join('\n')

  const childrenLines = entries.map(e => `  ${e.routeVar},`).join('\n')
  const authList = authTatemonos.map(t => `  "${t}",`).join('\n')

  content = content
    .replace(
      /\/\/ TANSTACK_ROUTE_IMPORTS_START[\s\S]*?\/\/ TANSTACK_ROUTE_IMPORTS_END/,
      `// TANSTACK_ROUTE_IMPORTS_START\n${importLines}\n// TANSTACK_ROUTE_IMPORTS_END`,
    )
    .replace(
      /\/\/ TANSTACK_ROUTE_CHILDREN_START[\s\S]*?\/\/ TANSTACK_ROUTE_CHILDREN_END/,
      `// TANSTACK_ROUTE_CHILDREN_START\n${childrenLines}\n  // TANSTACK_ROUTE_CHILDREN_END`,
    )
    .replace(
      /\/\/ TANSTACK_AUTH_TATEMONOS_START[\s\S]*?\/\/ TANSTACK_AUTH_TATEMONOS_END/,
      `// TANSTACK_AUTH_TATEMONOS_START\nexport const AUTH_TATEMONOS: string[] = [\n${authList}\n]\n// TANSTACK_AUTH_TATEMONOS_END`,
    )

  fs.writeFileSync(ROUTE_TREE, content, 'utf-8')
}

// ─── Animation file generator ──────────────────────────────────────────────────

function generateAnimationFile(tatName: string, tatemono: ParsedTatemono): void {
  const fnName = `${toCamelCase(tatName)}Animations`
  const raw    = tatemono.animations ?? ''

  const stripped = raw
    .replace(/export\s+const\s+\w+\s*=/, '')
    .replace(/export\s+function\s+\w+/, 'function _inner')
    .trim()

  const content = `// ARKZEN GENERATED — ${tatName} animations\nimport { gsap } from 'gsap'\nimport { ScrollTrigger } from 'gsap/ScrollTrigger'\n\nexport const ${fnName} = ${stripped || '() => {}'}\n`
  const outPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  fs.writeFileSync(outPath, content, 'utf-8')
}

// ─── Main: register tatemono pages ────────────────────────────────────────────

export function registerTanStackPages(tatemono: ParsedTatemono): RouteEntry[] {
  const tatName = tatemono.meta.name
  const tatDir  = path.join(PAGES_DIR, tatName)
  ensureDir(tatDir)

  console.log(`[Arkzen TanStack] Registering ${tatemono.pages.length} page(s) for: ${tatName}`)

  // Per-file component generation (v3.0 — real code, not re-exports)
  generateIndividualComponentFiles(tatemono, tatDir)
  generateCustomLayouts(tatemono)

  const { has404, has500 } = generateErrorPages(tatemono, tatDir)
  const styleInfo = emitTatemonoStyles(tatemono, tatDir, { loggerLabel: 'Arkzen TanStack Router' })

  // Animation file
  const animFnName = tatemono.animation ? toCamelCase(tatName) + 'Animations' : null
  if (tatemono.animation && animFnName) {
    ensureDir(GENERATED_DIR)
    const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)

    const { strippedSources } = resolveImports([tatemono.animation.raw], {
      reactHooks:  [],
      framerNamed: [],
    })
    let clean = strippedSources[0]
      .replace(/gsap\.registerPlugin\(.*\)\s*;?\n?/g, '')
      .replace(new RegExp(`\\bexport\\s+const\\s+${animFnName}\\b`), `const ${animFnName}`)
      .replace(`const ${animFnName}`, `export const ${animFnName}`)
      .replace(/\*\/\s*$/, '')
      .trim()

    const hasPageVariants = /export\s+const\s+pageVariants\b/.test(clean)
    const pageVariantsBlock = hasPageVariants ? '' : `
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}`

    const animContent = `// ============================================================
// ARKZEN GENERATED ANIMATIONS — ${tatName} [TanStack]
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

${clean}${pageVariantsBlock}
`
    fs.writeFileSync(animPath, animContent, 'utf-8')
    console.log(`[Arkzen TanStack] ✓ Animation file generated`)
  }

  // v6.5: Global script file
  if (tatemono.script) {
    ensureDir(GENERATED_DIR)
    const scriptContent = generateScriptFile(tatemono)
    if (scriptContent) {
      fs.writeFileSync(path.join(GENERATED_DIR, `${tatName}.scripts.ts`), scriptContent, 'utf-8')
      console.log(`[Arkzen TanStack] ✓ Global script file generated`)
    }
  }

  // v6.5: Named script files
  if (tatemono.scripts && tatemono.scripts.length > 0) {
    ensureDir(GENERATED_DIR)
    generateNamedScriptFiles(tatemono, GENERATED_DIR)
  }

  const routeEntries: RouteEntry[] = []

  const errorBoundaryClass = has500
    ? `ArkzenErrorBoundary_${toPascalCase(tatName)}`
    : undefined

  for (const page of tatemono.pages) {
    const pageContent = generatePageFile(tatemono, page, animFnName, styleInfo.hasGlobalStyle)
    const pagePath    = path.join(tatDir, `${page.name}.tsx`)
    fs.writeFileSync(pagePath, pageContent, 'utf-8')

    const routeFile = path.join(ROUTES_DIR, tatName, `${page.name}.tsx`)
    ensureDir(path.dirname(routeFile))
    fs.writeFileSync(routeFile, generateTanStackRouteFile(tatName, page, errorBoundaryClass), 'utf-8')

    const routeVar = `Route_${toPascalCase(tatName)}_${toPascalCase(page.name)}`
    routeEntries.push({
      tatName,
      page,
      routeVar,
      filePath: `${tatName}/${page.name}`,
    })

    const routePath = page.name === 'index' ? `/${tatName}` : `/${tatName}/${page.name}`
    console.log(`[Arkzen TanStack] ✓ ${routePath} [tanstack]`)
  }

  if (has404) {
    const wildcardRouteFile = path.join(ROUTES_DIR, tatName, '$.tsx')
    ensureDir(path.dirname(wildcardRouteFile))
    const wildcardPage = { name: 'not-found', layout: 'none', raw: '' } as ArkzenPage
    fs.writeFileSync(wildcardRouteFile, generateTanStackRouteFile(tatName, wildcardPage, errorBoundaryClass), 'utf-8')
    routeEntries.push({
      tatName,
      page: wildcardPage,
      routeVar: `Route_${toPascalCase(tatName)}_NotFound`,
      filePath: `${tatName}/not-found`,
    })
    console.log(`[Arkzen TanStack] ✓ Wildcard 404 route: /${tatName}/* → $.tsx`)
  }

  const rootRedirect = generateRootRedirectPage(tatemono)
  if (rootRedirect) {
    routeEntries.push({
      tatName,
      page: { name: rootRedirect.fileName, layout: 'none', raw: '' } as ArkzenPage,
      routeVar: `Route_${toPascalCase(tatName)}_RootRedirect`,
      filePath: `${tatName}/${rootRedirect.fileName}`,
    })
  }

  try {
    const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
    const assetsPath   = path.join(tatemonosDir, tatName, 'assets')
    cleanOldAssets(tatName, PUBLIC_DIR)
    const hasAssets = copyAssetsToPublic(tatName, assetsPath, PUBLIC_DIR)
    if (!hasAssets) {
      console.log(`[Arkzen Assets] No assets folder for ${tatName}`)
    }
  } catch (e) {
    console.log(`[Arkzen Assets] ⚠ Asset distribution skipped: ${e}`)
  }

  console.log(`[Arkzen TanStack] ✓ Generated ${routeEntries.length} route(s)`)

  generateTanStackRoot(tatemono)

  try {
    const registry = getRegistry()
    writeSitemap(registry)
    writeRobotsTxt()
  } catch (e) {
    console.log(`[Arkzen TanStack] ⚠ Sitemap generation skipped`)
  }

  return routeEntries
}

// ─── GENERATE TANSTACK __root.tsx — v9.0 ──────────────────────────────────────

function generateTanStackRoot(tatemono: ParsedTatemono): void {
  const rootPath  = path.resolve(process.cwd(), 'src', 'routes', '__root.tsx')
  const webMeta   = tatemono.webMeta
  const meta      = tatemono.meta

  const title       = webMeta?.title ?? webMeta?.label ?? meta.name
  const description = webMeta?.description ?? meta.description ?? ''
  const favicon     = webMeta?.favicon ?? meta.favicon
  const og          = webMeta?.og
  const twitter     = webMeta?.twitter

  const metaEntries: string[] = [
    `      { charSet: 'utf-8' }`,
    `      { name: 'viewport', content: 'width=device-width, initial-scale=1' }`,
    `      { title: '${title.replace(/'/g, "\\'")}' }`,
  ]
  if (description) {
    metaEntries.push(`      { name: 'description', content: '${description.replace(/'/g, "\\'")}' }`)
  }
  metaEntries.push(`      { property: 'og:title', content: '${(og?.title ?? title).replace(/'/g, "\\'")}' }`)
  if (description || og?.description) {
    metaEntries.push(`      { property: 'og:description', content: '${((og?.description ?? description) ?? '').replace(/'/g, "\\'")}' }`)
  }
  if (og?.image) metaEntries.push(`      { property: 'og:image', content: '${og.image}' }`)
  if (og?.url)   metaEntries.push(`      { property: 'og:url', content: '${og.url}' }`)
  metaEntries.push(`      { property: 'og:type', content: '${og?.type ?? 'website'}' }`)
  if (twitter) {
    metaEntries.push(`      { name: 'twitter:card', content: '${twitter.card ?? 'summary_large_image'}' }`)
    metaEntries.push(`      { name: 'twitter:title', content: '${(twitter.title ?? title).replace(/'/g, "\\'")}' }`)
    if (twitter.description || description) {
      metaEntries.push(`      { name: 'twitter:description', content: '${((twitter.description ?? description) ?? '').replace(/'/g, "\\'")}' }`)
    }
    if (twitter.image) metaEntries.push(`      { name: 'twitter:image', content: '${twitter.image}' }`)
  }

  const linkEntries: string[] = [
    `      { rel: 'stylesheet', href: appCss }`,
    `      { rel: 'preconnect', href: 'https://fonts.bunny.net' }`,
    `      { rel: 'stylesheet', href: 'https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap' }`,
  ]
  if (favicon) {
    const isEmoji = [...favicon].length <= 2
    const href = isEmoji
      ? `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${favicon}</text></svg>`
      : favicon
    linkEntries.push(`      { rel: 'icon', href: "${href}" }`)
  }

  const content = `// ============================================================
// ARKZEN GENERATED ROOT ROUTE — [TanStack Start]
// Auto-generated from @arkzen:meta:web — do not edit directly.
// ============================================================
import {
  createRootRoute,
  Outlet,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { ToastProvider } from '@/arkzen/core/components/Toast'
import appCss from '../index.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
${metaEntries.join(',\n')},
    ],
    links: [
${linkEntries.join(',\n')},
    ],
  }),
  notFoundComponent: () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>404 — Page not found</h2>
    </div>
  ),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ToastProvider position="top-right">
          <Outlet />
        </ToastProvider>
        <Scripts />
      </body>
    </html>
  )
}
`
  fs.writeFileSync(rootPath, content, 'utf-8')
  console.log(`[Arkzen TanStack] ✓ __root.tsx updated — title: "${title}"`)
}

// ─── Write robots.txt ──────────────────────────────────────────────────────────

function writeRobotsTxt(): void {
  const publicDir = path.resolve(process.cwd(), 'public')
  fs.mkdirSync(publicDir, { recursive: true })
  const robotsPath = path.join(publicDir, 'robots.txt')
  const content = `User-agent: *
Allow: /

Sitemap: ${process.env.VITE_SITE_URL || 'http://localhost:3000'}/sitemap.xml
`
  fs.writeFileSync(robotsPath, content, 'utf-8')
  console.log(`[Arkzen TanStack] ✓ robots.txt generated`)
}

// ─── Soft unregister ───────────────────────────────────────────────────────────

export function softUnregisterTanStackPages(tatName: string): void {
  console.log(`[Arkzen TanStack] Soft-unregistering (rebuild): ${tatName}`)

  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.rmSync(animPath)
    console.log(`[Arkzen TanStack] ✓ Animation file removed`)
  }

  cleanScriptFiles(GENERATED_DIR, tatName)

  const routeDir = path.join(ROUTES_DIR, tatName)
  if (fs.existsSync(routeDir)) {
    fs.rmSync(routeDir, { recursive: true, force: true })
  }

  const routeTreeGen = path.join(SRC_DIR, 'routeTree.gen.ts')
  const routeTreeStub = `/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols
// ARKZEN STUB — regenerated by TanStack router plugin on next Vite start

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

interface FileRoutesByPath {}
interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByPath
  fullPaths: '/'
  fileRoutesByTo: FileRoutesByPath
  to: '/'
  id: '__root__' | '/'
  fileRoutesById: { '__root__': typeof rootRouteImport; '/': typeof IndexRoute }
}

interface RootRouteChildren { IndexRoute: typeof IndexRoute }
const rootRouteChildren: RootRouteChildren = { IndexRoute }
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register { ssr: true; router: Awaited<ReturnType<typeof getRouter>> }
}
`
  fs.writeFileSync(routeTreeGen, routeTreeStub, 'utf-8')
  console.log(`[Arkzen TanStack] ✓ routeTree.gen.ts stubbed — will regenerate on next start`)

  cleanOldAssets(tatName, PUBLIC_DIR)
  console.log(`[Arkzen TanStack] ✓ Routes purged from tree`)
}

// Legacy export name for backward compatibility
export const buildTanStackPages = registerTanStackPages
export { writeRouteTree, type RouteEntry, type RouteTree }