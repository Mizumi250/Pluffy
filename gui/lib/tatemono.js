'use strict'
// Everything the in-app tatemono editor needs from the Pluff Tatemono extension, without VS Code.
//
// The extension (.vsix) is the source of truth, so the app and VS Code can never disagree:
//   syntaxes/tatemono.tmLanguage.json   -> syntax highlighting
//   language-configuration.json         -> brackets, comments, auto-closing
//   lib/scaffold.mjs                    -> the linter, the block scanner and every block builder
//   lib/snippets.js                     -> the hand-tuned completions (loaded with a tiny `vscode` stand-in)
// If the repo has its own scaffold.js it wins for linting and block building, like the extension does.
// No .vsix? The vscode-extension/ folder of the engine is used instead.

const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const { pathToFileURL } = require('node:url')
const { readZip } = require('./zip')
const sys = require('./system')

const PAGE_KEYS = ['web:page', 'native:page', 'lynx:page']
const LAYOUT_KEYS = ['web:layout', 'native:layout', 'lynx:layout']
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const TEXT_EXT = new Set(['.tsx', '.ts', '.js', '.mjs', '.cjs', '.json', '.md', '.txt', '.css', '.html', '.yaml', '.yml', '.svg', '.xml', '.env', '.php', '.py', '.java', '.cs', '.go', '.rs', '.cpp', '.h', '.ini', '.gd', '.tscn'])
const IMAGE_EXT = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' }
const SKIP_DIR = new Set(['node_modules', '.git', '.next', 'dist', 'build'])

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// ---- a stand-in for the parts of the `vscode` module that lib/snippets.js touches -------------
function vscodeStandIn() {
  class SnippetString { constructor(value = '') { this.value = value } }
  class MarkdownString { constructor(value = '') { this.value = value } }
  class Range {
    constructor(a, b, c, d) {
      if (typeof a === 'number') { this.start = { line: a, character: b }; this.end = { line: c, character: d } } else { this.start = a; this.end = b }
    }
  }
  class CompletionItem { constructor(label, kind) { this.label = label; this.kind = kind } }
  const kinds = new Proxy({}, { get: (_t, k) => String(k) })
  const base = { SnippetString, MarkdownString, Range, CompletionItem, CompletionItemKind: kinds }
  return new Proxy(base, { get: (t, k) => (k in t ? t[k] : class {}) })
}

function loadSnippets(file) {
  const orig = Module._load
  const stand = vscodeStandIn()
  Module._load = function (request, ...rest) { return request === 'vscode' ? stand : orig.call(this, request, ...rest) }
  try {
    delete require.cache[require.resolve(file)]
    return require(file)
  } finally { Module._load = orig }
}

function stripJsonComments(text) {
  let out = '', str = false, esc = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1]
    if (str) { out += c; if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') str = false; continue }
    if (c === '"') { str = true; out += c; continue }
    if (c === '/' && n === '/') { while (i < text.length && text[i] !== '\n') i++; out += '\n'; continue }
    if (c === '/' && n === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++; i++; continue }
    out += c
  }
  return out.replace(/,\s*([}\]])/g, '$1')
}

class Tatemono {
  constructor({ cacheDir, getRoot, emit = () => {} }) {
    this.cacheDir = cacheDir
    this.getRoot = getRoot
    this.emit = emit
    this.loaded = null
    this.importCache = new Map()
    this.watcher = null
    this.watchName = null
    this.lastWrite = new Map()
  }

  // ---------------------------------------------------------------- the extension
  async importFresh(file) {
    const stat = fs.statSync(file)
    const key = `${file}:${stat.mtimeMs}`
    if (!this.importCache.has(key)) this.importCache.set(key, import(pathToFileURL(file).href + '?v=' + Math.floor(stat.mtimeMs)))
    return this.importCache.get(key)
  }

  // Unpacks the newest .vsix into the cache (once per file version) and returns the extension folder.
  // If the engine's vscode-extension/ sources have moved on since the .vsix was packaged, the sources
  // win (the app follows your repo without repackaging) and `staleVsix` says so.
  locate() {
    const root = this.getRoot()
    const vsix = sys.builtinVsix(root)
    const src = path.join(root, 'vscode-extension')
    const srcOk = fs.existsSync(path.join(src, 'lib', 'scaffold.mjs'))
    const FILES = ['syntaxes/tatemono.tmLanguage.json', 'language-configuration.json', 'lib/scaffold.mjs', 'lib/snippets.js']
    if (vsix) {
      const st = fs.statSync(vsix)
      const dir = path.join(this.cacheDir, `${path.basename(vsix, '.vsix')}-${st.size}-${Math.floor(st.mtimeMs)}`)
      const ext = path.join(dir, 'extension')
      if (!fs.existsSync(path.join(ext, 'lib', 'scaffold.mjs'))) {
        const zip = readZip(vsix)
        for (const name of zip.names()) {
          if (!name.startsWith('extension/') || name.endsWith('/')) continue
          const target = path.join(dir, name)
          fs.mkdirSync(path.dirname(target), { recursive: true })
          fs.writeFileSync(target, zip.read(name))
        }
      }
      const info = sys.parseVsix(vsix)
      const differs = srcOk && FILES.some((f) => {
        const a = path.join(ext, f), b = path.join(src, f)
        return fs.existsSync(a) && fs.existsSync(b) && !fs.readFileSync(a).equals(fs.readFileSync(b))
      })
      if (!differs) return { dir: ext, kind: 'vsix', file: vsix, ...info }
      return { dir: src, kind: 'source', file: src, staleVsix: path.basename(vsix), stamp: FILES.map((f) => { try { return fs.statSync(path.join(src, f)).mtimeMs } catch { return 0 } }).join(','), ...info }
    }
    if (srcOk) return { dir: src, kind: 'source', file: src, name: 'pluff-tatemono', version: '', stamp: FILES.map((f) => { try { return fs.statSync(path.join(src, f)).mtimeMs } catch { return 0 } }).join(',') }
    return null
  }

  async features() {
    const root = this.getRoot()
    const where = this.locate()
    const sig = `${where ? where.file : 'none'}|${where ? (where.stamp || fs.statSync(where.file).mtimeMs) : 0}|${fs.existsSync(path.join(root, 'scaffold.js')) ? fs.statSync(path.join(root, 'scaffold.js')).mtimeMs : 0}`
    if (this.loaded && this.loaded.sig === sig) return this.loaded
    const out = { sig, where, api: null, apiOrigin: 'none', grammar: null, languageConfig: null, provider: null, problems: [] }
    if (where) {
      try { out.grammar = JSON.parse(fs.readFileSync(path.join(where.dir, 'syntaxes', 'tatemono.tmLanguage.json'), 'utf8')) } catch (e) { out.problems.push('grammar: ' + e.message) }
      try { out.languageConfig = JSON.parse(stripJsonComments(fs.readFileSync(path.join(where.dir, 'language-configuration.json'), 'utf8'))) } catch (e) { out.problems.push('language configuration: ' + e.message) }
      try { out.api = { ...(await this.importFresh(path.join(where.dir, 'lib', 'scaffold.mjs'))) }; out.apiOrigin = where.kind } catch (e) { out.problems.push('scaffold: ' + e.message) }
      try { out.provider = loadSnippets(path.join(where.dir, 'lib', 'snippets.js')).completionProvider() } catch (e) { out.problems.push('snippets: ' + e.message) }
    } else {
      out.problems.push('The Pluff Tatemono extension (.vsix) was not found in the engine folder (vscode-extension/).')
    }
    // the repo's own scaffold.js wins (same rule as the VS Code extension: pluffy.useWorkspaceScaffold)
    const wsFile = path.join(root, 'scaffold.js')
    if (fs.existsSync(wsFile)) {
      try {
        const ws = await this.importFresh(wsFile)
        if (typeof ws.lintSource === 'function' && typeof ws.scanSource === 'function') {
          const base = out.api || {}
          out.api = { ...base, lintSource: ws.lintSource, scanSource: ws.scanSource, parseLayoutDecl: ws.parseLayoutDecl || base.parseLayoutDecl }
          out.apiOrigin = 'workspace'
          const keys = ['BLOCKS', 'blockByKey', 'normalizeName', 'crossCheck', 'candidatesFor', 'hasTag', 'eolOf', 'closest']
          if (keys.slice(0, 7).every((k) => ws[k])) for (const k of keys) if (ws[k]) out.api[k] = ws[k]
        }
      } catch (e) { out.problems.push('workspace scaffold.js ignored: ' + e.message) }
    }
    this.loaded = out
    return out
  }

  async assets() {
    const f = await this.features()
    return {
      grammar: f.grammar,
      languageConfig: f.languageConfig,
      source: f.where ? { kind: f.where.kind, name: f.where.name, version: f.where.version, file: f.where.file, staleVsix: f.where.staleVsix || null } : null,
      apiOrigin: f.apiOrigin,
      ready: !!(f.api && f.api.lintSource),
      problems: f.problems,
    }
  }

  // ---------------------------------------------------------------- language features
  dir(name) {
    if (!NAME_RE.test(String(name))) throw new Error('Invalid tatemono name.')
    const d = path.join(this.getRoot(), 'tatemonos', name)
    if (!fs.existsSync(d)) throw new Error(`Tatemono "${name}" was not found.`)
    return d
  }

  diskWarnings(name, text, api) {
    if (!name || !api.scanSource) return []
    let dir
    try { dir = this.dir(name) } catch { return [] }
    const out = []
    for (const o of api.scanSource(text).openers) {
      if (o.tag !== 'meta:web') continue
      const m = /^\s*favicon:\s*(\S+)/m.exec(o.yaml || '')
      const fav = m && /^\/tatemonos\/[^/]+\/assets\/(.+)$/.exec(m[1].replace(/^["']|["']$/g, ''))
      if (fav && !fs.existsSync(path.join(dir, 'assets', fav[1]))) out.push({ msg: `favicon assets/${fav[1]} does not exist yet (meta:web points at it)`, line: o.line })
    }
    return out
  }

  async lint({ name, text }) {
    const { api } = await this.features()
    if (!api || !api.lintSource) return { errors: [], warnings: [], unavailable: true }
    const res = api.lintSource(text, { variant: null, slug: name || undefined })
    return { errors: res.errors.map((f) => ({ msg: f.msg, line: f.line || 1 })), warnings: [...res.warnings, ...this.diskWarnings(name, text, api)].map((f) => ({ msg: f.msg, line: f.line || 1 })) }
  }

  blockRanges(text, api) {
    const lines = text.split(/\r?\n/)
    const model = api.scanSource(text)
    const blocks = []
    for (const o of model.openers) {
      if (o.decl !== undefined) continue
      const start = o.line - 1
      const endRe = new RegExp('^\\s*/\\*\\s*@arkzen:' + escapeRe(o.tag) + ':end\\s*\\*/')
      let end = -1
      for (let i = start; i < lines.length; i++) if (endRe.test(lines[i])) { end = i; break }
      if (end < 0) for (let i = start; i < lines.length; i++) if (lines[i].includes('*/')) { end = i; break }
      blocks.push({ tag: o.tag, start, end: end < 0 ? start : end })
    }
    return blocks
  }

  async outline(text) {
    const { api } = await this.features()
    if (!api || !api.scanSource) return []
    return this.blockRanges(text, api).map((b) => ({ tag: b.tag, line: b.start + 1, end: b.end + 1, hidden: /^(import|resolved):/.test(b.tag) }))
  }

  async complete({ text, line, col }) {
    const { provider } = await this.features()
    if (!provider) return []
    const lines = text.split(/\r?\n/)
    const doc = { lineAt: (n) => ({ text: lines[n] || '' }), getText: () => text }
    const items = provider.provideCompletionItems(doc, { line, character: col }) || []
    return items.map((it) => {
      const snippet = it.insertText && typeof it.insertText === 'object' ? it.insertText.value : null
      const insert = snippet !== null ? snippet : (typeof it.insertText === 'string' ? it.insertText : it.label)
      const r = it.range
      // The extension replaces the whole typed "/* @arkzen:xyz" and leaves the filter to VS Code, which
      // matches the label against the word. Monaco matches against the replaced text, so say so.
      let filter = it.filterText || null
      if (!filter && r && r.start.line === r.end.line) {
        const typed = (lines[r.start.line] || '').slice(r.start.character, r.end.character)
        const open = /^\/\*\s*@arkzen:/.exec(typed)
        if (open) filter = open[0] + it.label
      }
      return { label: it.label, detail: it.detail || '', kind: String(it.kind || 'Snippet'), insert, snippet: snippet !== null, filter, range: r ? { sl: r.start.line, sc: r.start.character, el: r.end.line, ec: r.end.character } : null }
    })
  }

  blockForTag(api, tag) {
    if (!api.BLOCKS) return null
    const VARIANT = new Set(['php', 'ts', 'py', 'java', 'cs', 'go', 'rs', 'expo', 'rn', 'lynx'])
    const segs = tag.split(':')
    const tries = []
    if (segs.includes('lynx') && segs[0] === 'native') {
      const kind = segs[1]
      if (kind === 'style') tries.push(segs.length > 3 ? 'lynx:style:name' : 'lynx:style')
      else if (kind === 'error') tries.push(`lynx:error:${segs[2]}`)
      else tries.push(`lynx:${kind}`)
    }
    for (let n = segs.length; n >= 1; n--) {
      const head = segs.slice(0, n)
      tries.push(head.join(':'), head.filter((s) => !VARIANT.has(s)).join(':'), head.join(':') + ':name')
    }
    for (const key of tries) { const b = api.BLOCKS.find((x) => x.key === key); if (b) return b }
    return null
  }

  async hover({ tag }) {
    const { api } = await this.features()
    if (!api) return null
    const t = String(tag).replace(/:end$/, '')
    const layout = /^(web:page|native:page(?::lynx)?):layout:(.+)$/.exec(t)
    if (layout && api.parseLayoutDecl) {
      const d = api.parseLayoutDecl(layout[2])
      const parts = []
      if (d.guard) parts.push(`**${d.guard}** guard`)
      if (d.layout) parts.push(`layout chain **${d.layout}**`)
      return `**Inline page layout line**  \n${parts.join(' + ') || 'default layout'}  \nPlace it directly after the page opener (no \`:end\`).`
    }
    const b = this.blockForTag(api, t)
    if (!b) return null
    const lines = [`**@arkzen:${b.key}**  `, `${b.sub}  `, `_${b.group}_`]
    if (b.variants) lines.push('', `Variants: ${b.variants.list.map((v) => '`:' + v + '`').join(' ')}${b.variants.optional ? ' (or shared, no suffix)' : ''}`)
    if (b.once) lines.push('', 'Write it once per tatemono.')
    return lines.join('\n')
  }

  // ---------------------------------------------------------------- add block
  gameKind(text) {
    return /@arkzen:godot:project/.test(text) ? 'godot' : /@arkzen:unity:project/.test(text) ? 'unity' : /@arkzen:unreal:project/.test(text) ? 'unreal' : null
  }

  async catalog(text) {
    const { api } = await this.features()
    if (!api || !api.BLOCKS) return { error: 'The block registry is missing. Update the extension (.vsix) or the engine.' }
    const game = this.gameKind(text)
    const blocks = api.BLOCKS.filter((b) => (game ? b.game === game : !b.game)).map((b) => {
      let problem = null
      try { problem = b.needs ? b.needs(text) || null : null } catch { /* ignore */ }
      return {
        key: b.key, group: b.group, sub: b.sub, once: !!b.once, composite: !!b.composite, problem,
        variants: b.variants ? { list: b.variants.list, optional: !!b.variants.optional, labels: b.variants.labels, backend: !!b.variants.backend } : null,
        name: b.name ? { prompt: b.name.prompt, def: b.name.def ?? '', choices: b.name.choices || null } : null,
        extra: b.extra ? { key: b.extra.key, prompt: b.extra.prompt, def: b.extra.def ?? '' } : null,
        pageLayout: PAGE_KEYS.includes(b.key), layoutParent: LAYOUT_KEYS.includes(b.key),
        unityMode: b.key === 'unity:project',
      }
    })
    return { game, blocks }
  }

  async candidates({ text, key, variant }) {
    const { api } = await this.features()
    const block = api.blockByKey(key)
    if (!block) return { error: `Unknown block "${key}".` }
    if (!block.name && !block.composite) return { names: null }
    const cands = api.candidatesFor(block, api.scanSource(text), variant || null)
    if (!cands) return { names: null }
    if (cands.missing) return { error: cands.missing }
    const open = cands.all.filter((n) => !cands.done.has(n))
    return { names: open, what: cands.what, allDone: open.length === 0 }
  }

  // Builds the new text exactly like `mizumi block` / the extension: validated, never worse than before.
  async plan({ name, text, key, variant = null, names = [null], flags = {} }) {
    const { api } = await this.features()
    const block = api.blockByKey(key)
    if (!block) return { error: `Unknown block "${key}".` }
    if (block.needs) { const problem = block.needs(text); if (problem) return { error: problem } }
    const slug = name || 'tatemono'
    flags = { ...flags }
    if (block.key === 'file') {
      const p = String(flags.path || '').replace(/\\/g, '/')
      if (!p || p.split('/').includes('..') || /^[A-Za-z]:/.test(p)) return { error: `path "${flags.path || ''}" is not allowed: use a relative path without .. or a drive letter.` }
      flags.path = p
    }
    for (const k of ['layout', 'parent']) { if (typeof flags[k] === 'string') { flags[k] = flags[k].trim(); if (!flags[k] || flags[k] === 'none') delete flags[k] } }
    if (flags.mode !== 'scene') delete flags.mode

    const eol = api.eolOf(text)
    const trimmedLength = text.replace(/\s*$/, '').length
    let candidate = text
    const written = [], notes = []
    const work = block.composite ? names.flatMap((n) => block.composite.map((k) => [api.blockByKey(k), n])) : names.map((n) => [block, n])
    for (const [b, rawName] of work) {
      let bname = null
      if (b.name) {
        const r = api.normalizeName(b, rawName, flags)
        if (r.error) return { error: r.error }
        bname = r.value
        if (r.note && !notes.includes(r.note)) notes.push(r.note)
        if (b.name.choices && !b.name.choices.includes(bname)) return { error: `"${bname}" is not a valid ${b.key} choice. Use: ${b.name.choices.join(', ')}.` }
      }
      const model = api.scanSource(candidate)
      const problem = api.crossCheck(b, bname, variant, model, false)
      if (problem) return { error: problem }
      const f = { ...flags }
      if (b.key === 'web:page' && !f.layout && /^true$/i.test((model.meta && model.meta.auth) || '')) {
        const guard = /^(login|register|signup|sign-in|sign-up|forgot-password|reset-password)$/.test(bname) ? '+guest' : /^(dashboard|account|profile|settings|admin)$/.test(bname) ? '+auth' : null
        if (guard) { f.layout = guard; notes.push(`page "${bname}": added layout ${guard} because auth is on`) }
      }
      const tag = b.tag(bname, variant)
      if (api.hasTag(candidate, tag)) return { error: `@arkzen:${tag} already exists in this file.` }
      const snippet = b.build({ name: bname, slug, variant, flags: f })
      candidate = candidate.replace(/\s*$/, '') + eol + eol + snippet.replace(/\n/g, eol)
      written.push(tag)
    }
    const before = api.lintSource(text, { variant: null, slug: name || undefined })
    const after = api.lintSource(candidate, { variant: null, slug: name || undefined })
    const known = new Set(before.errors.map((e) => e.msg))
    const fresh = after.errors.filter((e) => !known.has(e.msg)).map((e) => e.msg)
    return { insertion: candidate.slice(trimmedLength), trimmedLength, written, notes, fresh, eol }
  }

  // ---------------------------------------------------------------- files
  safe(name, rel) {
    const dir = this.dir(name)
    const clean = String(rel).replace(/\\/g, '/')
    if (!clean || clean.startsWith('/') || clean.split('/').includes('..') || /^[A-Za-z]:/.test(clean)) throw new Error('Path is not allowed.')
    return { dir, file: path.join(dir, ...clean.split('/')) }
  }

  files(name) {
    const dir = this.dir(name)
    const out = []
    const walk = (d, rel, depth) => {
      let entries = []
      try { entries = fs.readdirSync(d, { withFileTypes: true }) } catch { return }
      entries.sort((a, b) => (a.isDirectory() - b.isDirectory()) || a.name.localeCompare(b.name))
      for (const e of entries) {
        if (out.length > 400) return
        const r = rel ? `${rel}/${e.name}` : e.name
        if (e.isDirectory()) { if (!SKIP_DIR.has(e.name) && depth < 3) walk(path.join(d, e.name), r, depth + 1); continue }
        const ext = path.extname(e.name).toLowerCase()
        const size = fs.statSync(path.join(d, e.name)).size
        out.push({ path: r, size, kind: IMAGE_EXT[ext] && ext !== '.svg' ? 'image' : (TEXT_EXT.has(ext) || e.name === 'core.tsx' ? 'text' : 'other') })
      }
    }
    walk(dir, '', 0)
    out.sort((a, b) => (a.path === 'core.tsx' ? -1 : b.path === 'core.tsx' ? 1 : 0))
    return out
  }

  read(name, rel) {
    const { file } = this.safe(name, rel)
    const st = fs.statSync(file)
    const ext = path.extname(file).toLowerCase()
    if (IMAGE_EXT[ext] && ext !== '.svg') {
      if (st.size > 8 * 1024 * 1024) return { kind: 'big', size: st.size }
      return { kind: 'image', url: `data:${IMAGE_EXT[ext]};base64,${fs.readFileSync(file).toString('base64')}`, size: st.size }
    }
    if (st.size > 2 * 1024 * 1024) return { kind: 'big', size: st.size }
    const buf = fs.readFileSync(file)
    if (buf.includes(0)) return { kind: 'binary', size: st.size }
    return { kind: 'text', text: buf.toString('utf8'), mtime: st.mtimeMs }
  }

  write(name, rel, text) {
    const { file } = this.safe(name, rel)
    fs.writeFileSync(file, text, 'utf8')
    const mtime = fs.statSync(file).mtimeMs
    this.lastWrite.set(`${name}/${rel}`, mtime)
    return { mtime }
  }

  watch(name) {
    if (this.watchName === name) return { ok: true }
    if (this.watcher) { try { this.watcher.close() } catch { /* gone */ } this.watcher = null }
    this.watchName = name || null
    if (!name) return { ok: true }
    const dir = this.dir(name)
    const timers = new Map()
    try {
      this.watcher = fs.watch(dir, { recursive: true }, (_evt, filename) => {
        if (!filename) return
        const rel = String(filename).replace(/\\/g, '/')
        clearTimeout(timers.get(rel))
        timers.set(rel, setTimeout(() => {
          timers.delete(rel)
          let mtime = 0
          try { mtime = fs.statSync(path.join(dir, ...rel.split('/'))).mtimeMs } catch { mtime = -1 }
          if (this.lastWrite.get(`${name}/${rel}`) === mtime) return        // our own save
          this.emit({ type: 'tm:changed', name, rel, deleted: mtime === -1 })
        }, 150))
      })
      this.watcher.on('error', () => { /* folder removed */ })
    } catch { /* watching is a convenience */ }
    return { ok: true }
  }

  stop() { if (this.watcher) { try { this.watcher.close() } catch { /* gone */ } this.watcher = null; this.watchName = null } }
}

module.exports = { Tatemono }
