namespace Pluff.AspNet.Generated.Kotoba.Models;

public sealed class Post
{
    public long? Id { get; init; }
    public long UserId { get; init; }
    public required string AuthorName { get; init; }
    public string? AuthorColor { get; init; }
    public string? AuthorNative { get; init; }
    public required string Lang { get; init; }
    public string? Kind { get; init; }
    public long? MissionId { get; init; }
    public required string Body { get; init; }
    public string? Translation { get; init; }
    public long? LikesCount { get; init; }
    public long? CommentsCount { get; init; }
    public long? CorrectionsCount { get; init; }
}
