import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readTatemono } from '../common/read.js'
import { toolBin } from '../common/run.js'
import { buildNpmPackage, planNpmPackage } from './generator.js'
import { buildJsrPackage } from './jsr.js'

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')
const toolsReady = !!(toolBin('tsdown') && toolBin('typescript', 'tsc') && toolBin('tsx'))
const slow = { skip: toolsReady ? false : 'tools not installed (node mizumi.js deps install package)', timeout: 240000 }

// Copy a fixture into a temp folder (assets included) and optionally rewrite its core.tsx.
function variant(name, edit = s => s) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-kinds-test-'))
  fs.cpSync(path.join(FIXTURES, name), path.join(dir, name), { recursive: true })
  const file = path.join(dir, name, 'core.tsx')
  fs.writeFileSync(file, edit(fs.readFileSync(file, 'utf8')))
  return { dir, tatemono: readTatemono(file) }
}
function build(name, { edit, registry, verify = true, builder = buildNpmPackage } = {}) {
  const v = variant(name, edit)
  try {
    const pkg = v.tatemono.packages[0]
    const reg = registry ?? pkg.project.targets[0]
    const report = builder({ tatemono: v.tatemono, pkg, outDir: path.join(v.dir, 'out'), verify, registry: reg })
    return { report, out: path.join(v.dir, 'out'), dir: v.dir }
  } catch (error) {
    fs.rmSync(v.dir, { recursive: true, force: true })
    throw error
  }
}
const done = r => fs.rmSync(r.dir, { recursive: true, force: true })
const status = (r, name) => r.report.steps.find(s => s.name === name)?.status
const detail = (r, name) => r.report.steps.find(s => s.name === name)?.detail
const manifest = r => JSON.parse(fs.readFileSync(path.join(r.out, 'package.json'), 'utf8'))
const plan = (name, edit, registry = 'npm') => { const v = variant(name, edit); try { return planNpmPackage({ tatemono: v.tatemono, pkg: v.tatemono.packages[0], registry }) } finally { fs.rmSync(v.dir, { recursive: true, force: true }) } }

// ── planning errors, no toolchain needed ──
test('components: entries are required and must exist', () => {
  assert.throws(() => plan('ui-kit', s => s.replace('{ from: "web:components:Button" }', '{ from: "web:components:Ghost" }')), /Ghost, which does not exist/)
  assert.throws(() => plan('ui-kit', s => s.replace('{ from: "web:components:Button" }', '{ from: "elsewhere:Button" }')), /from must be web:components/)
  assert.throws(() => plan('ui-kit', s => s.replace('import React', "import { x } from '@/arkzen/core/stores/authStore'\nimport React")), /imports from the Pluffy stack/)
})

test('config: TypeScript is refused (nothing is built) and entries must name sources', () => {
  assert.throws(() => plan('eslint-config-kit', s => s.replace('ext: js', 'ext: ts')), /builds nothing/)
  assert.throws(() => plan('eslint-config-kit', s => s.replace('".": base', '".": nope')), /must name an @arkzen:pkg:source block/)
})

test('assets: needs files that match, and a dest inside the package', () => {
  assert.throws(() => plan('brand-assets', s => s.replace('data.json"]', 'nothing-here.xyz"]').replace(/"\*\*\\\/\*\.svg", "\*\*\\\/\*\.png", /, '')), /matched no file/)
  assert.throws(() => plan('brand-assets', s => s.replace('dest: assets', 'dest: ../out')), /relative folder/)
})

test('template: variables, bin name and the template folder are checked', () => {
  assert.throws(() => plan('create-demo-app', s => s.replace('bin: create-demo-app', 'bin: Bad Name')), /lowercase command name/)
  assert.throws(() => plan('create-demo-app', s => s.replace('- name: description', '- name: "bad name!"')), /variables entry needs a name/)
})

test('cli: bin is required and must point at a source', () => {
  assert.throws(() => plan('demo-cli', s => s.replace('  demo: main', '  demo: nope')), /points at source "nope"/)
  assert.throws(() => plan('demo-cli', s => s.replace('bin:\n  demo: main', 'entries: {}')), /needs bin/)
})

test('plugin: name prefix, host and peer range', () => {
  assert.throws(() => plan('vite-plugin-demo', s => s.replace('name: vite-plugin-demo\n*/\n\n/* @arkzen:pkg:plugin', 'name: my-thing\n*/\n\n/* @arkzen:pkg:plugin')), /must start with "vite-plugin-"/)
  assert.throws(() => plan('vite-plugin-demo', s => s.replace('host: vite', 'host: laravel')), /published through its own registry/)
  const p = plan('vite-plugin-demo')
  assert.deepEqual(p.derived.pmExtra.peerDependencies, { vite: '^5.0.0 || ^6.0.0' })
  assert.deepEqual(p.derived.pmExtra.keywords, ['vite-plugin'])
})

test('github: owner is required and the name is scoped to it', () => {
  assert.throws(() => plan('greet-github', s => s.replace('owner: Demo\n', ''), 'github'), /needs owner/)
  assert.equal(plan('greet-github', s => s, 'github').name, '@demo/greet')
})

test('jsr: scope, license and kind are checked', () => {
  const v = variant('greet-jsr', s => s.replace('name: "@demo/greet"', 'name: NoScope'))
  try { assert.throws(() => buildJsrPackage({ tatemono: v.tatemono, pkg: v.tatemono.packages[0], outDir: path.join(v.dir, 'o') }), /must be @scope\/name/) } finally { fs.rmSync(v.dir, { recursive: true, force: true }) }
  const w = variant('greet-jsr', s => s.replace('kind: library', 'kind: config'))
  try { assert.throws(() => buildJsrPackage({ tatemono: w.tatemono, pkg: w.tatemono.packages[0], outDir: path.join(w.dir, 'o') }), /not implemented yet/) } finally { fs.rmSync(w.dir, { recursive: true, force: true }) }
})

// ── full runs, verified from the installed archive ──
test('components: builds with React types, renders with react-dom/server, ships CSS', slow, () => {
  const r = build('ui-kit')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(status(r, 'render to HTML (react-dom/server)'), 'passed')
    const pm = manifest(r)
    assert.deepEqual(pm.peerDependencies, { react: '>=18' })
    assert.equal(pm.exports['./styles.css'], './styles/Button.css')
    assert.deepEqual(pm.sideEffects, ['*.css'])
    assert.ok(fs.existsSync(path.join(r.out, 'styles/Button.css')))
    assert.equal(fs.existsSync(path.join(r.out, 'tsconfig.check.json')) && pm.files.includes('tsconfig.check.json'), false, 'the check-only config is not shipped')
  } finally { done(r) }
})

test('components verify has teeth: a component that throws while rendering fails the run', slow, () => {
  const r = build('ui-kit', { edit: s => s.replace('<button className', '<button data-x={(() => { throw new Error("boom") })()} className') })
  try {
    assert.equal(r.report.verified, 'failed')
    assert.equal(status(r, 'render to HTML (react-dom/server)'), 'failed')
    assert.match(detail(r, 'render to HTML (react-dom/server)'), /boom/)
  } finally { done(r) }
})

test('config: ships files as written, no build, and every entry loads', slow, () => {
  const r = build('eslint-config-kit')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(status(r, 'build'), undefined)
    const pm = manifest(r)
    assert.deepEqual(pm.exports, { '.': './base.js', './tsconfig': './tsconfig.base.json', './package.json': './package.json' })
    assert.equal(pm.scripts, undefined)
    assert.equal(fs.existsSync(path.join(r.out, 'dist')), false)
  } finally { done(r) }
})

test('config verify has teeth: a symbol the files do not export fails, bad JSON fails', slow, () => {
  const ghost = build('eslint-config-kit', { edit: s => s.replace('import: [rules]', 'import: [ghost]') })
  try { assert.equal(ghost.report.verified, 'failed'); assert.match(detail(ghost, 'config entries load (installed package)'), /symbol ghost/) } finally { done(ghost) }
  const bad = build('eslint-config-kit', { edit: s => s.replace('"strict": true,', '"strict": true') .replace('"compilerOptions": {', '"compilerOptions": {,') })
  try { assert.equal(bad.report.verified, 'failed') } finally { done(bad) }
})

test('assets: files are copied byte for byte, the index maps names, wildcard export resolves', slow, () => {
  const r = build('brand-assets')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(detail(r, 'asset files are byte-identical (installed package)'), '4 files')
    const pm = manifest(r)
    assert.equal(pm.exports['./assets/*'], './assets/*')
    assert.ok(fs.readFileSync(path.join(r.out, 'src/index.ts'), 'utf8').includes('"icons/check.svg": "assets/icons/check.svg"'))
    const original = fs.readFileSync(path.join(FIXTURES, 'brand-assets/assets/pixel.png'))
    assert.ok(original.equals(fs.readFileSync(path.join(r.out, 'assets/pixel.png'))), 'binary file unchanged')
  } finally { done(r) }
})

test('assets without an index is a static package', slow, () => {
  const r = build('brand-assets', { edit: s => s.replace('index: true', 'index: false') })
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(status(r, 'build'), undefined)
    assert.equal(manifest(r).main, undefined)
  } finally { done(r) }
})

test('template: scaffolder runs from the installed package, keeps .gitignore, honors ignore, fills variables', slow, () => {
  const r = build('create-demo-app')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    const pm = manifest(r)
    assert.deepEqual(pm.bin, { 'create-demo-app': './bin/create.js' })
    assert.ok(fs.existsSync(path.join(r.out, 'template/_gitignore')))
    assert.equal(fs.existsSync(path.join(r.out, 'template/debug.log')), false, 'ignored files are not shipped at all')
    const tgz = fs.readdirSync(r.out).find(f => f.endsWith('.tgz'))
    assert.ok(tgz)
  } finally { done(r) }
})

test('template verify has teeth: an undeclared {{placeholder}} is reported', slow, () => {
  const v = variant('create-demo-app')
  fs.appendFileSync(path.join(v.dir, 'create-demo-app/assets/template/README.md'), '\n{{undeclared}}\n')
  try {
    const out = path.join(v.dir, 'out')
    const report = buildNpmPackage({ tatemono: v.tatemono, pkg: v.tatemono.packages[0], outDir: out })
    assert.equal(report.verified, 'failed')
    assert.match(report.steps.find(s => s.name === 'scaffolder creates a project (installed package)').detail, /unfilled \{\{placeholders\}\}/)
  } finally { fs.rmSync(v.dir, { recursive: true, force: true }) }
})

test('cli: shebang is added, commands run from the installed package', slow, () => {
  const r = build('demo-cli')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(detail(r, 'commands run (installed package)'), '3 commands')
    const pm = manifest(r)
    assert.deepEqual(pm.bin, { demo: './dist/bin-demo.mjs' })
    assert.ok(fs.readFileSync(path.join(r.out, 'dist/bin-demo.mjs'), 'utf8').startsWith('#!/usr/bin/env node'))
    assert.ok(pm.devDependencies['@types/node'])
  } finally { done(r) }
})

test('cli verify has teeth: wrong output and a crash on start both fail', slow, () => {
  const wrong = build('demo-cli', { edit: s => s.replace('contains: "1.0.0"', 'contains: "9.9.9"') })
  try { assert.equal(wrong.report.verified, 'failed'); assert.match(detail(wrong, 'commands run (installed package)'), /output does not contain "9.9.9"/) } finally { done(wrong) }
  const crash = build('demo-cli', { edit: s => s.replace("const args = process.argv.slice(2)", "import('does-not-exist-anywhere')\nconst args = process.argv.slice(2)") })
  try { assert.equal(crash.report.verified, 'failed') } finally { done(crash) }
})

test('plugin: vite contract checked, peer dependency and keyword written', slow, () => {
  const r = build('vite-plugin-demo')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(status(r, 'vite plugin contract (installed package)'), 'passed')
    const pm = manifest(r)
    assert.deepEqual(pm.peerDependencies, { vite: '^5.0.0 || ^6.0.0' })
    assert.deepEqual(pm.keywords, ['vite-plugin'])
  } finally { done(r) }
})

test('plugin verify has teeth: a Vite plugin without a name fails the contract', slow, () => {
  const r = build('vite-plugin-demo', { edit: s => s.replace("name: 'vite-plugin-demo',\n    transform", 'transform') })
  try {
    assert.equal(r.report.verified, 'failed')
    assert.match(detail(r, 'vite plugin contract (installed package)'), /must be an object with a name/)
  } finally { done(r) }
})

test('github: scoped name, registry in publishConfig, installs and imports like npm', slow, () => {
  const r = build('greet-github')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(r.report.registry, 'github')
    const pm = manifest(r)
    assert.equal(pm.name, '@demo/greet')
    assert.equal(pm.publishConfig.registry, 'https://npm.pkg.github.com')
  } finally { done(r) }
})

test('jsr: sources shipped as TypeScript, jsr.json written, dry run honestly UNVERIFIED', slow, () => {
  const r = build('greet-jsr', { builder: buildJsrPackage })
  try {
    assert.equal(r.report.verified, 'unverified')
    assert.equal(status(r, 'type check sources'), 'passed')
    assert.equal(status(r, 'load and import'), 'passed')
    assert.equal(status(r, 'jsr publish --dry-run'), 'unverified')
    const jsr = JSON.parse(fs.readFileSync(path.join(r.out, 'jsr.json'), 'utf8'))
    assert.deepEqual(jsr.exports, { '.': './src/index.ts' })
    assert.equal(jsr.name, '@demo/greet')
  } finally { done(r) }
})

test('jsr verify has teeth: a type error fails the run', slow, () => {
  const r = build('greet-jsr', { builder: buildJsrPackage, edit: s => s.replace('return `Hello, ${name}`', 'return 42') })
  try {
    assert.equal(r.report.verified, 'failed')
    assert.equal(status(r, 'type check sources'), 'failed')
  } finally { done(r) }
})
