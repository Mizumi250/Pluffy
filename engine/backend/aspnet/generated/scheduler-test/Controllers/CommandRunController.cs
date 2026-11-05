namespace Pluff.AspNet.Generated.SchedulerTest.Controllers;

public static class CommandRunController
{
    public const string Model = "CommandRun";
    public const string Prefix = "/api/scheduler-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/runs"),
        ("store", "POST", "/run"),
        ("destroy", "DELETE", "/runs"),
    };
}
