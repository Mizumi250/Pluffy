namespace Pluff.AspNet.Generated.BodyEndpointHandler.Controllers;

public static class ProbeResultController
{
    public const string Model = "ProbeResult";
    public const string Prefix = "/api/body-endpoint-handler";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/probes"),
        ("store", "POST", "/probes"),
        ("echo", "POST", "/echo"),
        ("stats", "GET", "/stats"),
        ("destroy", "DELETE", "/probes/{id}"),
    };
}
