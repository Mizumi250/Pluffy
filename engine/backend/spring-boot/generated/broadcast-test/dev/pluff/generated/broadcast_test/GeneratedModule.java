package dev.pluff.generated.broadcast_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("broadcast-test");
    EventDispatcher.unregister("broadcast-test");
    CommandRegistry.unregister("broadcast-test");
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
      Object rawChannelType = validated.get("channel_type");
      String channelType = rawChannelType == null || String.valueOf(rawChannelType).isBlank() ? "public" : String.valueOf(rawChannelType);
      Map<String, String> channels = Map.ofEntries(Map.entry("public", "broadcast-test-public"), Map.entry("private", "broadcast-test"), Map.entry("presence", "broadcast-test-presence"));
      Map<String, String> eventNames = Map.ofEntries(Map.entry("public", "broadcast-test.message-sent-public"), Map.entry("private", "broadcast-test.message-sent-private"), Map.entry("presence", "broadcast-test.message-sent-presence"));
      Map<String, Boolean> channelHasIds = Map.ofEntries(Map.entry("public", false), Map.entry("private", true), Map.entry("presence", false));
      if (!channels.containsKey(channelType)) return response.json(mapOf("message", "channel_type must be public, private, presence."), 422);
      Map<String, Object> messageValues = new LinkedHashMap<>(validated);
      messageValues.put("channel_type", channelType);
      Message message = Message.create(messageValues);
      Model user = request.authUser();
      Broadcast.Event broadcastEvent = new Broadcast.Event() {};
      broadcastEvent.tatemono = "broadcast-test";
      broadcastEvent.eventName = eventNames.get(channelType);
      broadcastEvent.channelType = channelType;
      broadcastEvent.channel = channels.get(channelType);
      broadcastEvent.channelHasId = Boolean.TRUE.equals(channelHasIds.get(channelType));
      broadcastEvent.userId = user == null ? null : user.id();
      broadcastEvent.data = objectMap(message.toJson());
      Broadcast.broadcast(broadcastEvent);
      return response.json(message, 201);
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
