namespace Pluff.AspNet.Generated.AspnetTest.Models;

public sealed class AuditLog
{
    public long? Id { get; init; }
    public required string Action { get; init; }
    public long? CheckId { get; init; }
    public string? Actor { get; init; }
    public string? Detail { get; init; }
}
