// ============================================================
// ARKZEN ELECTRON — FRAME LOADER v1.0
//
// Reads @arkzen:desktop:frame:electron blocks from the active Tatemonos'
// core.tsx files and runs them in the Electron main process.
//
// A frame body is plain JavaScript (ESM). It may export:
//   windowOptions  — object merged into the BrowserWindow options
//                    (webPreferences is ignored: the shell keeps
//                    contextIsolation on and nodeIntegration off)
//   setup(ctx)     — runs once the web app has loaded (a default-exported
//                    function works too). May return a teardown function.
//
// ctx = { electron, app, win, ipcMain, tatemono, command(id, payload),
//         onEvent(channel, handler) }
//   command  → sends a command id to the web app    (window.arkzenHost.onCommand)
//   onEvent  → listens for web → host events         (window.arkzenHost.emit)
//
// Opt-in: with no frame block anywhere, discoverFrames() returns [] and the
// shell behaves exactly as it did before (no preload, no extra options).
//
// This module is pure Node (no `electron` import) so it can be tested alone.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE          = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT  = path.resolve(HERE, '..', '..', '..', '..')
const FRAMES_OUTDIR = path.join(HERE, 'generated', 'frames')

const OPEN_TAG  = '/* @arkzen:desktop:frame:electron'
const CLOSE_TAG = '/* @arkzen:desktop:frame:electron:end */'
const MARKER    = '// ARKZEN GENERATED FRAME — @arkzen:desktop:frame:electron'

/** Returns the frame body from a tatemono source, or null when it declares none. */
export function extractElectronFrame(source) {
  const start = source.indexOf(OPEN_TAG)
  if (start === -1) return null
  const openingEnd = source.indexOf('*/', start)
  if (openingEnd === -1) return null
  const end = source.indexOf(CLOSE_TAG, openingEnd)
  if (end === -1) return null
  const body = source.slice(openingEnd + 2, end).trim()
  return body.length > 0 ? body : null
}

function readRegistry(projectRoot) {
  const registryPath = path.join(projectRoot, 'arkzen.json')
  if (!fs.existsSync(registryPath)) return null
  return JSON.parse(fs.readFileSync(registryPath, 'utf8').replace(/^﻿/, ''))
}

/**
 * Finds active Tatemonos that declare an Electron frame and writes each body to
 * generated/frames/{name}.frame.mjs. Returns [{ name, file }] (alphabetical).
 * If arkzen.json sets "desktopPrimary", only that Tatemono's frame is used.
 */
export function discoverFrames({
  projectRoot = PROJECT_ROOT,
  outDir      = FRAMES_OUTDIR,
  warn        = console.warn,
} = {}) {
  const registry = readRegistry(projectRoot)
  const modules  = Array.isArray(registry?.modules) ? registry.modules : []

  const found = []
  for (const module of modules) {
    if (module.status !== 'active' || typeof module.name !== 'string') continue
    const candidates = [
      module.filePath && path.join(projectRoot, module.filePath),
      path.join(projectRoot, 'tatemonos', module.name, 'core.tsx'),
    ].filter(Boolean)
    const sourcePath = candidates.find(candidate => fs.existsSync(candidate))
    if (!sourcePath) continue
    const body = extractElectronFrame(fs.readFileSync(sourcePath, 'utf8'))
    if (body) found.push({ name: module.name, body })
  }
  found.sort((a, b) => a.name.localeCompare(b.name, 'en'))

  let selected = found
  const primary = registry?.desktopPrimary
  if (typeof primary === 'string' && primary) {
    selected = found.filter(frame => frame.name === primary)
    if (selected.length === 0 && found.length > 0) {
      warn(`[Electron] desktopPrimary "${primary}" has no @arkzen:desktop:frame:electron block; no frame will run.`)
    }
  } else if (found.length > 1) {
    warn(
      `[Electron] Several Tatemonos declare @arkzen:desktop:frame:electron (${found.map(f => f.name).join(', ')}); ` +
      `all run in alphabetical order, so later menus override earlier ones. ` +
      `Set "desktopPrimary" in arkzen.json to choose one.`
    )
  }

  // Remove frame files we generated earlier that no longer apply.
  if (fs.existsSync(outDir)) {
    const keep = new Set(selected.map(frame => `${frame.name}.frame.mjs`))
    for (const entry of fs.readdirSync(outDir)) {
      if (!entry.endsWith('.frame.mjs') || keep.has(entry)) continue
      const stale = path.join(outDir, entry)
      if (fs.readFileSync(stale, 'utf8').startsWith(MARKER)) fs.unlinkSync(stale)
    }
  }

  if (selected.length === 0) return []
  fs.mkdirSync(outDir, { recursive: true })
  return selected.map(frame => {
    const file = path.join(outDir, `${frame.name}.frame.mjs`)
    fs.writeFileSync(
      file,
      `${MARKER}\n// Source: tatemonos/${frame.name}/core.tsx — edit the DSL block, not this file.\n\n${frame.body}\n`,
      'utf8',
    )
    return { name: frame.name, file }
  })
}

/** Imports each discovered frame file. */
export async function loadFrameModules(frames) {
  const loaded = []
  for (const { name, file } of frames) {
    loaded.push({ name, mod: await import(pathToFileURL(file).href) })
  }
  return loaded
}

/** Merges every frame's `windowOptions`; webPreferences is deliberately dropped. */
export function mergeWindowOptions(loaded) {
  const merged = {}
  for (const { mod } of loaded) {
    if (mod.windowOptions && typeof mod.windowOptions === 'object') {
      const { webPreferences: _ignored, ...rest } = mod.windowOptions
      Object.assign(merged, rest)
    }
  }
  return merged
}

/**
 * Runs each frame's setup(ctx). Returns { dispose() } which stops listeners
 * registered through ctx.onEvent and runs any teardown the frames returned.
 */
export async function runFrameSetups(loaded, { electron, app, win, ipcMain, warn = console.warn }) {
  const disposers = []

  for (const { name, mod } of loaded) {
    const setup = typeof mod.setup === 'function'
      ? mod.setup
      : (typeof mod.default === 'function' ? mod.default : null)
    if (!setup) continue

    const ctx = {
      electron,
      app,
      win,
      ipcMain,
      tatemono: name,
      command(id, payload) {
        if (!win.isDestroyed()) win.webContents.send('arkzen:command', id, payload)
      },
      onEvent(channel, handler) {
        const listener = (_event, message) => {
          if (message && message.channel === channel) handler(message.payload)
        }
        ipcMain.on('arkzen:event', listener)
        const stop = () => ipcMain.removeListener('arkzen:event', listener)
        disposers.push(stop)
        return stop
      },
    }

    try {
      const teardown = await setup(ctx)
      if (typeof teardown === 'function') disposers.push(teardown)
    } catch (error) {
      warn(`[Electron] Frame "${name}" setup failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return {
    dispose() {
      while (disposers.length) {
        try { disposers.pop()() } catch { /* best effort */ }
      }
    },
  }
}
