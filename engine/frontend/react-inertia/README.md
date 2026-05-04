# Arkzen Engine — React+Inertia.js Stack (v8)

## Status: Foundation / Partial

This is the Inertia.js frontend stack for Arkzen v8.
Same tatemono DSL — different architecture.

---

## Architecture

```
Laravel (PHP)  ←→  Inertia Protocol  ←→  React (Browser)
     ↑                                        ↑
  Handles routing                        Handles UI
  Enforces auth                          No React Router
  Serves props                           Props from server
```

**Key difference from Next.js / React+Vite:**
- There is no React Router. Laravel IS the router.
- Every navigation goes through Laravel's `web.php` routes.
- Controllers call `Inertia::render('TatName/PageName', $props)`.
- Props flow from Laravel → React (no manual API calls for initial data).
- Auth is enforced by Laravel middleware (not client-side redirects).
- Forms use `useForm()` from `@inertiajs/react` (no manual fetch).

---

## How to Run

### 1. Start Laravel (backend)
```bash
cd engine/backend/laravel
php artisan serve
```

### 2. Start Arkzen Inertia engine (watches tatemonos/)
```bash
cd engine/frontend/react-inertia
npm install
npm run arkzen
```

### 3. Start Vite (asset HMR)
```bash
cd engine/frontend/react-inertia
npx vite
```

> **Note**: Unlike React+Vite, you don't open `localhost:5173`.
> You open `localhost:8000` (Laravel). Vite only serves assets.

---

## File Structure

```
engine/frontend/react-inertia/
├── arkzen.ts                     ← Entry point (run this)
├── arkzen/
│   └── core/
│       ├── inertia-builder.ts    ← Orchestrates builds
│       ├── inertia-router.ts     ← Generates page files
│       ├── inertia-watcher.ts    ← Watches tatemonos/
│       └── types.ts              ← Inertia-specific types
├── resources/
│   └── js/
│       ├── app.tsx               ← Inertia app entry (resolves pages)
│       ├── Layouts/
│       │   ├── AuthLayout.tsx    ← For auth pages (presentational)
│       │   └── GuestLayout.tsx   ← For login/register pages
│       └── arkzen/
│           └── generated/
│               └── pages.ts      ← Auto-generated page registry
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Tatemono DSL

**Same as v7.** No changes. The same `core.tsx` tatemono file works across:
- Next.js (v7)
- React+Vite (v8)
- React+Inertia (v8)
- React Native (v9)

The engine detects which stack to build for based on which engine you run.

---

## What Works (Partial)

- ✅ File structure and engine scaffold
- ✅ Watcher (watches tatemonos/ folder)
- ✅ Builder (parses tatemono, calls router)
- ✅ Router (generates `resources/js/Pages/`)
- ✅ Page registry (`pages.ts` auto-updated)
- ✅ Inertia app entry (`app.tsx` with resolver)
- ✅ AuthLayout / GuestLayout
- ⏳ Laravel InertiaRouteBuilder (planned — generates web.php routes)
- ⏳ Laravel InertiaController (planned — renders pages with Inertia::render)
- ⏳ Full auth flow via Inertia forms
- ⏳ Real-time via Laravel Echo (planned)

---

## Key Inertia Patterns in Generated Pages

```tsx
// Getting props from Laravel
const { auth, flash, items } = usePage<MyPageProps>().props

// Navigation (no React Router)
router.visit('/my-app/dashboard')
router.visit('/my-app/dashboard', { method: 'get' })

// Forms (CSRF handled automatically)
const { data, setData, post, processing, errors } = useForm({ email: '', password: '' })
post('/my-app/auth/login')

// Links (SPA navigation without full reload)
<Link href="/my-app/dashboard">Dashboard</Link>
```