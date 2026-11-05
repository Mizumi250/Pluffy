namespace Pluff.AspNet.Generated.AspnetTest.Models;

public sealed class Check
{
    public long? Id { get; init; }
    public long? UserId { get; init; }
    public required string Name { get; init; }
    public string? Status { get; init; }
    public long? Priority { get; init; }
    public bool? Done { get; init; }
}
