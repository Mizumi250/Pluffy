// ============================================================
// PLUFF PACKAGE API MODEL v1.0
//
// Shared helpers for the derived kinds. Everything is read from the OpenAPI 3.1 document that
// export-openapi.js builds from the tatemono's api, routes and database blocks.
//
//   operations(doc)                    flat list of operation descriptors
//   filterDoc(doc, include, exclude)   the same document limited to some apis (by model / controller)
//   tsType(schema)                     JSON Schema -> TypeScript type text
//   pascal / camel / singular          naming helpers
//   sampleValue(schema, doc)           a value that satisfies a schema (used by the verify checks)
// ============================================================

export const pascal = text => String(text).replace(/(^|[^A-Za-z0-9]+)([A-Za-z0-9])/g, (_, __, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, '')
export const camel = text => { const p = pascal(text); return p.charAt(0).toLowerCase() + p.slice(1) }
export const singular = word => {
  const w = String(word)
  if (/ies$/i.test(w)) return w.replace(/ies$/i, 'y')
  if (/(ss|us|is)$/i.test(w)) return w
  if (/(ch|sh|x|z|s)es$/i.test(w)) return w.replace(/es$/i, '')
  if (/s$/i.test(w)) return w.replace(/s$/i, '')
  return w
}
const RESERVED = new Set(['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'await'])
export const safeIdent = name => (RESERVED.has(name) ? `${name}_` : /^[A-Za-z_$]/.test(name) ? name : `_${name}`)
const propKey = name => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name))

export const refNameOf = ref => String(ref).split('/').pop()

// JSON Schema (the subset export-openapi.js writes) -> TypeScript.
export function tsType(schema, indent = '') {
  if (!schema || Object.keys(schema).length === 0) return 'unknown'
  if (schema.$ref) return pascal(refNameOf(schema.$ref))
  if (schema.oneOf) return schema.oneOf.map(s => tsType(s, indent)).join(' | ')
  const isNull = Array.isArray(schema.type) && schema.type.includes('null')
  if (schema.enum) return schema.enum.map(v => JSON.stringify(v)).join(' | ') + (isNull ? ' | null' : '')
  const types = Array.isArray(schema.type) ? schema.type : [schema.type]
  const parts = types.map(t => {
    switch (t) {
      case 'string': return schema.format === 'binary' ? 'Blob | File' : 'string'
      case 'integer': case 'number': return 'number'
      case 'boolean': return 'boolean'
      case 'null': return 'null'
      case 'array': {
        const item = tsType(schema.items, indent)
        return /[|&]/.test(item) ? `Array<${item}>` : `${item}[]`
      }
      case 'object': case undefined: return objectType(schema, indent)
      default: return 'unknown'
    }
  })
  return [...new Set(parts)].join(' | ')
}
function objectType(schema, indent) {
  const props = schema.properties
  if (!props || Object.keys(props).length === 0) {
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') return `Record<string, ${tsType(schema.additionalProperties, indent)}>`
    return 'Record<string, unknown>'
  }
  const required = new Set(schema.required ?? [])
  const inner = `${indent}  `
  const lines = Object.entries(props).map(([key, value]) => `${inner}${propKey(key)}${required.has(key) ? '' : '?'}: ${tsType(value, inner)}`)
  return `{\n${lines.join('\n')}\n${indent}}`
}

// ── operations ───────────────────────────────────────────────────────────────────
const METHODS = ['get', 'post', 'put', 'patch', 'delete']

export function operations(doc) {
  const list = []
  for (const [route, item] of Object.entries(doc.paths ?? {})) {
    for (const method of METHODS) {
      const op = item[method]
      if (!op) continue
      const [first, ...rest] = String(op.operationId).split('_')
      const tag = op.tags?.[0] ?? first
      const success = Object.entries(op.responses ?? {}).find(([code]) => /^2/.test(code))
      const json = success?.[1]?.content?.['application/json']
      const body = op.requestBody?.content
      const multipart = !!body?.['multipart/form-data']
      const bodySchema = (body?.['application/json'] ?? body?.['multipart/form-data'])?.schema
      list.push({
        operationId: op.operationId,
        group: camel(String(tag).replace(/Controller$/, '')),
        name: camel(rest.join('_') || first),
        summary: op.summary ?? '',
        method: method.toUpperCase(),
        path: route,
        pathParams: (op.parameters ?? []).filter(p => p.in === 'path'),
        query: (op.parameters ?? []).filter(p => p.in === 'query'),
        body: bodySchema ? { schema: bodySchema, required: !!op.requestBody?.required, multipart } : null,
        status: success ? Number(success[0]) : 200,
        response: json ? (json.schema ?? {}) : null,
        secured: Array.isArray(op.security) && op.security.length > 0,
      })
    }
  }
  const seen = new Map()   // unique method names inside a group
  for (const op of list) {
    const key = `${op.group}.${op.name}`
    const n = (seen.get(key) ?? 0) + 1
    seen.set(key, n)
    if (n > 1) op.name = `${op.name}${n}`
  }
  return list
}

// Identifier of an operation tag: "Note" -> note, "NoteController" -> note.
const idOf = tag => String(tag).replace(/Controller$/, '').toLowerCase()
const forms = id => [id, `${id}s`, `${id}es`, id.endsWith('y') ? `${id.slice(0, -1)}ies` : id]

export function filterDoc(doc, include, exclude) {
  const inc = Array.isArray(include) && include.length ? include.map(s => String(s).toLowerCase()) : null
  const exc = Array.isArray(exclude) ? exclude.map(s => String(s).toLowerCase()) : []
  if (!inc && exc.length === 0) return doc
  const keep = tag => {
    const id = idOf(tag)
    const hit = list => list.some(x => forms(id).includes(x) || id === singular(x))
    return (!inc || hit(inc)) && !hit(exc)
  }
  const paths = {}
  for (const [route, item] of Object.entries(doc.paths ?? {})) {
    const kept = {}
    for (const method of METHODS) {
      const op = item[method]
      if (op && keep(op.tags?.[0] ?? '')) kept[method] = op
    }
    if (Object.keys(kept).length) paths[route] = kept
  }
  const used = new Set()
  const scan = value => {
    if (Array.isArray(value)) return value.forEach(scan)
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        if (k === '$ref' && typeof v === 'string') {
          const name = refNameOf(v)
          if (!used.has(name)) { used.add(name); scan(doc.components?.schemas?.[name]) }
        } else scan(v)
      }
    }
  }
  scan(paths)
  const schemas = Object.fromEntries(Object.entries(doc.components?.schemas ?? {}).filter(([name]) => used.has(name)))
  return { ...doc, paths, components: { ...doc.components, schemas } }
}

// A value satisfying a schema, for the checks the generator writes into the verify step.
export function sampleValue(schema, doc, depth = 0) {
  if (!schema || depth > 4) return null
  if (schema.$ref) return sampleValue(doc.components?.schemas?.[refNameOf(schema.$ref)], doc, depth + 1)
  if (schema.oneOf) return sampleValue(schema.oneOf[0], doc, depth + 1)
  if (schema.enum) return schema.enum[0]
  const types = Array.isArray(schema.type) ? schema.type.filter(t => t !== 'null') : [schema.type]
  switch (types[0]) {
    case 'integer': return Math.max(schema.minimum ?? 1, 1)
    case 'number': return Math.max(schema.minimum ?? 1.5, 1.5)
    case 'boolean': return true
    case 'array': return [sampleValue(schema.items, doc, depth + 1)]
    case 'object': case undefined: {
      const out = {}
      for (const [k, v] of Object.entries(schema.properties ?? {})) out[k] = sampleValue(v, doc, depth + 1)
      return out
    }
    default: {
      if (schema.format === 'email') return 'a@example.com'
      if (schema.format === 'uri') return 'https://example.com'
      if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000'
      if (schema.format === 'date') return '2026-01-31'
      if (schema.format === 'date-time') return '2026-01-31T10:00:00Z'
      return 'x'.repeat(Math.min(Math.max(schema.minLength ?? 1, 1), schema.maxLength ?? 64))
    }
  }
}

// Does an api tag or a table name pass an include / exclude filter? "Note" matches note, notes, Note, NoteController.
export function matchId(name, include, exclude) {
  const id = idOf(name)
  const hit = list => list.some(x => forms(id).includes(String(x).toLowerCase()) || id === singular(String(x).toLowerCase()))
  const inc = Array.isArray(include) && include.length ? include : null
  const exc = Array.isArray(exclude) ? exclude : []
  return (!inc || hit(inc)) && !hit(exc)
}

// `export interface Name { ... }` for an object schema, `export type Name = ...` for anything else.
// allRequired: response models always carry every property, so none is optional.
export function tsDeclaration(name, schema, { allRequired = false } = {}) {
  const isObject = schema && (schema.type === 'object' || schema.properties) && !schema.oneOf
  if (!isObject || !schema.properties || Object.keys(schema.properties).length === 0) return `export type ${name} = ${tsType(schema)}`
  const required = new Set(allRequired ? Object.keys(schema.properties) : (schema.required ?? []))
  const lines = Object.entries(schema.properties).map(([key, value]) => `  ${propKey(key)}${required.has(key) ? '' : '?'}: ${tsType(value, '  ')}`)
  return `export interface ${name} {\n${lines.join('\n')}\n}`
}

export const HEADER = 'Generated by Pluffy from the tatemono\'s database and api blocks. Do not edit: regenerate with `node mizumi.js export <tatemono> package`.'

// JSON cannot carry a file, so a schema with a binary field cannot be shown as a sample object.
export function hasBinary(schema, depth = 0) {
  if (!schema || typeof schema !== 'object' || depth > 6) return false
  if (schema.format === 'binary') return true
  if (schema.items && hasBinary(schema.items, depth + 1)) return true
  return Object.values(schema.properties ?? {}).some(v => hasBinary(v, depth + 1))
}
