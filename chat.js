#!/usr/bin/env node
// chat.js: opens the Pluffy chat window.
//   node chat.js            open the chat (stays attached to this terminal, Ctrl+C closes it)
//   node chat.js --detach   open the chat and give the terminal back
// Needs Node 18+. The first run installs Electron into chat/ (one time).

import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const CHAT_DIR = path.join(ROOT, 'chat')
const detach = process.argv.includes('--detach')

if (!fs.existsSync(path.join(CHAT_DIR, 'main.js'))) {
  console.error('  ✗ chat/main.js not found. Copy the chat/ folder into the repo root (next to mizumi.js).')
  process.exit(1)
}

const requireFromChat = createRequire(path.join(CHAT_DIR, 'package.json'))


const DIAG = (...a) => { if (process.env.PLUFFY_DIAG) console.log('[DIAG]', ...a) }   // set PLUFFY_DIAG=1 to see these

function findElectron() {
  try {
    const result = requireFromChat('electron');
    DIAG('Launcher:', fileURLToPath(import.meta.url));
    DIAG('Chat directory:', CHAT_DIR);
    DIAG('Electron result type:', typeof result);

    if (typeof result !== 'string' || !result) return null;
    if (!fs.existsSync(result) || !fs.statSync(result).isFile()) return null;
    return result;
  } catch (err) {
    DIAG('Electron lookup threw:', err.stack);
    return null;
  }
}

let electronPath = findElectron();
DIAG('Final electronPath:', electronPath)


if (!electronPath) {
  console.log('  ✦ Installing Electron in chat/ (first run only)...')

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

  const r = spawnSync(
    npm,
    ['install', '--no-audit', '--no-fund'],
    {
      cwd: CHAT_DIR,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }
  )

  if (r.error) {
    console.error('  ✗ Could not run npm:', r.error.message)
    process.exit(1)
  }

  if (r.status !== 0) {
    console.error('  ✗ npm install failed with exit code:', r.status)
    process.exit(1)
  }

  electronPath = findElectron()

  if (!electronPath) {
    console.error('  ✗ Electron executable not found after installation.')
    console.error(
      '  Expected:',
      path.join(CHAT_DIR, 'node_modules', 'electron', 'dist', 'electron.exe')
    )
    process.exit(1)
  }
}

console.log('  ✓ Electron:', electronPath)

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE
// Start main.js directly. Passing the folder (.../chat) makes Electron resolve it to the file chat.js next to it,
// which re-runs this launcher inside Electron (that is what the "Electron executable not found" loop was).
const child = spawn(electronPath, [path.join(CHAT_DIR, 'main.js')], {
  cwd: ROOT, env, stdio: detach ? 'ignore' : 'inherit', detached: detach,
})
child.on('error', (err) => { console.error('  ✗ Could not start Electron:', err.message); process.exit(1) })
if (detach) { child.unref(); console.log('  ✓ Pluffy chat opened.') }
else child.on('exit', (code) => process.exit(code ?? 0))