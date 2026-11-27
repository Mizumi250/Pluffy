// ============================================================
//  scaffold.js: hand-write support for tatemonos
//    node mizumi.js new [name] [template] [resource] [--template=<id>] [--auth] [--description=..]
//    node mizumi.js block [tatemono] <block> [name ...] [--variant=<v> | --ts] [--dry]
//    node mizumi.js block --list
//    node mizumi.js check [tatemono ...] [--all] [--variant=<v>]
//  Every block in PLUFF_DSL_CATALOG.md is covered. Shapes follow
//  PLUFF_GUIDELINES Section 3D; bodies follow the fixture tatemonos.
//  mizumi.js passes its picker/prompt/log helpers in through `ctx`.
//
//  What makes it safe to lean on:
//   - Arguments are parsed strictly: a mistyped flag is an error with a
//     suggestion, never silently ignored. `--variant ts`, `--variant=ts`
//     and `--ts` all work.
//   - Names are normalised for their block (database -> snake_case,
//     pages -> kebab-case, listeners -> PascalCase) and told to you.
//   - Cross-references are checked against the file: endpoint/handler names
//     must exist in the api/routes block, layouts and parents must exist,
//     policy needs `policy: true`. Missing names are offered as choices.
//   - A block is only written if it adds no NEW error (see lintSource).
//     Use --force to write anyway.
//   - `check` lints any tatemono without the engine installed.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'

// ─── HELPERS ──────────────────────────────────────────────────
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const words = s => String(s).replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[^a-zA-Z0-9]+/).filter(Boolean)
const pascal = s => words(s).map(w => w[0].toUpperCase() + w.slice(1)).join('')
const kebab = s => words(s).map(w => w.toLowerCase()).join('-')
const snake = s => words(s).map(w => w.toLowerCase()).join('_')
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const UNCOUNTABLE = new Set(['news', 'series', 'species', 'metadata', 'info', 'analytics', 'media', 'data'])
const singularWord = w => {
  const l = w.toLowerCase()
  if (UNCOUNTABLE.has(l)) return w
  if (/ies$/i.test(w)) return w.slice(0, -3) + 'y'
  if (/(ss|us|is)es$/i.test(w) || /(x|z|ch|sh)es$/i.test(w)) return w.slice(0, -2)
  if (/(ss|us|is)$/i.test(w)) return w
  if (/s$/i.test(w)) return w.slice(0, -1)
  return w
}
const singular = s => {
  const m = String(s).match(/^(.*?)([A-Za-z0-9]+)$/)
  return m ? m[1] + singularWord(m[2]) : String(s)
}
// Same rule as the engine validator's pluralizeTableName.
const plural = s => (/[^aeiou]y$/i.test(s) ? s.slice(0, -1) + 'ies' : /(s|x|z|ch|sh)$/i.test(s) ? s + 'es' : s + 's')

// Levenshtein distance, for "did you mean" hints.
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}
function closest(word, list) {
  let best = null, bestD = Infinity
  for (const item of list) { const dist = distance(String(word).toLowerCase(), String(item).toLowerCase()); if (dist < bestD) { best = item; bestD = dist } }
  return best !== null && bestD <= Math.max(1, Math.floor(String(word).length / 3)) ? best : null
}
const didYouMean = (word, list) => { const c = closest(word, list); return c ? ` Did you mean "${c}"?` : '' }

// ─── ARGUMENTS ────────────────────────────────────────────────
// Value flags take a value (`--k=v` or `--k v`); bool flags do not.
// Anything else starting with `-` is an error, not a silent no-op.
const VALUE_FLAGS = new Set(['variant', 'backend', 'template', 'resource', 'layout', 'parent', 'path', 'mode', 'description'])
const BOOL_FLAGS = new Set(['dry', 'shared', 'list', 'force', 'exact', 'auth', 'help', 'all', 'quiet'])
const SHORT_FLAGS = { d: 'dry', f: 'force', s: 'shared', l: 'list', h: 'help', a: 'all', q: 'quiet', t: 'template', v: 'variant', r: 'resource' }

const BACKENDS = ['php', 'ts', 'py', 'java', 'cs', 'go', 'rs']
const BACKEND_LABEL = { php: 'Laravel (PHP)', ts: 'Express (TypeScript)', py: 'FastAPI (Python)', java: 'Spring Boot (Java)', cs: 'ASP.NET Core (C#)', go: 'Go (Chi)', rs: 'Rust (Axum)' }
const NATIVE = ['expo', 'rn']
const NATIVE_LABEL = { expo: 'Expo', rn: 'Bare React Native' }
const VARIANT_WORDS = new Set([...BACKENDS, ...NATIVE])

export function parseArgs(args) {
  const positional = []
  const flags = {}
  const problems = []
  const known = [...VALUE_FLAGS, ...BOOL_FLAGS, ...VARIANT_WORDS]
  let literal = false
  const setFlag = (k, v) => { flags[k] = v }
  for (let i = 0; i < args.length; i++) {
    const a = String(args[i])
    if (literal || !a.startsWith('-') || a === '-') { positional.push(a); continue }
    if (a === '--') { literal = true; continue }
    let key, value
    if (a.startsWith('--')) {
      const eq = a.indexOf('=')
      key = eq < 0 ? a.slice(2) : a.slice(2, eq)
      value = eq < 0 ? undefined : a.slice(eq + 1)
    } else {
      const short = SHORT_FLAGS[a.slice(1)]
      if (!short || a.length !== 2) { problems.push(`Unknown flag ${a}.${didYouMean(a.replace(/^-+/, ''), known) ? ` Did you mean --${closest(a.replace(/^-+/, ''), known)}?` : ''}`); continue }
      key = short
    }
    let negate = false
    if (key.startsWith('no-') && BOOL_FLAGS.has(key.slice(3))) { negate = true; key = key.slice(3) }

    if (VARIANT_WORDS.has(key) && value === undefined) {
      if (flags.variant && flags.variant !== key) problems.push(`Two variants given: ${flags.variant} and ${key}.`)
      setFlag('variant', key); continue
    }
    if (VALUE_FLAGS.has(key)) {
      if (value === undefined) {
        const next = args[i + 1]
        if (next === undefined || (String(next).startsWith('-') && !/^-?\d/.test(String(next)) && String(next) !== '-')) { problems.push(`--${key} needs a value (--${key}=<value>).`); continue }
        value = String(next); i++
      }
      if (value === '') { problems.push(`--${key} needs a value (--${key}=<value>).`); continue }
      setFlag(key, value); continue
    }
    if (BOOL_FLAGS.has(key)) {
      if (value === undefined) setFlag(key, !negate)
      else if (/^(true|1|yes)$/i.test(value)) setFlag(key, !negate)
      else if (/^(false|0|no)$/i.test(value)) setFlag(key, negate)
      else problems.push(`--${key} does not take a value (got "${value}").`)
      continue
    }
    problems.push(`Unknown flag --${key}.${didYouMean(key, known) ? ` Did you mean --${closest(key, known)}?` : ''}`)
  }
  return { positional, flags, problems }
}

// Block shapes (guidelines Section 3D)
const shapeA = (tag, yaml) => `/* @arkzen:${tag}\n${yaml}\n*/\n`                                   // YAML only, bare */ closes it
const shapeB = (tag, yaml, body = '') => `/* @arkzen:${tag}\n${yaml}\n*/\n${body ? body + '\n' : ''}/* @arkzen:${tag}:end */\n`   // YAML + body + :end
const shapeC = (tag, body, after = '') => `/* @arkzen:${tag} */\n${after}${body ? '\n' + body + '\n' : ''}\n/* @arkzen:${tag}:end */\n`  // code block
const shapeD = (tag, body) => `/* @arkzen:${tag}\n*/\n${body}\n/* @arkzen:${tag}:end */\n`          // body-separator block

const RS_DOC = `// Documentary Rust variant; the Rust engine does not evaluate arbitrary snippets here.`
const COMMENT = { php: '//', ts: '//', py: '#', java: '//', cs: '//', go: '//', rs: '//' }
const todo = (v, text) => `${COMMENT[v]} ${text}`

// ─── BODY STUBS PER BACKEND ───────────────────────────────────
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
  php: `return true;`, ts: `return true`, py: `return True`, java: `return true;`, cs: `return true;`, go: `return true`, rs: RS_DOC,
}
const MIDDLEWARE = {
  php: `return $next($request);`, ts: `return next()`, py: `return await next()`, java: `return next.run();`,
  cs: `return null;`, go: `return next()`, rs: RS_DOC,
}
const listenerBody = name => Object.fromEntries(BACKENDS.map(v => [v, todo(v, `handle ${name}: the event payload is on event.data`)]))
const jobBody = {
  php: `public function handle(): void\n{\n    //\n}`,
  ts: `Log.info('job ran', this.data)`,
  py: `pass`,
  java: `// job body: this.data holds the payload`,
  cs: `// job body`,
  go: `return nil`,
  rs: `Ok(())`,
}
const consoleBody = sig => ({
  php: `public function handle(): int\n{\n    $this->info('${sig} ran');\n    return Command::SUCCESS;\n}`,
  ts: `this.info('${sig} ran')\nreturn Command.SUCCESS`,
  py: `self.info('${sig} ran')\nreturn Command.SUCCESS`,
  java: `this.info("${sig} ran");\nreturn Command.SUCCESS;`,
  cs: `return 0;`,
  go: `Log.Info("${sig} ran")\nreturn nil`,
  rs: RS_DOC,
})
const MAIL_P = {
  php: '{{ $username }}', ts: '{{ username }}', py: '{{ username }}', java: '{{ username }}',
  cs: '{{ $username }}', go: '{{ index . "username" }}', rs: '{{ $username }}',
}
const notifBody = subject => ({
  php: `return (new \\Illuminate\\Notifications\\Messages\\MailMessage)\n    ->subject('${subject}')\n    ->line('${subject}');`,
  ts: `return new MailMessage().subject('${subject}').line('${subject}')`,
  py: `return MailMessage().subject('${subject}').line('${subject}')`,
  java: `return new MailMessage()\n    .subject("${subject}")\n    .line("${subject}");`,
  cs: `return new Dictionary<string, object?>\n{\n    ["subject"] = "${subject}",\n    ["lines"] = new[] { "${subject}" }\n};`,
  go: `return NotificationMessage{\n    Subject: "${subject}",\n    Lines: []string{"${subject}"},\n}`,
  rs: '',
})

// ─── SHARED SOURCE SNIPPETS ───────────────────────────────────
const CSS_STARTER = `:root {
  --color-primary: #111111;
  --radius-default: 0.75rem;
}

.card {
  border-radius: var(--radius-default);
}`
const moveHook = (imp, extra = '') => `${imp}
export const useFadeIn = (delay = 0) => {
  const opacity = useSharedValue(0)
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }))
  }, [])
  return useAnimatedStyle(() => ({ opacity: opacity.value }))
}${extra}`
const REANIMATED = `import { withTiming, withDelay, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated'\n`

// ─── BLOCK CATALOG ────────────────────────────────────────────
// name:     identifier prompt (null = the block has no identifier)
// variants: { list, optional, labels, backend } (backend: default to the active backend)
// once:     only one allowed per tatemono
// needs:    function(source) returning an error string when a prerequisite is missing
const BLOCKS = []
const add = b => BLOCKS.push(b)

// ---- Config and meta ----
add({ key: 'meta:web', group: 'Config + meta', sub: 'title, SEO, social, favicon, PWA', name: null, once: true,
  tag: () => 'meta:web',
  build: ({ slug }) => shapeA('meta:web', `title: ${pascal(slug)}\nlabel: ${pascal(slug)}\ndescription: ${pascal(slug)}\nfavicon: /tatemonos/${slug}/assets/images/favicon.svg`) })

add({ key: 'meta:native', group: 'Config + meta', sub: 'Expo labels, bundle id, scheme', name: null, once: true,
  tag: () => 'meta:native',
  build: ({ slug }) => shapeA('meta:native', `label: ${pascal(slug)}\ndescription: ${pascal(slug)}\nexpo:\n  bundle_id: com.pluff.${slug.replace(/-/g, '')}\n  scheme: ${slug.replace(/-/g, '')}\n  version: 1.0.0\n  orientation: portrait`) })

add({ key: 'web:config', group: 'Config + meta', sub: 'toast, modal, table, layout classNames', name: null, once: true,
  tag: () => 'web:config',
  build: () => shapeA('web:config', `toast:\n  position: top-right\n  duration: 3000\nlayout:\n  guest:\n    className: "min-h-screen"`) })

add({ key: 'native:config', group: 'Config + meta', sub: 'native theme tokens and fonts', name: null, once: true,
  tag: () => 'native:config',
  build: () => shapeA('native:config', `theme:\n  primary: "#111111"\n  background: "#f5f5f5"\n  surface: "#ffffff"\n  text: "#111111"\n  muted: "#6b6b6b"`) })

add({ key: 'desktop:config', group: 'Config + meta', sub: 'shared Electron / Tauri window settings', name: null, once: true,
  tag: () => 'desktop:config',
  build: ({ slug }) => shapeA('desktop:config', `window:\n  width: 1280\n  height: 800\n  min_width: 800\n  min_height: 600\n  resizable: true\n  title: ${pascal(slug)}`) })

add({ key: 'oauth', group: 'Config + meta', sub: 'social sign-in (needs auth: true)', name: null, once: true,
  tag: () => 'oauth',
  needs: src => (/@arkzen:meta[\s\S]*?\bauth:\s*true/.test(src) ? null : 'oauth needs auth: true in @arkzen:meta'),
  build: () => shapeA('oauth', `providers: [google, github]\nredirect: /\nerror_redirect: /\nlink_verified_email: true`) })

// ---- Data and API ----
add({ key: 'database', group: 'Data + API', sub: 'one table, columns, seeder', name: { prompt: 'Table name', def: 'items' },
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
    nullable: true`) })

add({ key: 'api', group: 'Data + API', sub: 'model-backed CRUD resource', name: { prompt: 'API identifier (matches the table)', def: 'items' },
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
      value: ${pascal(singular(name))} deleted`) })

add({ key: 'routes', group: 'Data + API', sub: 'custom routes with handlers', name: null,
  tag: () => 'routes',
  build: ({ slug }) => shapeA('routes', `controller: CustomController\nmiddleware: []\nroutes:\n  - method: GET\n    route: /api/${slug}/hello\n    handler: hello`) })

// ---- Backend code ----
const backendVariants = (list = BACKENDS, optional = false) => ({ list, optional, labels: BACKEND_LABEL, backend: true })

add({ key: 'endpoint', group: 'Backend code', sub: 'body for an api method', name: { prompt: 'Endpoint name (must exist in the api block)', def: 'index' }, variants: backendVariants(),
  tag: (n, v) => `endpoint:${v}:${n}`, build: ({ name, variant }) => shapeD(`endpoint:${variant}:${name}`, PING[variant]) })

add({ key: 'handler', group: 'Backend code', sub: 'body for a routes entry', name: { prompt: 'Handler name (matches routes handler:)', def: 'hello' }, variants: backendVariants(),
  tag: (n, v) => `handler:${v}:${n}`, build: ({ name, variant }) => shapeD(`handler:${variant}:${name}`, PING[variant]) })

add({ key: 'policy', group: 'Backend code', sub: 'update or delete (api needs policy: true)', name: { prompt: 'Policy method', def: 'update', choices: ['update', 'delete'] }, variants: backendVariants(),
  tag: (n, v) => `policy:${v}:${n}`, build: ({ name, variant }) => shapeD(`policy:${variant}:${name}`, POLICY[variant]) })

add({ key: 'middleware', group: 'Backend code', sub: 'reusable request middleware', name: { prompt: 'Middleware name', def: 'requireJson' }, variants: backendVariants(),
  tag: (n, v) => `middleware:${v}:${n}`, build: ({ name, variant }) => shapeD(`middleware:${variant}:${name}`, MIDDLEWARE[variant]) })

add({ key: 'listener', group: 'Backend code', sub: 'event listener body (PascalCase name)', name: { prompt: 'Listener class name', def: 'SendWelcome', pascal: true }, variants: backendVariants(),
  tag: (n, v) => `listener:${v}:${n}`, build: ({ name, variant }) => shapeD(`listener:${variant}:${name}`, listenerBody(name)[variant]) })

add({ key: 'events', group: 'Backend code', sub: 'event and its listeners', name: { prompt: 'Event identifier', def: 'user-signed-up' },
  tag: n => `events:${n}`, build: ({ name }) => shapeB(`events:${name}`, `listeners: [${pascal(name)}Listener]`) })

add({ key: 'realtime', group: 'Backend code', sub: 'channel registration (no channel: key)', name: { prompt: 'Channel identifier', def: 'updates' },
  tag: n => `realtime:${n}`, build: ({ name }) => shapeB(`realtime:${name}`, `type: public`) })

add({ key: 'realtime:event', group: 'Backend code', sub: 'broadcast event (has a channel: key)', name: { prompt: 'Event identifier', def: 'queue-updated' },
  tag: n => `realtime:${n}`, build: ({ name, slug }) => shapeB(`realtime:${name}`, `channel: ${slug}.{id}\ntype: public`) })

add({ key: 'jobs', group: 'Backend code', sub: 'background job (shared YAML, or a variant body)', name: { prompt: 'Job identifier', def: 'process-data' }, variants: backendVariants(BACKENDS, true),
  tag: (n, v) => (v ? `jobs:${v}:${n}` : `jobs:${n}`),
  build: ({ name, variant }) => shapeB(variant ? `jobs:${variant}:${name}` : `jobs:${name}`, `queue: default\ntries: 3\ntimeout: 60`, variant ? jobBody[variant] : '') })

add({ key: 'console', group: 'Backend code', sub: 'CLI command (shared YAML, or a variant body)', name: { prompt: 'Command identifier', def: 'cleanup' }, variants: backendVariants(BACKENDS, true),
  tag: (n, v) => (v ? `console:${v}:${n}` : `console:${n}`),
  build: ({ name, slug, variant }) => shapeB(variant ? `console:${variant}:${name}` : `console:${name}`,
    `signature: ${slug}:${name}\ndescription: Describe this command`, variant ? consoleBody(`${slug}:${name}`)[variant] : '') })

add({ key: 'mail', group: 'Backend code', sub: 'email (shared YAML, or a variant HTML body)', name: { prompt: 'Mail identifier (keep it short)', def: 'welcome' }, variants: backendVariants(BACKENDS, true),
  tag: (n, v) => (v ? `mail:${v}:${n}` : `mail:${n}`),
  build: ({ name, variant }) => shapeB(variant ? `mail:${variant}:${name}` : `mail:${name}`,
    `subject: "Welcome"\ndata:\n  username: string\n  app_name: string`, variant ? `<p>Welcome, ${MAIL_P[variant]}!</p>` : '') })

add({ key: 'notifications', group: 'Backend code', sub: 'notification (shared YAML, or a variant body)', name: { prompt: 'Notification identifier', def: 'ping' }, variants: backendVariants(BACKENDS, true),
  tag: (n, v) => (v ? `notifications:${v}:${n}` : `notifications:${n}`),
  build: ({ name, variant }) => shapeB(variant ? `notifications:${variant}:${name}` : `notifications:${name}`,
    `channels: [database]\nmessage: "Notification message"\nsubject: "${pascal(name)}"`, variant ? notifBody(pascal(name))[variant] : '') })

add({ key: 'module:rs', group: 'Backend code', sub: 'Rust module snippet (once, Rust backend only)', name: null, once: true,
  tag: () => 'module:rs', build: () => shapeD('module:rs', `fn clamp_position(value: i64) -> i64 { value.max(1) }`) })

// ---- Web UI ----
add({ key: 'web:page', group: 'Web UI', sub: 'a routed web page (--layout=+auth for a guard)', name: { prompt: 'Page name', def: 'index' },
  tag: n => `web:page:${n}`,
  build: ({ name, flags }) => shapeC(`web:page:${name}`,
`const ${pascal(name)}Page = () => {
  return (
    <div>
      <h1>${pascal(name)}</h1>
    </div>
  )
}`, flags.layout ? `/* @arkzen:web:page:layout:${flags.layout} */\n` : '') })

add({ key: 'web:layout', group: 'Web UI', sub: 'page wrapper (--parent=name for nesting)', name: { prompt: 'Layout name', def: 'app' },
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
      : shapeC(`web:layout:${name}`, body)
  } })

add({ key: 'web:components', group: 'Web UI', sub: 'shared components, hooks, constants, types', name: { prompt: 'Components identifier', def: 'shared' },
  tag: n => `web:components:${n}`,
  build: ({ name }) => shapeC(`web:components:${name}`,
`'use client'

import React from 'react'

export const Card = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)`) })

add({ key: 'web:style', group: 'Web UI', sub: 'global CSS', name: null, once: true,
  tag: () => 'web:style', build: () => shapeC('web:style', CSS_STARTER) })

add({ key: 'web:style:name', group: 'Web UI', sub: 'component-scoped CSS Modules styles', name: { prompt: 'Component name (PascalCase)', def: 'FeatureCard', pascal: true },
  tag: n => `web:style:${n}`, build: ({ name }) => shapeC(`web:style:${name}`, `.${name.replace(/[A-Z]/g, (c, i) => (i ? '-' : '') + c.toLowerCase())} {\n  position: relative;\n}`) })

add({ key: 'web:animation', group: 'Web UI', sub: 'animation setup and page variants (once)', name: null, once: true,
  tag: () => 'web:animation',
  build: () => shapeC('web:animation',
`export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}`) })

add({ key: 'web:script', group: 'Web UI', sub: 'global TypeScript helpers', name: null, once: true,
  tag: () => 'web:script', build: () => shapeC('web:script', `export const APP_NAME = 'app'\n\nexport const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)`) })

add({ key: 'web:script:name', group: 'Web UI', sub: 'named TypeScript helper module', name: { prompt: 'Script name', def: 'helpers' },
  tag: n => `web:script:${n}`, build: ({ name }) => shapeC(`web:script:${name}`, `export const hello = (who: string) => \`hello \${who}\``) })

add({ key: 'web:error:404', group: 'Web UI', sub: 'not-found UI', name: null, once: true,
  tag: () => 'web:error:404', build: () => shapeC('web:error:404', `const NotFoundPage = () => (<div>404 - Page not found</div>)`) })

add({ key: 'web:error:500', group: 'Web UI', sub: 'server-error UI', name: null, once: true,
  tag: () => 'web:error:500',
  build: () => shapeC('web:error:500', `'use client'\n\nfunction ServerErrorPage({ reset }: { reset: () => void }) {\n  return <button onClick={reset}>Try Again</button>\n}`) })

// ---- Native: Expo and bare RN ----
add({ key: 'native:page', group: 'Native (Expo / RN)', sub: 'an Expo / bare RN screen (--layout=app)', name: { prompt: 'Screen name', def: 'index' },
  tag: n => `native:page:${n}`,
  build: ({ name, flags }) => shapeC(`native:page:${name}`,
`const ${pascal(name)}Screen = () => {
  return (
    <View className="flex-1 bg-neutral-50 px-6 pt-14">
      <Text className="text-4xl font-bold">${pascal(name)}</Text>
    </View>
  )
}`, flags.layout ? `/* @arkzen:native:page:layout:${flags.layout} */\n` : '') })

add({ key: 'native:layout', group: 'Native (Expo / RN)', sub: 'screen wrapper (--parent=name for nesting)', name: { prompt: 'Layout name', def: 'app' },
  tag: n => `native:layout:${n}`,
  build: ({ name, flags }) => {
    const body =
`import React from 'react'
import { View } from 'react-native'

export const ${pascal(name)}Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <View style={{ flex: 1 }}>{children}</View>
}`
    return flags.parent
      ? shapeB(`native:layout:${name}`, `parent: ${flags.parent}`, `\n${body}\n`)
      : shapeC(`native:layout:${name}`, body)
  } })

add({ key: 'native:components', group: 'Native (Expo / RN)', sub: 'shared Expo / RN components', name: { prompt: 'Components identifier', def: 'shared' },
  tag: n => `native:components:${n}`,
  build: ({ name }) => shapeC(`native:components:${name}`,
`import React from 'react'
import { View } from 'react-native'

export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ padding: 16 }}>{children}</View>
)`) })

add({ key: 'native:style', group: 'Native (Expo / RN)', sub: 'global CSS-like styles (once)', name: null, once: true,
  tag: () => 'native:style',
  build: () => shapeC('native:style', `:root {\n  --color-primary: #111111;\n  --radius-default: 0.75rem;\n}\n\n.arkzen-btn {\n  background-color: var(--color-primary);\n  border-radius: var(--radius-default);\n  padding-horizontal: 24px;\n}`) })

add({ key: 'native:style:name', group: 'Native (Expo / RN)', sub: 'named StyleSheet export', name: { prompt: 'Style identifier', def: 'shared' },
  tag: n => `native:style:${n}`,
  build: ({ name }) => shapeC(`native:style:${name}`, `import { StyleSheet } from 'react-native'\n\nexport const S = StyleSheet.create({\n  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },\n})`) })

for (const code of ['404', '500']) {
  add({ key: `native:error:${code}`, group: 'Native (Expo / RN)', sub: `${code} screen, written for Expo and RN`, name: null, once: true,
    tag: () => `native:error:${code}`,
    build: () => {
      const line = code === '404'
        ? `const NativeNotFoundScreen = () => <View><Text>404 - Page not found</Text></View>`
        : `const NativeServerErrorScreen = ({ reset }: { reset: () => void }) => <View><Text onPress={reset}>Try Again</Text></View>`
      return shapeC(`native:error:${code}`, `/* @arkzen:import:expo */\n${line}\n/* @arkzen:import:expo:end */\n\n/* @arkzen:import:rn */\n${line}\n/* @arkzen:import:rn:end */\n`)
    } })
}

add({ key: 'native:animation', group: 'Native (Expo / RN)', sub: 'Reanimated hooks for Expo or bare RN (once per target)', name: null,
  variants: { list: NATIVE, optional: false, labels: NATIVE_LABEL },
  tag: (n, v) => `native:animation:${v}`,
  build: ({ variant }) => shapeC(`native:animation:${variant}`, moveHook(REANIMATED)) })

add({ key: 'native:script', group: 'Native (Expo / RN)', sub: 'helpers for Expo or bare RN (global, or named)', name: { prompt: 'Script name (blank = global)', def: '', optional: true },
  variants: { list: NATIVE, optional: false, labels: NATIVE_LABEL },
  tag: (n, v) => (n ? `native:script:${v}:${n}` : `native:script:${v}`),
  build: ({ name, variant }) => shapeC(name ? `native:script:${variant}:${name}` : `native:script:${variant}`, `export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)`) })

// ---- Native: Lynx ----
add({ key: 'lynx:page', group: 'Native (Lynx)', sub: 'a Lynx page (--layout=app)', name: { prompt: 'Page name', def: 'index' },
  tag: n => `native:page:lynx:${n}`,
  build: ({ name, flags }) => shapeC(`native:page:lynx:${name}`,
`import React from '@lynx-js/react'

const ${pascal(name)}LynxPage = () => (
  <view className="flex-1 bg-neutral-50 px-6 pt-14">
    <text className="text-4xl font-bold">${pascal(name)}</text>
  </view>
)`, flags.layout ? `/* @arkzen:native:page:layout:${flags.layout} */\n` : '') })

add({ key: 'lynx:layout', group: 'Native (Lynx)', sub: 'Lynx page wrapper (--parent=name)', name: { prompt: 'Layout name', def: 'app' },
  tag: n => `native:layout:lynx:${n}`,
  build: ({ name, flags }) => {
    const body = `export const ${pascal(name)}Layout = ({ children }: { children?: any }) => (\n  <view className="flex-1">{children}</view>\n)`
    return flags.parent
      ? shapeB(`native:layout:lynx:${name}`, `parent: ${flags.parent}`, `\n${body}\n`)
      : shapeC(`native:layout:lynx:${name}`, body)
  } })

add({ key: 'lynx:components', group: 'Native (Lynx)', sub: 'shared Lynx components', name: { prompt: 'Components identifier', def: 'shared' },
  tag: n => `native:components:lynx:${n}`,
  build: ({ name }) => shapeC(`native:components:lynx:${name}`, `import { type ReactNode } from '@lynx-js/react'\n\nexport const Card = ({ children }: { children: ReactNode }) => (<view>{children}</view>)`) })

add({ key: 'lynx:style', group: 'Native (Lynx)', sub: 'global Lynx styles (once)', name: null, once: true,
  tag: () => 'native:style:lynx', build: () => shapeC('native:style:lynx', CSS_STARTER) })

add({ key: 'lynx:style:name', group: 'Native (Lynx)', sub: 'named Lynx styles', name: { prompt: 'Style identifier', def: 'FeatureCard' },
  tag: n => `native:style:lynx:${n}`,
  build: ({ name }) => shapeC(`native:style:lynx:${name}`, `.feature-card {\n  position: relative;\n}`) })

for (const code of ['404', '500']) {
  add({ key: `lynx:error:${code}`, group: 'Native (Lynx)', sub: `Lynx ${code} screen`, name: null, once: true,
    tag: () => `native:error:${code}:lynx`,
    build: () => shapeC(`native:error:${code}:lynx`, code === '404'
      ? `const LynxNotFoundScreen = () => <view><text>404 - Page not found</text></view>`
      : `const LynxServerErrorScreen = ({ reset }: { reset: () => void }) => <view bindtap={reset}><text>Try Again</text></view>`) })
}

add({ key: 'lynx:animation', group: 'Native (Lynx)', sub: 'Lynx animation helpers (once)', name: null, once: true,
  tag: () => 'native:animation:lynx',
  build: () => shapeC('native:animation:lynx',
`import { useState, useEffect } from '@lynx-js/react'

export const useFadeSlideIn = (delay = 0) => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [])
  return { style: { opacity: visible ? 1 : 0, transition: 'opacity 350ms ease-out' } }
}`) })

add({ key: 'lynx:script', group: 'Native (Lynx)', sub: 'Lynx helpers (global, or named)', name: { prompt: 'Script name (blank = global)', def: '', optional: true },
  tag: n => (n ? `native:script:lynx:${n}` : 'native:script:lynx'),
  build: ({ name }) => shapeC(name ? `native:script:lynx:${name}` : 'native:script:lynx', `export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)`) })

// ---- Frames ----
add({ key: 'native:frame:expo', group: 'Frames', sub: 'Expo Router layout: tabs, stack, headers', name: null, once: true,
  tag: () => 'native:frame:expo',
  build: ({ slug }) => shapeC('native:frame:expo', `import React from 'react'\nimport { Stack } from 'expo-router'\n\nexport default function ${pascal(slug)}Layout() {\n  return <Stack screenOptions={{ headerShown: false }} />\n}`) })

add({ key: 'native:frame:rn', group: 'Frames', sub: 'bare RN screenOptions + Frame wrapper', name: null, once: true,
  tag: () => 'native:frame:rn',
  build: () => shapeC('native:frame:rn', `import React from 'react'\nimport { View } from 'react-native'\n\nexport const screenOptions = { headerShown: false }\n\nexport const Frame = ({ children }: { children?: React.ReactNode }) => (\n  <View style={{ flex: 1 }}>{children}</View>\n)`) })

add({ key: 'native:frame:lynx', group: 'Frames', sub: 'Lynx Frame component (no navigator)', name: null, once: true,
  tag: () => 'native:frame:lynx',
  build: () => shapeC('native:frame:lynx', `export const Frame = ({ module, page, children }: { module: string; page: string; children?: any }) => (\n  <view style={{ height: '100%' }}>\n    <view style={{ flex: 1 }}>{children}</view>\n  </view>\n)`) })

add({ key: 'desktop:frame:electron', group: 'Frames', sub: 'Electron main-process window, menu, tray (JS)', name: null, once: true,
  tag: () => 'desktop:frame:electron',
  build: ({ slug }) => shapeC('desktop:frame:electron', `// Plain JavaScript (ESM), runs in the Electron main process.\nexport const windowOptions = {\n  title: '${pascal(slug)}',\n}\n\nexport function setup({ electron, win, command, onEvent }) {\n  return () => {}\n}`) })

add({ key: 'desktop:frame:tauri', group: 'Frames', sub: 'Tauri shell code (Rust)', name: null, once: true,
  tag: () => 'desktop:frame:tauri',
  build: ({ slug }) => shapeC('desktop:frame:tauri', `// Rust, compiled into the Tauri shell.\npub fn frame(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {\n    if let Some(window) = app.get_webview_window("main") {\n        window.set_title("${pascal(slug)}")?;\n    }\n    Ok(())\n}`) })

// ---- Free files ----
add({ key: 'file', group: 'Free files', sub: 'write any text file to a path', name: { prompt: 'File block identifier', def: 'landing' },
  extra: { key: 'path', prompt: 'Output path', def: 'index.html' },
  tag: n => `file:${n}`,
  build: ({ name, flags }) => shapeB(`file:${name}`, `path: ${flags.path ?? 'index.html'}`, `<!doctype html>\n<html lang="en">\n  <head><meta charset="utf-8"><title>${name}</title></head>\n  <body><h1>${name}</h1></body>\n</html>`) })

// ---- Browser extension ----
const EXT = g => ({ group: 'Browser extension', ...g })
add(EXT({ key: 'ext:project', sub: 'extension name, permissions, targets, api (required)', name: null, once: true,
  tag: () => 'ext:project',
  build: ({ slug }) => shapeA('ext:project', `name: ${pascal(slug)}\npermissions: [storage]\ntargets: [chrome, firefox]`) }))
add(EXT({ key: 'ext:popup', sub: 'toolbar popup (React)', name: null, once: true,
  tag: () => 'ext:popup',
  build: ({ slug }) => shapeB('ext:popup', `width: 360\nheight: 480`, `export default function Popup() {\n  return <main>${pascal(slug)}</main>\n}`) }))
add(EXT({ key: 'ext:sidepanel', sub: 'side panel (React)', name: null, once: true,
  tag: () => 'ext:sidepanel',
  build: ({ slug }) => shapeB('ext:sidepanel', `title: ${pascal(slug)}`, `export default function Panel() {\n  return <main>${pascal(slug)}</main>\n}`) }))
add(EXT({ key: 'ext:page', sub: 'full-tab page: options, newtab, history, bookmarks, devtools, sandbox, offscreen, standalone', name: { prompt: 'Page name', def: 'options' },
  tag: n => `ext:page:${n}`,
  build: ({ name }) => shapeB(`ext:page:${name}`, `role: standalone\ntitle: ${pascal(name)}`, `export default function Page() {\n  return <main>${pascal(name)}</main>\n}`) }))
add(EXT({ key: 'ext:content', sub: 'content script that runs on matching pages (ui or script)', name: { prompt: 'Content script name', def: 'overlay' },
  tag: n => `ext:content:${n}`,
  build: ({ name }) => shapeB(`ext:content:${name}`, `matches: ["https://example.com/*"]\nrun_at: document_idle\nmode: script`, `console.log('${name} content script loaded')`) }))
add(EXT({ key: 'ext:background', sub: 'service worker code (TypeScript)', name: null, once: true,
  tag: () => 'ext:background',
  build: () => shapeB('ext:background', `type: module`, `console.log('background ready')`) }))
add(EXT({ key: 'ext:script', sub: 'shared TypeScript module for background, content and pages', name: { prompt: 'Script name', def: 'helpers' },
  tag: n => `ext:script:${n}`,
  build: ({ name }) => shapeC(`ext:script:${name}`, `export const example = 1`) }))
add(EXT({ key: 'ext:commands', sub: 'keyboard shortcuts', name: null, once: true,
  tag: () => 'ext:commands',
  build: () => shapeA('ext:commands', `- id: _execute_action\n  key: Ctrl+Shift+Y`) }))
add(EXT({ key: 'ext:menus', sub: 'context menu items', name: null, once: true,
  tag: () => 'ext:menus',
  build: () => shapeA('ext:menus', `- id: save-selection\n  title: Save selection\n  contexts: [selection]`) }))
add(EXT({ key: 'ext:rules', sub: 'declarativeNetRequest rulesets', name: null, once: true,
  tag: () => 'ext:rules',
  build: () => shapeA('ext:rules', `rulesets:\n  - id: main\n    enabled: true\n    rules: []`) }))
add(EXT({ key: 'ext:locale', sub: 'i18n messages for one locale (needs default_locale in ext:project)', name: { prompt: 'Locale code', def: 'en' },
  tag: n => `ext:locale:${n}`,
  build: ({ slug, name }) => shapeA(`ext:locale:${name}`, `messages:\n  appName:\n    message: ${pascal(slug)}\n    description: Name of the extension`) }))
add(EXT({ key: 'ext:export', sub: 'browser targets and zip options', name: null, once: true,
  tag: () => 'ext:export',
  build: () => shapeA('ext:export', `browsers: [chrome, firefox]\nzip: true`) }))

// ---- Terminal (CLI / TUI) ----
// @arkzen:term:* blocks. Handler, view, script and test blocks carry a language (:ts, :py, ...).
// Only TypeScript gets a working body today. Other languages get a one-line placeholder because
// their handler contract is defined together with their generator.
const termNeedsProject = source => /^[ \t]*\/\*[ \t]*@arkzen:term:project\b/m.test(source) ? null : 'Add @arkzen:term:project first (node mizumi.js block term:project --mode=cli), then the other terminal blocks.'
const TERM = g => ({ group: 'Terminal (CLI / TUI)', needs: g.key === 'term:project' ? undefined : termNeedsProject, ...g })
const TERM_LANGS = ['ts', 'py', 'rs', 'go', 'java', 'cs', 'php']
const TERM_LANG_LABEL = {
  ts: 'TypeScript (commander, Ink)', py: 'Python (Typer, Textual)', rs: 'Rust (clap, Ratatui)', go: 'Go (Cobra, Bubble Tea)',
  java: 'Java', cs: 'C# (.NET)', php: 'PHP',
}
const termVariants = { list: TERM_LANGS, optional: false, labels: TERM_LANG_LABEL, question: 'ランタイム？ Which terminal runtime?' }
const TERM_CLI_FRAMEWORK = { ts: 'commander', py: 'typer', rs: 'clap', go: 'cobra' }
const TERM_TUI_FRAMEWORK = { ts: 'ink', py: 'textual', rs: 'ratatui', go: 'bubbletea' }
const termFnName = n => { const w = words(n); return w.length ? w[0].toLowerCase() + w.slice(1).map(x => x[0].toUpperCase() + x.slice(1)).join('') : 'handler' }
const termPlaceholder = (v, what) => todo(v, `${what}: write the ${v} version here`)
const TERM_MODES = ['cli', 'tui', 'hybrid']

add(TERM({ key: 'term:project', sub: 'tool name, binary, mode (--mode=cli|tui|hybrid), runtimes (required)', name: null, once: true,
  tag: () => 'term:project',
  build: ({ slug, flags }) => {
    const mode = flags.mode ?? 'cli'
    return shapeA('term:project', `name: ${slug}\nbinary: ${slug}\nmode: ${mode}\nruntimes: [ts]\nlicense: MIT${mode === 'cli' ? '' : '\nalt_screen: true'}`)
  } }))
add(TERM({ key: 'term:runtime', sub: 'framework and dependencies for one language (use a variant: --ts, --py, --rs, --go)', name: null, variants: termVariants,
  tag: (n, v) => `term:runtime:${v}`,
  build: ({ variant, flags }) => {
    const fw = (flags.tui ? TERM_TUI_FRAMEWORK : TERM_CLI_FRAMEWORK)[variant]
    return shapeA(`term:runtime:${variant}`, fw ? `framework: ${fw}` : 'bundle: none')
  } }))
add(TERM({ key: 'term:config', sub: 'config file, env prefix and defaults', name: null, once: true,
  tag: () => 'term:config',
  build: ({ slug }) => shapeA('term:config', `file: ${slug}.json\nformat: json\nlocation: xdg\nenv_prefix: ${snake(slug).toUpperCase()}_\nflags_override: true`) }))
add(TERM({ key: 'term:theme', sub: 'palette, color roles and border style', name: null, once: true,
  tag: () => 'term:theme',
  build: () => shapeA('term:theme', `palette:\n  ink: "#e6e1d8"\n  accent: "#7a9a6d"\nroles:\n  primary: accent\n  muted: ink\nborder: rounded\nfallback:\n  accent: green\n  ink: white`) }))
add(TERM({ key: 'term:keymap', sub: 'key bindings; a name is the screen scope, no name means global', name: { prompt: 'Keymap name (blank = global)', def: '', optional: true },
  tag: n => n ? `term:keymap:${n}` : 'term:keymap',
  build: ({ flags }) => shapeA(flags.name ? `term:keymap:${flags.name}` : 'term:keymap', 'actions:\n  quit: [q, ctrl+c]') }))
add(TERM({ key: 'term:command', sub: 'a subcommand; use a dot for a nested one (db.migrate)', name: { prompt: 'Command name', def: 'run' },
  tag: n => `term:command:${n}`,
  build: ({ name }) => shapeA(`term:command:${name}`, `description: ${name}`) }))
add(TERM({ key: 'term:prompt', sub: 'interactive question flow for a command', name: { prompt: 'Prompt name', def: 'setup' },
  tag: n => `term:prompt:${n}`,
  build: ({ name }) => shapeA(`term:prompt:${name}`, `steps:\n  - id: name\n    type: text\n    message: Name\n    required: true`) }))
add(TERM({ key: 'term:screen', sub: 'one TUI screen: layout and panes', name: { prompt: 'Screen name', def: 'main' },
  tag: n => `term:screen:${n}`,
  build: ({ name, flags }) => shapeA(`term:screen:${name}`, flags.data
    ? `title: ${pascal(name)}\nlayout: split\nsize: [2, 1]\npanes:\n  - widget: table\n    data: ${flags.data}\n    columns: [title, done]\n    keymap: ${name}\n    focus: 1\n  - widget: form\n    data: ${flags.data}\n    focus: 2`
    : `title: ${pascal(name)}\nlayout: rows\npanes:\n  - widget: text\n    bind: message`) }))
add(TERM({ key: 'term:data', sub: 'record schema for a TUI or CLI (json, jsonl, sqlite)', name: { prompt: 'Data name', def: 'items' },
  tag: n => `term:data:${n}`,
  build: ({ name }) => shapeA(`term:data:${name}`, `storage: json\nfile: ${name}.json\nlocation: xdg\nsort: title\nfields:\n  - name: title\n    type: string\n    required: true\n    searchable: true\n    sortable: true\n  - name: note\n    type: text\n  - name: done\n    type: bool\n    default: false`) }))
add(TERM({ key: 'term:loop', sub: 'real-time game loop settings (needs a term:view with kind: loop)', name: { prompt: 'Loop name', def: 'game' },
  tag: n => `term:loop:${n}`,
  build: ({ name }) => shapeA(`term:loop:${name}`, `tick_rate: 10\nrender: diff\nsize:\n  width: 40\n  height: 20\ninput: events\nseed: random`) }))
add(TERM({ key: 'term:assets', sub: 'files and templates bundled into the tool', name: null, once: true,
  tag: () => 'term:assets',
  build: () => shapeA('term:assets', `embed: true`) }))
add(TERM({ key: 'term:export', sub: 'platforms, formats, completions', name: null, once: true,
  tag: () => 'term:export',
  build: () => shapeA('term:export', `platforms: [linux-x64]\nformats: [source, archive]`) }))
add(TERM({ key: 'term:handler', sub: 'command body for one language (the name is the command, dots allowed)', name: { prompt: 'Command name', def: 'run' }, variants: termVariants,
  tag: (n, v) => `term:handler:${v}:${n}`,
  build: ({ name, variant }) => shapeC(`term:handler:${variant}:${name}`, variant === 'ts'
    ? `export default async function ${termFnName(name)}({ args, flags, out }) {\n  out.line('${name}')\n}`
    : termPlaceholder(variant, `${name} handler`)) }))
add(TERM({ key: 'term:view', sub: 'custom screen, widget or loop code for one language', name: { prompt: 'View name', def: 'main' }, variants: termVariants,
  tag: (n, v) => `term:view:${v}:${n}`,
  build: ({ name, variant, flags }) => {
    const tag = `term:view:${variant}:${name}`
    if (variant !== 'ts') return shapeB(tag, `kind: ${flags.loop ? 'loop' : 'screen'}`, termPlaceholder(variant, `${name} view`))
    return flags.loop
      ? shapeB(tag, 'kind: loop', `export function init() {\n  return { tick: 0 }\n}\n\nexport function update(state, input, dt) {\n  return { ...state, tick: state.tick + 1 }\n}\n\nexport function draw(state, frame) {}`)
      : shapeB(tag, 'kind: screen', `export default function ${pascal(name)}() {\n  return null\n}`)
  } }))
add(TERM({ key: 'term:script', sub: 'shared module for one language', name: { prompt: 'Script name', def: 'helpers' }, variants: termVariants,
  tag: (n, v) => `term:script:${v}:${n}`,
  build: ({ name, variant }) => shapeC(`term:script:${variant}:${name}`, variant === 'ts' ? 'export const example = 1' : termPlaceholder(variant, `${name} module`)) }))
add(TERM({ key: 'term:test', sub: 'test file for one language', name: { prompt: 'Test name', def: 'smoke' }, variants: termVariants,
  tag: (n, v) => `term:test:${v}:${n}`,
  build: ({ name, variant }) => shapeC(`term:test:${variant}:${name}`, variant === 'ts'
    ? `import test from 'node:test'\nimport assert from 'node:assert/strict'\n\ntest('${name}', () => {\n  assert.equal(1 + 1, 2)\n})`
    : termPlaceholder(variant, `${name} test`)) }))
add(TERM({ key: 'term:readme', sub: 'README body (markdown)', name: null, once: true,
  tag: () => 'term:readme',
  build: ({ slug }) => shapeC('term:readme', `# ${slug}\n\nDescribe what this tool does.`) }))


// ---- Godot 4 ----
const GODOT = g => ({ group: 'Godot 4', game: 'godot', ...g })
add(GODOT({ key: 'godot:project', sub: 'project identity, renderer, display', name: null, once: true,
  tag: () => 'godot:project',
  build: ({ slug }) => shapeB('godot:project', `godot_version: "4.x"\nname: ${pascal(slug)}\nmain_scene: res://scenes/main.tscn\nrenderer: gl_compatibility\nwindow:\n  width: 1280\n  height: 720\n  resizable: true`) }))
add(GODOT({ key: 'godot:input', sub: 'input actions and key bindings', name: null, once: true,
  tag: () => 'godot:input',
  build: () => shapeB('godot:input', `actions:\n  move_left:\n    deadzone: 0.2\n    keys: [A, LEFT]\n  move_right:\n    deadzone: 0.2\n    keys: [D, RIGHT]\n  move_up:\n    deadzone: 0.2\n    keys: [W, UP]\n  move_down:\n    deadzone: 0.2\n    keys: [S, DOWN]\n  interact:\n    deadzone: 0.2\n    keys: [E]`) }))
add(GODOT({ key: 'godot:assets', sub: 'textures used by scenes and the world', name: null, once: true,
  tag: () => 'godot:assets',
  build: () => shapeB('godot:assets', `textures:\n  bush:\n    source: assets/images/bush.png\n    filter: nearest\n    alpha: true`) }))
add(GODOT({ key: 'godot:world', sub: 'generated world: grid, props, NPCs (needs godot:assets and an interact input)', name: null, once: true,
  tag: () => 'godot:world',
  build: ({ slug }) => shapeB('godot:world', `name: ${slug}\ntile_size: 1\ngrid_width: 32\ngrid_depth: 32\nblock_height: 0.6\nworld_margin: 2\nseed: 42\nprops:\n  bush:\n    count: 20\n    size: 0.85\n    collision: false\n    collision_radius: 0\n    texture: bush\nnpcs:\n  count: 2\n  spawn_range: 14\n  interact_radius: 1.2\n  speed: 0.025\n  wander_min: 60\n  wander_max: 240\n  interact_action: interact\ndialogues:\n  - ["Hello, traveler!"]`) }))
add(GODOT({ key: 'godot:scene', sub: 'one scene (main gets a player + camera, "player" is the player scene)', name: { prompt: 'Scene name', def: 'main' },
  tag: n => `godot:scene:${n}`,
  build: ({ name }) => {
    const header = `path: res://scenes/${name}.tscn\n`
    if (name === 'player') return shapeB('godot:scene:player', `${header}root:\n  name: Player\n  type: CharacterBody3D\n  properties:\n    position: [0, 0.5, 0]\ncomponents:\n  - type: CollisionShape3D\n    name: PlayerCollision\n    shape:\n      type: CapsuleShape3D\n      radius: 0.25\n      height: 0.9`)
    const sun = `  - name: Sun\n    type: DirectionalLight3D\n    properties:\n      shadow_enabled: true\n      rotation_degrees: [-55, -35, 0]`
    const rig = `\n  - name: Player\n    instance: res://scenes/player.tscn\n  - name: CameraRig\n    type: Node3D\n    children:\n      - name: Camera\n        type: Camera3D\n        properties:\n          projection: perspective\n          current: true`
    return shapeB(`godot:scene:${name}`, `${header}root:\n  name: ${pascal(name)}\n  type: Node3D\nnodes:\n  - name: WorldEnvironment\n    type: WorldEnvironment\n${sun}${name === 'main' ? rig : ''}`)
  } }))
add(GODOT({ key: 'godot:behavior:player', sub: 'player controller settings', name: null, once: true,
  tag: () => 'godot:behavior:player',
  build: () => shapeB('godot:behavior:player', `script: res://scripts/player.gd\nscene: res://scenes/player.tscn\nlanguage: gdscript\nextends: CharacterBody3D\nmovement:\n  input: [move_left, move_right, move_up, move_down]\n  speed: 4.0\n  acceleration: 18\n  deceleration: 24\n  camera_relative: true\n  normalize_diagonal: true\n  gravity: project_default\nanimation:\n  moving: walk_{direction}\n  idle: idle_{direction}\n  facing_priority: dominant_axis`) }))
add(GODOT({ key: 'godot:behavior:camera', sub: 'follow camera settings', name: null, once: true,
  tag: () => 'godot:behavior:camera',
  build: () => shapeB('godot:behavior:camera', `script: res://scripts/camera_follow.gd\nnode: Camera\nlanguage: gdscript\ntarget: ../../Player\nprojection: perspective\nfollow:\n  offset: [0, 1.8, 2.1]\n  smoothing: 0.09\nlook_at:\n  target_offset: [0, 0.5, 0]`) }))
add(GODOT({ key: 'godot:multiplayer', sub: 'ENet multiplayer support', name: null, once: true,
  tag: () => 'godot:multiplayer',
  build: () => shapeB('godot:multiplayer', `enabled: true\nport: 24567\nmax_clients: 8\nsync_rate: 20\ndefault_address: 127.0.0.1`) }))
add(GODOT({ key: 'godot:export', sub: 'export presets', name: null, once: true,
  tag: () => 'godot:export',
  build: () => shapeB('godot:export', `presets:\n  windows:\n    runnable: true\n  linux:\n    runnable: true\n  web:\n    runnable: false`) }))

// ---- Unity ----
const UNITY = g => ({ group: 'Unity', game: 'unity', ...g })
add(UNITY({ key: 'unity:project', sub: 'runner or scene-mode project (--mode=scene)', name: null, once: true,
  tag: () => 'unity:project',
  build: ({ slug, flags }) => shapeA('unity:project', flags.mode === 'scene'
    ? `mode: scene\nunity_version: 6000.0.38f1\nname: ${pascal(slug)}\nmain_scene: Assets/Scenes/Main.unity\nwidth: 1280\nheight: 720`
    : `unity_version: 6000.0.38f1\nname: ${pascal(slug)}\nwidth: 1280\nheight: 720\npixels_per_unit: 100`) }))
add(UNITY({ key: 'unity:game', sub: 'dino runner template settings', name: null, once: true,
  tag: () => 'unity:game',
  build: () => shapeA('unity:game', `type: dino_runner\ndinosaur: dino\nobstacle: cactus\njump_key: Space\ngravity: -30\njump_velocity: 12.5\nground_y: -2\nscroll_speed: 7.5\nspawn_interval_min: 1.1\nspawn_interval_max: 2`) }))
add(UNITY({ key: 'unity:visuals', sub: 'runner visuals', name: null, once: true,
  tag: () => 'unity:visuals',
  build: () => shapeA('unity:visuals', `background_color: "#b3e0f5"\nground_color: "#338a4f"\ndinosaur_tint: "#ffffff"\nobstacle_tint: "#ffffff"\ncamera_size: 5`) }))
add(UNITY({ key: 'unity:controls', sub: 'runner restart and pointer controls', name: null, once: true,
  tag: () => 'unity:controls', build: () => shapeA('unity:controls', `restart_key: R\npointer_enabled: true`) }))
add(UNITY({ key: 'unity:scene', sub: 'scene-mode object hierarchy', name: { prompt: 'Scene name', def: 'main' },
  tag: n => `unity:scene:${n}`,
  build: ({ name }) => shapeB(`unity:scene:${name}`, `path: Assets/Scenes/${pascal(name)}.unity\nnodes:\n  - name: Ground\n    type: cube\n    position: [0, -0.5, 0]\n    scale: [20, 1, 20]\n    color: "#456b46"\n    components:\n      - type: box_collider\n        size: [1, 1, 1]\n  - name: MainCamera\n    type: camera\n    main: true\n    position: [0, 4, -7]`) }))
add(UNITY({ key: 'unity:environment', sub: 'scene lighting and fog', name: null, once: true,
  tag: () => 'unity:environment',
  build: () => shapeA('unity:environment', `ambient_color: "#a9c7d7"\nambient_intensity: 0.8\nfog_enabled: true\nfog_color: "#c5e0dc"\nfog_density: 0.008`) }))
add(UNITY({ key: 'unity:assets', sub: 'declared source assets', name: null, once: true,
  tag: () => 'unity:assets', build: () => shapeA('unity:assets', `  dino:\n    source: assets/dino.svg\n  cactus:\n    source: assets/cactus.svg`) }))
add(UNITY({ key: 'unity:export', sub: 'scene-mode build targets', name: null, once: true,
  tag: () => 'unity:export', build: () => shapeA('unity:export', `targets: [windows, linux, webgl]`) }))

// ---- Unreal Engine ----
const UNREAL = g => ({ group: 'Unreal Engine', game: 'unreal', ...g })
add(UNREAL({ key: 'unreal:project', sub: 'Unreal Engine 5 scene project (generate-only)', name: null, once: true,
  tag: () => 'unreal:project',
  build: ({ slug }) => shapeA('unreal:project', `mode: scene\nunreal_version: "5.6"\nname: ${pascal(slug)}\nmain_scene: main\nwidth: 1280\nheight: 720`) }))
add(UNREAL({ key: 'unreal:scene', sub: 'scene object hierarchy (meters, Y-up)', name: { prompt: 'Scene name', def: 'main' },
  tag: n => `unreal:scene:${n}`,
  build: ({ name }) => shapeB(`unreal:scene:${name}`, `nodes:\n  - name: Ground\n    type: cube\n    position: [0, -0.5, 0]\n    scale: [20, 1, 20]\n    color: "#456b46"\n  - name: Sun\n    type: light\n    light_type: directional\n    rotation: [45, -30, 0]\n  - name: MainCamera\n    type: camera\n    main: true\n    position: [0, 4, -7]\n    rotation: [20, 0, 0]`) }))
add(UNREAL({ key: 'unreal:environment', sub: 'scene ambient light and fog', name: null, once: true,
  tag: () => 'unreal:environment',
  build: () => shapeA('unreal:environment', `ambient_color: "#a9c7d7"\nambient_intensity: 0.8\nfog_enabled: true\nfog_color: "#c5e0dc"\nfog_density: 0.008`) }))
add(UNREAL({ key: 'unreal:export', sub: 'packaging targets (Unreal Automation Tool scripts)', name: null, once: true,
  tag: () => 'unreal:export', build: () => shapeA('unreal:export', `targets: [windows, linux]`) }))

// ─── TEMPLATES FOR `new` ──────────────────────────────────────
const blockByKey = key => BLOCKS.find(b => b.key === key)
const make = (key, name, o = {}) => blockByKey(key).build({ name, slug: o.slug ?? '', variant: o.variant ?? null, flags: o.flags ?? {} })
const metaBlock = (slug, description, auth = false) => shapeA('meta', `name: ${slug}\nversion: 1.0.0\ndescription: ${description}\nauth: ${auth}`)

const TEMPLATES = {
  web:    { label: 'Web page', sub: 'meta + one web page, no backend',
    make: ({ slug }) => [metaBlock(slug, 'Web page tatemono'), make('web:page', 'index', { slug })] },
  crud:   { label: 'Full-stack CRUD', sub: 'meta + database + api + web page',
    make: ({ slug, resource }) => [metaBlock(slug, `CRUD for ${resource}`), make('database', resource, { slug }), make('api', resource, { slug }), make('web:page', 'index', { slug })] },
  routes: { label: 'Custom routes', sub: 'meta + routes + a handler for the active backend + web page',
    make: ({ slug, variant }) => [metaBlock(slug, 'Custom routes tatemono'), make('routes', null, { slug }), make('handler', 'hello', { slug, variant }), make('web:page', 'index', { slug })] },
  auth:   { label: 'Auth + OAuth', sub: 'meta (auth: true) + oauth + login page',
    make: ({ slug }) => [metaBlock(slug, 'Auth tatemono', true), make('oauth', null, { slug }), make('web:page', 'index', { slug })] },
  native: { label: 'Native screen', sub: 'meta + meta:native + one Expo / RN screen',
    make: ({ slug }) => [metaBlock(slug, 'Native tatemono'), make('meta:native', null, { slug }), make('native:page', 'index', { slug })] },
  multi:  { label: 'Web + Expo/RN + Lynx', sub: 'one page for each target',
    make: ({ slug }) => [metaBlock(slug, 'Multi-target tatemono'), make('meta:native', null, { slug }), make('web:page', 'index', { slug }), make('native:page', 'index', { slug }), make('lynx:page', 'index', { slug })] },
  lynx:   { label: 'Lynx page', sub: 'meta + one Lynx page',
    make: ({ slug }) => [metaBlock(slug, 'Lynx tatemono'), make('lynx:page', 'index', { slug })] },
  files:  { label: 'Free files only', sub: 'meta + one @arkzen:file block',
    make: ({ slug }) => [metaBlock(slug, 'Free files tatemono'), make('file', 'landing', { slug, flags: { path: 'index.html' } })] },
  godot:  { label: 'Godot 4 game', sub: 'project + input + scene + player + camera + export',
    make: ({ slug }) => [metaBlock(slug, 'Godot game tatemono'), make('godot:project', null, { slug }), make('godot:input'), make('godot:scene', 'main', { slug }), make('godot:scene', 'player', { slug }), make('godot:behavior:player'), make('godot:behavior:camera'), make('godot:export')] },
  unity:  { label: 'Unity scene', sub: 'scene-mode project + environment + scene + export',
    make: ({ slug }) => [metaBlock(slug, 'Unity scene tatemono'), make('unity:project', null, { slug, flags: { mode: 'scene' } }), make('unity:environment'), make('unity:scene', 'main', { slug }), make('unity:export')] },
  unreal: { label: 'Unreal Engine scene', sub: 'scene project + environment + scene + export',
    make: ({ slug }) => [metaBlock(slug, 'Unreal Engine scene tatemono'), make('unreal:project', null, { slug }), make('unreal:environment'), make('unreal:scene', 'main', { slug }), make('unreal:export')] },
  extension: { label: 'Browser extension', sub: 'meta + ext project + popup + export',
    make: ({ slug }) => [metaBlock(slug, 'Browser extension tatemono'), make('ext:project', null, { slug }), make('ext:popup', null, { slug }), make('ext:export')] },
  cli:    { label: 'Command line tool', sub: 'meta + term project + ts runtime + one command and handler + export',
    make: ({ slug }) => [metaBlock(slug, 'Command line tool tatemono'), make('term:project', null, { slug, flags: { mode: 'cli' } }), make('term:runtime', null, { slug, variant: 'ts' }), make('term:command', 'hello', { slug }), make('term:handler', 'hello', { slug, variant: 'ts' }), make('term:export')] },
  tui:    { label: 'Terminal UI', sub: 'meta + term project (tui) + ts runtime + one screen + keymap',
    make: ({ slug }) => [metaBlock(slug, 'Terminal UI tatemono'), make('term:project', null, { slug, flags: { mode: 'tui' } }), make('term:runtime', null, { slug, variant: 'ts', flags: { tui: true } }), make('term:screen', 'main', { slug }), make('term:keymap', 'main', { slug, flags: { name: 'main' } })] },
  records: { label: 'Record manager (TUI)', sub: 'meta + term project (tui) + data + table/form screen + keymap + export',
    make: ({ slug }) => [metaBlock(slug, 'Record manager tatemono'), make('term:project', null, { slug, flags: { mode: 'tui' } }), make('term:runtime', null, { slug, variant: 'ts', flags: { tui: true } }), make('term:data', 'items', { slug }), make('term:screen', 'main', { slug, flags: { data: 'items' } }), make('term:keymap', 'main', { slug, flags: { name: 'main' } }), make('term:export')] },
  game:   { label: 'Terminal game', sub: 'meta + term project (tui) + ts runtime + loop and loop view + keymap',
    make: ({ slug }) => [metaBlock(slug, 'Terminal game tatemono'), make('term:project', null, { slug, flags: { mode: 'tui' } }), make('term:runtime', null, { slug, variant: 'ts', flags: { tui: true } }), make('term:keymap', null, { slug }), make('term:loop', 'game', { slug }), make('term:view', 'game', { slug, variant: 'ts', flags: { loop: true } })] },
}


// ─── SOURCE MODEL ─────────────────────────────────────────────
// A small, dependency-free reader for the parts of a tatemono the scaffold
// needs to cross-check. It is not a YAML parser; it reads what the guideline
// says these blocks contain.
const BACKEND_CODE = new Set(['endpoint', 'handler', 'policy', 'middleware', 'listener'])
const BACKEND_MIXED = new Set(['jobs', 'console', 'notifications', 'mail'])
const SHAPE_A_TAGS = new Set(['meta', 'meta:web', 'meta:native', 'web:config', 'native:config', 'desktop:config', 'oauth', 'routes'])
const DECL_RE = /^(web:page:layout|native:page:layout|native:page:lynx:layout):(.+)$/
// Browser extension blocks (@arkzen:ext:*). Named blocks carry a name after the family.
const EXT_YAML_FAMILIES = new Set(['ext:project', 'ext:commands', 'ext:menus', 'ext:rules', 'ext:locale', 'ext:export'])
const EXT_CODE_FAMILIES = new Set(['ext:popup', 'ext:sidepanel', 'ext:page', 'ext:content', 'ext:background', 'ext:script'])
const EXT_NAMED_FAMILIES = new Set(['ext:page', 'ext:content', 'ext:script', 'ext:locale'])
// Terminal blocks (@arkzen:term:*). How many parts follow the family name:
//   none: nothing   optname: an optional name   name: a name   lang: a language   langname: a language and a name
const TERM_FAMILY_SHAPE = {
  'term:project': 'none', 'term:config': 'none', 'term:theme': 'none', 'term:assets': 'none', 'term:export': 'none', 'term:readme': 'none',
  'term:runtime': 'lang', 'term:keymap': 'optname',
  'term:command': 'name', 'term:prompt': 'name', 'term:screen': 'name', 'term:data': 'name', 'term:loop': 'name',
  'term:handler': 'langname', 'term:view': 'langname', 'term:script': 'langname', 'term:test': 'langname',
}
const TERM_CODE_FAMILIES = new Set(['term:handler', 'term:view', 'term:script', 'term:test', 'term:readme'])
const TERM_YAML_FAMILIES = new Set(Object.keys(TERM_FAMILY_SHAPE).filter(f => !TERM_CODE_FAMILIES.has(f)))
const TERM_LANG_SHAPES = new Set(['lang', 'langname'])

function parseTag(tag) {
  const decl = tag.match(DECL_RE)
  if (decl) return { family: decl[1], decl: decl[2], name: '' }
  const parts = tag.split(':')
  const head = parts[0]
  if (BACKEND_CODE.has(head) || BACKEND_MIXED.has(head)) {
    const variant = BACKENDS.includes(parts[1]) ? parts[1] : null
    return { family: head, variant, name: parts.slice(variant ? 2 : 1).join(':') }
  }
  if (head === 'module') return { family: 'module:rs', name: '' }
  if (head === 'meta') return { family: parts[1] ? `meta:${parts[1]}` : 'meta', name: '' }
  if (head === 'web') return { family: `web:${parts[1]}`, name: parts.slice(2).join(':') }
  if (head === 'desktop') return { family: `desktop:${parts[1]}`, name: parts.slice(2).join(':') }
  if (head === 'ext') return { family: `ext:${parts[1]}`, name: parts.slice(2).join(':') }
  if (head === 'term') {
    const family = `term:${parts[1]}`
    if (TERM_LANG_SHAPES.has(TERM_FAMILY_SHAPE[family])) return { family, variant: parts[2] ?? null, name: parts.slice(3).join(':') }
    return { family, name: parts.slice(2).join(':') }
  }
  if (head === 'godot' || head === 'unity' || head === 'unreal') return { family: `${head}:${parts[1]}`, name: parts.slice(2).join(':') }
  if (head === 'native') {
    if (parts[2] === 'lynx' && (parts[1] === 'page' || parts[1] === 'layout' || parts[1] === 'components'))
      return { family: `native:${parts[1]}:lynx`, name: parts.slice(3).join(':') }
    return { family: `native:${parts[1]}`, name: parts.slice(2).join(':') }
  }
  return { family: head, name: parts.slice(1).join(':') }
}

const yamlTop = yaml => {
  const out = {}
  for (const line of yaml.split('\n')) {
    const m = line.match(/^([A-Za-z_][\w-]*):[ \t]*(.*?)[ \t]*$/)
    if (m) out[m[1]] = m[2].replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '')
  }
  return out
}

// Names of mapping keys directly under `key:`, with the scalar fields of each child.
function yamlChildren(yaml, key) {
  const lines = yaml.split('\n')
  const start = lines.findIndex(l => new RegExp(`^${escapeRe(key)}:\\s*(#.*)?$`).test(l))
  if (start < 0) return null
  const children = []
  let indent = null, current = null
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i]
    if (!l.trim() || /^\s*#/.test(l)) continue
    const lead = l.match(/^ */)[0].length
    if (lead === 0) break
    if (indent === null) indent = lead
    const kv = l.match(/^\s*([A-Za-z_][\w.-]*):[ \t]*(.*?)[ \t]*$/)
    if (!kv) continue
    if (lead === indent) { current = { name: kv[1], fields: {} }; children.push(current) }
    else if (current && lead > indent) current.fields[kv[1]] = kv[2].replace(/^["']|["']$/g, '')
  }
  return children
}

function listedNames(yaml, key) {
  const names = []
  for (const m of yaml.matchAll(new RegExp(`${key}:[ \\t]*\\[([^\\]]*)\\]`, 'g')))
    names.push(...m[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean))
  for (const m of yaml.matchAll(new RegExp(`^([ \\t]*)${key}:[ \\t]*\\n((?:\\1[ \\t]+-[^\\n]*\\n?)+)`, 'gm')))
    for (const item of m[2].matchAll(/-\s*([A-Za-z0-9_]+)/g)) names.push(item[1])
  return names
}

export function scanSource(source) {
  const src = String(source).replace(/\r\n?/g, '\n')
  const model = {
    src, openers: [], meta: null, metaLine: 0, apis: [], tables: [], routes: [], events: [],
    webPages: [], webLayouts: [], nativePages: [], nativeLayouts: [], lynxPages: [], lynxLayouts: [],
    code: [], mixed: [], frames: [], fileBlocks: [], game: null, ends: new Set(), oauth: null, exts: [], terms: [],
  }
  const lineOf = idx => src.slice(0, idx).split('\n').length
  let lastWeb = null, lastNative = null, lastLynx = null
  for (const m of src.matchAll(/\/\*[ \t]*@arkzen:([A-Za-z0-9:_+.{}-]+)([^\n]*)/g)) {
    const tag = m[1], rest = m[2]
    const afterOpen = m.index + m[0].length
    // A real block tag starts its line. Mentions inside strings or prose do not count.
    if (!/^[ \t]*$/.test(src.slice(src.lastIndexOf('\n', m.index - 1) + 1, m.index))) continue
    if (tag.endsWith(':end')) { model.ends.add(tag.slice(0, -4)); continue }
    const sameLineClose = rest.includes('*/')
    let yaml = '', closed = true
    if (!sameLineClose) {
      // ext blocks hold match patterns such as "https://*/*", and term blocks hold globs such as "**/*.txt",
      // which contain */ inside a string. Their header ends at a */ that starts its own line,
      // the same rule the engine parser uses.
      let end
      if (tag.startsWith('ext:') || tag.startsWith('term:')) {
        const own = /\n\*\//.exec(src.slice(afterOpen))
        end = own ? afterOpen + own.index + 1 : -1
      } else {
        end = src.indexOf('*/', afterOpen)
      }
      closed = end >= 0
      yaml = closed ? src.slice(afterOpen, end).replace(/^\n/, '') : ''
    }
    const nextLine = (src.slice(afterOpen + 1).split('\n')[0] ?? '').trim()
    const o = { tag, ...parseTag(tag), line: lineOf(m.index), sameLineClose, closed, yaml, nextLine }
    model.openers.push(o)
    if (o.family.startsWith('ext:')) model.exts.push({ ...o, name: o.name, fields: yamlTop(yaml) })
    if (o.family.startsWith('term:')) model.terms.push({ ...o, fields: yamlTop(yaml) })

    switch (o.family) {
      case 'meta': model.meta = { ...yamlTop(yaml), _raw: yaml }; model.metaLine = o.line; break
      case 'database': {
        const top = yamlTop(yaml)
        const cols = yamlChildren(yaml, 'columns') ?? []
        model.tables.push({ tag, line: o.line, id: o.name, table: top.table || o.name, columns: cols.map(c => ({ name: c.name, type: c.fields.type, foreign: c.fields.foreign })), hasColumns: yamlChildren(yaml, 'columns') !== null })
        break
      }
      case 'api': {
        const top = yamlTop(yaml)
        const eps = yamlChildren(yaml, 'endpoints') ?? []
        model.apis.push({ tag, line: o.line, id: o.name, model: top.model, controller: top.controller, prefix: top.prefix, policy: /^true$/i.test(top.policy ?? ''), endpoints: eps.map(e => ({ name: e.name, method: e.fields.method })) })
        break
      }
      case 'routes': model.routes.push({ line: o.line, handlers: [...yaml.matchAll(/\bhandler:[ \t]*["']?([A-Za-z0-9_]+)/g)].map(h => h[1]) }); break
      case 'events': model.events.push({ line: o.line, id: o.name, listeners: listedNames(yaml, 'listeners') }); break
      case 'oauth': model.oauth = { line: o.line, ...yamlTop(yaml), _raw: yaml }; break
      case 'web:page': lastWeb = { name: o.name, line: o.line, layout: null }; model.webPages.push(lastWeb); break
      case 'web:page:layout': if (lastWeb) lastWeb.layout = o.decl; break
      case 'web:layout': model.webLayouts.push({ name: o.name, line: o.line, parent: yamlTop(yaml).parent || null }); break
      case 'native:page': lastNative = { name: o.name, line: o.line, layout: null }; model.nativePages.push(lastNative); break
      case 'native:page:layout': if (lastNative) lastNative.layout = o.decl; break
      case 'native:page:lynx': lastLynx = { name: o.name, line: o.line, layout: null }; model.lynxPages.push(lastLynx); break
      case 'native:page:lynx:layout': if (lastLynx) lastLynx.layout = o.decl; break
      case 'native:layout': model.nativeLayouts.push({ name: o.name, line: o.line, parent: yamlTop(yaml).parent || null }); break
      case 'native:layout:lynx': model.lynxLayouts.push({ name: o.name, line: o.line, parent: yamlTop(yaml).parent || null }); break
      case 'native:frame': case 'desktop:frame': model.frames.push({ target: o.name, line: o.line }); break
      case 'file': model.fileBlocks.push({ name: o.name, line: o.line, path: yamlTop(yaml).path }); break
      case 'godot:project': model.game = 'godot'; break
      case 'unity:project': model.game = 'unity'; break
      case 'unreal:project': model.game = 'unreal'; break
      default:
        if (BACKEND_CODE.has(o.family)) model.code.push(o)
        else if (BACKEND_MIXED.has(o.family)) model.mixed.push(o)
    }
  }
  const bodyFor = (family, variant) => model.code.filter(o => o.family === family && (o.variant ?? 'php') === variant).map(o => o.name)
  model.implemented = (family, variant) => new Set(bodyFor(family, variant ?? 'php'))
  model.apiEndpointNames = () => [...new Set(model.apis.flatMap(a => a.endpoints.map(e => e.name)))]
  model.routeHandlerNames = () => [...new Set(model.routes.flatMap(r => r.handlers))]
  model.listenerNames = () => [...new Set(model.events.flatMap(e => e.listeners))]
  return model
}

// Same grammar as the engine's parsePageLayoutDecl.
export function parseLayoutDecl(raw) {
  const t = String(raw ?? '').trim()
  const g = t.match(/^\+?(auth|guest)(?::([a-zA-Z0-9_-]+))?$/)
  if (g) return { guard: g[1], layout: g[2] ?? undefined }
  return { layout: t || undefined }
}

// ─── LINT ─────────────────────────────────────────────────────
// Mirrors the engine's validator and the guideline's tag-shape rules, so a
// tatemono can be checked without installing the engine. Calibrated against
// every tatemono in tatemonos/ and against the engine validator itself.
const VALID_COLUMN_TYPES = new Set(['integer', 'bigInteger', 'string', 'text', 'longText', 'decimal', 'float', 'boolean', 'date', 'datetime', 'timestamp', 'json', 'uuid', 'foreignId'])
const VALID_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
const SHAPE_C_HEADS = new Set(['web', 'native'])

export function lintSource(source, opts = {}) {
  const m = scanSource(source)
  const errors = [], warnings = []
  const E = (msg, line) => errors.push({ msg, line })
  const W = (msg, line) => warnings.push({ msg, line })
  const variant = opts.variant ?? null

  // meta
  if (!m.meta) E('@arkzen:meta is missing. Every tatemono starts with it.')
  else {
    if (!m.meta.name) E('@arkzen:meta needs a name:', m.metaLine)
    else if (opts.slug && m.meta.name !== opts.slug) W(`@arkzen:meta name "${m.meta.name}" does not match the folder "${opts.slug}"`, m.metaLine)
  }

  // tag shapes (guideline Section 3D)
  const seen = new Map()
  for (const o of m.openers) {
    if (o.family.startsWith('godot:') || o.family.startsWith('unity:') || o.family.startsWith('unreal:') || o.tag.startsWith('import:') || o.tag.startsWith('resolved:')) continue
    if (o.decl !== undefined) continue
    // Expo and bare RN may each declare the same native block (the engine checks per target).
    if (seen.has(o.tag) && o.tag.startsWith('native:') && !o.tag.includes('lynx')) continue
    if (seen.has(o.tag)) E(`Duplicate block @arkzen:${o.tag} (first at line ${seen.get(o.tag)})`, o.line)
    else seen.set(o.tag, o.line)

    if (o.family.startsWith('ext:')) {
      if (!EXT_YAML_FAMILIES.has(o.family) && !EXT_CODE_FAMILIES.has(o.family)) E(`Unknown extension block @arkzen:${o.tag}. Known: ${[...EXT_YAML_FAMILIES, ...EXT_CODE_FAMILIES].map(f => '@arkzen:' + f).join(', ')}.${didYouMean(o.family, [...EXT_YAML_FAMILIES, ...EXT_CODE_FAMILIES])}`, o.line)
      else if (EXT_NAMED_FAMILIES.has(o.family) && !o.name) E(`@arkzen:${o.tag} needs a name: write @arkzen:${o.family}:<name>`, o.line)
      else if (!EXT_NAMED_FAMILIES.has(o.family) && o.name) E(`@arkzen:${o.family} takes no name (found "${o.name}")`, o.line)
    }
    if (o.family.startsWith('term:')) {
      const shape = TERM_FAMILY_SHAPE[o.family]
      if (!shape) E(`Unknown terminal block @arkzen:${o.tag}. Known: ${Object.keys(TERM_FAMILY_SHAPE).map(f => '@arkzen:' + f).join(', ')}.${didYouMean(o.family, Object.keys(TERM_FAMILY_SHAPE))}`, o.line)
      else {
        if (TERM_LANG_SHAPES.has(shape)) {
          if (!o.variant) E(`@arkzen:${o.tag} needs a language: write @arkzen:${o.family}:<lang>${shape === 'langname' ? ':<n>' : ''} (${TERM_LANGS.join(', ')})`, o.line)
          else if (!TERM_LANGS.includes(o.variant)) E(`@arkzen:${o.tag}: unknown language "${o.variant}". Use one of: ${TERM_LANGS.join(', ')}.${didYouMean(o.variant, TERM_LANGS)}`, o.line)
          else if (shape === 'langname' && !o.name) E(`@arkzen:${o.tag} needs a name: write @arkzen:${o.family}:${o.variant}:<n>`, o.line)
          else if (shape === 'lang' && o.name) E(`@arkzen:${o.family}:${o.variant} takes no name (found "${o.name}")`, o.line)
        } else if (shape === 'name' && !o.name) E(`@arkzen:${o.tag} needs a name: write @arkzen:${o.family}:<n>`, o.line)
        else if (shape === 'none' && o.name) E(`@arkzen:${o.family} takes no name (found "${o.name}")`, o.line)
      }
    }
    const head = o.tag.split(':')[0]
    const isA = SHAPE_A_TAGS.has(o.tag) || head === 'database' || head === 'api' || EXT_YAML_FAMILIES.has(o.family) || TERM_YAML_FAMILIES.has(o.family)
    const isD = BACKEND_CODE.has(head) || o.family === 'module:rs'
    const isC = (SHAPE_C_HEADS.has(head) && !SHAPE_A_TAGS.has(o.tag) && o.family !== 'native:meta') || o.family === 'desktop:frame' || EXT_CODE_FAMILIES.has(o.family) || TERM_CODE_FAMILIES.has(o.family)
    const needsEnd = () => { if (!m.ends.has(o.tag)) E(`@arkzen:${o.tag} is missing its closing /* @arkzen:${o.tag}:end */`, o.line) }
    if (isA) {
      if (o.sameLineClose) E(`@arkzen:${o.tag} is a YAML-only block: do not put */ on the opening line, close it with a bare */ line`, o.line)
      else if (!o.closed) E(`@arkzen:${o.tag} is never closed with */`, o.line)
    } else if (isD) {
      // The engine also accepts the legacy one-line form (`/* @arkzen:endpoint:php:x */`).
      if (!o.sameLineClose && o.nextLine !== '*/') E(`@arkzen:${o.tag}: the line after the opening tag must be exactly */`, o.line)
      needsEnd()
    } else if (isC) {
      // Layouts and ext blocks may open with a multi-line YAML header (Shape B).
      const layoutWithYaml = (o.family === 'web:layout' || o.family === 'native:layout' || o.family === 'native:layout:lynx' || EXT_CODE_FAMILIES.has(o.family) || TERM_CODE_FAMILIES.has(o.family)) && !o.sameLineClose && o.closed
      if (!o.sameLineClose && !layoutWithYaml) E(`@arkzen:${o.tag} is a code block: put */ on the SAME line as the opening tag`, o.line)
      needsEnd()
    } else if (o.family === 'file') {
      if (!o.sameLineClose && !o.yaml.trim()) E(`@arkzen:${o.tag} needs a path: line`, o.line)
      if (!m.fileBlocks.find(f => f.name === o.name)?.path) E(`@arkzen:${o.tag} needs a path: (where the file is written)`, o.line)
      needsEnd()
    } else if (BACKEND_MIXED.has(head) || o.family === 'events' || o.family === 'realtime') {
      if (o.name && (o.variant || o.family === 'realtime' || o.family === 'events') && !m.ends.has(o.tag) && !o.closed) E(`@arkzen:${o.tag} is never closed with */`, o.line)
    }
  }

  const isGame = !!m.game
  const hasFiles = m.fileBlocks.length > 0

  // terminal blocks: the cross-checks that need no YAML parser (the engine validator checks the rest)
  if (m.terms.length) {
    const proj = m.terms.find(o => o.family === 'term:project')
    if (!proj) E('@arkzen:term:project is required when a tatemono has terminal blocks')
    const listed = proj && /^runtimes:[ \t]*\[([^\]]*)\]/m.exec(proj.yaml)
    const runtimes = listed ? listed[1].split(',').map(s => s.trim()).filter(Boolean) : null
    const commands = new Set(m.terms.filter(o => o.family === 'term:command').map(o => o.name))
    for (const o of m.terms) {
      if (runtimes && o.variant && TERM_LANGS.includes(o.variant) && !runtimes.includes(o.variant))
        E(`@arkzen:${o.tag}: "${o.variant}" is not listed in @arkzen:term:project runtimes (${runtimes.join(', ')})`, o.line)
      if (o.family === 'term:handler' && o.name && !commands.has(o.name) && !/^command:/m.test(o.yaml))
        W(`@arkzen:${o.tag}: no @arkzen:term:command:${o.name} exists for this handler.${didYouMean(o.name, [...commands])}`, o.line)
    }
  }

  // pages
  if (!isGame && !hasFiles && !m.exts.length && !m.terms.length && !m.webPages.length && !m.nativePages.length && !m.lynxPages.length)
    E('At least one @arkzen:web:page:<name>, @arkzen:native:page:<name> or @arkzen:native:page:lynx:<name> is required')
  for (const [list, label] of [[m.webPages, 'web'], [m.nativePages, 'native'], [m.lynxPages, 'Lynx']]) {
    const names = new Set()
    for (const p of list) { if (names.has(p.name) && label !== 'native') E(`Duplicate ${label} page "${p.name}"`, p.line); names.add(p.name) }
  }

  // layouts: pages and parents must point at layouts that exist
  const layoutCheck = (pages, layouts, label, marker, skipDefault) => {
    const declared = new Set(layouts.map(l => l.name))
    for (const p of pages) {
      if (skipDefault && (p.layout ?? 'default') === 'default') continue
      if (p.layout == null) continue
      const { layout } = parseLayoutDecl(p.layout)
      const missing = (layout?.split(':') ?? []).filter(n => !declared.has(n))
      if (missing.length) E(`${label} page "${p.name}": layout "${missing.join(':')}" is not defined. Valid layouts: ${[...declared].join(', ') || '(none)'}. Define it with @arkzen:${marker}:${missing[0]}`, p.line)
    }
    for (const l of layouts) {
      if (l.parent && !declared.has(l.parent)) E(`${label} layout "${l.name}": parent "${l.parent}" is not defined`, l.line)
      let cur = l, hops = 0
      while (cur?.parent && hops++ < 50) cur = layouts.find(x => x.name === cur.parent)
      if (hops >= 50) E(`${label} layout chain cycles at "${l.name}"`, l.line)
    }
  }
  layoutCheck(m.webPages, m.webLayouts, 'Web', 'web:layout', false)
  layoutCheck(m.nativePages, m.nativeLayouts, 'Native', 'native:layout', true)
  layoutCheck(m.lynxPages, m.lynxLayouts, 'Lynx', 'native:layout:lynx', true)

  if (m.meta && /^true$/i.test(m.meta.auth ?? '')) {
    const guards = m.webPages.map(p => parseLayoutDecl(p.layout).guard)
    if (guards.includes('auth') && !guards.includes('guest'))
      W('auth: true is set but no guest page exists, so nobody can log in. Add @arkzen:web:page:layout:+guest to the login page.')
  }
  if (m.oauth) {
    if (!/^true$/i.test(m.meta?.auth ?? '')) E('@arkzen:oauth requires auth: true in @arkzen:meta', m.oauth.line)
    if (!/providers:\s*\S/.test(m.oauth._raw)) E('@arkzen:oauth needs a non-empty providers list', m.oauth.line)
  }

  // database
  const tableNames = new Set(['users', ...m.tables.map(t => t.table)])
  const prefix = (m.meta?.name ?? '').replace(/-/g, '_')
  m.tables.forEach(t => tableNames.add(`${prefix}_${t.table}`))
  const seenTables = new Set()
  for (const t of m.tables) {
    if (!/^[a-z][a-z0-9_]*$/.test(t.table)) E(`Table name "${t.table}" must be lowercase snake_case`, t.line)
    else if (!/^[a-z][a-z0-9_]*s$/.test(t.table) && t.table !== 'users' && !t.table.endsWith('_log')) W(`Table "${t.table}" should be plural snake_case (e.g. "${plural(t.table)}")`, t.line)
    if (!t.hasColumns) E(`database "${t.table}" needs a columns: section`, t.line)
    if (seenTables.has(t.table)) E(`Duplicate table declaration "${t.table}"`, t.line)
    seenTables.add(t.table)
    for (const c of t.columns) {
      if (c.type === 'enum') E(`Table "${t.table}", column "${c.name}": type "enum" is unsupported; use string and check the values in the endpoint code`, t.line)
      else if (c.type && !VALID_COLUMN_TYPES.has(c.type)) E(`Table "${t.table}", column "${c.name}": invalid type "${c.type}"`, t.line)
      if (c.foreign && !tableNames.has(c.foreign.split('.')[0])) E(`Table "${t.table}", column "${c.name}": foreign key points at unknown table "${c.foreign.split('.')[0]}"`, t.line)
    }
  }
  const deps = new Map(m.tables.map(t => [t.table, t.columns.filter(c => c.foreign).map(c => c.foreign.split('.')[0])]))
  const cyc = (t, stack = new Set(), done = new Set()) => { if (stack.has(t)) return true; if (done.has(t)) return false; stack.add(t); for (const d of deps.get(t) ?? []) if (cyc(d, stack, done)) return true; stack.delete(t); done.add(t); return false }
  for (const t of m.tables) if (cyc(t.table)) { E(`Circular foreign key dependency involving "${t.table}"`, t.line); break }

  // api
  const seenControllers = new Set()
  for (const a of m.apis) {
    if (!a.controller) E(`api "${a.id || a.model}" needs controller:`, a.line)
    else if (!a.controller.endsWith('Controller')) E(`API controller "${a.controller}" must end with "Controller"`, a.line)
    if (a.model && !/^[A-Z][a-zA-Z0-9]*$/.test(a.model)) E(`API model "${a.model}" must be PascalCase`, a.line)
    if (!a.prefix) E(`api "${a.id || a.model}" needs prefix:`, a.line)
    else if (!a.prefix.startsWith('/api/')) E(`API prefix "${a.prefix}" must start with /api/`, a.line)
    for (const e of a.endpoints) if (e.method && !VALID_METHODS.has(e.method.toUpperCase())) E(`API "${a.controller}", endpoint "${e.name}": invalid method "${e.method}"`, a.line)
    if (a.controller) { if (seenControllers.has(a.controller)) E(`Duplicate controller "${a.controller}"`, a.line); seenControllers.add(a.controller) }
    if (a.model && m.tables.length) {
      const snakeModel = a.model.replace(/(?<!^)([A-Z])/g, '_$1').toLowerCase()
      if (!m.tables.some(t => t.table === plural(snakeModel) || t.table === snakeModel))
        W(`API model "${a.model}" expects table "${plural(snakeModel)}". Add a @arkzen:database block with that table.`, a.line)
    }
  }

  // extension blocks (engine contract, the main parts; the engine validator checks every key)
  if (m.exts.length) {
    const project = m.exts.find(x => x.family === 'ext:project')
    if (!project) E('@arkzen:ext:project is required when a tatemono has extension blocks')
    else if (!project.fields.name) E('@arkzen:ext:project needs a name:', project.line)
    if (!m.exts.some(x => ['ext:popup', 'ext:sidepanel', 'ext:page', 'ext:content', 'ext:background'].includes(x.family)))
      E('An extension needs at least one of @arkzen:ext:popup, ext:sidepanel, ext:page:<name>, ext:content:<name> or ext:background')
    for (const x of m.exts.filter(x => x.family === 'ext:content')) {
      const o = m.openers.find(op => op.line === x.line)
      if (!/^matches:/m.test(o?.yaml ?? '')) E(`@arkzen:${x.tag} needs matches: (the pages it runs on)`, x.line)
      if (!x.fields.mode) E(`@arkzen:${x.tag} needs mode: ui or mode: script`, x.line)
    }
    const locales = m.exts.filter(x => x.family === 'ext:locale')
    if (locales.length && !project?.fields.default_locale) E('@arkzen:ext:project needs default_locale: when @arkzen:ext:locale blocks exist', project?.line)
  }

  // frames (engine contract)
  for (const f of m.frames) {
    const o = m.openers.find(x => x.line === f.line)
    const body = bodyBetween(m.src, o)
    if (f.target === 'expo' && !/export\s+default\b/.test(body)) E('@arkzen:native:frame:expo must `export default` a layout component', f.line)
    if (f.target === 'rn' && !/export\s+(?:const|let|function)\s+(?:screenOptions|Frame)\b/.test(body)) E('@arkzen:native:frame:rn must export `screenOptions` and/or `Frame`', f.line)
    if (f.target === 'lynx' && !/export\s+(?:const|let|function)\s+Frame\b/.test(body)) E('@arkzen:native:frame:lynx must export a `Frame` component', f.line)
    if (f.target === 'electron' && !/export\s+(?:default\b|(?:const|let|function)\s+(?:setup|windowOptions)\b)/.test(body)) E('@arkzen:desktop:frame:electron must export `setup`, `windowOptions` or a default function (plain JavaScript)', f.line)
    if (f.target === 'tauri' && !/pub\s+fn\s+frame\s*\(/.test(body)) E('@arkzen:desktop:frame:tauri must define `pub fn frame(app: ...)`', f.line)
  }

  // backend code blocks: cross-references and variants
  const endpointNames = new Set(m.apiEndpointNames()), handlerNames = new Set(m.routeHandlerNames()), listenerNames = new Set(m.listenerNames())
  for (const o of m.code) {
    if (o.family === 'endpoint' && !endpointNames.has(o.name)) W(`@arkzen:${o.tag}: no @arkzen:api declares an endpoint "${o.name}", so this body is never used.${didYouMean(o.name, [...endpointNames])}`, o.line)
    if (o.family === 'handler' && !handlerNames.has(o.name)) W(`@arkzen:${o.tag}: no @arkzen:routes entry uses handler: ${o.name}, so this body is never used.${didYouMean(o.name, [...handlerNames])}`, o.line)
    if (o.family === 'listener' && !listenerNames.has(o.name)) W(`@arkzen:${o.tag}: no @arkzen:events block lists "${o.name}" as a listener.${didYouMean(o.name, [...listenerNames])}`, o.line)
    if (o.family === 'policy' && !m.apis.some(a => a.policy)) W(`@arkzen:${o.tag}: no @arkzen:api has policy: true, so the policy is not applied`, o.line)
  }
  if (variant) {
    const groups = new Map()
    for (const o of [...m.code, ...m.mixed]) {
      const key = `${o.family}:${o.name}`
      if (!groups.has(key)) groups.set(key, { o, variants: new Set(), shared: false })
      const g = groups.get(key)
      if (o.variant) g.variants.add(o.variant); else if (BACKEND_CODE.has(o.family)) g.variants.add('php'); else g.shared = true
    }
    for (const g of groups.values()) {
      if (g.variants.size && !g.variants.has(variant) && !g.shared)
        W(`@arkzen:${g.o.family}:${g.o.name} has no :${variant} variant (found: ${[...g.variants].join(', ')}). The tatemono is inactive on the :${variant} backend until you add it.`, g.o.line)
    }
  }
  return { errors, warnings, model: m }
}

function bodyBetween(src, opener) {
  const start = src.split('\n').slice(0, opener.line).join('\n').length
  const end = src.indexOf(`@arkzen:${opener.tag}:end`, start)
  return src.slice(start, end < 0 ? undefined : end)
}

export const formatFinding = f => (f.line ? `line ${f.line}: ` : '') + f.msg

// ─── NAMES ────────────────────────────────────────────────────
// Each block kind has one naming style in the fixtures (checked across every
// tatemono in tatemonos/). A name that is not in that style is converted and
// the conversion is reported. --exact turns conversion off (validity is still
// enforced, because an invalid table name breaks the whole tatemono).
const NAME_KIND = {
  database: 'table', api: 'table', crud: 'table',
  listener: 'pascal', 'web:style:name': 'pascal',
  endpoint: 'ident', handler: 'ident', policy: 'ident', middleware: 'ident',
  realtime: 'free', 'realtime:event': 'free', 'native:style:name': 'free', 'lynx:style:name': 'free',
  'native:script': 'free', 'lynx:script': 'free', 'ext:locale': 'free',
  'term:command': 'dotted', 'term:handler': 'dotted',
}

function normalizeName(block, raw, flags) {
  const kind = NAME_KIND[block.key] ?? 'kebab'
  const input = String(raw).trim()
  if (block.name?.optional && input === '') return { value: '' }
  if (!input) return { error: `${block.key} needs a name` }
  const done = value => ({ value, note: value !== input ? `name "${input}" -> "${value}" (${kind === 'table' ? 'snake_case plural table name' : kind + ' style'}; --exact keeps it as typed)` : undefined })
  if (kind === 'table') {
    if (flags.exact) return /^[a-z][a-z0-9_]*$/.test(input) ? { value: input } : { error: `"${input}" is not a valid table name (lowercase snake_case, starts with a letter)` }
    let v = /^[a-z][a-z0-9_]*$/.test(input) ? input : snake(input)
    if (!/^[a-z]/.test(v)) return { error: `"${input}" cannot be turned into a table name (it must start with a letter)` }
    if (!/s$/.test(v) && !/_log$/.test(v)) v = v.replace(/[a-z0-9]+$/, w => plural(w))
    return done(v)
  }
  if (kind === 'pascal') {
    const v = /^[A-Z][A-Za-z0-9]*$/.test(input) ? input : pascal(input)
    return v ? done(v) : { error: `"${input}" cannot be turned into a PascalCase name` }
  }
  if (kind === 'ident') {
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(input)) return { value: input }
    const w = words(input)
    const v = w.length ? w[0].toLowerCase() + w.slice(1).map(x => x[0].toUpperCase() + x.slice(1)).join('') : ''
    return /^[A-Za-z_]/.test(v) ? done(v) : { error: `"${input}" is not a valid ${block.key} name (letters, digits and _; not starting with a digit)` }
  }
  if (kind === 'dotted') {
    // kebab-case parts joined by dots: db.migrate, tag.add
    if (/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/.test(input)) return { value: input }
    if (flags.exact) return { error: `"${input}" is not a valid ${block.key} name (lowercase kebab-case parts joined by dots, for example db.migrate)` }
    const v = input.split('.').map(part => kebab(part)).filter(Boolean).join('.')
    return /^[a-z]/.test(v) ? done(v) : { error: `"${input}" cannot be turned into a command name (it must start with a letter)` }
  }
  if (kind === 'free') return /^[A-Za-z0-9][A-Za-z0-9_.{}-]*$/.test(input) ? { value: input } : { error: `"${input}" is not a valid ${block.key} identifier (letters, digits, - _ . { })` }
  if (flags.exact) return /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(input) ? { value: input } : { error: `"${input}" is not a valid name` }
  const v = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(input) ? input : kebab(input)
  return v ? done(v) : { error: `"${input}" cannot be turned into a kebab-case name` }
}

// ─── BLOCK LOOKUP ─────────────────────────────────────────────
BLOCKS.splice(BLOCKS.findIndex(b => b.key === 'routes') + 1, 0,
  { key: 'crud', group: 'Data + API', sub: 'a table and its api resource in one step (database + api)', name: { prompt: 'Resource (plural table name)', def: 'items' }, composite: ['database', 'api'] })

const ALIASES = {
  page: 'web:page', layout: 'web:layout', components: 'web:components', style: 'web:style', script: 'web:script', animation: 'web:animation',
  '404': 'web:error:404', '500': 'web:error:500', db: 'database', table: 'database', route: 'routes', ep: 'endpoint', job: 'jobs', event: 'events',
  notif: 'notifications', notification: 'notifications', cmd: 'console', command: 'console', email: 'mail', channel: 'realtime', screen: 'native:page',
  resource: 'crud', model: 'crud',
}

function resolveBlock(word, gameKind) {
  const w = String(word)
  const visible = BLOCKS.filter(b => (gameKind ? b.game === gameKind || !b.game : !b.game))
  const exact = visible.find(b => b.key === w) ?? BLOCKS.find(b => b.key === w)
  if (exact) return { block: exact }
  if (gameKind && blockByKey(`${gameKind}:${w}`)) return { block: blockByKey(`${gameKind}:${w}`) }
  if (ALIASES[w] && blockByKey(ALIASES[w])) return { block: blockByKey(ALIASES[w]) }
  const prefix = visible.filter(b => b.key.startsWith(w))
  if (prefix.length === 1) return { block: prefix[0] }
  if (prefix.length > 1) return { candidates: prefix.map(b => b.key) }
  const inner = visible.filter(b => b.key.split(':').includes(w))
  if (inner.length === 1) return { block: inner[0] }
  if (inner.length > 1) return { candidates: inner.map(b => b.key) }
  return {}
}

// ─── SHARED CHECKS ────────────────────────────────────────────
const hasTag = (source, tag) => new RegExp(`/\\* @arkzen:${escapeRe(tag)}(?![\\w:+-])`).test(source)
const interactive = () => !!process.stdin.isTTY
const ask = (ctx, q, def) => (interactive() ? ctx.prompt(q, def) : Promise.resolve(def))
const eolOf = source => (source.includes('\r\n') ? '\r\n' : '\n')
const fail = () => { process.exitCode = 1 }

function listTatemonoDirs(ctx) {
  if (!fs.existsSync(ctx.TATEMONOS_DIR)) return []
  return fs.readdirSync(ctx.TATEMONOS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(ctx.TATEMONOS_DIR, e.name, 'core.tsx')))
    .map(e => e.name).sort()
}

function latestTatemono(ctx, list) {
  return [...list].sort((a, b) => fs.statSync(path.join(ctx.TATEMONOS_DIR, b, 'core.tsx')).mtimeMs - fs.statSync(path.join(ctx.TATEMONOS_DIR, a, 'core.tsx')).mtimeMs)[0]
}

function activeBackendVariant(ctx, flags = {}) {
  if (flags.variant) return String(flags.variant)
  if (flags.backend) return ctx.backendVariant(ctx.BACKEND_ALIASES?.[flags.backend] ?? String(flags.backend))
  return ctx.backendVariant(ctx.resolveBackend(ctx.readConfig()))
}
const safeActiveVariant = ctx => { try { const v = activeBackendVariant(ctx); return BACKENDS.includes(v) ? v : null } catch { return null } }

function reportProblems(ctx, problems) { for (const p of problems) ctx.error(p); fail() }

// ─── mizumi new ───────────────────────────────────────────────
export async function cmdNew(ctx, args) {
  const { positional, flags, problems } = parseArgs(args)
  if (flags.help) { printNewHelp(); return }
  if (problems.length) return reportProblems(ctx, problems)
  const stray = ['shared', 'layout', 'parent', 'path', 'mode', 'list', 'all'].filter(k => flags[k] !== undefined && flags[k] !== false)
  if (stray.length) { ctx.error(`mizumi new does not use ${stray.map(k => '--' + k).join(', ')}. See: mizumi new --help`); return fail() }

  let [slug, tplWord, resWord, ...extra] = positional
  if (extra.length) { ctx.error(`Too many arguments (${extra.join(' ')}). Usage: mizumi new <name> [template] [resource]`); return fail() }
  if (!slug) {
    if (!interactive()) { ctx.error(`Usage: mizumi new <name> [template] [resource]   templates: ${Object.keys(TEMPLATES).join(', ')}`); return fail() }
    slug = await ctx.prompt('Tatemono name (kebab-case)', '')
  }
  const rawSlug = String(slug ?? '').trim()
  const name = SLUG_RE.test(rawSlug) ? rawSlug : kebab(rawSlug)
  if (!name || !SLUG_RE.test(name)) { ctx.error(`"${rawSlug}" is not a valid name. Use kebab-case, e.g. my-app`); return fail() }
  if (name !== rawSlug) ctx.info(`Name "${rawSlug}" -> "${name}" (tatemono names are kebab-case)`)
  const dir = path.join(ctx.TATEMONOS_DIR, name)
  if (fs.existsSync(dir)) { ctx.error(`tatemonos/${name} already exists`); return fail() }

  let template = flags.template ?? tplWord
  if (flags.template && tplWord) { ctx.error(`Template given twice (${tplWord} and --template=${flags.template})`); return fail() }
  if (template && !TEMPLATES[template]) { ctx.error(`Unknown template "${template}". Use one of: ${Object.keys(TEMPLATES).join(', ')}.${didYouMean(template, Object.keys(TEMPLATES))}`); return fail() }
  if (!template) {
    if (!interactive()) { ctx.error(`Pass a template: mizumi new ${name} <${Object.keys(TEMPLATES).join('|')}>`); return fail() }
    ctx.divider()
    template = (await ctx.picker('テンプレート Which starting point?', Object.entries(TEMPLATES).map(([key, t]) => ({ label: t.label, sub: t.sub, value: key })))).value
  }
  const tpl = TEMPLATES[template]

  if (flags.resource && resWord) { ctx.error(`Resource given twice (${resWord} and --resource=${flags.resource})`); return fail() }
  if ((flags.resource || resWord) && template !== 'crud') ctx.warn(`The resource only applies to the crud template; ignored for "${template}".`)
  let resource = flags.resource ?? resWord ?? 'items'
  if (template === 'crud' && !flags.resource && !resWord) resource = await ask(ctx, 'Resource (plural table name)', 'items')
  const res = normalizeName({ key: 'database', name: {} }, resource, flags)
  if (res.error) { ctx.error(res.error); return fail() }
  if (res.note && template === 'crud') ctx.info(`Resource ${res.note}`)
  resource = res.value

  const variant = activeBackendVariant(ctx, flags)
  if (!BACKENDS.includes(variant)) { ctx.error(`Unknown backend variant "${variant}". Use one of: ${BACKENDS.join(', ')}.${didYouMean(variant, BACKENDS)}`); return fail() }

  let text = tpl.make({ slug: name, variant, resource }).join('\n')
  if (flags.auth && !/^auth: true$/m.test(text)) text = text.replace(/^auth: false$/m, 'auth: true')
  if (flags.description) text = text.replace(/^description: .*$/m, `description: ${String(flags.description).replace(/[\r\n]+/g, ' ')}`)

  const lint = lintSource(text, { variant, slug: name })
  if (lint.errors.length && !flags.force) {
    ctx.error(`The "${template}" template would produce an invalid tatemono. This is a scaffold bug, nothing was written:`)
    lint.errors.forEach(e => ctx.error('  ' + formatFinding(e)))
    return fail()
  }
  if (flags.dry) { console.log(text); ctx.info(`Dry run: ${lint.errors.length ? lint.errors.length + ' error(s)' : 'no errors'}, ${lint.warnings.length} warning(s). Nothing written.`); return }
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'core.tsx'), text, 'utf8')
  ctx.success(`Created tatemonos/${name}/core.tsx  ${ctx.paint(ctx.c.gray, `(${template}, :${variant})`)}`)
  if (!flags.quiet) lint.warnings.forEach(w => ctx.warn(formatFinding(w)))
  ctx.info(`Next: node mizumi.js block ${name} <block> [name]   |   node mizumi.js check ${name}`)
}

// ─── mizumi block ─────────────────────────────────────────────
function printCatalog(ctx) {
  ctx.divider()
  let group = ''
  for (const b of BLOCKS) {
    if (b.group !== group) { group = b.group; console.log(`\n  ${ctx.paint(ctx.c.white + ctx.c.bold, group)}\n`) }
    console.log(`  ${ctx.paint(ctx.c.cyan, b.key.padEnd(24))} ${ctx.paint(ctx.c.gray, b.sub)}`)
  }
  console.log(`\n  ${ctx.paint(ctx.c.gray, 'Shortcuts: ' + Object.entries(ALIASES).map(([a, k]) => `${a}=${k}`).join('  '))}`)
  ctx.divider()
}

function printBlockHelp() {
  console.log(`
  mizumi block [tatemono] <block> [name ...] [flags]

    tatemono        optional; omit it to use the most recently edited one
    block           a key from \`mizumi block --list\`, a shortcut (page, db, ep...) or a unique prefix
    name ...        one or more identifiers; several names add several blocks in one go

  Flags
    --variant=<v>   backend (php ts py java cs go rs) or native target (expo rn); also --ts, --php, ...
    --shared        YAML-only form for jobs / console / mail / notifications
    --layout=<decl> page layout: +auth, +guest, +auth:shell, shell, none
    --parent=<name> parent layout for web:layout / native:layout / lynx:layout
    --path=<file>   output path for file blocks
    --mode=scene    unity:project mode (Unreal is always scene mode)
    --mode=<m>      term:project mode: cli (default), tui or hybrid
    --exact         keep the name as typed (no snake_case / kebab-case conversion)
    --force         write even if the result has new errors
    --dry           print the block, write nothing
  Examples
    mizumi block my-app crud notes
    mizumi block my-app page about contact pricing
    mizumi block my-app ep stats --ts
`)
}
function printNewHelp() {
  console.log(`
  mizumi new <name> [template] [resource] [flags]

    templates: ${Object.keys(TEMPLATES).join(', ')}
    --template=<id>      same as the second positional
    --resource=<table>   for the crud template (plural table name)
    --auth               set auth: true in @arkzen:meta
    --description=<text> meta description
    --variant=<v> | --ts backend variant for code bodies (default: active backend)
    --dry                print it, write nothing
  Examples
    mizumi new notes-app crud notes --auth
    mizumi new landing web
`)
}

function candidatesFor(block, model, variant) {
  if (block.key === 'endpoint') return { all: model.apiEndpointNames(), done: model.implemented('endpoint', variant), what: 'api endpoint', missing: model.apis.length ? null : 'There is no @arkzen:api block yet. Add one first: mizumi block <tatemono> api <name>' }
  if (block.key === 'handler') return { all: model.routeHandlerNames(), done: model.implemented('handler', variant), what: 'routes handler', missing: model.routes.length ? null : 'There is no @arkzen:routes block yet. Add one first: mizumi block <tatemono> routes' }
  if (block.key === 'listener') return { all: model.listenerNames(), done: model.implemented('listener', variant), what: 'event listener', missing: model.events.length ? null : 'There is no @arkzen:events block yet. Add one first: mizumi block <tatemono> events <name>' }
  if (block.key === 'policy') return { all: ['update', 'delete'], done: model.implemented('policy', variant), what: 'policy method', missing: model.apis.some(a => a.policy) ? null : 'No @arkzen:api has policy: true, so a policy would not be applied. Set policy: true on the api block first.' }
  return null
}

function crossCheck(block, name, variant, model, force) {
  const c = candidatesFor(block, model, variant)
  if (!c || force) return null
  if (c.missing) return c.missing
  if (!c.all.includes(name)) return `No ${c.what} named "${name}". This file has: ${c.all.join(', ') || '(none)'}.${didYouMean(name, c.all)} Declare it first, or pass --force.`
  return null
}

function allowedFlagsFor(block) {
  const ok = new Set(['dry', 'force', 'exact', 'quiet', 'help'])
  if (block.variants) { ok.add('variant'); ok.add('backend'); if (block.variants.optional) ok.add('shared') }
  if (['web:page', 'native:page', 'lynx:page'].includes(block.key)) ok.add('layout')
  if (['web:layout', 'native:layout', 'lynx:layout'].includes(block.key)) ok.add('parent')
  if (block.key === 'file') ok.add('path')
  if (block.key === 'unity:project' || block.key === 'term:project') ok.add('mode')
  return ok
}

function chooseVariant(ctx, block, flags) {
  const { list, optional, labels, backend } = block.variants
  if (flags.shared && flags.variant) return { error: 'Use either --shared or a variant, not both.' }
  if (flags.shared) return optional ? { value: null } : { error: `${block.key} has no shared form. Pick a variant: ${list.join(', ')}.` }
  const given = flags.variant ?? (backend && flags.backend ? activeBackendVariant(ctx, flags) : null)
  if (given) return list.includes(given) ? { value: given } : { error: `${block.key} has no :${given} form. Allowed: ${list.join(', ')}.${didYouMean(given, list)}` }
  return { ask: true }
}

export async function cmdBlock(ctx, args) {
  const { positional, flags, problems } = parseArgs(args)
  if (flags.help) { printBlockHelp(); return }
  if (problems.length) return reportProblems(ctx, problems)
  if (flags.list) { printCatalog(ctx); return }

  const tatemonos = listTatemonoDirs(ctx)
  if (!tatemonos.length) { ctx.warn('No tatemonos yet. Create one: node mizumi.js new <name> <template>'); return }
  const rest = [...positional]

  // 1. which tatemono (omitted = most recently edited)
  let slug = null, usedDefault = false
  if (rest[0] && tatemonos.includes(rest[0])) slug = rest.shift()
  else if (rest.length) { slug = latestTatemono(ctx, tatemonos); usedDefault = true }
  else {
    if (!interactive()) { ctx.error('Usage: mizumi block [tatemono] <block> [name ...]   (mizumi block --help, mizumi block --list)'); return fail() }
    ctx.divider()
    slug = (await ctx.picker('どのタテモノ？ Add a block to which tatemono?', tatemonos.map(t => ({ label: t, value: t })))).value
  }
  const file = path.join(ctx.TATEMONOS_DIR, slug, 'core.tsx')
  const source = fs.readFileSync(file, 'utf8')
  const gameKind = /@arkzen:godot:project/.test(source) ? 'godot' : /@arkzen:unity:project/.test(source) ? 'unity' : /@arkzen:unreal:project/.test(source) ? 'unreal' : null

  // 2. which block (key, shortcut, unique prefix, or the picker)
  let block = null
  if (rest[0]) {
    const r = resolveBlock(rest[0], gameKind)
    if (r.candidates) { ctx.error(`"${rest[0]}" matches several blocks: ${r.candidates.join(', ')}. Be more specific.`); return fail() }
    if (!r.block) {
      const t = closest(rest[0], tatemonos), k = closest(rest[0], BLOCKS.map(b => b.key))
      ctx.error(`"${rest[0]}" is neither a tatemono nor a block.${t ? ` Tatemono "${t}"?` : ''}${k ? ` Block "${k}"?` : ''} (mizumi block --list)`)
      return fail()
    }
    block = r.block; rest.shift()
  } else {
    if (!interactive()) { ctx.error('Pass a block key (mizumi block --list)'); return fail() }
    const visible = BLOCKS.filter(b => (gameKind ? b.game === gameKind : !b.game))
    const groups = [...new Set(visible.map(b => b.group))]
    ctx.divider()
    const group = (await ctx.picker('どのDSL？ Which kind of block?', groups.map(g => ({ label: g, value: g })))).value
    ctx.divider()
    block = blockByKey((await ctx.picker(`${group}: which block?`, visible.filter(b => b.group === group).map(b => ({ label: b.key, sub: b.sub, value: b.key })))).value)
  }
  if (usedDefault) ctx.info(`Using tatemono "${slug}" (most recently edited). Put a tatemono name first to choose another.`)
  if (block.game && block.game !== gameKind) { ctx.error(`${block.key} belongs in a ${block.game} tatemono (one that has @arkzen:${block.game}:project)`); return fail() }
  if (!block.game && gameKind) { ctx.error(`"${slug}" is a ${gameKind} tatemono. Use the ${gameKind}:* blocks (mizumi block --list)`); return fail() }
  if (block.needs) { const problem = block.needs(source); if (problem) { ctx.error(problem); return fail() } }

  // 3. flags that do not belong to this block are errors, not silent no-ops
  const allowed = allowedFlagsFor(block)
  const bad = Object.keys(flags).filter(k => flags[k] !== false && !allowed.has(k) && k !== 'list')
  if (bad.length) { ctx.error(`${block.key} does not use ${bad.map(k => '--' + k).join(', ')}.${allowed.size > 5 ? ` It accepts: ${[...allowed].filter(k => !['dry', 'force', 'exact', 'quiet', 'help'].includes(k)).map(k => '--' + k).join(', ')}.` : ''}`); return fail() }

  if (block.key === 'term:project' && flags.mode !== undefined && !TERM_MODES.includes(flags.mode)) { ctx.error(`--mode must be one of: ${TERM_MODES.join(', ')} (got "${flags.mode}")`); return fail() }

  // 4. variant (backend or native target)
  let variant = null
  if (block.variants) {
    const v = chooseVariant(ctx, block, flags)
    if (v.error) { ctx.error(v.error); return fail() }
    if (v.ask) {
      const { list, optional, labels, backend } = block.variants
      const active = backend ? activeBackendVariant(ctx) : list[0]
      if (interactive()) {
        const options = list.map(x => ({ label: `${x === active ? '→ ' : '  '}:${x}`, sub: labels[x], value: x }))
        if (optional) options.unshift({ label: '  shared', sub: 'YAML only, works on every backend', value: null })
        ctx.divider()
        variant = (await ctx.picker(backend ? 'バックエンド？ Which backend variant?' : (block.variants.question ?? 'ターゲット？ Which native target?'), options)).value
      } else variant = list.includes(active) ? active : (optional ? null : list[0])
    } else variant = v.value
  }

  // 5. names: given, suggested from the file, or asked
  const model0 = scanSource(source)
  let names = rest
  if (!block.name && !block.composite) {
    if (names.length) {
      const hint = blockByKey(`${block.key}:name`)
      ctx.error(`${block.key} takes no name (got: ${names.join(' ')}).${hint ? ` Did you mean ${hint.key}?` : ''}`)
      return fail()
    }
    names = [null]
  } else if (!names.length) {
    const cands = candidatesFor(block, model0, variant)
    if (cands) {
      if (cands.missing) { ctx.error(cands.missing); return fail() }
      const open = cands.all.filter(n => !cands.done.has(n))
      if (!open.length) { ctx.error(`Every ${cands.what} already has a body${variant ? ` for :${variant}` : ''}. Nothing to add.`); return fail() }
      if (open.length === 1) { names = [open[0]]; ctx.info(`Only "${open[0]}" is missing a body, using it.`) }
      else if (interactive()) { ctx.divider(); names = [(await ctx.picker(`Which ${cands.what}?`, open.map(n => ({ label: n, value: n })))).value] }
      else { ctx.error(`Pass a name. ${cands.what}s without a body: ${open.join(', ')}`); return fail() }
    } else if (block.name?.choices && interactive()) {
      ctx.divider(); names = [(await ctx.picker(block.name.prompt, block.name.choices.map(v => ({ label: v, value: v })))).value]
    } else names = [await ask(ctx, block.name.prompt, block.name.def)]
  }

  // 6. file blocks need a path
  if (block.extra && !flags[block.extra.key]) flags.path = await ask(ctx, block.extra.prompt, block.extra.def)
  if (block.key === 'file') {
    const p = String(flags.path ?? '').replace(/\\/g, '/')
    if (!p || p.split('/').includes('..') || /^[A-Za-z]:/.test(p)) { ctx.error(`--path "${flags.path ?? ''}" is not allowed: use a relative path without .. or a drive letter`); return fail() }
    flags.path = p
  }

  // 7. build, cross-check and apply each block to an in-memory copy
  const eol = eolOf(source)
  let candidate = source
  const written = [], notes = [], snippets = []
  const items = block.composite ? names.flatMap(n => block.composite.map(k => [blockByKey(k), n])) : names.map(n => [block, n])
  for (const [b, rawName] of items) {
    let name = null
    if (b.name) {
      const r = normalizeName(b, rawName, flags)
      if (r.error) { ctx.error(r.error); return fail() }
      name = r.value
      if (r.note && !notes.includes(r.note)) notes.push(r.note)
      if (b.name.choices && !b.name.choices.includes(name)) { ctx.error(`"${name}" is not a valid ${b.key} choice. Use: ${b.name.choices.join(', ')}.${didYouMean(name, b.name.choices)}`); return fail() }
    }
    const model = scanSource(candidate)
    const problem = crossCheck(b, name, variant, model, flags.force)
    if (problem) { ctx.error(problem); return fail() }

    const f = { ...flags }
    if (b.key === 'web:page' || b.key === 'native:page' || b.key === 'lynx:page') {
      if (f.layout === 'none') delete f.layout
      else if (!f.layout && b.key === 'web:page' && /^true$/i.test(model.meta?.auth ?? '')) {
        const guard = /^(login|register|signup|sign-in|sign-up|forgot-password|reset-password)$/.test(name) ? '+guest' : /^(dashboard|account|profile|settings|admin)$/.test(name) ? '+auth' : null
        if (guard) { f.layout = guard; notes.push(`page "${name}": added layout ${guard} because auth is on (pass --layout=none to skip)`) }
      }
    }
    const tag = b.tag(name, variant)
    if (hasTag(candidate, tag)) { ctx.error(`@arkzen:${tag} already exists in tatemonos/${slug}/core.tsx`); return fail() }
    const snippet = b.build({ name, slug, variant, flags: f })
    candidate = candidate.replace(/\s*$/, '') + eol + eol + snippet.replace(/\n/g, eol)
    written.push(tag); snippets.push(snippet)
  }

  // 8. lint: never leave a tatemono worse than it was
  const lv = safeActiveVariant(ctx)
  const before = lintSource(source, { variant: lv, slug }), after = lintSource(candidate, { variant: lv, slug })
  const known = new Set(before.errors.map(e => e.msg))
  const fresh = after.errors.filter(e => !known.has(e.msg))
  const freshWarn = after.warnings.filter(w => !before.warnings.some(x => x.msg === w.msg))
  notes.forEach(n => ctx.info(n))
  if (fresh.length && !flags.force) {
    ctx.error(`Not written: this would add ${fresh.length} error(s) to tatemonos/${slug}/core.tsx`)
    fresh.forEach(e => ctx.error('  ' + formatFinding(e)))
    ctx.info('Fix the cause, or pass --force to write it anyway.')
    return fail()
  }
  if (flags.dry) { console.log(snippets.join('\n')); ctx.info(`Dry run: ${fresh.length ? fresh.length + ' new error(s)' : 'no new errors'}. Nothing written.`); return }

  fs.writeFileSync(file, candidate, 'utf8')
  written.forEach(t => ctx.success(`Added @arkzen:${t}  ${ctx.paint(ctx.c.gray, `→ tatemonos/${slug}/core.tsx`)}`))
  if (fresh.length) fresh.forEach(e => ctx.warn('Forced: ' + formatFinding(e)))
  if (!flags.quiet) freshWarn.forEach(w => ctx.warn(formatFinding(w)))
  if (block.key === 'meta:web') ctx.info(`Put your own favicon at tatemonos/${slug}/assets/images/favicon.svg (not an emoji, not AI-made).`)
  if (block.key === 'crud') ctx.info(`Next: mizumi block ${slug} endpoint <name> for custom bodies, mizumi block ${slug} page ${names[0]} for the UI.`)
}

// ─── mizumi check ─────────────────────────────────────────────
export async function cmdCheck(ctx, args) {
  const { positional, flags, problems } = parseArgs(args)
  if (flags.help) { console.log('\n  mizumi check [tatemono ...] [--all] [--variant=<v>] [--quiet]\n  Lints tatemonos for tag shapes, names, layouts, cross-references and backend variants. Exit code 1 if any has errors.\n'); return }
  if (problems.length) return reportProblems(ctx, problems)
  const all = listTatemonoDirs(ctx)
  if (!all.length) { ctx.warn('No tatemonos found.'); return }
  const targets = positional.length && !flags.all ? positional : all
  const unknown = targets.filter(t => !all.includes(t))
  if (unknown.length) { unknown.forEach(t => ctx.error(`Unknown tatemono "${t}".${didYouMean(t, all)}`)); return fail() }
  const variant = flags.variant ?? safeActiveVariant(ctx)
  if (variant && !BACKENDS.includes(variant)) { ctx.error(`Unknown variant "${variant}". Use one of: ${BACKENDS.join(', ')}.`); return fail() }
  let bad = 0, warned = 0
  for (const slug of targets) {
    const file = path.join(ctx.TATEMONOS_DIR, slug, 'core.tsx')
    const { errors, warnings, model } = lintSource(fs.readFileSync(file, 'utf8'), { variant, slug })
    for (const o of model.openers) {
      const dir = path.join(ctx.TATEMONOS_DIR, slug)
      if (o.tag === 'meta:web') { const fav = yamlTop(o.yaml).favicon?.match(/^\/tatemonos\/[^/]+\/assets\/(.+)$/); if (fav && !fs.existsSync(path.join(dir, 'assets', fav[1]))) warnings.push({ msg: `favicon assets/${fav[1]} does not exist yet (meta:web points at it)`, line: o.line }) }
      if (o.tag === 'godot:assets' || o.tag === 'unity:assets') for (const s of o.yaml.matchAll(/source:\s*(\S+)/g)) if (!/^[A-Za-z]+:|^\//.test(s[1]) && !fs.existsSync(path.join(dir, s[1]))) warnings.push({ msg: `asset ${s[1]} does not exist under tatemonos/${slug}/ (the generator fails without it unless optional: true)`, line: o.line })
    }
    if (errors.length) bad++
    if (warnings.length) warned++
    const mark = errors.length ? ctx.paint(ctx.c.red ?? '', '✗') : '✓'
    if (errors.length || (warnings.length && !flags.quiet) || targets.length === 1)
      console.log(`  ${mark} ${slug}  ${ctx.paint(ctx.c.gray, `${errors.length} error(s), ${warnings.length} warning(s)`)}`)
    errors.forEach(e => ctx.error('    ' + formatFinding(e)))
    if (!flags.quiet) warnings.forEach(w => ctx.warn('    ' + formatFinding(w)))
  }
  const ok = targets.length - bad
  ;(bad ? ctx.warn : ctx.success)(`${ok}/${targets.length} tatemono(s) clean of errors${warned ? `, ${warned} with warnings` : ''}${variant ? ` (backend :${variant})` : ''}`)
  if (bad) fail()
}
