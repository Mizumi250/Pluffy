// Generated: runs the built program the way a user would.
import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const cli = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/cli.js')

function run(args: string[]) {
  const r = spawnSync(process.execPath, [cli, ...args], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return { code: r.status, stdout: r.stdout, stderr: r.stderr }
}

// An expectation written as /pattern/ is a regular expression, anything else is a substring.
function matches(text: string, expectation: string): boolean {
  if (expectation.length > 2 && expectation.startsWith('/') && expectation.endsWith('/')) {
    return new RegExp(expectation.slice(1, -1)).test(text)
  }
  return text.includes(expectation)
}

const binary = /*__BINARY__*/ ''
const version = /*__VERSION__*/ ''
const examples: { label: string; args: string[]; expectExit: number; expectStdout: string | null; expectStderr: string | null }[] = /*__EXAMPLES__*/ []

test('--help prints the usage', () => {
  const r = run(['--help'])
  assert.equal(r.code, 0)
  assert.ok(r.stdout.includes(binary), r.stdout)
})

test('--version prints the version', () => {
  const r = run(['--version'])
  assert.equal(r.code, 0)
  assert.equal(r.stdout.trim(), version)
})

for (const ex of examples) {
  test(`example: ${ex.label}`, () => {
    const r = run(ex.args)
    assert.equal(r.code, ex.expectExit, `exit code. stdout: ${r.stdout} stderr: ${r.stderr}`)
    if (ex.expectStdout !== null) assert.ok(matches(r.stdout, ex.expectStdout), `stdout did not match ${ex.expectStdout}: ${r.stdout}`)
    if (ex.expectStderr !== null) assert.ok(matches(r.stderr, ex.expectStderr), `stderr did not match ${ex.expectStderr}: ${r.stderr}`)
  })
}
