namespace Pluff.AspNet.Generated.Kotoba.Controllers;

public static class FollowController
{
    public const string Model = "Follow";
    public const string Prefix = "/api/kotoba/x/follows";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("status", "GET", "/status"),
    };
}
