namespace Pluff.AspNet.Generated.Kotoba.Models;

public sealed class Circle
{
    public long? Id { get; init; }
    public required string Name { get; init; }
    public string? Emoji { get; init; }
    public required string Lang { get; init; }
    public string? Level { get; init; }
    public string? Description { get; init; }
    public long OwnerId { get; init; }
    public long? MembersCount { get; init; }
    public long? WeeklyGoal { get; init; }
}
