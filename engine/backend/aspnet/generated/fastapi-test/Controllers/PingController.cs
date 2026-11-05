namespace Pluff.AspNet.Generated.FastapiTest.Controllers;

public static class PingController
{
    public const string Model = "JobResult";
    public const string Prefix = "/api/fastapi-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/ping"),
    };
}
