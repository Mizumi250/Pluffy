package dev.pluff.generated.auth_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("auth-test");
    EventDispatcher.unregister("auth-test");
    CommandRegistry.unregister("auth-test");
    Router router = new Router("auth-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("POST", "/api/auth-test/auth/register", Auth.registerHandler("auth-test"));
    router.add("POST", "/api/auth-test/auth/login", Auth.loginHandler("auth-test"));
    router.add("POST", "/api/auth-test/auth/logout", List.of(Auth.authMiddleware("auth-test")), Auth.logoutHandler("auth-test"));
    router.add("GET", "/api/auth-test/auth/me", List.of(Auth.authMiddleware("auth-test")), Auth.meHandler());
    router.add("POST", "/api/auth-test/auth/broadcasting/auth", List.of(Auth.authMiddleware("auth-test")), Auth.broadcastingAuth("auth-test", Map.of()));
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
