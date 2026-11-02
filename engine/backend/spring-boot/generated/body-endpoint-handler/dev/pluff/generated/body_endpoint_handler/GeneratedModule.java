package dev.pluff.generated.body_endpoint_handler;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("body-endpoint-handler");
    EventDispatcher.unregister("body-endpoint-handler");
    CommandRegistry.unregister("body-endpoint-handler");
    Router router = new Router("body-endpoint-handler");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/body-endpoint-handler/probes", List.of(), (request, response) -> {
      QueryBuilder<ProbeResult> query = ProbeResult.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/body-endpoint-handler/probes", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("source", "required|string|max:50", "probe", "required|string|max:100", "payload", "nullable|string"));
      ProbeResult created = ProbeResult.create(validated);
      return response.json(created, 201);
    });
    router.add("POST", "/api/body-endpoint-handler/echo", List.of(), (request, response) -> {
      Map<String, Object> input = request.all();
      int fieldCount = input.size();
      ProbeResult record = ProbeResult.create(mapOf(
          "source", "endpoint-body",
          "probe", "echo",
          "payload", Json.stringify(input),
          "result", "Echoed " + fieldCount + " field(s) — ControllerBuilder v7.0 body injection ✓",
          "ok", true
      ));
      return response.json(mapOf(
          "injected", true,
          "builder", "ControllerBuilder v7.0",
          "method", "echo",
          "field_count", fieldCount,
          "echo", input,
          "probe_id", record.id()
      ));
    });
    router.add("GET", "/api/body-endpoint-handler/stats", List.of(), (request, response) -> {
      long total = ProbeResult.count();
      long passed = ProbeResult.query().where("ok", true).count();
      long failed = ProbeResult.query().where("ok", false).count();
      List<ProbeResult> sourceRows = ProbeResult.query().select("source").get();
      Set<Object> sources = new LinkedHashSet<>();
      for (ProbeResult probe : sourceRows) sources.add(probe.get("source"));
      return response.json(mapOf(
          "injected", true,
          "builder", "ControllerBuilder v7.0",
          "method", "stats",
          "total", total,
          "passed", passed,
          "failed", failed,
          "sources", sources
      ));
    });
    router.add("GET", "/api/body-endpoint-handler/ping", List.of(), (request, response) -> {
      return ping(request, response);
    });
    router.add("POST", "/api/body-endpoint-handler/record-handler", List.of(), (request, response) -> {
      return recordHandler(request, response);
    });
    router.add("GET", "/api/body-endpoint-handler/latest", List.of(), (request, response) -> {
      return latest(request, response);
    });
    router.add("DELETE", "/api/body-endpoint-handler/probes/{id}", List.of(), (request, response) -> {
      ProbeResult probe_result = ProbeResult.findOrFail(request.route("id"));
      probe_result.delete();
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
  public static Object ping(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    return response.json(mapOf(
        "injected", true,
        "builder", "CustomRouteBuilder v2.0",
        "handler", "ping",
        "status", "ok",
        "timestamp", java.time.Instant.now().toString(),
        "message", "CustomRouteBuilder handler body injection confirmed ✓"
    ));
  }
  public static Object recordHandler(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Map<String, Object> validated = request.validate(mapOf(
        "probe", "required|string|max:100",
        "payload", "nullable|string",
        "ok", "sometimes|boolean"
    ));
    Object okValue = validated.get("ok");
    ProbeResult record = ProbeResult.create(mapOf(
        "source", "handler-body",
        "probe", validated.get("probe"),
        "payload", validated.get("payload"),
        "result", "Recorded via CustomRouteBuilder handler body injection ✓",
        "ok", okValue == null || Boolean.TRUE.equals(okValue)
            || "1".equals(String.valueOf(okValue)) || "true".equalsIgnoreCase(String.valueOf(okValue))
    ));
    return response.json(mapOf(
        "injected", true,
        "builder", "CustomRouteBuilder v2.0",
        "handler", "recordHandler",
        "probe_id", record.id(),
        "probe", record.get("probe")
    ));
  }
  public static Object latest(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    List<ProbeResult> latest = ProbeResult.query().latest().take(5).get();
    return response.json(mapOf(
        "injected", true,
        "builder", "CustomRouteBuilder v2.0",
        "handler", "latest",
        "count", latest.size(),
        "results", latest
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
