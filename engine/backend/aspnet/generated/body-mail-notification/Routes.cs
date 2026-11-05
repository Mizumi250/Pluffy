namespace Pluff.AspNet.Generated.BodyMailNotification;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/body-mail-notification/log", "SendLogController"),
        new(0, "sendMail", "POST", "/api/body-mail-notification/send-mail", "SendLogController"),
        new(0, "notify", "POST", "/api/body-mail-notification/notify", "SendLogController"),
        new(0, "clearLog", "DELETE", "/api/body-mail-notification/log/clear", "SendLogController"),
    };
}
