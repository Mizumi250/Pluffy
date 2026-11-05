namespace Pluff.AspNet.Generated.JoPayroll.Controllers;

public static class JobOrderController
{
    public const string Model = "JobOrder";
    public const string Prefix = "/api/jo-payroll";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/job-orders"),
        ("store", "POST", "/job-orders"),
        ("show", "GET", "/job-orders/{id}"),
        ("update", "PUT", "/job-orders/{id}"),
        ("destroy", "DELETE", "/job-orders/{id}"),
        ("summary", "GET", "/job-orders/stats/summary"),
        ("byGroup", "GET", "/job-orders/group/{group}"),
        ("appointments", "GET", "/job-orders/appointments/list"),
    };
}
