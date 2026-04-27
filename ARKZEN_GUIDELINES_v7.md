# ARKZEN GUIDELINES DOCUMENT v7.0
## For Claude AI — Generating Tatemono Files

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
- Promote/demote via endpoint types: `role_promote`, `role_demote`
- Admin-only endpoints use type: `role_admin_only`
- User-only endpoints use type: `role_user_only`
- No need to add @arkzen:database:users — AuthBuilder handles it

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
  backdrop: blur
  closeButton: true
table:
  striped: true
  bordered: false
  hoverable: true
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
  auth:
    className: "min-h-screen bg-neutral-50"
dialog:
  size: md
  closeButton: true
breadcrumb:
  showHome: true
  separator: /
*/
```

All fields are optional. Defaults applied if omitted.

---

## SECTION 7 — @arkzen:database

```tsx
/* @arkzen:database:products
table: products
timestamps: true
softDeletes: false
columns:
  - name: id
    type: id
  - name: sku
    type: string
    unique: true
  - name: name
    type: string
  - name: description
    type: longText
    nullable: true
  - name: price
    type: decimal:8,2
  - name: stock
    type: integer
    default: 0
  - name: category_id
    type: bigInteger
    foreign: categories:id
  - name: created_at
    type: timestamp
seeder:
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

**Column Types (Whitelist):**
```
id, integer, bigInteger, string (default 255), text, longText,
decimal (format: decimal:total,places), float,
boolean, date, datetime, timestamp, json, uuid
```

**Foreign Keys:**
- Format: `foreign: table_name:column_name`
- Only reference known tables or "users" table
- No circular dependencies allowed

**Seeder Data:**
- YAML array of objects
- Automatically inserted during migration
- Use simple scalar types (string, number, boolean)

---

## SECTION 8 — @arkzen:api

```tsx
/* @arkzen:api:products
model: Product
controller: ProductController
prefix: /api/products
resource: ProductResource
policy: ProductPolicy
factory: ProductFactory
endpoints:
  - method: GET
    path: /
    type: index
    summary: List all products
  - method: GET
    path: /:id
    type: show
    summary: Get single product
  - method: POST
    path: /
    type: store
    validation: StoreProductRequest
    summary: Create product
  - method: PUT
    path: /:id
    type: update
    validation: UpdateProductRequest
    summary: Update product
  - method: DELETE
    path: /:id
    type: destroy
    summary: Delete product
  - method: POST
    path: /:id/import-csv
    type: custom
    summary: Bulk import from CSV
*/
```

**Endpoint Types:**
```
CRUD:
  - index (GET /) — list paginated resources
  - store (POST /) — create resource
  - show (GET /:id) — get single resource
  - update (PUT /:id) — update resource
  - destroy (DELETE /:id) — delete resource

Custom Actions:
  - upload → multipart file handling
  - job_dispatch → trigger background job
  - event_fire → dispatch event
  - mail_send → send email
  - notification_trigger → trigger notification
  - command_run → run Artisan command

Role-based:
  - role_admin_only → admin authorization gate
  - role_user_only → authenticated user gate
  - role_promote → promote user role
  - role_demote → demote user role
```

---

## SECTION 9 — @arkzen:routes (v6.3+)

Custom routes with optional handler body injection.

```tsx
/* @arkzen:routes
routes:
  - method: POST
    path: /api/simulate-error
    controller: SimulateErrorController
    middleware: []
    handler: simulate_error
  - method: GET
    path: /api/health-check
    controller: HealthController
    handler: check_status
*/

/* @arkzen:handler:simulate_error
return response()->json([
  'status' => 'error',
  'code' => 503,
  'message' => 'Service Unavailable'
], 503);
/* @arkzen:handler:simulate_error:end */

/* @arkzen:handler:check_status
return response()->json([
  'status' => 'ok',
  'timestamp' => now()
]);
/* @arkzen:handler:check_status:end */
```

**Handler Body Rules:**
- Enclosed in `/* @arkzen:handler:name ... :end */` blocks
- PHP code only (no opening `<?php` tag)
- Must return a response (JSON or view)
- Base64-encoded internally for YAML safety

---

## SECTION 10 — @arkzen:middleware:name (v6.3+)

Custom middleware with body injection.

```tsx
/* @arkzen:middleware:requireJson
signature: requireJson
description: Ensure request is JSON
*/

/* @arkzen:middleware:requireJson
if (!$request->isJson()) {
  return response()->json(['error' => 'JSON required'], 415);
}
return $next($request);
/* @arkzen:middleware:requireJson:end */
```

**Middleware Rules:**
- Must have opening comment with `signature` and optional `description`
- PHP body (no opening tag) injected into `handle()` method
- Must call `return $next($request)` at end
- Automatically registered as alias (e.g. `middleware('requireJson')`)
- Can be applied to routes via middleware option in @arkzen:routes

**Example from middleware-test:**
```tsx
/* @arkzen:middleware:requireJson
signature: requireJson
description: Validate request is JSON
*/

/* @arkzen:middleware:requireJson
if (!$request->isJson()) {
  return response()->json(['error' => 'Content-Type must be application/json'], 415);
}

return $next($request);
/* @arkzen:middleware:requireJson:end */
```

---

## SECTION 11 — @arkzen:store:identifier

Zustand store definitions for frontend state management.

```tsx
/* @arkzen:store:cartStore
import create from 'zustand'

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
*/
```

**Store Pattern:**
- Define interface for state + actions
- Use Zustand `create` hook
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
name: UserRegistered
description: Fired when new user registers
data:
  user_id: integer
  email: string
  name: string
  created_at: timestamp
*/

/* @arkzen:listener:SendWelcomeEmail
event: UserRegistered
description: Send welcome email to new users
queue: emails
*/

/* @arkzen:listener:SendWelcomeEmail
\Mail::to($event->email)->send(
  new \App\Mail\WelcomeEmail($event->name)
);
/* @arkzen:listener:SendWelcomeEmail:end */
```

**Event Rules:**
- Define event name, description, data schema
- Create listeners via `@arkzen:listener:name`
- Listener body = PHP code injected into `handle()` method
- Can queue listeners (async execution)

---

## SECTION 14 — @arkzen:jobs:identifier (v6.3+)

Queue jobs with body injection.

```tsx
/* @arkzen:jobs:process-data
name: ProcessDataJob
queue: default
timeout: 300
tries: 3
data:
  csv_file_path: string
  user_id: integer
*/

/* @arkzen:jobs:process-data
$file = Storage::get($this->csv_file_path);
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
/* @arkzen:notifications:order-status-update
name: OrderStatusUpdated
description: Notify customer of order status change
channels:
  - database
  - mail
  - broadcast
data:
  order_id: integer
  status: string
  updated_at: timestamp
toMail:
  subject: Your order status has been updated
  view: order-status-notification
  toMailBody: true
*/

/* @arkzen:notifications:order-status-update
User::find($notifiable->id)->notify(
  new OrderStatusUpdated($this->order_id, $this->status)
);
/* @arkzen:notifications:order-status-update:end */
```

**Channels:**
- `database` — stored in notifications table, queryable via `$user->notifications`
- `mail` — sent via email
- `broadcast` — real-time via Reverb

**toMailBody Injection:**
- Set `toMailBody: true` to inject custom `toMail()` PHP
- Modify email subject, view, data dynamically

---

## SECTION 16 — @arkzen:mail:identifier (v6.3+)

Mailable classes with Blade view + optional body injection.

```tsx
/* @arkzen:mail:welcome-email
name: WelcomeEmail
description: Sent when user registers
subject: Welcome to {{app_name}}
view: welcome-email
data:
  user_name: string
  activation_link: string
bladeBody: true
*/

/* @arkzen:mail:welcome-email
<h1>Welcome, {{ $user_name }}!</h1>
<p>Click to activate your account:</p>
<a href="{{ $activation_link }}">Activate Account</a>
/* @arkzen:mail:welcome-email:end */
```

**Mail Rules:**
- `view` → Blade file name (auto-created)
- `subject` → email subject (can include `{{variables}}`)
- `data` → schema of variables passed to Blade
- `bladeBody: true` → inject Blade HTML in `:end` block
- Auto-generates `resources/mail/arkzen/{module}/{view}.blade.php`

---

## SECTION 17 — @arkzen:console:identifier (v6.3+)

Artisan commands with body injection + scheduling.

```tsx
/* @arkzen:console:send-daily-report
signature: send:daily-report
description: Email daily summary report to admins
queue: commands
schedule:
  frequency: daily
  time: "09:00"
*/

/* @arkzen:console:send-daily-report
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
- `signature` → command name (e.g. `php artisan send:daily-report`)
- `queue` → queue name (optional, default synchronous)
- `schedule` → cron schedule (only if `frequency` set)
  - frequency: `everyMinute`, `hourly`, `daily`, `weekly`, `monthly`
  - time: HH:MM format (for daily/weekly/monthly)
  - Or use `cron: "*/5 * * * *"` for cron syntax
- PHP body injected into `handle()` method
- Use `$this->info()`, `$this->error()`, `$this->warn()` for output

---

## SECTION 18 — @arkzen:endpoint:name (v6.3+)

Custom API endpoint method bodies.

```tsx
/* @arkzen:api:files
model: UploadedFile
controller: UploadedFileController
prefix: /api/files
endpoints:
  - method: POST
    path: /upload
    type: custom
    summary: Upload file
  - method: GET
    path: /:id/download
    type: custom
    summary: Download file
*/

/* @arkzen:endpoint:upload
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
$uploadedFile = UploadedFile::findOrFail($id);
return Storage::download($uploadedFile->stored_path);
/* @arkzen:endpoint:download:end */
```

**Endpoint Rules:**
- Method name = endpoint action name (upload, download, etc)
- PHP code injected into controller method
- Access request via `$request`, path params via `$id`, etc
- Must return response (JSON, file, view, redirect, etc)
- Available in routes file via custom endpoint type

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

## SECTION 20 — @arkzen:style & @arkzen:style:name (v6.4+)

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
/* @arkzen:components:shared */

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
import { useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'
import { useWebSocket } from '@/arkzen/core/hooks/useWebSocket'
import { arkzenFetch } from '@/arkzen/core/lib/arkzenFetch'
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
| body-mail-notification | 1.0.0 | ✓ | Mail blade_body + notification toMail_body injection |
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

## CHANGELOG v6.1 → v7.0

**Added:**
- ✓ @arkzen:middleware:name documentation with body injection example
- ✓ @arkzen:listener documentation with event listener pattern
- ✓ @arkzen:endpoint:name documentation with custom API body injection
- ✓ @arkzen:handler:name documentation with custom route body injection
- ✓ @arkzen:console:identifier documentation with scheduling
- ✓ @arkzen:style & @arkzen:style:name documentation (CSS Modules + global CSS)
- ✓ @arkzen:animation framework documentation (GSAP + Framer Motion)
- ✓ auth_seed documentation with role field examples
- ✓ Complete @arkzen:store pattern with Zustand
- ✓ Real-time listener patterns (useWebSocket hook)
- ✓ Feature matrix table (23 DSL sections, versions, status)
- ✓ Updated tatemono inventory (12 → 17)

**Updated:**
- ✓ Tatemono count from 12 to 17 active examples
- ✓ Added new tatemonos: middleware-test, body-endpoint-handler, body-mail-notification, new-updates-styles
- ✓ Expanded @arkzen:routes documentation with handler injection examples
- ✓ Enhanced auth rules with auth_seed examples (roles-test, body-mail-notification)

**Clarified:**
- ✓ Body injection mechanism (base64-encoded, automatic hashing for passwords)
- ✓ CSS Modules strategy vs global Tailwind
- ✓ Middleware signature and queue time parameters
- ✓ Command scheduling cron syntax
- ✓ Notification channels vs mail toMail_body injection

---

## VERSION HISTORY

| Version | Status | Key Features |
|---------|--------|--------------|
| v6.0 | Base | Core Tatemono DSL, CRUD, multi-page |
| v6.1 | Documented | Styling, design standards (Guidelines) |
| v6.2 | Backend | Auth seed, notifications infrastructure |
| v6.3 | Body Injection | @arkzen:middleware/endpoint/handler/listener/jobs/console body injection |
| v6.4 | Styling | CSS Modules support, @arkzen:style:name |
| v7.0 | **CURRENT** | Complete documentation of all v6.3+ features |
| v8.0 | Roadmap | Inertia.js support (server-rendered React + Laravel) |
| v9.0 | Roadmap | React Native (iOS/Android via Expo) |

---

**Last Updated:** 2026-04-27  
**Parser Version:** v6.3  
**Builder Count:** 21  
**Active Tatemonos:** 17  
**Status:** Production-Ready ✓
