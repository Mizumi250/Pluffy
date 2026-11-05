namespace Pluff.AspNet.Generated.MailTest.Controllers;

public static class MailLogController
{
    public const string Model = "MailLog";
    public const string Prefix = "/api/mail-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/logs"),
        ("store", "POST", "/send"),
    };
}
