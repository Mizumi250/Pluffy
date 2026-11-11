import path from 'node:path'
import { fileURLToPath } from 'node:url'
import electron, { app, BrowserWindow, ipcMain } from 'electron'
import { loadDesktopWindowOptions } from './desktop-config.js'
import { discoverFrames, loadFrameModules, mergeWindowOptions, runFrameSetups } from './frames.js'

const PRELOAD_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'preload.cjs')

const DEV_URL = process.env.DESKTOP_DEV_URL || 'http://localhost:3000'

let mainWindow
let frameRuntime = null

// @arkzen:desktop:frame:electron — empty (and inert) unless a Tatemono declares one.
async function prepareFrames() {
  try {
    return await loadFrameModules(discoverFrames())
  } catch (error) {
    console.warn('[Electron] Could not load desktop frames:', error instanceof Error ? error.message : error)
    return []
  }
}

async function waitForUrl(url, timeoutMs = 90000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'manual' })
      if (res.status < 500) return
    } catch {
      // Web stack is still booting
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

async function createWindow() {
  await waitForUrl(DEV_URL)

  const frames = await prepareFrames()

  mainWindow = new BrowserWindow({
    ...loadDesktopWindowOptions(),
    ...mergeWindowOptions(frames),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // The bridge is only attached when a frame exists, so existing apps are unchanged.
      ...(frames.length > 0 ? { preload: PRELOAD_PATH } : {}),
    },
  })

  await mainWindow.loadURL(DEV_URL)

  if (frames.length > 0) {
    frameRuntime = await runFrameSetups(frames, { electron, app, win: mainWindow, ipcMain })
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    frameRuntime?.dispose()
    frameRuntime = null
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow().catch((err) => {
    console.error('[Electron] Failed to open desktop window:', err)
    app.quit()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow().catch((err) => {
      console.error('[Electron] Failed to reopen desktop window:', err)
    })
  }
})
