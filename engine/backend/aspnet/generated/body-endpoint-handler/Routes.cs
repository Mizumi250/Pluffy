namespace Pluff.AspNet.Generated.BodyEndpointHandler;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/body-endpoint-handler/probes", "ProbeResultController"),
        new(0, "store", "POST", "/api/body-endpoint-handler/probes", "ProbeResultController"),
        new(0, "echo", "POST", "/api/body-endpoint-handler/echo", "ProbeResultController"),
        new(0, "stats", "GET", "/api/body-endpoint-handler/stats", "ProbeResultController"),
        new(0, "destroy", "DELETE", "/api/body-endpoint-handler/probes/{id}", "ProbeResultController"),
    };
}
