namespace Pluff.AspNet.Generated.Kotoba.Models;

public sealed class VocabCard
{
    public long? Id { get; init; }
    public long UserId { get; init; }
    public required string Lang { get; init; }
    public required string Term { get; init; }
    public required string Meaning { get; init; }
    public string? Example { get; init; }
    public string? Source { get; init; }
    public double? Ease { get; init; }
    public long? IntervalDays { get; init; }
    public long? Reps { get; init; }
    public long? Lapses { get; init; }
    public global::System.DateOnly? DueDate { get; init; }
}
