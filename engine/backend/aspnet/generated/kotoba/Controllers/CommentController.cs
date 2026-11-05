namespace Pluff.AspNet.Generated.Kotoba.Controllers;

public static class CommentController
{
    public const string Model = "Comment";
    public const string Prefix = "/api/kotoba/x/comments";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("status", "GET", "/status"),
    };
}
