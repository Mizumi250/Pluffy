// ============================================================
// ARKZEN ENGINE — FREE FILE WRITER v1.0
//
// @arkzen:file — write any text file to a path you choose.
// Independent of web/native/desktop/backend stacks: a tatemono
// that only has @arkzen:meta + @arkzen:file blocks is valid.
//
// Syntax (same open/close shape as the other named blocks):
//
//   /* @arkzen:file:<id>
//   path: index.html
//   */
//   ...raw body, written as-is...
//   /* @arkzen:file:<id>:end */
//
// Where `path` lands:
//   index.html               → custom/<tatemono-name>/index.html   (default)
//   {frontend}/public/a.txt  → active web stack folder     (arkzen.json activeStack)
//   {app}/...                → active app stack folder     (activeAppStack)
//   {desktop}/...            → active desktop stack folder (activeDesktopStack)
//   {backend}/...            → engine/backend/<active backend>
//   /some/dir/file.ext       → project root (leading slash = deliberate)
//
// Rules:
//   - Always overwrites. Unchanged files are skipped (no watcher loops).
//   - Body is written as-is; one newline after the header and one before
//     the closing marker are dropped, and a final newline is added.
//   - Nothing is written unless every block in the tatemono is valid.
//   - Paths cannot escape the project root (.. / absolute / drive letters /
//     symlinks) and cannot touch the engine's own files (see BLOCKED_*).
//   - Two blocks in one tatemono cannot write the same file.
//   - Cleanup: what each tatemono wrote is recorded in
//     .arkzen/free-files/<name>.json. When a block is deleted or its path
//     changes, the old file is removed on the next build; when the tatemono
//     itself is removed (or loses all its file blocks), everything it wrote
//     is removed. Empty folders under custom/ are pruned.
//
// Synced into every stack's arkzen/core/ via ENGINE_FILES (shared-sync.ts).
// Called from triggerBackendBuild() (backend-bridge.ts), which every
// stack builder already calls.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { resolveActiveBackend } from './backends'

export interface FreeFileBlock {
  id:   string
  path: string | null
  body: string
}

export interface FreeFileResult {
  written:   string[]   // paths relative to the project root
  unchanged: string[]
  removed:   string[]   // stale files cleaned up (block deleted / path changed / tatemono removed)
}

interface PlannedFile {
  id:      string
  abs:     string
  rel:     string
  content: string
}

const OPEN      = '/* @arkzen:file:'
const MAX_BYTES = 5 * 1024 * 1024
const MANIFEST_DIR = '.arkzen/free-files'

// ── Edit these lists to change what free files may never touch ──
const BLOCKED_SEGMENTS   = new Set(['.git', 'node_modules'])
const BLOCKED_BASENAMES  = new Set(['arkzen.json'])
const BLOCKED_ROOT_FILES = new Set(['mizumi.js', 'start.js', 'setup.js', 'export.js', 'export-docker.js'])
const BLOCKED_PREFIXES   = ['tatemonos', 'engine/shared', '.arkzen']
const BLOCKED_PATTERNS: RegExp[] = [
  /^engine\/(frontend|backend|game)\/[^/]+\/arkzen(\/|$)/,   // each stack's engine internals
]

// ─────────────────────────────────────────────
// Detection + extraction
// ─────────────────────────────────────────────

export function hasFileBlocks(content: string): boolean {
  return content.includes(OPEN)
}

function parsePathField(header: string): string | null {
  const m = header.match(/^\s*path\s*:\s*(.+?)\s*$/m)
  if (!m) return null
  let value = m[1].trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1)
  }
  return value
}

export function extractFileBlocks(content: string): FreeFileBlock[] {
  const blocks: FreeFileBlock[] = []
  let from = 0

  while (true) {
    const openIdx = content.indexOf(OPEN, from)
    if (openIdx === -1) break

    const afterMarker = openIdx + OPEN.length
    const m = content.slice(afterMarker).match(/^([a-zA-Z0-9_-]+)/)
    if (!m) { from = afterMarker; continue }

    const id      = m[1]
    const afterId = afterMarker + id.length

    // A closing marker (/* @arkzen:file:<id>:end */) — not an opening.
    if (id === 'end' || content.startsWith(':end', afterId)) { from = afterId; continue }

    const headerEnd = content.indexOf('*/', afterId)
    if (headerEnd === -1) {
      throw new Error(`@arkzen:file:${id} — opening comment is never closed (missing */)`)
    }

    const closeMarker = `/* @arkzen:file:${id}:end */`
    const closeIdx    = content.indexOf(closeMarker, headerEnd + 2)
    if (closeIdx === -1) {
      throw new Error(`@arkzen:file:${id} — missing closing marker ${closeMarker}`)
    }

    const header = content.slice(afterId, headerEnd)
    const body   = content
      .slice(headerEnd + 2, closeIdx)
      .replace(/^\r?\n/, '')
      .replace(/\r?\n$/, '')

    blocks.push({ id, path: parsePathField(header), body })
    from = closeIdx + closeMarker.length
  }

  return blocks
}

// ─────────────────────────────────────────────
// Project root + stack folders
// ─────────────────────────────────────────────

/** Walks up from startPath to the root arkzen.json (the one with activeStack). */
export function findProjectRoot(startPath: string): string | null {
  let dir = path.resolve(startPath)
  try { if (fs.statSync(dir).isFile()) dir = path.dirname(dir) } catch { /* keep dir */ }

  for (let i = 0; i < 12; i++) {
    const file = path.join(dir, 'arkzen.json')
    if (fs.existsSync(file)) {
      try {
        const json = JSON.parse(fs.readFileSync(file, 'utf-8'))
        if (json && typeof json === 'object' && 'activeStack' in json) return dir
      } catch { /* malformed json: keep walking */ }
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function readRootConfig(root: string): Record<string, any> {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'arkzen.json'), 'utf-8')) } catch { return {} }
}

function tokenDir(token: string, root: string, cfg: Record<string, any>): string | null {
  if (token === 'backend') {
    return path.join(root, 'engine', 'backend', resolveActiveBackend(root))
  }
  const key  = token === 'frontend' ? 'activeStack' : token === 'app' ? 'activeAppStack' : 'activeDesktopStack'
  const name = cfg[key]
  if (!name || name === 'none') return null
  const rel = cfg.stacks?.[name]
  return rel ? path.join(root, rel) : null
}

// ─────────────────────────────────────────────
// Planning (pure: validates everything, writes nothing)
// ─────────────────────────────────────────────

function isInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

function blockedReason(rel: string): string | null {
  const segments = rel.split('/')
  if (segments.some(s => BLOCKED_SEGMENTS.has(s)))            return `"${segments.find(s => BLOCKED_SEGMENTS.has(s))}" is off limits`
  const base = segments[segments.length - 1]
  if (BLOCKED_BASENAMES.has(base) || base.startsWith('.env')) return `"${base}" is off limits`
  if (segments.length === 1 && BLOCKED_ROOT_FILES.has(base))  return `"${base}" is an engine file`
  for (const p of BLOCKED_PREFIXES) {
    if (rel === p || rel.startsWith(p + '/'))                 return `"${p}/" is the engine's own folder`
  }
  for (const re of BLOCKED_PATTERNS) {
    if (re.test(rel))                                         return `that is a stack's engine internals`
  }
  return null
}

function planFileBlocks(
  content: string,
  name:    string,
  startAt: string,
): { plan: PlannedFile[]; errors: string[] } {
  const errors: string[]      = []
  const plan:   PlannedFile[] = []

  let blocks: FreeFileBlock[]
  try { blocks = extractFileBlocks(content) }
  catch (e) { return { plan, errors: [e instanceof Error ? e.message : String(e)] } }

  if (blocks.length === 0) return { plan, errors }

  const root = findProjectRoot(startAt)
  if (!root) {
    return { plan, errors: ['could not find the project root (arkzen.json with activeStack) above this tatemono'] }
  }
  const cfg      = readRootConfig(root)
  let   realRoot = root
  try { realRoot = fs.realpathSync(root) } catch { /* keep root */ }

  const seenIds   = new Set<string>()
  const seenPaths = new Map<string, string>()

  for (const block of blocks) {
    const tag = `@arkzen:file:${block.id}`

    if (seenIds.has(block.id)) { errors.push(`${tag} — duplicate block id`); continue }
    seenIds.add(block.id)

    if (!block.path) { errors.push(`${tag} — missing "path:" in the header`); continue }

    const raw = block.path.replace(/\\/g, '/').trim()
    if (!raw)                      { errors.push(`${tag} — path is empty`); continue }
    if (raw.includes('\0'))        { errors.push(`${tag} — path contains a null byte`); continue }
    if (/^[A-Za-z]:/.test(raw))    { errors.push(`${tag} — drive letters are not allowed ("${raw}")`); continue }

    let base: string
    let rest: string
    const tok = raw.match(/^\{(frontend|app|desktop|backend)\}(?:\/(.*))?$/)
    if (tok) {
      const dir = tokenDir(tok[1], root, cfg)
      if (!dir) { errors.push(`${tag} — {${tok[1]}} has no active stack in arkzen.json`); continue }
      base = dir
      rest = tok[2] ?? ''
    } else if (raw.startsWith('/')) {
      base = root
      rest = raw.replace(/^\/+/, '')
    } else {
      base = path.join(root, 'custom', name)
      rest = raw
    }

    const segments = rest.split('/').filter(s => s !== '' && s !== '.')
    if (segments.length === 0)           { errors.push(`${tag} — path "${raw}" does not name a file`); continue }
    if (segments.includes('..'))         { errors.push(`${tag} — ".." is not allowed in "${raw}"`); continue }

    const abs = path.resolve(base, ...segments)
    if (!isInside(root, abs))            { errors.push(`${tag} — "${raw}" resolves outside the project`); continue }

    const rel = path.relative(root, abs).split(path.sep).join('/')
    const why = blockedReason(rel)
    if (why) { errors.push(`${tag} — cannot write ${rel}: ${why}`); continue }

    // Symlink guard: the deepest existing part of the path must stay inside the project.
    let probe = abs
    while (!fs.existsSync(probe)) {
      const parent = path.dirname(probe)
      if (parent === probe) break
      probe = parent
    }
    try {
      if (!isInside(realRoot, fs.realpathSync(probe))) {
        errors.push(`${tag} — "${rel}" goes through a link that leaves the project`)
        continue
      }
    } catch { /* unreadable probe: let the write fail loudly later */ }

    try {
      if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
        errors.push(`${tag} — "${rel}" is a folder`)
        continue
      }
    } catch { /* ignore */ }

    const fileContent = block.body.length ? block.body + '\n' : ''
    if (Buffer.byteLength(fileContent, 'utf-8') > MAX_BYTES) {
      errors.push(`${tag} — body is larger than ${MAX_BYTES / (1024 * 1024)} MB`)
      continue
    }

    const key = abs.toLowerCase()
    if (seenPaths.has(key)) {
      errors.push(`${tag} — writes ${rel}, which @arkzen:file:${seenPaths.get(key)} already writes`)
      continue
    }
    seenPaths.set(key, block.id)

    plan.push({ id: block.id, abs, rel, content: fileContent })
  }

  return { plan, errors }
}

// ─────────────────────────────────────────────
// Cleanup (manifest of what each tatemono wrote)
// ─────────────────────────────────────────────

function manifestFile(root: string, name: string): string {
  return path.join(root, ...MANIFEST_DIR.split('/'), `${name}.json`)
}

function readManifest(root: string, name: string): string[] {
  try {
    const json = JSON.parse(fs.readFileSync(manifestFile(root, name), 'utf-8'))
    return Array.isArray(json?.files) ? json.files.filter((f: unknown): f is string => typeof f === 'string') : []
  } catch {
    return []
  }
}

function writeManifest(root: string, name: string, files: string[]): void {
  const file = manifestFile(root, name)
  if (files.length === 0) {
    try { fs.rmSync(file, { force: true }) } catch { /* ignore */ }
    return
  }
  const next = JSON.stringify({ files: [...files].sort() }, null, 2) + '\n'
  let current: string | null = null
  try { current = fs.readFileSync(file, 'utf-8') } catch { /* new manifest */ }
  if (current === next) return
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, next, 'utf-8')
}

/** True when another tatemono's manifest also claims this file (never delete shared ownership). */
function ownedByAnother(root: string, name: string, rel: string): boolean {
  const dir = path.join(root, ...MANIFEST_DIR.split('/'))
  let entries: string[] = []
  try { entries = fs.readdirSync(dir) } catch { return false }
  const key = rel.toLowerCase()
  for (const entry of entries) {
    if (!entry.endsWith('.json') || entry === `${name}.json`) continue
    if (readManifest(root, entry.slice(0, -5)).some(f => f.toLowerCase() === key)) return true
  }
  return false
}

/** Removes empty folders under custom/ (stops at custom/ itself). */
function pruneEmptyDirs(root: string, rel: string): void {
  if (!rel.startsWith('custom/')) return
  const stop = path.join(root, 'custom')
  let dir = path.dirname(path.join(root, ...rel.split('/')))
  while (dir !== stop && isInside(stop, dir)) {
    try {
      if (fs.readdirSync(dir).length > 0) break
      fs.rmdirSync(dir)
    } catch { break }
    dir = path.dirname(dir)
  }
}

/** Deletes one previously-written file after re-running the same safety checks as a write. */
function removeWrittenFile(root: string, realRoot: string, name: string, rel: string): boolean {
  if (rel.includes('..') || path.isAbsolute(rel) || blockedReason(rel)) return false
  if (ownedByAnother(root, name, rel)) return false

  const abs = path.resolve(root, ...rel.split('/'))
  if (!isInside(root, abs)) return false

  try {
    const st = fs.lstatSync(abs)
    if (st.isDirectory()) return false
    // The folder holding the file must still resolve inside the project (symlink guard).
    if (!isInside(realRoot, fs.realpathSync(path.dirname(abs)))) return false
    fs.unlinkSync(abs)
  } catch {
    return false   // already gone or unreadable: nothing to remove
  }
  pruneEmptyDirs(root, rel)
  return true
}

function cleanupStale(root: string, name: string, keep: Set<string>, result: FreeFileResult): void {
  const previous = readManifest(root, name)
  if (previous.length === 0) return
  let realRoot = root
  try { realRoot = fs.realpathSync(root) } catch { /* keep root */ }
  for (const rel of previous) {
    if (keep.has(rel)) continue
    if (removeWrittenFile(root, realRoot, name, rel)) result.removed.push(rel)
  }
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/** For validator.ts: every problem with this tatemono's file blocks, without writing anything. */
export function validateFileBlocks(filePath: string, name: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  if (!hasFileBlocks(content)) return []
  return planFileBlocks(content, name, filePath).errors
}

/** Writes every @arkzen:file block of a tatemono. Throws (writing nothing) if any block is invalid.
 *  Also removes files this tatemono wrote earlier that no block writes any more. */
export function writeFreeFiles(tatemono: { filePath: string; meta: { name: string } }): FreeFileResult {
  const result: FreeFileResult = { written: [], unchanged: [], removed: [] }

  const content = fs.readFileSync(tatemono.filePath, 'utf-8')
  const name    = tatemono.meta.name

  // No file blocks (any more): clean up whatever this tatemono wrote before.
  if (!hasFileBlocks(content)) {
    const root = findProjectRoot(tatemono.filePath)
    if (root) {
      cleanupStale(root, name, new Set(), result)
      writeManifest(root, name, [])
      logRemoved(name, result)
    }
    return result
  }

  const { plan, errors } = planFileBlocks(content, name, tatemono.filePath)
  if (errors.length > 0) {
    throw new Error(`[Arkzen Files] ${name}: ${errors.length} problem(s)\n  - ${errors.join('\n  - ')}`)
  }

  for (const item of plan) {
    fs.mkdirSync(path.dirname(item.abs), { recursive: true })

    let current: string | null = null
    try { current = fs.readFileSync(item.abs, 'utf-8') } catch { /* new file */ }

    if (current === item.content) {
      result.unchanged.push(item.rel)
      continue
    }
    fs.writeFileSync(item.abs, item.content, 'utf-8')
    result.written.push(item.rel)
  }

  const root = findProjectRoot(tatemono.filePath)
  if (root) {
    const keep = new Set(plan.map(item => item.rel))
    cleanupStale(root, name, keep, result)
    writeManifest(root, name, [...keep])
  }

  for (const rel of result.written)   console.log(`[Arkzen Files] ✓ ${name}: wrote ${rel}`)
  if (result.unchanged.length > 0)    console.log(`[Arkzen Files] ○ ${name}: ${result.unchanged.length} file(s) unchanged`)
  logRemoved(name, result)

  return result
}

/** Called when a tatemono is deleted: removes every file it wrote. Its core.tsx is gone, so the manifest is the source of truth. */
export function removeFreeFiles(name: string, startAt: string = process.cwd()): FreeFileResult {
  const result: FreeFileResult = { written: [], unchanged: [], removed: [] }
  const root = findProjectRoot(startAt)
  if (!root) return result

  cleanupStale(root, name, new Set(), result)
  writeManifest(root, name, [])
  logRemoved(name, result)
  return result
}

function logRemoved(name: string, result: FreeFileResult): void {
  for (const rel of result.removed) console.log(`[Arkzen Files] 🧹 ${name}: removed ${rel}`)
}
