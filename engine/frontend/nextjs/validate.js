#!/usr/bin/env node

// ============================================================
// ARKZEN ENGINE — TATEMONO VALIDATOR v5.0
// Pre-build validation CLI.
//
// Usage:
//   node validate.js <tatemono-name>
//   node validate.js client-portal
//
// Validates WITHOUT building. Safe to run at any time.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR    = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const MODULES_DIR = path.join(ROOT_DIR, 'tatemonos')

const tatemononName = process.argv[2]

if (!tatemononName) {
  console.log('\n  Usage: node validate.js <tatemono-name>')
  console.log('  Example: node validate.js client-portal\n')
  process.exit(1)
}

const filePath = path.join(MODULES_DIR, tatemononName, 'core.tsx')

if (!fs.existsSync(filePath)) {
  console.error(`\n  ✗ Tatemono not found: ${filePath}\n`)
  process.exit(1)
}

try {
  const { tsImport } = await import('tsx/esm/api')
  const { validateTatemono } = await tsImport('./arkzen/core/validator.ts', import.meta.url)
  const result = validateTatemono(filePath)
  process.exit(result.valid ? 0 : 1)
} catch (e) {
  console.error('\n  ✗ Could not load the Arkzen validator:')
  console.error(`    ${e instanceof Error ? e.message : String(e)}\n`)
  process.exit(1)
}
