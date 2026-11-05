namespace Pluff.AspNet.Generated.MiddlewareTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/middleware-test/ping", "PingLogController"),
        new(0, "store", "POST", "/api/middleware-test/ping", "PingLogController"),
    };
}
