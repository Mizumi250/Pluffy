// Parse, validate and emit one extension tatemono into this stack.
//
//   tsx arkzen/emit.ts <path to core.tsx>
//
// Writes entrypoints/, public/ and arkzen/generated/. The summary of the build (name, version, zip name,
// browsers) is in arkzen/generated/ext.json for the caller. Exit code 1 means the tatemono was not emitted.
import * as path from 'node:path'
import { syncShared } from './sync'

const STACK_DIR = path.resolve(import.meta.dirname, '..')

function fail(lines: string[]): never {
  for (const line of lines) console.error(line)
  process.exit(1)
}

const target = process.argv[2]
if (!target) fail(['Usage: tsx arkzen/emit.ts <path to core.tsx>'])
const corePath = path.resolve(target)

syncShared()
const { validateTatemono } = await import('./core/validator')
const { parseTatemono }    = await import('./core/parser')
const { emitExtension, writeEmit, ExtEmitError } = await import('./core/ext-router')

// The parser and validator log a lot. Their findings are printed below instead.
const log = console.log
const quiet = <T>(fn: () => T): T => {
  console.log = () => {}
  try { return fn() } finally { console.log = log }
}

try {
  const result = quiet(() => validateTatemono(corePath))
  for (const w of result.warnings) console.log(`  ⚠ ${w}`)
  if (!result.valid) fail(result.errors.map(e => `  ✗ ${e}`))

  const parsed = quiet(() => parseTatemono(corePath))
  const emit   = emitExtension(parsed, { assetsDir: path.join(path.dirname(corePath), 'assets') })
  writeEmit(emit, STACK_DIR)

  for (const w of emit.warnings) console.log(`  ⚠ ${w}`)
  console.log(`  ✓ Emitted ${emit.name} ${emit.version} (${emit.files.length} files, ${emit.browsers.join(', ')})`)
} catch (error) {
  if (error instanceof ExtEmitError) fail([`  ✗ ${error.message}`])
  throw error
}
