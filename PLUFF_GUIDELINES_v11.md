# PLUFF GUIDELINES v11.0

## For AI — Generating & Editing Tatemono Files

**VERSION:** 11.0
**VERIFIED AGAINST:** engine source (parser v10.6 + layout chains v11.0, validator, Laravel builders, `mizumi.js`, `arkzen.js`) and the 33 tatemonos in `tatemonos/` — repo commit `d7812cd` (2026-10-18).
**PURPOSE:** Complete reference for generating valid Pluff tatemono files. Paste into any AI (or use as the system prompt / training source for the Pluff AI).
**SOURCE OF TRUTH ORDER:** (1) engine parser + builders, (2) real working tatemonos, (3) this document. If this document disagrees with the parser, the parser wins — and the doc should be fixed.

**WHAT'S NEW IN v11.0 (vs v10.0):**

- **Three stack categories** — `web`, `app`, `desktop` — can all be active at once. New stacks: `react-native` (bare), `lynx`, `tauri`, `electron`.
- **Native DSL is now per-target.** Expo, bare React Native, and Lynx each have their own blocks. Expo/RN blocks use dual-target `@arkzen:import:expo` / `@arkzen:import:rn` pairs. Lynx blocks are separate, self-contained `:lynx` blocks.
- **New native blocks:** `@arkzen:native:style` (global), `@arkzen:native:error:404|500`, `@arkzen:native:animation:expo|rn|lynx`, `@arkzen:native:script:expo|rn|lynx[:name]`, all `native:*:lynx` blocks. **Removed:** generic `@arkzen:native:script`, and `animation:rn` no longer serves Expo.
- **PostgreSQL support** — database driver is a project-level setting (`mizumi db`), one isolated database per tatemono.
- **Corrected syntax** that v10 had wrong: console blocks use `signature:` (not `command:`), listeners use `@arkzen:listener:Name` (singular), mail blocks use `subject` + `data:` (not `lines`/`action`), notifications/mail/events/realtime need `:end`, the multi-table `tables:` database format is **not parsed**, `type: enum` is **not supported**.
- **Special endpoint `type:` values** (`upload`, `broadcast`, `mail_send`, `notification_trigger`, ...) and role endpoint names, documented.
- **`@arkzen:meta`** gained `dependencies` and `auth_seed`; **`@arkzen:meta:web`** gained `og`, `twitter`, `pwa`, `label`; `favicon`/`pwa` inside `@arkzen:meta` are deprecated.
- **Lynx realtime:** an SSE bridge controller is auto-generated for Lynx when a tatemono has realtime + a `type: broadcast` endpoint.
- **33 tatemonos** (new: `ethereane`, `lain098`, `shikaku`). A "Known engine quirks" section lists behaviors worth double-checking.

* * *

## SECTION 1 — WHAT IS PLUFF

Pluff is a full-stack scaffolding engine. A single file called a **Tatemono** defines an entire system: database tables, backend API, auth, middleware, realtime channels, jobs, events, notifications, mail, scheduled commands, web pages, native screens, components, stores, animations.

**One Tatemono = one complete, fully isolated client system.**

No shared auth, components, stores, or database between tatemonos. Every tatemono stands alone. The engine watches `tatemonos/<name>/core.tsx`, parses it, and (re)builds backend + frontend on every save. A tatemono can be exported as a standalone project.

**The Tatemono DSL is the same across stacks.** The engine picks the right output for the active web / app / desktop stack.

**Common to all stacks:**

- Backend: Laravel 13 + Laravel Sanctum + Laravel Reverb (realtime)
- Database: SQLite (default) or PostgreSQL — one isolated database per tatemono
- Web animation: GSAP + Framer Motion · Native animation: Reanimated / Moti (Expo, RN) or `@lynx-js/motion` (Lynx)
- Icons: Lucide React (web primary), Hero Icons (secondary)
- Optional (installed): Matter.js, Three.js, TipTap, Leaflet

* * *

## SECTION 1B — STACKS & CLI

Stacks are chosen **per project**, in three independent categories.

| Category  | Stack            | Description                                              |
|-----------|------------------|----------------------------------------------------------|
| `web`     | `nextjs` (default)| Next.js 16 + TS + Tailwind + Zustand (decoupled)         |
| `web`     | `react-vite`     | React 18 + Vite + TS + Tailwind + Zustand (decoupled)    |
| `web`     | `tanstack-start` | TanStack Start + Vite + TS + Tailwind + Zustand          |
| `web`     | `astro`          | Astro + React islands + TS + Tailwind                    |
| `web`     | `react-inertia`  | React 18 + Inertia.js (Laravel monolith; uses `laravel-inertia` backend) |
| `app`     | `expo`           | Expo (SDK 53, Expo Go) + Expo Router + NativeWind       |
| `app`     | `react-native`   | Bare React Native                                        |
| `app`     | `lynx`           | Lynx (Rspeedy / ReactLynx)                               |
| `desktop` | `tauri`          | Tauri shell that **wraps the running web stack**         |
| `desktop` | `electron`       | Electron shell that **wraps the running web stack**      |

Backends: `laravel` (all decoupled web stacks, and app stacks) · `laravel-inertia` (react-inertia only; chosen automatically).

There is **no desktop DSL** — desktop targets reuse the web blocks.

**CLI (interactive: `node mizumi.js`):**

```
node setup.js                         # one-time setup (PHP deps, npm, .env, migrations)
node start.js                         # start Laravel + queue worker + Reverb + active frontends
node mizumi.js                        # interactive menu
node mizumi.js start | setup | stack | stacks | modules
node mizumi.js web <stack>            # switch web stack
node mizumi.js app <stack>            # switch app stack (expo | react-native | lynx)
node mizumi.js desktop <stack>        # switch desktop stack (tauri | electron)
node mizumi.js db <sqlite|postgresql> # switch database driver
node mizumi.js deps [prune | install <stack> | uninstall <stack>]
node mizumi.js export                 # wizard
node mizumi.js export <name> [stack]  # export one tatemono as standalone project
node export.js <name>                 # export one tatemono directly
node arkzen.js switch <web|app|desktop> <stack>   # equivalent stack switcher
node arkzen.js stack | stacks
```

* * *

## SECTION 1C — DATABASE PROVIDER (project-level, NOT in the DSL)

Every tatemono gets its own isolated database. The driver is a **project setting**, not a tatemono field:

- `sqlite` (default): file `database/arkzen/<slug>.sqlite`
- `pgsql`: Postgres database `<ARKZEN_DB_PREFIX>_<slug_with_underscores>` (prefix default `pluff`)

Switch with `node mizumi.js db postgresql` (prompts for host/user/password/main DB name, then re-runs setup). Env: `ARKZEN_DB_DRIVER`, `ARKZEN_DB_PREFIX`. Tatemono files never mention the driver — write the same `@arkzen:database` blocks for both.

Supabase and other backend targets (Express, Python, Java, C#) are **planned only** (`TEMP_PLUFF_FEATURE_PLAN.md`), not implemented. Never generate DSL for them.

* * *

## SECTION 2 — STYLING POLICY

**Web:** Tailwind is the default. Inline styles are equally valid for dynamic values, glassmorphism, gradients, `backdrop-filter`, shadows, animation values. Mix freely; never use both for the same property.

**Expo / bare RN:** NativeWind `className` utilities on React Native components; `StyleSheet.create()` or inline style objects for dynamic styles; named `@arkzen:native:style` blocks for shared StyleSheets.

**Lynx:** self-contained Lynx styling (see Section 24).

**Icons:** web → `lucide-react` first (import only in the FIRST `web:components` block, or in the layout block itself; `size` prop), Hero Icons only if Lucide lacks it. Native → Expo Vector Icons or inline SVG. Never import unused icons.

* * *

## SECTION 2C — DESIGN AESTHETIC & FALLBACK (defaults, always overrideable)

Default to Awwwards-quality design. Pick in order of best fit:

1. **Minimalism** (default) — whitespace, typography-focused, neutral palette, high contrast
2. **Glassmorphism** — `rgba` + `backdrop-filter: blur`
3. **Skeuomorphism** — textured, realistic depth (finance, familiar UI)
4. **Claymorphism** — soft, rounded, 3D-plastic (friendly/creative)
5. **Neo-Brutalism** — thick borders, bold, geometric
6. **Liquid Glass** — flowing shapes, soft gradients, smooth motion (premium)

Accessibility (contrast, readability) always wins.

**Transitions:** page fade+slide (`opacity .3s`, `transform .4s`); modal/overlay .25–.35s; buttons .15–.2s; list items staggered (`index * 50ms`). Keep under 500ms; respect `prefers-reduced-motion`.

**UX patterns:** skeleton screens for API >300ms (match final layout); optimistic UI (update first, revert on error); optimistic pre-loading (fail silently, no spinners); progress illusion (0→30 fast, 30→90 moderate, 90→99 slow crawl); GSAP ScrollTrigger for scroll effects; Framer Motion for hover/entrance.

**Buttons:** Primary + Ghost pairing. NEVER two primary buttons in one section.

**Hierarchy:** L1 page title/CTA 32–48px/700–900 · L2 section header 20–28px/600–700 · L3 body/labels 16px/400–500 · L4 helper 12–14px/400 muted. WCAG: body 4.5:1, helper 3:1. Never below 14px mobile / 16px desktop body.

**Spacing:** 8px grid — 4 / 8 / 16 / 24 / 32 / 48. Padding min 12px vertical, 16px horizontal. Match spacing between similar elements.

* * *

## SECTION 3 — TATEMONO FILE RULES

```
1. One .tsx file per tatemono, at tatemonos/<name>/core.tsx  (<name> = meta.name; core.tsx is always accepted)
2. TypeScript throughout (the file is DSL source — the engine slices blocks out of it)
3. Web imports live ONLY inside @arkzen:web:components, @arkzen:web:layout, @arkzen:web:animation, @arkzen:web:script blocks (and web:error:500)
4. Expo / bare-RN imports live inside @arkzen:native:components / layout / error blocks, in @arkzen:import:expo / :rn pairs
5. Lynx blocks are self-contained and import from '@lynx-js/react' themselves (pages included)
6. NO imports inside @arkzen:web:page blocks, and NO imports in Expo/RN @arkzen:native:page blocks
7. Web, Expo/RN and Lynx sections can all coexist in one core.tsx (a "dual/triple" tatemono)
8. A tatemono needs at least ONE page: web page, native page, or Lynx page (native-only and web-only are both valid)
9. Tatemono asset files go in tatemonos/<name>/assets/ (auto-copied to public)
```

### SECTION ORDER

Order is mostly free; the engine finds blocks by tag. Recommended order:

```
@arkzen:meta                         (once, always first)
@arkzen:meta:web                     (optional, once)
@arkzen:meta:native                  (optional, once)
@arkzen:web:config                   (optional, once)
@arkzen:native:config                (optional, once)
@arkzen:database[:identifier]        (REPEAT)
@arkzen:api[:identifier]             (REPEAT)
@arkzen:routes                       (optional, REPEAT)
@arkzen:endpoint:name                (REPEAT)   ← bodies for @arkzen:api methods
@arkzen:handler:name                 (REPEAT)   ← bodies for @arkzen:routes entries
@arkzen:policy:method                (optional) ← needs api policy: true
@arkzen:middleware:name              (optional, REPEAT)
@arkzen:realtime:identifier          (optional, REPEAT)
@arkzen:events:identifier            (optional, REPEAT)
@arkzen:listener:Name                (optional, REPEAT)
@arkzen:jobs:identifier              (optional, REPEAT)
@arkzen:notifications:identifier     (optional, REPEAT)
@arkzen:mail:identifier              (optional, REPEAT)
@arkzen:console:identifier           (optional, REPEAT)
--- web ---
@arkzen:web:layout:name              (optional, REPEAT)
@arkzen:web:style / :style:Name      (before OR after components)
@arkzen:web:components:identifier    (REPEAT)
@arkzen:web:page:name                (REPEAT)
@arkzen:web:error:404 / :500         (optional)
@arkzen:web:animation                (optional, once; before OR after pages)
@arkzen:web:script / :script:name    (optional)
--- native (Expo + bare RN) ---
@arkzen:native:style (global) / :style:name
@arkzen:native:layout:name
@arkzen:native:components:name
@arkzen:native:page:name
@arkzen:native:error:404 / :500
@arkzen:native:animation:expo | :rn
@arkzen:native:script:expo | :rn  [:name]
--- native (Lynx) ---
@arkzen:native:components:lynx:name / layout:lynx:name / page:lynx:name
@arkzen:native:style:lynx / :style:lynx:name
@arkzen:native:error:404:lynx / :500:lynx
@arkzen:native:animation:lynx
@arkzen:native:script:lynx [:name]
```

* * *

## ⚠️ SECTION 3D — DSL TAG FORMAT RULES (CRITICAL)

The engine runs a **DSL tag validator before parsing**. Format mistakes stop the build with "ARKZEN DSL ERROR" (line number + fix). There are four block shapes.

### SHAPE A — YAML-only blocks: NO `*/` on the opening line, closed by a bare `*/` line. No `:end`.

```
/* @arkzen:meta
/* @arkzen:meta:web
/* @arkzen:meta:native
/* @arkzen:web:config
/* @arkzen:native:config
/* @arkzen:database[:identifier]
/* @arkzen:api[:identifier]
/* @arkzen:routes
```

```
/* @arkzen:database:products
table: products
...
*/
```

### SHAPE B — YAML-in-comment + body blocks: YAML inside the opening comment, `*/` closes it, code/body follows, then `:end */`.

```
/* @arkzen:jobs:process-data
queue: default
tries: 3
*/
public function handle(): void { ... }
/* @arkzen:jobs:process-data:end */
```

Used by: `jobs`, `console`, `notifications`, `mail`, `events`, `realtime`, and `web:layout` / `native:layout` when a `parent:` key is needed. **Always write `:end`** for these — bodies need it, and some tags are not enforced by the validator but are still required for bodies to be read.

### SHAPE C — Code blocks: MUST have `*/` on the SAME opening line, closed by `:end */`.

```
/* @arkzen:web:components:shared */          /* @arkzen:web:components:shared:end */
/* @arkzen:web:layout:app */                 /* @arkzen:web:layout:app:end */
/* @arkzen:web:page:index */                 /* @arkzen:web:page:index:end */
/* @arkzen:web:style */  /* @arkzen:web:style:Name */
/* @arkzen:web:animation */   /* @arkzen:web:script */   /* @arkzen:web:script:name */
/* @arkzen:web:error:404 */   /* @arkzen:web:error:500 */
/* @arkzen:native:components:shared */   /* @arkzen:native:layout:app */
/* @arkzen:native:page:index */          /* @arkzen:native:style */  /* @arkzen:native:style:name */
/* @arkzen:native:error:404 */           /* @arkzen:native:error:500 */
/* @arkzen:native:animation:expo | :rn | :lynx */
/* @arkzen:native:script:expo | :rn | :lynx */   /* @arkzen:native:script:expo:name */
/* @arkzen:native:components:lynx:shared */  /* @arkzen:native:layout:lynx:name */
/* @arkzen:native:page:lynx:index */         /* @arkzen:native:style:lynx */
/* @arkzen:native:error:404:lynx */          /* @arkzen:native:error:500:lynx */
```

### SHAPE D — Body-separator blocks: opening tag has NO `*/`; the **next line must be exactly `*/`**; then body; then `:end */`.

```
/* @arkzen:endpoint:my_endpoint
*/
$result = $code->here();
return response()->json($result);
/* @arkzen:endpoint:my_endpoint:end */
```

Used by: `endpoint`, `handler`, `middleware`, `policy`, `listener`.

### Inline declarations (no `:end`)

```
/* @arkzen:web:page:layout:+auth */            ← layout line, immediately after a web page opener
/* @arkzen:native:page:layout:app */           ← same for native pages
/* @arkzen:native:page:lynx:layout:app */      ← same for Lynx pages
```

### Dual-target import pairs (Expo / bare RN) — see Section 23B

```
/* @arkzen:import:expo */ ... /* @arkzen:import:expo:end */
/* @arkzen:import:rn   */ ... /* @arkzen:import:rn:end   */
```

* * *

## SECTION 3A — IMPORT PLACEMENT

| Block                                        | Imports? |
|----------------------------------------------|----------|
| `web:components:*`                           | ✅ YES   |
| `web:layout:*`                               | ✅ YES   |
| `web:animation`                              | ✅ YES (gsap / framer only) |
| `web:script`, `web:script:name`              | ✅ YES (any npm package) |
| `web:page:*`                                 | ❌ NO    |
| `web:error:404`                              | ❌ NO — engine injects React |
| `web:error:500`                              | ✅ YES — needs `'use client'` |
| `native:components:*` / `native:layout:*` / `native:error:*` (Expo/RN) | ✅ YES — inside `@arkzen:import:expo/rn` pairs |
| `native:page:*` (Expo/RN)                    | ❌ NO — uses what components/styles export |
| `native:animation:*`, `native:script:*`      | ✅ YES   |
| `native:*:lynx:*` (all Lynx blocks, pages too)| ✅ YES — from `@lynx-js/react`, `@lynx-js/motion` |
| `endpoint`, `handler`, `middleware`, `policy`, `listener`, `jobs`, `console` | ❌ NO — PHP only |

## SECTION 3B — `'use client'` (WEB ONLY)

- Top of `web:components`, `web:layout`, `web:error:500` blocks: ✅ write it
- Never in `web:page`, `web:animation`, `web:error:404`
- Never in any native or Lynx block

## SECTION 3C — ZUSTAND STORES

Define stores directly inside `web:components` blocks. Always `export` them.

```ts
export const useAppStore = create<AppState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))
```

## ⚠️ SECTION 3E — NULL SAFETY

```ts
// ✅ guard at component level
if (!data || !data.items) return <Loader2 size={24} />
// ✅ double optional chain for nested objects
status?.queue?.name ?? 'Default'
// ❌ crashes if queue is undefined
status?.queue.name
```

## SECTION 3F — LOCALSTORAGE SAFETY

Always `try/catch` around `JSON.parse`, validate required fields, and `removeItem` on bad data. Web only — never use localStorage in native/Lynx blocks.

* * *

## SECTION 4 — AUTH

```
/* @arkzen:meta
name: my-app
auth: true
*/
```

- `auth: true` generates, per tatemono: an isolated `users` table, a token table, a user model, an auth controller with injected routes, and Sanctum tokens. Notification infrastructure is added only if the tatemono has `@arkzen:notifications` blocks.
- `auth: false` — no auth; all pages public.
- Page guards: `layout:+auth` (requires login) and `layout:+guest` (login/register pages). Plain `layout:auth` / `layout:guest` still work.
- Seed users with `auth_seed` in `@arkzen:meta` (Section 5). Passwords are hashed; seeding is idempotent.
- Roles: a `role` column on the users table (`admin`, `user`, ...). Role-gated routes use middleware `[auth, role:admin]` (the engine generates a scoped `CheckRole`).
- Frontend: `useAuthStore` and `arkzenFetch` from `@/arkzen/core/stores/authStore`.

* * *

## SECTION 5 — @arkzen:meta

```
/* @arkzen:meta
name: my-app                    # REQUIRED, slug (kebab-case); must match folder name
version: 1.0.0                  # default 1.0.0
description: Optional description
auth: false                     # default false
dependencies: []                # optional string[]
auth_seed:                      # optional — requires auth: true
  users:
    - name: Admin User
      email: admin@my-app.com
      password: password123
      role: admin               # default 'user'
*/
```

`favicon` and `pwa` inside `@arkzen:meta` are **deprecated** (warning only) — move them to `@arkzen:meta:web`.

## SECTION 5B — @arkzen:meta:web

All fields optional. Web only.

```
/* @arkzen:meta:web
title: My App — Tagline          # <title>; defaults to label ?? name
label: My App                    # human name (nav, PWA name fallback)
description: SEO description.
favicon: ☕                      # emoji, URL or path
og:
  title: My App
  description: Share text
  image: /tatemonos/my-app/assets/images/og.png
  url: https://example.com
  type: website
twitter:
  card: summary_large_image
  title: My App
  description: Share text
  image: /tatemonos/my-app/assets/images/og.png
pwa:
  name: MyApp
  short_name: App
  description: ...
  theme_color: "#0f0f1a"
  background_color: "#0f0f1a"
  display: standalone            # standalone | fullscreen | minimal-ui | browser
  orientation: any               # portrait | landscape | any
  start_url: /my-app             # default /<name>
  offline: true                  # default true
  icons:
    - { src: /tatemonos/my-app/icon-192.png, sizes: 192x192, type: image/png }
    - { src: /tatemonos/my-app/icon-mask.png, sizes: 512x512, type: image/png, purpose: maskable }
*/
```

## SECTION 5C — @arkzen:meta:native

Required when the tatemono has native screens. Only the `expo:` section is read today.

```
/* @arkzen:meta:native
label: My App
description: Short description
expo:
  bundle_id: com.company.myapp
  scheme: myapp
  version: 1.0.0
  icon: ./assets/icon.png
  orientation: portrait          # portrait | landscape | default
  status_bar_style: dark         # default | light-content | dark-content | dark | light
  permissions: [CAMERA, ACCESS_FINE_LOCATION]
  splash:
    image: ./assets/splash.png
    background_color: "#ffffff"
    resize_mode: contain
*/
```

* * *

## SECTION 6 — @arkzen:web:config

Optional UI defaults for the built-in Toast / Modal / Table / Breadcrumb / Dialog and layout wrappers.

```
/* @arkzen:web:config
toast:
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
breadcrumb: { separator: "/", style: muted }
dialog: { size: md, animation: scale }
layout:
  guest:
    className: "my-root"
    container: "max-w-md mx-auto"
  auth:
    className: "min-h-screen"
  app:                           # any custom layout name works too
    className: "app-root"
*/
```

PWA config now belongs in `@arkzen:meta:web`, not here.

## SECTION 6B — @arkzen:native:config

Theme tokens for native screens. The engine generates a constants object `C` available across native blocks (`C.primary`, `C.bg`, ...). Custom keys allowed; `fonts` supported.

```
/* @arkzen:native:config
theme:
  primary: "#6366f1"
  background: "#fafaf9"
  surface: "#ffffff"
  text: "#0f172a"
  muted: "#94a3b8"
fonts:
  heading: Inter_700Bold
*/
```

* * *

## SECTION 7 — @arkzen:database

**One block = one table. Only the dict format is parsed.** (The older multi-table `tables:` array format is NOT parsed — a block without `table:` is silently skipped.) Declare as many `@arkzen:database:<identifier>` blocks as you need.

```
/* @arkzen:database:products
table: products                  # plural snake_case; REQUIRED
timestamps: true                 # default true
softDeletes: false               # default false
columns:                         # REQUIRED
  id:
    type: integer
    primary: true
    autoIncrement: true          # primary + autoIncrement → $table->id()
  name:
    type: string
    length: 255
    nullable: false
  price:
    type: decimal
    precision: 8
    scale: 2
  status:
    type: string
    default: active
  category_id:
    type: foreignId
    foreign: my_app_categories.id   # see Section 7D
    nullable: false
    onDelete: cascade            # default cascade
indexes:
  - { columns: [status, category_id], unique: false }
seeder:
  count: 3
  data:
    - name: "Product One"
      price: "99.99"
      status: active
*/
```

**Valid column types:** `integer, bigInteger, string, text, longText, decimal, float, boolean, date, datetime, timestamp, json, uuid`, plus the marker `foreignId` used together with `foreign:`.

**Column keys:** `type, length, nullable, default, unique, primary, autoIncrement, foreign, onDelete, precision, scale, unsigned`.

**`type: enum` is NOT supported.** The migration builder turns unknown types into `string` and ignores `values:`. Use `type: string` + `default:` and enforce allowed values with validation (`in:active,inactive`).

`uuid` + `primary: true` → UUID primary key.

**Updating a table:** when the table already exists, the engine writes an *update migration* adding only **new columns**. It does not alter or drop existing columns — to change a column type, drop the table's database file (or table) and rebuild.

## ⚠️ SECTION 7B — RELATIONSHIPS

Engine auto-generates `belongsTo` / `hasMany` from `foreign:` columns. Never write them by hand. Migrations are topologically sorted by foreign-key dependencies (parents first); circular dependencies are an error.

## ⚠️ SECTION 7C — SEEDERS

Seed parents only when children can reference known ids. Do not seed a child table whose `foreignId` points at rows that may not exist yet. Tables created at runtime (tickets, orders, logs) normally need **no seeder**.

## ⚠️ SECTION 7D — TABLE PREFIX & `foreign:` (CRITICAL)

Every table is created with the tatemono slug as prefix: `{slug_with_underscores}_{table}` (`queue-flow` + `tickets` → `queue_flow_tickets`). Models stay unprefixed (`Ticket`). The migration builder uses the `foreign:` value **literally** as the real table name:

```yaml
# ✅ queue-flow (works) — use the PREFIXED table name
queue_id:
  type: foreignId
  foreign: queue_flow_queues.id
```

See "Known engine quirks" about `dtr-geofencing` (unprefixed `employees.id`) and automatic relationship methods.

* * *

## SECTION 8 — @arkzen:api

```
/* @arkzen:api:products
model: Product                   # REQUIRED, PascalCase, matches table (Product ↔ products)
controller: ProductController    # REQUIRED, must end with "Controller", unique per tatemono
prefix: /api/my-app/products     # REQUIRED, must start with /api/
middleware: []                   # e.g. [auth] or [auth, role:admin] or custom [requireJson]
resource: true                   # generate API Resource class
policy: false                    # true → PolicyBuilder + $this->authorize() wiring
factory: false
endpoints:
  index:
    method: GET
    route: /
    description: List products   # description REQUIRED on every endpoint
    query:
      search: string
      per_page: integer|default:15
    response:
      type: paginated
  store:
    method: POST
    route: /
    description: Create a product
    validation:
      name: required|string|max:255
    response:
      type: single
  show:    { method: GET,    route: /{id}, description: Get a product,    response: { type: single } }
  update:  { method: PUT,    route: /{id}, description: Update a product, validation: { name: sometimes|string }, response: { type: single } }
  destroy:
    method: DELETE
    route: /{id}
    description: Delete a product
    response:
      type: message
      value: Product deleted
*/
```

**Response types:** `paginated`, `collection`, `array` (index only; plain list), `single`, `message` (with `value:`). Optional `resource:` name.

**Standard method names** map to generated CRUD: `index`, `show`, `store`, `update`, `destroy`. **Any other endpoint name** is a *custom method* — it gets a stub unless you provide an `@arkzen:endpoint:<name>` body.

### Special endpoint `type:` values (set on the endpoint, next to `method`)

| Endpoint name | `type:`                | Generates |
|---------------|------------------------|-----------|
| `index`       | `upload_index`         | list uploaded files |
| `store`       | `upload`               | multipart upload (validation `files: required|array`, `files.*: file|max:10240`) |
| `destroy`     | `upload_destroy`       | delete record + file |
| `fileUrl`     | `upload_url`           | public/download URL for a file |
| `store`       | `broadcast`            | save then `broadcast()` on the realtime channel (also drives the Lynx SSE bridge) |
| `store`       | `mail_send`            | send a `@arkzen:mail` mailable; declare `mail`, `to`, optional `data` in `validation:` |
| `store`       | `notification_trigger` | `$user->notify()` a `@arkzen:notifications` class; declare `notification` in `validation:` |
| `store`/`run` | `command_run`          | run an Artisan command **(hardcoded map — test tatemonos only)** |
| `store`       | `job_dispatch`         | dispatch a job **(hardcoded map — test tatemonos only)** |
| `store`       | `event_fire`           | fire an event **(hardcoded map — test tatemonos only)** |

For your own jobs / events / commands, **do not** use `command_run | job_dispatch | event_fire` — write a custom endpoint with an `@arkzen:endpoint:<name>` body (or an `@arkzen:routes` handler) that dispatches them.

### Role endpoint names (generate role-specific methods)

`me`, `adminOnly`, `userOnly`, `promote`, `demote` — used with `auth: true` and role middleware (see `roles-test`).

* * *

## SECTION 9 — @arkzen:routes (custom routes, no model needed)

```
/* @arkzen:routes
controller: QueueController
middleware: []
routes:
  - method: POST
    route: /api/my-app/join
    handler: join_queue
  - method: GET
    route: /api/my-app/status/{queue_id}
    handler: queue_status
*/
```

Multiple `@arkzen:routes` blocks allowed (one controller each). Controller defaults to `CustomController`. Route params arrive as `$params[0]`, `$params[1]`, … in handler bodies (**not** `$request->route('name')`).

## ⚠️ SECTION 9B — @arkzen:handler:name

PHP body for a route entry. Shape D (`*/` on the next line).

```
/* @arkzen:handler:join_queue
*/
$queueId = $request->input('queue_id');
$ticket = \App\Models\Arkzen\MyApp\Ticket::create([...]);
return response()->json(['ticket' => $ticket]);
/* @arkzen:handler:join_queue:end */
```

Models live at `\App\Models\Arkzen\{SlugNamespace}\{Model}` (slug PascalCased: `queue-flow` → `QueueFlow`).

| Scenario                                          | Use                     |
|---------------------------------------------------|-------------------------|
| Custom logic inside an `@arkzen:api` method       | `@arkzen:endpoint:name` |
| Body for an `@arkzen:routes` entry                | `@arkzen:handler:name`  |

## SECTION 9C — @arkzen:policy:method

Requires `policy: true` on the api. Supported methods: `update`, `delete`. Body has `$user` and the model instance (named after the model, e.g. `$item`/`$product` — see `crud-test`).

```
/* @arkzen:policy:update
*/
if ($item->status === 'archived') { return false; }
return true;
/* @arkzen:policy:update:end */
```

## SECTION 10 — @arkzen:middleware:name

Declare in `middleware: [name]` on an api/routes block; the body becomes `handle()`. The alias is registered automatically. Include `return $next($request);`.

```
/* @arkzen:middleware:requireJson
*/
if (!$request->isJson()) {
    return response()->json(['message' => 'Content-Type: application/json required'], 415);
}
return $next($request);
/* @arkzen:middleware:requireJson:end */
```

## SECTION 18 — @arkzen:endpoint:name

Body for an `@arkzen:api` method (the method name must exist in the api block).

```
/* @arkzen:endpoint:index
*/
$query = \App\Models\Arkzen\MyApp\Item::query()->orderBy('created_at', 'desc');
return response()->json($query->paginate($request->get('per_page', 15)));
/* @arkzen:endpoint:index:end */
```

* * *

## ⚠️ SECTION 11 — @arkzen:realtime:identifier (Reverb)

Two uses, decided by the `channel:` key. Always close with `:end`.

```
# 1) Channel registration (NO channel: key) → channels.php
/* @arkzen:realtime:my-app.{id}
type: private
*/
/* @arkzen:realtime:my-app.{id}:end */

/* @arkzen:realtime:queue-flow-public
type: public
*/
/* @arkzen:realtime:queue-flow-public:end */

# 2) Broadcast event (HAS channel: key) → ShouldBroadcast class
/* @arkzen:realtime:queue-updated
channel: queue-flow.{queueId}
type: public
*/
/* @arkzen:realtime:queue-updated:end */
```

Fire from PHP (handlers / endpoints / listeners):

```php
broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([...]))->toOthers();
// namespace: \App\Events\Arkzen\{SlugNamespace}\Broadcast\{ClassName}
```

Private channels with `{id}` generate events that take a user id and build the channel name dynamically.

**Lynx bridge:** Lynx has no WebSocket. When a tatemono has realtime blocks **and** an api endpoint with `type: broadcast`, the engine also generates `SseController` + `GET /api/{slug}/sse/{channelType}` for Lynx. Web/Expo keep using Reverb.

## SECTION 12 — @arkzen:events:identifier

YAML in the opening comment; `listeners:` names the listener classes. Close with `:end`. No body.

```
/* @arkzen:events:user-signed-up
listeners: [SendWelcomeEmail, UpdateUserStats]
*/
/* @arkzen:events:user-signed-up:end */
```

Event class: `\App\Events\Arkzen\{SlugNs}\{StudlyName}` (e.g. `UserSignedUp`). Fire with `event(new \App\Events\Arkzen\EventsTest\UserSignedUp($payload));`.

## SECTION 13 — @arkzen:listener:Name (singular!)

Body of the listener's `handle($event)` — **only the method body**, not a class. Shape D. If no body is given the engine generates a log-and-record stub (it inserts into the tatemono's `event_log` table).

```
/* @arkzen:listener:SendWelcomeEmail
*/
\Mail::to($event->data['email'] ?? '')->send(new \App\Mail\Arkzen\MyApp\WelcomeMail($event->data));
/* @arkzen:listener:SendWelcomeEmail:end */
```

> Legacy: `events-test` also contains plural `@arkzen:listeners:Name */ class ... { }` blocks with full PHP classes. The parser only reads the singular `@arkzen:listener:` form for bodies — write the singular form.

## SECTION 14 — @arkzen:jobs:identifier

YAML (`queue`, `tries`, `timeout`) inside the opening comment; the body is the **whole `handle()` method**. Close with `:end`. Queue worker is started by `start.js`.

```
/* @arkzen:jobs:process-data
queue: default
tries: 3
timeout: 60
*/
public function handle(): void
{
    \App\Models\Arkzen\MyApp\Result::create(['status' => 'done']);
}
/* @arkzen:jobs:process-data:end */
```

Job class namespace: `\App\Jobs\Arkzen\{SlugNs}\{Studly}Job` (e.g. `ProcessDataJob`). Dispatch from your own endpoint: `dispatch(new \App\Jobs\Arkzen\MyApp\ProcessDataJob());`.

## SECTION 15 — @arkzen:notifications:identifier

YAML inside the opening comment. Close with `:end`. Optional PHP body between `*/` and `:end` replaces the generated `toMail()` body.

```
/* @arkzen:notifications:mail-ping
channels: [mail]                 # database | mail | broadcast (combine freely)
message: "This is a test mail notification"
subject: "Mail Ping"
*/
/* @arkzen:notifications:mail-ping:end */

/* @arkzen:notifications:broadcast-ping
channels: [broadcast, database]
channel_type: private            # private | public
message: "Real-time notification!"
subject: "Broadcast Ping"
*/
/* @arkzen:notifications:broadcast-ping:end */
```

Class: `\App\Notifications\Arkzen\{SlugNs}\{Studly}Notification`. Requires `auth: true` for private/user notifications. Trigger via an api endpoint with `type: notification_trigger`.

## SECTION 16 — @arkzen:mail:identifier

YAML inside the opening comment (`subject`, `data:` = field → type). Close with `:end`. Optional Blade/HTML body between `*/` and `:end` becomes the email view.

```
/* @arkzen:mail:welcome-mail
subject: "Welcome to My App"
data:
  username: string
  app_name: string
*/
<h1>Welcome, {{ $username }}!</h1>
<p>Thanks for joining {{ $app_name }}.</p>
/* @arkzen:mail:welcome-mail:end */
```

Class: `\App\Mail\Arkzen\{SlugNs}\{Studly}Mail` (`welcome-mail` → `WelcomeMailMail`: the engine appends `Mail` to the studly name — keep identifiers short, e.g. `welcome`). Trigger via an api endpoint with `type: mail_send`.

## SECTION 17 — @arkzen:console:identifier (Artisan + scheduler)

YAML (`signature`, `description`, `schedule`) in the opening comment; body is the **whole `handle(): int` method**. `schedule` is a quoted cron string and is auto-registered with the scheduler. Close with `:end`.

```
/* @arkzen:console:cleanup-temp
signature: my-app:cleanup-temp
description: Deletes temporary files older than 24h
schedule: '0 * * * *'
*/
public function handle(): int
{
    $this->info('[my-app] cleanup running');
    \Storage::deleteDirectory('temp');
    return Command::SUCCESS;
}
/* @arkzen:console:cleanup-temp:end */
```

`signature` defaults to `{slug}:{name}`. Do **not** use `command:` (v10 doc was wrong).

* * *

## SECTION 19 — @arkzen:web:layout:name

Custom named layout wrapper for web pages.

```
/* @arkzen:web:layout:app */

'use client'

import React from 'react'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
import { Home, Settings } from 'lucide-react'

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router   = useArkzenRouter()
  const pathname = useArkzenPathname()
  return <div style={{ minHeight: '100vh' }}><main>{children}</main></div>
}

/* @arkzen:web:layout:app:end */
```

**Rules:** export `<PascalName>Layout` (`app` → `AppLayout`); `'use client'` required; use `useArkzenRouter()` / `useArkzenPathname()` (never stack-specific routers); a layout cannot import from `web:components`.

### Layout nesting

A layout may declare `parent:` (Shape B — YAML inside the opening comment, then `*/`):

```
/* @arkzen:web:layout:panel
parent: shell
*/

'use client'
import React from 'react'
export const PanelLayout = ({ children }: { children: React.ReactNode }) => <div className="flex">{children}</div>

/* @arkzen:web:layout:panel:end */
```

The engine walks parent links outermost → innermost (`shell > panel > modal`), and throws on cycles.

**Page layout declarations** (line directly after the page opener):

| Declaration            | Meaning |
|------------------------|---------|
| `layout:app`           | custom layout `app` (plus its parent chain) |
| `layout:guest` / `layout:auth` | built-in guards (compat) |
| `layout:+auth`         | auth guard, no custom layout |
| `layout:+guest`        | guest guard, no custom layout |
| `layout:+auth:panel`   | auth guard + custom layout chain `panel` |
| `layout:+guest:shell`  | guest guard + custom layout chain `shell` |

Only ONE chained name is allowed after the guard (`+auth:panel`, not `+auth:a:b`). A page with no layout line defaults to `guest`. Using an undefined layout name is an error. See `layout-test` for every combination.

* * *

## SECTION 20 — @arkzen:web:style & @arkzen:web:style:Name

Global stylesheet and per-component **CSS Modules**. Can appear before or after components (or be omitted entirely).

```
/* @arkzen:web:style */
.my-btn { transition: all .3s ease; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
/* @arkzen:web:style:end */

/* @arkzen:web:style:ProductCard */
.card { border-radius: 12px; }
/* @arkzen:web:style:ProductCard:end */
```

Inside CSS (not inline-style objects) use real CSS property names (`background-position`, not `backgroundPosition`).

* * *

## SECTION 21 — @arkzen:web:page:name

```
/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:+auth */

const DashboardPage = () => {
  const [data, setData] = useState(null)
  return <div>...</div>
}

/* @arkzen:web:page:dashboard:end */
```

- Opening tag with `*/` on the same line; layout declaration on the NEXT line
- NO imports, NO `'use client'`, NO `export default` — everything comes from `web:components`
- Component name: `<PageName>Page` PascalCase (`IndexPage`, `JobDatabasePage`)
- Page name → route `/<tatemono>/<page>`; `index` = the tatemono root

## ⚠️ SECTION 22 — web:error:404 / web:error:500

```
/* @arkzen:web:error:404 */

const NotFoundPage = () => (<div>404 — Page not found</div>)

/* @arkzen:web:error:404:end */

/* @arkzen:web:error:500 */

'use client'

function ServerErrorPage({ reset }: { reset: () => void }) {
  return <button onClick={reset}>Try Again</button>
}

/* @arkzen:web:error:500:end */
```

404: component `NotFoundPage`, no imports/`'use client'`/`export default`. 500: component `ServerErrorPage({ reset })`, includes `'use client'`, no `export default`. These generate segment-scoped error files, not routed pages.

## SECTION 23 — @arkzen:web:components:identifier

```
/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { create } from 'zustand'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// Types, stores, utilities, components

/* @arkzen:web:components:shared:end */
```

Multiple blocks share one file scope: import icons/hooks only in the FIRST block; later blocks still start with `'use client'` and their own `import React`.

## SECTION 24 — @arkzen:web:animation

```
/* @arkzen:web:animation */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

const queueFlowAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
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
}

/* @arkzen:web:animation:end */
```

- Main function: **no `export`**, named `camelCase(tatemono-name) + Animations`
- `pageVariants`: **keep `export const`**
- GSAP target classes must exist on rendered elements
- **Pinned ScrollTrigger:** never also tween `opacity`/`transform` on children of a pinned element (they vanish on refresh). Animate on mount with `clearProps: 'opacity,transform'`, use `invalidateOnRefresh: true`, and `requestAnimationFrame(() => ScrollTrigger.refresh())` after pin setup.

## SECTION 24C/D — @arkzen:web:script / @arkzen:web:script:name

Pure-TypeScript helper blocks (Three.js factories, constants). No JSX; all exports use `export`.

```
/* @arkzen:web:script */
export const Colors = { primary: '#a78bfa' }
/* @arkzen:web:script:end */

/* @arkzen:web:script:three-scene */
import * as THREE from 'three'
export function makeScene(canvas: HTMLCanvasElement) { /* ... */ }
/* @arkzen:web:script:three-scene:end */
```

Generated files: `<name>.scripts.ts` and `<name>.<block>.script.ts`; import path `@/arkzen/generated/<file-without-.ts>`. The old unprefixed `@arkzen:script` is gone — always `web:script`.

## SECTION 25 — ASSETS

`tatemonos/<name>/assets/{images,svg,fonts,icons,audio,data}/` → copied to public. Web reference: `/tatemonos/<name>/assets/<category>/<file>`.

* * *

# NATIVE DSL — EXPO, BARE REACT NATIVE, LYNX

Native blocks live in the same `core.tsx` (after the web blocks, or standalone for a native-only tatemono). There are **three native targets**, each with its own rules:

| Target        | Stack dir        | Block family                         | Imports |
|---------------|------------------|--------------------------------------|---------|
| Expo          | `expo`           | `@arkzen:native:*` + `@arkzen:import:expo` pairs | inside `import:expo` pairs |
| Bare RN       | `react-native`   | `@arkzen:native:*` + `@arkzen:import:rn` pairs   | inside `import:rn` pairs   |
| Lynx          | `lynx`           | `@arkzen:native:*:lynx:*` (self-contained)       | inside the block itself    |

The engine runs once per active stack and keeps only what matches that stack. Expo and bare RN **share** the same block names and are separated only by the import pairs; Lynx has its own block names and never uses import pairs.

* * *

## SECTION 23B — Expo / bare RN: `@arkzen:import:expo` & `@arkzen:import:rn`

Inside a `native:components`, `native:layout`, `native:page` or `native:error` block you may write dual-target import pairs (both have `:end`):

```
/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
/* @arkzen:import:rn:end */

export const Badge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-indigo-600">{label}</Text>
  </View>
)

/* @arkzen:native:components:shared:end */
```

**Resolution rules (done by the parser for the active stack):**

- The pair matching the active stack is kept (markers stripped); the other pair is **deleted entirely** (markers + body).
- Code outside any pair is kept for both targets.
- A block may contain several pairs side by side (e.g. one pair for imports, another wrapping a stack-specific handler).
- A block whose only import pair belongs to the other stack is dropped for this stack. This is how you write **one error block per target** (see below).
- Expo uses `expo-router` (`useRouter`, `usePathname`); bare RN has no expo-router — put router code in the `expo` pair only, or write RN-specific navigation in the `rn` pair.

Always available in native component scope: `React` hooks, RN primitives (`View, Text, TouchableOpacity, Pressable, ScrollView, FlatList, Image, StyleSheet, RefreshControl, TextInput, ActivityIndicator`), `SafeAreaView` from `react-native-safe-area-context`, and `useRouter, usePathname` from `expo-router` (Expo). Animation (optional): `react-native-reanimated`, `moti`.

> `validate.js` (advisory CLI) still demands an import DSL on every native page and rejects pages that work fine. Trust the parser's DSL errors over that script for native.

* * *

## SECTION 19B — @arkzen:native:layout:name (Expo / bare RN)

```
/* @arkzen:native:layout:app */

/* @arkzen:import:expo */
import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, usePathname } from 'expo-router'
/* @arkzen:import:expo:end */

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView edges={['top']}>{/* header */}</SafeAreaView>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  )
}

/* @arkzen:native:layout:app:end */
```

Export `<PascalName>Layout`. Nesting works like web: `parent:` in the opening comment (Shape B):

```
/* @arkzen:native:layout:tab-panel
parent: app-shell
*/
```

**Page layout declarations** (line right after the page opener): `layout:default` (engine SafeAreaView wrapper, **the default**), `layout:guest`, `layout:auth`, `layout:+auth`, `layout:+guest`, `layout:app` (your own named layout), `layout:+auth:tab-panel`, `layout:+guest:app` — same chain rules as web.

## SECTION 20B — native styles

Two forms, both Shape C:

```
/* @arkzen:native:style */                       ← GLOBAL (v10.6): CSS-like rules, engine converts/wraps them
:root {
  --color-primary: #2563eb;
  --radius-default: 0.75rem;
}
.arkzen-btn {
  background-color: var(--color-primary);
  border-radius: var(--radius-default);
  padding-horizontal: 24px;
}
/* @arkzen:native:style:end */

/* @arkzen:native:style:shared */                ← NAMED: full StyleSheet export
import { StyleSheet } from 'react-native'
export const S = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
})
/* @arkzen:native:style:shared:end */
```

Named blocks export their own constant (`S`, `HeroS`, …), merged into the generated `.native-styles.ts`, and are available in native pages/components without importing. The global block is CSS-like (see `new-updates-styles`); named blocks are TypeScript `StyleSheet.create` exports (see `shan-shan`).

## SECTION 21B — @arkzen:native:page:name (Expo / bare RN)

```
/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:default */

const IndexScreen = () => {
  const router = useRouter()
  return (
    <View className="flex-1 bg-neutral-50 px-6 pt-14">
      <Text className="text-4xl font-bold">Hello, Native 👋</Text>
      <PrimaryButton label="Go to About" onPress={() => router.push('/my-app/about' as any)} />
    </View>
  )
}

/* @arkzen:native:page:index:end */
```

- `*/` on the opening line; layout line directly after (omit it → `default`)
- NO imports; component name `<PageName>Screen` PascalCase; no `export default`
- NativeWind `className` for static styles, inline `style` for dynamic
- Navigate with `router.push('/<tatemono>/<page>' as any)`
- Native-only tatemonos (no web page) are valid

## SECTION 22B — @arkzen:native:error:404 / :500 (Expo / bare RN)

Generates `+not-found` / error boundary. Use **one block per target**, distinguished by the import pair:

```
/* @arkzen:native:error:404 */
/* @arkzen:import:expo */
import React from 'react'
import { View, Text } from 'react-native'
/* @arkzen:import:expo:end */

const NotFoundExpo = () => (<View className="flex-1 items-center justify-center"><Text>404</Text></View>)
/* @arkzen:native:error:404:end */

/* @arkzen:native:error:404 */
/* @arkzen:import:rn */
import React from 'react'
import { View, Text } from 'react-native'
/* @arkzen:import:rn:end */

const NotFoundRN = () => (<View className="flex-1 items-center justify-center"><Text>404</Text></View>)
/* @arkzen:native:error:404:end */
```

## SECTION 24B — native animation (stack-split)

| Tag                           | Target  | Tech |
|-------------------------------|---------|------|
| `@arkzen:native:animation:expo`  | Expo    | Reanimated / Moti |
| `@arkzen:native:animation:rn`    | bare RN | Reanimated / Moti (no longer shared with Expo) |
| `@arkzen:native:animation:lynx`  | Lynx    | `@lynx-js/motion`, CSS keyframes |

Shape C, one block per tag. Imports inside the block; exports use `export`; no JSX (pure hooks/helpers):

```
/* @arkzen:native:animation:expo */
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
export function useFadeIn() {
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return { style, start: () => { opacity.value = withTiming(1, { duration: 600 }) } }
}
/* @arkzen:native:animation:expo:end */
```

## SECTION 24E — native scripts (stack-split)

Global: `@arkzen:native:script:expo | :rn | :lynx`. Named (many): `@arkzen:native:script:expo:name | :rn:name | :lynx:name`. Shape C, `:end` closes with the full tag. Pure TypeScript helpers, imports allowed, no JSX. The old generic `@arkzen:native:script` no longer exists.

```
/* @arkzen:native:script:expo */
export const API_TIMEOUT = 8000
/* @arkzen:native:script:expo:end */
```

* * *

## SECTION 25L — LYNX BLOCKS (self-contained)

Lynx is a separate renderer (not React Native). Its blocks are all under `:lynx`, are **self-contained** (no `@arkzen:import` pairs), and carry their own imports:

| Block                                         | Notes |
|-----------------------------------------------|-------|
| `@arkzen:native:components:lynx:name`         | e.g. `shared`; imports from `@lynx-js/react` (and `@lynx-js/motion`) |
| `@arkzen:native:layout:lynx:name`             | wrapper component |
| `@arkzen:native:page:lynx:name`               | imports allowed here (unlike web/Expo pages) or in the Lynx components block; component named `<PageName>LynxPage` or `<PageName>LynxScreen` (both appear in existing tatemonos) |
| `@arkzen:native:style:lynx` / `:style:lynx:name` | global / named Lynx styles |
| `@arkzen:native:error:404:lynx` / `:500:lynx` | error screens |
| `@arkzen:native:animation:lynx`               | `@lynx-js/motion` |
| `@arkzen:native:script:lynx[:name]`           | helpers |

```
/* @arkzen:native:components:lynx:shared */

import { type ReactNode, useState } from '@lynx-js/react'

export const Card = ({ children }: { children: ReactNode }) => (<view>{children}</view>)

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:index */

import React, { useState } from '@lynx-js/react'

const IndexLynxPage = () => (
  <view className="flex-1 bg-neutral-50 px-6 pt-14">
    <text className="text-4xl font-bold">Hello Lynx</text>
  </view>
)

/* @arkzen:native:page:lynx:index:end */
```

**Page layout line for Lynx:** the parser reads `/* @arkzen:native:page:lynx:layout:<name> */`. `layout-test` writes the shorter `/* @arkzen:native:page:layout:<name> */` inside Lynx pages — see "Known engine quirks"; prefer the `lynx:layout` form.

**Lynx has no WebSocket** — live updates use SSE (auto-generated, see Section 11).

Lynx pages use `<view>` / `<text>` elements with Tailwind-preset `className`s (see `hello-native`). Copy conventions from a working tatemono (`hello-native`, `asset-hub`, `animation-lab`, `crud-test`) instead of inventing APIs; Lynx primitives differ from React Native.

* * *

## SECTION 26 — AVAILABLE IMPORTS

**Web (`web:components` / `web:layout`) — always available:**

```ts
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { create } from 'zustand'
import { arkzenFetch, useAuthStore } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'
import { Modal } from '@/arkzen/core/components/Modal'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
```

**Optional (installed):** `gsap` (+`gsap/ScrollTrigger`), `framer-motion` (`motion`, `AnimatePresence`), `three`, `matter-js`, `leaflet` (`L`), `@tiptap/react` (`useEditor`, `EditorContent`), `lucide-react`.

**Routing rule:** web layouts/components always use `useArkzenRouter()` / `useArkzenPathname()` — never `next/navigation`, React Router or TanStack imports. Native Expo uses `useRouter()` from `expo-router` directly.

* * *

## SECTION 26B — FRONTEND DATA FETCHING

`arkzenFetch(url, options)` (from `@/arkzen/core/stores/authStore`) is a thin `fetch` wrapper: it adds `Authorization: Bearer <token>` (when logged in) and JSON `Content-Type`/`Accept` headers, and **returns the raw `Response`**. You must call `await res.json()` yourself, and pass `body` as a **string**:

```ts
const res = await arkzenFetch('/api/task-board/tasks')
const d   = await res.json()
setTasks(d.data ?? [])                       // paginated responses wrap items in .data

const created = await arkzenFetch('/api/task-board/tasks', {
  method: 'POST',
  body: JSON.stringify({ title }),           // body must be JSON.stringify'd
})
if (!created.ok) { /* revert optimistic update */ }
const task = await created.json()
```

`arkzenGet<T>(url)` is also exported and returns parsed JSON directly. Always wrap calls in `try/catch` and guard the result (`d?.data ?? []`).

* * *

## SECTION 28 — COMPLETE EXAMPLES

### Example A — Minimal web + backend tatemono

```
/* @arkzen:meta
name: task-board
version: 1.0.0
description: Minimal task list
auth: false
*/

/* @arkzen:meta:web
favicon: ✅
title: Task Board
description: A tiny task board.
*/

/* @arkzen:database:tasks
table: tasks
timestamps: true
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  title:
    type: string
    length: 255
    nullable: false
  done:
    type: boolean
    default: false
seeder:
  count: 1
  data:
    - title: "First task"
      done: false
*/

/* @arkzen:api:tasks
model: Task
controller: TaskController
prefix: /api/task-board/tasks
middleware: []
resource: true
endpoints:
  index:
    method: GET
    route: /
    description: List tasks
    response:
      type: paginated
  store:
    method: POST
    route: /
    description: Create a task
    validation:
      title: required|string|max:255
    response:
      type: single
  update:
    method: PUT
    route: /{id}
    description: Update a task
    validation:
      title: sometimes|string|max:255
      done: sometimes|boolean
    response:
      type: single
  destroy:
    method: DELETE
    route: /{id}
    description: Delete a task
    response:
      type: message
      value: Task deleted
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

export type TaskItem = { id: number; title: string; done: boolean }

export const useTasks = () => {
  const [tasks, setTasks] = useState<TaskItem[] | null>(null)
  const load = async () => {
    try {
      const res = await arkzenFetch('/api/task-board/tasks')
      const d = await res.json()
      setTasks(d?.data ?? [])
    } catch { setTasks([]) }
  }
  useEffect(() => { load() }, [])
  return { tasks, load }
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => {
  const { tasks, load } = useTasks()
  const [title, setTitle] = useState('')
  const add = async () => {
    if (!title.trim()) return
    await arkzenFetch('/api/task-board/tasks', { method: 'POST', body: JSON.stringify({ title }) })
    setTitle('')
    load()
  }
  if (!tasks) return <Loader2 size={24} />
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-3xl font-bold">Task Board</h1>
      <div className="mt-4 flex gap-2">
        <input value={title} onChange={e => setTitle(e.target.value)} className="flex-1 border rounded px-3 py-2" />
        <button onClick={add} className="px-4 py-2 rounded bg-black text-white"><Plus size={16} /></button>
      </div>
      <ul className="mt-6 space-y-2">
        {tasks.map(t => <li key={t.id} className="border rounded p-3">{t.title}</li>)}
      </ul>
    </main>
  )
}

/* @arkzen:web:page:index:end */
```

### Example B — Native-only tatemono (Expo + bare RN, `hello-native` shape)

```
/* @arkzen:meta
name: hello-native
version: 1.0.0
description: Native-only starter.
auth: false
*/

/* @arkzen:meta:native
label: Hello Native
expo:
  bundle_id: com.arkzen.hellonative
  scheme: hellonative
  version: 1.0.0
  orientation: portrait
  status_bar_style: dark
*/

/* @arkzen:native:config
theme:
  primary: "#6366f1"
  background: "#fafaf9"
*/

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
/* @arkzen:import:rn:end */

export const PrimaryButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} className="rounded-2xl py-4 px-6 items-center bg-indigo-500">
    <Text className="text-white font-semibold">{label}</Text>
  </TouchableOpacity>
)

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:default */

const IndexScreen = () => {
  const router = useRouter()
  return (
    <View className="flex-1 bg-neutral-50 px-6 pt-14">
      <Text className="text-4xl font-bold">Hello, Native 👋</Text>
      <PrimaryButton label="Go to About" onPress={() => router.push('/hello-native/about' as any)} />
    </View>
  )
}

/* @arkzen:native:page:index:end */
```

(For a Lynx build of the same app add `native:components:lynx:shared` and `native:page:lynx:index` blocks — see `hello-native` for the full triple-target file.)

### Example C — Auth app with roles

```
/* @arkzen:meta
name: my-admin
version: 1.0.0
auth: true
auth_seed:
  users:
    - { name: Admin, email: admin@my-admin.com, password: password123, role: admin }
    - { name: User,  email: user@my-admin.com,  password: password123, role: user }
*/

/* @arkzen:api:reports
model: Report
controller: ReportController
prefix: /api/my-admin/reports
middleware: [auth, role:admin]
resource: true
endpoints:
  index: { method: GET, route: /, description: List reports, response: { type: paginated } }
*/

/* @arkzen:web:page:login */
/* @arkzen:web:page:layout:+guest */
const LoginPage = () => <div>login form → useAuthStore</div>
/* @arkzen:web:page:login:end */

/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:+auth */
const DashboardPage = () => <div>protected</div>
/* @arkzen:web:page:dashboard:end */
```

* * *

## ⚠️ SECTION 28B — KNOWN ENGINE QUIRKS (verify after building)

These come from reading the engine source. They are not hypothetical — but test them in your build before relying on them, and fix the engine or the doc when resolved.

1. **`foreign:` prefix vs auto relations.** The migration builder uses `foreign:` literally as the table name, so a real FK constraint needs the **prefixed** name (`queue_flow_queues.id`, as `queue-flow` does). The model builder, however, matches `foreign:` against the *raw* table name when generating `belongsTo`/`hasMany`. With prefixed references the auto-generated relation methods may be missing or oddly named. `dtr-geofencing` uses unprefixed `employees.id` instead. Check generated models/migrations after the first build.
2. **`validate.js` / `validator.ts` is advisory and out of date.** It rejects `foreignId` and `enum` as unknown types, and it demands `@arkzen:import:*` on native pages that actually build fine. The DSL tag validator inside the parser is the real gate.
3. **`command_run`, `job_dispatch`, `event_fire` endpoint types are hardcoded** to the test tatemonos' command/job/event names. Use custom endpoint bodies for real apps.
4. **Plural `@arkzen:listeners:` blocks (legacy)** in `events-test` are not read; bodies come from singular `@arkzen:listener:`.
5. **Lynx page layout line.** Parser: `@arkzen:native:page:lynx:layout:<name>`. `layout-test` uses `@arkzen:native:page:layout:<name>` in Lynx pages.
6. **Mail/notification/job class names append a suffix** to the studly identifier (`welcome-mail` → `WelcomeMailMail`). Prefer short identifiers (`welcome`).
7. **`type: enum`** appears in `queue-flow` but is silently a `string` column; `values:` is ignored.
8. **Update migrations add new columns only** — they never alter or drop existing columns.
9. **Tag regex accepts a `desktop:` prefix**, but no desktop blocks are parsed. Desktop targets wrap the web stack.
10. **README is outdated** (still says v9.0, 26 tatemonos, 6 stacks). This guideline and the parser are the references.

* * *

## SECTION 27 — ACTIVE TATEMONOS (33)

Format: `name vVersion auth | web pages | native (Expo/RN) screens | Lynx pages`

```
animation-lab           v1.0.0  auth:false  web:index                                                      lynx:index
asset-hub               v2.1.0  auth:false  web:index                         native:index                 lynx:index
atelier                 v1.0.0  auth:false  web:index                         native:index
auth-test               v1.0.0  auth:true   web:login,register,dashboard      native:login,register,dashboard   lynx:login,register,dashboard
body-endpoint-handler   v1.0.0  auth:false  web:index                         native:index                 lynx:index
body-mail-notification  v1.0.0  auth:true   web:login,register,dashboard      native:login,register,dashboard   lynx:login,register,dashboard
broadcast-test          v2.0.0  auth:true   web:login,register,dashboard      native:login,register,dashboard   lynx:login,register,dashboard   realtime
cafe-teresita           v3.0.0  auth:false  web:index
crud-test               v1.0.0  auth:false  web:index                         native:index                 lynx:index                       policy
dtr-geofencing          v2.0.0  auth:false  web:index,admin                   native:index,admin           layout:app
errors-test             v1.2.0  auth:false  web:index  error:404/500          native:index                 lynx:index
ethan-pool              v1.0.1  auth:false  web:index
ethereane               v2.0.2  auth:false  web:index
events-test             v1.0.0  auth:false  web:index                         native:index                 lynx:index                       events/listeners
hello-native            v1.0.0  auth:false  (native-only)                     native:index,about           lynx:index,about
hw-coffee               v2.0.0  auth:false  web:index
inventory-management    v2.0.0  auth:false  web:index                         native:index                 lynx:index
jo-payroll              v2.0.0  auth:false  web:index,job-database,cash-atm,sss,hdmf,appointments,payslip   native+lynx: index,job-database,cash-atm,appointments,payslip
job-test                v1.0.0  auth:false  web:dashboard                     native:dashboard             lynx:dashboard                   jobs
lain098                 v4.0.0  auth:false  web:index
layout-test             v1.0.0  auth:false  web:index,panel,deep,guard-auth,chain-auth,guard-guest,chain-guest  native+lynx layout chains      layout nesting
mail-test               v2.0.0  auth:true   web:login,register,dashboard      native:login,register,dashboard   lynx:login,register,dashboard   mail
middleware-test         v2.1.0  auth:false  web:index                         native:index                 lynx:index                       middleware
new-updates-styles      v2.0.0  auth:false  web:index,about,features          native:index,about,features  lynx:index,about,features        web:style:Name, native:style (global)
notification-test       v2.1.0  auth:true   web:login,register,dashboard      native:login,register,dashboard   lynx:login,register,dashboard   notifications
portfolio-test          v1.0.0  auth:false  web:index                         native:index                 lynx:index
queue-flow              v1.0.0  auth:false  web:index,join,admin                                                                            routes/handlers, realtime, pwa
roles-test              v2.1.0  auth:true   web:login,register,dashboard      native:login,register,dashboard   lynx:login,register,dashboard   roles, auth_seed
scheduler-test          v2.0.0  auth:false  web:dashboard                     native:dashboard             lynx:dashboard                   console/schedule
shan-shan               v2.0.0  auth:false  web:index
shikaku                 v1.0.0  auth:true   web:index,editor                                                                                realtime (project channel)
upload-test             v1.0.0  auth:false  web:dashboard                     native:dashboard             lynx:dashboard                   upload endpoints
visual-lab              v1.0.0  auth:false  web:index                                                                                       web:script (three.js)
```

Good references when generating: `hello-native` (native starter), `queue-flow` (routes + handlers + realtime), `roles-test` (auth + roles), `crud-test` (api + policy), `upload-test` (upload types), `layout-test` (layout chains), `scheduler-test` (console), `job-test` (jobs), `events-test` (events), `new-updates-styles` (styles), `animation-lab` (Expo/RN/Lynx animation + scripts + errors).

* * *

## SECTION 29 — AI GENERATION CHECKLIST

Before finalizing any tatemono, verify:

**META**
- [ ] `@arkzen:meta` first; `name` = folder name; `auth_seed` only with `auth: true`
- [ ] `@arkzen:meta:web` if web pages (favicon/title/description; PWA + og here)
- [ ] `@arkzen:meta:native` + `@arkzen:native:config` if native screens

**TAG FORMAT** (the validator stops the build on these)
- [ ] Shape A (meta, config, database, api, routes): no `*/` on the opening line, no `:end`
- [ ] Shape B (jobs, console, notifications, mail, events, realtime): YAML in opening comment, `*/`, body, `:end */`
- [ ] Shape C (web/native components, layouts, pages, styles, animation, script, error): `*/` on the SAME opening line, `:end */`
- [ ] Shape D (endpoint, handler, middleware, policy, listener): `*/` alone on the NEXT line, `:end */`
- [ ] Every closing tag is the full `:end */` of its opening tag (including `:lynx`, `:expo`, `:rn` suffixes)
- [ ] Page layout line directly after the page opener, no `:end`

**DATABASE**
- [ ] One `table:` per block (dict format only); plural snake_case; `columns` present
- [ ] Types only from the valid list; **no `enum`**; `foreignId` always with `foreign:`
- [ ] `foreign:` uses the slug-prefixed table name; no seeder for children of unseeded parents

**API**
- [ ] `model` PascalCase, `controller` ends with `Controller`, `prefix` starts with `/api/`
- [ ] `description` on every endpoint; `response.type` ∈ paginated | collection | array | single | message
- [ ] Custom endpoint names have an `@arkzen:endpoint:name` body; `@arkzen:routes` entries have `@arkzen:handler:name` bodies — never mix them
- [ ] Route params in handlers via `$params[n]`
- [ ] Special `type:` values used only as documented; no `command_run|job_dispatch|event_fire` for real apps
- [ ] `policy: true` only when `@arkzen:policy:update|delete` blocks exist

**BACKEND BLOCKS**
- [ ] jobs/console bodies are full methods (`handle(): void` / `handle(): int`); console uses `signature` + quoted cron `schedule`
- [ ] events list `listeners: [...]`; bodies in singular `@arkzen:listener:Name`
- [ ] notifications/mail have `:end`; mail uses `subject` + `data:`; short identifiers (class suffix is appended)
- [ ] realtime: channel registration has no `channel:` key; broadcast event has one; `broadcast()` namespace `\App\Events\Arkzen\{Ns}\Broadcast\{Class}`

**WEB**
- [ ] Imports only in components/layout/animation/script (+ error:500); none in pages; icons imported once (first components block)
- [ ] `'use client'` in components/layout/error:500 only
- [ ] Layouts export `<Name>Layout`, use `useArkzenRouter()`/`useArkzenPathname()`; `parent:` layouts use Shape B
- [ ] Pages named `<Name>Page`, no `export default`; layout names exist
- [ ] `error:404` = `NotFoundPage`, `error:500` = `ServerErrorPage({ reset })`
- [ ] Animation function has no `export`, is `camelCase(name)Animations`; `pageVariants` exported; no pinned-ScrollTrigger opacity tweens
- [ ] `arkzenFetch` result is a `Response` — `await res.json()`, `JSON.stringify` the body; null-safe access everywhere

**NATIVE (Expo / bare RN)**
- [ ] Imports in `@arkzen:import:expo` / `:rn` pairs inside components/layout/error; none in pages
- [ ] Pages named `<Name>Screen`, no `export default`; router via `expo-router` in the `expo` pair
- [ ] Error blocks: one per target; animation/script blocks stack-suffixed (`:expo` | `:rn`); no generic `native:script`
- [ ] Named styles export their StyleSheet; global `@arkzen:native:style` is CSS-like

**LYNX**
- [ ] Only `:lynx` blocks, self-contained with `@lynx-js/react` imports; no import pairs
- [ ] Realtime needs the `type: broadcast` endpoint (SSE bridge); no WebSocket code

**SCRIPTS**
- [ ] `@arkzen:web:script[:name]` (never bare `@arkzen:script`); pure TS, `export`ed, no JSX

* * *

_End of PLUFF GUIDELINES v11.0._
