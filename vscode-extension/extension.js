'use strict'
// Pluff Tatemono for VS Code
//
//   lib/snippets.js   hand-tuned completions (block snippets, closers, layout lines, oauth providers)
//   lib/scaffold.mjs  bundled copy of Pluffy's scaffold.js (see scripts/sync-scaffold.js). Provides
//                     the linter, the source scanner and every block builder, so the editor and
//                     `node mizumi.js check|block` can never disagree.
//
// If the open workspace has its own scaffold.js, its linter/scanner win (setting:
// pluffy.useWorkspaceScaffold), so the extension follows your newest rules without a rebuild.

const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')
const { completionProvider } = require('./lib/snippets')

const LANG = 'tatemono'
const SELECTOR = { language: LANG }
const VARIANT_TOKENS = new Set(['php', 'ts', 'py', 'java', 'cs', 'go', 'rs', 'expo', 'rn', 'lynx'])
const PAGE_KEYS = ['web:page', 'native:page', 'lynx:page']
const LAYOUT_KEYS = ['web:layout', 'native:layout', 'lynx:layout']
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

let ctx, output, diagnostics, statusItem
const importCache = new Map()
const timers = new Map()

const log = msg => output && output.appendLine(`[${new Date().toISOString().slice(11, 19)}] ${msg}`)
const cfg = () => vscode.workspace.getConfiguration('pluffy')

// ─── scaffold loading ──────────────────────────────────────────

function importFresh(file) {
  const stat = fs.statSync(file)
  const key = `${file}:${stat.mtimeMs}`
  if (!importCache.has(key)) importCache.set(key, import(pathToFileURL(file).href + '?v=' + Math.floor(stat.mtimeMs)))
  return importCache.get(key)
}

function workspaceFolderFor(doc) {
  return (doc && vscode.workspace.getWorkspaceFolder(doc.uri)) || (vscode.workspace.workspaceFolders || [])[0]
}

async function getScaffold(doc) {
  const bundled = await importFresh(path.join(ctx.extensionPath, 'lib', 'scaffold.mjs'))
  let api = { ...bundled, origin: 'bundled' }
  if (!cfg().get('useWorkspaceScaffold', true)) return api
  const folder = workspaceFolderFor(doc)
  const file = folder && path.join(folder.uri.fsPath, 'scaffold.js')
  if (!file || !fs.existsSync(file)) return api
  try {
    const ws = await importFresh(file)
    if (typeof ws.lintSource === 'function' && typeof ws.scanSource === 'function') {
      api = { ...api, lintSource: ws.lintSource, scanSource: ws.scanSource, parseLayoutDecl: ws.parseLayoutDecl || api.parseLayoutDecl, origin: 'workspace' }
      const full = ['BLOCKS', 'blockByKey', 'normalizeName', 'crossCheck', 'candidatesFor', 'hasTag', 'eolOf'].every(k => ws[k])
      if (full) api = { ...api, ...Object.fromEntries(['BLOCKS', 'blockByKey', 'normalizeName', 'crossCheck', 'candidatesFor', 'hasTag', 'eolOf', 'closest'].filter(k => ws[k]).map(k => [k, ws[k]])) }
    }
  } catch (e) {
    log(`workspace scaffold.js ignored: ${e.message}`)
  }
  return api
}

function backendVariant() {
  const v = cfg().get('backend', 'auto')
  return v && v !== 'auto' ? v : null
}

function slugFor(doc) {
  const m = /[\\/]tatemonos[\\/]([^\\/]+)[\\/]core\.tsx$/.exec(doc.uri.fsPath)
  if (m) return m[1]
  const t = /([^\\/]+)\.tatemono$/.exec(doc.uri.fsPath)
  return t ? t[1] : undefined
}

// ─── diagnostics ───────────────────────────────────────────────

function toDiagnostic(doc, finding, severity) {
  const line = Math.min(Math.max((finding.line || 1) - 1, 0), Math.max(doc.lineCount - 1, 0))
  const l = doc.lineAt(line)
  const start = l.firstNonWhitespaceCharacterIndex || 0
  const d = new vscode.Diagnostic(new vscode.Range(line, start, line, l.range.end.character), finding.msg, severity)
  d.source = 'pluffy'
  return d
}

// `mizumi check` also verifies, on disk, that the meta:web favicon exists. lintSource is pure, so repeat it here.
function diskWarnings(doc, api) {
  if (!/[\\/]tatemonos[\\/][^\\/]+[\\/]core\.tsx$/.test(doc.uri.fsPath)) return []
  const dir = path.dirname(doc.uri.fsPath)
  const out = []
  for (const o of api.scanSource(doc.getText()).openers) {
    if (o.tag !== 'meta:web') continue
    const m = /^\s*favicon:\s*(\S+)/m.exec(o.yaml || '')
    const fav = m && /^\/tatemonos\/[^/]+\/assets\/(.+)$/.exec(m[1].replace(/^["']|["']$/g, ''))
    if (fav && !fs.existsSync(path.join(dir, 'assets', fav[1]))) out.push({ msg: `favicon assets/${fav[1]} does not exist yet (meta:web points at it)`, line: o.line })
  }
  return out
}

async function lintInto(doc) {
  const api = await getScaffold(doc)
  const res = api.lintSource(doc.getText(), { variant: backendVariant(), slug: slugFor(doc) })
  const warnings = [...res.warnings, ...diskWarnings(doc, api)]
  const list = [
    ...res.errors.map(f => toDiagnostic(doc, f, vscode.DiagnosticSeverity.Error)),
    ...warnings.map(f => toDiagnostic(doc, f, vscode.DiagnosticSeverity.Warning)),
  ]
  diagnostics.set(doc.uri, list)
  return { errors: res.errors.length, warnings: warnings.length }
}

async function refreshDiagnostics(doc) {
  if (doc.languageId !== LANG || !cfg().get('lint.enable', true)) {
    diagnostics.delete(doc.uri)
  } else {
    try { await lintInto(doc) } catch (e) { log(`lint failed for ${doc.uri.fsPath}: ${e.message}`) }
  }
  updateStatus()
}

function scheduleRefresh(doc) {
  const key = doc.uri.toString()
  clearTimeout(timers.get(key))
  timers.set(key, setTimeout(() => { timers.delete(key); refreshDiagnostics(doc) }, 250))
}

function updateStatus() {
  const ed = vscode.window.activeTextEditor
  if (!ed || ed.document.languageId !== LANG || !cfg().get('lint.enable', true)) return statusItem.hide()
  const list = diagnostics.get(ed.document.uri) || []
  const errors = list.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length
  const warnings = list.length - errors
  statusItem.text = errors ? `$(error) Pluffy ${errors}` : warnings ? `$(warning) Pluffy ${warnings}` : '$(check) Pluffy'
  statusItem.tooltip = errors || warnings ? `${errors} error(s), ${warnings} warning(s). Click to open Problems.` : 'Tatemono is clean (same rules as mizumi check).'
  statusItem.command = 'workbench.actions.view.problems'
  statusItem.show()
}

// ─── block geometry (outline, folding, definitions) ────────────

function blockRanges(doc, api) {
  const text = doc.getText()
  const lines = text.split(/\r?\n/)
  const model = api.scanSource(text)
  const out = []
  for (const o of model.openers) {
    if (o.decl !== undefined) continue
    const start = o.line - 1
    const endRe = new RegExp('^\\s*/\\*\\s*@arkzen:' + escapeRe(o.tag) + ':end\\s*\\*/')
    let end = -1
    for (let i = start; i < lines.length; i++) if (endRe.test(lines[i])) { end = i; break }
    if (end < 0) for (let i = start; i < lines.length; i++) if (lines[i].includes('*/')) { end = i; break }
    out.push({ o, start, end: end < 0 ? start : end })
  }
  return { lines, model, blocks: out }
}

function symbolKind(tag) {
  const k = vscode.SymbolKind
  const [head, second] = tag.split(':')
  if (head === 'web' || head === 'native') {
    if (second === 'page') return k.File
    if (second === 'layout') return k.Namespace
    if (second === 'components') return k.Class
    if (second === 'style') return k.Property
    if (second === 'error') return k.Constant
    if (second === 'config') return k.Module
    return k.Function
  }
  switch (head) {
    case 'meta': case 'oauth': case 'desktop': return k.Module
    case 'database': return k.Struct
    case 'api': return k.Interface
    case 'routes': return k.Namespace
    case 'endpoint': case 'handler': case 'policy': case 'middleware': return k.Method
    case 'listener': case 'events': case 'realtime': return k.Event
    case 'jobs': case 'console': case 'notifications': case 'mail': return k.Function
    case 'file': return k.File
    case 'godot': case 'unity': case 'unreal': case 'ext': case 'pkg': return k.Object
    default: return k.Variable
  }
}

const symbolProvider = {
  async provideDocumentSymbols(doc) {
    const api = await getScaffold(doc)
    const { lines, blocks } = blockRanges(doc, api)
    return blocks
      .filter(b => !/^(import|resolved):/.test(b.o.tag))
      .map(b => {
        const range = new vscode.Range(b.start, 0, b.end, (lines[b.end] || '').length)
        const sel = new vscode.Range(b.start, 0, b.start, (lines[b.start] || '').length)
        return new vscode.DocumentSymbol(`@arkzen:${b.o.tag}`, '', symbolKind(b.o.tag), range, sel)
      })
  },
}

const foldingProvider = {
  async provideFoldingRanges(doc) {
    const api = await getScaffold(doc)
    return blockRanges(doc, api).blocks
      .filter(b => b.end > b.start)
      .map(b => new vscode.FoldingRange(b.start, b.end, vscode.FoldingRangeKind.Region))
  },
}

// ─── hover ─────────────────────────────────────────────────────

function blockForTag(api, tag) {
  if (!api.BLOCKS) return null
  const segs = tag.split(':')
  const tries = []
  if (segs.includes('lynx') && (segs[0] === 'native')) {
    const kind = segs[1]
    if (kind === 'style') tries.push(segs.length > 3 ? 'lynx:style:name' : 'lynx:style')
    else if (kind === 'error') tries.push(`lynx:error:${segs[2]}`)
    else tries.push(`lynx:${kind}`)
  }
  for (let n = segs.length; n >= 1; n--) {
    const head = segs.slice(0, n)
    tries.push(head.join(':'), head.filter(s => !VARIANT_TOKENS.has(s)).join(':'))
    tries.push(head.join(':') + ':name')
  }
  for (const key of tries) { const b = api.BLOCKS.find(x => x.key === key); if (b) return b }
  return null
}

const hoverProvider = {
  async provideHover(doc, pos) {
    const range = doc.getWordRangeAtPosition(pos, /@arkzen:[A-Za-z0-9:_+.{}-]+/)
    if (!range) return undefined
    const tag = doc.getText(range).slice('@arkzen:'.length).replace(/:end$/, '')
    const api = await getScaffold(doc)

    const layout = /^(web:page|native:page(?::lynx)?):layout:(.+)$/.exec(tag)
    if (layout) {
      const d = api.parseLayoutDecl(layout[2])
      const parts = []
      if (d.guard) parts.push(`**${d.guard}** guard`)
      if (d.layout) parts.push(`layout chain **${d.layout}**`)
      const md = new vscode.MarkdownString(`**Inline page layout line**  \n${parts.join(' + ') || 'default layout'}  \nPlace it directly after the page opener (no \`:end\`).`)
      return new vscode.Hover(md, range)
    }

    const b = blockForTag(api, tag)
    if (!b) return undefined
    const lines = [`**@arkzen:${b.key}**  `, `${b.sub}  `, `_${b.group}_`]
    if (b.variants) lines.push('', `Variants: ${b.variants.list.map(v => '`:' + v + '`').join(' ')}${b.variants.optional ? ' (or shared, no suffix)' : ''}`)
    if (b.once) lines.push('', 'Write it once per tatemono.')
    return new vscode.Hover(new vscode.MarkdownString(lines.join('\n')), range)
  },
}

// ─── go to definition ──────────────────────────────────────────

function locate(doc, lines, re) {
  const out = []
  lines.forEach((l, i) => { if (re.test(l)) out.push(new vscode.Location(doc.uri, new vscode.Position(i, Math.max(l.indexOf('@arkzen'), 0)))) })
  return out
}

const openerRe = (family, name) => new RegExp(`^\\s*/\\*\\s*@arkzen:${family}:${escapeRe(name)}(?![\\w:+-])`)

const definitionProvider = {
  async provideDefinition(doc, pos) {
    const api = await getScaffold(doc)
    const { lines, blocks } = blockRanges(doc, api)
    const line = lines[pos.line] || ''
    let m

    // page layout line -> the layout block
    if ((m = /@arkzen:(web:page|native:page(?::lynx)?):layout:([^\s*]+)/.exec(line))) {
      const d = api.parseLayoutDecl(m[2])
      if (d.layout) {
        const family = m[1] === 'web:page' ? 'web:layout' : m[1].includes('lynx') ? 'native:layout:lynx' : 'native:layout'
        return locate(doc, lines, openerRe(family, d.layout))
      }
    }

    // parent: x inside a layout -> parent layout block
    if ((m = /^\s*parent:\s*["']?([A-Za-z0-9_-]+)/.exec(line))) {
      for (let i = pos.line; i >= 0; i--) {
        const mm = /\/\*\s*@arkzen:(web:layout|native:layout:lynx|native:layout):[A-Za-z0-9_-]+/.exec(lines[i])
        if (mm) return locate(doc, lines, openerRe(mm[1], m[1]))
      }
    }

    // routes handler: x -> handler bodies
    if ((m = /^\s*(?:-\s*)?handler:\s*["']?([A-Za-z0-9_]+)/.exec(line))) {
      return locate(doc, lines, new RegExp(`^\\s*/\\*\\s*@arkzen:handler:(?:[a-z]+:)?${escapeRe(m[1])}(?![\\w-])`))
    }

    // listeners: [A, B] -> listener bodies
    if (/listeners:\s*\[/.test(line)) {
      const w = doc.getWordRangeAtPosition(pos, /[A-Za-z0-9_]+/)
      if (w) return locate(doc, lines, new RegExp(`^\\s*/\\*\\s*@arkzen:listener:(?:[a-z]+:)?${escapeRe(doc.getText(w))}(?![\\w-])`))
    }

    // endpoint body -> endpoint key inside the api block
    if ((m = /@arkzen:endpoint:(?:[a-z]+:)?([A-Za-z0-9_]+)/.exec(line)) && !/:end\b/.test(line)) {
      const out = []
      for (const b of blocks.filter(x => x.o.family === 'api')) {
        let inEndpoints = false
        for (let i = b.start; i <= b.end; i++) {
          if (/^\s*endpoints:\s*$/.test(lines[i])) { inEndpoints = true; continue }
          if (inEndpoints && new RegExp(`^\\s+${escapeRe(m[1])}:\\s*$`).test(lines[i])) out.push(new vscode.Location(doc.uri, new vscode.Position(i, lines[i].search(/\S/))))
        }
      }
      if (out.length) return out
    }

    // endpoint key inside an api block -> endpoint bodies
    const km = /^\s{2,}([A-Za-z0-9_]+):\s*$/.exec(line)
    if (km) {
      const b = blocks.find(x => x.o.family === 'api' && pos.line > x.start && pos.line <= x.end)
      if (b && lines.slice(b.start, pos.line).some(l => /^\s*endpoints:\s*$/.test(l))) {
        return locate(doc, lines, new RegExp(`^\\s*/\\*\\s*@arkzen:endpoint:(?:[a-z]+:)?${escapeRe(km[1])}(?![\\w-])`))
      }
    }
    return undefined
  },
}

// ─── quick fixes ───────────────────────────────────────────────

// A real block opener: not an :end marker, not a nested import pair, not an inline page layout line.
const OPENER_RE = /^\s*\/\*\s*@arkzen:(?!import:|resolved:)(?![^\s*]*:page:(?:lynx:)?layout:)([A-Za-z0-9:_+.{}-]+)/
const isOpenerLine = l => { const m = OPENER_RE.exec(l); return !!m && !m[1].endsWith(':end') }

function fixAction(title, doc, diag, build) {
  const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix)
  action.diagnostics = [diag]
  action.isPreferred = true
  const edit = new vscode.WorkspaceEdit()
  build(edit)
  action.edit = edit
  return action
}

const actionProvider = {
  provideCodeActions(doc, range, context) {
    const lines = doc.getText().split(/\r?\n/)
    const eol = doc.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n'
    const actions = []
    for (const d of context.diagnostics) {
      if (d.source !== 'pluffy') continue
      let m

      if ((m = /^@arkzen:(\S+) is missing its closing \/\* @arkzen:\S+:end \*\/$/.exec(d.message))) {
        const tag = m[1]
        actions.push(fixAction(`Add closing /* @arkzen:${tag}:end */`, doc, d, edit => {
          let next = lines.length
          for (let j = d.range.start.line + 1; j < lines.length; j++) if (isOpenerLine(lines[j])) { next = j; break }
          let k = next - 1
          while (k > d.range.start.line && !lines[k].trim()) k--
          edit.insert(doc.uri, new vscode.Position(k, (lines[k] || '').length), `${eol}/* @arkzen:${tag}:end */`)
        }))
      } else if (/^@arkzen:oauth requires auth: true/.test(d.message)) {
        actions.push(fixAction('Set auth: true in @arkzen:meta', doc, d, edit => {
          const open = lines.findIndex(l => /^\s*\/\*\s*@arkzen:meta\s*$/.test(l))
          if (open < 0) return
          let close = open + 1
          while (close < lines.length && !lines[close].includes('*/')) close++
          for (let i = open + 1; i < close; i++) {
            if (/^\s*auth:/.test(lines[i])) return edit.replace(doc.uri, new vscode.Range(i, 0, i, lines[i].length), 'auth: true')
          }
          let at = open
          for (let i = open + 1; i < close; i++) if (/^\s*name:/.test(lines[i])) { at = i; break }
          edit.insert(doc.uri, new vscode.Position(at, lines[at].length), `${eol}auth: true`)
        }))
      } else if ((m = /^@arkzen:(\S+?): .*Did you mean "([^"]+)"\?/.exec(d.message))) {
        const tag = m[1]
        const fixed = tag.slice(0, tag.lastIndexOf(':') + 1) + m[2]
        actions.push(fixAction(`Rename block to @arkzen:${fixed}`, doc, d, edit => {
          const openRe = new RegExp(escapeRe('@arkzen:' + tag) + '(?![\\w:+-])')
          const opener = openRe.exec(lines[d.range.start.line])
          if (opener) edit.replace(doc.uri, new vscode.Range(d.range.start.line, opener.index, d.range.start.line, opener.index + opener[0].length), '@arkzen:' + fixed)
          const closeRe = new RegExp(escapeRe('@arkzen:' + tag + ':end'))
          for (let i = d.range.start.line + 1; i < lines.length; i++) {
            const c = closeRe.exec(lines[i])
            if (c) { edit.replace(doc.uri, new vscode.Range(i, c.index, i, c.index + c[0].length), '@arkzen:' + fixed + ':end'); break }
          }
        }))
      }
    }
    return actions
  },
}

// ─── commands ──────────────────────────────────────────────────

const fail = msg => { vscode.window.showErrorMessage(`Pluffy: ${msg}`); return undefined }
const pick = (items, placeHolder) => vscode.window.showQuickPick(items, { placeHolder, matchOnDescription: true, ignoreFocusOut: true })
const input = (prompt, value) => vscode.window.showInputBox({ prompt, value, ignoreFocusOut: true })

async function addBlock() {
  const editor = vscode.window.activeTextEditor
  if (!editor || editor.document.languageId !== LANG) return fail('open a tatemono (tatemonos/<name>/core.tsx) first.')
  const doc = editor.document
  const api = await getScaffold(doc)
  if (!api.BLOCKS) return fail('the block registry is missing. Run: node scripts/sync-scaffold.js')

  const source = doc.getText()
  const slug = slugFor(doc) || path.basename(path.dirname(doc.uri.fsPath))
  const gameKind = /@arkzen:godot:project/.test(source) ? 'godot' : /@arkzen:unity:project/.test(source) ? 'unity' : /@arkzen:unreal:project/.test(source) ? 'unreal' : null
  const visible = api.BLOCKS.filter(b => (gameKind ? b.game === gameKind : !b.game))

  // 1. which block
  const groups = new Map()
  for (const b of visible) { if (!groups.has(b.group)) groups.set(b.group, []); groups.get(b.group).push(b) }
  const items = []
  for (const [group, list] of groups) {
    items.push({ label: group, kind: vscode.QuickPickItemKind.Separator })
    for (const b of list) items.push({ label: b.key, description: b.sub, block: b })
  }
  const chosen = await pick(items, gameKind ? `Add a ${gameKind} block…` : 'Add which block?')
  if (!chosen) return
  const block = chosen.block
  if (block.needs) { const problem = block.needs(source); if (problem) return fail(problem) }

  // 2. variant (backend or native target)
  let variant = null
  if (block.variants) {
    const { list, optional, labels, backend } = block.variants
    const active = backend ? backendVariant() : null
    const opts = list.map(x => ({ label: `:${x}`, description: `${labels[x]}${x === active ? '  (active backend)' : ''}`, value: x }))
    opts.sort((a, b) => (b.value === active) - (a.value === active))
    if (optional) opts.unshift({ label: 'shared', description: 'YAML only, works on every backend', value: null })
    const v = await pick(opts, backend ? 'Which backend variant?' : 'Which native target?')
    if (!v) return
    variant = v.value
  }

  // 3. names
  const flags = {}
  let names = [null]
  if (block.name || block.composite) {
    const model0 = api.scanSource(source)
    const cands = api.candidatesFor(block, model0, variant)
    if (cands) {
      if (cands.missing) return fail(cands.missing)
      const open = cands.all.filter(n => !cands.done.has(n))
      if (!open.length) return vscode.window.showInformationMessage(`Pluffy: every ${cands.what} already has a body${variant ? ` for :${variant}` : ''}.`)
      if (open.length === 1) names = [open[0]]
      else { const p = await pick(open.map(n => ({ label: n })), `Which ${cands.what}?`); if (!p) return; names = [p.label] }
    } else if (block.name && block.name.choices) {
      const p = await pick(block.name.choices.map(n => ({ label: n })), block.name.prompt)
      if (!p) return
      names = [p.label]
    } else {
      const v = await input(block.name.prompt, block.name.def)
      if (v === undefined) return
      names = [v]
    }
  }

  // 4. extras some blocks need
  if (block.extra) {
    const v = await input(block.extra.prompt, block.extra.def)
    if (v === undefined) return
    flags[block.extra.key] = v
  }
  if (block.key === 'file') {
    const p = String(flags.path || '').replace(/\\/g, '/')
    if (!p || p.split('/').includes('..') || /^[A-Za-z]:/.test(p)) return fail(`path "${flags.path || ''}" is not allowed: use a relative path without .. or a drive letter.`)
    flags.path = p
  }
  if (block.key === 'unity:project') {
    const m = await pick([{ label: 'runner', description: 'dinosaur runner template' }, { label: 'scene', description: 'general scene mode' }], 'Unity project mode')
    if (!m) return
    if (m.label === 'scene') flags.mode = 'scene'
  }
  if (PAGE_KEYS.includes(block.key)) {
    const v = await vscode.window.showInputBox({ prompt: 'Layout line (optional)', placeHolder: 'e.g. +auth, +guest, app. Empty = none', ignoreFocusOut: true })
    if (v === undefined) return
    if (v.trim() && v.trim() !== 'none') flags.layout = v.trim()
  }
  if (LAYOUT_KEYS.includes(block.key)) {
    const v = await vscode.window.showInputBox({ prompt: 'Parent layout (optional)', placeHolder: 'Empty = no parent', ignoreFocusOut: true })
    if (v === undefined) return
    if (v.trim()) flags.parent = v.trim()
  }

  // 5. build against an in-memory copy, exactly like `mizumi block`
  const eol = api.eolOf(source)
  const trimmed = source.replace(/\s*$/, '')
  let candidate = source
  const written = [], notes = []
  const work = block.composite ? names.flatMap(n => block.composite.map(k => [api.blockByKey(k), n])) : names.map(n => [block, n])
  for (const [b, rawName] of work) {
    let name = null
    if (b.name) {
      const r = api.normalizeName(b, rawName, flags)
      if (r.error) return fail(r.error)
      name = r.value
      if (r.note && !notes.includes(r.note)) notes.push(r.note)
      if (b.name.choices && !b.name.choices.includes(name)) return fail(`"${name}" is not a valid ${b.key} choice. Use: ${b.name.choices.join(', ')}.`)
    }
    const model = api.scanSource(candidate)
    const problem = api.crossCheck(b, name, variant, model, false)
    if (problem) return fail(problem)

    const f = { ...flags }
    if (b.key === 'web:page' && !f.layout && /^true$/i.test((model.meta && model.meta.auth) || '')) {
      const guard = /^(login|register|signup|sign-in|sign-up|forgot-password|reset-password)$/.test(name) ? '+guest' : /^(dashboard|account|profile|settings|admin)$/.test(name) ? '+auth' : null
      if (guard) { f.layout = guard; notes.push(`page "${name}": added layout ${guard} because auth is on`) }
    }
    const tag = b.tag(name, variant)
    if (api.hasTag(candidate, tag)) return fail(`@arkzen:${tag} already exists in this file.`)
    const snippet = b.build({ name, slug, variant, flags: f })
    candidate = candidate.replace(/\s*$/, '') + eol + eol + snippet.replace(/\n/g, eol)
    written.push(tag)
  }

  // 6. never leave the tatemono worse than it was
  const lv = backendVariant()
  const before = api.lintSource(source, { variant: lv, slug })
  const after = api.lintSource(candidate, { variant: lv, slug })
  const known = new Set(before.errors.map(e => e.msg))
  const fresh = after.errors.filter(e => !known.has(e.msg))
  if (fresh.length) {
    const answer = await vscode.window.showWarningMessage(
      `Adding ${written.map(t => '@arkzen:' + t).join(', ')} would add ${fresh.length} error(s): ${fresh.slice(0, 2).map(e => e.msg).join(' | ')}`,
      { modal: true }, 'Insert anyway')
    if (answer !== 'Insert anyway') return
  }

  // 7. write into the editor buffer (undoable, no file clobbering)
  const insertion = candidate.slice(trimmed.length)
  const start = doc.positionAt(trimmed.length)
  const end = doc.positionAt(source.length)
  await editor.edit(eb => eb.replace(new vscode.Range(start, end), insertion))
  const reveal = editor.document.positionAt(trimmed.length + (trimmed ? 2 * eol.length : 0))
  editor.selection = new vscode.Selection(reveal, reveal)
  editor.revealRange(new vscode.Range(reveal, reveal), vscode.TextEditorRevealType.AtTop)
  vscode.window.showInformationMessage(`Pluffy: added ${written.map(t => '@arkzen:' + t).join(', ')}${notes.length ? '. ' + notes.join(' ') : ''}`)
}

async function checkActive() {
  const doc = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document
  if (!doc || doc.languageId !== LANG) return fail('open a tatemono first.')
  const r = await lintInto(doc)
  updateStatus()
  vscode.commands.executeCommand('workbench.actions.view.problems')
  vscode.window.showInformationMessage(r.errors || r.warnings ? `Pluffy: ${r.errors} error(s), ${r.warnings} warning(s).` : 'Pluffy: tatemono is clean.')
}

async function checkAll() {
  const files = [
    ...(await vscode.workspace.findFiles('**/tatemonos/*/core.tsx', '**/node_modules/**')),
    ...(await vscode.workspace.findFiles('**/*.tatemono', '**/node_modules/**')),
  ]
  if (!files.length) return vscode.window.showInformationMessage('Pluffy: no tatemonos found in this workspace.')
  let errors = 0, warnings = 0, bad = 0
  await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Pluffy: checking tatemonos' }, async progress => {
    for (const uri of files) {
      progress.report({ message: path.basename(path.dirname(uri.fsPath)) })
      try {
        const r = await lintInto(await vscode.workspace.openTextDocument(uri))
        errors += r.errors; warnings += r.warnings; if (r.errors) bad++
      } catch (e) { log(`check failed for ${uri.fsPath}: ${e.message}`) }
    }
  })
  updateStatus()
  vscode.commands.executeCommand('workbench.actions.view.problems')
  vscode.window.showInformationMessage(`Pluffy: ${files.length} tatemonos checked, ${errors} error(s) in ${bad}, ${warnings} warning(s).`)
}

function newTatemono() {
  const folder = (vscode.workspace.workspaceFolders || []).find(f => fs.existsSync(path.join(f.uri.fsPath, 'mizumi.js')))
  if (!folder) return fail('open the Pluffy repo (the folder that contains mizumi.js) to scaffold a tatemono.')
  const terminal = vscode.window.createTerminal({ name: 'Pluffy', cwd: folder.uri.fsPath })
  terminal.show()
  terminal.sendText('node mizumi.js new')
}

async function showScaffoldSource() {
  const doc = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document
  const api = await getScaffold(doc)
  vscode.window.showInformationMessage(`Pluffy: using the ${api.origin} scaffold.js (${api.BLOCKS ? api.BLOCKS.length : '?'} block builders).`)
}

// ─── lifecycle ─────────────────────────────────────────────────

function activate(context) {
  ctx = context
  output = vscode.window.createOutputChannel('Pluffy')
  diagnostics = vscode.languages.createDiagnosticCollection('pluffy')
  statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50)

  const reg = (id, fn) => vscode.commands.registerCommand(id, fn)
  const refreshAll = () => vscode.workspace.textDocuments.forEach(refreshDiagnostics)
  const watcher = vscode.workspace.createFileSystemWatcher('**/scaffold.js')

  context.subscriptions.push(
    output, diagnostics, statusItem, watcher,
    vscode.languages.registerCompletionItemProvider(SELECTOR, completionProvider(), '@', ':', '+', '[', ','),
    vscode.languages.registerHoverProvider(SELECTOR, hoverProvider),
    vscode.languages.registerDocumentSymbolProvider(SELECTOR, symbolProvider),
    vscode.languages.registerFoldingRangeProvider(SELECTOR, foldingProvider),
    vscode.languages.registerDefinitionProvider(SELECTOR, definitionProvider),
    vscode.languages.registerCodeActionsProvider(SELECTOR, actionProvider, { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }),
    reg('pluffy.addBlock', addBlock),
    reg('pluffy.check', checkActive),
    reg('pluffy.checkAll', checkAll),
    reg('pluffy.newTatemono', newTatemono),
    reg('pluffy.showScaffoldSource', showScaffoldSource),
    vscode.workspace.onDidOpenTextDocument(scheduleRefresh),
    vscode.workspace.onDidChangeTextDocument(e => scheduleRefresh(e.document)),
    vscode.workspace.onDidSaveTextDocument(refreshDiagnostics),
    vscode.workspace.onDidCloseTextDocument(d => { diagnostics.delete(d.uri); updateStatus() }),
    vscode.workspace.onDidChangeConfiguration(e => { if (e.affectsConfiguration('pluffy')) refreshAll() }),
    vscode.window.onDidChangeActiveTextEditor(updateStatus),
    watcher.onDidChange(refreshAll),
    watcher.onDidCreate(refreshAll),
  )

  refreshAll()
  updateStatus()
}

function deactivate() {
  for (const t of timers.values()) clearTimeout(t)
}

module.exports = { activate, deactivate }
