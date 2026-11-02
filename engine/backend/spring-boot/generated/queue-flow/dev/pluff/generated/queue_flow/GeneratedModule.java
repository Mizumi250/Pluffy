package dev.pluff.generated.queue_flow;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("queue-flow");
    EventDispatcher.unregister("queue-flow");
    CommandRegistry.unregister("queue-flow");
    Router router = new Router("queue-flow");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/queue-flow/queues", List.of(), (request, response) -> {
      QueryBuilder<Queue> query = Queue.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/queue-flow/queues", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("name", "required|string|max:255", "description", "nullable|string", "prefix", "required|string|max:5", "avg_wait_minutes", "sometimes|integer|min:1"));
      Queue created = Queue.create(validated);
      return response.json(created, 201);
    });
    router.add("GET", "/api/queue-flow/tickets", List.of(), (request, response) -> {
      QueryBuilder<Ticket> query = Ticket.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/queue-flow/tickets", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("queue_id", "required|integer|exists:queues,id", "customer_name", "nullable|string|max:255"));
      Ticket created = Ticket.create(validated);
      return response.json(created, 201);
    });
    router.add("POST", "/api/queue-flow/join", List.of(), (request, response) -> {
      return join_queue(request, response);
    });
    router.add("POST", "/api/queue-flow/call-next", List.of(), (request, response) -> {
      return call_next(request, response);
    });
    router.add("GET", "/api/queue-flow/queues/{id}", List.of(), (request, response) -> {
      Queue queue = Queue.findOrFail(request.route("id"));
      return response.json(queue);
    });
    router.add("PUT", "/api/queue-flow/queues/{id}", List.of(), (request, response) -> {
      Queue queue = Queue.findOrFail(request.route("id"));
      Map<String, Object> validated = request.validate(Support.mapOf("name", "sometimes|string|max:255", "is_active", "sometimes|boolean", "avg_wait_minutes", "sometimes|integer|min:1"));
      queue.update(validated);
      return response.json(queue);
    });
    router.add("DELETE", "/api/queue-flow/queues/{id}", List.of(), (request, response) -> {
      Queue queue = Queue.findOrFail(request.route("id"));
      queue.delete();
      return response.json(mapOf("message", "Deleted successfully"));
    });
    router.add("PUT", "/api/queue-flow/tickets/{id}", List.of(), (request, response) -> {
      Ticket ticket = Ticket.findOrFail(request.route("id"));
      Map<String, Object> validated = request.validate(Support.mapOf("status", "sometimes|in:waiting,serving,done,skipped"));
      ticket.update(validated);
      return response.json(ticket);
    });
    router.add("GET", "/api/queue-flow/status/{queue_id}", List.of(), (request, response) -> {
      return queue_status(request, response);
    });
    router.add("GET", "/api/queue-flow/my-ticket/{queue_id}/{ticket_number}", List.of(), (request, response) -> {
      return my_ticket(request, response);
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
  public static Object join_queue(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Object queueId = request.input("queue_id");
    Object customerName = request.input("customer_name", "Guest");
    Queue queue = Queue.findOrFail(queueId);
    Object maxPosition = Ticket.query()
        .where("queue_id", queueId)
        .whereIn("status", List.of("waiting", "serving"))
        .max("position");
    long nextPosition = Support.toLong(maxPosition, 0) + 1;
    Ticket ticket = Ticket.create(mapOf(
        "queue_id", queueId,
        "ticket_number", queue.str("prefix") + "-" + String.format(Locale.ROOT, "%03d", nextPosition),
        "customer_name", customerName,
        "status", "waiting",
        "position", nextPosition
    ));
    long waiting = Ticket.query()
        .where("queue_id", queueId)
        .where("status", "waiting")
        .where("position", "<", ticket.get("position"))
        .count();
    try {
        Broadcast.broadcastTo(
            "queue-flow." + String.valueOf(queueId),
            "queue-flow.queue-updated",
            mapOf("queue_id", queueId, "action", "joined", "ticket", ticket),
            request.header("X-Socket-ID")
        );
    } catch (RuntimeException error) {
        Log.warn("[QueueFlow] broadcast failed: " + error.getMessage());
    }
    long averageWait = Support.toLong(queue.get("avg_wait_minutes"), 5);
    return response.json(mapOf(
        "ticket", ticket,
        "position", waiting + 1,
        "estimated_wait", waiting * averageWait
    ));
  }
  public static Object call_next(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Object queueId = request.input("queue_id");
    Ticket.query()
        .where("queue_id", queueId)
        .where("status", "serving")
        .update(mapOf("status", "done", "served_at", sqlNow()));
    Ticket nextTicket = Ticket.query()
        .where("queue_id", queueId)
        .where("status", "waiting")
        .orderBy("position")
        .first();
    if (nextTicket == null) {
        return response.json(mapOf("message", "No more tickets in queue", "ticket", null));
    }
    nextTicket.update(mapOf("status", "serving", "called_at", sqlNow()));
    try {
        Broadcast.broadcastTo(
            "queue-flow." + String.valueOf(queueId),
            "queue-flow.queue-updated",
            mapOf("queue_id", queueId, "action", "called", "ticket", nextTicket),
            request.header("X-Socket-ID")
        );
    } catch (RuntimeException error) {
        Log.warn("[QueueFlow] broadcast failed: " + error.getMessage());
    }
    return response.json(mapOf("ticket", nextTicket));
  }
  public static Object queue_status(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Object queueId = params.isEmpty() ? null : params.get(0);
    Queue queue = Queue.findOrFail(queueId);
    Ticket serving = Ticket.query()
        .where("queue_id", queueId)
        .where("status", "serving")
        .first();
    List<Ticket> waiting = Ticket.query()
        .where("queue_id", queueId)
        .where("status", "waiting")
        .orderBy("position")
        .get();
    long doneCount = Ticket.query().where("queue_id", queueId).where("status", "done").count();
    return response.json(mapOf(
        "queue", queue,
        "serving", serving,
        "waiting", waiting,
        "done_count", doneCount,
        "total_waiting", waiting.size()
    ));
  }
  public static Object my_ticket(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Object queueId = params.size() > 0 ? params.get(0) : null;
    Object ticketNumber = params.size() > 1 ? params.get(1) : null;
    Ticket ticket = Ticket.query()
        .where("ticket_number", ticketNumber)
        .where("queue_id", queueId)
        .firstOrFail();
    long ahead = Ticket.query()
        .where("queue_id", queueId)
        .where("status", "waiting")
        .where("position", "<", ticket.get("position"))
        .count();
    Queue queue = Queue.find(queueId);
    long averageWait = queue == null ? 5 : Support.toLong(queue.get("avg_wait_minutes"), 5);
    boolean isWaiting = "waiting".equals(ticket.str("status"));
    return response.json(mapOf(
        "ticket", ticket,
        "position", isWaiting ? ahead + 1 : 0,
        "estimated_wait", ahead * averageWait,
        "is_serving", "serving".equals(ticket.str("status")),
        "is_done", "done".equals(ticket.str("status"))
    ));
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
