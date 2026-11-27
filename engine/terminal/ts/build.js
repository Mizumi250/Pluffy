// Installs and builds a generated TypeScript project with its own toolchain.
import fs from 'node:fs'
import path from 'node:path'
import { runNpm, looksOffline } from '../common/run.js'

const tail = text => text.trim().split('\n').slice(-12).join('\n')

// Returns steps: { name, status: PASS | FAIL | UNVERIFIED, detail }
export async function installAndBuild(projectDir, { install = true } = {}) {
  const steps = []
  if (install) {
    const r = await runNpm(['install', '--no-audit', '--no-fund'], { cwd: projectDir })
    if (r.error) {
      steps.push({ name: 'npm install', status: 'UNVERIFIED', detail: `npm could not be started: ${r.error.message}` })
      return steps
    }
    if (r.code !== 0) {
      const text = r.stdout + r.stderr
      steps.push({ name: 'npm install', status: looksOffline(text) ? 'UNVERIFIED' : 'FAIL', detail: (looksOffline(text) ? 'the npm registry could not be reached\n' : '') + tail(text) })
      return steps
    }
    steps.push({ name: 'npm install', status: 'PASS' })
  } else if (!fs.existsSync(path.join(projectDir, 'node_modules'))) {
    steps.push({ name: 'npm install', status: 'UNVERIFIED', detail: 'skipped and node_modules is missing' })
    return steps
  }
  const b = await runNpm(['run', 'build'], { cwd: projectDir })
  if (b.code !== 0) steps.push({ name: 'tsc build', status: 'FAIL', detail: tail(b.stdout + b.stderr) })
  else steps.push({ name: 'tsc build', status: 'PASS' })
  return steps
}
