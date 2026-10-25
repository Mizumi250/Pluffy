'use strict'
const api = window.pluffy
const $ = (s) => document.querySelector(s)
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e }

const state = { sessions: [], currentId: null, messages: [], busy: new Set(), commands: [], settings: null, query: '', suggestIdx: 0 }
if (api.platform === 'darwin') document.body.classList.add('mac')

const QUICK = [
  { label: '/modules', run: true }, { label: '/stacks', run: true }, { label: '/stack', run: true },
  { label: '/scan', run: true }, { label: '/ai', run: false }, { label: '/help', run: true },
]

// ---------- helpers ----------
function toast(text) {
  const t = $('#toast'); t.textContent = text; t.classList.remove('hidden')
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add('hidden'), 3500)
}
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
function fmtStamp(ts) {
  const d = new Date(ts), n = new Date()
  const day0 = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((day0(n) - day0(d)) / 864e5)
  if (diff === 0) return `Today ${fmtTime(ts)}`
  if (diff === 1) return `Yesterday ${fmtTime(ts)}`
  return `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} ${fmtTime(ts)}`
}
function fmtSide(ts) {
  const d = new Date(ts), n = new Date()
  const day0 = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((day0(n) - day0(d)) / 864e5)
  if (diff === 0) return fmtTime(ts)
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) } }

// ---------- rich text (plain text + code blocks, never innerHTML) ----------
function parseRich(text) {
  if (/^\s*\/\*\s*@arkzen/.test(text)) return [{ code: true, text }]
  const parts = []
  let i = 0
  while (i < text.length) {
    const s = text.indexOf('```', i)
    if (s < 0) { parts.push({ code: false, text: text.slice(i) }); break }
    if (s > i) parts.push({ code: false, text: text.slice(i, s) })
    let nl = text.indexOf('\n', s + 3)
    if (nl < 0) nl = text.length
    const e = text.indexOf('```', nl + 1)
    if (e < 0) { parts.push({ code: true, text: text.slice(nl + 1) }); break }
    parts.push({ code: true, text: text.slice(nl + 1, e).replace(/\n$/, '') })
    i = e + 3
  }
  return parts.filter((p) => p.code || p.text.trim() !== '')
}
function renderRich(box, text) {
  box.textContent = ''
  const parts = parseRich(text)
  let code = false
  for (const p of parts) {
    if (p.code) {
      code = true
      const wrap = el('div', 'codebox')
      wrap.appendChild(el('pre', null, p.text))
      const b = el('button', 'copy', 'Copy')
      b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(p.text); b.textContent = 'Copied' } catch { b.textContent = 'Failed' } setTimeout(() => (b.textContent = 'Copy'), 1200) })
      wrap.appendChild(b)
      box.appendChild(wrap)
    } else box.appendChild(el('div', 'text', p.text.replace(/^\n+|\n+$/g, '')))
  }
  box.parentElement && box.parentElement.classList.toggle('has-code', code)
}

// ---------- sessions ----------
async function loadSessions() {
  const list = await api.listSessions(state.query)
  state.sessions = Array.isArray(list) ? list : []
  renderSessions()
}
const loadSessionsSoon = debounce(loadSessions, 150)

function renderSessions() {
  const ul = $('#sessions'); ul.textContent = ''
  if (!state.sessions.length) { ul.appendChild(el('li', 's-empty', state.query ? 'No matches' : 'No chats yet')); return }
  for (const s of state.sessions) {
    const li = el('li', s.id === state.currentId ? 'active' : '')
    li.dataset.id = s.id
    li.appendChild(el('div', 's-title', s.title))
    li.appendChild(el('div', 's-time', fmtSide(s.updated_at)))
    li.appendChild(el('div', 's-prev', (s.preview || '').replace(/\s+/g, ' ').slice(0, 80)))
    li.addEventListener('click', () => selectSession(s.id))
    li.addEventListener('dblclick', () => beginRename(li, s))
    li.addEventListener('contextmenu', (e) => { e.preventDefault(); openMenu(e.clientX, e.clientY, s, li) })
    ul.appendChild(li)
  }
}
function beginRename(li, s) {
  const t = li.querySelector('.s-title')
  const input = el('input', 's-edit'); input.value = s.title
  t.replaceWith(input); input.focus(); input.select()
  let done = false
  const finish = async (save) => {
    if (done) return; done = true
    if (save && input.value.trim()) await api.renameSession(s.id, input.value)
    loadSessions()
  }
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') finish(true); else if (e.key === 'Escape') finish(false) })
  input.addEventListener('blur', () => finish(true))
  input.addEventListener('click', (e) => e.stopPropagation())
}
async function newSession() {
  const s = await api.createSession()
  if (!s || !s.id) return toast('Could not create a chat.')
  state.query = ''; $('#search').value = ''
  await loadSessions(); await selectSession(s.id); $('#input').focus()
}
async function selectSession(id) {
  state.currentId = id
  state.messages = await api.getMessages(id)
  if (!Array.isArray(state.messages)) state.messages = []
  renderSessions(); renderThread(true); updateComposer()
}
async function removeSession(s) {
  if (!confirm(`Delete "${s.title}"? This removes its messages.`)) return
  await api.deleteSession(s.id)
  await loadSessions()
  if (state.currentId === s.id) {
    if (state.sessions.length) await selectSession(state.sessions[0].id)
    else await newSession()
  }
}

// ---------- context menu ----------
function openMenu(x, y, s, li) {
  const m = $('#menu'); m.textContent = ''
  const rename = el('button', null, 'Rename'); rename.addEventListener('click', () => { closeMenu(); beginRename(li, s) })
  const del = el('button', 'danger', 'Delete'); del.addEventListener('click', () => { closeMenu(); removeSession(s) })
  m.append(rename, del)
  m.classList.remove('hidden')
  m.style.left = Math.min(x, innerWidth - 170) + 'px'
  m.style.top = Math.min(y, innerHeight - 90) + 'px'
}
function closeMenu() { $('#menu').classList.add('hidden') }
document.addEventListener('click', closeMenu)

// ---------- thread ----------
const sideOf = (m) => (m.role === 'user' ? 'me' : 'them')
function statusOf(meta) {
  if (!meta || meta.running) return ['Running', 'run']
  if (meta.stopped) return ['Stopped', '']
  if (meta.interrupted) return ['Interrupted', '']
  const r = meta.progress && meta.progress.result
  if (meta.code === 0 && r && r.passed < r.total) return [`${r.passed} of ${r.total} passed`, 'bad']
  return meta.code === 0 ? ['Done', 'ok'] : [`Exit ${meta.code}`, 'bad']
}

function buildTerminal(m) {
  const card = el('div', 'card'); card.dataset.id = m.id
  const head = el('div', 'card-head')
  head.appendChild(el('div', 'card-cmd', (m.meta && m.meta.cmd) || 'command'))
  const chip = el('span', 'chip'); chip.dataset.role = 'chip'
  head.appendChild(chip)
  const stop = el('button', 'stop', 'Stop'); stop.dataset.role = 'stop'
  stop.addEventListener('click', () => api.stopTerminal(m.id))
  head.appendChild(stop)
  card.appendChild(head)
  const prog = el('div', 'prog hidden'); prog.dataset.role = 'prog'
  card.appendChild(prog)
  const body = el('pre', 'card-body'); body.dataset.role = 'body'
  card.appendChild(body)
  paintTerminal(card, m)
  return card
}
function paintTerminal(card, m) {
  const [label, cls] = statusOf(m.meta)
  const chip = card.querySelector('[data-role=chip]'); chip.textContent = label; chip.className = 'chip ' + cls
  card.querySelector('[data-role=stop]').classList.toggle('hidden', !(m.meta && m.meta.running))
  const body = card.querySelector('[data-role=body]')
  const near = body.scrollHeight - body.scrollTop - body.clientHeight < 40
  body.textContent = m.content || ''
  if (near) body.scrollTop = body.scrollHeight
  const p = m.meta && m.meta.progress
  const prog = card.querySelector('[data-role=prog]')
  if (p && p.total) {
    prog.classList.remove('hidden'); prog.textContent = ''
    const done = p.done.length
    const bar = el('div', 'bar'); const fill = el('div'); fill.style.width = Math.min(100, Math.round((done / p.total) * 100)) + '%'; bar.appendChild(fill)
    prog.appendChild(bar)
    let label2 = `${done} of ${p.total} blocks`
    if (p.current) label2 += `, writing ${p.current.tag} (try ${p.current.try})`
    if (p.result) label2 = `${p.result.passed} of ${p.result.total} blocks passed. ${p.result.path}`
    prog.appendChild(el('div', 'prog-label', label2))
    const blocks = el('div', 'blocks')
    for (const b of p.done) blocks.appendChild(el('span', 'blk ' + (b.ok ? 'ok' : 'bad'), b.tag + (b.tries > 1 ? ` x${b.tries}` : '')))
    prog.appendChild(blocks)
  } else prog.classList.add('hidden')
}

function buildRow(m, tail) {
  if (m.kind === 'terminal') {
    const row = el('div', 'row them'); row.dataset.id = m.id
    row.appendChild(buildTerminal(m))
    return row
  }
  const side = sideOf(m)
  const row = el('div', `row ${side}${tail ? ' tail' : ''}`); row.dataset.id = m.id
  const bubble = el('div', 'bubble' + (m.meta && m.meta.error ? ' error' : ''))
  const box = el('div'); box.dataset.role = 'content'
  bubble.appendChild(box)
  row.appendChild(bubble)
  paintBubble(row, m)
  return row
}
function paintBubble(row, m) {
  const box = row.querySelector('[data-role=content]')
  if (m.role === 'user') { box.className = 'text'; box.textContent = m.content; return }
  if (!m.content) {
    box.textContent = ''
    const t = el('div', 'typing'); t.append(el('i'), el('i'), el('i')); t.setAttribute('aria-label', 'Pluffy is typing')
    box.appendChild(t); return
  }
  renderRich(box, m.content)
}

function renderThread(forceBottom) {
  const sc = $('#scroll'), th = $('#thread')
  const stick = forceBottom || sc.scrollHeight - sc.scrollTop - sc.clientHeight < 90
  th.textContent = ''
  if (!state.messages.length) {
    const e = el('div', 'empty')
    e.appendChild(el('strong', null, 'Hello, Master Mizumi.'))
    e.appendChild(el('div', null, 'Ask about Pluff, or type / to run a command.'))
    th.appendChild(e)
    return
  }
  const ms = state.messages
  for (let i = 0; i < ms.length; i++) {
    const m = ms[i], prev = ms[i - 1], next = ms[i + 1]
    if (!prev || m.created_at - prev.created_at > 3600e3) th.appendChild(el('div', 'stamp', fmtStamp(m.created_at)))
    const tail = m.kind !== 'terminal' && (!next || next.kind === 'terminal' || sideOf(next) !== sideOf(m) || next.created_at - m.created_at > 3600e3)
    th.appendChild(buildRow(m, tail))
  }
  if (stick) sc.scrollTop = sc.scrollHeight
}
function addMessage(m) {
  if (state.messages.some((x) => x.id === m.id)) return
  state.messages.push(m)
  state.messages.sort((a, b) => a.id - b.id)
  renderThread(m.role === 'user')
}
const findMsg = (id) => state.messages.find((m) => m.id === id)
const rowFor = (id) => $('#thread').querySelector(`.row[data-id="${id}"]`)

let raf = 0
const pending = new Set()
function scheduleUpdate(id) {
  pending.add(id)
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    const sc = $('#scroll')
    const stick = sc.scrollHeight - sc.scrollTop - sc.clientHeight < 90
    for (const pid of pending) {
      const m = findMsg(pid), row = rowFor(pid)
      if (!m || !row) continue
      if (m.kind === 'terminal') paintTerminal(row.querySelector('.card'), m)
      else paintBubble(row, m)
    }
    pending.clear()
    if (stick) sc.scrollTop = sc.scrollHeight
  })
}

// ---------- events from main ----------
api.onEvent((e) => {
  const cur = (sid) => sid === state.currentId
  switch (e.type) {
    case 'message':
      if (cur(e.message.session_id)) addMessage(e.message)
      loadSessionsSoon(); break
    case 'assistant:start':
      state.busy.add(e.message.session_id)
      if (cur(e.message.session_id)) addMessage(e.message)
      updateComposer(); break
    case 'assistant:token': {
      if (!cur(e.sessionId)) break
      const m = findMsg(e.id); if (!m) break
      m.content += e.delta; scheduleUpdate(e.id); break
    }
    case 'assistant:done': {
      state.busy.delete(e.sessionId)
      if (cur(e.sessionId)) { const m = findMsg(e.id); if (m) { m.content = e.content; renderThread(false) } }
      updateComposer(); loadSessionsSoon(); break
    }
    case 'assistant:remove':
      state.busy.delete(e.sessionId)
      if (cur(e.sessionId)) { state.messages = state.messages.filter((m) => m.id !== e.id); renderThread(false) }
      updateComposer(); break
    case 'term:data': {
      if (!cur(e.sessionId)) break
      const m = findMsg(e.id); if (!m) break
      m.content = (m.content + e.text).slice(-30000); scheduleUpdate(e.id); break
    }
    case 'term:progress': {
      if (!cur(e.sessionId)) break
      const m = findMsg(e.id); if (!m) break
      m.meta = { ...(m.meta || {}), progress: e.progress }; scheduleUpdate(e.id); break
    }
    case 'term:end': {
      if (cur(e.sessionId)) { const m = findMsg(e.id); if (m) { m.meta = e.meta; scheduleUpdate(e.id) } }
      loadSessionsSoon(); break
    }
  }
})

// ---------- composer ----------
const input = $('#input')
function updateComposer() {
  const busy = state.busy.has(state.currentId)
  const send = $('#send')
  send.classList.toggle('busy', busy)
  send.classList.toggle('show', busy || input.value.trim().length > 0)
  send.title = busy ? 'Stop' : 'Send'
  send.setAttribute('aria-label', busy ? 'Stop' : 'Send')
}
function autosize() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 140) + 'px'; input.style.overflowY = input.scrollHeight > 140 ? 'auto' : 'hidden' }

async function submit(text) {
  text = (text ?? input.value).trim()
  if (!text || state.currentId == null) return
  if (state.busy.has(state.currentId) && !text.startsWith('/')) return toast('Wait for the reply, or press stop.')
  input.value = ''; autosize(); hideSuggest(); updateComposer()
  const res = await api.send(state.currentId, text)
  if (!res || !res.ok) { toast((res && res.error) || 'Could not send.'); return }
  addMessage(res.message); loadSessionsSoon()
}

$('#send').addEventListener('click', () => {
  if (state.busy.has(state.currentId)) api.stop(state.currentId)
  else submit()
})
input.addEventListener('input', () => { autosize(); updateComposer(); showSuggest() })
input.addEventListener('keydown', (e) => {
  const open = !$('#suggest').classList.contains('hidden')
  if (open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault()
    const n = $('#suggest').children.length
    state.suggestIdx = (state.suggestIdx + (e.key === 'ArrowDown' ? 1 : -1) + n) % n
    paintSuggest(); return
  }
  if (open && e.key === 'Tab') { e.preventDefault(); pickSuggest(state.suggestIdx); return }
  if (e.key === 'Escape') { hideSuggest(); return }
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit() }
})

function matches() {
  const v = input.value
  if (!v.startsWith('/') || /\s/.test(v)) return []
  const q = v.slice(1).toLowerCase()
  return state.commands.filter((c) => c.name.startsWith(q))
}
function showSuggest() {
  const list = matches(), box = $('#suggest')
  if (!list.length) return hideSuggest()
  state.suggestIdx = Math.min(state.suggestIdx, list.length - 1)
  box.textContent = ''
  list.forEach((c, i) => {
    const d = el('div', 'sg'); d.setAttribute('role', 'option')
    d.append(el('b', null, '/' + c.name), el('span', null, c.desc))
    d.addEventListener('mousedown', (ev) => { ev.preventDefault(); pickSuggest(i) })
    box.appendChild(d)
  })
  box.classList.remove('hidden'); paintSuggest()
}
function paintSuggest() { [...$('#suggest').children].forEach((n, i) => n.classList.toggle('sel', i === state.suggestIdx)) }
function hideSuggest() { $('#suggest').classList.add('hidden'); state.suggestIdx = 0 }
function pickSuggest(i) {
  const c = matches()[i]; if (!c) return
  input.value = '/' + c.name + ' '; hideSuggest(); autosize(); updateComposer(); input.focus()
}

function buildQuick() {
  const q = $('#quick')
  for (const c of QUICK) {
    const b = el('button', null, c.label)
    b.addEventListener('click', () => { if (c.run) submit(c.label); else { input.value = c.label + ' '; autosize(); updateComposer(); input.focus() } })
    q.appendChild(b)
  }
}

// ---------- settings + status ----------
function setStatus(ok, text) {
  const s = $('#status'); s.classList.toggle('on', ok === true); s.classList.toggle('off', ok === false)
  $('#statusText').textContent = text
}
async function checkHealth() {
  const r = await api.health()
  if (r && r.ok) setStatus(true, 'Model online')
  else setStatus(false, 'Model offline')
  return r
}
function openSheet() {
  $('#setServer').value = state.settings.server; $('#setModel').value = state.settings.model; $('#setKey').value = state.settings.key
  $('#sheetMsg').textContent = ''; $('#sheetMsg').className = 'sheet-msg'
  $('#sheet').classList.remove('hidden'); $('#setServer').focus()
}
function closeSheet() { $('#sheet').classList.add('hidden') }
const sheetValues = () => ({ server: $('#setServer').value, model: $('#setModel').value, key: $('#setKey').value })
async function saveSheet() {
  const r = await api.setSettings(sheetValues())
  if (!r || !r.ok) { const m = $('#sheetMsg'); m.textContent = (r && r.error) || 'Could not save.'; m.className = 'sheet-msg bad'; return }
  state.settings = r.settings; closeSheet(); checkHealth()
}
async function testSheet() {
  const m = $('#sheetMsg'); m.className = 'sheet-msg'; m.textContent = 'Testing...'
  const saved = await api.setSettings(sheetValues())
  if (!saved || !saved.ok) { m.textContent = (saved && saved.error) || 'Could not save.'; m.className = 'sheet-msg bad'; return }
  state.settings = saved.settings
  const r = await checkHealth()
  m.textContent = r && r.ok ? 'Connected.' : `Not reachable. ${(r && r.error) || ''}`.trim()
  m.className = 'sheet-msg ' + (r && r.ok ? 'good' : 'bad')
}
$('#openSettings').addEventListener('click', openSheet)
$('#status').addEventListener('click', openSheet)
$('#sheetCancel').addEventListener('click', closeSheet)
$('#sheetSave').addEventListener('click', saveSheet)
$('#sheetTest').addEventListener('click', testSheet)
$('#sheet').addEventListener('mousedown', (e) => { if (e.target.id === 'sheet') closeSheet() })
$('#sheet').addEventListener('keydown', (e) => { if (e.key === 'Enter') saveSheet(); if (e.key === 'Escape') closeSheet() })

$('#newChat').addEventListener('click', newSession)
$('#search').addEventListener('input', debounce((e) => { state.query = e.target.value; loadSessions() }, 200))
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); newSession() }
  if (e.key === 'Escape') { closeMenu(); closeSheet() }
})

// ---------- start ----------
;(async function init() {
  buildQuick()
  state.settings = await api.getSettings()
  state.commands = await api.commands()
  await loadSessions()
  if (state.sessions.length) await selectSession(state.sessions[0].id)
  else await newSession()
  autosize(); input.focus()
  const r = await checkHealth()
  if (!r || !r.ok) toast('The model server is not reachable. Open Settings and paste the Colab URL.')
  setInterval(checkHealth, 20000)
})()