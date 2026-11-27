// Reads a tatemono with the real engine parser and validator (the single authority).
//
// The engine core is TypeScript, so it is loaded through tsx. scripts/sync-shared.mjs keeps
// common/core/ in step with engine/shared before every read.
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { register } from 'tsx/esm/api'
import { syncShared } from '../scripts/sync-shared.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const TERMINAL_DIR = path.resolve(HERE, '..')
export const ROOT_DIR = path.resolve(TERMINAL_DIR, '..', '..')

let engine = null
async function loadEngine() {
  if (engine) return engine
  syncShared()
  register()
  const parser = await import('./core/parser.ts')
  const validator = await import('./core/validator.ts')
  engine = { parseTatemono: parser.parseTatemono, validateTatemono: validator.validateTatemono }
  return engine
}

// Accepts a tatemono name (tatemonos/<name>/core.tsx), a folder, or a core.tsx path.
export function resolveTatemonoFile(target) {
  const candidates = [
    path.join(ROOT_DIR, 'tatemonos', target, 'core.tsx'),
    path.resolve(target, 'core.tsx'),
    path.resolve(target),
  ]
  const hit = candidates.find(p => p.endsWith('.tsx') && fs.existsSync(p) && fs.statSync(p).isFile())
  if (!hit) throw new Error(`no tatemono found for "${target}" (looked for tatemonos/${target}/core.tsx)`)
  return hit
}

// The engine prints progress while it parses. Keep a build's output readable.
function quiet(fn) {
  const log = console.log, error = console.error, warn = console.warn
  console.log = console.error = console.warn = () => {}
  try { return fn() } finally { console.log = log; console.error = error; console.warn = warn }
}

export async function readTatemono(target) {
  const file = resolveTatemonoFile(target)
  const { parseTatemono, validateTatemono } = await loadEngine()
  let validation
  try { validation = quiet(() => validateTatemono(file)) } catch (e) {
    return { file, parsed: null, valid: false, errors: [e instanceof Error ? e.message : String(e)], warnings: [] }
  }
  if (!validation.valid) return { file, parsed: null, valid: false, errors: validation.errors, warnings: validation.warnings }
  let parsed
  try { parsed = quiet(() => parseTatemono(file)) } catch (e) {
    return { file, parsed: null, valid: false, errors: [e instanceof Error ? e.message : String(e)], warnings: validation.warnings }
  }
  return { file, parsed, valid: true, errors: [], warnings: validation.warnings }
}
