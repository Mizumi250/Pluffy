namespace Pluff.AspNet.Generated.Kotoba.Models;

public sealed class Comment
{
    public long? Id { get; init; }
    public long PostId { get; init; }
    public long UserId { get; init; }
    public required string AuthorName { get; init; }
    public string? AuthorColor { get; init; }
    public required string Body { get; init; }
    public bool? IsCorrection { get; init; }
    public string? Corrected { get; init; }
    public string? Explanation { get; init; }
    public bool? Accepted { get; init; }
}
