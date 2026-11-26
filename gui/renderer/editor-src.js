// The in-app tatemono editor: Monaco + TextMate highlighting (Shiki) driven by the Pluff Tatemono
// extension. Bundled by scripts/build-renderer.js into renderer/dist/editor.js (do not edit dist/).
//
//   syntax colors        <- the extension's tatemono.tmLanguage.json (via pluffy.tmAssets)
//   completions, hover   <- the extension's snippets.js / scaffold.mjs (via the main process)
//   outline, folding     <- scaffold.mjs scanSource
//   problems             <- scaffold.mjs lintSource (the same rules as `mizumi check`)

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
          themes: [THEME],
          langs: [...langs, { ...assets.grammar, name: 'tatemono', scopeName: assets.grammar.scopeName || 'source.tatemono' }],
          engine: createOnigurumaEngine(wasm),
        })
        shikiToMonaco(highlighter, monaco)
        info.ok = true
      } catch (e) { info.error = String(e && e.message || e) }
    }
    if (!info.ok) {
      // keep the editor usable (and in the same colors) if the grammar could not load
      monaco.editor.defineTheme('pluffy-light', { base: 'vs', inherit: true, rules: [], colors: Object.fromEntries(Object.entries(THEME.colors).map(([k, v]) => [k, v.length === 9 && v.endsWith('00') ? '#00000000' : v])) })
    }
    monaco.editor.setTheme('pluffy-light')
    if (assets && assets.languageConfig) monaco.languages.setLanguageConfiguration('tatemono', languageConfiguration(assets.languageConfig))
    registerProviders()
    return info
  })()
  return booted
}

// ---------------------------------------------------------------- providers (the extension does the thinking)
const KIND = () => monaco.languages.CompletionItemKind

function registerProviders() {
  monaco.languages.registerCompletionItemProvider('tatemono', {
    triggerCharacters: ['@', ':', '+', '[', ','],
    async provideCompletionItems(model, position, _ctx, token) {
      const res = await window.pluffy.tmComplete({ text: model.getValue(), line: position.lineNumber - 1, col: position.column - 1 })
      if (token.isCancellationRequested || !Array.isArray(res)) return { suggestions: [] }
      const word = model.getWordUntilPosition(position)
      const kinds = KIND()
      return {
        suggestions: res.map((it) => ({
          label: it.label,
          kind: kinds[it.kind] ?? kinds.Snippet,
          detail: it.detail,
          insertText: it.insert,
          insertTextRules: it.snippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
          filterText: it.filter || undefined,
          range: it.range
            ? new monaco.Range(it.range.sl + 1, it.range.sc + 1, it.range.el + 1, it.range.ec + 1)
            : new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
        })),
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
    theme: 'pluffy-light',
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
    wordBasedSuggestions: 'off',
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

window.PluffEditor = { boot, createEditor, languageFor }
