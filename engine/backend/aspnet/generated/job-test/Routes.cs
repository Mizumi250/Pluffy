namespace Pluff.AspNet.Generated.JobTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/job-test/results", "JobResultController"),
        new(0, "store", "POST", "/api/job-test/dispatch", "JobResultController"),
    };
}
