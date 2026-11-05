namespace Pluff.AspNet.Generated.DtrGeofencing.Controllers;

public static class EmployeeController
{
    public const string Model = "Employee";
    public const string Prefix = "/api/dtr";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/employees"),
        ("show", "GET", "/employees/{id}"),
    };
}
