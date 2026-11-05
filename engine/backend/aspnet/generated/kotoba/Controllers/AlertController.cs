namespace Pluff.AspNet.Generated.Kotoba.Controllers;

public static class AlertController
{
    public const string Model = "Alert";
    public const string Prefix = "/api/kotoba/x/alerts";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("status", "GET", "/status"),
    };
}
