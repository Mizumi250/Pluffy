package dev.pluff.generated.shikaku;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("shikaku");
    EventDispatcher.unregister("shikaku");
    CommandRegistry.unregister("shikaku");
    Router router = new Router("shikaku");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("POST", "/api/shikaku/auth/register", Auth.registerHandler("shikaku"));
    router.add("POST", "/api/shikaku/auth/login", Auth.loginHandler("shikaku"));
    router.add("POST", "/api/shikaku/auth/logout", List.of(Auth.authMiddleware("shikaku")), Auth.logoutHandler("shikaku"));
    router.add("GET", "/api/shikaku/auth/me", List.of(Auth.authMiddleware("shikaku")), Auth.meHandler());
    router.add("POST", "/api/shikaku/auth/broadcasting/auth", List.of(Auth.authMiddleware("shikaku")), Auth.broadcastingAuth("shikaku", Map.ofEntries(Map.entry("shikaku.project.{id}", Map.of("type", "presence", "auth", "authenticated")))));
    router.add("GET", "/api/shikaku/projects", List.of(Auth.authMiddleware("shikaku")), (request, response) -> {
      QueryBuilder<ShikakuProject> query = ShikakuProject.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/shikaku/projects", List.of(Auth.authMiddleware("shikaku")), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("name", "required|string|max:255", "width", "required|integer|in:8,16,32,64,128", "height", "required|integer|in:8,16,32,64,128"));
      ShikakuProject created = ShikakuProject.create(validated);
      return response.json(created, 201);
    });
    router.add("GET", "/api/shikaku/projects/{id}", List.of(Auth.authMiddleware("shikaku")), (request, response) -> {
      ShikakuProject shikaku_project = ShikakuProject.findOrFail(request.route("id"));
      return response.json(shikaku_project);
    });
    router.add("PUT", "/api/shikaku/projects/{id}", List.of(Auth.authMiddleware("shikaku")), (request, response) -> {
      ShikakuProject shikaku_project = ShikakuProject.findOrFail(request.route("id"));
      Map<String, Object> validated = request.validate(Support.mapOf("name", "sometimes|string|max:255", "thumbnail", "sometimes|nullable|string"));
      shikaku_project.update(validated);
      return response.json(shikaku_project);
    });
    router.add("DELETE", "/api/shikaku/projects/{id}", List.of(Auth.authMiddleware("shikaku")), (request, response) -> {
      ShikakuProject shikaku_project = ShikakuProject.findOrFail(request.route("id"));
      shikaku_project.delete();
      return response.json(mapOf("message", "Deleted successfully"));
    });
    router.add("POST", "/api/shikaku/projects/{project_id}/save", List.of(Auth.authMiddleware("shikaku")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint save is not implemented yet"), 501);
    });
    router.add("GET", "/api/shikaku/projects/{project_id}/latest", List.of(Auth.authMiddleware("shikaku")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint latest is not implemented yet"), 501);
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
