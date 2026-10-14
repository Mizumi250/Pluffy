import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const isTermux = process.platform === 'linux'
  && (process.env.PREFIX || '').includes('/com.termux/')

if (!isTermux) process.exit(0)

const source = path.join(
  os.homedir(),
  'rspack-src',
  'target',
  'aarch64-linux-android',
  'release',
  'librspack_node.so'
)
const target = path.join(
  process.cwd(),
  'node_modules',
  '@rspack',
  'binding-android-arm64',
  'rspack.android-arm64.node'
)

if (!fs.existsSync(source)) {
  console.warn(`[Arkzen Lynx] Termux Rspack binding not found: ${source}`)
  process.exit(0)
}

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.copyFileSync(source, target)
