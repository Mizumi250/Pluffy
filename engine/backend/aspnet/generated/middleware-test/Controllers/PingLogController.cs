namespace Pluff.AspNet.Generated.MiddlewareTest.Controllers;

public static class PingLogController
{
    public const string Model = "PingLog";
    public const string Prefix = "/api/middleware-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/ping"),
        ("store", "POST", "/ping"),
    };
}
