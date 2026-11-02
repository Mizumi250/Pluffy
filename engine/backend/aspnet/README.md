# Pluff ASP.NET Core backend engine

The engine targets .NET 8 and implements the Arkzen backend contract at
`/arkzen/health`, `/arkzen/registry`, `/arkzen/build`, and `/arkzen/remove`.
Build and remove requests use the same `X-Arkzen-Secret` header as the Laravel
and Express engines.

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

The engine supports isolated SQLite/PostgreSQL databases, dependency-ordered
table/column creation, indexes and foreign keys, standard CRUD routes, declared
validation rules, token authentication, role middleware, update/delete
policies, custom routes, and `:cs`
endpoint/handler/middleware bodies. Policies can use `user` and `item` JSON
objects in C# snippets; without a snippet, the engine uses owner-column
(`user_id`, `owner_id`, `created_by`, or `author_id`) or admin-role checks.

Queue/scheduler workers, realtime services, and file storage are not implemented
yet. The engine reports unsupported features rather than returning a
success-shaped placeholder. `tatemonos/aspnet-test` and
`tatemonos/aspnet-ledger` exercise the C# endpoint and transaction contracts.
`tatemonos/spring-ledger` also includes a C# transaction variant alongside its
Java implementation. `tatemonos/queue-flow` has C# handlers for its queue
database routes; realtime broadcasting remains unsupported.

The shared-fixture C# variants are still in progress. Matching `:cs` bodies
currently cover `body-endpoint-handler`, `crud-test`, `dtr-geofencing`,
`inventory-management`, `jo-payroll`, `middleware-test`, and `roles-test`; the
`queue-flow` handlers and `spring-ledger` transaction are also available, but
the other fixtures in the Spring parity set do not yet have full C# body
coverage.

Install dependencies with `dotnet restore Pluff.AspNet.csproj`, then start with
`dotnet run --project Pluff.AspNet.csproj --urls http://0.0.0.0:8000`.
