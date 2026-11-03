# Pluff Rust backend engine

Standalone Rust server foundation built with [Axum](https://github.com/tokio-rs/axum),
Tokio, Tower HTTP middleware, and rusqlite. It implements the authenticated
Arkzen build/remove contract, validates parsed module payloads, creates an
isolated SQLite database and schema for each module, persists module
registrations and live API definitions across restarts, and serves the common
CRUD endpoints described below. It does not modify or depend on root Pluff
integrations.

## Run

Install the Rust toolchain with rustup, then from this directory:

```powershell
Copy-Item .env.example .env
cargo run
```

The server listens on `http://localhost:8000` by default. `HOST`, `PORT`,
`ARKZEN_ENGINE_SECRET`, `ARKZEN_MODULE_DIR`, and `ARKZEN_DATABASE_DIR` can be
set in `.env` or the process environment. The development secret in
`.env.example` must be replaced for non-local use.
`PLUFF_ROOT` may point to a Pluff project root for registry metadata; when
unset, the server searches its current directory and parents for `arkzen.json`.

Build and test:

```powershell
cargo build
cargo test
```

## HTTP contract

`GET /arkzen/health` is public and returns the engine name, backend (`rust`),
variant (`rs`), version, and `status: ok`. Public `GET /arkzen/registry` merges
`PLUFF_ROOT/arkzen.json` when the configured root is a valid directory and its
registry stays inside that directory; otherwise it returns a minimal registry
with the current backend and persisted modules. Invalid root registry JSON is
reported as an explicit server error.

`POST /arkzen/build` and `POST /arkzen/remove` require the
`x-arkzen-secret` header. Missing or incorrect credentials receive `403`.
Malformed JSON receives `400`; invalid module input receives `422` with an
`errors` array. The build request accepts the parsed module JSON object used by
the other backend engines. `name` must be a lowercase slug (letters, digits,
and dashes), optional `backendVariant` must be `rs`, and database definitions
must use valid SQLite identifiers and supported column types.

Example:

```powershell
$headers = @{ "x-arkzen-secret" = "arkzen-engine-secret" }
$body = @{
  name = "todo-app"
  backendVariant = "rs"
  databases = @(@{
    table = "todos"
    columns = @{
      title = @{ type = "string" }
      completed = @{ type = "boolean"; default = $false }
    }
  })
} | ConvertTo-Json -Depth 20
Invoke-RestMethod -Method Post -Uri http://localhost:8000/arkzen/build `
  -Headers $headers -ContentType "application/json" -Body $body
```

The successful response includes `success`, `message`, `steps`, `errors`,
`warnings`, and a small `registry` summary. Each module's definition is stored in
`storage/arkzen-modules/<name>.json`; its SQLite database is stored at
`database/arkzen/<name>.sqlite`. Tables are created independently per database,
with an automatic integer `id` when no primary key is declared, timestamps by
default, optional soft deletes, scalar defaults, uniqueness, and common Pluff
database column types. Schema application is transactional and adds newly
declared non-primary columns to existing tables. Removal deletes the
registration and isolated SQLite file.

## API blocks

The engine serves the common CRUD actions (`index`, `show`, `store`, `update`,
and `destroy`) from parsed API definitions after a successful build. It honors
each API `prefix`, endpoint HTTP method and route, API `table` when supplied,
and otherwise resolves the model to a matching database table (or the sole
declared table). With no endpoint map, conventional CRUD paths are used. A
configured paginated index returns Laravel-shaped `data`, `current_page`,
`last_page`, `per_page`, and `total`; `response.type: array` returns an array,
and other index endpoints return `{ "data": [...] }`. Show/update return the
record, store returns `201` with the record, and destroy returns a message.
Missing records receive `404`; invalid bodies/declared validation rules receive
`422`; database failures are explicit `500` responses. Index supports configured
column filters, `search` over name/title/description where present, page sizing,
and soft-delete filtering. Declared required/string/numeric/boolean/email/min/max
validation rules are supported, along with `sometimes`, `nullable`, `integer`,
`in`, and `unique`.

The built-in `requireJson` middleware checks JSON media types and rejects
invalid requests with `415`; `auth` and `auth:sanctum` require `auth: true`
and validate module-local bearer tokens. Unknown middleware returns `501`.
Modules with `auth: true` receive module-local `users` and
`personal_access_tokens` tables, bcrypt-hashed passwords, SHA-256-hashed
random Sanctum-style tokens, and `/api/<module>/auth/register`, `login`, `me`,
and `logout` routes. `authSeed.users` upserts seeded users. Registration
requires name, email, password, and matching `password_confirmation`; register
and login return `{ "user": ..., "token": "<id>|<secret>" }`. The Rust engine
does not implement cookie or session authentication.

Rust provides purpose-built emulations for the `body-endpoint-handler` `echo`, `stats`,
`ping`, `recordHandler`, and `latest` operations and the `inventory-management`
`lowStock` endpoint when their corresponding bodies are present. These return
equivalent response shapes and persist/query the declared module tables;
arbitrary custom source is never evaluated. `queue-flow` has explicit
`join_queue`, `call_next`, `queue_status`, and `my_ticket` state transitions;
its realtime broadcasts are not implemented. `jo-payroll` implements summary,
group, and appointment queries. Other custom endpoint bodies, arbitrary
middleware, policies, and non-CRUD DSL behavior remain unsupported and return
`501` with build warnings. API registration is dynamic from the persisted
module definition; it does not generate or execute arbitrary Rust source code.
Declared `database.seeder.data` rows are inserted when the module is built.
Rebuilding a module with seed rows clears and reseeds that table, including
resetting its SQLite auto-increment sequence; tables without seed rows are
preserved. Seed columns must be declared (or be the generated `id` and
timestamps), and seed values must be JSON scalars.
