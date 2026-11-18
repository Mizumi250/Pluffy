#!/usr/bin/env node

// ============================================================
// PLUFFY — OPENAPI EXPORT
//
// Turns the API blocks a tatemono already declares into an OpenAPI 3.1 spec
// plus a self-contained Swagger UI page. Nothing new has to be written in the
// tatemono: it reads the SAME parsed output the backend builders use
// (@arkzen:database, @arkzen:api, @arkzen:routes, meta.auth).
//
// Output (folder):
//   openapi.json     the spec (import into Postman / Insomnia / codegen tools)
//   api-docs.html    Swagger UI with the spec inlined — open it directly, no server needed
//
// Used three ways:
//   node export.js <name> --openapi            → <project>/openapi/
//   node mizumi.js export … (wizard asks)      → same, via export.js
//   node mizumi.js openapi <name>              → projects/openapi/<name>/
//   node export-openapi.js <name> [flags]      → same as the line above
//
// Flags (standalone):
//   --backend=<name>    response shapes differ slightly per backend (default: arkzen.json activeBackend)
//   --stack=<name>      which frontend engine runs the parser (default: arkzen.json activeStack)
//   --api-url=<url>     server URL written into the spec (default: http://localhost:8000)
//   --out=<dir>         output folder (default: projects/openapi/<name>)
//
// The parser is TypeScript, so it runs through the tsx that ships in the
// frontend engine's node_modules (same trick export.js uses for the engine build).
// This module never throws: it returns { ok:false, reason } so an export can
// carry on without docs.
// ============================================================

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SWAGGER_UI_VERSION = '5.17.14'

// ─────────────────────────────────────────────
// 1. PARSE (runs the engine's own parser through tsx)
// ─────────────────────────────────────────────

const STACK_TO_FRONTEND = { tauri: 'react-vite', electron: 'react-vite' }
const FALLBACK_FRONTENDS = ['nextjs', 'react-vite', 'astro', 'tanstack-start', 'react-inertia', 'expo', 'react-native']

export function findFrontendDir(engineDir, stack) {
  const preferred = STACK_TO_FRONTEND[stack] ?? stack
  const candidates = [preferred, ...FALLBACK_FRONTENDS].filter(Boolean)
  for (const name of [...new Set(candidates)]) {
    const dir = path.join(engineDir, 'frontend', name)
    const tsx = path.join(dir, 'node_modules', 'tsx', 'dist', 'cli.mjs')
    const parser = path.join(dir, 'arkzen', 'core', 'parser.ts')
    if (fs.existsSync(tsx) && fs.existsSync(parser)) return dir
  }
  return null
}

function parseWithEngine(frontendDir, tatPath) {
  const tsxCli = path.join(frontendDir, 'node_modules', 'tsx', 'dist', 'cli.mjs')
  const outFile = path.join(os.tmpdir(), `pluffy-openapi-${process.pid}-${Date.now()}.json`)
  const tmpScript = path.join(frontendDir, '__openapi_tmp.ts')
  fs.writeFileSync(tmpScript, [
    `import fs from 'node:fs'`,
    `import { parseTatemono } from './arkzen/core/parser'`,
    `const t: any = parseTatemono(${JSON.stringify(tatPath)})`,
    `fs.writeFileSync(${JSON.stringify(outFile)}, JSON.stringify({`,
    `  meta: t.meta, databases: t.databases, apis: t.apis, customRoutes: t.customRoutes,`,
    `}))`,
    ``,
  ].join('\n'))

  let result
  try {
    result = spawnSync(process.execPath, [tsxCli, tmpScript], { cwd: frontendDir, stdio: 'pipe', timeout: 60000 })
  } finally {
    if (fs.existsSync(tmpScript)) fs.unlinkSync(tmpScript)
  }

  if (result.status !== 0 || !fs.existsSync(outFile)) {
    const err = `${result.stderr ?? ''}${result.stdout ?? ''}`.split('\n').filter(l => l.trim()).slice(-6).join(' | ')
    return { error: err || 'parser produced no output' }
  }
  try {
    return { parsed: JSON.parse(fs.readFileSync(outFile, 'utf-8')) }
  } finally {
    fs.unlinkSync(outFile)
  }
}

// ─────────────────────────────────────────────
// 2. SCHEMA HELPERS
// ─────────────────────────────────────────────

function columnSchema(col) {
  const ty = String(col.type ?? 'string').toLowerCase()
  let s
  if (/^(string|char|text|longtext|mediumtext|tinytext|uuid|ulid|enum)/.test(ty)) s = { type: 'string' }
  else if (/int/.test(ty)) s = { type: 'integer' }
  else if (/decimal|float|double|numeric|real/.test(ty)) s = { type: 'number' }
  else if (/bool/.test(ty)) s = { type: 'boolean' }
  else if (ty === 'date') s = { type: 'string', format: 'date' }
  else if (/datetime|timestamp/.test(ty)) s = { type: 'string', format: 'date-time' }
  else if (/json/.test(ty)) s = {}
  else s = { type: 'string' }
  if (col.length && s.type === 'string') s.maxLength = col.length
  if (col.default !== undefined && col.default !== null) s.default = col.default
  if (col.nullable && typeof s.type === 'string') s.type = [s.type, 'null']
  return s
}

// "required|string|max:255|in:a,b" → JSON Schema (Laravel-style rule strings, shared by every backend)
function ruleSchema(rules) {
  const s = {}
  let required = false
  let nullable = false
  let confirmed = false
  for (const part of String(rules ?? '').split('|')) {
    const idx = part.indexOf(':')
    const k = idx === -1 ? part : part.slice(0, idx)
    const v = idx === -1 ? '' : part.slice(idx + 1)
    switch (k) {
      case 'required': required = true; break
      case 'nullable': nullable = true; break
      case 'confirmed': confirmed = true; break
      case 'string': s.type ??= 'string'; break
      case 'integer': case 'int': s.type = 'integer'; break
      case 'numeric': case 'decimal': s.type = 'number'; break
      case 'boolean': case 'bool': s.type = 'boolean'; break
      case 'array': s.type = 'array'; break
      case 'email': s.type ??= 'string'; s.format = 'email'; break
      case 'url': s.type ??= 'string'; s.format = 'uri'; break
      case 'uuid': s.type ??= 'string'; s.format = 'uuid'; break
      case 'date': s.type ??= 'string'; s.format = 'date'; break
      case 'date_format': s.type ??= 'string'; break
      case 'file': case 'image': s.type = 'string'; s.format = 'binary'; break
      case 'in': s.enum = v.split(','); break
      case 'max':
        if (s.type === 'integer' || s.type === 'number') s.maximum = Number(v)
        else if (s.type === 'array') s.maxItems = Number(v)
        else if (s.format === 'binary') s.description = `Max ${v} KB`
        else s.maxLength = Number(v)
        break
      case 'min':
        if (s.type === 'integer' || s.type === 'number') s.minimum = Number(v)
        else if (s.type === 'array') s.minItems = Number(v)
        else s.minLength = Number(v)
        break
      default: break
    }
  }
  s.type ??= 'string'
  if (nullable) s.type = [s.type, 'null']
  return { schema: s, required, confirmed }
}

function buildRequestBody(validation, { multipart }) {
  const properties = {}
  const required = []
  const starred = {}
  for (const [field, rules] of Object.entries(validation)) {
    if (field.endsWith('.*')) { starred[field.slice(0, -2)] = ruleSchema(rules).schema; continue }
    if (field.includes('.')) continue // nested rules are validated by the backend, not described here
    const r = ruleSchema(rules)
    properties[field] = r.schema
    if (r.required) required.push(field)
    if (r.confirmed) {
      properties[`${field}_confirmation`] = { type: 'string' }
      if (r.required) required.push(`${field}_confirmation`)
    }
  }
  for (const [base, items] of Object.entries(starred)) {
    if (properties[base]) {
      const nullable = Array.isArray(properties[base].type)
      properties[base] = { ...properties[base], type: nullable ? ['array', 'null'] : 'array', items }
    }
  }
  return {
    required: required.length > 0,
    content: {
      [multipart ? 'multipart/form-data' : 'application/json']: {
        schema: { type: 'object', properties, ...(required.length ? { required } : {}) },
      },
    },
  }
}

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')

// Model → its @arkzen:database table. "Inventory" ↔ "inventories", "Item" ↔ "items", "Address" ↔ "addresses".
function findTable(model, databases, apiTable) {
  const dbs = Array.isArray(databases) ? databases : Object.values(databases ?? {})
  if (apiTable) {
    const exact = dbs.find(d => d.table === apiTable)
    if (exact) return exact
  }
  const m = norm(model)
  const names = new Set([m, `${m}s`, `${m}es`])
  if (m.endsWith('y')) names.add(`${m.slice(0, -1)}ies`)
  const hit = dbs.find(d => names.has(norm(d.table))) ?? dbs.find(d => [...names].some(n => norm(d.table).endsWith(n)))
  if (hit) return hit
  return dbs.length === 1 ? dbs[0] : null
}

// ─────────────────────────────────────────────
// 3. BUILD THE DOCUMENT
// ─────────────────────────────────────────────

const joinPath = (a, b) => (`/${a}/${b}`).replace(/\/+/g, '/').replace(/(.)\/$/, '$1')
const toOpenApiPath = p => p.replace(/\{(\w+)\??\}/g, '{$1}')
const pathParams = p => [...p.matchAll(/\{(\w+)\??\}/g)].map(m => ({
  name: m[1], in: 'path', required: true, schema: { type: m[1] === 'id' ? 'integer' : 'string' },
}))

// How a `collection` / `array` index responds is the one place backends differ:
//   verified plain array        → laravel, laravel-inertia
//   verified {data, count}      → go, rust, fastapi
//   not verified                → documented as either shape
const PLAIN_ARRAY_BACKENDS = new Set(['laravel', 'laravel-inertia'])
const ENVELOPE_BACKENDS = new Set(['go', 'rust', 'fastapi'])

const PAGINATOR_SCHEMA = {
  type: 'object',
  description: 'Laravel-style paginator (every backend emits the same shape).',
  properties: {
    current_page: { type: 'integer' },
    data: { type: 'array', items: {} },
    first_page_url: { type: ['string', 'null'] },
    from: { type: ['integer', 'null'] },
    last_page: { type: 'integer' },
    last_page_url: { type: ['string', 'null'] },
    links: { type: 'array', items: { type: 'object', properties: {
      url: { type: ['string', 'null'] }, label: { type: 'string' }, active: { type: 'boolean' } } } },
    next_page_url: { type: ['string', 'null'] },
    path: { type: 'string' },
    per_page: { type: 'integer' },
    prev_page_url: { type: ['string', 'null'] },
    to: { type: ['integer', 'null'] },
    total: { type: 'integer' },
  },
}

function collectionSchema(ref, backend) {
  const array = { type: 'array', items: ref }
  const envelope = { type: 'object', properties: { data: array, count: { type: 'integer' } } }
  if (PLAIN_ARRAY_BACKENDS.has(backend)) return array
  if (ENVELOPE_BACKENDS.has(backend)) return envelope
  return { oneOf: [array, envelope], description: 'Shape varies slightly by backend.' }
}

function successStatus(method, endpointName, type) {
  if (type === 'job_dispatch' || type === 'event_fire') return '202'
  if (type === 'upload' || type === 'broadcast' || type === 'mail_send' || type === 'notification_trigger' || type === 'command_run') return '201'
  if (method === 'POST' && endpointName === 'store') return '201'
  return '200'
}

export function buildOpenApiDoc(parsed, { backend = 'laravel', serverUrl = 'http://localhost:8000', tatName = '' } = {}) {
  const meta = parsed.meta ?? {}
  const schemas = {
    Message: { type: 'object', properties: { message: { type: 'string' } } },
    ValidationError: { type: 'object', properties: {
      message: { type: 'string' },
      errors: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } },
    } },
  }
  const paths = {}
  const usedIds = new Set()
  let usesAuth = false

  const opId = base => {
    let id = base.replace(/[^A-Za-z0-9_]/g, '_')
    for (let n = 2; usedIds.has(id); n++) id = `${base}_${n}`
    usedIds.add(id)
    return id
  }
  const add = (method, rawPath, op) => {
    const key = toOpenApiPath(rawPath)
    paths[key] ??= {}
    paths[key][method.toLowerCase()] = op
  }
  const isSecured = middleware => (middleware ?? []).some(m => m === 'auth' || String(m).startsWith('auth:') || String(m).startsWith('role'))

  // ── Auth routes (generated by AuthBuilder when meta.auth is true) ──
  if (meta.auth && tatName) {
    const base = `/api/${tatName}/auth`
    schemas.AuthResult = { type: 'object', properties: { user: { type: 'object' }, token: { type: 'string' } } }
    const json = (props, required) => ({ required: true, content: { 'application/json': { schema: { type: 'object', properties: props, required } } } })
    const str = (extra = {}) => ({ type: 'string', ...extra })
    add('POST', `${base}/register`, {
      operationId: opId('Auth_register'), summary: 'Register a user', tags: ['Auth'],
      requestBody: json({ name: str({ maxLength: 255 }), email: str({ format: 'email' }), password: str({ minLength: 8 }), password_confirmation: str() },
        ['name', 'email', 'password', 'password_confirmation']),
      responses: { 201: { description: 'Registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResult' } } } },
        422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } } },
    })
    add('POST', `${base}/login`, {
      operationId: opId('Auth_login'), summary: 'Log in and receive a bearer token', tags: ['Auth'],
      requestBody: json({ email: str({ format: 'email' }), password: str() }, ['email', 'password']),
      responses: { 200: { description: 'Logged in', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResult' } } } },
        422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } } },
    })
    add('POST', `${base}/logout`, {
      operationId: opId('Auth_logout'), summary: 'Log out (revoke the current token)', tags: ['Auth'], security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Logged out', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } }, 401: { description: 'Unauthenticated' } },
    })
    add('GET', `${base}/me`, {
      operationId: opId('Auth_me'), summary: 'Current user', tags: ['Auth'], security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'The authenticated user', content: { 'application/json': { schema: { type: 'object' } } } }, 401: { description: 'Unauthenticated' } },
    })
    usesAuth = true
  }

  // ── Model-backed @arkzen:api blocks ──
  for (const api of parsed.apis ?? []) {
    const db = findTable(api.model, parsed.databases, api.table)
    const props = { id: { type: 'integer' } }
    if (db) {
      for (const [name, col] of Object.entries(db.columns ?? {})) if (!col.primary) props[name] = columnSchema(col)
      if (db.timestamps) {
        props.created_at = { type: ['string', 'null'], format: 'date-time' }
        props.updated_at = { type: ['string', 'null'], format: 'date-time' }
      }
      if (db.softDeletes) props.deleted_at = { type: ['string', 'null'], format: 'date-time' }
    }
    schemas[api.model] = { type: 'object', properties: props }
    const ref = { $ref: `#/components/schemas/${api.model}` }
    const secured = isSecured(api.middleware)

    for (const [name, ep] of Object.entries(api.endpoints ?? {})) {
      const method = String(ep.method ?? 'GET').toUpperCase()
      const full = joinPath(api.prefix, ep.route ?? '/')
      const parameters = pathParams(full)
      for (const [q, spec] of Object.entries(ep.query ?? {})) {
        const def = /default:([^|]*)/.exec(String(spec))
        const r = ruleSchema(String(spec).replace(/default:[^|]*/, ''))
        if (def) r.schema.default = r.schema.type === 'integer' ? Number(def[1]) : def[1]
        parameters.push({ name: q, in: 'query', required: false, schema: r.schema })
      }

      const respCfg = ep.response ?? { type: 'single' }
      let okSchema
      switch (respCfg.type) {
        case 'paginated': okSchema = { ...PAGINATOR_SCHEMA, properties: { ...PAGINATOR_SCHEMA.properties, data: { type: 'array', items: ref } } }
          if (!parameters.some(p => p.name === 'page')) parameters.push({ name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } })
          break
        case 'collection':
        case 'array': okSchema = collectionSchema(ref, backend); break
        case 'message': okSchema = { $ref: '#/components/schemas/Message' }; break
        default: okSchema = ref
      }
      if (ep.type === 'upload_index' || ep.type === 'upload') okSchema = { type: 'object', properties: { data: ep.type === 'upload' ? ref : { type: 'array', items: ref } } }

      const status = successStatus(method, name, ep.type)
      const okResponse = { description: respCfg.value ?? 'Success', content: { 'application/json': { schema: okSchema } } }
      if (respCfg.type === 'message' && respCfg.value) okResponse.content['application/json'].example = { message: respCfg.value }

      const op = {
        operationId: opId(`${api.controller}_${name}`),
        summary: ep.description ?? name,
        tags: [api.model],
        ...(parameters.length ? { parameters } : {}),
        responses: { [status]: okResponse },
      }

      const hasValidation = ep.validation && Object.keys(ep.validation).length > 0
      if (hasValidation && ['POST', 'PUT', 'PATCH'].includes(method)) {
        op.requestBody = buildRequestBody(ep.validation, { multipart: ep.type === 'upload' })
      }
      if (hasValidation || name === 'store' || name === 'update') {
        op.responses['422'] = { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } }
      }
      if (/\{\w+\??\}/.test(full) && method !== 'POST') op.responses['404'] = { description: 'Not found' }
      if (secured) {
        op.security = [{ bearerAuth: [] }]
        op.responses['401'] = { description: 'Unauthenticated' }
        if (api.policy || (api.middleware ?? []).some(m => String(m).startsWith('role'))) op.responses['403'] = { description: 'Forbidden' }
        usesAuth = true
      }
      add(method, full, op)
    }
  }

  // ── @arkzen:routes (no model → request/response shape lives in the handler body) ──
  for (const block of parsed.customRoutes ?? []) {
    const secured = isSecured(block.middleware)
    for (const r of block.routes ?? []) {
      const method = String(r.method ?? 'GET').toUpperCase()
      const op = {
        operationId: opId(`${block.controller}_${r.handler}`),
        summary: r.handler,
        tags: [block.controller],
        ...(pathParams(r.route).length ? { parameters: pathParams(r.route) } : {}),
        responses: { 200: { description: 'Success (shape is defined by the handler body)', content: { 'application/json': { schema: {} } } } },
      }
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        op.requestBody = { required: false, content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } } }
      }
      if (secured) { op.security = [{ bearerAuth: [] }]; op.responses['401'] = { description: 'Unauthenticated' }; usesAuth = true }
      add(method, r.route, op)
    }
  }

  return {
    openapi: '3.1.0',
    info: {
      title: meta.name ?? tatName ?? 'Pluffy API',
      version: String(meta.version ?? '1.0.0'),
      description: [
        meta.description,
        `Generated by Pluffy from \`tatemonos/${tatName || meta.name}/core.tsx\` (backend: ${backend}).`,
      ].filter(Boolean).join('\n\n'),
    },
    servers: [{ url: serverUrl }],
    paths,
    components: {
      schemas,
      ...(usesAuth ? { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', description: 'Sanctum / session token returned by login' } } } : {}),
    },
    'x-pluffy': { tatemono: tatName || meta.name, backend },
  }
}

// ─────────────────────────────────────────────
// 4. WRITE FILES
// ─────────────────────────────────────────────

function swaggerHtml(doc) {
  const spec = JSON.stringify(doc).replace(/</g, '\\u003c')
  const title = String(doc.info?.title ?? 'API').replace(/[<>&"]/g, '')
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — API docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css">
  <style>body { margin: 0; }</style>
</head>
<body>
  <div id="ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js"></script>
  <script>
    // Spec is inlined so this page works straight from disk (no server needed).
    window.ui = SwaggerUIBundle({ spec: ${spec}, dom_id: '#ui', deepLinking: true, tryItOutEnabled: true })
  </script>
</body>
</html>
`
}

export function writeOpenApiFiles(doc, outDir) {
  fs.mkdirSync(outDir, { recursive: true })
  const jsonFile = path.join(outDir, 'openapi.json')
  const htmlFile = path.join(outDir, 'api-docs.html')
  fs.writeFileSync(jsonFile, JSON.stringify(doc, null, 2))
  fs.writeFileSync(htmlFile, swaggerHtml(doc))
  return [jsonFile, htmlFile]
}

// ─────────────────────────────────────────────
// 5. PUBLIC ENTRY — never throws
// ─────────────────────────────────────────────

export function exportOpenApi({ rootDir, tatName, outDir, stack = 'nextjs', backend = 'laravel', apiUrl }) {
  try {
    const tatPath = path.join(rootDir, 'tatemonos', tatName, 'core.tsx')
    if (!fs.existsSync(tatPath)) return { ok: false, reason: `tatemonos/${tatName}/core.tsx not found` }

    const frontendDir = findFrontendDir(path.join(rootDir, 'engine'), stack)
    if (!frontendDir) return { ok: false, reason: 'no frontend engine with node_modules/tsx found — run: node mizumi.js deps install <stack>' }

    const { parsed, error } = parseWithEngine(frontendDir, tatPath)
    if (!parsed) return { ok: false, reason: `parser failed: ${error}` }

    const doc = buildOpenApiDoc(parsed, { backend, tatName, serverUrl: apiUrl })
    const operations = Object.values(doc.paths).reduce((n, p) => n + Object.keys(p).length, 0)
    if (operations === 0) return { ok: false, skipped: true, reason: 'this tatemono declares no @arkzen:api / @arkzen:routes / auth — nothing to document' }

    const files = writeOpenApiFiles(doc, outDir)
    return { ok: true, operations, schemas: Object.keys(doc.components.schemas).length, files, outDir }
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) }
  }
}

// ─────────────────────────────────────────────
// 6. STANDALONE CLI
// ─────────────────────────────────────────────

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (isMain) {
  const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url))
  const flag = name => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3)
  const tatName = process.argv.slice(2).find(a => !a.startsWith('--'))

  if (!tatName) {
    console.log('\n  Usage: node export-openapi.js <tatemono-name> [--backend=<name>] [--stack=<name>] [--api-url=<url>] [--out=<dir>]\n')
    process.exit(1)
  }

  let cfg = {}
  try { cfg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'arkzen.json'), 'utf-8')) } catch { /* defaults */ }
  const backend = flag('backend') ?? cfg.activeBackend ?? 'laravel'
  const stack = flag('stack') ?? cfg.activeStack ?? 'nextjs'
  const outDir = path.resolve(ROOT_DIR, flag('out') ?? path.join('projects', 'openapi', tatName))

  const result = exportOpenApi({ rootDir: ROOT_DIR, tatName, outDir, stack, backend, apiUrl: flag('api-url') })
  if (result.ok) {
    console.log(`\n  ✓ OpenAPI: ${result.operations} operations, ${result.schemas} schemas (backend: ${backend})`)
    console.log(`  → ${path.relative(ROOT_DIR, result.files[0])}`)
    console.log(`  → ${path.relative(ROOT_DIR, result.files[1])}   (open in a browser)\n`)
  } else {
    console.log(`\n  ${result.skipped ? '–' : '✗'} OpenAPI ${result.skipped ? 'skipped' : 'failed'}: ${result.reason}\n`)
    process.exit(result.skipped ? 0 : 1)
  }
}
