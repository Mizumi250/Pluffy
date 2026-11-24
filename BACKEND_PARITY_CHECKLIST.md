# Pluffy Backend Parity Checklist (updated, pass 4, final for this session)

Reference: Laravel. "Verified" = executed here (cargo, go, pytest, tsx/node, javac+java, dotnet standalone).
Spring and ASP.NET full projects were NOT built (Maven/NuGet unreachable). Only the files named below were compiled.

## Done and verified
- [x] Validation rules: 177 shared vectors (`engine/backend/conformance/`) pass on Express, FastAPI, Go, Rust (run), Spring (validator compiled + run), ASP.NET (validator files compiled + run)
- [x] Rust validator rewrite (`validation.rs`), `exists:`; ASP.NET `RuleEngine.cs`; FastAPI + Spring gaps closed; Go `url` fix
- [x] `role:a,b` middleware: Go (was 501), Rust; Go/Rust/Express answer 403 "Forbidden. Insufficient role."
- [x] Lynx realtime poll `GET /api/<slug>/sse-poll/<public|private|presence>?after_id=N` (Laravel contract: 404 bad type, 401 non-public w/o user, public = 'public' or NULL, `{messages:[{event,data}], last_id}`):
  - Rust: unit test passes (route wiring in `lib.rs` compiles; not exercised over HTTP)
  - FastAPI: end-to-end test passes (`tests/test_sse_poll.py`)
  - Express: end-to-end test passes (`tests/ssePoll.test.ts`). Also fixes a latent bug: `/sse-poll` and `/sse` were never in `routePrefixes`, so they were unreachable. Old response shape `{data, channel}` replaced.
  - Spring: `SsePoll.java` + generated route type-check with `javac` (stubs for missing libs); NOT run

## Needs a rebuild on your side
Generated modules already in the repo (e.g. `fastapi/pluff/generated/*`, `express/src/generated/*`) do not contain the new route until the tatemono is rebuilt.

## Corrections to the first checklist
- Express was marked OK for SSE; its route existed but was unreachable and had the wrong response shape (now fixed).
- Go `sse-poll` deviates from Laravel: 400 (not 404) for a bad type, public excludes NULL `channel_type`, private filters by `user_id`. Left unchanged; decide whether Go should match Laravel exactly.
- ASP.NET already has `sse-poll`; its details were not compared to Laravel.
- `withTrashed` is probably not a real gap (handler-body APIs are per-language).

## Still open
- [ ] Streaming `/sse/{type}` (Laravel `text/event-stream`): none of the non-Laravel backends implement the Laravel contract
- [ ] `api.resource: true` projection (Express only); `factory: true` on Go, Rust (ASP.NET warns at build)
- [ ] Go/Rust notifications run only as a named workflow; Rust general middleware/policy bodies
- [ ] ASP.NET cron; Spring + ASP.NET durable queue and `failed_jobs`
- [ ] `date_format`, `after*`, `before*`, `digits_between` unsupported on every non-Laravel backend; Rust `date` accepts ISO 8601 only

## Test state
- Rust: 65 pass, 2 fail (`repeated_fires_write_timestamped_listener_rows`, `role_notification_and_scheduler_test_emulations_match_go_behavior`); both fail identically on the untouched code
- FastAPI: 13 pass. Go validation tests pass (DB-backed Go tests not run: sqlite driver unreachable here)
- Spring/ASP.NET: full builds not run

## Remaining gaps ranked by real usage in `tatemonos/` (counted from your repo)
| Gap | Tatemonos using it | Verdict |
|---|---|---|
| Notifications on Go/Rust (named workflow only) | 5 | Real gap. Needs a declarative fallback (channels from the block, generic database/mail/broadcast delivery); design work, not done |
| Cron on ASP.NET (`schedule:` ignored) | 4 | Real gap. Needs a hosted scheduler wired to the Roslyn command runner; cannot be compiled or tested here, not done |
| `resource: true` outside Express | 6 | Cosmetic. Express projects responses to id + declared columns + timestamps, which only removes `deleted_at`; other backends return the same fields plus `deleted_at`. Not implemented |
| `factory: true` on Go/Rust | 2 | Low. Handler-body API, per-language by design |
| Durable queue + `failed_jobs` on Spring/ASP.NET | not measured | Real for production use; jobs are lost on restart. Not done |
| `date_format`, `after*`, `before*`, `digits_between` | 0 | No tatemono uses them; stays a documented gap |
| Streaming `/sse/{type}` | 0 | Lynx uses `sse-poll` (done on all backends); not needed |

Suggested next order: Go/Rust notification fallback, ASP.NET cron, then durable queues.

## Pass 3 additions
- [x] **Go + Rust notifications are now generic for declarative blocks.** They hard-coded `notification-test` in the type prefix, broadcast channel, event name and (Go) channel authorization, so any other tatemono got the wrong channel. Now Laravel naming from the module slug: public `{slug}.notifications`, private/presence `{type}-{slug}.{userId}`, event `{slug}.notification`, type `{Slug}\{Class}`; Go's channel_type default is private like Laravel. Verified by unit tests (Go `TestNotificationChannels...`, Rust `notification_naming_tests`). Custom notification *bodies* (arbitrary code) are still not executed on Go/Rust.
- [x] **ASP.NET cron** (`schedule:` on console blocks): `CronSchedule.cs` (port of Go's matcher; 16 cases verified), `CommandScheduler.cs` (hosted service, compiled; not run, ASP.NET runtime pack unavailable here), `RunScheduledConsoles` in `BackendEngine.cs` and registration in `Program.cs` (NOT compiled: the full project cannot be built here). In-process, once per minute, not durable.

## Pass 4 additions
- [x] **Spring durable queue.** `JobDispatcher` now persists jobs in a Laravel-style `jobs` table (main DB), deletes them on success, moves exhausted jobs to `failed_jobs`, and re-runs leftovers once per tatemono ~3s after the module registers (after a restart). Falls back to the old in-memory behavior if the DB is unavailable. `QUEUE_CONNECTION=sync` still runs inline. Compile-checked with `javac` (0 errors in the file); NOT run, there is no JDBC driver here.
- [x] **Go `sse-poll` aligned to Laravel:** unknown channel type is 404 (was 400), public includes NULL `channel_type`, junk/negative `after_id` becomes 0 (was 400). Kept on purpose: private polling filters by `user_id` (stricter than Laravel, which returns every private row to any authenticated user). Go builds and its non-DB tests pass; its DB-backed poll tests could not run here (sqlite driver unreachable).

## Still open (final)
| Gap | Why it is not done |
|---|---|
| ASP.NET durable queue + `failed_jobs` | Jobs are queued as in-memory closures; persisting them means restructuring dispatch in `BackendEngine.cs`, which cannot be compiled or run here. Not shipping blind persistence |
| Go/Rust custom notification *bodies*; Rust general middleware/policy bodies | Per-language body execution (Go interpreted, Rust compiled); needs a design decision on what the Rust runtime may execute |
| `resource:` outside Express | Cosmetic (drops `deleted_at` only) |
| `factory:` on Go/Rust | Handler-body API, per-language by design |
| Streaming `/sse/{type}`; `date_format`/`after*`/`before*`/`digits_between` | Unused by your tatemonos (0 uses) |

## Not verified by running (read before shipping)
- ASP.NET: `BackendEngine.RunScheduledConsoles`, `Program.cs` registration, and the whole project build
- Spring: full project build; durable queue and `sse-poll` at runtime
- Go: DB-backed tests
