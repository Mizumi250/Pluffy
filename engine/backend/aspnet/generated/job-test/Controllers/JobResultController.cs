namespace Pluff.AspNet.Generated.JobTest.Controllers;

public static class JobResultController
{
    public const string Model = "JobResult";
    public const string Prefix = "/api/job-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/results"),
        ("store", "POST", "/dispatch"),
    };
}
