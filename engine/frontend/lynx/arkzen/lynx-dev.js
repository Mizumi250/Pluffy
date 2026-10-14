import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const androidBinding = path.join(
  process.cwd(),
  'node_modules',
  '@rspack',
  'binding-android-arm64',
  'rspack.android-arm64.node'
)
const isTermux = process.platform === 'linux'
  && (process.env.PREFIX || '').includes('/com.termux/')
const env = { ...process.env }

if (isTermux && fs.existsSync(androidBinding)) {
  env.NAPI_RS_NATIVE_LIBRARY_PATH = androidBinding
}

const isWindows = process.platform === 'win32'
const child = spawn(isWindows ? (process.env.ComSpec || 'cmd.exe') : 'rspeedy',
  isWindows ? ['/d', '/s', '/c', 'rspeedy.cmd dev'] : ['dev'], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
})

child.on('error', error => {
  console.error(`[Arkzen Lynx] Could not start rspeedy: ${error.message}`)
  process.exitCode = 1
})
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0)
})
process.on('SIGINT', () => child.kill('SIGINT'))
