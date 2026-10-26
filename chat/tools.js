'use strict'
// Tools the AI can use. Both models (Pluffy on Colab, Gemini) go through exactly this layer.
// Nothing here trusts the model: every path is checked, every change needs your approval,
// and every change is backed up first so /undo can restore it.
//
// Pure Node (no Electron). main.js passes in the things that need Electron (the confirm dialog,
// the process runner, the Colab settings).

const fs = require('node:fs')
const path = require('node:path')
const { execFile } = require('node:child_process')
const { pathToFileURL } = require('node:url')
const { parseCommand } = require('./commands')
const lib = require('./lib')

// ---------------------------------------------------------------- limits
const MAX_READ_LINES = 250
const MAX_READ_CHARS = 12000
const MAX_FILE_BYTES = 2 * 1024 * 1024
const MAX_WRITE_BYTES = 300 * 1024
const MAX_SEARCH_HITS = 40
const MAX_SEARCH_FILES = 6000
const MAX_LIST = 200

// ---------------------------------------------------------------- what the AI may NOT touch
// Edit these lists if you want to change the rules. Matching is on the repo-relative path, lower-cased.
const SKIP_DIRS = new Set(['node_modules', '.git', 'vendor', '.next', 'dist', '.expo', 'target', '.pluffy-backups'])
const SECRET_EXT = ['.sqlite', '.sqlite3', '.pem', '.key', '.p12', '.pfx']

function isSecretOrJunk(rel) {
  const parts = rel.toLowerCase().split('/')
  const base = parts[parts.length - 1]
  if (parts.some((p) => p === '.git' || p === 'node_modules' || p === '.pluffy-backups')) return true
  if (base === '.env' || base.startsWith('.env.')) return true
  if (SECRET_EXT.some((e) => base.endsWith(e))) return true
  return false
}

// Extra rules for WRITING and DELETING. The AI must not be able to edit its own judge or its own cage.
function protectedWriteReason(rel) {
  const l = rel.toLowerCase()
  const parts = l.split('/')
  const base = parts[parts.length - 1]
  if (isSecretOrJunk(rel)) return 'secrets, dependencies and git data are off limits'
  if (parts[0] === 'chat') return 'the chat app (including these tools) cannot be edited by the AI'
  if (parts.includes('vendor')) return 'vendor folders are off limits'
  if (/^(validator|parser)\.(ts|js|php)$/.test(base)) return 'the validator and parser are the judge, so the AI cannot edit them'
  if (l === 'scan.js') return 'scan.js builds the training data, so the AI cannot edit it'
  if (l === 'arkzen.json') return 'use the /web, /app, /desktop and /db commands to change arkzen.json'
  return null
}

// ---------------------------------------------------------------- path safety
function resolveSafe(root, rel) {
  if (typeof rel !== 'string' || !rel.trim()) throw new Error('path is required')
  if (rel.includes('\0')) throw new Error('bad path')
  const abs = path.resolve(root, rel.trim())
  const r = path.relative(root, abs)
  if (r.startsWith('..') || path.isAbsolute(r)) throw new Error('that path is outside the repo')
  let probe = abs
  while (!fs.existsSync(probe)) {
    const up = path.dirname(probe)
    if (up === probe) break
    probe = up
  }
  const rr = path.relative(fs.realpathSync(root), fs.realpathSync(probe))
  if (rr.startsWith('..') || path.isAbsolute(rr)) throw new Error('that path leaves the repo through a link')
  return { abs, rel: r.split(path.sep).join('/') || '.' }
}

// ---------------------------------------------------------------- text helpers
const eolOf = (t) => (t.includes('\r\n') ? '\r\n' : '\n')
const lf = (t) => t.replace(/\r\n/g, '\n')
const withEol = (t, eol) => (eol === '\r\n' ? t.replace(/\n/g, '\r\n') : t)
const clip = (s, n) => (s.length > n ? s.slice(0, n) + `\n...(${s.length - n} more characters)` : s)

function looksBinary(buf) {
  const n = Math.min(buf.length, 8000)
  for (let i = 0; i < n; i++) if (buf[i] === 0) return true
  return false
}

// Contiguous unified diff (common prefix and suffix trimmed). Exact for a single edit.
function unifiedDiff(rel, oldText, newText, ctx = 3) {
  const a = lf(oldText).split('\n')
  const b = lf(newText).split('\n')
  let s = 0
  while (s < a.length && s < b.length && a[s] === b[s]) s++
  let ea = a.length - 1
  let eb = b.length - 1
  while (ea >= s && eb >= s && a[ea] === b[eb]) { ea--; eb-- }
  const removed = a.slice(s, ea + 1)
  const added = b.slice(s, eb + 1)
  if (!removed.length && !added.length) return { text: '(no changes)', added: 0, removed: 0 }
  const before = a.slice(Math.max(0, s - ctx), s)
  const after = a.slice(ea + 1, ea + 1 + ctx)
  const show = (arr, mark) => {
    const cap = 60
    const out = arr.slice(0, cap).map((l) => mark + l)
    if (arr.length > cap) out.push(`${mark}... (${arr.length - cap} more lines)`)
    return out
  }
  const text = [
    `--- a/${rel}`, `+++ b/${rel}`,
    `@@ line ${s + 1} @@`,
    ...before.map((l) => ' ' + l),
    ...show(removed, '-'),
    ...show(added, '+'),
    ...after.map((l) => ' ' + l),
  ].join('\n')
  return { text, added: added.length, removed: removed.length }
}

// ---------------------------------------------------------------- backups + undo
function backupDir(root) { return path.join(root, '.pluffy-backups') }
function journalPath(root) { return path.join(backupDir(root), 'journal.json') }
function readJournal(root) {
  try { return JSON.parse(fs.readFileSync(journalPath(root), 'utf8')) } catch { return [] }
}
function writeJournal(root, j) {
  fs.mkdirSync(backupDir(root), { recursive: true })
  const ig = path.join(backupDir(root), '.gitignore')
  if (!fs.existsSync(ig)) fs.writeFileSync(ig, '*\n')            // the backup folder ignores itself
  fs.writeFileSync(journalPath(root), JSON.stringify(j.slice(-200), null, 2))
}

// Call BEFORE changing a file. Returns the journal id.
function backupBeforeChange(root, rel, abs, action) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const existed = fs.existsSync(abs)
  let backup = null
  if (existed) {
    backup = path.join(id, rel)
    const dest = path.join(backupDir(root), backup)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(abs, dest)
  }
  const j = readJournal(root)
  j.push({ id, at: new Date().toISOString(), action, rel, existed, backup, undone: false })
  writeJournal(root, j)
  return id
}

function lastUndoable(root) {
  const j = readJournal(root)
  for (let i = j.length - 1; i >= 0; i--) if (!j[i].undone) return j[i]
  return null
}

function undoEntry(root, entry) {
  const { abs } = resolveSafe(root, entry.rel)
  if (entry.existed) {
    const src = path.join(backupDir(root), entry.backup)
    if (!fs.existsSync(src)) throw new Error('the backup file is missing')
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.copyFileSync(src, abs)
  } else if (fs.existsSync(abs)) {
    fs.unlinkSync(abs)                                            // the file did not exist before, so remove it
  }
  const j = readJournal(root)
  const hit = j.find((e) => e.id === entry.id)
  if (hit) hit.undone = true
  writeJournal(root, j)
}

// ---------------------------------------------------------------- DSL block helpers (port of what pluffy-retrieve.js / Cell 2 do)
const YAML_ONLY = new Set(['meta', 'meta:web', 'meta:native', 'web:config', 'native:config', 'desktop:config',
  'database', 'api', 'routes', 'realtime', 'events', 'notifications', 'mail'])
const isYamlOnly = (tag) => YAML_ONLY.has(tag) || YAML_ONLY.has(tag.split(':')[0])
const closerFor = (tag) => (isYamlOnly(tag) ? '\n*/' : `/* @arkzen:${tag}:end */`)
const TAG_OK = /^[A-Za-z0-9:_.{}+-]{1,80}$/
const SKIP_COLS = new Set(['id', 'created_at', 'updated_at'])

// every block in a core.tsx, in order: [{ tag, start, end, content }]
function listBlocks(src) {
  const lines = src.split('\n')
  const offs = []
  let o = 0
  for (const l of lines) { offs.push(o); o += l.length + 1 }
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\/\*\s*@arkzen:([A-Za-z0-9:_.{}+-]+?)(?:\s|\*\/|$)/)
    if (!m || m[1].endsWith(':end')) continue
    const tag = m[1]
    let j = i + 1
    const yaml = isYamlOnly(tag)
    for (; j < lines.length; j++) {
      if (yaml ? lines[j].trim() === '*/' : lines[j].includes(`@arkzen:${tag}:end`)) break
    }
    if (j >= lines.length) continue
    const start = offs[i]
    const end = offs[j] + lines[j].length
    out.push({ tag, start, end, content: src.slice(start, end) })
    i = j
  }
  return out
}

const family = (tag) => { const p = tag.split(':'); return p[0] + (/^(web|native):/.test(tag) ? ':' + p[1] : '') }
const NO_TABLES = new Set(['console', 'database', 'events', 'jobs', 'listeners', 'mail', 'meta', 'middleware', 'notifications', 'policy', 'realtime', 'routes'])
const WITH_ENDPOINTS = new Set(['endpoint', 'handler', 'web:components', 'web:page', 'web:error', 'web:layout', 'native:components', 'native:page', 'native:error', 'native:layout'])
const WITH_COMPS = new Set(['web:page', 'web:error', 'web:layout', 'native:page', 'native:error', 'native:layout'])

function tablesOf(blocks) {
  const out = []
  for (const b of blocks) {
    if (b.tag !== 'database' && !b.tag.startsWith('database:')) continue
    const t = b.content.match(/^table:\s*(\S+)/m)
    const name = t ? t[1] : b.tag.split(':').slice(1).join(':')
    const m = b.content.match(/^columns:\s*\n((?:[ \t]+.*(?:\n|$))*)/m)
    const cols = m ? [...m[1].matchAll(/^ {2}(\w+):\s*$/gm)].map((x) => x[1]).filter((c) => !SKIP_COLS.has(c)) : []
    out.push(`${name}(${cols.slice(0, 12).join(', ')})`)
  }
  return out
}
function endpointsOf(blocks) {
  const out = []
  for (const b of blocks) {
    if (b.tag !== 'api' && !b.tag.startsWith('api:')) continue
    const pre = (b.content.match(/^prefix:\s*(\S+)/m) || [])[1] || ''
    const i = b.content.indexOf('\nendpoints:')
    const body = i >= 0 ? b.content.slice(i + '\nendpoints:'.length) : ''
    const eps = []
    for (const m of body.matchAll(/^ {2}(\w+):\s*\n((?:(?: {4}.*|)\n?)*)/gm)) {
      const meth = m[2].match(/^\s+method:\s*(\w+)/m)
      const route = m[2].match(/^\s+route:\s*(\S+)/m)
      if (meth && route) eps.push(`${m[1]} ${meth[1]} ${route[1]}`)
    }
    out.push(`${pre}: ${eps.join('; ')}`)
  }
  return out
}
function compsOf(blocks, native, lynx) {
  const names = []
  for (const b of blocks) {
    const ok = native ? (b.tag.startsWith('native:components:') && b.tag.includes(':lynx') === lynx) : b.tag.startsWith('web:components:')
    if (!ok) continue
    for (const m of b.content.matchAll(/^(?:export\s+)?(?:const|function|class)\s+([A-Za-z_]\w*)/gm)) {
      const n = m[1]
      if (!names.includes(n) && (/^[A-Z]/.test(n) || n.startsWith('use'))) names.push(n)
    }
  }
  return names
}
// The "Already written:" context the model was trained with (same shape as Cell 2's context_for).
function contextFor(blocks, tag) {
  const fam = family(tag)
  const lines = []
  const t = tablesOf(blocks)
  if (t.length && !NO_TABLES.has(fam)) lines.push('- tables: ' + t.join('; '))
  const e = endpointsOf(blocks)
  if (e.length && WITH_ENDPOINTS.has(fam)) lines.push('- endpoints: ' + e.join(' | '))
  if (WITH_COMPS.has(fam)) {
    const c = compsOf(blocks, tag.startsWith('native'), tag.includes(':lynx'))
    if (c.length) lines.push('- shared components and hooks: ' + c.join(', '))
  }
  return lines
}

// ---------------------------------------------------------------- engine validator (same approach as pluffy-ai.js / scan.js)
function runEngineValidator(root, filePath) {
  return new Promise((resolve) => {
    let stack = 'nextjs'
    try { stack = JSON.parse(fs.readFileSync(path.join(root, 'arkzen.json'), 'utf8')).activeStack || stack } catch { /* default */ }
    const dir = path.join(root, 'engine', 'frontend', stack)
    const validatorPath = stack === 'react-inertia'
      ? path.join(root, 'engine', 'backend', 'laravel-inertia', 'resources', 'js', 'arkzen', 'core', 'validator.ts')
      : path.join(dir, 'arkzen', 'core', 'validator.ts')
    if (!fs.existsSync(validatorPath)) return resolve({ skipped: `no validator found for stack "${stack}"` })
    const code = `
      const { tsImport } = await import('tsx/esm/api');
      const { validateTatemono } = await tsImport(${JSON.stringify(pathToFileURL(validatorPath).href)}, import.meta.url);
      const log = console.log, err = console.error; console.log = () => {}; console.error = () => {};
      const r = validateTatemono(${JSON.stringify(filePath)});
      console.log = log; console.log('@@RESULT@@' + JSON.stringify(r));`
    execFile(process.execPath, ['--input-type=module', '-e', code], { cwd: dir, encoding: 'utf8', timeout: 90000 }, (err, stdout, stderr) => {
      const line = String(stdout || '').split('\n').find((l) => l.startsWith('@@RESULT@@'))
      if (!line) {
        const why = String(stderr || (err && err.message) || '').split('\n').find((l) => l.trim()) || 'no result'
        return resolve({ skipped: `${why} (run "node mizumi.js deps install ${stack}" first)` })
      }
      try { resolve({ result: JSON.parse(line.slice(10)) }) } catch { resolve({ skipped: 'validator output was not readable' }) }
    })
  })
}

// ---------------------------------------------------------------- tool schemas (OpenAI function-calling format)
const fn = (name, description, properties, required) => ({
  type: 'function',
  function: { name, description, parameters: { type: 'object', properties, required } },
})

const SCHEMAS = [
  fn('list_dir', 'List the files and folders in a repo folder. Use "." for the repo root.',
    { path: { type: 'string', description: 'Folder path relative to the repo root' } }, ['path']),
  fn('read_file', 'Read a text file. Big files are cut off, so use start_line and end_line to read in pieces.',
    { path: { type: 'string' }, start_line: { type: 'integer', description: '1-based first line' }, end_line: { type: 'integer', description: '1-based last line' } }, ['path']),
  fn('search', 'Find a piece of text (case-insensitive, not a regex) in the repo. Returns file:line matches.',
    { query: { type: 'string' }, path: { type: 'string', description: 'Optional folder to search in' } }, ['query']),
  fn('edit_file', 'Replace one exact piece of text in an existing file. old_str must appear exactly once. Preferred way to change a file. Needs approval.',
    { path: { type: 'string' }, old_str: { type: 'string' }, new_str: { type: 'string' } }, ['path', 'old_str', 'new_str']),
  fn('write_file', 'Create a new file or fully replace an existing one. Needs approval. Prefer edit_file for existing files.',
    { path: { type: 'string' }, content: { type: 'string' } }, ['path', 'content']),
  fn('delete_file', 'Delete one file (not a folder). Needs approval.',
    { path: { type: 'string' } }, ['path']),
  fn('run_command', 'Run one of the chat slash commands, for example "/modules", "/stack" or "/ai a todo app". Needs approval except for read-only ones.',
    { command: { type: 'string', description: 'The slash command, starting with /' } }, ['command']),
  fn('generate_block', 'Have the trained Pluff model write ONE @arkzen DSL block (for example "api:tasks" or "web:page:index"). Give "file" (tatemonos/<name>/core.tsx) to insert it straight into that file with approval; without "file" the block text is returned to you.',
    { tag: { type: 'string', description: 'Block tag without the @arkzen: prefix' }, description: { type: 'string', description: 'What the app is, in the style of a client request. Optional when file is a tatemono with a description.' }, file: { type: 'string', description: 'Optional tatemonos/<name>/core.tsx to put the block into' } }, ['tag']),
  fn('validate_tatemono', 'Run the engine validator on tatemonos/<name>/core.tsx and return the real errors and warnings.',
    { name: { type: 'string', description: 'The tatemono folder name' } }, ['name']),
]

const READ_ONLY_COMMANDS = new Set(['modules', 'stacks', 'stack'])
const NEVER_FROM_AI = new Set(['start', 'help'])                  // start never exits, help is local

// ---------------------------------------------------------------- the tool runner
function createTools({ root, confirm, runCommand, getColab }) {
  if (!root) throw new Error('root is required')

  const DECLINED = 'The user declined this change. Do not retry it. Say what you wanted to do and ask what they would like instead.'

  async function ask(title, message, detail) {
    return (await confirm({ title, message, detail })) === true
  }

  // ---- reading
  function listDir(a) {
    const { abs, rel } = resolveSafe(root, a.path || '.')
    if (isSecretOrJunk(rel) && rel !== '.') throw new Error('that folder is off limits')
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) throw new Error('not a folder: ' + rel)
    const names = fs.readdirSync(abs, { withFileTypes: true })
      .filter((d) => !SKIP_DIRS.has(d.name.toLowerCase()) && !isSecretOrJunk((rel === '.' ? '' : rel + '/') + d.name))
      .sort((x, y) => (y.isDirectory() - x.isDirectory()) || x.name.localeCompare(y.name))
      .map((d) => d.name + (d.isDirectory() ? '/' : ''))
    const more = names.length > MAX_LIST ? `\n...(${names.length - MAX_LIST} more)` : ''
    return `${rel}/\n` + names.slice(0, MAX_LIST).join('\n') + more
  }

  function readText(abs, rel) {
    if (isSecretOrJunk(rel)) throw new Error('that file is off limits')
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) throw new Error('file not found: ' + rel)
    if (fs.statSync(abs).size > MAX_FILE_BYTES) throw new Error('file is too large to read (over 2 MB)')
    const buf = fs.readFileSync(abs)
    if (looksBinary(buf)) throw new Error('binary file, cannot read as text')
    return buf.toString('utf8')
  }

  function readFile(a) {
    const { abs, rel } = resolveSafe(root, a.path)
    const text = lf(readText(abs, rel))
    const lines = text.split('\n')
    const start = Math.max(1, Number(a.start_line) || 1)
    let end = Number(a.end_line) || start + MAX_READ_LINES - 1
    end = Math.min(end, lines.length, start + MAX_READ_LINES - 1)
    let body = lines.slice(start - 1, end).join('\n')
    let note = ''
    if (body.length > MAX_READ_CHARS) { body = body.slice(0, MAX_READ_CHARS); note = ' (cut at the size limit)' }
    const more = end < lines.length ? `\n[more below: call read_file with start_line=${end + 1}]` : ''
    return `[${rel} lines ${start}-${end} of ${lines.length}${note}]\n${body}${more}`
  }

  function search(a) {
    const q = String(a.query || '').toLowerCase()
    if (q.length < 2) throw new Error('query is too short')
    const base = resolveSafe(root, a.path || '.')
    const hits = []
    let scanned = 0
    const walk = (dirAbs, dirRel) => {
      if (hits.length >= MAX_SEARCH_HITS || scanned > MAX_SEARCH_FILES) return
      let ents
      try { ents = fs.readdirSync(dirAbs, { withFileTypes: true }) } catch { return }
      for (const d of ents) {
        if (hits.length >= MAX_SEARCH_HITS || scanned > MAX_SEARCH_FILES) return
        if (SKIP_DIRS.has(d.name.toLowerCase())) continue
        const r = dirRel === '.' ? d.name : dirRel + '/' + d.name
        if (isSecretOrJunk(r)) continue
        const p = path.join(dirAbs, d.name)
        if (d.isDirectory()) { walk(p, r); continue }
        if (!d.isFile()) continue
        scanned++
        let st
        try { st = fs.statSync(p) } catch { continue }
        if (st.size > 1024 * 1024) continue
        let buf
        try { buf = fs.readFileSync(p) } catch { continue }
        if (looksBinary(buf)) continue
        const ls = buf.toString('utf8').split('\n')
        for (let i = 0; i < ls.length && hits.length < MAX_SEARCH_HITS; i++) {
          if (ls[i].toLowerCase().includes(q)) hits.push(`${r}:${i + 1}: ${ls[i].trim().slice(0, 160)}`)
        }
      }
    }
    const st = fs.statSync(base.abs)
    if (st.isDirectory()) walk(base.abs, base.rel)
    else {
      const ls = lf(readText(base.abs, base.rel)).split('\n')
      ls.forEach((l, i) => { if (hits.length < MAX_SEARCH_HITS && l.toLowerCase().includes(q)) hits.push(`${base.rel}:${i + 1}: ${l.trim().slice(0, 160)}`) })
    }
    return hits.length ? hits.join('\n') + (hits.length >= MAX_SEARCH_HITS ? '\n...(more matches, narrow your search)' : '') : 'No matches.'
  }

  // ---- changing (all go through applyChange)
  async function applyChange({ rel, abs, oldText, newText, action, ctx }) {
    const why = protectedWriteReason(rel)
    if (why) throw new Error(`I may not change ${rel}: ${why}.`)
    if (Buffer.byteLength(newText, 'utf8') > MAX_WRITE_BYTES) throw new Error('that content is too large (over 300 KB)')
    const d = unifiedDiff(rel, oldText, newText)
    if (d.text === '(no changes)') return 'No change: the file already has that content.'
    const verb = action === 'create' ? 'Create' : 'Change'
    const ok = await ask(`${verb} file`, `${verb} ${rel}? (+${d.added} -${d.removed})`, d.text)
    if (!ok) return DECLINED
    const id = backupBeforeChange(root, rel, abs, action)
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, newText, 'utf8')
    ctx.report(`${action === 'create' ? 'Created' : 'Edited'} ${rel} (+${d.added} -${d.removed}). Undo with /undo.\n\`\`\`diff\n${clip(d.text, 3500)}\n\`\`\``)
    return `OK: ${action === 'create' ? 'created' : 'changed'} ${rel} (+${d.added} -${d.removed}). Backup id ${id}.`
  }

  async function editFile(a, ctx) {
    const { abs, rel } = resolveSafe(root, a.path)
    const raw = readText(abs, rel)
    const eol = eolOf(raw)
    const text = lf(raw)
    const oldS = lf(String(a.old_str ?? ''))
    const newS = lf(String(a.new_str ?? ''))
    if (!oldS) throw new Error('old_str is empty. Use write_file to create a file.')
    const first = text.indexOf(oldS)
    if (first < 0) throw new Error('old_str was not found. Read the file again and copy the text exactly.')
    if (text.indexOf(oldS, first + 1) >= 0) throw new Error('old_str appears more than once. Include more surrounding text so it is unique.')
    const next = text.slice(0, first) + newS + text.slice(first + oldS.length)
    return applyChange({ rel, abs, oldText: text, newText: withEol(next, eol), action: 'edit', ctx })
  }

  async function writeFile(a, ctx) {
    const { abs, rel } = resolveSafe(root, a.path)
    if (typeof a.content !== 'string') throw new Error('content must be text')
    const exists = fs.existsSync(abs)
    if (exists && fs.statSync(abs).isDirectory()) throw new Error('that path is a folder')
    const oldRaw = exists ? readText(abs, rel) : ''
    const eol = exists ? eolOf(oldRaw) : '\n'
    return applyChange({ rel, abs, oldText: lf(oldRaw), newText: withEol(lf(a.content), eol), action: exists ? 'edit' : 'create', ctx })
  }

  async function deleteFile(a, ctx) {
    const { abs, rel } = resolveSafe(root, a.path)
    const why = protectedWriteReason(rel)
    if (why) throw new Error(`I may not delete ${rel}: ${why}.`)
    if (!fs.existsSync(abs)) throw new Error('file not found: ' + rel)
    if (fs.statSync(abs).isDirectory()) throw new Error('that is a folder. I can only delete single files.')
    const size = fs.statSync(abs).size
    const ok = await ask('Delete file', `Delete ${rel}? (${size} bytes)`, 'A backup is kept in .pluffy-backups so /undo can bring it back.')
    if (!ok) return DECLINED
    const id = backupBeforeChange(root, rel, abs, 'delete')
    fs.unlinkSync(abs)
    ctx.report(`Deleted ${rel}. Undo with /undo.`)
    return `OK: deleted ${rel}. Backup id ${id}.`
  }

  // ---- commands
  async function runCmd(a, ctx) {
    const text = String(a.command || '').trim()
    if (!text.startsWith('/')) throw new Error('a command must start with /')
    const parsed = parseCommand(text, { root, settings: getColab() || { server: '', model: '', key: '' } })
    if (parsed.local) throw new Error('that command is not available to the AI')
    if (!parsed.ok) throw new Error(parsed.error)
    const name = parsed.args[0]
    if (NEVER_FROM_AI.has(name)) throw new Error(`/${name} cannot be run by the AI. Ask Master Mizumi to type it.`)
    if (!READ_ONLY_COMMANDS.has(name)) {
      const ok = await ask('Run command', parsed.confirm || `Run this command?`, parsed.display)
      if (!ok) return DECLINED
    }
    ctx.report(`Running: ${parsed.display}`)
    const r = await runCommand(parsed)
    const out = lib.stripAnsi(r.out || '').trim()
    return `exit code ${r.code}${r.stopped ? ' (stopped)' : ''}\n${out.slice(-6000)}`
  }

  // ---- the trained model, as a tool
  async function generateBlock(a, ctx) {
    const tag = String(a.tag || '').replace(/^@arkzen:/, '').trim()
    if (!TAG_OK.test(tag)) throw new Error('bad tag')
    let target = null
    let src = ''
    if (a.file) {
      target = resolveSafe(root, a.file)
      if (!/^tatemonos\/[^/]+\/core\.tsx$/.test(target.rel)) throw new Error('file must be tatemonos/<name>/core.tsx')
      if (fs.existsSync(target.abs)) src = lf(readText(target.abs, target.rel))
    }
    const blocks = src ? listBlocks(src) : []

    let description = String(a.description || '').trim()
    if (!description && target) {
      const slug = target.rel.split('/')[1]
      try { description = (JSON.parse(fs.readFileSync(path.join(root, 'descriptions.json'), 'utf8'))[slug] || {}).description || '' } catch { /* optional */ }
      if (!description) { const m = src.match(/^\s*description:\s*(.+)$/m); if (m) description = m[1].trim() }
    }
    if (!description) throw new Error('give a description of the app (or a file that already has one)')

    const context = contextFor(blocks, tag)
    const userMsg = `Write the @arkzen:${tag} block for this application: ${description}` +
      (context.length ? '\n\nAlready written:\n' + context.join('\n') : '')

    const c = getColab()
    if (!c) throw new Error('No trained Pluff model is set. In Settings, tick "This is my trained Pluff model" on one AI.')
    ctx.report(`Asking ${c.name || 'the Pluffy model'} for @arkzen:${tag}...`)
    let raw = ''
    await lib.streamChat({
      baseUrl: c.baseUrl, server: c.server, model: c.model, key: c.key, signal: ctx.signal,
      messages: [
        { role: 'system', content: 'You generate one valid Pluff @arkzen DSL block. Output only the requested block, including its opening and closing markers where required.' },
        { role: 'user', content: userMsg },
      ],
      onToken: (d) => { raw += d }, maxTokens: 4096, temperature: 0,
    })
    let block = raw.replace(/<\|im_end\|>|<\|endoftext\|>/g, '').trim().replace(/^```\w*\n?|\n?```$/g, '').trim()
    const closer = closerFor(tag)
    const cut = block.indexOf(closer)
    if (cut !== -1) block = block.slice(0, cut + closer.length)
    const problems = []
    if (!new RegExp('^/\\*\\s*@arkzen:' + tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|$)').test(block)) problems.push('does not start with the right opening tag')
    if (!block.endsWith(closer.trim())) problems.push('is not closed properly (it may have been cut off)')
    if (problems.length) return `The model's block ${problems.join(' and ')}. Nothing was written.\n${clip(block, 1500)}`

    if (!target) return block
    const existing = blocks.find((b) => b.tag === tag)
    let next
    if (!src) next = block + '\n'
    else if (existing) next = src.slice(0, existing.start) + block + src.slice(existing.end)
    else next = src.replace(/\n*$/, '') + '\n\n' + block + '\n'
    const eol = src && fs.existsSync(target.abs) ? eolOf(readText(target.abs, target.rel)) : '\n'
    return applyChange({ rel: target.rel, abs: target.abs, oldText: src, newText: withEol(next, eol), action: src ? 'edit' : 'create', ctx })
  }

  async function validate(a, ctx) {
    const name = String(a.name || '').trim()
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,60}$/.test(name)) throw new Error('bad tatemono name')
    const file = path.join(root, 'tatemonos', name, 'core.tsx')
    if (!fs.existsSync(file)) throw new Error(`no tatemono named "${name}"`)
    ctx.report(`Validating ${name}...`)
    const r = await runEngineValidator(root, file)
    if (r.skipped) return `Validator could not run: ${r.skipped}`
    const v = r.result
    return (v.valid ? 'VALID' : 'INVALID') +
      (v.errors && v.errors.length ? '\nErrors:\n- ' + v.errors.join('\n- ') : '') +
      (v.warnings && v.warnings.length ? '\nWarnings:\n- ' + v.warnings.join('\n- ') : '')
  }

  const IMPL = {
    list_dir: listDir, read_file: readFile, search,
    edit_file: editFile, write_file: writeFile, delete_file: deleteFile,
    run_command: runCmd, generate_block: generateBlock, validate_tatemono: validate,
  }

  return {
    schemas: SCHEMAS,
    has: (name) => Object.prototype.hasOwnProperty.call(IMPL, name),
    // Always resolves to a string. Errors come back as text so the model can correct itself.
    async run(name, args, ctx = {}) {
      const c = { signal: ctx.signal, report: ctx.report || (() => {}) }
      if (!IMPL[name]) return `Error: unknown tool "${name}".`
      try { return String(await IMPL[name](args && typeof args === 'object' ? args : {}, c)) } catch (err) {
        if (err && err.name === 'AbortError') throw err
        return `Error: ${err.message || err}`
      }
    },
  }
}

module.exports = { createTools, SCHEMAS, resolveSafe, unifiedDiff, listBlocks, contextFor, lastUndoable, undoEntry, protectedWriteReason, isSecretOrJunk }
