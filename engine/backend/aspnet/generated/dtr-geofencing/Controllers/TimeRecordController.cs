namespace Pluff.AspNet.Generated.DtrGeofencing.Controllers;

public static class TimeRecordController
{
    public const string Model = "TimeRecord";
    public const string Prefix = "/api/dtr";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/records"),
        ("my_records", "GET", "/my-records/{employee_id}"),
        ("check_in", "POST", "/check-in"),
        ("check_out", "POST", "/check-out"),
    };
}
