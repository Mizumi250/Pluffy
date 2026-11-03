# Pluff Go backend

Standalone Go/net-http backend foundation using [Chi](https://github.com/go-chi/chi)
for routing and the pure-Go `modernc.org/sqlite` driver for isolated module
databases. The current engine provides the Arkzen health, registry, build, and
remove contract. Builds validate module/API/table definitions, prepare
isolated SQLite schemas, persist module and API route registrations, and
expose CRUD routes immediately and after restart. Arbitrary `:go` endpoint, handler, and middleware bodies are not executed.

## Run

Install Go 1.22 or newer, then from this directory:

```powershell
go mod download
$env:ARKZEN_ENGINE_SECRET = "replace-with-a-private-secret"
go run ./cmd/server
```

The server listens on `:8000` by default. `PORT` sets the listening port,
`ARKZEN_ENGINE_SECRET` sets the build/remove credential, and
`PLUFF_STORAGE_DIR` sets the persistent storage root (default `storage`).
The development default secret is `arkzen-engine-secret`; configure a private
value outside local development.

## Engine contract

`GET /arkzen/health` is public. `GET /arkzen/registry` returns persisted
module registrations and Pluff Hub metadata. Set `PLUFF_ROOT` to a project
directory containing `arkzen.json` to populate `project`, `activeStack`,
`activeBackend`, and `activeDatabase`. `POST /arkzen/build` and
`POST /arkzen/remove` require the `X-Arkzen-Secret` header. Build requests
accept JSON with a lowercase
tatemono `name`, optional `backendVariant` (must be `go` when present),
optional `databases` blocks, and optional `apis` blocks. API blocks use
`model`, `controller`, optional `table`, `prefix`, and CRUD `endpoints`; table
names are resolved explicitly or from the model name (for example `Item` to
`items`). An omitted prefix
defaults to `/api/<tatemono-name>`, and an omitted endpoints map registers the
standard CRUD paths. Configured `index`, `show`, `store`, `update`, and
`destroy` routes use each endpoint's method and path; `store` and `update`
apply common `required`, `sometimes`, `nullable`, `string`, `integer`,
`numeric`, `boolean`, `min`, `max`, `in`, and `unique` validation rules.
Declared response message values are honored for destroy. For example:

```json
{
  "name": "inventory",
  "backendVariant": "go",
  "databases": [
    {
      "table": "items",
      "columns": {
        "title": { "type": "string", "nullable": false },
        "quantity": { "type": "integer", "default": 0 }
      }
    }
  ],
  "apis": [
    {
      "model": "Item",
      "controller": "ItemController",
      "prefix": "/api/inventory",
      "endpoints": {
        "index": { "method": "GET", "route": "/items" },
        "show": { "method": "GET", "route": "/items/{id}" },
        "store": { "method": "POST", "route": "/items" },
        "update": { "method": "PUT", "route": "/items/{id}" },
        "destroy": { "method": "DELETE", "route": "/items/{id}" }
      }
    }
  ]
}
```

Each registered tatemono has its own `storage/databases/<name>.sqlite`
database. Tables are created or extended idempotently; omitted `id` columns
receive an integer primary key when no primary key was declared. Tables
include nullable `created_at`/`updated_at` columns by default; set
`"timestamps": false` to disable them, or `"softDeletes": true` to add a
nullable `deleted_at` column. Module registrations are persisted atomically
in `storage/modules.json`. Remove unregisters a known module and deletes its
database; attempting to remove an unknown name returns 404. Invalid payloads
return 422, malformed JSON returns 400, and missing/incorrect credentials
return 403. CRUD responses use JSON `data` envelopes, explicit 4xx/5xx errors,
and 404 responses for missing records. The registry retains route configuration
so CRUD remains active after the server restarts.

The engine never executes arbitrary controller code or custom `:go`
endpoint/handler bodies. It uses explicit module/operation allowlists and
implements these bounded emulations:

| Tatemono | Supported Go-engine behavior |
| --- | --- |
| `body-endpoint-handler` | `echo` and `stats` endpoints; `ping`, `recordHandler`, and `latest` custom routes. Endpoint/handler body presence is checked, but source is not evaluated. |
| `inventory-management` | Seeds the declared inventory rows and `lowStock` queries declared rows below 20 units. |
| `job-test` | Records only `process-data`, `heavy-computation`, and `always-fails` synchronously in `job_results`. It does not run queue workers, retries, or source delays. |
| `scheduler-test` | Records only `cleanup-temp`, `generate-report`, `ping-health`, and `sync-data`; no command or cron job is executed. |
| `events-test` | Maps the three declared events to their fixed listener names and records completion rows synchronously; listener source and asynchronous execution are not run. |
| `broadcast-test` | Persists messages and returns broadcast metadata with `delivered: false`; no WebSocket event or `/api/broadcast-test/sse-poll/{channelType}` route is provided. |
| `queue-flow` | Implements the allowlisted `join_queue`, `call_next`, `queue_status`, and `my_ticket` route state transitions from route metadata. Broadcast metadata is simulated and not delivered. |
| `dtr-geofencing` | Implements check-in/out, employee record lookup, setting updates, and distance-based geofence checks using the module's documented default office settings. |
| `jo-payroll` | Implements payroll summary, group lookup, and appointment-order queries over declared `job_orders` rows. |
| `mail-test`, `body-mail-notification` | Logs allowlisted mail/notification requests with `status: simulated`; no SMTP delivery or notification channel is used. |
| `crud-test` | Uses the schema-aware CRUD routes described above. |
| `middleware-test` | Supports its `requireJson` middleware and schema-aware ping-log CRUD. |

Custom endpoint operations and custom route handlers are allowlisted by
Tatemono name, operation/handler, and (for custom routes) the declared method
and path. A non-empty `:go` endpoint/handler body is required only for
`body-endpoint-handler`; its contents are ignored. Queue-flow behavior is
selected solely from its exact route and handler metadata. Unsupported custom
endpoint types return `501`, and unsupported/mismatched custom route handlers
fail build validation. These constraints prevent arbitrary code evaluation
while allowing the small set of fixed behaviors above.

Declared `database.seeder.data` rows are inserted when the module is built.
Rebuilding a module with seed rows clears that table and restores the declared
seed set, matching the other backend engines; tables without seed rows are not
cleared. Seed row fields must be declared columns (or declared timestamps),
and values must be JSON scalars.

When `auth: true`, the Go engine creates module-isolated users and token tables
and serves the standard `/api/<module>/auth/register`, `/login`, `/me`, and
`/logout` routes. Auth seed users are upserted by email; omitted seed passwords
default to `password`. Register requires `name`, `email`, `password`, and
`password_confirmation`; passwords use bcrypt hashes compatible with the
Laravel/Express auth engines. Access tokens use the Sanctum-style `id|secret`
format with only the SHA-256 token hash stored, and can be revoked at logout.
No initial account is created unless `authSeed.users` is configured; register
an account before logging in. The Go engine does not create browser sessions or
role middleware. Mail and notification
emulations behind `auth` middleware can be reached with a valid module bearer
token. `notification-test`'s inbox routes still require a Laravel-managed
notifications table that Go does not create. Kotoba's custom social, lessons,
vocabulary, messaging, circles, and alerts handlers are not in the Go route
allowlist; route authentication does not implement those custom handlers.

The Go source-language payload contains jobs and scheduler console snippets,
but the engine does not execute them: job queue timing, worker retries and
failed-job transport, cron scheduling, and external sync/health checks are not
performed. It likewise does not deliver SMTP mail, notifications, WebSocket/
SSE broadcasts, or asynchronous event listeners. Policies, resource
transformers, custom query filters, and other custom handlers remain
unsupported. The built-in `requireJson` middleware checks JSON media types and
rejects invalid requests with `415`; unknown middleware returns `501`. Index
routes order generically by primary key; job/event/broadcast logs and DTR time
records use newest-first timestamp ordering. `per_page` and `page` are
supported, including the default 15-row limit when the endpoint response type
is `paginated`, but responses use the engine's `{data,count}` envelope rather
than Laravel's full paginator metadata.

## Build and test

```powershell
go build ./...
go test ./...
```
