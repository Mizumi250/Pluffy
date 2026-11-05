namespace Pluff.AspNet.Generated.ExpressTest2.Controllers;

public static class RecordController
{
    public const string Model = "TestRecord";
    public const string Prefix = "/api/express-test-2";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/records"),
        ("store", "POST", "/records"),
        ("show", "GET", "/records/{id}"),
        ("update", "PUT", "/records/{id}"),
        ("destroy", "DELETE", "/records/{id}"),
        ("stats", "GET", "/records/stats"),
    };
}
