namespace Pluff.AspNet.Generated.SpringTest.Controllers;

public static class NoteController
{
    public const string Model = "Note";
    public const string Prefix = "/api/spring-test/notes";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/"),
        ("store", "POST", "/"),
        ("show", "GET", "/{id}"),
        ("update", "PUT", "/{id}"),
        ("destroy", "DELETE", "/{id}"),
    };
}
