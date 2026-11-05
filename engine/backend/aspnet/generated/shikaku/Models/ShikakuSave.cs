namespace Pluff.AspNet.Generated.Shikaku.Models;

public sealed class ShikakuSave
{
    public long? Id { get; init; }
    public long ProjectId { get; init; }
    public required string FramesJson { get; init; }
    public long? Version { get; init; }
}
