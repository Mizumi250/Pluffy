namespace Pluff.AspNet.Generated.InventoryManagement;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/inventories", "InventoryController"),
        new(0, "show", "GET", "/api/inventories/{id}", "InventoryController"),
        new(0, "store", "POST", "/api/inventories", "InventoryController"),
        new(0, "update", "PUT", "/api/inventories/{id}", "InventoryController"),
        new(0, "destroy", "DELETE", "/api/inventories/{id}", "InventoryController"),
        new(0, "lowStock", "GET", "/api/inventories/low-stock", "InventoryController"),
    };
}
