namespace Pluff.AspNet.Generated.RolesTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/roles-test/logs", "RoleAuditLogController"),
        new(0, "adminOnly", "GET", "/api/roles-test/admin-only", "RoleAuditLogController"),
        new(0, "userOnly", "GET", "/api/roles-test/user-only", "RoleAuditLogController"),
        new(0, "promote", "POST", "/api/roles-test/promote", "RoleAuditLogController"),
        new(0, "demote", "POST", "/api/roles-test/demote", "RoleAuditLogController"),
    };
}
