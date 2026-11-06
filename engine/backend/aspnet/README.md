# May be outdated. See PLUFF_GUIDELINES and the engine source.


# Pluff ASP.NET Core backend engine

The engine targets .NET 8 and implements the Arkzen backend contract at
`/arkzen/health`, `/arkzen/registry`, `/arkzen/build`, and `/arkzen/remove`.
Build and remove requests use the same `X-Arkzen-Secret` header as the Laravel
and Express engines.

Each build generates per-module C# models, controller action metadata, and a
route table under `generated/<tatemono>`. The engine compiles and loads that
route table with Roslyn, uses it for dispatch, and unloads it on rebuild or
remove. CRUD, middleware, and DSL body execution remain in the shared ASP.NET
runtime.

Set `activeBackend` to `aspnet` in `arkzen.json`. The shared parser maps that
backend to the `cs` variant. Keep YAML/configuration blocks unsuffixed; add
`:cs` to executable endpoint, handler, and middleware block markers. Legacy
unsuffixed code is treated as `:php` and is not an ASP.NET fallback.

```ts
/* @arkzen:endpoint:cs:customAction
*/
return Results.Json(new { message = "Handled by ASP.NET Core" });
/* @arkzen:endpoint:cs:customAction:end */

/* @arkzen:handler:cs:probe
*/
return Results.Json(new { path = Context.Request.Path.Value });
/* @arkzen:handler:cs:probe:end */

/* @arkzen:middleware:cs:requireKey
*/
if (!Context.Request.Headers.ContainsKey("X-Demo-Key"))
    return Results.Json(new { message = "Missing key" }, statusCode: 403);
/* @arkzen:middleware:cs:requireKey:end */
```

`Context`, `Body`, `Database`, `RouteValues`, and the authenticated `user` (if
present) are available in endpoint, handler, and middleware scripts.
`ScriptDatabase.QueryAsync`, `ScalarAsync`, and `ExecuteAsync` provide
parameterized ADO.NET helpers and accept an optional `DbTransaction`. A script
may return an ASP.NET `IResult`; a non-null ordinary value is serialized as
JSON. Handler and endpoint script bodies are compiled when first invoked, and
compilation/runtime errors are returned as HTTP 500 responses with a
server-side diagnostic. Middleware bodies may return an `IResult` to stop the
request; returning no value continues to the route.

The ASP.NET engine starts a separate Pusher/Reverb-compatible WebSocket hub on
`REVERB_PORT` (default `8080`) with the configured app key and secret. It
supports public, HMAC-signed private, and presence channels, including presence
member join/leave notifications. Broadcast endpoints persist their message and
publish it to the matching channel; generated `sse-poll` routes are also
available for clients without WebSocket support.

The engine supports isolated SQLite/PostgreSQL databases, dependency-ordered
table/column creation, indexes and foreign keys, standard CRUD routes, declared
validation rules, token authentication, role middleware, update/delete
policies, custom routes, and `:cs`
endpoint/handler/middleware bodies. Policies can use `user` and `item` JSON
objects in C# snippets; without a snippet, the engine uses owner-column
(`user_id`, `owner_id`, `created_by`, or `author_id`) or admin-role checks.

The `jobs` and `events` DSL execute asynchronously through an in-process queue
with retries and timeouts, but queued work is not durable across restarts and
queues are not isolated. Console DSL bodies can be run manually; cron
scheduling and file storage are not implemented. Mail templates render
Blade-style placeholders and log by default; SMTP delivery can be enabled with
`MAIL_MAILER=smtp` and the `MAIL_*` settings documented in `Runtime/Mail.cs`.
Notification triggers execute their C# `toMail_body` bodies and support
database, mail, and broadcast channels, with authenticated inbox/read/delete
routes. `tatemonos/aspnet-test` and
`tatemonos/aspnet-ledger` exercise the C# endpoint and transaction contracts.
`tatemonos/spring-ledger` also includes a C# transaction variant alongside its
Java implementation. `tatemonos/queue-flow` has C# handlers for its queue
database routes and publishes its queue-updated events through the realtime hub.

Shared-fixture C# variants are still in progress. Matching `:cs` bodies
currently cover `body-endpoint-handler`, `body-mail-notification`, `crud-test`,
`dtr-geofencing`, `events-test`, `inventory-management`, `job-test`,
`jo-payroll`, `mail-test`, `middleware-test`, `notification-test`,
`roles-test`, and `scheduler-test`; `queue-flow` handlers and the
`spring-ledger` transaction are also available. Kotoba handler coverage remains
incomplete.

Install dependencies with `dotnet restore Pluff.AspNet.csproj`, then start with
`dotnet run --project Pluff.AspNet.csproj --urls http://0.0.0.0:8000`.
