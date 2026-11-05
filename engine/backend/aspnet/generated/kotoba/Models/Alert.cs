namespace Pluff.AspNet.Generated.Kotoba.Models;

public sealed class Alert
{
    public long? Id { get; init; }
    public long UserId { get; init; }
    public required string Kind { get; init; }
    public required string Text { get; init; }
    public long? Ref { get; init; }
    public bool? IsRead { get; init; }
}
