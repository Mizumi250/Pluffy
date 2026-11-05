namespace Pluff.AspNet.Generated.BodyEndpointHandler.Models;

public sealed class ProbeResult
{
    public long? Id { get; init; }
    public required string Source { get; init; }
    public required string Probe { get; init; }
    public string? Payload { get; init; }
    public string? Result { get; init; }
    public bool? Ok { get; init; }
}
