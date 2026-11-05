namespace Pluff.AspNet.Generated.MobileSdui.Controllers;

public static class UiReleaseController
{
    public const string Model = "UiRelease";
    public const string Prefix = "/api/mobile-sdui";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/releases"),
        ("store", "POST", "/releases"),
    };
}
