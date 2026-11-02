package dev.pluff.generated.middleware_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    Router router = new Router("middleware-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/middleware-test/ping", List.of(customMiddleware("requireJson")), (request, response) -> {
      QueryBuilder<PingLog> query = PingLog.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/middleware-test/ping", List.of(customMiddleware("requireJson")), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("message", "required|string|max:255", "headers_ok", "sometimes|boolean"));
      PingLog created = PingLog.create(validated);
      return response.json(created, 201);
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
