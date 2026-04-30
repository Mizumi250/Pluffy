# ARKZEN GUIDELINES DOCUMENT v7.4
## For Claude AI — Generating Tatemono Files

**UPDATED:** 2026-04-28  
**WHAT:** Import placement rules, PWA/offline DSL (v7.5 implemented early), `'use client'` rules, custom layout rules, store-in-components rule, `@arkzen:page` declaration syntax fix, layout collision fix, font personality rules, image placement rules, strict API block rules  
**VERIFIED AGAINST:** All 18 active tatemonos + barbershop-booking (19th tatemono)  
**NEW SECTIONS:** 3A (Import Placement), 3B (`'use client'` Rules), 19A (Custom Layout Best Practices), 19B (Layout Collision Fix), 30A (Font Rules), 30B (Image Placement), 30C (Strict API Rules)

---

## SECTION 1 — WHAT IS ARKZEN

Arkzen is a full-stack scaffolding engine built on Next.js TypeScript and Laravel. It uses a single file format called a **Tatemono** to define an entire system — multiple database tables, multiple backend API resources, middleware, multiple frontend pages and components, multiple stores, real-time channels, background jobs, notifications, events, and animations — all in one file.

**One Tatemono = one complete, fully isolated client system.**

Each Tatemono is its own world. It does not share anything with other Tatemonos. No shared auth, no shared components, no shared stores. Every Tatemono stands alone.

The engine is a **distribution tool**. It does NOT control or limit. The user controls everything. The engine just distributes the user's instructions to the right places.

**Stack:**
- Frontend: Next.js 16 + TypeScript + **Tailwind CSS** (required) + Zustand
- Backend: Laravel 13 + SQLite (per-tatemono isolated) + Laravel Sanctum
- Real-time: Laravel Reverb + custom CRDT
- Animation: GSAP + Framer Motion
- Icons: **Lucide React** (primary) + **Hero Icons** (secondary) — see Section 2B
- Optional: Matter.js, Three.js, TipTap, Leaflet

---

## SECTION 2 — TAILWIND CSS POLICY

**Tailwind CSS is the required default for all styling in Tatemono files.**

This is a hard requirement for AI generation:
- All custom components use Tailwind utility classes
- All page layouts use Tailwind utility classes
- All engine utility classes (arkzen-container, arkzen-card, etc.) are Tailwind-based

**What IS allowed for advanced customization:**
```tsx
// CSS modules — allowed for complex animations or design system overrides
import styles from './page.module.css'
<div className={styles.specialEffect}>...</div>

// Inline styles — allowed for dynamic values (computed widths, colors from data)
<div style={{ width: `${progress}%`, backgroundColor: brandColor }}>...</div>

// CSS variables — allowed for theming
<div style={{ '--accent': '#FF5733' } as React.CSSProperties}>...</div>
```

**What is NOT allowed:**
- Plain CSS replacing Tailwind (no `import './styles.css'` as the primary styling approach)
- Styled-components or Emotion (not installed)
- Bootstrap or other CSS frameworks

---

## SECTION 2B — ICON & EMOJI POLICY

### Icons: Lucide React (Primary) + Hero Icons (Secondary)

**Lucide React is the default icon library for all Tatemono UI.**

```tsx
// Import from lucide-react — always prefer this first
import { Plus, Trash2, Edit2, Search, Bell, ChevronRight, X } from 'lucide-react'

// Hero Icons — use only when Lucide doesn't have the needed icon
import { SparklesIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
```

**Rules:**
```
1. ALWAYS import from lucide-react first — check Lucide before Hero Icons
2. Use Hero Icons only when the specific icon is not in Lucide
3. Never use emoji as icon replacements — use actual icon components
4. Icon size: use the `size` prop on Lucide (e.g. <Plus size={16} />)
5. Icon size: use className on Hero Icons (e.g. className="w-4 h-4")
6. Never use both lucide AND heroicons for the same semantic meaning
7. Icons must be semantically correct — don't use a heart icon for a delete button
```

**Common Lucide icons for standard UI actions:**
```
Plus, Minus, X (close), Check, ChevronRight, ChevronLeft, ChevronDown, ChevronUp
Search, Filter, SortAsc, SortDesc
Edit2, Edit3, Pencil (edit), Trash2 (delete), Copy
Eye, EyeOff (show/hide)
Bell, BellOff (notifications)
Upload, Download, ExternalLink
User, Users, UserPlus
Settings, Sliders
LogIn, LogOut
Home, Menu, LayoutDashboard
Package, Box, Tag, Layers (inventory/products)
Mail, Send, Inbox
Calendar, Clock, Timer
AlertCircle, AlertTriangle, Info, CheckCircle, XCircle (status)
Loader2 (loading spinner — use animate-spin)
MoreHorizontal, MoreVertical (overflow menu)
```

### Emoji Policy

**Emoji must only be used when ABSOLUTELY necessary — meaning the design specifically calls for emoji as content (e.g. a reaction picker, an emoji-based mood tracker).**

```
NEVER use emoji as:
- Navigation icons
- Button icons
- Status indicators
- Section headers
- Loading states
- Toast icons

ONLY use emoji when:
- The feature is literally about emoji (reaction system, emoji picker)
- The brand/client explicitly requires emoji in UI
- Content data itself is emoji (e.g. displaying user-submitted emoji reactions)
```

---

## SECTION 2C — DESIGN AESTHETIC POLICY

### Awwwards-Quality, Apple-Minimalist Design Standard

All Tatemono UI must meet a **modern, minimalist, premium standard** — think Apple.com, Linear.app, Vercel.com, Stripe Dashboard. Reference Awwwards.com for inspiration. Every page should feel production-ready enough to ship to a real client on day one.

**Design Principles:**
```
1. Whitespace over clutter — give elements room to breathe
2. Neutral palette foundation — whites, off-whites, neutral-50/100/200 as base
3. One accent color maximum per tatemono — never rainbow UI
4. Typography hierarchy — clear size/weight contrast between headings and body
5. Micro-interactions — hover states, transitions on buttons/cards
6. Consistent border radius — pick one and stick to it per tatemono (usually rounded-xl or rounded-2xl)
7. Subtle shadows — shadow-sm or shadow-md, never heavy drop shadows
8. Border as separator — prefer border-neutral-100/200 over background fills
9. Cards have purpose — every card-like element has clear visual hierarchy inside it
10. Actions are clear — primary action is always visually dominant
```

**Color System (what to default to when user doesn't specify):**
```tsx
// Backgrounds
bg-white              // main content areas
bg-neutral-50         // page/outer backgrounds
bg-neutral-100        // subtle hover/active states

// Text
text-neutral-900      // primary text (headings)
text-neutral-700      // secondary text (body copy)
text-neutral-500      // tertiary text (captions, helpers)
text-neutral-400      // disabled/muted text

// Borders
border-neutral-200    // primary borders
border-neutral-100    // subtle dividers

// Accents (pick ONE per tatemono and use consistently)
blue, emerald, violet, amber, rose — use Tailwind's 600–700 shades for solid, 50–100 for backgrounds
```

**Button Design Standard:**
```tsx
// Primary CTA — most visually dominant
<button className="bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-colors">
  Action
</button>

// Secondary button — lower visual weight
<button className="border border-neutral-200 text-neutral-900 px-4 py-2 rounded-lg font-medium hover:bg-neutral-50 transition-colors">
  Action
</button>

// Tertiary/icon button — minimal visual weight
<button className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg px-2 py-2 transition-colors">
  <Icon size={18} />
</button>
```

**Card Design Standard:**
```tsx
// Basic card
<div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
  Content
</div>

// Card with section header
<div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
  <div className="px-6 py-4 border-b border-neutral-100">
    <h2 className="text-sm font-semibold text-neutral-900">Section Title</h2>
    <p className="text-xs text-neutral-500 mt-0.5">Optional description</p>
  </div>
  <div className="p-6">
    ...
  </div>
</div>
```

**Table Design Standard:**
```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-neutral-100">
      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wide">Name</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
      <td className="px-4 py-3.5 text-neutral-700">...</td>
    </tr>
  </tbody>
</table>
```

**Form Input Standard:**
```tsx
<input
  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
  placeholder="Enter value..."
/>
```

**Page Header Standard:**
```tsx
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-xl font-semibold text-neutral-900">Page Title</h1>
    <p className="text-sm text-neutral-500 mt-0.5">Supporting description</p>
  </div>
  <button className="bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2">
    <Plus size={15} /> Primary Action
  </button>
</div>
```

---

## SECTION 3 — TATEMONO FILE RULES

```
1. One Tatemono = one complete isolated system
2. File extension is always .tsx
3. File lives at: tatemonos/<n>/core.tsx
4. Tatemono name is always lowercase with hyphens
   CORRECT:   pos-system
   CORRECT:   project-management
   WRONG:     PosSystem

5. Sections declared with @arkzen markers
6. Sections must appear in this EXACT order:
   @arkzen:meta                     (once)
   @arkzen:config                   (optional, once)
   @arkzen:database[:identifier]    (REPEAT — identifier optional when single table)
   @arkzen:api[:identifier]         (REPEAT — identifier optional when single resource)
   @arkzen:routes                   (optional — custom routes, no identifier)
   @arkzen:middleware:name          (optional, REPEAT — named :end block with PHP body)
   @arkzen:store:identifier         (optional, REPEAT)
   @arkzen:realtime:identifier      (optional, REPEAT — named :end block)
   @arkzen:events:identifier        (optional, REPEAT — named :end block)
   @arkzen:listener:name            (optional, REPEAT — named :end block with PHP body)
   @arkzen:jobs:identifier          (optional, REPEAT — named :end block with PHP body)
   @arkzen:notifications:identifier (optional, REPEAT — named :end block, YAML + optional toMail() body)
   @arkzen:mail:identifier          (optional, REPEAT — named :end block, YAML + optional blade_body)
   @arkzen:console:identifier       (optional, REPEAT — named :end block with PHP body)
   @arkzen:endpoint:name            (optional, REPEAT — named :end block with PHP body)
   @arkzen:handler:name             (optional, REPEAT — named :end block with PHP body)
   @arkzen:layout:name              (optional, REPEAT — custom layouts)
   @arkzen:components:identifier    (REPEAT — one per group)
   @arkzen:style                    (optional, once — global CSS)
   @arkzen:style:name               (optional, REPEAT — CSS Modules per component)
   @arkzen:page:name                (REPEAT — one per page/route)
   @arkzen:error:404                (optional — Next.js not-found.tsx component)
   @arkzen:error:500                (optional — Next.js error.tsx component)
   @arkzen:animation                (optional, once)

7. Everything is TypeScript strictly typed — no 'any'
8. All imports go inside @arkzen:components blocks or @arkzen:layout blocks (see Section 3A)
9. Each Tatemono is a fully self-contained isolated system
10. Tatemonos do NOT share anything with each other
```

---

## SECTION 3A — ⚠️ IMPORT PLACEMENT RULES (NEW — CRITICAL)

This is the #1 source of bugs in AI-generated tatemonos. Follow these rules exactly.

### The Golden Rule

> **Imports belong in the block where they are used. Never in `@arkzen:page` blocks.**

The engine generates each `@arkzen:page` as a separate Next.js page file. The engine automatically injects the component code from `@arkzen:components` into every page. If you put imports inside `@arkzen:page`, they collide with what the engine already injected.

### Where imports go

| Block | Can have imports? | Notes |
|-------|------------------|-------|
| `@arkzen:components:*` | ✅ YES — this is the primary home for all imports | Engine strips duplicate React imports automatically |
| `@arkzen:layout:*` | ✅ YES — layout blocks are self-contained files | Must include all imports the layout needs |
| `@arkzen:store:*` | ✅ YES — store files are separate generated files | Include `import { create } from 'zustand'` here |
| `@arkzen:animation` | ✅ YES — animation file is a separate generated file | Import gsap/framer here |
| `@arkzen:page:*` | ❌ NO — page blocks must NOT contain import statements | The engine provides React, layout, and all component code |
| `@arkzen:endpoint:*` | ❌ NO — PHP blocks only, no JS/TS imports | |
| `@arkzen:handler:*` | ❌ NO — PHP blocks only | |

### What the engine does automatically (do NOT duplicate these)

The engine's router AUTOMATICALLY adds to every generated page file:
```tsx
'use client'
import React, { useRef, useEffect, ...detected_hooks } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'  // or AuthLayout or CustomLayout
// + all component code from @arkzen:components blocks (inline, not as import)
```

**Never manually write any of the above in `@arkzen:page` blocks.** The engine already handles them.

### Correct pattern — all imports in `@arkzen:components`

```tsx
/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit2, Search, ChevronDown } from 'lucide-react'
import { Modal } from '@/arkzen/core/components/Modal'
import { useQuery } from '@/arkzen/core/hooks/useQuery'
import { useMutation } from '@/arkzen/core/hooks/useMutation'

// Types, constants, utilities, and shared components defined here...
export interface MyModel { ... }
export const MY_CONSTANTS = [...]
export const MySharedComponent = () => { ... }

/* @arkzen:components:shared:end */
```

```tsx
/* @arkzen:page:dashboard
/* @arkzen:page:layout:app */

// NO imports here — they come from @arkzen:components above

const DashboardPage = () => {
  const [data, setData] = useState([])  // useState is available — engine detected it
  
  return (
    <div>
      <MySharedComponent />   {/* available — injected from @arkzen:components */}
    </div>
  )
}

export default DashboardPage

/* @arkzen:page:dashboard:end */
```

### React hooks auto-detection

The engine scans `@arkzen:components` and detects all used React hooks. It builds the merged `import React, { useState, useEffect, ... }` automatically. This means:

- If you use `useState` in components → available in all pages
- If you use `useEffect` in components → available in all pages
- If you need a hook ONLY in a specific page, add a dummy usage or usage comment in components
- `useRef` and `useEffect` are always added by the engine (needed for animations)

### Multiple `@arkzen:components` blocks

If you have multiple `@arkzen:components` blocks, ALL of them are merged and injected into every page. This means you only need to declare each import ONCE across all component blocks combined.

```tsx
/* @arkzen:components:types */
'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export interface Product { ... }
export type ProductStatus = 'active' | 'inactive'
/* @arkzen:components:types:end */

/* @arkzen:components:ui */
// No need to re-import React or lucide — already imported above
// Engine merges all components blocks into one file
export const ProductCard = ({ product }: { product: Product }) => { ... }
export const StatusBadge = ({ status }: { status: ProductStatus }) => { ... }
/* @arkzen:components:ui:end */
```

---

## SECTION 3B — ⚠️ `'use client'` DIRECTIVE RULES (NEW — CRITICAL)

### The Rule

```
'use client' belongs in @arkzen:components and @arkzen:layout blocks.
NEVER put 'use client' in @arkzen:page blocks.
NEVER put 'use client' in @arkzen:store blocks.
```

### Why

The engine prepends `'use client'` automatically to all generated files:
- `_components.tsx` — engine adds `'use client'` at top
- `page.tsx` (each page) — engine adds `'use client'` at top
- Custom layout files — engine adds `'use client'` at top

If you add `'use client'` inside `@arkzen:page`, it becomes a duplicate directive inside the generated file body — which causes Next.js to crash.

### The engine strips 'use client' from component code

The router automatically strips `'use client'` from `@arkzen:components` raw content before injecting into pages. This means:

✅ Writing `'use client'` in `@arkzen:components` is safe — it will be stripped when inlined into pages, but it documents intent.

❌ Writing `'use client'` in `@arkzen:page` blocks is NOT safe — the engine does NOT strip it from page blocks.

### Summary table

| Block | Write `'use client'`? | Reason |
|-------|----------------------|--------|
| `@arkzen:components:*` | ✅ Write it (optional but good practice) | Engine strips it from inline injection |
| `@arkzen:layout:*` | ✅ Write it (required) | Layout is a standalone file, needs directive |
| `@arkzen:page:*` | ❌ Never write it | Engine adds it at top; duplicate = crash |
| `@arkzen:store:*` | ❌ Never write it | Zustand stores are not React components |
| `@arkzen:animation` | ❌ Never write it | Animation file is server-safe utility |

---

## SECTION 3C — ⚠️ ZUSTAND STORE RULES (NEW — CRITICAL)

### The Store-in-Components Rule

**When pages need to use a Zustand store, the store code MUST be defined inside `@arkzen:components`, not only in `@arkzen:store`.**

This is because the engine generates each page as a standalone file. `@arkzen:store` creates a separate `/stores/` file. But that store file is NOT automatically imported into page files — you would need to manually import it, which creates cross-file dependencies the engine doesn't wire.

**The correct approach:**

```tsx
/* @arkzen:store:myStore */

import { create } from 'zustand'

// Store defined here too — this creates the standalone /stores/myStore.ts file
// But pages won't auto-import from it

/* @arkzen:store:myStore:end */

/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect } from 'react'
import { create } from 'zustand'  // Import create here too

// ─── Store (inline in components so all pages can use it) ─────────────────────
export interface MyItem { id: number; name: string }

interface MyState {
  items: MyItem[]
  setItems: (items: MyItem[]) => void
  addItem: (item: MyItem) => void
}

export const useMyStore = create<MyState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}))

// ─── Other shared components ──────────────────────────────────────────────────
export const MyComponent = () => {
  const { items } = useMyStore()
  return <div>{items.length} items</div>
}

/* @arkzen:components:shared:end */
```

**Or skip `@arkzen:store` entirely** and just define the store inside `@arkzen:components`. The `@arkzen:store` block is useful when you want a standalone store file for external use, but for tatemono-internal pages, `@arkzen:components` is the source of truth.

### Alternative: Single-block approach (simpler, recommended for AI generation)

For most tatemonos, skip `@arkzen:store` entirely and define stores directly in `@arkzen:components`:

```tsx
/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { Plus, Trash2 } from 'lucide-react'

// Store lives here — accessible by all pages
export const useOrderStore = create<OrderState>((set) => ({ ... }))

// Types, constants, components also live here
export interface Order { ... }
export const OrderCard = () => { ... }

/* @arkzen:components:shared:end */
```

---

## SECTION 4 — AUTH RULES (CRITICAL)

**Auth is opt-in per Tatemono. Most Tatemonos do NOT use auth.**

```
auth: false  → No login/register pages. No useAuthStore. No GuestLayout/AuthLayout.
               All pages use layout:guest. Routes are fully public.

auth: true   → Has login and/or register pages (layout:guest).
               Has protected pages (layout:auth).
               Must call setActiveTatemono('<tatemono-name>') in @arkzen:components.
               Must import useAuthStore from '@/arkzen/core/stores/authStore'.
```

**RULE: Only generate auth pages (login, register) if `auth: true` is explicitly set.**

When `auth: false`:
- Do NOT generate a login page
- Do NOT generate a register page
- Do NOT import or use `useAuthStore`
- Do NOT use `layout:auth` on any page
- All pages use `layout:guest`
- Use `arkzenFetch` only if the Tatemono needs to call its own public API

When `auth: true`:
- You MUST call `setActiveTatemono('<n>')` once in the first `@arkzen:components` block:
  ```tsx
  import { useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'
  if (typeof window !== 'undefined') {
    setActiveTatemono('your-tatemono-name')
  }
  ```
- This scopes all auth API calls to `/api/<tatemono-name>/auth/*`
- Login page → `layout:guest`
- Register page → `layout:guest`
- Protected pages → `layout:auth`

**Auth Redirect Behavior (when auth: true):**
- Unauthenticated user visits `layout:auth` page → redirect to login
- Authenticated user visits `layout:guest` page → redirect to first `layout:auth` page

**Roles (when auth: true):**
- Users table includes a `role` column (varchar 20, default 'user') — managed by AuthBuilder automatically
- Promote/demote via endpoint keys: `promote`, `demote`
- Admin-only endpoints use endpoint key: `adminOnly`
- User-only endpoints use endpoint key: `userOnly`
- No need to add @arkzen:database:users — AuthBuilder handles it
- Middleware can require role: `middleware: [auth, role:admin]`

---

## SECTION 5 — @arkzen:meta

```tsx
/* @arkzen:meta
name: pos-system
version: 1.0.0
description: Point of sale system for retail businesses
auth: false
favicon: https://example.com/favicon.ico
auth_seed:
  users:
    - email: admin@example.com
      password: secure_password_123
      name: Admin User
      role: admin
    - email: staff@example.com
      password: staff_password_456
      name: Staff Member
      role: user
*/
```

**Fields:**
- `name` (required) — lowercase with hyphens, matches directory name
- `version` (required) — semantic versioning (1.0.0)
- `description` (optional) — brief purpose
- `auth` (required) — `true` or `false`
- `favicon` (optional) — URL to favicon
- `auth_seed.users` (optional, only if `auth: true`) — seeded users with roles

**auth_seed behavior:**
- Passwords are automatically hashed with bcrypt
- Seeds are **idempotent** — re-running doesn't create duplicates (upserts by email)
- Only available when `auth: true`
- User role defaults to `user` if not specified
- Example: roles-test, body-mail-notification

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
table:
  striped: true
  hoverable: true
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
  auth:
    className: "min-h-screen bg-neutral-50"
*/
```

All fields are optional. Defaults applied if omitted.

**Toast config:**
- `position`: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
- `duration`: milliseconds

**Modal config:**
- `borderRadius`: rounded-lg, rounded-xl, rounded-2xl
- `backdrop`: blur, dark, light
- `animation`: fadeScale, slideUp, slideDown

**Table config:**
- `striped`: true/false
- `hoverable`: true/false

**Layout config:**
- `guest.className`: Tailwind classes for guest layout
- `auth.className`: Tailwind classes for auth layout

---

## SECTION 7 — @arkzen:database

**IMPORTANT: Columns are defined as a DICT (map), NOT as an array list.**

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
  sku:
    type: string
    length: 255
    unique: true
  name:
    type: string
    length: 255
    nullable: false
  description:
    type: text
    nullable: true
  price:
    type: decimal
    precision: 8
    scale: 2
  stock:
    type: integer
    default: 0
    nullable: false
  category_id:
    type: integer
    nullable: true
  created_at:
    type: timestamp
seeder:
  count: 5
  data:
    - sku: "PROD001"
      name: "Laptop"
      price: "999.99"
      stock: 10
      category_id: 1
    - sku: "PROD002"
      name: "Mouse"
      price: "29.99"
      stock: 50
      category_id: 2
*/
```

**Column Format (DICT, not array):**
- Column name as key: `id:`, `sku:`, `price:`, etc.
- Each column is an object with `type` and optional modifiers

**Column Types:**
```
integer, bigInteger, string (default 255), text, longText,
decimal (with precision + scale), float,
boolean, date, datetime, timestamp, json, uuid
```

**Column Modifiers:**
- `length` (for string) — default 255
- `nullable` (boolean) — default false
- `default` (scalar value)
- `primary` (boolean)
- `autoIncrement` (boolean) — only for primary integer keys
- `unique` (boolean)
- `precision` + `scale` (for decimal) — e.g., precision: 8, scale: 2 = 999999.99

**Seeder Data:**
- `count`: number of items to generate (optional; if omitted, use array length)
- `data`: YAML array of objects with scalar values

**Timestamps:**
- `timestamps: true` — auto-adds `created_at` and `updated_at`
- `softDeletes: false` — don't add `deleted_at`

---

## SECTION 8 — @arkzen:api

**IMPORTANT: Endpoints are defined as a DICT (map) with endpoint name as key, NOT as an array list.**

```tsx
/* @arkzen:api:products
model: Product
controller: ProductController
prefix: /api/products
middleware: [auth]
resource: true
policy: true
factory: true
endpoints:
  index:
    method: GET
    route: /products
    description: List all products
    response:
      type: collection
  
  store:
    method: POST
    route: /products
    description: Create product
    validation:
      name: required|string|max:255
      price: required|numeric|min:0.01
      stock: required|integer|min:0
    response:
      type: single
  
  show:
    method: GET
    route: /products/{id}
    description: Get single product
    response:
      type: single
  
  update:
    method: PUT
    route: /products/{id}
    description: Update product
    validation:
      name: string|max:255
      price: numeric|min:0.01
      stock: integer|min:0
    response:
      type: single
  
  destroy:
    method: DELETE
    route: /products/{id}
    description: Delete product
    response:
      type: message
      value: "Product deleted successfully"

  adminOnly:
    method: GET
    route: /products/admin/stats
    description: Admin-only product stats
    response:
      type: single

  promote:
    method: POST
    route: /users/{id}/promote
    description: Promote user role
    response:
      type: message

  demote:
    method: POST
    route: /users/{id}/demote
    description: Demote user role
    response:
      type: message
*/
```

**Top-level Fields:**
- `model` (required) — Eloquent model name (PascalCase)
- `controller` (required) — Controller class name
- `prefix` (required) — API route prefix (e.g., `/api/products`)
- `middleware` (optional, array) — Middleware: `[auth]`, `[role:admin]`, custom names, etc.
- `resource` (optional, boolean) — Generate ResourceTransformer class
- `policy` (optional, boolean) — Generate authorization Policy
- `factory` (optional, boolean) — Generate Model Factory for testing
- `endpoints` (required, dict) — Endpoint definitions

**Endpoint Format (DICT keys = endpoint names):**

Each endpoint is a key in the `endpoints` dict. The key name determines the controller method:
- `index` → GET / (list)
- `store` → POST / (create)
- `show` → GET /:id (get single)
- `update` → PUT /:id (update)
- `destroy` → DELETE /:id (delete)
- `adminOnly` → Admin-only gate
- `userOnly` → User-only gate
- `promote` → Role promotion
- `demote` → Role demotion
- Custom names → Custom endpoints

**Per-Endpoint Fields:**
- `method` (required) — HTTP method: GET, POST, PUT, DELETE, PATCH
- `route` (required) — API route path (e.g., `/products`, `/products/{id}`)
- `description` (optional) — Endpoint documentation
- `validation` (optional, dict) — Laravel validation rules as key:value
  - Format: `field_name: required|string|max:255`
  - Rules: `required`, `string`, `integer`, `numeric`, `email`, `unique:table`, `max:N`, `min:N`, etc.
- `response` (optional, dict) — Response shape
  - `type`: `single` (one resource), `collection` (array), `paginated` (paginated array), `message` (JSON message)
  - `value`: (optional) For `message` type, the response message text

**Validation Rules (Laravel Format):**
```
required, nullable, string, integer, numeric, boolean, email
max:255, min:1, unique:table, confirmed, regex:/pattern/
date, datetime, before:date, after:date
array, json, in:value1,value2
```

**Response Types:**
- `single` — Single resource object
- `collection` — Array of resources
- `paginated` — Paginated array (with pagination metadata)
- `message` — JSON response with message field

---

## SECTION 9 — @arkzen:routes (Custom Routes)

Custom routes with optional handler body injection.

```tsx
/* @arkzen:routes
controller: SimulateErrorController
middleware: []
routes:
  - method: GET
    route: /api/errors-test/simulate/{code}
    handler: simulate
  - method: POST
    route: /api/health-check
    handler: check_status
*/

/* @arkzen:handler:simulate
$code = request()->route('code');
return response()->json([
  'status' => 'error',
  'code' => $code,
  'message' => 'Simulated error'
], (int)$code);
/* @arkzen:handler:simulate:end */

/* @arkzen:handler:check_status
return response()->json([
  'status' => 'ok',
  'timestamp' => now()
]);
/* @arkzen:handler:check_status:end */
```

**Route Definition:**
- `method` — HTTP method (GET, POST, PUT, DELETE)
- `route` — Full route path including `/api/prefix`
- `handler` — Handler name (referenced in @arkzen:handler blocks)

**Handler Body Rules:**
- Enclosed in `/* @arkzen:handler:name ... :end */` blocks
- PHP code only (no opening `<?php` tag)
- Must return a response (JSON or view)
- Access path parameters via `request()->route('param_name')`

---

## SECTION 10 — @arkzen:middleware:name

Custom middleware with body injection.

```tsx
/* @arkzen:middleware:requireJson
*/

if (!$request->isJson()) {
  return response()->json(['error' => 'JSON required'], 415);
}

return $next($request);

/* @arkzen:middleware:requireJson:end */
```

**Middleware Rules:**
- Named block: `@arkzen:middleware:name`
- PHP body injected into `handle()` method
- Must call `return $next($request)` at end
- Automatically registered as alias (e.g. `middleware('requireJson')`)
- Can be applied to routes via middleware option in @arkzen:routes or @arkzen:api

**Using Middleware:**
- In @arkzen:api: `middleware: [auth, role:admin, requireJson]`
- In @arkzen:routes: `middleware: [requireJson]`

---

## SECTION 11 — @arkzen:store:identifier

Zustand store definitions for frontend state management.

> ⚠️ See Section 3C for the critical rule: stores must ALSO be defined in `@arkzen:components` for pages to use them. `@arkzen:store` alone is NOT enough.

```tsx
/* @arkzen:store:cartStore

import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  clear: () => set({ items: [] })
}))

/* @arkzen:store:cartStore:end */
```

**Store Pattern:**
- Define interface for state + actions
- Use Zustand `create` hook with modern import: `import { create } from 'zustand'`
- Export hook as `use<StoreName>Store`
- Use in components: `const { items, addItem } = useCartStore()`

---

## SECTION 12 — @arkzen:realtime:identifier

Real-time channels (Reverb).

```tsx
/* @arkzen:realtime:messages
type: broadcast
channels:
  - name: messages
    type: public
    events:
      - name: MessageSent
        data:
          id: string
          text: string
          user_id: integer
          created_at: timestamp
  
  - name: notifications
    type: private
    auth_required: true
    events:
      - name: NotificationReceived
        data:
          id: string
          title: string
          body: string
  
  - name: typing-indicators
    type: presence
    events:
      - name: UserTyping
        data:
          user_id: integer
          user_name: string
*/
```

**Channel Types:**
- `public` — everyone can join/listen
- `private` — auth required, scoped to user
- `presence` — shows who's currently in channel

**Frontend Listening:**
```tsx
import { useWebSocket } from '@/arkzen/core/hooks/useWebSocket'

const MyComponent = () => {
  const { on, emit } = useWebSocket('messages')
  
  useEffect(() => {
    on('MessageSent', (data) => {
      console.log('New message:', data)
    })
  }, [on])
  
  return <div>...</div>
}
```

---

## SECTION 13 — @arkzen:events:identifier

Laravel Events with listeners.

```tsx
/* @arkzen:events:user-registration
listeners: [SendWelcomeEmail, UpdateUserStats]
*/
/* @arkzen:events:user-registration:end */

/* @arkzen:listener:SendWelcomeEmail
*/

$email = \App\Mail\WelcomeEmail::class;
\Mail::to('user@example.com')->send(new $email());

/* @arkzen:listener:SendWelcomeEmail:end */
```

**Event Rules:**
- Define event name and listener array
- Create listeners via `@arkzen:listener:name` blocks
- Listener body = PHP code injected into `handle()` method
- Listeners execute when the event is fired

---

## SECTION 14 — @arkzen:jobs:identifier

Queue jobs with body injection.

```tsx
/* @arkzen:jobs:process-data
queue: default
timeout: 300
tries: 3
*/

$file = \Storage::get($this->csv_file_path);
$rows = str_getcsv($file, "\n");

foreach ($rows as $row) {
  $data = str_getcsv($row);
  Product::create([
    'sku' => $data[0],
    'name' => $data[1],
    'price' => $data[2],
  ]);
}

\Log::info('CSV processed', ['user_id' => $this->user_id]);

/* @arkzen:jobs:process-data:end */
```

**Job Rules:**
- `queue` → queue name (default, emails, high, low)
- `timeout` → seconds before timeout
- `tries` → retry attempts on failure
- PHP body injected into `handle()` method
- Access job data via `$this->property`

---

## SECTION 15 — @arkzen:notifications:identifier

Database/mail/broadcast notifications.

```tsx
/* @arkzen:notifications:database-ping
channels: [database]
message: "You have a new database notification"
subject: "Database Ping"
*/
/* @arkzen:notifications:database-ping:end */

/* @arkzen:notifications:all-channels
channels: [database, mail, broadcast]
channel_type: private
message: "Multi-channel notification"
subject: "Important Update"
*/
/* @arkzen:notifications:all-channels:end */
```

**Channels:**
- `database` — stored in notifications table, queryable via `$user->notifications`
- `mail` — sent via email
- `broadcast` — real-time via Reverb

**Fields:**
- `channels` (required, array) — List of channels: [database], [mail], [broadcast], or [database, mail, broadcast]
- `message` (required, string) — Notification message text
- `subject` (required, string) — Email subject line
- `channel_type` (optional, for broadcast) — private, public, presence (default: private)

**toMail Body Injection (optional):**
If you need custom mail formatting, add PHP code between `*/` and `:end`:
```tsx
/* @arkzen:notifications:action-required
channels: [mail, database]
message: "Action required"
subject: "Review Needed"
*/

return (new \Illuminate\Notifications\Messages\MailMessage)
    ->subject('Please Review')
    ->line('This is an important action required notification.')
    ->action('Review Now', url('/dashboard'))
    ->salutation('Best regards');

/* @arkzen:notifications:action-required:end */
```

---

## SECTION 16 — @arkzen:mail:identifier

Mailable classes with Blade view + optional body injection.

```tsx
/* @arkzen:mail:welcome-email
subject: "Welcome to {{app_name}}"
data:
  user_name: string
  activation_link: string
*/

<!DOCTYPE html>
<html>
  <body>
    <h1>Welcome, {{ $user_name }}!</h1>
    <p>Click to activate your account:</p>
    <a href="{{ $activation_link }}">Activate Account</a>
  </body>
</html>

/* @arkzen:mail:welcome-email:end */
```

**Mail Rules:**
- `subject` (required) — email subject (can include `{{variable}}` placeholders)
- `data` (required) — schema of variables passed to Blade as `field_name: type`
- Blade HTML body is placed **directly after the YAML closing `*/`** and before `:end`
- The mail identifier becomes the Blade filename (auto-derived, no `view` field needed)
- Auto-generates `resources/mail/arkzen/{module}/{identifier}.blade.php`

---

## SECTION 17 — @arkzen:console:identifier

Artisan commands with body injection + scheduling.

```tsx
/* @arkzen:console:send-daily-report
signature: send:daily-report
description: Email daily summary report to admins
schedule: '0 9 * * *'
*/

$admins = User::where('role', 'admin')->get();

foreach ($admins as $admin) {
  \Mail::to($admin->email)->send(
    new \App\Mail\DailyReportMail()
  );
}

$this->info('Daily report sent to ' . count($admins) . ' admins');

/* @arkzen:console:send-daily-report:end */
```

**Command Rules:**
- `signature` (required) — command name (e.g. `php artisan send:daily-report`)
- `description` (required) — command description
- `schedule` (optional) — cron format (e.g. `0 9 * * *` = 9 AM daily)
- PHP body injected into `handle()` method
- Use `$this->info()`, `$this->error()`, `$this->warn()` for output

**Cron Frequency:**
```
0 9 * * *    → 9 AM daily
*/5 * * * *  → Every 5 minutes
0 */6 * * *  → Every 6 hours
0 0 * * 0    → Every Sunday at midnight
0 0 1 * *    → First day of month
```

---

## SECTION 18 — @arkzen:endpoint:name

Custom API endpoint method bodies (used within @arkzen:api).

```tsx
/* @arkzen:api:files
model: UploadedFile
controller: UploadedFileController
prefix: /api/files
endpoints:
  upload:
    method: POST
    route: /upload
    description: Upload file
  download:
    method: GET
    route: /{id}/download
    description: Download file
*/

/* @arkzen:endpoint:upload
*/

$file = $request->file('file');
$path = $file->store('uploads');

$uploadedFile = UploadedFile::create([
  'original_name' => $file->getClientOriginalName(),
  'stored_path' => $path,
  'mime_type' => $file->getMimeType(),
  'size' => $file->getSize(),
]);

return response()->json($uploadedFile, 201);

/* @arkzen:endpoint:upload:end */

/* @arkzen:endpoint:download
*/

$uploadedFile = UploadedFile::findOrFail($id);
return Storage::download($uploadedFile->stored_path);

/* @arkzen:endpoint:download:end */
```

**Endpoint Rules:**
- Method name matches endpoint key (upload, download, etc.)
- PHP code injected into controller method
- Access request via `$request`, path params via `$id`, etc
- Must return response (JSON, file, view, redirect, etc)
- Available in @arkzen:api endpoints dict

---

## SECTION 19 — @arkzen:layout:name

Custom layouts for page wrapping.

```tsx
/* @arkzen:layout:dashboard

'use client'

import React from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

/* @arkzen:layout:dashboard:end */
```

**Layout Rules:**
- Must export component named `<LayoutName>Layout` (PascalCase)
  - `layout:app` → export `AppLayout`
  - `layout:dashboard` → export `DashboardLayout`
  - `layout:admin` → export `AdminLayout`
- Must accept `children: React.ReactNode` prop
- Must include `'use client'` at the top (layouts are standalone files)
- Apply in pages: `/* @arkzen:page:layout:dashboard */`

---

## SECTION 19A — ⚠️ CUSTOM LAYOUT BEST PRACTICES (NEW — CRITICAL)

### Where custom layouts live — COLLISION FIXED (v7.3)

The engine now writes custom layout files **namespaced per tatemono**:
```
engine/frontend/arkzen/core/layouts/custom/<tatemono-name>-<layout-name>.tsx
```

This means **each tatemono gets its own isolated layout file** — no more collisions.

**How it works:**
```
jo-payroll   + @arkzen:layout:app  → custom/jo-payroll-app.tsx   → exports AppLayout
barbershop   + @arkzen:layout:app  → custom/barbershop-app.tsx   → exports AppLayout
pos-system   + @arkzen:layout:app  → custom/pos-system-app.tsx   → exports AppLayout
```

All three export `AppLayout` but from different files — zero collision ever.

**Naming convention (layout name itself):**
```
@arkzen:layout:app       ← standard — works for all tatemonos now (no collision)
@arkzen:layout:sidebar   ← alternative name
@arkzen:layout:mobile    ← for mobile-first layouts
```

### How the engine references custom layouts in pages

When a page declares `/* @arkzen:page:layout:app */`, the engine generates:
```tsx
import { AppLayout } from '@/arkzen/core/layouts/custom/jo-payroll-app'
```
(for the jo-payroll tatemono)

The import path is: `@/arkzen/core/layouts/custom/<tatemono-name>-<layout-name>`  
The import component is always: `<PascalCase(layout-name)>Layout`

This means:
- `@arkzen:layout:app` in jo-payroll → file `jo-payroll-app.tsx` → import `AppLayout`
- `@arkzen:layout:app` in barbershop → file `barbershop-app.tsx` → import `AppLayout`
- `@arkzen:layout:sidebar` in pos-system → file `pos-system-sidebar.tsx` → import `SidebarLayout`

### Custom layout CANNOT import from @arkzen:components

Custom layout files are written to `arkzen/core/layouts/custom/`. Page files are written to `app/<tatemono-name>/`. These are different directories. A custom layout file **cannot** import components from `@/app/<tatemono-name>/components/_components` because that creates a circular or invalid dependency.

**The correct pattern: Self-contained layouts**

All components the layout needs (navbar, sidebar, navigation items, etc.) must be **inlined directly in the layout block itself**. Do not try to import from `@arkzen:components`.

```tsx
/* @arkzen:layout:app

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Settings, Users } from 'lucide-react'

// ── Nav config inlined here (cannot import from @arkzen:components) ──────────
const NAV_ITEMS = [
  { href: '/my-app', label: 'Home', icon: Home },
  { href: '/my-app/users', label: 'Users', icon: Users },
  { href: '/my-app/settings', label: 'Settings', icon: Settings },
]

// ── Sidebar inlined here ──────────────────────────────────────────────────────
const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  return (
    <aside className="w-60 bg-white border-r border-neutral-100 flex flex-col">
      <nav className="flex-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === href ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

// ── Main Layout export ────────────────────────────────────────────────────────
export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}

/* @arkzen:layout:app:end */
```

### Custom layout with mobile sidebar toggle (complete pattern)

```tsx
/* @arkzen:layout:app

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'

// Replace these nav items with your tatemono's actual routes
const APP_NAV = [
  { href: '/my-app', label: 'Dashboard' },
  { href: '/my-app/records', label: 'Records' },
  { href: '/my-app/reports', label: 'Reports' },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-neutral-100 flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-4 border-b border-neutral-100">
          <p className="text-sm font-semibold text-neutral-900">My App</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {APP_NAV.map(({ href, label }) => (
            <button
              key={href}
              onClick={() => { router.push(href); setOpen(false) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-neutral-100 flex items-center px-5">
          <button onClick={() => setOpen(!open)} className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 mr-3">
            <Menu size={18} className="text-neutral-600" />
          </button>
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

/* @arkzen:layout:app:end */
```

### Page layout declaration syntax

```tsx
/* @arkzen:page:dashboard
/* @arkzen:page:layout:app */

const DashboardPage = () => {
  return <div>...</div>
}

export default DashboardPage

/* @arkzen:page:dashboard:end */
```

**Critical:** The layout declaration `/* @arkzen:page:layout:app */` must be on its own line immediately after the page opening marker. It uses `*/` to close the comment inline — this is intentional and parsed by the engine.

---

## SECTION 20 — @arkzen:style & @arkzen:style:name

Global CSS and component-scoped CSS Modules.

**Global CSS:**
```tsx
/* @arkzen:style

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.arkzen-btn-custom {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

*/
```

**Component-Scoped CSS Modules:**
```tsx
/* @arkzen:style:ProductCard

.cardContainer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.cardContainer:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
}

*/
```

**Usage in Components:**
```tsx
import styles from './page.module.css'

export const ProductCard = () => (
  <div className={styles.cardContainer}>
    <h3 className={styles.title}>Product Name</h3>
  </div>
)
```

**Style Rules:**
- Global styles apply to entire tatemono
- Component CSS Modules scoped to component
- Named `@arkzen:style:ComponentName` → `ComponentName/styles.module.css`
- Prefer Tailwind CSS + CSS Modules for complex animations
- Avoid importing multiple CSS files — use Tailwind utility classes

---

## SECTION 21 — @arkzen:page:name

Page definitions.

```tsx
/* @arkzen:page:dashboard
/* @arkzen:page:layout:auth */

const DashboardPage = () => {
  const { user } = useAuthStore()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
    </div>
  )
}

export default DashboardPage

/* @arkzen:page:dashboard:end */
```

**Page Rules:**
- `layout:guest`, `layout:auth`, or `layout:<custom-name>`
- Default to `layout:guest` if not specified
- Export default component named `<PageName>Page` (PascalCase)
- One `/* @arkzen:page:name ... :end */` block per page
- **NO imports inside page blocks** — see Section 3A
- **NO `'use client'` inside page blocks** — see Section 3B
- All hooks (useState, useEffect, etc.) are available because the engine injects component code

**What's automatically available inside page blocks:**
```
React, useState, useEffect, useMemo, useCallback (detected from @arkzen:components)
useRef, useEffect (always added by engine for animations)
motion (from framer-motion, always added)
All exports from @arkzen:components blocks (types, stores, components, utilities)
```

---

## SECTION 22 — @arkzen:error:404 & @arkzen:error:500

Custom error handlers (Next.js special files).

```tsx
/* @arkzen:error:404

import React from 'react'
import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
        <p className="text-lg text-neutral-600 mb-8">Page not found</p>
        <Link href="/" className="bg-neutral-900 text-white px-6 py-2 rounded-lg">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound

/* @arkzen:error:404:end */
```

```tsx
/* @arkzen:error:500

'use client'

import React from 'react'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <p className="text-lg text-neutral-600 mb-8">Something went wrong</p>
        <button
          onClick={() => reset()}
          className="bg-neutral-900 text-white px-6 py-2 rounded-lg"
        >
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

Shared utilities, types, constants, and components. **This is the heart of every Tatemono.**

```tsx
/* @arkzen:components:shared

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'
import { ChevronRight, Plus, Trash2, Edit2, Search } from 'lucide-react'
import { Modal } from '@/arkzen/core/components/Modal'
import { useQuery } from '@/arkzen/core/hooks/useQuery'
import { useMutation } from '@/arkzen/core/hooks/useMutation'

// Activate auth context (only if auth: true)
// if (typeof window !== 'undefined') { setActiveTatemono('your-tatemono-name') }

// ─── Store (define here so pages can use it) ─────────────────────────────────
interface AppState {
  items: Product[]
  setItems: (items: Product[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Product {
  id: string
  name: string
  price: number
  description?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  errors?: string[]
}

// ─── Constants ───────────────────────────────────────────────────────────────
export const PRODUCT_CATEGORIES = ['Electronics', 'Books', 'Clothing']
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ─── Utilities ───────────────────────────────────────────────────────────────
export const formatPrice = (price: number) => `$${price.toFixed(2)}`
export const truncate = (str: string, len: number) => str.length > len ? str.slice(0, len) + '...' : str

// ─── Shared Components ───────────────────────────────────────────────────────
export const PageHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-8">
    <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
    {action && <div>{action}</div>}
  </div>
)

/* @arkzen:components:shared:end */
```

**Components Rules:**
- Must use `'use client'` directive (engine strips it when inlining into pages, but keep it for clarity)
- Put ALL imports here — this is the only place imports belong
- Define stores here (not just in `@arkzen:store`) so pages can access them
- Export shared types, constants, utilities, components
- Available across all pages in tatemono
- One `@arkzen:components` block per identifier/group
- Multiple blocks are all merged into one `_components.tsx` file

---

## SECTION 24 — @arkzen:animation

GSAP and Framer Motion animations.

```tsx
/* @arkzen:animation

import gsap from 'gsap'
import { motion } from 'framer-motion'

// GSAP timeline animation
export const fadeInUp = (element) => {
  return gsap.to(element, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out'
  })
}

// Framer Motion variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

*/
```

**Animation Rules:**
- Use GSAP for DOM manipulations, timelines
- Use Framer Motion for React component animations
- Define animations once in `@arkzen:animation` block
- Import and use in components/pages
- Keep animations performant (use `will-change`, GPU acceleration)

---

## SECTION 25 — ASSETS FOLDER

Store static media at `tatemonos/<n>/assets/`. Auto-categorized:

```
assets/
  ├── images/          (PNG, JPG, WebP, SVG)
  ├── videos/          (MP4, WebM)
  ├── audio/           (MP3, WAV)
  ├── documents/       (PDF, DOCX)
  ├── fonts/           (TTF, OTF, WOFF2)
  ├── archives/        (ZIP, RAR)
  ├── data/            (JSON, CSV)
  └── code/            (JS, TS, HTML)
```

**Usage:**
```tsx
import Image from 'next/image'

<Image 
  src="/assets/your-tatemono/images/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
/>

<video src="/assets/your-tatemono/videos/demo.mp4" controls />
<audio src="/assets/your-tatemono/audio/notification.mp3" />
```

---

## SECTION 26 — AVAILABLE IMPORTS

These are valid import paths inside `@arkzen:components` blocks:

**Core Arkzen:**
```tsx
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useWebSocket } from '@/arkzen/core/hooks/useWebSocket'
import { useQuery } from '@/arkzen/core/hooks/useQuery'
import { useMutation } from '@/arkzen/core/hooks/useMutation'
```

**UI Components:**
```tsx
import { 
  Loading, Badge, Avatar, Breadcrumb, EmptyState, 
  Pagination, Modal, Dialog, Drawer, Tooltip,
  FileUpload, RichTextEditor, Table, Chart
} from '@/arkzen/core/components'
```

**Icons (Lucide):**
```tsx
import { 
  Plus, Minus, X, Check, Search, Filter,
  Edit2, Trash2, Copy, Eye, EyeOff, Bell,
  Upload, Download, User, Settings, AlertCircle
} from 'lucide-react'
```

**Icons (Hero):**
```tsx
import { SparklesIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
```

**Next.js (use in components, NOT in pages):**
```tsx
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
```

**Zustand:**
```tsx
import { create } from 'zustand'
```

---

## SECTION 27 — ACTIVE TATEMONOS (19 Total)

| Name | Version | Auth | Purpose |
|------|---------|------|---------|
| auth-test | 1.0.0 | ✓ | Sanctum auth, login/register, protected dashboard |
| crud-test | 1.0.0 | ✗ | Full CRUD operations with models/controllers |
| inventory-management | 2.0.0 | ✗ | Stock tracking with seeded data |
| broadcast-test | 2.0.0 | ✓ | Real-time messaging with Reverb channels |
| roles-test | 2.1.0 | ✓ | Role-based access, audit logs, middleware injection |
| events-test | 1.0.0 | ✗ | Laravel Events + Listeners, event firing |
| job-test | 1.0.0 | ✗ | Queue jobs with body injection |
| notification-test | 2.1.0 | ✓ | Database/mail/broadcast notifications |
| mail-test | 2.0.0 | ✓ | Email templates with SMTP testing |
| scheduler-test | 2.0.0 | ✗ | Artisan commands + cron scheduling |
| upload-test | 1.0.0 | ✗ | File uploads, image preview, download |
| errors-test | 1.0.0 | ✗ | HTTP error simulation, custom error pages |
| middleware-test | 2.0.0 | ✗ | Custom middleware with body injection |
| body-endpoint-handler | 1.0.0 | ✗ | Custom @arkzen:endpoint & @arkzen:handler bodies |
| body-mail-notification | 1.0.0 | ✓ | Mail blade body + notification toMail_body injection |
| portfolio-test | 1.0.0 | ✗ | Static portfolio showcase |
| new-updates-styles | 2.0.0 | ✗ | CSS Modules, custom components |
| **jo-payroll** | **1.0.0** | **✗** | **Job Order payroll, deductions, LGU management** |
| **barbershop-booking** | **1.0.0** | **✗** | **Barbershop appointment booking with bottom sheet UX** |

---

## SECTION 28 — QUICK START

**Create Tatemono:**
```bash
cd tatemonos
mkdir my-app
touch my-app/core.tsx
```

**Build & Watch:**
```bash
node start.js
```

**Export Standalone Project:**
```bash
node export.js my-app
```

**Run Exported Project:**
```bash
cd projects/my-app
npm install && npm run build
php artisan serve
npm run dev
```

---

## SECTION 29 — AI GENERATION CHECKLIST

Before submitting a generated Tatemono, verify every item:

```
IMPORTS
□ All imports are inside @arkzen:components or @arkzen:layout blocks
□ NO import statements inside @arkzen:page blocks
□ NO duplicate imports across components blocks (merge them)
□ Each package imported ONCE total across all component blocks

'use client'
□ 'use client' written in @arkzen:components (fine — engine strips it)
□ 'use client' written in @arkzen:layout (required)
□ NO 'use client' in @arkzen:page blocks
□ NO 'use client' in @arkzen:store blocks

STORES
□ If pages use a store, the store is defined in @arkzen:components (not only @arkzen:store)
□ import { create } from 'zustand' is in @arkzen:components if store is there
□ Store hook exported as useXxxStore

CUSTOM LAYOUTS
□ Layout component named <PascalCase(layout-name)>Layout
□ Layout accepts children: React.ReactNode
□ Layout is self-contained — no imports from @arkzen:components
□ All nav items, sidebar, header code is inlined in the layout block
□ Layout name is unique enough to not conflict with other tatemonos

PAGES
□ Every page has /* @arkzen:page:layout:xxx */ on its second line
□ Page component exported as default
□ Page component named <PageName>Page (PascalCase)
□ No import statements inside page blocks
□ All used types/stores/components come from @arkzen:components

SECTION ORDER
□ meta → config → database → api → routes → middleware → store → realtime →
  events → listener → jobs → notifications → mail → console → endpoint →
  handler → layout → components → style → page → error → animation
```

---


---

## SECTION 19B — ⚠️ CUSTOM LAYOUT COLLISION FIX (v7.3 — CRITICAL)

**The problem (pre-v7.3):** Both `jo-payroll` and `barbershop-booking` used `@arkzen:layout:app`. Both wrote to `custom/app.tsx`. The last tatemono to rebuild would overwrite the other's layout — causing the wrong header/sidebar to appear in the wrong tatemono.

**The fix (v7.3):** The router now namespaces every custom layout file by tatemono name. You NEVER need to manually rename your layout blocks. Just use `@arkzen:layout:app` and the engine handles isolation automatically.

**What changed in router.ts:**
- Layout write path: `custom/app.tsx` → `custom/{tatName}-app.tsx`
- Layout import path updated to match

**Migration:** If you have old tatemonos using `@arkzen:layout:app`, they will automatically get their own namespaced file on next rebuild. No changes to your tatemono files needed.

---

## SECTION 30A — ⚠️ FONT RULES (NEW — CRITICAL)

**NEVER use the same font across every tatemono.** Every tatemono must have a font personality matching its purpose and audience.

### How to load fonts

Load via Google Fonts `@import` inside your page's inline `<style>` tag:
```tsx
return (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');
      .my-root { font-family: 'Syne', sans-serif; }
    `}</style>
    <div className="my-root">...</div>
  </>
)
```

Or via `@arkzen:style` global CSS block:
```
/* @arkzen:style
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body { font-family: 'Inter', sans-serif; }
*/
```

### Font personality guide

| Tatemono type | Primary font | Accent/Mono font |
|---|---|---|
| LGU / Government / Formal | Inter, IBM Plex Sans, Source Sans 3 | IBM Plex Mono |
| Barbershop / Grooming | Syne | DM Mono |
| Restaurant / Food | Playfair Display | Lato |
| Tech / SaaS / Dashboard | Geist, Space Grotesk | JetBrains Mono |
| Portfolio / Creative | Fraunces, Cabinet Grotesk | Clash Display |
| E-commerce / Shop | DM Sans, Plus Jakarta Sans | DM Mono |
| Medical / Clinic | Nunito, Open Sans | — |
| Fitness / Gym | Bebas Neue | Inter |
| Real Estate | Cormorant Garamond | Raleway |
| Education / School | Nunito, Quicksand | Source Code Pro |
| Finance / Banking | Inter | IBM Plex Mono |
| Events / Ticketing | Clash Display | Space Mono |

### Rules
```
1. Pick ONE heading font and ONE body/mono font per tatemono
2. Load only the weights you actually use (reduces Google Fonts request size)
3. Always include a fallback: 'Syne', sans-serif
4. Title of the tatemono/brand should use the heading font
5. Data-heavy fields (codes, prices, IDs) should use the mono font
6. Never mix more than 2 font families in one tatemono
```

---

## SECTION 30B — ⚠️ IMAGE PLACEMENT RULES (NEW)

### Option A: `assets/` folder (recommended for production)

```
tatemonos/
  my-tatemono/
    core.tsx
    assets/              ← create this folder
      logo.png
      hero.jpg
      barber-bg.webp
      team/
        marcus.jpg
        james.jpg
```

Engine automatically copies `tatemonos/<name>/assets/` → `public/tatemonos/<name>/` on every build.

**Usage in JSX:**
```tsx
<img src="/tatemonos/my-tatemono/logo.png" alt="Logo" />
<img src="/tatemonos/my-tatemono/team/marcus.jpg" alt="Marcus" />

// With Next.js Image component
import Image from 'next/image'
<Image src="/tatemonos/my-tatemono/hero.jpg" alt="Hero" width={800} height={600} />
```

### Option B: Online placeholder images (for prototyping/seeding)

```tsx
// Pravatar — realistic person photos (by index 1-70)
"https://i.pravatar.cc/150?img=11"     // 150x150 avatar
"https://i.pravatar.cc/300?img=33"     // 300x300 larger

// UI Avatars — initials-based
"https://ui-avatars.com/api/?name=Marcus+Lee&background=0a0a0a&color=fff&size=150"

// Unsplash — scene/background/product photos
"https://images.unsplash.com/photo-{PHOTO_ID}?w=400&q=80"

// Picsum — random beautiful photos
"https://picsum.photos/400/300?random=1"
"https://picsum.photos/seed/barbershop/400/300"  // consistent per seed word
```

### Option C: Seeded DB URLs (dynamic per record)

Store URL in database seed and load from API:
```yaml
seeds:
  - { name: "Marcus Lee", photo: "https://i.pravatar.cc/150?img=11" }
  - { name: "James Rivera", photo: "https://i.pravatar.cc/150?img=15" }
```

Render from fetched data:
```tsx
{barber.photo && <img src={barber.photo} className="w-12 h-12 rounded-full object-cover" />}
```

### Rules
```
1. Always add width + height or use object-cover for images — prevents layout shift
2. Always add alt text — accessibility + SEO
3. For circular avatars: rounded-full + object-cover + fixed w/h
4. For seeded images: store URL in DB photo column, nullable
5. For production: use assets/ folder — not online URLs
6. For prototyping: pravatar.cc is reliable and free, no API key needed
```

---

## SECTION 30C — ⚠️ STRICT API BLOCK RULES (NEW — CRITICAL)

These rules are the #1 source of YAML parse errors in tatemonos.

### Rule 1: One resource per block — ALWAYS

```
❌ WRONG — multiple resources in one block:
/* @arkzen:api
resource: barbers
routes: ...
resource: services    ← YAML duplicate key error!
routes: ...
*/

✅ CORRECT — separate named block per resource:
/* @arkzen:api:barbers
resource: barbers
routes: ...
*/

/* @arkzen:api:services
resource: services
routes: ...
*/
```

### Rule 2: Always quote paths with `{params}`

```yaml
❌ WRONG:
- { method: GET, path: /barbers/{id}, action: show }
  # YAML parses {id} as an object — parse error!

✅ CORRECT:
- { method: GET, path: "/barbers/{id}", action: show }
  # Quoted — YAML treats it as a string
```

### Rule 3: Identifier must be unique per tatemono

```
/* @arkzen:api:barbers   ← unique
/* @arkzen:api:services  ← unique
/* @arkzen:api:bookings  ← unique
```

### Rule 4: For custom endpoints, always add a separate `@arkzen:endpoint` block

```
/* @arkzen:api:bookings
resource: bookings
routes:
  - { method: GET, path: /bookings/slots, action: slots }
*/

/* @arkzen:endpoint
method: GET
path: /bookings/slots
description: Returns available slots
*/
// PHP code here
$slots = [...];
return response()->json(['slots' => $slots]);
/* @arkzen:endpoint:end */
```

---

---

## SECTION 31 — ⚠️ PWA & OFFLINE MODE (v7.5 — IMPLEMENTED)

Arkzen v7.4 ships the full v7.5 PWA roadmap ahead of schedule. Add a `pwa:` block inside `@arkzen:meta` to make any tatemono installable and offline-capable.

### DSL Syntax

```yaml
/* @arkzen:meta
name: barbershop-booking
version: 1.0.0
label: Barbershop Booking
auth: false
pwa:
  name: "The Blade & Co."        ← Full name (shown on splash screen)
  short_name: "Blade Co."        ← Short name (shown on home screen icon)
  description: "Book your next haircut easily"
  theme_color: "#0a0a0a"         ← Browser chrome / status bar color
  background_color: "#f5f5f0"    ← Splash screen background
  display: standalone             ← standalone | fullscreen | minimal-ui | browser
  orientation: portrait           ← portrait | landscape | any
  start_url: /barbershop-booking  ← Where app opens when launched from home screen
  offline: true                   ← Enable IndexedDB sync queue
  icons:                          ← Optional — uses default paths if omitted
    - { src: /tatemonos/barbershop-booking/icon-192.png, sizes: 192x192, type: image/png }
    - { src: /tatemonos/barbershop-booking/icon-512.png, sizes: 512x512, type: image/png }
    - { src: /tatemonos/barbershop-booking/icon-mask.png, sizes: 512x512, type: image/png, purpose: maskable }
*/
```

### What gets generated

When `pwa:` is detected in meta, the engine generates **5 files automatically** — zero manual work:

| File | Location | Purpose |
|---|---|---|
| `manifest-{name}.json` | `public/` | Web app manifest — enables "Add to Home Screen" |
| `sw-{name}.js` | `public/` | Service Worker — caching, offline, sync queue |
| `usePWA-{name}.ts` | `arkzen/core/hooks/` | React hook for online/sync/install state |
| `app/{name}/offline/page.tsx` | auto | Offline fallback page shown when no cache |
| `app/{name}/layout.tsx` | updated | Manifest + theme-color meta injected |

### Phase breakdown (all 4 phases implemented)

**Phase 1 — Service Worker caching:**
- Pages cached on first visit
- Assets (JS, CSS, images) cached automatically
- Navigation falls back to cached page if offline
- API GETs fall back to cached response if offline

**Phase 2 — Offline mutation queue:**
- POST/PUT/PATCH/DELETE calls while offline → saved to IndexedDB
- Returns `{ queued: true }` response to UI (202 status)
- Queue persists across page refreshes and app restarts
- Tatemono-scoped: each tatemono has its own queue namespace

**Phase 3 — Automatic sync:**
- When connection returns → queue flushes automatically
- Background Sync API used when available
- `online` event fallback for all browsers
- Success/failure messages sent to app via `postMessage`
- Clients notified: `ARKZEN_SYNC_COMPLETE`, `ARKZEN_SYNC_SUCCESS`, `ARKZEN_PENDING_COUNT`

**Phase 4 — Installable web app:**
- `manifest.json` auto-generated per tatemono
- `beforeinstallprompt` captured → `installApp()` function exposed
- `display: standalone` makes it look like a native app
- Apple PWA meta tags included for iOS Safari

### Using the PWA hook in your page

```tsx
/* @arkzen:page:index */

// usePWA is auto-imported from the generated hook — no import needed
const IndexPage = () => {
  const { isOnline, isSyncing, pendingCount, isInstallable, installApp } = usePWA()

  return (
    <>
      {/* PWAStatusBar auto-shows when offline or syncing */}
      <PWAStatusBar />

      <div>
        {!isOnline && <div>You're offline — {pendingCount} changes queued</div>}
        {isInstallable && (
          <button onClick={installApp}>Install App</button>
        )}
        {/* rest of your UI */}
      </div>
    </>
  )
}
/* @arkzen:page:index:end */
```

### Default icon paths (if icons not specified in DSL)

Place your icons in the tatemono assets folder:
```
tatemonos/
  barbershop-booking/
    assets/
      icon-192.png    ← 192×192 standard icon
      icon-512.png    ← 512×512 large icon
      icon-mask.png   ← 512×512 maskable icon (safe zone padding)
```
Engine copies these to `public/tatemonos/barbershop-booking/` automatically.

### Testing PWA locally

```bash
# Must serve over HTTPS or localhost for SW to register
# Arkzen dev server (localhost) works fine
# Open browser DevTools → Application → Service Workers
# Application → Manifest → check installability
# Application → Storage → IndexedDB → arkzen-sync-queue → mutations
```

### Rules
```
1. pwa: block is optional — omit it for non-PWA tatemonos
2. offline: true enables the IndexedDB mutation queue
3. offline: false = manifest + install only, no queue
4. Icons must be PNG — WebP not supported in all PWA contexts
5. start_url must match tatemono name: /my-tatemono
6. theme_color should match your tatemono's primary color
7. Use maskable icons for Android — 512x512 with 20% safe zone padding
8. PWAStatusBar handles all UI — add it to your page root
```

---
## SECTION 30 — DESIGN EXAMPLES

[See Section 2C for Button, Card, Table, Form, Page Header examples]  
[See Section 19A for complete custom layout examples]

---

## CHANGELOG v7.3 → v7.4

**New Sections:**
- ✅ Section 31 — PWA & Offline Mode (v7.5 roadmap implemented early)

**Engine Changes:**
- ✅ `pwa-builder.ts` — new builder (678 lines) implementing all 4 PWA phases
- ✅ `types/index.ts` — `ArkzenPWAMeta` interface added to `ArkzenMeta`
- ✅ `parser.ts` — `pwa:` block parsed from `@arkzen:meta`
- ✅ `builder.ts` — Step 2b added, calls `generatePWAFiles()` when pwa detected

**What's generated per PWA tatemono:**
- `public/manifest-{name}.json` — installable web app manifest
- `public/sw-{name}.js` — service worker (cache + offline queue + auto-sync)
- `arkzen/core/hooks/usePWA-{name}.ts` — React hook + PWAStatusBar component
- `app/{name}/offline/page.tsx` — offline fallback page

---

## CHANGELOG v7.2 → v7.3

**New Sections:**
- ✅ Section 19B — Custom Layout Collision Fix (router.ts patched, auto-namespaced)
- ✅ Section 30A — Font Rules (personality guide per tatemono type)
- ✅ Section 30B — Image Placement Rules (assets/ folder, online URLs, seeded DB)
- ✅ Section 30C — Strict API Block Rules (one resource per block, quote {params})

**Engine Changes:**
- ✅ `router.ts` patched — custom layouts now write to `{tatName}-{layoutName}.tsx`
- ✅ Layout import path updated to match namespaced filename
- ✅ Zero collision between tatemonos using same layout name

**Root Cause of barbershop-booking Issues:**
1. **Layout collision** — both `jo-payroll` and `barbershop-booking` used `@arkzen:layout:app`, fighting over `custom/app.tsx`. Fixed by namespacing.
2. **YAML `{id}` unquoted** — `path: /barbers/{id}` parsed as object. Fixed by quoting.
3. **Multiple resources in one `@arkzen:api` block** — caused duplicate key error. Fixed by separate named blocks.
4. **Animation as function** — `const x = () => \`...\`` instead of `const x = \`...\``. Fixed.
5. **`export const API_BASE` exported** — leaked to other tatemonos. Fixed to private `const`.

---

## CHANGELOG v7.1 → v7.2

**New Sections:**
- ✅ Section 3A — Import Placement Rules (critical — where imports go)
- ✅ Section 3B — `'use client'` Directive Rules (critical — no 'use client' in pages)
- ✅ Section 3C — Zustand Store Rules (stores must be in components for pages to use)
- ✅ Section 19A — Custom Layout Best Practices (self-contained layouts, naming, syntax)
- ✅ Section 29 — AI Generation Checklist (pre-flight verification)

**Updated Sections:**
- ✅ Section 3 — Added rules 8 and onwards to reference new sections
- ✅ Section 11 (@arkzen:store) — Added warning linking to Section 3C
- ✅ Section 19 (@arkzen:layout) — Added layout naming conventions
- ✅ Section 21 (@arkzen:page) — Added explicit "no imports" and "no use client" rule
- ✅ Section 23 (@arkzen:components) — Added store-in-components pattern, restructured
- ✅ Section 26 (available imports) — Added Next.js imports, Zustand, clarified scope
- ✅ Section 27 (active tatemonos) — Added jo-payroll to the table

**Root Cause of jo-payroll Issues:**

Jo-payroll was AI-generated with v7.1 and encountered these bugs:
1. **Store duplication** — store defined in `@arkzen:store:payrollStore` AND duplicated in `@arkzen:components:shared` with conflicting definitions. Fix: define store ONLY in `@arkzen:components`, skip `@arkzen:store` if pages need the store.
2. **Import duplication** — the original AI generation put imports in `@arkzen:store`, then duplicated them in `@arkzen:components`. Fix: all imports belong in `@arkzen:components` only.
3. **Custom layout imports** — original generation tried to import layout components from non-existent paths. Fix: layout blocks must be fully self-contained with all nav/sidebar code inlined.
4. **`'use client'` placement** — `'use client'` was written in wrong positions in some blocks. Fix: only in `@arkzen:components` and `@arkzen:layout`.

All of these are now documented and covered by the checklist in Section 29.

---

## VERSION HISTORY

| Version | Status | Key Features |
|---------|--------|--------------|
| v6.0 | Base | Core Tatemono DSL, CRUD, multi-page |
| v6.1 | Documented | Styling, design standards (Guidelines) |
| v6.2 | Backend | Auth seed, notifications infrastructure |
| v6.3 | Body Injection | @arkzen:middleware/endpoint/handler/listener/jobs/console body injection |
| v6.4 | Styling | CSS Modules support, @arkzen:style:name |
| v7.0 | Complete | Complete documentation of all v6.3+ features |
| v7.1 | Bug fixes | Fixed critical bugs from v7.0, verified against all 17 tatemonos |
| v7.2 | Archived | Import rules, 'use client' rules, store-in-components rule, custom layout best practices, AI checklist |
| v7.3 | Archived | Layout collision fix (namespaced per tatemono), font personality rules, image placement rules, strict API block rules |
| v7.4 | **CURRENT** | PWA/offline DSL implemented (all 4 phases), pwa-builder.ts, usePWA hook, ServiceWorker, IndexedDB sync queue, manifest generation |
| v7.5 | ✅ Done Early | Merged into v7.4 — PWA/offline sync (IndexedDB + Service Workers) |
| v8.0 | Roadmap | Multiple frontend stacks (Next.js + React + React+Inertia) |
| v9.0 | Roadmap | React Native (iOS/Android via Expo) |

---

**Last Updated:** 2026-04-28  
**Version:** v7.4  
**Verified Against:** 19 active tatemonos (jo-payroll + barbershop-booking AI-generated)  
**Parser Version:** v6.3  
**Builder Count:** 21  
**Status:** Production-Ready ✓