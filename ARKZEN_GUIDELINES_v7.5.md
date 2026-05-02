# ARKZEN GUIDELINES DOCUMENT v7.5
## For Claude AI — Generating Tatemono Files

**UPDATED:** 2026-05-02
**VERIFIED AGAINST:** All 20 active tatemonos (source of truth)
**CHANGES FROM v7.4:**
- FIXED: DSL tag format rules (*/  vs no */ — verified from all 20 tatemonos)
- FIXED: @arkzen:animation block format (was wrong in v7.4)
- FIXED: @arkzen:page opening tag format (was inconsistent in v7.4)
- FIXED: @arkzen:layout opening tag format
- FIXED: @arkzen:components opening tag format
- FIXED: export default — pages do NOT require it (only portfolio-test uses it, not standard)
- ADDED: Section 7B — foreignId / foreign key relationships (critical missing section)
- ADDED: Section 7C — two database formats (dict vs array) with when to use each
- ADDED: Section 18B — endpoint body format clarification (two valid patterns)
- ADDED: barbershop-booking api format (resource/routes array style)
- UPDATED: Section 27 — now 20 tatemonos

---

## SECTION 1 — WHAT IS ARKZEN

Arkzen is a full-stack scaffolding engine built on Next.js TypeScript and Laravel. It uses a single file format called a **Tatemono** to define an entire system — multiple database tables, multiple backend API resources, middleware, multiple frontend pages and components, multiple stores, real-time channels, background jobs, notifications, events, and animations — all in one file.

**One Tatemono = one complete, fully isolated client system.**

Each Tatemono is its own world. It does not share anything with other Tatemonos. No shared auth, no shared components, no shared stores. Every Tatemono stands alone.

**Stack:**
- Frontend: Next.js 16 + TypeScript + **Tailwind CSS** (required) + Zustand
- Backend: Laravel 13 + SQLite (per-tatemono isolated) + Laravel Sanctum
- Real-time: Laravel Reverb + custom CRDT
- Animation: GSAP + Framer Motion
- Icons: **Lucide React** (primary) + **Hero Icons** (secondary)
- Optional: Matter.js, Three.js, TipTap, Leaflet

---

## SECTION 2 — TAILWIND CSS POLICY

Tailwind CSS is the required default for all styling. All custom components and page layouts use Tailwind utility classes.

**Allowed for advanced customization:**
- CSS modules for complex animations or design system overrides
- Inline styles for dynamic values (computed widths, colors from data)
- CSS variables for theming

**Not allowed:**
- Plain CSS replacing Tailwind as primary styling
- Styled-components or Emotion
- Bootstrap or other CSS frameworks

---

## SECTION 2B — ICON & EMOJI POLICY

**Lucide React is the default icon library.** Hero Icons only when Lucide doesn't have the needed icon.

```tsx
import { Plus, Trash2, Edit2, Search, Bell, ChevronRight, X } from 'lucide-react'
import { SparklesIcon } from '@heroicons/react/24/outline'  // only if not in Lucide
```

**Rules:**
1. Always import from lucide-react first
2. Use Hero Icons only when specific icon is not in Lucide
3. Never use emoji as icon replacements
4. Icon size: `size` prop on Lucide (`<Plus size={16} />`), `className` on Hero Icons

---

## SECTION 2C — DESIGN AESTHETIC POLICY

Default to Awwwards-quality, Apple-minimalist design. Clean, spacious, purposeful. Never generic-looking. Match the tatemono's purpose with appropriate visual personality.

---

## SECTION 3 — TATEMONO FILE RULES

```
1. Single .tsx file per tatemono
2. File location: tatemonos/<name>/core.tsx
3. TypeScript throughout — no 'any'
4. All imports inside @arkzen:components or @arkzen:layout blocks ONLY
5. NO imports inside @arkzen:page blocks
6. Sections appear in this EXACT order:

   @arkzen:meta                     (once)
   @arkzen:config                   (optional, once)
   @arkzen:database[:identifier]    (REPEAT)
   @arkzen:api[:identifier]         (REPEAT)
   @arkzen:routes                   (optional)
   @arkzen:middleware:name          (optional, REPEAT)
   @arkzen:realtime:identifier      (optional, REPEAT)
   @arkzen:events:identifier        (optional, REPEAT)
   @arkzen:listeners:name           (optional, REPEAT)
   @arkzen:jobs:identifier          (optional, REPEAT)
   @arkzen:notifications:identifier (optional, REPEAT)
   @arkzen:mail:identifier          (optional, REPEAT)
   @arkzen:console:identifier       (optional, REPEAT)
   @arkzen:endpoint:name            (optional, REPEAT)
   @arkzen:handler:name             (optional, REPEAT)
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

## ⚠️ SECTION 3D — DSL TAG FORMAT RULES (CRITICAL — SOURCE OF TRUTH FROM 20 TATEMONOS)

This is the most common source of parse errors. The rule is simple:

### TWO types of blocks:

**TYPE A — YAML content blocks** (no `*/` on opening line, content ends the block with `*/`)
These blocks contain YAML key-value data. The opening line has NO `*/`.
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
These blocks contain TypeScript/PHP code. The opening line MUST close with `*/`.
```
/* @arkzen:components:shared */
/* @arkzen:layout:app */
/* @arkzen:animation */
/* @arkzen:page:index */
/* @arkzen:page:dashboard */
/* @arkzen:style */
/* @arkzen:style:ComponentName */
/* @arkzen:error:404 */
/* @arkzen:error:500 */
```

### Endpoint blocks — special pattern:
Endpoints open WITHOUT `*/`, then IMMEDIATELY have `*/` on the next line as a body separator:
```tsx
/* @arkzen:endpoint:my_endpoint
*/
$php = $code->here();
return response()->json($result);
/* @arkzen:endpoint:my_endpoint:end */
```

### Page layout declaration:
The layout line inside a page block uses `*/` inline — this is intentional:
```tsx
/* @arkzen:page:dashboard */
/* @arkzen:page:layout:auth */

const DashboardPage = () => { ... }

/* @arkzen:page:dashboard:end */
```

### ALL closing tags always use `:end */` format:
```
/* @arkzen:components:shared:end */
/* @arkzen:layout:app:end */
/* @arkzen:page:dashboard:end */
/* @arkzen:animation:end */
/* @arkzen:endpoint:name:end */
/* @arkzen:error:404:end */
```

---

## SECTION 3A — IMPORT PLACEMENT RULES (CRITICAL)

> **Imports belong ONLY in `@arkzen:components` or `@arkzen:layout` blocks. Never in `@arkzen:page` blocks.**

| Block | Can have imports? |
|-------|------------------|
| `@arkzen:components:*` | ✅ YES — primary home for all imports |
| `@arkzen:layout:*` | ✅ YES — self-contained layout files |
| `@arkzen:animation` | ✅ YES — separate generated file |
| `@arkzen:page:*` | ❌ NO — never import here |
| `@arkzen:endpoint:*` | ❌ NO — PHP only |

The engine automatically injects into every page:
```tsx
'use client'
import React, { useRef, useEffect, ...detected_hooks } from 'react'
import { motion } from 'framer-motion'
// + all exports from @arkzen:components (inlined, not imported)
```

---

## SECTION 3B — `'use client'` RULES

- Write `'use client'` at the top of `@arkzen:components` blocks — engine strips it when inlining
- Write `'use client'` at the top of `@arkzen:layout` blocks — required there
- NEVER write `'use client'` inside `@arkzen:page` blocks — engine adds it automatically
- NEVER write `'use client'` inside `@arkzen:animation` blocks

---

## SECTION 3C — ZUSTAND STORE RULES

Define stores directly inside `@arkzen:components` blocks. Do NOT use separate `@arkzen:store` blocks unless specifically needed.

```tsx
/* @arkzen:components:shared */

'use client'

import { create } from 'zustand'

interface AppState {
  items: Item[]
  setItems: (items: Item[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))

/* @arkzen:components:shared:end */
```

---

## SECTION 4 — AUTH RULES

```tsx
/* @arkzen:meta
name: my-app
auth: true   ← enables auth system for this tatemono
*/
```

- `auth: true` — generates isolated users table, login/register/dashboard pages, Sanctum tokens
- `auth: false` — no auth, all pages are public
- Auth pages are named: `login`, `register`, `dashboard`
- Auth layout: `/* @arkzen:page:layout:auth */`
- Guest layout: `/* @arkzen:page:layout:guest */`
- Custom layout: `/* @arkzen:page:layout:app */` (or any name matching your `@arkzen:layout:name`)

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

Fields:
- `name` — slug (lowercase, hyphens) — used as URL prefix `/name/...`
- `version` — semver
- `label` — human-readable display name
- `auth` — true/false
- `description` — optional
- `favicon` — optional URL

---

## SECTION 6 — @arkzen:config

```tsx
/* @arkzen:config
toast:
  position: top-right
  duration: 3000
modal:
  borderRadius: 2xl
  backdrop: blur
  animation: fadeScale
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
  auth:
    className: "min-h-screen bg-neutral-100"
pwa:
  name: My App
  short_name: MyApp
  theme_color: "#000000"
  background_color: "#ffffff"
  display: standalone
  icons:
    - { src: /tatemonos/my-app/icon-192.png, sizes: 192x192, type: image/png }
    - { src: /tatemonos/my-app/icon-512.png, sizes: 512x512, type: image/png }
    - { src: /tatemonos/my-app/icon-mask.png, sizes: 512x512, type: image/png, purpose: maskable }
*/
```

---

## SECTION 7 — @arkzen:database

### FORMAT A — Dict format (standard, one table per block)

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
    foreign: categories.id
    nullable: false
  status:
    type: string
    default: active
seeder:
  count: 5
  data:
    - name: "Product One"
      price: "99.99"
      category_id: 1
      status: active
*/
```

**Column Types:**
```
integer, bigInteger, string (default 255), text, longText,
decimal (with precision + scale), float,
boolean, date, datetime, timestamp, json, uuid,
foreignId (use foreign: table.column for relationships)
enum (use values: [...])
```

**Column Modifiers:**
- `length` — for string, default 255
- `nullable` — boolean, default false
- `default` — scalar value
- `primary` — boolean
- `autoIncrement` — boolean, only for primary integer
- `unique` — boolean
- `precision` + `scale` — for decimal
- `foreign: table.column` — **required for foreignId to auto-generate relationships**
- `values: [a, b, c]` — for enum type

### FORMAT B — Array format (multi-table in one block, used in barbershop-booking style)

```tsx
/* @arkzen:database
name: my-app
tables:
  - name: categories
    columns:
      - { name: name, type: string }
      - { name: slug, type: string, unique: true }
    seeds:
      - { name: "Electronics", slug: "electronics" }

  - name: products
    columns:
      - { name: category_id, type: foreignId, references: categories }
      - { name: name, type: string }
      - { name: price, type: decimal, precision: 8, scale: 2 }
    seeds:
      - { name: "Laptop", price: 999.99, category_id: 1 }
*/
```

**When to use which:**
- Format A (dict) — standard, preferred for most tatemonos. Supports `foreign: table.id` for auto-relationships.
- Format B (array) — use when defining multiple tightly related tables in one block (e.g. barbershop with barbers/services/bookings)

---

## ⚠️ SECTION 7B — foreignId & AUTO-RELATIONSHIPS (CRITICAL MISSING SECTION)

The engine (ModelBuilder) **automatically generates** `belongsTo` and `hasMany` relationships from foreign key columns. You NEVER write relationships manually.

### How to define a foreign key (Format A — dict):
```tsx
/* @arkzen:database:time_records
table: time_records
columns:
  employee_id:
    type: foreignId
    foreign: employees.id    ← THIS is what triggers auto-relationship generation
    nullable: false
*/
```

### How to define a foreign key (Format B — array):
```tsx
- { name: employee_id, type: foreignId, references: employees }
```

### What the engine generates automatically:
- On `TimeRecord` model: `public function employee() { return $this->belongsTo(Employee::class, 'employee_id'); }`
- On `Employee` model: `public function timeRecords() { return $this->hasMany(TimeRecord::class, 'employee_id'); }`

### ⚠️ Critical: Format A must use `foreign: table.id` NOT `references: table`
- ✅ `foreign: employees.id` — triggers auto-relationship
- ❌ `references: employees` — does NOT trigger auto-relationship in Format A (dict)
- ✅ `references: employees` — works in Format B (array) only

---

## SECTION 8 — @arkzen:api

### Standard format (used by most tatemonos):

```tsx
/* @arkzen:api:products
model: Product
controller: ProductController
prefix: /api/products
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /items
    description: Get all items
    response:
      type: collection

  store:
    method: POST
    route: /items
    description: Create item
    validation:
      name: required|string|max:255
      price: required|numeric
    response:
      type: single

  show:
    method: GET
    route: /items/{id}
    response:
      type: single

  update:
    method: PUT
    route: /items/{id}
    validation:
      name: sometimes|string|max:255
    response:
      type: single

  destroy:
    method: DELETE
    route: /items/{id}
    response:
      type: message
      value: Item deleted
*/
```

### Alternative format (barbershop-booking style — routes array):

```tsx
/* @arkzen:api:barbers
resource: barbers
routes:
  - { method: GET, path: /barbers, action: index }
  - { method: GET, path: "/barbers/{id}", action: show }
*/
```

**Response types:**
- `collection` — returns array of models
- `single` — returns one model
- `message` — returns `{ message: "..." }`

---

## SECTION 9 — @arkzen:routes (Custom Routes)

```tsx
/* @arkzen:routes
controller: SimulateController
middleware: []
routes:
  - method: GET
    route: /api/my-app/simulate/{code}
    handler: simulate
*/
```

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

## SECTION 11 — @arkzen:realtime:identifier

```tsx
/* @arkzen:realtime:my-channel-public
type: public
event: MyEventName
*/

/* @arkzen:realtime:my-channel.{id}
type: private
event: MyPrivateEvent
*/

/* @arkzen:realtime:my-presence-channel
type: presence
event: MyPresenceEvent
*/
```

---

## SECTION 12 — @arkzen:events:identifier

```tsx
/* @arkzen:events:user-signed-up
model: User
payload: [id, name, email]
*/
```

---

## SECTION 13 — @arkzen:listeners:name

```tsx
/* @arkzen:listeners:SendWelcomeEmail */
// Handles UserSignedUp event
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

/* @arkzen:notifications:all-channels
channels: [database, mail, broadcast]
channel_type: private
message: "Important notification"
subject: "Alert"
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
  - Your account is now active.
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
\Log::info('Temp files cleaned');
/* @arkzen:console:cleanup-temp:end */
```

---

## SECTION 18 — @arkzen:endpoint:name

Custom PHP bodies for API endpoints. Two valid patterns:

### Pattern A — with body separator `*/` (standard, most tatemonos):
```tsx
/* @arkzen:endpoint:check_in
*/
$employeeId = $request->input('employee_id');
$record = TimeRecord::create([...]);
return response()->json($record);
/* @arkzen:endpoint:check_in:end */
```

### Pattern B — without separator (barbershop-booking, body-endpoint-handler style):
```tsx
/* @arkzen:endpoint
method: GET
path: /bookings/slots
description: Returns available time slots
*/
$barberId = $request->query('barber_id');
return response()->json(['slots' => $available]);
/* @arkzen:endpoint:end */
```

**Rules:**
- Access request via `$request`
- Access route params via `$request->route('param')` or `$id`
- Must return a response
- PHP only — no JS/TS

---

## SECTION 18B — @arkzen:handler:name

Custom route handler bodies:

```tsx
/* @arkzen:handler:ping
*/
return response()->json(['pong' => true, 'time' => now()]);
/* @arkzen:handler:ping:end */
```

---

## SECTION 19 — @arkzen:layout:name

Custom layouts for tatemonos that need a persistent shell (nav, sidebar, etc).

```tsx
/* @arkzen:layout:app */

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Settings, Menu, X } from 'lucide-react'

const NAV = [
  { href: '/my-app', label: 'Home' },
  { href: '/my-app/settings', label: 'Settings' },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 h-14 flex items-center justify-between">
        <span className="font-bold">My App</span>
        <nav className="flex gap-4">
          {NAV.map(({ href, label }) => (
            <button key={href} onClick={() => router.push(href)}
              className={pathname === href ? 'font-semibold' : 'text-neutral-500'}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}

/* @arkzen:layout:app:end */
```

**Layout Rules:**
- Opening tag: `/* @arkzen:layout:name */` (with `*/` on same line)
- Must export component named `<Name>Layout` (PascalCase) — e.g. `AppLayout`, `DashboardLayout`
- Must include ALL imports the layout needs (cannot import from @arkzen:components)
- `'use client'` required at top
- Each tatemono gets its own isolated layout file — no collision between tatemonos
- Reference in pages as: `/* @arkzen:page:layout:app */`

---

## SECTION 19A — CUSTOM LAYOUT BEST PRACTICES

- Layout CANNOT import from `@arkzen:components` — it's a separate file
- Nav config must be inlined in the layout
- Use `usePathname()` for active link detection
- Use `useRouter()` for navigation
- Always wrap with `'use client'`

---

## SECTION 20 — @arkzen:style & @arkzen:style:name

**Global CSS:**
```tsx
/* @arkzen:style */

* { box-sizing: border-box; }

.arkzen-btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors bg-neutral-900 text-white;
}

/* @arkzen:style:end */
```

**Component-Scoped CSS Modules:**
```tsx
/* @arkzen:style:ProductCard */

.card {
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

/* @arkzen:style:ProductCard:end */
```

---

## SECTION 21 — @arkzen:page:name

```tsx
/* @arkzen:page:dashboard */
/* @arkzen:page:layout:auth */

const DashboardPage = () => {
  const { user } = useAuthStore()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
    </div>
  )
}

/* @arkzen:page:dashboard:end */
```

**Page Rules:**
- Opening tag: `/* @arkzen:page:name */` (with `*/` on same line)
- Layout line: `/* @arkzen:page:layout:guest */` or `layout:auth` or `layout:<custom>`
- Component name: `<PageName>Page` (PascalCase) — `IndexPage`, `DashboardPage`, `AdminPage`
- NO imports — engine provides everything from @arkzen:components
- NO `'use client'` — engine adds it
- NO `export default` — NOT required (engine handles page registration)
- All hooks (useState, useEffect, useRef, etc.) are available automatically
- All exports from @arkzen:components are available automatically

---

## SECTION 22 — @arkzen:error:404 & @arkzen:error:500

```tsx
/* @arkzen:error:404 */

import React from 'react'
import Link from 'next/link'

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-neutral-600 mb-8">Page not found</p>
      <Link href="/" className="bg-neutral-900 text-white px-6 py-2 rounded-lg">Back to Home</Link>
    </div>
  </div>
)

export default NotFound

/* @arkzen:error:404:end */
```

```tsx
/* @arkzen:error:500 */

'use client'

import React from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <p className="text-neutral-600 mb-8">Something went wrong</p>
        <button onClick={reset} className="bg-neutral-900 text-white px-6 py-2 rounded-lg">Try Again</button>
      </div>
    </div>
  )
}

/* @arkzen:error:500:end */
```

**Notes:**
- `@arkzen:error:404` — uses `*/` on same opening line (code block)
- `@arkzen:error:500` — uses `*/` on same opening line (code block)
- error:404 uses `export default NotFound`
- error:500 uses `export default function Error({ error, reset })`
- error:500 requires `'use client'`

---

## SECTION 23 — @arkzen:components:identifier

```tsx
/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { create } from 'zustand'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Product {
  id: number
  name: string
  price: number
}

// ─── Store ───────────────────────────────────────────────────────────────────
interface AppState {
  products: Product[]
  setProducts: (p: Product[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
}))

// ─── Utilities ───────────────────────────────────────────────────────────────
export const formatPrice = (price: number) => `₱${price.toFixed(2)}`

// ─── Components ──────────────────────────────────────────────────────────────
export const ProductCard = ({ product }: { product: Product }) => (
  <div className="bg-white rounded-xl border p-4">
    <h3 className="font-semibold">{product.name}</h3>
    <p className="text-neutral-500">{formatPrice(product.price)}</p>
  </div>
)

/* @arkzen:components:shared:end */
```

**Rules:**
- Opening tag: `/* @arkzen:components:shared */` (with `*/` on same line)
- `'use client'` at top (engine strips it when inlining)
- ALL imports go here — never in page blocks
- Export everything that pages need
- Define stores here

---

## SECTION 24 — @arkzen:animation

```tsx
/* @arkzen:animation */

import { gsap } from 'gsap'

export const myAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.header',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    )
    gsap.fromTo('.card',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.15 }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

/* @arkzen:animation:end */
```

**Rules:**
- Opening tag: `/* @arkzen:animation */` (with `*/` on same line)
- Import gsap/framer here (NOT inside components)
- NO `import React` — not needed in animation files
- Export animation functions and framer variants
- Use in pages: call animation function in `useEffect` with `pageRef`
- Animation targets use CSS class selectors (`.header`, `.card`, etc.)

---

## SECTION 25 — ASSETS FOLDER

Static media at `tatemonos/<name>/assets/`. Auto-copied to public folder.

```
assets/
  images/   (PNG, JPG, WebP, SVG)
  videos/   (MP4, WebM)
  audio/    (MP3, WAV)
  documents/ (PDF, DOCX)
  fonts/    (TTF, WOFF, WOFF2)
```

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
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
```

**Optional libraries (already installed):**
```tsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { useEditor, EditorContent } from '@tiptap/react'
import * as THREE from 'three'
import Matter from 'matter-js'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
```

---

## SECTION 27 — ACTIVE TATEMONOS (20 Total)

```
auth-test          v1.0.0  auth:true   pages: login, register, dashboard
barbershop-booking v1.0.0  auth:false  pages: index
body-endpoint-handler v1.0.0 auth:false pages: index
body-mail-notification v1.0.0 auth:true pages: login, register, dashboard
broadcast-test     v1.0.0  auth:true   pages: login, register, dashboard
crud-test          v1.0.0  auth:false  pages: index
dtr-geofencing     v2.0.0  auth:false  pages: index, admin  layout:app
errors-test        v1.0.0  auth:false  pages: index  error:404 error:500
events-test        v1.0.0  auth:false  pages: index
inventory-management v1.0.0 auth:false pages: index
jo-payroll         v3.0.0  auth:false  pages: index, job-database, cash-atm, sss, hdmf, appointments, payslip  layout:app
job-test           v1.0.0  auth:false  pages: dashboard
mail-test          v1.0.0  auth:true   pages: login, register, dashboard
middleware-test    v1.0.0  auth:false  pages: index
new-updates-styles v2.0.0  auth:false  pages: index, about, features  style:FeatureCard style:HeroSection
notification-test  v2.1.0  auth:true   pages: login, register, dashboard
portfolio-test     v1.0.0  auth:false  pages: index
roles-test         v2.1.0  auth:true   pages: login, register, dashboard
scheduler-test     v2.0.0  auth:false  pages: dashboard
upload-test        v1.0.0  auth:false  pages: dashboard
```

---

## SECTION 28 — COMPLETE TATEMONO EXAMPLE

```tsx
/* @arkzen:meta
name: task-manager
version: 1.0.0
label: Task Manager
auth: false
*/

/* @arkzen:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:database:tasks
table: tasks
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  title:
    type: string
    length: 255
    nullable: false
  status:
    type: string
    default: pending
  priority:
    type: integer
    default: 0
seeder:
  count: 3
  data:
    - title: "First task"
      status: pending
      priority: 1
    - title: "Second task"
      status: active
      priority: 2
*/

/* @arkzen:api:tasks
model: Task
controller: TaskController
prefix: /api/task-manager
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /tasks
    response:
      type: collection
  store:
    method: POST
    route: /tasks
    validation:
      title: required|string|max:255
      priority: sometimes|integer
    response:
      type: single
  destroy:
    method: DELETE
    route: /tasks/{id}
    response:
      type: message
      value: Task deleted
*/

/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

export interface Task {
  id: number
  title: string
  status: string
  priority: number
}

export const TaskCard = ({ task, onDelete }: { task: Task; onDelete: () => void }) => (
  <div className="flex items-center gap-3 bg-white rounded-xl border p-4">
    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
    <span className="flex-1 text-sm font-medium">{task.title}</span>
    <button onClick={onDelete} className="text-red-400 hover:text-red-600">
      <Trash2 size={14} />
    </button>
  </div>
)

/* @arkzen:components:shared:end */

/* @arkzen:page:index */
/* @arkzen:page:layout:guest */

const IndexPage = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res  = await arkzenFetch('/api/task-manager/tasks')
      const data = await res.json()
      setTasks(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    if (!input.trim()) return
    await arkzenFetch('/api/task-manager/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: input }),
    })
    setInput('')
    load()
  }

  const remove = async (id: number) => {
    await arkzenFetch(`/api/task-manager/tasks/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-4">
      <h1 className="text-2xl font-bold">Task Manager</h1>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="New task..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button onClick={add} className="bg-neutral-900 text-white px-4 py-2 rounded-lg">
          <Plus size={16} />
        </button>
      </div>
      {loading ? (
        <p className="text-neutral-400 text-sm">Loading...</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(t => <TaskCard key={t.id} task={t} onDelete={() => remove(t.id)} />)}
        </div>
      )}
    </div>
  )
}

/* @arkzen:page:index:end */
```

---

## SECTION 29 — AI GENERATION CHECKLIST

Before finalizing any tatemono:

**DSL TAG FORMAT:**
- [ ] YAML blocks (meta, config, database, api, events, jobs, etc.) — opening tag has NO `*/`
- [ ] Code blocks (components, layout, animation, page, style, error) — opening tag HAS `*/` on same line
- [ ] Endpoint blocks — opening has NO `*/`, but next line IS `*/` as body separator
- [ ] ALL closing tags use `:end */` format
- [ ] Page layout line: `/* @arkzen:page:layout:name */` with `*/` inline

**RELATIONSHIPS:**
- [ ] foreignId columns use `foreign: table.id` (Format A) or `references: table` (Format B)
- [ ] Never write belongsTo/hasMany manually — engine auto-generates from foreign key

**IMPORTS:**
- [ ] ALL imports inside `@arkzen:components` or `@arkzen:layout` blocks
- [ ] NO imports inside `@arkzen:page` blocks
- [ ] NO `import React` in `@arkzen:animation`

**COMPONENTS:**
- [ ] `'use client'` at top of @arkzen:components
- [ ] All types, stores, utilities, components exported
- [ ] Zustand store defined in components block

**PAGES:**
- [ ] NO imports in page blocks
- [ ] NO `'use client'` in page blocks
- [ ] NO `export default` required (engine handles it)
- [ ] Component name: `<PageName>Page` PascalCase

**SECTION ORDER:**
- [ ] meta → config → database → api → routes → middleware → realtime → events → listeners → jobs → notifications → mail → console → endpoint → handler → layout → components → style → page → error → animation

---

## SECTION 30A — FONT RULES

- Google Fonts via `next/font/google` in `@arkzen:layout` or via CSS `@import` in `@arkzen:style`
- Font personality must match tatemono purpose
- Default: system font stack (no font import needed for basic tatemonos)

---

## SECTION 30B — IMAGE PLACEMENT

- External URLs: use directly in `<img>` or `<Image>` src
- Local assets: place in `tatemonos/<name>/assets/images/`, reference as `/tatemonos/<name>/assets/images/file.jpg`
- Seeder avatars: use pravatar.cc or ui-avatars.com for placeholder data
- Never hardcode base64 images in tatemono files

---

## SECTION 30C — STRICT API RULES

- `prefix` must start with `/api/`
- `route` values are relative to prefix
- Validation uses Laravel rule strings: `required|string|max:255`
- `middleware: []` for public, `middleware: [auth:sanctum]` for protected
- Resource CRUD: index, store, show, update, destroy

