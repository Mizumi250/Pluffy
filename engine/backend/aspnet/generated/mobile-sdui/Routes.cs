namespace Pluff.AspNet.Generated.MobileSdui;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/mobile-sdui/releases", "UiReleaseController"),
        new(0, "store", "POST", "/api/mobile-sdui/releases", "UiReleaseController"),
    };
}
