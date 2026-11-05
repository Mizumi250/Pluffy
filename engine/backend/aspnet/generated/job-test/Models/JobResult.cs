namespace Pluff.AspNet.Generated.JobTest.Models;

public sealed class JobResult
{
    public long? Id { get; init; }
    public required string JobName { get; init; }
    public required string Status { get; init; }
    public string? Result { get; init; }
    public global::System.DateTime? ProcessedAt { get; init; }
}
