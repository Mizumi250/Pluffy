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
//   5. Native    — mandatory @arkzen:import:expo/:rn DSL for Expo/RN blocks
//   6. Consistency — model/table name alignment
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parseTatemono } from './parser'
import type { ParsedTatemono, ValidationResult, ArkzenDatabase } from '../types'

const VALID_COLUMN_TYPES = new Set([
  'integer', 'bigInteger', 'string', 'text', 'longText',
  'decimal', 'float', 'boolean', 'date', 'datetime',
  'timestamp', 'json', 'uuid',
])

const VALID_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

// ─── Native DSL check ──────────────────────────────────────────────────────
function hasImportDSL(raw: string): boolean {
  return raw.includes('/* @arkzen:import:expo') || raw.includes('/* @arkzen:import:rn')
}

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
  if (parsed.pages.length === 0 && parsed.nativePages.length === 0 && parsed.nativeLynxPages.length === 0) {
    errors.push('At least one @arkzen:web:page:name, @arkzen:native:page:name, or @arkzen:native:page:lynx:name section is required')
  }

  if (parsed.components.length === 0 && parsed.nativeComponents.length === 0 && parsed.nativeLynxComponents.length === 0) {
    warnings.push('No @arkzen:components or @arkzen:native:components found – consider adding shared UI components.')
  }

  // ── 2. Database ───────────────────────────────
  const tableNames = new Set(parsed.databases.map(d => d.table))
  tableNames.add('users')

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
  const validWebLayouts = new Set(['guest', 'auth', ...parsed.layouts.map(l => l.name)])

  for (const page of parsed.pages) {
    if (!validWebLayouts.has(page.layout)) {
      errors.push(
        `Web page "${page.name}": layout "${page.layout}" is not defined. ` +
        `Valid layouts: ${[...validWebLayouts].join(', ')}. ` +
        `To define a custom layout, use @arkzen:web:layout:${page.layout}`
      )
    }
  }

  if (parsed.meta.auth) {
    const guestPages = parsed.pages.filter(p => p.layout === 'guest')
    const authPages  = parsed.pages.filter(p => p.layout === 'auth')
    if (guestPages.length === 0 && authPages.length > 0) {
      warnings.push(
        'auth: true is set but no guest (public) pages found. ' +
        'Users will have no way to log in. Add @arkzen:web:page:layout:guest to a login page.'
      )
    }
  }

  // ── 5. Native: MANDATORY IMPORT DSL CHECK ──────────────────────────────
  // Per your table: Expo and Bare RN blocks MUST have @arkzen:import:expo or :rn
  // Lynx blocks use :lynx suffix – they are self-contained, no import DSL required.

  // 5a. Native pages (Expo / Bare RN)
  for (const page of parsed.nativePages) {
    if (!hasImportDSL(page.raw)) {
      errors.push(
        `Native page "${page.name}" targets Expo or Bare RN but does not contain ` +
        `an @arkzen:import:expo or @arkzen:import:rn block. ` +
        `Per the DSL table, every native page must be wrapped with the appropriate import DSL.`
      )
    }
  }

  // 5b. Native layouts (Expo / Bare RN)
  for (const layout of parsed.nativeLayouts) {
    if (!hasImportDSL(layout.raw)) {
      errors.push(
        `Native layout "${layout.name}" targets Expo or Bare RN but does not contain ` +
        `an @arkzen:import:expo or @arkzen:import:rn block.`
      )
    }
  }

  // 5c. Native components (Expo / Bare RN)
  for (const comp of parsed.nativeComponents) {
    if (!hasImportDSL(comp.raw)) {
      errors.push(
        `Native component block "${comp.name}" targets Expo or Bare RN but does not contain ` +
        `an @arkzen:import:expo or @arkzen:import:rn block.`
      )
    }
  }

  // 5d. Native error handlers (Expo / Bare RN)
  for (const err of parsed.nativeErrorHandlers) {
    if (!hasImportDSL(err.raw)) {
      errors.push(
        `Native error handler (${err.type}) targets Expo or Bare RN but does not contain ` +
        `an @arkzen:import:expo or @arkzen:import:rn block.`
      )
    }
  }

  // 5e. Lynx blocks – NO import DSL required. We do NOT check them.

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
  return str.replace(/(?<!^)[A-Z]/g, '_$0').toLowerCase()
}