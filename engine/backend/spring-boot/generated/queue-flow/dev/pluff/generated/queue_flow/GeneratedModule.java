package dev.pluff.generated.queue_flow;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
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
