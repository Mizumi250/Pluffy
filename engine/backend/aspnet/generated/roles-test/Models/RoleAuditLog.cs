namespace Pluff.AspNet.Generated.RolesTest.Models;

public sealed class RoleAuditLog
{
    public long? UserId { get; init; }
    public string? Action { get; init; }
    public string? RoleRequired { get; init; }
    public bool? Granted { get; init; }
}
