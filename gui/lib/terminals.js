'use strict'
// Terminal sessions for the dock. A real pty (node-pty) gives you a full interactive shell,
// so mizumi's own menus, colours and Ctrl+C all behave exactly like in a normal terminal.
// If node-pty is missing, commands still run through plain pipes (no interactive shell).

const { spawn } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const { killTree } = require('./system')

let pty = null
try { pty = require('@homebridge/node-pty-prebuilt-multiarch') } catch { pty = null }

const win = process.platform === 'win32'

const safe = win ? /^[\w@%+=:./\\-]+$/ : /^[\w@%+=:./-]+$/
const quote = (a) => {
  a = String(a)
  if (a && safe.test(a)) return a
  return win ? `'${a.replace(/'/g, "''")}'` : `'${a.replace(/'/g, `'\\''`)}'`
}
const cliLine = (args) => ['node mizumi.js', ...args.map(quote)].join(' ')

class Terms {
  constructor(emit) { this.emit = emit; this.map = new Map(); this.n = 0 }

  get hasPty() { return !!pty }

  env() {
    const e = { ...process.env, FORCE_COLOR: '1', TERM: 'xterm-256color', PLUFFY_STUDIO: '1' }
    delete e.ELECTRON_RUN_AS_NODE
    return e
  }

  create({ cwd, cols = 100, rows = 24, log = false }) {
    const id = 't' + ++this.n
    if (!fs.existsSync(cwd || '')) cwd = os.homedir()          // the engine folder may be gone (after Uninstall)
    if (log) {
      this.map.set(id, { kind: 'log', cwd })                   // a tab that only shows text (repo commands)
    } else if (pty) {
      const shell = win ? 'powershell.exe' : process.env.SHELL || '/bin/bash'
      const p = pty.spawn(shell, win ? ['-NoLogo'] : [], { name: 'xterm-256color', cols, rows, cwd, env: this.env() })
      p.onData((data) => this.emit({ type: 'term:data', id, data }))
      p.onExit(({ exitCode }) => { this.map.delete(id); this.emit({ type: 'term:exit', id, code: exitCode }) })
      this.map.set(id, { kind: 'pty', p, cwd })
    } else {
      this.map.set(id, { kind: 'pipe', child: null, buf: '', cwd })
      this.emit({ type: 'term:data', id, data: '\x1b[33mInteractive shell needs node-pty. Run "npm rebuild" in gui/.\x1b[0m\r\nGUI commands still work and show up here.\r\n' })
    }
    return id
  }

  write(id, data) {
    const t = this.map.get(id)
    if (!t) return
    if (t.kind === 'pty') return t.p.write(data)
    if (t.kind === 'log') return
    if (data === '\x03') return this.interrupt(t)
    for (const ch of data) {                                   // tiny line editor for pipe mode
      if (ch === '\r') { this.emit({ type: 'term:data', id, data: '\r\n' }); if (t.child) t.child.stdin.write(t.buf + '\n'); t.buf = '' }
      else if (ch === '\x7f') { if (t.buf) { t.buf = t.buf.slice(0, -1); this.emit({ type: 'term:data', id, data: '\b \b' }) } }
      else if (ch >= ' ') { t.buf += ch; this.emit({ type: 'term:data', id, data: ch }) }
    }
  }

  interrupt(t) { if (t.child) killTree(t.child.pid) }

  resize(id, cols, rows) {
    const t = this.map.get(id)
    if (t && t.kind === 'pty') { try { t.p.resize(Math.max(cols, 2), Math.max(rows, 2)) } catch { /* closed */ } }
  }

  // lists = [[args], [args], ...]  ->  runs `node mizumi.js ...args` for each, one after another
  cli(id, lists) {
    const t = this.map.get(id)
    if (!t) return
    if (t.kind === 'pty') return t.p.write(lists.map(cliLine).join(' ; ') + '\r')
    if (t.kind === 'log') return
    this.runPipe(id, t, lists.slice())
  }

  runPipe(id, t, queue) {
    const args = queue.shift()
    if (!args) return
    this.emit({ type: 'term:data', id, data: `\x1b[35m$ ${cliLine(args)}\x1b[0m\r\n` })
    const child = spawn('node', ['mizumi.js', ...args], { cwd: t.cwd, env: this.env(), shell: win, windowsHide: true, detached: !win })
    t.child = child
    const out = (d) => this.emit({ type: 'term:data', id, data: String(d).replace(/\r?\n/g, '\r\n') })
    child.stdout.on('data', out); child.stderr.on('data', out)
    child.on('error', (e) => out(`Could not start node: ${e.message}\n`))
    child.on('exit', (code) => { t.child = null; out(`\x1b[90m[exit ${code}]\x1b[0m\n`); this.runPipe(id, t, queue) })
  }

  kill(id) {
    const t = this.map.get(id)
    if (!t) return
    if (t.kind === 'pty') { try { killTree(t.p.pid); t.p.kill() } catch { /* gone */ } } else this.interrupt(t)
    this.map.delete(id)
  }

  killAll(except) { for (const id of [...this.map.keys()]) if (id !== except) this.kill(id) }
}

module.exports = { Terms, cliLine }
