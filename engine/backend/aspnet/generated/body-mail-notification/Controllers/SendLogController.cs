namespace Pluff.AspNet.Generated.BodyMailNotification.Controllers;

public static class SendLogController
{
    public const string Model = "SendLog";
    public const string Prefix = "/api/body-mail-notification";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/log"),
        ("sendMail", "POST", "/send-mail"),
        ("notify", "POST", "/notify"),
        ("clearLog", "DELETE", "/log/clear"),
    };
}
