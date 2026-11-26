'use strict'
// Pluffy Studio: Electron main process.
// The CLI (mizumi.js) stays the engine. This app is a skin: a menu GUI, a terminal dock, the Pluffy chat
// and a tatemono editor (Monaco) that takes its language support from the Pluff Tatemono .vsix.
// Engine work (generators, CLI) happens in VS Code; use the VS Code button for that.

const path = require('node:path')

// The Pluffy chat is a separate Electron app that lives in the repo (chat/main.js).
// We start it with this same executable:  <exe> [app] --pluffy-chat <path to chat/main.js>
const chatAt = process.argv.indexOf('--pluffy-chat')
if (chatAt !== -1) require(path.resolve(process.argv[chatAt + 1]))
else startStudio()

function startStudio() {
  const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron')
  const fs = require('node:fs')
  const { spawn } = require('node:child_process')
  const engine = require('./lib/engine')
  const sys = require('./lib/system')
  const { Terms } = require('./lib/terminals')
  const { Tatemono } = require('./lib/tatemono')

  if (!app.requestSingleInstanceLock()) { app.quit(); return }
  app.on('second-instance', () => {
    const w = BrowserWindow.getAllWindows()[0]
    if (w) { if (w.isMinimized()) w.restore(); w.focus() }
  })

  // ---------- settings ----------
  const settingsFile = () => path.join(app.getPath('userData'), 'settings.json')
  const loadSettings = () => { try { return JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) } catch { return {} } }
  const saveSettings = (s) => {
    try { fs.mkdirSync(path.dirname(settingsFile()), { recursive: true }); fs.writeFileSync(settingsFile(), JSON.stringify(s, null, 2)) } catch { /* not fatal */ }
  }
  const settings = loadSettings()

  // ---------- state ----------
  let win = null
  let ROOT = ''
  let readyP = null
  const emit = (evt) => { for (const w of BrowserWindow.getAllWindows()) if (!w.isDestroyed()) w.webContents.send('evt', evt) }
  const terms = new Terms(emit)
  const tm = new Tatemono({ cacheDir: path.join(app.getPath('userData'), 'vsix-cache'), getRoot: () => ROOT, emit })
  const vsixDir = () => path.join(app.getPath('userData'), 'vsix')

  // macOS: the three window buttons belong to the OS, but a hidden title bar can lose them after the
  // window is shown or comes back from full screen. Ask for them again at those moments.
  function keepTrafficLights(w) {
    if (process.platform !== 'darwin') return
    const put = () => { if (w.isDestroyed()) return; try { w.setWindowButtonVisibility(true); w.setWindowButtonPosition({ x: 18, y: 18 }) } catch { /* older Electron */ } }
    for (const ev of ['show', 'focus', 'restore', 'leave-full-screen', 'resize']) w.on(ev, put)
    put()
  }

  function createWindow() {
    const mac = process.platform === 'darwin'
    win = new BrowserWindow({
      width: 1280, height: 820, minWidth: 980, minHeight: 640,
      title: 'Pluffy Studio', backgroundColor: '#f3ebe9', show: false,
      titleBarStyle: mac ? 'hiddenInset' : 'hidden',
      ...(mac ? { trafficLightPosition: { x: 18, y: 18 } } : { titleBarOverlay: { color: '#f3ebe9', symbolColor: '#212121', height: 48 } }),
      webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true },
    })
    keepTrafficLights(win)
    win.once('ready-to-show', () => win.show())
    win.loadFile(path.join(__dirname, 'renderer', 'index.html'))
    win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' } })
    win.webContents.on('will-prevent-unload', (e) => {
      const stay = dialog.showMessageBoxSync(win, { type: 'question', buttons: ['Leave', 'Stay'], defaultId: 1, cancelId: 1, title: 'Unsaved changes', message: 'A tatemono has unsaved changes.', detail: 'Leave anyway and lose them?' })
      if (stay === 0) e.preventDefault()
    })
    win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) e.preventDefault() })
    if (process.env.PLUFFY_DEVTOOLS) win.webContents.openDevTools({ mode: 'detach' })
    win.on('closed', () => { win = null })
  }

  async function boot() {
    ROOT = engine.resolveRoot(app, settings)
    const r = await engine.ensure(ROOT, engine.bundleDir(app), (msg) => emit({ type: 'boot', msg }))
    if (r.error) return { root: ROOT, error: r.error }
    installBuiltinVsix().catch(() => {})                       // quietly, in the background
    return { root: ROOT, synced: !!r.synced }
  }

  async function installBuiltinVsix() {
    const file = sys.builtinVsix(ROOT)
    if (!file || !(await sys.findCode())) return
    const tag = path.basename(file)
    if (settings.builtinInstalled === tag) return
    const r = await sys.installVsix(file)
    if (r.ok) {
      settings.builtinInstalled = tag; saveSettings(settings)
      emit({ type: 'toast', msg: `Installed built-in extension ${tag}` })
    }
  }

  const h = (ch, fn) => ipcMain.handle(ch, async (_e, ...a) => {
    try { return await fn(...a) } catch (err) { return { error: String((err && err.message) || err) } }
  })

  h('engine:ready', () => readyP)
  h('env:check', async () => ({ ...(await sys.envCheck()), engine: engine.info(ROOT) }))
  h('lists:get', () => ({ tatemonos: engine.listTatemonos(ROOT), projects: engine.listProjects(ROOT) }))

  h('term:hasPty', () => terms.hasPty)
  h('term:create', ({ cols, rows } = {}) => terms.create({ cwd: ROOT, cols, rows }))
  h('term:cli', (id, lists) => terms.cli(id, lists))
  h('term:kill', (id) => terms.kill(id))
  ipcMain.on('term:write', (_e, id, data) => terms.write(id, data))
  ipcMain.on('term:resize', (_e, id, c, r) => terms.resize(id, c, r))

  h('open:vscode', () => sys.openVSCode(ROOT))
  h('open:cmd', () => sys.openTerminal(ROOT))
  h('open:folder', async () => { await shell.openPath(ROOT); return { ok: true } })
  h('open:chat', () => {
    const chatMain = path.join(ROOT, 'chat', 'main.js')
    if (!fs.existsSync(chatMain)) return { error: 'chat/main.js was not found in the engine folder.' }
    const args = app.isPackaged ? ['--pluffy-chat', chatMain] : [app.getAppPath(), '--pluffy-chat', chatMain]
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE
    spawn(process.execPath, args, { cwd: ROOT, env, detached: true, stdio: 'ignore' }).unref()
    return { ok: true }
  })

  // ---- tatemono editor (language support comes from the .vsix, see lib/tatemono.js) ----
  h('tm:assets', () => tm.assets())
  h('tm:lint', (a) => tm.lint(a))
  h('tm:outline', (text) => tm.outline(text))
  h('tm:complete', (a) => tm.complete(a))
  h('tm:hover', (a) => tm.hover(a))
  h('tm:catalog', (text) => tm.catalog(text))
  h('tm:candidates', (a) => tm.candidates(a))
  h('tm:plan', (a) => tm.plan(a))
  h('tm:files', (name) => tm.files(name))
  h('tm:read', (name, rel) => tm.read(name, rel))
  h('tm:write', (name, rel, text) => tm.write(name, rel, text))
  h('tm:watch', (name) => tm.watch(name))
  h('tm:reveal', async (name) => { await shell.openPath(tm.dir(name)); return { ok: true } })
  h('tm:vscode', (name, rel) => sys.openVSCodeAt(ROOT, path.join(tm.dir(name), rel || 'core.tsx')))

  h('ext:list', async () => {
    const installed = await sys.installedExtensions()
    const items = []
    const add = (file, kind) => items.push({ file, kind, ...sys.parseVsix(file), installed: sys.isInstalled(installed, file) })
    const b = sys.builtinVsix(ROOT); if (b) add(b, 'built-in')
    try { fs.readdirSync(vsixDir()).filter((f) => f.endsWith('.vsix')).forEach((f) => add(path.join(vsixDir(), f), 'imported')) } catch { /* none yet */ }
    return { hasCode: installed !== null, items }
  })
  h('ext:import', async () => {
    const r = await dialog.showOpenDialog(win, { title: 'Import .vsix', filters: [{ name: 'VS Code extension', extensions: ['vsix'] }], properties: ['openFile', 'multiSelections'] })
    if (r.canceled) return { results: [] }
    fs.mkdirSync(vsixDir(), { recursive: true })
    const results = []
    for (const f of r.filePaths) {
      const dest = path.join(vsixDir(), path.basename(f))
      fs.copyFileSync(f, dest)
      results.push({ file: path.basename(f), ...(await sys.installVsix(dest)) })
    }
    return { results }
  })
  h('ext:install', (file) => sys.installVsix(file))
  h('ext:folder', async () => { fs.mkdirSync(vsixDir(), { recursive: true }); await shell.openPath(vsixDir()); return { ok: true } })

  h('engine:info', () => engine.info(ROOT))
  h('engine:update', async () => {
    const r = await engine.updateFromGitHub(ROOT, (msg) => emit({ type: 'engine:progress', msg }))
    return { ok: true, ...r }
  })
  h('engine:resync', async () => { await engine.forceSync(ROOT, engine.bundleDir(app), (msg) => emit({ type: 'engine:progress', msg })); return { ok: true } })

  app.whenReady().then(() => {
    if (process.platform !== 'darwin') Menu.setApplicationMenu(null)
    createWindow()
    readyP = boot().catch((e) => ({ root: ROOT, error: String(e.message || e) }))
  })
  app.on('window-all-closed', () => app.quit())
  app.on('before-quit', () => { terms.killAll(); tm.stop() })
}
