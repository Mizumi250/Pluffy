namespace Pluff.AspNet.Generated.Shikaku;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/shikaku/projects", "ShikakuProjectController"),
        new(0, "store", "POST", "/api/shikaku/projects", "ShikakuProjectController"),
        new(0, "show", "GET", "/api/shikaku/projects/{id}", "ShikakuProjectController"),
        new(0, "update", "PUT", "/api/shikaku/projects/{id}", "ShikakuProjectController"),
        new(0, "destroy", "DELETE", "/api/shikaku/projects/{id}", "ShikakuProjectController"),
        new(1, "save", "POST", "/api/shikaku/projects/{project_id}/save", "ShikakuSaveController"),
        new(1, "latest", "GET", "/api/shikaku/projects/{project_id}/latest", "ShikakuSaveController"),
    };
}
