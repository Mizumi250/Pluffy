namespace Pluff.AspNet.Generated.SchedulerTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/scheduler-test/runs", "CommandRunController"),
        new(0, "store", "POST", "/api/scheduler-test/run", "CommandRunController"),
        new(0, "destroy", "DELETE", "/api/scheduler-test/runs", "CommandRunController"),
    };
}
