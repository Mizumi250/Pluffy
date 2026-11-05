namespace Pluff.AspNet.Generated.SpringTest.Models;

public sealed class Note
{
    public long? Id { get; init; }
    public required string Title { get; init; }
    public string? Body { get; init; }
    public bool Pinned { get; init; }
}
