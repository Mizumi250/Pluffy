namespace Pluff.AspNet.Generated.Kotoba.Models;

public sealed class Lesson
{
    public long? Id { get; init; }
    public required string Lang { get; init; }
    public required string Unit { get; init; }
    public required string Title { get; init; }
    public string? Emoji { get; init; }
    public string? Level { get; init; }
    public long? Position { get; init; }
    public long? Xp { get; init; }
    public required string Content { get; init; }
}
