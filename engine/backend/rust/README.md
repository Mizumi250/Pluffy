# May be outdated. See PLUFF_GUIDELINES and the engine source.


# Pluff Rust backend engine

Standalone Rust server foundation built with [Axum](https://github.com/tokio-rs/axum),
Tokio, Tower HTTP middleware, and rusqlite. It implements the authenticated
Arkzen build/remove contract, validates parsed module payloads, creates an
isolated SQLite database and schema for each module, persists module
registrations and live API definitions across restarts, and serves the common
CRUD endpoints described below. It does not modify or depend on root Pluff
integrations.

## Database driver

`ARKZEN_DB_DRIVER` selects `sqlite` (default) or `pgsql` (`postgres` / `postgresql`
also accepted). Each tatemono gets its own isolated database either way:

- `sqlite`: `database/arkzen/<name>.sqlite`
- `pgsql`: a PostgreSQL database named `<ARKZEN_DB_PREFIX>_<name>`

For PostgreSQL set `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` (and optionally
`DB_SSLMODE`). The configured user must be allowed to `CREATE DATABASE` and
`DROP DATABASE`, because the engine creates a database on build and drops it on remove.
Switch with `node mizumi.js db postgresql` (or `sqlite`).

## Run

Install the Rust toolchain with rustup, then from this directory:

```powershell
Copy-Item .env.example .env
cargo run
```

On Windows, the MSVC Rust target requires the Visual C++ linker. If it is not
available, `node start.js` can use the `stable-x86_64-pc-windows-gnu` Rust
toolchain with MinGW GCC when both are installed.

The server listens on `http://localhost:8000` by default. `HOST`, `PORT`,
`ARKZEN_ENGINE_SECRET`, `ARKZEN_MODULE_DIR`, and `ARKZEN_DATABASE_DIR` can be
set in `.env` or the process environment. The development secret in
`.env.example` must be replaced for non-local use.
The Pusher-protocol realtime listener starts with the backend on port `8080`
by default; configure `REVERB_PORT`, `REVERB_APP_KEY`, and `REVERB_APP_SECRET`
to match the mobile/web client configuration. It supports public, private, and
presence WebSocket subscriptions, authenticated channel signing, and
`type: broadcast` API endpoints.
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
`array`, `in`, and `unique`.

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
Mail-send endpoints resolve the mail declared in the Tatemono, render its
`@arkzen:mail:rs` template with HTML-escaped data, and write a mail-log record.
`MAIL_MAILER=log` (the default) logs delivery without contacting an SMTP server;
set `MAIL_MAILER=smtp` with `MAIL_HOST`, `MAIL_PORT`, optional
`MAIL_USERNAME`/`MAIL_PASSWORD`, and `MAIL_FROM_ADDRESS` to send via SMTP.

Custom endpoint and custom-route `:rs` bodies are base64-decoded from the
parsed build payload into `storage/arkzen-modules/generated/<name>.rs`. When
launched with `node start.js`, Rust debounces generated-source compilation until
module builds settle, then restarts once to load the updated handlers. A Rust
compiler error is logged and the running process stays available. Run the
backend through `node start.js` for generated handlers to be compiled and loaded.

Generated handlers receive `request`, `database`, and `response` helpers and
can use `serde_json::{json, Map, Value}` and `StatusCode`. `request.user()` is
available when the module uses auth, and `database.query_params` and
`database.execute` support parameterized SQL.

A Tatemono may provide one module-level Rust source block using
`/* @arkzen:module:rs` followed by `*/`, then Rust source, and the closing
`/* @arkzen:module:rs:end */` marker. The block is compiled into that module
alongside its endpoint and custom-route bodies. This supports shared helpers
while keeping all module-specific code in the Tatemono source of truth.

Comment-only placeholder bodies are not generated and remain unsupported
(`501`). Event-fire endpoints dispatch their declared listeners in order using
generated `@arkzen:listener:rs` bodies and return `202` after they complete.
The `job-test` module has the same named job emulations as the Go backend;
these run in-process and record results plus terminal failures. Durable queues,
general Rust job DSL execution, middleware snippets, and policies are not
implemented. The `roles-test`, `notification-test`, and `scheduler-test`
endpoints have named emulations matching Go: role changes and audit records,
per-user database/mail/broadcast notifications, and manually run console
commands recorded in `command_runs`. These named emulations do not execute
arbitrary endpoint or console source bodies, and Rust does not yet run scheduled
console commands from cron metadata. Generic CRUD, auth, and mail-send behavior
are implemented by the engine. Other module-specific custom behavior must be
authored in that Tatemono's `:rs` body or module source block; the engine does
not provide named per-Tatemono substitutes.
Declared `database.seeder.data` rows are inserted when the module is built.
Rebuilding a module with seed rows clears and reseeds that table, including
resetting its SQLite auto-increment sequence; tables without seed rows are
preserved. Seed columns must be declared (or be the generated `id` and
timestamps), and seed values must be JSON scalars.