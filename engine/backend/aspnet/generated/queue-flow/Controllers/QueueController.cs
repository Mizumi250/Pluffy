namespace Pluff.AspNet.Generated.QueueFlow.Controllers;

public static class QueueController
{
    public const string Model = "Queue";
    public const string Prefix = "/api/queue-flow";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/queues"),
        ("show", "GET", "/queues/{id}"),
        ("store", "POST", "/queues"),
        ("update", "PUT", "/queues/{id}"),
        ("destroy", "DELETE", "/queues/{id}"),
    };
}
