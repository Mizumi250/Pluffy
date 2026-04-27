# ARKZEN Engine v7.0

Arkzen is a **full-stack scaffolding engine** that turns a single Tatemono blueprint into a complete Laravel + Next.js system.

> **Core value proposition:** **One Tatemono file = one complete production-ready system.**

---

## 1) Modern Introduction

ARKZEN Engine v7.0 watches Tatemono files and generates:

- Laravel backend code (migrations, models, controllers, requests, resources, policies, jobs, events, listeners, notifications, mailables, console commands, routes)
- Next.js frontend code (pages, components, stores, realtime hooks, animations)
- Registry and exportable project structure for standalone delivery

A Tatemono is the source of truth. Arkzen distributes instructions to frontend + backend builders and keeps the generated system isolated per module.

---

## 2) Stack Information

### Frontend

- **Next.js 16**
- **TypeScript**
- **Tailwind CSS**
- **Zustand**

### Backend

- **Laravel 13**
- **SQLite per tatemono (isolated data boundary)**
- **Laravel Sanctum** for auth
- Laravel Reverb for realtime channels

---

## 3) Architecture Diagram

```text
/home/runner/work/arkzen/arkzen
├── engine/
│   ├── frontend/                    # Next.js app + parser/watcher/builder bridge
│   │   ├── app/                     # Generated routes/pages
│   │   ├── arkzen/core/             # Core components/hooks/layouts/store
│   │   ├── tatemono/                # Watch folder for active build input
│   │   └── validate.js
│   └── backend/                     # Laravel app + Arkzen builders
│       ├── app/Arkzen/Builders/     # Backend code generation pipeline
│       ├── app/Arkzen/Readers/
│       ├── routes/modules/          # Generated API route files
│       ├── database/migrations/arkzen/
│       └── database/seeders/arkzen/
├── tatemonos/                       # Canonical blueprint source: <name>/core.tsx
├── projects/                        # Exported standalone projects
├── setup.js                         # Engine bootstrap
├── start.js                         # Run backend + queue + reverb + frontend
└── export.js                        # Export one tatemono as project
```

---

## 4) Backend Builder Pipeline (21 Builders)

Located in `engine/backend/app/Arkzen/Builders`:

1. `AuthBuilder` — per-tatemono auth stack (Sanctum, auth routes, auth flow)
2. `MigrationBuilder` — migration generation
3. `ControllerBuilder` — API controllers
4. `JobBuilder` — queued job classes from `@arkzen:jobs:*`
5. `ConsoleBuilder` — Artisan commands + schedule metadata
6. `MailBuilder` — mailable classes/views
7. `EventBuilder` — event classes
8. `NotificationBuilder` — notification classes/channels
9. `BroadcastBuilder` — broadcast event generation
10. `ChannelBuilder` — channel authorization files
11. `RouteRegistrar` — module route registration wiring
12. `SeederBuilder` — seeders from Tatemono data
13. `ModelBuilder` — Eloquent models/relations/casts
14. `ResourceBuilder` — API resources (transformers)
15. `PolicyBuilder` — authorization policies
16. `FactoryBuilder` — model factories
17. `RequestBuilder` — Form Request validation classes
18. `ListenerBuilder` — event listener classes
19. `CustomRouteBuilder` — custom `@arkzen:routes` endpoints
20. `MiddlewareBuilder` — middleware artifacts/registrations
21. `ArkzenYaml` — YAML parse/normalization helper for builder inputs

Readers used by the pipeline:

- `ModuleReader`
- `RegistryReader`

---

## 5) v7 Tatemono Syntax (23 DSL Sections)

Follow this exact order (from `ARKZEN_GUIDELINES_v7.md`):

1. `@arkzen:meta` — identity (`name`, `version`, `description`, `auth`, `auth_seed`)
2. `@arkzen:config` *(optional)* — component/layout tuning
3. `@arkzen:database:identifier` *(repeat)* — table schema definitions
4. `@arkzen:api:identifier` *(repeat)* — REST resource endpoints
5. `@arkzen:routes` *(optional)* — custom backend routes with handler body injection
6. `@arkzen:middleware:name` *(optional, repeat)* — middleware with PHP body injection
7. `@arkzen:store:identifier` *(optional, repeat)* — Zustand stores
8. `@arkzen:realtime:identifier` *(optional, repeat)* — WebSocket/Reverb channels/events
9. `@arkzen:events:identifier` *(optional, repeat)* — events and listeners
10. `@arkzen:listener:name` *(optional, repeat)* — listener with PHP body injection
11. `@arkzen:jobs:identifier` *(optional, repeat)* — queue jobs (with PHP `handle()` body)
12. `@arkzen:notifications:identifier` *(optional, repeat)* — mail/database/broadcast notifications
13. `@arkzen:mail:identifier` *(optional, repeat)* — mailables/templates with blade_body injection
14. `@arkzen:console:identifier` *(optional, repeat)* — Artisan commands + cron schedule
15. `@arkzen:endpoint:name` *(optional, repeat)* — custom API endpoint bodies
16. `@arkzen:handler:name` *(optional, repeat)* — custom route handler bodies
17. `@arkzen:layout:name` *(optional, repeat)* — custom layout blocks
18. `@arkzen:components:identifier` *(repeat)* — imports + reusable components/types/constants
19. `@arkzen:style` *(optional, once)* — global CSS
20. `@arkzen:style:name` *(optional, repeat)* — CSS Modules per component
21. `@arkzen:page:name` *(repeat)* — page definitions and layout binding
22. `@arkzen:error:404` *(optional)* — custom 404 behavior
23. `@arkzen:error:500` *(optional)* — custom 500 behavior
24. `@arkzen:animation` *(optional)* — GSAP animation block

---

## 6) Design Standards

ARKZEN v6 design policy:

- **Apple-minimalist aesthetic** (clean spacing, restrained visual noise)
- **Tailwind CSS** as the required styling system
- **Lucide React** icons for UI iconography

---

## 7) 17 Active Tatemono Blueprints

From `tatemonos/`:

1. **auth-test** (**v1.0.0**) — Sanctum authentication with login/register/dashboard
2. **crud-test** (**v1.0.0**) — Full CRUD operations with models/controllers/resources
3. **inventory-management** (**v2.0.0**) — Stock tracking with seeding
4. **broadcast-test** (**v2.0.0**) — Real-time messaging with Reverb channels
5. **roles-test** (**v2.1.0**) — Role-based access control + middleware body injection
6. **events-test** (**v1.0.0**) — Laravel events with listeners
7. **job-test** (**v1.0.0**) — Queue jobs (process-data, heavy-computation, always-fails)
8. **notification-test** (**v2.1.0**) — Database/mail/broadcast notifications
9. **mail-test** (**v2.0.0**) — Email templates and mailables with SMTP testing
10. **scheduler-test** (**v2.0.0**) — Task scheduling with Artisan commands + cron
11. **upload-test** (**v1.0.0**) — File uploads, image preview, download
12. **errors-test** (**v1.0.0**) — HTTP error simulation + custom error pages
13. **middleware-test** (**v2.0.0**) — Custom middleware with body injection
14. **body-endpoint-handler** (**v1.0.0**) — Custom endpoint/handler body injection
15. **body-mail-notification** (**v1.0.0**) — Mail blade_body + notification toMail_body injection
16. **portfolio-test** (**v1.0.0**) — Static portfolio showcase
17. **new-updates-styles** (**v2.0.0**) — CSS Modules + custom components

---

## 8) Quick Start

```bash
cd arkzen
node setup.js
node start.js
```

Optional validation (frontend parser validator):

```bash
cd engine/frontend
node validate.js <tatemono-name>
```

---

## 9) Workflow (Create → Build → Export)

1. Create blueprint at `tatemonos/<name>/core.tsx`
2. Ensure it follows v7 syntax (23 DSL sections)
3. Run engine (`node start.js`) for generation and hot rebuild
4. Export standalone project:

```bash
node export.js <tatemono-name>
```

5. Open exported project in `projects/<tatemono-name>/`

---

## 10) Feature Matrix (v6.3+ Features)

| Feature | Version | Example Tatemono | Status |
|---------|---------|------------------|--------|
| Tatemono DSL | v6.0 | all | ✓ Production |
| Auth + Sanctum | v6.1 | auth-test | ✓ Production |
| CRUD operations | v6.0 | crud-test | ✓ Production |
| Real-time channels | v6.0 | broadcast-test | ✓ Production |
| Events + listeners | v6.0 | events-test | ✓ Production |
| Queue jobs | v6.0 | job-test | ✓ Production |
| Notifications | v6.0 | notification-test | ✓ Production |
| Mailable templates | v6.0 | mail-test | ✓ Production |
| Artisan commands | v6.0 | scheduler-test | ✓ Production |
| File uploads | v6.0 | upload-test | ✓ Production |
| Error pages (404/500) | v6.0 | errors-test | ✓ Production |
| **Middleware body injection** | **v6.3** | **middleware-test** | ✓ Production |
| **Custom endpoint bodies** | **v6.3** | **body-endpoint-handler** | ✓ Production |
| **Custom handler bodies** | **v6.3** | **body-endpoint-handler** | ✓ Production |
| **Listener body injection** | **v6.3** | **events-test** | ✓ Production |
| **Mail blade_body injection** | **v6.3** | **body-mail-notification** | ✓ Production |
| **Notification toMail_body** | **v6.3** | **body-mail-notification** | ✓ Production |
| **Console commands + cron** | **v6.3** | **scheduler-test** | ✓ Production |
| **CSS Modules + global CSS** | **v6.4** | **new-updates-styles** | ✓ Production |

---

## 11) Available Imports

### Components (`@/arkzen/core/components`)

```tsx
import {
  Modal, Drawer, Toast, useToast, Dialog, Tooltip, Breadcrumb,
  Table, Form, Field, Pagination, Loading, PageTransition,
  Badge, Avatar, EmptyState
} from '@/arkzen/core/components'
```

### Hooks (`@/arkzen/core/hooks/*`)

```tsx
import { useQuery } from '@/arkzen/core/hooks/useQuery'
import { useMutation } from '@/arkzen/core/hooks/useMutation'
import { useWebSocket } from '@/arkzen/core/hooks/useWebSocket'
import { useCRDT } from '@/arkzen/core/hooks/useCRDT'
```

### Auth Store

```tsx
import { useAuthStore, arkzenFetch } from '@/arkzen/core/stores/authStore'
```

### Icons

```tsx
import { Bell, Shield, Boxes, Mail } from 'lucide-react'
```

---

## 12) Environment Variables

### Frontend (`engine/frontend/.env.local`)

```env
ARKZEN_BACKEND_URL=http://localhost:8000
ARKZEN_ENGINE_SECRET=arkzen-secret-123
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=ws
NEXT_PUBLIC_REVERB_APP_KEY=arkzen-key
```

### Backend (`engine/backend/.env`)

```env
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/engine/backend/database/database.sqlite
ARKZEN_ENGINE_SECRET=arkzen-secret-123

REVERB_APP_ID=arkzen
REVERB_APP_KEY=arkzen-key
REVERB_APP_SECRET=arkzen-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

---

## 13) Engine Commands

```bash
node setup.js                 # one-time setup
node start.js                 # start frontend + backend + queue + reverb
node new.js <project-name>    # scaffold a fresh project
node export.js <tatemono>     # export one tatemono as standalone project
```

---

## 14) Documentation

- **ARKZEN_GUIDELINES_v7.md** — Complete reference (all 23 DSL sections, examples, patterns)
- **ARKZEN_ROADMAP_v8-v9.md** — Future versions (Inertia.js, React Native)

---

## 15) Notes

- `arkzen.json` is engine-managed registry metadata.
- Keep Tatemono names lowercase-hyphen format.
- Prefer one isolated domain system per Tatemono.
- All tatemonos follow Apple-minimalist design + Tailwind CSS + Lucide React icons.
- Parser version: v6.3, Backend builders: 21, Active tatemonos: 17, Status: Production-Ready ✓
