namespace Pluff.AspNet.Generated.QueueFlow.Controllers;

public static class TicketController
{
    public const string Model = "Ticket";
    public const string Prefix = "/api/queue-flow";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/tickets"),
        ("store", "POST", "/tickets"),
        ("update", "PUT", "/tickets/{id}"),
    };
}
