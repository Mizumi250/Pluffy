namespace Pluff.AspNet.Generated.QueueFlow.Models;

public sealed class Ticket
{
    public long? Id { get; init; }
    public long QueueId { get; init; }
    public required string TicketNumber { get; init; }
    public string? CustomerName { get; init; }
    public string? Status { get; init; }
    public long? Position { get; init; }
    public global::System.DateTime? CalledAt { get; init; }
    public global::System.DateTime? ServedAt { get; init; }
}
