# Pluff Go backend

Standalone Go/net-http backend foundation using [Chi](https://github.com/go-chi/chi)
for routing, with isolated per-tatemono databases using SQLite by default or
PostgreSQL when configured. The engine provides the Arkzen health, registry, build, and remove
contract. Builds validate module/API/table definitions, prepare isolated
database schemas, persist module registrations, and expose CRUD routes immediately
and after restart. It also provides a database-backed queue with retries and a
minute-resolution cron scheduler. The built-in `job-test` and `scheduler-test`
handlers are emulated. Kotoba's allowlisted named custom routes are implemented with
explicit Go emulations; arbitrary `:go` source is never executed.

Each build generates `models.go`, `controllers.go`, `routes.go`, and `module.go`
under `storage/generated/<tatemono>`. Generated Go is formatted and type-checked
before registration; the persisted generated route manifest drives request
dispatch. Startup regenerates artifacts for persisted modules, and removing a
module removes its generated directory. This source generation does not enable
arbitrary `:go` body execution; feature operations remain allowlisted.

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
`ARKZEN_DB_DRIVER` selects `sqlite` (default) or `pgsql`/`postgres`/
`postgresql`. SQLite module files remain at
`storage/databases/<tatemono>.sqlite`. PostgreSQL uses a separate database
named `<ARKZEN_DB_PREFIX><tatemono>` for each tatemono; it connects with
`DB_HOST`, `DB_PORT`, `DB_USERNAME`, and `DB_PASSWORD` (defaults are
`127.0.0.1`, `5432`, and empty credentials), creates missing databases, and
drops them when a tatemono is removed. The configured PostgreSQL user therefore
needs permission to create/drop databases and to create/alter tables.
`QUEUE_CONNECTION=sync` runs supported jobs during the dispatch request;
otherwise jobs are persisted in each module's `jobs` table and processed
by the integrated worker. `QUEUE_NAMES` selects queues to process (default
`default,heavy`). Scheduled console sections are checked every second and
recorded when their five-field cron expression is due.
Mail uses the `log` transport by default, like the other backend runtimes.
Set `MAIL_MAILER=smtp` with `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`,
`MAIL_PASSWORD`, and `MAIL_FROM_ADDRESS` to deliver through SMTP.
The development default secret is `arkzen-engine-secret`; configure a private
value outside local development.

## Engine contract

`GET /arkzen/health` is public. `GET /arkzen/registry` returns persisted
module registrations and Pluff Hub metadata. Set `PLUFF_ROOT` to a project
directory containing `arkzen.json` to populate `project`, `activeStack`,
`activeBackend`, and `activeDatabase`. `GET /arkzen/expo-registry` serves
`PLUFF_ROOT/engine/frontend/expo/expo-registry.json`; it returns an empty
registry when the file is absent. `POST /arkzen/build` and
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
Declared response message values are honored for destroy.

Each build generates `models.go`, `controllers.go`, `routes.go`, and `module.go`
under `storage/generated/<tatemono>`. Generated Go is formatted and type-checked
before it is registered; the persisted generated route manifest drives runtime
dispatch. Startup regenerates artifacts for persisted modules, and remove deletes
the module's generated directory. Go DSL bodies are still never executed as
arbitrary source; feature-specific operations remain behind the documented
allowlist.

For example:

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

Each registered tatemono has its own isolated database (a
`storage/databases/<name>.sqlite` file with SQLite, or the configured named
database with PostgreSQL). Tables are created or extended idempotently; omitted `id` columns
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
| `job-test` | Dispatches the three declared jobs to a database-backed queue. The integrated worker honors each job's queue, tries, and timeout metadata; retries failed jobs and records exhausted jobs in `failed_jobs`. Built-in job work is emulated; Go source bodies are not evaluated. |
| `scheduler-test` | Runs the four declared commands manually or from their Go cron metadata. Scheduled runs are recorded with `triggered_by: schedule`; command Go source bodies are not evaluated. |
| `events-test` | Resolves declared events/listeners and their selected `:go` listener bodies, then queues supported event-log listener operations with payload propagation and retries. `QUEUE_CONNECTION=sync` executes them during dispatch. Arbitrary Go listener code is not evaluated. |
| `broadcast-test` | Persists messages, publishes Pusher/Reverb-compatible events to public, private, and presence WebSocket channels, authorizes private/presence subscriptions, and exposes `/api/<module>/sse-poll/{channelType}` for polling clients. |
| `queue-flow` | Implements the allowlisted `join_queue`, `call_next`, `queue_status`, and `my_ticket` route state transitions from route metadata, including `queue-updated` broadcasts on the declared queue channels. |
| `dtr-geofencing` | Implements check-in/out, employee record lookup, setting updates, and distance-based geofence checks using the module's documented default office settings. |
| `jo-payroll` | Implements payroll summary, group lookup, and appointment-order queries over declared `job_orders` rows. |
| `roles-test` | Implements authenticated admin/user routes, access audit logging, and per-user promote/demote actions. |
| `kotoba` | Implements its auth/profile, community post/comment/like, lesson/vocabulary, partner/conversation/message, circle, alert, and progress route workflows against module database tables. |
| `mail-test` | Resolves the selected Go mail templates, renders the supplied data, and uses the log mailer by default (`status: sent`); optional SMTP delivery is supported with `MAIL_MAILER=smtp`. |
| `body-mail-notification` | Renders declared mail templates and notification bodies and delivers through the configured mail transport (log by default, optional SMTP), recording sent/failed results. Notifications are delivered by email; database/push channels are not implemented. |
| `notification-test` | Creates the Laravel-compatible notifications table from notification DSL, supports authenticated inbox, trigger, delete, and read-all routes, and delivers declared database/mail/broadcast channels. |
| `crud-test` | Uses the schema-aware CRUD routes described above and enforces the supported restricted update/delete policy expressions. |
| `middleware-test` | Supports its `requireJson` middleware and schema-aware ping-log CRUD. |

Custom endpoint operations and custom route handlers are allowlisted by
Tatemono name, operation/handler, and (for custom routes) the declared method
and path. A non-empty `:go` endpoint/handler body is required only for
`body-endpoint-handler`; its contents are ignored. Queue-flow behavior is
selected solely from its exact route and handler metadata. Kotoba's custom
routes are handled by fixed Go code selected from the allowlisted handler names;
source bodies are not evaluated. Unsupported custom endpoint types return `501`, and unsupported or
mismatched custom route handlers fail build validation. These constraints
prevent arbitrary code evaluation while allowing the small set of fixed
behaviors above.

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
provide generic role middleware; `roles-test` has an explicit controller-level
role-check emulation after authentication. It supports the authenticated
`/api/<module>/auth/broadcasting/auth` endpoint to sign private and presence
subscriptions. A Pusher-protocol WebSocket server starts with the API on
`REVERB_PORT` (default `8080`), using `REVERB_APP_KEY` and
`REVERB_APP_SECRET`; the development defaults match the Go export configuration.
Mail and notification emulations behind `auth` middleware can be reached with
a valid module bearer token. `mail-test` logs messages by default and supports
actual SMTP delivery when configured; `body-mail-notification` also sends
through the configured transport and records delivery outcomes.
`notification-test` creates its native notification table when notification
DSL sections are present and emulates its declared database, mail, and
broadcast channels. Kotoba behavior is limited to the allowlisted handlers
and operates on the declared module tables; realtime broadcast delivery for
Kotoba-specific notifications is not emitted by these handlers.

The Go source-language payload's event, job, and console metadata configures the built-in
`job-test` queue and `scheduler-test` cron emulation; arbitrary source bodies,
custom Go jobs/commands, and external sync/health checks are not executed.
`events-test` supports its declared event-log listener operation but does not
evaluate arbitrary listener source. SMTP delivery is available for mail and
email-notification emulations when configured. Broadcast WebSocket delivery and
polling are implemented for declared realtime sections and notification-test
channels. Resource transformers,
custom query filters, and arbitrary custom handlers remain unsupported. The
built-in `requireJson` middleware checks JSON media types and
rejects invalid requests with `415`; unknown middleware returns `501`. Index
routes order generically by primary key; job/event/broadcast logs and DTR time
records use newest-first timestamp ordering. `per_page` and `page` are
supported, including the default 15-row limit when the endpoint response type
is `paginated` (100 rows by default for `events-test`); paginated responses
include Laravel-style total, page, and navigation metadata.

## Build and test

```powershell
go build ./...
go test ./...
```
