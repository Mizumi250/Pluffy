#!/usr/bin/env node
// Pluffy TUI. A skin over mizumi.js, like gui/: every card runs `node mizumi.js ...`.
// Usage:  node mizumi.js tui      (or: node tui/main.js)
//         --no-petals             start without the falling petals (press p to toggle)
//         --snapshot=120x36       print one frame as text and exit

import { spawn } from 'node:child_process'
import { Screen, C, st, fit, wrap, strW } from './lib/screen.js'
import { Petals } from './lib/petals.js'
import { parseKeys } from './lib/keys.js'
import { Runner } from './lib/runner.js'
import { Form } from './lib/forms.js'
import { loadMenu, GLYPH, needsTty } from './lib/menu.js'
import { readStacks, ROOT, MIZUMI } from './lib/data.js'

const argv = process.argv.slice(2)
const snap = argv.find((a) => a.startsWith('--snapshot'))
const menu = loadMenu()
const runner = new Runner()
const petals = new Petals()
const state = {
  g: 0, sel: menu.groups.map(() => 0), form: null, petals: !argv.includes('--no-petals'),
  ti: -1, stacks: readStacks(), stacksAt: 0, note: '', noteAt: 0, quitArm: 0,
}
const itemsOf = (g) => menu.items.filter((i) => i.group === menu.groups[g].id)
const curItem = () => itemsOf(state.g)[state.sel[state.g]]
const curTask = () => runner.tasks[state.ti]
const note = (t) => { state.note = t; state.noteAt = Date.now() }

const GRAD = [218, 217, 211, 205, 211, 217, 218]
const grad = (i, n) => `38;5;${GRAD[Math.min(GRAD.length - 1, Math.floor((i / Math.max(1, n - 1)) * (GRAD.length - 1)))]}`

// ─── drawing ──────────────────────────────────────────────────
function drawHeader(scr) {
  let x = scr.put(1, 0, '✿ ', C.pink)
  const title = 'P L U F F Y'
  ;[...title].forEach((ch, i) => { x = scr.put(x, 0, ch, st(grad(i, title.length), C.bold)) })
  x = scr.put(x + 2, 0, 'みずみ', C.rose)
  const parts = state.stacks.map(([k, v]) => [k, v])
  const len = parts.reduce((n, [k, v]) => n + strW(k) + strW(v) + 4, 0)
  let sx = scr.w - len - 1
  if (sx > x + 3) parts.forEach(([k, v]) => { sx = scr.put(sx, 0, k + ' ', C.mute); sx = scr.put(sx, 0, v, C.pink); sx = scr.put(sx, 0, '  · ', C.dim) })
  const n = scr.w
  for (let i = 0; i < n; i++) scr.put(i, 1, '─', i % 2 ? st(grad(i, n)) : st(grad(i, n), '2'))
}

function drawSidebar(scr, x, y, w, h) {
  scr.box(x, y, w, h, C.dim, 'Groups')
  const two = h - 2 >= menu.groups.length * 2
  menu.groups.forEach((g, i) => {
    const r = y + 1 + (two ? i * 2 : i), on = i === state.g
    if (r >= y + h - 1) return
    if (on) scr.fill(x + 1, r, w - 2, 1, C.sel)
    scr.put(x + 2, r, `${on ? '▸' : ' '} ${i + 1} ${fit(g.title, w - 8)}`, on ? st(C.pink, C.bold, C.sel) : C.white)
    if (two && r + 1 < y + h - 1) scr.put(x + 6, r + 1, fit(g.sub, w - 8), C.dim)
  })
}

function drawItems(scr, x, y, w, h) {
  const g = menu.groups[state.g], items = itemsOf(state.g), sel = state.sel[state.g]
  scr.box(x, y, w, h, C.pink, `${g.title} · ${g.sub}`)
  const inner = h - 2, descH = inner >= 14 ? 6 : 3, listH = Math.max(3, inner - descH)
  const top = Math.max(0, Math.min(sel - listH + 1, items.length - listH))
  items.slice(top, top + listH).forEach((it, i) => {
    const r = y + 1 + i, on = top + i === sel
    if (on) scr.fill(x + 1, r, w - 2, 1, C.sel)
    scr.put(x + 2, r, on ? '▸' : ' ', st(C.pink, on && C.sel))
    scr.put(x + 4, r, GLYPH[it.icon] ?? '•', st(on ? C.rose : C.dim, on && C.sel))
    scr.put(x + 6, r, fit(it.title, w - 10), on ? st(C.white, C.bold, C.sel) : C.mute)
    if (it.form) scr.put(x + w - 4, r, '✎', st(C.dim, on && C.sel))
  })
  if (items.length > listH) scr.put(x + w - 8, y, ` ${sel + 1}/${items.length} `, C.dim)
  const it = items[sel]
  if (!it) return
  const dy = y + h - 1 - descH
  for (let i = 1; i < w - 1; i++) scr.put(x + i, dy, '┄', C.dim)
  wrap(it.desc ?? '', w - 6).slice(0, descH - 3).forEach((l, i) => scr.put(x + 3, dy + 1 + i, l, C.mute))
  scr.put(x + 3, y + h - 2, fit('$ ' + (it.cli ?? ''), w - 6), C.cyan)
}

const SPIN = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
const tIcon = (t) => (t.status === 'running' ? [SPIN[Math.floor(Date.now() / 90) % SPIN.length], C.cyan] : t.status === 'ok' ? ['✓', C.green] : t.status === 'stopped' ? ['■', C.yellow] : ['✗', C.red])

function drawDock(scr, x, y, w, h) {
  scr.box(x, y, w, h, C.rose, 'Output')
  let tx = x + 11
  const tasks = runner.tasks
  tasks.forEach((t, i) => {
    const on = i === state.ti, [ic, col] = tIcon(t)
    const label = ` ${i + 1} ${fit(t.label, 14)} `
    if (tx + strW(label) + 2 > x + w - 12) return
    tx = scr.put(tx, y, '', '')
    scr.put(tx, y, ic, st(col, on && C.sel)); tx++
    tx = scr.put(tx, y, label, on ? st(C.pink, C.bold, C.sel) : C.mute)
  })
  const t = curTask(), inner = h - 2, iw = w - 4
  if (!t) {
    scr.put(x + 3, y + 2, 'Pick a command and press ⏎ — its output streams here.', C.dim)
    scr.put(x + 3, y + 3, 'Long runs like Start engine keep going while you browse.', C.dim)
    return
  }
  const all = t.cur ? [...t.lines, t.cur] : t.lines
  const max = Math.max(0, all.length - inner)
  t.scroll = Math.min(Math.max(0, t.scroll), max)
  const end = all.length - t.scroll
  all.slice(Math.max(0, end - inner), end).forEach((line, i) => scr.ansi(x + 2, y + 1 + i, line, iw, C.white))
  if (t.scroll) scr.put(x + w - 16, y + h - 1, ` ↑ ${t.scroll} more `, C.yellow)
}

const KEYS = [['↑↓', 'select'], ['←→', 'group'], ['⏎', 'run'], ['[ ]', 'tabs'], ['x', 'stop/close'], ['PgUp/Dn', 'scroll'], ['p', 'petals'], ['q', 'quit']]
function drawFooter(scr) {
  const y = scr.h - 1
  if (state.note && Date.now() - state.noteAt < 4000) { scr.put(1, y, fit(state.note, scr.w - 2), C.yellow); return }
  let x = 1
  for (const [k, l] of KEYS) {
    if (x + strW(k) + strW(l) + 3 > scr.w) break
    x = scr.put(x, y, k, st(C.pink, C.bold)); x = scr.put(x, y, ' ' + l + '  ', C.dim)
  }
  const n = runner.running.length
  if (n) { const s = `● ${n} running`; scr.put(scr.w - strW(s) - 1, y, s, C.cyan) }
}

function layout(scr) {
  scr.clear()
  drawHeader(scr)
  const bodyH = scr.h - 3, dockH = Math.max(6, Math.min(Math.floor(bodyH * 0.42), 20)), topH = bodyH - dockH
  const sb = scr.w >= 84 ? 24 : 0
  if (sb) drawSidebar(scr, 0, 2, sb, topH)
  drawItems(scr, sb, 2, scr.w - sb, topH)
  drawDock(scr, 0, 2 + topH, scr.w, dockH)
  drawFooter(scr)
}

function frame(scr) {
  if (scr.w < 50 || scr.h < 16) { scr.clear(); scr.put(1, 1, 'Make the window at least 50×16.', C.yellow) }
  else layout(scr)
  if (state.petals) petals.draw(scr)
  if (state.form && scr.w >= 50 && scr.h >= 16) state.form.draw(scr)
}

// ─── snapshot (one frame as text; handy for checking the layout) ─
if (snap) {
  const [w, h] = (snap.split('=')[1] || '110x34').split('x').map(Number)
  const scr = new Screen(w, h); petals.resize(w, h)
  for (let i = 0; i < 30; i++) petals.step()
  runner.start('Check', [['check']])
  await new Promise((r) => setTimeout(r, 1500)); state.ti = 0
  frame(scr); console.log(scr.toText()); runner.stopAll(); process.exit(0)
}

if (!process.stdin.isTTY || !process.stdout.isTTY) { console.error('The TUI needs a real terminal. Use `node mizumi.js <command>` in scripts.'); process.exit(1) }

// ─── actions ──────────────────────────────────────────────────
function launch(item, lists) {
  if (lists.some(needsTty)) return handoff(lists)
  const t = runner.start(item.title, lists)
  state.ti = runner.tasks.indexOf(t)
  state.stacksAt = 0
}

function activate() {
  const it = curItem()
  if (!it) return
  if (it.form) { state.form = new Form(it); return }
  launch(it, [it.run ?? (it.action === 'chat' ? ['chat'] : [])])
}

function submit(values) {
  const it = state.form.item
  state.form = null
  const out = it.form.build(values)
  launch(it, Array.isArray(out[0]) ? out : [out])
}

async function handoff(lists) {
  suspend()
  const ignore = () => {}                 // Ctrl+C belongs to the command that has the screen, not to the TUI
  process.on('SIGINT', ignore)
  for (const args of lists) {
    process.stdout.write(`\n\x1b[35m$ mizumi ${args.join(' ')}\x1b[0m\n`)
    await new Promise((res) => { const c = spawn(process.execPath, [MIZUMI, ...args], { cwd: ROOT, stdio: 'inherit' }); c.on('exit', res); c.on('error', res) })
  }
  process.stdout.write('\n\x1b[90mPress Enter to go back to Pluffy…\x1b[0m')
  process.stdin.resume()
  await new Promise((res) => process.stdin.once('data', res))
  process.removeListener('SIGINT', ignore)
  resume()
}

function quit() { runner.stopAll(); cleanup(); setTimeout(() => process.exit(0), runner.running.length ? 250 : 0) }

function onKey(k) {
  if (k.name === 'ctrl-c') return quit()
  if (state.form) {
    const r = state.form.key(k)
    if (r?.cancel) state.form = null
    else if (r?.submit) submit(r.submit)
    return
  }
  const items = itemsOf(state.g), n = menu.groups.length, t = curTask()
  switch (k.name) {
    case 'up': state.sel[state.g] = Math.max(0, state.sel[state.g] - 1); break
    case 'down': state.sel[state.g] = Math.min(items.length - 1, state.sel[state.g] + 1); break
    case 'left': state.g = (state.g + n - 1) % n; break
    case 'right': case 'tab': state.g = (state.g + 1) % n; break
    case 'enter': activate(); break
    case 'pgup': if (t) t.scroll += Math.max(3, Math.floor(process.stdout.rows * 0.3)); break
    case 'pgdn': if (t) t.scroll = Math.max(0, t.scroll - Math.max(3, Math.floor(process.stdout.rows * 0.3))); break
    case 'home': if (t) t.scroll = 1e9; break
    case 'end': if (t) t.scroll = 0; break
    case 'char': {
      const c = k.ch
      if (c === 'q') { if (runner.running.length && Date.now() - state.quitArm > 2500) { state.quitArm = Date.now(); note(`Press q again to stop ${runner.running.length} running task(s) and quit`) } else quit() }
      else if (c >= '1' && c <= String(n)) state.g = Number(c) - 1
      else if (c === '[' && runner.tasks.length) state.ti = (state.ti + runner.tasks.length - 1) % runner.tasks.length
      else if (c === ']' && runner.tasks.length) state.ti = (state.ti + 1) % runner.tasks.length
      else if (c === 'x' && t) { if (t.status === 'running') runner.stop(t); else { runner.close(t); state.ti = runner.tasks.length - 1 } }
      else if (c === 'p') state.petals = !state.petals
      else if (c === 'k') onKey({ name: 'up' })
      else if (c === 'j') onKey({ name: 'down' })
      else if (c === 'h') onKey({ name: 'left' })
      else if (c === 'l') onKey({ name: 'right' })
      break
    }
  }
}

// ─── terminal plumbing ────────────────────────────────────────
const scr = new Screen(process.stdout.columns || 100, process.stdout.rows || 30)
let timer = null, alive = true
const onData = (d) => { for (const k of parseKeys(d)) onKey(k); draw() }

function draw() {
  if (!alive) return
  if (Date.now() - state.stacksAt > 3000) { state.stacks = readStacks(); state.stacksAt = Date.now() }
  frame(scr); scr.flush()
}
function fitScreen() { scr.resize(process.stdout.columns || 100, process.stdout.rows || 30); petals.resize(scr.w, scr.h); process.stdout.write('\x1b[2J'); draw() }

function resume() {
  alive = true
  process.stdout.write('\x1b[?1049h\x1b[?25l\x1b[?7l\x1b[2J')
  process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.setEncoding('utf8')
  process.stdin.on('data', onData)
  scr.invalidate(); fitScreen()
  timer = setInterval(() => { petals.step(); draw() }, 75)
}
function suspend() {
  alive = false; clearInterval(timer)
  process.stdin.removeListener('data', onData)
  process.stdin.pause()                   // stop reading, so a command we hand the terminal to gets every keystroke
  process.stdin.setRawMode(false)
  process.stdout.write('\x1b[0m\x1b[?7h\x1b[?25h\x1b[?1049l')
}
function cleanup() { suspend() }

runner.onEnd = () => { state.stacksAt = 0 }
process.stdout.on('resize', () => { if (alive) fitScreen() })
process.on('SIGTERM', quit)
process.on('exit', () => { try { runner.stopAll() } catch { /* ignore */ } })
resume()
