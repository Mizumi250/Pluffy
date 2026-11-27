// ============================================================
// PLUFF PACKAGE DERIVER: validators v1.0
//
// `kind: validators` on npm: the validation rules of every @arkzen:api endpoint, as functions the
// frontend can run before it sends a request. The rule engine is a synchronous, dependency-free
// port of the Express runtime (engine/backend/express/src/runtime/validation.ts), the reference
// the shared conformance vectors are generated from. The built package is verified by running all
// of engine/backend/conformance/validation-vectors.json against the INSTALLED archive.
//
//   export const rules = { NoteStore: { title: 'required|string|max:255' }, ... }
//   export function validateNoteStore(input, options?) -> { ok, value | errors }
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { filterDoc, HEADER, matchId, operations, pascal, tsDeclaration } from './model.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ENGINE_FILE = path.join(HERE, 'templates', 'validation-engine.ts')
export const VECTORS_FILE = path.resolve(HERE, '..', '..', 'backend', 'conformance', 'validation-vectors.json')
const fail = message => { throw new Error(`[pkg:validators] ${message}`) }

export function deriveValidators({ doc, parsed, spec }) {
  const endpoints = []   // { id, name, rules, bodySchema }
  const filtered = filterDoc(doc, spec.include, spec.exclude)
  const ops = operations(filtered)
  const used = new Set()

  for (const api of parsed.apis ?? []) {
    if (!matchId(api.model, spec.include, spec.exclude)) continue
    for (const [epName, ep] of Object.entries(api.endpoints ?? {})) {
      const rules = ep.validation
      if (!rules || Object.keys(rules).length === 0) continue
      let base = `${pascal(api.model)}${pascal(epName)}`
      for (let i = 2; used.has(base); i++) base = `${pascal(api.model)}${pascal(epName)}${i}`
      used.add(base)
      const op = ops.find(o => o.operationId === `${api.controller}_${epName}` || o.operationId.startsWith(`${api.controller}_${epName}_`))
      endpoints.push({ id: base, endpoint: epName, model: api.model, rules, schema: op?.body?.schema ?? null })
    }
  }
  if (endpoints.length === 0) fail('No endpoint with a validation: block matched. Add validation rules to an @arkzen:api endpoint, or check include / exclude')

  const engine = fs.readFileSync(ENGINE_FILE, 'utf8')
  const ruleLines = endpoints.map(e => `  ${e.id}: ${JSON.stringify(e.rules, null, 2).split('\n').map((l, i) => (i ? `  ${l}` : l)).join('\n')},`)
  const inputTypes = endpoints.map(e => (e.schema ? tsDeclaration(`${e.id}Input`, e.schema) : `export type ${e.id}Input = Record<string, unknown>`))
  const functions = endpoints.map(e => [
    `/** Validates the request body of ${e.model}.${e.endpoint}. */`,
    `export function validate${e.id}(input: Record<string, any>, options?: ValidateOptions): ValidationResult<${e.id}Input> {`,
    `  return validate<${e.id}Input>(input, rules.${e.id}, options)`,
    `}`,
  ].join('\n'))

  const generated = [
    `// ${HEADER}`,
    `import { validate, type ValidateOptions, type ValidationResult } from './engine'`,
    '',
    `export const rules = {\n${ruleLines.join('\n')}\n} as const`,
    '',
    ...inputTypes.flatMap(t => [t, '']),
    ...functions.flatMap(f => [f, '']),
  ].join('\n')

  const index = [
    `export * from './engine'`,
    `export * from './rules'`,
    '',
  ].join('\n')

  const symbols = ['validate', 'validateOrThrow', 'ValidationError', 'rules', ...endpoints.map(e => `validate${e.id}`)]
  const typeSymbols = endpoints.map(e => `${e.id}Input`)

  const warnings = []
  const hasVectors = fs.existsSync(VECTORS_FILE)
  const consumerChecks = []
  const extraTests = []
  if (hasVectors) {
    const vectors = fs.readFileSync(VECTORS_FILE, 'utf8')
    consumerChecks.push({
      name: 'conformance vectors (installed package)',
      file: 'check-vectors.mjs',
      data: { 'vectors.json': vectors },
      source: [
        `import fs from 'node:fs'`,
        `import { validate } from ${JSON.stringify('__PACKAGE__')}`,
        `const vectors = JSON.parse(fs.readFileSync(new URL('./vectors.json', import.meta.url), 'utf8'))`,
        `const failures = []`,
        `for (const v of vectors) {`,
        `  const data = { ...(v.data ?? {}) }`,
        `  if ('value' in v) data.field = v.value`,
        `  if (validate(data, { field: v.rule }).ok !== v.pass) failures.push(v.rule + ' value=' + JSON.stringify(v.value) + ' expected pass=' + v.pass)`,
        `}`,
        `if (failures.length) throw new Error(failures.length + ' of ' + vectors.length + ' vectors failed:\\n' + failures.slice(0, 5).join('\\n'))`,
        `console.log(JSON.stringify({ vectors: vectors.length }))`,
      ].join('\n'),
    })
    if (spec.emit_vectors === true) {
      extraTests.push({
        name: 'conformance', file: 'src/conformance.test.ts', header: {},
        raw: [
          `import test from 'node:test'`,
          `import assert from 'node:assert/strict'`,
          `import fs from 'node:fs'`,
          `import { validate } from './engine.ts'`,
          `const vectors = JSON.parse(fs.readFileSync(new URL('./vectors.json', import.meta.url), 'utf8'))`,
          `test('shared conformance vectors', () => {`,
          `  for (const v of vectors) {`,
          `    const data: Record<string, any> = { ...(v.data ?? {}) }`,
          `    if ('value' in v) data.field = v.value`,
          `    assert.equal(validate(data, { field: v.rule }).ok, v.pass, v.rule + ' ' + JSON.stringify(v.value))`,
          `  }`,
          `})`,
        ].join('\n'),
      })
    }
  } else {
    warnings.push('engine/backend/conformance/validation-vectors.json was not found, so the validators could not be checked against the shared vectors (UNVERIFIED).')
  }

  return {
    sources: [
      { name: 'engine', file: 'src/engine.ts', raw: engine },
      { name: 'rules', file: 'src/rules.ts', raw: generated },
      { name: 'index', file: 'src/index.ts', raw: index },
    ],
    entries: [{ subpath: '.', key: 'index', file: 'src/index.ts' }],
    extraFiles: spec.emit_vectors === true && hasVectors ? [{ path: 'src/vectors.json', content: fs.readFileSync(VECTORS_FILE, 'utf8') }] : [],
    extraTests, extraExports: {}, shipFiles: [],
    symbols, typeSymbols, typeSamples: [], consumerChecks, warnings,
    description: `Validators for ${endpoints.length} endpoint(s), ported from the Express runtime and checked against the shared conformance vectors`,
    stats: { endpoints: endpoints.length },
  }
}
