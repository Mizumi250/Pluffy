namespace Pluff.AspNet.Generated.DtrGeofencing.Controllers;

public static class DtrSettingController
{
    public const string Model = "DtrSetting";
    public const string Prefix = "/api/dtr";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/settings"),
        ("toggle_geofencing", "POST", "/settings/toggle-geofencing"),
        ("update_office", "POST", "/settings/office"),
    };
}
