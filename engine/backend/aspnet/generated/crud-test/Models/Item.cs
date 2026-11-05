namespace Pluff.AspNet.Generated.CrudTest.Models;

public sealed class Item
{
    public long? Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? Status { get; init; }
    public long? Priority { get; init; }
    public string? Tags { get; init; }
}
