# ARKZEN ROADMAP — Version 8 & 9

## Current Status
**Version 7 (Current)**: Next.js 16 + TypeScript + Laravel 13 ✓ COMPLETE
- ✓ Component separation (individual component files + shared utilities backend)
- ✓ CSS/Style DSL (global + per-component CSS Modules)
- ✓ Multiple pages per tatemono
- ✓ Full auth system (Sanctum + roles)
- ✓ API generation (REST + custom routes)
- ✓ Real-time (Reverb + CRDT)
- ✓ Background jobs (queue workers)
- ✓ Events, listeners, notifications, mail
- ✓ Middleware + custom route handlers
- ✓ Asset management + favicon
- ✓ Animations (GSAP + Framer Motion)
- ✓ Full code generation from single tatemono file
- ✓ Zero hardcoding philosophy

**Power Level**: 9/10 — Enterprise-grade full-stack scaffolding

---

## Version 7.5 — Progressive Web App (PWA) & Offline Sync

### Why PWA?
- Works offline with local storage and sync
- Can be saved to home screen like native apps
- Automatic sync when internet connection returns
- Single codebase (Next.js) with offline-first architecture
- Service Workers for offline support

### New Capabilities
```
├── Offline Storage
│   └── IndexedDB + Service Workers
│       - Cache pages and assets
│       - Store mutations locally while offline
│       - Queue operations for sync
│
├── Sync Engine
│   └── Automatic conflict-free sync (CRDT)
│       - Same Reverb backend for real-time
│       - Offline queue → Online sync
│       - Merge conflicts resolved automatically
│
├── App Shell
│   └── Installable to home screen
│       - Web app manifest (manifest.json)
│       - Icon + splash screen
│       - Works like native app
│
└── UX Improvements
    └── Connection status indicator
        - Show when syncing
        - Show when offline
        - Retry failed operations
```

### Implementation Plan
1. **Phase 1**: Service Worker setup (Phase 7.5.1)
   - Offline page caching
   - Asset caching strategy
   
2. **Phase 2**: Local sync queue (Phase 7.5.2)
   - IndexedDB for local persistence
   - Queue API calls while offline
   
3. **Phase 3**: Automatic sync (Phase 7.5.3)
   - Detect online/offline status
   - Flush queue when online
   - Handle merge conflicts with CRDT
   
4. **Phase 4**: PWA manifest (Phase 7.5.4)
   - Web app manifest generation
   - Icon management
   - Installable to home screen

### What Stays the Same
- Tatemono file format
- Component separation
- CSS/Style DSL
- Auth system
- Real-time (Reverb)

---

## Version 8 — Multiple Frontend Stack Options

### Why Multiple Stacks?
- Different use cases need different approaches
- Developers can choose architecture they prefer
- Same backend, different frontend targets
- Future-proof for evolving requirements

### Three Frontend Stack Options

#### Option 1: Next.js + Laravel (Decoupled - Already in v7)
**Architecture**: Next.js SPA ↔ REST API ← Laravel Backend

```
├── Frontend Stack
│   └── Next.js 16 + TypeScript
│       - Client-side rendering (SPA)
│       - Full frontend flexibility
│       - Separate from backend
│
├── Backend
│   └── Laravel 13 (API-only mode)
│       - Serves REST API
│       - No views/blade templates
│       - Sanctum for auth
│
├── Communication
│   └── RESTful API
│       - JSON requests/responses
│       - Fully decoupled
│       - Can run on separate servers
│
└── Use Cases
    └── Large frontend team
        - Complex UI requirements
        - Frontend and backend teams working independently
        - Microservices architecture
```

#### Option 2: React + Laravel (Decoupled - New in v8)
**Architecture**: React SPA ↔ REST API ← Laravel Backend

```
├── Frontend Stack
│   └── React 18 + TypeScript + Vite
│       - Client-side rendering (SPA)
│       - Same API flexibility as Next.js
│       - Lightweight compared to Next.js
│
├── Backend
│   └── Laravel 13 (API-only mode)
│       - Same REST API as Next.js option
│       - Sanctum authentication
│
├── Communication
│   └── RESTful API
│       - Same as Next.js + Laravel
│       - Fully decoupled
│       - Frontend and backend independent
│
└── Use Cases
    └── Prefer React over Next.js
        - Simpler project structure
        - More lightweight SPA
        - Team expertise with React/Vite
```

#### Option 3: React + Inertia.js + Laravel (Monolithic - New in v8)
**Architecture**: Laravel (with React) ← Tightly Integrated

```
├── Frontend Stack
│   └── React 18 + TypeScript (Inertia.js adapter)
│       - Server-side rendered React components
│       - Props passed from Laravel
│       - No separate API calls needed
│       - Vite for build
│
├── Backend
│   └── Laravel 13 (Monolithic)
│       - Serves React components via Blade
│       - @inertia() route helper
│       - Server-side validation errors → frontend
│       - Same blade.php as entry point
│
├── Communication
│   └── Inertia Protocol (not REST)
│       - Components receive props from server
│       - Form submissions via Inertia
│       - Automatic CSRF handling
│       - No JSON API needed
│
├── Routing
│   └── Pure Laravel routes
│       - route('dashboard') generates links
│       - Inertia handles navigation
│       - Type-safe props with TypeScript
│
└── Use Cases
    └── Monolithic preference
        - Tightly integrated frontend + backend
        - Faster initial load (SSR)
        - Better SEO than SPA
        - Simpler deployment (single app)
```

### Why Three Options?

### New Capabilities

#### Option 1: Next.js + Laravel
```
(Same as v7)
```

#### Option 2: React + Laravel
```
(Same as Next.js + Laravel, but with React)
```

#### Option 3: React + Inertia.js + Laravel

### Implementation Plan

#### For Option 1 (Next.js + Laravel)
- Already complete in v7

#### For Option 2 (React + Laravel)
1. **Phase 1**: Create `ReactBuilder.ts` builder (Phase 8.1)
   - Parse @arkzen:page blocks → React components
   - Generate `src/Pages/*.tsx`
   - Setup Vite configuration
   
2. **Phase 2**: Route registration (Phase 8.2)
   - API endpoint generation
   - Type-safe API client
   
3. **Phase 3**: Form handling (Phase 8.3)
   - useForm hook with validation
   - API submission handling
   
4. **Phase 4**: Real-time support (Phase 8.4)
   - arkzenFetch for API calls
   - WebSocket integration for Reverb
   
5. **Phase 5**: Asset management (Phase 8.5)
   - Vite asset pipeline

#### For Option 3 (React + Inertia.js + Laravel)
1. **Phase 1**: Create `InertiaBuilder.ts` builder (Phase 8.1i)
   - Parse @arkzen:page blocks → React/Inertia pages
   - Generate `resources/js/Pages/*.tsx`
   - Auto-wire to Laravel routes
   
2. **Phase 2**: Route registration (Phase 8.2i)
   - Inertia route helpers
   - Props type definitions
   - Automatic route generation
   
3. **Phase 3**: Form handling (Phase 8.3i)
   - useForm hook (Inertia form helper)
   - Automatic validation error display
   - Server-side CSRF handling
   
4. **Phase 4**: Real-time support (Phase 8.4i)
   - Laravel Echo for Reverb
   - Real-time updates without API wrapper
   
5. **Phase 5**: Asset management (Phase 8.5i)
   - Vite asset pipeline
   - Favicon + static file serving

### What Stays the Same
- Tatemono file format (@arkzen:* blocks)
- Component separation strategy
- CSS/Style DSL
- Auth system (Sanctum works with all options)
- Real-time (Reverb works with all options)
- Jobs, events, notifications
- Generator logic (Phase builders)
- Database (@arkzen:database blocks)
- API generation (@arkzen:api blocks)

### Key Differences Between Options

| Feature | Next.js + Laravel | React + Laravel | React + Inertia.js |
|---------|-------------------|-----------------|-------------------|
| **Coupling** | Fully Decoupled | Fully Decoupled | Monolithic |
| **Routing** | Next.js routing | React Router | Laravel routes |
| **Rendering** | Client-side (SPA) | Client-side (SPA) | Server-side (SSR) |
| **Build** | Next.js webpack | Vite | Vite |
| **SEO** | Requires SSG/ISR | Requires extra setup | Native SSR |
| **Initial Load** | Moderate | Moderate | Faster |
| **API Calls** | REST API | REST API | Props-based |
| **Validation** | Client-side | Client-side | Server-side |
| **Complexity** | Higher | Moderate | Lower |
| **Team Size** | Large (frontend + backend) | Medium | Small/Medium |
| **Best For** | Complex frontends | React preference | Monolithic apps |

---

## Version 9 — React Native Support

### Why React Native?
- Cross-platform: iOS + Android from single codebase
- Reuse React skills
- Native performance
- Real-time sync with backend

### New Capabilities
```
├── Frontend Stack
│   └── React Native (Expo or bare)
│       - TypeScript
│       - React Navigation
│       - Native UI components
│       - Async storage
│
├── Backend (Same as v7/v8)
│   └── Laravel 13
│       - Same API endpoints
│       - Sanctum auth still works
│
├── API Usage
│   └── @arkzen:api blocks → Mobile-ready endpoints
│       - JSON responses (already compatible)
│       - Upload handling (image + document)
│       - Offline-first support
│
├── Component System
│   └── React Native components (not web components)
│       - <View>, <Text>, <FlatList>, etc.
│       - Same separation strategy (individual files)
│
├── Styling
│   └── React Native StyleSheet
│       - No CSS/Tailwind (not applicable to native)
│       - Design tokens as JS constants
│
└── Real-time
    └── WebSocket (native-compatible)
        - Same Reverb backend
        - React Native hooks for subscribers
```

### Implementation Plan
1. **Phase 1**: Create `ReactNative.ts` builder (Phase 9.1)
   - Parse @arkzen:page blocks → React Native screens
   - Component generation for native
   - Navigation setup

2. **Phase 2**: Navigation (Phase 9.2)
   - React Navigation integration
   - Automatic route generation
   - Deep linking support

3. **Phase 3**: API/Auth (Phase 9.3)
   - Same arkzenFetch for mobile
   - Sanctum auth (with secure storage)
   - Token refresh on mobile

4. **Phase 4**: Real-time (Phase 9.4)
   - WebSocket subscriptions
   - Background notifications
   - Offline queue + sync

5. **Phase 5**: Assets + Build (Phase 9.5)
   - Asset management (images, fonts)
   - Expo build config generation
   - Auto-generated app.json

### What Stays the Same
- Tatemono file format
- Backend (@arkzen:api, @arkzen:database, etc.)
- Component separation strategy (but native components)
- Auth system (Sanctum)
- Real-time (Reverb)
- Generator architecture

### What Changes
- Frontend framework: React Native instead of React Web
- Routing: React Navigation instead of file-based
- Styling: React Native StyleSheet instead of CSS
- Component location: `src/Screens/` and `src/Components/`
- Build: Expo/native toolchain instead of Next.js/Vite

---

## Roadmap Timeline

| Version | Frontend Options | Backend | Status | Timeline |
|---------|------------------|---------|--------|----------|
| v7 (Current) | Next.js 16 | Laravel 13 | ✓ Complete | Now |
| v7.5 | Next.js 16 (PWA) | Laravel 13 | Planned | 1-2 months |
| v8 | Next.js / React / React+Inertia | Laravel 13 | Planned | 2-3 months after v7.5 |
| v9 | React Native | Laravel 13 | Planned | 3-4 months after v8 |

---

## Why Arkzen is Powerful

### Current Advantages (v7)
1. **Single-file generation** — One tatemono = complete system
2. **Zero hardcoding** — All generated from DSL
3. **Component separation** — Individual files + shared utilities (no import chaos)
4. **CSS DSL** — Global variables + per-component modules (design tokens built-in)
5. **Full-stack** — Database, API, pages, components, auth, real-time, jobs, events, mail
6. **TypeScript everywhere** — Type-safe from frontend to backend
7. **Multi-page support** — Multiple routes, layouts, custom components
8. **Enterprise features** — Roles, middleware, policies, factories, seeders
9. **Real-time ready** — Reverb + CRDT for conflict-free sync
10. **Async operations** — Queue workers, jobs, background processing

### Why v8 + v9 Make It Even More Powerful
- **Framework flexibility** — Choose frontend (Next.js, Inertia, React Native)
- **True full-stack** — Same tatemono generates different frontends
- **Code reuse** — React component logic can be shared across web + mobile
- **Single backend** — One Laravel backend, multiple frontend targets
- **Future-proof** — Expandable to Vue, Svelte, etc.

**Arkzen will be the first full-stack scaffolder that generates:**
- Web SPAs (Next.js, React)
- Server-rendered apps (React + Inertia.js)
- Offline-first PWAs (works like native apps)
- Native mobile apps (React Native)
- **All from a single tatemono file**

### Power Rating
- **v7**: 9/10 (Enterprise web apps)
- **v7.5**: 9.3/10 (Web apps + offline + PWA)
- **v8**: 9.7/10 (3 frontend options + web apps + offline + PWA)
- **v9**: 10/10 (Complete ecosystem — web + mobile native + offline + PWA)

---

## Implementation Strategy

### Phase Builders (Already Exist)
All phases follow the same pattern:
```
Phase X.Y: Feature Name
├── Input: ParsedTatemono (from parser.ts)
├── Processing: Extract + transform data
├── Output: Generated files (PHP, TSX, CSS, config)
└── Side effects: Register routes, update imports, etc.
```

### Adding New Frameworks (v7.5-v9)
1. **For PWA support (v7.5)**:
   - Generate Service Worker boilerplate
   - Create IndexedDB sync queue logic
   - Generate manifest.json for installable web app
   - Update Next.js app to support offline mode
   
2. **For React + Laravel (v8)**:
   - Create new builder file: `ReactBuilder.ts`
   - Create new type: `ReactPage`
   - Update parser to detect framework option
   - Update export.ts to call new builders
   
3. **For React + Inertia.js (v8)**:
   - Create new builder file: `InertiaBuilder.ts`
   - Create new type: `InertiaPage`
   - Update parser to detect framework option
   - Update export.ts to call new builders
   
4. **For React Native (v9)**:
   - Create new builder file: `ReactNativeBuilder.ts`
   - Create new type: `NativeScreen`
   - Update parser to detect @arkzen:native blocks
   - Update export.ts to call new builders

### Backward Compatibility
- v8 + v9 are **additive**, not breaking
- Existing v7 tatemonos continue working
- Can choose framework per-tatemono

---

### Success Metrics for v7.5-v9

### v7.5 (PWA & Offline Sync)
- ✓ Can install web app to home screen
- ✓ Works offline with local storage
- ✓ Automatic sync when online
- ✓ Merge conflicts handled with CRDT
- ✓ Connection status shows in UI

### v8 (Multiple Frontend Stacks)
- ✓ Can generate functional Next.js + Laravel app
- ✓ Can generate functional React + Laravel app
- ✓ Can generate functional React + Inertia.js app
- ✓ Form handling works in all options
- ✓ Real-time updates work in all options
- ✓ No manual file editing required

### v9 (React Native)
- ✓ Can generate functional React Native app from tatemono
- ✓ API calls work (same endpoints as web)
- ✓ Auth works (Sanctum + secure storage)
- ✓ Real-time works (WebSocket subscriptions)
- ✓ Builds successfully (Expo or bare)

---

## Conclusion

**Arkzen v7 is already powerful.** v8 and v9 make it a complete ecosystem:
- One tatemono → Multiple frontend options
- Single backend → Any frontend framework
- Future-proof architecture → Easy to add more frameworks

**The vision**: Arkzen becomes the **universal full-stack scaffolder** — not locked to one tech stack, but a generator that speaks every language.
