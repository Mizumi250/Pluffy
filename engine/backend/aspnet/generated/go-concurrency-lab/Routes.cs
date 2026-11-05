namespace Pluff.AspNet.Generated.GoConcurrencyLab;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/go-concurrency-lab/tasks", "TaskController"),
        new(0, "store", "POST", "/api/go-concurrency-lab/tasks", "TaskController"),
    };
}
