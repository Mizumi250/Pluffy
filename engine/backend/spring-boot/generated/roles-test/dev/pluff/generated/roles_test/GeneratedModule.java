package dev.pluff.generated.roles_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("roles-test");
    EventDispatcher.unregister("roles-test");
    CommandRegistry.unregister("roles-test");
    Router router = new Router("roles-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("POST", "/api/roles-test/auth/register", Auth.registerHandler("roles-test"));
    router.add("POST", "/api/roles-test/auth/login", Auth.loginHandler("roles-test"));
    router.add("POST", "/api/roles-test/auth/logout", List.of(Auth.authMiddleware("roles-test")), Auth.logoutHandler("roles-test"));
    router.add("GET", "/api/roles-test/auth/me", List.of(Auth.authMiddleware("roles-test")), Auth.meHandler());
    router.add("POST", "/api/roles-test/auth/broadcasting/auth", List.of(Auth.authMiddleware("roles-test")), Auth.broadcastingAuth("roles-test", Map.of()));
    router.add("GET", "/api/roles-test/logs", List.of(Auth.authMiddleware("roles-test")), (request, response) -> {
      QueryBuilder<RoleAuditLog> query = RoleAuditLog.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("GET", "/api/roles-test/admin-only", List.of(Auth.authMiddleware("roles-test")), (request, response) -> {
      Model user = request.authUser();
      boolean granted = user != null && "admin".equals(user.str("role"));
      RoleAuditLog.create(mapOf(
          "user_id", user == null ? null : user.get("id"),
          "action", "GET /admin-only",
          "role_required", "admin",
          "granted", granted
      ));
      if (!granted) {
          return response.json(mapOf("message", "✗ Access denied — admin role required"), 403);
      }
      return response.json(mapOf("message", "✓ Access granted — you are admin"));
    });
    router.add("GET", "/api/roles-test/user-only", List.of(Auth.authMiddleware("roles-test")), (request, response) -> {
      Model user = request.authUser();
      RoleAuditLog.create(mapOf(
          "user_id", user == null ? null : user.get("id"),
          "action", "GET /user-only",
          "role_required", "user",
          "granted", true
      ));
      return response.json(mapOf("message", "✓ Access granted — open to all authenticated users"));
    });
    router.add("POST", "/api/roles-test/promote", List.of(Auth.authMiddleware("roles-test")), (request, response) -> {
      Model user = request.authUser();
      user.update(mapOf("role", "admin"));
      return response.json(mapOf("message", "Promoted to admin", "user", user.fresh()));
    });
    router.add("POST", "/api/roles-test/demote", List.of(Auth.authMiddleware("roles-test")), (request, response) -> {
      Model user = request.authUser();
      user.update(mapOf("role", "user"));
      return response.json(mapOf("message", "Demoted to user", "user", user.fresh()));
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
