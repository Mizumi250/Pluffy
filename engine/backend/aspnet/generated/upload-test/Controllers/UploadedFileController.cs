namespace Pluff.AspNet.Generated.UploadTest.Controllers;

public static class UploadedFileController
{
    public const string Model = "UploadedFile";
    public const string Prefix = "/api/upload-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/files"),
        ("store", "POST", "/files"),
        ("destroy", "DELETE", "/files/{id}"),
        ("fileUrl", "GET", "/files/{id}/url"),
    };
}
