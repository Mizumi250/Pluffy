namespace Pluff.AspNet.Generated.RustBackendTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/rust-backend-test/notes", "NoteController"),
        new(0, "store", "POST", "/api/rust-backend-test/notes", "NoteController"),
        new(0, "show", "GET", "/api/rust-backend-test/notes/{id}", "NoteController"),
        new(0, "update", "PUT", "/api/rust-backend-test/notes/{id}", "NoteController"),
        new(0, "destroy", "DELETE", "/api/rust-backend-test/notes/{id}", "NoteController"),
    };
}
