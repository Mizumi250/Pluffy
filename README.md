# Arkzen Engine v9.0

Arkzen is a full-stack scaffolding engine. Write one Tatemono file — get a complete, isolated, production-ready system.

> **One Tatemono = one complete client system. No shared anything.**

---

## What is a Tatemono?

A single `.tsx` file at `tatemonos/<name>/core.tsx` that defines everything:

- Database tables, migrations, seeders
- Laravel backend — models, controllers, API routes, auth, middleware, jobs, events, listeners, notifications, mailables, Artisan commands, real-time channels
- Frontend — pages, components, Zustand stores, layouts, animations, error pages, CSS
- Export-ready as a standalone deployable project

The engine watches the file and rebuilds everything automatically.

---

## Stacks

Stack is chosen per-project, not per-tatemono. Tatemono syntax is identical across all stacks.

| Stack | Frontend | Backend | Mode |
|-------|----------|---------|------|
| `nextjs` *(default)* | Next.js 16 + TypeScript + Tailwind + Zustand | Laravel 13 | Decoupled |
| `react-vite` | React 18 + Vite + TypeScript + Tailwind + Zustand | Laravel 13 | Decoupled |
| `tanstack-start` | TanStack Start + Vite + TypeScript + Tailwind + Zustand | Laravel 13 | Decoupled |
| `astro` | Astro + React islands + TypeScript + Tailwind | Laravel 13 | Decoupled |
| `react-inertia` | React 18 + Inertia.js + TypeScript | Laravel 13 | Monolithic |
| `native` *(partial)* | React Native + React Navigation | Laravel 13 | Decoupled |

Switch stack:
```bash
node arkzen.js switch nextjs
node arkzen.js stacks        # list all + status
```

---

## Common to All Stacks

- **Backend:** Laravel 13 + SQLite (per-tatemono isolated) + Laravel Sanctum
- **Real-time:** Laravel Reverb
- **Animation:** GSAP + Framer Motion
- **Icons:** Lucide React (primary), Hero Icons (secondary)
- **Optional:** Matter.js, Three.js, TipTap, Leaflet

---

## Architecture

```
arkzen/
├── engine/
│   ├── frontend/
│   │   ├── nextjs/                  # Next.js stack
│   │   ├── react-vite/              # React + Vite stack
│   │   ├── tanstack-start/          # TanStack Start stack
│   │   ├── astro/                   # Astro stack
│   │   ├── react-inertia/           # React + Inertia stack
│   │   └── react-native/            # React Native stack (partial)
│   └── backend/
│       ├── laravel/                 # Shared backend (all decoupled stacks)
│       │   └── app/Arkzen/
│       │       ├── Builders/        # 21 code generation builders
│       │       └── Readers/         # ModuleReader, RegistryReader
│       └── laravel-inertia/         # Inertia-specific backend
├── tatemonos/                       # Tatemono blueprints: <name>/core.tsx
│   └── <name>/
│       ├── core.tsx                 # The tatemono DSL file
│       └── assets/                  # Static files → auto-copied to public
├── projects/                        # Exported standalone projects
├── arkzen.js                        # CLI — stack switching
├── arkzen.json                      # Engine registry + active stack
├── setup.js                         # One-time engine setup
├── start.js                         # Start frontend + backend + queue + reverb
├── new.js                           # Scaffold a fresh project
└── export.js                        # Export one tatemono as standalone project
```

---

## Backend Builder Pipeline (21 Builders)

All in `engine/backend/laravel/app/Arkzen/Builders/`:

`AuthBuilder` · `MigrationBuilder` · `ModelBuilder` · `ControllerBuilder` · `RequestBuilder` · `ResourceBuilder` · `PolicyBuilder` · `FactoryBuilder` · `SeederBuilder` · `RouteRegistrar` · `CustomRouteBuilder` · `MiddlewareBuilder` · `JobBuilder` · `EventBuilder` · `ListenerBuilder` · `NotificationBuilder` · `MailBuilder` · `ConsoleBuilder` · `BroadcastBuilder` · `ChannelBuilder` · `ArkzenYaml`

Readers: `ModuleReader` · `RegistryReader`

---

## Quick Start

```bash
node setup.js          # one-time setup
node start.js          # start everything
```

---

## Engine Commands

```bash
node setup.js                  # one-time setup (PHP deps, npm, .env, migrations)
node start.js                  # start Laravel + queue worker + Reverb + frontend
node arkzen.js switch <stack>  # switch active frontend stack
node arkzen.js stacks          # list stacks + install status
node export.js <tatemono>      # export one tatemono as standalone deployable project
node new.js <project-name>     # scaffold a fresh client project
```

---

## Workflow

1. Create `tatemonos/<name>/core.tsx` following the DSL syntax
2. Engine is already running (`node start.js`) — it detects the file and builds
3. Frontend + backend code generated automatically, hot-rebuilt on every save
4. Export when ready:

```bash
node export.js <name>
# → projects/<name>/  (standalone Laravel + frontend, ready to deploy)
```

---

## Active Tatemonos (25)

| Tatemono | Version | Auth | Pages |
|----------|---------|------|-------|
| animation-lab | v1.0.0 | — | index |
| asset-hub | v1.0.0 | — | index |
| auth-test | v1.0.0 | ✓ | login, register, dashboard |
| barbershop-booking | v1.0.0 | — | index |
| body-endpoint-handler | v1.0.0 | — | index |
| body-mail-notification | v1.0.0 | ✓ | login, register, dashboard |
| broadcast-test | v2.0.0 | ✓ | login, register, dashboard |
| certflow | v1.0.0 | ✓ | login, dashboard, fill, verify |
| church-community | v3.0.0 | ✓ | index, members, inventory, admin, login, register |
| crud-test | v1.0.0 | — | index |
| dtr-geofencing | v2.0.0 | — | index, admin |
| errors-test | v1.0.0 | — | index |
| events-test | v1.0.0 | — | index |
| inventory-management | v2.0.0 | — | index |
| jo-payroll | v3.0.0 | — | index, job-database, cash-atm, sss, hdmf, appointments, payslip |
| job-test | v1.0.0 | — | dashboard |
| mail-test | v2.0.0 | ✓ | login, register, dashboard |
| middleware-test | v2.0.0 | — | index |
| new-updates-styles | v2.0.0 | — | index, about, features |
| notification-test | v2.1.0 | ✓ | login, register, dashboard |
| portfolio-test | v1.0.0 | — | index |
| queue-flow | v1.0.0 | — | index, join, admin |
| roles-test | v2.1.0 | ✓ | login, register, dashboard |
| scheduler-test | v2.0.0 | — | dashboard |
| upload-test | v1.0.0 | — | dashboard |

---

## Environment Variables

### Frontend (`engine/frontend/<stack>/.env.local`)
```env
ARKZEN_BACKEND_URL=http://localhost:8000
ARKZEN_ENGINE_SECRET=arkzen-secret-123
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=ws
NEXT_PUBLIC_REVERB_APP_KEY=arkzen-key
```

### Backend (`engine/backend/laravel/.env`)
```env
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
ARKZEN_ENGINE_SECRET=arkzen-secret-123
REVERB_APP_ID=arkzen
REVERB_APP_KEY=arkzen-key
REVERB_APP_SECRET=arkzen-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

---

## Available Imports (in `@arkzen:components`)

```tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { create } from 'zustand'
import { arkzenFetch, useAuthStore } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'
import { Modal } from '@/arkzen/core/components/Modal'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'

// Optional (installed):
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import Matter from 'matter-js'
import L from 'leaflet'
import { useEditor, EditorContent } from '@tiptap/react'
```

> Use `useArkzenRouter()` and `useArkzenPathname()` in all layouts — these are stack-agnostic adapters, not Next.js/React Router specific hooks.

---

## Documentation

- **ARKZEN_GUIDELINES_v9.0.md** — Complete DSL reference for generating tatemonos. Paste into any AI.
- **ARKZEN_ROADMAP.md** — Planned features and next versions.