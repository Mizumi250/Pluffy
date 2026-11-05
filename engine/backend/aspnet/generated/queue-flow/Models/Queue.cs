namespace Pluff.AspNet.Generated.QueueFlow.Models;

public sealed class Queue
{
    public long? Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? Prefix { get; init; }
    public bool? IsActive { get; init; }
    public long? AvgWaitMinutes { get; init; }
}
