namespace Pluff.AspNet.Generated.Kotoba.Models;

public sealed class Conversation
{
    public long? Id { get; init; }
    public long UserA { get; init; }
    public long UserB { get; init; }
    public string? LastMessage { get; init; }
    public global::System.DateTime? LastAt { get; init; }
}
