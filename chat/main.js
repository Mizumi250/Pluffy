'use strict'
// Pluffy chat: Electron main process.
// Run from the repo root with:  node chat.js   (or: node mizumi.js chat)

const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme, safeStorage } = require('electron')
const path = require('node:path')
const { spawn, execFile } = require('node:child_process')
const { openDb } = require('./db')
const { parseCommand, listCommands } = require('./commands')
const lib = require('./lib')
const agent = require('./agent')
const toolsLib = require('./tools')
const ais = require('./ais')

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

  // ---------- your list of AIs ----------
  const decKey = (v) => {
    if (!v) return ''
    if (v.startsWith('enc:')) { try { return safeStorage.decryptString(Buffer.from(v.slice(4), 'base64')) } catch { return '' } }
    return ''
  }
  const encKey = (plain) => {
    if (!plain) return ''
    if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure storage is not available on this computer, so I cannot save an API key. Set it as an environment variable instead (GEMINI_API_KEY for Gemini).')
    return 'enc:' + safeStorage.encryptString(String(plain).trim().slice(0, 400)).toString('base64')
  }

  // The list lives in the settings table. The first time, it is built from the old fixed fields.
  function loadAis() {
    const st = db.getSettings()
    let list = []
    try { list = JSON.parse(st.ais || '[]') } catch { list = [] }
    if (!Array.isArray(list) || !list.length) {
      const m = ais.migrate(st, (k) => { try { return encKey(k) } catch { return '' } })
      db.setSettings({ ais: JSON.stringify(m.list), activeAi: m.active })
      return m.list
    }
    return list
  }
  const keyFor = (a) => decKey(a.key) || (a.kind === 'gemini' ? process.env.GEMINI_API_KEY || '' : '')
  const needsKey = (a) => !!(ais.KINDS[a.kind] && ais.KINDS[a.kind].needsKey)
  function activeAi() { const list = loadAis(); return list.find((a) => a.id === db.getSettings().activeAi) || list[0] }
  const trainedAi = () => loadAis().find((a) => a.trained) || null
  // the renderer never gets a key, only whether one is saved
  function aisForRenderer() {
    const act = activeAi()
    return {
      kinds: ais.KINDS, active: act ? act.id : '',
      list: loadAis().map((a) => ({ id: a.id, name: a.name, kind: a.kind, baseUrl: a.baseUrl, model: a.model, trained: !!a.trained, keySet: !!keyFor(a) })),
    }
  }
  // the trained Pluff model, in the shapes the /ai command and the generate_block tool expect
  const trainedSettings = () => { const t = trainedAi(); return t ? { server: ais.serverOrigin(t.baseUrl), model: t.model, key: keyFor(t) } : { server: '', model: '', key: '' } }
  const trainedForTools = () => { const t = trainedAi(); return t ? { name: t.name, baseUrl: t.baseUrl, server: ais.serverOrigin(t.baseUrl), model: t.model, key: keyFor(t) } : null }
  function buildProvider(a) {
    const key = keyFor(a)
    if (needsKey(a) && !key) throw new Error(`${a.name} has no API key yet. Open Settings and add it.`)
    return ais.toProvider(a, key)
  }

  // Every file change and command goes through here. Default button is Decline.
  async function confirmAction({ title, message, detail }) {
    const r = await dialog.showMessageBox(win, {
      type: 'question', buttons: ['Approve', 'Decline'], defaultId: 1, cancelId: 1, noLink: true,
      title: title || 'Confirm', message: String(message || 'Approve this action?').slice(0, 300),
      detail: String(detail || '').slice(0, 2200),
    })
    return r.response === 0
  }

  // ---------- chat ----------
  async function runAgentChat(sessionId) {
    const ai = activeAi()
    let provider
    try {
      if (!ai) throw new Error('no AI is set up yet. Open Settings and add one.')
      provider = buildProvider(ai)
    } catch (err) { return notice(sessionId, `Master Mizumi, ${err.message}`, { error: true }) }

    // earlier turns as plain text; drop the bulky diffs we attached to old replies
    const history = db.getTextMessages(sessionId).map((m) => ({ ...m, content: m.content.replace(/```diff[\s\S]*?```/g, '[diff omitted]') }))
    const placeholder = db.addMessage(sessionId, 'assistant', 'text', '')
    emit({ type: 'assistant:start', message: placeholder })

    const job = { ac: new AbortController(), stopped: false }
    chatJobs.set(sessionId, job)
    const actions = []
    const report = (line) => {
      actions.push(line)
      const first = String(line).split('\n')[0].slice(0, 160)
      emit({ type: 'assistant:token', sessionId, id: placeholder.id, delta: first + '\n' })
    }
    const tools = toolsLib.createTools({
      root: ROOT,
      confirm: confirmAction,
      runCommand: (parsed) => runProcess(sessionId, parsed),
      getColab: trainedForTools,
    })

    let text = ''
    let error = null
    try {
      const r = await agent.runAgent({ root: ROOT, provider, tools, history, signal: job.ac.signal, report })
      text = r.text
    } catch (err) {
      if (err.name === 'AbortError') text = '(stopped)'
      else error = err.message
    }
    if (chatJobs.get(sessionId) !== job) return          // session was deleted meanwhile
    chatJobs.delete(sessionId)

    // the working bubble goes away; the final answer is added last so it sits under any terminal cards
    db.deleteMessage(placeholder.id)
    emit({ type: 'assistant:remove', sessionId, id: placeholder.id })
    if (!text && !actions.length) { if (error) notice(sessionId, `Master Mizumi, ${error}`, { error: true }); return }
    const answer = lib.applyGuardrail(text || (error ? 'I could not finish.' : 'Done.'))
    const final = answer + (actions.length ? '\n\nActions:\n' + actions.join('\n') : '')
    const m = db.addMessage(sessionId, 'assistant', 'text', final, error ? { error: true } : null)
    emit({ type: 'message', message: m })
    if (error) notice(sessionId, `Master Mizumi, ${error}`, { error: true })
  }

  async function runChat(sessionId) {
    const ai = activeAi()
    if (!ai) return notice(sessionId, 'Master Mizumi, no AI is set up yet. Open Settings and add one.', { error: true })
    const key = keyFor(ai)
    if (needsKey(ai) && !key) return notice(sessionId, `Master Mizumi, ${ai.name} has no API key yet. Open Settings and add it.`, { error: true })
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
        baseUrl: ai.baseUrl, model: ai.model, key, messages: ctx, signal: job.ac.signal,
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
  async function undoLast(sessionId) {
    const entry = toolsLib.lastUndoable(ROOT)
    if (!entry) return notice(sessionId, 'Master Mizumi, there is nothing to undo.')
    const what = entry.action === 'create' ? `remove the file the AI created: ${entry.rel}`
      : entry.action === 'delete' ? `bring back ${entry.rel}`
      : `restore ${entry.rel} to how it was before the AI changed it`
    const r = await dialog.showMessageBox(win, { type: 'question', buttons: ['Undo', 'Cancel'], defaultId: 1, cancelId: 1, noLink: true, title: 'Undo', message: `Undo the last AI change?`, detail: `This will ${what}.` })
    if (r.response !== 0) return notice(sessionId, 'Cancelled.')
    try { toolsLib.undoEntry(ROOT, entry); notice(sessionId, `Master Mizumi, done. I ${what}.`) } catch (err) { notice(sessionId, `Master Mizumi, I could not undo that: ${err.message}`, { error: true }) }
  }

  async function runSlash(sessionId, text) {
    if (/^\/undo\s*$/i.test(text.trim())) return undoLast(sessionId)
    const parsed = parseCommand(text, { root: ROOT, settings: trainedSettings() })
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
    let resolveDone
    const done = new Promise((r) => { resolveDone = r })   // lets the AI wait for a command to finish

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
      resolveDone({ code, out, stopped: job.stopped })
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
    return done
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
  // only the "can edit files" switch is a plain setting now; everything else is the AI list
  ipcMain.handle('settings:get', guard(() => ({ agent: db.getSettings().agent })))
  ipcMain.handle('settings:set', guard((_e, v) => {
    if (v && (v.agent === 'on' || v.agent === 'off')) db.setSettings({ agent: v.agent })
    return { ok: true, settings: { agent: db.getSettings().agent } }
  }))

  ipcMain.handle('ais:get', guard(() => aisForRenderer()))
  ipcMain.handle('ais:select', guard((_e, id) => {
    const a = loadAis().find((x) => x.id === id)
    if (!a) return { ok: false, error: 'That AI does not exist.' }
    if (needsKey(a) && !keyFor(a)) return { ok: false, error: `${a.name} has no API key yet.` }
    db.setSettings({ activeAi: a.id })
    return { ok: true, ...aisForRenderer() }
  }))
  ipcMain.handle('ais:save', guard((_e, payload) => {
    const incoming = payload && payload.list
    let clean
    try { clean = ais.validateList(incoming) } catch (e) { return { ok: false, error: e.message } }
    const old = loadAis()
    try {
      // a typed key replaces the saved one; an empty box keeps what was saved for that AI
      clean = clean.map((a, i) => {
        const typed = String((incoming[i] && incoming[i].key) || '').trim()
        const prev = old.find((o) => o.id === a.id)
        return { ...a, key: typed ? encKey(typed) : (prev ? prev.key : '') }
      })
    } catch (e) { return { ok: false, error: e.message } }
    const cur = db.getSettings().activeAi
    const want = payload && payload.active
    const active = clean.some((a) => a.id === want) ? want : (clean.some((a) => a.id === cur) ? cur : clean[0].id)
    db.setSettings({ ais: JSON.stringify(clean), activeAi: active })
    return { ok: true, ...aisForRenderer() }
  }))
  // Test button: checks exactly what is typed in that AI's card, without saving it
  ipcMain.handle('ais:test', guard(async (_e, d) => {
    d = d || {}
    const kind = ais.KINDS[d.kind] ? d.kind : 'custom'
    let baseUrl
    try { baseUrl = ais.normalizeBase(kind, d.baseUrl) } catch (e) { return { ok: false, message: e.message } }
    const prev = loadAis().find((a) => a.id === d.id)
    const typed = String(d.key || '').trim()
    const key = typed || (prev ? keyFor(prev) : (kind === 'gemini' ? process.env.GEMINI_API_KEY || '' : ''))
    if (ais.KINDS[kind].needsKey && !key) return { ok: false, message: 'Enter an API key first.' }
    return lib.testEndpoint({ baseUrl, key, model: String(d.model || '').trim() })
  }))
  // status dot: servers you run yourself are pinged; hosted ones only need a saved key (no polling Google every 20s)
  ipcMain.handle('server:health', guard(async () => {
    const a = activeAi()
    if (!a) return { ok: false, error: 'No AI is set up.' }
    if (needsKey(a)) return keyFor(a) ? { ok: true, checked: false } : { ok: false, error: 'No API key yet.' }
    const r = await lib.testEndpoint({ baseUrl: a.baseUrl, key: keyFor(a), model: a.model, timeoutMs: 6000 })
    return { ok: r.ok, error: r.ok ? '' : r.message, checked: true }
  }))

  ipcMain.handle('chat:send', guard((_e, sessionId, text) => {
    text = String(text || '').trim()
    if (!isId(sessionId) || !text) return { ok: false, error: 'Nothing to send.' }
    if (text.length > 8000) return { ok: false, error: 'That message is too long (8000 characters max).' }
    const slash = text.startsWith('/')
    if (!slash && chatJobs.has(sessionId)) return { ok: false, error: 'Wait for the current reply, or press stop.' }
    const message = db.addMessage(sessionId, 'user', slash ? 'command' : 'text', text)
    db.autoTitle(sessionId, text)
    setImmediate(() => {
      const p = slash ? runSlash(sessionId, text) : (db.getSettings().agent === 'on' ? runAgentChat(sessionId) : runChat(sessionId))
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