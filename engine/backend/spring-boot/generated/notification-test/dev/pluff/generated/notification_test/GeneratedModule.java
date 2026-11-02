package dev.pluff.generated.notification_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("notification-test");
    EventDispatcher.unregister("notification-test");
    CommandRegistry.unregister("notification-test");
    Router router = new Router("notification-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("POST", "/api/notification-test/auth/register", Auth.registerHandler("notification-test"));
    router.add("POST", "/api/notification-test/auth/login", Auth.loginHandler("notification-test"));
    router.add("POST", "/api/notification-test/auth/logout", List.of(Auth.authMiddleware("notification-test")), Auth.logoutHandler("notification-test"));
    router.add("GET", "/api/notification-test/auth/me", List.of(Auth.authMiddleware("notification-test")), Auth.meHandler());
    router.add("POST", "/api/notification-test/auth/broadcasting/auth", List.of(Auth.authMiddleware("notification-test")), Auth.broadcastingAuth("notification-test", Map.ofEntries(Map.entry("notification-test.{id}", Map.of("type", "private", "auth", "owner")))));
    router.add("GET", "/api/notification-test/inbox", List.of(Auth.authMiddleware("notification-test")), (request, response) -> {
      Model user = request.authUser();
      List<Map<String, Object>> records = DB.table("notifications")
          .where("notifiable_type", "user")
          .where("notifiable_id", user.get("id"))
          .latest()
          .get();
      for (Map<String, Object> record : records) {
          Object data = record.get("data");
          if (data instanceof String json) record.put("data", Json.parseObject(json));
      }
      return response.json(mapOf("data", records));
    });
    router.add("POST", "/api/notification-test/trigger", List.of(Auth.authMiddleware("notification-test")), (request, response) -> {
      Map<String, Object> validated = request.validate(mapOf("notification", "required|string"));
      Model user = request.authUser();
      Notification notification = notificationFor(String.valueOf(validated.get("notification")).replace('_', '-'));
      if (notification == null) return response.json(mapOf("message", "Unknown notification: " + validated.get("notification")), 400);
      NotificationDispatcher.notify(user, notification);
      return response.json(mapOf("message", "Notification triggered successfully", "type", validated.get("notification")), 201);
    });
    router.add("POST", "/api/notification-test/inbox/read-all", List.of(Auth.authMiddleware("notification-test")), (request, response) -> {
      Model user = request.authUser();
      DB.table("notifications")
          .where("notifiable_type", "user")
          .where("notifiable_id", user.get("id"))
          .where("read_at", null)
          .update(mapOf("read_at", sqlNow()));
      return response.json(mapOf("message", "All notifications marked as read"));
    });
    router.add("DELETE", "/api/notification-test/inbox/{id}", List.of(Auth.authMiddleware("notification-test")), (request, response) -> {
      Model user = request.authUser();
      Map<String, Object> record = DB.table("notifications")
          .where("id", request.route("id"))
          .where("notifiable_type", "user")
          .where("notifiable_id", user.get("id"))
          .first();
      if (record == null) throw new Errors.ModelNotFoundException("Notification", request.route("id"));
      DB.table("notifications").where("id", record.get("id")).delete();
      return response.json(mapOf("message", "Notification deleted"));
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
  public static final class DatabasePingNotification extends Notification {
    @Override public String tatemono() { return "notification-test"; }
    @Override public String name() { return "DatabasePingNotification"; }
    @Override public List<String> channels() { return List.of("database"); }
    @Override public String channelType() { return "private"; }
    @Override public String channel() { return "notification-test"; }
    @Override public Map<String, Object> toDatabase(Model notifiable) { return mapOf("message", "You have a new database notification", "type", name()); }
    @Override public MailMessage toMail(Model notifiable) {
      return new MailMessage()
          .subject("Database Ping")
          .line("You have a new database notification");
    }
  }
  public static final class MailPingNotification extends Notification {
    @Override public String tatemono() { return "notification-test"; }
    @Override public String name() { return "MailPingNotification"; }
    @Override public List<String> channels() { return List.of("mail"); }
    @Override public String channelType() { return "private"; }
    @Override public String channel() { return "notification-test"; }
    @Override public Map<String, Object> toDatabase(Model notifiable) { return mapOf("message", "This is a test mail notification", "type", name()); }
    @Override public MailMessage toMail(Model notifiable) {
      return new MailMessage()
          .subject("Mail Ping from Arkzen")
          .line("This is a test mail notification");
    }
  }
  public static final class BroadcastPingNotification extends Notification {
    @Override public String tatemono() { return "notification-test"; }
    @Override public String name() { return "BroadcastPingNotification"; }
    @Override public List<String> channels() { return List.of("broadcast", "database"); }
    @Override public String channelType() { return "private"; }
    @Override public String channel() { return "notification-test"; }
    @Override public Map<String, Object> toDatabase(Model notifiable) { return mapOf("message", "Real-time notification received on your private channel!", "type", name()); }
    @Override public MailMessage toMail(Model notifiable) {
      return new MailMessage()
          .subject("Broadcast Ping (Private)")
          .line("Real-time notification received on your private channel!");
    }
  }
  public static final class BroadcastPingPublicNotification extends Notification {
    @Override public String tatemono() { return "notification-test"; }
    @Override public String name() { return "BroadcastPingPublicNotification"; }
    @Override public List<String> channels() { return List.of("broadcast", "database"); }
    @Override public String channelType() { return "public"; }
    @Override public String channel() { return "notification-test.notifications"; }
    @Override public Map<String, Object> toDatabase(Model notifiable) { return mapOf("message", "This broadcast went to the public notification channel!", "type", name()); }
    @Override public MailMessage toMail(Model notifiable) {
      return new MailMessage()
          .subject("Broadcast Ping (Public)")
          .line("This broadcast went to the public notification channel!");
    }
  }
  public static final class AllChannelsNotification extends Notification {
    @Override public String tatemono() { return "notification-test"; }
    @Override public String name() { return "AllChannelsNotification"; }
    @Override public List<String> channels() { return List.of("database", "mail", "broadcast"); }
    @Override public String channelType() { return "private"; }
    @Override public String channel() { return "notification-test"; }
    @Override public Map<String, Object> toDatabase(Model notifiable) { return mapOf("message", "This notification was sent to all three channels simultaneously", "type", name()); }
    @Override public MailMessage toMail(Model notifiable) {
      return new MailMessage()
          .subject("All Channels Test")
          .line("This notification was sent to all three channels simultaneously");
    }
  }
  private static Notification notificationFor(String name) {
    return switch (name) {
      case "database-ping" -> new DatabasePingNotification();
      case "mail-ping" -> new MailPingNotification();
      case "broadcast-ping" -> new BroadcastPingNotification();
      case "broadcast-ping-public" -> new BroadcastPingPublicNotification();
      case "all-channels" -> new AllChannelsNotification();
      default -> null;
    };
  }
  private static Map<String, Object> objectMap(Object value) {
    Map<String, Object> out = new LinkedHashMap<>();
    if (value instanceof Map<?, ?> values) values.forEach((key, item) -> out.put(String.valueOf(key), item));
    return out;
  }
}
