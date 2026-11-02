package dev.pluff.generated.spring_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("spring-test");
    EventDispatcher.unregister("spring-test");
    CommandRegistry.unregister("spring-test");
    Router router = new Router("spring-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/spring-test/notes", List.of(), (request, response) -> {
      QueryBuilder<Note> query = Note.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 10), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/spring-test/notes", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("title", "required|string|max:160", "body", "sometimes|string", "pinned", "sometimes|boolean"));
      Note created = Note.create(validated);
      return response.json(created, 201);
    });
    router.add("GET", "/api/spring-test/notes/{id}", List.of(), (request, response) -> {
      Note note = Note.findOrFail(request.route("id"));
      return response.json(note);
    });
    router.add("PUT", "/api/spring-test/notes/{id}", List.of(), (request, response) -> {
      Note note = Note.findOrFail(request.route("id"));
      Map<String, Object> validated = request.validate(Support.mapOf("title", "sometimes|string|max:160", "body", "sometimes|string", "pinned", "sometimes|boolean"));
      note.update(validated);
      return response.json(note);
    });
    router.add("DELETE", "/api/spring-test/notes/{id}", List.of(), (request, response) -> {
      Note note = Note.findOrFail(request.route("id"));
      note.delete();
      return response.json(mapOf("message", "Deleted successfully"));
    });
    return router;
  }
  private static Map<String, Map<String, Object>> mailTemplates() {
    Map<String, Map<String, Object>> templates = new LinkedHashMap<>();
    return templates;
  }
  private static Router.Middleware customMiddleware(String name) {
    throw new IllegalArgumentException("Unknown middleware: " + name);
  }
  private static Notification notificationFor(String name) {
    return switch (name) {
      default -> null;
    };
  }
  private static Map<String, Object> objectMap(Object value) {
    Map<String, Object> out = new LinkedHashMap<>();
    if (value instanceof Map<?, ?> values) values.forEach((key, item) -> out.put(String.valueOf(key), item));
    return out;
  }
}
