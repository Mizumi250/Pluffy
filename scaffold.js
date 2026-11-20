// ============================================================
//  scaffold.js: hand-write support for tatemonos
//    node mizumi.js new [name] [--template=web|crud|routes|native|lynx|files|godot|unity-scene|unity-runner]
//    node mizumi.js block [tatemono] [block] [name] [--variant=...] [--target=expo|rn] [--dry]
//    node mizumi.js block --list
//  Every template follows the block shapes in PLUFF_GUIDELINES (Section 3D) and
//  the real fixtures in tatemonos/. It covers every marker in PLUFF_DSL_CATALOG.md.
//  mizumi.js passes in its own picker/prompt/log helpers via `ctx`.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'

// ─── SMALL HELPERS ────────────────────────────────────────────
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const pascal = s => String(s).split(/[^a-zA-Z0-9]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('')
const camel = s => { const p = pascal(s); return p ? p[0].toLowerCase() + p.slice(1) : p }
const snake = s => String(s).replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase()
const titleCase = s => String(s).split(/[^a-zA-Z0-9]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
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
//  A: YAML only, bare `*/` closes it, no :end
//  B: YAML in the comment, `*/`, optional body, :end
//  C: code block, `*/` on the opening line, :end
//  D: body-separator block, next line is a bare `*/`, body, :end
const shapeA = (tag, yaml) => `/* @arkzen:${tag}\n${yaml}\n*/\n`
const shapeB = (tag, yaml, body = '') => `/* @arkzen:${tag}\n${yaml}\n*/\n${body ? body + '\n' : ''}/* @arkzen:${tag}:end */\n`
const shapeC = (tag, body, afterOpen = '') => `/* @arkzen:${tag} */\n${afterOpen}\n${body}\n\n/* @arkzen:${tag}:end */\n`
const shapeD = (tag, body) => `/* @arkzen:${tag}\n*/\n${body}\n/* @arkzen:${tag}:end */\n`

const VARIANTS = ['php', 'ts', 'py', 'java', 'cs', 'go', 'rs']
const VARIANT_LABEL = { php: 'Laravel (PHP)', ts: 'Express (TypeScript)', py: 'FastAPI (Python)', java: 'Spring Boot (Java)', cs: 'ASP.NET Core (C#)', go: 'Go (Chi)', rs: 'Rust (Axum)' }
const TARGETS = ['expo', 'rn']
const TARGET_LABEL = { expo: 'Expo (Expo Router)', rn: 'Bare React Native' }

// ─── BODY STUBS (from the guideline examples and fixtures, per backend) ──
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
  php: `return true;`, ts: `return true`, py: `return True`, java: `return true;`,
  cs: `return true;`, go: `return true`, rs: `// Allow the action`,
}
const MIDDLEWARE = {
  php:  `return $next($request);`,
  ts:   `return next()`,
  py:   `return await next()`,
  java: `return next.run();`,
  cs:   `return null;`,
  go:   `return next()`,
  rs:   `// Pass the request through`,
}
const listenerBody = name => ({
  php:  `\\Log::info('${name} received');`,
  ts:   `console.log('${name} received', event.data)`,
  py:   `print('${name} received', event.data)`,
  java: `System.out.println("${name} received");`,
  cs:   `Console.WriteLine("${name} received");`,
  go:   `Log.Info("${name} received")`,
  rs:   `response.json(StatusCode::OK, json!({ "message": "${name} received" }))`,
})
const jobBody = name => ({
  php:  `public function handle(): void\n{\n    //\n}`,
  ts:   `Log.info('[job] ${name}', this.data)`,
  py:   `pass`,
  java: `// job statements go here`,
  cs:   `// job statements go here`,
  go:   `return nil`,
  rs:   `response.json(StatusCode::OK, json!({ "message": "Job completed" }))`,
})
const consoleBody = sig => ({
  php:  `public function handle(): int\n{\n    $this->info('${sig} ran');\n    return Command::SUCCESS;\n}`,
  ts:   `this.info('${sig} ran')\nreturn Command.SUCCESS`,
  py:   `self.info('${sig} ran')\nreturn Command.SUCCESS`,
  java: `this.info("${sig} ran");\nreturn Command.SUCCESS;`,
  cs:   `return 0;`,
  go:   `Log.Info("${sig} ran")\nreturn nil`,
  rs:   `response.json(StatusCode::OK, json!({ "message": "${sig} ran" }))`,
})
// Mail placeholders differ per backend (Section 1F)
const mailPlaceholder = {
  php: f => `{{ $${f} }}`, ts: f => `{{ ${f} }}`, py: f => `{{ ${f} }}`, java: f => `{{ ${f} }}`,
  cs: f => `{{ $${f} }}`, go: f => `{{ index . "${f}" }}`, rs: f => `{{ $${f} }}`,
}
const mailBody = v => `<p>Welcome, ${mailPlaceholder[v]('username')}!</p>\n<p>Thanks for joining ${mailPlaceholder[v]('app_name')}.</p>`
const notifyBody = (subject, message) => ({
  php:  `return (new \\Illuminate\\Notifications\\Messages\\MailMessage)\n    ->subject('${subject}')\n    ->line('${message}');`,
  ts:   `return new MailMessage().subject('${subject}').line('${message}')`,
  py:   `return MailMessage().subject('${subject}').line('${message}')`,
  java: `return new MailMessage()\n    .subject("${subject}")\n    .line("${message}");`,
  cs:   `return new Dictionary<string, object?>\n{\n    ["subject"] = "${subject}",\n    ["lines"] = new[] { "${message}" }\n};`,
  go:   `return NotificationMessage{\n    Subject: "${subject}",\n    Lines: []string{"${message}"},\n}`,
  rs:   ``,
})

// ─── BLOCK CATALOG ────────────────────────────────────────────
// name:     what the block identifier means (null = no identifier; optional:true = blank means the global block)
// variants: array of backend tokens, or { optional: [...] } for shared-or-variant blocks
// targets:  native target tokens (expo | rn) for blocks that are stack-split
// once:     only one allowed per tatemono
// defaultShared: non-interactive default is the shared YAML form, not a backend body
// requires: 'godot' | 'unity' | 'auth' (a check against the existing file)
const BLOCKS = [
  // ── Config + meta ──
  { key: 'meta', group: 'Config + meta', label: 'meta', sub: 'tatemono identity (name, version, auth)', name: null, once: true,
    tag: () => 'meta',
    build: ({ slug, flags }) => metaBlock(slug, flags.description ? String(flags.description) : 'Describe this tatemono', flags.auth === true || flags.auth === 'true') },

  { key: 'meta:web', group: 'Config + meta', label: 'meta:web', sub: 'title, SEO, social, favicon, PWA', name: null, once: true,
    tag: () => 'meta:web',
    build: ({ slug }) => shapeA('meta:web',
`title: ${titleCase(slug)}
label: ${titleCase(slug)}
description: Describe this app for search engines.
og:
  title: ${titleCase(slug)}
  description: Share text
  type: website
pwa:
  name: ${pascal(slug)}
  short_name: ${titleCase(slug).slice(0, 12)}
  description: Describe this app.
  theme_color: "#111111"
  background_color: "#f5f5f5"
  display: standalone
  orientation: any
  offline: true`) },

  { key: 'meta:native', group: 'Config + meta', label: 'meta:native', sub: 'native app labels + Expo metadata', name: null, once: true,
    tag: () => 'meta:native',
    build: ({ slug }) => metaNativeBlock(slug) },

  { key: 'web:config', group: 'Config + meta', label: 'web:config', sub: 'toast, modal, table, layout defaults', name: null, once: true,
    tag: () => 'web:config',
    build: () => shapeA('web:config',
`toast:
  position: top-right
  duration: 3000
modal:
  borderRadius: 16px
  backdrop: "rgba(0,0,0,.5)"
  animation: fade
table:
  striped: true
  hoverable: true
  border: "1px solid #eee"
dialog: { size: md, animation: scale }`) },

  { key: 'native:config', group: 'Config + meta', label: 'native:config', sub: 'native theme tokens (constants object C)', name: null, once: true,
    tag: () => 'native:config',
    build: () => shapeA('native:config',
`theme:
  primary: "#111111"
  background: "#f5f5f5"
  surface: "#ffffff"
  text: "#111111"
  muted: "#6b6b6b"`) },

  { key: 'desktop:config', group: 'Config + meta', label: 'desktop:config', sub: 'Electron / Tauri window settings', name: null, once: true,
    tag: () => 'desktop:config',
    build: ({ slug }) => shapeA('desktop:config',
`window:
  width: 1280
  height: 800
  min_width: 800
  min_height: 600
  resizable: true
  fullscreenable: true
  title: ${titleCase(slug)}`) },

  { key: 'oauth', group: 'Config + meta', label: 'oauth', sub: 'social sign-in (needs auth: true in meta)', name: null, once: true, requires: 'auth',
    tag: () => 'oauth',
    build: ({ slug }) => shapeA('oauth',
`providers: [google, github]
redirect: /${slug}
error_redirect: /${slug}
link_verified_email: true`) },

  // ── Data + API ──
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

  { key: 'routes', group: 'Data + API', label: 'routes', sub: 'custom routes with handlers', name: null, once: true,
    tag: () => 'routes',
    build: ({ slug }) => shapeA('routes',
`controller: CustomController
middleware: []
routes:
  - method: GET
    route: /api/${slug}/hello
    handler: hello`) },

  // ── Backend code (variant) ──
  { key: 'endpoint', group: 'Backend code', label: 'endpoint:<variant>', sub: 'body for an api method', name: { prompt: 'Endpoint name (must exist in the api block)', def: 'index' }, variants: VARIANTS,
    tag: (n, v) => `endpoint:${v}:${n}`,
    build: ({ name, variant }) => shapeD(`endpoint:${variant}:${name}`, PING[variant]) },

  { key: 'handler', group: 'Backend code', label: 'handler:<variant>', sub: 'body for a routes entry', name: { prompt: 'Handler name (matches routes handler:)', def: 'hello' }, variants: VARIANTS,
    tag: (n, v) => `handler:${v}:${n}`,
    build: ({ name, variant }) => shapeD(`handler:${variant}:${name}`, PING[variant]) },

  { key: 'policy', group: 'Backend code', label: 'policy:<variant>', sub: 'update or delete (api needs policy: true)', name: { prompt: 'Policy method (update or delete)', def: 'update', choices: ['update', 'delete'] }, variants: VARIANTS,
    tag: (n, v) => `policy:${v}:${n}`,
    build: ({ name, variant }) => shapeD(`policy:${variant}:${name}`, POLICY[variant]) },

  { key: 'middleware', group: 'Backend code', label: 'middleware:<variant>', sub: 'reusable request middleware', name: { prompt: 'Middleware name', def: 'requireJson' }, variants: VARIANTS,
    tag: (n, v) => `middleware:${v}:${n}`,
    build: ({ name, variant }) => shapeD(`middleware:${variant}:${name}`, MIDDLEWARE[variant]) },

  { key: 'listener', group: 'Backend code', label: 'listener:<variant>', sub: 'event listener body (PascalCase name)', name: { prompt: 'Listener class name', def: 'SendWelcome', pascal: true }, variants: VARIANTS,
    tag: (n, v) => `listener:${v}:${n}`,
    build: ({ name, variant }) => shapeD(`listener:${variant}:${name}`, listenerBody(name)[variant]) },

  { key: 'events', group: 'Backend code', label: 'events', sub: 'event and its listeners', name: { prompt: 'Event identifier', def: 'user-signed-up' },
    tag: n => `events:${n}`,
    build: ({ name }) => shapeB(`events:${name}`, `listeners: [${pascal(name)}Listener]`) },

  { key: 'realtime', group: 'Backend code', label: 'realtime', sub: 'channel or broadcast event', name: { prompt: 'Channel or event identifier', def: 'updates' },
    tag: n => `realtime:${n}`,
    build: ({ name }) => shapeB(`realtime:${name}`, `type: public`) },

  { key: 'jobs', group: 'Backend code', label: 'jobs', sub: 'background job (shared YAML, or a body per backend)', name: { prompt: 'Job identifier', def: 'process-data' }, variants: { optional: VARIANTS },
    tag: (n, v) => (v ? `jobs:${v}:${n}` : `jobs:${n}`),
    build: ({ name, variant }) => shapeB(variant ? `jobs:${variant}:${name}` : `jobs:${name}`, `queue: default\ntries: 3\ntimeout: 60`, variant ? jobBody(name)[variant] : '') },

  { key: 'console', group: 'Backend code', label: 'console', sub: 'CLI command (shared YAML, or a body per backend)', name: { prompt: 'Command identifier', def: 'cleanup' }, variants: { optional: VARIANTS },
    tag: (n, v) => (v ? `console:${v}:${n}` : `console:${n}`),
    build: ({ name, slug, variant }) => shapeB(variant ? `console:${variant}:${name}` : `console:${name}`,
      `signature: ${slug}:${name}\ndescription: Describe this command`, variant ? consoleBody(`${slug}:${name}`)[variant] : '') },

  { key: 'mail', group: 'Backend code', defaultShared: true, label: 'mail', sub: 'email (shared YAML, or an HTML body per backend)', name: { prompt: 'Mail identifier (keep it short)', def: 'welcome' }, variants: { optional: VARIANTS },
    tag: (n, v) => (v ? `mail:${v}:${n}` : `mail:${n}`),
    build: ({ name, variant }) => shapeB(variant ? `mail:${variant}:${name}` : `mail:${name}`,
      `subject: "Welcome"\ndata:\n  username: string\n  app_name: string`, variant ? mailBody(variant) : '') },

  { key: 'notifications', group: 'Backend code', defaultShared: true, label: 'notifications', sub: 'notification (shared YAML, or a toMail body per backend)', name: { prompt: 'Notification identifier', def: 'ping' }, variants: { optional: VARIANTS },
    tag: (n, v) => (v ? `notifications:${v}:${n}` : `notifications:${n}`),
    build: ({ name, variant }) => shapeB(variant ? `notifications:${variant}:${name}` : `notifications:${name}`,
      `channels: [database]\nmessage: "Notification message"\nsubject: "${pascal(name)}"`,
      variant ? notifyBody(pascal(name), 'Notification message')[variant] : '') },

  { key: 'module:rs', group: 'Backend code', label: 'module:rs', sub: 'Rust helper module (Rust backend only, one per file)', name: null, once: true,
    tag: () => 'module:rs',
    build: () => shapeD('module:rs', `fn clamp_min(value: i64) -> i64 { value.max(1) }`) },

  // ── Web UI ──
  { key: 'web:page', group: 'Web UI', label: 'web:page', sub: 'a routed web page (--layout=+auth:panel)', name: { prompt: 'Page name', def: 'index' },
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

  { key: 'web:style', group: 'Web UI', label: 'web:style', sub: 'global CSS, or CSS Modules (name = component)', name: { prompt: 'Component name (blank = global stylesheet)', def: '', optional: true },
    tag: n => (n ? `web:style:${n}` : 'web:style'),
    build: ({ name }) => name
      ? shapeC(`web:style:${name}`, `.card { border-radius: 12px; }`)
      : shapeC('web:style', `.my-btn { transition: all .3s ease; }\n@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`) },

  { key: 'web:animation', group: 'Web UI', label: 'web:animation', sub: 'GSAP setup + pageVariants', name: null, once: true,
    tag: () => 'web:animation',
    build: ({ slug }) => shapeC('web:animation',
`import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

const ${camel(slug)}Animations = (pageRef: React.RefObject<HTMLDivElement>) => {
  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {
    gsap.fromTo('.header-section', { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out' })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: .35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: .2 } },
}`, '') },

  { key: 'web:script', group: 'Web UI', label: 'web:script', sub: 'TypeScript helpers (name blank = global)', name: { prompt: 'Script name (blank = global helpers)', def: '', optional: true },
    tag: n => (n ? `web:script:${n}` : 'web:script'),
    build: ({ name }) => name
      ? shapeC(`web:script:${name}`, `export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)`)
      : shapeC('web:script', `export const Colors = { primary: '#111111' }`) },

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

  // ── Native (Expo / bare RN) ──
  { key: 'native:page', group: 'Native (Expo / RN)', label: 'native:page', sub: 'an Expo / bare RN screen (--layout=app)', name: { prompt: 'Screen name', def: 'index' },
    tag: n => `native:page:${n}`,
    build: ({ name, flags }) => shapeC(`native:page:${name}`,
`const ${pascal(name)}Screen = () => {
  return (
    <View className="flex-1 bg-neutral-50 px-6 pt-14">
      <Text className="text-4xl font-bold">${pascal(name)}</Text>
    </View>
  )
}`, flags.layout ? `/* @arkzen:native:page:layout:${flags.layout} */\n` : '') },

  { key: 'native:layout', group: 'Native (Expo / RN)', label: 'native:layout', sub: 'reusable screen wrapper (--parent=name)', name: { prompt: 'Layout name', def: 'app' },
    tag: n => `native:layout:${n}`,
    build: ({ name, flags }) => {
      const body =
`/* @arkzen:import:expo */
import React from 'react'
import { View } from 'react-native'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React from 'react'
import { View } from 'react-native'
/* @arkzen:import:rn:end */

export const ${pascal(name)}Layout: React.FC<{ children: React.ReactNode; tatSlug?: string }> = ({ children }) => {
  return <View style={{ flex: 1 }}>{children}</View>
}`
      return flags.parent
        ? shapeB(`native:layout:${name}`, `parent: ${flags.parent}`, `\n${body}\n`)
        : shapeC(`native:layout:${name}`, `\n${body}`)
    } },

  { key: 'native:components', group: 'Native (Expo / RN)', label: 'native:components', sub: 'shared Expo / RN components, hooks, constants', name: { prompt: 'Components identifier', def: 'shared' },
    tag: n => `native:components:${n}`,
    build: ({ name }) => shapeC(`native:components:${name}`,
`/* @arkzen:import:expo */
import React from 'react'
import { View, Text } from 'react-native'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React from 'react'
import { View, Text } from 'react-native'
/* @arkzen:import:rn:end */

export const Badge = ({ label }: { label: string }) => (
  <View className="px-2 py-1 border border-black self-start">
    <Text className="text-xs font-medium text-black">{label}</Text>
  </View>
)`, '') },

  { key: 'native:style', group: 'Native (Expo / RN)', label: 'native:style', sub: 'global CSS-like styles, or named (name blank = global)', name: { prompt: 'Style name (blank = global styles)', def: '', optional: true },
    tag: n => (n ? `native:style:${n}` : 'native:style'),
    build: ({ name }) => name
      ? shapeC(`native:style:${name}`, `.${name}-wrap {\n  flex: 1;\n  background-color: #ffffff;\n  padding-horizontal: 24px;\n}`)
      : shapeC('native:style', `:root {\n  --color-primary: #111111;\n  --radius-default: 0.75rem;\n}\n\n.arkzen-btn {\n  background-color: var(--color-primary);\n  border-radius: var(--radius-default);\n  padding-horizontal: 24px;\n  padding-vertical: 16px;\n}`) },

  { key: 'native:error:404', group: 'Native (Expo / RN)', label: 'native:error:404', sub: 'not-found screen (writes the Expo and bare RN blocks)', name: null, once: true,
    tag: () => 'native:error:404',
    build: () => nativeError('404') },

  { key: 'native:error:500', group: 'Native (Expo / RN)', label: 'native:error:500', sub: 'error screen (writes the Expo and bare RN blocks)', name: null, once: true,
    tag: () => 'native:error:500',
    build: () => nativeError('500') },

  { key: 'native:animation', group: 'Native (Expo / RN)', label: 'native:animation:<target>', sub: 'Reanimated hooks for one target (expo | rn)', name: null, targets: TARGETS,
    tag: (n, v) => `native:animation:${v}`,
    build: ({ variant }) => shapeC(`native:animation:${variant}`,
`import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

export function useFadeIn(durationMs = 600) {
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return { style, start: () => { opacity.value = withTiming(1, { duration: durationMs }) } }
}`) },

  { key: 'native:script', group: 'Native (Expo / RN)', label: 'native:script:<target>', sub: 'TypeScript helpers for one target (name blank = global)', name: { prompt: 'Script name (blank = global helpers)', def: '', optional: true }, targets: TARGETS,
    tag: (n, v) => (n ? `native:script:${v}:${n}` : `native:script:${v}`),
    build: ({ name, variant }) => name
      ? shapeC(`native:script:${variant}:${name}`, `export const ${camel(name)}Timeout = 8000`)
      : shapeC(`native:script:${variant}`, `export const API_TIMEOUT = 8000`) },

  // ── Lynx ──
  { key: 'lynx:page', group: 'Native (Lynx)', label: 'native:page:lynx', sub: 'a Lynx page (--layout=app)', name: { prompt: 'Page name', def: 'index' },
    tag: n => `native:page:lynx:${n}`,
    build: ({ name, flags }) => shapeC(`native:page:lynx:${name}`,
`import React from '@lynx-js/react'

const ${pascal(name)}LynxPage = () => (
  <view className="flex-1 bg-neutral-50 px-6 pt-14">
    <text className="text-4xl font-bold">${pascal(name)}</text>
  </view>
)`, flags.layout ? `/* @arkzen:native:page:layout:${flags.layout} */\n` : '') },

  { key: 'lynx:layout', group: 'Native (Lynx)', label: 'native:layout:lynx', sub: 'Lynx page wrapper (--parent=name)', name: { prompt: 'Layout name', def: 'app' },
    tag: n => `native:layout:lynx:${n}`,
    build: ({ name, flags }) => {
      const body =
`\nexport const ${pascal(name)}Layout = ({ children }: { children?: any; tatSlug?: string }) => (
  <view className="flex-1">{children}</view>
)`
      return flags.parent
        ? shapeB(`native:layout:lynx:${name}`, `parent: ${flags.parent}`, body)
        : shapeC(`native:layout:lynx:${name}`, body)
    } },

  { key: 'lynx:components', group: 'Native (Lynx)', label: 'native:components:lynx', sub: 'shared Lynx components', name: { prompt: 'Components identifier', def: 'shared' },
    tag: n => `native:components:lynx:${n}`,
    build: ({ name }) => shapeC(`native:components:lynx:${name}`,
`import { type ReactNode } from '@lynx-js/react'

export const Card = ({ children }: { children: ReactNode }) => (<view>{children}</view>)`, '') },

  { key: 'lynx:style', group: 'Native (Lynx)', label: 'native:style:lynx', sub: 'global Lynx CSS, or named (name blank = global)', name: { prompt: 'Style name (blank = global styles)', def: '', optional: true },
    tag: n => (n ? `native:style:lynx:${n}` : 'native:style:lynx'),
    build: ({ name }) => name
      ? shapeC(`native:style:lynx:${name}`, `.${name}-wrap {\n  background-color: #ffffff;\n  padding-left: 24px;\n  padding-right: 24px;\n}`)
      : shapeC('native:style:lynx', `:root {\n  --color-primary: #111111;\n  --radius-default: 0.75rem;\n}\n\n.arkzen-btn {\n  background-color: var(--color-primary);\n  border-radius: var(--radius-default);\n  padding-left: 24px;\n  padding-right: 24px;\n  padding-top: 16px;\n  padding-bottom: 16px;\n}`) },

  { key: 'lynx:error:404', group: 'Native (Lynx)', label: 'native:error:404:lynx', sub: 'Lynx not-found UI', name: null, once: true,
    tag: () => 'native:error:404:lynx',
    build: () => shapeC('native:error:404:lynx',
`const NotFoundLynx = () => (
  <view className="flex-1 items-center justify-center" style={{ height: '100%' }}>
    <text className="text-6xl mb-4">404</text>
    <text className="text-xl font-bold">Page Not Found</text>
  </view>
)`) },

  { key: 'lynx:error:500', group: 'Native (Lynx)', label: 'native:error:500:lynx', sub: 'Lynx error UI', name: null, once: true,
    tag: () => 'native:error:500:lynx',
    build: () => shapeC('native:error:500:lynx',
`const ServerErrorLynx = () => (
  <view className="flex-1 items-center justify-center" style={{ height: '100%' }}>
    <text className="text-6xl mb-4">500</text>
    <text className="text-xl font-bold">Server Error</text>
  </view>
)`) },

  { key: 'lynx:animation', group: 'Native (Lynx)', label: 'native:animation:lynx', sub: 'state-driven enter animation helper', name: null, once: true,
    tag: () => 'native:animation:lynx',
    build: () => shapeC('native:animation:lynx',
`import { useState, useEffect } from '@lynx-js/react'

export const useFadeSlideIn = (delay = 0) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [])

  return {
    style: {
      opacity: visible ? 1 : 0,
      transform: [{ translateY: visible ? 0 : 16 }],
      transition: 'opacity 350ms ease-out, transform 350ms ease-out',
    },
  }
}`) },

  { key: 'lynx:script', group: 'Native (Lynx)', label: 'native:script:lynx', sub: 'Lynx helpers (name blank = global)', name: { prompt: 'Script name (blank = global helpers)', def: '', optional: true },
    tag: n => (n ? `native:script:lynx:${n}` : 'native:script:lynx'),
    build: ({ name }) => name
      ? shapeC(`native:script:lynx:${name}`, `export const ${camel(name)}Timeout = 8000`)
      : shapeC('native:script:lynx', `export const API_TIMEOUT = 8000`) },

  // ── Frames ──
  { key: 'frame:expo', group: 'Frames (per-target chrome)', label: 'native:frame:expo', sub: 'Expo Router _layout.tsx (tabs / stack / header)', name: null, once: true,
    tag: () => 'native:frame:expo',
    build: ({ slug }) => shapeC('native:frame:expo',
`import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function ${pascal(slug)}Layout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: true }} />
    </>
  )
}`, '') },

  { key: 'frame:rn', group: 'Frames (per-target chrome)', label: 'native:frame:rn', sub: 'bare RN screenOptions + Frame wrapper', name: null, once: true,
    tag: () => 'native:frame:rn',
    build: ({ slug }) => shapeC('native:frame:rn',
`import React from 'react'
import { StatusBar, View } from 'react-native'

// Native header on every screen of this tatemono.
export const screenOptions = {
  headerShown: true,
  title: '${titleCase(slug)}',
}

// Wraps every screen of this tatemono. children is the screen.
export const Frame = ({ children }: { children?: React.ReactNode }) => (
  <View style={{ flex: 1 }}>
    <StatusBar barStyle="dark-content" />
    <View style={{ flex: 1 }}>{children}</View>
  </View>
)`, '') },

  { key: 'frame:lynx', group: 'Frames (per-target chrome)', label: 'native:frame:lynx', sub: 'Lynx Frame component (no navigator on Lynx)', name: null, once: true,
    tag: () => 'native:frame:lynx',
    build: ({ slug }) => shapeC('native:frame:lynx',
`// Lynx has no navigator, so the frame is a component. It receives
// { module, page, children } and renders children (the screen) inside its chrome.
export const Frame = ({ module, page, children }: { module: string; page: string; children?: any }) => (
  <view style={{ height: '100%' }}>
    <view className="px-4 py-3">
      <text className="text-sm font-semibold">${titleCase(slug)}</text>
    </view>
    <view style={{ flex: 1 }}>{children}</view>
  </view>
)`, '') },

  { key: 'frame:electron', group: 'Frames (per-target chrome)', label: 'desktop:frame:electron', sub: 'Electron main-process JS (window, menu, tray)', name: null, once: true,
    tag: () => 'desktop:frame:electron',
    build: ({ slug }) => shapeC('desktop:frame:electron',
`// Plain JavaScript (ESM), runs in the Electron main process, not in the web app.
//   windowOptions  merged into the BrowserWindow options
//   setup(ctx)     runs once the web app has loaded; may return a teardown function
export const windowOptions = {
  title: '${titleCase(slug)}',
}

export function setup({ electron, win, command, onEvent }) {
  const { Menu } = electron

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: '${titleCase(slug)}',
        submenu: [{ role: 'quit' }],
      },
      { role: 'editMenu' },
      { role: 'viewMenu' },
    ]),
  )

  // The web app can retitle the window: window.arkzenHost.emit('title', 'Hello')
  const stopTitle = onEvent('title', (title) => win.setTitle(String(title)))

  return () => stopTitle()
}`, '') },

  { key: 'frame:tauri', group: 'Frames (per-target chrome)', label: 'desktop:frame:tauri', sub: 'Tauri shell Rust: pub fn frame(app)', name: null, once: true,
    tag: () => 'desktop:frame:tauri',
    build: ({ slug }) => shapeC('desktop:frame:tauri',
`// Rust, compiled into the Tauri shell. In scope without importing:
//   tauri, Manager, Emitter, Error, and command(&AppHandle, "id", serde_json::Value)
pub fn frame(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {
    if let Some(window) = app.get_webview_window("main") {
        window.set_title("${titleCase(slug)}")?;
    }
    Ok(())
}`, '') },

  // ── Godot 4 ──
  { key: 'godot:project', group: 'Games: Godot 4', label: 'godot:project', sub: 'project identity, renderer, main scene, display', name: null, once: true,
    tag: () => 'godot:project',
    build: ({ slug }) => shapeB('godot:project',
`godot_version: "4.x"
name: ${titleCase(slug)}
main_scene: res://scenes/main.tscn
renderer: forward_plus
window:
  width: 1280
  height: 720
  resizable: true
display:
  viewport_width: 640
  viewport_height: 360
  stretch_mode: canvas_items
  pixel_art: true`) },

  { key: 'godot:world', group: 'Games: Godot 4', label: 'godot:world', sub: 'procedural world, props, NPCs, visuals', name: null, once: true, requires: 'godot',
    tag: () => 'godot:world',
    build: ({ slug }) => shapeB('godot:world',
`name: ${slug}
tile_size: 1
grid_width: 32
grid_depth: 32
block_height: 0.6
world_margin: 2
seed: 42
props: {}
npcs:
  count: 0`) },

  { key: 'godot:input', group: 'Games: Godot 4', label: 'godot:input', sub: 'input actions and key bindings', name: null, once: true, requires: 'godot',
    tag: () => 'godot:input',
    build: () => shapeB('godot:input',
`actions:
  move_left:
    keys: [A, LEFT]
  move_right:
    keys: [D, RIGHT]
  move_up:
    keys: [W, UP]
  move_down:
    keys: [S, DOWN]
  interact:
    keys: [E, ENTER]
  run:
    keys: [SHIFT]
  jump:
    keys: [SPACE]`) },

  { key: 'godot:assets', group: 'Games: Godot 4', label: 'godot:assets', sub: 'textures from tatemonos/<name>/assets/', name: null, once: true, requires: 'godot',
    tag: () => 'godot:assets',
    build: () => shapeB('godot:assets',
`textures:
  player_sheet:
    source: assets/images/character.png
    filter: nearest
    alpha: true
    optional: true`) },

  { key: 'godot:scene', group: 'Games: Godot 4', label: 'godot:scene:<name>', sub: 'a scene (main scene path must match project)', name: { prompt: 'Scene name', def: 'main' }, requires: 'godot',
    tag: n => `godot:scene:${n}`,
    build: ({ name }) => shapeB(`godot:scene:${name}`,
`path: res://scenes/${name}.tscn
root:
  name: ${pascal(name)}
  type: Node3D
nodes: []`) },

  { key: 'godot:behavior:player', group: 'Games: Godot 4', label: 'godot:behavior:player', sub: 'generated player controller (CharacterBody3D)', name: null, once: true, requires: 'godot',
    tag: () => 'godot:behavior:player',
    build: () => shapeB('godot:behavior:player',
`script: res://scripts/player.gd
scene: res://scenes/player.tscn
language: gdscript
extends: CharacterBody3D
movement:
  input: [move_left, move_right, move_up, move_down]
  speed: 4.0
  run_action: run
  run_multiplier: 1.65
  jump_action: jump
  jump_velocity: 6.5
  acceleration: 18
  deceleration: 24
  camera_relative: true
  normalize_diagonal: true
  gravity: project_default
animation:
  moving: walk_{direction}
  idle: idle_{direction}
  facing_priority: dominant_axis`) },

  { key: 'godot:behavior:camera', group: 'Games: Godot 4', label: 'godot:behavior:camera', sub: 'generated follow camera', name: null, once: true, requires: 'godot',
    tag: () => 'godot:behavior:camera',
    build: () => shapeB('godot:behavior:camera',
`script: res://scripts/camera_follow.gd
node: Camera
language: gdscript
target: ../../Player
projection: perspective
follow:
  offset: [0, 1.8, 2.1]
  smoothing: 0.09
look_at:
  target_offset: [0, 0.5, 0]
zoom:
  min_distance: 1.1
  max_distance: 7.5
  step: 0.35
  mouse_sensitivity: 0.0055
  min_pitch: 0.4
  max_pitch: 1.45`) },

  { key: 'godot:multiplayer', group: 'Games: Godot 4', label: 'godot:multiplayer', sub: 'opt-in ENet host / join (no Web export)', name: null, once: true, requires: 'godot',
    tag: () => 'godot:multiplayer',
    build: () => shapeB('godot:multiplayer',
`enabled: true
port: 24567
max_clients: 8
sync_rate: 20
default_address: 127.0.0.1`) },

  { key: 'godot:export', group: 'Games: Godot 4', label: 'godot:export', sub: 'export presets (windows, linux, macos, web)', name: null, once: true, requires: 'godot',
    tag: () => 'godot:export',
    build: () => shapeB('godot:export',
`presets:
  windows:
    runnable: true
  linux:
    runnable: true
  macos:
    runnable: true
  web:
    runnable: false`) },

  // ── Unity ──
  { key: 'unity:project', group: 'Games: Unity', label: 'unity:project', sub: 'project (--mode=scene or runner)', name: null, once: true,
    extra: { key: 'mode', prompt: 'Unity mode (scene or runner)', def: 'scene' },
    tag: () => 'unity:project',
    build: ({ slug, flags }) => flags.mode === 'runner'
      ? shapeA('unity:project', `unity_version: 6000.0.38f1\nname: ${titleCase(slug)}\nwidth: 1280\nheight: 720\npixels_per_unit: 100`)
      : shapeA('unity:project', `mode: scene\nunity_version: 6000.0.38f1\nname: ${titleCase(slug)}\nmain_scene: Assets/Scenes/Main.unity\nwidth: 1280\nheight: 720`) },

  { key: 'unity:game', group: 'Games: Unity', label: 'unity:game', sub: 'dinosaur runner template settings (runner mode)', name: null, once: true, requires: 'unity',
    tag: () => 'unity:game',
    build: () => shapeA('unity:game',
`type: dino_runner
dinosaur: dino
obstacle: cactus
jump_key: Space
gravity: -30
jump_velocity: 12.5
ground_y: -2
scroll_speed: 7.5
spawn_interval_min: 1.1
spawn_interval_max: 2`) },

  { key: 'unity:visuals', group: 'Games: Unity', label: 'unity:visuals', sub: 'runner colours, camera and sprite sizes', name: null, once: true, requires: 'unity',
    tag: () => 'unity:visuals',
    build: () => shapeA('unity:visuals',
`background_color: "#b3e0f5"
ground_color: "#338a4f"
dinosaur_tint: "#ffffff"
obstacle_tint: "#ffffff"
camera_size: 5
ground_thickness: 0.22
ground_width: 24
dinosaur_size: 1.75
obstacle_width: 0.9
obstacle_height: 1.25`) },

  { key: 'unity:controls', group: 'Games: Unity', label: 'unity:controls', sub: 'runner restart key and pointer input', name: null, once: true, requires: 'unity',
    tag: () => 'unity:controls',
    build: () => shapeA('unity:controls', `restart_key: R\npointer_enabled: true`) },

  { key: 'unity:scene', group: 'Games: Unity', label: 'unity:scene:<name>', sub: 'a scene and its object hierarchy (scene mode)', name: { prompt: 'Scene name', def: 'main' }, requires: 'unity',
    tag: n => `unity:scene:${n}`,
    build: ({ name }) => shapeB(`unity:scene:${name}`,
`path: Assets/Scenes/${pascal(name)}.unity
nodes:
  - name: Ground
    type: cube
    position: [0, -0.5, 0]
    scale: [20, 1, 20]
    color: "#456b46"
    components:
      - type: box_collider
        size: [1, 1, 1]
  - name: Player
    type: capsule
    position: [0, 1, 0]
    components:
      - type: character_controller
        speed: 5
        jump_height: 1.6
  - name: Sun
    type: light
    light_type: directional
    rotation: [45, -30, 0]
    intensity: 1.2
    shadows: true
  - name: MainCamera
    type: camera
    main: true
    position: [0, 4, -7]
    components:
      - type: camera_follow
        target: Player
        offset: [0, 4, -7]
        smooth_speed: 8`) },

  { key: 'unity:environment', group: 'Games: Unity', label: 'unity:environment', sub: 'ambient light and fog (scene mode)', name: null, once: true, requires: 'unity',
    tag: () => 'unity:environment',
    build: () => shapeA('unity:environment',
`ambient_color: "#a9c7d7"
ambient_intensity: 0.8
fog_enabled: true
fog_color: "#c5e0dc"
fog_density: 0.008`) },

  { key: 'unity:assets', group: 'Games: Unity', label: 'unity:assets', sub: 'source assets from tatemonos/<name>/assets/', name: null, once: true, requires: 'unity',
    tag: () => 'unity:assets',
    build: () => shapeA('unity:assets', `  dino:\n    source: assets/dino.svg\n  cactus:\n    source: assets/cactus.svg`) },

  { key: 'unity:export', group: 'Games: Unity', label: 'unity:export', sub: 'build targets (windows, linux, macos, webgl)', name: null, once: true, requires: 'unity',
    tag: () => 'unity:export',
    build: () => shapeA('unity:export', `targets: [windows, linux, webgl]`) },

  // ── Free files ──
  { key: 'file', group: 'Free files', label: 'file', sub: 'write any text file to a path', name: { prompt: 'File block identifier', def: 'landing' },
    extra: { key: 'path', prompt: 'Output path', def: 'index.html' },
    tag: n => `file:${n}`,
    build: ({ name, flags }) => shapeB(`file:${name}`, `path: ${flags.path ?? 'index.html'}`, '') },
]

// ─── shared builders used by BLOCKS and TEMPLATES ─────────────
function metaBlock(slug, description, auth = false) {
  return shapeA('meta', `name: ${slug}\nversion: 1.0.0\ndescription: ${description}\nauth: ${auth}`)
}

function metaNativeBlock(slug) {
  return shapeA('meta:native',
`label: ${titleCase(slug)}
description: Short description
expo:
  bundle_id: com.example.${slug.replace(/-/g, '')}
  scheme: ${slug.replace(/-/g, '')}
  version: 1.0.0
  orientation: portrait
  status_bar_style: dark`)
}

// Native error screens are written one block per target (Expo, bare RN), split by the import pair.
function nativeError(code) {
  const title = code === '404' ? 'Page not found' : 'Something went wrong'
  const make = target => {
    const comp = `${code === '404' ? 'NotFound' : 'ServerError'}${target === 'expo' ? 'Expo' : 'RN'}`
    return shapeC(`native:error:${code}`,
`/* @arkzen:import:${target} */
import React from 'react'
import { View, Text } from 'react-native'
/* @arkzen:import:${target}:end */

const ${comp} = () => (
  <View className="flex-1 items-center justify-center">
    <Text className="text-4xl font-bold">${code}</Text>
    <Text>${title}</Text>
  </View>
)`, '')
  }
  return make('expo') + '\n' + make('rn')
}

// ─── TEMPLATES FOR `new` ──────────────────────────────────────
function blockByKey(key) { return BLOCKS.find(b => b.key === key) }
const stub = (key, name, extra = {}) => blockByKey(key).build({ name, slug: extra.slug ?? '', variant: extra.variant, flags: extra.flags ?? {} })

const SVG_DINO = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <path fill="#4a8f5b" d="M40 20h48v28H72v12h20v36H76v20H52V96H36V60h12V48H40z"/>
  <path fill="#ffffff" d="M72 28h10v10H72z"/>
  <path fill="#1f1f1f" d="M76 30h5v6h-5z"/>
</svg>
`
const SVG_CACTUS = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="128" viewBox="0 0 80 128">
  <path fill="#34794e" d="M29 9h22v109H29z"/>
  <path fill="#34794e" d="M14 51h16v13H14v22H4V56h10zM51 34h14v11h10v28H64V56h-7v18H45V37h6z"/>
  <path fill="#73ad70" d="M34 14h6v91h-6zM9 61h5v15H9zM67 50h5v15h-5z"/>
  <path fill="#245d42" d="M29 112h22v9H29z"/>
</svg>
`

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
    label: 'Native screen', sub: 'meta + meta:native + one Expo / RN screen',
    make: ({ slug }) => [metaBlock(slug, 'Native tatemono'), metaNativeBlock(slug), stub('native:page', 'index', { slug })],
  },
  lynx: {
    label: 'Lynx screen', sub: 'meta + meta:native + one Lynx page',
    make: ({ slug }) => [metaBlock(slug, 'Lynx tatemono'), metaNativeBlock(slug), stub('lynx:page', 'index', { slug })],
  },
  files: {
    label: 'Free files only', sub: 'meta + one @arkzen:file block',
    make: ({ slug }) => [metaBlock(slug, 'Free files tatemono'), stub('file', 'landing', { slug, flags: { path: 'index.html' } })],
  },
  godot: {
    label: 'Godot 4 game', sub: 'meta + project, input, scenes, player, camera, export',
    make: ({ slug }) => [
      metaBlock(slug, 'Godot 4 game tatemono'),
      stub('godot:project', null, { slug }),
      stub('godot:input', null, { slug }),
      stub('godot:assets', null, { slug }),
      godotMainScene(),
      godotPlayerScene(),
      stub('godot:behavior:player', null, { slug }),
      stub('godot:behavior:camera', null, { slug }),
      stub('godot:export', null, { slug }),
    ],
  },
  'unity-scene': {
    label: 'Unity scene game', sub: 'meta + project (scene mode) + environment + main scene + export',
    make: ({ slug }) => [
      metaBlock(slug, 'Unity scene tatemono'),
      stub('unity:project', null, { slug, flags: { mode: 'scene' } }),
      stub('unity:environment', null, { slug }),
      stub('unity:scene', 'main', { slug }),
      stub('unity:export', null, { slug }),
    ],
  },
  'unity-runner': {
    label: 'Unity dino runner', sub: 'meta + runner project, game, visuals, controls, SVG assets',
    make: ({ slug }) => [
      metaBlock(slug, 'Unity runner tatemono'),
      stub('unity:project', null, { slug, flags: { mode: 'runner' } }),
      stub('unity:game', null, { slug }),
      stub('unity:visuals', null, { slug }),
      stub('unity:controls', null, { slug }),
      stub('unity:assets', null, { slug }),
    ],
    files: () => ({ 'assets/dino.svg': SVG_DINO, 'assets/cactus.svg': SVG_CACTUS }),
  },
}

// The Godot starter scenes: a main scene that instances the player and holds the follow camera.
function godotMainScene() {
  return shapeB('godot:scene:main',
`path: res://scenes/main.tscn
root:
  name: Main
  type: Node3D
nodes:
  - name: WorldEnvironment
    type: WorldEnvironment
  - name: Sun
    type: DirectionalLight3D
    properties:
      shadow_enabled: true
      rotation_degrees: [-55, -35, 0]
  - name: Player
    instance: res://scenes/player.tscn
  - name: CameraRig
    type: Node3D
    children:
      - name: Camera
        type: Camera3D
        properties:
          projection: perspective
          current: true`)
}
function godotPlayerScene() {
  return shapeB('godot:scene:player',
`path: res://scenes/player.tscn
root:
  name: Player
  type: CharacterBody3D
  properties:
    position: [0, 0.5, 0]
components:
  - type: CollisionShape3D
    name: PlayerCollision
    shape:
      type: CapsuleShape3D
      radius: 0.25
      height: 0.9
  - type: AnimatedSprite3D
    name: Sprite
    texture: player_sheet
    position: [0, 0.25, 0]
    pixel_size: 0.03125
    billboard: enabled
    animation:
      columns: 6
      rows: 8
      directions: [down, left, right, up]
      idle_row_offset: 0
      walk_row_offset: 4
      frames_per_second: 8`)
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

// The app stack decides the default native target (expo unless the config says bare RN).
function defaultTarget(ctx) {
  try {
    const stack = String(ctx.readConfig()?.activeAppStack ?? '').toLowerCase()
    if (stack === 'rn' || stack.includes('bare') || stack.includes('react-native')) return 'rn'
  } catch { /* fall through */ }
  return 'expo'
}

// Checks a block's `requires` against the file, returns an error message or null.
function checkRequires(block, source, slug) {
  if (block.requires === 'godot' && !hasTag(source, 'godot:project'))
    return `${block.key} needs @arkzen:godot:project first. Run: node mizumi.js block ${slug} godot:project   (or start a new one: node mizumi.js new <name> --template=godot)`
  if (block.requires === 'unity' && !hasTag(source, 'unity:project'))
    return `${block.key} needs @arkzen:unity:project first. Run: node mizumi.js block ${slug} unity:project   (or start a new one: node mizumi.js new <name> --template=unity-scene)`
  if (block.requires === 'auth' && !/@arkzen:meta\s*\n[\s\S]*?\bauth:\s*true\b/.test(source))
    return `${block.key} needs auth: true in @arkzen:meta. Edit the meta block first.`
  return null
}

// ─── mizumi new ───────────────────────────────────────────────
export async function cmdNew(ctx, args) {
  const { positional, flags } = parseArgs(args)
  let slug = positional[0]
  const names = Object.keys(TEMPLATES).join('|')

  if (!slug) {
    if (!interactive()) { ctx.error(`Usage: mizumi new <name> [--template=${names}]`); return }
    slug = await ctx.prompt('Tatemono name (kebab-case)', '')
  }
  if (!slug || !SLUG_RE.test(slug)) { ctx.error(`"${slug ?? ''}" is not a valid name. Use kebab-case, e.g. my-app`); return }

  const dir = path.join(ctx.TATEMONOS_DIR, slug)
  if (fs.existsSync(dir)) { ctx.error(`tatemonos/${slug} already exists`); return }

  let template = flags.template
  if (!template) {
    if (!interactive()) { ctx.error(`Pass --template=${names}`); return }
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
  const extraFiles = tpl.files ? tpl.files({ slug }) : {}
  for (const [rel, content] of Object.entries(extraFiles)) {
    const target = path.join(dir, rel)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, content, 'utf8')
  }
  ctx.success(`Created tatemonos/${slug}/core.tsx  ${ctx.paint(ctx.c.gray, `(${template})`)}`)
  if (Object.keys(extraFiles).length) ctx.info(`Also wrote: ${Object.keys(extraFiles).map(f => `tatemonos/${slug}/${f}`).join(', ')}`)
  ctx.info(`Add more blocks: node mizumi.js block ${slug}`)
  if (template === 'godot') ctx.info(`Export it: node mizumi.js export ${slug} godot`)
  else if (template.startsWith('unity')) ctx.info(`Export it: node mizumi.js export ${slug} unity`)
  else ctx.info(`Check it appears: node mizumi.js modules`)
}

// ─── mizumi block ─────────────────────────────────────────────
function printCatalog(ctx) {
  ctx.divider()
  let group = ''
  for (const b of BLOCKS) {
    if (b.group !== group) { group = b.group; console.log(`\n  ${ctx.paint(ctx.c.white + ctx.c.bold, group)}\n`) }
    console.log(`  ${ctx.paint(ctx.c.cyan, b.key.padEnd(22))} ${ctx.paint(ctx.c.gray, b.sub)}`)
  }
  console.log(`\n  ${ctx.paint(ctx.c.gray, `${BLOCKS.length} blocks. Backend variants: ${VARIANTS.join(', ')}. Native targets: ${TARGETS.join(', ')}.`)}`)
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
  const gameKind = hasTag(source, 'godot:project') ? 'Games: Godot 4' : hasTag(source, 'unity:project') ? 'Games: Unity' : null

  // 2. which DSL group, then which block
  let block = positional[1] ? blockByKey(positional[1]) : null
  if (positional[1] && !block) { ctx.error(`Unknown block: ${positional[1]} (see: mizumi block --list)`); return }
  if (!block) {
    if (!interactive()) { ctx.error('Pass a block key (see: mizumi block --list)'); return }
    // A game tatemono only sees its own engine's blocks and free files; others see everything.
    const groups = [...new Set(BLOCKS.map(b => b.group))].filter(g => !gameKind || g === gameKind || g === 'Free files' || g === 'Config + meta')
    ctx.divider()
    const group = (await ctx.picker('どのDSL？ Which kind of block?', groups.map(g => ({ label: g, value: g })))).value
    ctx.divider()
    block = blockByKey((await ctx.picker(`${group}: which block?`,
      BLOCKS.filter(b => b.group === group).map(b => ({ label: b.label, sub: b.sub, value: b.key })))).value)
  }

  const missing = checkRequires(block, source, slug)
  if (missing) { ctx.error(missing); return }
  if (gameKind && block.group !== gameKind && !['Free files', 'Config + meta'].includes(block.group)) {
    ctx.error(`${slug} is a ${gameKind.replace('Games: ', '')} game tatemono. ${block.key} is a web/native/backend block and would be ignored.`); return
  }

  // 3. identifier
  let name = positional[2] ?? null
  if (block.name) {
    if (!name && !block.name.optional) {
      if (block.name.choices && interactive()) {
        ctx.divider()
        name = (await ctx.picker(block.name.prompt, block.name.choices.map(v => ({ label: v, value: v })))).value
      } else name = await ask(ctx, block.name.prompt, block.name.def)
    } else if (!name && block.name.optional && !flags.global) {
      name = await ask(ctx, block.name.prompt, block.name.def)
    }
    if (block.name.optional && !name) name = ''
    else if (block.name.pascal ? !/^[A-Z][A-Za-z0-9]*$/.test(name) : !/^[A-Za-z0-9][A-Za-z0-9_.{}-]*$/.test(name)) {
      ctx.error(`"${name}" is not a valid identifier for ${block.key}${block.name.pascal ? ' (use PascalCase)' : ''}`); return
    }
  }

  // 4. backend variant, or native target
  let variant = null
  if (block.targets) {
    const active = defaultTarget(ctx)
    if (flags.target || flags.variant) {
      variant = String(flags.target ?? flags.variant)
      if (!block.targets.includes(variant)) { ctx.error(`${block.key} targets: ${block.targets.join(', ')}`); return }
    } else if (interactive()) {
      ctx.divider()
      variant = (await ctx.picker('ターゲット？ Which native target?',
        block.targets.map(v => ({ label: `${v === active ? '→ ' : '  '}:${v}`, sub: TARGET_LABEL[v], value: v })))).value
    } else variant = active
  } else if (block.variants) {
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
      variant = block.defaultShared ? null : (allowed.includes(resolveVariant(ctx, {})) ? resolveVariant(ctx, {}) : (optional ? null : allowed[0]))
    }
  }

  // 5. extra field (file path, unity mode)
  if (block.extra && !flags[block.extra.key]) flags[block.extra.key] = await ask(ctx, block.extra.prompt, block.extra.def)
  if (block.key === 'unity:project' && !['scene', 'runner'].includes(String(flags.mode))) { ctx.error('--mode must be scene or runner'); return }

  // 6. guard against duplicates, then write
  const tag = block.tag(name, variant)
  if (hasTag(source, tag)) { ctx.error(`@arkzen:${tag} already exists in tatemonos/${slug}/core.tsx`); return }
  if (block.key === 'unity:scene' && !hasTag(source, 'unity:project')) { ctx.error('unity:scene needs unity:project first'); return }

  const snippet = block.build({ name, slug, variant, flags })
  if (flags.dry) { console.log(snippet); return }

  const next = source.replace(/\s*$/, '') + '\n\n' + snippet
  fs.writeFileSync(file, next, 'utf8')
  ctx.success(`Added @arkzen:${tag}  ${ctx.paint(ctx.c.gray, `→ tatemonos/${slug}/core.tsx`)}`)

  // hints for the rules the file now has to satisfy
  if (block.key === 'endpoint') ctx.info(`The method "${name}" must exist in an @arkzen:api block.`)
  if (block.key === 'handler') ctx.info(`The handler "${name}" must be listed in an @arkzen:routes block.`)
  if (block.key === 'policy') ctx.info('The api block needs policy: true.')
  if (block.key === 'listener') ctx.info(`List "${name}" under listeners: in an @arkzen:events block.`)
  if (block.key === 'oauth') ctx.info('Provider secrets go in the backend .env, never in the tatemono. Build the login buttons in a page.')
  if (block.key === 'meta:web') ctx.info(`Favicon: hand-make tatemonos/${slug}/assets/images/favicon.svg, then add: favicon: /tatemonos/${slug}/assets/images/favicon.svg`)
  if (block.key === 'module:rs') ctx.info('Only read when the active backend is Rust. One block per file.')
  if (block.key === 'godot:behavior:player') ctx.info('The player scene (res://scenes/player.tscn) must be a different scene from the main scene.')
  if (block.key === 'godot:behavior:camera') ctx.info('The main scene needs a Camera node under CameraRig, and a Player instance.')
  if (block.key === 'godot:assets') ctx.info(`Put the image files under tatemonos/${slug}/assets/ (or drop optional: true while testing).`)
  if (block.key === 'unity:assets') ctx.info(`Put dino.svg and cactus.svg under tatemonos/${slug}/assets/.`)
  if (block.key === 'frame:tauri') ctx.info('A tray needs the tray-icon Cargo feature; a Rust mistake here fails the whole Tauri build.')
  if (block.key === 'native:error:404' || block.key === 'native:error:500') ctx.info('Two blocks were written: one for Expo and one for bare RN.')
}
