// ============================================================
// ARKZEN ENGINE — ASTRO ROUTER v1.0
// Astro stack equivalent of vite-router.ts / router.ts.
// Reads same ParsedTatemono, generates Astro-compatible output:
//
//   src/pages/{tat}/{page}.astro                           ← Astro page shells (only .astro files here)
//   src/arkzen/generated/islands/{tat}_{page}.tsx          ← React island components
//   src/arkzen/generated/islands/{tat}_404.tsx             ← 404 handler island
//   src/arkzen/generated/components/{tat}/                 ← Shared component utilities
//   src/arkzen/generated/styles/{tat}/                     ← Component styles
//   arkzen/core/layouts/custom/{tat}-{name}.tsx            ← Custom layout components
//   src/arkzen/generated/{name}.animations.ts              ← GSAP animations
//   src/arkzen/generated/routes.ts                         ← Route registry
//
// KEY DIFFERENCES from vite-router / router:
//   • Page shells are .astro files (frontmatter + HTML template)
//   • React components are hydrated as Astro islands (client:load)
//   • No 'use client' directive — Astro owns the hydration boundary
//   • Layout in frontmatter import, not JSX wrapper
//   • Auth token stored in localStorage (no SSR session)
//   • normalizeForAstro() strips Next.js-isms same as Vite does
//
// The React component files (.tsx) are identical to Vite output.
// Only the page shell (.astro) differs in format.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage, ArkzenErrorHandler } from '../types'
import { emitTatemonoStyles }            from './lib/dsl-style-emitter'
import { copyAssetsToPublic, cleanOldAssets } from './assets'
import { writeSitemap } from './sitemap'
import { getRegistry } from './registry'

const SRC_DIR       = path.resolve(process.cwd(), 'src')
const PAGES_DIR     = path.join(SRC_DIR, 'pages')
const GENERATED_DIR = path.join(SRC_DIR, 'arkzen', 'generated')
const LAYOUTS_DIR   = path.join(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
const ROUTES_FILE   = path.join(GENERATED_DIR, 'routes.ts')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

// Strip Next.js-specific imports (same as Vite normalizer)
function stripNextImports(raw: string): string {
  return raw
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/navigation['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/router['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+Link\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/image['"][ \t]*;?[ \t]*\r?\n?/gm, '')
}

function stripReactRouterImports(raw: string): string {
  return raw
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]react-router-dom['"][ \t]*;?[ \t]*\r?\n?/gm, '')
}

function normalizeRouterCalls(raw: string): string {
  let out = raw
  const routerVars = [...out.matchAll(/\bconst\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*useArkzenRouter\(\)/g)]
    .map(m => m[1])

  for (const varName of routerVars) {
    out = out
      .replace(new RegExp(`\\b${varName}\\.push\\(`, 'g'), `${varName}.push(`)
      .replace(new RegExp(`\\b${varName}\\.replace\\(`, 'g'), `${varName}.replace(`)
      .replace(new RegExp(`\\b${varName}\\.refresh\\(\\)`, 'g'), `window.location.reload()`)
  }

  return out
}

function getAstroAdapterImportLines(raw: string): string[] {
  const needsPathname = /\buseArkzenPathname\s*\(/.test(raw)
  const needsRouter   = /\buseArkzenRouter\s*[\({]/.test(raw)
  const needsLink     = /<Link\b/.test(raw)

  const lines: string[] = []
  if (needsPathname || needsRouter) {
    const hooks = [
      needsPathname && 'useArkzenPathname',
      needsRouter && 'useArkzenRouter',
    ].filter(Boolean) as string[]
    lines.push(`import { ${hooks.join(', ')} } from '@/arkzen/core/adapters/router'`)
  }
  if (needsLink) {
    lines.push(`import { Link } from '@/arkzen/core/adapters/Link'`)
  }

  return lines
}

// Normalize raw tatemono code for Astro React islands.
// Astro uses Arkzen router/link adapters instead of react-router-dom.
function normalizeForAstro(raw: string): string {
  return normalizeRouterCalls(
    stripReactRouterImports(
      stripNextImports(raw)
        .replace(/^[ \t]*['"]use client['"][ \t]*;?[ \t]*\r?\n?/gm, '')
        .replace(/\busePathname\(\)/g, 'useArkzenPathname()')
        .replace(/\buseRouter\b/g, 'useArkzenRouter')
        .replace(/\buseNavigate\b/g, 'useArkzenRouter')
        .replace(/process\.env\.NEXT_PUBLIC_(\w+)/g, 'import.meta.env.PUBLIC_$1')
      // Astro uses PUBLIC_ prefix instead of Vite's VITE_
    )
  )
}

// ─── Import Resolver (mirrors router.ts / vite-router.ts) ────────────────────

interface ResolvedImports {
  canonicalBlock: string
  strippedSources: string[]
}

const ENGINE_OWNED_MODULES = new Set(['react', 'framer-motion'])

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
  if (inImport && buffer.trim()) out.push(buffer.replace(/\s+/g, ' '))
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
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') getEntry(mod).named.add(n)
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
      if (m) { sideEffects.push(`import '${m[1]}'`); continue }
    }
  }

  // Normalise gsap: import gsap from 'gsap' → import { gsap } from 'gsap'
  if (importMap.has('gsap')) {
    const gsapEntry = importMap.get('gsap')!
    if (gsapEntry.defaultImport === 'gsap') {
      gsapEntry.defaultImport = undefined
      gsapEntry.named.add('gsap')
    }
  }

  const lines: string[] = []

  const reactNamed = [...(importMap.get('react')?.named ?? [])].filter(h => h !== 'React').sort()
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
  if (engineRequired.extra) lines.push(engineRequired.extra)

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

// ─── Component files (identical to vite-router) ──────────────────────────────

// Replaces template literal STATIC content char-for-char with whitespace so
// character indices are preserved for splitComponentDeclarations slicing.
// ${...} expression content is kept verbatim so identifiers inside them
// remain visible to findReferencedNames (e.g. REVERB_SCHEME in `${REVERB_SCHEME}://...`).
function stripTemplateLiterals(src: string): string {
  let result = ''
  let i = 0
  while (i < src.length) {
    if (src[i] === '`') {
      result += ' ' // placeholder for opening backtick
      i++ // skip opening backtick
      while (i < src.length) {
        if (src[i] === '\\') { result += '  '; i += 2; continue }  // escaped char — 2 spaces
        if (src[i] === '`') { result += ' '; i++; break }             // closing backtick
        // Preserve ${...} expression content verbatim so identifiers stay visible
        if (src[i] === '$' && src[i + 1] === '{') {
          result += '  ' // placeholders for '${'
          i += 2
          let depth = 1
          while (i < src.length && depth > 0) {
            if (src[i] === '{') depth++
            else if (src[i] === '}') {
              depth--
              if (depth === 0) { result += '}'; i++; break }
            }
            result += src[i]  // emit verbatim so identifiers remain visible
            i++
          }
          continue
        }
        result += ' ' // replace static text char-for-char with whitespace
        i++
      }
    } else {
      result += src[i]
      i++
    }
  }
  return result
}

// ─── Component / declaration name extractors (ported from vite-router) ───────

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
  const re = new RegExp(`^(?:export\\s+)?(const|function|interface|type)\\s+(${nameAlt})\\b`, 'gm')

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

function ensureExported(declaration: string, name: string, kinds: string): string {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return declaration.replace(
    new RegExp(`^(\\s*)(export\\s+)?(${kinds})(\\s+${escapedName}\\b)`, 'm'),
    (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
  )
}

// ─── Individual component files — real per-component .tsx files ──────────────

function generateIndividualComponentFiles(tatemono: ParsedTatemono): void {
  const componentsDir = path.join(SRC_DIR, 'arkzen', 'generated', 'components', tatemono.meta.name)

  if (tatemono.components.length === 0) {
    if (fs.existsSync(componentsDir)) {
      fs.rmSync(componentsDir, { recursive: true })
      console.log(`[Arkzen Astro Router] 🧹 Removed stale components/${tatemono.meta.name} (no @arkzen:components)`)
    }
    return
  }

  ensureDir(componentsDir)

  const rawSources = tatemono.components.map(c => normalizeForAstro(c.raw.trim()))
  const adapterImports = getAstroAdapterImportLines(rawSources.join('\n'))
  const { canonicalBlock, strippedSources } = resolveImports(rawSources, {
    extra: adapterImports.join('\n') || undefined,
  })

  const stylesByComponent = new Map<string, string>()
  for (const style of tatemono.styles.filter((s): s is typeof s & { name: string } => !!s.name)) {
    stylesByComponent.set(style.name, style.name)
  }

  const extractedComponents = extractComponentNames(tatemono)
  const sharedConstants     = extractSharedConstantNames(tatemono)
  const customHooks         = extractCustomHookNames(tatemono)
  const sharedTypes         = extractSharedTypeNames(tatemono)
  const utilityFunctions    = extractUtilityFunctionNames(tatemono)
  const allDeclaredNames = new Set([...extractedComponents, ...sharedConstants, ...customHooks, ...sharedTypes, ...utilityFunctions])

  const declarationsByName = new Map<string, string>()
  for (const stripped of strippedSources) {
    for (const [name, code] of splitComponentDeclarations(stripped, allDeclaredNames)) {
      declarationsByName.set(name, code)
    }
  }

  // resolvedUtilityFunctions: only names that have an actual top-level declaration chunk.
  // Filters out false positives from extractUtilityFunctionNames() — inner `const` vars
  // like `const map = L.map(...)` or `const i = parseInt(...)` inside component bodies
  // that the body-strip regex misses. Without this, findReferencedNames() finds them
  // referenced in other components and emits broken `import { map } from './utils'`.
  const resolvedUtilityFunctions = new Set(
    [...utilityFunctions].filter(name => declarationsByName.has(name))
  )

  // ── Shared constants file (components/{tat}/constants.tsx) ───────────────
  if (sharedConstants.size > 0) {
    const constChunks = [...sharedConstants]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => ensureExported(chunk, name, 'const'))

    if (constChunks.length > 0) {
      const constantsContent = `// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — ${tatemono.meta.name}
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${constChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'constants.tsx'), constantsContent, 'utf-8')
      console.log(`[Arkzen Astro Router] ✓ Shared constants: constants.tsx`)
    }
  } else {
    for (const stale of ['constants.tsx', 'constants.ts']) {
      const stalePath = path.join(componentsDir, stale)
      if (fs.existsSync(stalePath)) fs.unlinkSync(stalePath)
    }
  }

  // ── Custom hooks file (components/{tat}/hooks.tsx) ────────────────────────
  if (customHooks.size > 0) {
    const hookChunks = [...customHooks]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => ensureExported(chunk, name, 'const|function'))

    if (hookChunks.length > 0) {
      const hooksContent = `// ============================================================
// ARKZEN GENERATED HOOKS — ${tatemono.meta.name}
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${hookChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'hooks.tsx'), hooksContent, 'utf-8')
      console.log(`[Arkzen Astro Router] ✓ Custom hooks: hooks.tsx (${[...customHooks].join(', ')})`)
    }
  } else {
    for (const stale of ['hooks.tsx', 'hooks.ts']) {
      const stalePath = path.join(componentsDir, stale)
      if (fs.existsSync(stalePath)) fs.unlinkSync(stalePath)
    }
  }

  // ── Utility functions file (components/{tat}/utils.tsx) ───────────────────
  // utilsFileWritten: only emit `import from './utils'` in components when
  // utils.tsx was actually written — prevents "Could not import ./utils" when
  // extractUtilityFunctionNames() picks up inner vars (e.g. `const i` inside
  // a component body) that have no top-level declaration chunk.
  let utilsFileWritten = false
  if (utilityFunctions.size > 0) {
    const utilChunks = [...utilityFunctions]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => ensureExported(chunk, name, 'const|function'))

    if (utilChunks.length > 0) {
      const utilsContent = `// ============================================================
// ARKZEN GENERATED UTILITIES — ${tatemono.meta.name}
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${utilChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'utils.tsx'), utilsContent, 'utf-8')
      utilsFileWritten = true
      console.log(`[Arkzen Astro Router] ✓ Utility functions: utils.tsx (${[...utilityFunctions].join(', ')})`)
    }
  }
  if (!utilsFileWritten) {
    for (const stale of ['utils.tsx', 'utils.ts']) {
      const stalePath = path.join(componentsDir, stale)
      if (fs.existsSync(stalePath)) fs.unlinkSync(stalePath)
    }
  }

  // ── Shared types file (components/{tat}/types.ts) ─────────────────────────
  if (sharedTypes.size > 0) {
    const typeChunks = [...sharedTypes]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => ensureExported(chunk, name, 'type|interface'))

    if (typeChunks.length > 0) {
      const typesContent = `// ============================================================
// ARKZEN GENERATED TYPES — ${tatemono.meta.name}
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${typeChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'types.ts'), typesContent, 'utf-8')
      console.log(`[Arkzen Astro Router] ✓ Shared types: types.ts (${[...sharedTypes].join(', ')})`)
    }
  } else {
    const typesPath = path.join(componentsDir, 'types.ts')
    if (fs.existsSync(typesPath)) fs.unlinkSync(typesPath)
  }

  // ── One real file per component (components/{tat}/{Name}.tsx) ────────────
  for (const compName of extractedComponents) {
    const declaration = declarationsByName.get(compName)
    if (!declaration) {
      console.log(`[Arkzen Astro Router] ⚠ Could not isolate declaration for ${compName}, skipping file`)
      continue
    }

    const fileName = `${compName}.tsx`
    const filePath = path.join(componentsDir, fileName)

    const cssImport = stylesByComponent.has(compName)
      ? `import styles from '../../styles/${compName}.module.css'\n`
      : ''

    const exportedDeclaration = ensureExported(declaration, compName, 'const|function')

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
    const siblingComponentImports = referencedComponents
      .sort()
      .map(name => `import { ${name} } from './${name}'`)
      .join('\n')
    const siblingImportBlock = siblingComponentImports ? `${siblingComponentImports}\n` : ''

    const referencedUtils = utilsFileWritten ? findReferencedNames(declaration, resolvedUtilityFunctions) : []
    const utilsImport = referencedUtils.length > 0
      ? `import { ${referencedUtils.sort().join(', ')} } from './utils'\n`
      : ''

    const content = `// ============================================================
// ARKZEN GENERATED COMPONENT — ${compName}
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}
${cssImport}${constantsImport}${hooksImport}${utilsImport}${typesImport}${siblingImportBlock}
${exportedDeclaration}
`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Astro Router] ✓ Component: ${fileName}`)
  }

  // Clean up stale files: old _components.tsx, and any per-component files
  // for components that no longer exist.
  try {
    const files = fs.readdirSync(componentsDir)
    for (const file of files) {
      const base = file.replace(/\.(tsx|ts)$/, '')
      if (file === '_components.tsx') {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen Astro Router] 🧹 Removed stale _components.tsx`)
        continue
      }
      // index.ts is an old barrel file — delete it (same as Vite router)
      if (file === 'index.ts') {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen Astro Router] 🧹 Removed stale index.ts barrel`)
        continue
      }
      if (['hooks.ts','hooks.tsx','types.ts','constants.ts','constants.tsx','utils.ts','utils.tsx'].includes(file)) continue
      if (file.endsWith('.tsx') && !extractedComponents.has(base)) {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen Astro Router] 🧹 Removed stale component: ${file}`)
      }
    }
  } catch (e) {
    // ignore
  }
}

// generateComponentsIndex() intentionally removed — per-file component system
// (generateIndividualComponentFiles) replaces barrel index.ts. Each component
// is imported directly by its filename. Old index.ts files are cleaned up in
// generateIndividualComponentFiles() stale-file sweep. Mirrors Next.js/Vite behavior.

// ─── React island TSX file (the actual component, no page shell) ──────────────

function generateIslandFile(
  tatemono: ParsedTatemono,
  page: ArkzenPage,
  animationFnName: string | null
): string {
  const componentName = extractComponentName(page.name, page.raw)
  const isAuthLayout  = page.layout === 'auth'
  const isGuestOnly   = page.layout === 'guest' &&
    (tatemono.meta.auth && ['login', 'register', 'forgot-password', 'reset-password'].includes(page.name))

  const pageSource = normalizeForAstro(page.raw.trim())

  const framerNeeded = new Set(['motion'])
  const framerRe = /import\s+\{([^}]*)\}\s+from\s+['"]framer-motion['"]/g
  // Scrape framer names from BOTH component blocks AND page source — mirrors Next.js/Vite.
  // Without this, AnimatePresence / useMotionValue used in components are missed.
  const framerSources = [...tatemono.components.map(c => c.raw.trim()), pageSource]
  for (const src of framerSources) {
    let fm: RegExpMatchArray | null
    const re = /import\s+\{([^}]*)\}\s+from\s+['"]framer-motion['"]/g
    while ((fm = re.exec(src)) !== null) {
      fm[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => framerNeeded.add(n))
    }
  }

  const animImportLine = animationFnName
    ? `import { ${animationFnName}, pageVariants } from '@/arkzen/generated/${tatemono.meta.name}.animations'`
    : ''

  const layoutImport = getLayoutImport(page.layout, tatemono.meta)
  const layoutComp   = getLayoutComponent(page.layout)
  const adapterImportLines = getAstroAdapterImportLines(pageSource)

  // Resolve which declarations from @arkzen:components this page actually uses,
  // and import them from the per-component generated files rather than inlining.
  const extractedComponents = extractComponentNames(tatemono)
  const sharedConstants     = extractSharedConstantNames(tatemono)
  const customHooks         = extractCustomHookNames(tatemono)
  const sharedTypes         = extractSharedTypeNames(tatemono)
  const utilityFunctions    = extractUtilityFunctionNames(tatemono)

  const componentImportLines = [...extractedComponents]
    .filter(name => findReferencedNames(pageSource, new Set([name])).length > 0)
    .sort()
    .map(name => `import { ${name} } from '@/arkzen/generated/components/${tatemono.meta.name}/${name}'`)

  const referencedConstants = findReferencedNames(pageSource, sharedConstants)
  const constantsImportLine = referencedConstants.length > 0
    ? `import { ${referencedConstants.sort().join(', ')} } from '@/arkzen/generated/components/${tatemono.meta.name}/constants'`
    : ''

  const referencedHooks = findReferencedNames(pageSource, customHooks)
  const hooksImportLine = referencedHooks.length > 0
    ? `import { ${referencedHooks.sort().join(', ')} } from '@/arkzen/generated/components/${tatemono.meta.name}/hooks'`
    : ''

  const referencedTypes = findReferencedNames(pageSource, sharedTypes)
  const typesImportLine = referencedTypes.length > 0
    ? `import type { ${referencedTypes.sort().join(', ')} } from '@/arkzen/generated/components/${tatemono.meta.name}/types'`
    : ''

  const utilsPath = path.join(SRC_DIR, 'arkzen', 'generated', 'components', tatemono.meta.name, 'utils.tsx')
  const referencedUtils = fs.existsSync(utilsPath) ? findReferencedNames(pageSource, resolvedUtilityFunctions) : []
  const utilsImportLine = referencedUtils.length > 0
    ? `import { ${referencedUtils.sort().join(', ')} } from '@/arkzen/generated/components/${tatemono.meta.name}/utils'`
    : ''

  // Detect React hooks actually used in page source — mirrors Next.js/Vite
  const KNOWN_REACT_HOOKS = [
    'useState', 'useCallback', 'useMemo', 'useContext', 'useReducer',
    'useLayoutEffect', 'useImperativeHandle', 'useTransition', 'useDeferredValue',
    'useId', 'useSyncExternalStore', 'useInsertionEffect',
  ]
  const pageStrippedForHooks = stripTemplateLiterals(pageSource)
  const usedReactHooks = KNOWN_REACT_HOOKS.filter(hook =>
    new RegExp(`[^\\w$]${hook}\\s*[(<]`).test(pageStrippedForHooks)
  )

  // Forward non-react/framer-motion imports from component blocks that the page
  // references but doesn't itself import (e.g. useAuthStore, gsap, ScrollTrigger).
  // Mirrors Next.js generatePageFile() / Vite generatePageFile() forwardedImportLines.
  const forwardedImportLines = (() => {
    const seen = new Set<string>()
    const lines: string[] = []
    for (const component of tatemono.components) {
      const flattened = flattenMultilineImports(component.raw.trim())
      for (const rawLine of flattened.split('\n')) {
        const line = rawLine.trim()
        if (!line.startsWith('import ')) continue
        if (/from\s+['"](react|framer-motion)['"]/.test(line)) continue

        const idents: string[] = []
        let m = line.match(/^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*,\s*\{([^}]*)\}\s+from/)
        if (m) {
          idents.push(m[1], ...m[2].split(',').map((s: string) => s.trim()).filter(Boolean))
        } else if ((m = line.match(/^import\s+\{([^}]*)\}\s+from/))) {
          idents.push(...m[1].split(',').map((s: string) => s.trim()).filter(Boolean))
        } else if ((m = line.match(/^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from/))) {
          idents.push(m[1])
        } else if ((m = line.match(/^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from/))) {
          idents.push(m[1])
        } else {
          continue
        }

        const referenced = idents.some((ident: string) =>
          new RegExp(`[^\\w$]${ident.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`).test(' ' + pageStrippedForHooks)
        )
        if (referenced && !seen.has(line)) {
          seen.add(line)
          lines.push(line)
        }
      }
    }
    return lines.join('\n')
  })()

  const extraLines = [
    layoutImport,
    animImportLine,
    ...adapterImportLines,
    ...componentImportLines,
    constantsImportLine,
    hooksImportLine,
    utilsImportLine,
    typesImportLine,
    forwardedImportLines,
  ].filter(Boolean).join('\n')

  const { canonicalBlock: rawCanonicalBlock, strippedSources } = resolveImports([pageSource], {
    reactHooks:  ['useRef', 'useEffect', ...usedReactHooks],
    framerNamed: [...framerNeeded],
    extra:       extraLines,
  })

  // Islands live in generated/islands/ but .scripts and .script files are in generated/
  // Rewrite any './xxx.scripts' or './xxx.*.script' relative imports to '../xxx...'
  const canonicalBlock = rawCanonicalBlock.replace(
    /from\s+['"]\.\/([\w-]+\.scripts|[\w-]+\.[\w-]+\.script)['"]/g,
    `from '../$1'`
  )

  const strippedPageCode = strippedSources[0]
    .replace(
      /useEffect\(\(\)\s*=>\s*\{\s*\n?\s*return\s*\(\)\s*=>\s*\{\s*isMounted\.current\s*=\s*false\s*\}\s*\n?\s*\},\s*\[\]\)/g,
      `useEffect(() => {\n    isMounted.current = true\n    return () => { isMounted.current = false }\n  }, [])`
    )

  return `// ============================================================
// ARKZEN GENERATED ISLAND — ${tatemono.meta.name}/${page.name}
// React island component. Hydrated with client:load in .astro page shell.
// Layout: ${page.layout} | Auth guard: ${isAuthLayout} | Guest-only: ${isGuestOnly}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

// Page component code (from @arkzen:page:${page.name})
${strippedPageCode}

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)} = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    ${animationFnName ? `const cleanup = ${animationFnName}(pageRef)\n    return cleanup` : '// No animations'}
  }, [])

  return (
    <${layoutComp}${isAuthLayout ? ' requireAuth={true}' : ''}${isGuestOnly ? ' guestOnly={true}' : ''}>
      <motion.div
        ref={pageRef}
        variants={${animationFnName ? 'pageVariants' : '{}'}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <${componentName} />
      </motion.div>
    </${layoutComp}>
  )
}

export default ArkzenIsland_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)}
`
}

// ─── Astro page shell (.astro) ────────────────────────────────────────────────
//
// Each Astro page is a thin shell that:
//   1. Imports the React island component
//   2. Sets the HTML title from tatemono meta
//   3. Renders the island with client:load (full client-side hydration)
//
// This is exactly what makes Astro different from Next.js/Vite —
// the page itself is just an HTML shell, React only loads where needed.

function generateAstroPageShell(
  tatemono: ParsedTatemono,
  page: ArkzenPage,
  islandImportPath: string,
  hasGlobalStyle: boolean
): string {
  const islandName  = `ArkzenIsland_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)}`
  const cssImport   = hasGlobalStyle ? `import './styles/global.css'` : ''

  const webMeta     = tatemono.webMeta
  const meta        = tatemono.meta
  const baseTitle   = webMeta?.title ?? webMeta?.label ?? toPascalCase(meta.name)
  const pageLabel   = toPascalCase(page.name)
  const title       = page.name === 'index' ? baseTitle : `${baseTitle} — ${pageLabel}`
  const description = webMeta?.description ?? meta.description ?? ''
  const favicon     = webMeta?.favicon ?? meta.favicon
  const og          = webMeta?.og
  const twitter     = webMeta?.twitter

  // Build RootLayout props string
  const props: string[] = [`title="${title}"`]
  if (description)         props.push(`description="${description.replace(/"/g, '&quot;')}"`)
  if (favicon)             props.push(`favicon="${favicon}"`)
  if (og?.title)           props.push(`og={{ title: "${og.title.replace(/"/g, '&quot;')}"${og.description ? `, description: "${og.description.replace(/"/g, '&quot;')}"` : ''}${og.image ? `, image: "${og.image}"` : ''}${og.url ? `, url: "${og.url}"` : ''}${og.type ? `, type: "${og.type}"` : ''} }}`)
  else if (og)             props.push(`og={{ ${og.description ? `description: "${(og.description ?? '').replace(/"/g, '&quot;')}"` : ''}${og.image ? `, image: "${og.image}"` : ''}${og.url ? `, url: "${og.url}"` : ''} }}`)
  if (twitter)             props.push(`twitter={{ card: "${twitter.card ?? 'summary_large_image'}"${twitter.title ? `, title: "${twitter.title.replace(/"/g, '&quot;')}"` : ''}${twitter.description ? `, description: "${twitter.description.replace(/"/g, '&quot;')}"` : ''}${twitter.image ? `, image: "${twitter.image}"` : ''} }}`)

  return `---
// ============================================================
// ARKZEN GENERATED PAGE — ${meta.name}/${page.name}
// Astro page shell. All UI lives in the React island below.
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import RootLayout from '@/RootLayout.astro'
import ${islandName} from '${islandImportPath}.tsx'
${cssImport}
---

<RootLayout ${props.join('\n  ')}>
  <${islandName} client:load />
</RootLayout>
`
}

// ─── Animation file (identical to vite-router) ───────────────────────────────

function generateAnimationFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.animation) return null

  const animFnName = toCamelCase(tatemono.meta.name) + 'Animations'

  const { strippedSources } = resolveImports([tatemono.animation.raw], {
    reactHooks:  [],
    framerNamed: [],
  })

  let cleanAnimation = strippedSources[0]
    .replace(/gsap\.registerPlugin\(.*\)[;]?\n?/g, '')
    .replace(new RegExp(`\\bexport\\s+const\\s+${animFnName}\\b`), `const ${animFnName}`)
    .replace(`const ${animFnName}`, `export const ${animFnName}`)
    .replace(/\*\/\s*$/, '')
    .trim()

  const hasPageVariants = /export\s+const\s+pageVariants\b/.test(cleanAnimation)
  const pageVariantsBlock = hasPageVariants ? '' : `
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}`

  return `// ============================================================
// ARKZEN GENERATED ANIMATIONS — ${tatemono.meta.name}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

${cleanAnimation}${pageVariantsBlock}
`
}


// ─── GENERATE GLOBAL SCRIPT FILE — v6.5 ─────────────────────────────────────
// Mirrors generateAnimationFile but for @arkzen:script.
// Exports whatever the author wrote — no forced pageVariants injection.

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

// ─── GENERATE NAMED SCRIPT FILES — v6.5 ─────────────────────────────────────
// Each @arkzen:script:name block → {name}.{scriptName}.script.ts

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
    console.log(`[Arkzen Astro Router] ✓ Named script: ${fileName}`)
  }
}

// ─── CLEANUP SCRIPT FILES ─────────────────────────────────────────────────────

function cleanScriptFiles(generatedDir: string, tatName: string): void {
  const scriptPath = path.join(generatedDir, `${tatName}.scripts.ts`)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath)
    console.log(`[Arkzen Astro Router] ✓ Global script file removed`)
  }
  try {
    const files = fs.readdirSync(generatedDir)
    for (const file of files) {
      if (file.startsWith(`${tatName}.`) && file.endsWith('.script.ts')) {
        fs.unlinkSync(path.join(generatedDir, file))
        console.log(`[Arkzen Astro Router] ✓ Named script removed: ${file}`)
      }
    }
  } catch { /* ignore */ }
}

// ─── Custom layouts ───────────────────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (tatemono.layouts.length === 0) return

  ensureDir(LAYOUTS_DIR)

  for (const layout of tatemono.layouts) {
    const normalizedLayout = normalizeForAstro(layout.raw)
    const adapterImports = getAstroAdapterImportLines(normalizedLayout)
    const { canonicalBlock, strippedSources } = resolveImports(
      [normalizedLayout],
      { reactHooks: [], framerNamed: [], extra: adapterImports.join('\n') || undefined }
    )
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const content  = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name}
// Generated from tatemono: ${tatemono.meta.name}

${canonicalBlock}

${strippedSources[0]}
`
    fs.writeFileSync(path.join(LAYOUTS_DIR, fileName), content, 'utf-8')
    console.log(`[Arkzen Astro Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── 404 handler ─────────────────────────────────────────────────────────────

function generateNotFoundPage(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const islandName = `ArkzenNotFound_${toPascalCase(tatemono.meta.name)}`
  const raw        = normalizeForAstro(handler.raw).replace(/'use client'[;]?\n?/, '').trim()
  const adapterImports = getAstroAdapterImportLines(raw)

  // Generate the React island tsx file → src/arkzen/generated/islands/{tat}_404.tsx
  const islandFileName = `${tatemono.meta.name}_404.tsx`
  const islandPath = path.join(SRC_DIR, 'arkzen', 'generated', 'islands', islandFileName)
  const islandContent = `// ARKZEN GENERATED 404 ISLAND — ${tatemono.meta.name}
// DO NOT EDIT DIRECTLY.

import React from 'react'
import { ErrorScreen } from '@/arkzen/generated/components/${tatemono.meta.name}/ErrorScreen'
${adapterImports.join('\n')}

${raw}

export default NotFoundPage
`
  ensureDir(path.dirname(islandPath))
  fs.writeFileSync(islandPath, islandContent, 'utf-8')

  // Return the Astro shell
  return `---
// ARKZEN GENERATED 404 PAGE — ${tatemono.meta.name}
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:404 block in the tatemono instead.
import RootLayout from '@/RootLayout.astro'
import NotFoundIsland from '@/arkzen/generated/islands/${islandFileName.replace('.tsx', '')}'
---

<RootLayout title="Not Found — ${tatemono.webMeta?.label ?? toPascalCase(tatemono.meta.name)}"${tatemono.webMeta?.favicon ? ` favicon="${tatemono.webMeta.favicon}"` : ''}>
  <NotFoundIsland client:load />
</RootLayout>
`
}

// ─── 500 error boundary (Astro) ──────────────────────────────────────────────
//
// Astro has no native error.tsx equivalent. Pattern mirrors Vite/Inertia:
//   1. React island tsx  → src/arkzen/generated/islands/{tat}_error-boundary.tsx
//      Contains the user's ServerErrorPage + a class ErrorBoundary wrapping it.
//   2. Astro shell       → src/pages/{tat}/error-boundary.astro
//      Thin shell that mounts the island with client:load.
//
// The ErrorBoundary class IS exported from the island for use in custom wrappers.

function generateErrorBoundaryPage(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const boundaryClassName = `ArkzenErrorBoundary_${toPascalCase(tatemono.meta.name)}`
  const islandName        = `ArkzenErrorBoundary_${toPascalCase(tatemono.meta.name)}_Island`
  const raw               = normalizeForAstro(handler.raw).replace(/'use client'[;]?\n?/, '').trim()
  const adapterImports    = getAstroAdapterImportLines(raw)

  const islandFileName = `${tatemono.meta.name}_error-boundary.tsx`
  const islandPath     = path.join(SRC_DIR, 'arkzen', 'generated', 'islands', islandFileName)

  const islandContent = `// ============================================================
// ARKZEN GENERATED ERROR BOUNDARY ISLAND — ${tatemono.meta.name}
// Class-based React ErrorBoundary. Export it from here to wrap custom layouts.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:500 block in the tatemono instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import React, { Component, ReactNode } from 'react'
import { ErrorScreen } from '@/arkzen/generated/components/${tatemono.meta.name}/ErrorScreen'
${adapterImports.join('\n')}

${raw}

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

// Default export: standalone error page rendered in the .astro shell
const ${islandName} = () => <ServerErrorPage reset={() => window.location.reload()} />
export default ${islandName}
`
  ensureDir(path.dirname(islandPath))
  fs.writeFileSync(islandPath, islandContent, 'utf-8')

  // Astro shell
  return `---
// ARKZEN GENERATED ERROR PAGE — ${tatemono.meta.name}
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:500 block in the tatemono instead.
import RootLayout from '@/RootLayout.astro'
import ${islandName} from '@/arkzen/generated/islands/${islandFileName.replace('.tsx', '')}'
---

<RootLayout title="Error — ${tatemono.webMeta?.label ?? toPascalCase(tatemono.meta.name)}"${tatemono.webMeta?.favicon ? ` favicon="${tatemono.webMeta.favicon}"` : ''}>
  <${islandName} client:load />
</RootLayout>
`
}

// ─── Route registry ───────────────────────────────────────────────────────────
// Astro doesn't need a client-side route registry the same way Vite does —
// Astro's file-system routing handles it. But we write one for the Hub UI
// and for any client-side navigation logic.

interface AstroRoute {
  name:   string
  path:   string
  layout: string
}

function writeRouteRegistry(allRoutes: AstroRoute[]): void {
  ensureDir(GENERATED_DIR)

  const routeLines = allRoutes
    .map(r => `  { name: '${r.name}', path: '${r.path}', layout: '${r.layout}' }`)
    .join(',\n')

  const content = `// ============================================================
// ARKZEN GENERATED ROUTE REGISTRY — Astro stack
// Auto-generated by arkzen/core/astro-router.ts
// DO NOT EDIT DIRECTLY.
// Generated: ${new Date().toISOString()}
// ============================================================

export interface AstroRouteEntry {
  name:   string
  path:   string
  layout: string
}

export const ARKZEN_ROUTES: AstroRouteEntry[] = [
${routeLines}
]

export const ARKZEN_ROUTE_MAP = new Map(
  ARKZEN_ROUTES.map(r => [r.name, r])
)
`
  fs.writeFileSync(ROUTES_FILE, content, 'utf-8')
  console.log(`[Arkzen Astro Router] ✓ Route registry written: routes.ts (${allRoutes.length} routes)`)
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function getLayoutImport(layout: string, meta: { name: string }): string {
  switch (layout) {
    case 'guest': return `import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'`
    case 'auth':  return `import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'`
    default:
      return `import { ${toPascalCase(layout)}Layout } from '@/arkzen/core/layouts/custom/${meta.name}-${layout}'`
  }
}

function getLayoutComponent(layout: string): string {
  switch (layout) {
    case 'guest': return 'GuestLayout'
    case 'auth':  return 'AuthLayout'
    default:      return `${toPascalCase(layout)}Layout`
  }
}

function extractComponentName(pageName: string, raw: string): string {
  const match = raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  if (match) return match[1]
  const pascal = toPascalCase(pageName)
  return (/^\d/.test(pascal) ? `Page${pascal}` : pascal) + 'Page'
}

// ─── REGISTER (main export) ───────────────────────────────────────────────────

// In-memory registry of all routes across tatemonos (for writeRouteRegistry)
const _allRoutes: AstroRoute[] = []

export function registerAstroPages(tatemono: ParsedTatemono): void {
  const animFnName = tatemono.animation
    ? toCamelCase(tatemono.meta.name) + 'Animations'
    : null

  console.log(`[Arkzen Astro Router] Registering ${tatemono.pages.length} page(s) for: ${tatemono.meta.name}`)

  // Animation file
  if (tatemono.animation) {
    ensureDir(GENERATED_DIR)
    const animContent = generateAnimationFile(tatemono)
    if (animContent) {
      fs.writeFileSync(
        path.join(GENERATED_DIR, `${tatemono.meta.name}.animations.ts`),
        animContent, 'utf-8'
      )
      console.log(`[Arkzen Astro Router] ✓ Animation file generated`)
    }
  }


  // v6.5: Global script file
  if (tatemono.script) {
    ensureDir(GENERATED_DIR)
    const scriptContent = generateScriptFile(tatemono)
    if (scriptContent) {
      fs.writeFileSync(path.join(GENERATED_DIR, `${tatemono.meta.name}.scripts.ts`), scriptContent, 'utf-8')
      console.log(`[Arkzen Astro Router] ✓ Global script file generated`)
    }
  }

  // v6.5: Named script files
  if (tatemono.scripts && tatemono.scripts.length > 0) {
    ensureDir(GENERATED_DIR)
    generateNamedScriptFiles(tatemono, GENERATED_DIR)
  }

  // Custom layouts
  generateCustomLayouts(tatemono)

  const tatemonoDir = path.join(PAGES_DIR, tatemono.meta.name)
  ensureDir(tatemonoDir)

  // Component files (same as Vite — .tsx React islands)
  generateIndividualComponentFiles(tatemono)
  // Note: generateComponentsIndex() removed — per-file imports replace barrel index.ts

  // Style files — emit co-located with the .astro shell so the relative import is simple
  const styleInfo = emitTatemonoStyles(tatemono, tatemonoDir, { loggerLabel: 'Arkzen Astro Router' })

  // 404 handler
  if (tatemono.errorHandlers) {
    for (const handler of tatemono.errorHandlers) {
      if (handler.type === '404') {
        const content = generateNotFoundPage(tatemono, handler)
        fs.writeFileSync(path.join(tatemonoDir, '404.astro'), content, 'utf-8')
        console.log(`[Arkzen Astro Router] ✓ 404 handler: 404.astro → /${tatemono.meta.name}/**`)
      } else if (handler.type === '500') {
        const content = generateErrorBoundaryPage(tatemono, handler)
        fs.writeFileSync(path.join(tatemonoDir, 'error-boundary.astro'), content, 'utf-8')
        console.log(`[Arkzen Astro Router] ✓ 500 handler: error-boundary.astro + island → /${tatemono.meta.name}`)
      }
    }
  }

  // Remove routes for this tatemono from the in-memory list (rebuild)
  // Remove ALL existing routes for this tatemono before re-adding (handles multi-page rebuild)
  const toRemove = _allRoutes.filter(r => r.name.startsWith(tatemono.meta.name + '/'))
  toRemove.forEach(r => _allRoutes.splice(_allRoutes.indexOf(r), 1))

  // Generate each page
  const islandsDir = path.join(SRC_DIR, 'arkzen', 'generated', 'islands')
  ensureDir(islandsDir)

  // Root redirect — if no page is named 'index', generate an index.astro
  // that redirects /{tat} → /{tat}/{firstPage}, same as Next.js behaviour.
  const hasIndexPage = tatemono.pages.some(p => p.name === 'index')
  if (!hasIndexPage && tatemono.pages.length > 0) {
    const firstPage    = tatemono.pages[0].name
    const redirectDest = `/${tatemono.meta.name}/${firstPage}`
    const redirectContent = `---
// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — ${tatemono.meta.name}
// Visiting /${tatemono.meta.name} redirects to ${redirectDest}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

return Astro.redirect('${redirectDest}')
---
`
    fs.writeFileSync(path.join(tatemonoDir, 'index.astro'), redirectContent, 'utf-8')
    console.log(`[Arkzen Astro Router] ✓ Root redirect: /${tatemono.meta.name} → ${redirectDest}`)
  }

  for (const page of tatemono.pages) {
    const isIndex   = page.name === 'index'
    const routePath = isIndex
      ? `/${tatemono.meta.name}`
      : `/${tatemono.meta.name}/${page.name}`

    // 1. React island .tsx file → src/arkzen/generated/islands/{tat}_{page}.tsx
    const islandFileName = `${tatemono.meta.name}_${isIndex ? 'index' : page.name}.tsx`
    const islandPath     = path.join(islandsDir, islandFileName)
    const islandContent  = generateIslandFile(tatemono, page, animFnName)
    fs.writeFileSync(islandPath, islandContent, 'utf-8')

    // 2. Astro page shell .astro file → src/pages/{tat}/{page}.astro
    const astroFileName  = isIndex ? 'index.astro' : `${page.name}.astro`
    const astroPath      = path.join(tatemonoDir, astroFileName)
    const islandImport   = `@/arkzen/generated/islands/${islandFileName.replace('.tsx', '')}`
    const islandName     = `ArkzenIsland_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)}`
    const astroContent   = generateAstroPageShell(tatemono, page, islandImport, styleInfo.hasGlobalStyle)
    fs.writeFileSync(astroPath, astroContent, 'utf-8')

    console.log(`[Arkzen Astro Router] ✓ ${routePath} [${page.layout}] → ${astroFileName} + island/${islandFileName}`)

    _allRoutes.push({ name: `${tatemono.meta.name}/${page.name}`, path: routePath, layout: page.layout })
  }

  // Assets
  try {
    const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
    const assetsPath   = path.join(tatemonosDir, tatemono.meta.name, 'assets')
    const publicDir    = path.resolve(process.cwd(), 'public')
    cleanOldAssets(tatemono.meta.name, publicDir)
    copyAssetsToPublic(tatemono.meta.name, assetsPath, publicDir)
  } catch (e) {
    console.log(`[Arkzen Assets] ⚠ Asset distribution skipped: ${e}`)
  }

  writeRouteRegistry(_allRoutes)
  console.log(`[Arkzen Astro Router] ✓ All pages registered for: ${tatemono.meta.name}`)

  // ── Sitemap + robots.txt ──────────────────────────────────────────────────────
  try {
    const registry = getRegistry()
    writeSitemap(registry)
    writeRobotsTxt()
  } catch (e) {
    console.log(`[Arkzen Astro Router] ⚠ Sitemap generation skipped`)
  }
}

// ─── Write robots.txt ─────────────────────────────────────────────────────────

function writeRobotsTxt(): void {
  const publicDir = path.resolve(process.cwd(), 'public')
  fs.mkdirSync(publicDir, { recursive: true })
  const robotsPath = path.join(publicDir, 'robots.txt')
  const content = `User-agent: *
Allow: /

Sitemap: ${process.env.ARKZEN_SITE_URL || process.env.VITE_SITE_URL || 'http://localhost:4321'}/sitemap.xml
`
  fs.writeFileSync(robotsPath, content, 'utf-8')
  console.log(`[Arkzen Astro Router] ✓ robots.txt generated`)
}

export function unregisterAstroPages(tatName: string): void {
  console.log(`[Arkzen Astro Router] Unregistering: ${tatName}`)

  const tatemonoDir = path.join(PAGES_DIR, tatName)
  if (fs.existsSync(tatemonoDir)) {
    fs.rmSync(tatemonoDir, { recursive: true })
    console.log(`[Arkzen Astro Router] ✓ Removed: ${tatemonoDir}`)
  }

  // Clean up island .tsx files from src/arkzen/generated/islands/
  const islandsDir = path.join(SRC_DIR, 'arkzen', 'generated', 'islands')
  if (fs.existsSync(islandsDir)) {
    const files = fs.readdirSync(islandsDir)
    for (const file of files) {
      if (file.startsWith(tatName + '_') && file.endsWith('.tsx')) {
        fs.unlinkSync(path.join(islandsDir, file))
      }
    }
  }

  // Clean up component directory
  const componentsDir = path.join(SRC_DIR, 'arkzen', 'generated', 'components', tatName)
  if (fs.existsSync(componentsDir)) {
    fs.rmSync(componentsDir, { recursive: true })
    console.log(`[Arkzen Astro Router] ✓ Removed components: ${componentsDir}`)
  }

  // Styles are co-located in tatemonoDir/styles/ — already removed by tatemonoDir rmSync above

  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.unlinkSync(animPath)
    console.log(`[Arkzen Astro Router] ✓ Animation file removed`)
  }

  // v6.5: clean up script files
  cleanScriptFiles(GENERATED_DIR, tatName)

  // Remove from in-memory routes
  // Remove all routes for this tatemono
  const toRemove = _allRoutes.filter(r => r.name.startsWith(tatName + '/'))
  toRemove.forEach(r => _allRoutes.splice(_allRoutes.indexOf(r), 1))
  writeRouteRegistry(_allRoutes)
}

export function softUnregisterAstroPages(tatName: string): void {
  console.log(`[Arkzen Astro Router] Soft-unregistering (rebuild): ${tatName}`)

  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.unlinkSync(animPath)
  }

  // v6.5: clean up script files
  cleanScriptFiles(GENERATED_DIR, tatName)
}