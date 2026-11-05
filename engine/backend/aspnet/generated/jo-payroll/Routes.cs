namespace Pluff.AspNet.Generated.JoPayroll;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/jo-payroll/job-orders", "JobOrderController"),
        new(0, "store", "POST", "/api/jo-payroll/job-orders", "JobOrderController"),
        new(0, "show", "GET", "/api/jo-payroll/job-orders/{id}", "JobOrderController"),
        new(0, "update", "PUT", "/api/jo-payroll/job-orders/{id}", "JobOrderController"),
        new(0, "destroy", "DELETE", "/api/jo-payroll/job-orders/{id}", "JobOrderController"),
        new(0, "summary", "GET", "/api/jo-payroll/job-orders/stats/summary", "JobOrderController"),
        new(0, "byGroup", "GET", "/api/jo-payroll/job-orders/group/{group}", "JobOrderController"),
        new(0, "appointments", "GET", "/api/jo-payroll/job-orders/appointments/list", "JobOrderController"),
    };
}
