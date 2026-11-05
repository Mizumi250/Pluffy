namespace Pluff.AspNet.Generated.BroadcastTest.Models;

public sealed class Message
{
    public long? Id { get; init; }
    public long? UserId { get; init; }
    public required string Content { get; init; }
    public string? ChannelType { get; init; }
}
