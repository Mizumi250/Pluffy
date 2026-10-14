# PLUFF GUIDELINES v10.0
## For AI — Generating Tatemono Files

**VERSION:** 10.0
**VERIFIED AGAINST:** 30 active tatemonos
**PURPOSE:** Complete reference for generating valid Pluff tatemono files. Paste into any AI for valid tatemono output.

**WHAT'S NEW IN v10.0 (vs v9.0):**
- **Expo (native) stack shipped** — `hello-native`, `asset-hub` (dual web+native), `atelier` (dual web+native) confirm `@arkzen:native:*` DSL is live
- **`@arkzen:native:*` namespace** — full native DSL blocks: `native:config`, `native:components:*`, `native:style:*`, `native:layout:*`, `native:page:*`, `native:animation:rn`, `native:page:layout:*`
- **`@arkzen:meta:native`** — native app metadata block (expo config, bundle id, scheme, orientation, status bar)
- **Infinite web layout nesting** — `@arkzen:web:layout:name` with `parent:` key; pages reference as `layout:name`, `layout:+auth:name`, `layout:+guest:name`
- **`@arkzen:web:style` is now flexible** — can appear before OR after `@arkzen:web:components`; both orderings are valid
- **`@arkzen:web:animation` is now flexible** — can appear after pages (as in `inventory-management`) or before pages (as in `shan-shan`)
- **Named native style blocks** — `@arkzen:native:style:name` (e.g. `native:style:shared`, `native:style:hero`) for per-section StyleSheet objects
- **Native layout nesting** — `@arkzen:native:layout:name` with optional `parent:` key; mirrors web nesting for native
- **`native:animation:rn`** — Reanimated 2 / Moti animation block for native screens
- **New tatemonos:** `atelier` (web+native social platform), `cafe-teresita` (landing page), `shan-shan` (portfolio), `hw-coffee` (landing page), `ethan-pool` (resort landing), `hello-native` (native starter), `layout-test` (layout nesting test)
- **Removed tatemonos:** `certflow`, `barbershop-booking`, `church-community`
- **Updated tatemonos:** `asset-hub` v2.1 (dual web+native), `middleware-test` v2.1, `jo-payroll` v2.0 (dual web+native), `dtr-geofencing` v2.0 (dual web+native), `errors-test` v1.2
- 30 tatemonos total (up from 26)

---

## SECTION 1 — WHAT IS PLUFF

Pluff is a full-stack scaffolding engine. It uses a single file called a **Tatemono** to define an entire system — database tables, backend API, middleware, frontend pages, components, stores, real-time channels, jobs, notifications, events, animations — all in one file.

**One Tatemono = one complete, fully isolated client system.**

Each tatemono is its own world. No shared auth, no shared components, no shared stores, no shared database. Every tatemono stands alone.

**Stack (choose one per project):**
- **Next.js** — Next.js 16 + TypeScript + Tailwind + Zustand + Laravel (decoupled)
- **React+Vite** — React 18 + TypeScript + Vite + Tailwind + Zustand + Laravel (decoupled)
- **TanStack Start** — TanStack Start + TypeScript + Vite + Tailwind + Zustand + Laravel (decoupled)
- **Astro** — Astro + React islands + TypeScript + Tailwind + Laravel (decoupled)
- **React+Inertia** — React 18 + Inertia.js + TypeScript + Laravel (monolithic)
- **Expo** *(v10)* — Expo Router + React Native + TypeScript + NativeWind + Laravel (decoupled)

**Common to all stacks:**
- Backend: Laravel 13 + SQLite (per-tatemono isolated) + Laravel Sanctum
- Real-time: Laravel Reverb
- Web animation: GSAP + Framer Motion
- Native animation: Reanimated 2 / Moti
- Icons: Lucide React (web primary), Hero Icons (secondary)
- Optional: Matter.js, Three.js, TipTap, Leaflet

**Tatemono DSL syntax is identical across all stacks.** The engine handles the rest.

**Stack switching:**
```bash
node arkzen.js switch expo
node arkzen.js switch nextjs
```

---

## SECTION 2 — TAILWIND CSS POLICY

Tailwind CSS is the default for web page and component styling. Inline styles are also valid and often preferred for dynamic values or complex glassmorphism/gradient effects.

**Use Tailwind for:** utility classes, spacing, flex/grid, text sizes, colors
**Use inline styles for:** dynamic computed values, complex gradients, glassmorphism, backdrop-filter, box-shadow, animation values

Both can be mixed freely. Never use both on the same property.

**For native (Expo):** Use NativeWind `className` utilities on React Native components. Same Tailwind classes, compiled to StyleSheet at build time. For dynamic/computed styles, use `StyleSheet.create()` or inline style objects.

---

## SECTION 2B — ICON & EMOJI POLICY

**Lucide React is the default for web.** Hero Icons only when Lucide doesn't have the needed icon. For native, use Expo Vector Icons or inline SVG.

```tsx
// Web
import { Plus, Trash2, Edit2, Search, Bell, ChevronRight, X } from 'lucide-react'
```

Rules:
- Always import from lucide-react first
- Never import icons you don't use
- Icon size: `size` prop on Lucide (`<Plus size={16} />`)
- In layouts: import lucide in the layout block itself
- In components: import lucide in @arkzen:web:components block
- Multiple components blocks: only import in the FIRST block — subsequent blocks share the same file scope

---

## SECTION 2C — DESIGN AESTHETIC & FALLBACK SYSTEM

Default to Awwwards-quality design. Apply these in order of best fit for the system context:

**Priority 1: Minimalism** (Arkzen default)
- Clean lines, ample whitespace, typography-focused
- Best for: content-heavy, data-dense, professional systems
- Colors: neutral palette, high contrast text, subtle grays

**Priority 2: Glassmorphism**
- Frosted glass effect: `rgba + backdrop-filter: blur`
- Best for: modern, sleek, translucent layers

**Priority 3: Skeuomorphism**
- Realistic, textured, subtle depth
- Best for: banking/finance, familiar interactions

**Priority 4: Claymorphism**
- Soft, rounded, 3D-plastic appearance
- Best for: friendly, playful, creative tools

**Priority 5: Neo-Brutalism**
- Raw, bold, high-contrast, thick borders, geometric
- Best for: statement-making, alternative apps

**Priority 6: Liquid Glass**
- Flowing shapes, soft gradients, smooth animations
- Best for: premium, polished, sophisticated experiences

These are defaults when user doesn't specify. Always overrideable. Accessibility (contrast, readability) is a priority in all styles.

---

## SECTION 2D — TRANSITION DEFAULTS

When no specific transition type is requested, apply these patterns (can combine):

**Context Transition** — Animate based on page/section context. `transition: all 0.3s ease-out`
**Drill Transition** — Zoom/scale into detail. `transform: scale()`, opacity, stagger
**Continuity Transition** — Motion continuity between elements. Layout animations, morphing

**Page Transitions:** Default: fade + slide (`opacity 0.3s`, `transform 0.4s`)
**Modal/Overlay:** Continuity transition, smooth entrance, 0.25–0.35s
**Button/State:** Context transition, quick feedback 0.15–0.2s
**List Items:** Staggered drill (`delay: index * 50ms`)

Rules: Under 500ms for most interactions. Respect `prefers-reduced-motion`. Always overrideable.

---

## SECTION 2E — UX PATTERN DEFAULTS

### Skeleton Screens
Use when API call takes >300ms. Match final content layout. Neutral grays, shimmer/pulse effect.

```tsx
const SkeletonCard = () => (
  <div style={{
    borderRadius: 12,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite',
    height: 120,
  }} />
)
// In @arkzen:web:style: @keyframes shimmer { 0% { backgroundPosition: 200% 0; } 100% { backgroundPosition: -200% 0; } }
```

### Optimistic UI
Update UI immediately before API response. Revert gracefully on error.

```tsx
const addItem = async (itemData) => {
  setItems([...items, { id: 'temp', ...itemData, status: 'pending' }])
  try {
    const res = await arkzenFetch('/api/items', { method: 'POST', body: itemData })
    setItems(prev => prev.map(item => item.id === 'temp' ? { ...item, id: res.id } : item))
  } catch {
    setItems(items)
    showError('Failed')
  }
}
```

### Optimistic Pre-loading
Load next step data in background while user is on current step. Fail silently. Cache in sessionStorage or Zustand. No spinners.

### Progress Illusions
For long-running operations: fast ramp 0→30%, moderate 30→90%, slow crawl 90→99%, jump to 100% only when done.

### Scroll Triggers (GSAP)
```tsx
gsap.to('.hero-text', {
  scrollTrigger: { trigger: '.hero-section', start: 'top center', scrub: 1 },
  opacity: 1, y: 0, duration: 1,
})
```

### Hover Effects (Framer Motion)
```tsx
<motion.button whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(58,111,216,0.3)' }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 300 }}>
```

### 3D Effects (GSAP)
```tsx
// Card tilt on hover
onMouseEnter={() => gsap.to(cardRef.current, { rotationY: 180, duration: 0.6, ease: 'power2.inOut' })}
onMouseLeave={() => gsap.to(cardRef.current, { rotationY: 0, duration: 0.6, ease: 'power2.inOut' })}
```

### Entrance Animations (Framer Motion)
```tsx
const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }
```

### Mouse Parallax
```tsx
const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
useEffect(() => {
  const h = (e) => setMousePos({ x: e.clientX, y: e.clientY })
  window.addEventListener('mousemove', h)
  return () => window.removeEventListener('mousemove', h)
}, [])
```

### Background Animations
```tsx
// Animated gradient
<div style={{
  background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 15s ease infinite',
}} />
```

All UX patterns are defaults when user doesn't specify. Always overrideable.

---

## SECTION 2F — BUTTON & COMPONENT VARIANT DEFAULTS

**Default: Primary + Ghost pairing.**
- **Primary** — Main action, filled, bold, high contrast
- **Ghost** — Secondary action, outlined, low emphasis

**NEVER two primary buttons** in the same component/section.

---

## SECTION 2G — VISUAL HIERARCHY DEFAULTS

| Level | Use | Size | Weight | Color |
|-------|-----|------|--------|-------|
| 1 | Page title, primary CTA | 32–48px | 700–900 | High contrast |
| 2 | Subheadings, section headers | 20–28px | 600–700 | Medium contrast |
| 3 | Body text, form labels | 16px | 400–500 | Standard |
| 4 | Helper text, timestamps | 12–14px | 400 | Muted gray |

WCAG minimums: body text 4.5:1, helper text 3:1. Never below 14px on mobile, 16px desktop.

---

## SECTION 2H — VISUAL BALANCE DEFAULTS

**8px grid system.** Spacing scale: 4 / 8 / 16 / 24 / 32 / 48px.

Keep button/field padding consistent (12px vertical min, 16px horizontal min). Match spacing between similar elements.

---

## SECTION 3 — TATEMONO FILE RULES

```
1. Single .tsx file per tatemono
2. File location: tatemonos/<name>/core.tsx
3. TypeScript throughout
4. All web imports inside @arkzen:web:components or @arkzen:web:layout blocks ONLY
5. All native imports inside @arkzen:native:components or @arkzen:native:layout blocks ONLY
6. NO imports inside @arkzen:web:page or @arkzen:native:page blocks
7. Web and native sections can coexist in the same core.tsx (dual tatemono)
```

### WEB SECTION ORDER (all optional except meta + at least one page)

```
@arkzen:meta                        (once, always first)
@arkzen:meta:web                    (optional, once)        ← web SEO meta
@arkzen:web:config                  (optional, once)
@arkzen:database[:identifier]       (REPEAT)
@arkzen:api[:identifier]            (REPEAT)
@arkzen:routes                      (optional)
@arkzen:endpoint:name               (optional, REPEAT)      ← ONLY for @arkzen:api methods
@arkzen:handler:name                (optional, REPEAT)      ← ONLY for @arkzen:routes
@arkzen:middleware:name             (optional, REPEAT)
@arkzen:realtime:identifier         (optional, REPEAT)
@arkzen:events:identifier           (optional, REPEAT)
@arkzen:listeners:name              (optional, REPEAT)
@arkzen:jobs:identifier             (optional, REPEAT)
@arkzen:notifications:identifier    (optional, REPEAT)
@arkzen:mail:identifier             (optional, REPEAT)
@arkzen:console:identifier          (optional, REPEAT)
@arkzen:web:layout:name             (optional, REPEAT)      ← web custom layouts
@arkzen:web:style                   (optional, once)        ← can appear BEFORE or AFTER components
@arkzen:web:style:name              (optional, REPEAT)
@arkzen:web:components:identifier   (REPEAT)                ← can appear BEFORE or AFTER style
@arkzen:web:page:name               (REPEAT)
@arkzen:web:error:404               (optional)
@arkzen:web:error:500               (optional)
@arkzen:web:animation               (optional, once)        ← can appear BEFORE or AFTER pages
@arkzen:web:script                  (optional, once)
@arkzen:web:script:name             (optional, REPEAT)
```

### NATIVE SECTION ORDER (follows web sections in same file, or standalone)

```
@arkzen:meta:native                 (optional, once)        ← native app metadata
@arkzen:native:config               (optional, once)        ← theme tokens
@arkzen:native:style:name           (optional, REPEAT)      ← named StyleSheet blocks
@arkzen:native:layout:name          (optional, REPEAT)      ← native layout wrappers
@arkzen:native:components:shared    (once or REPEAT)        ← shared RN components
@arkzen:native:page:name            (REPEAT)                ← one per screen
@arkzen:native:animation:rn         (optional, once)        ← Reanimated 2 / Moti
```

---

## ⚠️ SECTION 3D — DSL TAG FORMAT RULES (CRITICAL)

### TWO types of blocks:

**TYPE A — YAML content blocks** (NO `*/` on opening line)
```
/* @arkzen:meta
/* @arkzen:meta:web
/* @arkzen:meta:native
/* @arkzen:web:config
/* @arkzen:native:config
/* @arkzen:database[:identifier]
/* @arkzen:api[:identifier]
/* @arkzen:routes
/* @arkzen:realtime:identifier
/* @arkzen:events:identifier
/* @arkzen:jobs:identifier
/* @arkzen:notifications:identifier
/* @arkzen:mail:identifier
/* @arkzen:console:identifier
/* @arkzen:middleware:name
/* @arkzen:web:layout:name   (when it has a parent: key)
/* @arkzen:native:layout:name  (when it has a parent: key)
```

**TYPE B — Code blocks** (MUST have `*/` on the SAME opening line)
```
/* @arkzen:web:components:shared */
/* @arkzen:web:components:admin */
/* @arkzen:web:layout:app */           (no parent: key)
/* @arkzen:web:layout:shell */         (no parent: key)
/* @arkzen:web:animation */
/* @arkzen:web:script */
/* @arkzen:web:script:name */
/* @arkzen:web:page:index */
/* @arkzen:web:style */
/* @arkzen:web:style:ComponentName */
/* @arkzen:web:error:404 */
/* @arkzen:web:error:500 */
/* @arkzen:native:components:shared */
/* @arkzen:native:layout:app */        (no parent: key)
/* @arkzen:native:animation:rn */
/* @arkzen:native:page:index */
/* @arkzen:native:style:shared */
/* @arkzen:native:style:name */
```

**Endpoint/handler blocks** — open WITHOUT `*/`, then `*/` on NEXT line as body separator:
```tsx
/* @arkzen:endpoint:my_endpoint
*/
$php = $code->here();
return response()->json($result);
/* @arkzen:endpoint:my_endpoint:end */

/* @arkzen:handler:my_handler
*/
$php = $code->here();
return response()->json($result);
/* @arkzen:handler:my_handler:end */
```

**Page/screen layout declaration** — always inline `*/`:
```tsx
/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:auth */

/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:app */
```

**ALL closing tags use `:end */` format:**
```
/* @arkzen:web:components:shared:end */
/* @arkzen:web:layout:app:end */
/* @arkzen:web:page:dashboard:end */
/* @arkzen:web:animation:end */
/* @arkzen:web:script:end */
/* @arkzen:web:script:name:end */
/* @arkzen:web:style:end */
/* @arkzen:web:style:ComponentName:end */
/* @arkzen:web:error:404:end */
/* @arkzen:web:error:500:end */
/* @arkzen:native:components:shared:end */
/* @arkzen:native:layout:app:end */
/* @arkzen:native:page:index:end */
/* @arkzen:native:style:shared:end */
/* @arkzen:native:animation:rn:end */
/* @arkzen:endpoint:name:end */
/* @arkzen:handler:name:end */
```

---

## SECTION 3A — IMPORT PLACEMENT RULES (CRITICAL)

| Block | Can have imports? |
|-------|------------------|
| `@arkzen:web:components:*` | ✅ YES |
| `@arkzen:web:layout:*` | ✅ YES |
| `@arkzen:web:animation` | ✅ YES (gsap/framer only) |
| `@arkzen:web:script` | ✅ YES (any npm package) |
| `@arkzen:web:script:name` | ✅ YES (any npm package) |
| `@arkzen:web:page:*` | ❌ NO |
| `@arkzen:web:error:404` | ❌ NO — engine injects React |
| `@arkzen:web:error:500` | ✅ YES — needs 'use client' |
| `@arkzen:native:components:*` | ✅ YES |
| `@arkzen:native:layout:*` | ✅ YES |
| `@arkzen:native:animation:rn` | ✅ YES |
| `@arkzen:native:page:*` | ❌ NO |
| `@arkzen:endpoint:*` | ❌ NO — PHP only |
| `@arkzen:handler:*` | ❌ NO — PHP only |

---

## SECTION 3B — `'use client'` RULES (WEB ONLY)

- Write `'use client'` at top of `@arkzen:web:components` blocks
- Write `'use client'` at top of `@arkzen:web:layout` blocks
- Write `'use client'` at top of `@arkzen:web:error:500` blocks
- NEVER write `'use client'` inside `@arkzen:web:page` blocks
- NEVER write `'use client'` inside `@arkzen:web:animation` blocks
- NEVER write `'use client'` inside `@arkzen:web:error:404` blocks
- Native blocks (`@arkzen:native:*`) never use `'use client'` — not applicable to RN

---

## SECTION 3C — ZUSTAND STORE RULES

Define stores directly inside `@arkzen:web:components` blocks. Always export them.

```tsx
export const useAppStore = create<AppState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))
```

---

## ⚠️ SECTION 3E — NULL SAFETY RULES (CRITICAL)

```tsx
// ✅ CORRECT — guard at component level
export const MyComponent = ({ data }: { data: MyResponse }) => {
  if (!data || !data.items) return <Loader2 size={24} />
}

// ✅ CORRECT — double optional chain for nested objects
status?.queue?.name ?? 'Default'
status?.queue?.avg_wait ?? 5

// ❌ WRONG — crashes if queue is undefined
status?.queue.name
```

---

## SECTION 3F — LOCALSTORAGE SAFETY RULES

```tsx
// ✅ CORRECT
const saved = localStorage.getItem('my_key')
if (saved) {
  try {
    const parsed = JSON.parse(saved)
    if (parsed && parsed.requiredField) {
      setState(parsed)
    } else {
      localStorage.removeItem('my_key')
    }
  } catch {
    localStorage.removeItem('my_key')
  }
}
```

---

## SECTION 4 — AUTH RULES

```tsx
/* @arkzen:meta
name: my-app
auth: true
*/
```

- `auth: true` — generates isolated users table, login/register/dashboard, Sanctum tokens
- `auth: false` — no auth, all pages public
- Auth layout: `/* @arkzen:web:page:layout:auth */`
- Guest layout: `/* @arkzen:web:page:layout:guest */`
- Custom layout: `/* @arkzen:web:page:layout:app */` (or any named layout)

---

## SECTION 5 — @arkzen:meta

```tsx
/* @arkzen:meta
name: my-app
version: 1.0.0
label: My App
auth: false
description: Optional description
*/
```

---

## SECTION 5B — @arkzen:meta:web

```tsx
/* @arkzen:meta:web
favicon: ☕
title: My App — Tagline
description: SEO meta description.
*/
```

Favicon can be an emoji, URL, or path. Drives `<title>` and `<meta name="description">`.

---

## SECTION 5C — @arkzen:meta:native *(NEW in v10)*

Expo app metadata. Required when the tatemono has native screens.

```tsx
/* @arkzen:meta:native
label: My App
description: Short description for app store / Expo
expo:
  bundle_id: com.company.myapp
  scheme: myapp
  version: 1.0.0
  orientation: portrait        ← or landscape, default
  status_bar_style: dark       ← or light, auto
*/
```

---

## SECTION 6 — @arkzen:web:config

```tsx
/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "my-root"
pwa:
  name: MyApp
  short_name: App
  theme_color: "#0f0f1a"
  background_color: "#0f0f1a"
  display: standalone
  icons:
    - { src: /tatemonos/my-app/icon-192.png, sizes: 192x192, type: image/png }
    - { src: /tatemonos/my-app/icon-512.png, sizes: 512x512, type: image/png }
    - { src: /tatemonos/my-app/icon-mask.png, sizes: 512x512, type: image/png, purpose: maskable }
*/
```

---

## SECTION 6B — @arkzen:native:config *(NEW in v10)*

Theme token config for native screens. Referenced as `C.primary`, `C.bg`, etc. in native components/pages.

```tsx
/* @arkzen:native:config
theme:
  primary: "#6366f1"
  background: "#fafaf9"
  surface: "#ffffff"
  text: "#0f172a"
  muted: "#94a3b8"
*/
```

Custom keys are allowed. The engine generates a `C` constant object available across all native blocks.

---

## SECTION 7 — @arkzen:database

### FORMAT A — Dict format (standard)

```tsx
/* @arkzen:database:products
table: products
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
  price:
    type: decimal
    precision: 8
    scale: 2
  category_id:
    type: foreignId
    foreign: my_app_categories.id    ← USE PREFIXED TABLE NAME (see Section 7D)
    nullable: false
  status:
    type: enum
    values: [active, inactive]
    default: active
seeder:
  count: 3
  data:
    - name: "Product One"
      price: "99.99"
      category_id: 1
      status: active
*/
```

### FORMAT B — Array format (multi-table)

```tsx
/* @arkzen:database
name: my-app
tables:
  - name: categories
    columns:
      - { name: name, type: string }
    seeds:
      - { name: "Electronics" }
  - name: products
    columns:
      - { name: category_id, type: foreignId, references: categories }
      - { name: name, type: string }
*/
```

**Column Types:** `integer, bigInteger, string, text, longText, decimal, float, boolean, date, datetime, timestamp, json, uuid, foreignId, enum`

---

## ⚠️ SECTION 7B — foreignId & AUTO-RELATIONSHIPS

Engine auto-generates `belongsTo`/`hasMany` from foreign keys. Never write them manually.

---

## ⚠️ SECTION 7C — SEEDER ORDER WARNING

If Table B has a `foreignId` pointing to Table A, remove the seeder from Table B. The engine seeds in definition order — SQLite FK constraints fail if parent isn't seeded first.

---

## ⚠️ SECTION 7D — foreignId PREFIXED TABLE NAME RULE (CRITICAL)

All tables are generated with `{tatemono-slug}_` prefix. Use full prefixed name in `foreign:`.

```
tatemono: queue-flow    table: queues   → queue_flow_queues
tatemono: task-manager  table: tasks    → task_manager_tasks
```

```yaml
# ✅ CORRECT
queue_id:
  type: foreignId
  foreign: queue_flow_queues.id

# ❌ WRONG
queue_id:
  type: foreignId
  foreign: queues.id
```

---

## SECTION 8 — @arkzen:api

```tsx
/* @arkzen:api:products
model: Product
controller: ProductController
prefix: /api/my-app
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /products
    description: Get all products        ← REQUIRED
    response:
      type: collection
  store:
    method: POST
    route: /products
    description: Create a product        ← REQUIRED
    validation:
      name: required|string|max:255
    response:
      type: single
  show:
    method: GET
    route: /products/{id}
    description: Get a single product    ← REQUIRED
    response:
      type: single
  update:
    method: PUT
    route: /products/{id}
    description: Update a product        ← REQUIRED
    validation:
      name: sometimes|string
    response:
      type: single
  destroy:
    method: DELETE
    route: /products/{id}
    description: Delete a product        ← REQUIRED
    response:
      type: message
      value: Product deleted
*/
```

**`description` is REQUIRED on every endpoint.**

**Response types:** `collection`, `single`, `message`

**`policy: true`** — generates `{Model}Policy` + wires `$this->authorize()`.

---

## SECTION 9 — @arkzen:routes

```tsx
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

**Route params** (`{queue_id}`) available as `$params[0]`, `$params[1]` in handler bodies.

---

## ⚠️ SECTION 9B — @arkzen:handler:name (CRITICAL)

```tsx
/* @arkzen:handler:join_queue
*/
$queueId = $request->input('queue_id');
$ticket = \App\Models\Arkzen\MyApp\Ticket::create([...]);
return response()->json(['ticket' => $ticket]);
/* @arkzen:handler:join_queue:end */

/* @arkzen:handler:queue_status
*/
$queueId = $params[0] ?? null;   ← URL params via $params[n]
$queue = \App\Models\Arkzen\MyApp\Queue::findOrFail($queueId);
return response()->json(['queue' => $queue]);
/* @arkzen:handler:queue_status:end */
```

| Scenario | Use |
|----------|-----|
| Custom logic inside a resource controller method | `@arkzen:endpoint:name` |
| Custom one-off route from `@arkzen:routes` | `@arkzen:handler:name` |

---

## SECTION 9C — @arkzen:policy:methodName

```tsx
/* @arkzen:policy:update
*/
if ($item->status === 'archived') { return false; }
return true;
/* @arkzen:policy:update:end */
```

Supported methods: `update`, `delete`.

---

## SECTION 10 — @arkzen:middleware:name

```tsx
/* @arkzen:middleware:requireJson
*/
if (!$request->isJson()) {
    return response()->json(['error' => 'JSON required'], 415);
}
/* @arkzen:middleware:requireJson:end */
```

---

## ⚠️ SECTION 11 — @arkzen:realtime:identifier

Two purposes depending on `channel:` key:

```tsx
// Without channel: → registers a channel in channels.php
/* @arkzen:realtime:my-app.{id}
type: private
*/

// With channel: → generates a ShouldBroadcast event class
/* @arkzen:realtime:queue-updated
channel: queue-flow.{queueId}
type: public
*/
/* @arkzen:realtime:queue-updated:end */
```

In handler PHP, reference the Broadcast sub-namespace:
```php
// ✅ CORRECT
broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([...]))->toOthers();
// Namespace formula: \App\Events\Arkzen\{TatNamespace}\Broadcast\{ClassName}
```

---

## SECTION 12 — @arkzen:events:identifier

```tsx
/* @arkzen:events:user-signed-up
listeners: [SendWelcomeEmail, UpdateUserStats]
*/
/* @arkzen:events:user-signed-up:end */
```

---

## SECTION 13 — @arkzen:listeners:name

```tsx
/* @arkzen:listeners:SendWelcomeEmail */
public function handle(UserSignedUp $event): void {
    Mail::to($event->user->email)->send(new WelcomeMail($event->user));
}
/* @arkzen:listeners:SendWelcomeEmail:end */
```

---

## SECTION 14 — @arkzen:jobs:identifier

```tsx
/* @arkzen:jobs:process-data
queue: default
tries: 3
timeout: 60
*/
// job body PHP here
/* @arkzen:jobs:process-data:end */
```

---

## SECTION 15 — @arkzen:notifications:identifier

```tsx
/* @arkzen:notifications:database-ping
channels: [database]
message: "You have a new notification"
*/
```

---

## SECTION 16 — @arkzen:mail:identifier

```tsx
/* @arkzen:mail:welcome
subject: Welcome to Our App
greeting: Hello!
lines:
  - Thank you for joining us.
action:
  text: Get Started
  url: "{{ $url }}"
*/
```

---

## SECTION 17 — @arkzen:console:identifier

```tsx
/* @arkzen:console:cleanup-temp
command: app:cleanup-temp
description: Clean up temporary files
schedule: daily
*/
\Storage::deleteDirectory('temp');
/* @arkzen:console:cleanup-temp:end */
```

---

## SECTION 18 — @arkzen:endpoint:name

**ONLY for `@arkzen:api` resource controller methods.**

```tsx
/* @arkzen:endpoint:index
*/
$query = \App\Models\Arkzen\MyApp\Item::query()->orderBy('created_at', 'desc');
return response()->json($query->paginate($request->get('per_page', 15)));
/* @arkzen:endpoint:index:end */
```

---

## SECTION 19 — @arkzen:web:layout:name

Custom named layout wrapper for web pages.

```tsx
/* @arkzen:web:layout:app */

'use client'

import React from 'react'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
import { Home, Settings } from 'lucide-react'

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router   = useArkzenRouter()
  const pathname = useArkzenPathname()
  return (
    <div style={{ minHeight: '100vh' }}>
      <main style={{ paddingBottom: 80 }}>{children}</main>
      {/* bottom nav here */}
    </div>
  )
}

/* @arkzen:web:layout:app:end */
```

**Web Layout Rules:**
- Opening tag WITH `*/` on same line (Type B) when no parent; WITH YAML block style when `parent:` key is needed
- Must export component named `<Name>Layout` (PascalCase: `AppLayout`, `ShellLayout`, `PanelLayout`)
- `'use client'` required
- Use `useArkzenRouter()` / `useArkzenPathname()` — NOT stack-specific router imports
- CANNOT import from @arkzen:web:components

### Web Layout Nesting *(NEW in v10)*

Layouts can declare a `parent:` to nest inside another layout.

```tsx
/* @arkzen:web:layout:panel
parent: shell
*/

'use client'
import React from 'react'

export const PanelLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <aside>...</aside>
      <div className="flex-1">{children}</div>
    </div>
  )
}

/* @arkzen:web:layout:panel:end */
```

**Referencing nested layouts from pages:**

| Page layout declaration | Result |
|------------------------|--------|
| `layout:shell` | `<ShellLayout>` only |
| `layout:panel` | `<ShellLayout><PanelLayout>` (engine walks parent chain) |
| `layout:modal` | `<ShellLayout><PanelLayout><ModalLayout>` |
| `layout:+auth` | `<AuthLayout requireAuth>` only |
| `layout:+auth:panel` | `<ShellLayout><PanelLayout><AuthLayout requireAuth>` |
| `layout:+guest` | `<GuestLayout>` only |
| `layout:+guest:shell` | `<ShellLayout><GuestLayout>` |
| `layout:guest` | engine-provided guest wrapper |
| `layout:app` | named `app` layout (no nesting unless parent declared) |

---

## SECTION 19B — @arkzen:native:layout:name *(NEW in v10)*

Native layout wrappers for Expo screens. Same nesting concept as web.

```tsx
/* @arkzen:native:layout:app */

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, usePathname } from 'expo-router'

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4ff' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
        {/* header */}
      </SafeAreaView>
      <View style={{ flex: 1 }}>{children}</View>
      {/* bottom tab bar */}
    </View>
  )
}

/* @arkzen:native:layout:app:end */
```

**Native Layout with parent:**
```tsx
/* @arkzen:native:layout:tab-panel
parent: app-shell
*/
```

**Referencing in native pages:**
```tsx
/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:app */

/* @arkzen:native:page:dashboard */
/* @arkzen:native:page:layout:auth */

/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:default */  ← engine default (SafeAreaView wrapper)

/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:guest */    ← guest (no auth check)
```

---

## SECTION 20 — @arkzen:web:style & @arkzen:web:style:name

```tsx
/* @arkzen:web:style */
.my-btn {
  transition: all 0.3s ease;
}
.my-card { border-radius: 12px; }
/* @arkzen:web:style:end */

/* @arkzen:web:style:ProductCard */
.card { border-radius: 12px; transition: transform 0.2s; }
.card:hover { transform: translateY(-4px); }
/* @arkzen:web:style:ProductCard:end */
```

**Positioning:** `@arkzen:web:style` can appear BEFORE or AFTER `@arkzen:web:components`. Both are valid — engine handles either order. (See active examples: `atelier` puts style before components; `shan-shan`, `ethan-pool` put style after components; `cafe-teresita`, `hw-coffee` omit the style block entirely and use inline/Tailwind only.)

---

## SECTION 20B — @arkzen:native:style:name *(NEW in v10)*

Named StyleSheet blocks for native. Each generates a `StyleSheet.create()` object.

```tsx
/* @arkzen:native:style:shared */

import { StyleSheet } from 'react-native'

export const S = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#0f172a' },
  muted: { fontSize: 13, color: '#94a3b8' },
})

/* @arkzen:native:style:shared:end */

/* @arkzen:native:style:hero */

import { StyleSheet } from 'react-native'

export const HeroS = StyleSheet.create({
  wrapper: { height: 280, borderRadius: 24, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
})

/* @arkzen:native:style:hero:end */
```

**Rules:**
- Each named style block generates its own export (e.g. `S`, `HeroS`, `ChapterS`)
- All are available in native components and pages via the shared scope
- Import `StyleSheet` from `react-native` inside the block
- Can have as many named style blocks as needed

---

## SECTION 21 — @arkzen:web:page:name

```tsx
/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:auth */

const DashboardPage = () => {
  const [data, setData] = useState(null)
  return <div>...</div>
}

/* @arkzen:web:page:dashboard:end */
```

**Web Page Rules:**
- Opening tag with `*/` on same line
- Layout declaration on the NEXT line immediately after opening tag
- NO imports — engine provides everything from @arkzen:web:components
- NO `'use client'` — engine adds it
- NO `export default`
- Component name: `<PageName>Page` PascalCase — `IndexPage`, `DashboardPage`

---

## SECTION 21B — @arkzen:native:page:name *(NEW in v10)*

```tsx
/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:default */

const IndexScreen = () => {
  const router = useRouter()

  return (
    <View className="flex-1 bg-neutral-50 px-6 pt-14 pb-10">
      <Text className="text-4xl font-bold text-neutral-900 mt-4">Hello, Native. 👋</Text>
      <PrimaryButton label="Go to About" onPress={() => router.push('/my-app/about' as any)} />
    </View>
  )
}

/* @arkzen:native:page:index:end */
```

**Native Page Rules:**
- Opening tag with `*/` on same line (Type B)
- Layout declaration IMMEDIATELY after opening tag
- NO imports — engine provides everything from @arkzen:native:components and @arkzen:native:style blocks
- Component name: `<PageName>Screen` PascalCase — `IndexScreen`, `DashboardScreen`
- Use NativeWind `className` for static styles; inline `style` for dynamic
- `useRouter()` from `expo-router` (available from native:components block imports)
- Navigation: `router.push('/tatemono-name/page-name' as any)`

**Native layout options:**
- `layout:default` — SafeAreaView wrapper, engine default
- `layout:guest` — no auth requirement
- `layout:auth` — requires authentication
- `layout:app` — uses the tatemono's named `app` layout (if defined in `native:layout:app`)
- `layout:custom-name` — any named layout defined in `native:layout:custom-name`

---

## ⚠️ SECTION 22 — @arkzen:web:error:404 & @arkzen:web:error:500

```tsx
/* @arkzen:web:error:404 */

const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 64, fontWeight: 900, color: 'rgba(74,114,216,0.20)' }}>404</p>
      <p style={{ color: '#7a9bc4' }}>Page not found</p>
    </div>
  </div>
)

/* @arkzen:web:error:404:end */
```

**error:404 rules:** Named `NotFoundPage`, NO `export default`, NO `import React`, NO `'use client'`

```tsx
/* @arkzen:web:error:500 */

'use client'

function ServerErrorPage({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={reset} style={{ padding: '12px 24px', borderRadius: 12, background: '#3a6fd8', color: 'white', border: 'none', cursor: 'pointer' }}>
        Try Again
      </button>
    </div>
  )
}

/* @arkzen:web:error:500:end */
```

**error:500 rules:** Named `ServerErrorPage`, accepts `{ reset: () => void }`, includes `'use client'`, NO `export default`

---

## SECTION 23 — @arkzen:web:components:identifier

```tsx
/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { create } from 'zustand'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Types, Stores, Utilities, Components all here

/* @arkzen:web:components:shared:end */
```

**Multiple blocks — no duplicate imports:**
```tsx
/* @arkzen:web:components:admin */
'use client'
import React from 'react'
// ← DO NOT re-import icons/hooks that already exist in 'shared'
/* @arkzen:web:components:admin:end */
```

---

## SECTION 23B — @arkzen:native:components:shared *(NEW in v10)*

```tsx
/* @arkzen:native:components:shared */

import React, { useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, Pressable,
  ScrollView, FlatList, Image, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

// Shared components, utilities, type definitions here

export const Badge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-indigo-600 tracking-wide">{label}</Text>
  </View>
)

/* @arkzen:native:components:shared:end */
```

**Rules:**
- Same multi-block duplicate-import rules as web components
- Always import from `react-native` directly (not react-native-web)
- `useRouter` from `expo-router` (not any web router)
- NativeWind `className` available on all RN primitive components

---

## SECTION 24 — @arkzen:web:animation

```tsx
/* @arkzen:web:animation */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

const myAppAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {
    gsap.fromTo('.header-section',
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

/* @arkzen:web:animation:end */
```

**⚠️ Web Animation STRICT RULES:**
- Main function: **NO `export` keyword**
- Name: **`camelCase(tatemono-name) + Animations`** (e.g. `queueFlowAnimations`, `ethanPoolAnimations`)
- `pageVariants`: **KEEP `export const`**
- GSAP target classes MUST exist on actual rendered elements
- Positioning: can appear BEFORE or AFTER `@arkzen:web:page` blocks — both valid

**⚠️ GSAP + ScrollTrigger + pinned sections:**
- When using `pin: true` with ScrollTrigger, NEVER also apply `opacity`/`transform` fromTo tweens on children of the pinned element — causes elements to disappear on scroll due to GSAP's pin-refresh cycle
- If carousel/gallery uses pinned horizontal scroll → animate cards on mount with `clearProps: 'opacity,transform'`, or skip opacity animation on pinned children entirely
- Use `invalidateOnRefresh: true` on ScrollTrigger.create when using pin
- Call `requestAnimationFrame(() => ScrollTrigger.refresh())` after pin setup

---

## SECTION 24B — @arkzen:native:animation:rn *(NEW in v10)*

Reanimated 2 / Moti animation block for native screens.

```tsx
/* @arkzen:native:animation:rn */

import { useAnimatedStyle, useSharedValue, withTiming, withSpring } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'

// Shared animated value helpers — exported, used across native pages
export function useFadeIn(delay = 0) {
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const start = () => {
    opacity.value = withTiming(1, { duration: 600 })
  }
  return { style, start }
}

export function useSlideUp(distance = 30, delay = 0) {
  const translateY = useSharedValue(distance)
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }], opacity: opacity.value }))
  const start = () => {
    translateY.value = withSpring(0)
    opacity.value = withTiming(1, { duration: 500 })
  }
  return { style, start }
}

/* @arkzen:native:animation:rn:end */
```

**Rules:**
- Import from `react-native-reanimated` (already installed in Expo stack)
- All exports use `export` keyword
- No JSX in this block — pure TS animation helpers
- Used inside native:page or native:components blocks by calling the exported hooks

---

## SECTION 24C — @arkzen:web:script (Global Script Block)

One optional global script block per tatemono for heavy JS/TS logic, Three.js factories, shared constants.

```tsx
/* @arkzen:web:script */

import * as THREE from 'three'
import { gsap } from 'gsap'

export const VisualLabColors = { primary: '#a78bfa', secondary: '#60a5fa' }

export function visualLabSceneSetup(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  // ...
  return { renderer, scene, camera }
}

/* @arkzen:web:script:end */
```

**Generated file:** `<tatemono-name>.scripts.ts`
**Import path:** `@/arkzen/generated/<tatemono-name>.scripts`

---

## SECTION 24D — @arkzen:web:script:name (Named Script Blocks)

```tsx
/* @arkzen:web:script:three-scene */
import * as THREE from 'three'
export function makeIcosahedron(scene: THREE.Scene, color = '#a78bfa') { ... }
/* @arkzen:web:script:three-scene:end */
```

**Generated file:** `<tatemono-name>.<block-name>.script.ts`
**Import path:** `@/arkzen/generated/<tatemono-name>.<block-name>.script`

| | `@arkzen:web:script` | `@arkzen:web:script:name` |
|---|---|---|
| Files generated | One: `<name>.scripts.ts` | One per block: `<name>.<block>.script.ts` |
| Count | 1 max | Unlimited |
| Best for | Shared app-wide utils | Per-feature logic, lazy imports |

---

## SECTION 25 — ASSETS FOLDER

Static media at `tatemonos/<name>/assets/`. Auto-copied to public folder on build.

**Structure:**
```
tatemonos/my-app/assets/
  images/    ← jpg, png, webp, gif
  svg/       ← svg files
  fonts/     ← ttf, otf, woff, woff2
  icons/     ← ico, png icons
  audio/     ← mp3, wav, ogg
  data/      ← json, csv
```

**Reference in code:** `/tatemonos/<name>/assets/<category>/<filename>`
**Reference in native:** `require('/tatemonos/<name>/assets/images/logo.png')` or via Image source URI

---

## SECTION 26 — AVAILABLE IMPORTS

**Always available in @arkzen:web:components:**
```tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { create } from 'zustand'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useAuthStore } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'
import { Modal } from '@/arkzen/core/components/Modal'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
```

**Always available in @arkzen:native:components:**
```tsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, Pressable, ScrollView, FlatList, Image, StyleSheet, RefreshControl, TextInput, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, usePathname } from 'expo-router'
```

**Optional (already installed):**
```tsx
import L from 'leaflet'
import { useEditor, EditorContent } from '@tiptap/react'
import * as THREE from 'three'
import Matter from 'matter-js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
// Native only:
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring } from 'react-native-reanimated'
import { MotiView, MotiText } from 'moti'
```

**Note on routing:** Use `useArkzenRouter()` and `useArkzenPathname()` in ALL web layouts and components. Never import `useRouter` from next/navigation or any stack-specific package directly. For native, use `useRouter()` from `expo-router` directly.

---

## SECTION 27 — ACTIVE TATEMONOS (30 Total)

```
animation-lab            v1.0.0  auth:false  pages:index                    layout:guest  scripts:global,three-scene,particles-config
asset-hub                v2.1.0  auth:false  pages:index                    layout:guest  native:pages:index
atelier                  v1.0.0  auth:false  pages:index                    layout:guest  native:pages:index  (dual web+native)
auth-test                v1.0.0  auth:true   pages:login,register,dashboard  layout:guest
body-endpoint-handler    v1.0.0  auth:false  pages:index                    layout:guest
body-mail-notification   v1.0.0  auth:true   pages:login,register,dashboard  layout:guest
broadcast-test           v2.0.0  auth:true   pages:login,register,dashboard  layout:guest  realtime:public
cafe-teresita            v3.0.0  auth:false  pages:index                    layout:guest
crud-test                v1.0.0  auth:false  pages:index                    layout:guest
dtr-geofencing           v2.0.0  auth:false  pages:index,admin              layout:app    native:layout:app  native:pages:index,admin
errors-test              v1.2.0  auth:false  pages:index                    layout:guest  error:404 error:500
ethan-pool               v1.0.1  auth:false  pages:index                    layout:guest
events-test              v1.0.0  auth:false  pages:index                    layout:guest
hello-native             v1.0.0  auth:false  (native-only)                               native:pages:index,about
hw-coffee                v2.0.0  auth:false  pages:index                    layout:guest
inventory-management     v2.0.0  auth:false  pages:index                    layout:guest
jo-payroll               v2.0.0  auth:false  pages:index,job-database,cash-atm,sss,hdmf,appointments,payslip  layout:app  native:layout:app  native:pages:index,job-database,cash-atm,sss,hdmf,appointments,payslip
job-test                 v1.0.0  auth:false  pages:dashboard                layout:guest
layout-test              v1.0.0  auth:false  pages:index,panel,deep,guard-auth,chain-auth,guard-guest,chain-guest  layout:shell  native:layout:app-shell,tab-panel,card-modal  native:pages:index,tab,dashboard
mail-test                v2.0.0  auth:true   pages:login,register,dashboard  layout:guest
middleware-test          v2.1.0  auth:false  pages:index                    layout:guest
new-updates-styles       v2.0.0  auth:false  pages:index,about,features     layout:guest  style:FeatureCard,HeroSection  native:style:shared,FeatureCard
notification-test        v2.1.0  auth:true   pages:login,register,dashboard  layout:guest
portfolio-test           v1.0.0  auth:false  pages:index                    layout:guest
queue-flow               v1.0.0  auth:false  pages:index,join,admin         layout:app    pwa:true  realtime:public  native:layout:app  native:pages:index,join,admin
roles-test               v2.1.0  auth:true   pages:login,register,dashboard  layout:guest
scheduler-test           v2.0.0  auth:false  pages:dashboard                layout:guest
shan-shan                v2.0.0  auth:false  pages:index                    layout:guest  native:style:shared,hero,intro,marquee,chapter,skills,about,contact,footer,nav,loader  native:pages:index  native:animation:rn
upload-test              v1.0.0  auth:false  pages:dashboard                layout:guest
visual-lab               v1.0.0  auth:false  pages:index                    layout:guest  scripts:global,three-scene,particles-config
```

---

## SECTION 28 — COMPLETE TATEMONO EXAMPLES

### Example A: Native-Only Tatemono (hello-native reference)

```tsx
/* @arkzen:meta
name: hello-native
version: 1.0.0
description: Native-only starter tatemono. Two screens — home and about.
auth: false
*/

/* @arkzen:meta:native
label: Hello Native
description: Arkzen native starter — index + about screens
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
  surface: "#ffffff"
  text: "#0f172a"
  muted: "#94a3b8"
*/

/* @arkzen:native:components:shared */

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import { useRouter } from 'expo-router'

export const Badge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-indigo-600">{label}</Text>
  </View>
)

export const PrimaryButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.82} className="rounded-2xl py-4 px-6 items-center bg-indigo-500">
    <Text className="text-white font-semibold text-base">{label}</Text>
  </TouchableOpacity>
)

/* @arkzen:native:components:shared:end */


/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:default */

const IndexScreen = () => {
  const router = useRouter()
  return (
    <View className="flex-1 bg-neutral-50 px-6 pt-14 pb-10">
      <Badge label="Arkzen Native v1.0" />
      <Text className="text-4xl font-bold text-neutral-900 mt-4">Hello, Native. 👋</Text>
      <PrimaryButton label="Go to About" onPress={() => router.push('/hello-native/about' as any)} />
    </View>
  )
}

/* @arkzen:native:page:index:end */


/* @arkzen:native:page:about */
/* @arkzen:native:page:layout:default */

const AboutScreen = () => {
  const router = useRouter()
  const [count, setCount] = useState(0)
  return (
    <View className="flex-1 bg-neutral-50 px-6 pt-14 pb-10">
      <Text className="text-3xl font-bold text-neutral-900">About this tatemono</Text>
      <View className="bg-white rounded-2xl border border-neutral-100 p-6 items-center mt-6">
        <Text className="text-5xl font-bold text-indigo-500 mb-4">{count}</Text>
        <View className="flex-row gap-x-3">
          <TouchableOpacity onPress={() => setCount(c => Math.max(0, c - 1))} className="w-12 h-12 rounded-2xl bg-neutral-100 items-center justify-center">
            <Text className="text-xl font-bold text-neutral-600">−</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCount(c => c + 1)} className="w-12 h-12 rounded-2xl bg-indigo-500 items-center justify-center">
            <Text className="text-xl font-bold text-white">+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

/* @arkzen:native:page:about:end */
```

---

### Example B: Dual Web + Native Tatemono (asset-hub pattern)

```tsx
/* @arkzen:meta
name: my-dual-app
version: 1.0.0
auth: false
*/

/* @arkzen:meta:web
favicon: 📦
title: My Dual App
description: Web and native from one tatemono.
*/

/* @arkzen:meta:native
label: My Dual App
expo:
  bundle_id: com.company.mydualapp
  scheme: mydualapp
  version: 1.0.0
  orientation: portrait
  status_bar_style: dark
*/

/* @arkzen:web:config
layout:
  guest:
    className: "mda-root"
*/

/* @arkzen:native:config
theme:
  primary: "#6366f1"
  background: "#fafafa"
*/

/* @arkzen:web:components:shared */

'use client'
import React, { useState } from 'react'
// web components here

/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */
.mda-root { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
/* @arkzen:web:style:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => (
  <div>Web page content</div>
)

/* @arkzen:web:page:index:end */


/* @arkzen:native:components:shared */

import React from 'react'
import { View, Text } from 'react-native'
// native components here

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:default */

const IndexScreen = () => (
  <View className="flex-1 bg-white p-6 pt-14">
    <Text className="text-2xl font-bold">Native screen content</Text>
  </View>
)

/* @arkzen:native:page:index:end */
```

---

### Example C: Web Layout Nesting (layout-test pattern)

```tsx
/* @arkzen:web:layout:shell */

'use client'
import React from 'react'
export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <header className="sticky top-0 z-50 px-6 py-3">Shell header</header>
    <main className="flex-1 overflow-y-auto">{children}</main>
  </div>
)

/* @arkzen:web:layout:shell:end */

/* @arkzen:web:layout:panel
parent: shell
*/

'use client'
import React from 'react'
export const PanelLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen">
    <aside className="w-52">Sidebar</aside>
    <div className="flex-1">{children}</div>
  </div>
)

/* @arkzen:web:layout:panel:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:shell */      ← just ShellLayout

const IndexPage = () => <div>Index with shell only</div>

/* @arkzen:web:page:index:end */

/* @arkzen:web:page:panel */
/* @arkzen:web:page:layout:panel */      ← ShellLayout > PanelLayout (engine walks parent chain)

const PanelPage = () => <div>Panel page inside shell+panel</div>

/* @arkzen:web:page:panel:end */

/* @arkzen:web:page:guard */
/* @arkzen:web:page:layout:+auth:panel */ ← ShellLayout > PanelLayout > AuthLayout

const GuardPage = () => <div>Auth-protected, inside shell+panel</div>

/* @arkzen:web:page:guard:end */
```

---

### Example D: Queue Flow (backend + broadcast + PWA reference)

```tsx
/* @arkzen:meta
name: queue-flow
version: 1.0.0
auth: false
*/

/* @arkzen:database:queues
table: queues
seeder:
  data:
    - name: "General"
      prefix: "G"
*/

/* @arkzen:database:tickets
table: tickets
columns:
  queue_id:
    type: foreignId
    foreign: queue_flow_queues.id   ← PREFIXED table name
    nullable: false
// NO seeder — tickets created at runtime
*/

/* @arkzen:routes
controller: QueueController
routes:
  - method: POST
    route: /api/queue-flow/join
    handler: join_queue
  - method: GET
    route: /api/queue-flow/status/{queue_id}
    handler: queue_status
*/

/* @arkzen:handler:join_queue
*/
$ticket = \App\Models\Arkzen\QueueFlow\Ticket::create([...]);
broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([
  'queue_id' => $queueId,
  'ticket'   => $ticket,
]))->toOthers();
return response()->json(['ticket' => $ticket]);
/* @arkzen:handler:join_queue:end */

/* @arkzen:realtime:queue-flow.{queueId}
type: public
*/

/* @arkzen:realtime:queue-updated
channel: queue-flow.{queueId}
type: public
*/
/* @arkzen:realtime:queue-updated:end */
```

---

## SECTION 29 — AI GENERATION CHECKLIST

Before finalizing any tatemono:

**META:**
- [ ] `@arkzen:meta` — first block, always
- [ ] `@arkzen:meta:web` — if tatemono has web pages (favicon, title, description)
- [ ] `@arkzen:meta:native` — if tatemono has native screens (expo bundle_id, scheme, orientation)
- [ ] `@arkzen:native:config` — if tatemono has native screens (theme tokens)

**DSL TAG FORMAT:**
- [ ] YAML blocks (meta, web:config, native:config, database, api, etc.) — NO `*/` on opening line
- [ ] Code blocks (web:components, web:layout, web:animation, web:page, web:style, native:components, native:page, native:style:name, native:animation:rn) — HAS `*/` on same line
- [ ] Layout with `parent:` key — opens as TYPE A (NO `*/` on opening line, `parent:` on next line before `*/`)
- [ ] Endpoint/handler blocks — NO `*/` on opening, `*/` on NEXT line as body separator
- [ ] ALL closing tags use `:end */` format

**DATABASE:**
- [ ] foreignId `foreign:` uses PREFIXED table name: `{tatemono_slug}_{table}`
- [ ] Child table with foreignId has NO seeder if parent needs to seed first
- [ ] `description` field on EVERY api endpoint

**CUSTOM ROUTES vs RESOURCE ENDPOINTS:**
- [ ] `@arkzen:routes` handlers use `@arkzen:handler:name` — NEVER `@arkzen:endpoint:name`
- [ ] `@arkzen:api` endpoint bodies use `@arkzen:endpoint:name`
- [ ] URL route params in handlers: `$params[0]`, `$params[1]` — NOT `$request->route('name')`

**BROADCAST / REALTIME:**
- [ ] Channel registration block has NO `channel:` key
- [ ] Broadcast event block HAS `channel:` key
- [ ] `broadcast()` calls use `\App\Events\Arkzen\{Ns}\Broadcast\{ClassName}`

**WEB IMPORTS:**
- [ ] ALL web imports inside `@arkzen:web:components` or `@arkzen:web:layout` blocks
- [ ] NO imports inside `@arkzen:web:page` blocks
- [ ] NO `import React` in `@arkzen:web:animation` (unless needed — some stacks need it)
- [ ] Multiple web:components blocks — no duplicate icon/hook imports across blocks
- [ ] Each web:components block still has its own React import
- [ ] Layouts use `useArkzenRouter()` / `useArkzenPathname()` from `@/arkzen/core/adapters/router`

**NATIVE IMPORTS:**
- [ ] ALL native imports inside `@arkzen:native:components` or `@arkzen:native:layout` blocks
- [ ] NO imports inside `@arkzen:native:page` blocks
- [ ] React Native primitives from `react-native` (not react-native-web)
- [ ] `useRouter` from `expo-router` in native components (not web router adapter)

**WEB LAYOUT NESTING:**
- [ ] Custom layouts export component named `<Name>Layout` PascalCase
- [ ] Layouts with `parent:` key open as TYPE A YAML block
- [ ] Pages reference parent chain via layout name: `layout:panel` → engine resolves `shell > panel`
- [ ] `layout:+auth:name` = named layout wrapped with auth guard
- [ ] `layout:+guest:name` = named layout wrapped with guest guard

**NATIVE LAYOUT:**
- [ ] Native layouts export `<Name>Layout` PascalCase
- [ ] `native:page:layout:default` = engine SafeAreaView wrapper
- [ ] `native:page:layout:app` = tatemono's `native:layout:app` block

**ERROR HANDLERS:**
- [ ] error:404 component named `NotFoundPage` exactly
- [ ] `@arkzen:web:error:404`: NO `export default`, NO `import React`, NO `'use client'`
- [ ] error:500 component named `ServerErrorPage` exactly
- [ ] `@arkzen:web:error:500`: HAS `'use client'`, accepts `{ reset: () => void }`, NO `export default`

**WEB ANIMATION:**
- [ ] Main animation function: NO `export` keyword
- [ ] Main animation function named `camelCase(tatemono-name) + Animations`
- [ ] `pageVariants` HAS `export const`
- [ ] GSAP target classes exist on actual rendered elements
- [ ] NO opacity/transform tweens on children of pinned ScrollTrigger sections — causes disappearing bug
- [ ] If animating inside a pinned section: use `clearProps: 'opacity,transform'` after tween, or skip opacity animation

**NATIVE ANIMATION:**
- [ ] `@arkzen:native:animation:rn` — all exports use `export` keyword
- [ ] Import from `react-native-reanimated` and/or `moti`
- [ ] No JSX in native animation block

**NATIVE STYLE:**
- [ ] Each `@arkzen:native:style:name` exports its StyleSheet constant
- [ ] Import `StyleSheet` from `react-native` inside each style block
- [ ] Available in native pages/components via shared scope (no explicit import needed)

**SCRIPT BLOCKS:**
- [ ] `@arkzen:web:script` — `*/` on same line (Type B)
- [ ] `@arkzen:web:script` — all exports use `export` keyword
- [ ] `@arkzen:web:script` — no JSX, pure TypeScript only
- [ ] `@arkzen:web:script:name` — closing tag includes block name: `/* @arkzen:web:script:name:end */`

**NULL SAFETY:**
- [ ] Double optional chain on nested API objects: `status?.queue?.name`
- [ ] Components with async data have null/loading guard at top
- [ ] localStorage data validated before use

**WEB PAGES:**
- [ ] NO imports in `@arkzen:web:page` blocks
- [ ] NO `'use client'` in `@arkzen:web:page` blocks
- [ ] NO `export default`
- [ ] Component name: `<PageName>Page` PascalCase

**NATIVE PAGES (SCREENS):**
- [ ] NO imports in `@arkzen:native:page` blocks
- [ ] NO `'use client'` (not applicable to native)
- [ ] NO `export default`
- [ ] Component name: `<PageName>Screen` PascalCase

**SECTION ORDER (web):**
- [ ] meta → meta:web → web:config → database → api → routes → endpoint → handler → middleware → realtime → events → listeners → jobs → notifications → mail → console → web:layout → [web:style ←→ web:components, either order] → web:page → web:error → [web:animation, before or after pages] → web:script → web:script:name

**SECTION ORDER (native, in same file after web or standalone):**
- [ ] meta:native → native:config → native:style:name(s) → native:layout:name(s) → native:components:shared → native:page:name(s) → native:animation:rn
