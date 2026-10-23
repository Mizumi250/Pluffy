// ============================================================
// ARKZEN ENGINE — TATEMONO VALIDATOR v6.0
// Pre-build validation. Run before engine builds.
//
// Usage: node validate.js <tatemono-name>
//   or:  import { validateTatemono } from './validator'
//
// Checks:
//   1. Structure — required sections, marker syntax
//   2. Database  — table names, types, foreign keys, no circles
//   3. API       — naming conventions, methods, prefixes
//   4. Pages     — layout declarations, no duplicates
//   5. Native    — target-specific parsing and duplicate pages
//   6. Consistency — model/table name alignment
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parsePageLayoutDecl, parseTatemono } from './parser'
import type { ParsedTatemono, ValidationResult, ArkzenDatabase } from '../types'

const VALID_COLUMN_TYPES = new Set([
  'integer', 'bigInteger', 'string', 'text', 'longText',
  'decimal', 'float', 'boolean', 'date', 'datetime',
  'timestamp', 'json', 'uuid', 'foreignId',
])

const VALID_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

// ────────────────────────────────────────────────────────────────────────────
// MAIN VALIDATOR
// ────────────────────────────────────────────────────────────────────────────

export function validateTatemono(filePath: string): ValidationResult {
  const errors:   string[] = []
  const warnings: string[] = []

  let parsed: ParsedTatemono

  try {
    parsed = parseTatemono(filePath)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { valid: false, errors: [msg], warnings }
  }

  // ── 1. Structure ─────────────────────────────
  if (parsed.desktopConfig) {
    const windowConfig = parsed.desktopConfig.window
    if (
      windowConfig !== undefined &&
      (!windowConfig || typeof windowConfig !== 'object' || Array.isArray(windowConfig))
    ) {
      errors.push('@arkzen:desktop:config window must be a mapping')
    } else if (windowConfig) {
      for (const key of ['width', 'height', 'min_width', 'min_height'] as const) {
        const value = windowConfig[key]
        if (value !== undefined && (!Number.isInteger(value) || value <= 0)) {
          errors.push(`@arkzen:desktop:config window.${key} must be a positive integer`)
        }
      }
      for (const key of ['resizable', 'fullscreenable'] as const) {
        const value = windowConfig[key]
        if (value !== undefined && typeof value !== 'boolean') {
          errors.push(`@arkzen:desktop:config window.${key} must be true or false`)
        }
      }
      if (windowConfig.title !== undefined && (typeof windowConfig.title !== 'string' || !windowConfig.title.trim())) {
        errors.push('@arkzen:desktop:config window.title must be a non-empty string')
      }
      if (
        windowConfig.width !== undefined &&
        windowConfig.min_width !== undefined &&
        windowConfig.min_width > windowConfig.width
      ) {
        errors.push('@arkzen:desktop:config window.min_width cannot exceed window.width')
      }
      if (
        windowConfig.height !== undefined &&
        windowConfig.min_height !== undefined &&
        windowConfig.min_height > windowConfig.height
      ) {
        errors.push('@arkzen:desktop:config window.min_height cannot exceed window.height')
      }
    }
  }

  if (parsed.pages.length === 0 && parsed.nativePages.length === 0 && parsed.nativeLynxPages.length === 0) {
    errors.push('At least one @arkzen:web:page:name, @arkzen:native:page:name, or @arkzen:native:page:lynx:name section is required')
  }

  if (parsed.components.length === 0 && parsed.nativeComponents.length === 0 && parsed.nativeLynxComponents.length === 0) {
    warnings.push('No @arkzen:components or @arkzen:native:components found – consider adding shared UI components.')
  }

  // ── 2. Database ───────────────────────────────
  const tableNames = new Set(parsed.databases.map(d => d.table))
  tableNames.add('users')
  const tablePrefix = parsed.meta.name.replace(/-/g, '_')
  for (const db of parsed.databases) {
    tableNames.add(`${tablePrefix}_${db.table}`)
  }

  for (const db of parsed.databases) {
    if (!/^[a-z][a-z0-9_]*s$/.test(db.table) && db.table !== 'users') {
      warnings.push(`Table "${db.table}" should be plural snake_case (e.g., "${db.table}s")`)
    }

    for (const [colName, col] of Object.entries(db.columns)) {
      if (!VALID_COLUMN_TYPES.has(col.type)) {
        errors.push(`Table "${db.table}", column "${colName}": invalid type "${col.type}"`)
      }

      if (col.foreign) {
        const [refTable] = col.foreign.split('.')
        if (!tableNames.has(refTable)) {
          errors.push(
            `Table "${db.table}", column "${colName}": foreign key references unknown table "${refTable}". ` +
            `Only tables within this tatemono or "users" are allowed.`
          )
        }
      }
    }
  }

  const circularErrors = detectCircularDeps(parsed.databases)
  errors.push(...circularErrors)

  const seenTables = new Set<string>()
  for (const db of parsed.databases) {
    if (seenTables.has(db.table)) {
      errors.push(`Duplicate table declaration: "${db.table}"`)
    }
    seenTables.add(db.table)
  }

  // ── 3. API ────────────────────────────────────
  for (const api of parsed.apis) {
    if (!api.controller.endsWith('Controller')) {
      errors.push(`API controller "${api.controller}" must end with "Controller" (e.g., "${api.controller}Controller")`)
    }

    if (!/^[A-Z][a-zA-Z0-9]*$/.test(api.model)) {
      errors.push(`API model "${api.model}" must be PascalCase`)
    }

    if (!api.prefix.startsWith('/api/')) {
      errors.push(`API prefix "${api.prefix}" must start with /api/ (e.g., /api/${api.model.toLowerCase()}s)`)
    }

    for (const [epName, ep] of Object.entries(api.endpoints)) {
      if (ep.method && !VALID_METHODS.has(ep.method)) {
        errors.push(`API "${api.controller}", endpoint "${epName}": invalid method "${ep.method}"`)
      }
    }
  }

  const seenControllers = new Set<string>()
  for (const api of parsed.apis) {
    if (seenControllers.has(api.controller)) {
      errors.push(`Duplicate controller: "${api.controller}"`)
    }
    seenControllers.add(api.controller)
  }

  // ── 4. Pages (web) ──────────────────────────────
  const declaredWebLayouts = new Set(parsed.layouts.map(layout => layout.name))

  for (const page of parsed.pages) {
    const { layout } = parsePageLayoutDecl(page.layout)
    const missingLayouts = (layout?.split(':') ?? []).filter(name => !declaredWebLayouts.has(name))
    if (missingLayouts.length > 0) {
      errors.push(
        `Web page "${page.name}": layout "${missingLayouts.join(':')}" is not defined. ` +
        `Valid layouts: ${[...declaredWebLayouts].join(', ') || '(none)'}. ` +
        `To define a custom layout, use @arkzen:web:layout:${missingLayouts[0]}`
      )
    }
  }

  if (parsed.meta.auth) {
    const guestPages = parsed.pages.filter(page => parsePageLayoutDecl(page.layout).guard === 'guest')
    const authPages  = parsed.pages.filter(page => parsePageLayoutDecl(page.layout).guard === 'auth')
    if (guestPages.length === 0 && authPages.length > 0) {
      warnings.push(
        'auth: true is set but no guest (public) pages found. ' +
        'Users will have no way to log in. Add @arkzen:web:page:layout:guest to a login page.'
      )
    }
  }

  // Native blocks may be shared across Expo/RN or explicitly target one runtime.
  // The parser and builders resolve those imports; markerless legacy blocks are valid.

  // Duplicate native page names
  const seenNativePages = new Set<string>()
  for (const page of parsed.nativePages) {
    if (seenNativePages.has(page.name)) {
      errors.push(`Duplicate native page: "${page.name}"`)
    }
    seenNativePages.add(page.name)
  }

  const seenLynxPages = new Set<string>()
  for (const page of parsed.nativeLynxPages) {
    if (seenLynxPages.has(page.name)) {
      errors.push(`Duplicate Lynx page: "${page.name}"`)
    }
    seenLynxPages.add(page.name)
  }

  // ── 6. Consistency ────────────────────────────
  for (const api of parsed.apis) {
    const expectedTable = toSnakeCase(api.model) + 's'
    const hasTable = parsed.databases.some(d => d.table === expectedTable || d.table === toSnakeCase(api.model))
    if (!hasTable && parsed.databases.length > 0) {
      warnings.push(
        `API model "${api.model}" expects table "${expectedTable}" — ` +
        `ensure a @arkzen:database block declares table: ${expectedTable}`
      )
    }
  }

  for (const db of parsed.databases) {
    if (db.table === 'users' && db.columns['role']) {
      warnings.push(`users table uses custom "role" column — ensure your auth logic handles this`)
    }
  }

  const valid = errors.length === 0

  if (valid) {
    console.log(`\n✓ Valid tatemono: ${parsed.meta.name}`)
    console.log(`  - ${parsed.databases.length} table(s): ${parsed.databases.map(d => d.table).join(', ')}`)
    console.log(`  - ${parsed.apis.length} resource(s): ${parsed.apis.map(a => a.model).join(', ')}`)
    console.log(`  - ${parsed.pages.length} web page(s): ${parsed.pages.map(p => `${p.name}[${p.layout}]`).join(', ')}`)
    console.log(`  - ${parsed.nativePages.length} native page(s): ${parsed.nativePages.map(p => p.name).join(', ')}`)
    if (parsed.nativeLynxPages.length > 0) {
      console.log(`  - ${parsed.nativeLynxPages.length} Lynx page(s): ${parsed.nativeLynxPages.map(p => p.name).join(', ')}`)
    }
    if (warnings.length > 0) {
      console.log(`  - ${warnings.length} warning(s):`)
      warnings.forEach(w => console.log(`    ⚠ ${w}`))
    } else {
      console.log(`  - No warnings`)
    }
  } else {
    console.log(`\n✗ Invalid tatemono: ${parsed.meta.name}`)
    errors.forEach(e => console.log(`  ✗ ${e}`))
    if (warnings.length > 0) {
      warnings.forEach(w => console.log(`  ⚠ ${w}`))
    }
  }

  return {
    valid,
    errors,
    warnings,
    summary: valid ? {
      tables:    parsed.databases.map(d => d.table),
      pages:     parsed.pages.map(p => p.name),
      resources: parsed.apis.map(a => a.model),
    } : undefined,
  }
}

// ─────────────────────────────────────────────
// CIRCULAR DEPENDENCY DETECTION
// ─────────────────────────────────────────────

function detectCircularDeps(databases: ArkzenDatabase[]): string[] {
  const errors: string[] = []
  const deps = new Map<string, Set<string>>()

  for (const db of databases) {
    const d = new Set<string>()
    for (const col of Object.values(db.columns)) {
      if (col.foreign) d.add(col.foreign.split('.')[0])
    }
    deps.set(db.table, d)
  }

  function hasCycle(table: string, visited: Set<string>, stack: Set<string>): boolean {
    visited.add(table)
    stack.add(table)
    for (const dep of deps.get(table) ?? []) {
      if (!visited.has(dep)) {
        if (hasCycle(dep, visited, stack)) return true
      } else if (stack.has(dep)) {
        return true
      }
    }
    stack.delete(table)
    return false
  }

  const visited = new Set<string>()
  for (const db of databases) {
    if (!visited.has(db.table)) {
      if (hasCycle(db.table, visited, new Set())) {
        errors.push(`Circular foreign key dependency detected involving table "${db.table}"`)
      }
    }
  }

  return errors
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function toSnakeCase(str: string): string {
  return str.replace(/(?<!^)([A-Z])/g, '_$1').toLowerCase()
}