namespace Pluff.AspNet.Generated.Kotoba.Models;

public sealed class Profile
{
    public long? Id { get; init; }
    public long UserId { get; init; }
    public required string DisplayName { get; init; }
    public string? Bio { get; init; }
    public string? NativeLang { get; init; }
    public string? LearningLang { get; init; }
    public string? Level { get; init; }
    public string? Country { get; init; }
    public string? Interests { get; init; }
    public string? AvatarColor { get; init; }
    public long? Xp { get; init; }
    public long? Streak { get; init; }
    public long? BestStreak { get; init; }
    public global::System.DateOnly? LastActive { get; init; }
    public long? DailyGoal { get; init; }
    public long? WordsWritten { get; init; }
    public long? MessagesSent { get; init; }
    public bool? Onboarded { get; init; }
}
