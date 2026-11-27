// ============================================================
// PLUFF PACKAGE TYPE GENERATION v1.0
//
// TypeScript declarations shared by the `types` and `sdk` kinds.
//   schemaDeclarations(doc)            one declaration per OpenAPI component schema (response models)
//   requestDeclarations(doc, ops)      body, query and inline response types per operation (Request / Query / Response)
//   databaseDeclarations(databases, { include, exclude, suffix })   one interface per table
// ============================================================

import { matchId, pascal, singular, tsDeclaration, tsType } from './model.js'

export function schemaDeclarations(doc) {
  const out = []
  for (const [name, schema] of Object.entries(doc.components?.schemas ?? {})) {
    out.push({ name: pascal(name), text: tsDeclaration(pascal(name), schema, { allRequired: true }), schema })
  }
  return out
}

export function requestDeclarations(doc, ops) {
  const used = new Set(Object.keys(doc.components?.schemas ?? {}).map(pascal))
  const unique = base => { let n = base; for (let i = 2; used.has(n); i++) n = `${base}${i}`; used.add(n); return n }
  const declarations = []
  const names = new Map()   // operationId -> { body, query }
  for (const op of ops) {
    const entry = {}
    if (op.body) {
      const name = unique(`${pascal(op.group)}${pascal(op.name)}Request`)
      entry.body = name
      declarations.push({ name, text: tsDeclaration(name, op.body.schema), schema: op.body.schema, kind: 'request', operationId: op.operationId })
    }
    if (op.query.length) {
      const name = unique(`${pascal(op.group)}${pascal(op.name)}Query`)
      entry.query = name
      const schema = { type: 'object', properties: Object.fromEntries(op.query.map(q => [q.name, q.schema])), required: op.query.filter(q => q.required).map(q => q.name) }
      declarations.push({ name, text: tsDeclaration(name, schema), schema, kind: 'query', operationId: op.operationId })
    }
    const r = op.response
    if (r && !r.$ref && !r.oneOf && r.properties && Object.keys(r.properties).length > 0) {
      const name = unique(`${pascal(op.group)}${pascal(op.name)}Response`)
      entry.response = name
      declarations.push({ name, text: tsDeclaration(name, r, { allRequired: true }), schema: r, kind: 'response', operationId: op.operationId })
    }
    names.set(op.operationId, entry)
  }
  return { declarations, names }
}

const columnType = col => {
  const t = String(col.type ?? 'string').toLowerCase()
  let ts
  if (/^(string|char|text|longtext|mediumtext|tinytext|uuid|ulid|enum)/.test(t)) ts = 'string'
  else if (/int/.test(t)) ts = 'number'
  else if (/decimal|float|double|numeric|real/.test(t)) ts = 'number'
  else if (/bool/.test(t)) ts = 'boolean'
  else if (t === 'date' || /datetime|timestamp/.test(t)) ts = 'string'
  else if (/json/.test(t)) ts = 'unknown'
  else ts = 'string'
  return col.nullable && ts !== 'unknown' ? `${ts} | null` : ts
}

export function databaseDeclarations(databases, { include, exclude, suffix = '' } = {}) {
  const list = Array.isArray(databases) ? databases : Object.values(databases ?? {})
  const out = []
  for (const db of list) {
    if (!matchId(db.table, include, exclude)) continue
    const name = `${pascal(singular(db.table))}${suffix}`
    const lines = []
    let hasId = false
    for (const [col, def] of Object.entries(db.columns ?? {})) {
      if (def.primary) hasId = true
      lines.push(`  ${/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(col) ? col : JSON.stringify(col)}: ${columnType(def)}`)
    }
    if (!hasId) lines.unshift('  id: number')
    if (db.timestamps) lines.push('  created_at: string | null', '  updated_at: string | null')
    if (db.softDeletes) lines.push('  deleted_at: string | null')
    out.push({ name, table: db.table, text: `/** Row of the \`${db.table}\` table. */\nexport interface ${name} {\n${lines.join('\n')}\n}`, columns: db.columns ?? {} })
  }
  return out
}

export { tsType }
