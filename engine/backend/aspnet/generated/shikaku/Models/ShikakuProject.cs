namespace Pluff.AspNet.Generated.Shikaku.Models;

public sealed class ShikakuProject
{
    public long? Id { get; init; }
    public long UserId { get; init; }
    public required string Name { get; init; }
    public long? Width { get; init; }
    public long? Height { get; init; }
    public string? Thumbnail { get; init; }
}
