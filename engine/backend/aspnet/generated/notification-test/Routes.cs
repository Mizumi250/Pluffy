namespace Pluff.AspNet.Generated.NotificationTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/notification-test/inbox", "NotificationController"),
        new(0, "store", "POST", "/api/notification-test/trigger", "NotificationController"),
        new(0, "destroy", "DELETE", "/api/notification-test/inbox/{id}", "NotificationController"),
        new(0, "readAll", "POST", "/api/notification-test/inbox/read-all", "NotificationController"),
    };
}
