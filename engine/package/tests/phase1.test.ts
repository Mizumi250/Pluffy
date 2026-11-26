// Phase 1 tests for the pkg family: parse and validate the fixtures, and check the error messages.
//
// Run from a stack folder that has its node_modules installed (it needs js-yaml and tsx):
//   cd engine/frontend/react-vite
//   npx tsx --test ../../package/tests/phase1.test.ts
//
// Uses the stack's own copy of the engine-core files (shared-sync keeps them equal to engine/shared).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseTatemono } from '../../frontend/react-vite/arkzen/core/parser'
import { validateTatemono } from '../../frontend/react-vite/arkzen/core/validator'

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fixtures')

// Writes a tatemono into a temp folder named like its meta.name and returns the core.tsx path.
function temp(name: string, body: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-test-'))
  const sub = path.join(dir, name)
  fs.mkdirSync(sub)
  const file = path.join(sub, 'core.tsx')
  fs.writeFileSync(file, `/* @arkzen:meta\nname: ${name}\nversion: 1.0.0\ndescription: test\nauth: false\n*/\n\n${body}`)
  return file
}
const quiet = <T>(fn: () => T): T => {
  const log = console.log, err = console.error
  console.log = () => {}; console.error = () => {}
  try { return fn() } finally { console.log = log; console.error = err }
}
// Runs fn, returns what it printed to stderr (the DSL tag checker prints its details there).
const stderrOf = (fn: () => unknown): string => {
  const log = console.log, err = console.error
  let out = ''
  console.log = () => {}; console.error = (...a: unknown[]) => { out += a.join(' ') + '\n' }
  try { fn() } catch { /* the tag checker throws after printing */ } finally { console.log = log; console.error = err }
  return out
}
const errorsOf = (file: string): string[] => quiet(() => validateTatemono(file).errors)

for (const name of fs.readdirSync(FIXTURES)) {
  test(`fixture ${name} parses and validates with zero errors`, () => {
    const file = path.join(FIXTURES, name, 'core.tsx')
    const parsed = quiet(() => parseTatemono(file))
    assert.ok(parsed.pkg, 'parsed.pkg is set')
    assert.ok(parsed.pkg.blocks.length >= 3)
    const result = quiet(() => validateTatemono(file))
    assert.deepEqual(result.errors, [])
  })
}

test('parser reads source blocks verbatim and their headers', () => {
  const parsed = quiet(() => parseTatemono(path.join(FIXTURES, 'greet-kit', 'core.tsx')))
  const src = parsed.pkg!.blocks.find(b => b.kind === 'source')!
  assert.equal(src.lang, 'ts')
  assert.equal(src.name, 'index')
  assert.deepEqual(src.header, { entry: true })
  assert.match(src.raw!, /export function greet/)
  assert.match(src.raw!, /`Hello, \$\{name\}`/)
})

test('a tatemono without pkg blocks gets no pkg field', () => {
  const file = temp('plain-site', '/* @arkzen:web:page:index */\nconst IndexPage = () => <div />\n/* @arkzen:web:page:index:end */\n')
  assert.equal(quiet(() => parseTatemono(file)).pkg, undefined)
})

test('unknown pkg block is reported by name', () => {
  const file = temp('bad-block', '/* @arkzen:pkg:bogus\nname: x\n*/\n')
  assert.match(stderrOf(() => parseTatemono(file)), /Unknown package block "@arkzen:pkg:bogus"/)
})

test('duplicate marker is rejected', () => {
  const file = temp('dup-marker', '/* @arkzen:pkg:project\nname: a\nkind: library\n*/\n/* @arkzen:pkg:project\nname: b\nkind: library\n*/\n')
  assert.throws(() => quiet(() => parseTatemono(file)), /Duplicate @arkzen:pkg:project/)
})

test('source block without :end is rejected', () => {
  const file = temp('no-end', '/* @arkzen:pkg:source:ts:index\nentry: true\n*/\nexport const a = 1\n')
  assert.match(stderrOf(() => parseTatemono(file)), /Missing closing tag/)
  assert.match(stderrOf(() => parseTatemono(file)), /@arkzen:pkg:source:ts:index:end/)
})

const BASE = '/* @arkzen:pkg:project\nname: demo\nkind: library\nlicense: MIT\ntargets: [npm]\n*/\n/* @arkzen:pkg:target:npm\nname: "@demo/demo"\n*/\n/* @arkzen:pkg:exports\nentries:\n  ".": index\n*/\n'
const SRC  = '/* @arkzen:pkg:source:ts:index\nentry: true\n*/\nexport const a = 1\n/* @arkzen:pkg:source:ts:index:end */\n'

test('a valid minimal library has no errors', () => {
  assert.deepEqual(errorsOf(temp('min-lib', BASE + SRC)), [])
})

test('python source in an npm-only package is an error', () => {
  const errs = errorsOf(temp('wrong-lang', BASE + SRC + '/* @arkzen:pkg:source:py:helpers */\ndef a(): pass\n/* @arkzen:pkg:source:py:helpers:end */\n'))
  assert.ok(errs.some(e => /py code does not match the targets/.test(e)), errs.join('\n'))
})

test('missing target block, bad semver, bad kind are all reported', () => {
  const errs = errorsOf(temp('many-bad', '/* @arkzen:pkg:project\nname: demo\nkind: widget\nversion: 1.0\ntargets: [npm]\n*/\n'))
  assert.ok(errs.some(e => /kind must be one of/.test(e)))
  assert.ok(errs.some(e => /version must be a semver/.test(e)))
  assert.ok(errs.some(e => /no @arkzen:pkg:target:npm block/.test(e)))
})

test('library without source and exports is incomplete', () => {
  const errs = errorsOf(temp('incomplete', '/* @arkzen:pkg:project\nname: demo\nkind: library\nlicense: MIT\ntargets: [npm]\n*/\n/* @arkzen:pkg:target:npm\nname: "@demo/demo"\n*/\n'))
  assert.ok(errs.some(e => /needs @arkzen:pkg:exports/.test(e)))
  assert.ok(errs.some(e => /needs @arkzen:pkg:source/.test(e)))
})

test('a block the kind does not use is an error', () => {
  const errs = errorsOf(temp('unused-block', BASE + SRC + '/* @arkzen:pkg:sdk\nlanguages: [ts]\n*/\n'))
  assert.ok(errs.some(e => /does not use @arkzen:pkg:sdk/.test(e)), errs.join('\n'))
})

test('credentials in a pkg block are rejected', () => {
  const errs = errorsOf(temp('has-secret', BASE.replace('name: "@demo/demo"', 'name: "@demo/demo"\nnpm_token: abc123') + SRC))
  assert.ok(errs.some(e => /looks like a credential/.test(e)), errs.join('\n'))
})

test('registry name rules are enforced', () => {
  const errs = errorsOf(temp('bad-names', '/* @arkzen:pkg:project\nname: demo\nkind: library\nlicense: MIT\ntargets: [npm, packagist]\n*/\n/* @arkzen:pkg:target:npm\nname: "Bad Name"\n*/\n/* @arkzen:pkg:target:packagist\nname: NoVendor\n*/\n/* @arkzen:pkg:exports\nentries:\n  ".": index\n*/\n' + SRC))
  assert.ok(errs.some(e => /npm registry/.test(e)), errs.join('\n'))
  assert.ok(errs.some(e => /packagist registry/.test(e)), errs.join('\n'))
})

test('source importing stack internals is rejected', () => {
  const errs = errorsOf(temp('stack-import', BASE + '/* @arkzen:pkg:source:ts:index\nentry: true\n*/\nimport { arkzenFetch } from \'@/arkzen/core/stores/authStore\'\n/* @arkzen:pkg:source:ts:index:end */\n'))
  assert.ok(errs.some(e => /imports from the Pluffy stack/.test(e)), errs.join('\n'))
})

test('sdk include must match an api or table of the tatemono', () => {
  const errs = errorsOf(temp('sdk-missing', '/* @arkzen:pkg:project\nname: s\nkind: sdk\nlicense: MIT\ntargets: [npm]\n*/\n/* @arkzen:pkg:target:npm\nname: "@demo/s"\n*/\n/* @arkzen:pkg:sdk\nlanguages: [ts]\ninclude: [ghosts]\n*/\n'))
  assert.ok(errs.some(e => /matches no @arkzen:database table or @arkzen:api/.test(e)), errs.join('\n'))
})

test('two packages need ids and unique ids', () => {
  const errs = errorsOf(temp('two-pkgs', '/* @arkzen:pkg:project\nname: a\nkind: assets\ntargets: [npm]\n*/\n/* @arkzen:pkg:project:b\nname: b\nkind: assets\ntargets: [npm]\n*/\n'))
  assert.ok(errs.some(e => /every @arkzen:pkg:project needs an id/.test(e)), errs.join('\n'))
})

test('exports pointing at a missing source is an error', () => {
  const errs = errorsOf(temp('exp-missing', BASE + '/* @arkzen:pkg:source:ts:other */\nexport const b = 1\n/* @arkzen:pkg:source:ts:other:end */\n'))
  assert.ok(errs.some(e => /no @arkzen:pkg:source block has that name/.test(e)), errs.join('\n'))
})
