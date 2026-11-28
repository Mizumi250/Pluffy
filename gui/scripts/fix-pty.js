'use strict'
// Rebuilds the terminal's native part (conpty.node) for the Electron version this app uses.
// @electron/rebuild first tries a ready-made binary and only compiles if none exists
// (compiling on Windows needs Visual Studio Build Tools with the C++ workload, and Python).
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const ver = require(path.join(__dirname, '..', 'node_modules', 'electron', 'package.json')).version
console.log(`Rebuilding node-pty for Electron ${ver} ...`)
const r = spawnSync('npx', ['--yes', '@electron/rebuild', '-f', '-v', ver, '-w', '@homebridge/node-pty-prebuilt-multiarch'], {
  cwd: path.join(__dirname, '..'), stdio: 'inherit', shell: process.platform === 'win32',
})
process.exit(r.status ?? 1)
