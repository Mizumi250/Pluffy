namespace Pluff.AspNet.Generated.ExpressTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/express-test/tickets", "TicketController"),
        new(0, "store", "POST", "/api/express-test/tickets", "TicketController"),
        new(0, "show", "GET", "/api/express-test/tickets/{id}", "TicketController"),
        new(0, "update", "PUT", "/api/express-test/tickets/{id}", "TicketController"),
        new(0, "destroy", "DELETE", "/api/express-test/tickets/{id}", "TicketController"),
        new(0, "stats", "GET", "/api/express-test/stats", "TicketController"),
        new(1, "index", "GET", "/api/express-test/ping", "PingController"),
    };
}
