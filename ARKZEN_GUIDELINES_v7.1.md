# ARKZEN GUIDELINES DOCUMENT v7.1
## For Claude AI — Generating Tatemono Files

**UPDATED:** 2026-04-27  
**WHAT:** Bug fixes to v7.0 (corrected syntax errors)  
**VERIFIED AGAINST:** All 17 active tatemonos (auth-test, body-endpoint-handler, body-mail-notification, broadcast-test, crud-test, errors-test, events-test, inventory-management, job-test, mail-test, middleware-test, new-updates-styles, notification-test, portfolio-test, roles-test, scheduler-test, upload-test)

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
3. File lives at: tatemonos/<name>/core.tsx
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
8. All imports go inside @arkzen:components blocks
9. Each Tatemono is a fully self-contained isolated system
10. Tatemonos do NOT share anything with each other
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
- You MUST call `setActiveTatemono('<name>')` once in the first `@arkzen:components` block:
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
- Must accept `children: React.ReactNode` prop
- Apply in pages: `/* @arkzen:page:dashboard /* @arkzen:page:layout:dashboard */`

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

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/arkzen/core/stores/authStore'
import { LayoutDashboard } from 'lucide-react'

const DashboardPage = () => {
  const router = useRouter()
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

---

## SECTION 22 — @arkzen:error:404 & @arkzen:error:500

Custom error handlers (Next.js special files).

```tsx
/* @arkzen:error:404

'use client'

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

Shared utilities, types, constants.

```tsx
/* @arkzen:components:shared

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'
import { useWebSocket } from '@/arkzen/core/hooks/useWebSocket'
import { Loading, Badge, Avatar } from '@/arkzen/core/components'
import { ChevronRight, Plus, Trash2 } from 'lucide-react'

// Activate auth context (only if auth: true)
if (typeof window !== 'undefined') {
  setActiveTatemono('your-tatemono-name')
}

// Types
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

// Constants
export const PRODUCT_CATEGORIES = ['Electronics', 'Books', 'Clothing']
export const API_BASE = '/api/your-tatemono'

// Utilities
export const formatPrice = (price: number) => `$${price.toFixed(2)}`
export const truncate = (str: string, len: number) => str.length > len ? str.slice(0, len) + '...' : str

// Shared Components
export const PageHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-8">
    <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
    {action && <div>{action}</div>}
  </div>
)

/* @arkzen:components:shared:end */
```

**Components Rules:**
- Must use `'use client'` directive
- Export shared types, constants, utilities, components
- Available across all pages in tatemono
- One `@arkzen:components` block per identifier/group
- Common identifiers: `shared`, `admin`, `public`, `dashboard`

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

Store static media at `tatemonos/<name>/assets/`. Auto-categorized:

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

**Core Arkzen:**
```tsx
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useWebSocket } from '@/arkzen/core/hooks/useWebSocket'
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

---

## SECTION 27 — ACTIVE TATEMONOS (17 Total)

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

## SECTION 29 — DESIGN EXAMPLES

[See Section 2C for Button, Card, Table, Form, Page Header examples]

---

## CHANGELOG v7.0 → v7.1

**Fixed Critical Bugs:**
- ✓ @arkzen:database column format — CHANGED from list array to dict/map format
- ✓ @arkzen:api endpoint format — CHANGED from list array to dict/map format with route (not path)
- ✓ @arkzen:api resource/policy/factory — CHANGED to boolean (true/false, not string names)
- ✓ arkzenFetch import path — CHANGED from @/arkzen/core/lib/arkzenFetch to @/arkzen/core/stores/authStore

**Clarifications:**
- ✓ @arkzen:mail — Clarified blade HTML body placement (after YAML `*/`, not in field)
- ✓ @arkzen:notifications — Clarified channels as array format [database, mail, broadcast]
- ✓ Role endpoints — Clarified adminOnly, userOnly, promote, demote as dict keys
- ✓ @arkzen:store — Updated to modern Zustand import: `import { create } from 'zustand'`
- ✓ Middleware format — Added clear examples with body injection
- ✓ Validation rules — Documented Laravel validation format (pipe-separated)
- ✓ Response types — Documented single, collection, paginated, message types

**Verified Against All 17 Tatemonos:**
Every example in this guideline has been cross-referenced with actual tatemono code to ensure accuracy.

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
| v7.1 | **CURRENT** | Fixed critical bugs from v7.0, verified against all 17 tatemonos, 100% accuracy |
| v7.5 | Roadmap | PWA/offline sync support (IndexedDB + Service Workers) |
| v8.0 | Roadmap | Multiple frontend stacks (Next.js + React + React+Inertia) |
| v9.0 | Roadmap | React Native (iOS/Android via Expo) |

---

**Last Updated:** 2026-04-27  
**Version:** v7.1 (Bug fix release)  
**Verified Against:** 17 active tatemonos  
**Parser Version:** v6.3  
**Builder Count:** 21  
**Status:** Production-Ready ✓
