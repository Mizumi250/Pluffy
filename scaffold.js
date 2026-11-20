// ============================================================
//  scaffold.js: hand-write support for tatemonos
//    node mizumi.js new [name] [--template=<id>]
//    node mizumi.js block [tatemono] [block] [name] [--variant=<v>] [--dry]
//    node mizumi.js block --list
//  Every block in PLUFF_DSL_CATALOG.md is covered. Shapes follow
//  PLUFF_GUIDELINES Section 3D; bodies follow the fixture tatemonos.
//  mizumi.js passes its picker/prompt/log helpers in through `ctx`.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'

// ─── HELPERS ──────────────────────────────────────────────────
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

// Block shapes (guidelines Section 3D)
const shapeA = (tag, yaml) => `/* @arkzen:${tag}\n${yaml}\n*/\n`                                   // YAML only, bare */ closes it
const shapeB = (tag, yaml, body = '') => `/* @arkzen:${tag}\n${yaml}\n*/\n${body ? body + '\n' : ''}/* @arkzen:${tag}:end */\n`   // YAML + body + :end
const shapeC = (tag, body, after = '') => `/* @arkzen:${tag} */\n${after}${body ? '\n' + body + '\n' : ''}\n/* @arkzen:${tag}:end */\n`  // code block
const shapeD = (tag, body) => `/* @arkzen:${tag}\n*/\n${body}\n/* @arkzen:${tag}:end */\n`          // body-separator block

const BACKENDS = ['php', 'ts', 'py', 'java', 'cs', 'go', 'rs']
const BACKEND_LABEL = { php: 'Laravel (PHP)', ts: 'Express (TypeScript)', py: 'FastAPI (Python)', java: 'Spring Boot (Java)', cs: 'ASP.NET Core (C#)', go: 'Go (Chi)', rs: 'Rust (Axum)' }
const NATIVE = ['expo', 'rn']
const NATIVE_LABEL = { expo: 'Expo', rn: 'Bare React Native' }
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
}

// ─── SHARED CHECKS ────────────────────────────────────────────
const hasTag = (source, tag) => new RegExp(`/\\* @arkzen:${escapeRe(tag)}(?![\\w:+-])`).test(source)
const interactive = () => !!process.stdin.isTTY
const ask = (ctx, q, def) => (interactive() ? ctx.prompt(q, def) : Promise.resolve(def))

function listTatemonoDirs(ctx) {
  if (!fs.existsSync(ctx.TATEMONOS_DIR)) return []
  return fs.readdirSync(ctx.TATEMONOS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(ctx.TATEMONOS_DIR, e.name, 'core.tsx')))
    .map(e => e.name).sort()
}

function activeBackendVariant(ctx, flags = {}) {
  if (flags.variant) return String(flags.variant)
  if (flags.backend) return ctx.backendVariant(ctx.BACKEND_ALIASES[flags.backend] ?? String(flags.backend))
  return ctx.backendVariant(ctx.resolveBackend(ctx.readConfig()))
}

// ─── mizumi new ───────────────────────────────────────────────
export async function cmdNew(ctx, args) {
  const { positional, flags } = parseArgs(args)
  let slug = positional[0]
  if (!slug) {
    if (!interactive()) { ctx.error(`Usage: mizumi new <name> [--template=${Object.keys(TEMPLATES).join('|')}]`); return }
    slug = await ctx.prompt('Tatemono name (kebab-case)', '')
  }
  if (!slug || !SLUG_RE.test(slug)) { ctx.error(`"${slug ?? ''}" is not a valid name. Use kebab-case, e.g. my-app`); return }
  const dir = path.join(ctx.TATEMONOS_DIR, slug)
  if (fs.existsSync(dir)) { ctx.error(`tatemonos/${slug} already exists`); return }

  let template = flags.template
  if (!template) {
    if (!interactive()) { ctx.error(`Pass --template=${Object.keys(TEMPLATES).join('|')}`); return }
    ctx.divider()
    template = (await ctx.picker('テンプレート Which starting point?',
      Object.entries(TEMPLATES).map(([key, t]) => ({ label: t.label, sub: t.sub, value: key })))).value
  }
  const tpl = TEMPLATES[template]
  if (!tpl) { ctx.error(`Unknown template: ${template} (use: ${Object.keys(TEMPLATES).join(', ')})`); return }

  const variant = activeBackendVariant(ctx, flags)
  let resource = flags.resource ? String(flags.resource) : 'items'
  if (template === 'crud' && !flags.resource) resource = await ask(ctx, 'Resource (plural table name)', 'items')
  if (!SLUG_RE.test(resource)) { ctx.error(`"${resource}" is not a valid resource name`); return }

  const text = tpl.make({ slug, variant, resource }).join('\n')
  if (flags.dry) { console.log(text); return }
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'core.tsx'), text, 'utf8')
  ctx.success(`Created tatemonos/${slug}/core.tsx  ${ctx.paint(ctx.c.gray, `(${template})`)}`)
  ctx.info(`Add more blocks: node mizumi.js block ${slug}`)
  ctx.info('Check it appears: node mizumi.js modules')
}

// ─── mizumi block ─────────────────────────────────────────────
function printCatalog(ctx) {
  ctx.divider()
  let group = ''
  for (const b of BLOCKS) {
    if (b.group !== group) { group = b.group; console.log(`\n  ${ctx.paint(ctx.c.white + ctx.c.bold, group)}\n`) }
    console.log(`  ${ctx.paint(ctx.c.cyan, b.key.padEnd(24))} ${ctx.paint(ctx.c.gray, b.sub)}`)
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
  const gameKind = /@arkzen:godot:project/.test(source) ? 'godot' : /@arkzen:unity:project/.test(source) ? 'unity' : null

  // 2. which DSL group, then which block
  let block = positional[1] ? blockByKey(positional[1]) : null
  if (positional[1] && !block) { ctx.error(`Unknown block: ${positional[1]} (see: mizumi block --list)`); return }
  if (!block) {
    if (!interactive()) { ctx.error('Pass a block key (see: mizumi block --list)'); return }
    const visible = BLOCKS.filter(b => (gameKind ? b.game === gameKind : !b.game))
    const groups = [...new Set(visible.map(b => b.group))]
    ctx.divider()
    const group = (await ctx.picker('どのDSL？ Which kind of block?', groups.map(g => ({ label: g, value: g })))).value
    ctx.divider()
    block = blockByKey((await ctx.picker(`${group}: which block?`,
      visible.filter(b => b.group === group).map(b => ({ label: b.key, sub: b.sub, value: b.key })))).value)
  }
  if (block.game && block.game !== gameKind) { ctx.error(`${block.key} belongs in a ${block.game} tatemono (one that has @arkzen:${block.game}:project)`); return }
  if (!block.game && gameKind) { ctx.error(`This is a ${gameKind} tatemono. Use the ${gameKind}:* blocks (see: mizumi block --list)`); return }
  if (block.needs) { const problem = block.needs(source); if (problem) { ctx.error(problem); return } }

  // 3. identifier
  let name = positional[2] ?? null
  if (block.name) {
    if (name === null) {
      if (block.name.choices && interactive()) {
        ctx.divider()
        name = (await ctx.picker(block.name.prompt, block.name.choices.map(v => ({ label: v, value: v })))).value
      } else name = await ask(ctx, block.name.prompt, block.name.def)
    }
    const optionalBlank = block.name.optional && name === ''
    const valid = optionalBlank || (block.name.pascal ? /^[A-Z][A-Za-z0-9]*$/.test(name) : /^[A-Za-z0-9][A-Za-z0-9_.{}-]*$/.test(name))
    if (!valid) { ctx.error(`"${name}" is not a valid identifier for ${block.key}${block.name.pascal ? ' (use PascalCase)' : ''}`); return }
  }

  // 4. variant (backend or native target)
  let variant = null
  if (block.variants) {
    const { list, optional, labels, backend } = block.variants
    if (flags.shared && optional) variant = null
    else if (flags.variant || (backend && flags.backend)) {
      variant = backend ? activeBackendVariant(ctx, flags) : String(flags.variant)
      if (!list.includes(variant)) { ctx.error(`${block.key} has no :${variant} form. Allowed: ${list.join(', ')}`); return }
    } else if (interactive()) {
      const active = backend ? activeBackendVariant(ctx) : list[0]
      const options = list.map(v => ({ label: `${v === active ? '→ ' : '  '}:${v}`, sub: labels[v], value: v }))
      if (optional) options.unshift({ label: '  shared', sub: 'YAML only, works on every backend', value: null })
      ctx.divider()
      variant = (await ctx.picker(backend ? 'バックエンド？ Which backend variant?' : 'ターゲット？ Which native target?', options)).value
    } else {
      const active = backend ? activeBackendVariant(ctx) : list[0]
      variant = list.includes(active) ? active : (optional ? null : list[0])
    }
  }

  // 5. extra field (file path)
  if (block.extra && !flags[block.extra.key]) flags[block.extra.key] = await ask(ctx, block.extra.prompt, block.extra.def)

  // 6. guard against duplicates, then write
  const tag = block.tag(name, variant)
  if (hasTag(source, tag)) { ctx.error(`@arkzen:${tag} already exists in tatemonos/${slug}/core.tsx`); return }

  const snippet = block.build({ name, slug, variant, flags })
  if (flags.dry) { console.log(snippet); return }
  fs.writeFileSync(file, source.replace(/\s*$/, '') + '\n\n' + snippet, 'utf8')
  ctx.success(`Added @arkzen:${tag}  ${ctx.paint(ctx.c.gray, `→ tatemonos/${slug}/core.tsx`)}`)
  if (block.key === 'endpoint') ctx.info(`The method "${name}" must exist in an @arkzen:api block.`)
  if (block.key === 'handler') ctx.info(`The handler "${name}" must be listed in an @arkzen:routes block.`)
  if (block.key === 'policy') ctx.info('The api block needs policy: true.')
  if (block.key === 'meta:web') ctx.info('Put your own favicon at tatemonos/' + slug + '/assets/images/favicon.svg (not an emoji, not AI-made).')
}
