namespace Pluff.AspNet.Generated.Kotoba.Controllers;

public static class ConversationController
{
    public const string Model = "Conversation";
    public const string Prefix = "/api/kotoba/x/conversations";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("status", "GET", "/status"),
    };
}
