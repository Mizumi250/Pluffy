namespace Pluff.AspNet.Generated.EventsTest.Models;

public sealed class EventLog
{
    public long? Id { get; init; }
    public required string EventName { get; init; }
    public required string ListenerName { get; init; }
    public string? Status { get; init; }
    public string? Payload { get; init; }
    public long? DurationMs { get; init; }
}
