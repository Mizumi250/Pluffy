package dev.pluff.generated.events_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("events-test");
    EventDispatcher.unregister("events-test");
    CommandRegistry.unregister("events-test");
    Router router = new Router("events-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    EventDispatcher.register("events-test", "user-signed-up", event -> {
      EventLog.create(mapOf(
          "event_name", "UserSignedUp",
          "listener_name", "SendWelcomeEmail",
          "status", "completed",
          "payload", Json.stringify(event.data)
      ));
    });
    EventDispatcher.register("events-test", "user-signed-up", event -> {
      EventLog.create(mapOf(
          "event_name", "UserSignedUp",
          "listener_name", "UpdateUserStats",
          "status", "completed",
          "payload", Json.stringify(event.data)
      ));
    });
    EventDispatcher.register("events-test", "user-signed-up", event -> {
      EventLog.create(mapOf(
          "event_name", "UserSignedUp",
          "listener_name", "NotifyAdmins",
          "status", "completed",
          "payload", Json.stringify(event.data)
      ));
    });
    EventDispatcher.register("events-test", "order-placed", event -> {
      EventLog.create(mapOf(
          "event_name", "OrderPlaced",
          "listener_name", "ProcessPayment",
          "status", "completed",
          "payload", Json.stringify(event.data)
      ));
    });
    EventDispatcher.register("events-test", "order-placed", event -> {
      EventLog.create(mapOf(
          "event_name", "OrderPlaced",
          "listener_name", "UpdateInventory",
          "status", "completed",
          "payload", Json.stringify(event.data)
      ));
    });
    EventDispatcher.register("events-test", "order-placed", event -> {
      EventLog.create(mapOf(
          "event_name", "OrderPlaced",
          "listener_name", "SendOrderConfirmation",
          "status", "completed",
          "payload", Json.stringify(event.data)
      ));
    });
    EventDispatcher.register("events-test", "data-exported", event -> {
      EventLog.create(mapOf(
          "event_name", "DataExported",
          "listener_name", "LogExportActivity",
          "status", "completed",
          "payload", Json.stringify(event.data)
      ));
    });
    EventDispatcher.register("events-test", "data-exported", event -> {
      EventLog.create(mapOf(
          "event_name", "DataExported",
          "listener_name", "CleanupTempFiles",
          "status", "completed",
          "payload", Json.stringify(event.data)
      ));
    });
    router.add("GET", "/api/events-test/log", List.of(), (request, response) -> {
      return response.json(EventLog.query().latest().paginate(
          request.input("per_page", 100),
          request.input("page", 1),
          request.url()
      ));
    });
    router.add("POST", "/api/events-test/fire", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(mapOf("event", "required|string", "payload", "sometimes|array"));
      String eventName = String.valueOf(validated.get("event")).replace('_', '-');
      EventDispatcher.fire("events-test", eventName, objectMap(validated.get("payload")));
      return response.json(mapOf("message", "Event fired"), 202);
    });
    router.add("POST", "/api/events-test/log/clear", List.of(), (request, response) -> {
      EventLog.query().delete();
      return response.json(mapOf("message", "Log cleared"));
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
