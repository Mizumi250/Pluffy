namespace Pluff.AspNet.Generated.GoBackendTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/go-backend-test/notes", "NoteController"),
        new(0, "store", "POST", "/api/go-backend-test/notes", "NoteController"),
        new(0, "show", "GET", "/api/go-backend-test/notes/{id}", "NoteController"),
        new(0, "update", "PUT", "/api/go-backend-test/notes/{id}", "NoteController"),
        new(0, "destroy", "DELETE", "/api/go-backend-test/notes/{id}", "NoteController"),
    };
}
