// Copies the shared engine-core files the emitter needs into this stack.
//
// The wxt stack has its own node_modules (it never borrows packages from another stack), so the parser
// and validator have to live inside it to resolve js-yaml. The copies are generated and gitignored.
// Nothing in any other stack is read for writing or modified.
import * as fs from 'node:fs'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'

const STACK_DIR = path.resolve(import.meta.dirname, '..')
const ROOT_DIR  = path.resolve(STACK_DIR, '..', '..', '..')

const SHARED_CORE = path.join(ROOT_DIR, 'engine', 'shared', 'arkzen', 'engine-core')
// The DSL types are not shared. Every stack keeps its own copy, and the react-vite one is the reference.
const TYPES_SOURCE = path.join(ROOT_DIR, 'engine', 'frontend', 'react-vite', 'arkzen', 'types', 'index.ts')

export const CORE_FILES = ['parser.ts', 'validator.ts', 'backends.ts', 'file-writer.ts']

function copyIfChanged(from: string, to: string): boolean {
  if (!fs.existsSync(from)) throw new Error(`[wxt sync] source file missing: ${path.relative(ROOT_DIR, from)}`)
  const next = fs.readFileSync(from)
  if (fs.existsSync(to) && fs.readFileSync(to).equals(next)) return false
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.writeFileSync(to, next)
  return true
}

/** Returns the files that changed (relative to the stack folder). */
export function syncShared(): string[] {
  const changed: string[] = []
  for (const file of CORE_FILES) {
    const to = path.join(STACK_DIR, 'arkzen', 'core', file)
    if (copyIfChanged(path.join(SHARED_CORE, file), to)) changed.push(path.relative(STACK_DIR, to))
  }
  const typesTo = path.join(STACK_DIR, 'arkzen', 'types', 'index.ts')
  if (copyIfChanged(TYPES_SOURCE, typesTo)) changed.push(path.relative(STACK_DIR, typesTo))
  return changed
}

// `tsx arkzen/sync.ts` (npm run sync:shared) runs the sync by itself
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const changed = syncShared()
  console.log(changed.length ? `[wxt sync] updated: ${changed.join(', ')}` : '[wxt sync] already up to date')
}
