namespace Pluff.AspNet.Generated.FastapiTest.Controllers;

public static class TicketController
{
    public const string Model = "Ticket";
    public const string Prefix = "/api/fastapi-test";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/tickets"),
        ("store", "POST", "/tickets"),
        ("show", "GET", "/tickets/{id}"),
        ("update", "PUT", "/tickets/{id}"),
        ("destroy", "DELETE", "/tickets/{id}"),
        ("stats", "GET", "/stats"),
    };
}
