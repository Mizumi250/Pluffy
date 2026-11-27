import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildOpenApiDoc } from '../../../export-openapi.js'
import { toolBin } from '../common/run.js'
import { buildNpmPackage } from '../npm/generator.js'
import { deriveOpenApi } from './openapi.js'
import { deriveSdk } from './sdk.js'
import { deriveTypes } from './types.js'
import { deriveValidators, VECTORS_FILE } from './validators.js'
import { filterDoc, matchId, operations, sampleValue, tsType } from './model.js'

const toolsReady = !!(toolBin('tsdown') && toolBin('typescript', 'tsc') && toolBin('tsx'))
const slow = { skip: toolsReady ? false : 'tools not installed (node mizumi.js deps install package)', timeout: 240000 }

// What the engine parser returns for a small notes tatemono (no parser needed to test the derivers).
const parsed = {
  meta: { name: 'notes', version: '1.2.0', description: 'Notes', auth: true },
  databases: [
    { table: 'notes', timestamps: true, softDeletes: false, columns: {
      id: { type: 'integer', primary: true, autoIncrement: true },
      title: { type: 'string', length: 255, nullable: false },
      body: { type: 'text', nullable: true },
      pinned: { type: 'boolean', nullable: false, default: false },
    } },
    { table: 'tags', timestamps: false, softDeletes: true, columns: { id: { type: 'integer', primary: true }, label: { type: 'string' } } },
  ],
  apis: [
    { model: 'Note', controller: 'NoteController', prefix: '/api/notes', middleware: ['auth'], endpoints: {
      index: { method: 'GET', route: '/', response: { type: 'paginated' } },
      store: { method: 'POST', route: '/', validation: { title: 'required|string|max:255', body: 'nullable|string', pinned: 'sometimes|boolean' }, response: { type: 'single' } },
      show: { method: 'GET', route: '/{id}', response: { type: 'single' } },
      update: { method: 'PUT', route: '/{id}', validation: { title: 'sometimes|string|max:255' }, response: { type: 'single' } },
      destroy: { method: 'DELETE', route: '/{id}', response: { type: 'message', value: 'deleted' } },
      upload: { method: 'POST', route: '/{id}/file', type: 'upload', validation: { file: 'required|file' }, response: { type: 'single' } },
    } },
    { model: 'Tag', controller: 'TagController', prefix: '/api/tags', middleware: [], endpoints: {
      index: { method: 'GET', route: '/', response: { type: 'collection' } },
    } },
  ],
  customRoutes: [],
}
const doc = buildOpenApiDoc(parsed, { backend: 'laravel', tatName: 'notes' })
const project = { name: 'notes', version: '1.2.0', license: 'MIT', author: 'Ana' }

function build(kind, derived, id = 'notes-pkg', verify = true) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-derive-test-'))
  const pkg = { id, project: { ...project, kind, targets: ['npm'] }, targets: { npm: { name: `@t/${id}` } }, sources: [], tests: [], readme: null }
  const report = buildNpmPackage({ tatemono: { meta: parsed.meta }, pkg, outDir: path.join(dir, 'out'), derived, verify })
  return { report, dir, out: path.join(dir, 'out') }
}
const done = r => fs.rmSync(r.dir, { recursive: true, force: true })
const status = (report, name) => report.steps.find(s => s.name === name)?.status

// ── model helpers ──
test('tsType maps the schemas export-openapi writes', () => {
  assert.equal(tsType({ type: 'integer' }), 'number')
  assert.equal(tsType({ type: ['string', 'null'] }), 'string | null')
  assert.equal(tsType({ type: 'string', enum: ['a', 'b'] }), '"a" | "b"')
  assert.equal(tsType({ type: 'array', items: { $ref: '#/components/schemas/Note' } }), 'Note[]')
  assert.equal(tsType({ type: 'array', items: { type: ['string', 'null'] } }), 'Array<string | null>')
  assert.equal(tsType({ type: 'string', format: 'binary' }), 'Blob | File')
  assert.equal(tsType({}), 'unknown')
})

test('filters match model, controller and table names', () => {
  assert.equal(matchId('Note', ['notes'], []), true)
  assert.equal(matchId('NoteController', ['note'], []), true)
  assert.equal(matchId('Tag', ['notes'], []), false)
  assert.equal(matchId('Tag', [], ['tags']), false)
  const only = filterDoc(doc, ['notes'], [])
  assert.ok(Object.keys(only.paths).every(p => p.startsWith('/api/notes')))
  assert.ok(only.components.schemas.Note && !only.components.schemas.Tag)
  assert.equal(Object.keys(filterDoc(doc, ['auth'], []).paths).every(p => p.includes('/auth/')), true)
})

test('sampleValue satisfies the schema it is made from', () => {
  const v = sampleValue(doc.components.schemas.Note, doc)
  assert.equal(typeof v.id, 'number'); assert.equal(typeof v.title, 'string'); assert.equal(typeof v.pinned, 'boolean')
})

// ── generated sources, no toolchain needed ──
test('types: api models, request bodies and responses; response models have no optional fields', () => {
  const d = deriveTypes({ doc, parsed, spec: { languages: ['ts'], from: 'api' } })
  const src = d.sources[0].raw
  assert.match(src, /export interface Note \{\n  id: number\n  title: string\n  body: string \| null\n  pinned: boolean/)
  assert.match(src, /export interface NoteStoreRequest \{\n  title: string\n  body\?: string \| null/)
  assert.match(src, /export interface NoteIndexResponse/)
  assert.ok(d.typeSymbols.includes('Note') && d.typeSymbols.includes('NoteStoreRequest'))
})

test('types: from database uses plain names, from both adds a Row suffix', () => {
  const db = deriveTypes({ doc, parsed, spec: { languages: ['ts'], from: 'database', exclude: ['tags'] } }).sources[0].raw
  assert.match(db, /export interface Note \{\n  id: number\n  title: string\n  body: string \| null\n  pinned: boolean\n  created_at: string \| null/)
  assert.doesNotMatch(db, /Tag/)
  const both = deriveTypes({ doc, parsed, spec: { languages: ['ts'], from: 'both' } })
  assert.match(both.sources[0].raw, /export interface NoteRow/)
  assert.match(both.sources[0].raw, /export interface TagRow \{[^}]*deleted_at: string \| null/)
  assert.throws(() => deriveTypes({ doc, parsed, spec: { languages: ['ts'], from: 'nope' } }), /from must be one of/)
})

test('validators: rules are taken from the endpoint validation blocks', () => {
  const d = deriveValidators({ doc, parsed, spec: { languages: ['ts'] } })
  const rules = d.sources.find(s => s.name === 'rules').raw
  assert.match(rules, /NoteStore: \{\n    "title": "required\|string\|max:255"/)
  assert.match(rules, /export function validateNoteUpdate\(/)
  assert.deepEqual(d.stats, { endpoints: 3 })
  assert.throws(() => deriveValidators({ doc, parsed, spec: { languages: ['ts'], include: ['tags'] } }), /No endpoint with a validation/)
})

test('sdk: options are checked', () => {
  const spec = { languages: ['ts'] }
  assert.throws(() => deriveSdk({ doc, spec: { ...spec, style: 'weird' }, project, packageId: 'x' }), /style must be class or functions/)
  assert.throws(() => deriveSdk({ doc, spec: { ...spec, retries: 99 }, project, packageId: 'x' }), /retries/)
  assert.throws(() => deriveSdk({ doc, spec: { ...spec, client_name: 'bad name' }, project, packageId: 'x' }), /client_name/)
  assert.throws(() => deriveSdk({ doc, spec: { ...spec, include: ['ghosts'] }, project, packageId: 'x' }), /No api, routes or auth operations/)
  assert.equal(deriveSdk({ doc, spec, project, packageId: 'notes-sdk' }).stats.clientName, 'NotesClient')
})

test('operations: group, name and multipart come from the document', () => {
  const ops = operations(doc)
  const upload = ops.find(o => o.name === 'upload')
  assert.equal(upload.group, 'note'); assert.equal(upload.body.multipart, true); assert.equal(upload.method, 'POST')
  assert.ok(ops.find(o => o.group === 'auth' && o.name === 'login'))
})

// ── full builds, each verified from the installed archive ──
test('sdk (class): builds, installs and talks HTTP to a mock server for every operation', slow, () => {
  const r = build('sdk', deriveSdk({ doc, spec: { languages: ['ts'], auth: 'bearer', retries: 1 }, project, packageId: 'notes-sdk' }), 'notes-sdk')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(status(r.report, 'client talks HTTP (mock server)'), 'passed')
    assert.match(r.report.steps.find(s => s.name === 'client talks HTTP (mock server)').detail, /11 operations/)
  } finally { done(r) }
})

test('sdk (functions, auth none): verified too', slow, () => {
  const r = build('sdk', deriveSdk({ doc, spec: { languages: ['ts'], style: 'functions', auth: 'none', include: ['notes'] }, project, packageId: 'notes-sdk' }), 'notes-sdk')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.match(fs.readFileSync(path.join(r.out, 'src/index.ts'), 'utf8'), /export const noteIndex = \(client: ApiClient/)
  } finally { done(r) }
})

test('sdk verify has teeth: a client that calls the wrong path fails the run', slow, () => {
  const derived = deriveSdk({ doc, spec: { languages: ['ts'] }, project, packageId: 'notes-sdk' })
  derived.sources[0].raw = derived.sources[0].raw.replace('`/api/notes`, { body, call: options }', '`/api/wrong`, { body, call: options }')
  const r = build('sdk', derived, 'notes-sdk')
  try {
    assert.equal(r.report.verified, 'failed')
    assert.equal(status(r.report, 'client talks HTTP (mock server)'), 'failed')
    assert.match(r.report.steps.find(s => s.name === 'client talks HTTP (mock server)').detail, /sent path/)
  } finally { done(r) }
})

test('types: declarations resolve, sample objects type-check, runtime import is harmless', slow, () => {
  const r = build('types', deriveTypes({ doc, parsed, spec: { languages: ['ts'], from: 'both' } }), 'notes-types')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(status(r.report, 'type check (ESM consumer)'), 'passed')
  } finally { done(r) }
})

test('types verify has teeth: a sample that does not fit the declaration fails the type check', slow, () => {
  const d = deriveTypes({ doc, parsed, spec: { languages: ['ts'], from: 'api' } })
  d.typeSamples.push({ type: 'Note', value: { id: 'not a number' } })
  d.typeSymbols.push('Note')
  const r = build('types', d, 'notes-types')
  try {
    assert.equal(r.report.verified, 'failed')
    assert.equal(status(r.report, 'type check (ESM consumer)'), 'failed')
  } finally { done(r) }
})

test('validators: all shared conformance vectors pass against the installed package', slow, () => {
  assert.ok(fs.existsSync(VECTORS_FILE), 'vectors file exists in the repo')
  const r = build('validators', deriveValidators({ doc, parsed, spec: { languages: ['ts'], emit_vectors: true } }), 'notes-validators')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    const step = r.report.steps.find(s => s.name === 'conformance vectors (installed package)')
    assert.equal(step.status, 'passed'); assert.equal(step.detail, '177 vectors')
    assert.equal(status(r.report, 'tests'), 'passed')
  } finally { done(r) }
})

test('validators verify has teeth: a broken rule fails the vectors', slow, () => {
  const d = deriveValidators({ doc, parsed, spec: { languages: ['ts'] } })
  const engine = d.sources.find(s => s.name === 'engine')
  engine.raw = engine.raw.replace("case 'string':  return typeof v === 'string' ? null : fail()", "case 'string':  return null")
  const r = build('validators', d, 'notes-validators')
  try {
    assert.equal(r.report.verified, 'failed')
    assert.match(r.report.steps.find(s => s.name === 'conformance vectors (installed package)').detail, /vectors failed/)
  } finally { done(r) }
})

test('openapi: spec ships as a module, a json file and an html page; $refs resolve', slow, () => {
  const r = build('openapi', deriveOpenApi({ doc, spec: { server_url: 'https://api.example.com', include_docs_html: true, include: ['notes'] }, project, version: '1.2.0' }), 'notes-openapi')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    const pm = JSON.parse(fs.readFileSync(path.join(r.out, 'package.json'), 'utf8'))
    assert.deepEqual(Object.keys(pm.exports), ['.', './openapi.json', './api-docs.html', './package.json'])
    const spec = JSON.parse(fs.readFileSync(path.join(r.out, 'openapi.json'), 'utf8'))
    assert.equal(spec.servers[0].url, 'https://api.example.com')
    assert.ok(Object.keys(spec.paths).every(p => p.startsWith('/api/notes')))
    assert.ok(pm.files.includes('openapi.json') && pm.files.includes('api-docs.html'))
  } finally { done(r) }
})

test('openapi: an unusable server_url is an error', () => {
  assert.throws(() => deriveOpenApi({ doc, spec: { server_url: 'ftp://x' }, project, version: '1' }), /server_url must be an http\(s\) URL/)
})
