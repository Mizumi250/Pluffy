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

  async lint({ name, text, variant = null }) {
    const { api } = await this.features()
    if (!api || !api.lintSource) return { errors: [], warnings: [], unavailable: true }
    const res = api.lintSource(text, { variant: variant || null, slug: name || undefined })
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

  // ---------------------------------------------------------------- go to definition
  // Same rules as the extension's definitionProvider. Lines and columns are 0-based.
  geometry(text, api) {
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
      blocks.push({ o, start, end: end < 0 ? start : end })
    }
    return { lines, model, blocks }
  }

  async definition({ text, line, col }) {
    const { api } = await this.features()
    if (!api || !api.scanSource) return []
    const { lines, blocks } = this.geometry(text, api)
    const at = lines[line] || ''
    const find = (re) => { const out = []; lines.forEach((l, i) => { if (re.test(l)) out.push({ line: i, col: Math.max(l.indexOf('@arkzen'), 0) }) }); return out }
    const opener = (family, name) => new RegExp(`^\\s*/\\*\\s*@arkzen:${family}:${escapeRe(name)}(?![\\w:+-])`)
    let m

    // page layout line -> the layout block
    if ((m = /@arkzen:(web:page|native:page(?::lynx)?):layout:([^\s*]+)/.exec(at)) && api.parseLayoutDecl) {
      const d = api.parseLayoutDecl(m[2])
      if (d.layout) {
        const family = m[1] === 'web:page' ? 'web:layout' : m[1].includes('lynx') ? 'native:layout:lynx' : 'native:layout'
        return find(opener(family, d.layout))
      }
    }
    // parent: x inside a layout -> the parent layout block
    if ((m = /^\s*parent:\s*["']?([A-Za-z0-9_-]+)/.exec(at))) {
      for (let i = line; i >= 0; i--) {
        const mm = /\/\*\s*@arkzen:(web:layout|native:layout:lynx|native:layout):[A-Za-z0-9_-]+/.exec(lines[i])
        if (mm) return find(opener(mm[1], m[1]))
      }
    }
    // routes handler: x -> handler bodies
    if ((m = /^\s*(?:-\s*)?handler:\s*["']?([A-Za-z0-9_]+)/.exec(at))) {
      return find(new RegExp(`^\\s*/\\*\\s*@arkzen:handler:(?:[a-z]+:)?${escapeRe(m[1])}(?![\\w-])`))
    }
    // listeners: [A, B] -> listener bodies (the word under the cursor)
    if (/listeners:\s*\[/.test(at)) {
      const re = /[A-Za-z0-9_]+/g
      let w
      while ((w = re.exec(at))) {
        if (col >= w.index && col <= w.index + w[0].length) return find(new RegExp(`^\\s*/\\*\\s*@arkzen:listener:(?:[a-z]+:)?${escapeRe(w[0])}(?![\\w-])`))
      }
    }
    // endpoint body -> the endpoint key inside the api block
    if ((m = /@arkzen:endpoint:(?:[a-z]+:)?([A-Za-z0-9_]+)/.exec(at)) && !/:end\b/.test(at)) {
      const out = []
      for (const b of blocks.filter((x) => x.o.family === 'api')) {
        let inEndpoints = false
        for (let i = b.start; i <= b.end; i++) {
          if (/^\s*endpoints:\s*$/.test(lines[i])) { inEndpoints = true; continue }
          if (inEndpoints && new RegExp(`^\\s+${escapeRe(m[1])}:\\s*$`).test(lines[i])) out.push({ line: i, col: lines[i].search(/\S/) })
        }
      }
      if (out.length) return out
    }
    // endpoint key inside an api block -> the endpoint bodies
    const km = /^\s{2,}([A-Za-z0-9_]+):\s*$/.exec(at)
    if (km) {
      const b = blocks.find((x) => x.o.family === 'api' && line > x.start && line <= x.end)
      if (b && lines.slice(b.start, line).some((l) => /^\s*endpoints:\s*$/.test(l))) {
        return find(new RegExp(`^\\s*/\\*\\s*@arkzen:endpoint:(?:[a-z]+:)?${escapeRe(km[1])}(?![\\w-])`))
      }
    }
    return []
  }

  // ---------------------------------------------------------------- quick fixes
  // `issues` are the problems under the cursor: [{ msg, line }] (line is 1-based, like the problem list).
  // Returns [{ issue, title, edits: [{ sl, sc, el, ec, text }] }], 0-based, text uses \n (the editor adapts it).
  async fixes({ text, issues = [] }) {
    const lines = text.split(/\r?\n/)
    const OPENER_RE = /^\s*\/\*\s*@arkzen:(?!import:|resolved:)(?![^\s*]*:page:(?:lynx:)?layout:)([A-Za-z0-9:_+.{}-]+)/
    const isOpenerLine = (l) => { const m = OPENER_RE.exec(l); return !!m && !m[1].endsWith(':end') }
    const out = []
    issues.forEach((d, issue) => {
      const row = Math.min(Math.max((d.line || 1) - 1, 0), Math.max(lines.length - 1, 0))
      const msg = String(d.msg || '')
      let m
      if ((m = /^@arkzen:(\S+) is missing its closing \/\* @arkzen:\S+:end \*\/$/.exec(msg))) {
        const tag = m[1]
        let next = lines.length
        for (let j = row + 1; j < lines.length; j++) if (isOpenerLine(lines[j])) { next = j; break }
        let k = next - 1
        while (k > row && !lines[k].trim()) k--
        const c = (lines[k] || '').length
        out.push({ issue, title: `Add closing /* @arkzen:${tag}:end */`, edits: [{ sl: k, sc: c, el: k, ec: c, text: `\n/* @arkzen:${tag}:end */` }] })
      } else if (/^@arkzen:oauth requires auth: true/.test(msg)) {
        const open = lines.findIndex((l) => /^\s*\/\*\s*@arkzen:meta\s*$/.test(l))
        if (open < 0) return
        let close = open + 1
        while (close < lines.length && !lines[close].includes('*/')) close++
        let edit = null
        for (let i = open + 1; i < close; i++) {
          if (/^\s*auth:/.test(lines[i])) { edit = { sl: i, sc: 0, el: i, ec: lines[i].length, text: 'auth: true' }; break }
        }
        if (!edit) {
          let at = open
          for (let i = open + 1; i < close; i++) if (/^\s*name:/.test(lines[i])) { at = i; break }
          edit = { sl: at, sc: lines[at].length, el: at, ec: lines[at].length, text: '\nauth: true' }
        }
        out.push({ issue, title: 'Set auth: true in @arkzen:meta', edits: [edit] })
      } else if ((m = /^@arkzen:(\S+?): .*Did you mean "([^"]+)"\?/.exec(msg))) {
        const tag = m[1]
        const fixed = tag.slice(0, tag.lastIndexOf(':') + 1) + m[2]
        const edits = []
        const opener = new RegExp(escapeRe('@arkzen:' + tag) + '(?![\\w:+-])').exec(lines[row] || '')
        if (opener) edits.push({ sl: row, sc: opener.index, el: row, ec: opener.index + opener[0].length, text: '@arkzen:' + fixed })
        const closeRe = new RegExp(escapeRe('@arkzen:' + tag + ':end'))
        for (let i = row + 1; i < lines.length; i++) {
          const c = closeRe.exec(lines[i])
          if (c) { edits.push({ sl: i, sc: c.index, el: i, ec: c.index + c[0].length, text: '@arkzen:' + fixed + ':end' }); break }
        }
        if (edits.length) out.push({ issue, title: `Rename block to @arkzen:${fixed}`, edits })
      }
    })
    return out
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
  async plan({ name, text, key, variant = null, names = [null], flags = {}, lintVariant = null }) {
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
    const before = api.lintSource(text, { variant: lintVariant || null, slug: name || undefined })
    const after = api.lintSource(candidate, { variant: lintVariant || null, slug: name || undefined })
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
