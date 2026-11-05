namespace Pluff.AspNet.Generated.Shikaku.Controllers;

public static class ShikakuProjectController
{
    public const string Model = "ShikakuProject";
    public const string Prefix = "/api/shikaku/projects";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/"),
        ("store", "POST", "/"),
        ("show", "GET", "/{id}"),
        ("update", "PUT", "/{id}"),
        ("destroy", "DELETE", "/{id}"),
    };
}
