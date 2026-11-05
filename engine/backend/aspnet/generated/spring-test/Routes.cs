namespace Pluff.AspNet.Generated.SpringTest;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/spring-test/notes", "NoteController"),
        new(0, "store", "POST", "/api/spring-test/notes", "NoteController"),
        new(0, "show", "GET", "/api/spring-test/notes/{id}", "NoteController"),
        new(0, "update", "PUT", "/api/spring-test/notes/{id}", "NoteController"),
        new(0, "destroy", "DELETE", "/api/spring-test/notes/{id}", "NoteController"),
    };
}
