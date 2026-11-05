namespace Pluff.AspNet.Generated.ExpressTest2.Controllers;

public static class MessagingController
{
    public const string Model = "SendLog";
    public const string Prefix = "/api/express-test-2";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("broadcast", "POST", "/broadcast"),
        ("sendMail", "POST", "/mail"),
        ("notify", "POST", "/notify"),
    };
}
