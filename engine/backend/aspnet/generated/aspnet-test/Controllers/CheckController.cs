namespace Pluff.AspNet.Generated.AspnetTest.Controllers;

public static class CheckController
{
    public const string Model = "Check";
    public const string Prefix = "/api/aspnet-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/checks"),
        ("store", "POST", "/checks"),
        ("show", "GET", "/checks/{id}"),
        ("update", "PUT", "/checks/{id}"),
        ("destroy", "DELETE", "/checks/{id}"),
        ("pass", "POST", "/checks/{id}/pass"),
        ("stats", "GET", "/stats"),
    };
}
