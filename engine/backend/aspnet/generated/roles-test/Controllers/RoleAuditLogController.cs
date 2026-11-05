namespace Pluff.AspNet.Generated.RolesTest.Controllers;

public static class RoleAuditLogController
{
    public const string Model = "RoleAuditLog";
    public const string Prefix = "/api/roles-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/logs"),
        ("adminOnly", "GET", "/admin-only"),
        ("userOnly", "GET", "/user-only"),
        ("promote", "POST", "/promote"),
        ("demote", "POST", "/demote"),
    };
}
