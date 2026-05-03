# ARKZEN GUIDELINES DOCUMENT v7.6
## For Claude AI — Generating Tatemono Files

**UPDATED:** 2026-05-03
**VERIFIED AGAINST:** 21 active tatemonos including queue-flow (source of truth)
**CHANGES FROM v7.5:**
- FIXED: error:404 block — NEVER use export default (router appends its own)
- FIXED: error:404 component name must be NotFoundPage (not NotFound)
- FIXED: animation main function — NO export keyword, router adds it
- FIXED: animation function name must be camelCase(tatemono-name) + Animations
- FIXED: pageVariants KEEPS export const
- FIXED: api endpoints — description field is REQUIRED on every endpoint
- FIXED: tickets/child table seeder — remove if parent table seeder needed first
- FIXED: multiple @arkzen:components blocks — do NOT re-import icons/hooks across blocks
- FIXED: each @arkzen:components block still needs its own React import
- FIXED: GSAP target classes must exist on actual rendered elements
- ADDED: Section 3E — null safety rules for async data components  
- ADDED: Section 3F — localStorage safety rules
- ADDED: Section 19B — layout styling (inline styles allowed, not forced to Tailwind)
- ADDED: Section 23B — multiple components blocks import rules
- UPDATED: Section 22 — error:404/500 correct format
- UPDATED: Section 24 — animation naming and export rules
- UPDATED: Section 28 — complete working example updated
- UPDATED: Section 27 — 21 tatemonos

---

## SECTION 1 — WHAT IS ARKZEN

Arkzen is a full-stack scaffolding engine built on Next.js TypeScript and Laravel. It uses a single file format called a **Tatemono** to define an entire system — multiple database tables, multiple backend API resources, middleware, multiple frontend pages and components, multiple stores, real-time channels, background jobs, notifications, events, and animations — all in one file.

**One Tatemono = one complete, fully isolated client system.**

Each Tatemono is its own world. It does not share anything with other Tatemonos. No shared auth, no shared components, no shared stores. Every Tatemono stands alone.

**Stack:**
- Frontend: Next.js 16 + TypeScript + Tailwind CSS + Zustand
- Backend: Laravel 13 + SQLite (per-tatemono isolated) + Laravel Sanctum
- Real-time: Laravel Reverb
- Animation: GSAP + Framer Motion
- Icons: Lucide React (primary) + Hero Icons (secondary)
- Optional: Matter.js, Three.js, TipTap, Leaflet

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
- In multiple components blocks: only import in the FIRST block — subsequent blocks share the same file scope

---

## SECTION 2C — DESIGN AESTHETIC POLICY

Default to Awwwards-quality design. The queue-flow tatemono demonstrates the target quality level:
- Glassmorphism with `rgba` backgrounds and `backdropFilter: blur`
- Gradient backgrounds via inline style
- Soft shadows, rounded corners (border-radius 16-28px)
- Animated SVG components for data visualization
- Light/pastel color schemes work as well as dark

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

## ⚠️ SECTION 3D — DSL TAG FORMAT RULES (CRITICAL)

### TWO types of blocks:

**TYPE A — YAML content blocks** (no `*/` on opening line)
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
/* @arkzen:page:dashboard */
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
/* @arkzen:error:404:end */
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

All components that receive data from API calls must guard against undefined/null.

```tsx
// ✅ CORRECT — guard at component level
export const BigTicketDisplay = ({ data }: { data: MyTicketResponse }) => {
  if (!data || !data.ticket) {
    return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
      <Loader2 size={24} style={{ color: '#4a72c8' }} />
    </div>
  }
  const { ticket, position } = data
  // ... rest of component
}

// ✅ CORRECT — double optional chain for nested API objects
status?.queue?.name ?? 'Default'
status?.queue?.avg_wait_minutes ?? 5

// ❌ WRONG — single chain on nested object
status?.queue.name  // crashes if queue is undefined
```

Rules:
- Always use `?.` on EVERY level of a nested API object
- Always provide `?? fallback` values
- Components receiving async data must have a loading/null state
- Never assume API response shape — always guard

---

## SECTION 3F — LOCALSTORAGE SAFETY RULES

Always validate data after parsing from localStorage:

```tsx
// ✅ CORRECT
const saved = localStorage.getItem('my_key')
if (saved) {
  try {
    const parsed = JSON.parse(saved)
    if (parsed && parsed.requiredField) {  // validate structure
      setState(parsed)
    } else {
      localStorage.removeItem('my_key')   // clean up bad data
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
  name: QueueFlow
  short_name: Queue
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
    foreign: categories.id
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
# Format A — use foreign: table.id
employee_id:
  type: foreignId
  foreign: employees.id
  nullable: false

# Format B — use references: table
- { name: employee_id, type: foreignId, references: employees }
```

---

## ⚠️ SECTION 7C — SEEDER ORDER WARNING

If Table B has a `foreignId` pointing to Table A, **remove the seeder from Table B**. The engine seeds tables in definition order, and SQLite foreign key constraints will fail if the parent table isn't seeded first.

```tsx
// ✅ CORRECT — only seed the parent table
/* @arkzen:database:queues
seeder:
  data:
    - name: "General"
*/

/* @arkzen:database:tickets
table: tickets
columns:
  queue_id:
    type: foreignId
    foreign: queues.id
// ← NO seeder here — tickets created at runtime
*/
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

---

## SECTION 9 — @arkzen:routes

```tsx
/* @arkzen:routes
controller: MyController
middleware: []
routes:
  - method: GET
    route: /api/my-app/status/{id}
    handler: my_handler
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
/* @arkzen:realtime:my-channel.{id}
type: public
event: MyEventName
*/
```

Types: `public`, `private`, `presence`

---

## SECTION 12 — @arkzen:events:identifier

```tsx
/* @arkzen:events:queue-updated
model: Ticket
payload: [queue_id, action, ticket]
*/
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

```tsx
/* @arkzen:endpoint:check_in
*/
$employeeId = $request->input('employee_id');
$record = TimeRecord::create([...]);
return response()->json($record);
/* @arkzen:endpoint:check_in:end */
```

---

## SECTION 19 — @arkzen:layout:name

```tsx
/* @arkzen:layout:app */

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Settings } from 'lucide-react'

const NAV = [
  { href: '/my-app',          icon: Home,     label: 'Home'     },
  { href: '/my-app/settings', icon: Settings, label: 'Settings' },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router   = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #e8f2ff, #daeeff)' }}>
      <main style={{ paddingBottom: 80 }}>{children}</main>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.70)',
        backdropFilter: 'blur(24px)',
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
- Can use Tailwind classes OR inline styles OR both
- CANNOT import from @arkzen:components

---

## SECTION 19B — LAYOUT STYLING NOTES

Layouts often use glassmorphism or gradient backgrounds. Inline styles are preferred here because:
- `backdrop-filter` and `WebkitBackdropFilter` require inline styles in React
- Complex `box-shadow` and gradient values are easier inline
- Dynamic color values from state must be inline

```tsx
// Glassmorphism nav bar example
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
  // ...
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
- NO `export default` — router appends its own `export default NotFoundPage`
- NO `import React` — engine injects it
- NO `'use client'` — not-found is a server component
- Opening tag: `/* @arkzen:error:404 */` (with `*/` on same line)

### error:500 — CORRECT FORMAT:
```tsx
/* @arkzen:error:500 */

'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
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

---

## SECTION 23 — @arkzen:components:identifier

```tsx
/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { create } from 'zustand'
import { Plus, Trash2, Loader2, ArrowRight } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// Types, Store, Utilities, Components all here
// ...

/* @arkzen:components:shared:end */
```

**Rules:**
- Opening tag: `/* @arkzen:components:shared */` (with `*/` on same line)
- `'use client'` at top
- ALL types, stores, utilities, hooks, components exported
- All imports for ALL components in this block go here

---

## ⚠️ SECTION 23B — MULTIPLE COMPONENTS BLOCKS IMPORT RULES (CRITICAL)

When using multiple `@arkzen:components` blocks (e.g. `shared` and `admin`):

```tsx
/* @arkzen:components:shared */
'use client'
import React, { useState, useCallback } from 'react'
import { Users, Clock, Loader2, SkipForward } from 'lucide-react'
// ... all shared components
/* @arkzen:components:shared:end */

/* @arkzen:components:admin */
'use client'
import React, { useCallback } from 'react'
// ← DO NOT re-import icons/hooks that are already in shared
// ← The engine inlines all blocks into one file — duplicates cause "Duplicate declaration" errors
// ← Only import what is UNIQUE to this block

export const AdminButton = () => {
  // SkipForward, Loader2 from shared are available here — do not reimport
  return <button><SkipForward size={16} /></button>
}
/* @arkzen:components:admin:end */
```

**Rules:**
- Each block still needs its own `'use client'` and `React` import
- Do NOT re-import icons, utilities, or hooks that exist in a previous components block
- The engine inlines all components blocks into one file — duplicate imports = `Duplicate declaration` error
- Only add imports for things unique to that block

---

## SECTION 24 — @arkzen:animation

```tsx
/* @arkzen:animation */

import { gsap } from 'gsap'

const queueFlowAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.header-section',
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    )
    gsap.fromTo('.stat-pill',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.2 }
    )
    gsap.fromTo('.card-row',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out', delay: 0.35 }
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
  - `barbershop-booking` → `barbershopBookingAnimations`
- `pageVariants`: **KEEP `export const`** — used directly in pages
- NO `import React` in animation block
- GSAP target class names (`.stat-pill`, `.card-row`) **MUST exist** on actual rendered elements in components
- Close with `/* @arkzen:animation:end */`

---

## SECTION 25 — ASSETS FOLDER

Static media at `tatemonos/<name>/assets/`. Auto-copied to public folder.
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

**Optional (already installed):**
```tsx
import L from 'leaflet'
import { useEditor, EditorContent } from '@tiptap/react'
import * as THREE from 'three'
import Matter from 'matter-js'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
```

---

## SECTION 27 — ACTIVE TATEMONOS (21 Total)

```
auth-test                v1.0.0  auth:true   pages: login, register, dashboard
barbershop-booking       v1.0.0  auth:false  pages: index
body-endpoint-handler    v1.0.0  auth:false  pages: index
body-mail-notification   v1.0.0  auth:true   pages: login, register, dashboard
broadcast-test           v1.0.0  auth:true   pages: login, register, dashboard
crud-test                v1.0.0  auth:false  pages: index
dtr-geofencing           v2.0.0  auth:false  pages: index, admin  layout:app
errors-test              v1.0.0  auth:false  pages: index  error:404 error:500
events-test              v1.0.0  auth:false  pages: index
inventory-management     v1.0.0  auth:false  pages: index
jo-payroll               v3.0.0  auth:false  pages: index,job-database,cash-atm,sss,hdmf,appointments,payslip  layout:app
job-test                 v1.0.0  auth:false  pages: dashboard
mail-test                v2.0.0  auth:true   pages: login, register, dashboard
middleware-test          v2.0.0  auth:false  pages: index
new-updates-styles       v2.0.0  auth:false  pages: index, about, features
notification-test        v2.1.0  auth:true   pages: login, register, dashboard
portfolio-test           v1.0.0  auth:false  pages: index
queue-flow               v1.0.0  auth:false  pages: index, join, admin  layout:app  pwa:true
roles-test               v2.1.0  auth:true   pages: login, register, dashboard
scheduler-test           v2.0.0  auth:false  pages: dashboard
upload-test              v1.0.0  auth:false  pages: dashboard
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
seeder:
  count: 2
  data:
    - title: "First task"
      status: pending
    - title: "Second task"
      status: active
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
    description: Get all tasks
    response:
      type: collection
  store:
    method: POST
    route: /tasks
    description: Create a task
    validation:
      title: required|string|max:255
    response:
      type: single
  destroy:
    method: DELETE
    route: /tasks/{id}
    description: Delete a task
    response:
      type: message
      value: Task deleted
*/

/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect } from 'react'
import { create } from 'zustand'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

export interface Task {
  id: number
  title: string
  status: string
}

interface AppState {
  tasks: Task[]
  setTasks: (t: Task[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
}))

export const TaskCard = ({ task, onDelete }: { task: Task; onDelete: () => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.80)', backdropFilter: 'blur(8px)' }}>
    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#1a2a4a' }}>{task.title}</span>
    <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
      <Trash2 size={14} />
    </button>
  </div>
)

/* @arkzen:components:shared:end */

/* @arkzen:page:index */
/* @arkzen:page:layout:guest */

const IndexPage = () => {
  const { tasks, setTasks } = useAppStore()
  const [input, setInput] = useState('')
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
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f2050', marginBottom: 24 }}>Task Manager</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="New task..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: 14, border: '1px solid rgba(100,150,230,0.25)', background: 'rgba(255,255,255,0.55)', fontSize: 14, outline: 'none' }}
        />
        <button onClick={add} style={{ padding: '12px 16px', borderRadius: 14, background: '#3a6fd8', border: 'none', color: 'white', cursor: 'pointer' }}>
          <Plus size={16} />
        </button>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 size={24} style={{ color: '#4a72c8' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map(t => <TaskCard key={t.id} task={t} onDelete={() => remove(t.id)} />)}
        </div>
      )}
    </div>
  )
}

/* @arkzen:page:index:end */

/* @arkzen:error:404 */

const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 64, fontWeight: 900, color: 'rgba(74,114,216,0.20)', margin: 0 }}>404</p>
      <p style={{ color: '#7a9bc4', marginTop: 8 }}>Page not found</p>
    </div>
  </div>
)

/* @arkzen:error:404:end */

/* @arkzen:animation */

import { gsap } from 'gsap'

const taskManagerAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.task-card',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:     { opacity: 0, transition: { duration: 0.2 } },
}

/* @arkzen:animation:end */
```

---

## SECTION 29 — AI GENERATION CHECKLIST

Before finalizing any tatemono:

**DSL TAG FORMAT:**
- [ ] YAML blocks (meta, config, database, api, etc.) — NO `*/` on opening line
- [ ] Code blocks (components, layout, animation, page, style, error) — HAS `*/` on same line
- [ ] Endpoint blocks — NO `*/` on opening, `*/` on NEXT line
- [ ] ALL closing tags use `:end */` format

**DATABASE:**
- [ ] foreignId uses `foreign: table.id` (Format A) or `references: table` (Format B)
- [ ] Child table with foreignId has NO seeder if parent needs to seed first
- [ ] description field on EVERY api endpoint

**IMPORTS:**
- [ ] ALL imports inside `@arkzen:components` or `@arkzen:layout` blocks
- [ ] NO imports inside `@arkzen:page` blocks
- [ ] NO `import React` in `@arkzen:animation`
- [ ] Multiple components blocks — no duplicate icon/hook imports across blocks
- [ ] Each components block still has its own React import

**ERROR HANDLERS:**
- [ ] error:404 component named `NotFoundPage` exactly
- [ ] error:404 has NO `export default` — router adds it
- [ ] error:404 has NO `import React` — engine adds it
- [ ] error:404 has NO `'use client'`
- [ ] error:500 has `'use client'` and `export default function Error`

**ANIMATION:**
- [ ] Main animation function has NO `export` — router adds it
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
- [ ] meta → config → database → api → routes → middleware → realtime → events → listeners → jobs → notifications → mail → console → endpoint → handler → layout → components → style → page → error → animation

