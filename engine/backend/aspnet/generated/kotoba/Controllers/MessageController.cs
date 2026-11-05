namespace Pluff.AspNet.Generated.Kotoba.Controllers;

public static class MessageController
{
    public const string Model = "Message";
    public const string Prefix = "/api/kotoba/x/messages";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("status", "GET", "/status"),
    };
}
