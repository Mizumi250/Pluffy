'use strict'
// Pluffy chat: Electron main process.
// Run from the repo root with:  node chat.js   (or: node mizumi.js chat)

const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron')
const path = require('node:path')
const { spawn, execFile } = require('node:child_process')
const { openDb } = require('./db')
const { parseCommand, listCommands } = require('./commands')
const lib = require('./lib')

const ROOT = path.resolve(__dirname, '..')           // the Pluffy repo root (next to mizumi.js)
app.setPath('userData', path.join(app.getPath('appData'), 'pluffy-chat'))

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  main()
}

function main() {
  let win = null
  let db = null
  const chatJobs = new Map()    // sessionId -> { ac, stopped }
  const terms = new Map()       // message id -> { child, sessionId, stopped }

  const emit = (evt) => {
    for (const w of BrowserWindow.getAllWindows()) if (!w.isDestroyed()) w.webContents.send('evt', evt)
  }

  // ---------- window ----------
  function createWindow() {
    const mac = process.platform === 'darwin'
    win = new BrowserWindow({
      width: 1100, height: 720, minWidth: 760, minHeight: 520,
      title: 'Pluffy',
      backgroundColor: nativeTheme.shouldUseDarkColors ? '#1c1c1e' : '#ffffff',
      autoHideMenuBar: true,
      ...(mac ? { titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 18, y: 18 } } : {}),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true, nodeIntegration: false, sandbox: true,
      },
    })
    win.loadFile(path.join(__dirname, 'renderer', 'index.html'))
    win.webContents.on('will-navigate', (e) => e.preventDefault())
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (/^https?:\/\//i.test(url)) shell.openExternal(url)
      return { action: 'deny' }
    })
    win.on('closed', () => { win = null })
  }

  // ---------- process helpers ----------
  function killTree(child) {
    if (!child || child.killed || child.exitCode !== null) return
    try {
      if (process.platform === 'win32') execFile('taskkill', ['/pid', String(child.pid), '/T', '/F'], () => {})
      else { try { process.kill(-child.pid, 'SIGTERM') } catch { child.kill('SIGTERM') } }
    } catch { /* already gone */ }
  }
  function stopSessionJobs(sessionId) {
    const c = chatJobs.get(sessionId)
    if (c) { c.ac.abort(); chatJobs.delete(sessionId) }
    for (const [, t] of terms) if (t.sessionId === sessionId) { t.stopped = true; killTree(t.child) }
  }

  // ---------- notices ----------
  function notice(sessionId, text, meta) {
    const m = db.addMessage(sessionId, 'assistant', 'notice', text, meta || null)
    emit({ type: 'message', message: m })
  }

  // ---------- chat ----------
  async function runChat(sessionId) {
    const s = db.getSettings()
    const system = lib.systemPrompt(ROOT)
    const ctx = lib.buildContext(db.getTextMessages(sessionId), system)
    const placeholder = db.addMessage(sessionId, 'assistant', 'text', '')
    emit({ type: 'assistant:start', message: placeholder })

    const job = { ac: new AbortController(), stopped: false }
    chatJobs.set(sessionId, job)
    let full = ''
    let error = null
    try {
      await lib.streamChat({
        server: s.server, model: s.model, key: s.key, messages: ctx, signal: job.ac.signal,
        onToken: (d) => { full += d; emit({ type: 'assistant:token', sessionId, id: placeholder.id, delta: d }) },
      })
    } catch (err) {
      if (err.name !== 'AbortError') error = err.message
    }
    if (chatJobs.get(sessionId) !== job) {            // session was deleted while streaming
      return
    }
    chatJobs.delete(sessionId)

    full = full.replace(/<\|im_end\|>|<\|endoftext\|>/g, '')
    if (!full.trim()) {
      db.deleteMessage(placeholder.id)
      emit({ type: 'assistant:remove', sessionId, id: placeholder.id })
      if (error) notice(sessionId, `Master Mizumi, ${error}`, { error: true })
      return
    }
    const finalText = lib.applyGuardrail(full)
    db.updateMessage(placeholder.id, finalText, error ? { error: true } : null)
    emit({ type: 'assistant:done', sessionId, id: placeholder.id, content: finalText })
    if (error) notice(sessionId, `Master Mizumi, the reply stopped early. ${error}`, { error: true })
  }

  // ---------- slash commands -> node mizumi.js ----------
  async function runSlash(sessionId, text) {
    const parsed = parseCommand(text, { root: ROOT, settings: db.getSettings() })
    if (parsed.local) return notice(sessionId, parsed.text)
    if (!parsed.ok) return notice(sessionId, `Master Mizumi, ${parsed.error}`)
    if (parsed.confirm) {
      const r = await dialog.showMessageBox(win, {
        type: 'question', buttons: ['Run', 'Cancel'], defaultId: 1, cancelId: 1,
        title: 'Confirm', message: parsed.confirm, detail: parsed.display,
      })
      if (r.response !== 0) return notice(sessionId, 'Cancelled.')
    }
    runProcess(sessionId, parsed)
  }

  function runProcess(sessionId, parsed) {
    const msg = db.addMessage(sessionId, 'assistant', 'terminal', '', { cmd: parsed.display, running: true })
    emit({ type: 'message', message: msg })
    const job = { child: null, sessionId, stopped: false }
    terms.set(msg.id, job)
    const progress = new lib.ProgressParser()
    let out = ''
    let finished = false

    const finish = (code, signal) => {
      if (finished) return
      finished = true
      terms.delete(msg.id)
      const meta = {
        cmd: parsed.display, running: false, code, signal: signal || null, stopped: job.stopped,
        progress: progress.seen ? progress.snapshot() : null,
      }
      try { db.updateMessage(msg.id, out, meta) } catch { /* session deleted */ }
      emit({ type: 'term:end', sessionId, id: msg.id, meta })
    }
    const onData = (chunk) => {
      const text = lib.stripAnsi(chunk)
      out = lib.cap(out + text)
      emit({ type: 'term:data', sessionId, id: msg.id, text })
      if (progress.push(text)) emit({ type: 'term:progress', sessionId, id: msg.id, progress: progress.snapshot() })
    }
    const launch = (useElectronAsNode) => {
      const env = { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' }
      delete env.ELECTRON_RUN_AS_NODE
      if (useElectronAsNode) env.ELECTRON_RUN_AS_NODE = '1'
      let superseded = false
      const child = spawn(useElectronAsNode ? process.execPath : 'node', ['mizumi.js', ...parsed.args], {
        cwd: ROOT, env, detached: process.platform !== 'win32', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      })
      job.child = child
      child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8')
      child.stdout.on('data', onData); child.stderr.on('data', onData)
      child.on('error', (err) => {
        if (err.code === 'ENOENT' && !useElectronAsNode) { superseded = true; launch(true) }
        else { onData(`\n${err.message}\n`); finish(1, null) }
      })
      child.on('close', (code, signal) => { if (!superseded) finish(code, signal) })
    }
    launch(false)     // system Node first; falls back to Electron's own Node if `node` is not on PATH
  }

  // ---------- IPC ----------
  const isId = (v) => Number.isInteger(v) && v > 0
  const guard = (fn) => async (...a) => { try { return await fn(...a) } catch (err) { return { ok: false, error: String(err.message || err) } } }

  ipcMain.handle('sessions:list', guard((_e, q) => db.listSessions(typeof q === 'string' ? q : '')))
  ipcMain.handle('sessions:create', guard(() => db.createSession()))
  ipcMain.handle('sessions:rename', guard((_e, id, title) => (isId(id) ? db.renameSession(id, title) : null)))
  ipcMain.handle('sessions:delete', guard((_e, id) => {
    if (!isId(id)) return { ok: false }
    stopSessionJobs(id)
    db.deleteSession(id)
    return { ok: true }
  }))
  ipcMain.handle('messages:get', guard((_e, id) => (isId(id) ? db.getMessages(id) : [])))
  ipcMain.handle('commands:list', () => listCommands())
  ipcMain.handle('settings:get', guard(() => db.getSettings()))
  ipcMain.handle('settings:set', guard((_e, s) => {
    const out = {}
    if (s && typeof s === 'object') {
      if (typeof s.server === 'string') {
        let u
        try { u = new URL(s.server.trim()) } catch { return { ok: false, error: 'The server URL is not valid.' } }
        if (!/^https?:$/.test(u.protocol)) return { ok: false, error: 'The server URL must start with http:// or https://' }
        out.server = u.origin + u.pathname.replace(/\/+$/, '')
      }
      if (typeof s.model === 'string') {
        const m = s.model.trim()
        if (!m || m.length > 100) return { ok: false, error: 'Enter a model name (for example pluffy-v11).' }
        out.model = m
      }
      if (typeof s.key === 'string') out.key = s.key.trim().slice(0, 300)
    }
    return { ok: true, settings: db.setSettings(out) }
  }))
  ipcMain.handle('server:health', guard(() => lib.checkHealth(db.getSettings())))

  ipcMain.handle('chat:send', guard((_e, sessionId, text) => {
    text = String(text || '').trim()
    if (!isId(sessionId) || !text) return { ok: false, error: 'Nothing to send.' }
    if (text.length > 8000) return { ok: false, error: 'That message is too long (8000 characters max).' }
    const slash = text.startsWith('/')
    if (!slash && chatJobs.has(sessionId)) return { ok: false, error: 'Wait for the current reply, or press stop.' }
    const message = db.addMessage(sessionId, 'user', slash ? 'command' : 'text', text)
    db.autoTitle(sessionId, text)
    setImmediate(() => {
      const p = slash ? runSlash(sessionId, text) : runChat(sessionId)
      p.catch((err) => notice(sessionId, `Master Mizumi, something went wrong: ${err.message}`, { error: true }))
    })
    return { ok: true, message }
  }))
  ipcMain.handle('chat:stop', guard((_e, sessionId) => {
    const j = chatJobs.get(sessionId)
    if (j) { j.stopped = true; j.ac.abort() }
    return { ok: true }
  }))
  ipcMain.handle('term:stop', guard((_e, id) => {
    const t = terms.get(id)
    if (t) { t.stopped = true; killTree(t.child) }
    return { ok: true }
  }))

  // ---------- lifecycle ----------
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus() } })
  app.on('before-quit', () => { for (const [, t] of terms) killTree(t.child) })
  app.on('window-all-closed', () => { app.quit() })
  app.on('activate', () => { if (!win && db) createWindow() })

  app.whenReady().then(() => {
    db = openDb(path.join(app.getPath('userData'), 'pluffy-chat.sqlite'))
    createWindow()
  }).catch((err) => {
    dialog.showErrorBox('Pluffy chat could not start', String(err.message || err))
    app.quit()
  })
}