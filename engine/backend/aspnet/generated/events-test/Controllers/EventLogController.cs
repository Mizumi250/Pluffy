namespace Pluff.AspNet.Generated.EventsTest.Controllers;

public static class EventLogController
{
    public const string Model = "EventLog";
    public const string Prefix = "/api/events-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/log"),
        ("store", "POST", "/fire"),
        ("clearLog", "POST", "/log/clear"),
    };
}
