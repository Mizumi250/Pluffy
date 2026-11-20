// ============================================================
//  scaffold.js: hand-write support for tatemonos
//    node mizumi.js new [name] [--template=web|crud|routes|native|files]
//    node mizumi.js block [tatemono] [block] [name] [--variant=php|ts|py|java|cs|go|rs]
//    node mizumi.js block --list
//  Every template follows the block shapes in PLUFF_GUIDELINES (Section 3D).
//  mizumi.js passes in its own picker/prompt/log helpers via `ctx`.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'

// ─── SMALL HELPERS ────────────────────────────────────────────
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const pascal = s => String(s).split(/[^a-zA-Z0-9]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('')
const singular = s => (s.endsWith('ies') ? s.slice(0, -3) + 'y' : s.endsWith('s') ? s.slice(0, -1) : s)
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function parseArgs(args) {
  const positional = []
  const flags = {}
  for (const a of args) {
    if (a.startsWith('--')) {
      const [k, ...rest] = a.slice(2).split('=')
      flags[k] = rest.length ? rest.join('=') : true
    } else positional.push(a)
  }
  return { positional, flags }
}

// Shapes from the guidelines (Section 3D)
const shapeA = (tag, yaml) => `/* @arkzen:${tag}\n${yaml}\n*/\n`
const shapeB = (tag, yaml, body = '') => `/* @arkzen:${tag}\n${yaml}\n*/\n${body ? body + '\n' : ''}/* @arkzen:${tag}:end */\n`
const shapeC = (tag, body, afterOpen = '') => `/* @arkzen:${tag} */\n${afterOpen}\n${body}\n\n/* @arkzen:${tag}:end */\n`
const shapeD = (tag, body) => `/* @arkzen:${tag}\n*/\n${body}\n/* @arkzen:${tag}:end */\n`

const VARIANTS = ['php', 'ts', 'py', 'java', 'cs', 'go', 'rs']
const VARIANT_LABEL = { php: 'Laravel (PHP)', ts: 'Express (TypeScript)', py: 'FastAPI (Python)', java: 'Spring Boot (Java)', cs: 'ASP.NET Core (C#)', go: 'Go (Chi)', rs: 'Rust (Axum)' }

// ─── BODY STUBS (taken from the guideline examples, per backend) ──
const PING = {
  php:  `return response()->json(['message' => 'hello']);`,
  ts:   `return response.json({ message: 'hello' })`,
  py:   `return response.json({'message': 'hello'})`,
  java: `return response.json(mapOf("message", "hello"));`,
  cs:   `return Results.Json(new { message = "hello" });`,
  go:   `return response.JSON(200, map[string]any{"message": "hello"})`,
  rs:   `response.json(StatusCode::OK, json!({ "message": "hello" }))`,
}
const POLICY = {
  php:  `return true;`,
  ts:   `return true`,
  java: `return true;`,
  cs:   `return true;`,
}
const MIDDLEWARE = {
  php:  `return $next($request);`,
  ts:   `return next()`,
  java: `return next.run();`,
  cs:   `return null;`,
}
const listenerBody = name => ({
  php:  `\\Log::info('${name} received');`,
  ts:   `console.log('${name} received', event.data)`,
  java: `EventLog.create(mapOf("event_name", "${name}", "payload", Json.stringify(event.data)));`,
})
const JOB_BODY = {
  php: `public function handle(): void\n{\n    //\n}`,
  ts:  `// job statements go here`,
}
const consoleBody = sig => ({
  php: `public function handle(): int\n{\n    $this->info('${sig} ran');\n    return Command::SUCCESS;\n}`,
  ts:  `this.info('${sig} ran')\nreturn Command.SUCCESS`,
})

// ─── BLOCK CATALOG ────────────────────────────────────────────
// name:     what the block identifier means (null = no identifier)
// variants: array of allowed variant tokens, or { optional: [...] } for shared-or-variant blocks
// once:     only one allowed per tatemono
const BLOCKS = [
  // Data and API
  { key: 'database', group: 'Data + API', label: 'database', sub: 'one table, columns, seeder', name: { prompt: 'Table name', def: 'items' },
    tag: n => `database:${n}`,
    build: ({ name }) => shapeA(`database:${name}`,
`table: ${name}
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    length: 255
    nullable: false
  description:
    type: text
    nullable: true`) },

  { key: 'api', group: 'Data + API', label: 'api', sub: 'model-backed CRUD resource', name: { prompt: 'API identifier (matches the table)', def: 'items' },
    tag: n => `api:${n}`,
    build: ({ name, slug }) => shapeA(`api:${name}`,
`model: ${pascal(singular(name))}
controller: ${pascal(singular(name))}Controller
prefix: /api/${slug}
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /${name}
    description: List ${name}
    response:
      type: collection
  store:
    method: POST
    route: /${name}
    description: Create ${singular(name)}
    validation:
      name: required|string|max:255
      description: nullable|string
    response:
      type: single
  show:
    method: GET
    route: /${name}/{id}
    description: Get one ${singular(name)}
    response:
      type: single
  update:
    method: PUT
    route: /${name}/{id}
    description: Update ${singular(name)}
    validation:
      name: sometimes|string|max:255
      description: nullable|string
    response:
      type: single
  destroy:
    method: DELETE
    route: /${name}/{id}
    description: Delete ${singular(name)}
    response:
      type: message
      value: ${pascal(singular(name))} deleted`) },

  { key: 'routes', group: 'Data + API', label: 'routes', sub: 'custom routes with handlers', name: null,
    tag: () => 'routes',
    build: ({ slug }) => shapeA('routes',
`controller: CustomController
middleware: []
routes:
  - method: GET
    route: /api/${slug}/hello
    handler: hello`) },

  // Backend code (variant)
  { key: 'endpoint', group: 'Backend code', label: 'endpoint:<variant>', sub: 'body for an api method', name: { prompt: 'Endpoint name (must exist in the api block)', def: 'index' }, variants: VARIANTS,
    tag: (n, v) => `endpoint:${v}:${n}`,
    build: ({ name, variant }) => shapeD(`endpoint:${variant}:${name}`, PING[variant]) },

  { key: 'handler', group: 'Backend code', label: 'handler:<variant>', sub: 'body for a routes entry', name: { prompt: 'Handler name (matches routes handler:)', def: 'hello' }, variants: VARIANTS,
    tag: (n, v) => `handler:${v}:${n}`,
    build: ({ name, variant }) => shapeD(`handler:${variant}:${name}`, PING[variant]) },

  { key: 'policy', group: 'Backend code', label: 'policy:<variant>', sub: 'update or delete (api needs policy: true)', name: { prompt: 'Policy method (update or delete)', def: 'update', choices: ['update', 'delete'] }, variants: Object.keys(POLICY),
    tag: (n, v) => `policy:${v}:${n}`,
    build: ({ name, variant }) => shapeD(`policy:${variant}:${name}`, POLICY[variant]) },

  { key: 'middleware', group: 'Backend code', label: 'middleware:<variant>', sub: 'reusable request middleware', name: { prompt: 'Middleware name', def: 'requireJson' }, variants: Object.keys(MIDDLEWARE),
    tag: (n, v) => `middleware:${v}:${n}`,
    build: ({ name, variant }) => shapeD(`middleware:${variant}:${name}`, MIDDLEWARE[variant]) },

  { key: 'listener', group: 'Backend code', label: 'listener:<variant>', sub: 'event listener body (PascalCase name)', name: { prompt: 'Listener class name', def: 'SendWelcome', pascal: true }, variants: Object.keys(listenerBody('x')),
    tag: (n, v) => `listener:${v}:${n}`,
    build: ({ name, variant }) => shapeD(`listener:${variant}:${name}`, listenerBody(name)[variant]) },

  { key: 'events', group: 'Backend code', label: 'events', sub: 'event and its listeners', name: { prompt: 'Event identifier', def: 'user-signed-up' },
    tag: n => `events:${n}`,
    build: ({ name }) => shapeB(`events:${name}`, `listeners: [${pascal(name)}Listener]`) },

  { key: 'realtime', group: 'Backend code', label: 'realtime', sub: 'channel or broadcast event', name: { prompt: 'Channel or event identifier', def: 'updates' },
    tag: n => `realtime:${n}`,
    build: ({ name }) => shapeB(`realtime:${name}`, `type: public`) },

  { key: 'jobs', group: 'Backend code', label: 'jobs', sub: 'background job (shared YAML, or a php/ts body)', name: { prompt: 'Job identifier', def: 'process-data' }, variants: { optional: ['php', 'ts'] },
    tag: (n, v) => (v ? `jobs:${v}:${n}` : `jobs:${n}`),
    build: ({ name, variant }) => shapeB(variant ? `jobs:${variant}:${name}` : `jobs:${name}`, `queue: default\ntries: 3\ntimeout: 60`, variant ? JOB_BODY[variant] : '') },

  { key: 'console', group: 'Backend code', label: 'console', sub: 'CLI command (shared YAML, or a php/ts body)', name: { prompt: 'Command identifier', def: 'cleanup' }, variants: { optional: ['php', 'ts'] },
    tag: (n, v) => (v ? `console:${v}:${n}` : `console:${n}`),
    build: ({ name, slug, variant }) => shapeB(variant ? `console:${variant}:${name}` : `console:${name}`,
      `signature: ${slug}:${name}\ndescription: Describe this command`, variant ? consoleBody(`${slug}:${name}`)[variant] : '') },

  { key: 'mail', group: 'Backend code', label: 'mail', sub: 'email (YAML only, works on every backend)', name: { prompt: 'Mail identifier (keep it short)', def: 'welcome' },
    tag: n => `mail:${n}`,
    build: ({ name }) => shapeB(`mail:${name}`, `subject: "Welcome"\ndata:\n  username: string\n  app_name: string`) },

  { key: 'notifications', group: 'Backend code', label: 'notifications', sub: 'notification (YAML only)', name: { prompt: 'Notification identifier', def: 'ping' },
    tag: n => `notifications:${n}`,
    build: ({ name }) => shapeB(`notifications:${name}`, `channels: [database]\nmessage: "Notification message"\nsubject: "${pascal(name)}"`) },

  // Web UI
  { key: 'web:page', group: 'Web UI', label: 'web:page', sub: 'a routed web page', name: { prompt: 'Page name', def: 'index' },
    tag: n => `web:page:${n}`,
    build: ({ name, flags }) => shapeC(`web:page:${name}`,
`const ${pascal(name)}Page = () => {
  return (
    <div>
      <h1>${pascal(name)}</h1>
    </div>
  )
}`, flags.layout ? `/* @arkzen:web:page:layout:${flags.layout} */\n` : '') },

  { key: 'web:layout', group: 'Web UI', label: 'web:layout', sub: 'reusable page wrapper (--parent=name for nesting)', name: { prompt: 'Layout name', def: 'app' },
    tag: n => `web:layout:${n}`,
    build: ({ name, flags }) => {
      const body =
`'use client'

import React from 'react'

export const ${pascal(name)}Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div style={{ minHeight: '100vh' }}><main>{children}</main></div>
}`
      return flags.parent
        ? shapeB(`web:layout:${name}`, `parent: ${flags.parent}`, `\n${body}\n`)
        : shapeC(`web:layout:${name}`, `\n${body}`)
    } },

  { key: 'web:components', group: 'Web UI', label: 'web:components', sub: 'shared components, hooks, constants', name: { prompt: 'Components identifier', def: 'shared' },
    tag: n => `web:components:${n}`,
    build: ({ name }) => shapeC(`web:components:${name}`,
`'use client'

import React from 'react'

export const Card = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)`) },

  { key: 'web:error:404', group: 'Web UI', label: 'web:error:404', sub: 'not-found UI', name: null, once: true,
    tag: () => 'web:error:404',
    build: () => shapeC('web:error:404', `const NotFoundPage = () => (<div>404 - Page not found</div>)`) },

  { key: 'web:error:500', group: 'Web UI', label: 'web:error:500', sub: 'server-error UI', name: null, once: true,
    tag: () => 'web:error:500',
    build: () => shapeC('web:error:500',
`'use client'

function ServerErrorPage({ reset }: { reset: () => void }) {
  return <button onClick={reset}>Try Again</button>
}`) },

  // Native
  { key: 'native:page', group: 'Native (Expo / RN)', label: 'native:page', sub: 'an Expo / bare RN screen', name: { prompt: 'Screen name', def: 'index' },
    tag: n => `native:page:${n}`,
    build: ({ name }) => shapeC(`native:page:${name}`,
`const ${pascal(name)}Screen = () => {
  return (
    <View className="flex-1 bg-neutral-50 px-6 pt-14">
      <Text className="text-4xl font-bold">${pascal(name)}</Text>
    </View>
  )
}`) },

  // Lynx
  { key: 'lynx:page', group: 'Native (Lynx)', label: 'native:page:lynx', sub: 'a Lynx page', name: { prompt: 'Page name', def: 'index' },
    tag: n => `native:page:lynx:${n}`,
    build: ({ name }) => shapeC(`native:page:lynx:${name}`,
`\nimport React from '@lynx-js/react'

const ${pascal(name)}LynxPage = () => (
  <view className="flex-1 bg-neutral-50 px-6 pt-14">
    <text className="text-4xl font-bold">${pascal(name)}</text>
  </view>
)`) },

  { key: 'lynx:components', group: 'Native (Lynx)', label: 'native:components:lynx', sub: 'shared Lynx components', name: { prompt: 'Components identifier', def: 'shared' },
    tag: n => `native:components:lynx:${n}`,
    build: ({ name }) => shapeC(`native:components:lynx:${name}`,
`\nimport { type ReactNode } from '@lynx-js/react'

export const Card = ({ children }: { children: ReactNode }) => (<view>{children}</view>)`) },

  // Free files
  { key: 'file', group: 'Free files', label: 'file', sub: 'write any text file to a path', name: { prompt: 'File block identifier', def: 'landing' },
    extra: { key: 'path', prompt: 'Output path', def: 'index.html' },
    tag: n => `file:${n}`,
    build: ({ name, flags }) => shapeB(`file:${name}`, `path: ${flags.path ?? 'index.html'}`, '') },
]

// ─── TEMPLATES FOR `new` ──────────────────────────────────────
const metaBlock = (slug, description, auth = false) =>
  shapeA('meta', `name: ${slug}\nversion: 1.0.0\ndescription: ${description}\nauth: ${auth}`)

function blockByKey(key) { return BLOCKS.find(b => b.key === key) }
const stub = (key, name, extra = {}) => blockByKey(key).build({ name, slug: extra.slug ?? '', variant: extra.variant, flags: extra.flags ?? {} })

const TEMPLATES = {
  web: {
    label: 'Web page', sub: 'meta + one web page, no backend',
    make: ({ slug }) => [metaBlock(slug, 'Web page tatemono'), stub('web:page', 'index', { slug })],
  },
  crud: {
    label: 'Full-stack CRUD', sub: 'meta + database + api + web page (+ backend variant)',
    make: ({ slug, resource }) => [
      metaBlock(slug, `CRUD for ${resource}`),
      stub('database', resource, { slug }),
      stub('api', resource, { slug }),
      stub('web:page', 'index', { slug }),
    ],
  },
  routes: {
    label: 'Custom routes', sub: 'meta + routes + a handler for the active backend + web page',
    make: ({ slug, variant }) => [
      metaBlock(slug, 'Custom routes tatemono'),
      stub('routes', null, { slug }),
      stub('handler', 'hello', { slug, variant }),
      stub('web:page', 'index', { slug }),
    ],
  },
  native: {
    label: 'Native screen', sub: 'meta + one Expo / RN screen',
    make: ({ slug }) => [metaBlock(slug, 'Native tatemono'), stub('native:page', 'index', { slug })],
  },
  files: {
    label: 'Free files only', sub: 'meta + one @arkzen:file block',
    make: ({ slug }) => [metaBlock(slug, 'Free files tatemono'), stub('file', 'landing', { slug, flags: { path: 'index.html' } })],
  },
}

// ─── SHARED CHECKS ────────────────────────────────────────────
function hasTag(source, tag) {
  return new RegExp(`/\\* @arkzen:${escapeRe(tag)}(?![\\w:+-])`).test(source)
}

function listTatemonoDirs(ctx) {
  if (!fs.existsSync(ctx.TATEMONOS_DIR)) return []
  return fs.readdirSync(ctx.TATEMONOS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(ctx.TATEMONOS_DIR, e.name, 'core.tsx')))
    .map(e => e.name)
    .sort()
}

const interactive = () => !!process.stdin.isTTY

async function ask(ctx, question, def) {
  if (!interactive()) return def
  return ctx.prompt(question, def)
}

function resolveVariant(ctx, flags) {
  if (flags.variant) return String(flags.variant)
  if (flags.backend) return ctx.backendVariant(ctx.BACKEND_ALIASES[flags.backend] ?? String(flags.backend))
  return ctx.backendVariant(ctx.resolveBackend(ctx.readConfig()))
}

// ─── mizumi new ───────────────────────────────────────────────
export async function cmdNew(ctx, args) {
  const { positional, flags } = parseArgs(args)
  let slug = positional[0]

  if (!slug) {
    if (!interactive()) { ctx.error('Usage: mizumi new <name> [--template=web|crud|routes|native|files]'); return }
    slug = await ctx.prompt('Tatemono name (kebab-case)', '')
  }
  if (!slug || !SLUG_RE.test(slug)) { ctx.error(`"${slug ?? ''}" is not a valid name. Use kebab-case, e.g. my-app`); return }

  const dir = path.join(ctx.TATEMONOS_DIR, slug)
  if (fs.existsSync(dir)) { ctx.error(`tatemonos/${slug} already exists`); return }

  let template = flags.template
  if (!template) {
    if (!interactive()) { ctx.error('Pass --template=web|crud|routes|native|files'); return }
    ctx.divider()
    const chosen = await ctx.picker('テンプレート Which starting point?',
      Object.entries(TEMPLATES).map(([key, t]) => ({ label: t.label, sub: t.sub, value: key })))
    template = chosen.value
  }
  const tpl = TEMPLATES[template]
  if (!tpl) { ctx.error(`Unknown template: ${template} (use: ${Object.keys(TEMPLATES).join(', ')})`); return }

  const variant = resolveVariant(ctx, flags)
  let resource = flags.resource ? String(flags.resource) : 'items'
  if (template === 'crud' && !flags.resource) resource = await ask(ctx, 'Resource (plural table name)', 'items')
  if (!SLUG_RE.test(resource)) { ctx.error(`"${resource}" is not a valid resource name`); return }

  const parts = tpl.make({ slug, variant, resource })
  const text = parts.join('\n')
  if (flags.dry) { console.log(text); return }

  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'core.tsx'), text, 'utf8')
  ctx.success(`Created tatemonos/${slug}/core.tsx  ${ctx.paint(ctx.c.gray, `(${template})`)}`)
  ctx.info(`Add more blocks: node mizumi.js block ${slug}`)
  ctx.info(`Check it appears: node mizumi.js modules`)
}

// ─── mizumi block ─────────────────────────────────────────────
function printCatalog(ctx) {
  ctx.divider()
  let group = ''
  for (const b of BLOCKS) {
    if (b.group !== group) { group = b.group; console.log(`\n  ${ctx.paint(ctx.c.white + ctx.c.bold, group)}\n`) }
    console.log(`  ${ctx.paint(ctx.c.cyan, b.key.padEnd(18))} ${ctx.paint(ctx.c.gray, b.sub)}`)
  }
  ctx.divider()
}

export async function cmdBlock(ctx, args) {
  const { positional, flags } = parseArgs(args)
  if (flags.list) { printCatalog(ctx); return }

  const tatemonos = listTatemonoDirs(ctx)
  if (tatemonos.length === 0) { ctx.warn('No tatemonos yet. Create one: node mizumi.js new <name>'); return }

  // 1. which tatemono
  let slug = positional[0]
  if (!slug) {
    if (!interactive()) { ctx.error('Usage: mizumi block <tatemono> <block> [name]  (see: mizumi block --list)'); return }
    ctx.divider()
    slug = (await ctx.picker('どのタテモノ？ Add a block to which tatemono?', tatemonos.map(t => ({ label: t, value: t })))).value
  }
  if (!tatemonos.includes(slug)) { ctx.error(`Unknown tatemono: ${slug}`); return }
  const file = path.join(ctx.TATEMONOS_DIR, slug, 'core.tsx')
  const source = fs.readFileSync(file, 'utf8')
  if (/@arkzen:(godot|unity):project/.test(source)) {
    ctx.error('Game tatemonos (Godot / Unity) are not supported by this command yet.'); return
  }

  // 2. which DSL group, then which block
  let block = positional[1] ? blockByKey(positional[1]) : null
  if (positional[1] && !block) { ctx.error(`Unknown block: ${positional[1]} (see: mizumi block --list)`); return }
  if (!block) {
    if (!interactive()) { ctx.error('Pass a block key (see: mizumi block --list)'); return }
    const groups = [...new Set(BLOCKS.map(b => b.group))]
    ctx.divider()
    const group = (await ctx.picker('どのDSL？ Which kind of block?', groups.map(g => ({ label: g, value: g })))).value
    ctx.divider()
    block = blockByKey((await ctx.picker(`${group}: which block?`,
      BLOCKS.filter(b => b.group === group).map(b => ({ label: b.label, sub: b.sub, value: b.key })))).value)
  }

  // 3. identifier
  let name = positional[2] ?? null
  if (block.name) {
    if (!name) {
      if (block.name.choices && interactive()) {
        ctx.divider()
        name = (await ctx.picker(block.name.prompt, block.name.choices.map(v => ({ label: v, value: v })))).value
      } else name = await ask(ctx, block.name.prompt, block.name.def)
    }
    if (block.name.pascal ? !/^[A-Z][A-Za-z0-9]*$/.test(name) : !/^[A-Za-z0-9][A-Za-z0-9_.{}-]*$/.test(name)) {
      ctx.error(`"${name}" is not a valid identifier for ${block.key}${block.name.pascal ? ' (use PascalCase)' : ''}`); return
    }
  }

  // 4. backend variant
  let variant = null
  if (block.variants) {
    const optional = !Array.isArray(block.variants)
    const allowed = optional ? block.variants.optional : block.variants
    if (flags.shared && optional) variant = null
    else if (flags.variant || flags.backend) {
      variant = resolveVariant(ctx, flags)
      if (!allowed.includes(variant)) { ctx.error(`${block.key} has no documented :${variant} body. Allowed: ${allowed.join(', ')}`); return }
    } else if (interactive()) {
      const active = resolveVariant(ctx, {})
      const options = allowed.map(v => ({ label: `${v === active ? '→ ' : '  '}:${v}`, sub: VARIANT_LABEL[v], value: v }))
      if (optional) options.unshift({ label: '  shared', sub: 'YAML only, works on every backend', value: null })
      ctx.divider()
      variant = (await ctx.picker('バックエンド？ Which backend variant?', options)).value
    } else {
      variant = allowed.includes(resolveVariant(ctx, {})) ? resolveVariant(ctx, {}) : (optional ? null : allowed[0])
    }
  }

  // 5. extra field (file path)
  if (block.extra && !flags[block.extra.key]) flags[block.extra.key] = await ask(ctx, block.extra.prompt, block.extra.def)

  // 6. guard against duplicates, then write
  const tag = block.tag(name, variant)
  if (hasTag(source, tag)) { ctx.error(`@arkzen:${tag} already exists in tatemonos/${slug}/core.tsx`); return }
  if (block.once && hasTag(source, block.tag())) { ctx.error(`${block.key} is already in this tatemono`); return }

  const snippet = block.build({ name, slug, variant, flags })
  if (flags.dry) { console.log(snippet); return }

  const next = source.replace(/\s*$/, '') + '\n\n' + snippet
  fs.writeFileSync(file, next, 'utf8')
  ctx.success(`Added @arkzen:${tag}  ${ctx.paint(ctx.c.gray, `→ tatemonos/${slug}/core.tsx`)}`)
  if (block.key === 'endpoint') ctx.info(`The method "${name}" must exist in an @arkzen:api block.`)
  if (block.key === 'handler') ctx.info(`The handler "${name}" must be listed in an @arkzen:routes block.`)
  if (block.key === 'policy') ctx.info('The api block needs policy: true.')
}
