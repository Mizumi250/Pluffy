namespace Pluff.AspNet.Generated.DtrGeofencing;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/dtr/employees", "EmployeeController"),
        new(0, "show", "GET", "/api/dtr/employees/{id}", "EmployeeController"),
        new(1, "index", "GET", "/api/dtr/records", "TimeRecordController"),
        new(1, "my_records", "GET", "/api/dtr/my-records/{employee_id}", "TimeRecordController"),
        new(1, "check_in", "POST", "/api/dtr/check-in", "TimeRecordController"),
        new(1, "check_out", "POST", "/api/dtr/check-out", "TimeRecordController"),
        new(2, "index", "GET", "/api/dtr/settings", "DtrSettingController"),
        new(2, "toggle_geofencing", "POST", "/api/dtr/settings/toggle-geofencing", "DtrSettingController"),
        new(2, "update_office", "POST", "/api/dtr/settings/office", "DtrSettingController"),
    };
}
