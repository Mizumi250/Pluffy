namespace Pluff.AspNet.Generated.UploadTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/upload-test/files", "UploadedFileController"),
        new(0, "store", "POST", "/api/upload-test/files", "UploadedFileController"),
        new(0, "destroy", "DELETE", "/api/upload-test/files/{id}", "UploadedFileController"),
        new(0, "fileUrl", "GET", "/api/upload-test/files/{id}/url", "UploadedFileController"),
    };
}
