// Commands started from the phone. Same idea as the TUI runner: one task per request, output kept in memory.
import { spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { ROOT, MIZUMI } from './paths.js'

const win = process.platform === 'win32'
const MAX_LINES = 5000, MAX_TASKS = 40
const clean = (s) => s.replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '').replace(/\x1b\[[0-9;?]*[A-Za-ln-zA-Z]/g, '')   // keep colours (SGR) only

export const cliStep = (args) => ({ file: process.execPath, args: [MIZUMI, ...args], shown: `mizumi ${args.join(' ')}` })
export const gitStep = (args, ok = []) => ({ file: 'git', args, shown: `git ${args.join(' ')}`, ok })   // ok: exit codes that are not a failure

export class Tasks {
  constructor() { this.map = new Map(); this.n = 0 }

  list() {
    return [...this.map.values()].reverse().map((t) => this.brief(t))
  }

  brief(t) {
    return { id: t.id, label: t.label, shown: t.shown, status: t.status, code: t.code, startedAt: t.startedAt, endedAt: t.endedAt, lines: t.base + t.lines.length }
  }

  running() { return [...this.map.values()].filter((t) => t.status === 'running') }
  get(id) { return this.map.get(id) }

  start(label, steps) {
    if (this.running().length >= 8) throw Object.assign(new Error('Too many commands are running. Stop one first.'), { status: 429 })
    const t = {
      id: 't' + ++this.n, label, shown: steps.map((s) => s.shown).join('  ;  '), status: 'running', code: null,
      startedAt: Date.now(), endedAt: null, lines: [], base: 0, cur: '', child: null, stopped: false, failed: false, ee: new EventEmitter(),
    }
    this.map.set(t.id, t)
    if (this.map.size > MAX_TASKS) for (const [id, old] of this.map) { if (old.status !== 'running') { this.map.delete(id); break } }
    const queue = steps.slice()
    const next = () => {
      const step = queue.shift()
      if (!step || t.stopped) return this.finish(t)
      this.push(t, `\x1b[35m$ ${step.shown}\x1b[0m\n`)
      let child
      try {
        child = spawn(step.file, step.args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: !win, windowsHide: true, env: { ...process.env, FORCE_COLOR: '1', PLUFFY_BRIDGE: '1' } })
      } catch (e) { this.push(t, `\x1b[31m${e.message}\x1b[0m\n`); t.failed = true; return next() }
      t.child = child
      child.stdout.on('data', (d) => this.push(t, String(d)))
      child.stderr.on('data', (d) => this.push(t, String(d)))
      child.on('error', (e) => { this.push(t, `\x1b[31mCould not start ${step.file}: ${e.message}\x1b[0m\n`); t.failed = true; next() })
      child.on('exit', (code) => {
        t.child = null
        if (code && !(step.ok ?? []).includes(code)) t.failed = true
        this.push(t, `\x1b[90m[exit ${code ?? 'signal'}]\x1b[0m\n`)
        next()
      })
    }
    next()
    return t
  }

  finish(t) {
    t.status = t.stopped ? 'stopped' : t.failed ? 'failed' : 'done'
    t.code = t.failed ? 1 : 0
    t.endedAt = Date.now()
    t.ee.emit('change')
  }

  push(t, text) {
    const parts = clean(text.replace(/\r\n/g, '\n')).split('\n')
    parts.forEach((part, i) => {
      const seg = part.split('\r').pop()            // a lone \r rewrites the line (progress bars)
      t.cur = part.includes('\r') ? seg : t.cur + seg
      if (i < parts.length - 1) { t.lines.push(t.cur); t.cur = '' }
    })
    if (t.lines.length > MAX_LINES) { const drop = t.lines.length - MAX_LINES; t.lines.splice(0, drop); t.base += drop }
    t.ee.emit('change')
  }

  // lines from absolute index `since`; resolves when something new arrives, the task ends, or `ms` pass
  async read(t, since, ms) {
    const total = () => t.base + t.lines.length
    if (ms > 0 && t.status === 'running' && since >= total() && !t.cur) {
      await new Promise((res) => { const done = () => { clearTimeout(timer); t.ee.off('change', done); res() }; const timer = setTimeout(done, ms); t.ee.on('change', done) })
    }
    const from = Math.max(0, since - t.base)
    return { ...this.brief(t), from: t.base + from, lines: t.lines.slice(from), next: total(), cur: t.cur }
  }

  stop(t) {
    if (t.status !== 'running') return
    t.stopped = true
    const c = t.child
    if (!c) return
    try {
      if (win) spawn('taskkill', ['/pid', String(c.pid), '/T', '/F'], { windowsHide: true })
      else process.kill(-c.pid, 'SIGTERM')
    } catch { /* already gone */ }
    if (!win) setTimeout(() => { try { process.kill(-c.pid, 'SIGKILL') } catch { /* gone */ } }, 3000).unref()
  }

  remove(t) { if (t.status !== 'running') this.map.delete(t.id) }
  stopAll() { for (const t of this.running()) this.stop(t) }
}
