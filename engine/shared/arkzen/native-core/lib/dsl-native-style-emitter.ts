// ============================================================
// ARKZEN ENGINE — DSL NATIVE STYLE EMITTER
// Converts @arkzen:native:style:name CSS blocks into
// React Native StyleSheet.create({}) TypeScript files.
//
// Output: src/arkzen/generated/{tatName}.native-styles.ts
// Export: export const s = StyleSheet.create({ ... })
//
// Usage in page block:
//   import { s } from '../../arkzen/generated/{tatName}.native-styles'
//
// CSS→RN conversion rules:
//   - Selector becomes the key name  (.container → container)
//   - kebab-case → camelCase         (background-color → backgroundColor)
//   - px values → numbers            (16px → 16)
//   - Unsupported props are dropped  (transition, animation, @keyframes, etc.)
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'

interface ArkzenSection {
  raw:   string
  name?: string
  start: number
  end:   number
}

// ─── CSS property → RN camelCase ─────────────────────────────────────────────

function toRNProp(cssProp: string): string {
  return cssProp.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

// ─── CSS value → RN value ─────────────────────────────────────────────────────

function toRNValue(prop: string, value: string): string | number | null {
  const v = value.trim()

  // Drop unsupported values
  if (v.includes('linear-gradient') || v.includes('color-mix') ||
      v.includes('calc(') || v.includes('var(') ||
      v === 'none' && prop === 'transition') return null

  // px → number
  if (/^-?\d+(\.\d+)?px$/.test(v)) {
    return parseFloat(v)
  }

  // plain number
  if (/^-?\d+(\.\d+)?$/.test(v)) {
    return parseFloat(v)
  }

  // percentage — keep as string
  if (/^-?\d+(\.\d+)?%$/.test(v)) return `'${v}'`

  // rgba / rgb / hex — keep as string
  if (v.startsWith('rgba(') || v.startsWith('rgb(') || v.startsWith('#')) {
    return `'${v}'`
  }

  // keywords
  return `'${v}'`
}

// ─── CSS props that RN doesn't support — drop silently ───────────────────────

const UNSUPPORTED_PROPS = new Set([
  'transition', 'animation', 'animation-name', 'animation-duration',
  'animation-timing-function', 'animation-iteration-count', 'animation-fill-mode',
  'animation-delay', 'cursor', 'pointer-events', 'user-select',
  'white-space',
  '-webkit-background-clip', '-webkit-text-fill-color',
  'background-clip', 'grid-template-columns', 'grid-column',
  'grid-row', 'list-style', 'appearance', 'content',
  'transform-origin', 'transform-style', 'perspective',
  'will-change', 'filter', 'backdrop-filter',
])

function parseBoxShadow(value: string): Record<string, string | number> {
  if (value.trim() === 'none') return {}

  const colorMatch = value.match(/rgba?\([^)]*\)|#[\da-fA-F]{3,8}/)
  const numericValues = value
    .replace(colorMatch?.[0] ?? '', '')
    .match(/-?\d+(?:\.\d+)?/g)
    ?.map(Number) ?? []

  if (numericValues.length < 2) return {}

  const [offsetX, offsetY, blur = 0] = numericValues
  const alphaMatch = colorMatch?.[0].match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)
  const opacity = alphaMatch ? Number(alphaMatch[1]) : 0.25
  const shadowColor = colorMatch ? `'${colorMatch[0]}'` : "'black'"
  const shadowOffset = `{ width: ${offsetX}, height: ${offsetY} }`

  return {
    shadowColor,
    shadowOffset,
    shadowOpacity: opacity,
    shadowRadius: Math.max(0, blur),
    elevation: Math.max(1, Math.round(Math.max(0, blur) / 2 + Math.abs(offsetY))),
  }
}

// ─── Parse one CSS rule block into RN style object entries ────────────────────

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

    if (cssProp === 'box-shadow') {
      Object.assign(result, parseBoxShadow(cssValue))
      continue
    }
    if (UNSUPPORTED_PROPS.has(cssProp)) continue
    if (cssProp.startsWith('@') || cssProp.startsWith('//')) continue

    const rnProp  = toRNProp(cssProp)
    const rnValue = toRNValue(cssProp, cssValue)
    if (rnValue === null) continue

    result[rnProp] = rnValue
  }

  return result
}

// ─── Format a single style entry for output ──────────────────────────────────

function formatStyleObject(obj: Record<string, string | number>): string {
  if (Object.keys(obj).length === 0) return '{}'
  const entries = Object.entries(obj)
    .map(([k, v]) => `    ${k}: ${v},`)
    .join('\n')
  return `{\n${entries}\n  }`
}

// ─── Convert full CSS block string to StyleSheet.create content ───────────────

function cssToStyleSheet(css: string): Map<string, Record<string, string | number>> {
  const styleEntries = new Map<string, Record<string, string | number>>()

  // Match .className { ... } blocks
  const ruleRe = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g
  let m: RegExpExecArray | null

  while ((m = ruleRe.exec(css)) !== null) {
    const className  = m[1]
    const rnKey      = className.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    const declarations = m[2]
    const obj        = parseCssBlock(declarations)
    if (Object.keys(obj).length === 0) continue
    styleEntries.set(rnKey, { ...styleEntries.get(rnKey), ...obj })
  }

  return styleEntries
}

// ─── Main emitter ─────────────────────────────────────────────────────────────

export function emitNativeStyles(
  tatName:          string,
  nativeStyles:     ArkzenSection[],
  generatedDir:     string,
  label = 'Arkzen Native Style',
  nativeStyleGlobal?: ArkzenSection,  // v10.6: optional global (unnamed) block
): void {
  const outPath = path.join(generatedDir, `${tatName}.native-styles.ts`)

  // v10.6: merge global block + named blocks into one list for processing
  const allBlocks: ArkzenSection[] = [
    ...(nativeStyleGlobal ? [nativeStyleGlobal] : []),
    ...(nativeStyles ?? []),
  ]

  if (allBlocks.length === 0) {
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath)
      console.log(`[${label}] ✓ Removed stale: ${tatName}.native-styles.ts`)
    }
    return
  }

  // Merge all style blocks into one StyleSheet.create call
  const stylesByName = new Map<string, Record<string, string | number>>()

  for (const block of allBlocks) {
    for (const [name, styles] of cssToStyleSheet(block.raw)) {
      stylesByName.set(name, { ...stylesByName.get(name), ...styles })
    }
  }

  if (stylesByName.size === 0) return

  const body = [...stylesByName]
    .map(([name, styles]) => `  ${name}: ${formatStyleObject(styles)}`)
    .join(',\n')

  const output = `// ============================================================
// ARKZEN GENERATED NATIVE STYLES — ${tatName}
// Source: @arkzen:native:style / @arkzen:native:style:*
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
${body},
})
`

  fs.mkdirSync(generatedDir, { recursive: true })

  const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf-8') : ''
  if (existing !== output) {
    fs.writeFileSync(outPath, output, 'utf-8')
    console.log(`[${label}] ✓ ${tatName}.native-styles.ts`)
  }
}
