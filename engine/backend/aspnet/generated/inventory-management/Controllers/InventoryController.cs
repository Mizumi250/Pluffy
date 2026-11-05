namespace Pluff.AspNet.Generated.InventoryManagement.Controllers;

public static class InventoryController
{
    public const string Model = "Inventory";
    public const string Prefix = "/api/inventories";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/"),
        ("show", "GET", "/{id}"),
        ("store", "POST", "/"),
        ("update", "PUT", "/{id}"),
        ("destroy", "DELETE", "/{id}"),
        ("lowStock", "GET", "/low-stock"),
    };
}
