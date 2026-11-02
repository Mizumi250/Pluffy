package dev.pluff.generated.auth_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
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
}
