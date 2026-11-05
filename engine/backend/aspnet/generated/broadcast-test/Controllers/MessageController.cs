namespace Pluff.AspNet.Generated.BroadcastTest.Controllers;

public static class MessageController
{
    public const string Model = "Message";
    public const string Prefix = "/api/broadcast-test/messages";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/"),
        ("store", "POST", "/"),
        ("destroy", "DELETE", "/{id}"),
    };
}
