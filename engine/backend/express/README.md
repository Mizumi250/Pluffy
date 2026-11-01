# Pluff Express backend (`:ts` variant)

TypeScript backend target modeled on Laravel. It implements the same `/arkzen/health | registry | build | remove`
contract on port 8000, so the frontend watcher and bridge need no changes.

Select it with `node mizumi.js backend express`, then `cd engine/backend/express && npm install` and `npm start`.

## How it works
1. The watcher parses a tatemono with the active backend's variant (`:ts`) and POSTs it to `/arkzen/build`.
2. `src/engine/schema.ts` creates the tatemono's isolated database (sqlite file or Postgres database), tables, auth tables, seeders.
3. `src/engine/generate.ts` writes TypeScript to `src/generated/<name>/` (models, controllers, routes, policies, resources, factories, jobs, events, commands, mail, notifications, realtime, uploads and SSE polling).
4. esbuild bundles it (syntax errors in `:ts` bodies fail the build here) and the router is hot-swapped in. No restart.

## Laravel features reimplemented in `src/runtime` (imported as `@pluff/runtime`)
Eloquent-like `Model`/`QueryBuilder` (+ paginator JSON), Laravel rule-string validation with identical 422 bodies, Sanctum-style tokens,
`auth` / `role:` middleware, policies (`authorize`), database queue + worker, queued listeners, scheduler, mail (`{{ var }}` templates),
database/mail/broadcast notifications, Pusher-protocol realtime server (public/private/presence), multipart storage,
JSON resources, model factories, command/job/event dispatch endpoints, and streaming `/sse` plus `/sse-poll` routes.

Realtime channel declarations accept Laravel-style `type` and `auth` values (`authenticated`, `owner`, or `admin`).
Notification `channel_type` selects private, public, or presence broadcast channels. Mail HTML supports escaped/raw
Blade-style interpolation, comments, `@if`/`@elseif`/`@else`, and `@foreach`; it does not execute PHP or implement
arbitrary Blade directives. Validation includes Laravel's common conditional/required rules, distinct values, IP
versions, string prefixes/suffixes, and decimal precision in addition to the rules listed by the runtime.

## Writing `:ts` bodies
Bodies are async function bodies. Available names: `request`, `response`, every generated model (plus `User` when `auth: true`),
`Hash`, `DB`, `abort`, `dispatch`, `event`, `broadcast`, `Mail`, `notify`, `Storage`, `Log`, `Command`, `Job`.

| Block | Signature | Example |
|---|---|---|
| `middleware:ts:name` | `(request, response, next)` | `return next()` |
| `policy:ts:update` | `(user, ticket)` returns boolean | `return user?.id === ticket.user_id` |
| `endpoint:ts:name` / `handler:ts:name` | `(request, response)` / `+ params` | `return response.json({ ok: true })` |
| `listener:ts:Name` | `(event)`, `event.data` | `await Log.info('x', event.data)` |
| `jobs:ts:name` | method body of `handle()`, `this.data` | `await JobResult.create({...})` |
| `console:ts:name` | method body of `handle()`, return `Command.SUCCESS` | |

Run `npm run queue` for jobs and schedules, `npm run pluff -- <signature>` to run a command.

## Laravel compatibility notes

Express is the Node implementation of the Laravel reference contract, not a second DSL. The same
tatemono blocks are parsed with `:ts` bodies and generated into the equivalent runtime behavior:
`resource` uses a Laravel-shaped JSON projection, `factory` exposes `make/create/createMany/count/state`,
uploads use Multer plus the public storage disk, and command/job/event endpoints use the Express command
and queue runtimes. `/sse` is a real event stream with keep-alive heartbeats; `/sse-poll` remains available
for clients that cannot consume streams. React-Inertia remains Laravel-locked and is intentionally not
changed by this backend.
