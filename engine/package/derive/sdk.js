// ============================================================
// PLUFF PACKAGE DERIVER: sdk v1.0
//
// `kind: sdk` on npm: a typed TypeScript HTTP client generated from the tatemono's api, routes and
// auth blocks (through the OpenAPI document export-openapi.js builds).
//
//   style: class      class NotesClient { note = { index(), show(id), store(body), ... } }   (default)
//   style: functions  noteIndex(client, query?), noteShow(client, id), ...
//   auth: bearer      options.token (string or function) sent as "Authorization: Bearer ..."
//   retries: N        GET requests and network errors / 502 / 503 / 504 are retried
//
// The built package is verified against a mock HTTP server: every operation is called through the
// INSTALLED archive and the request the server receives (method, path, auth header, body) is checked.
// ============================================================

import { filterDoc, HEADER, operations, pascal, camel, safeIdent, sampleValue, tsType } from './model.js'
import { requestDeclarations, schemaDeclarations } from './typegen.js'

const fail = message => { throw new Error(`[pkg:sdk] ${message}`) }
const upperSnake = text => String(text).replace(/[^A-Za-z0-9]+/g, '_').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()

const RUNTIME = `declare const process: { env?: Record<string, string | undefined> } | undefined

export interface ClientOptions {
  /** Server URL. Defaults to the BASE_URL_ENV environment variable, then to DEFAULT_BASE_URL. */
  baseUrl?: string
  /** Bearer token, or a function that returns one (called for every request). */
  token?: string | (() => string | undefined | Promise<string | undefined>)
  /** Extra headers sent with every request. */
  headers?: Record<string, string>
  /** A fetch implementation. Defaults to the global fetch. */
  fetch?: typeof fetch
  /** Retries for GET requests and for network errors, 502, 503 and 504. Default RETRIES. */
  retries?: number
}

export interface CallOptions {
  signal?: AbortSignal
  headers?: Record<string, string>
}

/** Thrown for every non-2xx response. \`errors\` is filled for 422 validation errors. */
export class ApiError extends Error {
  readonly status: number
  readonly body: unknown
  readonly errors?: Record<string, string[]>
  constructor(status: number, body: unknown) {
    const message = body && typeof body === 'object' && typeof (body as { message?: unknown }).message === 'string'
      ? (body as { message: string }).message
      : \`Request failed with status \${status}\`
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    const errors = body && typeof body === 'object' ? (body as { errors?: unknown }).errors : undefined
    if (errors && typeof errors === 'object') this.errors = errors as Record<string, string[]>
  }
}

type RequestInput = { query?: object; body?: unknown; multipart?: boolean; call?: CallOptions }

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

function appendQuery(params: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined || value === null) return
  if (Array.isArray(value)) { for (const item of value) appendQuery(params, \`\${key}[]\`, item); return }
  params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
}

function toFormData(body: unknown): FormData {
  const form = new FormData()
  const add = (key: string, value: unknown): void => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) { for (const item of value) add(\`\${key}[]\`, item); return }
    if (typeof Blob !== 'undefined' && value instanceof Blob) form.append(key, value)
    else form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
  }
  for (const [key, value] of Object.entries((body ?? {}) as Record<string, unknown>)) add(key, value)
  return form
}

/** The HTTP layer every generated method goes through. */
export class ApiClient {
  readonly options: ClientOptions
  constructor(options: ClientOptions = {}) {
    this.options = options
  }

  get baseUrl(): string {
    const env = typeof process !== 'undefined' ? process?.env?.BASE_URL_ENV : undefined
    return (this.options.baseUrl ?? env ?? DEFAULT_BASE_URL).replace(/\\/+$/, '')
  }

  async request<T>(method: string, path: string, input: RequestInput = {}): Promise<T> {
    const url = new URL(this.baseUrl + path)
    for (const [key, value] of Object.entries(input.query ?? {})) appendQuery(url.searchParams, key, value)

    const headers: Record<string, string> = { Accept: 'application/json', ...this.options.headers, ...input.call?.headers }
    AUTH_BLOCK
    let body: BodyInit | undefined
    if (input.body !== undefined) {
      if (input.multipart) body = toFormData(input.body)
      else { body = JSON.stringify(input.body); headers['Content-Type'] = 'application/json' }
    }

    const doFetch = this.options.fetch ?? fetch
    const retries = method === 'GET' ? (this.options.retries ?? RETRIES) : 0
    for (let attempt = 0; ; attempt++) {
      let response: Response
      try {
        response = await doFetch(url, { method, headers, body, signal: input.call?.signal })
      } catch (error) {
        if (attempt < retries && !(input.call?.signal?.aborted)) { await sleep(200 * (attempt + 1)); continue }
        throw error
      }
      if (attempt < retries && [502, 503, 504].includes(response.status)) { await sleep(200 * (attempt + 1)); continue }
      const text = response.status === 204 ? '' : await response.text()
      let parsed: unknown = text
      if (text) { try { parsed = JSON.parse(text) } catch { /* plain text body */ } }
      if (!response.ok) throw new ApiError(response.status, parsed)
      return (text ? parsed : undefined) as T
    }
  }
}`

export function deriveSdk({ doc, spec, project, packageId }) {
  const filtered = filterDoc(doc, spec.include, spec.exclude)
  const ops = operations(filtered)
  if (ops.length === 0) fail('No api, routes or auth operations are left after include / exclude. Add an @arkzen:api block or check the filters')

  const style = spec.style ?? 'class'
  const auth = spec.auth ?? 'bearer'
  if (!['class', 'functions'].includes(style)) fail(`style must be class or functions (got ${JSON.stringify(style)})`)
  if (!['bearer', 'none'].includes(auth)) fail(`auth must be bearer or none (got ${JSON.stringify(auth)})`)
  const retries = spec.retries ?? 0
  if (!Number.isInteger(retries) || retries < 0 || retries > 10) fail('retries must be a whole number from 0 to 10')

  const base = pascal(String(packageId).replace(/^@[^/]+\//, '').replace(/[-_.]?sdk$/i, '')) || 'Api'
  const clientName = spec.client_name ?? `${base}Client`
  if (!/^[A-Z][A-Za-z0-9]*$/.test(clientName)) fail(`client_name must be a PascalCase identifier (got ${JSON.stringify(clientName)})`)
  const envName = spec.base_url_env ?? `${upperSnake(base)}_BASE_URL`
  if (!/^[A-Z][A-Z0-9_]*$/.test(envName)) fail('base_url_env must be an UPPER_SNAKE_CASE name')
  const defaultUrl = (filtered.servers?.[0]?.url ?? 'http://localhost:8000')

  const CLASH = new Set(['request', 'options', 'baseUrl', 'constructor'])
  for (const op of ops) if (CLASH.has(op.group)) op.group = `${op.group}Api`
  const models = schemaDeclarations(filtered)
  const { declarations, names } = requestDeclarations(filtered, ops)

  const authBlock = auth === 'bearer'
    ? `const token = typeof this.options.token === 'function' ? await this.options.token() : this.options.token\n    if (token) headers.Authorization = \`Bearer \${token}\``
    : `// auth: none, no Authorization header is sent`
  let runtime = RUNTIME.replace('AUTH_BLOCK', authBlock).replaceAll('BASE_URL_ENV', envName).replaceAll('DEFAULT_BASE_URL', JSON.stringify(defaultUrl)).replaceAll('RETRIES', String(retries))
  if (auth === 'none') runtime = runtime.replace(/  \/\*\* Bearer token[\s\S]*?token\?:[^\n]*\n/, '')

  // ── methods ──
  const pathTemplate = op => '`' + op.path.replace(/\{(\w+)\}/g, (_, name) => `\${encodeURIComponent(String(${safeIdent(name)}))}`) + '`'
  const describe = op => {
    const params = []
    for (const p of op.pathParams) params.push({ name: safeIdent(p.name), type: tsType(p.schema) === 'number' ? 'number' : 'string', raw: p.name })
    const entry = names.get(op.operationId) ?? {}
    if (op.body) params.push({ name: 'body', type: entry.body, optional: !op.body.required })
    if (entry.query) params.push({ name: 'query', type: entry.query, optional: true })
    params.push({ name: 'options', type: 'CallOptions', optional: true })
    const ret = entry.response ?? (op.response && Object.keys(op.response).length ? tsType(op.response) : 'void')
    const input = []
    if (entry.query) input.push('query')
    if (op.body) input.push('body', ...(op.body.multipart ? ['multipart: true'] : []))
    input.push('call: options')
    const args = params.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ')
    const call = `request<${ret}>(${JSON.stringify(op.method)}, ${pathTemplate(op)}, { ${input.join(', ')} })`
    return { args, call, ret, params }
  }

  let body
  if (style === 'class') {
    const groups = new Map()
    for (const op of ops) { if (!groups.has(op.group)) groups.set(op.group, []); groups.get(op.group).push(op) }
    const lines = []
    for (const [group, list] of groups) {
      lines.push(`  readonly ${safeIdent(group)} = {`)
      for (const op of list) {
        const d = describe(op)
        lines.push(`    /** ${op.method} ${op.path}${op.summary ? ` : ${op.summary}` : ''} */`, `    ${safeIdent(op.name)}: (${d.args}): Promise<${d.ret}> => this.${d.call},`)
      }
      lines.push('  }', '')
    }
    body = `export class ${clientName} extends ApiClient {\n${lines.join('\n').replace(/\n$/, '')}\n}`
  } else {
    const fns = ops.map(op => {
      const d = describe(op)
      const fn = safeIdent(camel(`${op.group}_${op.name}`))
      return `/** ${op.method} ${op.path}${op.summary ? ` : ${op.summary}` : ''} */\nexport const ${fn} = (client: ApiClient, ${d.args}): Promise<${d.ret}> => client.${d.call}`
    })
    body = fns.join('\n\n')
  }

  const raw = [
    `// ${HEADER}`,
    '',
    '// ── Models ──',
    ...models.map(m => m.text),
    '',
    '// ── Request bodies, query strings and responses ──',
    ...declarations.map(d => d.text),
    '',
    '// ── HTTP layer ──',
    runtime,
    '',
    '// ── Operations ──',
    body,
    '',
  ].join('\n').replace(/\n{3,}/g, '\n\n')

  // ── verification: a mock server and one call per operation, through the installed archive ──
  const plan = ops.map(op => {
    const values = op.pathParams.map(p => (tsType(p.schema) === 'number' ? 7 : 'abc'))
    let i = 0
    const resolved = op.path.replace(/\{(\w+)\}/g, () => encodeURIComponent(String(values[i++])))
    return {
      group: safeIdent(op.group), name: safeIdent(op.name), fn: safeIdent(camel(`${op.group}_${op.name}`)),
      method: op.method, path: resolved, pathArgs: values, status: op.status,
      body: op.body ? sampleValue(op.body.schema, filtered) : undefined, multipart: !!op.body?.multipart,
      hasQuery: (names.get(op.operationId) ?? {}).query !== undefined,
    }
  })
  const check = [
    `import http from 'node:http'`,
    `import * as sdk from ${JSON.stringify('__PACKAGE__')}`,
    `const PLAN = ${JSON.stringify(plan)}`,
    `const STYLE = ${JSON.stringify(style)}`,
    `const AUTH = ${JSON.stringify(auth)}`,
    `const seen = []`,
    `let nextStatus = null`,
    `const server = http.createServer((req, res) => {`,
    `  const chunks = []`,
    `  req.on('data', c => chunks.push(c))`,
    `  req.on('end', () => {`,
    `    seen.push({ method: req.method, url: req.url, auth: req.headers.authorization, type: req.headers['content-type'] ?? '', body: Buffer.concat(chunks).toString('utf8') })`,
    `    if (nextStatus === 422) { res.writeHead(422, { 'content-type': 'application/json' }); res.end(JSON.stringify({ message: 'Invalid', errors: { name: ['is required'] } })); return }`,
    `    res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}')`,
    `  })`,
    `})`,
    `await new Promise(r => server.listen(0, '127.0.0.1', r))`,
    `const baseUrl = 'http://127.0.0.1:' + server.address().port`,
    `try {`,
    `  const Client = STYLE === 'class' ? sdk[${JSON.stringify(clientName)}] : sdk.ApiClient`,
    `  const client = new Client({ baseUrl, ...(AUTH === 'bearer' ? { token: async () => 'tok-1' } : {}) })`,
    `  for (const p of PLAN) {`,
    `    const args = [...p.pathArgs]`,
    `    if (p.body !== undefined) args.push(p.body)`,
    `    seen.length = 0`,
    `    if (STYLE === 'class') await client[p.group][p.name](...args)`,
    `    else await sdk[p.fn](client, ...args)`,
    `    const got = seen[0]`,
    `    const label = p.method + ' ' + p.path`,
    `    if (!got) throw new Error(label + ': no request reached the server')`,
    `    if (got.method !== p.method) throw new Error(label + ': sent method ' + got.method)`,
    `    if (got.url.split('?')[0] !== p.path) throw new Error(label + ': sent path ' + got.url)`,
    `    if (AUTH === 'bearer' && got.auth !== 'Bearer tok-1') throw new Error(label + ': Authorization header was ' + got.auth)`,
    `    if (AUTH === 'none' && got.auth) throw new Error(label + ': sent an Authorization header although auth is none')`,
    `    if (p.body !== undefined && !p.multipart && JSON.stringify(JSON.parse(got.body)) !== JSON.stringify(p.body)) throw new Error(label + ': body was ' + got.body)`,
    `    if (p.multipart && !got.type.startsWith('multipart/form-data')) throw new Error(label + ': multipart body expected, content-type was ' + got.type)`,
    `  }`,
    `  nextStatus = 422`,
    `  const first = PLAN[0]`,
    `  let caught`,
    `  try { STYLE === 'class' ? await client[first.group][first.name](...first.pathArgs, ...(first.body !== undefined ? [first.body] : [])) : await sdk[first.fn](client, ...first.pathArgs, ...(first.body !== undefined ? [first.body] : [])) } catch (e) { caught = e }`,
    `  if (!(caught instanceof sdk.ApiError) || caught.status !== 422 || !caught.errors?.name) throw new Error('a 422 response did not become an ApiError with errors: ' + String(caught))`,
    `  console.log(JSON.stringify({ operations: PLAN.length }))`,
    `} finally { server.close() }`,
  ].join('\n')

  const symbols = ['ApiClient', 'ApiError', ...(style === 'class' ? [clientName] : [])]
  return {
    sources: [{ name: 'index', file: 'src/index.ts', raw }],
    entries: [{ subpath: '.', key: 'index', file: 'src/index.ts' }],
    extraFiles: [], extraExports: {}, shipFiles: [],
    symbols, typeSymbols: [...models.map(m => m.name), ...declarations.map(d => d.name), 'ClientOptions', 'CallOptions'],
    typeSamples: models.map(m => ({ type: m.name, value: sampleValue(m.schema, filtered) })),
    consumerChecks: [{ name: 'client talks HTTP (mock server)', file: 'check-sdk.mjs', source: check, data: {} }],
    warnings: [], stats: { operations: ops.length, clientName },
    description: `Typed HTTP client for ${ops.length} operation(s)`,
  }
}
