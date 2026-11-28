// Push and Pull for the repo this bridge runs in. Same as `mz push`, with one safe difference for pull:
// it only fast-forwards, so it can never throw away local work.
import { execFileSync } from 'node:child_process'
import { ROOT } from './paths.js'
import { gitStep } from './tasks.js'

const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', timeout: 8000, stdio: ['ignore', 'pipe', 'ignore'] }).trim()

export function info() {
  try {
    const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'])
    const changes = git(['status', '--porcelain']).split('\n').filter(Boolean).length
    let ahead = 0, behind = 0, upstream = null
    try {
      upstream = git(['rev-parse', '--abbrev-ref', '@{u}'])
      ;[ahead, behind] = git(['rev-list', '--left-right', '--count', 'HEAD...@{u}']).split(/\s+/).map(Number)
    } catch { /* no upstream */ }
    return { git: true, branch, changes, ahead, behind, upstream }
  } catch { return { git: false } }
}

export function steps(op) {
  if (op === 'push') {
    const stamp = new Date().toLocaleString()
    // commit exits 1 when there is nothing to commit; that is fine, the push still runs
    return { label: 'Push repo', steps: [gitStep(['add', '-A']), gitStep(['commit', '-m', `mizumi push ${stamp}`], [1]), gitStep(['push'])] }
  }
  if (op === 'pull') return { label: 'Pull repo', steps: [gitStep(['pull', '--ff-only'])] }
  throw Object.assign(new Error('Unknown repo command.'), { status: 404 })
}
