// Copies the shared engine-core files the OS engine needs into common/core/.
//
// This folder has its own node_modules (it never borrows packages from a stack), so the parser
// and validator have to live inside it to resolve js-yaml. The copies are generated and gitignored.
// Same approach as engine/terminal/scripts/sync-shared.mjs. Nothing outside engine/os is modified.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OS_DIR = path.resolve(HERE, '..')
const ROOT_DIR = path.resolve(OS_DIR, '..', '..')

const SHARED_CORE = path.join(ROOT_DIR, 'engine', 'shared', 'arkzen', 'engine-core')
// The DSL types are not shared. Every stack keeps its own copy, and the react-vite one is the reference.
const TYPES_SOURCE = path.join(ROOT_DIR, 'engine', 'frontend', 'react-vite', 'arkzen', 'types', 'index.ts')
const CORE_FILES = ['parser.ts', 'validator.ts', 'backends.ts', 'file-writer.ts']

function copyIfChanged(from, to) {
  if (!fs.existsSync(from)) throw new Error(`[os sync] source file missing: ${path.relative(ROOT_DIR, from)}`)
  const next = fs.readFileSync(from)
  if (fs.existsSync(to) && fs.readFileSync(to).equals(next)) return false
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.writeFileSync(to, next)
  return true
}

export function syncShared() {
  const changed = []
  for (const file of CORE_FILES) {
    const to = path.join(OS_DIR, 'common', 'core', file)
    if (copyIfChanged(path.join(SHARED_CORE, file), to)) changed.push(path.relative(OS_DIR, to))
  }
  const typesTo = path.join(OS_DIR, 'common', 'types', 'index.ts')
  if (copyIfChanged(TYPES_SOURCE, typesTo)) changed.push(path.relative(OS_DIR, typesTo))
  return changed
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const changed = syncShared()
  console.log(changed.length ? `[os sync] updated: ${changed.join(', ')}` : '[os sync] already up to date')
}
