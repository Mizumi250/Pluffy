# Pluff Go backend

Standalone Go/net-http backend foundation using [Chi](https://github.com/go-chi/chi)
for routing and the pure-Go `modernc.org/sqlite` driver for isolated module
databases. The current engine provides the Arkzen health, registry, build, and
remove contract. Builds validate module/API/table definitions, prepare
isolated SQLite schemas, persist module and API route registrations, and
expose CRUD routes immediately and after restart. Custom `:go` endpoint,
handler, and middleware bodies and non-CRUD endpoints are not executed or
implemented.

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

The current CRUD implementation does not execute controller code, custom
`:go` handlers/endpoints/middleware, auth, policies, resource transformers,
custom query filters, seeders, or non-CRUD endpoints. Index returns records
ordered by primary key; `per_page` and `page` are supported, including the
default 15-row limit when the endpoint response type is `paginated`.

## Build and test

```powershell
go build ./...
go test ./...
```
