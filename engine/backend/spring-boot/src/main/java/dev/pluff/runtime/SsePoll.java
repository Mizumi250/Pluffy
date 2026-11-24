package dev.pluff.runtime;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Lynx realtime poll: GET /api/&lt;slug&gt;/sse-poll/&lt;public|private|presence&gt;?after_id=N
 *
 * <p>Same contract as Laravel's LynxSseBridgeController::poll(): 404 for an unknown channel type, 401 for
 * private/presence without a user, public = channel_type "public" or NULL, private/presence = exact match,
 * ordered by id, 50 rows max, response {"messages": [{"event", "data"}], "last_id"}.
 */
public final class SsePoll {
  private SsePoll() {}

  public static <M extends Model> Object poll(Request request, Response response, QueryBuilder<M> query,
                                              Map<String, String> events, String channelType) {
    if (!List.of("public", "private", "presence").contains(channelType)) {
      return response.json(Map.of("message", "Not Found"), 404);
    }
    if (!"public".equals(channelType) && request.authUser() == null) {
      return response.json(Map.of("message", "Unauthenticated."), 401);
    }

    long afterId = afterId(request.query("after_id"));
    if ("public".equals(channelType)) {
      query.where(group -> group.where("channel_type", "public").orWhere("channel_type", (Object) null));
    } else {
      query.where("channel_type", channelType);
    }
    List<M> rows = query.where("id", ">", afterId).orderBy("id").limit(50).get();

    List<Object> messages = new ArrayList<>();
    long lastId = afterId;
    for (M row : rows) {
      Map<String, Object> message = new LinkedHashMap<>();
      message.put("event", events.get(channelType));
      message.put("data", row.toJson());
      messages.add(message);
      Long id = row.longVal("id");
      if (id != null) lastId = id;
    }
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("messages", messages);
    body.put("last_id", lastId);
    return response.json(body);
  }

  /** PHP (int) cast semantics: junk or negative becomes 0. */
  private static long afterId(Object raw) {
    if (raw == null) return 0;
    try {
      return Math.max(Long.parseLong(String.valueOf(raw).trim()), 0);
    } catch (NumberFormatException e) {
      return 0;
    }
  }
}
