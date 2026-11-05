namespace Pluff.AspNet.Generated.Kotoba.Models;

public sealed class Mission
{
    public long? Id { get; init; }
    public string? Lang { get; init; }
    public string? Level { get; init; }
    public required string Title { get; init; }
    public required string Prompt { get; init; }
    public string? Hint { get; init; }
    public long? Position { get; init; }
}
