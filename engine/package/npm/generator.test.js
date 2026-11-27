import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { groupPackages, readPkgBlocks } from '../common/read.js'
import { toolBin } from '../common/run.js'
import { buildNpmPackage, planNpmPackage } from './generator.js'

const toolsReady = !!(toolBin('tsdown') && toolBin('typescript', 'tsc') && toolBin('tsx'))
const slow = { skip: toolsReady ? false : 'tools not installed (node mizumi.js deps install package)', timeout: 180000 }

const META = { meta: { name: 't', version: '2.0.0', description: 'from meta' } }
const pkgOf = text => groupPackages(readPkgBlocks(text))[0]
const BASE = '/* @arkzen:pkg:project\nname: demo\nkind: library\nlicense: MIT\nauthor: Ana\ntargets: [npm]\n*/\n/* @arkzen:pkg:target:npm\nname: "@t/demo"\n*/\n'
const SRC = (name, body) => `/* @arkzen:pkg:source:ts:${name}\n*/\n${body}\n/* @arkzen:pkg:source:ts:${name}:end */\n`

function build(text, opts = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-gen-test-'))
  try {
    const report = buildNpmPackage({ tatemono: META, pkg: pkgOf(text), outDir: path.join(dir, 'out'), ...opts })
    return { report, dir, out: path.join(dir, 'out') }
  } catch (error) {
    fs.rmSync(dir, { recursive: true, force: true })
    throw error
  }
}
const cleanup = r => fs.rmSync(r.dir, { recursive: true, force: true })
const status = (report, name) => report.steps.find(s => s.name === name)?.status

test('plan: version and description default to meta, entries default to the only source', () => {
  const plan = planNpmPackage({ tatemono: META, pkg: pkgOf(BASE + SRC('index', 'export const a = 1')) })
  assert.equal(plan.version, '2.0.0')
  assert.equal(plan.description, 'from meta')
  assert.deepEqual(plan.entries.map(e => [e.subpath, e.file]), [['.', 'src/index.ts']])
})

test('plan errors say what to change', () => {
  const lib = BASE + SRC('index', 'export const a = 1')
  assert.throws(() => planNpmPackage({ tatemono: META, pkg: pkgOf(lib.replace('kind: library', 'kind: sdk')) }), /kind: sdk on npm is not implemented yet/)
  assert.throws(() => planNpmPackage({ tatemono: META, pkg: pkgOf(BASE) }), /needs at least one @arkzen:pkg:source:ts/)
  assert.throws(() => planNpmPackage({ tatemono: META, pkg: pkgOf(lib + '/* @arkzen:pkg:exports\nentries:\n  ".": nope\n*/\n') }), /points at source "nope"/)
  assert.throws(() => planNpmPackage({ tatemono: META, pkg: pkgOf(lib + '/* @arkzen:pkg:exports\nformats: [dts]\n*/\n') }), /needs esm or cjs/)
  assert.throws(() => planNpmPackage({ tatemono: META, pkg: pkgOf(lib + SRC('two', 'export const b = 2')) }), /mark one with entry: true/)
})

test('full run: builds, packs, installs the archive and imports it (ESM, CJS, types)', slow, () => {
  const r = build(BASE + SRC('index', 'export function hi(n: string): string { return "hi " + n }') + '/* @arkzen:pkg:verify\nimport: [hi]\n*/\n')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    for (const name of ['build', 'manifest', 'pack', 'import as ES module', 'import as CommonJS', 'type check (ESM consumer)', 'type check (CommonJS consumer)']) assert.equal(status(r.report, name), 'passed', name)
    const pm = JSON.parse(fs.readFileSync(path.join(r.out, 'package.json'), 'utf8'))
    // the manifest points at files that exist (the .mjs lesson)
    for (const rel of [pm.main, pm.module, pm.types]) assert.ok(fs.existsSync(path.join(r.out, rel)), rel)
    assert.ok(fs.existsSync(r.report.archivePath))
    assert.equal(pm.license, 'MIT')
    assert.match(fs.readFileSync(path.join(r.out, 'LICENSE'), 'utf8'), /Copyright \(c\) \d{4} Ana/)
  } finally { cleanup(r) }
})

test('verify catches a symbol the package does not export', slow, () => {
  const r = build(BASE + SRC('index', 'export const real = 1') + '/* @arkzen:pkg:verify\nimport: [ghost]\n*/\n')
  try {
    assert.equal(r.report.verified, 'failed')
    assert.equal(status(r.report, 'import as ES module'), 'failed')
    assert.match(r.report.steps.find(s => s.name === 'import as ES module').detail, /symbol ghost is not exported/)
  } finally { cleanup(r) }
})

test('a TypeScript error in the sources fails the run and is reported, not hidden', slow, () => {
  const r = build(BASE + SRC('index', 'export const n: number = "text"'))
  try {
    assert.equal(r.report.verified, 'failed')
    assert.equal(status(r.report, 'type check sources'), 'failed')
    assert.match(r.report.steps.find(s => s.name === 'type check sources').detail, /TS2322/)
    assert.equal(status(r.report, 'build'), undefined, 'nothing is built from sources that do not type-check')
  } finally { cleanup(r) }
})

test('several entry points become subpath exports that all import', slow, () => {
  const r = build(BASE + SRC('index', 'export const a = 1') + SRC('extra', 'export const b = 2') + '/* @arkzen:pkg:exports\nentries:\n  ".": index\n  "./extra": extra\n*/\n/* @arkzen:pkg:verify\nimport: [a, b]\n*/\n')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    const pm = JSON.parse(fs.readFileSync(path.join(r.out, 'package.json'), 'utf8'))
    assert.deepEqual(Object.keys(pm.exports), ['.', './extra', './package.json'])
  } finally { cleanup(r) }
})

test('esm only: no CommonJS check runs and no require condition is written', slow, () => {
  const r = build(BASE + SRC('index', 'export const a = 1') + '/* @arkzen:pkg:exports\nentries:\n  ".": index\nformats: [esm, dts]\n*/\n')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(status(r.report, 'import as CommonJS'), undefined)
    const pm = JSON.parse(fs.readFileSync(path.join(r.out, 'package.json'), 'utf8'))
    assert.equal(pm.exports['.'].require, undefined)
  } finally { cleanup(r) }
})

test('pkg:test blocks run during the build', slow, () => {
  const test1 = '/* @arkzen:pkg:test:ts:index\n*/\nimport test from "node:test"\nimport assert from "node:assert/strict"\nimport { add } from "./index.ts"\ntest("add", () => assert.equal(add(1, 2), 3))\n/* @arkzen:pkg:test:ts:index:end */\n'
  const r = build(BASE + SRC('index', 'export const add = (a: number, b: number): number => a + b') + test1.replace(/^\/\* @arkzen:pkg:test:ts:index\n\*\//, '/* @arkzen:pkg:test:ts:index\npath: src/index.test.ts\n*/'))
  try {
    assert.equal(status(r.report, 'tests'), 'passed', JSON.stringify(r.report.steps, null, 1))
  } finally { cleanup(r) }
})

test('a failing test fails the run', slow, () => {
  const bad = '/* @arkzen:pkg:test:ts:index\npath: src/index.test.ts\n*/\nimport test from "node:test"\nimport assert from "node:assert/strict"\ntest("bad", () => assert.equal(1, 2))\n/* @arkzen:pkg:test:ts:index:end */\n'
  const r = build(BASE + SRC('index', 'export const a = 1') + bad)
  try {
    assert.equal(status(r.report, 'tests'), 'failed')
    assert.equal(r.report.verified, 'failed')
  } finally { cleanup(r) }
})

test('unbundled license text produces a warning and still builds', slow, () => {
  const r = build((BASE + SRC('index', 'export const a = 1')).replace('license: MIT', 'license: Apache-2.0'), { verify: false })
  try {
    assert.ok(r.report.warnings.some(w => /placeholder/.test(w)))
    assert.equal(r.report.verified, 'skipped')
  } finally { cleanup(r) }
})

test('a failed rebuild keeps nothing half-written and a good rebuild replaces the folder', slow, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-gen-test-'))
  try {
    const out = path.join(dir, 'out')
    const good = buildNpmPackage({ tatemono: META, pkg: pkgOf(BASE + SRC('index', 'export const a = 1')), outDir: out, verify: false })
    assert.equal(good.verified, 'skipped')
    fs.writeFileSync(path.join(out, 'stale.txt'), 'old')
    buildNpmPackage({ tatemono: META, pkg: pkgOf(BASE + SRC('index', 'export const a = 2')), outDir: out, verify: false })
    assert.equal(fs.existsSync(path.join(out, 'stale.txt')), false)
    assert.deepEqual(fs.readdirSync(dir), ['out'])
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('node types are only available when the package asks for @types/node', slow, () => {
  const usesFs = SRC('index', 'import { readFileSync } from "node:fs"\nexport const read = (p: string): string => readFileSync(p, "utf8")')
  const without = build(BASE + usesFs, { verify: false })
  try { assert.equal(status(without.report, 'type check sources'), 'failed') } finally { cleanup(without) }
  const withTypes = build(BASE.replace('name: "@t/demo"', 'name: "@t/demo"\ndev_dependencies:\n  "@types/node": "^22.0.0"') + usesFs, { verify: false })
  try { assert.equal(status(withTypes.report, 'type check sources'), 'passed', JSON.stringify(withTypes.report.steps, null, 1)) } finally { cleanup(withTypes) }
})
