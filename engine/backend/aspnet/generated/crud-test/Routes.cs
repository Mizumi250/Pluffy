namespace Pluff.AspNet.Generated.CrudTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/crud-test/items", "ItemController"),
        new(0, "store", "POST", "/api/crud-test/items", "ItemController"),
        new(0, "show", "GET", "/api/crud-test/items/{id}", "ItemController"),
        new(0, "update", "PUT", "/api/crud-test/items/{id}", "ItemController"),
        new(0, "destroy", "DELETE", "/api/crud-test/items/{id}", "ItemController"),
    };
}
