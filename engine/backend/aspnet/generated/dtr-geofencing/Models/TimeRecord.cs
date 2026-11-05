namespace Pluff.AspNet.Generated.DtrGeofencing.Models;

public sealed class TimeRecord
{
    public long? Id { get; init; }
    public long EmployeeId { get; init; }
    public required string Type { get; init; }
    public global::System.DateTime Timestamp { get; init; }
    public decimal? Latitude { get; init; }
    public decimal? Longitude { get; init; }
    public bool? WithinGeofence { get; init; }
    public string? Notes { get; init; }
}
