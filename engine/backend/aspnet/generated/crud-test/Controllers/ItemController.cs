namespace Pluff.AspNet.Generated.CrudTest.Controllers;

public static class ItemController
{
    public const string Model = "Item";
    public const string Prefix = "/api/crud-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/items"),
        ("store", "POST", "/items"),
        ("show", "GET", "/items/{id}"),
        ("update", "PUT", "/items/{id}"),
        ("destroy", "DELETE", "/items/{id}"),
    };
}
