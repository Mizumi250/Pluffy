// ============================================================
// ARKZEN ENGINE — ROUTER v5.1
// - Pages named "index" are placed directly in tatemono folder (app/name/page.tsx)
// - Other pages go into subfolders (app/name/dashboard/page.tsx)
// - Imports are adjusted accordingly (same folder vs parent folder)
// - Generates sitemap.xml and robots.txt for SEO
// - v5.1: Unified import resolver — engine owns all imports in generated files.
//         Authors write imports freely in any block; engine scrapes, deduplicates,
//         merges, and injects one canonical import block per generated file.
// ============================================================

import * as fs from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage, ArkzenErrorHandler } from '../types'
import { writeSitemap } from './sitemap'
import { getRegistry } from './registry'
import { copyAssetsToPublic, cleanOldAssets } from './assets'
import { emitTatemonoStyles } from './lib/dsl-style-emitter'

const APP_DIR   = path.resolve(process.cwd(), 'app')
const PAGES_DIR = path.resolve(process.cwd(), 'pages')

function detectRouterType(): 'app' | 'pages' {
  if (fs.existsSync(APP_DIR)) return 'app'
  return 'pages'
}

// ─────────────────────────────────────────────
// LAYOUT HELPERS — v5
// ─────────────────────────────────────────────

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

/**
 * Extracts the React component name from raw page code.
 * Looks for "const XxxPage = " or "const XxxPage: " patterns.
 * Falls back to toSafeComponentName(pageName) if not found.
 */
function extractComponentName(pageName: string, raw: string): string {
  const match = raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  if (match) return match[1]
  return toSafeComponentName(pageName) + 'Page'
}

// ─────────────────────────────────────────────
// UNIFIED IMPORT RESOLVER — v5.1
//
// Scrapes ALL import statements from any raw code strings,
// deduplicates named exports per module, normalises default
// vs named gsap import, and returns:
//   - canonicalImports : the final import block string
//   - stripped sources : the raw code strings with all import
//                        lines and 'use client' removed
// ─────────────────────────────────────────────

interface ResolvedImports {
  canonicalBlock: string
  strippedSources: string[]
}

/**
 * Known modules that the engine always injects itself.
 * These are EXCLUDED from the scraped imports — engine handles them.
 */
const ENGINE_OWNED_MODULES = new Set([
  'react',
  'framer-motion',
])

function resolveImports(
  sources: string[],
  engineRequired: {
    reactHooks?: string[]         // always-needed React hooks (useRef, useEffect)
    framerNamed?: string[]        // always-needed framer-motion named exports (motion)
    extra?: string                // any extra single-line imports to prepend verbatim
  } = {}
): ResolvedImports {

  // module → { defaultImport?: string, named: Set<string> }
  const importMap = new Map<string, { defaultImport?: string; named: Set<string> }>()

  const getEntry = (mod: string) => {
    if (!importMap.has(mod)) importMap.set(mod, { named: new Set() })
    return importMap.get(mod)!
  }

  // ── Seed engine-required entries ──────────────────────────
  const reactEntry = getEntry('react')
  ;(engineRequired.reactHooks ?? ['useRef', 'useEffect']).forEach(h => reactEntry.named.add(h))

  const framerEntry = getEntry('framer-motion')
  ;(engineRequired.framerNamed ?? ['motion']).forEach(n => framerEntry.named.add(n))

  // ── Patterns ──────────────────────────────────────────────
  // 1. import DefaultName from 'module'
  const defaultImportRe   = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/
  // 2. import { a, b, c } from 'module'
  const namedImportRe     = /^import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  // 3. import Default, { a, b } from 'module'
  const mixedImportRe     = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*,\s*\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  // 4. import * as Ns from 'module'
  const namespaceImportRe = /^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/
  // 5. import 'module'  (side-effect)
  const sideEffectRe      = /^import\s+['"]([^'"]+)['"]\s*;?/

  const sideEffects: string[] = []

  for (const source of sources) {
    const flattened = flattenMultilineImports(source)
    for (const rawLine of flattened.split('\n')) {
      const line = rawLine.trim()
      if (!line.startsWith('import ')) continue

      let m: RegExpMatchArray | null

      // mixed: import Default, { a, b } from 'mod'
      m = line.match(mixedImportRe)
      if (m) {
        const [, def, namedStr, mod] = m
        const entry = getEntry(mod)
        // For react, treat React as implicit — only track hooks
        if (mod !== 'react') entry.defaultImport = def
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      // namespace: import * as Ns from 'mod'
      m = line.match(namespaceImportRe)
      if (m) {
        const [, ns, mod] = m
        getEntry(mod).defaultImport = `* as ${ns}`
        continue
      }

      // named: import { a, b } from 'mod'
      m = line.match(namedImportRe)
      if (m) {
        const [, namedStr, mod] = m
        const entry = getEntry(mod)
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      // default: import Default from 'mod'
      m = line.match(defaultImportRe)
      if (m) {
        const [, def, mod] = m
        if (mod === 'react') continue // React default handled separately
        getEntry(mod).defaultImport = def
        continue
      }

      // side-effect: import 'mod'
      m = line.match(sideEffectRe)
      if (m) {
        sideEffects.push(`import '${m[1]}'`)
        continue
      }
    }
  }

  // ── Normalise gsap default → named ────────────────────────
  // Some tatemonos write `import gsap from 'gsap'` (default),
  // others write `import { gsap } from 'gsap'` (named).
  // Canonical form is always named: import { gsap } from 'gsap'
  if (importMap.has('gsap')) {
    const gsapEntry = importMap.get('gsap')!
    if (gsapEntry.defaultImport === 'gsap') {
      gsapEntry.defaultImport = undefined
      gsapEntry.named.add('gsap')
    }
  }

  // ── Build canonical import block ──────────────────────────
  const lines: string[] = []

  // 1. React always first — `import React, { hooks } from 'react'`
  const reactNamed = [...(importMap.get('react')?.named ?? [])]
    .filter(h => h !== 'React')
    .sort()
  lines.push(
    reactNamed.length > 0
      ? `import React, { ${reactNamed.join(', ')} } from 'react'`
      : `import React from 'react'`
  )

  // 2. framer-motion always second
  const framerNamed = [...(importMap.get('framer-motion')?.named ?? [])].sort()
  if (framerNamed.length > 0) {
    lines.push(`import { ${framerNamed.join(', ')} } from 'framer-motion'`)
  }

  // 3. All other modules — alphabetical by module name
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

  // 4. Side-effects last
  sideEffects.forEach(s => lines.push(s))

  // 5. Verbatim extra (e.g. layout import, animation import)
  if (engineRequired.extra) {
    lines.push(engineRequired.extra)
  }

  const canonicalBlock = lines.filter(Boolean).join('\n')

  // ── Strip all imports + 'use client' from raw sources ─────
  const stripRaw = (src: string) =>
    src
      .replace(/^\s*['"]use client['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '') // side-effect imports
      .trim()

  const strippedSources = sources.map(stripRaw)

  return { canonicalBlock, strippedSources }
}




function flattenMultilineImports(code: string): string {
  const lines = code.split('\n')
  const out: string[] = []
  let inImport = false
  let buffer = ''
  let depth = 0

  // Does a string (after collapsing whitespace) look like a full import?
  const isCompleteImport = (s: string): boolean =>
    /^import\s+(?:(?:[\w*\s{},]+)\s+from\s+['"][^'"]+['"]|['"][^'"]+['"])\s*;?\s*$/.test(s)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!inImport && /^\s*import\s/.test(line)) {
      inImport = true
      buffer = trimmed
      depth += (trimmed.match(/\{/g) || []).length
      depth -= (trimmed.match(/\}/g) || []).length
      // Collapse whitespace and test immediately (single‑line import)
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

// ─────────────────────────────────────────────
// GENERATE INDIVIDUAL COMPONENT FILES
// ─────────────────────────────────────────────

function generateIndividualComponentFiles(tatemono: ParsedTatemono, baseDir: string): void {
  if (tatemono.components.length === 0) return

  const componentsDir = path.join(baseDir, 'components')
  fs.mkdirSync(componentsDir, { recursive: true })

  // Resolve imports across ALL component blocks into one canonical block
  const rawSources = tatemono.components.map(c => c.raw.trim())
  const { canonicalBlock, strippedSources } = resolveImports(rawSources)

  const componentsFile = path.join(componentsDir, '_components.tsx')
  const componentsContent = `'use client'
// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — ${tatemono.meta.name}
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${strippedSources.join('\n\n')}
`
  fs.writeFileSync(componentsFile, componentsContent, 'utf-8')
  console.log(`[Arkzen Router] ✓ Utilities: _components.tsx`)

  // Build a map of component names that have CSS Modules (from named styles)
  const stylesByComponent = new Map<string, string>()
  for (const style of tatemono.styles.filter(s => s.name)) {
    stylesByComponent.set(style.name, style.name)
  }

  // Extract PascalCase component names from components block
  // Skip types and ALL_CAPS constants (only extract actual components)
  const extractedComponents = new Set<string>()
  for (const component of tatemono.components) {
    const componentMatches = component.raw.match(/(?:export\s+)?const\s+([A-Z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of componentMatches) {
      const name = match.match(/const\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^[A-Z_]+$/.test(name)) {
        extractedComponents.add(name)
      }
    }
  }

  // Generate individual component files that import from _components
  for (const compName of extractedComponents) {
    const fileName = `${compName}.tsx`
    const filePath = path.join(componentsDir, fileName)

    const cssImport = stylesByComponent.has(compName)
      ? `import styles from '../styles/${compName}.module.css'\n`
      : ''

    const content = `'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ${compName}
// Re-exported from _components.tsx
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${cssImport}export { ${compName} } from './_components'
`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Router] ✓ Component: ${fileName}`)
  }

  // Clean up old loose files
  try {
    const files = fs.readdirSync(componentsDir)
    for (const file of files) {
      if (file.endsWith('.tsx') && !file.startsWith('_') && !extractedComponents.has(file.replace('.tsx', ''))) {
        fs.unlinkSync(path.join(componentsDir, file))
      }
    }
  } catch (e) {
    // ignore
  }
}

// ─────────────────────────────────────────────
// GENERATE COMPONENTS INDEX FILE (for easy imports)
// ─────────────────────────────────────────────

function generateComponentsIndex(tatemono: ParsedTatemono, baseDir: string): void {
  if (tatemono.components.length === 0) return

  const componentsDir = path.join(baseDir, 'components')
  const indexPath = path.join(componentsDir, 'index.ts')

  const content = `// ============================================================
// ARKZEN GENERATED COMPONENTS INDEX — ${tatemono.meta.name}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

export * from './_components'
`
  fs.writeFileSync(indexPath, content, 'utf-8')
  console.log(`[Arkzen Router] ✓ Components index: index.ts`)
}

// ─────────────────────────────────────────────
// GENERATE PAGE FILE — one per route
// ─────────────────────────────────────────────

function generatePageFile(
  tatemono: ParsedTatemono,
  page: ArkzenPage,
  animationFnName: string | null,
  componentsImportPath: string
): string {
  const componentName = extractComponentName(page.name, page.raw)
  const layoutImport  = getLayoutImport(page.layout, tatemono.meta)
  const layoutComp    = getLayoutComponent(page.layout)
  const isAuthLayout  = page.layout === 'auth'
  const isGuestLayout = page.layout === 'guest'

  const isGuestOnly = isGuestLayout && (
    (page as any).guestOnly === true ||
    (tatemono.meta.auth && ['login', 'register', 'forgot-password', 'reset-password'].includes(page.name))
  )

  // Collect all sources: all component blocks + this page's raw code
  const allSources = [
    ...tatemono.components.map(c => c.raw.trim()),
    page.raw.trim(),
  ]

  // Scrape framer-motion named exports from all sources so we don't lose
  // AnimatePresence, useMotionValue etc. that the tatemono uses
  const framerNeeded = new Set(['motion'])
  const framerRe = /import\s+\{([^}]*)\}\s+from\s+['"]framer-motion['"]/g
  for (const src of allSources) {
    let m: RegExpMatchArray | null
    while ((m = framerRe.exec(src)) !== null) {
      m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => framerNeeded.add(n))
    }
  }

  const animImportLine = animationFnName
    ? `import { ${animationFnName}, pageVariants } from '@/arkzen/generated/${tatemono.meta.name}.animations'`
    : ''

  const extraLines = [layoutImport, animImportLine].filter(Boolean).join('\n')

  const { canonicalBlock: rawCanonicalBlock, strippedSources } = resolveImports(allSources, {
    reactHooks:   ['useRef', 'useEffect'],
    framerNamed:  [...framerNeeded],
    extra:        extraLines,
  })

  // Pages live at pages/{tat}/{page}.tsx but .scripts/.script files are at arkzen/generated/
  // Rewrite any './{name}.scripts' or './{name}.*.script' to '@/arkzen/generated/{name}...'
  const canonicalBlock = rawCanonicalBlock.replace(
    /from\s+['"]\.\/([\w-]+\.scripts|[\w-]+\.[\w-]+\.script)['"]/g,
    `from '@/arkzen/generated/$1'`
  )

  // strippedSources: [comp0, comp1, ..., pageRaw]
  const strippedComponentCode = strippedSources.slice(0, tatemono.components.length).join('\n\n')
  const strippedPageCode      = (strippedSources[tatemono.components.length] ?? '')
    // FIX: isMounted cleanup-only useEffect breaks under React StrictMode —
    // StrictMode remounts components in dev, firing the cleanup and permanently
    // setting isMounted.current = false before load() runs, leaving the page
    // stuck on "Loading...". Rewrite to reset isMounted.current = true on mount
    // so the ref is always correct after a remount.
    .replace(
      /useEffect\(\(\)\s*=>\s*\{\s*\n?\s*return\s*\(\)\s*=>\s*\{\s*isMounted\.current\s*=\s*false\s*\}\s*\n?\s*\},\s*\[\]\)/g,
      `useEffect(() => {\n    isMounted.current = true\n    return () => { isMounted.current = false }\n  }, [])`
    )

  return `'use client'
// ============================================================
// ARKZEN GENERATED PAGE — ${tatemono.meta.name}/${page.name}
// Layout: ${page.layout} | Auth guard: ${isAuthLayout} | Guest-only: ${isGuestOnly}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

// Utilities, types, and helper functions from @arkzen:components
${strippedComponentCode}

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

export default ArkzenPage_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)}
`
}

// ─────────────────────────────────────────────
// GENERATE ANIMATION FILE
// ─────────────────────────────────────────────

function generateAnimationFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.animation) return null

  const animFnName = toCamelCase(tatemono.meta.name) + 'Animations'

  // Resolve imports from animation block — engine owns gsap + ScrollTrigger + React
  const { strippedSources } = resolveImports([tatemono.animation.raw], {
    reactHooks:  [],
    framerNamed: [],
  })
  let cleanAnimation = strippedSources[0]
    .replace(/gsap\.registerPlugin\(.*\)[;]?\n?/g, '')
    // strip existing `export` before re-adding — prevents `export export const`
    .replace(new RegExp(`\\bexport\\s+const\\s+${animFnName}\\b`), `const ${animFnName}`)
    .replace(`const ${animFnName}`, `export const ${animFnName}`)
    // strip trailing */ — tatemono wraps animation in block comment; closing */ leaks
    .replace(/\*\/\s*$/, '')
    .trim()

  // Auto-inject pageVariants when the tatemono didn't define one.
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

// ─────────────────────────────────────────────
// GENERATE GLOBAL SCRIPT FILE — v6.5
// Mirrors generateAnimationFile but for @arkzen:script.
// Exports whatever the author wrote — no forced pageVariants injection.
// The engine strips existing imports and re-emits a clean canonical block.
// ─────────────────────────────────────────────

function generateScriptFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.script) return null

  const { strippedSources } = resolveImports([tatemono.script.raw], {
    reactHooks:  [],
    framerNamed: [],
  })

  const cleanScript = strippedSources[0]
    // strip trailing */ leak (tatemono wraps in block comment)
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

// ─────────────────────────────────────────────
// GENERATE NAMED SCRIPT FILES — v6.5
// Each @arkzen:script:name block → {name}.{scriptName}.script.ts
// Named scripts are imported individually by components or pages that need them.
// ─────────────────────────────────────────────

function generateNamedScriptFiles(tatemono: ParsedTatemono, generatedDir: string): string[] {
  const written: string[] = []

  for (const section of tatemono.scripts) {
    // Re-extract the name from the raw content position in the full file
    // extractAllNamedSections stores the raw between open comment and :end
    // We need to recover the identifier by scanning the original file content
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
    const fileOut = `// ============================================================
// ARKZEN GENERATED SCRIPT — ${tatemono.meta.name}/${scriptName}
// Source: @arkzen:script:${scriptName}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${cleanScript}
`
    fs.writeFileSync(filePath, fileOut, 'utf-8')
    console.log(`[Arkzen Router] ✓ Named script: ${fileName}`)
    written.push(fileName)
  }

  return written
}

// ─────────────────────────────────────────────
// GENERATE CUSTOM LAYOUTS
// ─────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono, baseDir: string): void {
  if (tatemono.layouts.length === 0) return

  const customLayoutDir = path.join(
    path.resolve(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
  )
  fs.mkdirSync(customLayoutDir, { recursive: true })

  for (const layout of tatemono.layouts) {
    // Resolve imports in the layout block itself
    const { canonicalBlock, strippedSources } = resolveImports([layout.raw], {
      reactHooks:  [],
      framerNamed: [],
    })

    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(customLayoutDir, fileName)
    const content  = `'use client'
// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name}
// Generated from tatemono: ${tatemono.meta.name}

${canonicalBlock}

${strippedSources[0]}
`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─────────────────────────────────────────────
// GENERATE ERROR HANDLER FILES — v6
// ─────────────────────────────────────────────

function generateNotFoundFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const raw = handler.raw.replace(/'use client'[;]?\n?/, '').trim()

  return `// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/not-found.tsx
// Next.js segment-scoped 404 handler.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:404 block in the tatemono instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import React from 'react'
import { ErrorScreen } from './components'

${raw}

export default NotFoundPage
`
}

function generateErrorFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const raw = handler.raw.replace(/'use client'[;]?\n?/, '').trim()

  return `'use client'
// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/error.tsx
// Next.js segment-scoped runtime error boundary.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:500 block in the tatemono instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import React from 'react'
import { ErrorScreen } from './components'

${raw}

export default function ArkzenError_${toPascalCase(tatemono.meta.name)}({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ServerErrorPage reset={reset} />
}
`
}

function generateCatchAllRoute(tatemono: ParsedTatemono, tatemonoDir: string): void {
  const catchAllDir = path.join(tatemonoDir, '[...catchAll]')
  fs.mkdirSync(catchAllDir, { recursive: true })
  const content = `import { notFound } from 'next/navigation'

export default function CatchAllPage() {
  notFound()
}
`
  fs.writeFileSync(path.join(catchAllDir, 'page.tsx'), content, 'utf-8')
  console.log(`[Arkzen Router] ✓ Catch-all route created for ${tatemono.meta.name}`)
}

function generateErrorHandlers(tatemono: ParsedTatemono, tatemonoDir: string): void {
  if (!tatemono.errorHandlers || tatemono.errorHandlers.length === 0) return

  let has404 = false
  for (const handler of tatemono.errorHandlers) {
    if (handler.type === '404') {
      has404 = true
      const content = generateNotFoundFile(tatemono, handler)
      fs.writeFileSync(path.join(tatemonoDir, 'not-found.tsx'), content, 'utf-8')
      console.log(`[Arkzen Router] ✓ Error handler: not-found.tsx → /${tatemono.meta.name}/**`)
    } else if (handler.type === '500') {
      const content = generateErrorFile(tatemono, handler)
      fs.writeFileSync(path.join(tatemonoDir, 'error.tsx'), content, 'utf-8')
      console.log(`[Arkzen Router] ✓ Error handler: error.tsx → /${tatemono.meta.name}/**`)
    }
  }
  if (has404) {
    generateCatchAllRoute(tatemono, tatemonoDir)
  }
}

// ─────────────────────────────────────────────
// GENERATE TATEMONO LAYOUT WITH FAVICON
// ─────────────────────────────────────────────

function generateTatemonoLayout(tatemono: ParsedTatemono, tatemonoDir: string): void {
  const hasGlobalStyle = tatemono.styles.some(s => !s.name)
  const hasFavicon = !!tatemono.meta.favicon

  if (!hasFavicon && !hasGlobalStyle) {
    const stale = path.join(tatemonoDir, 'layout.tsx')
    if (fs.existsSync(stale)) {
      fs.unlinkSync(stale)
      console.log(`[Arkzen Router] 🧹 Removed stale layout.tsx (no favicon or global style)`)
    }
    return
  }

  const globalImport = hasGlobalStyle ? `import './styles/global.css'\n` : ''
  const metadataImport = hasFavicon ? `import type { Metadata } from 'next'\n` : ''
  const metadataCode = hasFavicon ? `export const metadata: Metadata = {
  icons: {
    icon: '${tatemono.meta.favicon}',
  },
}` : ''

  const content = `${metadataImport}${globalImport}
${hasFavicon ? metadataCode + '\n\n' : ''}export default function ${toPascalCase(tatemono.meta.name)}Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
`
  fs.writeFileSync(path.join(tatemonoDir, 'layout.tsx'), content, 'utf-8')
  if (hasGlobalStyle) console.log(`[Arkzen Router] ✓ Global style imported in layout`)
  if (hasFavicon) console.log(`[Arkzen Router] ✓ Favicon configured: ${tatemono.meta.favicon}`)
}

// ─────────────────────────────────────────────
// GENERATE CSS STYLES (shared emitter)
// ─────────────────────────────────────────────

function generateStyleFiles(tatemono: ParsedTatemono, tatemonoDir: string): void {
  emitTatemonoStyles(tatemono, tatemonoDir, { loggerLabel: 'Arkzen Router' })
}

// ─────────────────────────────────────────────
// GENERATE ROOT REDIRECT — v5.1
// ─────────────────────────────────────────────

function generateRootRedirect(tatemono: ParsedTatemono): string {
  const pages    = tatemono.pages
  const hasIndex = pages.some(p => p.name === 'index')
  if (hasIndex) return ''

  const firstGuest = pages.find(p => p.layout === 'guest')
  const firstAuth  = pages.find(p => p.layout === 'auth')
  const firstPage  = pages[0]

  const target = tatemono.meta.auth
    ? (firstGuest ?? firstAuth ?? firstPage)
    : (firstAuth  ?? firstGuest ?? firstPage)

  if (!target) return ''

  const destination = `/${tatemono.meta.name}/${target.name}`

  return `// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — ${tatemono.meta.name}
// Visiting /${tatemono.meta.name} redirects to ${destination}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import { redirect } from 'next/navigation'

export default function ArkzenRoot_${toPascalCase(tatemono.meta.name)}() {
  redirect('${destination}')
}
`
}

export function registerPage(tatemono: ParsedTatemono): void {
  const routerType = detectRouterType()
  const animFnName = tatemono.animation
    ? toCamelCase(tatemono.meta.name) + 'Animations'
    : null

  console.log(`[Arkzen Router] Registering ${tatemono.pages.length} page(s) for: ${tatemono.meta.name}`)

  // Generate animation file if present
  if (tatemono.animation) {
    const generatedDir = path.resolve(process.cwd(), 'arkzen', 'generated')
    fs.mkdirSync(generatedDir, { recursive: true })
    const animContent = generateAnimationFile(tatemono)
    if (animContent) {
      const animPath = path.join(generatedDir, `${tatemono.meta.name}.animations.ts`)
      fs.writeFileSync(animPath, animContent, 'utf-8')
      console.log(`[Arkzen Router] ✓ Animation file generated`)
    }
  }

  // v6.5: Generate global script file if present
  if (tatemono.script) {
    const generatedDir = path.resolve(process.cwd(), 'arkzen', 'generated')
    fs.mkdirSync(generatedDir, { recursive: true })
    const scriptContent = generateScriptFile(tatemono)
    if (scriptContent) {
      const scriptPath = path.join(generatedDir, `${tatemono.meta.name}.scripts.ts`)
      fs.writeFileSync(scriptPath, scriptContent, 'utf-8')
      console.log(`[Arkzen Router] ✓ Global script file generated`)
    }
  }

  // v6.5: Generate named script files if present
  if (tatemono.scripts && tatemono.scripts.length > 0) {
    const generatedDir = path.resolve(process.cwd(), 'arkzen', 'generated')
    fs.mkdirSync(generatedDir, { recursive: true })
    generateNamedScriptFiles(tatemono, generatedDir)
  }

  // Generate custom layouts
  generateCustomLayouts(tatemono, '')

  if (routerType === 'app') {
    const tatemonoDir = path.join(APP_DIR, tatemono.meta.name)
    fs.mkdirSync(tatemonoDir, { recursive: true })

    generateIndividualComponentFiles(tatemono, tatemonoDir)
    generateComponentsIndex(tatemono, tatemonoDir)
    generateErrorHandlers(tatemono, tatemonoDir)
    generateTatemonoLayout(tatemono, tatemonoDir)
    generateStyleFiles(tatemono, tatemonoDir)

    const rootRedirect = generateRootRedirect(tatemono)
    if (rootRedirect) {
      fs.writeFileSync(path.join(tatemonoDir, 'page.tsx'), rootRedirect, 'utf-8')
      const target = tatemono.meta.auth
        ? (tatemono.pages.find(p => p.layout === 'guest') ?? tatemono.pages[0])
        : tatemono.pages[0]
      console.log(`[Arkzen Router] ✓ /${tatemono.meta.name} → redirect to /${tatemono.meta.name}/${target?.name}`)
    }

    for (const page of tatemono.pages) {
      if (page.name === 'index') {
        const pagePath = path.join(tatemonoDir, 'page.tsx')
        const pageContent = generatePageFile(tatemono, page, animFnName, './components')
        fs.writeFileSync(pagePath, pageContent, 'utf-8')
        console.log(`[Arkzen Router] ✓ /${tatemono.meta.name} [${page.layout}]`)
      } else {
        const pageDir = path.join(tatemonoDir, page.name)
        fs.mkdirSync(pageDir, { recursive: true })
        const pageContent = generatePageFile(tatemono, page, animFnName, '../components')
        fs.writeFileSync(path.join(pageDir, 'page.tsx'), pageContent, 'utf-8')
        console.log(`[Arkzen Router] ✓ /${tatemono.meta.name}/${page.name} [${page.layout}]`)
      }
    }
  } else {
    const tatemonoDir = path.join(PAGES_DIR, tatemono.meta.name)
    fs.mkdirSync(tatemonoDir, { recursive: true })

    generateIndividualComponentFiles(tatemono, tatemonoDir)
    generateComponentsIndex(tatemono, tatemonoDir)
    generateErrorHandlers(tatemono, tatemonoDir)
    generateStyleFiles(tatemono, tatemonoDir)

    const rootRedirectPages = generateRootRedirect(tatemono)
    if (rootRedirectPages) {
      fs.writeFileSync(path.join(tatemonoDir, 'index.tsx'), rootRedirectPages, 'utf-8')
      const target = tatemono.meta.auth
        ? (tatemono.pages.find(p => p.layout === 'guest') ?? tatemono.pages[0])
        : tatemono.pages[0]
      console.log(`[Arkzen Router] ✓ /${tatemono.meta.name} → redirect to /${tatemono.meta.name}/${target?.name}`)
    }

    for (const page of tatemono.pages) {
      if (page.name === 'index') {
        const pagePath = path.join(tatemonoDir, 'index.tsx')
        const pageContent = generatePageFile(tatemono, page, animFnName, './components')
        fs.writeFileSync(pagePath, pageContent, 'utf-8')
        console.log(`[Arkzen Router] ✓ /${tatemono.meta.name} [${page.layout}]`)
      } else {
        const pageDir = path.join(tatemonoDir, page.name)
        fs.mkdirSync(pageDir, { recursive: true })
        const pageContent = generatePageFile(tatemono, page, animFnName, '../components')
        fs.writeFileSync(path.join(pageDir, 'index.tsx'), pageContent, 'utf-8')
        console.log(`[Arkzen Router] ✓ /${tatemono.meta.name}/${page.name} [${page.layout}]`)
      }
    }
  }

  console.log(`[Arkzen Router] ✓ All pages registered for: ${tatemono.meta.name}`)

  try {
    const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
    const assetsPath = path.join(tatemonosDir, tatemono.meta.name, 'assets')
    const publicDir = path.resolve(process.cwd(), 'public')
    cleanOldAssets(tatemono.meta.name, publicDir)
    const hasAssets = copyAssetsToPublic(tatemono.meta.name, assetsPath, publicDir)
    if (!hasAssets) {
      console.log(`[Arkzen Assets] No assets folder for ${tatemono.meta.name}`)
    }
  } catch (e) {
    console.log(`[Arkzen Assets] ⚠ Asset distribution skipped: ${e}`)
  }

  try {
    const registry = getRegistry()
    writeSitemap(registry)
    writeRobotsTxt()
  } catch (e) {
    console.log(`[Arkzen Router] ⚠ Sitemap generation skipped`)
  }
}

// ─────────────────────────────────────────────
// WRITE ROBOTS.TXT
// ─────────────────────────────────────────────

function writeRobotsTxt(): void {
  const publicDir = path.resolve(process.cwd(), 'public')
  fs.mkdirSync(publicDir, { recursive: true })

  const robotsPath = path.join(publicDir, 'robots.txt')
  const content = `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap.xml
`
  fs.writeFileSync(robotsPath, content, 'utf-8')
  console.log(`[Arkzen Router] ✓ robots.txt generated`)
}

// ─────────────────────────────────────────────
// UNREGISTER — two modes
// ─────────────────────────────────────────────

export function softUnregisterPage(tatemononName: string): void {
  console.log(`[Arkzen Router] Soft-unregistering (rebuild): ${tatemononName}`)
  const generatedDir = path.resolve(process.cwd(), 'arkzen', 'generated')

  const animationPath = path.join(generatedDir, `${tatemononName}.animations.ts`)
  if (fs.existsSync(animationPath)) {
    fs.unlinkSync(animationPath)
    console.log(`[Arkzen Router] ✓ Animation file removed`)
  }

  // v6.5: clean up global script file
  const scriptPath = path.join(generatedDir, `${tatemononName}.scripts.ts`)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath)
    console.log(`[Arkzen Router] ✓ Global script file removed`)
  }

  // v6.5: clean up named script files
  try {
    const files = fs.readdirSync(generatedDir)
    for (const file of files) {
      if (file.startsWith(`${tatemononName}.`) && file.endsWith('.script.ts')) {
        fs.unlinkSync(path.join(generatedDir, file))
        console.log(`[Arkzen Router] ✓ Named script removed: ${file}`)
      }
    }
  } catch { /* ignore */ }
}

export function unregisterPage(tatemononName: string): void {
  console.log(`[Arkzen Router] Unregistering: ${tatemononName}`)
  const routerType = detectRouterType()

  if (routerType === 'app') {
    const tatemonoDir = path.join(APP_DIR, tatemononName)
    if (fs.existsSync(tatemonoDir)) {
      fs.rmSync(tatemonoDir, { recursive: true })
      console.log(`[Arkzen Router] ✓ Removed: ${tatemonoDir}`)
    }
  } else {
    const tatemonoDir = path.join(PAGES_DIR, tatemononName)
    if (fs.existsSync(tatemonoDir)) {
      fs.rmSync(tatemonoDir, { recursive: true })
      console.log(`[Arkzen Router] ✓ Removed: ${tatemonoDir}`)
    }
  }

  const animationPath = path.resolve(
    process.cwd(), 'arkzen', 'generated', `${tatemononName}.animations.ts`
  )
  if (fs.existsSync(animationPath)) {
    fs.unlinkSync(animationPath)
    console.log(`[Arkzen Router] ✓ Animation file removed`)
  }

  // v6.5: clean up global script + named script files
  const generatedDir = path.resolve(process.cwd(), 'arkzen', 'generated')
  const scriptPath = path.join(generatedDir, `${tatemononName}.scripts.ts`)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath)
    console.log(`[Arkzen Router] ✓ Global script file removed`)
  }
  try {
    const files = fs.readdirSync(generatedDir)
    for (const file of files) {
      if (file.startsWith(`${tatemononName}.`) && file.endsWith('.script.ts')) {
        fs.unlinkSync(path.join(generatedDir, file))
        console.log(`[Arkzen Router] ✓ Named script removed: ${file}`)
      }
    }
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────
// STRING HELPERS
// ─────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

function toCamelCase(str: string): string {
  const p = toPascalCase(str)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

function toSafeComponentName(pageName: string): string {
  const pascal = toPascalCase(pageName)
  return /^\d/.test(pascal) ? `Page${pascal}` : pascal
}