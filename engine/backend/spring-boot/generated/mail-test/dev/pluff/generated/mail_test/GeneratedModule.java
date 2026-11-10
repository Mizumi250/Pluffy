package dev.pluff.generated.mail_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("mail-test");
    EventDispatcher.unregister("mail-test");
    CommandRegistry.unregister("mail-test");
    Router router = new Router("mail-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("POST", "/api/mail-test/auth/register", Auth.registerHandler("mail-test"));
    router.add("POST", "/api/mail-test/auth/login", Auth.loginHandler("mail-test"));
    router.add("POST", "/api/mail-test/auth/logout", List.of(Auth.authMiddleware("mail-test")), Auth.logoutHandler("mail-test"));
    router.add("GET", "/api/mail-test/auth/me", List.of(Auth.authMiddleware("mail-test")), Auth.meHandler());
    router.add("POST", "/api/mail-test/auth/broadcasting/auth", List.of(Auth.authMiddleware("mail-test")), Auth.broadcastingAuth("mail-test", Map.of()));
    router.add("GET", "/api/mail-test/logs", List.of(Auth.authMiddleware("mail-test")), (request, response) -> {
      QueryBuilder<MailLog> query = MailLog.query();
      return response.json(query.orderBy("created_at", "desc").get());
    });
    router.add("POST", "/api/mail-test/send", List.of(Auth.authMiddleware("mail-test")), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("mail", "required|string", "to", "required|email", "data", "array"));
      String mailKey = String.valueOf(validated.get("mail"));
      Map<String, Object> mail = mailTemplates.get(mailKey);
      if (mail == null) throw new IllegalArgumentException("Unknown mail type: " + mailKey);
      Object rawData = validated.get("data");
      Map<String, Object> data = new LinkedHashMap<>();
      if (rawData instanceof Map<?, ?> values) values.forEach((key, value) -> data.put(String.valueOf(key), value));
      Model user = request.authUser();
      Mail.send(String.valueOf(validated.get("to")), mail, data);
      MailLog sent = MailLog.create(mapOf("user_id", user == null ? null : user.get("id"), "to_email", validated.get("to"), "subject", mail.getOrDefault("subject", mailKey), "mail_class", classNameFor(mailKey, "Mail"), "status", "sent"));
      return response.json(sent, 201);
    });
    return router;
  }
  private static Map<String, Map<String, Object>> mailTemplates() {
    Map<String, Map<String, Object>> templates = new LinkedHashMap<>();
    templates.put("welcome-mail", mapOf("subject", "Welcome to Arkzen", "data", "{username=string, app_name=string}", "template", "<p>Welcome, {{ username }}!</p>\r\n<p>Thanks for joining {{ app_name }}.</p>"));
    templates.put("order-confirmation", mapOf("subject", "Your order has been confirmed", "data", "{order_id=string, total=string, customer_name=string}", "template", "<p>Hi {{ customer_name }},</p>\r\n<p>Your order {{ order_id }} has been confirmed.</p>\r\n<p>Total: {{ total }}</p>"));
    templates.put("password-reset", mapOf("subject", "Reset your password", "data", "{reset_link=string, expires_in=string}", "template", "<p>Use this link to reset your password:</p>\r\n<p><a href=\"{{ reset_link }}\">Reset password</a></p>\r\n<p>This link expires in {{ expires_in }}.</p>"));
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
