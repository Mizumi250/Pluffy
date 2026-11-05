namespace Pluff.AspNet.Generated.ExpressTest2.Controllers;

public static class DispatchController
{
    public const string Model = "JobResult";
    public const string Prefix = "/api/express-test-2";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("store", "POST", "/jobs/dispatch"),
    };
}
