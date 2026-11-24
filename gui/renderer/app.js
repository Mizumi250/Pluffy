'use strict'
/* global Terminal, FitAddon, MENU, pluffy */

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

function toast(msg, isErr) {
  const t = el('div', { class: 'toast' + (isErr ? ' err' : '') }, msg)
  $('#toasts').append(t)
  setTimeout(() => t.remove(), isErr ? 7000 : 3800)
}
const fail = (r) => { if (r && r.error) { toast(r.error, true); return true } return false }

// ======================================================= navigation
const views = ['home', 'editor', 'extensions', 'engine']
let current = 'home'
const onShow = { editor: () => openEditor(), extensions: () => renderExtensions(), engine: () => renderEngine() }

function show(name) {
  current = name
  for (const v of views) $('#view-' + v).classList.toggle('hidden', v !== name)
  document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === name))
  if (onShow[name]) onShow[name]()
}
$('#nav').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.view) })

// ======================================================= home
let envInfo = null

function chip(label, value, warn) {
  return el('span', { class: 'chip' + (warn ? ' warn' : '') }, label, ' ', el('b', {}, value || 'not found'))
}

function renderHome(filter = '') {
  const root = $('#view-home')
  root.replaceChildren()
  const e = envInfo
  const chips = el('div', { class: 'chips' })
  if (e) {
    chips.append(chip('Node', e.node, !e.node), chip('npm', e.npm, !e.npm), chip('git', e.git, !e.git),
      chip('VS Code', e.code, !e.code), chip('Engine', e.engine && (e.engine.commit || e.engine.source)))
  } else chips.append(chip('Checking tools', '...'))
  root.append(el('div', { class: 'hero' },
    el('h1', {}, 'Welcome back to Pluffy'),
    el('p', {}, 'One file in. A whole application out. Everything the CLI does, one click away.'), chips))

  const q = filter.trim().toLowerCase()
  let shown = 0
  for (const g of MENU.groups) {
    const items = MENU.items.filter((i) => i.group === g.id && (!q || (i.title + ' ' + i.desc + ' ' + i.cli).toLowerCase().includes(q)))
    if (!items.length) continue
    shown += items.length
    const grid = el('div', { class: 'grid' })
    for (const it of items) {
      grid.append(el('button', { class: 'card tint-' + g.tint, onclick: () => activate(it) },
        el('div', { class: 'tile' }, it.icon), el('h3', {}, it.title), el('p', {}, it.desc), el('div', { class: 'cli' }, it.cli)))
    }
    root.append(el('div', { class: 'group' }, el('h2', {}, g.title), el('div', { class: 'sub' }, g.sub), grid))
  }
  if (!shown) root.append(el('div', { class: 'empty' }, 'No command matches "' + filter + '".'))
}

async function refreshEnv() {
  const r = await pluffy.env()
  if (!fail(r)) { envInfo = r; if (current === 'home') renderHome($('#search').value) }
}

const search = $('#search')
search.addEventListener('input', () => { if (current !== 'home') show('home'); renderHome(search.value) })
search.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { const first = $('#view-home .card'); if (first) first.click() }
  if (e.key === 'Escape') { search.value = ''; renderHome(); search.blur() }
})
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.focus(); search.select() }
})

// ======================================================= actions
function activate(it) {
  if (it.action === 'chat') return openChat()
  if (it.run) return runCli(it.title, [it.run])
  if (it.form) return openForm(it)
}

async function openChat() { fail(await pluffy.openChat()) }
$('#btnChat').onclick = openChat
$('#btnCode').onclick = async () => fail(await pluffy.openVSCode())
$('#btnCmd').onclick = async () => fail(await pluffy.openCmd())

// ======================================================= forms
let listsCache = null

async function openForm(it) {
  listsCache = await pluffy.lists()
  const form = it.form
  const values = {}
  const inputs = {}
  const sheet = el('div', { class: 'sheet' }, el('h2', {}, it.title), el('p', {}, it.desc))
  const preview = el('div', { class: 'preview' })
  const err = el('div', { class: 'err' })

  const optList = (f) => {
    let opts = f.options || []
    if (f.type === 'tatemono') opts = listsCache.tatemonos || []
    if (f.type === 'project') opts = listsCache.projects || []
    opts = opts.map((o) => (typeof o === 'string' ? { v: o, l: o } : o))
    if (f.optional) opts = [{ v: '', l: f.optionalLabel || '(none)' }, ...opts]
    return opts
  }

  for (const f of form.fields) {
    const wrap = el('div', { class: 'field' })
    if (f.type !== 'check') wrap.append(el('label', { class: 'l' }, f.label + (f.required ? ' *' : '')))
    let input
    if (f.type === 'text') {
      input = el('input', { type: 'text', placeholder: f.placeholder || '', spellcheck: 'false' }); input.value = f.value || ''
      values[f.id] = () => input.value.trim()
    } else if (f.type === 'textarea') {
      input = el('textarea', { placeholder: f.placeholder || '' }); input.value = f.value || ''
      values[f.id] = () => input.value
    } else if (['select', 'tatemono', 'project'].includes(f.type)) {
      const opts = optList(f)
      input = el('select', {}, opts.map((o) => el('option', { value: o.v }, o.l)))
      if (f.value && opts.some((o) => o.v === f.value)) input.value = f.value
      values[f.id] = () => input.value
      if (!opts.length || (opts.length === 1 && f.optional && f.type !== 'select')) wrap.append(el('div', { class: 'sub' }, f.type === 'tatemono' ? 'No tatemonos found yet. Create one first.' : 'Nothing found.'))
    } else if (f.type === 'multi') {
      input = el('div', { class: 'opts' })
      for (const o of f.options) {
        const cb = el('input', { type: 'checkbox', value: o }); cb.checked = (f.value || []).includes(o)
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
    if (f.hint) wrap.append(el('div', { class: 'sub', style: 'font-size:12px;color:var(--muted);margin-top:4px' }, f.hint))
    input.addEventListener('input', refresh); input.addEventListener('change', refresh)
    inputs[f.id] = input
    sheet.append(wrap)
  }

  const collect = () => { const v = {}; for (const f of form.fields) v[f.id] = values[f.id](); return v }
  // forms use "t" for the tatemono id; map it through
  const lines = (v) => { const r = form.build(v); return Array.isArray(r[0]) ? r : [r] }
  const problem = (v) => {
    for (const f of form.fields) {
      if (f.required && !(Array.isArray(v[f.id]) ? v[f.id].length : v[f.id])) return `${f.label} is required.`
      if (f.pattern && v[f.id] && !f.pattern.test(v[f.id])) return `${f.label} is not valid.`
    }
    return form.validate ? form.validate(v) : ''
  }
  function refresh() {
    const v = collect()
    try { preview.textContent = lines(v).map((a) => ['mizumi', ...a.map((x) => (/[\s"']/.test(x) ? JSON.stringify(x) : x))].join(' ')).join('\n') } catch { preview.textContent = '' }
    err.textContent = ''
  }

  const run = el('button', { class: 'btn primary', onclick: () => {
    const v = collect(); const p = problem(v)
    if (p) { err.textContent = p; return }
    closeModal(); runCli(it.title, lines(v))
  } }, 'Run')
  sheet.append(preview, err, el('div', { class: 'foot' }, el('button', { class: 'btn', onclick: closeModal }, 'Cancel'), run))
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
const pending = new Map()        // output that arrived before the tab existed
let activeTerm = null
let termCount = 0

const XTERM_THEME = {
  // a light terminal. mizumi.js paints headings "white", so ANSI white is a dark ink here on purpose.
  background: '#fffafb', foreground: '#3b2b31', cursor: '#f0648c', cursorAccent: '#fffafb', selectionBackground: '#ffd3de',
  black: '#3b2b31', red: '#d6336c', green: '#2f9e6b', yellow: '#b97309', blue: '#3b6fe0', magenta: '#b83a94', cyan: '#0e8fa3', white: '#4a3840',
  brightBlack: '#8a747b', brightRed: '#e8487f', brightGreen: '#34b77a', brightYellow: '#d98a14', brightBlue: '#5b8cf5', brightMagenta: '#d256ad', brightCyan: '#18a9bf', brightWhite: '#2b1d22',
}

async function newTerminal(title) {
  openDock()
  const box = el('div', { class: 'term hidden' })
  $('#termBody').append(box)
  const term = new Terminal({ fontFamily: 'ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace', fontSize: 13, lineHeight: 1.15, cursorBlink: true, theme: XTERM_THEME, scrollback: 5000, allowProposedApi: true })
  const fit = new FitAddon.FitAddon()
  term.loadAddon(fit)
  box.classList.remove('hidden')
  term.open(box)
  try { fit.fit() } catch { /* hidden */ }
  const id = await pluffy.termCreate({ cols: term.cols, rows: term.rows })
  if (fail(id)) { box.remove(); term.dispose(); return null }

  const tab = el('button', { onclick: () => focusTerm(id) }, title || 'Terminal ' + ++termCount,
    el('span', { class: 'x', title: 'Close', onclick: (e) => { e.stopPropagation(); closeTerm(id) } }, '×'))
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
  focusTerm(id)
  return id
}

function focusTerm(id) {
  activeTerm = id
  for (const [k, t] of terms) {
    t.box.classList.toggle('hidden', k !== id)
    t.tab.classList.toggle('active', k === id)
  }
  const t = terms.get(id)
  if (t) requestAnimationFrame(() => { try { t.fit.fit() } catch { /* ignore */ } t.term.focus() })
}

function closeTerm(id) {
  const t = terms.get(id); if (!t) return
  pluffy.termKill(id)
  t.term.dispose(); t.box.remove(); t.tab.remove(); terms.delete(id)
  if (activeTerm === id) { const next = [...terms.keys()].pop(); if (next) focusTerm(next); else activeTerm = null }
}

async function runCli(title, lists) {
  const id = await newTerminal(title)
  if (id) await pluffy.termCli(id, lists)
}

function openDock() { dock.classList.remove('collapsed'); $('#termToggle').textContent = '▾'; refit() }
function refit() { requestAnimationFrame(() => { const t = terms.get(activeTerm); if (t) try { t.fit.fit() } catch { /* ignore */ } }) }

$('#termNew').onclick = () => newTerminal()
$('#termToggle').onclick = () => {
  const c = dock.classList.toggle('collapsed')
  $('#termToggle').textContent = c ? '▴' : '▾'
  if (!c) refit()
}
new ResizeObserver(refit).observe($('#termBody'))

// drag to resize the dock
{
  const handle = $('#dockResize')
  const saved = parseInt(localStorage.getItem('dockH') || '300', 10)
  document.documentElement.style.setProperty('--dock-h', saved + 'px')
  handle.addEventListener('mousedown', (e) => {
    e.preventDefault()
    const startY = e.clientY, startH = dock.offsetHeight
    const move = (m) => {
      const h = Math.min(Math.max(startH + (startY - m.clientY), 120), window.innerHeight - 200)
      document.documentElement.style.setProperty('--dock-h', h + 'px')
    }
    const up = () => {
      window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up)
      localStorage.setItem('dockH', String(dock.offsetHeight)); refit()
    }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  })
}

// ======================================================= editor (VS Code in the app)
let editorState = 'idle'
const editorBox = $('#editorState')
const editorFrame = $('#editorFrame')

function setEditor(state, text) {
  editorState = state
  editorFrame.classList.toggle('hidden', state !== 'ready')
  editorBox.classList.toggle('hidden', state === 'ready')
  if (state === 'loading') {
    editorBox.replaceChildren(el('div', { class: 'spinner' }), el('h2', {}, 'Starting VS Code'),
      el('p', {}, 'The first start downloads the VS Code server, so give it a minute.'), el('pre', { id: 'editorLog' }, text || ''))
  } else if (state === 'error') {
    editorBox.replaceChildren(el('h2', {}, 'The editor could not start'), el('pre', {}, text),
      el('div', { class: 'toolbar' }, el('button', { class: 'btn primary', onclick: () => { setEditor('idle'); openEditor() } }, 'Try again'),
        el('button', { class: 'btn', onclick: async () => fail(await pluffy.openVSCode()) }, 'Open in VS Code instead')))
  }
}

async function openEditor() {
  if (editorState === 'ready' || editorState === 'loading') return
  setEditor('loading', '')
  const r = await pluffy.editorStart()
  if (r.error) return setEditor('error', r.error)
  editorFrame.src = r.url
  setEditor('ready')
}

// ======================================================= extensions
async function renderExtensions() {
  const root = $('#view-extensions')
  root.replaceChildren(el('h2', { style: 'margin:0' }, 'Extensions'), el('div', { class: 'empty' }, 'Loading ...'))
  const r = await pluffy.extList()
  if (fail(r)) return
  const list = el('div', { class: 'panel' })
  if (!r.items.length) list.append(el('div', { class: 'row' }, 'No .vsix files yet. Import one.'))
  for (const x of r.items) {
    const btn = el('button', { class: 'btn', onclick: async () => {
      btn.disabled = true; btn.textContent = 'Installing ...'
      const res = await pluffy.extInstall(x.file)
      if (res.ok) toast(`Installed ${x.name}`); else toast(res.error, true)
      renderExtensions()
    } }, x.installed ? 'Reinstall' : 'Install')
    list.append(el('div', { class: 'row' },
      el('div', { class: 'grow' }, el('div', {}, el('b', {}, x.name), ' ', el('span', { class: 'k' }, x.version)), el('div', { class: 'k' }, x.file)),
      el('span', { class: 'badge' }, x.kind), x.installed ? el('span', { class: 'badge ok' }, 'installed') : null, btn))
  }
  root.replaceChildren(
    el('h2', { style: 'margin:0' }, 'Extensions'),
    el('div', { class: 'sub', style: 'color:var(--muted);margin-top:2px' }, 'The Pluff Tatemono extension ships with the engine. Import any other .vsix file, no marketplace needed.'),
    r.hasCode ? null : el('div', { class: 'note' }, 'VS Code was not found, so extensions cannot be installed yet. Install VS Code and make sure the "code" command works in a terminal.'),
    el('div', { class: 'toolbar' },
      el('button', { class: 'btn primary', onclick: async () => {
        const res = await pluffy.extImport(); if (fail(res)) return
        for (const x of res.results) { if (x.ok) toast('Installed ' + x.file); else toast(`${x.file}: ${x.error}`, true) }
        renderExtensions()
      } }, 'Import .vsix ...'),
      el('button', { class: 'btn', onclick: () => pluffy.extFolder() }, 'Open imported folder')),
    list,
    el('div', { class: 'note' }, 'Extensions are installed into your VS Code. Use the Editor tab (or the VS Code button) to use them.'))
}

// ======================================================= engine
async function renderEngine() {
  const root = $('#view-engine')
  const i = await pluffy.engineInfo()
  if (fail(i)) return
  const row = (k, v) => el('div', { class: 'row' }, el('div', { class: 'grow' }, el('div', { class: 'k' }, k), el('div', { class: 'v' }, v || '-')))
  const status = el('div', { class: 'sub', id: 'engineStatus', style: 'color:var(--muted);margin-top:10px' })
  const busy = (b) => root.querySelectorAll('button').forEach((x) => { x.disabled = b })
  root.replaceChildren(
    el('h2', { style: 'margin:0' }, 'Engine'),
    el('div', { class: 'sub', style: 'color:var(--muted);margin-top:2px' }, 'The Pluffy repo that the CLI runs from. The app bundles a snapshot and can fetch the latest from GitHub.'),
    el('div', { class: 'panel' }, row('Location', i.root), row('Version', [i.commit, i.date && new Date(i.date).toLocaleDateString()].filter(Boolean).join('  ·  ')), row('Source', i.source)),
    el('div', { class: 'toolbar' },
      el('button', { class: 'btn primary', onclick: async () => {
        busy(true); const r = await pluffy.engineUpdate(); busy(false)
        if (!fail(r)) toast('Engine updated' + (r.commit ? ' to ' + r.commit : '')); renderEngine(); refreshEnv()
      } }, 'Update from GitHub'),
      el('button', { class: 'btn', onclick: async () => { busy(true); const r = await pluffy.engineResync(); busy(false); if (!fail(r)) toast('Re-synced'); renderEngine() } }, 'Re-sync bundled copy'),
      el('button', { class: 'btn', onclick: () => pluffy.openFolder() }, 'Open folder')),
    status,
    i.live ? el('div', { class: 'note' }, 'This is a git checkout, so the app never overwrites it. Update it with git pull.') : el('div', { class: 'note' }, 'Updating keeps your tatemonos, arkzen.json and AI settings. Only engine files are replaced.'))
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
    case 'editor:log': { const l = $('#editorLog'); if (l) { l.textContent += e.line + '\n'; l.scrollTop = l.scrollHeight } break }
    case 'editor:exit': if (editorState === 'ready') { editorFrame.src = 'about:blank'; setEditor('idle'); if (current === 'editor') openEditor() } break
    case 'engine:progress': { const s = $('#engineStatus'); if (s) s.textContent = e.msg; break }
    case 'toast': toast(e.msg); break
  }
})

// ======================================================= start
async function start() {
  if (pluffy.platform === 'darwin') document.body.classList.add('mac')
  renderHome()
  const r = await pluffy.ready()
  $('#boot').classList.add('gone')
  setTimeout(() => $('#boot').remove(), 500)
  if (r && r.error) toast(r.error, true)
  refreshEnv()
  newTerminal('Terminal')
}
start()
