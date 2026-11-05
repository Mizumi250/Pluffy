namespace Pluff.AspNet.Generated.BroadcastTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/broadcast-test/messages", "MessageController"),
        new(0, "store", "POST", "/api/broadcast-test/messages", "MessageController"),
        new(0, "destroy", "DELETE", "/api/broadcast-test/messages/{id}", "MessageController"),
    };
}
