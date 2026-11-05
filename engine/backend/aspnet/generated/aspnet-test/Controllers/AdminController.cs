namespace Pluff.AspNet.Generated.AspnetTest.Controllers;

public static class AdminController
{
    public const string Model = "AuditLog";
    public const string Prefix = "/api/aspnet-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("audit", "GET", "/admin/audit"),
    };
}
