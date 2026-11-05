namespace Pluff.AspNet.Generated.UploadTest.Models;

public sealed class UploadedFile
{
    public long? Id { get; init; }
    public long? UserId { get; init; }
    public string? OriginalName { get; init; }
    public string? StoredName { get; init; }
    public string? MimeType { get; init; }
    public long? SizeBytes { get; init; }
    public string? DiskPath { get; init; }
    public bool? IsImage { get; init; }
}
