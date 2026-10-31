# Pluff Express backend (`:ts` variant)

Second backend target after Laravel. It implements the same `/arkzen/health | registry | build | remove`
contract on port 8000, so the frontend watcher and bridge need no changes.

Select it with `node mizumi.js backend express`, then `cd engine/backend/express && npm install` and `node start.js`.

## How it works
1. The watcher parses a tatemono with the active backend's variant (`:ts`) and POSTs it to `/arkzen/build`.
2. `src/engine/schema.ts` creates the tatemono's isolated database (sqlite file or Postgres database), tables, auth tables, seeders.
3. `src/engine/generate.ts` writes TypeScript to `src/generated/<name>/` (models, controllers, routes, policies, jobs, events, commands, mail, notifications, realtime).
4. esbuild bundles it (syntax errors in `:ts` bodies fail the build here) and the router is hot-swapped in. No restart.

## Laravel features reimplemented in `src/runtime` (imported as `@pluff/runtime`)
Eloquent-like `Model`/`QueryBuilder` (+ paginator JSON), Laravel rule-string validation with identical 422 bodies, Sanctum-style tokens,
`auth` / `role:` middleware, policies (`authorize`), database queue + worker, queued listeners, scheduler, mail (`{{ var }}` templates),
database/mail/broadcast notifications, Pusher-protocol realtime server (public/private/presence).

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

## Not covered yet
Upload endpoints (`upload*`, `fileUrl`) return 501. `resource` and `factory` are accepted as no-ops. `command_run`, `job_dispatch`,
`event_fire` test-only endpoint types, SSE bridge (Lynx) and the Postgres path are untested.
