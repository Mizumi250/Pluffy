namespace Pluff.AspNet.Generated.GoConcurrencyLab.Controllers;

public static class TaskController
{
    public const string Model = "Task";
    public const string Prefix = "/api/go-concurrency-lab/tasks";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/"),
        ("store", "POST", "/"),
    };
}
