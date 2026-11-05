namespace Pluff.AspNet.Generated.AspnetTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/aspnet-test/checks", "CheckController"),
        new(0, "store", "POST", "/api/aspnet-test/checks", "CheckController"),
        new(0, "show", "GET", "/api/aspnet-test/checks/{id}", "CheckController"),
        new(0, "update", "PUT", "/api/aspnet-test/checks/{id}", "CheckController"),
        new(0, "destroy", "DELETE", "/api/aspnet-test/checks/{id}", "CheckController"),
        new(0, "pass", "POST", "/api/aspnet-test/checks/{id}/pass", "CheckController"),
        new(0, "stats", "GET", "/api/aspnet-test/stats", "CheckController"),
        new(1, "health", "GET", "/api/aspnet-test/health", "PublicController"),
        new(2, "ping", "GET", "/api/aspnet-test/ping", "PingController"),
        new(3, "audit", "GET", "/api/aspnet-test/admin/audit", "AdminController"),
    };
}
