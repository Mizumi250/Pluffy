namespace Pluff.AspNet.Generated.ExpressTest2.Controllers;

public static class CommandController
{
    public const string Model = "CommandRun";
    public const string Prefix = "/api/express-test-2";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/commands"),
        ("store", "POST", "/commands/run"),
    };
}
