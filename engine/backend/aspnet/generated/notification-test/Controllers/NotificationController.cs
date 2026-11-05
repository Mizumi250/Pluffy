namespace Pluff.AspNet.Generated.NotificationTest.Controllers;

public static class NotificationController
{
    public const string Model = "Notification";
    public const string Prefix = "/api/notification-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/inbox"),
        ("store", "POST", "/trigger"),
        ("destroy", "DELETE", "/inbox/{id}"),
        ("readAll", "POST", "/inbox/read-all"),
    };
}
