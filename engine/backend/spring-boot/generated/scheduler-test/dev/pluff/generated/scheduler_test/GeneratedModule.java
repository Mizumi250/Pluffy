package dev.pluff.generated.scheduler_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    Router router = new Router("scheduler-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/scheduler-test/runs", List.of(), (request, response) -> {
      QueryBuilder<CommandRun> query = CommandRun.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/scheduler-test/run", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("command", "required|string", "triggered_by", "sometimes|string"));
      CommandRun created = CommandRun.create(validated);
      return response.json(created, 201);
    });
    router.add("DELETE", "/api/scheduler-test/runs", List.of(), (request, response) -> {
      CommandRun command_run = CommandRun.findOrFail(request.route("id"));
      command_run.delete();
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
}
