namespace Pluff.AspNet.Generated.FastapiTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/fastapi-test/tickets", "TicketController"),
        new(0, "store", "POST", "/api/fastapi-test/tickets", "TicketController"),
        new(0, "show", "GET", "/api/fastapi-test/tickets/{id}", "TicketController"),
        new(0, "update", "PUT", "/api/fastapi-test/tickets/{id}", "TicketController"),
        new(0, "destroy", "DELETE", "/api/fastapi-test/tickets/{id}", "TicketController"),
        new(0, "stats", "GET", "/api/fastapi-test/stats", "TicketController"),
        new(1, "index", "GET", "/api/fastapi-test/ping", "PingController"),
    };
}
