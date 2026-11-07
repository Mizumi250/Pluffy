  # PLUFF GUIDELINES v14.0

  ## For AI — Generating & Editing Tatemono Files

  **VERSION:** 14.0
  **VERIFIED AGAINST:** shared engine parser and validator (including `backends.ts` variant resolution), desktop Electron and Tauri shells, Laravel builders, and the Express, FastAPI, Spring Boot, ASP.NET Core, Go and Rust engine implementations under `engine/backend/`; also `mizumi.js`, `start.js`, `setup.js`, `export.js`, and tatemonos under `tatemonos/`.
  **PURPOSE:** Complete reference for generating valid Pluff tatemono files. Paste into any AI (or use as the system prompt / training source for the Pluff AI).
  **SOURCE OF TRUTH ORDER:** (1) engine parser + builders, (2) real working tatemonos, (3) this document. If this document disagrees with the parser, the parser wins — and the doc should be fixed.

  **WHAT'S NEW IN v14.0 (vs v13.2):**

  - **Seven backends, one DSL.** The backend is still a project-level setting (`activeBackend` in `arkzen.json`). The seven selectable backends and their variant tokens are: `laravel` (`:php`), `express` (`:ts`), `fastapi` (`:py`), `spring-boot` (`:java`), `aspnet` (`:cs`), `go` (`:go`) and `rust` (`:rs`). `laravel-inertia` (`:php`) is chosen automatically with the `react-inertia` web stack and cannot be swapped. The registry also maps `django` to `:py`, but no Django engine exists yet.
  - **New Section 1F: body reference for `:java`, `:cs`, `:go` and `:rs`.** Names in scope, return conventions and helper APIs for the four new variants, one endpoint written in all seven variants, the Rust-only `@arkzen:module:rs` block, and mail placeholder syntax per backend.
  - **New Section 1G: execution model, capability matrix and targeting rules.** Which backends actually run a custom body, what each backend implements, how raw SQL names tables, and what to generate when the backend is known or unknown.
  - **Corrections.** Rust supports PostgreSQL (all seven backends support SQLite and PostgreSQL). The FastAPI example list now matches the tatemonos that carry `:py` bodies. Section 27 lists all 46 tatemonos with the backend variants each one carries.
  - **Backend README files may be outdated.** Verify backend behavior against the engine/framework implementation and working Tatemono fixtures; do not treat a backend README as evidence of current support.

  **WHAT'S NEW IN v13.0 (vs v12.0):**

  - **Two backends, one DSL.** The backend is a **project-level** setting (`activeBackend` in `arkzen.json`, switch with `node mizumi.js backend <n>`), not something a tatemono declares. Laravel is the reference backend; **Express (TypeScript)** is the second implemented backend. See Section 1E.
  - **Backend variant suffixes.** Backend code blocks (`endpoint`, `handler`, `policy`, `middleware`, `listener`, `jobs`, `console`, and `notifications` / `mail` that carry a body) take a suffix between marker and name: `:php` (Laravel) or `:ts` (Express). The active backend reads the matching variant. An unsuffixed code body is only a fallback read as `:php` until the tatemono is converted; unsuffixed YAML-only blocks are shared by every backend.
  - **A tatemono with no usable variant for the active backend is inactive on it** (validator error, not a crash). A tatemono may carry variants for one backend or all of them.
  - **`:ts` body conventions** (Express) documented next to each backend block (Sections 8-18), including custom runtime equivalents for uploads, resources, factories, queues, commands, events, notifications, realtime, and streaming SSE.
  - **Sections 27 / 28B / 29** updated: at the v13.0 release, the list had 37 tatemonos (including `express-test` and `express-test-2`), Express runtime/export behavior, multi-backend quirks, and the backend checklist.
  - **The old Laravel code blocks are now the `:php` variant.** Sections 9B-18 are rewritten with `:php` (Laravel) and `:ts` (Express) side by side. A plain unsuffixed code body is only a fallback the engine still reads as `:php` for tatemonos not converted yet.

  **WHAT'S NEW IN v13.1 (vs v13.0):**

  - **Clarified Express parity scope:** “Laravel parity” means matching the Laravel builders and runtime features that Pluff's engine uses or exposes through its DSL—not recreating unrelated Laravel framework internals. Any difference in an engine-used feature is a parity gap to fix.
  - **Express mail templates:** documented the implemented safe Blade subset: interpolation, comments, conditional branches, and loops. Arbitrary Blade directives and PHP execution are not supported.
  - **Express parity additions:** realtime channel authorization values, notification broadcast channel types, and additional Laravel-style validation rules are documented in Section 1E.

  **WHAT'S NEW IN v13.2 (vs v13.1):**

  - **FastAPI is a runnable backend.** Setup creates a Python virtual environment, `start.js` runs the API and worker, and `export.js` installs the exported backend dependencies.
  - **Python backend variants:** backend code bodies may use `:py` for FastAPI, alongside Laravel `:php` and Express `:ts`.
  - **FastAPI runtime parity work:** multipart uploads, native notification inbox routes, declared realtime-channel authorization, and notification broadcast channel types are wired into the engine.
  - **AI Studio:** the `ollama-studio` Tatemono uses a server-configured OpenAI-compatible API; its API key stays in the FastAPI backend environment.

  **WHAT'S NEW IN v12.0 (vs v11.0):**

  - **Three stack categories** — `web`, `app`, `desktop` — can all be active at once. New stacks: `react-native` (bare), `lynx`, `tauri`, `electron`.
  - **Native DSL is now per-target.** Expo, bare React Native, and Lynx each have their own blocks. Expo/RN blocks use dual-target `@arkzen:import:expo` / `@arkzen:import:rn` pairs. Lynx blocks use separate `:lynx` tags; their imports are handled by the Lynx generator.
  - **New native blocks:** `@arkzen:native:style` (global), `@arkzen:native:error:404|500`, `@arkzen:native:animation:expo|rn|lynx`, `@arkzen:native:script:expo|rn|lynx[:name]`, all `native:*:lynx` blocks. **Removed:** generic `@arkzen:native:script`, and `animation:rn` no longer serves Expo.
  - **PostgreSQL support** — database driver is a project-level setting (`mizumi db`), one isolated database per tatemono.
  - **Corrected syntax** that v10 had wrong: console blocks use `signature:` (not `command:`), listeners use `@arkzen:listener:Name` (singular), mail blocks use `subject` + `data:` (not `lines`/`action`), body-bearing notifications/mail/events/realtime blocks need `:end`, the multi-table `tables:` database format is **not parsed**, `type: enum` is **not supported**.
  - **Special endpoint `type:` values** (`upload`, `broadcast`, `mail_send`, `notification_trigger`, ...) and role endpoint names, documented.
  - **`@arkzen:meta`** gained `dependencies` and `auth_seed`; **`@arkzen:meta:web`** gained `og`, `twitter`, `pwa`, `label`; `favicon`/`pwa` inside `@arkzen:meta` are deprecated.
  - **Lynx realtime:** an SSE bridge controller is auto-generated for Lynx when a tatemono has realtime + a `type: broadcast` endpoint.
  - **Desktop window configuration:** `@arkzen:desktop:config` supports shared window sizing, minimum dimensions, title, resizing, and fullscreen behavior. Electron and Tauri apply the settings from the active Tatemono registry; if configured Tatemonos conflict, the alphabetically earlier value wins with a warning.
  - **33 tatemonos** (new: `ethereane`, `lain098`, `shikaku`). A "Known engine quirks" section lists behaviors worth double-checking.

  * * *

  ## SECTION 1 — WHAT IS PLUFF

  Pluff is a full-stack scaffolding engine. A single file called a **Tatemono** defines an entire system: database tables, backend API, auth, middleware, realtime channels, jobs, events, notifications, mail, scheduled commands, web pages, native screens, components, stores, animations.

  **One Tatemono = one complete, fully isolated client system.**

  No shared auth, components, stores, or database between tatemonos. Every tatemono stands alone. The engine watches `tatemonos/<name>/core.tsx`, parses it, and (re)builds backend + frontend on every save. A tatemono can be exported as a standalone project.

  **The shared Tatemono DSL is consistent across stacks.** Backend code bodies use the active backend's variant (`:php`, `:ts`, `:py`, `:java`, `:cs`, `:go`, or `:rs`); the engine picks the right output for the active web / app / desktop stack. Backend parity is measured against the Laravel features the Pluff engine uses and exposes—not unrelated framework capabilities.

  **Common to all stacks:**

  - Backend: **Laravel 13 + Sanctum + Reverb** (reference backend), **Express (TypeScript)**, **FastAPI (Python)**, **Spring Boot (Java)**, **ASP.NET Core (C#)**, **Go (Chi)**, or **Rust (Axum)**, chosen per project (Sections 1E to 1G). Backend parity is scoped to the Laravel builder/runtime features Pluff uses or exposes through its DSL—not unrelated framework internals.
  - Database: SQLite (default) or PostgreSQL — one isolated database per tatemono
  - Web animation: GSAP + Framer Motion · Native animation: Reanimated / Moti (Expo, RN) or `@lynx-js/motion` (Lynx)
  - Icons: Lucide React (web primary), Hero Icons (secondary)
  - Optional (installed): Matter.js, Three.js, TipTap, Leaflet

  * * *

  ## SECTION 1B — STACKS & CLI

  Stacks are chosen **per project**, in three independent categories.

  | Category  | Stack            | Description                                              |
  |-----------|------------------|----------------------------------------------------------|
  | `web`     | `nextjs` (default)| Next.js 16 + TS + Tailwind + Zustand (decoupled)         |
  | `web`     | `react-vite`     | React 19 + Vite + TS + Tailwind + Zustand (decoupled)    |
  | `web`     | `tanstack-start` | TanStack Start + Vite + TS + Tailwind + Zustand          |
  | `web`     | `astro`          | Astro + React islands + TS + Tailwind                    |
  | `web`     | `react-inertia`  | React 19 + Inertia.js (Laravel monolith; uses `laravel-inertia` backend) |
  | `app`     | `expo`           | Expo (SDK 58, Expo Go) + Expo Router + NativeWind       |
  | `app`     | `react-native`   | Bare React Native                                        |
  | `app`     | `lynx`           | Lynx (Rspeedy / ReactLynx)                               |
  | `desktop` | `tauri`          | Tauri shell that **wraps the running web stack**         |
  | `desktop` | `electron`       | Electron shell that **wraps the running web stack**      |

  Backends (project-level, see Section 1E):

  | Backend           | DSL variant | Status | Used with |
  |-------------------|-------------|--------|-----------|
  | `laravel`         | `:php`      | implemented (reference) | all decoupled web stacks, and app stacks |
  | `laravel-inertia` | `:php`      | implemented | `react-inertia` only; chosen automatically, cannot be swapped for another backend |
  | `express`         | `:ts`       | implemented (custom Laravel-compatible runtime) | decoupled web stacks, and app stacks |
  | `fastapi`         | `:py`       | implemented (Python runtime) | decoupled web stacks, and app stacks |
  | `spring-boot`     | `:java`     | implemented, in progress (Java bodies compiled and hot-loaded) | decoupled web stacks, and app stacks |
  | `aspnet`          | `:cs`       | implemented, in progress (C# bodies run as Roslyn scripts) | decoupled web stacks, and app stacks |
  | `go`              | `:go`       | implemented foundation (Chi; endpoint and route bodies are interpreted) | decoupled web stacks, and app stacks |
  | `rust`            | `:rs`       | implemented foundation (Axum; endpoint and handler bodies are compiled) | decoupled web stacks, and app stacks |

  Toolchains: Laravel needs PHP and Composer, Express needs Node, FastAPI needs Python 3, Spring Boot needs JDK 17+ and Maven, ASP.NET Core needs the .NET 8 SDK, Go needs Go 1.22+, Rust needs rustup and Cargo. `node setup.js --backend <name>` installs one backend.

  Desktop targets reuse the web blocks for their rendered UI. A small desktop-specific config block controls the desktop shell window; it does not create separate desktop pages or components.

  **CLI (interactive: `node mizumi.js`):**

  ```
  node setup.js                         # one-time setup (PHP deps, npm, .env, migrations)
  node start.js                         # start Laravel + queue worker + Reverb + active frontends
  node mizumi.js                        # interactive menu
  node mizumi.js start | setup | stack | stacks | modules
  node mizumi.js web <stack>            # switch web stack
  node mizumi.js app <stack>            # switch app stack (expo | react-native | lynx)
  node mizumi.js desktop <stack>        # switch desktop stack (tauri | electron)
  node mizumi.js db <sqlite|postgresql> # switch database driver
  node mizumi.js backend <n>           # switch backend (laravel | express | fastapi | spring-boot | aspnet | go | rust)
  node mizumi.js deps install express  # install the Express backend deps (npm); Laravel uses composer via setup.js
  node setup.js --backend [laravel|laravel-inertia|express|fastapi|spring-boot|aspnet|go|rust] # install one backend
  # Express extras (inside engine/backend/express):  npm run queue  → jobs + schedules   ·   npm run pluff -- <signature>  → run a console command
  node mizumi.js deps [prune | install <stack> | uninstall <stack>]
  node mizumi.js export                 # wizard
  node mizumi.js export <name> [stack]  # export one tatemono as standalone project
  node export.js <name>                 # export one tatemono directly
  ```

  * * *

  ## SECTION 1C — DATABASE PROVIDER (project-level, NOT in the DSL)

  Every tatemono gets its own isolated database. The driver is a **project setting**, not a tatemono field:

  - `sqlite` (default): file `database/arkzen/<slug>.sqlite`
  - `pgsql`: Postgres database `<ARKZEN_DB_PREFIX>_<slug_with_underscores>` (prefix default `pluff`)

  Switch with `node mizumi.js db postgresql` (prompts for host/user/password/main DB name, then re-runs setup). Env: `ARKZEN_DB_DRIVER`, `ARKZEN_DB_PREFIX`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`. All seven backends use the same project-level driver choice and isolated-per-tatemono database model, including Rust (`engine/backend/rust/src/db.rs` dispatches to SQLite or PostgreSQL). Spring Boot's PostgreSQL path is still untested according to its README. PostgreSQL needs a database user that may create and drop databases on Go and Rust. Tatemono files never mention the driver — write the same `@arkzen:database` blocks for both supported drivers.

  Backends are a separate project-level choice (Section 1E). PostgreSQL is supported by all seven backends. Confirm the selected backend's PostgreSQL driver/dependencies are installed before switching.

  * * *

  ## SECTION 1D — DESKTOP WINDOW CONFIGURATION

  Use one optional `@arkzen:desktop:config` YAML block to configure the shared desktop shell window. Omit it to use the shell defaults. This first version supports window settings only; menus and IPC are not part of the DSL yet.

  ```tsx
  /* @arkzen:desktop:config
  window:
    width: 1280
    height: 800
    min_width: 800
    min_height: 600
    resizable: true
    fullscreenable: true
    title: Pluff
  */
  ```

  `width`, `height`, `min_width`, and `min_height` must be positive integers. Minimum dimensions cannot exceed their corresponding starting dimensions. `resizable` and `fullscreenable` must be booleans. `title` must be a non-empty string.

  The Electron and Tauri shells wrap the whole web app, so this setting is shared rather than isolated to a single route. Partial settings from active Tatemonos are combined; if two Tatemonos set different values for the same property, the alphabetically earlier Tatemono wins and the shell logs a warning. Tauri applies the size, minimum size, title, and resizing settings. A Tauri export includes only its selected Tatemono's settings. Tauri has no portable API for disabling a window's fullscreen controls, so `fullscreenable: false` is warned about but cannot be enforced.

  ## SECTION 1E — BACKENDS & BACKEND VARIANTS

  **The backend is not part of a tatemono.** It is a project setting (`arkzen.json` → `activeBackend`; `react-inertia` forces `laravel-inertia`). The same tatemono file can build on any backend that can read it, but available behavior depends on that engine's implementation. Laravel is the **reference backend**: the shared DSL uses Laravel-style vocabulary (rule strings like `required|string|max:255`, `role:admin`, `policy: true`, and queue/mail/notification blocks), while each backend implements its supported behavior behind the scenes. See Section 1G for the distinction between fixture parity and general feature support.

  **Spring Boot fixture coverage is not the same as engine capability.** The original planned `:java` parity set focused on Tatemono that already had Laravel (`:php`), Express (`:ts`), and FastAPI (`:py`) variants. Shared DSL operations can still be implemented directly by the Spring engine outside that fixture set; for example, it now handles the upload endpoint types used by `upload-test`, even though that Tatemono has no `:java` body variant.

  ### Shared blocks vs variant blocks

  A backend block is **shared** or a **variant**.

  | Kind | Blocks | Rule |
  |------|--------|------|
  | **Shared** (pure config, read by every backend, no suffix) | `meta`, `database:<table>`, `api:<n>`, `routes`, `realtime:<id>`, `events:<id>`, and `notifications:<id>` / `mail:<id>` **with no body** | Write once. Never add a suffix. |
  | **Variant** (contain backend-specific code) | `endpoint`, `handler`, `policy`, `middleware`, `listener`, `jobs`, `console`, and `notifications` / `mail` **with a body** | One block per backend that should run the tatemono. |

  Express and FastAPI consume the shared backend blocks through their runtimes: `database`
  creates the isolated schema, `api` creates Laravel-shaped controllers and routes, `routes`
  creates custom routes, `realtime` maps to Pusher-protocol broadcasting, `events` maps to
  events and listeners, YAML-only `jobs` and `console` create queue/command definitions, and
  YAML-only `mail` / `notifications` create transport classes. Body-bearing blocks use `:php` for Laravel, `:ts` for Express, `:py` for FastAPI, `:java`
  for Spring Boot, `:cs` for ASP.NET Core, `:go` for Go, and `:rs` for Rust where that feature is implemented; the shared YAML header is not discarded
  when the body differs.

  For `jobs` and `console` the YAML header (`queue`, `tries`, `timeout`, `signature`, `description`, `schedule`) is repeated in each variant; only the body differs. A `jobs` / `console` block with **no body** (YAML only) is shared and generates a stub on every backend.

  ### Suffix syntax

  The variant token sits **between the marker and the name**, and the closing tag repeats it:

  ```
  /* @arkzen:middleware:ts:requireJson
  */
  if (!request.isJson()) {
    return response.json({ message: 'Content-Type: application/json is required.' }, 415)
  }
  return next()
  /* @arkzen:middleware:ts:requireJson:end */

  /* @arkzen:middleware:php:requireJson
  */
  return $next($request);
  /* @arkzen:middleware:php:requireJson:end */
  ```

  Tokens: `php` (laravel, laravel-inertia) · `ts` (express) · `py` (fastapi) · `java` (spring-boot) · `cs` (aspnet) · `go` (go) · `rs` (rust). Tag *shape* (A/B/C/D, Section 3D) does not change with the suffix: `endpoint` / `handler` / `policy` / `middleware` / `listener` stay Shape D; `jobs` / `console` / `notifications` / `mail` stay Shape B.

  ```tsx
  /* @arkzen:endpoint:py:stats
  */
  total = await Ticket.count()
  return response.json({'total': total})
  /* @arkzen:endpoint:py:stats:end */
  ```

  Per-backend forms of every block: Sections 8 to 18 show `:php` and `:ts` (this section shows `:py`); Section 1F shows `:java`, `:cs`, `:go` and `:rs`, including one endpoint written in all seven variants. Section 1G says which backends actually execute a body.

  ### How the active backend picks a block

  For each (marker, name):

  1. A block with the **active variant suffix** wins.
  2. Else an **unsuffixed block with a code body** is read as `:php` (compatibility fallback for tatemonos not converted yet; usable only when the active variant is `php`).
  3. Else an **unsuffixed YAML-only block** is shared and usable everywhere.
  4. Else there is **no usable block**: that block is not emitted and the validator reports the tatemono as **inactive on this backend**, e.g. a missing `:py` variant while FastAPI is active. Add the active backend's variant or switch backend.

  Consequences for generating tatemonos:

  - Switching backend does not edit any file. It only changes which variants are read.
  - A tatemono may carry variants for one backend, a few, or all. There is no list of enabled backends to maintain.
  - **Keep code bodies to the minimum.** Prefer shared constructs (custom `routes`, YAML-only `mail` / `notifications`, standard CRUD endpoints, `policy: true` with simple rules) so fewer variants are needed. Every body you write must be written once per backend you want to support.
  - **`:php` is Laravel's form of every code block** (it is what used to be the plain, unsuffixed block). Always write the suffix. An unsuffixed code body is only a compatibility fallback that the engine still reads as `:php` for tatemonos that have not been converted yet.

  Authentication follows the same DSL split: Laravel uses Sanctum session/token middleware,
  while Express and FastAPI use Sanctum-shaped token tables and `auth:sanctum` middleware.
  Backend-specific implementations must preserve the shared request/response behavior.

  ### `:py` bodies (FastAPI)

  Python bodies are async function bodies generated into the FastAPI backend. They can use
  `request`, `response`, generated models, and public helpers imported by `pluff.runtime`.
  Await database/model operations, for example `await Ticket.where('status', 'open').get()`.
  `request.validate({...})` returns validated values and preserves Laravel's 422 error shape.
  Custom endpoint bodies may import standard-library modules as needed. See
  `tatemonos/fastapi-test/core.tsx` for working examples; `tatemonos/ollama-studio/core.tsx`
  shows a Python-only OpenAI-compatible API endpoint.

  FastAPI implements the DSL surface used by Pluff's Laravel builders, including isolated
  SQLite/PostgreSQL schemas, CRUD/auth/policies, queues and schedules, mail/notifications,
  Pusher-protocol realtime, and multipart upload endpoints. Its validation runtime supports
  common Laravel-style rule strings; verify any specific rule in the Python runtime before
  depending on it. Files are exposed through `request.files('field')` as a list of file
  metadata dictionaries (`originalname`, `mimetype`, `size`, `buffer`) and stored with
  `Storage.put(directory, file)`.

  ### `:ts` bodies (Express)

  Bodies are async function bodies. Names in scope: `request`, `response`, every generated model of the tatemono (plus `User` when `auth: true`), `Hash`, `DB`, `abort(status, message)`, `dispatch`, `event`, `broadcast`, `Mail`, `notify`, `Storage`, `Log`, `Command`, `Job`.

  | Block | Signature / what the body is | Notes |
  |-------|-------------------------------|-------|
  | `endpoint:ts:name` | `(request, response)`; return a response | `return response.json({ ... }, status?)` |
  | `handler:ts:name` | `(request, response, ...params)` | route params as `request.route('name')` **or** the `params` array |
  | `middleware:ts:name` | `(request, response, next)` | must `return next()` or return a response |
  | `policy:ts:update` / `policy:ts:delete` | `(user, <model>)` where `<model>` is the lower-camel model name (`ticket`); return boolean | requires `policy: true`; default is owner-or-admin |
  | `listener:ts:Name` | `handle(event)`; payload in `event.data` | no body → generated log stub into `event_log` |
  | `jobs:ts:name` | body of `handle()`; payload in `this.data` | the whole `async handle()` method is also accepted |
  | `console:ts:name` | body of `handle()`; `this.info(...)`; `return Command.SUCCESS` | `signature` + quoted cron `schedule`; the whole method is also accepted |
  | `notifications:ts:name` | body of `toMail(notifiable)`, returns `new MailMessage()...` | only if you need custom mail content; otherwise YAML-only (shared) |

  Model API is Eloquent-like: `Model.create({...})`, `Model.where('col', val)`, `.orWhere`, `.get()`, `.first()`, `.firstOrFail()`, `.findOrFail(id)`, `.count()`, `.paginate(perPage, page)`, `.update({...})`, `.delete()`, `.withTrashed()`, instance `.save()` / `.fill()` / `.delete()`. Request API: `request.input(key, default)`, `request.route(name)`, `request.user()`, `request.isJson()`, `request.bearerToken()`, `await request.validate({ field: 'required|string' })`. Validation errors use Laravel's 422 response shape. Parity is required for validation rules used by Pluff's Laravel builders and DSL; Laravel-only rules outside that surface are not implied.

  Differences from PHP to remember: no `$` prefix, `await` on every DB call, `request.route('name')` is allowed (PHP handlers must use `$params[n]`), and `return response.json(...)` replaces `response()->json(...)`.

  Express mail HTML supports escaped `{{ $value }}` and raw `{!! $value !!}` interpolation, Blade comments, `@if` / `@elseif` / `@else`, and `@foreach` over arrays or objects. Conditions support basic literals, property paths, boolean operators, and comparisons. This is a deliberately bounded subset: it does not execute PHP or support arbitrary Blade directives, components, layouts, or view helpers. Unsupported template behavior must be implemented in a `:ts` mail body or kept Laravel-only.

  ### Express compatibility notes

  - Upload endpoint types (`upload`, `upload_index`, `upload_destroy`, `upload_url`, `fileUrl`) use Multer and the Express storage runtime.
  - `resource` uses a Laravel-shaped JSON projection; `factory` provides `make`, `create`, `createMany`, `count`, and `state`.
  - `command_run`, `job_dispatch`, and `event_fire` use generated command/job/event registries and name matching; custom `:ts` endpoint bodies remain the most explicit option.
  - Realtime uses the Pusher protocol for WebSockets. Generated `/sse` routes are true streaming Server-Sent Events with keep-alive heartbeats; `/sse-poll` remains available for polling clients.
  - Realtime channel authorization reads declared private/presence channel patterns and supports `authenticated` (default), `owner`, and `admin`; `owner` compares the user's ID with a `{placeholder}` in the channel name. Public channels do not use the auth endpoint. Notification `channel_type` supports private, public, and presence broadcast destinations.
  - Express validation includes common Laravel-style rules, including conditional required/accepted/prohibited rules, `distinct`, IPv4/IPv6, string prefixes/suffixes, and decimal precision. Unsupported Laravel rules are not silently equivalent; confirm the runtime implementation before relying on one.
  - `export.js` selects the active backend: Express exports use the Express backend and npm; Laravel/Inertia exports use their Laravel backend and Composer.
  - Express needs `tsx` and the native `better-sqlite3` binding. `start.js` stops with an install hint if either is missing (a likely trouble spot on Termux/ARM64).

  ### FastAPI compatibility notes

  - Select `fastapi` with `node mizumi.js backend fastapi`, then install Python dependencies with `node setup.js --backend fastapi`.
  - `start.js` runs Uvicorn and the Python queue/scheduler worker from `engine/backend/fastapi/.venv`. Realtime WebSockets run inside the FastAPI service; there is no separate Reverb process.
  - FastAPI supports the shared Laravel-style authentication, CRUD, middleware, policies, jobs, schedules, mail, notifications, realtime, and upload builders. Notification inbox routes use the native notification table; declared private/presence channel rules are checked before signing.
  - FastAPI notification `MailMessage` supports `greeting()`, ordered `line()` / `action()` content, and `salutation()`. Python broadcast bodies can exclude the caller with `broadcast_to(channel, event, data, except_socket_id=request.header('X-Socket-ID'))`, matching Laravel's `toOthers()` behavior.
  - FastAPI-ready Tatemono examples with `:py` bodies: `body-endpoint-handler`, `body-mail-notification`, `crud-test`, `dtr-geofencing`, `events-test`, `fastapi-test`, `inventory-management`, `jo-payroll`, `job-test`, `kotoba`, `mail-test`, `middleware-test`, `notification-test`, `ollama-studio` (AI Studio), `queue-flow`, `roles-test`, and `scheduler-test`.
  - Tatemonos with no code bodies, such as `broadcast-test`, carry no variants and are active on every backend. A Tatemono that has bodies only for other variants is inactive on FastAPI; the validator names the missing `:py` block.
  - AI Studio (`tatemonos/ollama-studio/core.tsx`) defaults to Gemini's OpenAI-compatible endpoint (`https://generativelanguage.googleapis.com/v1beta/openai/`) and `gemini-3.6-flash`. Set `PLUFF_AI_API_KEY` to a Gemini API key from Google AI Studio in `engine/backend/fastapi/.env`; do not reuse an OpenAI key or put any key in Tatemono/browser code. Free-tier eligibility and rate limits depend on Google's current account, region, and model limits; HTTP 429 means a quota or rate limit has been reached. Prompts are sent to the configured provider. The endpoint accepts requests only from the local machine; add authentication and rate limiting before exposing it publicly.
  - Exported FastAPI backends create a local `.venv` and install `requirements.txt`. PostgreSQL settings are copied from the configured engine environment; SQLite remains the default.

  * * *

  ## SECTION 1F - BACKEND BODY REFERENCE (:java :cs :go :rs)

  Sections 8 to 18 show `:php` and `:ts` (Section 1E shows `:py`). This section gives the conventions for the other four variants. Block shapes (Section 3D), YAML headers, closing tags (`:<variant>:<name>:end`) and variant selection (Section 1E) are identical on every backend; only the language of the body and the names in scope change. A body is the inside of a generated method, never a whole class. Never mix languages inside one block, and never use another variant's helper names.

  ### One endpoint in all seven variants

  The api block and the endpoint name are shared. Only the body is written once per backend.

  ```
  /* @arkzen:endpoint:php:ping
  */
  return response()->json(['message' => 'hello']);
  /* @arkzen:endpoint:php:ping:end */

  /* @arkzen:endpoint:ts:ping
  */
  return response.json({ message: 'hello' })
  /* @arkzen:endpoint:ts:ping:end */

  /* @arkzen:endpoint:py:ping
  */
  return response.json({'message': 'hello'})
  /* @arkzen:endpoint:py:ping:end */

  /* @arkzen:endpoint:java:ping
  */
  return response.json(mapOf("message", "hello"));
  /* @arkzen:endpoint:java:ping:end */

  /* @arkzen:endpoint:cs:ping
  */
  return Results.Json(new { message = "hello" });
  /* @arkzen:endpoint:cs:ping:end */

  /* @arkzen:endpoint:go:ping
  */
  return response.JSON(200, map[string]any{"message": "hello"})
  /* @arkzen:endpoint:go:ping:end */

  /* @arkzen:endpoint:rs:ping
  */
  response.json(StatusCode::OK, json!({ "message": "hello" }))
  /* @arkzen:endpoint:rs:ping:end */
  ```

  ### :java bodies (Spring Boot)

  Bodies are compiled into a generated method that may `throws Exception`, with `--release 17`, so avoid Java 19+ APIs (for example virtual-thread executors). Implicit imports: `dev.pluff.runtime.*`, `static dev.pluff.runtime.Support.*` (so `mapOf(...)` and `sqlNow()` work bare), `java.util.*`, `java.math.*`, and the tatemono's generated models. End every body that returns a value with `return`.

  | Block | Names in scope | Returns |
  |---|---|---|
  | `endpoint`, `handler` | `Request request`, `Response response`; handlers also get `List<Object> params` | `Object` |
  | `middleware` | `request`, `response`, `Next next` (call `return next.run();`) | `Object` |
  | `policy` | `Model user`, `Model item` (item may be null) | `boolean` |
  | `jobs` | `this.data` (`Map<String,Object>`) | nothing |
  | `listener` | `Event event` (`event.data` is a `Map<String,Object>`) | nothing |
  | `console` | `this.info(String)` | `Command.SUCCESS` or `Command.FAILURE` |
  | `notifications` | `Model user` | `MailMessage` (`new MailMessage().subject(...).line(...)`) |

  Helpers: `Request` has `all()`, `input(k)`, `input(k, default)`, `validate(Map rules)` (Laravel rule strings, Laravel 422 shape), `user()`, `authUser()`, `route(name)`, `isJson()`, `ip()`. `Response` has `json(body)` and `json(body, status)`. Generated models have static `query()`, `count()`, `all()`, `find(id)`, `findOrFail(id)`, `create(Map)`; instances and the query builder follow the Eloquent-like `Model` and `QueryBuilder`. `mapOf(k, v, ...)` is insertion-ordered and allows null values (`Map.of` does not). `DB.transaction(() -> ...)` runs one transaction per tatemono database and rolls back on exception. `Json.stringify(map)` serializes a payload. Decimal columns come back as strings, so read them with `new BigDecimal(model.str("col"))`.

  ```
  /* @arkzen:policy:java:update
  */
  return item == null || !"archived".equals(item.str("status"));
  /* @arkzen:policy:java:update:end */

  /* @arkzen:listener:java:LogTicket
  */
  EventLog.create(mapOf("event_name", "ticket-created", "payload", Json.stringify(event.data)));
  /* @arkzen:listener:java:LogTicket:end */
  ```

  Jobs, events and the scheduler run in memory: queued work is not durable across restarts, and scheduled commands use an in-process minute-resolution cron. Reference tatemonos: `spring-test`, `spring-ledger`, `queue-flow`, `crud-test`.

  ### :cs bodies (ASP.NET Core)

  Bodies are C# script snippets compiled with Roslyn the first time they are invoked. A compile or runtime error returns HTTP 500 with a server-side diagnostic, so a bad body shows up at the first call, not at build time. Names in scope for `endpoint`, `handler`, and `middleware` scripts: `Context` (the `HttpContext`), `Body` (the JSON request body as a `JsonNode`), `Database`, `RouteValues`, and `user` when the request is authenticated.

  - Return an ASP.NET `IResult` (`Results.Json(obj, statusCode: 422)`). A non-null plain value is serialized as JSON.
  - `middleware` bodies return an `IResult` to stop the request; `return null;` (or returning nothing) continues to the route. There is no `next` delegate.
  - `policy` bodies see `user` and `item` as JSON objects and return `bool`, for example `return item?["status"]?.ToString() != "archived";`. Without a snippet the engine uses owner-column (`user_id`, `owner_id`, `created_by`, `author_id`) or admin-role checks.
  - Raw SQL goes through `ScriptDatabase.QueryAsync`, `ScalarAsync` and `ExecuteAsync` (parameterized ADO.NET, optional `DbTransaction`). Pass parameters as a `Dictionary<string, object?>` keyed `"@name"`. Use the prefixed table name (Section 1G).
  - `TatemonoValidator.ValidateAsync(Body, rules, Database, slug, table, null, Context.RequestAborted)` validates with Laravel rule strings; return the 422 body yourself: `{ message = "The given data was invalid.", errors = ... }`.
  - `jobs`, `console` and `listener` bodies are statements that use the same names (`Database`, `ScriptDatabase`).
  - `notifications` bodies return a `Dictionary<string, object?>` with `["subject"]` and `["lines"]` (a string array).

  ```
  /* @arkzen:middleware:cs:requireJson
  */
  if (!Context.Request.HasJsonContentType())
      return Results.Json(new { message = "Content-Type: application/json is required." }, statusCode: 415);
  return null;
  /* @arkzen:middleware:cs:requireJson:end */
  ```

  Jobs and events run through an in-process queue with retries and timeouts (not durable, queues not isolated). Console bodies can be run manually; cron scheduling is not implemented. Reference tatemonos: `aspnet-test`, `aspnet-ledger`, `crud-test`, `queue-flow`.

  ### :go bodies (Go, Chi)

  The Go backend reads and builds the same Tatemono DSL and supports the shipped Tatemono suite. Backend parity is about the behavior a Tatemono exposes, not whether each engine implements it with the same mechanism. Go generates and type-checks model/module scaffolding and route registrations. General custom endpoint and route-handler bodies can be interpreted at runtime; built-in capability endpoints and named Tatemono workflows can instead be implemented by Go engine logic. Middleware and policies have supported engine-defined behavior, while jobs, listeners and console scheduling use the Go engine's queue/event/scheduler support. These implementation differences do not by themselves mean a tested Tatemono behaves differently; they do mean arbitrary body code is not available for every block kind.

  For interpreted endpoint and route-handler bodies, use the runtime helpers available to the fixtures: `request` (`Input(k)`, `InputOr(k, default)`, `String`, `Int`, `IntOr`, `Float`, `Bool`, `NullableInt`, `QueryInt`, `Only`, `JSON()`, `Route(name)`, `User()`), `response.JSON(status, value)` and `response.Error(status, message)`, `ctx`, generated models with typed fields (`Ticket.Create(ctx, map[string]any{...})`, `Queue.FindOrFail(ctx, id)`, `Ticket.Query().Where(...).Count(ctx)`, `queue.Prefix`), and `database.Insert(table, map)` / `database.Query(...)`. Return a response value from each interpreted handler.

  Reference tatemonos: `go-backend-test`, `go-concurrency-lab`, `body-endpoint-handler`, `queue-flow`.

  ### :rs bodies (Rust, Axum)

  Endpoint and handler bodies are base64-decoded from the build payload into `storage/arkzen-modules/generated/<n>.rs` and compiled. Run the backend through `node start.js`: it debounces compilation until module builds settle, then restarts once to load the handlers. A compiler error is logged and the running process stays up.

  Names in scope for `endpoint` and `handler` bodies: `request` (`json_object()?` returns a `Map<String, Value>`, `body()`, `path()`, `query()`, `user()` as an `Option` when the tatemono uses auth), `database`, `response`. Available imports: `serde_json::{json, Map, Value}` and `StatusCode`.

  - `database.query(sql)`, `database.query_params(sql, Vec<Value>)`, `database.query_column(sql)`, `database.query_column_params(...)`, `database.execute(sql, params)`, `database.query_row(sql)` (returns a tuple of three `i64`), and `database.insert(table, json!({...}))`. All return `Result`, so use `?`.
  - `response.json(StatusCode::OK, json!({...}))` builds the response; `response.validation_error(message)` builds a 422 whose `errors` is an array of messages, not Laravel's keyed object. `utc_now_rfc3339()` gives a timestamp. `ValidationError::required(field)` builds a missing-field error.
  - A body ends with its response as a tail expression (no `return`, no trailing semicolon), or uses `?` for early exits.

  ```
  /* @arkzen:endpoint:rs:stats
  */
  let (total, passed, failed) = database.query_row(
      "SELECT COUNT(*), SUM(CASE WHEN ok THEN 1 ELSE 0 END), SUM(CASE WHEN NOT ok THEN 1 ELSE 0 END) FROM probe_results",
  )?;
  response.json(StatusCode::OK, json!({ "total": total, "passed": passed, "failed": failed }))
  /* @arkzen:endpoint:rs:stats:end */
  ```

  Rust compiles `endpoint:rs` and `handler:rs` source bodies into generated module code; declared `listener:rs` bodies are also generated and run when their event is fired. `module:rs` source is compiled alongside those bodies. This does not mean every body-bearing DSL block executes arbitrary Rust: middleware snippets and policy snippets are not implemented as general Rust bodies, jobs and console behavior have named engine support rather than arbitrary `jobs:rs` / `console:rs` execution, and cron-based console scheduling is unavailable. The engine's supported middleware and named workflows can still provide the behavior used by tested Tatemono fixtures.

  **The Rust-only module block.** A tatemono may carry at most one `@arkzen:module:rs` block (Shape D: `*/` alone on the next line, closed by `/* @arkzen:module:rs:end */`). Its Rust source is compiled into the tatemono's module next to the endpoint and handler bodies, for shared helper functions or tests. A second block, or a missing end marker, stops the build with an error. It is read only when the active backend is `rust`.

  ```
  /* @arkzen:module:rs
  */
  fn clamp_position(value: i64) -> i64 { value.max(1) }
  /* @arkzen:module:rs:end */
  ```

  Reference tatemonos: `rust-backend-test`, `body-endpoint-handler`, `queue-flow` (has a module block), `kotoba`.

  ### Mail template placeholders per backend

  `mail` blocks with a body are variants, and each backend renders its own placeholder syntax. YAML-only mail blocks avoid the difference entirely.

  | Variant | Placeholder for the `username` field |
  |---|---|
  | `:php` | `{{ $username }}` (Blade) |
  | `:ts`, `:py` | `{{ $username }}`, `{{ username }}`, and raw `{!! username !!}` |
  | `:java` | `{{ username }}`, `{{ $username }}` (escaped), and raw `{!! username !!}` |
  | `:cs` | `{{ $username }}` |
  | `:go` | `{{ index . "username" }}` (Go `html/template` syntax) |
  | `:rs` | `{{ $username }}` (HTML-escaped) |

  * * *

  ## SECTION 1G - EXECUTION MODEL, CAPABILITY MATRIX & TARGETING RULES

  ### How backends implement body-bearing blocks

  | Backend | Variant | What happens to a custom body |
  |---|---|---|
  | `laravel`, `laravel-inertia` | `:php` | Generated into PHP classes and run. |
  | `express` | `:ts` | Bundled with esbuild and hot-swapped. Syntax errors fail the build. |
  | `fastapi` | `:py` | Generated into the Python backend and run. |
  | `spring-boot` | `:java` | Compiled to Java by the engine and hot-loaded. Runs every body kind (endpoint, handler, middleware, policy, jobs, listener, console, notifications). |
  | `aspnet` | `:cs` | Roslyn script, compiled on first call. Errors become HTTP 500. |
  | `go` | `:go` | General endpoint and custom-route handler bodies are interpreted; built-in operations and named workflows can use engine implementations. Middleware, policies, jobs, listeners and console behavior follow the Go engine's supported feature implementations, not arbitrary source execution for every block. |
  | `rust` | `:rs` | Endpoint and custom-route handler bodies are compiled from the Tatemono into generated Rust; declared listener bodies and `module:rs` are also compiled. Middleware, policies, jobs and console use limited engine support rather than arbitrary Rust bodies. |

  ### Capability matrix

  This matrix describes the runtime mechanisms and generality of support, not whether a shipped Tatemono fixture passes. Behavioral parity means the Tatemono has the same expected behavior; engines may implement it with generated code, interpretation, built-ins or named workflows. The maintainer reports that all shipped Tatemono fixtures have been run on Go and Rust with the same behavior as the other backends. That test coverage does not guarantee arbitrary, untested combinations of DSL features. For a specific feature, check `engine/backend/<name>/README.md`; "named" means engine support for declared workflows, not general execution of arbitrary source bodies.

  | Feature | laravel | express | fastapi | spring-boot | aspnet | go | rust |
  |---|---|---|---|---|---|---|---|
  | Endpoint / custom-route bodies | generated | bundled | generated | compiled | interpreted | interpreted, with built-in operation overrides | generated and compiled |
  | Listener bodies | generated | bundled | generated | compiled | interpreted | supported event operations; arbitrary source is not evaluated | generated and compiled |
  | Middleware / policy bodies | yes | yes | yes | yes | yes | supported middleware and restricted policy expressions | no general body execution; limited engine support |
  | SQLite and PostgreSQL | yes | yes | yes | yes (PostgreSQL untested) | yes | yes | yes |
  | Token auth (`auth: true`) | yes | yes | yes | yes | yes | yes | yes |
  | `roles-test` role workflows | yes | yes | yes | yes | yes | yes (engine-supported workflow) | yes (engine-supported workflow) |
  | Generic `role:` middleware | yes | yes | yes | yes | yes | no (role behavior is not generic middleware) | no (role behavior is not generic middleware) |
  | Jobs and queue | worker | worker | worker | in memory, not durable | in process, not durable | database queue and supported job operations | named in-process emulation; no general job-body execution |
  | Cron scheduler | yes | yes (`npm run queue`) | yes | in process, per minute | not implemented | supported console schedules, per minute | not implemented |
  | Realtime | Reverb | Pusher protocol | Pusher protocol | Pusher compatible | Pusher compatible hub | Pusher protocol | Pusher protocol |
  | Uploads | yes | yes (Multer) | yes (multipart) | yes (multipart) | yes (multipart) | yes (multipart) | yes (multipart) |
  | Mail | yes | yes | yes | yes (log or SMTP) | yes (log or SMTP) | yes (log or SMTP) | yes (log or SMTP) |
  | Notifications | database, mail, broadcast; notification-test inbox | database, mail, broadcast; notification-test inbox | database, mail, broadcast; notification-test inbox | database, mail, broadcast; notification-test inbox | database, mail, broadcast; notification-test inbox | named notification-test workflow (database/mail/broadcast + inbox); body-mail-notification is email-only | named notification-test workflow (database/mail/broadcast + inbox) |

  Mail uses the `log` mailer by default on every non-Laravel backend; set `MAIL_MAILER=smtp` with the `MAIL_*` variables to deliver. Go and Rust realtime listens on `REVERB_PORT` (default 8080).

  Notification delivery supports the database, mail, and broadcast channels shown above; "all channels" would overstate the engine's built-in support. Inbox operations are provided by the notification-test workflow/API, not automatically added to every Tatemono. Go and Rust implement that fixture as named engine workflows rather than general notification-body execution; Go's separate `body-mail-notification` workflow sends email only.

  All seven backends implement the shared `upload`, `upload_index`, `upload_destroy`, and `upload_url` endpoint types. Physical storage roots are backend-specific and are not portable between engines. Use `upload_url` for downloads and the returned image URL, when present, for previews.

  ### Table names in raw SQL

  Physical table naming depends on the backend. Go and Rust isolate each tatemono in its own database and use the declared table name directly; their helpers and fixtures therefore use bare names such as `probe_results`. Other engines may prefix physical table names; for example, `:cs` raw SQL uses `body_endpoint_handler_probe_results`. Generated models often hide this difference. The migration builder uses the `foreign:` value literally as the target table name, so set it to the physical name required by the active backend. Do not assume one table prefix applies to every backend.

  ### What to generate

  1. Find the active backend first (`node mizumi.js stack`, or `activeBackend` in `arkzen.json`), or ask. Write code bodies for that backend's variant.
  2. If the backend is unknown, write only shared constructs: standard CRUD `api` blocks, `auth: true`, `policy: true` with default rules, `routes` without bodies, YAML-only `mail`, `notifications`, `jobs` and `console`. That tatemono is active on all seven backends. Add variants only for backends the person names.
  3. Every body you write is written once per backend you target. Keep bodies minimal, and prefer a shared construct to a body.
  4. When converting an existing tatemono to another backend, copy its shared blocks unchanged and translate only the body blocks. Do not change the `api`, `routes`, `database` or `realtime` blocks to suit one backend.
  5. A tatemono with no usable variant for the active backend is inactive on it. Report that, name the missing `:<variant>` block, and add it or switch backend instead of editing shared blocks.

  * * *

  ## SECTION 2 — STYLING POLICY

  **Web:** Tailwind is the default. Inline styles are equally valid for dynamic values, glassmorphism, gradients, `backdrop-filter`, shadows, animation values. Mix freely; never use both for the same property.

  **Expo / bare RN:** NativeWind `className` utilities on React Native components; `StyleSheet.create()` or inline style objects for dynamic styles; named `@arkzen:native:style` blocks for shared StyleSheets.

  **Lynx:** self-contained Lynx styling (see Section 24).

  **Icons:** web → `lucide-react` first (import only in the FIRST `web:components` block, or in the layout block itself; `size` prop), Hero Icons only if Lucide lacks it. Native → Expo Vector Icons or inline SVG. Never import unused icons.

  * * *

  ## SECTION 2C — DESIGN AESTHETIC & FALLBACK (defaults, always overrideable)

  Default to Awwwards-quality design. Pick in order of best fit:

  1. **Minimalism** (default) — whitespace, typography-focused, neutral palette, high contrast
  2. **Glassmorphism** — `rgba` + `backdrop-filter: blur`
  3. **Skeuomorphism** — textured, realistic depth (finance, familiar UI)
  4. **Claymorphism** — soft, rounded, 3D-plastic (friendly/creative)
  5. **Neo-Brutalism** — thick borders, bold, geometric
  6. **Liquid Glass** — flowing shapes, soft gradients, smooth motion (premium)

  Accessibility (contrast, readability) always wins.

  **Transitions:** page fade+slide (`opacity .3s`, `transform .4s`); modal/overlay .25–.35s; buttons .15–.2s; list items staggered (`index * 50ms`). Keep under 500ms; respect `prefers-reduced-motion`.

  **UX patterns:** skeleton screens for API >300ms (match final layout); optimistic UI (update first, revert on error); optimistic pre-loading (fail silently, no spinners); progress illusion (0→30 fast, 30→90 moderate, 90→99 slow crawl); GSAP ScrollTrigger for scroll effects; Framer Motion for hover/entrance.

  **Buttons:** Primary + Ghost pairing. NEVER two primary buttons in one section.

  **Hierarchy:** L1 page title/CTA 32–48px/700–900 · L2 section header 20–28px/600–700 · L3 body/labels 16px/400–500 · L4 helper 12–14px/400 muted. WCAG: body 4.5:1, helper 3:1. Never below 14px mobile / 16px desktop body.

  **Spacing:** 8px grid — 4 / 8 / 16 / 24 / 32 / 48. Padding min 12px vertical, 16px horizontal. Match spacing between similar elements.

  * * *

  ## SECTION 3 — TATEMONO FILE RULES

  ```
  1. One .tsx file per tatemono, at tatemonos/<name>/core.tsx  (<name> = meta.name; core.tsx is always accepted)
  2. TypeScript throughout (the file is DSL source — the engine slices blocks out of it)
  3. Web imports are resolved by the active web generator. For Next.js, imports in web page blocks are collected and moved to the generated module; prefer shared imports in web:components / web:layout blocks.
  4. Expo / bare-RN target-specific imports use @arkzen:import:expo / :rn pairs inside native blocks. The parser selects the matching pair for the active native stack.
  5. Lynx uses separate :lynx blocks. Imports may be declared in a Lynx page or component; the Lynx generator also adds imports for referenced shared components.
  6. Source-block import placement and generated-file imports are not the same: generators may collect, strip, or inject imports while producing platform files. Use the block-specific guidance below.
  7. Web, Expo/RN and Lynx sections can all coexist in one core.tsx (a "dual/triple" tatemono)
  8. A web/app Tatemono needs at least ONE page: web page, native page, or Lynx page. Godot and Unity game Tatemono use their own project blocks and separate `godot` or `unity` export targets.
  9. Tatemono asset files go in tatemonos/<name>/assets/ (auto-copied to public)
  ```

  ### SECTION ORDER

  Order is mostly free; the engine finds blocks by tag. In the list below `:php` stands for the backend variant token: every body-bearing block takes `:php`, `:ts`, `:py`, `:java`, `:cs`, `:go` or `:rs` (Section 1E). `@arkzen:module:rs` is the only Rust-only block (Section 1F). Recommended order:

  ```
  @arkzen:meta                         (once, always first)
  @arkzen:meta:web                     (optional, once)
  @arkzen:meta:native                  (optional, once)
  @arkzen:web:config                   (optional, once)
  @arkzen:native:config                (optional, once)
  @arkzen:database[:identifier]        (REPEAT)
  @arkzen:api[:identifier]             (REPEAT)
  @arkzen:routes                       (optional, REPEAT)
  @arkzen:endpoint:php:name            (REPEAT)   ← Laravel body for an @arkzen:api method   (+ :ts:name for Express)
  @arkzen:handler:php:name             (REPEAT)   ← Laravel body for an @arkzen:routes entry (+ :ts:name for Express)
  @arkzen:policy:php:method             (optional) ← needs api policy: true               (+ :ts:method)
  @arkzen:middleware:php:name            (optional, REPEAT)                                  (+ :ts:name)
  @arkzen:realtime:identifier          (optional, REPEAT)
  @arkzen:events:identifier            (optional, REPEAT)
  @arkzen:listener:php:Name              (optional, REPEAT)                                  (+ :ts:Name)
  @arkzen:jobs[:php|:ts]:identifier      (optional, REPEAT)   ← suffix only when it has a body
  @arkzen:notifications[:php|:ts]:identifier (optional, REPEAT) ← suffix only when it has a body
  @arkzen:mail[:php|:ts]:identifier      (optional, REPEAT)   ← suffix only when it has a body
  @arkzen:console[:php|:ts]:identifier   (optional, REPEAT)   ← suffix only when it has a body
  --- web ---
  @arkzen:web:layout:name              (optional, REPEAT)
  @arkzen:web:style / :style:Name      (before OR after components)
  @arkzen:web:components:identifier    (REPEAT)
  @arkzen:web:page:name                (REPEAT)
  @arkzen:web:error:404 / :500         (optional)
  @arkzen:web:animation                (optional, once; before OR after pages)
  @arkzen:web:script / :script:name    (optional)
  --- native (Expo + bare RN) ---
  @arkzen:native:style (global) / :style:name
  @arkzen:native:layout:name
  @arkzen:native:components:name
  @arkzen:native:page:name
  @arkzen:native:error:404 / :500
  @arkzen:native:animation:expo | :rn
  @arkzen:native:script:expo | :rn  [:name]
  --- native (Lynx) ---
  @arkzen:native:components:lynx:name / layout:lynx:name / page:lynx:name
  @arkzen:native:style:lynx / :style:lynx:name
  @arkzen:native:error:404:lynx / :500:lynx
  @arkzen:native:animation:lynx
  @arkzen:native:script:lynx [:name]
  --- Godot 4 game (separate export target; not a web/native stack) ---
  @arkzen:godot:project             (once)
  @arkzen:godot:input               (optional, once)
  @arkzen:godot:assets              (optional, once)
  @arkzen:godot:scene:<name>        (REPEAT; one scene path per block)
  @arkzen:godot:behavior:player     (required for the generated character controller)
  @arkzen:godot:behavior:camera     (required for the generated follow camera)
  @arkzen:godot:export              (required; declares Godot export presets)
  --- Unity game (separate export target; not a web/native stack) ---
  @arkzen:unity:project             (once)
  @arkzen:unity:game                (dino_runner settings for the runner template)
  @arkzen:unity:visuals             (optional runner-template visual settings)
  @arkzen:unity:controls            (optional runner-template controls)
  @arkzen:unity:scene:<name>        (scene mode; one or more Unity-native scene graphs)
  @arkzen:unity:environment         (optional scene lighting/fog settings)
  @arkzen:unity:assets              (optional declared resources for scene mode; required for runner art)
  @arkzen:unity:export              (optional scene-mode build targets)
  ```

  * * *

  ## ⚠️ SECTION 3D — DSL TAG FORMAT RULES (CRITICAL)

  The engine checks DSL tag formatting before parsing, but the tag validator enforces only a subset of the parser's format requirements. A reported tag error stops parsing with an "ARKZEN DSL ERROR"; a successful validation is not proof that generated TypeScript compiles or that the app behaves correctly. Follow the block shapes below even where the validator does not currently catch a malformed tag.

  ### SHAPE A — YAML-only blocks: NO `*/` on the opening line, closed by a bare `*/` line. No `:end`.

  ```
  /* @arkzen:meta
  /* @arkzen:meta:web
  /* @arkzen:meta:native
  /* @arkzen:web:config
  /* @arkzen:native:config
  /* @arkzen:database[:identifier]
  /* @arkzen:api[:identifier]
  /* @arkzen:routes
  ```

  ```
  /* @arkzen:database:products
  table: products
  ...
  */
  ```

  ### SHAPE B — YAML-in-comment + body blocks: YAML inside the opening comment, `*/` closes it, code/body follows, then `:end */`.

  ```
  /* @arkzen:jobs:php:process-data
  queue: default
  tries: 3
  */
  public function handle(): void { ... }
  /* @arkzen:jobs:php:process-data:end */
  ```

  Used by: `jobs`, `console`, `notifications`, `mail`, `events`, `realtime`, and `web:layout` / `native:layout` when a `parent:` key is needed. **Always write `:end`** for these — bodies need it, and some tags are not enforced by the validator but are still required for bodies to be read.

  ### SHAPE C — Code blocks: MUST have `*/` on the SAME opening line, closed by `:end */`.

  ```
  /* @arkzen:web:components:shared */          /* @arkzen:web:components:shared:end */
  /* @arkzen:web:layout:app */                 /* @arkzen:web:layout:app:end */
  /* @arkzen:web:page:index */                 /* @arkzen:web:page:index:end */
  /* @arkzen:web:style */  /* @arkzen:web:style:Name */
  /* @arkzen:web:animation */   /* @arkzen:web:script */   /* @arkzen:web:script:name */
  /* @arkzen:web:error:404 */   /* @arkzen:web:error:500 */
  /* @arkzen:native:components:shared */   /* @arkzen:native:layout:app */
  /* @arkzen:native:page:index */          /* @arkzen:native:style */  /* @arkzen:native:style:name */
  /* @arkzen:native:error:404 */           /* @arkzen:native:error:500 */
  /* @arkzen:native:animation:expo | :rn | :lynx */
  /* @arkzen:native:script:expo | :rn | :lynx */   /* @arkzen:native:script:expo:name */
  /* @arkzen:native:components:lynx:shared */  /* @arkzen:native:layout:lynx:name */
  /* @arkzen:native:page:lynx:index */         /* @arkzen:native:style:lynx */
  /* @arkzen:native:error:404:lynx */          /* @arkzen:native:error:500:lynx */
  ```

  ### SHAPE D — Body-separator blocks: opening tag has NO `*/`; the **next line must be exactly `*/`**; then body; then `:end */`.

  ```
  /* @arkzen:endpoint:php:my_endpoint
  */
  $result = $code->here();
  return response()->json($result);
  /* @arkzen:endpoint:php:my_endpoint:end */
  ```

  Used by: `endpoint`, `handler`, `middleware`, `policy`, `listener`, and the Rust-only `module:rs` block. The current validator checks the next-line separator for the first four; the listener parser also expects this shape, but the tag validator does not currently check it.

  The tag validator's suffix handling is not complete for every platform-specific code tag (for example, `native:animation:expo`). Do not rely on the validator to detect every missing opener or separator.

  ### SHAPE E — Godot game blocks

  Godot blocks use a YAML body with a bare `*/` line and a matching `:end */`
  line. They are read by the separate Godot game generator; they are not web or
  native UI blocks and do not satisfy the standard web/native page requirement.

  ```tsx
  /* @arkzen:godot:project
  godot_version: "4.x"
  name: My Game
  main_scene: res://scenes/main.tscn
  renderer: gl_compatibility
  */
  /* @arkzen:godot:project:end */

  /* @arkzen:godot:scene:main
  path: res://scenes/main.tscn
  root:
    name: Main
    type: Node3D
  nodes: []
  */
  /* @arkzen:godot:scene:main:end */
  ```

  Supported blocks are `project`, `input`, `assets`, repeatable `scene:<name>`,
  `behavior:player`, `behavior:camera`, and `export`. Scene nodes and components
  are declarative; supported node, mesh, and collision-shape types are validated
  by the generator. Player and camera behavior blocks generate GDScript from
  their YAML settings; arbitrary GDScript bodies are not injected.

  Put source assets under `tatemonos/<name>/assets/` and reference them with
  relative paths such as `assets/tiles/grass.png`. Assets are required by default;
  set `optional: true` to permit a missing asset. Godot exports are isolated at
  `projects/godot/<name>/` and can be generated with
  `node mizumi.js export <name> godot`. This does not change active web/app/backend
  settings or run a frontend/backend builder. Godot itself and export templates
  must be installed separately to run or package the generated game.

  ### Inline declarations (no `:end`)

  ```
  /* @arkzen:web:page:layout:+auth */            ← layout line, immediately after a web page opener
  /* @arkzen:native:page:layout:app */           ← same for native pages
  /* @arkzen:native:page:lynx:layout:app */      ← same for Lynx pages
  ```

  ### Parsed markers that are not supported DSL

  `@arkzen:store:<name>` is detected by `hasSections()` and parsed into an internal `stores` field, but no builder consumes or emits it. It is not a usable store declaration; do not generate it. For web Zustand state, export the store from `@arkzen:web:components` (Section 3C). Native state belongs in native component code.

  ### Backend variant suffix (`:php` `:ts` `:py` `:java` `:cs` `:go` `:rs`)

  Backend code blocks accept a variant token between marker and name (`@arkzen:endpoint:ts:stats`). The opening tag, YAML placement and `*/` rules follow the block's normal shape; the closing tag repeats the suffix (`/* @arkzen:endpoint:ts:stats:end */`). Same-named blocks with different suffixes may coexist in one file. See Section 1E.

  ### Dual-target import pairs (Expo / bare RN) — see Section 23B

  ```
  /* @arkzen:import:expo */ ... /* @arkzen:import:expo:end */
  /* @arkzen:import:rn   */ ... /* @arkzen:import:rn:end   */
  ```

  * * *

  ## SECTION 3A — IMPORT PLACEMENT

  | Block                                        | Imports? |
  |----------------------------------------------|----------|
  | `web:components:*`                           | ✅ YES   |
  | `web:layout:*`                               | ✅ YES   |
  | `web:animation`                              | ✅ YES (gsap / framer only) |
  | `web:script`, `web:script:name`              | ✅ YES (any npm package) |
  | `web:page:*`                                 | ⚠️ Next.js collects page imports and forwards referenced imports from `web:components:*` |
  | `web:error:404`                              | ⚠️ Imports are normalized; React is injected by the generator |
  | `web:error:500`                              | ⚠️ Imports are normalized; generated boundary has `'use client'` |
  | `native:components:*` / `native:layout:*` / `native:error:*` (Expo/RN) | ✅ YES — use `@arkzen:import:expo/rn` pairs for target-specific imports |
  | `native:page:*` (Expo/RN)                    | ⚠️ Target import pairs are extracted by the parser; prefer shared imports in native components |
  | `native:animation:*`, `native:script:*`      | ✅ YES   |
  | `native:*:lynx:*` (Lynx blocks)              | ✅ YES — pages may import directly; referenced shared components are imported by the generator |
  | `endpoint`, `handler`, `middleware`, `policy`, `listener`, `jobs`, `console` | ❌ NO (bodies are written in the backend's own language) |

  These are source-authoring recommendations, not all parser restrictions. The Next.js generator normalizes imports found in web page and error blocks; referenced non-React imports from web component blocks may also be forwarded into generated pages. Across the current Next.js, React/Vite, TanStack Start, Astro, Inertia, Expo, and bare-RN generators, a simple standalone `export default ComponentName` line is stripped from page source; the generated page/screen gets its own framework-specific export or wrapper. Prefer omitting it, but if it appears, it is okay: the engine removes it. This only covers that simple standalone form, not arbitrary default-export expressions or other export forms.

  ## SECTION 3B — `'use client'` (WEB ONLY)

  - In `web:components`, `web:layout`, `web:error:500` blocks: writing it is supported; the generator emits client directives in the corresponding client files.
  - Prefer not to write it in `web:page`: the Next.js generator strips it and adds the directive to the generated page. It is not a way to make a page block server-rendered.
  - Never in `web:animation`, `web:error:404`
  - Never in any native or Lynx block

  ## SECTION 3C — ZUSTAND STORES

  Define stores directly inside `web:components` blocks. Always `export` them.

  ```ts
  export const useAppStore = create<AppState>((set) => ({
    items: [],
    setItems: (items) => set({ items }),
  }))
  ```

  ## ⚠️ SECTION 3E — NULL SAFETY

  ```ts
  // ✅ guard at component level
  if (!data || !data.items) return <Loader2 size={24} />
  // ✅ double optional chain for nested objects
  status?.queue?.name ?? 'Default'
  // ❌ crashes if queue is undefined
  status?.queue.name
  ```

  ## SECTION 3F — LOCALSTORAGE SAFETY

  Always `try/catch` around `JSON.parse`, validate required fields, and `removeItem` on bad data. Web only — never use localStorage in native/Lynx blocks.

  * * *

  ## SECTION 4 — AUTH

  ```
  /* @arkzen:meta
  name: my-app
  auth: true
  */
  ```

  - `auth: true` generates, per tatemono: an isolated `users` table, a token table, a user model, an auth controller with injected routes, and Sanctum tokens. Notification infrastructure is added only if the tatemono has `@arkzen:notifications` blocks.
  - `auth: false` — no auth; all pages public.
  - Page guards: `layout:+auth` (requires login) and `layout:+guest` (login/register pages). Plain `layout:auth` / `layout:guest` still work.
  - Seed users with `auth_seed` in `@arkzen:meta` (Section 5). Passwords are hashed; seeding is idempotent.
  - Roles: a `role` column on the users table (`admin`, `user`, ...). Role-gated routes use middleware `[auth, role:admin]` (the engine generates a scoped `CheckRole`).
  - Frontend: `useAuthStore` and `arkzenFetch` from `@/arkzen/core/stores/authStore`.

  * * *

  ## SECTION 5 — @arkzen:meta

  ```
  /* @arkzen:meta
  name: my-app                    # REQUIRED, slug (kebab-case); must match folder name
  version: 1.0.0                  # default 1.0.0
  description: Optional description
  auth: false                     # default false
  dependencies: []                # optional string[]
  auth_seed:                      # optional — requires auth: true
    users:
      - name: Admin User
        email: admin@my-app.com
        password: password123
        role: admin               # default 'user'
  */
  ```

  `favicon` and `pwa` inside `@arkzen:meta` are **deprecated** (warning only) — move them to `@arkzen:meta:web`.

  ## SECTION 5B — @arkzen:meta:web

  All fields optional. Web only.

  ```
  /* @arkzen:meta:web
  title: My App — Tagline          # <title>; defaults to label ?? name
  label: My App                    # human name (nav, PWA name fallback)
  description: SEO description.
  favicon: ☕                      # emoji, URL or path
  og:
    title: My App
    description: Share text
    image: /tatemonos/my-app/assets/images/og.png
    url: https://example.com
    type: website
  twitter:
    card: summary_large_image
    title: My App
    description: Share text
    image: /tatemonos/my-app/assets/images/og.png
  pwa:
    name: MyApp
    short_name: App
    description: ...
    theme_color: "#0f0f1a"
    background_color: "#0f0f1a"
    display: standalone            # standalone | fullscreen | minimal-ui | browser
    orientation: any               # portrait | landscape | any
    start_url: /my-app             # default /<name>
    offline: true                  # default true
    icons:
      - { src: /tatemonos/my-app/icon-192.png, sizes: 192x192, type: image/png }
      - { src: /tatemonos/my-app/icon-mask.png, sizes: 512x512, type: image/png, purpose: maskable }
  */
  ```

  ## SECTION 5C — @arkzen:meta:native

  Required when the tatemono has native screens. Only the `expo:` section is read today.

  ```
  /* @arkzen:meta:native
  label: My App
  description: Short description
  expo:
    bundle_id: com.company.myapp
    scheme: myapp
    version: 1.0.0
    icon: ./assets/icon.png
    orientation: portrait          # portrait | landscape | default
    status_bar_style: dark         # default | light-content | dark-content | dark | light
    permissions: [CAMERA, ACCESS_FINE_LOCATION]
    splash:
      image: ./assets/splash.png
      background_color: "#ffffff"
      resize_mode: contain
  */
  ```

  * * *

  ## SECTION 6 — @arkzen:web:config

  Optional UI defaults for the built-in Toast / Modal / Table / Breadcrumb / Dialog and layout wrappers.

  ```
  /* @arkzen:web:config
  toast:
    position: top-right
    duration: 3000
  modal:
    borderRadius: 16px
    backdrop: "rgba(0,0,0,.5)"
    animation: fade
  table:
    striped: true
    hoverable: true
    border: "1px solid #eee"
  breadcrumb: { separator: "/", style: muted }
  dialog: { size: md, animation: scale }
  layout:
    guest:
      className: "my-root"
      container: "max-w-md mx-auto"
    auth:
      className: "min-h-screen"
    app:                           # any custom layout name works too
      className: "app-root"
  */
  ```

  PWA config now belongs in `@arkzen:meta:web`, not here.

  ## SECTION 6B — @arkzen:native:config

  Theme tokens for native screens. The engine generates a constants object `C` available across native blocks (`C.primary`, `C.bg`, ...). Custom keys allowed; `fonts` supported.

  ```
  /* @arkzen:native:config
  theme:
    primary: "#6366f1"
    background: "#fafaf9"
    surface: "#ffffff"
    text: "#0f172a"
    muted: "#94a3b8"
  fonts:
    heading: Inter_700Bold
  */
  ```

  * * *

  ## SECTION 7 — @arkzen:database

  **One block = one table. Only the dict format is parsed.** (The older multi-table `tables:` array format is NOT parsed — a block without `table:` is silently skipped.) Declare as many `@arkzen:database:<identifier>` blocks as you need.

  ```
  /* @arkzen:database:products
  table: products                  # plural snake_case; REQUIRED
  timestamps: true                 # default true
  softDeletes: false               # default false
  columns:                         # REQUIRED
    id:
      type: integer
      primary: true
      autoIncrement: true          # primary + autoIncrement → $table->id()
    name:
      type: string
      length: 255
      nullable: false
    price:
      type: decimal
      precision: 8
      scale: 2
    status:
      type: string
      default: active
    category_id:
      type: foreignId
      foreign: my_app_categories.id   # see Section 7D
      nullable: false
      onDelete: cascade            # default cascade
  indexes:
    - { columns: [status, category_id], unique: false }
  seeder:
    count: 3
    data:
      - name: "Product One"
        price: "99.99"
        status: active
  */
  ```

  **Valid column types:** `integer, bigInteger, string, text, longText, decimal, float, boolean, date, datetime, timestamp, json, uuid`, plus the marker `foreignId` used together with `foreign:`.

  **Column keys:** `type, length, nullable, default, unique, primary, autoIncrement, foreign, onDelete, precision, scale, unsigned`.

  **`type: enum` is NOT supported.** The migration builder turns unknown types into `string` and ignores `values:`. Use `type: string` + `default:` and enforce allowed values with validation (`in:active,inactive`).

  `uuid` + `primary: true` → UUID primary key.

  **Updating a table:** when the table already exists, the engine writes an *update migration* adding only **new columns**. It does not alter or drop existing columns — to change a column type, drop the table's database file (or table) and rebuild.

  ## ⚠️ SECTION 7B — RELATIONSHIPS

  Engine auto-generates `belongsTo` / `hasMany` from `foreign:` columns. Never write them by hand. Migrations are topologically sorted by foreign-key dependencies (parents first); circular dependencies are an error.

  ## ⚠️ SECTION 7C — SEEDERS

  Seed parents only when children can reference known ids. Do not seed a child table whose `foreignId` points at rows that may not exist yet. Tables created at runtime (tickets, orders, logs) normally need **no seeder**.

  ## ⚠️ SECTION 7D — PHYSICAL TABLE NAMES & `foreign:` (BACKEND-SPECIFIC)

  Physical table naming depends on the active backend. Go and Rust use an isolated database per tatemono and create tables with the declared name (for example, `tickets`); they do not require a tatemono slug prefix. Some other engines prefix physical table names (for example, `queue-flow` + `tickets` → `queue_flow_tickets`). Models stay unprefixed (`Ticket`). The migration builder uses the `foreign:` value **literally** as the real table name, so use the physical target table name for the active backend:

  ```yaml
  # ✅ On a backend that prefixes tables, use the physical prefixed table name
  queue_id:
    type: foreignId
    foreign: queue_flow_queues.id
  ```

  For Go/Rust, use the declared physical table name. See "Known engine quirks" about `dtr-geofencing` and automatic relationship methods.

  * * *

  ## SECTION 8 — @arkzen:api

  ```
  /* @arkzen:api:products
  model: Product                   # REQUIRED, PascalCase, matches table (Product ↔ products)
  controller: ProductController    # REQUIRED, must end with "Controller", unique per tatemono
  prefix: /api/my-app/products     # REQUIRED, must start with /api/
  middleware: []                   # e.g. [auth] or [auth, role:admin] or custom [requireJson]
  resource: true                   # generate API Resource class
  policy: false                    # true → PolicyBuilder + $this->authorize() wiring
  factory: false
  endpoints:
    index:
      method: GET
      route: /
      description: List products   # description REQUIRED on every endpoint
      query:
        search: string
        per_page: integer|default:15
      response:
        type: paginated
    store:
      method: POST
      route: /
      description: Create a product
      validation:
        name: required|string|max:255
      response:
        type: single
    show:    { method: GET,    route: /{id}, description: Get a product,    response: { type: single } }
    update:  { method: PUT,    route: /{id}, description: Update a product, validation: { name: sometimes|string }, response: { type: single } }
    destroy:
      method: DELETE
      route: /{id}
      description: Delete a product
      response:
        type: message
        value: Product deleted
  */
  ```

  **Response types:** `paginated`, `collection`, `array` (index only; plain list), `single`, `message` (with `value:`). Optional `resource:` name.

  **Standard method names** map to generated CRUD: `index`, `show`, `store`, `update`, `destroy`. **Any other endpoint name** is a *custom method* — it gets a stub unless you provide an `@arkzen:endpoint:<name>` body.

  ### Special endpoint `type:` values (set on the endpoint, next to `method`)

  | Endpoint name | `type:`                | Generates |
  |---------------|------------------------|-----------|
  | `index`       | `upload_index`         | list uploaded files |
  | `store`       | `upload`               | multipart upload (validation `files: required|array`, `files.*: file|max:10240`) |
  | `destroy`     | `upload_destroy`       | delete record + file |
  | `fileUrl`     | `upload_url`           | public/download URL for a file |
  | `store`       | `broadcast`            | save then `broadcast()` on the realtime channel (also drives the Lynx SSE bridge) |
  | `store`       | `mail_send`            | send a `@arkzen:mail` mailable; declare `mail`, `to`, optional `data` in `validation:` |
  | `store`       | `notification_trigger` | `$user->notify()` a `@arkzen:notifications` class; declare `notification` in `validation:` |
  | `store`/`run` | `command_run`          | run an Artisan command **(hardcoded map — test tatemonos only)** |
  | `store`       | `job_dispatch`         | dispatch a job **(hardcoded map — test tatemonos only)** |
  | `store`       | `event_fire`           | fire an event **(hardcoded map — test tatemonos only)** |

  For your own jobs / events / commands, **do not** use `command_run | job_dispatch | event_fire` — write a custom endpoint with an `@arkzen:endpoint:<name>` body (or an `@arkzen:routes` handler) that dispatches them.

  ### Role endpoint names (generate role-specific methods)

  `me`, `adminOnly`, `userOnly`, `promote`, `demote` — used with `auth: true` and role middleware (see `roles-test`).

  **Backend notes (Section 8):** the `api` block is shared: validation rule strings, `role:` middleware, `policy: true`, `response.type` and the standard CRUD methods behave the same on Laravel and Express. Only the *bodies* (`endpoint`, `policy`, `middleware`) are variants. Express provides custom runtime equivalents for uploads, resources, factories, command/job/event dispatch, mail, notifications, and realtime.

  * * *

  ## SECTION 9 — @arkzen:routes (custom routes, no model needed)

  ```
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

  Multiple `@arkzen:routes` blocks allowed (one controller each). Controller defaults to `CustomController`. Route params arrive as `$params[0]`, `$params[1]`, … in handler bodies (**not** `$request->route('name')`).

  **Backend notes:** the `routes` block is shared. In `:ts` handlers the route params are available as `request.route('name')` or the `params` array (see 9B for the PHP `$params[n]` form). Other variants: `:java` handlers receive `List<Object> params` and `request.route(name)`, `:cs` reads `RouteValues`, `:go` reads `request.Route(...)` (Section 1F).

  ## ⚠️ SECTION 9B — @arkzen:handler:php:name / @arkzen:handler:ts:name

  Body for a route entry: `:php` for Laravel, `:ts` for Express. Shape D (`*/` on the next line).

  ```
  /* @arkzen:handler:php:join_queue
  */
  $queueId = $request->input('queue_id');
  $ticket = \App\Models\Arkzen\MyApp\Ticket::create([...]);
  return response()->json(['ticket' => $ticket]);
  /* @arkzen:handler:php:join_queue:end */
  ```

  Models live at `\App\Models\Arkzen\{SlugNamespace}\{Model}` (slug PascalCased: `queue-flow` → `QueueFlow`).

  | Scenario                                          | Use                     |
  |---------------------------------------------------|-------------------------|
  | Custom logic inside an `@arkzen:api` method       | `@arkzen:endpoint:php:name` (Laravel) / `@arkzen:endpoint:ts:name` (Express) |
  | Body for an `@arkzen:routes` entry                | `@arkzen:handler:php:name` (Laravel) / `@arkzen:handler:ts:name` (Express) |

  **Per-backend forms:** `@arkzen:handler:php:name` (Laravel, above) and `@arkzen:handler:ts:name` (Express). Express example:

  ```
  /* @arkzen:handler:ts:probe
  */
  return response.json({ probe: request.route('name'), params, at: 'express' })
  /* @arkzen:handler:ts:probe:end */
  ```

  ## SECTION 9C — @arkzen:policy:php:method / @arkzen:policy:ts:method

  Requires `policy: true` on the api. Supported methods: `update`, `delete`. Body has `$user` and the model instance (named after the model, e.g. `$item`/`$product` — see `crud-test`).

  ```
  /* @arkzen:policy:php:update
  */
  if ($item->status === 'archived') { return false; }
  return true;
  /* @arkzen:policy:php:update:end */
  ```

  **Per-backend forms:** `@arkzen:policy:php:update` / `@arkzen:policy:ts:update`. Express example (body receives `user` and the lower-camel model, e.g. `ticket`):

  ```
  /* @arkzen:policy:ts:delete
  */
  return user?.role === 'admin'
  /* @arkzen:policy:ts:delete:end */
  ```

  ## SECTION 10 — @arkzen:middleware:php:name / @arkzen:middleware:ts:name

  Declare in `middleware: [name]` on an api/routes block; the body becomes `handle()`. The alias is registered automatically. Include `return $next($request);`.

  ```
  /* @arkzen:middleware:php:requireJson
  */
  if (!$request->isJson()) {
      return response()->json(['message' => 'Content-Type: application/json required'], 415);
  }
  return $next($request);
  /* @arkzen:middleware:php:requireJson:end */
  ```

  **Per-backend forms:** `@arkzen:middleware:php:name` / `@arkzen:middleware:ts:name` (Section 1E has the paired example). The alias in `middleware: [name]` is registered on every backend.

  ## SECTION 18 — @arkzen:endpoint:php:name / @arkzen:endpoint:ts:name

  Body for an `@arkzen:api` method (the method name must exist in the api block).

  ```
  /* @arkzen:endpoint:php:index
  */
  $query = \App\Models\Arkzen\MyApp\Item::query()->orderBy('created_at', 'desc');
  return response()->json($query->paginate($request->get('per_page', 15)));
  /* @arkzen:endpoint:php:index:end */
  ```

  **Per-backend forms:** `@arkzen:endpoint:php:name` / `@arkzen:endpoint:ts:name`. Express example:

  ```
  /* @arkzen:endpoint:ts:stats
  */
  const total = await Ticket.count()
  const open = await Ticket.where('status', 'open').count()
  return response.json({ total, open, closed: total - open, by: request.user().email })
  /* @arkzen:endpoint:ts:stats:end */
  ```

  * * *

  ## ⚠️ SECTION 11 — @arkzen:realtime:identifier (Reverb)

  Two uses, decided by the `channel:` key. Always close with `:end`.

  ```
  # 1) Channel registration (NO channel: key) → channels.php
  /* @arkzen:realtime:my-app.{id}
  type: private
  */
  /* @arkzen:realtime:my-app.{id}:end */

  /* @arkzen:realtime:queue-flow-public
  type: public
  */
  /* @arkzen:realtime:queue-flow-public:end */

  # 2) Broadcast event (HAS channel: key) → ShouldBroadcast class
  /* @arkzen:realtime:queue-updated
  channel: queue-flow.{queueId}
  type: public
  */
  /* @arkzen:realtime:queue-updated:end */
  ```

  Fire from PHP (handlers / endpoints / listeners):

  ```php
  broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([...]))->toOthers();
  // namespace: \App\Events\Arkzen\{SlugNamespace}\Broadcast\{ClassName}
  ```

  Private channels with `{id}` generate events that take a user id and build the channel name dynamically.

  **Lynx bridge:** Lynx has no WebSocket. When a tatemono has realtime blocks **and** an api endpoint with `type: broadcast`, the engine also generates `SseController` + `GET /api/{slug}/sse/{channelType}` for Lynx. Web/Expo keep using Reverb.

  **Backend notes:** `realtime` blocks are shared (pure config); Express serves a Pusher-protocol realtime server (public / private / presence) instead of Reverb, and the browser-side client setup does not change. The `broadcast(new \App\Events\...)` call shown above is PHP; on Express use `broadcast(...)` with the generated broadcast event from a `:ts` body.

  ## SECTION 12 — @arkzen:events:identifier

  YAML in the opening comment; `listeners:` names the listener classes. Close with `:end`. No body.

  ```
  /* @arkzen:events:user-signed-up
  listeners: [SendWelcomeEmail, UpdateUserStats]
  */
  /* @arkzen:events:user-signed-up:end */
  ```

  Event class: `\App\Events\Arkzen\{SlugNs}\{StudlyName}` (e.g. `UserSignedUp`). Fire with `event(new \App\Events\Arkzen\EventsTest\UserSignedUp($payload));`.

  **Backend notes:** `events` blocks are shared. Event firing in a body is backend-specific (`event(new ...)` in PHP, the runtime's `event(...)` in `:ts`).

  ## SECTION 13 — @arkzen:listener:php:Name / @arkzen:listener:ts:Name (singular!)

  Body of the listener's `handle($event)` — **only the method body**, not a class. Shape D. If no body is given the engine generates a log-and-record stub (it inserts into the tatemono's `event_log` table).

  ```
  /* @arkzen:listener:php:SendWelcomeEmail
  */
  \Mail::to($event->data['email'] ?? '')->send(new \App\Mail\Arkzen\MyApp\WelcomeMail($event->data));
  /* @arkzen:listener:php:SendWelcomeEmail:end */
  ```

  > Legacy: `events-test` also contains plural `@arkzen:listeners:Name */ class ... { }` blocks with full PHP classes. The parser only reads the singular `@arkzen:listener:` form for bodies — write the singular form.

  **Per-backend forms:** `@arkzen:listener:php:Name` / `@arkzen:listener:ts:Name`. Express example:

  ```
  /* @arkzen:listener:ts:LogTicket
  */
  await EventLog.create({ event_name: 'ticket-created', listener: 'LogTicket', payload: JSON.stringify(event.data) })
  /* @arkzen:listener:ts:LogTicket:end */
  ```

  ## SECTION 14 — @arkzen:jobs:identifier (shared) / @arkzen:jobs:php:identifier / @arkzen:jobs:ts:identifier

  YAML (`queue`, `tries`, `timeout`) inside the opening comment; the body is the **whole `handle()` method**. Close with `:end`. Queue worker is started by `start.js`.

  ```
  /* @arkzen:jobs:php:process-data
  queue: default
  tries: 3
  timeout: 60
  */
  public function handle(): void
  {
      \App\Models\Arkzen\MyApp\Result::create(['status' => 'done']);
  }
  /* @arkzen:jobs:php:process-data:end */
  ```

  Job class namespace: `\App\Jobs\Arkzen\{SlugNs}\{Studly}Job` (e.g. `ProcessDataJob`). Dispatch from your own endpoint: `dispatch(new \App\Jobs\Arkzen\MyApp\ProcessDataJob());`.

  **Per-backend forms:** `@arkzen:jobs:php:name` (body = the whole `handle()` method, as above) / `@arkzen:jobs:ts:name` (body = the statements of `handle()`; the whole method is also accepted). Repeat `queue` / `tries` / `timeout` in each variant. Express example:

  ```
  /* @arkzen:jobs:ts:record-result
  queue: default
  tries: 2
  timeout: 20
  */
  const mode = this.data?.mode ?? 'default'
  await JobResult.create({ job_name: 'record-result', status: 'completed:' + mode })
  /* @arkzen:jobs:ts:record-result:end */
  ```

  A YAML-only `jobs` block (no body) is shared and generates a stub on every backend. Express runs jobs with `npm run queue` (started automatically by `start.js`).

  ## SECTION 15 — @arkzen:notifications:identifier (shared; `:php` / `:ts` only with a body)

  YAML inside the opening comment. Close with `:end`. Optional PHP body between `*/` and `:end` replaces the generated `toMail()` body.

  ```
  /* @arkzen:notifications:mail-ping
  channels: [mail]                 # database | mail | broadcast (combine freely)
  message: "This is a test mail notification"
  subject: "Mail Ping"
  */
  /* @arkzen:notifications:mail-ping:end */

  /* @arkzen:notifications:broadcast-ping
  channels: [broadcast, database]
  channel_type: private            # private | public
  message: "Real-time notification!"
  subject: "Broadcast Ping"
  */
  /* @arkzen:notifications:broadcast-ping:end */
  ```

  Class: `\App\Notifications\Arkzen\{SlugNs}\{Studly}Notification`. Requires `auth: true` for private/user notifications. Trigger via an api endpoint with `type: notification_trigger`.

  **Backend notes:** with **no body** a `notifications` block is shared (Express supports the `database`, `mail` and `broadcast` channels). A body makes it a variant: `:php` replaces `toMail()`; on Express use `@arkzen:notifications:ts:name` with a `toMail(notifiable)` body returning `new MailMessage().subject(...).line(...)`.

  ## SECTION 16 — @arkzen:mail:identifier (shared; `:php` / `:ts` / `:py` / `:java` / `:cs` / `:go` / `:rs` bodies)

  YAML inside the opening comment (`subject`, `data:` = field → type). Close with `:end`. Optional Blade/HTML body between `*/` and `:end` becomes the email view.

  ```
  /* @arkzen:mail:php:welcome-mail
  subject: "Welcome to My App"
  data:
    username: string
    app_name: string
  */
  <h1>Welcome, {{ $username }}!</h1>
  <p>Thanks for joining {{ $app_name }}.</p>
  /* @arkzen:mail:php:welcome-mail:end */
  ```

  Class: `\App\Mail\Arkzen\{SlugNs}\{Studly}Mail` (`welcome-mail` → `WelcomeMailMail`: the engine appends `Mail` to the studly name — keep identifiers short, e.g. `welcome`). Trigger via an api endpoint with `type: mail_send`.

  **Backend notes:** with **no body** a `mail` block is shared and gets a generated template. A Blade/HTML body makes it a variant. Express, FastAPI, and Spring Boot render `{{ var }}`, `{{ $var }}`, and `{!! var !!}` placeholders; Spring Boot escapes the double-brace forms. Spring Boot supports the `mail_send` endpoint and logs delivery by default; SMTP delivery requires `MAIL_MAILER=smtp` and SMTP environment settings. To stay shared on every backend, keep mail YAML-only unless you need custom markup.

  ## SECTION 17 — @arkzen:console:identifier (shared) / @arkzen:console:php:identifier / @arkzen:console:ts:identifier (Artisan + scheduler)

  YAML (`signature`, `description`, `schedule`) in the opening comment; body is the **whole `handle(): int` method**. `schedule` is a quoted cron string and is auto-registered with the scheduler. Close with `:end`.

  ```
  /* @arkzen:console:php:cleanup-temp
  signature: my-app:cleanup-temp
  description: Deletes temporary files older than 24h
  schedule: '0 * * * *'
  */
  public function handle(): int
  {
      $this->info('[my-app] cleanup running');
      \Storage::deleteDirectory('temp');
      return Command::SUCCESS;
  }
  /* @arkzen:console:php:cleanup-temp:end */
  ```

  `signature` defaults to `{slug}:{name}`. Do **not** use `command:` (v10 doc was wrong).

  **Per-backend forms:** `@arkzen:console:php:name` (body = the whole `handle(): int` method, as above) / `@arkzen:console:ts:name` (body = the statements of `handle()`; the whole method is also accepted). Repeat `signature`, `description` and `schedule` in each variant. Express example:

  ```
  /* @arkzen:console:ts:ping
  signature: express-test:ping
  description: Writes a job_results row
  schedule: '* * * * *'
  */
  await JobResult.create({ job_name: 'ping', status: 'ran' })
  this.info('[express-test] ping done')
  return Command.SUCCESS
  /* @arkzen:console:ts:ping:end */
  ```

  Express runs schedules from `npm run queue` and manual commands via `npm run pluff -- <signature>`.

  * * *

  ## SECTION 19 — @arkzen:web:layout:name

  Custom named layout wrapper for web pages.

  ```
  /* @arkzen:web:layout:app */

  'use client'

  import React from 'react'
  import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
  import { Home, Settings } from 'lucide-react'

  export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router   = useArkzenRouter()
    const pathname = useArkzenPathname()
    return <div style={{ minHeight: '100vh' }}><main>{children}</main></div>
  }

  /* @arkzen:web:layout:app:end */
  ```

  **Rules:** export `<PascalName>Layout` (`app` → `AppLayout`); `'use client'` required; use `useArkzenRouter()` / `useArkzenPathname()` (never stack-specific routers); a layout cannot import from `web:components`.

  ### Layout nesting

  A layout may declare `parent:` (Shape B — YAML inside the opening comment, then `*/`):

  ```
  /* @arkzen:web:layout:panel
  parent: shell
  */

  'use client'
  import React from 'react'
  export const PanelLayout = ({ children }: { children: React.ReactNode }) => <div className="flex">{children}</div>

  /* @arkzen:web:layout:panel:end */
  ```

  The engine walks parent links outermost → innermost (`shell > panel > modal`), and throws on cycles.

  **Page layout declarations** (line directly after the page opener):

  | Declaration            | Meaning |
  |------------------------|---------|
  | `layout:app`           | custom layout `app` (plus its parent chain) |
  | `layout:guest` / `layout:auth` | built-in guards (compat) |
  | `layout:+auth`         | auth guard, no custom layout |
  | `layout:+guest`        | guest guard, no custom layout |
  | `layout:+auth:panel`   | auth guard + custom layout chain `panel` |
  | `layout:+guest:shell`  | guest guard + custom layout chain `shell` |

  Only ONE chained name is allowed after the guard (`+auth:panel`, not `+auth:a:b`). A page with no layout line defaults to `guest`. Using an undefined layout name is an error. See `layout-test` for every combination.

  * * *

  ## SECTION 20 — @arkzen:web:style & @arkzen:web:style:Name

  Global stylesheet and per-component **CSS Modules**. Can appear before or after components (or be omitted entirely).

  ```
  /* @arkzen:web:style */
  .my-btn { transition: all .3s ease; }
  @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
  /* @arkzen:web:style:end */

  /* @arkzen:web:style:ProductCard */
  .card { border-radius: 12px; }
  /* @arkzen:web:style:ProductCard:end */
  ```

  Inside CSS (not inline-style objects) use real CSS property names (`background-position`, not `backgroundPosition`).

  * * *

  ## SECTION 21 — @arkzen:web:page:name

  ```
  /* @arkzen:web:page:dashboard */
  /* @arkzen:web:page:layout:+auth */

  const DashboardPage = () => {
    const [data, setData] = useState(null)
    return <div>...</div>
  }

  /* @arkzen:web:page:dashboard:end */
  ```

  - Opening tag with `*/` on the same line; layout declaration on the NEXT line
  - The Next.js generator collects and relocates page imports, strips `'use client'`, and removes a simple `export default ComponentName` line before generating its own page export. Referenced non-React imports from `web:components` can also be forwarded. Keep page code self-contained apart from generated imports for declared shared components, hooks, constants, types, and utilities; do not rely on declarations sharing a lexical scope across blocks.
  - Put page-only dependencies in the page block. Imports declared in component blocks are available to generated components and may be forwarded to a page when the page references an imported identifier.
  - Define the page as a PascalCase `const` whose name ends in `Page` (for example, `IndexPage`). The generator looks for that shape; if it does not find one, it falls back to `<PageName>Page`.
  - Page name → route `/<tatemono>/<page>`; `index` = the tatemono root

  ## ⚠️ SECTION 22 — web:error:404 / web:error:500

  ```
  /* @arkzen:web:error:404 */

  const NotFoundPage = () => (<div>404 — Page not found</div>)

  /* @arkzen:web:error:404:end */

  /* @arkzen:web:error:500 */

  'use client'

  function ServerErrorPage({ reset }: { reset: () => void }) {
    return <button onClick={reset}>Try Again</button>
  }

  /* @arkzen:web:error:500:end */
  ```

  404: define `NotFoundPage`; imports are normalized and React is injected. 500: define `ServerErrorPage({ reset })`; the generated boundary has `'use client'`. In both cases, the generator adds the default export. These generate segment-scoped error files, not routed pages.

  ## SECTION 23 — @arkzen:web:components:identifier

  ```
  /* @arkzen:web:components:shared */

  'use client'

  import React, { useState, useEffect, useCallback, useRef } from 'react'
  import { create } from 'zustand'
  import { Plus, Trash2, Loader2 } from 'lucide-react'
  import { arkzenFetch } from '@/arkzen/core/stores/authStore'

  // Types, stores, utilities, components

  /* @arkzen:web:components:shared:end */
  ```

  The generator combines imports from all web component blocks and includes the resolved import set in each generated component file. Component declarations are still emitted as separate modules; use exported declarations and the generator's shared component/hook/constant/type/utility imports rather than relying on a shared lexical scope.

  Export names decide which file an export lands in. Top-level exports in web:components blocks are sorted by name: PascalCase becomes one file per component, useXxx goes to hooks.tsx, ALL_CAPS constants go to constants.tsx, camelCase functions and values go to utils.tsx, and type/interface go to types.ts. Pages and other components import what they use automatically. A theme object, language list or limit is an ALL_CAPS export. Dark-mode or state logic is a use* export, and a zustand store works as one. No extra block is needed.

  ## SECTION 24 — @arkzen:web:animation

  ```
  /* @arkzen:web:animation */

  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import React from 'react'

  const queueFlowAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo('.header-section', { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out' })
    }, pageRef)
    return () => ctx.revert()
  }

  export const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: .35, ease: 'easeOut' } },
    exit:    { opacity: 0, y: -8, transition: { duration: .2 } },
  }

  /* @arkzen:web:animation:end */
  ```

  - Main function: **no `export`**, named `camelCase(tatemono-name) + Animations`
  - `pageVariants`: **keep `export const`**
  - GSAP target classes must exist on rendered elements
  - **Pinned ScrollTrigger:** never also tween `opacity`/`transform` on children of a pinned element (they vanish on refresh). Animate on mount with `clearProps: 'opacity,transform'`, use `invalidateOnRefresh: true`, and `requestAnimationFrame(() => ScrollTrigger.refresh())` after pin setup.

  ## SECTION 24C/D — @arkzen:web:script / @arkzen:web:script:name

  Pure-TypeScript helper blocks (Three.js factories, constants). No JSX; all exports use `export`.

  ```
  /* @arkzen:web:script */
  export const Colors = { primary: '#a78bfa' }
  /* @arkzen:web:script:end */

  /* @arkzen:web:script:three-scene */
  import * as THREE from 'three'
  export function makeScene(canvas: HTMLCanvasElement) { /* ... */ }
  /* @arkzen:web:script:three-scene:end */
  ```

  Generated files: `<name>.scripts.ts` and `<name>.<block>.script.ts`; import path `@/arkzen/generated/<file-without-.ts>`. The old unprefixed `@arkzen:script` is gone — always `web:script`.

  ## SECTION 25 — ASSETS

  `tatemonos/<name>/assets/{images,svg,fonts,icons,audio,data}/` → copied to public. Web reference: `/tatemonos/<name>/assets/<category>/<file>`.

  * * *

  # NATIVE DSL — EXPO, BARE REACT NATIVE, LYNX

  Native blocks live in the same `core.tsx` (after the web blocks, or standalone for a native-only tatemono). There are **three native targets**, each with its own rules:

  | Target        | Stack dir        | Block family                         | Imports |
  |---------------|------------------|--------------------------------------|---------|
  | Expo          | `expo`           | `@arkzen:native:*` + `@arkzen:import:expo` pairs | inside `import:expo` pairs |
  | Bare RN       | `react-native`   | `@arkzen:native:*` + `@arkzen:import:rn` pairs   | inside `import:rn` pairs   |
  | Lynx          | `lynx`           | `@arkzen:native:*:lynx:*`                        | page imports are retained; known shared-component imports are generated |

  The engine runs once per active stack and keeps only what matches that stack. Expo and bare RN **share** the same block names and are separated only by the import pairs; Lynx has its own block names and never uses import pairs.

  * * *

  ## SECTION 23B — Expo / bare RN: `@arkzen:import:expo` & `@arkzen:import:rn`

  Inside a `native:components`, `native:layout`, `native:page` or `native:error` block you may write dual-target import pairs (both have `:end`):

  ```
  /* @arkzen:native:components:shared */

  /* @arkzen:import:expo */
  import React, { useState } from 'react'
  import { View, Text, TouchableOpacity } from 'react-native'
  import { useRouter } from 'expo-router'
  /* @arkzen:import:expo:end */

  /* @arkzen:import:rn */
  import React, { useState } from 'react'
  import { View, Text, TouchableOpacity } from 'react-native'
  /* @arkzen:import:rn:end */

  export const Badge = ({ label }: { label: string }) => (
    <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
      <Text className="text-xs font-semibold text-indigo-600">{label}</Text>
    </View>
  )

  /* @arkzen:native:components:shared:end */
  ```

  **Resolution rules (done by the parser for the active stack):**

  - The pair matching the active stack is kept (markers stripped); the other pair is **deleted entirely** (markers + body).
  - Code outside any pair is kept for both targets.
  - A block may contain several pairs side by side (e.g. one pair for imports, another wrapping a stack-specific handler).
  - A block whose only import pair belongs to the other stack is dropped for this stack. This is how you write **one error block per target** (see below).
  - Expo uses `expo-router` (`useRouter`, `usePathname`); bare RN has no expo-router — put router code in the `expo` pair only, or write RN-specific navigation in the `rn` pair.

  Always available in native component scope: `React` hooks, RN primitives (`View, Text, TouchableOpacity, Pressable, ScrollView, FlatList, Image, StyleSheet, RefreshControl, TextInput, ActivityIndicator`), `SafeAreaView` from `react-native-safe-area-context`, and `useRouter, usePathname` from `expo-router` (Expo). Animation (optional): `react-native-reanimated`, `moti`.

  The same sorting applies in native:components: ALL_CAPS goes to constants.tsx, use* to hooks.tsx, camelCase to utils.tsx, types to types.ts, and PascalCase to one file per component. Any package a hook or constant needs, such as zustand, must be listed in an import pair.

  > Native import pairs are not required on every native page. Markerless native pages are accepted by the current validator and remain supported for legacy/shared code; use `@arkzen:import:expo` and `@arkzen:import:rn` when imports or code differ between targets. The current `engine/frontend/nextjs/validate.js` CLI resolves tatemonos under `engine/tatemonos`, so it may report a missing tatemono when run from this repository layout; this is a path issue, not a native-import validation rule.

  * * *

  ## SECTION 19B — @arkzen:native:layout:name (Expo / bare RN)

  ```
  /* @arkzen:native:layout:app */

  /* @arkzen:import:expo */
  import React from 'react'
  import { View } from 'react-native'
  import { SafeAreaView } from 'react-native-safe-area-context'
  import { useRouter, usePathname } from 'expo-router'
  /* @arkzen:import:expo:end */

  export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter()
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView edges={['top']}>{/* header */}</SafeAreaView>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    )
  }

  /* @arkzen:native:layout:app:end */
  ```

  **Layout imports (Expo): avoid `@/arkzen/...` inside a native layout.** The generator rewrites that alias to the fixed `../../../arkzen/...` path used for page imports, but custom layouts are emitted under `arkzen/core/layouts/custom/`. Relative to that directory, the rewritten path does not point to the project-level `arkzen` directory and can fail Metro resolution. For example, an import of `@/arkzen/core/stores/authStore` should use the layout-relative path `../../stores/authStore` in a custom layout. The alias normalization is visible in the generator's `normaliseNativeImports` and `generateCustomLayouts` paths; it is not adjusted for the layout's directory depth.

  - Keep imports in the custom layout relative to its generated location; verify the generated file path when adding other `arkzen` imports.
  - Imports in a custom layout are resolved for that generated layout file, separately from page imports. The same import in a separate page file is not by itself a duplicate declaration.
  - If a shell needs shared auth, realtime or toast behavior, it can also use a `native:components` component (for example `ShellFx`) mounted from `Screen` or pages; this is an alternative, not a requirement.

  Export `<PascalName>Layout`. Nesting works like web: `parent:` in the opening comment (Shape B):

  ```
  /* @arkzen:native:layout:tab-panel
  parent: app-shell
  */
  ```

  **Page layout declarations** (line right after the page opener): `layout:default` (engine SafeAreaView wrapper, **the default**), `layout:guest`, `layout:auth`, `layout:+auth`, `layout:+guest`, `layout:app` (your own named layout), `layout:+auth:tab-panel`, `layout:+guest:app` — same chain rules as web.

  ## SECTION 20B — native styles

  Two forms, both Shape C:

  ```
  /* @arkzen:native:style */                       ← GLOBAL (v10.6): CSS-like rules, engine converts/wraps them
  :root {
    --color-primary: #2563eb;
    --radius-default: 0.75rem;
  }
  .arkzen-btn {
    background-color: var(--color-primary);
    border-radius: var(--radius-default);
    padding-horizontal: 24px;
  }
  /* @arkzen:native:style:end */

  /* @arkzen:native:style:shared */                ← NAMED: full StyleSheet export
  import { StyleSheet } from 'react-native'
  export const S = StyleSheet.create({
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  })
  /* @arkzen:native:style:shared:end */
  ```

  Named blocks export their own constant (`S`, `HeroS`, …), merged into the generated `.native-styles.ts`, and are available in native pages/components without importing. The global block is CSS-like (see `new-updates-styles`); named blocks are TypeScript `StyleSheet.create` exports (see `shan-shan`).

  ## SECTION 21B — @arkzen:native:page:name (Expo / bare RN)

  ```
  /* @arkzen:native:page:index */
  /* @arkzen:native:page:layout:default */

  const IndexScreen = () => {
    const router = useRouter()
    return (
      <View className="flex-1 bg-neutral-50 px-6 pt-14">
        <Text className="text-4xl font-bold">Hello, Native 👋</Text>
        <PrimaryButton label="Go to About" onPress={() => router.push('/my-app/about' as any)} />
      </View>
    )
  }

  /* @arkzen:native:page:index:end */
  ```

  - `*/` on the opening line; layout line directly after (omit it → `default`)
  - Use `@arkzen:import:expo` / `@arkzen:import:rn` pairs for imports that differ by native target; the parser selects the matching pair. Prefer shared code in native components. The generator wraps and exports the screen. A simple standalone `export default ScreenName` is okay but stripped out; preferably omit it and let the engine generate the export.
  - Component naming is a convention; the Expo and bare-RN generators select a PascalCase component from the page body and wrap it.
  - NativeWind `className` for static styles, inline `style` for dynamic
  - Navigate with `router.push('/<tatemono>/<page>' as any)`
  - Native-only tatemonos (no web page) are valid

  ## SECTION 22B — @arkzen:native:error:404 / :500 (Expo / bare RN)

  Generates `+not-found` / error boundary. Use **one block per target**, distinguished by the import pair:

  ```
  /* @arkzen:native:error:404 */
  /* @arkzen:import:expo */
  import React from 'react'
  import { View, Text } from 'react-native'
  /* @arkzen:import:expo:end */

  const NotFoundExpo = () => (<View className="flex-1 items-center justify-center"><Text>404</Text></View>)
  /* @arkzen:native:error:404:end */

  /* @arkzen:native:error:404 */
  /* @arkzen:import:rn */
  import React from 'react'
  import { View, Text } from 'react-native'
  /* @arkzen:import:rn:end */

  const NotFoundRN = () => (<View className="flex-1 items-center justify-center"><Text>404</Text></View>)
  /* @arkzen:native:error:404:end */
  ```

  ## SECTION 24B — native animation (stack-split)

  | Tag                           | Target  | Tech |
  |-------------------------------|---------|------|
  | `@arkzen:native:animation:expo`  | Expo    | Reanimated / Moti |
  | `@arkzen:native:animation:rn`    | bare RN | Reanimated / Moti (no longer shared with Expo) |
  | `@arkzen:native:animation:lynx`  | Lynx    | `@lynx-js/motion`, CSS keyframes |

  Shape C, one block per tag. Imports inside the block; exports use `export`; no JSX (pure hooks/helpers):

  ```
  /* @arkzen:native:animation:expo */
  import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
  export function useFadeIn() {
    const opacity = useSharedValue(0)
    const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
    return { style, start: () => { opacity.value = withTiming(1, { duration: 600 }) } }
  }
  /* @arkzen:native:animation:expo:end */
  ```

  ## SECTION 24E — native scripts (stack-split)

  Global: `@arkzen:native:script:expo | :rn | :lynx`. Named (many): `@arkzen:native:script:expo:name | :rn:name | :lynx:name`. Shape C, `:end` closes with the full tag. Pure TypeScript helpers, imports allowed, no JSX. The old generic `@arkzen:native:script` no longer exists.

  ```
  /* @arkzen:native:script:expo */
  export const API_TIMEOUT = 8000
  /* @arkzen:native:script:expo:end */
  ```

  * * *

  ## SECTION 25L — LYNX BLOCKS

  Lynx is a separate renderer (not React Native). Its blocks are all under `:lynx` and do not use Expo/RN `@arkzen:import` pairs. Page-level imports are retained in the generated page. The generator also creates imports for known shared components referenced by the page, so those component imports do not need to be repeated.

  | Block                                         | Notes |
  |-----------------------------------------------|-------|
  | `@arkzen:native:components:lynx:name`         | e.g. `shared`; imports from `@lynx-js/react` (and `@lynx-js/motion`) |
  | `@arkzen:native:layout:lynx:name`             | wrapper component |
  | `@arkzen:native:page:lynx:name`               | page imports are retained; known shared components are imported by the generator; component named `<PageName>LynxPage` or `<PageName>LynxScreen` (both appear in existing tatemonos) |
  | `@arkzen:native:style:lynx` / `:style:lynx:name` | global / named Lynx styles |
  | `@arkzen:native:error:404:lynx` / `:500:lynx` | error screens |
  | `@arkzen:native:animation:lynx`               | `@lynx-js/motion` |
  | `@arkzen:native:script:lynx[:name]`           | helpers |

  ```
  /* @arkzen:native:components:lynx:shared */

  import { type ReactNode, useState } from '@lynx-js/react'

  export const Card = ({ children }: { children: ReactNode }) => (<view>{children}</view>)

  /* @arkzen:native:components:lynx:shared:end */

  /* @arkzen:native:page:lynx:index */

  import React, { useState } from '@lynx-js/react'

  const IndexLynxPage = () => (
    <view className="flex-1 bg-neutral-50 px-6 pt-14">
      <text className="text-4xl font-bold">Hello Lynx</text>
    </view>
  )

  /* @arkzen:native:page:lynx:index:end */
  ```

  **Page layout line for Lynx:** the parser reads `/* @arkzen:native:page:lynx:layout:<name> */`. `layout-test` writes the shorter `/* @arkzen:native:page:layout:<name> */` inside Lynx pages — see "Known engine quirks"; prefer the `lynx:layout` form.

  **Lynx has no WebSocket** — live updates use SSE (auto-generated, see Section 11).

  Lynx pages use `<view>` / `<text>` elements with Tailwind-preset `className`s (see `hello-native`). Copy conventions from a working tatemono (`hello-native`, `asset-hub`, `animation-lab`, `crud-test`) instead of inventing APIs; Lynx primitives differ from React Native.

  * * *

  ## SECTION 26 — AVAILABLE IMPORTS

  **Web (`web:components` / `web:layout`) — always available:**

  ```ts
  import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
  import { create } from 'zustand'
  import { arkzenFetch, useAuthStore } from '@/arkzen/core/stores/authStore'
  import { Modal, Drawer, Dialog, Tooltip, Breadcrumb, Table, Form, Field,
    Pagination, Loading, PageTransition, Badge, Avatar, EmptyState,
    Toast, useToast, motion, AnimatePresence } from '@/arkzen/core/components'
  import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
  ```

  The shared web component barrel exports the items shown above. Additional component files (`Chart`, `FileUpload`, `Map`, `RichTextEditor`, and `SortableList`) are not re-exported by that barrel; import those from their individual files and check that the active stack has their dependencies installed.

  Shared data hooks live in separate files (there is no hooks barrel):

  ```ts
  import { useQuery } from '@/arkzen/core/hooks/useQuery'
  import { useMutation } from '@/arkzen/core/hooks/useMutation'
  import { useCRDT } from '@/arkzen/core/hooks/useCRDT'
  import { useWebSocket } from '@/arkzen/core/hooks/useWebSocket'
  ```

  These are shared engine modules; use their documented options and verify the feature is supported by the active runtime/backend (for example, `useWebSocket` needs a compatible realtime service).

  **Third-party packages are stack-specific, not universally available.** Examples installed in some web stack manifests include `framer-motion`, `gsap`, `animejs`, `three` / `@react-three/fiber`, `pixi.js`, `phaser`, `leaflet`, `@tiptap/react`, and `lucide-react`. This is not a guarantee that every listed package is installed in every web stack: check the active stack's dependency manifest before importing it. React-Inertia's runtime dependencies are declared in `engine/backend/laravel-inertia/package.json`, not `engine/frontend/react-inertia/package.json`. Tauri and Electron wrap the selected web stack, so check that web stack's dependencies.

  For mobile, Expo and bare React Native have `nativewind` and `lucide-react-native`; Expo additionally provides Expo APIs such as `expo-router` and `expo-image`, while bare React Native uses `@react-navigation/native`. Lynx has a separate runtime and packages, including `@lynx-js/react` and `@lucide/icons`; do not assume React Native or Expo packages work there. Check the active mobile stack's package manifest.

  **Web routing:** prefer `useArkzenRouter()` / `useArkzenPathname()` so navigation follows Pluff's Tatemono routing conventions. The adapter is stack-specific: TanStack uses TanStack Router; React/Vite uses React Router; Inertia uses Inertia's `router.visit()` and page URL. Use the stack's `Link` adapter for links in shared code.

  The Next.js generator can resolve ordinary imports such as `next/navigation`, but does not rewrite their routing behavior. TanStack Start additionally normalizes common Next.js page patterns (`useRouter()`, `usePathname()`, `<Link href>` and `process.env.NEXT_PUBLIC_*`) into its own router adapter and Vite environment form; this is a targeted compatibility conversion, not support for every Next.js API. Native Expo uses `useRouter()` from `expo-router`; bare React Native uses React Navigation.

  * * *

  ## SECTION 26B — FRONTEND DATA FETCHING

  `arkzenFetch(url, options)` (from `@/arkzen/core/stores/authStore`) is a thin `fetch` wrapper: it adds `Authorization: Bearer <token>` (when logged in) and JSON `Content-Type`/`Accept` headers, and **returns the raw `Response`**. You must call `await res.json()` yourself, and pass `body` as a **string**:

  ```ts
  const res = await arkzenFetch('/api/task-board/tasks')
  const d   = await res.json()
  setTasks(d.data ?? [])                       // paginated responses wrap items in .data

  const created = await arkzenFetch('/api/task-board/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),           // body must be JSON.stringify'd
  })
  if (!created.ok) { /* revert optimistic update */ }
  const task = await created.json()
  ```

  `arkzenGet<T>(url)` is also exported and returns parsed JSON directly. Always wrap calls in `try/catch` and guard the result (`d?.data ?? []`).

  * * *

  ## SECTION 28 — EXAMPLES & FIXTURE REFERENCES

  The compact Examples A–D below illustrate syntax; they are not substitutes for complete, tested Tatemono files. For copyable, fixture-backed patterns, use the actual sources listed here; the excerpts that follow are copied from those files.

  | What you need | Working Tatemono source |
  |---|---|
  | Database, CRUD API, validation, policy bodies, and all seven backend variants | [`tatemonos/crud-test/core.tsx`](./tatemonos/crud-test/core.tsx) |
  | One custom endpoint and custom route handler across all seven backend variants | [`tatemonos/body-endpoint-handler/core.tsx`](./tatemonos/body-endpoint-handler/core.tsx) |
  | Shared and backend-specific mail/notification bodies across all seven variants | [`tatemonos/body-mail-notification/core.tsx`](./tatemonos/body-mail-notification/core.tsx) |
  | Native Expo, bare RN, and Lynx components/pages in one Tatemono | [`tatemonos/hello-native/core.tsx`](./tatemonos/hello-native/core.tsx) |
  | Multi-page web components and CSS blocks | [`tatemonos/new-updates-styles/core.tsx`](./tatemonos/new-updates-styles/core.tsx) |
  | Guarded layouts, parent chains, and platform-specific layout declarations | [`tatemonos/layout-test/core.tsx`](./tatemonos/layout-test/core.tsx) |
  | Realtime and custom routes | [`tatemonos/queue-flow/core.tsx`](./tatemonos/queue-flow/core.tsx) |
  | Upload endpoint types | [`tatemonos/upload-test/core.tsx`](./tatemonos/upload-test/core.tsx) |
  | Web and native animation, scripts, and error screens | [`tatemonos/animation-lab/core.tsx`](./tatemonos/animation-lab/core.tsx) |

  These are real fixture excerpts, not standalone files; use the linked `core.tsx` for each complete working sample:

  **CRUD database and API** — from `crud-test`:

  ```
  /* @arkzen:database:items
  table: items
  timestamps: true
  columns:
    name:
      type: string
      length: 255
      nullable: false
    status:
      type: string
      length: 50
      default: active
  */

  /* @arkzen:api:items
  model: Item
  controller: ItemController
  prefix: /api/crud-test
  middleware: []
  resource: true
  policy: true
  endpoints:
    store:
      method: POST
      route: /items
      description: Create item
      validation:
        name: required|string|max:255
      response:
        type: single
  */
  ```

  **Real backend variant bodies** — `body-endpoint-handler` has `echo` and `stats` endpoint bodies in all seven variants, plus handler variants. This PHP/Express pair is copied from its `echo` endpoint:

  ```
  /* @arkzen:endpoint:php:echo
  */
  $input   = $request->all();
  $count   = count($input);
  $record  = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::create([
      'source'  => 'endpoint-body',
      'probe'   => 'echo',
      'payload' => json_encode($input),
      'result'  => "Echoed {$count} field(s) — ControllerBuilder v7.0 body injection ✓",
      'ok'      => true,
  ]);
  return response()->json([
      'injected'    => true,
      'builder'     => 'ControllerBuilder v7.0',
      'method'      => 'echo',
      'field_count' => $count,
      'echo'        => $input,
      'probe_id'    => $record->id,
  ]);
  /* @arkzen:endpoint:php:echo:end */

  /* @arkzen:endpoint:ts:echo
  */
  const input = request.all()
  const record = await ProbeResult.create({
    source: 'endpoint-body',
    probe: 'echo',
    payload: JSON.stringify(input),
    result: `Echoed ${Object.keys(input).length} field(s) — ControllerBuilder v7.0 body injection ✓`,
    ok: true,
  })
  return response.json({
    injected: true,
    builder: 'ControllerBuilder v7.0',
    method: 'echo',
    field_count: Object.keys(input).length,
    echo: input,
    probe_id: record.id,
  })
  /* @arkzen:endpoint:ts:echo:end */
  ```

  **Real Expo/RN import pairs** — from `hello-native`:

  ```
  /* @arkzen:native:components:shared */

  /* @arkzen:import:expo */
  import React, { useState } from 'react'
  import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
  } from 'react-native'
  import { useRouter } from 'expo-router'
  /* @arkzen:import:expo:end */

  /* @arkzen:import:rn */
  import React, { useState } from 'react'
  import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
  } from 'react-native'
  /* @arkzen:import:rn:end */

  export const Badge = ({ label }: { label: string }) => (
    <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
      <Text className="text-xs font-semibold text-indigo-600 tracking-wide">
        {label}
      </Text>
    </View>
  )

  /* @arkzen:native:components:shared:end */
  ```

  `hello-native` also contains the separate `native:components:lynx:*` and `native:page:lynx:*` forms. Do not copy React Native elements or imports into those Lynx blocks.

  ### Example A — Minimal web + backend tatemono

  ```
  /* @arkzen:meta
  name: task-board
  version: 1.0.0
  description: Minimal task list
  auth: false
  */

  /* @arkzen:meta:web
  favicon: ✅
  title: Task Board
  description: A tiny task board.
  */

  /* @arkzen:database:tasks
  table: tasks
  timestamps: true
  columns:
    id:
      type: integer
      primary: true
      autoIncrement: true
    title:
      type: string
      length: 255
      nullable: false
    done:
      type: boolean
      default: false
  seeder:
    count: 1
    data:
      - title: "First task"
        done: false
  */

  /* @arkzen:api:tasks
  model: Task
  controller: TaskController
  prefix: /api/task-board/tasks
  middleware: []
  resource: true
  endpoints:
    index:
      method: GET
      route: /
      description: List tasks
      response:
        type: paginated
    store:
      method: POST
      route: /
      description: Create a task
      validation:
        title: required|string|max:255
      response:
        type: single
    update:
      method: PUT
      route: /{id}
      description: Update a task
      validation:
        title: sometimes|string|max:255
        done: sometimes|boolean
      response:
        type: single
    destroy:
      method: DELETE
      route: /{id}
      description: Delete a task
      response:
        type: message
        value: Task deleted
  */

  /* @arkzen:web:components:shared */

  'use client'

  import React, { useState, useEffect } from 'react'
  import { Plus, Trash2, Loader2 } from 'lucide-react'
  import { arkzenFetch } from '@/arkzen/core/stores/authStore'

  export type TaskItem = { id: number; title: string; done: boolean }

  export const useTasks = () => {
    const [tasks, setTasks] = useState<TaskItem[] | null>(null)
    const load = async () => {
      try {
        const res = await arkzenFetch('/api/task-board/tasks')
        const d = await res.json()
        setTasks(d?.data ?? [])
      } catch { setTasks([]) }
    }
    useEffect(() => { load() }, [])
    return { tasks, load }
  }

  /* @arkzen:web:components:shared:end */

  /* @arkzen:web:page:index */
  /* @arkzen:web:page:layout:guest */

  const IndexPage = () => {
    const { tasks, load } = useTasks()
    const [title, setTitle] = useState('')
    const add = async () => {
      if (!title.trim()) return
      await arkzenFetch('/api/task-board/tasks', { method: 'POST', body: JSON.stringify({ title }) })
      setTitle('')
      load()
    }
    if (!tasks) return <Loader2 size={24} />
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-3xl font-bold">Task Board</h1>
        <div className="mt-4 flex gap-2">
          <input value={title} onChange={e => setTitle(e.target.value)} className="flex-1 border rounded px-3 py-2" />
          <button onClick={add} className="px-4 py-2 rounded bg-black text-white"><Plus size={16} /></button>
        </div>
        <ul className="mt-6 space-y-2">
          {tasks.map(t => <li key={t.id} className="border rounded p-3">{t.title}</li>)}
        </ul>
      </main>
    )
  }

  /* @arkzen:web:page:index:end */
  ```

  ### Example B — Native-only tatemono (Expo + bare React Native)

  The shared native DSL and UI can target both stacks, but navigation APIs differ. Keep shared components stack-neutral and use paired `@arkzen:import:expo` / `@arkzen:import:rn` blocks for imports and code that differs by stack. This follows the shipped `hello-native` fixture.

  ```
  /* @arkzen:meta
  name: hello-native
  version: 1.0.0
  description: Native-only starter.
  auth: false
  */

  /* @arkzen:meta:native
  label: Hello Native
  expo:
    bundle_id: com.arkzen.hellonative
    scheme: hellonative
    version: 1.0.0
    orientation: portrait
    status_bar_style: dark
  */

  /* @arkzen:native:config
  theme:
    primary: "#6366f1"
    background: "#fafaf9"
  */

  /* @arkzen:native:components:shared */

  /* @arkzen:import:expo */
  import React from 'react'
  import { View, Text, TouchableOpacity } from 'react-native'
  /* @arkzen:import:expo:end */

  /* @arkzen:import:rn */
  import React from 'react'
  import { View, Text, TouchableOpacity } from 'react-native'
  /* @arkzen:import:rn:end */

  export const PrimaryButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} className="rounded-2xl py-4 px-6 items-center bg-indigo-500">
      <Text className="text-white font-semibold">{label}</Text>
    </TouchableOpacity>
  )

  /* @arkzen:native:components:shared:end */

  /* @arkzen:native:page:index */
  /* @arkzen:native:page:layout:default */

  /* @arkzen:import:expo */
  import React from 'react'
  import { View, Text } from 'react-native'
  import { useRouter } from 'expo-router'
  /* @arkzen:import:expo:end */

  /* @arkzen:import:rn */
  import React from 'react'
  import { View, Text } from 'react-native'
  import { useNavigation } from '@react-navigation/native'
  /* @arkzen:import:rn:end */

  const IndexScreen = () => {
    /* @arkzen:import:expo */
    const router = useRouter()
    /* @arkzen:import:expo:end */
    /* @arkzen:import:rn */
    const navigation = useNavigation<any>()
    /* @arkzen:import:rn:end */
    return (
      <View className="flex-1 bg-neutral-50 px-6 pt-14">
        <Text className="text-4xl font-bold">Hello, Native 👋</Text>
        <PrimaryButton label="Go to About" onPress={() => {
          /* @arkzen:import:expo */
          router.push('/hello-native/about' as any)
          /* @arkzen:import:expo:end */
          /* @arkzen:import:rn */
          navigation.navigate('hello-native/about' as never)
          /* @arkzen:import:rn:end */
        }} />
      </View>
    )
  }

  /* @arkzen:native:page:index:end */

  /* @arkzen:native:page:about */
  /* @arkzen:native:page:layout:default */

  /* @arkzen:import:expo */
  import React from 'react'
  import { View, Text } from 'react-native'
  import { useRouter } from 'expo-router'
  /* @arkzen:import:expo:end */

  /* @arkzen:import:rn */
  import React from 'react'
  import { View, Text } from 'react-native'
  import { useNavigation } from '@react-navigation/native'
  /* @arkzen:import:rn:end */

  const AboutScreen = () => {
    /* @arkzen:import:expo */
    const router = useRouter()
    /* @arkzen:import:expo:end */
    /* @arkzen:import:rn */
    const navigation = useNavigation<any>()
    /* @arkzen:import:rn:end */
    return (
      <View className="flex-1 bg-neutral-50 px-6 pt-14">
        <Text className="text-2xl font-bold">About</Text>
        <PrimaryButton label="Back" onPress={() => {
          /* @arkzen:import:expo */
          router.back()
          /* @arkzen:import:expo:end */
          /* @arkzen:import:rn */
          navigation.goBack()
          /* @arkzen:import:rn:end */
        }} />
      </View>
    )
  }

  /* @arkzen:native:page:about:end */
  ```

  (For a Lynx build of the same app add `native:components:lynx:shared` and `native:page:lynx:index` blocks — see `hello-native` for the full triple-target file.)

  ### Example C — Auth app with roles

  ```
  /* @arkzen:meta
  name: my-admin
  version: 1.0.0
  auth: true
  auth_seed:
    users:
      - { name: Admin, email: admin@my-admin.com, password: password123, role: admin }
      - { name: User,  email: user@my-admin.com,  password: password123, role: user }
  */

  /* @arkzen:api:reports
  model: Report
  controller: ReportController
  prefix: /api/my-admin/reports
  middleware: [auth, role:admin]
  resource: true
  endpoints:
    index: { method: GET, route: /, description: List reports, response: { type: paginated } }
  */

  /* @arkzen:web:page:login */
  /* @arkzen:web:page:layout:+guest */
  const LoginPage = () => <div>login form → useAuthStore</div>
  /* @arkzen:web:page:login:end */

  /* @arkzen:web:page:dashboard */
  /* @arkzen:web:page:layout:+auth */
  const DashboardPage = () => <div>protected</div>
  /* @arkzen:web:page:dashboard:end */
  ```

  ### Example D — Backend variants (`express-test` shape)

  Shared blocks once, then one variant per backend for every code body. `auth: true` creates per-tatemono users and the `/api/<slug>/auth/*` routes on every backend.

  ```
  /* @arkzen:meta
  name: express-test
  version: 1.0.0
  description: "Exercises the Express backend end to end"
  auth: true
  */

  /* @arkzen:database:tickets
  table: tickets
  timestamps: true
  columns:
    user_id:
      type: foreignId
      nullable: true
    title:
      type: string
      length: 255
    status:
      type: string
      length: 30
      default: open
  */

  /* @arkzen:api:tickets
  model: Ticket
  controller: TicketController
  prefix: /api/express-test
  middleware: [auth:sanctum]
  policy: true
  endpoints:
    index:  { method: GET, route: /tickets, description: List tickets, response: { type: collection } }
    stats:  { method: GET, route: /stats,   description: Custom endpoint, response: { type: single } }
  */

  /* @arkzen:endpoint:ts:stats
  */
  const total = await Ticket.count()
  return response.json({ total })
  /* @arkzen:endpoint:ts:stats:end */

  /* @arkzen:endpoint:php:stats
  */
  return response()->json(['total' => \App\Models\Arkzen\ExpressTest\Ticket::count()]);
  /* @arkzen:endpoint:php:stats:end */
  ```

  With `activeBackend: express` only the `:ts` block is read; with `laravel` only the `:php` block. If you delete the `:php` block, the tatemono is reported inactive on Laravel but keeps working on Express. The same shape extends to `:py`, `:java`, `:cs`, `:go` and `:rs` (Section 1F has one endpoint written in all seven).

  * * *

  ## ⚠️ SECTION 28B — KNOWN ENGINE QUIRKS (verify after building)

  These come from reading the engine source. They are not hypothetical — but test them in your build before relying on them, and fix the engine or the doc when resolved.

  1. **Backend-specific `foreign:` names vs auto relations.** The migration builder uses `foreign:` literally as the table name. Use the physical name required by the active backend: prefixing engines may require `queue_flow_queues.id`, while Go/Rust use the declared table name in each tatemono's isolated database. The model builder may match `foreign:` against the raw table name when generating `belongsTo`/`hasMany`, so generated relation methods can differ. Check generated models/migrations for the active backend.
  2. **`type: enum` is unsupported.** The migration builder turns unknown types into `string` and ignores `values:`; use `type: string` with validation rules for allowed values. The shared parser accepts `foreignId`, slug-prefixed foreign keys, markerless legacy native blocks, and guarded layout chains. The separate Expo frontend validator currently requires explicit Expo/RN import pairs on native blocks, although the Expo generator retains markerless legacy support; use explicit pairs for new native code.
  3. **`command_run`, `job_dispatch`, `event_fire` endpoint types are hardcoded** to the test tatemonos' command/job/event names. Use custom endpoint bodies for real apps.
  4. **Plural `@arkzen:listeners:` blocks (legacy)** in `events-test` are not read; bodies come from singular `@arkzen:listener:`.
  5. **Lynx page layout line.** Parser: `@arkzen:native:page:lynx:layout:<name>`. `layout-test` uses `@arkzen:native:page:layout:<name>` in Lynx pages.
  6. **Mail/notification/job class names append a suffix** to the studly identifier (`welcome-mail` → `WelcomeMailMail`). Prefer short identifiers (`welcome`).
  7. **`type: enum`** appears in `queue-flow` but is silently a `string` column; `values:` is ignored.
  8. **Update migrations add new columns only** — they never alter or drop existing columns.
  10. **Table/model warnings are heuristics.** The validator appends a literal `s` when suggesting a table name, so `Inventory` is reported as expecting `inventorys` even when the declared table is `inventories`; the Laravel model builder writes its table explicitly. Singular `send_log` and `event_log` also warn because plural snake_case is preferred. These are warnings, not parse errors; keep table declarations and raw SQL references aligned if renaming.
  11. **Native validation must be target-aware.** A target-neutral validator may see both Expo and bare-RN variants before the builder filters them, causing false duplicate-page errors for the same route. Validate using the active native target; the generators filter the other target's import pair.

  12. **Backend is project-level and variants are per block.** A tatemono that has code bodies only for `:php` is *inactive* (not broken) on Express or FastAPI. The validator message names the missing `:<variant>` block. Check which backend is active (`node mizumi.js stack`) before debugging a "missing endpoint".
  13. **Backend variant coverage.** Tatemonos intended to run on Laravel, Express, and FastAPI carry explicit `:php`, `:ts`, and `:py` variants for every body-bearing block. Shared YAML-only backend blocks remain unsuffixed. `express-test-2` and `fastapi-test` are the backend-specific parity fixtures.
  14. **`react-inertia` forces `laravel-inertia`.** `node mizumi.js backend <n>` refuses any backend other than Laravel while that web stack is active (switch the web stack first with `node mizumi.js web <stack>`).
  15. **Express compatibility boundary:** Express must match the Laravel builders/runtime features Pluff uses or exposes through its DSL, including streaming SSE, uploads, resources, factories, queues, commands, events, mail, notifications, and realtime. Laravel facilities outside that integration (for example unrelated framework internals) are out of scope. If a Laravel feature used by a Pluff builder behaves differently on Express, treat it as a parity bug.
  16. **Realtime channel authorization:** Express authorizes private/presence subscriptions using each declared channel pattern and its `auth` value (`authenticated`, `owner`, or `admin`). `owner` requires a matching placeholder, such as `{id}`. Public channels are subscribed to without channel authorization.
  17. **Two copies of the engine core.** `backends.ts` / `parser.ts` / `validator.ts` exist under `engine/shared/arkzen/engine-core/` and again in each frontend's `arkzen/core/` folder, and `mizumi.js` keeps its own copy of the backend → variant map for display. A suffix rename or new backend must be changed in all of them.
  18. **Rust handlers load through `node start.js`.** Generated `:rs` bodies are compiled and the backend restarts once to load them, so run the backend through `node start.js`.
  19. **ASP.NET Core compiles bodies lazily.** A C# syntax error appears as an HTTP 500 on first call, not as a build failure. Built-in upload endpoint types use local storage; jobs and events are in-process and not durable, and cron scheduling is not implemented.
  20. **Spring Boot jobs, events and schedules are in memory.** Queued work is lost on restart, scheduled commands use an in-process minute cron, and the PostgreSQL path is untested.
  21. **Raw SQL table names differ by variant.** `:cs` uses the prefixed name, `:go` and `:rs` helpers use bare names in the shipped fixtures (Section 1G).
  22. **`django` maps to `:py` in `backends.ts` but there is no Django engine.** Do not select it.
  23. **Legacy unsuffixed code is `:php`.** `events-test` still carries unsuffixed PHP `endpoint:index` and `endpoint:clearLog` bodies next to the suffixed variants. Convert them to `:php` when touching the file.
  24. **`@arkzen:module:rs` is read only on Rust, at most once per file.** A second block or a missing `:end` marker throws in the bridge, and the tag validator does not check it.
  25. **Adding or renaming a backend touches several files.** `backends.ts` (tokens and map), `backend-bridge.ts` (`backendLabel`), `mizumi.js` (`BACKEND_TARGETS` and its aliases), `setup.js` and `export.js` (per-backend branches), plus the copies of `backends.ts` / `parser.ts` / `validator.ts` listed in item 17.

  * * *

  ## SECTION 27 — ACTIVE TATEMONOS (46)

  Format: `name vVersion auth | web pages | native (Expo/RN) screen count | Lynx page count | backend variants carried`. "shared only" means no code bodies, so the tatemono is active on every backend. "all 7" means `:php :ts :py :java :cs :go :rs`.

  ```
  animation-lab           v1.0.0   auth:false web:index                                 native:0  lynx:1  backends: shared only
  aspnet-ledger           v2.0.0   auth:false web:index                                 native:0  lynx:0  backends: cs
  aspnet-test             v2.0.0   auth:true  web:index                                 native:0  lynx:0  backends: cs
  asset-hub               v2.1.0   auth:false web:index                                 native:1  lynx:1  backends: shared only
  atelier                 v1.0.0   auth:false web:index                                 native:1  lynx:0  backends: shared only
  auth-test               v1.0.0   auth:true  web:login,register,dashboard              native:3  lynx:3  backends: shared only
  body-endpoint-handler   v1.0.0   auth:false web:index                                 native:1  lynx:1  backends: all 7
  body-mail-notification  v1.0.0   auth:true  web:login,register,dashboard              native:3  lynx:3  backends: all 7
  broadcast-test          v2.0.0   auth:true  web:login,register,dashboard              native:3  lynx:3  backends: shared only
  cafe-teresita           v3.0.0   auth:false web:index                                 native:0  lynx:0  backends: shared only
  crud-test               v1.0.0   auth:false web:index                                 native:1  lynx:1  backends: all 7
  dtr-geofencing          v2.0.0   auth:false web:index,admin                           native:2  lynx:0  backends: all 7
  errors-test             v1.2.0   auth:false web:index                                 native:1  lynx:1  backends: shared only
  ethan-pool              v1.0.1   auth:false web:index                                 native:0  lynx:0  backends: shared only
  ethereane               v2.0.2   auth:false web:index                                 native:0  lynx:0  backends: shared only
  events-test             v1.0.0   auth:false web:index                                 native:1  lynx:1  backends: all 7
  express-test            v1.0.0   auth:true  web:index                                 native:0  lynx:0  backends: ts+rs
  express-test-2          v1.0.0   auth:true  web:index                                 native:0  lynx:0  backends: ts
  fastapi-test            v1.0.0   auth:true  web:index                                 native:0  lynx:0  backends: py
  go-backend-test         v1.0.0   auth:false web:index                                 native:0  lynx:0  backends: shared only
  go-concurrency-lab      v1.0.0   auth:false web:index                                 native:0  lynx:0  backends: shared only
  hello-native            v1.0.0   auth:false web:-                                     native:2  lynx:2  backends: shared only
  hw-coffee               v2.0.0   auth:false web:index                                 native:0  lynx:0  backends: shared only
  inventory-management    v2.0.0   auth:false web:index                                 native:1  lynx:1  backends: all 7
  jo-payroll              v2.0.0   auth:false web:index,job-database,cash-atm,sss,+3    native:5  lynx:5  backends: all 7
  job-test                v1.0.0   auth:false web:dashboard                             native:1  lynx:1  backends: all 7
  kotoba                  v1.0.0   auth:true  web:index,login,register,dashboard,+8     native:12 lynx:0  backends: all 7
  lain098                 v4.0.0   auth:false web:index                                 native:0  lynx:0  backends: shared only
  layout-test             v1.0.0   auth:false web:index,panel,deep,guard-auth,+3        native:6  lynx:7  backends: shared only
  mail-test               v2.0.0   auth:true  web:login,register,dashboard              native:3  lynx:3  backends: all 7
  middleware-test         v2.1.0   auth:false web:index                                 native:1  lynx:1  backends: all 7
  mobile-sdui             v1.0.0   auth:false web:-                                     native:2  lynx:0  backends: shared only
  new-updates-styles      v2.0.0   auth:false web:index,about,features                  native:3  lynx:3  backends: shared only
  notification-test       v2.1.0   auth:true  web:login,register,dashboard              native:3  lynx:3  backends: all 7
  ollama-studio           v1.0.0   auth:false web:index                                 native:0  lynx:0  backends: py
  portfolio-test          v1.0.0   auth:false web:index                                 native:1  lynx:1  backends: shared only
  queue-flow              v1.0.0   auth:false web:index,join,admin                      native:0  lynx:0  backends: all 7
  roles-test              v2.1.0   auth:true  web:login,register,dashboard              native:3  lynx:3  backends: all 7
  rust-backend-test       v1.0.0   auth:false web:index                                 native:0  lynx:0  backends: shared only
  scheduler-test          v2.0.0   auth:false web:dashboard                             native:1  lynx:1  backends: all 7
  shan-shan               v2.0.0   auth:false web:index                                 native:0  lynx:0  backends: shared only
  shikaku                 v1.0.0   auth:true  web:login,register,index,editor           native:0  lynx:0  backends: shared only
  spring-ledger           v1.0.0   auth:false web:index                                 native:0  lynx:0  backends: java
  spring-test             v1.0.0   auth:false web:index                                 native:0  lynx:0  backends: shared only
  upload-test             v1.0.0   auth:false web:dashboard                             native:1  lynx:1  backends: shared only
  visual-lab              v1.0.0   auth:false web:index                                 native:0  lynx:0  backends: shared only
  ```

  Good references when generating: `hello-native` (native starter), `queue-flow` (routes + handlers + realtime), `roles-test` (auth + roles), `crud-test` (api + policy), `upload-test` (upload types), `layout-test` (layout chains), `scheduler-test` (console), `job-test` (jobs), `events-test` (events), `new-updates-styles` (styles), `animation-lab` (Expo/RN/Lynx animation + scripts + errors). `express-test` (backend variants: `:ts` + `:php`). Per-backend fixtures: `fastapi-test` (`:py`), `spring-test` and `spring-ledger` (`:java`), `aspnet-test` and `aspnet-ledger` (`:cs`), `go-backend-test` and `go-concurrency-lab` (Go), `rust-backend-test` (Rust), `ollama-studio` (AI chat through FastAPI). `body-endpoint-handler`, `crud-test`, `middleware-test`, `job-test`, `scheduler-test`, `events-test`, `mail-test`, `notification-test`, `roles-test` and `queue-flow` carry all seven variants and are the best references for translating one body across backends. `mobile-sdui` is a mobile-only server-driven UI demo.

  * * *

  ## SECTION 29 — AI GENERATION CHECKLIST

  Before finalizing any tatemono, verify:

  **META**
  - [ ] `@arkzen:meta` first; `name` = folder name; `auth_seed` only with `auth: true`
  - [ ] `@arkzen:meta:web` if web pages (favicon/title/description; PWA + og here)
  - [ ] `@arkzen:meta:native` + `@arkzen:native:config` if native screens

  **TAG FORMAT** (follow these shapes; the validator checks only a subset)
  - [ ] Shape A (meta, config, database, api, routes): no `*/` on the opening line, no `:end`
  - [ ] Shape B (jobs, console, notifications, mail, events, realtime): YAML in opening comment, `*/`, body, `:end */`
  - [ ] Shape C (web/native components, layouts, pages, styles, animation, script, error): `*/` on the SAME opening line, `:end */`
  - [ ] Shape D (endpoint, handler, middleware, policy, listener): `*/` alone on the NEXT line, `:end */`
  - [ ] Every closing tag is the full `:end */` of its opening tag (including `:lynx`, `:expo`, `:rn` suffixes)
  - [ ] Page layout line directly after the page opener, no `:end`

  **DATABASE**
  - [ ] One `table:` per block (dict format only); plural snake_case; `columns` present
  - [ ] Types only from the valid list; **no `enum`**; `foreignId` always with `foreign:`
  - [ ] `foreign:` uses the active backend's physical table name (some engines prefix; Go/Rust use declared names); no seeder for children of unseeded parents

  **API**
  - [ ] `model` PascalCase, `controller` ends with `Controller`, `prefix` starts with `/api/`
  - [ ] `description` on every endpoint; `response.type` ∈ paginated | collection | array | single | message
  - [ ] Custom endpoint names have matching `@arkzen:endpoint:php:name` and/or `@arkzen:endpoint:ts:name` bodies; `@arkzen:routes` entries have matching `@arkzen:handler:php:name` and/or `@arkzen:handler:ts:name` bodies — never mix them
  - [ ] Route params in handlers via `$params[n]`
  - [ ] Special `type:` values used only as documented; no `command_run|job_dispatch|event_fire` for real apps
  - [ ] `policy: true` only when matching `@arkzen:policy:php:update|delete` and/or `@arkzen:policy:ts:update|delete` blocks exist

  **BACKEND BLOCKS**
  - [ ] jobs/console bodies are full methods (`handle(): void` / `handle(): int`); console uses `signature` + quoted cron `schedule`
  - [ ] events list `listeners: [...]`; bodies in singular `@arkzen:listener:php:Name` / `@arkzen:listener:ts:Name`
  - [ ] notifications/mail have `:end`; mail uses `subject` + `data:`; short identifiers (class suffix is appended)
  - [ ] realtime: channel registration has no `channel:` key; broadcast event has one; `broadcast()` namespace `\App\Events\Arkzen\{Ns}\Broadcast\{Class}`

  **BACKEND VARIANTS (Section 1E)**
  - [ ] Know the active backend (or ask). Code bodies carry the matching suffix: `:php` (laravel, laravel-inertia), `:ts` (express), `:py` (fastapi), `:java` (spring-boot), `:cs` (aspnet), `:go` (go), `:rs` (rust)
  - [ ] Shared blocks (`meta`, `database`, `api`, `routes`, `realtime`, `events`, YAML-only `jobs` / `console` / `notifications` / `mail`) have **no** suffix
  - [ ] Every `endpoint`, `handler`, `policy`, `middleware`, `listener` and every `jobs` / `console` / `notifications` / `mail` block *with a body* has a suffix, and its closing tag repeats it (`:ts:name:end`)
  - [ ] Each backend you target has a variant for **every** body-carrying block; otherwise the tatemono is inactive there
  - [ ] Unknown backend: only shared constructs, so the tatemono is active on all seven (Section 1G)
  - [ ] `:java` bodies end with `return` and use `mapOf(...)`; `:cs` bodies return an `IResult` and middleware returns `null` to continue; `:go` bodies return `response.JSON(...)` or `response.Error(...)`; `:rs` bodies end with the response as a tail expression (Section 1F)
  - [ ] Go interprets general endpoint and route-handler bodies; middleware, policies, jobs, listeners and console behavior have narrower engine-supported implementations (Section 1F)
  - [ ] At most one `@arkzen:module:rs` block per file, closed with its own `:end`
  - [ ] Raw SQL: `:cs` uses prefixed table names; `:go` and `:rs` fixtures use bare names (Section 1G)
  - [ ] Mail bodies use the backend's placeholder syntax (Section 1F table), or stay YAML-only
  - [ ] `jobs` / `console` variants repeat the YAML header (`queue`, `tries`, `timeout`, `signature`, `schedule`)
  - [ ] `:ts` bodies use `await` for DB calls, `response.json(body, status)`, `request.route('name')` / `params`, and `return next()` in middleware
  - [ ] Express targets use the documented custom equivalents for uploads, `resource` / `factory`, `command_run` / `job_dispatch` / `event_fire`, and streaming SSE
  - [ ] Mail / notification bodies avoided (YAML-only) unless custom content is required; Express mail templates use only the documented safe subset (interpolation, comments, basic conditions, and loops), not arbitrary Blade/PHP

  **WEB**
  - [ ] Put shared imports in components/layouts; Next.js normalizes imports from pages and error blocks, and keeps animation/script imports in their own blocks
  - [ ] Source `'use client'` is supported in components/layout/error:500; page directives are stripped and generated pages receive their own directive
  - [ ] Layouts export `<Name>Layout`, use `useArkzenRouter()`/`useArkzenPathname()`; `parent:` layouts use Shape B
  - [ ] Prefer a page `const` named `<Name>Page`; the generator looks for a `const` ending in `Page` and otherwise falls back to the page name. A simple standalone `export default PageName` is okay but stripped out; preferably omit it because the engine generates the export.
  - [ ] `error:404` = `NotFoundPage`, `error:500` = `ServerErrorPage({ reset })`
  - [ ] Animation function has no `export`, is `camelCase(name)Animations`; `pageVariants` exported; no pinned-ScrollTrigger opacity tweens
  - [ ] `arkzenFetch` result is a `Response` — `await res.json()`, `JSON.stringify` the body; null-safe access everywhere

  **NATIVE (Expo / bare RN)**
  - [ ] Target-specific imports use `@arkzen:import:expo` / `:rn` pairs; the parser extracts these from native blocks, including pages
  - [ ] Native layouts import nothing from `@/arkzen/...` (auth store, `arkzenFetch`, and so on); put that logic in a `native:components` component instead (see 19B)
  - [ ] Prefer a PascalCase screen component (for example, `<Name>Screen`); the generator selects a screen component and wraps/exports it. A simple standalone `export default ScreenName` is okay but stripped out; preferably omit it because the engine generates the export.
  - [ ] Error blocks: one per target; animation/script blocks stack-suffixed (`:expo` | `:rn`); no generic `native:script`
  - [ ] Named styles export their StyleSheet; global `@arkzen:native:style` is CSS-like

  **LYNX**
  - [ ] Only `:lynx` blocks; no Expo/RN import pairs. Page imports are retained and known shared-component imports are generated.
  - [ ] Realtime needs the `type: broadcast` endpoint (SSE bridge); no WebSocket code

  **SCRIPTS**
  - [ ] `@arkzen:web:script[:name]` (never bare `@arkzen:script`); pure TS, `export`ed, no JSX

  * * *

  ## APPENDIX — GODOT 4 GAME DSL

  Godot support is a separate export target, not a web, mobile, desktop, or backend stack. A Godot Tatemono is still a source file under `tatemonos/<name>/core.tsx`, but it uses the Godot marker set below. Export it through:

  ```bash
  node mizumi.js export <name> godot
  # or
  node mizumi.js export
  ```

  The generator writes to `projects/godot/<name>/` and does not read or use the active web stack or backend. Open the generated `project.godot` in Godot 4.

  ### Required blocks

  Every Godot Tatemono must include these blocks:

  - `/* @arkzen:meta */` — standard Pluff metadata. `name` must exactly match the folder name and contain only lowercase letters, digits, and hyphens.
  - `@arkzen:godot:project` — Godot project settings.
  - `@arkzen:godot:scene:<name>` — one or more scene declarations. The project `main_scene` must match a declared scene `path`.
  - `@arkzen:godot:behavior:player` — player GDScript behavior. It must extend `CharacterBody3D` and target a scene different from the main scene.
  - `@arkzen:godot:behavior:camera` — generated camera-follow behavior.
  - `@arkzen:godot:export` — at least one runnable export preset.

  `@arkzen:godot:scene:<name>` and other Godot blocks use a plain comment opening and a matching `:end` comment:

  ```tsx
  /* @arkzen:godot:project
  godot_version: "4.x"
  name: My Godot Game
  main_scene: res://scenes/main.tscn
  renderer: gl_compatibility
  window:
    width: 1280
    height: 720
    resizable: true
  display:
    viewport_width: 640
    viewport_height: 360
    stretch_mode: canvas_items
    pixel_art: true
  */
  /* @arkzen:godot:project:end */
  ```

  ### Project rules

  - `godot_version` must be `4.x` or a Godot 4 minor form such as `4.7`.
  - Supported renderers are `gl_compatibility`, `mobile`, and `forward_plus`.
  - `main_scene` and every scene/instance/script path must be safe `res://...` paths. Scene paths end in `.tscn`; behavior scripts end in `.gd`; `..` and backslashes are invalid.
  - Positive integer `window.width` and `window.height` are supported.
  - `display.stretch_mode` is currently generated when documented by the engine; use `canvas_items` for pixel-style 2D overlays.

  ### Optional and repeated blocks

  - `@arkzen:godot:world` — procedural world data: name, `tile_size`, `grid_width`, `grid_depth`, `block_height`, `world_margin`, seed, `props`, `npcs`, `dialogues`, and optional `visuals`.
  - `@arkzen:godot:input` — mapping of action names to keys. Action names use lowercase letters, digits, and underscores. Use plural key arrays such as `keys: [A, LEFT]`.
  - `@arkzen:godot:assets` — texture assets grouped under `textures`, with `source`, optional `filter`, and optional `alpha`.
  - `@arkzen:godot:multiplayer` — optional ENet host/join and server-authoritative player movement. This feature is opt-in and does not provide matchmaking, accounts, relay servers, or Web export support.
  - Additional `@arkzen:godot:scene:<name>` blocks may be declared when representing separate scenes or instances.

  ```tsx
  /* @arkzen:godot:input
  actions:
    move_left:
      keys: [A, LEFT]
    move_right:
      keys: [D, RIGHT]
    move_up:
      keys: [W, UP]
    move_down:
      keys: [S, DOWN]
    interact:
      keys: [E, ENTER]
    run:
      keys: [SHIFT]
    jump:
      keys: [SPACE]
  */
  /* @arkzen:godot:input:end */
  ```

  ```tsx
  /* @arkzen:godot:assets
  textures:
    player_sheet:
      source: assets/images/character1.png
      filter: nearest
      alpha: true
    ground:
      source: assets/images/tile-grass.png
      filter: nearest
  */
  /* @arkzen:godot:assets:end */
  ```

  Relative asset sources are resolved from the Tatemono directory. Supported asset categories include images, audio, fonts, models, videos, and JSON/XML/YAML/TOML/CSV data by file extension. Copy only declared assets; missing optional assets produce generator warnings, while missing required assets can fail export.

  ### World visuals and interaction

  The optional `visuals` mapping in `@arkzen:godot:world` configures the generated shader sky and `WorldEnvironment`. Texture values refer to names declared in `@arkzen:godot:assets`.

  ```yaml
  visuals:
    sky:
      zenith_color: "#1565c0"
      horizon_color: "#e1f5fe"
      gradient_texture: sky_layer_0
      cloud_layers: [sky_layer_1, sky_layer_2, sky_layer_3]
      cloud_speed: 0.004
      sun_azimuth: -35
      sun_elevation: 35
      ray_strength: 0.14
    fog:
      color: "#e1f5fe"
      density: 0.0006
      volumetric: true
      volumetric_density: 0.0012
    lighting:
      ambient_color: "#c8e8ff"
      ambient_energy: 0.72
    post_processing:
      tonemap: aces
      glow: true
      glow_intensity: 0.55
      bloom: 0.08
      ssao: true
      ssao_radius: 1.5
      ssao_intensity: 1.15
      ssil: false
      ssil_radius: 5.0
      ssil_intensity: 0.35
      ssr: true
      ssr_max_steps: 96
      ssr_depth_tolerance: 0.2
  ```

  - `sky.zenith_color` and `sky.horizon_color` are `#RRGGBB` colors. `gradient_texture`, when present, must name a declared texture.
  - `sky.cloud_layers` is optional and accepts up to three declared texture names. `sky.cloud_speed` is optional and must be between 0 and 1. `sun_azimuth` (-360 to 360 degrees), `sun_elevation` (-90 to 90 degrees), and `ray_strength` (0 to 2) control the shader sun, halo, and rays.
  - `fog.color` is an optional `#RRGGBB` color; `fog.density` and `volumetric_density` must be non-negative. Volumetric fog requires the `forward_plus` renderer and a `DirectionalLight3D` with volumetric fog energy enabled.
  - `lighting.ambient_color` is an optional `#RRGGBB` color; `lighting.ambient_energy` must be non-negative.
  - `post_processing.tonemap` accepts `linear`, `reinhardt`, `filmic`, or `aces`. `glow`, `ssao`, `ssil`, and `ssr` are optional booleans. Their intensity/radius fields, `ssr_depth_tolerance`, and `bloom` are optional non-negative numbers; `ssr_max_steps` must be a positive integer. Volumetric fog, SSAO, SSIL, SSR, and glow require `renderer: forward_plus`; they do not run in Compatibility mode.
  - The generated Godot environment supports ACES tone mapping, multi-level bloom, screen-space ambient occlusion/indirect lighting/reflections, and volumetric light scattering. Its sky is rendered as a real Godot sky background (not a large mesh); this keeps it behind scene objects at every camera distance. Use restraint with fog and bloom to preserve contrast and avoid washing out pixel-art textures.

  NPC conversation input can be configured under `world.npcs`:

  ```yaml
  npcs:
    count: 10
    spawn_range: 14
    interact_radius: 1.2
    speed: 0.025
    wander_min: 60
    wander_max: 240
    interact_action: interact
  dialogues:
    - ["Hello, traveler.", "Welcome to this place."]
  ```

  `interact_action` is optional and must name an action declared in `@arkzen:godot:input`. `dialogues` is an optional list of lists of strings. The generated world animates wandering NPCs, shows a nearby interaction prompt and dialogue panel, pauses player movement during dialogue, and displays a live minimap.

  ### Scene declarations

  Supported root and child node types include `Node`, `Node2D`, `Node3D`, `WorldEnvironment`, `DirectionalLight3D`, `MeshInstance3D`, `StaticBody3D`, `CharacterBody3D`, `CollisionShape3D`, `Camera3D`, `Sprite3D`, and `AnimatedSprite3D`.

  Supported mesh and shape types are limited to `PlaneMesh`, `BoxMesh`, `CapsuleMesh`, `SphereMesh`, `CylinderMesh`, `BoxShape3D`, and `CapsuleShape3D`.

  ```tsx
  /* @arkzen:godot:scene:player
  path: res://scenes/player.tscn
  root:
    name: Player
    type: CharacterBody3D
    properties:
      position: [0, 0.5, 0]
  components:
    - type: CollisionShape3D
      name: PlayerCollision
      shape:
        type: CapsuleShape3D
        radius: 0.25
        height: 0.9
    - type: AnimatedSprite3D
      name: Sprite
      texture: player_sheet
      position: [0, 0.25, 0]
      pixel_size: 0.03125
      billboard: enabled
      animation:
        columns: 6
        rows: 8
        directions: [down, left, right, up]
        idle_row_offset: 0
        walk_row_offset: 4
        frames_per_second: 8
        run_frames_per_second: 20
  */
  /* @arkzen:godot:scene:player:end */
  ```

  For `AnimatedSprite3D`, `columns` and `rows` must be positive integers. `directions` must be a non-empty list. `idle_row_offset`, `walk_row_offset`, and optional `run_row_offset` must stay within the sprite-sheet rows. `run_row_offset` defaults to `walk_row_offset`; `run_frames_per_second` defaults to 1.65 times `frames_per_second`. When `movement.run_action` is configured, the generated controller plays `run_<direction>` while that input is held, using the walk row by default or the configured run row. `pixel_size` scales each source pixel in world units; tune the sprite's local `position` to align its feet with the ground. Scene instances must reference a declared scene path.

  ### Behavior declarations

  The player behavior uses this shape:

  ```tsx
  /* @arkzen:godot:behavior:player
  script: res://scripts/player.gd
  scene: res://scenes/player.tscn
  language: gdscript
  extends: CharacterBody3D
  movement:
    input: [move_left, move_right, move_up, move_down]
    speed: 4.0
    run_action: run
    run_multiplier: 1.65
    jump_action: jump
    jump_velocity: 6.5
    acceleration: 18
    deceleration: 24
    camera_relative: true
    normalize_diagonal: true
    gravity: project_default
  animation:
    moving: walk_{direction}
    idle: idle_{direction}
    facing_priority: dominant_axis
  */
  /* @arkzen:godot:behavior:player:end */
  ```

  `language` must be `gdscript`; `extends` must be `CharacterBody3D`; movement input names should match declared `@arkzen:godot:input` actions. Optional `movement.run_action` names a declared input action and `movement.run_multiplier` scales movement speed while it is held. `movement.camera_relative` is an optional boolean, defaults to `false`, and makes player movement and sprite facing follow the active camera when enabled. Optional `movement.jump_action` must name a declared input action and requires `gravity: project_default`; `jump_velocity` requires `jump_action` and defaults to `6.5`. Optional positive `movement.acceleration` and `movement.deceleration` set horizontal speed ramp-up and slowdown rates; unspecified rates retain immediate movement for that phase. The camera behavior uses `script`, `node`, `target`, `projection`, `follow.offset`, `follow.smoothing`, and optional `look_at.target_offset`. Its optional `zoom` mapping supports positive `min_distance`, `max_distance`, `step`, and `mouse_sensitivity`, plus `min_pitch` and `max_pitch` in radians with `0 <= min_pitch < max_pitch <= PI`. Mouse wheel changes distance and right-drag orbits the camera.

  ### Optional ENet multiplayer

  Add this block to enable a generated Host/Join/Leave panel and direct-IP co-op:

  ```tsx
  /* @arkzen:godot:multiplayer
  enabled: true
  port: 24567
  max_clients: 8
  sync_rate: 20
  default_address: 127.0.0.1
  */
  /* @arkzen:godot:multiplayer:end */
  ```

  `enabled` may only be `true`. `port` is an integer from 1024 to 65535 (default 24567), `max_clients` is 1–64 (default 8), `sync_rate` is 1–60 updates per second (default 20), and `default_address` is a non-empty host/IP string used to prefill the Join field. The generated ENet host simulates player movement and broadcasts positions; clients send input rather than authoritative positions. The main scene must contain exactly one instance of the player scene. Both peers must run compatible builds. Joining across the internet may require the host to allow/forward the configured UDP port; this feature has no matchmaking, accounts, relay, or encryption layer and must not be used for trusted competitive play. ENet multiplayer is not supported by this generated Web preset; disable it with `runnable: false` or omit that export preset.

  Do not invent arbitrary GDScript methods or DSL markers. The current validator supports generated player and camera behaviors, plus the optional generated multiplayer manager; custom behavior names are rejected.

  ### Export presets

  ```tsx
  /* @arkzen:godot:export
  presets:
    windows:
      runnable: true
    linux:
      runnable: true
    macos:
      runnable: true
    web:
      runnable: true
  */
  /* @arkzen:godot:export:end */
  ```

  Supported preset keys are `windows`, `linux`, `macos`, and `web`. Each preset must set boolean `runnable: true|false`. The generator writes platform keys under `[preset.*.options]`, so include the runnable presets rather than manually creating export preset files.

  ### AI generation rules

  - Copy the exact marker opening and matching `:end` comment format.
  - Keep all YAML block bodies valid YAML mappings.
  - Do not treat Godot DSL blocks as ordinary web/frontend or backend blocks; the Godot exporter ignores backend variants and active web/backend state.
  - Do not add unsupported nodes, behavior names, renderer values, preset names, or arbitrary scene properties.
  - Declared assets must exist under the Tatemono folder before export; use paths relative to `tatemonos/<name>/`.
  - Every instance and behavior scene reference should point to a declared `res://scenes/*.tscn` path.
  - If changing the generator itself, add regression coverage under `engine/game/godot/generator.test.js` and regenerate the godot-game fixture before committing.
  - Generate in Godot 4 syntax: prefer explicit typed variables in generated GDScript, and never shadow the `_physics_process(delta: float)` parameter with another local named `delta`.
  - Use `node mizumi.js export <name> godot` for a direct isolated export. Do not use this for mobile or desktop screenshot automation; Godot is an export-only game category for now.

  Reference implementation: `tatemonos/godot-game/core.tsx` and `engine/game/godot/generator.js`.

  **GODOT CHECKLIST**
  - [ ] Standard `@arkzen:meta` name matches the Tatemono folder.
  - [ ] A required `godot:project` block is present and valid.
  - [ ] At least one `godot:scene:<name>` block declares a path equal to `main_scene`.
  - [ ] Required `godot:behavior:player` and `godot:behavior:camera` blocks use `gdscript`.
  - [ ] Player extends `CharacterBody3D` and references a scene distinct from the main scene.
  - [ ] Scene node types, mesh types, shape types, and `res://` paths pass the validator.
  - [ ] Animated sprite dimensions, rows, offsets, and directions are valid.
  - [ ] Input action names and movement animation references are consistent.
  - [ ] Asset paths exist and use supported extensions.
  - [ ] Optional world visual textures are declared; colors and numeric settings use supported values.
  - [ ] Optional NPC `interact_action` references a declared input action and dialogue values are lists of strings.
  - [ ] `movement.camera_relative`, when present, is a boolean.
  - [ ] Optional run actions are declared in `godot:input`, and run sheet rows/speeds fit the animation data.
  - [ ] Optional jump actions are declared in `godot:input`; jumping uses project-default gravity.
  - [ ] Optional acceleration and deceleration values are positive, and camera zoom limits are valid.
  - [ ] Optional multiplayer settings are in range and ENet games do not enable the Web export preset.
  - [ ] Export presets contain only supported platform keys and boolean `runnable` values.
  - [ ] Every opening marker closes with the exact matching `/* @arkzen:<marker>:end */`.

  * * *

  ## APPENDIX — UNITY GAME DSL

  Unity support is a standalone export target. A Unity game Tatemono still lives in `tatemonos/<name>/core.tsx`, but does not need web/native pages or a backend. Export with:

  ```sh
  node mizumi.js export dino-runner unity
  # or
  node export.js dino-runner --stack=unity
  # general Unity-native scene Tatemono
  node mizumi.js export unity-scene-starter unity
  ```

  The generator writes a complete Unity Editor project to `projects/unity/<name>/`. Unity Editor is not required to generate files, but is required to import, preview, or build the project. Generated projects include the main scene, C# gameplay script, SVG source art, Package Manager dependencies, a Windows build entry point, and a GameCI workflow template.

  Unity now has two game modes: `dino_runner` keeps the compact runner template, while `mode: scene` generates general Unity-native 2D/3D scenes. The latter is the extensible path for game projects; neither mode translates Godot GDScript or the Godot DSL.

  ### Runner template mode

  The runner template uses the `dino_runner` game type. The project declaration takes a Unity editor version and optional desktop resolution/SVG scale:

  ```tsx
  /* @arkzen:unity:project
  unity_version: 6000.0.38f1
  name: Pluff Dino Runner
  width: 1280
  height: 720
  pixels_per_unit: 100
  */

  /* @arkzen:unity:game
  type: dino_runner
  dinosaur: dino
  obstacle: cactus
  jump_key: Space
  gravity: -30
  jump_velocity: 12.5
  ground_y: -2
  scroll_speed: 7.5
  spawn_interval_min: 1.1
  spawn_interval_max: 2
  */

  /* @arkzen:unity:visuals
  background_color: "#b3e0f5"
  ground_color: "#338a4f"
  dinosaur_tint: "#ffffff"
  obstacle_tint: "#ffffff"
  camera_size: 5
  ground_thickness: 0.22
  ground_width: 24
  dinosaur_size: 1.75
  obstacle_width: 0.9
  obstacle_height: 1.25
  */

  /* @arkzen:unity:controls
  restart_key: R
  pointer_enabled: true
  */

  /* @arkzen:unity:assets
    dino:
      source: assets/dino.svg
    cactus:
      source: assets/cactus.svg
  */
  ```

  `unity_version` must be a full explicit editor version such as `6000.0.38f1`. The supported game type is `dino_runner`. `dinosaur` and `obstacle` must name declared SVG assets. `jump_key` is one of Unity's supported `KeyCode` names: `Space`, `UpArrow`, `W`, `Z`, or `Return`. Gravity must be negative; jump velocity, scroll speed, and spawn intervals must be positive; maximum spawn interval cannot be smaller than minimum. The display width, height, and pixels-per-unit are positive integers and default to 1280, 720, and 100. SVGs are imported through `com.unity.vectorgraphics` and must exist inside the Tatemono's `assets/` directory.

  Optional `@arkzen:unity:visuals` settings configure `background_color`, `ground_color`, `dinosaur_tint`, and `obstacle_tint` as `#RRGGBB`; `camera_size`, `ground_thickness`, `ground_width`, `dinosaur_size`, `obstacle_width`, and `obstacle_height` are positive numbers. These settings affect the generated camera, sprites, and ground. `camera_size` is capped at 20. Optional `@arkzen:unity:controls` supports `restart_key` (`R`, `Return`, `Escape`, or `Backspace`) and `pointer_enabled` (boolean, default `true`). The configured jump key always works; pointer input can be disabled. Both blocks are optional and have the defaults shown above.

  The generated runner uses the configured jump key and, by default, mouse click/tap, scrolls cactus obstacles toward the dinosaur, tracks score, detects collisions, and restarts with the configured key or pointer input.

  ### General scene mode

  Set `mode: scene` in `@arkzen:unity:project` to use the scene generator. It requires `main_scene` as a safe `Assets/Scenes/<name>.unity` path and one or more matching scene blocks. Scenes are described declaratively; the generator creates Unity scene assets, then builds the declared hierarchy and components when the scene starts.

  ```tsx
  /* @arkzen:unity:project
  mode: scene
  unity_version: 6000.0.38f1
  name: My Unity Game
  main_scene: Assets/Scenes/Main.unity
  width: 1280
  height: 720
  */

  /* @arkzen:unity:environment
  ambient_color: "#a9c7d7"
  ambient_intensity: 0.8
  fog_enabled: true
  fog_color: "#c5e0dc"
  fog_density: 0.008
  */

  /* @arkzen:unity:scene:main
  path: Assets/Scenes/Main.unity
  nodes:
    - name: Ground
      type: cube
      position: [0, -0.5, 0]
      scale: [20, 1, 20]
      color: "#456b46"
      components:
        - type: box_collider
          size: [1, 1, 1]
    - name: Player
      type: capsule
      position: [0, 1, 0]
      components:
        - type: character_controller
          speed: 5
          jump_height: 1.6
    - name: Sun
      type: light
      light_type: directional
      rotation: [45, -30, 0]
      intensity: 1.2
      shadows: true
    - name: MainCamera
      type: camera
      main: true
      position: [0, 4, -7]
      components:
        - type: camera_follow
          target: Player
          offset: [0, 4, -7]
          smooth_speed: 8
  */
  /* @arkzen:unity:scene:main:end */

  /* @arkzen:unity:export
  targets: [windows, linux, macos, webgl]
  */
  ```

  Project width/height default to 1280x720. Scene names and object names must be unique within each scene. The main scene path must match exactly one declared scene. Supported object types are `empty`, `cube`, `sphere`, `capsule`, `cylinder`, `plane`, `quad`, `sprite`, `model`, `camera`, and `light`. All objects accept optional `position`, `rotation`, `scale`, and nested `children`; renderable objects accept `color` and `emission` (`#RRGGBB`). Sprite/model references must name a declared asset. Each scene needs exactly one camera with `main: true`. Camera options include `projection: perspective|orthographic`, `field_of_view`, `orthographic_size`, and background `color`.

  `@arkzen:unity:assets` is an optional mapping of asset names to `source: assets/...` paths. Scene mode supports Unity-importable image/SVG, model, and audio formats. Assets are copied into `Assets/Resources/` under their logical names; SVG sprites require the Vector Graphics package. Files must exist within the Tatemono's assets folder and be regular files.

  `@arkzen:unity:environment` optionally accepts `ambient_color`, `ambient_intensity`, `fog_enabled`, `fog_color`, and `fog_density`. Lights are scene objects with `light_type: directional|point|spot`, `intensity`, `range`, `spot_angle`, `shadows`, and optional color.

  Supported scene components:

  - `box_collider` (`size`, `center`), `sphere_collider` (`radius`, `center`), and `capsule_collider` (`radius`, `height`, `center`) configure 3D collision shapes; `rigidbody` sets `mass`, `use_gravity`, and `is_kinematic`.
  - `character_controller` provides configurable WASD/arrow movement and jumping using Unity's `CharacterController`; `speed`, `jump_height`, `gravity`, `keys`, and `camera_relative` customize it.
  - `rotate` applies local-axis rotation; `camera_follow` follows a named scene object with offset and smoothing.
  - `box_collider_2d` (`size`, `offset`), `circle_collider_2d` (`radius`, `offset`), and `rigidbody_2d` (`body_type`, `gravity_scale`) expose Unity 2D physics.
  - `top_down_controller_2d` and `platform_controller_2d` provide key-configurable Rigidbody2D movement; each requires `rigidbody_2d` and a 2D collider. Top-down dynamic bodies need `gravity_scale: 0` (or use a kinematic body); platformer bodies must be dynamic.
  - `audio_source` configures a declared audio clip, volume, looping, and play-on-awake.

  `@arkzen:unity:export` accepts a non-empty `targets` list from `windows`, `linux`, `macos`, and `webgl`. The generated `PluffBuild` editor script provides a build method for each target, and all declared scenes are included in build settings. Required platform modules must be installed in Unity Editor; the generated GameCI workflow builds the first configured target. Scene graph objects are created at runtime when a scene starts; use Play mode to view the generated hierarchy/gameplay.

  Scene mode is a general, validated base, not an arbitrary Unity API/code escape hatch. The current generator targets Unity's built-in render pipeline and does not generate custom C# scripts, Animator state machines, UI canvases, shader graphs/post-processing, NPC/dialogue systems, or multiplayer. Those remain parity gaps; Unity networking is intentionally deferred.

  ### Unity scene checklist

  - [ ] `@arkzen:meta` name matches the lowercase Tatemono folder.
  - [ ] `@arkzen:unity:project` declares `mode: scene`, a full Unity version, and a main scene path.
  - [ ] Every scene marker has its matching `:end`, a unique name/path, and at least one node.
  - [ ] Each scene has exactly one camera with `main: true`; camera-follow targets exist in that scene.
  - [ ] Node and component types/keys are supported; object names are unique within each scene.
  - [ ] Sprite, model, and audio references use declared assets that exist under `assets/`.
  - [ ] 2D controllers have a Rigidbody2D and a 2D collider; top-down bodies disable gravity or use kinematic mode.
  - [ ] Export targets are from `windows`, `linux`, `macos`, and `webgl`; install matching Unity build modules.
  - [ ] Open the generated project in the configured Unity Editor version and press Play; generated scene objects instantiate at runtime.

  Reference scene project: `tatemonos/unity-scene-starter/core.tsx`; runner reference: `tatemonos/dino-runner/core.tsx`.

  ### Import, build, and CI

  Open the generated project folder in Unity Hub using the exact configured editor version. Allow Package Manager to install Vector Graphics, open `Assets/Scenes/Main.unity`, and press Play. For a Windows build, install Windows Build Support and run:

  ```sh
  Unity -batchmode -quit -projectPath . -executeMethod PluffBuild.BuildWindows -logFile -
  ```

  The generated project includes `.github/workflows/unity-build.yml` for a GameCI Windows build. Before running it, add a valid Unity license to repository Actions secrets as `UNITY_LICENSE` and review GameCI's current license activation instructions. The workflow belongs to the exported Unity project, not the Pluffy source repository. This machine cannot run Unity Editor; generated assets and C# therefore require validation with Unity Editor or CI.

  Reference implementation: `tatemonos/dino-runner/core.tsx`, `engine/game/unity/generator.js`.

  * * *

  _End of PLUFF GUIDELINES v14.0._
