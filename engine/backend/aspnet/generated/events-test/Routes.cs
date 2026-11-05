namespace Pluff.AspNet.Generated.EventsTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/events-test/log", "EventLogController"),
        new(0, "store", "POST", "/api/events-test/fire", "EventLogController"),
        new(0, "clearLog", "POST", "/api/events-test/log/clear", "EventLogController"),
    };
}
