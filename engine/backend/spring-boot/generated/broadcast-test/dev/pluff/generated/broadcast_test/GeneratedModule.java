package dev.pluff.generated.broadcast_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    Router router = new Router("broadcast-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("POST", "/api/broadcast-test/auth/register", Auth.registerHandler("broadcast-test"));
    router.add("POST", "/api/broadcast-test/auth/login", Auth.loginHandler("broadcast-test"));
    router.add("POST", "/api/broadcast-test/auth/logout", List.of(Auth.authMiddleware("broadcast-test")), Auth.logoutHandler("broadcast-test"));
    router.add("GET", "/api/broadcast-test/auth/me", List.of(Auth.authMiddleware("broadcast-test")), Auth.meHandler());
    router.add("POST", "/api/broadcast-test/auth/broadcasting/auth", List.of(Auth.authMiddleware("broadcast-test")), Auth.broadcastingAuth("broadcast-test", Map.ofEntries(Map.entry("broadcast-test-public", Map.of("type", "public", "auth", "authenticated")), Map.entry("broadcast-test.{id}", Map.of("type", "private", "auth", "authenticated")), Map.entry("broadcast-test-presence", Map.of("type", "presence", "auth", "authenticated")))));
    router.add("GET", "/api/broadcast-test/messages", List.of(), (request, response) -> {
      QueryBuilder<Message> query = Message.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/broadcast-test/messages", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("content", "required|string|max:500", "channel_type", "sometimes|string|max:50"));
      Message created = Message.create(validated);
      return response.json(created, 201);
    });
    router.add("DELETE", "/api/broadcast-test/messages/{id}", List.of(), (request, response) -> {
      Message message = Message.findOrFail(request.route("id"));
      message.delete();
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
}
