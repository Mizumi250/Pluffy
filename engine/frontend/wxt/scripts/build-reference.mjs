// Builds a hand-written reference extension (reference/<name>/) with the stack's WXT config.
//
//   node scripts/build-reference.mjs [name] [browser]
//   node scripts/build-reference.mjs ext-tab-notes chrome
//   node scripts/build-reference.mjs ext-tab-notes firefox
//
// Output: .output/<browser>-mv3/  (load it unpacked in the browser)
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root    = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const name    = process.argv[2] ?? 'ext-tab-notes'
const browser = process.argv[3] ?? 'chrome'

if (!existsSync(resolve(root, 'reference', name, 'entrypoints'))) {
  console.error(`No reference at reference/${name}/entrypoints`)
  process.exit(1)
}
const wxt = resolve(root, 'node_modules', 'wxt', 'bin', 'wxt.mjs')
if (!existsSync(wxt)) {
  console.error('wxt is not installed. Run: node mizumi.js deps install wxt   (or: npm install in engine/frontend/wxt)')
  process.exit(1)
}

// Firefox defaults to Manifest V2 in WXT, so MV3 is always passed explicitly.
const args = [wxt, 'build', '-b', browser, '--mv3']
const res  = spawnSync(process.execPath, args, {
  cwd:   root,
  stdio: 'inherit',
  env:   { ...process.env, ARKZEN_EXT_REFERENCE: name },
})
process.exit(res.status ?? 1)
