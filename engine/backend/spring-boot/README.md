# Pluff Spring Boot backend (`:java` variant): WORK IN PROGRESS, NOT RUNNABLE YET

Third backend target after Laravel and Express. Goal: the same `/arkzen/health | registry | build | remove`
contract on port 8000. Spring Boot only hosts the HTTP layer (one catch-all controller). Everything else is plain
Java in `dev.pluff.runtime`, so it stays easy to read and to compile-check.

## Done (compiles with plain `javac`, partly exercised)
| File | What it is |
|---|---|
| `pom.xml` | Spring Boot 3.5.16 (supports Java 17 up to 25), Java 17 minimum, sqlite-jdbc, Java-WebSocket, snakeyaml, spring-security-crypto |
| `runtime/Support.java` | env/.env, studly/snake, sqlNow, Laravel-style ISO timestamps |
| `runtime/Json.java` | own JSON reader/writer (insertion-ordered, no Jackson) |
| `runtime/Errors.java` | HttpException, ValidationException (422 summary like Laravel), Authentication/Authorization/ModelNotFound |
| `runtime/Conn.java`, `Database.java` | JDBC per tatemono (sqlite file or Postgres database), isolated like the other backends |
| `runtime/QueryBuilder.java`, `Model.java`, `ModelMeta.java` | Eloquent-like models, flat SQL (`a OR b AND c`), Laravel paginator JSON |
| `runtime/Validator.java` | Laravel rule strings with Laravel's exact messages (tested: required/email/min/in/confirmed) |
| `runtime/Hash.java` | bcrypt (jBCrypt), cost 12 like Laravel, verifies Laravel `$2y$` hashes (tested) |
| `engine/Schema.java` | Port of `schema.py`: DDL per dialect, dependency order, add-missing-columns, auth + notification tables, seeders. **Tested against real SQLite** with the database blocks of `queue-flow` and `fastapi-test`, applied twice (rebuild). Seeder resets the id counter, so a rebuild keeps seeded ids at 1,2,... |

## Not written yet
- `runtime`: Http (Request/Res/Router), Auth (tokens, role middleware, /auth routes), Gate (policies), JobQueue (jobs, events, listeners, worker), Commands (+ cron scheduler), Mail, Notifications, Broadcast (Pusher protocol via Java-WebSocket), Storage
- `engine`: Generate (DSL payload -> Java source), Build (javax.tools in-process compile + hot swap)
- `Server` (Spring Boot app + catch-all controller + /arkzen routes), `Worker`, `Cli`
- A `:java` test tatemono, and the `start.js` / `setup.js` / `mizumi.js` wiring

## Known limits of how it was built
- Written in a sandbox where Maven Central is blocked: **Spring, sqlite-jdbc and the BCrypt library were never downloaded or run.**
  Only the files above were compiled (with plain javac) and the JSON/validator parts executed.
- The SQL layer has now run against real SQLite (Debian sqlite-jdbc 3.44). That found one bug: `getGeneratedKeys()` is not implemented there, so `Conn.insert` uses `last_insert_rowid()` on SQLite.
- Postgres code paths are still untested.