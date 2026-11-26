// The in-app tatemono editor: Monaco + TextMate highlighting (Shiki) driven by the Pluff Tatemono
// extension. Bundled by scripts/build-renderer.js into renderer/dist/editor.js (do not edit dist/).
//
//   syntax colors        <- the extension's tatemono.tmLanguage.json (via pluffy.tmAssets)
//   completions, hover   <- the extension's snippets.js / scaffold.mjs (via the main process)
//   outline, folding     <- scaffold.mjs scanSource
//   problems             <- scaffold.mjs lintSource (the same rules as `mizumi check`)
//   definition, quick fixes <- ported from the extension (lib/tatemono.js: definition, fixes)

import * as monaco from 'monaco-editor/editor/editor.api.js'
import 'pluffy:monaco-contrib'
import { createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import wasm from 'shiki/wasm'
import { shikiToMonaco } from '@shikijs/monaco'
import tsx from '@shikijs/langs/tsx'
import typescript from '@shikijs/langs/typescript'
import javascript from '@shikijs/langs/javascript'
import json from '@shikijs/langs/json'
import css from '@shikijs/langs/css'
import html from '@shikijs/langs/html'
import yaml from '@shikijs/langs/yaml'
import markdown from '@shikijs/langs/markdown'
import php from '@shikijs/langs/php'
import python from '@shikijs/langs/python'
import java from '@shikijs/langs/java'
import csharp from '@shikijs/langs/csharp'
import go from '@shikijs/langs/go'
import rust from '@shikijs/langs/rust'

self.MonacoEnvironment = { getWorker: () => new Worker('./dist/editor.worker.js') }

const INK = '#212121'
const SURFACE = '#fbfbfd'
const SECONDARY = '#f3ebe9'
const PRIMARY = '#f99e9e'
const FONT_MONO = 'ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, monospace'

// A flat, warm light theme in the app's palette. No borders anywhere.
const THEME = {
  name: 'pluffy-light',
  type: 'light',
  colors: {
    'editor.background': SURFACE,
    'editor.foreground': INK,
    'editorLineNumber.foreground': '#cdbfbb',
    'editorLineNumber.activeForeground': '#7d706c',
    'editor.lineHighlightBackground': '#f3ebe955',
    'editor.lineHighlightBorder': '#00000000',
    'editor.selectionBackground': '#f99e9e55',
    'editor.inactiveSelectionBackground': '#f99e9e30',
    'editor.selectionHighlightBackground': '#f99e9e28',
    'editor.selectionHighlightBorder': '#00000000',
    'editor.wordHighlightBackground': '#f3ebe9',
    'editor.wordHighlightStrongBackground': '#f3ebe9',
    'editor.wordHighlightBorder': '#00000000',
    'editor.wordHighlightStrongBorder': '#00000000',
    'editor.findMatchBackground': '#f99e9e88',
    'editor.findMatchHighlightBackground': '#f99e9e44',
    'editor.findMatchBorder': '#00000000',
    'editor.findMatchHighlightBorder': '#00000000',
    'editorCursor.foreground': '#e07575',
    'editorGutter.background': SURFACE,
    'editorIndentGuide.background1': '#f1e8e5',
    'editorIndentGuide.activeBackground1': '#e0d2ce',
    'editorWhitespace.foreground': '#e8dcd8',
    'editorBracketMatch.background': '#f99e9e33',
    'editorBracketMatch.border': '#00000000',
    'editorOverviewRuler.border': '#00000000',
    'editorError.foreground': '#d04545',
    'editorWarning.foreground': '#c98a1b',
    'editorInfo.foreground': '#6a8fd0',
    'editorWidget.background': '#ffffff',
    'editorWidget.foreground': INK,
    'editorWidget.border': '#00000000',
    'editorSuggestWidget.background': '#ffffff',
    'editorSuggestWidget.border': '#00000000',
    'editorSuggestWidget.foreground': INK,
    'editorSuggestWidget.selectedBackground': SECONDARY,
    'editorSuggestWidget.highlightForeground': '#d9626a',
    'editorHoverWidget.background': '#ffffff',
    'editorHoverWidget.border': '#00000000',
    'editorHoverWidget.foreground': INK,
    'list.hoverBackground': '#f3ebe988',
    'list.activeSelectionBackground': SECONDARY,
    'list.activeSelectionForeground': INK,
    'list.focusBackground': SECONDARY,
    'list.focusOutline': '#00000000',
    'focusBorder': '#00000000',
    'contrastBorder': '#00000000',
    'contrastActiveBorder': '#00000000',
    'input.background': SECONDARY,
    'input.border': '#00000000',
    'inputOption.activeBackground': '#f99e9e55',
    'inputOption.activeBorder': '#00000000',
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#d8c9c555',
    'scrollbarSlider.hoverBackground': '#d8c9c599',
    'scrollbarSlider.activeBackground': '#cdbab599',
    'minimap.background': SURFACE,
    'widget.shadow': '#42303018',
  },
  tokenColors: [
    { scope: ['comment', 'comment.block.tatemono', 'punctuation.definition.comment'], settings: { foreground: '#a39793', fontStyle: 'italic' } },
    { scope: ['punctuation.definition.tag.tatemono'], settings: { foreground: '#c7b8b3' } },
    { scope: ['entity.name.tag.tatemono.web', 'storage.type.tatemono.web'], settings: { foreground: '#c2415b', fontStyle: 'bold' } },
    { scope: ['entity.name.tag.tatemono.native', 'storage.type.tatemono.native'], settings: { foreground: '#2d7a58', fontStyle: 'bold' } },
    { scope: ['entity.name.tag.tatemono.shared'], settings: { foreground: '#b0642f', fontStyle: 'bold' } },
    { scope: ['entity.name.tag.tatemono.backend'], settings: { foreground: '#6a4fb0', fontStyle: 'bold' } },
    { scope: ['entity.name.tag.tatemono.desktop', 'storage.type.tatemono.desktop'], settings: { foreground: '#1f7a8c', fontStyle: 'bold' } },
    { scope: ['entity.name.tag.tatemono.game', 'storage.type.tatemono.game'], settings: { foreground: '#a65f00', fontStyle: 'bold' } },
    { scope: ['entity.name.section.tatemono', 'storage.type.variant.tatemono'], settings: { foreground: '#8a6f68' } },
    { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'], settings: { foreground: '#b5476a' } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: '#3a7d4f' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character', 'support.constant'], settings: { foreground: '#b36200' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function'], settings: { foreground: '#5b4bb0' } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.class', 'support.type', 'entity.other.inherited-class'], settings: { foreground: '#1f6fa8' } },
    { scope: ['variable.other.property', 'support.type.property-name', 'variable.object.property', 'meta.object-literal.key'], settings: { foreground: '#3d5a86' } },
    { scope: ['variable', 'variable.other', 'meta.definition.variable'], settings: { foreground: INK } },
    { scope: ['variable.parameter', 'variable.language'], settings: { foreground: '#8a4a3a' } },
    { scope: ['entity.name.tag', 'meta.tag', 'punctuation.definition.tag'], settings: { foreground: '#b5476a' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#8a5a00' } },
    { scope: ['entity.name.tag.yaml', 'support.type.property-name.json'], settings: { foreground: '#5b4bb0' } },
    { scope: ['keyword.operator', 'punctuation', 'meta.brace'], settings: { foreground: '#7d706c' } },
    { scope: ['markup.heading', 'entity.name.section'], settings: { foreground: '#b5476a', fontStyle: 'bold' } },
    { scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
    { scope: ['invalid'], settings: { foreground: '#d04545' } },
  ],
}

// The same theme in the pink dark palette (plum surface, rose ink, same coral accent).
const DARK_INK = '#f3e4e8'
const DARK_SURFACE = '#2a2025'
const DARK_RAISED = '#34272d'
const DARK_SELECTED = '#44292f'
const DARK_TOKEN = {
  '#a39793': '#85727a', '#c7b8b3': '#6f5d65', '#c2415b': '#ff8aa3', '#2d7a58': '#7fd4a8', '#b0642f': '#f0a56f',
  '#6a4fb0': '#b9a6f2', '#1f7a8c': '#7fd0e0', '#a65f00': '#f2b765', '#8a6f68': '#c4a39b', '#b5476a': '#f59ab6',
  '#3a7d4f': '#8fd8a4', '#b36200': '#f2b765', '#5b4bb0': '#b7a8f5', '#1f6fa8': '#8cc4f2', '#3d5a86': '#a9c0ec',
  '#8a4a3a': '#e6a38f', '#8a5a00': '#f2c46b', '#7d706c': '#a8949b', '#d04545': '#ff8a8a',
}
const DARK = {
  name: 'pluffy-dark',
  type: 'dark',
  colors: {
    ...THEME.colors,
    'editor.background': DARK_SURFACE,
    'editor.foreground': DARK_INK,
    'editorLineNumber.foreground': '#6f5d65',
    'editorLineNumber.activeForeground': '#bfaab1',
    'editor.lineHighlightBackground': '#382b3188',
    'editor.selectionBackground': '#f99e9e44',
    'editor.inactiveSelectionBackground': '#f99e9e26',
    'editor.selectionHighlightBackground': '#f99e9e22',
    'editor.wordHighlightBackground': '#382b31',
    'editor.wordHighlightStrongBackground': '#382b31',
    'editor.findMatchBackground': '#f99e9e77',
    'editor.findMatchHighlightBackground': '#f99e9e3a',
    'editorCursor.foreground': '#f99e9e',
    'editorGutter.background': DARK_SURFACE,
    'editorIndentGuide.background1': '#372a30',
    'editorIndentGuide.activeBackground1': '#52414a',
    'editorWhitespace.foreground': '#3d2f36',
    'editorBracketMatch.background': '#f99e9e33',
    'editorError.foreground': '#ff8a8a',
    'editorWarning.foreground': '#f2b765',
    'editorInfo.foreground': '#8fb0f2',
    'editorWidget.background': DARK_RAISED,
    'editorWidget.foreground': DARK_INK,
    'editorSuggestWidget.background': DARK_RAISED,
    'editorSuggestWidget.foreground': DARK_INK,
    'editorSuggestWidget.selectedBackground': DARK_SELECTED,
    'editorSuggestWidget.highlightForeground': '#f99e9e',
    'editorHoverWidget.background': DARK_RAISED,
    'editorHoverWidget.foreground': DARK_INK,
    'list.hoverBackground': '#44292f88',
    'list.activeSelectionBackground': DARK_SELECTED,
    'list.activeSelectionForeground': DARK_INK,
    'list.focusBackground': DARK_SELECTED,
    'input.background': '#382b31',
    'inputOption.activeBackground': '#f99e9e44',
    'scrollbarSlider.background': '#85727a44',
    'scrollbarSlider.hoverBackground': '#85727a88',
    'scrollbarSlider.activeBackground': '#85727aaa',
    'minimap.background': DARK_SURFACE,
    'widget.shadow': '#00000055',
  },
  tokenColors: THEME.tokenColors.map((r) => {
    const f = r.settings.foreground
    return f ? { ...r, settings: { ...r.settings, foreground: f === INK ? DARK_INK : DARK_TOKEN[f] || f } } : r
  }),
}

// which one is on screen (theme.js sets <html data-theme>); PluffEditor.setTheme follows the toggle
let wantDark = document.documentElement.dataset.theme === 'dark'
let themesReady = false
const themeName = () => (wantDark ? 'pluffy-dark' : 'pluffy-light')
const plainColors = (th) => Object.fromEntries(Object.entries(th.colors).map(([k, v]) => [k, v.length === 9 && v.endsWith('00') ? '#00000000' : v]))

const BUILTIN = { tsx, typescript, javascript, json, css, html, yaml, markdown, php, python, java, csharp, go, rust }
const LANG_BY_EXT = { '.tsx': 'tsx', '.ts': 'typescript', '.js': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript', '.json': 'json', '.css': 'css', '.html': 'html', '.yaml': 'yaml', '.yml': 'yaml', '.md': 'markdown', '.php': 'php', '.py': 'python', '.java': 'java', '.cs': 'csharp', '.go': 'go', '.rs': 'rust', '.svg': 'html', '.xml': 'html' }

function languageFor(rel) {
  if (rel === 'core.tsx') return 'tatemono'
  const m = /\.[^./]+$/.exec(rel)
  return (m && LANG_BY_EXT[m[0].toLowerCase()]) || 'plaintext'
}

const toRegExp = (v) => {
  if (v instanceof RegExp) return v
  if (typeof v === 'string') { try { return new RegExp(v) } catch { return undefined } }
  if (v && typeof v.pattern === 'string') { try { return new RegExp(v.pattern, v.flags || '') } catch { return undefined } }
  return undefined
}

function languageConfiguration(cfg) {
  const out = {}
  if (!cfg) return out
  if (cfg.comments) out.comments = cfg.comments
  if (cfg.brackets) out.brackets = cfg.brackets
  if (cfg.autoClosingPairs) out.autoClosingPairs = cfg.autoClosingPairs
  if (cfg.surroundingPairs) out.surroundingPairs = cfg.surroundingPairs
  const wp = toRegExp(cfg.wordPattern); if (wp) out.wordPattern = wp
  return out
}

let booted = null

async function boot(assets) {
  if (booted) return booted
  booted = (async () => {
    for (const id of ['tatemono', ...Object.keys(BUILTIN)]) monaco.languages.register({ id })
    const langs = Object.values(BUILTIN)
    const info = { ok: false, error: null }
    if (assets && assets.grammar) {
      try {
        const highlighter = await createHighlighterCore({
          themes: [THEME, DARK],
          langs: [...langs, { ...assets.grammar, name: 'tatemono', scopeName: assets.grammar.scopeName || 'source.tatemono' }],
          engine: createOnigurumaEngine(wasm),
        })
        shikiToMonaco(highlighter, monaco)
        info.ok = true
      } catch (e) { info.error = String(e && e.message || e) }
    }
    if (!info.ok) {
      // keep the editor usable (and in the same colors) if the grammar could not load
      monaco.editor.defineTheme('pluffy-light', { base: 'vs', inherit: true, rules: [], colors: plainColors(THEME) })
      monaco.editor.defineTheme('pluffy-dark', { base: 'vs-dark', inherit: true, rules: [], colors: plainColors(DARK) })
    }
    themesReady = true
    monaco.editor.setTheme(themeName())
    if (assets && assets.languageConfig) monaco.languages.setLanguageConfiguration('tatemono', languageConfiguration(assets.languageConfig))
    registerProviders()
    return info
  })()
  return booted
}

// ---------------------------------------------------------------- providers (the extension does the thinking)
const KIND = () => monaco.languages.CompletionItemKind

// "/*", "/* @", "/* @ark", "@arkzen", "ark" ... -> offer the opener "/* @arkzen:" (the extension's own list only starts
// once "/* @arkzen:" is typed). Returns the replaced span, or null when there is nothing to hint.
function openerHint(before) {
  const m = /(\/\*\s*)?(@?)([A-Za-z]*)$/.exec(before)
  if (!m) return null
  const [whole, slash, at, word] = m
  if (/@arkzen:/.test(before.slice(before.length - whole.length - 8))) return null
  if (!'arkzen'.startsWith(word.toLowerCase())) return null
  if (!slash && !at && word.length < 3) return null          // a bare "a" or "ar" in a YAML value is just text
  if (word.toLowerCase() === 'arkzen' && /:$/.test(before)) return null
  return { start: before.length - whole.length, typed: whole }
}

function registerProviders() {
  monaco.languages.registerCompletionItemProvider('tatemono', {
    triggerCharacters: ['@', ':', '+', '[', ','],
    async provideCompletionItems(model, position, _ctx, token) {
      const res = await window.pluffy.tmComplete({ text: model.getValue(), line: position.lineNumber - 1, col: position.column - 1 })
      if (token.isCancellationRequested) return { suggestions: [] }
      const word = model.getWordUntilPosition(position)
      const kinds = KIND()
      const before = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
      const hint = openerHint(before)
      const opener = hint ? [{
        label: '/* @arkzen:',
        kind: kinds.Snippet,
        detail: 'Start a tatemono block (then pick the block type)',
        insertText: '/* @arkzen:',
        filterText: hint.typed,                       // always matches what was typed so far
        sortText: '0',
        range: new monaco.Range(position.lineNumber, hint.start + 1, position.lineNumber, position.column),
        command: { id: 'editor.action.triggerSuggest', title: '' },   // open the block list right after it
      }] : []
      if (!Array.isArray(res)) return { suggestions: opener }
      return {
        suggestions: [...opener, ...res.map((it) => ({
          label: it.label,
          kind: kinds[it.kind] ?? kinds.Snippet,
          detail: it.detail,
          insertText: it.insert,
          insertTextRules: it.snippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
          filterText: it.filter || undefined,
          range: it.range
            ? new monaco.Range(it.range.sl + 1, it.range.sc + 1, it.range.el + 1, it.range.ec + 1)
            : new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
        }))],
      }
    },
  })

  monaco.languages.registerHoverProvider('tatemono', {
    async provideHover(model, position) {
      const line = model.getLineContent(position.lineNumber)
      const re = /@arkzen:[A-Za-z0-9:_+.{}-]+/g
      let m
      while ((m = re.exec(line))) {
        const start = m.index + 1, end = start + m[0].length
        if (position.column >= start && position.column <= end) {
          const md = await window.pluffy.tmHover({ tag: m[0].slice('@arkzen:'.length) })
          if (!md || md.error) return null
          return { range: new monaco.Range(position.lineNumber, start, position.lineNumber, end), contents: [{ value: md }] }
        }
      }
      return null
    },
  })

  // go to definition (F12 / Ctrl+click): layouts, parent layouts, handlers, listeners, endpoints
  monaco.languages.registerDefinitionProvider('tatemono', {
    async provideDefinition(model, position) {
      const res = await window.pluffy.tmDefinition({ text: model.getValue(), line: position.lineNumber - 1, col: position.column - 1 })
      if (!Array.isArray(res)) return null
      return res.map((r) => ({ uri: model.uri, range: new monaco.Range(r.line + 1, r.col + 1, r.line + 1, model.getLineMaxColumn(r.line + 1)) }))
    },
  })

  // quick fixes (lightbulb / Ctrl+.): add the closing marker, set auth: true, rename to the suggested name
  monaco.languages.registerCodeActionProvider('tatemono', {
    async provideCodeActions(model, _range, context) {
      const marks = (context.markers || []).filter((m) => m.source === 'pluffy')
      if (!marks.length) return { actions: [], dispose() {} }
      const res = await window.pluffy.tmFixes({ text: model.getValue(), issues: marks.map((m) => ({ msg: m.message, line: m.startLineNumber })) })
      if (!Array.isArray(res)) return { actions: [], dispose() {} }
      return {
        dispose() {},
        actions: res.map((f) => ({
          title: f.title,
          kind: 'quickfix',
          isPreferred: true,
          diagnostics: [marks[f.issue]],
          edit: { edits: f.edits.map((e) => ({ resource: model.uri, versionId: undefined, textEdit: { range: new monaco.Range(e.sl + 1, e.sc + 1, e.el + 1, e.ec + 1), text: e.text } })) },
        })),
      }
    },
  }, { providedCodeActionKinds: ['quickfix'] })

  monaco.languages.registerFoldingRangeProvider('tatemono', {
    async provideFoldingRanges(model) {
      const blocks = await window.pluffy.tmOutline(model.getValue())
      if (!Array.isArray(blocks)) return []
      return blocks.filter((b) => b.end > b.line).map((b) => ({ start: b.line, end: b.end, kind: monaco.languages.FoldingRangeKind.Region }))
    },
  })
}

// ---------------------------------------------------------------- the editor
function createEditor(el, handlers = {}) {
  const editor = monaco.editor.create(el, {
    model: null,
    theme: themeName(),
    fontFamily: FONT_MONO,
    fontSize: 13,
    lineHeight: 21,
    fontLigatures: false,
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    renderLineHighlight: 'line',
    roundedSelection: true,
    overviewRulerBorder: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    padding: { top: 14, bottom: 14 },
    smoothScrolling: true,
    cursorSmoothCaretAnimation: 'on',
    cursorBlinking: 'smooth',
    folding: true,
    foldingStrategy: 'auto',
    glyphMargin: false,
    lineNumbersMinChars: 3,
    wordWrap: 'off',
    wordBasedSuggestions: 'currentDocument',
    quickSuggestions: { other: true, comments: true, strings: true },
    suggestOnTriggerCharacters: true,
    tabSize: 2,
    insertSpaces: true,
    bracketPairColorization: { enabled: false },
    guides: { indentation: true, highlightActiveIndentation: false, bracketPairs: false },
    scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false },
    stickyScroll: { enabled: false },
    renderWhitespace: 'none',
    contextmenu: true,
    fixedOverflowWidgets: true,
  })

  const models = new Map()          // key -> { model, view, savedVersion }
  let current = null

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => handlers.onSave && handlers.onSave(current))
  editor.onDidChangeCursorPosition((e) => handlers.onCursor && handlers.onCursor(e.position.lineNumber, e.position.column))
  editor.onDidChangeModelContent(() => { if (current) handlers.onChange && handlers.onChange(current) })

  const entry = (key) => models.get(key)

  return {
    has: (key) => models.has(key),
    open(key, text, rel) {
      let e = entry(key)
      if (!e) {
        const model = monaco.editor.createModel(text, languageFor(rel || key))
        e = { model, view: null, savedVersion: model.getAlternativeVersionId() }
        models.set(key, e)
      }
      return e.model
    },
    show(key) {
      const e = entry(key); if (!e) return
      if (current && entry(current)) entry(current).view = editor.saveViewState()
      current = key
      editor.setModel(e.model)
      if (e.view) editor.restoreViewState(e.view)
      editor.focus()
    },
    clear() { if (current && entry(current)) entry(current).view = editor.saveViewState(); current = null; editor.setModel(null) },
    close(key) {
      const e = entry(key); if (!e) return
      if (current === key) { current = null; editor.setModel(null) }
      e.model.dispose(); models.delete(key)
    },
    value: (key) => (entry(key) ? entry(key).model.getValue() : ''),
    // replace the whole text but keep it undoable and keep the scroll position
    setValue(key, text) {
      const e = entry(key); if (!e) return
      e.model.pushEditOperations([], [{ range: e.model.getFullModelRange(), text }], () => null)
      e.savedVersion = e.model.getAlternativeVersionId()
    },
    markSaved(key) { const e = entry(key); if (e) e.savedVersion = e.model.getAlternativeVersionId() },
    dirty: (key) => { const e = entry(key); return !!e && e.model.getAlternativeVersionId() !== e.savedVersion },
    markers(key, list) {
      const e = entry(key); if (!e) return
      const max = e.model.getLineCount()
      monaco.editor.setModelMarkers(e.model, 'pluffy', list.map((m) => {
        const line = Math.min(Math.max(m.line || 1, 1), max)
        const first = e.model.getLineFirstNonWhitespaceColumn(line) || 1
        return { severity: m.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning, message: m.msg, source: 'pluffy', startLineNumber: line, startColumn: first, endLineNumber: line, endColumn: e.model.getLineMaxColumn(line) }
      }))
    },
    reveal(line) { editor.revealLineNearTop(line); editor.setPosition({ lineNumber: line, column: 1 }); editor.focus() },
    // append text after the last non-blank character (the "add block" edit)
    append(key, trimmedLength, insertion) {
      const e = entry(key); if (!e) return
      const start = e.model.getPositionAt(trimmedLength)
      const end = e.model.getFullModelRange().getEndPosition()
      editor.executeEdits('pluffy-add-block', [{ range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column), text: insertion, forceMoveMarkers: true }])
      const target = e.model.getPositionAt(trimmedLength + (insertion.length - insertion.replace(/^\s+/, '').length)).lineNumber
      editor.revealLineNearTop(target); editor.setPosition({ lineNumber: target, column: 1 }); editor.focus()
    },
    insertSnippet(text) { const c = editor.getContribution('snippetController2'); if (c) c.insert(text); editor.focus() },
    triggerSuggest() { editor.trigger('pluffy', 'editor.action.triggerSuggest', {}) },
    toEnd() { const m = editor.getModel(); if (m) { editor.setPosition(m.getFullModelRange().getEndPosition()); editor.revealLine(m.getLineCount()) } editor.focus() },
    find() { editor.getAction('actions.find').run() },
    format() { editor.getAction('editor.action.formatDocument') && editor.getAction('editor.action.formatDocument').run() },
    foldAll() { editor.getAction('editor.foldAll').run() },
    unfoldAll() { editor.getAction('editor.unfoldAll').run() },
    undo() { editor.trigger('pluffy', 'undo', {}) },
    redo() { editor.trigger('pluffy', 'redo', {}) },
    focus: () => editor.focus(),
    layout: () => editor.layout(),
    line: () => (editor.getPosition() ? editor.getPosition().lineNumber : 1),
    dispose() { for (const e of models.values()) e.model.dispose(); models.clear(); editor.dispose() },
  }
}

function setTheme(dark) {
  wantDark = !!dark
  if (themesReady) monaco.editor.setTheme(themeName())
}

window.PluffEditor = { boot, createEditor, languageFor, setTheme }
