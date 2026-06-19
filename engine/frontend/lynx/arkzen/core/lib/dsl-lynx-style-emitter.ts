// ============================================================
// ARKZEN ENGINE — DSL LYNX STYLE EMITTER v1.0
// Converts @arkzen:native:style:name CSS blocks into
// plain TypeScript style-object files for Lynx.
//
// Output: src/arkzen/generated/{tatName}.lynx-styles.ts
// Export: export const s = { ... }
//
// Usage in page block:
//   import { s } from '../../arkzen/generated/{tatName}.lynx-styles'
//   <view style={s.container}>
//
// Key difference from native-core's RN emitter:
//   RN:   import { StyleSheet } from 'react-native'
//         export const s = StyleSheet.create({ ... })
//   Lynx: export const s = { ... }   ← plain object, no
//         StyleSheet API exists in Lynx. <view style={s.x}>
//         accepts a raw JS object directly (same shape as
//         inline style props), so StyleSheet.create's
//         identity-caching wrapper is unnecessary overhead
//         here and would be a broken import on this stack.
//
// CSS→Lynx conversion rules:
//   - Selector becomes the key name  (.container → container)
//   - kebab-case → camelCase         (background-color → backgroundColor)
//   - px values → numbers            (16px → 16)
//   - Unsupported web-only props are dropped (cursor, grid-*, etc.)
//   - Lynx DOES support a wider CSS subset than RN (it has a
//     real CSS engine via Rspeedy), so fewer props are dropped
//     here than in the RN emitter — notably `transition` and
//     simple `animation-*` props ARE kept since Lynx supports
//     CSS transitions natively, unlike react-native.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'

interface ArkzenSection {
  raw:   string
  name?: string
  start: number
  end:   number
}

// ─── CSS property → camelCase ─────────────────────────────────────────────

function toLynxProp(cssProp: string): string {
  return cssProp.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

// ─── CSS value → Lynx-safe value ───────────────────────────────────────────

function toLynxValue(prop: string, value: string): string | number | null {
  const v = value.trim()

  // Drop genuinely unsupported values (still no calc()/var() resolution
  // at this stage of the pipeline)
  if (v.includes('color-mix') || v.includes('calc(') || v.includes('var(')) return null

  // px → number (Lynx, like RN, treats numeric style values as logical px)
  if (/^-?\d+(\.\d+)?px$/.test(v)) {
    return parseFloat(v)
  }

  // plain number
  if (/^-?\d+(\.\d+)?$/.test(v)) {
    return parseFloat(v)
  }

  // percentage — keep as string
  if (/^-?\d+(\.\d+)?%$/.test(v)) return `'${v}'`

  // rgba / rgb / hex / linear-gradient — Lynx CSS engine supports these
  // natively as string values (unlike RN which needs gradient libraries)
  if (v.startsWith('rgba(') || v.startsWith('rgb(') || v.startsWith('#') ||
      v.startsWith('linear-gradient(')) {
    return `'${v}'`
  }

  // keywords
  return `'${v}'`
}

// ─── CSS props Lynx doesn't support — drop silently ───────────────────────
// Lynx has a real CSS engine (Rspeedy/Rspack-powered), so this list is
// much shorter than the RN emitter's. Mainly DOM-only interaction props
// that have no meaning in a Lynx view tree.

const UNSUPPORTED_PROPS = new Set([
  'cursor', 'user-select', 'appearance',
  '-webkit-background-clip', '-webkit-text-fill-color', 'background-clip',
  'will-change',
])

// ─── Parse one CSS rule block into Lynx style object entries ──────────────

function parseCssBlock(declarations: string): Record<string, string | number> {
  const result: Record<string, string | number> = {}
  const lines = declarations.split(';')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue

    const cssProp  = trimmed.slice(0, colonIdx).trim()
    const cssValue = trimmed.slice(colonIdx + 1).trim()

    if (UNSUPPORTED_PROPS.has(cssProp)) continue
    if (cssProp.startsWith('@') || cssProp.startsWith('//')) continue

    const lynxProp  = toLynxProp(cssProp)
    const lynxValue = toLynxValue(cssProp, cssValue)
    if (lynxValue === null) continue

    result[lynxProp] = lynxValue
  }

  return result
}

// ─── Format a single style entry for output ────────────────────────────────

function formatStyleObject(obj: Record<string, string | number>): string {
  if (Object.keys(obj).length === 0) return '{}'
  const entries = Object.entries(obj)
    .map(([k, v]) => `    ${k}: ${v},`)
    .join('\n')
  return `{\n${entries}\n  }`
}

// ─── Convert full CSS block string to a plain style-object literal ────────

function cssToStyleObject(css: string): string {
  const styleEntries: string[] = []

  // Match .className { ... } blocks
  const ruleRe = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g
  let m: RegExpExecArray | null

  while ((m = ruleRe.exec(css)) !== null) {
    const className     = m[1]
    const lynxKey        = className.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    const declarations  = m[2]
    const obj           = parseCssBlock(declarations)
    if (Object.keys(obj).length === 0) continue
    styleEntries.push(`  ${lynxKey}: ${formatStyleObject(obj)}`)
  }

  return styleEntries.join(',\n')
}

// ─── Main emitter ───────────────────────────────────────────────────────────

export function emitLynxStyles(
  tatName:          string,
  lynxStyles:       ArkzenSection[],
  generatedDir:     string,
  label = 'Arkzen Lynx Style',
  lynxStyleGlobal?: ArkzenSection,  // optional global (unnamed) block
): void {
  const outPath = path.join(generatedDir, `${tatName}.lynx-styles.ts`)

  const allBlocks: ArkzenSection[] = [
    ...(lynxStyleGlobal ? [lynxStyleGlobal] : []),
    ...(lynxStyles ?? []),
  ]

  if (allBlocks.length === 0) {
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath)
      console.log(`[${label}] ✓ Removed stale: ${tatName}.lynx-styles.ts`)
    }
    return
  }

  const allEntries: string[] = []

  for (const block of allBlocks) {
    const entries = cssToStyleObject(block.raw)
    if (entries) allEntries.push(entries)
  }

  if (allEntries.length === 0) return

  const body = allEntries.join(',\n')

  const output = `// ============================================================
// ARKZEN GENERATED LYNX STYLES — ${tatName}
// Source: @arkzen:native:style / @arkzen:native:style:*
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
//
// Plain style-object export — Lynx has no StyleSheet API.
// <view style={s.container}> accepts this object directly.
// ============================================================

export const s = {
${body},
}
`

  fs.mkdirSync(generatedDir, { recursive: true })

  const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf-8') : ''
  if (existing !== output) {
    fs.writeFileSync(outPath, output, 'utf-8')
    console.log(`[${label}] ✓ ${tatName}.lynx-styles.ts`)
  }
}
