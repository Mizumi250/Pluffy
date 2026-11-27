import { spawn } from 'node:child_process'
import { ROOT, MIZUMI } from './data.js'

const win = process.platform === 'win32'
const MAX_LINES = 5000

// Keep colour codes (SGR), drop every other escape sequence.
const clean = (s) => s.replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '').replace(/\x1b\[[0-9;?]*[A-Za-ln-zA-Z]/g, '')

export class Runner {
  constructor() { this.tasks = []; this.n = 0; this.onEnd = () => {} }

  get running() { return this.tasks.filter((t) => t.status === 'running') }

  // lists = [[args], [args]] -> runs `node mizumi.js ...args` for each, one after another
  start(label, lists) {
    const t = { id: ++this.n, label, lines: [], cur: '', status: 'running', code: null, child: null, scroll: 0, stopped: false, failed: false }
    this.tasks.push(t)
    const queue = lists.slice()
    const next = () => {
      const args = queue.shift()
      if (!args || t.stopped) return this.finish(t)
      this.push(t, `\x1b[35m$ mizumi ${args.join(' ')}\x1b[0m\n`)
      const child = spawn(process.execPath, [MIZUMI, ...args], {
        cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: !win, windowsHide: true,
        env: { ...process.env, FORCE_COLOR: '1', PLUFFY_TUI: '1' },
      })
      t.child = child
      child.stdout.on('data', (d) => this.push(t, String(d)))
      child.stderr.on('data', (d) => this.push(t, String(d)))
      child.on('error', (e) => { this.push(t, `\x1b[31mCould not start node: ${e.message}\x1b[0m\n`); t.failed = true; next() })
      child.on('exit', (code) => {
        t.child = null
        if (code) t.failed = true
        t.code = code
        this.push(t, `\x1b[90m[exit ${code ?? 'signal'}]\x1b[0m\n`)
        next()
      })
    }
    next()
    return t
  }

  finish(t) {
    t.status = t.stopped ? 'stopped' : t.failed ? 'fail' : 'ok'
    this.onEnd(t)
  }

  push(t, text) {
    const parts = clean(text.replace(/\r\n/g, '\n')).split('\n')
    parts.forEach((part, i) => {
      const seg = part.split('\r').pop()          // a lone \r rewrites the line (spinners, progress)
      t.cur = part.includes('\r') ? seg : t.cur + seg
      if (i < parts.length - 1) { t.lines.push(t.cur); t.cur = '' }
    })
    if (t.lines.length > MAX_LINES) t.lines.splice(0, t.lines.length - MAX_LINES)
  }

  stop(t) {
    if (t.status !== 'running') return
    t.stopped = true
    const c = t.child
    if (!c) return
    this.kill(c)
  }

  kill(c) {
    try {
      if (win) spawn('taskkill', ['/pid', String(c.pid), '/T', '/F'], { windowsHide: true })
      else process.kill(-c.pid, 'SIGTERM')
    } catch { /* already gone */ }
    if (!win) setTimeout(() => { try { process.kill(-c.pid, 'SIGKILL') } catch { /* gone */ } }, 3000).unref()
  }

  close(t) { this.tasks = this.tasks.filter((x) => x !== t) }
  stopAll() { for (const t of this.running) this.stop(t) }
}
