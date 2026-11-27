// ============================================================
// PLUFF PACKAGE DERIVER: openapi v1.0
//
// `kind: openapi` on npm: the OpenAPI 3.1 document export-openapi.js builds, as a package.
//   import { spec } from 'my-api-spec'                runtime object
//   import spec from 'my-api-spec/openapi.json'       the file (import attributes or require)
//   my-api-spec/api-docs.html                          Swagger UI page, when include_docs_html: true
// ============================================================

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { writeOpenApiFiles } from '../../../export-openapi.js'
import { filterDoc, HEADER } from './model.js'

const fail = message => { throw new Error(`[pkg:openapi] ${message}`) }

export function deriveOpenApi({ doc, spec, project, version }) {
  let document = filterDoc(doc, spec.include, spec.exclude)
  if (spec.server_url !== undefined) {
    if (typeof spec.server_url !== 'string' || !/^https?:\/\//.test(spec.server_url)) fail('server_url must be an http(s) URL')
    document = { ...document, servers: [{ url: spec.server_url }] }
  }
  const operationCount = Object.values(document.paths ?? {}).reduce((n, p) => n + Object.keys(p).length, 0)
  if (operationCount === 0) fail('This tatemono declares no @arkzen:api / @arkzen:routes / auth blocks, so there is nothing to document')
  if (project.version !== undefined || version) document = { ...document, info: { ...document.info, version: String(project.version ?? version) } }

  const json = JSON.stringify(document, null, 2)
  const extraFiles = [{ path: 'openapi.json', content: json }]
  const extraExports = { './openapi.json': './openapi.json' }
  const shipFiles = ['openapi.json']
  if (spec.include_docs_html === true) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-openapi-'))
    try {
      const [, htmlFile] = writeOpenApiFiles(document, tmp)
      extraFiles.push({ path: 'api-docs.html', content: fs.readFileSync(htmlFile, 'utf8') })
      extraExports['./api-docs.html'] = './api-docs.html'
      shipFiles.push('api-docs.html')
    } finally { fs.rmSync(tmp, { recursive: true, force: true }) }
  }

  const raw = [
    `// ${HEADER}`,
    `/** The OpenAPI 3.1 document, as a plain object. */`,
    `export const spec: Record<string, any> = ${json}`,
    `export default spec`,
    '',
  ].join('\n')

  const refCheck = [
    `import fs from 'node:fs'`,
    `import { createRequire } from 'node:module'`,
    `import * as mod from ${JSON.stringify('__PACKAGE__')}`,
    `const require = createRequire(import.meta.url)`,
    `const file = JSON.parse(fs.readFileSync(require.resolve(${JSON.stringify('__PACKAGE__/openapi.json')}), 'utf8'))`,
    `if (file.openapi !== '3.1.0') throw new Error('openapi version is ' + file.openapi)`,
    `if (JSON.stringify(mod.spec) !== JSON.stringify(file)) throw new Error('the runtime spec differs from openapi.json')`,
    `const ids = new Set(); let operations = 0`,
    `for (const item of Object.values(file.paths)) for (const [method, op] of Object.entries(item)) {`,
    `  operations++; if (ids.has(op.operationId)) throw new Error('duplicate operationId ' + op.operationId); ids.add(op.operationId)`,
    `}`,
    `const missing = []`,
    `const walk = v => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (k === '$ref') { const n = String(x).split('/').pop(); if (!file.components.schemas[n] && !(file.components.securitySchemes ?? {})[n]) missing.push(x) } else walk(x) } }`,
    `walk(file.paths)`,
    `if (missing.length) throw new Error('unresolved $ref: ' + missing.slice(0, 3).join(', '))`,
    `if (operations !== ${operationCount}) throw new Error('expected ${operationCount} operations, found ' + operations)`,
    `console.log(JSON.stringify({ operations }))`,
  ].join('\n')

  return {
    sources: [{ name: 'index', file: 'src/index.ts', raw }],
    entries: [{ subpath: '.', key: 'index', file: 'src/index.ts' }],
    extraFiles, extraExports, shipFiles,
    symbols: ['spec'], typeSymbols: [], typeSamples: [],
    consumerChecks: [{ name: 'openapi document (installed package)', file: 'check-openapi.mjs', source: refCheck, data: {} }],
    warnings: [],
    description: `OpenAPI 3.1 specification (${operationCount} operations)`,
    stats: { operations: operationCount },
  }
}
