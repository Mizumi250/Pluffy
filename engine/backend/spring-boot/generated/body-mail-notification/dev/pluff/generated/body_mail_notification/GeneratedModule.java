package dev.pluff.generated.body_mail_notification;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("body-mail-notification");
    EventDispatcher.unregister("body-mail-notification");
    CommandRegistry.unregister("body-mail-notification");
    Router router = new Router("body-mail-notification");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("POST", "/api/body-mail-notification/auth/register", Auth.registerHandler("body-mail-notification"));
    router.add("POST", "/api/body-mail-notification/auth/login", Auth.loginHandler("body-mail-notification"));
    router.add("POST", "/api/body-mail-notification/auth/logout", List.of(Auth.authMiddleware("body-mail-notification")), Auth.logoutHandler("body-mail-notification"));
    router.add("GET", "/api/body-mail-notification/auth/me", List.of(Auth.authMiddleware("body-mail-notification")), Auth.meHandler());
    router.add("POST", "/api/body-mail-notification/auth/broadcasting/auth", List.of(Auth.authMiddleware("body-mail-notification")), Auth.broadcastingAuth("body-mail-notification", Map.ofEntries(Map.entry("body-mail-notification.{id}", Map.of("type", "private", "auth", "owner")))));
    router.add("GET", "/api/body-mail-notification/log", List.of(Auth.authMiddleware("body-mail-notification")), (request, response) -> {
      QueryBuilder<SendLog> query = SendLog.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/body-mail-notification/send-mail", List.of(Auth.authMiddleware("body-mail-notification")), (request, response) -> {
      Map<String, Object> validated = request.validate(mapOf(
          "mail", "required|string|in:welcome,receipt,alert",
          "to", "required|email"
      ));
      String mailKey = String.valueOf(validated.get("mail"));
      Map<String, Object> template = mailTemplates.get(mailKey);
      if (template == null) {
          return response.json(mapOf("message", "Unknown mail type: " + mailKey), 422);
      }
      Map<String, Object> mailData = switch (mailKey) {
          case "welcome" -> mapOf("name", "Test User", "app_name", "Arkzen");
          case "receipt" -> mapOf("order_id", "ORD-001", "amount", "$9.99", "item_name", "Arkzen Test Item");
          case "alert" -> mapOf("alert_message", "This is a test alert from Arkzen.", "action_url", "/");
          default -> mapOf();
      };
      Model user = request.authUser();
      String to = String.valueOf(validated.get("to"));
      String mailClass = classNameFor(mailKey, "Mail");
      try {
          Mail.send(to, template, mailData);
          SendLog log = SendLog.create(mapOf(
              "user_id", user == null ? null : user.get("id"),
              "to_email", to,
              "subject", mailKey,
              "mail_class", mailClass,
              "kind", "mail",
              "status", "sent"
          ));
          return response.json(log, 201);
      } catch (Exception error) {
          SendLog log = SendLog.create(mapOf(
              "user_id", user == null ? null : user.get("id"),
              "to_email", to,
              "subject", mailKey,
              "mail_class", mailClass,
              "kind", "mail",
              "status", "failed",
              "error", String.valueOf(error.getMessage())
          ));
          return response.json(log, 201);
      }
    });
    router.add("POST", "/api/body-mail-notification/notify", List.of(Auth.authMiddleware("body-mail-notification")), (request, response) -> {
      Map<String, Object> validated = request.validate(mapOf(
          "notification", "required|string|in:action-required,summary",
          "message", "sometimes|string|max:255"
      ));
      Model user = request.authUser();
      String notificationKey = String.valueOf(validated.get("notification"));
      String notificationClass = classNameFor(notificationKey, "Notification");
      Object rawMessage = validated.get("message");
      String message = rawMessage == null
          ? ("action-required".equals(notificationKey)
              ? "You have a pending action that requires your attention."
              : "Here is your latest activity summary.")
          : String.valueOf(rawMessage);
      String subject = "action-required".equals(notificationKey)
          ? "⚠ Action Required — toMail_body injection test"
          : "📊 Activity Summary — toMail_body injection test";
      String template = "action-required".equals(notificationKey)
          ? "<p>Hello!</p><p>{{ $message }}</p><p>This toMail() body was injected via the Arkzen DSL — not a stub.</p><p><a href=\"/\">Review Now</a></p><p>NotificationBuilder v3.9 toMail_body injection confirmed ✓</p>"
          : "<p>Hi there!</p><p>{{ $message }}</p><p>Notifications: 2 unread | Mails: 3 sent | Status: All healthy</p><p><a href=\"/\">View Dashboard</a></p><p>Cheers, Arkzen Engine</p>";
      try {
          Mail.send(user.str("email"), mapOf("subject", subject, "template", template), mapOf("message", message));
          String now = sqlNow();
          DB.table("notifications").insert(mapOf(
              "id", java.util.UUID.randomUUID().toString(),
              "type", notificationClass,
              "notifiable_type", user.getClass().getName(),
              "notifiable_id", user.get("id"),
              "data", Json.stringify(mapOf("message", message, "type", notificationClass)),
              "read_at", null,
              "created_at", now,
              "updated_at", now
          ));
          SendLog log = SendLog.create(mapOf(
              "user_id", user.get("id"),
              "to_email", user.str("email"),
              "subject", notificationKey,
              "mail_class", notificationClass,
              "kind", "notification",
              "status", "sent"
          ));
          return response.json(log, 201);
      } catch (Exception error) {
          SendLog log = SendLog.create(mapOf(
              "user_id", user.get("id"),
              "to_email", user.str("email"),
              "subject", notificationKey,
              "mail_class", notificationClass,
              "kind", "notification",
              "status", "failed",
              "error", String.valueOf(error.getMessage())
          ));
          return response.json(log, 201);
      }
    });
    router.add("DELETE", "/api/body-mail-notification/log/clear", List.of(Auth.authMiddleware("body-mail-notification")), (request, response) -> {
      Model user = request.authUser();
      SendLog.query().where("user_id", user == null ? null : user.get("id")).delete();
      return response.json(mapOf("message", "Log cleared"));
    });
    return router;
  }
  private static Map<String, Map<String, Object>> mailTemplates() {
    Map<String, Map<String, Object>> templates = new LinkedHashMap<>();
    templates.put("welcome", mapOf("subject", "Welcome to Arkzen — blade_body injection test", "data", "{name=string, app_name=string}", "template", "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n  <meta charset=\"UTF-8\">\r\n  <style>\r\n    body { font-family: sans-serif; background: #f8fafc; margin: 0; padding: 32px; }\r\n    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 520px; margin: auto; box-shadow: 0 2px 12px rgba(0,0,0,.08); }\r\n    h1 { font-size: 22px; color: #1e293b; margin-bottom: 8px; }\r\n    p { color: #475569; line-height: 1.6; }\r\n    .badge { display: inline-block; background: #0f172a; color: #fff; border-radius: 6px; padding: 4px 12px; font-size: 12px; margin-top: 16px; }\r\n  </style>\r\n</head>\r\n<body>\r\n  <div class=\"card\">\r\n    <h1>Welcome, {{ $name }}!</h1>\r\n    <p>You are now part of <strong>{{ $app_name }}</strong>. This email was generated from a <code>blade_body</code> block injected via the Arkzen DSL — no manually created Blade file required.</p>\r\n    <span class=\"badge\">✓ blade_body injection works</span>\r\n  </div>\r\n</body>\r\n</html>"));
    templates.put("receipt", mapOf("subject", "Your receipt — blade_body injection test", "data", "{order_id=string, amount=string, item_name=string}", "template", "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n  <meta charset=\"UTF-8\">\r\n  <style>\r\n    body { font-family: sans-serif; background: #f0fdf4; margin: 0; padding: 32px; }\r\n    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 520px; margin: auto; border: 1px solid #bbf7d0; }\r\n    h1 { color: #15803d; font-size: 20px; }\r\n    table { width: 100%; border-collapse: collapse; margin-top: 16px; }\r\n    td { padding: 8px 0; border-bottom: 1px solid #f0fdf4; color: #374151; }\r\n    td:last-child { text-align: right; font-weight: 600; }\r\n  </style>\r\n</head>\r\n<body>\r\n  <div class=\"card\">\r\n    <h1>🧾 Receipt #{{ $order_id }}</h1>\r\n    <table>\r\n      <tr><td>Item</td><td>{{ $item_name }}</td></tr>\r\n      <tr><td>Amount</td><td>{{ $amount }}</td></tr>\r\n      <tr><td>Status</td><td>✅ Paid</td></tr>\r\n    </table>\r\n    <p style=\"margin-top:16px;font-size:12px;color:#6b7280;\">blade_body injected receipt — no stub used.</p>\r\n  </div>\r\n</body>\r\n</html>"));
    templates.put("alert", mapOf("subject", "⚠ Action Required — blade_body injection test", "data", "{alert_message=string, action_url=string}", "template", "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n  <meta charset=\"UTF-8\">\r\n  <style>\r\n    body { font-family: sans-serif; background: #fff7ed; margin: 0; padding: 32px; }\r\n    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 520px; margin: auto; border-left: 4px solid #f97316; }\r\n    h1 { color: #c2410c; font-size: 18px; }\r\n    p { color: #374151; }\r\n    a { display: inline-block; margin-top: 16px; background: #f97316; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; }\r\n  </style>\r\n</head>\r\n<body>\r\n  <div class=\"card\">\r\n    <h1>⚠ Action Required</h1>\r\n    <p>{{ $alert_message }}</p>\r\n    <a href=\"{{ $action_url }}\">Take Action</a>\r\n    <p style=\"margin-top:16px;font-size:12px;color:#9ca3af;\">Injected via blade_body — MailBuilder v3.1 test.</p>\r\n  </div>\r\n</body>\r\n</html>"));
    return templates;
  }
  private static Router.Middleware customMiddleware(String name) {
    throw new IllegalArgumentException("Unknown middleware: " + name);
  }
  public static final class ActionRequiredNotification extends Notification {
    @Override public String tatemono() { return "body-mail-notification"; }
    @Override public String name() { return "ActionRequiredNotification"; }
    @Override public List<String> channels() { return List.of("mail", "database"); }
    @Override public String channelType() { return "private"; }
    @Override public String channel() { return "body-mail-notification"; }
    @Override public Map<String, Object> toDatabase(Model notifiable) { return mapOf("message", "You have a pending action that requires your attention.", "type", name()); }
    @Override public MailMessage toMail(Model notifiable) {
      return MailMessage.fromMap(mapOf(
          "subject", "⚠ Action Required — toMail_body injection test",
          "greeting", "Hello!",
          "lines", List.of(
              "You have a pending action that requires your attention.",
              "This toMail() body was injected via the Arkzen DSL — not a stub.",
              "NotificationBuilder v3.9 toMail_body injection confirmed ✓"
          ),
          "action", mapOf("label", "Review Now", "url", "/")
      ));
    }
  }
  public static final class SummaryNotification extends Notification {
    @Override public String tatemono() { return "body-mail-notification"; }
    @Override public String name() { return "SummaryNotification"; }
    @Override public List<String> channels() { return List.of("mail", "database"); }
    @Override public String channelType() { return "private"; }
    @Override public String channel() { return "body-mail-notification"; }
    @Override public Map<String, Object> toDatabase(Model notifiable) { return mapOf("message", "Here is your activity summary.", "type", name()); }
    @Override public MailMessage toMail(Model notifiable) {
      return MailMessage.fromMap(mapOf(
          "subject", "📊 Activity Summary — toMail_body injection test",
          "greeting", "Hi there!",
          "lines", List.of(
              "Here is your latest activity summary.",
              "Notifications: 2 unread | Mails: 3 sent | Status: All healthy"
          ),
          "action", mapOf("label", "View Dashboard", "url", "/"),
          "salutation", "Cheers, Arkzen Engine"
      ));
    }
  }
  private static Notification notificationFor(String name) {
    return switch (name) {
      case "action-required" -> new ActionRequiredNotification();
      case "summary" -> new SummaryNotification();
      default -> null;
    };
  }
  private static Map<String, Object> objectMap(Object value) {
    Map<String, Object> out = new LinkedHashMap<>();
    if (value instanceof Map<?, ?> values) values.forEach((key, item) -> out.put(String.valueOf(key), item));
    return out;
  }
}
