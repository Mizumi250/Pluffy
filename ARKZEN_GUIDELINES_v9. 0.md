# ARKZEN GUIDELINES v9.0
## For AI — Generating Tatemono Files

**VERSION:** 9.0
**VERIFIED AGAINST:** 25 active tatemonos
**PURPOSE:** This document is the complete reference for generating valid Arkzen tatemono files. Paste this into any AI to get perfect tatemono output aligned with Arkzen v9.

**NEW IN v9.0:**
- Arkzen now supports 5 frontend stacks: Next.js, React+Vite, TanStack Start, Astro, React+Inertia+Laravel
- Stack selection is per-project, not per-tatemono — tatemono syntax is identical across all stacks
- 25 active tatemonos (up from 21)
- Sitemap + robots.txt generated automatically on every build
- Error handlers: `@arkzen:error:404` and `@arkzen:error:500` fully supported on all 5 stacks

---

## SECTION 1 — WHAT IS ARKZEN

Arkzen is a full-stack scaffolding engine. It uses a single file called a **Tatemono** to define an entire system — database tables, backend API, middleware, frontend pages, components, stores, real-time channels, jobs, notifications, events, animations — all in one file.

**One Tatemono = one complete, fully isolated client system.**

Each tatemono is its own world. No shared auth, no shared components, no shared stores. Every tatemono stands alone.

**Stack (choose one per project):**
- **Next.js** — Next.js 16 + TypeScript + Tailwind + Zustand + Laravel (decoupled)
- **React+Vite** — React 18 + TypeScript + Vite + Tailwind + Zustand + Laravel (decoupled)
- **TanStack Start** — TanStack Start + TypeScript + Vite + Tailwind + Zustand + Laravel (decoupled)
- **Astro** — Astro + React islands + TypeScript + Tailwind + Laravel (decoupled)
- **React+Inertia** — React 18 + Inertia.js + TypeScript + Laravel (monolithic)

**Common to all stacks:**
- Backend: Laravel 13 + SQLite (per-tatemono isolated) + Laravel Sanctum
- Real-time: Laravel Reverb
- Animation: GSAP + Framer Motion
- Icons: Lucide React (primary), Hero Icons (secondary)
- Optional: Matter.js, Three.js, TipTap, Leaflet

**Tatemono syntax is identical across all stacks.** The engine handles the rest.

---

## SECTION 2 — TAILWIND CSS POLICY

Tailwind CSS is the default for page and component styling. Inline styles are also valid and often preferred for dynamic values or complex glassmorphism/gradient effects.

**Use Tailwind for:** utility classes, spacing, flex/grid, text sizes, colors
**Use inline styles for:** dynamic computed values, complex gradients, glassmorphism, backdrop-filter, box-shadow, animation values

Both can be mixed freely. Never use both on the same property.

---

## SECTION 2B — ICON & EMOJI POLICY

**Lucide React is the default.** Hero Icons only when Lucide doesn't have the needed icon.

```tsx
import { Plus, Trash2, Edit2, Search, Bell, ChevronRight, X } from 'lucide-react'
```

Rules:
- Always import from lucide-react first
- Never import icons you don't use
- Icon size: `size` prop on Lucide (`<Plus size={16} />`)
- In layouts: import lucide in the layout block itself
- In components: import lucide in @arkzen:components block
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
- Colors: semi-transparent overlays

**Priority 3: Skeuomorphism**
- Realistic, textured, subtle depth
- Best for: banking/finance, familiar interactions
- Colors: realistic shadows, material textures

**Priority 4: Claymorphism**
- Soft, rounded, 3D-plastic appearance
- Best for: friendly, playful, creative tools
- Colors: pastel, soft shadows

**Priority 5: Neo-Brutalism**
- Raw, bold, high-contrast, thick borders, geometric
- Best for: statement-making, alternative apps
- Colors: stark black/white, bold accents

**Priority 6: Liquid Glass**
- Flowing shapes, soft gradients, smooth animations
- Best for: premium, polished, sophisticated experiences
- Colors: gradient-heavy, smooth transitions

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
// In @arkzen:style: @keyframes shimmer { 0% { backgroundPosition: 200% 0; } 100% { backgroundPosition: -200% 0; } }
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

All UX patterns are defaults when user doesn't specify. Always overrideable.

---

## SECTION 2F — BUTTON & COMPONENT VARIANT DEFAULTS

**Default: Primary + Ghost pairing.**
- **Primary** — Main action, filled, bold, high contrast
- **Ghost** — Secondary action, outlined, low emphasis

**NEVER two primary buttons** in the same component/section.

```tsx
// ✅ CORRECT
<div style={{ display: 'flex', gap: 12 }}>
  <button style={{ background: '#3a6fd8', color: 'white', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Save</button>
  <button style={{ background: 'transparent', color: '#3a6fd8', padding: '10px 24px', borderRadius: 8, border: '2px solid #3a6fd8', cursor: 'pointer' }}>Cancel</button>
</div>
```

---

## SECTION 2G — VISUAL HIERARCHY DEFAULTS

| Level | Use | Size | Weight | Color |
|-------|-----|------|--------|-------|
| 1 | Page title, primary CTA | 32–48px | 700–900 | High contrast |
| 2 | Subheadings, section headers | 20–28px | 600–700 | Medium contrast |
| 3 | Body text, form labels | 16px | 400–500 | Standard |
| 4 | Helper text, timestamps | 12–14px | 400 | Muted gray |

Spacing: Level 1 = 32–48px margin, Level 2 = 24px, Level 3 = 16px, Level 4 = 8px.
Always overrideable.

---

## SECTION 2H — VISUAL BALANCE DEFAULTS

**8px grid system.** Spacing scale: 4 / 8 / 16 / 24 / 32 / 48px.

Keep button/field padding consistent (12px vertical min, 16px horizontal min). Match spacing between similar elements. Test balance: squint at design — does visual weight feel even? Always overrideable.

---

## SECTION 3 — TATEMONO FILE RULES

```
1. Single .tsx file per tatemono
2. File location: tatemonos/<name>/core.tsx
3. TypeScript throughout
4. All imports inside @arkzen:components or @arkzen:layout blocks ONLY
5. NO imports inside @arkzen:page blocks
6. Sections appear in this EXACT order:

   @arkzen:meta                     (once)
   @arkzen:config                   (optional, once)
   @arkzen:database[:identifier]    (REPEAT)
   @arkzen:api[:identifier]         (REPEAT)
   @arkzen:routes                   (optional)
   @arkzen:endpoint:name            (optional, REPEAT) ← ONLY for @arkzen:api resource methods
   @arkzen:handler:name             (optional, REPEAT) ← ONLY for @arkzen:routes custom routes
   @arkzen:middleware:name          (optional, REPEAT)
   @arkzen:realtime:identifier      (optional, REPEAT)
   @arkzen:events:identifier        (optional, REPEAT)
   @arkzen:listeners:name           (optional, REPEAT)
   @arkzen:jobs:identifier          (optional, REPEAT)
   @arkzen:notifications:identifier (optional, REPEAT)
   @arkzen:mail:identifier          (optional, REPEAT)
   @arkzen:console:identifier       (optional, REPEAT)
   @arkzen:layout:name              (optional, REPEAT)
   @arkzen:components:identifier    (REPEAT)
   @arkzen:style                    (optional, once)
   @arkzen:style:name               (optional, REPEAT)
   @arkzen:page:name                (REPEAT)
   @arkzen:error:404                (optional)
   @arkzen:error:500                (optional)
   @arkzen:animation                (optional, once)
```

---

## ⚠️ SECTION 3D — DSL TAG FORMAT RULES (CRITICAL)

### TWO types of blocks:

**TYPE A — YAML content blocks** (NO `*/` on opening line)
```
/* @arkzen:meta
/* @arkzen:config
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
```

**TYPE B — Code blocks** (MUST have `*/` on the SAME opening line)
```
/* @arkzen:components:shared */
/* @arkzen:layout:app */
/* @arkzen:animation */
/* @arkzen:page:index */
/* @arkzen:style */
/* @arkzen:style:ComponentName */
/* @arkzen:error:404 */
/* @arkzen:error:500 */
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

**Page layout declaration** — always inline `*/`:
```tsx
/* @arkzen:page:dashboard */
/* @arkzen:page:layout:auth */
```

**ALL closing tags:**
```
/* @arkzen:components:shared:end */
/* @arkzen:layout:app:end */
/* @arkzen:page:dashboard:end */
/* @arkzen:animation:end */
/* @arkzen:endpoint:name:end */
/* @arkzen:handler:name:end */
/* @arkzen:error:404:end */
/* @arkzen:error:500:end */
```

---

## SECTION 3A — IMPORT PLACEMENT RULES (CRITICAL)

| Block | Can have imports? |
|-------|------------------|
| `@arkzen:components:*` | ✅ YES |
| `@arkzen:layout:*` | ✅ YES |
| `@arkzen:animation` | ✅ YES (gsap/framer only) |
| `@arkzen:page:*` | ❌ NO |
| `@arkzen:endpoint:*` | ❌ NO — PHP only |
| `@arkzen:handler:*` | ❌ NO — PHP only |
| `@arkzen:error:404` | ❌ NO — engine injects React |
| `@arkzen:error:500` | ✅ YES — needs 'use client' |

---

## SECTION 3B — `'use client'` RULES

- Write `'use client'` at top of `@arkzen:components` blocks
- Write `'use client'` at top of `@arkzen:layout` blocks
- Write `'use client'` at top of `@arkzen:error:500` blocks
- NEVER write `'use client'` inside `@arkzen:page` blocks
- NEVER write `'use client'` inside `@arkzen:animation` blocks
- NEVER write `'use client'` inside `@arkzen:error:404` blocks

---

## SECTION 3C — ZUSTAND STORE RULES

Define stores directly inside `@arkzen:components` blocks. Always export them.

```tsx
export const useAppStore = create<AppState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))
```

---

## ⚠️ SECTION 3E — NULL SAFETY RULES FOR ASYNC DATA (CRITICAL)

```tsx
// ✅ CORRECT — guard at component level
export const MyComponent = ({ data }: { data: MyResponse }) => {
  if (!data || !data.items) return <Loader2 size={24} />
  // safe to use data.items here
}

// ✅ CORRECT — double optional chain for nested objects
status?.queue?.name ?? 'Default'
status?.queue?.avg_wait ?? 5

// ❌ WRONG — crashes if queue is undefined
status?.queue.name
```

Rules:
- Always use `?.` on EVERY level of a nested API object
- Always provide `?? fallback` values
- Components receiving async data must have a loading/null state guard

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
- Auth layout: `/* @arkzen:page:layout:auth */`
- Guest layout: `/* @arkzen:page:layout:guest */`
- Custom layout: `/* @arkzen:page:layout:app */`

---

## SECTION 5 — @arkzen:meta

```tsx
/* @arkzen:meta
name: my-app
version: 1.0.0
label: My App
auth: false
description: Optional description
favicon: https://example.com/icon.png
*/
```

---

## SECTION 6 — @arkzen:config

```tsx
/* @arkzen:config
toast:
  position: top-right
  duration: 3000
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

**Column Modifiers:** `length, nullable, default, primary, autoIncrement, unique, precision, scale, foreign (table.column), values ([...] for enum)`

---

## ⚠️ SECTION 7B — foreignId & AUTO-RELATIONSHIPS

Engine auto-generates `belongsTo`/`hasMany` from foreign keys. Never write them manually.

```yaml
# Format A
employee_id:
  type: foreignId
  foreign: employees.id
  nullable: false

# Format B
- { name: employee_id, type: foreignId, references: employees }
```

---

## ⚠️ SECTION 7C — SEEDER ORDER WARNING

If Table B has a `foreignId` pointing to Table A, **remove the seeder from Table B**. The engine seeds in definition order — SQLite FK constraints fail if parent isn't seeded first.

```tsx
// ✅ CORRECT — seed only parent
/* @arkzen:database:queues
seeder:
  data:
    - name: "General"
*/

/* @arkzen:database:tickets
columns:
  queue_id:
    type: foreignId
    foreign: queue_flow_queues.id
// ← NO seeder — tickets created at runtime
*/
```

---

## ⚠️ SECTION 7D — foreignId PREFIXED TABLE NAME RULE (CRITICAL)

All tables are generated with `{tatemono-slug}_` prefix. You MUST use the full prefixed name in `foreign:`.

**Formula:**
```
{tatemono-name with - replaced by _}_{table name}
```

**Examples:**
```
tatemono: queue-flow    table: queues   → queue_flow_queues
tatemono: task-manager  table: tasks    → task_manager_tasks
tatemono: dtr-geofencing table: records → dtr_geofencing_records
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

**`description` is REQUIRED on every endpoint.** The ControllerBuilder throws `Undefined array key "description"` if missing.

**Response types:** `collection`, `single`, `message`

**`policy: true`** — generates `{Model}Policy` + wires `$this->authorize()`. Pair with `@arkzen:policy:methodName` blocks. Laravel autodiscovers it.

---

## SECTION 9 — @arkzen:routes

Use for custom one-off endpoints that don't belong to a resource controller. Always pair with `@arkzen:handler:name`.

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

**Route params** (`{queue_id}`) are available in handler bodies as `$params[0]`, `$params[1]` in order of appearance. Do NOT use `$request->route('name')` — use `$params[n]`.

---

## ⚠️ SECTION 9B — @arkzen:handler:name (CRITICAL)

`@arkzen:handler:name` injects PHP into custom route controller methods from `@arkzen:routes`.

```tsx
/* @arkzen:handler:join_queue
*/
$queueId      = $request->input('queue_id');
$customerName = $request->input('customer_name', 'Guest');

$ticket = \App\Models\Arkzen\MyApp\Ticket::create([
  'queue_id'      => $queueId,
  'customer_name' => $customerName,
  'status'        => 'waiting',
]);

return response()->json(['ticket' => $ticket]);
/* @arkzen:handler:join_queue:end */

/* @arkzen:handler:queue_status
*/
$queueId = $params[0] ?? null;   ← URL params via $params[n]
$queue   = \App\Models\Arkzen\MyApp\Queue::findOrFail($queueId);
return response()->json(['queue' => $queue]);
/* @arkzen:handler:queue_status:end */
```

**CRITICAL RULES:**
- `@arkzen:handler:name` is for `@arkzen:routes` — NEVER use `@arkzen:endpoint:name` here
- `@arkzen:endpoint:name` is ONLY for `@arkzen:api` resource controller methods
- URL route params: `$params[0]`, `$params[1]` — NOT `$request->route('name')`
- Request body params still use `$request->input('field')`
- Handler name must exactly match `handler:` value in `@arkzen:routes`

| Scenario | Use |
|----------|-----|
| Custom logic inside a resource controller method | `@arkzen:endpoint:name` |
| Custom one-off route from `@arkzen:routes` | `@arkzen:handler:name` |

---

## SECTION 9C — @arkzen:policy:methodName

Inject custom PHP into the generated `{Model}Policy`. Requires `policy: true` in `@arkzen:api`.

**Supported methods:** `update`, `delete`. (`viewAny`, `view`, `create` always return `true`.)

```tsx
/* @arkzen:policy:update
*/
if ($item->status === 'archived') {
    return false;
}
return true;
/* @arkzen:policy:update:end */
```

**Available variables:** `$user` (?User, nullable), `$modelVar` (model instance, named as `lcfirst($modelName)`)

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

### Without `channel:` → registers a channel in channels.php
```tsx
/* @arkzen:realtime:my-app.{id}
type: private
*/
```

### With `channel:` → generates a ShouldBroadcast event class
```tsx
/* @arkzen:realtime:queue-updated
channel: queue-flow.{queueId}
type: public
*/
/* @arkzen:realtime:queue-updated:end */
```

Types: `public`, `private`, `presence`

---

## ⚠️ SECTION 11B — BROADCAST EVENTS — COMPLETE PATTERN (CRITICAL)

You need BOTH a channel registration block AND a broadcast event block.

```tsx
// Step 1: Register the channel (no channel: key)
/* @arkzen:realtime:queue-flow.{queueId}
type: public
*/

// Step 2: Declare the broadcast event (HAS channel: key)
/* @arkzen:realtime:queue-updated
channel: queue-flow.{queueId}
type: public
*/
/* @arkzen:realtime:queue-updated:end */
```

In handler PHP, reference the Broadcast sub-namespace:
```php
// ✅ CORRECT
broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([
  'queue_id' => $queueId,
  'ticket'   => $ticket,
]))->toOthers();

// ❌ WRONG — plain Events namespace, no ShouldBroadcast
broadcast(new \App\Events\Arkzen\QueueFlow\QueueUpdated([...]));
```

**Namespace formula:**
```
\App\Events\Arkzen\{TatemonoNamespace}\Broadcast\{EventClassName}
queue-flow + queue-updated → \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated
```

---

## SECTION 12 — @arkzen:events:identifier

For plain Laravel events with queued listeners (NOT for broadcasting):

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
public function handle(UserSignedUp $event): void
{
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

**ONLY for `@arkzen:api` resource controller methods.** Do NOT use for `@arkzen:routes` handlers.

```tsx
/* @arkzen:endpoint:index
*/
$query = \App\Models\Arkzen\MyApp\Item::query()->orderBy('created_at', 'desc');
return response()->json($query->paginate($request->get('per_page', 15)));
/* @arkzen:endpoint:index:end */
```

---

## SECTION 19 — @arkzen:layout:name

```tsx
/* @arkzen:layout:app */

'use client'

import React from 'react'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
import { Home, Settings } from 'lucide-react'

const NAV = [
  { href: '/my-app',          icon: Home,     label: 'Home'     },
  { href: '/my-app/settings', icon: Settings, label: 'Settings' },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router   = useArkzenRouter()
  const pathname = useArkzenPathname()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #e8f2ff, #daeeff)' }}>
      <main style={{ paddingBottom: 80 }}>{children}</main>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.70)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.85)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: 390, margin: '0 auto', height: 64, alignItems: 'center' }}>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <button key={href} onClick={() => router.push(href)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon size={20} style={{ color: active ? '#3a6fd8' : '#8aabcf' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#3a6fd8' : '#8aabcf' }}>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

/* @arkzen:layout:app:end */
```

**Layout Rules:**
- Opening tag: `/* @arkzen:layout:name */` (with `*/` on same line)
- Must export component named `<Name>Layout` (e.g. `AppLayout`, `DashboardLayout`)
- Must include ALL imports the layout needs
- `'use client'` required at top
- Use `useArkzenRouter()` and `useArkzenPathname()` — NOT `useRouter`/`useNavigate` directly — these are stack-agnostic adapters
- CANNOT import from @arkzen:components

---

## SECTION 19B — LAYOUT STYLING NOTES

Glassmorphism nav bar example (inline styles preferred for these):
```tsx
<nav style={{
  background: 'rgba(255,255,255,0.60)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderTop: '1px solid rgba(255,255,255,0.85)',
  boxShadow: '0 -4px 24px rgba(80,130,210,0.10)',
}}>
```

---

## SECTION 20 — @arkzen:style & @arkzen:style:name

```tsx
/* @arkzen:style */
.arkzen-btn {
  @apply px-4 py-2 rounded-lg font-medium;
}
/* @arkzen:style:end */

/* @arkzen:style:ProductCard */
.card { border-radius: 12px; transition: transform 0.2s; }
/* @arkzen:style:ProductCard:end */
```

---

## SECTION 21 — @arkzen:page:name

```tsx
/* @arkzen:page:dashboard */
/* @arkzen:page:layout:auth */

const DashboardPage = () => {
  const [data, setData] = useState(null)
  return <div>...</div>
}

/* @arkzen:page:dashboard:end */
```

**Page Rules:**
- Opening tag: `/* @arkzen:page:name */` (with `*/` on same line)
- NO imports — engine provides everything from @arkzen:components
- NO `'use client'` — engine adds it
- NO `export default` — NOT required
- Component name: `<PageName>Page` (PascalCase) — `IndexPage`, `DashboardPage`
- All hooks available automatically
- All exports from ALL @arkzen:components blocks available automatically

---

## ⚠️ SECTION 22 — @arkzen:error:404 & @arkzen:error:500

### error:404 — CORRECT FORMAT:
```tsx
/* @arkzen:error:404 */

const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 64, fontWeight: 900, color: 'rgba(74,114,216,0.20)' }}>404</p>
      <p style={{ color: '#7a9bc4' }}>Page not found</p>
    </div>
  </div>
)

/* @arkzen:error:404:end */
```

**error:404 STRICT RULES:**
- Component MUST be named `NotFoundPage` — router expects this exact name
- NO `export default` — router appends its own
- NO `import React` — engine injects it
- NO `'use client'` — 404 is a server component

### error:500 — CORRECT FORMAT:
```tsx
/* @arkzen:error:500 */

'use client'

function ServerErrorPage({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 64, fontWeight: 900, color: 'rgba(239,68,68,0.20)' }}>500</p>
        <button onClick={reset} style={{ marginTop: 16, padding: '12px 24px', borderRadius: 12, background: '#3a6fd8', color: 'white', border: 'none', cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    </div>
  )
}

/* @arkzen:error:500:end */
```

**error:500 STRICT RULES:**
- Component MUST be named `ServerErrorPage` — all stacks use this name
- Must accept `{ reset: () => void }` prop
- Must include `'use client'`
- NO `export default`

---

## SECTION 23 — @arkzen:components:identifier

```tsx
/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { create } from 'zustand'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// Types, Stores, Utilities, Components all here

/* @arkzen:components:shared:end */
```

**Rules:**
- Opening tag: `/* @arkzen:components:shared */` (with `*/` on same line)
- `'use client'` at top
- ALL types, stores, utilities, hooks, components exported
- All imports for all components in this block go here

---

## ⚠️ SECTION 23B — MULTIPLE COMPONENTS BLOCKS IMPORT RULES (CRITICAL)

When using multiple `@arkzen:components` blocks:

```tsx
/* @arkzen:components:shared */
'use client'
import React, { useState } from 'react'
import { Users, Clock, Loader2 } from 'lucide-react'
// ... shared components
/* @arkzen:components:shared:end */

/* @arkzen:components:admin */
'use client'
import React from 'react'
// ← DO NOT re-import icons/hooks that already exist in 'shared'
// ← Engine inlines all blocks into one file — duplicates cause "Duplicate declaration" errors
// ← Only import what is UNIQUE to this block
/* @arkzen:components:admin:end */
```

Rules:
- Each block still needs its own `'use client'` and `React` import
- Do NOT re-import icons, utilities, or hooks that exist in a previous block
- Only add imports for things unique to that block

---

## SECTION 24 — @arkzen:animation

```tsx
/* @arkzen:animation */

import { gsap } from 'gsap'

const myAppAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
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

/* @arkzen:animation:end */
```

**⚠️ Animation STRICT RULES:**
- Opening tag: `/* @arkzen:animation */` (with `*/` on same line)
- Main animation function: **NO `export` keyword** — router adds its own export
- Main animation function name: **MUST be `camelCase(tatemono-name) + Animations`**
  - `queue-flow` → `queueFlowAnimations`
  - `dtr-geofencing` → `dtrGeofencingAnimations`
  - `my-app` → `myAppAnimations`
- `pageVariants`: **KEEP `export const`** — used directly in pages
- NO `import React` in animation block
- GSAP target class names (`.stat-pill`, `.header-section`) MUST exist on actual rendered elements

---

## SECTION 25 — ASSETS FOLDER

Static media at `tatemonos/<name>/assets/`. Auto-copied to public folder on every build.
Reference in code: `/tatemonos/<name>/assets/images/photo.jpg`

---

## SECTION 26 — AVAILABLE IMPORTS

**Always available in @arkzen:components:**
```tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { create } from 'zustand'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useAuthStore } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'
import { Modal } from '@/arkzen/core/components/Modal'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
```

**Optional (already installed):**
```tsx
import L from 'leaflet'
import { useEditor, EditorContent } from '@tiptap/react'
import * as THREE from 'three'
import Matter from 'matter-js'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
```

**Note on routing:** Use `useArkzenRouter()` and `useArkzenPathname()` from `@/arkzen/core/adapters/router` in all layouts and components. These are stack-agnostic adapters — they resolve to the correct router (Next.js / React Router / TanStack / Astro / Inertia) based on which stack the project uses.

---

## SECTION 27 — ACTIVE TATEMONOS (25 Total)

```
animation-lab            v1.0.0  auth:false  pages: index  layout:app  animation:true
asset-hub                v1.0.0  auth:false  pages: index  layout:guest
auth-test                v1.0.0  auth:true   pages: login, register, dashboard
barbershop-booking       v1.0.0  auth:false  pages: index
body-endpoint-handler    v1.0.0  auth:false  pages: index
body-mail-notification   v1.0.0  auth:true   pages: login, register, dashboard
broadcast-test           v2.0.0  auth:true   pages: login, register, dashboard
certflow                 v1.0.0  auth:false  pages: index
church-community         v1.0.0  auth:false  pages: index  layout:app
crud-test                v1.0.0  auth:false  pages: index
dtr-geofencing           v2.0.0  auth:false  pages: index, admin  layout:app
errors-test              v1.0.0  auth:false  pages: index  error:404 error:500
events-test              v1.0.0  auth:false  pages: index
inventory-management     v2.0.0  auth:false  pages: index
jo-payroll               v3.0.0  auth:false  pages: index,job-database,cash-atm,sss,hdmf,appointments,payslip  layout:app
job-test                 v1.0.0  auth:false  pages: dashboard
mail-test                v2.0.0  auth:true   pages: login, register, dashboard
middleware-test          v2.0.0  auth:false  pages: index
new-updates-styles       v2.0.0  auth:false  pages: index, about, features
notification-test        v2.1.0  auth:true   pages: login, register, dashboard
portfolio-test           v1.0.0  auth:false  pages: index
queue-flow               v1.0.0  auth:false  pages: index, join, admin  layout:app  pwa:true  realtime:public
roles-test               v2.1.0  auth:true   pages: login, register, dashboard
scheduler-test           v2.0.0  auth:false  pages: dashboard
upload-test              v1.0.0  auth:false  pages: dashboard
```

---

## SECTION 28 — COMPLETE TATEMONO EXAMPLE (queue-flow reference)

The queue-flow tatemono is the reference for: custom routes + broadcast realtime + custom app layout + PWA + multi-page.

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
// NO seeder
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
broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([   ← Broadcast\ namespace
  'queue_id' => $queueId,
  'ticket'   => $ticket,
]))->toOthers();
return response()->json(['ticket' => $ticket]);
/* @arkzen:handler:join_queue:end */

/* @arkzen:handler:queue_status
*/
$queueId = $params[0] ?? null;    ← URL params via $params[n]
$queue   = \App\Models\Arkzen\QueueFlow\Queue::findOrFail($queueId);
return response()->json(['queue' => $queue]);
/* @arkzen:handler:queue_status:end */

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

**DSL TAG FORMAT:**
- [ ] YAML blocks (meta, config, database, api, etc.) — NO `*/` on opening line
- [ ] Code blocks (components, layout, animation, page, style, error) — HAS `*/` on same line
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
- [ ] Plain `@arkzen:events` blocks are for listener-based events only

**IMPORTS:**
- [ ] ALL imports inside `@arkzen:components` or `@arkzen:layout` blocks
- [ ] NO imports inside `@arkzen:page` blocks
- [ ] NO `import React` in `@arkzen:animation`
- [ ] Multiple components blocks — no duplicate icon/hook imports across blocks
- [ ] Each components block still has its own React import
- [ ] Layouts use `useArkzenRouter()` / `useArkzenPathname()` from `@/arkzen/core/adapters/router`

**ERROR HANDLERS:**
- [ ] error:404 component named `NotFoundPage` exactly
- [ ] error:404: NO `export default`, NO `import React`, NO `'use client'`
- [ ] error:500 component named `ServerErrorPage` exactly
- [ ] error:500: HAS `'use client'`, accepts `{ reset: () => void }`, NO `export default`

**ANIMATION:**
- [ ] Main animation function: NO `export` keyword
- [ ] Main animation function named `camelCase(tatemono-name) + Animations`
- [ ] `pageVariants` HAS `export const`
- [ ] GSAP target classes exist on actual rendered elements

**NULL SAFETY:**
- [ ] Double optional chain on nested API objects: `status?.queue?.name`
- [ ] Components with async data have null/loading guard at top
- [ ] localStorage data validated before use

**PAGES:**
- [ ] NO imports in page blocks
- [ ] NO `'use client'` in page blocks
- [ ] NO `export default`
- [ ] Component name: `<PageName>Page` PascalCase

**SECTION ORDER:**
- [ ] meta → config → database → api → routes → endpoint → handler → middleware → realtime → events → listeners → jobs → notifications → mail → console → layout → components → style → page → error → animation