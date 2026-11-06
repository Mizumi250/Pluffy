# May be outdated. See PLUFF_GUIDELINES and the engine source.


# Pluff Spring Boot backend (`:java` variant): WORK IN PROGRESS

Spring Boot is selected as `activeBackend: "spring-boot"` and reads `:java` backend code blocks. The shared parser,
backend registry, `mizumi.js`, `setup.js`, and `start.js` already recognize that mapping. The Spring server and
Tatemono build lifecycle implement the `/arkzen/health | registry | build | remove` contract on port 8000. Spring Boot
hosts the HTTP layer while the engine and runtime live in `dev.pluff`.

## Implemented foundation (Maven compile and HTTP sample smoke tests pass)
| File | What it is |
|---|---|
| `pom.xml` | Spring Boot 3.5.16 (supports Java 17 up to 25), Java 17 minimum, sqlite-jdbc, Java-WebSocket, snakeyaml, spring-security-crypto |
| `runtime/Support.java` | env/.env, studly/snake, sqlNow, Laravel-style ISO timestamps |
| `runtime/Json.java` | own JSON reader/writer (insertion-ordered, no Jackson) |
| `runtime/Errors.java` | HttpException, ValidationException (422 summary like Laravel), Authentication/Authorization/ModelNotFound |
| `runtime/Conn.java`, `Database.java` | JDBC per tatemono (sqlite file or Postgres database), isolated like the other backends |
| `runtime/QueryBuilder.java`, `Model.java`, `ModelMeta.java` | Eloquent-like models, flat SQL (`a OR b AND c`), Laravel paginator JSON |
| `runtime/Request.java`, `Response.java`, `Router.java` | Laravel-style request/response helpers and generated-route dispatch |
| `runtime/Auth.java`, `Broadcast.java` | Per-tatemono Sanctum-style tokens, role middleware, channel authorization, and Pusher-compatible WebSocket delivery |
| `runtime/Mail.java` | YAML-configured mail templates, escaped Blade-style placeholders, log mailer, and optional SMTP delivery |
| `Server.java`, `engine/Build.java`, `engine/Generate.java` | Spring HTTP host, health/registry/build/remove endpoints, Java generation/compilation, and route hot-loading |
| `runtime/Job.java`, `JobDispatcher.java` | Generated job handlers, configurable sync/async execution, timeout enforcement, and retries |
| `runtime/AppEvent.java`, `EventDispatcher.java` | Generated event/listener registration and sync/async listener dispatch |
| `runtime/Command.java`, `CommandRegistry.java` | Generated console commands, output capture, and an in-process minute-resolution cron scheduler |
| `runtime/Notification.java`, `NotificationDispatcher.java`, `MailMessage.java` | Generated database, mail, and broadcast notifications |
| `runtime/Validator.java` | Laravel rule strings with Laravel's exact messages (tested: required/email/min/in/confirmed) |
| `runtime/Hash.java` | bcrypt (jBCrypt), cost 12 like Laravel, verifies Laravel `$2y$` hashes (tested) |
| `engine/Schema.java` | Port of `schema.py`: DDL per dialect, dependency order, add-missing-columns, auth + notification tables, seeders. **Tested against real SQLite** with the database blocks of `queue-flow` and `fastapi-test`, applied twice (rebuild). Seeder resets the id counter, so a rebuild keeps seeded ids at 1,2,... |

## Scope and remaining parity work
Spring parity work is scoped to the planned Tatemono fixtures that already have Laravel, Express, and FastAPI implementations. A feature found only in a Tatemono without those existing backend variants is not a Spring parity gap. For example, `upload-test` has upload DSL but no Laravel, Express, or FastAPI variants, so it is outside this parity set.

The current parity set is: `body-endpoint-handler`, `body-mail-notification`, `crud-test`, `dtr-geofencing`, `events-test`, `express-test`, `inventory-management`, `jo-payroll`, `job-test`, `kotoba`, `middleware-test`, `notification-test`, `queue-flow`, `roles-test`, and `scheduler-test`.

- Finish behavioral parity and targeted validation for the shared feature families in the 15-fixture set
- Broader parser-to-runtime validation of those 15 fixtures; other Tatemono are out of scope unless they meet the existing-backend criterion and are added to the plan

## Known limits of how it was built
- All 15 planned parity fixtures now have Java variants (96 Java bodies total) and built through the parser-to-Spring bridge. Maven packaging and focused HTTP smoke tests cover generated handlers, custom routes, policies, jobs, events/listeners, commands, notifications, CRUD, and auth. The full behavioral matrix for these 15 fixtures is not yet exercised.
- The two Spring-only samples have interactive web pages: `spring-test` demonstrates CRUD, and `spring-ledger` demonstrates atomic `BigDecimal` transfers.
- `mail-test` now has Java mail-template variants. With the default `MAIL_MAILER=log`, sends are recorded without contacting an SMTP server; set `MAIL_MAILER=smtp` and configure `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, and `MAIL_PASSWORD` to deliver messages.
- Job and event execution use in-memory workers; queued work is not durable across process restarts. Scheduled commands also run in-process and use a minute-resolution cron matcher.
- Reserved `status` endpoints in Kotoba remain placeholders, as in the Laravel reference implementation.
- The SQL layer was tested against SQLite (Debian sqlite-jdbc 3.44). That found one bug: `getGeneratedKeys()` is not implemented there, so `Conn.insert` uses `last_insert_rowid()` on SQLite.
- Postgres code paths are still untested.

## `:java` tatemono variants

Java code blocks sit beside their `:php`, `:ts`, and `:py` equivalents. The parser selects the exact variant for the active backend; an unsuffixed code body remains the legacy PHP variant, and YAML-only blocks remain shared. The Java generator will compile each selected body as part of a generated method that may `throws Exception`. Intended imports are `dev.pluff.runtime.*`, `static dev.pluff.runtime.Support.*` (so `mapOf(...)` and `sqlNow()` work bare), `java.util.*`, `java.math.*`, plus the Tatemono's generated models.

| Block | Variables in scope | Returns |
|---|---|---|
| `endpoint`, `handler` | `Request request`, `Response response`; handlers also get `List<Object> params` | `Object` |
| `middleware` | `request`, `response`, `Next next` (call `next.run()`) | `Object` |
| `policy` | `Model user`, `Model item` (item may be null) | `boolean` |
| `jobs` | `this.data` (`Map<String,Object>`) | nothing |
| `listener` | `Event event` (`event.data` is a `Map<String,Object>`) | nothing |
| `console` | `this.info(String)` | `Command.SUCCESS` / `Command.FAILURE` |
| `notifications` | `Model user` | `MailMessage` |

Currently implemented body helpers:

- `Request`: `all()`, `input(k)`, `input(k, default)`, `validate(Map rules)` (Laravel rule strings), `user()`, `authUser()`, `route(name)`, `isJson()`, `ip()`.
- `Response`: `json(body)`, `json(body, status)`.
- Generated models: static `query()`, `count()`, `all()`, `find(id)`, `findOrFail(id)`, `create(Map)`; instance methods and query builder live in `Model` and `QueryBuilder`.
- `Support.mapOf(k, v, ...)`: insertion-ordered map that allows null values (`Map.of` does not). Exists.
- `DB.transaction(() -> ...)`: one transaction per tatemono database, rollback on exception.
- `Next`, `Event`, `MailMessage`, `Notification`, `Command`, `Job`, and generated policy/job/listener/console/notification body support are implemented.

Bodies compile with `--release 17`, so they avoid Java 19+ APIs such as virtual-thread executors. Decimal columns are returned as strings (`"10.00"`); read them with `new BigDecimal(model.str("col"))`.

Spring-exclusive examples are `spring-test` (backend contract, validation, CRUD, and pagination) and `spring-ledger` (transactional transfers using `BigDecimal`). Concurrency guarantees and scheduled reconciliation are not yet implemented.