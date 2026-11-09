// ============================================================
// PLUFF GAME FREE FILES v1.0
//
// @arkzen:file support for the Godot and Unity generators.
//
// Same block shape as engine/shared/arkzen/engine-core/file-writer.ts:
//
//   /* @arkzen:file:<id>
//   path: scripts/enemy.gd
//   */
//   ...raw body, written as-is...
//   /* @arkzen:file:<id>:end */
//
// Why this is a separate plain-JS file:
//   - Game export runs through export.js -> generator.js and never touches
//     parser.ts / file-writer.ts. Those are TypeScript, synced into the web
//     and native stacks, and cannot be imported by plain `node export.js`.
//   - extractFileBlocks() below mirrors file-writer.ts on purpose. If the
//     block syntax changes there, change it here too.
//
// Where `path` lands (game projects only):
//   Always relative to the generated game project root, for example
//   scripts/enemy.gd (Godot) or Assets/Scripts/Enemy.cs (Unity).
//   A leading "/" is accepted and means the same root.
//   {frontend} {app} {desktop} {backend} are not supported (no web stack here).
//
// Rules:
//   - Files are written into the staging folder AFTER the engine generated
//     everything, so a free file with the same path replaces the generated one
//     (reported as "overridden"). Always overwrites, like the web DSL.
//   - Nothing is written unless every block is valid.
//   - Paths cannot escape the project (.. / drive letters / null bytes) and
//     cannot touch .git, node_modules or .env*.
//   - Two blocks cannot write the same file; ids must be unique.
//   - No cleanup needed: both generators rebuild the whole output folder on
//     every export, so a deleted block simply is not written again.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'

const OPEN = '/* @arkzen:file:'
const MAX_BYTES = 5 * 1024 * 1024
const BLOCKED_SEGMENTS = new Set(['.git', 'node_modules'])

function parsePathField(header) {
  const match = header.match(/^\s*path\s*:\s*(.+?)\s*$/m)
  if (!match) return null
  let value = match[1].trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1)
  }
  return value
}

export function hasFileBlocks(source) {
  return source.includes(OPEN)
}

// Mirrors extractFileBlocks() in engine/shared/arkzen/engine-core/file-writer.ts
export function extractFileBlocks(source) {
  const blocks = []
  let from = 0

  while (true) {
    const openIdx = source.indexOf(OPEN, from)
    if (openIdx === -1) break

    const afterMarker = openIdx + OPEN.length
    const match = source.slice(afterMarker).match(/^([a-zA-Z0-9_-]+)/)
    if (!match) { from = afterMarker; continue }

    const id = match[1]
    const afterId = afterMarker + id.length

    // A closing marker (/* @arkzen:file:<id>:end */), not an opening.
    if (id === 'end' || source.startsWith(':end', afterId)) { from = afterId; continue }

    const headerEnd = source.indexOf('*/', afterId)
    if (headerEnd === -1) throw new Error(`@arkzen:file:${id} - opening comment is never closed (missing */)`)

    const closeMarker = `/* @arkzen:file:${id}:end */`
    const closeIdx = source.indexOf(closeMarker, headerEnd + 2)
    if (closeIdx === -1) throw new Error(`@arkzen:file:${id} - missing closing marker ${closeMarker}`)

    const header = source.slice(afterId, headerEnd)
    const body = source
      .slice(headerEnd + 2, closeIdx)
      .replace(/^\r?\n/, '')
      .replace(/\r?\n$/, '')

    blocks.push({ id, path: parsePathField(header), body })
    from = closeIdx + closeMarker.length
  }

  return blocks
}

function blockedReason(segments) {
  const hit = segments.find(segment => BLOCKED_SEGMENTS.has(segment))
  if (hit) return `"${hit}" is off limits`
  const base = segments[segments.length - 1]
  if (base.startsWith('.env')) return `"${base}" is off limits`
  return null
}

// Pure: validates every block, touches no files.
export function planGameFreeFiles(source) {
  const errors = []
  const plan = []

  let blocks
  try {
    blocks = extractFileBlocks(source)
  } catch (error) {
    return { plan, errors: [error instanceof Error ? error.message : String(error)] }
  }

  const seenIds = new Set()
  const seenPaths = new Map()

  for (const block of blocks) {
    const tag = `@arkzen:file:${block.id}`

    if (seenIds.has(block.id)) { errors.push(`${tag} - duplicate block id`); continue }
    seenIds.add(block.id)

    if (!block.path) { errors.push(`${tag} - missing "path:" in the header`); continue }

    const raw = block.path.replace(/\\/g, '/').trim()
    if (!raw) { errors.push(`${tag} - path is empty`); continue }
    if (raw.includes('\0')) { errors.push(`${tag} - path contains a null byte`); continue }
    if (/^[A-Za-z]:/.test(raw)) { errors.push(`${tag} - drive letters are not allowed ("${raw}")`); continue }
    if (/^\{(frontend|app|desktop|backend)\}/.test(raw)) {
      errors.push(`${tag} - ${raw.match(/^\{[a-z]+\}/)[0]} is not available in game projects; use a path inside the game project (for example scripts/a.gd)`)
      continue
    }

    const segments = raw.replace(/^\/+/, '').split('/').filter(segment => segment !== '' && segment !== '.')
    if (segments.length === 0) { errors.push(`${tag} - path "${raw}" does not name a file`); continue }
    if (segments.includes('..')) { errors.push(`${tag} - ".." is not allowed in "${raw}"`); continue }

    const why = blockedReason(segments)
    if (why) { errors.push(`${tag} - cannot write ${segments.join('/')}: ${why}`); continue }

    const content = block.body.length ? `${block.body}\n` : ''
    if (Buffer.byteLength(content, 'utf8') > MAX_BYTES) {
      errors.push(`${tag} - body is larger than ${MAX_BYTES / (1024 * 1024)} MB`)
      continue
    }

    const rel = segments.join('/')
    const key = rel.toLowerCase()
    if (seenPaths.has(key)) {
      errors.push(`${tag} - writes ${rel}, which @arkzen:file:${seenPaths.get(key)} already writes`)
      continue
    }
    seenPaths.set(key, block.id)

    plan.push({ id: block.id, rel, segments, content })
  }

  return { plan, errors }
}

function fail(label, errors) {
  throw new Error(`[${label}] @arkzen:file: ${errors.length} problem(s)\n  - ${errors.join('\n  - ')}`)
}

// Fail fast: call right after parsing, before any staging folder exists.
export function validateGameFreeFiles(source, label = 'Free files') {
  if (!hasFileBlocks(source)) return
  const { errors } = planGameFreeFiles(source)
  if (errors.length > 0) fail(label, errors)
}

// Writes every block into the (staging) project folder. Call after the engine finished generating.
export function writeGameFreeFiles(source, projectDir, label = 'Free files') {
  const result = { written: [], overridden: [] }
  if (!hasFileBlocks(source)) return result

  const { plan, errors } = planGameFreeFiles(source)
  if (errors.length > 0) fail(label, errors)

  const root = path.resolve(projectDir)
  const targets = plan.map(item => ({ ...item, abs: path.resolve(root, ...item.segments) }))

  // Check everything first so a late problem cannot leave half the files written.
  for (const target of targets) {
    const relative = path.relative(root, target.abs)
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      errors.push(`@arkzen:file:${target.id} - "${target.rel}" resolves outside the project`)
      continue
    }
    try {
      if (fs.statSync(target.abs).isDirectory()) errors.push(`@arkzen:file:${target.id} - "${target.rel}" is a folder`)
    } catch { /* does not exist yet */ }
  }
  if (errors.length > 0) fail(label, errors)

  for (const target of targets) {
    const existed = fs.existsSync(target.abs)
    fs.mkdirSync(path.dirname(target.abs), { recursive: true })
    fs.writeFileSync(target.abs, target.content, 'utf8')
    result.written.push(target.rel)
    if (existed) result.overridden.push(target.rel)
  }

  return result
}
