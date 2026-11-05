namespace Pluff.AspNet.Generated.SchedulerTest.Models;

public sealed class CommandRun
{
    public long? Id { get; init; }
    public required string CommandName { get; init; }
    public required string Signature { get; init; }
    public long ExitCode { get; init; }
    public string? Output { get; init; }
    public required string TriggeredBy { get; init; }
    public long? DurationMs { get; init; }
}
