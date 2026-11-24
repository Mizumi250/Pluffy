'use strict'
// The in-app editor is the real VS Code, served locally by VS Code's own `code serve-web`
// and shown in an iframe. That is the only way .vsix extensions can actually run inside the app
// (they need VS Code's extension host). Needs VS Code installed, with the `code` command on PATH.
//
// The first start downloads the VS Code server (a minute or so); later starts are quick.

const net = require('node:net')
const { spawn } = require('node:child_process')
const { findCode, killTree, win } = require('./system')

const freePort = () => new Promise((resolve, reject) => {
  const s = net.createServer()
  s.once('error', reject)
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)) })
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// VS Code's web workbench wants a URI path: /home/me/Pluffy  or  /C:/Users/me/Pluffy
const folderParam = (root) => (win ? '/' + root.replace(/\\/g, '/') : root)

class Editor {
  constructor(emit) { this.emit = emit; this.proc = null; this.port = 0; this.starting = null; this.tail = [] }

  url(root) {
    return `http://127.0.0.1:${this.port}/?${new URLSearchParams({ folder: folderParam(root) })}`
  }

  start(root) {
    if (this.port && this.proc) return Promise.resolve({ url: this.url(root) })
    if (!this.starting) this.starting = this.boot(root).finally(() => { this.starting = null })
    return this.starting
  }

  log(line) {
    line = String(line).trim()
    if (!line) return
    this.tail.push(line); if (this.tail.length > 12) this.tail.shift()
    this.emit({ type: 'editor:log', line })
  }

  async boot(root) {
    const code = await findCode()
    if (!code) throw new Error('VS Code was not found. Install it from https://code.visualstudio.com and make sure the "code" command works in a terminal.')
    const port = await freePort()
    this.tail = []
    this.log('Starting VS Code (first run downloads the server) ...')
    const args = ['serve-web', '--host', '127.0.0.1', '--port', String(port), '--without-connection-token', '--accept-server-license-terms']
    const proc = spawn(win ? `"${code}"` : code, args, { shell: win, detached: !win, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    let exited = false
    proc.stdout.on('data', (d) => String(d).split(/\r?\n/).forEach((l) => this.log(l)))
    proc.stderr.on('data', (d) => String(d).split(/\r?\n/).forEach((l) => this.log(l)))
    proc.on('exit', () => { exited = true; if (this.proc === proc) { this.proc = null; this.port = 0; this.emit({ type: 'editor:exit' }) } })
    proc.on('error', (e) => this.log(e.message))
    this.proc = proc

    const deadline = Date.now() + 180000
    while (Date.now() < deadline) {
      if (exited) throw new Error('VS Code stopped before it was ready.\n' + this.tail.join('\n'))
      try {
        const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 1500)
        const r = await fetch(`http://127.0.0.1:${port}/`, { signal: ac.signal, redirect: 'manual' }); clearTimeout(t)
        if (r.status < 500) { this.port = port; return { url: this.url(root) } }
      } catch { /* not listening yet */ }
      await sleep(700)
    }
    this.stop()
    throw new Error('VS Code took too long to start.\n' + this.tail.join('\n'))
  }

  stop() {
    if (this.proc) killTree(this.proc.pid)
    this.proc = null; this.port = 0
  }
}

module.exports = { Editor }
