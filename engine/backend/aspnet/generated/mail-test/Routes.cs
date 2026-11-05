namespace Pluff.AspNet.Generated.MailTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/mail-test/logs", "MailLogController"),
        new(0, "store", "POST", "/api/mail-test/send", "MailLogController"),
    };
}
