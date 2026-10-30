# Pluff Feature Plan (Temporary)

Working list of the capabilities discussed for Pluff. This is a planning note,
not a claim that these features have already been implemented.

## Backend Targets

Pluff should support multiple backend targets that can build the same Tatemono
definition:

- **Laravel (PHP)** — existing backend target.
- **Express (JavaScript/TypeScript)** — additional backend target.
- **Python** — FastAPI and/or Django target.
- **Java** — Spring Boot target.
- **C#** — ASP.NET Core target.

Each target needs to implement the Tatemono features Pluff supports, including
database models and migrations, APIs, authentication, jobs, events, and other
declared backend behavior.

Other possible targets to consider later: Go, Rust, Ruby, Elixir, Kotlin, Dart,
and Scala. These are candidates, not part of the initial target list.

## Backend DSL: Shared Blocks and Variant Blocks

Laravel is the **reference backend**. Every other backend target imitates what
Laravel does, so the DSL keeps one vocabulary no matter which backend is active.

### Rule

A backend block is either **shared** or a **variant**.

- **Shared:** every backend reads the same block with no translation, either
  because it is pure config or because it uses a syntax every backend
  implements the same way.
- **Variant:** anything else. If a block contains backend-specific code (PHP,
  Blade, and so on), it needs a variant for each backend that should run the
  tatemono.

### Truly shared backend blocks

- `meta` (name, version, auth, auth_seed): pure config.
- `database:<table>` (columns, indexes, seeder data): pure config.
- `routes` (method, path, handler name): pure config. The handler bodies are
  variants.
- `realtime:<id>` (channels and broadcast events): pure config, no body.
- `events:<id>` (event name and listener names): pure config. The listener
  bodies are variants.
- `api:<name>` (model, prefix, middleware list, endpoints, queries, validation,
  response types): config. It relies on Laravel's validation rule strings
  (`required|string|max:255`), `role:admin` middleware and the generated CRUD
  methods. As the reference, those become the DSL's own vocabulary, and each
  backend implements them behind the scenes (see below). The Laravel-only keys
  `resource` and `factory` are generator options, and other backends may treat
  them as no-ops or map them to their closest equivalent.
- `notifications:<id>` and `mail:<id>`: shared only while the body is empty
  (YAML only). A PHP body or a Blade template makes the block a variant.

### Variant blocks (contain backend-specific code)

- `endpoint`, `handler`, `policy`, `middleware`, `listener`
- `jobs` and `console`: the YAML header (queue, tries, timeout, signature,
  description, schedule) is repeated in each variant, and only the `handle()`
  body differs.
- `notifications` and `mail` blocks that carry a body.

Suffix names are not final. Proposed: name variants after the language, as in
`:php`, `:ts`, `:py`, `:java`, `:cs`, following the same idea as the existing
`:expo` / `:rn` frontend variants.

### How variants work

- A tatemono may carry variants for all backends, or for only one or two. There
  is no list of enabled backends to maintain.
- The active backend picks the matching variant of each block.
- If a tatemono has no variant for the active backend, validation fails for that
  tatemono, and it is inactive on that backend. The engine already handles
  frontend stacks this way.
- Switching backends is meant to take seconds for any tatemono that carries a
  variant for the target backend.
- Export picks only the chosen backend and frontend stacks, so a tatemono that
  carries many variants does not affect the exported project.

### When a backend lacks a Laravel feature

If a target backend has no built-in equivalent of something Laravel provides
(for example form validation rule strings, `role:` middleware, API resources,
policy wiring, scheduling, or notification channels), the engine builds a custom
implementation for it behind the scenes that behaves like Laravel's. The shared
blocks and the Laravel-derived vocabulary then work the same on every backend,
and tatemono authors never see the difference.

### Backends to add (in this order of planning)

Laravel is done. New: Express (TypeScript), Python (FastAPI and/or Django), Java
(Spring Boot) and C# (ASP.NET Core). Supabase is an integration and may reuse the
TypeScript variants. The later candidates (Go, Rust, Ruby, Elixir, Kotlin, Dart,
Scala) are not part of the current plan.

### Migration note

Existing blocks that contain PHP (`endpoint`, `handler`, `policy`, `middleware`,
`listener`, `jobs`, `console`) become the `:php` variant. Only 11 of the current
tatemonos contain such blocks, and Kotoba has most of them. Until they are
renamed, the engine can treat an unsuffixed body as PHP.

## Per-Tatemono Database and Backend Services

Each Tatemono is an independent system and must receive its own database. The
database/provider choice should be configurable per Tatemono:

- **PostgreSQL** — relational database target; each Tatemono gets its own
  PostgreSQL database.
- **SQLite** — relational database target for lightweight or local deployments;
  each Tatemono keeps an isolated database file.
- **Supabase** — optional hosted backend-services integration built around
  PostgreSQL. Treat this as a provider/integration, not merely as another
  database engine, and define how its database, authentication, storage, and
  realtime features map to Tatemono features.

Pluff should generate the appropriate connection configuration and migrations
for the selected provider. A Tatemono's data must remain isolated from other
Tatemono systems.

## Desktop Targets

Add desktop packaging targets that can use React for the frontend:

- **Tauri + React**
- **Electron + React**

React supplies the UI; Tauri or Electron supplies the desktop application
runtime, native bridge, and packaging. Pluff must generate the platform-specific
desktop setup and integration for each target.

## Dedicated Tatemono AI

Add a first-class AI assistant for authoring Tatemono systems. It should:

1. Turn a user's description into a Tatemono definition.
2. Create or edit the Tatemono within Pluff.
3. Validate it using Pluff's language rules and validators.
4. Build it and use validation/build errors to help correct the definition.

The assistant should use Pluff's authoritative Tatemono specification and
validators as its source of truth.

## Complete Tatemono Specification and Guidelines

Make the Tatemono documentation detailed enough that users and AI can create
valid Tatemono files without relying on sample applications. Specify:

- All supported blocks, syntax, fields, types, defaults, and ordering rules.
- How blocks reference and interact with each other.
- Which features are supported by each backend, database/provider, frontend,
  and desktop target.
- Validation rules, errors, and relevant edge cases.

Examples may remain as optional learning material and test fixtures; the
specification and validators define the actual language.
