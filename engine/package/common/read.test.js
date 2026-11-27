import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readPkgBlocks, groupPackages, readTatemono } from './read.js'
import { licenseText } from './license.js'

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')

test('reads every fixture into packages', () => {
  for (const name of fs.readdirSync(FIXTURES)) {
    const t = readTatemono(path.join(FIXTURES, name, 'core.tsx'))
    assert.ok(t.packages.length >= 1, name)
    assert.ok(t.packages[0].project.name, name)
  }
})

test('greet-kit: source body is verbatim and ownership resolves to the only package', () => {
  const t = readTatemono(path.join(FIXTURES, 'greet-kit', 'core.tsx'))
  const [pkg] = t.packages
  assert.equal(pkg.project.kind, 'library')
  assert.equal(pkg.targets.npm.name, '@demo/greet')
  assert.equal(pkg.sources[0].name, 'index')
  assert.match(pkg.sources[0].raw, /`Hello, \$\{name\}`/)
  assert.deepEqual(pkg.exports.entries, { '.': 'index' })
})

test('notes-sdk: target blocks join their package through package:', () => {
  const t = readTatemono(path.join(FIXTURES, 'notes-sdk', 'core.tsx'))
  const [pkg] = t.packages
  assert.equal(pkg.id, 'notes-sdk')
  assert.equal(pkg.targets.npm.name, '@demo/notes-sdk')
  assert.equal(pkg.targets.pypi.name, 'demo-notes-sdk')
  assert.deepEqual(pkg.sdk.languages, ['ts', 'py'])
})

test('a marker inside a source body is not read as a block', () => {
  const src = '/* @arkzen:pkg:source:ts:a */\nconst s = "/* @arkzen:pkg:project\\nname: x\\n*/"\n/* @arkzen:pkg:source:ts:a:end */\n'
  const blocks = readPkgBlocks(src)
  assert.equal(blocks.length, 1)
})

test('errors are specific', () => {
  assert.throws(() => readPkgBlocks('/* @arkzen:pkg:bogus\nname: x\n*/\n'), /Unknown package block/)
  assert.throws(() => readPkgBlocks('/* @arkzen:pkg:source:ts:a\n*/\nx\n'), /missing its closing/)
  assert.throws(() => readPkgBlocks('/* @arkzen:pkg:project\nname: a\n*/\n/* @arkzen:pkg:project\nname: b\n*/\n'), /Duplicate/)
  assert.throws(() => groupPackages(readPkgBlocks('/* @arkzen:pkg:exports\nentries: {}\n*/\n')), /pkg:project is required/)
})

test('license text: bundled licenses are complete, others are flagged as placeholders', () => {
  assert.equal(licenseText('MIT', { year: 2026, holder: 'Ana' }).complete, true)
  assert.match(licenseText('MIT', { year: 2026, holder: 'Ana' }).text, /Copyright \(c\) 2026 Ana/)
  const apache = licenseText('Apache-2.0')
  assert.equal(apache.complete, false)
  assert.match(apache.text, /placeholder/)
})
