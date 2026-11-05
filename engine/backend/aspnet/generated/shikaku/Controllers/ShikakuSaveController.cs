namespace Pluff.AspNet.Generated.Shikaku.Controllers;

public static class ShikakuSaveController
{
    public const string Model = "ShikakuSave";
    public const string Prefix = "/api/shikaku/projects";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("save", "POST", "/{project_id}/save"),
        ("latest", "GET", "/{project_id}/latest"),
    };
}
