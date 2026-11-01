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

`Context`, `Body`, `Database`, and `RouteValues` are available in endpoint and
handler scripts. A script may return an ASP.NET `IResult`; a non-null ordinary
value is serialized as JSON. Handler and endpoint script bodies are compiled
when first invoked, and compilation/runtime errors are returned as HTTP 500
responses with a server-side diagnostic. Middleware bodies may return an
`IResult` to stop the request; returning no value continues to the route.

The initial engine supports isolated SQLite/PostgreSQL databases, basic
table/column creation, standard CRUD routes, token authentication, role
middleware, custom routes, and `:cs` endpoint/handler/middleware bodies.
Laravel-specific facilities that do not yet have an ASP.NET implementation
(including policies, queues, and realtime services) must not be assumed to
work; unsupported endpoints return HTTP 501 rather than a success-shaped
placeholder.

Install dependencies with `dotnet restore Pluff.AspNet.csproj`, then start with
`dotnet run --project Pluff.AspNet.csproj --urls http://0.0.0.0:8000`.
