// Type-checks the stack: sync the shared parser, generate WXT's types, run tsc.
//
// `wxt prepare` needs at least one entrypoint, and entrypoints/ only exists after an export (it is generated and
// gitignored). So types are generated from the committed reference extension, which is always there.
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const bin  = (...parts) => resolve(root, 'node_modules', ...parts)

function run(label, args, env = {}) {
  const res = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } })
  if (res.status !== 0) {
    console.error(`\n  ✗ ${label} failed`)
    process.exit(res.status ?? 1)
  }
}

run('sync',        [bin('tsx', 'dist', 'cli.mjs'), 'arkzen/sync.ts'])
run('wxt prepare', [bin('wxt', 'bin', 'wxt.mjs'), 'prepare'], { ARKZEN_EXT_REFERENCE: 'ext-tab-notes' })
run('tsc',         [bin('typescript', 'bin', 'tsc'), '--noEmit'])
console.log('  ✓ typecheck passed')
