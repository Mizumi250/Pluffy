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
