namespace Pluff.AspNet.Generated.QueueFlow;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/queue-flow/queues", "QueueController"),
        new(0, "show", "GET", "/api/queue-flow/queues/{id}", "QueueController"),
        new(0, "store", "POST", "/api/queue-flow/queues", "QueueController"),
        new(0, "update", "PUT", "/api/queue-flow/queues/{id}", "QueueController"),
        new(0, "destroy", "DELETE", "/api/queue-flow/queues/{id}", "QueueController"),
        new(1, "index", "GET", "/api/queue-flow/tickets", "TicketController"),
        new(1, "store", "POST", "/api/queue-flow/tickets", "TicketController"),
        new(1, "update", "PUT", "/api/queue-flow/tickets/{id}", "TicketController"),
    };
}
