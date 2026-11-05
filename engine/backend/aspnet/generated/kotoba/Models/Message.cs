namespace Pluff.AspNet.Generated.Kotoba.Models;

public sealed class Message
{
    public long? Id { get; init; }
    public long? ConversationId { get; init; }
    public long? CircleId { get; init; }
    public long SenderId { get; init; }
    public required string SenderName { get; init; }
    public string? SenderColor { get; init; }
    public required string Body { get; init; }
    public string? Lang { get; init; }
    public string? Corrected { get; init; }
    public string? Note { get; init; }
    public long? CorrectedBy { get; init; }
}
