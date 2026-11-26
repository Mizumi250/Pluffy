'use strict'
/* global Terminal, FitAddon, MENU, pluffy, icon, WS_API */

const $ = (s, r = document) => r.querySelector(s)
function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag)
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'class') n.className = v
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v)
    else if (v === true) n.setAttribute(k, '')
    else if (v !== false && v != null) n.setAttribute(k, v)
  }
  for (const c of kids.flat()) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(c))
  return n
}
function hydrate(root = document) {
  root.querySelectorAll('i[data-icon]').forEach((i) => i.replaceChildren(icon(i.dataset.icon, Number(i.dataset.size) || 16)))
}
function toast(msg, isErr) {
  const t = el('div', { class: 'toast' + (isErr ? ' err' : '') }, msg)
  $('#toasts').append(t)
  setTimeout(() => t.remove(), isErr ? 7000 : 3600)
}
const fail = (r) => { if (r && r.error) { toast(r.error, true); return true } return false }
const byId = (id) => MENU.items.find((i) => i.id === id)

// ======================================================= state
let envInfo = null
let lists = { tatemonos: [], projects: [] }
let ctx = null                      // the tatemono open in the workspace (highlighted in the sidebar)
let current = 'home'

// ======================================================= navigation
const views = ['home', 'tatemono', 'extensions', 'engine']
const onShow = { extensions: () => renderExtensions(), engine: () => renderEngine() }

function show(name) {
  current = name
  for (const v of views) $('#view-' + v).classList.toggle('hidden', v !== name)
  document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === name))
  if (name === 'home') renderHome()
  if (onShow[name]) onShow[name]()
}
$('#nav').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.view) })
$('#btnSide').onclick = () => { $('#app').classList.toggle('collapsed'); setTimeout(refit, 220) }
$('#btnNew').onclick = () => activate(byId('new'))

// ======================================================= sidebar: tatemonos
function renderRecent() {
  const q = $('#tsearch').value.trim().toLowerCase()
  const all = lists.tatemonos || []
  const shown = all.filter((n) => !q || n.toLowerCase().includes(q))
  $('#tCount').textContent = all.length ? `(${all.length})` : ''
  $('#recent').replaceChildren(...(shown.length
    ? shown.map((n) => el('li', {}, el('button', { 'aria-current': n === ctx ? 'true' : false, onclick: () => pickTatemono(n) }, icon('building-2', 15), el('span', {}, n))))
    : [el('li', { class: 'none' }, q ? 'No tatemono matches.' : 'None yet. Create one with New tatemono.')]))
}
$('#tsearch').addEventListener('input', renderRecent)

// Picking a tatemono opens it in its own editor. Unsaved edits are never dropped silently.
async function pickTatemono(n) {
  if (current === 'tatemono' && ctx === n) return
  const WS = WS_API.WS
  if (WS.name && WS.name !== n && !(await WS_API.guardDirty())) return
  ctx = n
  renderRecent()
  show('tatemono')
  await WS_API.openWorkspace(n)
}

async function refreshLists() { const r = await pluffy.lists(); if (!fail(r)) { lists = r; renderRecent() } }

// account menu (bottom of the sidebar, like Qoder's avatar menu)
const account = $('#account')
$('#btnAccount').onclick = (e) => {
  e.stopPropagation()
  if (!account.classList.toggle('hidden')) {
    const item = (ic, label, fn) => el('button', { onclick: () => { account.classList.add('hidden'); fn() } }, icon(ic, 16), label)
    account.replaceChildren(
      item('settings', 'Engine settings', () => show('engine')),
      item('puzzle', 'Extensions', () => show('extensions')),
      item('refresh-cw', 'Update engine', () => show('engine')),
      el('hr'),
      item('folder-open', 'Open Pluffy folder', () => pluffy.openFolder()),
      item('external-link', 'Pluffy on GitHub', () => window.open('https://github.com/Mizumi250/Pluffy')))
  }
}
document.addEventListener('click', (e) => { if (!account.contains(e.target)) account.classList.add('hidden') })

// ======================================================= home
function activate(it) {
  if (it.repo) return runRepo(it.repo)
  if (it.action === 'chat') return openChat()
  if (it.run) return runCli(it.title, [it.run])
  if (it.form) return openForm(it, ctx ? { t: ctx } : {})
}

function itemButton(it, cls = 'item') {
  return el('button', { class: cls, onclick: () => activate(it) }, icon(it.icon, 18), el('div', {}, el('b', {}, it.title), el('span', {}, it.desc)))
}

function renderHome() {
  const root = $('#view-home')
  const col = el('div', { class: 'col' })
  const ask = el('textarea', { id: 'ask', rows: 2, placeholder: 'Describe an app, or type / for commands', spellcheck: 'true' })
  const go = el('button', { class: 'primary', onclick: submitAsk }, 'Write tatemono')
  function submitAsk() {
    const idea = ask.value.trim()
    if (!idea || idea.startsWith('/')) return openPalette(idea.replace(/^\//, ''))
    runCli('Pluffy AI', [['ai', idea]]); ask.value = ''
  }
  ask.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAsk() }
  })
  ask.addEventListener('input', () => { if (ask.value === '/') { ask.value = ''; openPalette('') } })

  const shortcut = (id) => { const it = byId(id); return el('button', { class: 'chip', onclick: () => activate(it) }, icon(it.icon, 15), it.title) }
  col.append(
    el('h1', {}, 'What are we building?'),
    el('p', { class: 'lede' }, 'Pick a tatemono in the sidebar to edit it, or describe a new one. Pluffy turns one core.tsx into a web app, a mobile app, a desktop app, a game and a backend.'),
    el('div', { class: 'cmdbar' }, ask, el('div', { class: 'cmdrow' }, el('span', { class: 'hint' }, 'Enter runs mizumi ai. Shift+Enter for a new line.'), go)),
    el('div', { class: 'quick' }, shortcut('start'), shortcut('new'), shortcut('setup'), shortcut('classic')))
  if (envInfo) {
    const missing = ['node', 'npm', 'git'].filter((k) => !envInfo[k])
    if (missing.length) col.append(el('div', { class: 'warnline' }, icon('circle-alert', 16), `${missing.join(', ')} not found. Pluffy runs on Node, so install ${missing.includes('node') ? 'Node.js from nodejs.org' : missing.join(' and ')} and restart the app.`))
  }

  const index = el('div', { class: 'index' })
  for (const g of MENU.groups) {
    const items = MENU.items.filter((i) => i.group === g.id)
    if (!items.length) continue
    index.append(el('section', { class: 'group' }, el('header', {}, el('h3', {}, g.title), el('p', {}, g.sub)), el('div', { class: 'items' }, items.map((i) => itemButton(i)))))
  }
  col.append(index)
  root.replaceChildren(col)
}

async function refreshEnv() {
  const r = await pluffy.env()
  if (fail(r)) return
  envInfo = r
  renderStatus()
  if (current === 'home') renderHome()
}

function renderStatus() {
  const e = envInfo || {}
  const eng = e.engine || {}
  const ok = e.node && e.npm && e.git
  $('#engineLabel').textContent = 'Engine ' + (eng.commit || eng.source || '')
  $('#engineDot').className = 'dot ' + (envInfo ? (ok ? 'ok' : 'warn') : '')
  const st = (txt, warn) => el('span', { style: warn ? 'color:var(--warn)' : '' , class: 'grow-none' }, txt)
  $('#status').replaceChildren(
    el('button', { onclick: () => show('engine'), title: 'Engine settings' }, icon('git-branch', 13), eng.commit ? `${eng.commit}  ${eng.source || ''}` : (eng.source || 'engine')),
    st(`Node ${e.node || 'not found'}`, !e.node), st('  '), st(`npm ${e.npm || 'not found'}`, !e.npm),
    el('button', { class: 'sp', onclick: () => show('extensions'), title: 'Extensions' }, icon(e.code ? 'circle-check' : 'circle-alert', 13), e.code ? `VS Code ${e.code}` : 'VS Code not found'))
}

// ======================================================= command palette (Ctrl+K, or "/" in the command bar)
function openPalette(initial = '') {
  const box = $('#palette')
  let sel = 0
  let hits = []
  const input = el('input', { placeholder: 'Search commands', spellcheck: 'false', 'aria-label': 'Search commands' })
  const ul = el('ul', { role: 'listbox' })
  const close = () => { box.classList.add('hidden'); box.replaceChildren() }
  const choose = (it) => { close(); if (it) activate(it) }
  function paint() {
    const q = input.value.trim().toLowerCase()
    hits = MENU.items.filter((i) => !q || `${i.title} ${i.desc} ${i.cli}`.toLowerCase().includes(q))
    sel = Math.min(sel, Math.max(hits.length - 1, 0))
    ul.replaceChildren(...(hits.length ? hits.map((i, n) => el('li', {}, el('button', { role: 'option', 'aria-selected': n === sel ? 'true' : 'false', onclick: () => choose(i) },
      icon(i.icon, 16), i.title, el('span', { class: 'cli' }, i.cli)))) : [el('li', { class: 'none' }, 'No command matches.')]))
    const s = ul.querySelector('[aria-selected=true]'); if (s) s.scrollIntoView({ block: 'nearest' })
  }
  input.value = initial
  input.addEventListener('input', () => { sel = 0; paint() })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, hits.length - 1); paint() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paint() }
    else if (e.key === 'Enter') { e.preventDefault(); choose(hits[sel]) }
    else if (e.key === 'Escape') close()
  })
  box.onmousedown = (e) => { if (e.target === box) close() }
  box.replaceChildren(el('div', { class: 'pal' }, input, ul))
  box.classList.remove('hidden')
  paint(); input.focus()
}
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette('') }
  if (e.key === 'Escape' && !$('#palette').classList.contains('hidden')) { $('#palette').classList.add('hidden'); $('#palette').replaceChildren() }
})

// ======================================================= top bar
async function openChat() { fail(await pluffy.openChat()) }
$('#btnChat').onclick = openChat
$('#btnCode').onclick = async () => fail(await pluffy.openVSCode())
$('#btnCmd').onclick = async () => fail(await pluffy.openCmd())

// ======================================================= forms
async function openForm(it, preset = {}) {
  const r = await pluffy.lists()
  if (!fail(r)) lists = r
  const form = it.form
  const values = {}
  const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-label': it.title }, el('h2', {}, it.title), el('p', {}, it.desc))
  const preview = el('div', { class: 'preview' })
  const err = el('div', { class: 'err' })

  const optList = (f) => {
    let opts = f.options || []
    if (f.type === 'tatemono') opts = lists.tatemonos || []
    if (f.type === 'project') opts = lists.projects || []
    opts = opts.map((o) => (typeof o === 'string' ? { v: o, l: o } : o))
    if (f.optional) opts = [{ v: '', l: f.optionalLabel || '(none)' }, ...opts]
    return opts
  }

  for (const f of form.fields) {
    const initial = preset[f.id] !== undefined ? preset[f.id] : f.value
    const wrap = el('div', { class: 'field' })
    if (f.type !== 'check') wrap.append(el('label', { class: 'l' }, f.label + (f.required ? ' *' : '')))
    let input
    if (f.type === 'text') {
      input = el('input', { type: 'text', placeholder: f.placeholder || '', spellcheck: 'false' }); input.value = initial || ''
      values[f.id] = () => input.value.trim()
    } else if (f.type === 'textarea') {
      input = el('textarea', { placeholder: f.placeholder || '' }); input.value = initial || ''
      values[f.id] = () => input.value
    } else if (['select', 'tatemono', 'project'].includes(f.type)) {
      const opts = optList(f)
      input = el('select', {}, opts.map((o) => el('option', { value: o.v }, o.l)))
      if (initial && opts.some((o) => o.v === initial)) input.value = initial
      values[f.id] = () => input.value
      if (f.type === 'tatemono' && !(lists.tatemonos || []).length) wrap.append(el('div', { class: 'help' }, 'No tatemonos yet. Create one first.'))
    } else if (f.type === 'multi') {
      input = el('div', { class: 'opts' })
      for (const o of f.options) {
        const cb = el('input', { type: 'checkbox', value: o }); cb.checked = (initial || []).includes(o)
        cb.addEventListener('change', refresh)
        input.append(el('label', { class: 'opt' }, cb, o))
      }
      values[f.id] = () => [...input.querySelectorAll('input:checked')].map((c) => c.value)
    } else if (f.type === 'check') {
      input = el('input', { type: 'checkbox' })
      values[f.id] = () => input.checked
      wrap.append(el('label', { class: 'opt' }, input, f.label))
    }
    if (f.type !== 'check') wrap.append(input)
    if (f.hint) wrap.append(el('div', { class: 'help' }, f.hint))
    input.addEventListener('input', refresh); input.addEventListener('change', refresh)
    sheet.append(wrap)
  }

  const collect = () => { const v = {}; for (const f of form.fields) v[f.id] = values[f.id](); return v }
  const lines = (v) => { const x = form.build(v); return Array.isArray(x[0]) ? x : [x] }
  const problem = (v) => {
    for (const f of form.fields) {
      if (f.required && !(Array.isArray(v[f.id]) ? v[f.id].length : v[f.id])) return `${f.label} is required.`
      if (f.pattern && v[f.id] && !f.pattern.test(v[f.id])) return `${f.label} is not valid.`
    }
    return form.validate ? form.validate(v) : ''
  }
  function refresh() {
    try { preview.textContent = lines(collect()).map((a) => ['mizumi', ...a.map((x) => (/[\s"']/.test(x) ? JSON.stringify(x) : x))].join(' ')).join('\n') } catch { preview.textContent = '' }
    err.textContent = ''
  }
  const run = () => {
    const v = collect(); const p = problem(v)
    if (p) { err.textContent = p; return }
    closeModal(); runCli(it.title, lines(v))
  }
  sheet.append(preview, err, el('div', { class: 'foot' }, el('button', { class: 'btn', onclick: closeModal }, 'Cancel'), el('button', { class: 'primary', onclick: run }, 'Run')))
  sheet.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') { e.preventDefault(); run() } })
  refresh()
  $('#modal').replaceChildren(sheet); $('#modal').classList.remove('hidden')
  const first = sheet.querySelector('input[type=text], select, textarea'); if (first) first.focus()
}
function closeModal() { $('#modal').classList.add('hidden'); $('#modal').replaceChildren() }
$('#modal').addEventListener('mousedown', (e) => { if (e.target.id === 'modal') closeModal() })
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal() })

// ======================================================= terminal dock
const dock = $('#dock')
const terms = new Map()          // id -> { term, fit, box, tab, dead }
const pending = new Map()        // output that arrived before its tab existed
let activeTerm = null
let termCount = 0

const XTERM_LIGHT = {
  // a light terminal in the app's palette. mizumi.js paints headings "white", so ANSI white is a dark ink on purpose.
  background: '#f8f3f1', foreground: '#212121', cursor: '#e07a7a', cursorAccent: '#f8f3f1', selectionBackground: '#f99e9e66',
  black: '#212121', red: '#c93c3c', green: '#2d7a58', yellow: '#946000', blue: '#3d62b8', magenta: '#a23f7d', cyan: '#1f7a8c', white: '#3a302d',
  brightBlack: '#6c625f', brightRed: '#de4d4d', brightGreen: '#38916c', brightYellow: '#a86d00', brightBlue: '#5176cc', brightMagenta: '#b85093', brightCyan: '#2a8fa3', brightWhite: '#1a1414',
}
const XTERM_DARK = {
  // the same terminal in the pink dark palette. ANSI white is a light ink here, so mizumi.js headings stay readable.
  background: '#231a1e', foreground: '#f0dfe4', cursor: '#f99e9e', cursorAccent: '#231a1e', selectionBackground: '#f99e9e55',
  black: '#3a2c32', red: '#ff8a8a', green: '#7fd4a8', yellow: '#f2c46b', blue: '#8fb0f2', magenta: '#f0a0cf', cyan: '#7fd0e0', white: '#ead9de',
  brightBlack: '#a8949b', brightRed: '#ffa3a3', brightGreen: '#9be6bf', brightYellow: '#f8d58a', brightBlue: '#a9c2f8', brightMagenta: '#f7b8dc', brightCyan: '#9be0ec', brightWhite: '#fff2f5',
}
const xtermTheme = () => (window.theme.get() === 'dark' ? XTERM_DARK : XTERM_LIGHT)

function syncPlaceholder() {
  const ph = $('#termPh')
  if (terms.size) { if (ph) ph.remove() } else if (!ph) $('#termTabs').append(el('button', { id: 'termPh', class: 'active', onclick: toggleDock }, 'Terminal'))
}

async function newTerminal(title, opts = {}) {
  openDock()
  const box = el('div', { class: 'term' })
  $('#termBody').append(box)
  const term = new Terminal({ fontFamily: 'ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace', fontSize: 13, lineHeight: 1.15, cursorBlink: true, theme: xtermTheme(), scrollback: 5000, allowProposedApi: true })
  const fit = new FitAddon.FitAddon()
  term.loadAddon(fit)
  for (const t of terms.values()) t.box.classList.add('hidden')
  term.open(box)
  try { fit.fit() } catch { /* not visible yet */ }
  const id = await pluffy.termCreate({ cols: term.cols, rows: term.rows, log: !!opts.log })
  if (fail(id)) { box.remove(); term.dispose(); return null }

  const tab = el('button', { role: 'tab', onclick: () => focusTerm(id) }, title || 'Terminal ' + ++termCount,
    el('span', { class: 'x', title: 'Close', onclick: (e) => { e.stopPropagation(); closeTerm(id) } }, icon('x', 12)))
  $('#termTabs').append(tab)
  const t = { term, fit, box, tab, dead: false }
  terms.set(id, t)

  term.onData((d) => { if (!t.dead) pluffy.termWrite(id, d) })
  term.onResize(({ cols, rows }) => pluffy.termResize(id, cols, rows))
  term.attachCustomKeyEventHandler((e) => {
    if (e.type === 'keydown' && e.ctrlKey && e.key.toLowerCase() === 'c' && term.hasSelection()) { navigator.clipboard.writeText(term.getSelection()); return false }
    return true
  })
  if (pending.has(id)) { pending.get(id).forEach((d) => term.write(d)); pending.delete(id) }
  syncPlaceholder()
  focusTerm(id)
  return id
}

function focusTerm(id) {
  activeTerm = id
  for (const [k, t] of terms) {
    t.box.classList.toggle('hidden', k !== id)
    t.tab.classList.toggle('active', k === id)
    t.tab.setAttribute('aria-selected', k === id ? 'true' : 'false')
  }
  const t = terms.get(id)
  if (t) requestAnimationFrame(() => { try { t.fit.fit() } catch { /* ignore */ } t.term.focus() })
}

function closeTerm(id) {
  const t = terms.get(id); if (!t) return
  pluffy.termKill(id)
  t.term.dispose(); t.box.remove(); t.tab.remove(); terms.delete(id)
  if (activeTerm === id) { const next = [...terms.keys()].pop(); if (next) focusTerm(next); else activeTerm = null }
  syncPlaceholder()
}

async function runCli(title, lists_) {
  const id = await newTerminal(title)
  if (id) { await pluffy.termCli(id, lists_); setTimeout(refreshLists, 4000) }
}

// ======================================================= repo commands (install, push, pull, uninstall)
// The work happens in the main process (lib/repo.js); its output shows in a text-only terminal tab.
const REPO_TEXT = {
  install: { title: 'Install repo' },
  push: { title: 'Push repo' },
  pull: { title: 'Pull repo', word: 'YES', warn: 'This throws away ALL local changes that are not pushed.' },
  uninstall: { title: 'Uninstall repo', word: 'DELETE', warn: 'This permanently deletes the folder and skips the Recycle Bin. Anything not pushed to GitHub will be lost.' },
}

function confirmWord(title, where, warn, word) {
  return new Promise((resolve) => {
    const done = (v) => { closeModal(); resolve(v) }
    const input = el('input', { type: 'text', placeholder: word, spellcheck: 'false', autocomplete: 'off' })
    const go = el('button', { class: 'primary', disabled: true, onclick: () => done(true) }, title)
    input.addEventListener('input', () => { go.disabled = input.value.trim().toUpperCase() !== word })
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !go.disabled) done(true)
      else if (e.key === 'Escape') done(false)
    })
    $('#modal').replaceChildren(el('div', { class: 'sheet-modal', role: 'dialog', 'aria-label': title },
      el('h2', {}, title), el('p', {}, warn), el('div', { class: 'preview' }, where),
      el('div', { class: 'field' }, el('label', { class: 'l' }, `Type ${word} to continue`), input),
      el('div', { class: 'foot' }, el('button', { class: 'btn', onclick: () => done(false) }, 'Cancel'), go)))
    $('#modal').classList.remove('hidden')
    input.focus()
  })
}

async function runRepo(op) {
  const t = REPO_TEXT[op]
  const info = await pluffy.repoInfo()
  if (fail(info)) return
  if (t.word) {
    if (!(await WS_API.guardDirty())) return                      // unsaved editor tabs would be lost
    if (!(await confirmWord(t.title, info.dir, t.warn, t.word))) return
  }
  const id = await newTerminal(t.title, { log: true })
  if (!id) return
  const r = await pluffy.repoRun(op, id)
  fail(r)
  if (!r.error && op === 'uninstall') { ctx = null; if (current === 'tatemono') show('home') }
  await Promise.all([refreshEnv(), refreshLists()])
  if (current === 'engine') renderEngine()
  if (!r.error) toast(`${t.title}: done`)
}

function openDock() { dock.classList.remove('collapsed'); localStorage.setItem('dockOpen', '1'); refit() }
function refit() { requestAnimationFrame(() => { const t = terms.get(activeTerm); if (t) try { t.fit.fit() } catch { /* ignore */ } }) }
$('#termNew').onclick = () => newTerminal()
function toggleDock() {
  const collapsed = dock.classList.toggle('collapsed')
  localStorage.setItem('dockOpen', collapsed ? '0' : '1')
  if (!collapsed) { if (terms.size) refit(); else newTerminal('Terminal') }
}
$('#termToggle').onclick = toggleDock
new ResizeObserver(refit).observe($('#termBody'))

{
  const handle = $('#dockResize')
  document.documentElement.style.setProperty('--dock-h', (parseInt(localStorage.getItem('dockH') || '300', 10)) + 'px')
  handle.addEventListener('mousedown', (e) => {
    e.preventDefault()
    const startY = e.clientY, startH = dock.offsetHeight
    const move = (m) => document.documentElement.style.setProperty('--dock-h', Math.min(Math.max(startH + (startY - m.clientY), 120), window.innerHeight - 220) + 'px')
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); localStorage.setItem('dockH', String(dock.offsetHeight)); refit() }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  })
}

// ======================================================= extensions
async function renderExtensions() {
  const root = $('#view-extensions')
  const r = await pluffy.extList()
  if (fail(r)) return
  const rows = el('div', { class: 'rows' })
  if (!r.items.length) rows.append(el('div', { class: 'row' }, el('span', { class: 'muted' }, 'No .vsix files yet. Import one below.')))
  for (const x of r.items) {
    const btn = el('button', { class: 'btn', onclick: async () => {
      btn.disabled = true; btn.textContent = 'Installing'
      const res = await pluffy.extInstall(x.file)
      if (res.ok) toast(`Installed ${x.name}`); else toast(res.error, true)
      renderExtensions()
    } }, x.installed ? 'Reinstall' : 'Install')
    rows.append(el('div', { class: 'row' },
      el('div', { class: 'grow' }, el('div', {}, el('b', { style: 'font-weight:500' }, x.name), el('span', { class: 'muted' }, '  ' + x.version)), el('div', { class: 'k mono', style: 'font-size:12px' }, x.file)),
      el('span', { class: 'tag' }, x.kind), x.installed ? el('span', { class: 'tag ok' }, 'Installed') : null, btn))
  }
  const tm = await pluffy.tmAssets()
  const src = tm && tm.source
  const editorRow = el('div', { class: 'row' },
    el('div', { class: 'grow' }, el('div', { class: 'k' }, 'Tatemono editor (built into this app)'),
      el('div', { class: 'v' }, src ? `${src.name} ${src.version || ''} · ${src.kind === 'vsix' ? 'from the .vsix' : 'from the engine files in vscode-extension/'}` : 'No Pluff Tatemono extension found')),
    el('span', { class: 'tag' + (tm && tm.ready ? ' ok' : '') }, tm && tm.ready ? 'Ready' : 'Not ready'))
  const col = el('div', { class: 'col' },
    el('h2', {}, 'Extensions'),
    el('p', { class: 'lede' }, 'The Pluff Tatemono extension ships with the engine. Import any other .vsix file; no marketplace is needed.'),
    el('div', { class: 'rows' }, editorRow),
    src && src.staleVsix ? el('p', { class: 'note warn' }, `${src.staleVsix} is older than the files in vscode-extension/, so the editor uses the newer engine files. Rebuild the .vsix with "npx @vscode/vsce package" inside vscode-extension/ to bring them back in sync.`) : null,
    tm && tm.problems && tm.problems.length ? el('p', { class: 'note warn' }, tm.problems.join(' ')) : null,
    r.hasCode ? null : el('p', { class: 'note warn' }, 'VS Code was not found, so extensions cannot be installed yet. Install VS Code and check that the "code" command works in a terminal.'),
    el('div', { class: 'toolbar' },
      el('button', { class: 'primary', onclick: async () => {
        const res = await pluffy.extImport(); if (fail(res)) return
        for (const x of res.results) { if (x.ok) toast('Installed ' + x.file); else toast(`${x.file}: ${x.error}`, true) }
        renderExtensions()
      } }, 'Import .vsix'),
      el('button', { class: 'btn', onclick: () => pluffy.extFolder() }, 'Open imported folder')),
    rows,
    el('p', { class: 'note' }, 'Extensions are installed into your VS Code, which is the place for engine work. The tatemono editor in this app reads the Pluff Tatemono extension directly.'))
  root.replaceChildren(col)
}

// ======================================================= engine
async function renderEngine() {
  const root = $('#view-engine')
  const i = await pluffy.engineInfo()
  if (fail(i)) return
  const row = (k, v) => el('div', { class: 'row' }, el('div', { class: 'grow' }, el('div', { class: 'k' }, k), el('div', { class: 'v' }, v || 'unknown')))
  const status = el('p', { class: 'note', id: 'engineStatus' })
  const busy = (b) => root.querySelectorAll('button').forEach((x) => { x.disabled = b })
  const version = [i.commit, i.date && new Date(i.date).toLocaleDateString()].filter(Boolean).join(', ')
  root.replaceChildren(el('div', { class: 'col' },
    el('h2', {}, 'Engine'),
    el('p', { class: 'lede' }, 'The Pluffy repo that the CLI runs from. The app ships a snapshot and can fetch the latest from GitHub.'),
    el('div', { class: 'rows' }, row('Location', i.root), row('Version', version), row('Source', i.source)),
    el('div', { class: 'toolbar' },
      el('button', { class: 'primary', onclick: async () => {
        busy(true); const r = await pluffy.engineUpdate(); busy(false)
        if (!fail(r)) toast('Engine updated' + (r.commit ? ' to ' + r.commit : ''))
        renderEngine(); refreshEnv(); refreshLists()
      } }, 'Update from GitHub'),
      el('button', { class: 'btn', onclick: async () => { busy(true); const r = await pluffy.engineResync(); busy(false); if (!fail(r)) toast('Re-synced'); renderEngine() } }, 'Re-sync bundled copy'),
      el('button', { class: 'btn', onclick: () => pluffy.openFolder() }, 'Open folder')),
    el('div', { class: 'toolbar' }, ['install', 'push', 'pull', 'uninstall'].map((op) => {
      const it = byId('repo-' + op)
      return el('button', { class: 'btn', title: it.desc, onclick: () => runRepo(op) }, icon(it.icon, 15), REPO_TEXT[op].title)
    })),
    status,
    el('p', { class: 'note' }, i.live ? 'This is a git checkout, so the app never overwrites it. Update it with git pull.' : 'Updating keeps your tatemonos, arkzen.json and AI settings. Only engine files are replaced.')))
}

// ======================================================= events
pluffy.onEvent((e) => {
  switch (e.type) {
    case 'boot': $('#bootMsg').textContent = e.msg; break
    case 'term:data': {
      const t = terms.get(e.id)
      if (t) t.term.write(e.data)
      else { if (!pending.has(e.id)) pending.set(e.id, []); pending.get(e.id).push(e.data) }
      break
    }
    case 'term:exit': {
      const t = terms.get(e.id)
      if (t) { t.dead = true; t.tab.classList.add('dead'); t.term.write('\r\n\x1b[90m[shell closed]\x1b[0m\r\n') }
      break
    }
    case 'tm:changed': WS_API.workspaceChanged(e); break
    case 'engine:progress': { const s = $('#engineStatus'); if (s) s.textContent = e.msg; break }
    case 'toast': toast(e.msg); break
  }
})

// ======================================================= window dots and theme
document.querySelectorAll('.light').forEach((b) => { b.onclick = () => pluffy.winControl(b.dataset.act) })
window.addEventListener('blur', () => document.body.classList.add('blur'))
window.addEventListener('focus', () => document.body.classList.remove('blur'))

function paintTheme() {
  const dark = window.theme.get() === 'dark'
  const b = $('#btnTheme')
  b.replaceChildren(icon(dark ? 'sun' : 'moon', 16))
  b.title = dark ? 'Switch to light' : 'Switch to dark'
}
$('#btnTheme').onclick = () => window.theme.toggle()
window.theme.onChange((mode) => {
  paintTheme()
  for (const t of terms.values()) t.term.options.theme = xtermTheme()
  if (window.PluffEditor && PluffEditor.setTheme) PluffEditor.setTheme(mode === 'dark')
  pluffy.setTheme(mode)
})

// ======================================================= start
async function start() {
  if (pluffy.platform === 'darwin') document.body.classList.add('mac')
  hydrate()
  paintTheme()
  renderHome()
  const r = await pluffy.ready()
  $('#boot').classList.add('gone')
  setTimeout(() => $('#boot').remove(), 400)
  if (r && r.error) toast(r.error, true)
  refreshLists(); refreshEnv()
  WS_API.initEditor()                       // warm up Monaco and the grammar in the background
  if (localStorage.getItem('dockOpen') === '1') newTerminal('Terminal')
  else { dock.classList.add('collapsed'); syncPlaceholder() }
}
start()

window.addEventListener('beforeunload', (e) => { if (WS_API.hasDirty()) { e.preventDefault(); e.returnValue = '' } })
