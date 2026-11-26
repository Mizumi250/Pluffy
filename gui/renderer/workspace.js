'use strict'
/* global PluffEditor, pluffy, icon, el, $, toast, fail, runCli, openForm, byId, show */
// The tatemono workspace: picking a tatemono in the sidebar opens it here, in its own editor.
//
//   Monaco + the Pluff Tatemono .vsix (highlighting, problems, completions, hover, folding, blocks)
//   a timeline of the tatemono's blocks, an "Add block" dialog, save / autosave, file tabs,
//   and the commands that make sense for one tatemono (Check, Export, Screenshot, OpenAPI).

const WS = {
  name: null, files: [], tabs: [], active: null, ed: null, edHost: null, ready: null, info: null,
  outline: [], lint: { errors: [], warnings: [] }, lintTimer: 0, saveTimer: 0, railTimer: 0, loadToken: 0,
  built: false, banner: null, assets: null,
}
const WSK = (rel) => `${WS.name}/${rel}`

const FAM = {
  web: ['#c2415b', 'Web'], native: ['#2d7a58', 'App'], backend: ['#6a4fb0', 'Backend'],
  shared: ['#b0642f', 'Shared'], desktop: ['#1f7a8c', 'Desktop'], game: ['#a65f00', 'Game'], file: ['#7d706c', 'File'],
}
const BACKEND_HEADS = new Set(['endpoint', 'handler', 'middleware', 'policy', 'listener', 'jobs', 'console', 'notifications', 'mail', 'module', 'events', 'realtime'])
function familyOf(tag) {
  const head = tag.split(':')[0]
  if (head === 'web') return 'web'
  if (head === 'native') return 'native'
  if (BACKEND_HEADS.has(head)) return 'backend'
  if (head === 'desktop') return 'desktop'
  if (['godot', 'unity', 'unreal'].includes(head)) return 'game'
  if (head === 'file') return 'file'
  return 'shared'
}

// ---------------------------------------------------------------- editor boot (once, in the background)
function initEditor() {
  if (WS.ready) return WS.ready
  WS.ready = (async () => {
    if (!window.PluffEditor) throw new Error('The editor bundle is missing. Run "npm run build" in gui/.')
    const assets = await pluffy.tmAssets()
    if (assets && assets.error) throw new Error(assets.error)
    WS.assets = assets
    const info = await PluffEditor.boot(assets)
    WS.info = { ...info, source: assets.source, origin: assets.apiOrigin, problems: assets.problems }
    return WS.info
  })()
  WS.ready.catch(() => { /* reported when the workspace opens */ })
  return WS.ready
}

// ---------------------------------------------------------------- small helpers
// replaceChildren() turns null into the text "null", so empty slots are dropped first
const fill = (node, ...kids) => node.replaceChildren(...kids.flat().filter((c) => c != null && c !== false))
function menu(anchor, items, align = 'right') {
  document.querySelectorAll('.menu').forEach((m) => m.remove())
  const m = el('div', { class: 'popover menu' })
  const close = () => { m.remove(); document.removeEventListener('mousedown', outside, true) }
  const outside = (e) => { if (!m.contains(e.target)) close() }
  for (const it of items) {
    if (it === '-') { m.append(el('hr')); continue }
    m.append(el('button', { onclick: () => { close(); it.run() } }, it.icon ? icon(it.icon, 16) : null, it.label, it.hint ? el('span', { class: 'muted', style: 'margin-left:auto;font-size:12px' }, it.hint) : null))
  }
  document.body.append(m)
  const r = anchor.getBoundingClientRect()
  m.style.position = 'fixed'; m.style.bottom = 'auto'; m.style.minWidth = '210px'; m.style.right = 'auto'; m.style.left = 'auto'
  m.style.top = Math.min(r.bottom + 6, window.innerHeight - m.offsetHeight - 12) + 'px'
  if (align === 'right') m.style.left = Math.max(12, r.right - m.offsetWidth) + 'px'; else m.style.left = r.left + 'px'
  setTimeout(() => document.addEventListener('mousedown', outside, true))
  return m
}

function parseMeta(text) {
  const m = /\/\*\s*@arkzen:meta\s*\n([\s\S]*?)\*\//.exec(text || '')
  const meta = {}
  if (m) for (const line of m[1].split(/\r?\n/)) { const k = /^\s*(name|version|description):\s*(.*?)\s*$/.exec(line); if (k) meta[k[1]] = k[2].replace(/^["']|["']$/g, '') }
  return meta
}
const gameKindOf = (text) => (/@arkzen:godot:project/.test(text) ? 'godot' : /@arkzen:unity:project/.test(text) ? 'unity' : /@arkzen:unreal:project/.test(text) ? 'unreal' : null)
const isCore = (rel) => rel === 'core.tsx'

// ---------------------------------------------------------------- skeleton
function buildWorkspace() {
  const root = $('#view-tatemono')
  WS.edHost = el('div', { class: 'ws-editor' })
  root.replaceChildren(el('div', { class: 'ws' },
    el('div', { class: 'ws-head', id: 'wsHead' }),
    el('div', { class: 'ws-tabs', id: 'wsTabs' }),
    el('div', { class: 'ws-body', id: 'wsBody' },
      el('div', { class: 'ws-rail' },
        el('div', { class: 'rail-head' }, 'Blocks',
          el('span', {}, el('button', { class: 'icon-btn', title: 'Fold all blocks', onclick: () => WS.ed && WS.ed.foldAll() }, icon('chevrons-down-up', 15)),
            el('button', { class: 'icon-btn', title: 'Unfold all', onclick: () => WS.ed && WS.ed.unfoldAll() }, icon('chevrons-up-down', 15)))),
        el('ul', { class: 'rail', id: 'wsRail' })),
      el('div', { class: 'ws-card', id: 'wsCard' },
        el('div', { id: 'wsBanner' }),
        WS.edHost,
        el('div', { class: 'ws-problems collapsed', id: 'wsProblems' }))),
    el('div', { class: 'ws-foot', id: 'wsFoot' })))
  WS.built = true
}

function ensureEditor() {
  if (WS.ed) return
  WS.ed = PluffEditor.createEditor(WS.edHost, {
    onSave: () => saveActive(true),
    onCursor: (line, col) => { WS.cursor = { line, col }; scheduleRail(); renderFoot() },
    onChange: (key) => onModelChange(key),
  })
}

// ---------------------------------------------------------------- open / switch
async function guardDirty() {
  const dirty = WS.ed ? WS.tabs.filter((r) => WS.ed.dirty(WSK(r))) : []
  if (!dirty.length) return true
  return new Promise((resolve) => {
    const done = (v) => { $('#modal').classList.add('hidden'); $('#modal').replaceChildren(); resolve(v) }
    $('#modal').replaceChildren(el('div', { class: 'sheet-modal', role: 'dialog' },
      el('h2', {}, 'Save your changes?'),
      el('p', {}, `${dirty.join(', ')} ${dirty.length > 1 ? 'have' : 'has'} unsaved changes in ${WS.name}.`),
      el('div', { class: 'foot', style: 'margin-top:20px' },
        el('button', { class: 'btn', onclick: () => done(null) }, 'Cancel'),
        el('button', { class: 'btn', onclick: () => done(true) }, "Don't save"),
        el('button', { class: 'primary', onclick: async () => { await saveAll(); done(true) } }, 'Save'))))
    $('#modal').classList.remove('hidden')
  })
}

async function openWorkspace(name) {
  if (!name) return
  if (!WS.built) buildWorkspace()
  const token = ++WS.loadToken
  if (WS.name && WS.name !== name) {
    // the caller (pickTatemono) already asked about unsaved edits
    for (const r of WS.tabs) if (WS.ed) WS.ed.close(WSK(r))
    WS.tabs = []; WS.active = null; WS.outline = []; WS.banner = null; WS.cursor = null; WS.lint = { errors: [], warnings: [] }
  }
  WS.name = name
  renderHead(); renderTabs(); renderRail(); renderFoot()
  setBanner(null)
  try {
    await initEditor()
  } catch (e) {
    showEmpty('The editor could not start', String(e.message || e))
    return true
  }
  if (token !== WS.loadToken) return true
  ensureEditor()
  const files = await pluffy.tmFiles(name)
  if (fail(files)) return true
  WS.files = files
  await openFile('core.tsx')
  pluffy.tmWatch(name)
  if (WS.info && !WS.info.ok && WS.info.error) toast('Syntax colors are off: ' + WS.info.error, true)
  return true
}

function showEmpty(title, text) {
  WS.edHost.replaceChildren(el('div', { class: 'ws-empty' }, el('h3', {}, title), el('div', {}, text)))
}

async function openFile(rel) {
  const key = WSK(rel)
  if (!WS.tabs.includes(rel)) WS.tabs.push(rel)
  WS.active = rel
  for (const v of WS.edHost.querySelectorAll('.ws-viewer, .ws-empty')) v.remove()
  const file = WS.files.find((f) => f.path === rel)
  if (file && file.kind === 'image') {
    const r = await pluffy.tmRead(WS.name, rel)
    if (fail(r)) { closeTab(rel); return }
    WS.edHost.append(el('div', { class: 'ws-viewer' }, r.url ? el('img', { src: r.url, alt: rel }) : el('div', { class: 'muted' }, 'This image is too large to preview.')))
    renderTabs(); renderHead(); renderFoot()
    return
  }
  if (!WS.ed.has(key)) {
    const r = await pluffy.tmRead(WS.name, rel)
    if (fail(r)) { WS.tabs = WS.tabs.filter((x) => x !== rel); renderTabs(); return }
    if (r.kind !== 'text') { toast(`${rel} is ${r.kind === 'big' ? 'too large' : 'not a text file'} to edit here. Open it in VS Code.`, true); WS.tabs = WS.tabs.filter((x) => x !== rel); renderTabs(); return }
    WS.ed.open(key, r.text, rel)
  }
  WS.ed.show(key)
  renderTabs(); renderHead(); renderFoot()
  if (isCore(rel)) { runLint(); loadOutline() } else { WS.outline = []; renderRail(); applyProblems({ errors: [], warnings: [] }) }
}

function closeTab(rel) {
  if (isCore(rel)) return
  if (WS.ed && WS.ed.dirty(WSK(rel))) { toast(`Save ${rel} first (Ctrl+S).`); return }
  if (WS.ed) WS.ed.close(WSK(rel))
  WS.tabs = WS.tabs.filter((x) => x !== rel)
  if (WS.active === rel) openFile('core.tsx')
  else renderTabs()
}

// ---------------------------------------------------------------- saving
async function saveRel(rel, announce) {
  const key = WSK(rel)
  if (!WS.ed || !WS.ed.has(key) || !WS.ed.dirty(key)) return true
  const r = await pluffy.tmWrite(WS.name, rel, WS.ed.value(key))
  if (fail(r)) return false
  WS.ed.markSaved(key)
  if (announce) { WS.savedAt = Date.now(); setTimeout(renderFoot, 2200) }
  renderTabs(); renderFoot()
  return true
}
async function saveActive(announce) { return WS.active ? saveRel(WS.active, announce) : true }
async function saveAll() { for (const r of WS.tabs) if (!(await saveRel(r))) return false; return true }

const autosaveOn = () => localStorage.getItem('pluffy.autosave') === '1'
// the extension's `pluffy.backend` setting: which backend variant to lint for (auto = none, like mizumi check)
const BACKENDS = [['auto', 'Auto'], ['php', 'PHP (Laravel)'], ['ts', 'TS (Express)'], ['py', 'Python (FastAPI)'], ['java', 'Java (Spring)'], ['cs', 'C# (ASP.NET)'], ['go', 'Go (Chi)'], ['rs', 'Rust (Axum)']]
const backendPref = () => { try { const v = localStorage.getItem('pluffy.backend'); return BACKENDS.some(([k]) => k === v) ? v : 'auto' } catch { return 'auto' } }
const lintVariant = () => { const v = backendPref(); return v === 'auto' ? null : v }

function onModelChange(key) {
  const rel = key.slice(WS.name.length + 1)
  renderTabs(); renderFoot()
  if (isCore(rel)) { clearTimeout(WS.lintTimer); WS.lintTimer = setTimeout(() => { runLint(); loadOutline() }, 280) }
  if (autosaveOn()) { clearTimeout(WS.saveTimer); WS.saveTimer = setTimeout(() => saveRel(rel, true), 1200) }
}

// ---------------------------------------------------------------- lint + outline (the extension's own rules)
async function runLint() {
  const key = WSK('core.tsx')
  if (!WS.ed || !WS.ed.has(key)) return
  const name = WS.name
  const r = await pluffy.tmLint({ name, text: WS.ed.value(key), variant: lintVariant() })
  if (name !== WS.name || fail(r)) return
  applyProblems(r)
}

function applyProblems(r) {
  WS.lint = r
  if (WS.ed && WS.active && WS.ed.has(WSK(WS.active))) {
    const list = isCore(WS.active) ? [...r.errors.map((e) => ({ ...e, severity: 'error' })), ...r.warnings.map((w) => ({ ...w, severity: 'warning' }))] : []
    WS.ed.markers(WSK(WS.active), list)
  }
  renderProblems(); renderFoot()
}

async function loadOutline() {
  const key = WSK('core.tsx')
  if (!WS.ed || !WS.ed.has(key)) return
  const name = WS.name
  const r = await pluffy.tmOutline(WS.ed.value(key))
  if (name !== WS.name || !Array.isArray(r)) return
  WS.outline = r.filter((b) => !b.hidden)
  renderRail()
}

// ---------------------------------------------------------------- rendering
function renderHead() {
  const head = $('#wsHead'); if (!head) return
  const key = WSK('core.tsx')
  const text = WS.ed && WS.ed.has(key) ? WS.ed.value(key) : ''
  const meta = parseMeta(text)
  const game = gameKindOf(text)
  const sub = [meta.version && `v${meta.version}`, meta.description].filter(Boolean).join('  ·  ')
  const run = (fn) => async () => { if (await saveAll()) fn() }
  head.replaceChildren(
    el('div', { class: 'ws-title' }, el('h2', {}, WS.name), el('p', { title: sub }, sub || (game ? `${game} game tatemono` : 'tatemono'))),
    el('div', { class: 'ws-actions' },
      el('button', { class: 'btn', onclick: run(() => runCli(`Check ${WS.name}`, [['check', WS.name]])) }, icon('square-check', 15), 'Check'),
      el('button', { class: 'btn', onclick: run(() => openForm(byId('export'), { t: WS.name, ...(game ? { target: game } : {}) })) }, icon('upload', 15), 'Export'),
      el('button', { class: 'btn', onclick: (e) => menu(e.currentTarget, [
        { icon: 'camera', label: 'Screenshot', run: run(() => openForm(byId('screenshot'), { t: WS.name })) },
        { icon: 'book-open', label: 'OpenAPI docs', run: run(() => openForm(byId('openapi'), { t: WS.name })) },
        '-',
        { icon: 'code-xml', label: 'Open in VS Code', run: async () => fail(await pluffy.tmVSCode(WS.name, WS.active || 'core.tsx')) },
        { icon: 'folder-open', label: 'Show folder', run: async () => fail(await pluffy.tmReveal(WS.name)) },
      ]) }, icon('ellipsis', 15)),
      el('button', { class: 'primary', onclick: openAddBlock }, icon('plus', 15), 'Add block')))
}

function renderTabs() {
  const box = $('#wsTabs'); if (!box) return
  const tab = (rel) => {
    const dirty = WS.ed && WS.ed.has(WSK(rel)) && WS.ed.dirty(WSK(rel))
    return el('button', { class: 'ws-tab' + (rel === WS.active ? ' active' : '') + (dirty ? ' dirty' : '') + (isCore(rel) ? ' static' : ''), onclick: () => openFile(rel), title: rel },
      rel, el('span', { class: 'mod' }),
      isCore(rel) ? null : el('span', { class: 'x', title: 'Close', onclick: (e) => { e.stopPropagation(); closeTab(rel) } }, icon('x', 12)))
  }
  fill(box, WS.tabs.map(tab),
    WS.files.length > 1 ? el('button', { class: 'icon-btn', title: 'Files in this tatemono', 'aria-label': 'Files', onclick: (e) => menu(e.currentTarget, WS.files.map((f) => ({
      icon: f.kind === 'image' ? 'image' : f.kind === 'text' ? 'file-text' : 'files', label: f.path, hint: f.kind === 'other' ? 'binary' : '',
      run: () => (f.kind === 'other' ? toast(`${f.path} is not a text or image file. Open the folder to see it.`) : openFile(f.path)),
    })), 'left') }, icon('folder-tree', 16)) : null)
  $('#wsBody').classList.toggle('no-rail', !isCore(WS.active || 'core.tsx'))
}

function activeBlock() {
  if (!WS.cursor) return -1
  let hit = -1
  WS.outline.forEach((b, i) => { if (WS.cursor.line >= b.line && WS.cursor.line <= b.end) hit = i })
  return hit
}

function renderRail() {
  const rail = $('#wsRail'); if (!rail) return
  if (!WS.outline.length) { rail.replaceChildren(el('li', { class: 'none' }, isCore(WS.active || 'core.tsx') ? 'No blocks yet. Use Add block.' : '')); return }
  const act = activeBlock()
  rail.replaceChildren(...WS.outline.map((b, i) => {
    const fam = familyOf(b.tag)
    const li = el('li', {}, el('button', { class: i === act ? 'active' : '', style: `--fam:${FAM[fam][0]}`, title: `@arkzen:${b.tag}  (line ${b.line})`, onclick: () => WS.ed && WS.ed.reveal(b.line) },
      el('span', { class: 't' }, b.tag), el('span', { class: 's' }, `${FAM[fam][1]}  ·  line ${b.line}`)))
    return li
  }))
}
function scheduleRail() {
  clearTimeout(WS.railTimer)
  WS.railTimer = setTimeout(() => {
    const act = activeBlock()
    document.querySelectorAll('#wsRail button').forEach((b, i) => b.classList.toggle('active', i === act))
  }, 90)
}

function renderProblems() {
  const box = $('#wsProblems'); if (!box) return
  const items = [...WS.lint.errors.map((e) => ({ ...e, kind: 'error' })), ...WS.lint.warnings.map((w) => ({ ...w, kind: 'warn' }))]
  fill(box, items.map((p) => el('button', { class: 'prob ' + p.kind, onclick: () => WS.ed && WS.ed.reveal(p.line) },
    icon(p.kind === 'error' ? 'circle-x' : 'triangle-alert', 15), el('span', {}, p.msg), el('span', { class: 'ln' }, `line ${p.line}`))))
  if (!items.length) box.classList.add('collapsed')
}

function renderFoot() {
  const foot = $('#wsFoot'); if (!foot) return
  const rel = WS.active || 'core.tsx'
  const dirty = WS.ed && WS.ed.has(WSK(rel)) && WS.ed.dirty(WSK(rel))
  const e = WS.lint.errors.length, w = WS.lint.warnings.length
  const core = isCore(rel)
  const toggleProblems = () => { if (e || w) $('#wsProblems').classList.toggle('collapsed') }
  const src = WS.info && WS.info.source
  const srcText = !src ? 'No extension found' : src.kind === 'vsix' ? `${src.name} ${src.version} (.vsix)` : `${src.name} (engine files${src.staleVsix ? `; ${src.staleVsix} is older` : ''})`
  const saved = WS.savedAt && Date.now() - WS.savedAt < 2000
  fill(foot,
    core ? el('button', { onclick: toggleProblems, title: e || w ? 'Show or hide the problems' : 'Same rules as mizumi check' },
      e ? el('span', { class: 'bad', style: 'display:inline-flex;align-items:center;gap:6px' }, icon('circle-x', 14), `${e} error${e > 1 ? 's' : ''}`) : null,
      w ? el('span', { class: 'meh', style: 'display:inline-flex;align-items:center;gap:6px' }, icon('triangle-alert', 14), `${w} warning${w > 1 ? 's' : ''}`) : null,
      !e && !w ? el('span', { class: 'good', style: 'display:inline-flex;align-items:center;gap:6px' }, icon('circle-check', 14), 'Clean') : null) : null,
    el('span', { title: srcText }, `${WS.cursor ? `Ln ${WS.cursor.line}, Col ${WS.cursor.col}` : ''}   ${core ? 'Tatemono' : PluffEditor.languageFor(rel)}`),
    el('span', { class: 'sp' }),
    core ? el('label', { class: 'switch', style: 'cursor:default', title: 'Backend to lint for: warns about blocks that have no body for it (same as the extension setting pluffy.backend). Auto = no backend checks, like mizumi check.' },
      'Backend',
      (() => {
        const sel = el('select', { style: 'height:22px;border-radius:8px;padding:0 6px;background:var(--secondary);cursor:pointer', onchange: (ev) => { try { localStorage.setItem('pluffy.backend', ev.target.value) } catch { /* not fatal */ } runLint() } },
          ...BACKENDS.map(([v, l]) => el('option', { value: v }, l)))
        sel.value = backendPref()
        return sel
      })()) : null,
    el('span', { class: 'switch' + (autosaveOn() ? ' on' : ''), title: 'Save automatically after a short pause', onclick: (ev) => { localStorage.setItem('pluffy.autosave', autosaveOn() ? '0' : '1'); ev.currentTarget.classList.toggle('on'); if (autosaveOn()) saveAll() } }, el('i'), 'Auto-save'),
    el('button', { onclick: () => saveActive(true), title: 'Save (Ctrl+S)' }, icon('save', 14), dirty ? 'Save' : saved ? 'Saved' : 'Saved'))
}

function setBanner(b) {
  WS.banner = b
  const box = $('#wsBanner'); if (!box) return
  if (!b) { box.replaceChildren(); return }
  box.replaceChildren(el('div', { class: 'ws-banner' }, el('span', {}, b.text),
    el('button', { class: 'btn', onclick: b.keep }, 'Keep mine'), el('button', { class: 'primary', onclick: b.reload }, 'Reload')))
}

// ---------------------------------------------------------------- changes made outside the app (CLI, AI, VS Code)
async function reloadFromDisk(rel) {
  const r = await pluffy.tmRead(WS.name, rel)
  if (fail(r) || r.kind !== 'text') return
  WS.ed.setValue(WSK(rel), r.text)
  setBanner(null); renderTabs()
  if (isCore(rel)) { runLint(); loadOutline() }
}

async function workspaceChanged(e) {
  if (e.name !== WS.name || !WS.ed) return
  const files = await pluffy.tmFiles(WS.name)
  if (!files.error) { WS.files = files; renderTabs() }
  const key = WSK(e.rel)
  if (!WS.ed.has(key)) return
  if (e.deleted) { toast(`${e.rel} was removed from disk.`, true); return }
  if (!WS.ed.dirty(key)) { await reloadFromDisk(e.rel); toast(`${e.rel} changed on disk, reloaded.`); return }
  if (WS.active === e.rel) setBanner({ text: `${e.rel} changed on disk while you have unsaved edits.`, reload: () => reloadFromDisk(e.rel), keep: () => setBanner(null) })
}

// ---------------------------------------------------------------- add block
async function openAddBlock() {
  const key = WSK('core.tsx')
  if (WS.active !== 'core.tsx') await openFile('core.tsx')
  if (!WS.ed || !WS.ed.has(key)) return
  const cat = await pluffy.tmCatalog(WS.ed.value(key))
  if (fail(cat)) return
  if (!cat.blocks.length) { toast('No blocks are registered for this tatemono.', true); return }

  const st = { sel: null, variant: null, names: [], pickName: '', flags: {}, plan: null, cands: null, token: 0, q: '' }
  const list = el('div', { class: 'pick-list' })
  const right = el('div', { class: 'form-col' })
  const search = el('input', { placeholder: 'Search blocks', spellcheck: 'false', 'aria-label': 'Search blocks' })
  const close = () => { $('#modal').classList.add('hidden'); $('#modal').replaceChildren() }

  function paintList() {
    const q = st.q.toLowerCase()
    const groups = new Map()
    for (const b of cat.blocks) {
      if (q && !`${b.key} ${b.sub} ${b.group}`.toLowerCase().includes(q)) continue
      if (!groups.has(b.group)) groups.set(b.group, [])
      groups.get(b.group).push(b)
    }
    fill(list, (groups.size ? [...groups].flatMap(([g, bs]) => [
      el('div', { class: 'pick-group' }, g),
      ...bs.map((b) => el('button', { class: 'pick-item' + (st.sel === b ? ' sel' : '') + (b.problem ? ' off' : ''), onclick: () => choose(b) }, el('b', {}, b.key), el('span', {}, b.sub))),
    ]) : [el('div', { class: 'pick-group' }, 'No block matches.')]))
  }

  async function choose(b) {
    st.sel = b; st.variant = null; st.names = []; st.pickName = ''; st.flags = {}; st.plan = null; st.cands = null
    if (b.variants) st.variant = b.variants.optional ? null : ((b.variants.backend && b.variants.list.includes(lintVariant()) ? lintVariant() : null) || b.variants.list[0] || null)
    if (b.unityMode) st.flags.mode = ''
    if (b.extra) st.flags[b.extra.key] = b.extra.def || ''
    if (b.name && !b.name.choices) st.pickName = b.name.def || ''
    if (b.name && b.name.choices) st.pickName = b.name.choices[0] || ''
    paintList(); await refreshCands(); paintForm(); refreshPlan()
  }

  async function refreshCands() {
    const b = st.sel; st.cands = null
    if (!b || !(b.name || b.composite)) return
    const r = await pluffy.tmCandidates({ text: WS.ed.value(key), key: b.key, variant: st.variant })
    if (r.error) { st.cands = { error: r.error }; return }
    st.cands = r
    if (Array.isArray(r.names)) st.pickName = r.names.includes(st.pickName) ? st.pickName : (r.names[0] || '')
  }

  function paintForm() {
    const b = st.sel
    if (!b) { right.replaceChildren(el('div', { class: 'empty-pick' }, el('h3', {}, 'Pick a block'), el('p', {}, 'The list on the left has every block this tatemono can take, with the same rules as mizumi block.'))); return }
    const kids = [el('h2', { style: 'font-family:var(--mono);font-size:17px' }, `@arkzen:${b.key}`), el('p', { class: 'muted', style: 'margin:2px 0 0' }, `${b.sub}  ·  ${b.group}`)]
    if (b.problem) kids.push(el('p', { class: 'err' }, b.problem))
    const field = (label, ...body) => el('div', { class: 'field' }, el('label', { class: 'l' }, label), ...body)
    const pills = (opts, value, onpick) => el('div', { class: 'pills' }, opts.map((o) => el('span', { class: 'pill' + (value === o.v ? ' on' : ''), onclick: () => onpick(o.v) }, o.l)))
    if (b.variants) {
      const opts = b.variants.list.map((v) => ({ v, l: `:${v}  ${b.variants.labels[v] || ''}${b.variants.backend && v === lintVariant() ? '  (active backend)' : ''}`.trim() }))
      if (b.variants.backend && lintVariant()) opts.sort((a, c) => (c.v === lintVariant()) - (a.v === lintVariant()))
      if (b.variants.optional) opts.unshift({ v: null, l: 'shared (works on every backend)' })
      kids.push(field(b.variants.backend ? 'Backend' : 'Target', pills(opts, st.variant, async (v) => { st.variant = v; await refreshCands(); paintForm(); refreshPlan() })))
    }
    if (b.name || b.composite) {
      if (st.cands && st.cands.error) kids.push(el('p', { class: 'err' }, st.cands.error))
      else if (st.cands && Array.isArray(st.cands.names)) {
        if (!st.cands.names.length) kids.push(el('p', { class: 'note' }, `Every ${st.cands.what} already has a body${st.variant ? ` for :${st.variant}` : ''}.`))
        else kids.push(field(b.name ? b.name.prompt : `Which ${st.cands.what}?`, pills(st.cands.names.map((n) => ({ v: n, l: n })), st.pickName, (v) => { st.pickName = v; paintForm(); refreshPlan() })))
      } else if (b.name && b.name.choices) {
        kids.push(field(b.name.prompt, pills(b.name.choices.map((n) => ({ v: n, l: n })), st.pickName, (v) => { st.pickName = v; paintForm(); refreshPlan() })))
      } else if (b.name) {
        const input = el('input', { type: 'text', value: st.pickName, spellcheck: 'false' })
        input.addEventListener('input', () => { st.pickName = input.value.trim(); refreshPlan() })
        kids.push(field(b.name.prompt, input))
      }
    }
    if (b.extra) {
      const input = el('input', { type: 'text', value: st.flags[b.extra.key] ?? '', spellcheck: 'false' })
      input.addEventListener('input', () => { st.flags[b.extra.key] = input.value.trim(); refreshPlan() })
      kids.push(field(b.extra.prompt, input))
    }
    if (b.pageLayout) {
      const input = el('input', { type: 'text', placeholder: 'e.g. +auth, +guest, app (optional)', value: st.flags.layout || '', spellcheck: 'false' })
      input.addEventListener('input', () => { st.flags.layout = input.value; refreshPlan() })
      kids.push(field('Layout line', input))
    }
    if (b.layoutParent) {
      const input = el('input', { type: 'text', placeholder: 'Parent layout (optional)', value: st.flags.parent || '', spellcheck: 'false' })
      input.addEventListener('input', () => { st.flags.parent = input.value; refreshPlan() })
      kids.push(field('Parent layout', input))
    }
    if (b.unityMode) kids.push(field('Unity project mode', pills([{ v: '', l: 'runner (dinosaur template)' }, { v: 'scene', l: 'scene (general scene mode)' }], st.flags.mode || '', (v) => { st.flags.mode = v; paintForm(); refreshPlan() })))
    kids.push(el('div', { id: 'planBox' }), el('div', { class: 'grow-space' }),
      el('div', { class: 'foot', style: 'margin-top:16px' }, el('button', { class: 'btn', onclick: close }, 'Cancel'), el('button', { class: 'primary', id: 'planGo', disabled: true, onclick: commit }, 'Add block')))
    fill(right, kids)
  }

  async function refreshPlan() {
    const b = st.sel; if (!b || b.problem) return
    const token = ++st.token
    const box = $('#planBox'), go = $('#planGo'); if (!box || !go) return
    const needsName = (b.name || b.composite) && !(st.cands && Array.isArray(st.cands.names) && !st.cands.names.length) && !st.pickName
    const noneLeft = st.cands && Array.isArray(st.cands.names) && !st.cands.names.length
    if (needsName || noneLeft || (st.cands && st.cands.error)) { go.disabled = true; box.replaceChildren(); return }
    const flags = { ...st.flags }
    const plan = await pluffy.tmPlan({ name: WS.name, text: WS.ed.value(key), key: b.key, variant: st.variant, names: [b.name || b.composite ? st.pickName : null], flags, lintVariant: lintVariant() })
    if (token !== st.token) return
    st.plan = plan
    if (plan.error) { box.replaceChildren(el('p', { class: 'err' }, plan.error)); go.disabled = true; return }
    fill(box,
      el('div', { class: 'insert-preview' }, plan.insertion.replace(/^\s+/, '')),
      plan.fresh.length ? el('p', { class: 'err' }, `This would add ${plan.fresh.length} error${plan.fresh.length > 1 ? 's' : ''}: ${plan.fresh.slice(0, 2).join(' | ')}`) : null,
      plan.notes.length ? el('p', { class: 'note', style: 'margin-top:8px' }, plan.notes.join(' ')) : null)
    go.disabled = false
    go.textContent = plan.fresh.length ? 'Add anyway' : 'Add block'
  }

  function commit() {
    const p = st.plan; if (!p || p.error) return
    WS.ed.append(key, p.trimmedLength, p.insertion)
    close()
    toast(`Added ${p.written.map((t) => '@arkzen:' + t).join(', ')}`)
  }

  search.addEventListener('input', () => { st.q = search.value; paintList() })
  paintList(); paintForm()
  const sheet = el('div', { class: 'sheet-modal sheet-lg', role: 'dialog', 'aria-label': 'Add block' },
    el('div', { class: 'pick-col' }, el('h2', {}, 'Add block'), el('label', { class: 'pick-search' }, icon('search', 15), search), list), right)
  $('#modal').replaceChildren(sheet); $('#modal').classList.remove('hidden')
  search.focus()
}

const hasDirty = () => !!(WS.ed && WS.name && WS.tabs.some((r) => WS.ed.dirty(WSK(r))))
window.WS_API = { openWorkspace, initEditor, workspaceChanged, saveAll, WS, guardDirty, hasDirty }
