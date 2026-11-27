// ============================================================
// PLUFF PACKAGE DERIVER: types v1.0
//
// `kind: types` on npm: TypeScript declarations generated from the tatemono's own blocks.
//   from: api       the response models and request bodies the API really uses (default)
//   from: database  one interface per @arkzen:database table
//   from: both      both; the table interfaces get a "Row" suffix so the names never clash
// The runtime module is empty on purpose: the package is declarations only.
// ============================================================

import { filterDoc, hasBinary, HEADER, operations, sampleValue } from './model.js'
import { databaseDeclarations, requestDeclarations, schemaDeclarations } from './typegen.js'

const fail = message => { throw new Error(`[pkg:types] ${message}`) }

export function deriveTypes({ doc, parsed, spec }) {
  const from = spec.from ?? 'api'
  const filtered = filterDoc(doc, spec.include, spec.exclude)
  const parts = []
  const typeSymbols = []
  const typeSamples = []

  if (from === 'api' || from === 'both') {
    const models = schemaDeclarations(filtered)
    const ops = operations(filtered)
    const { declarations } = requestDeclarations(filtered, ops)
    if (models.length === 0 && declarations.length === 0) fail('The tatemono has no api, routes or auth blocks to take types from (from: api). Use from: database, or add an @arkzen:api block')
    parts.push('// ── API response models ──', ...models.map(m => m.text), '', '// ── API request bodies, query strings and responses ──', ...declarations.map(d => d.text))
    for (const m of models) { typeSymbols.push(m.name); typeSamples.push({ type: m.name, value: sampleValue(m.schema, filtered) }) }
    for (const d of declarations) { typeSymbols.push(d.name); if (d.kind !== 'query' && !hasBinary(d.schema)) typeSamples.push({ type: d.name, value: sampleValue(d.schema, filtered) }) }
  }
  if (from === 'database' || from === 'both') {
    const rows = databaseDeclarations(parsed.databases, { include: spec.include, exclude: spec.exclude, suffix: from === 'both' ? 'Row' : '' })
    if (rows.length === 0) fail('No @arkzen:database table matches (from: database). Add a database block or check include / exclude')
    parts.push('', '// ── Database rows ──', ...rows.map(r => r.text))
    for (const r of rows) typeSymbols.push(r.name)
  }
  if (!['api', 'database', 'both'].includes(from)) fail(`from must be one of: api, database, both (got ${JSON.stringify(from)})`)

  const raw = `// ${HEADER}\n\n${parts.join('\n\n').replace(/\n{3,}/g, '\n\n')}\n`
  // Type declarations that have no runtime value still need a runtime module for the bundler.
  return {
    sources: [{ name: 'index', file: 'src/index.ts', raw }],
    entries: [{ subpath: '.', key: 'index', file: 'src/index.ts' }],
    extraFiles: [], extraExports: {}, shipFiles: [],
    symbols: [], typeSymbols, typeSamples, consumerChecks: [], warnings: [],
    description: 'TypeScript types generated from the tatemono database and api blocks',
  }
}
