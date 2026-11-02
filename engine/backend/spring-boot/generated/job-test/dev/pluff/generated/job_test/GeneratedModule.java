package dev.pluff.generated.job_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    Router router = new Router("job-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/job-test/results", List.of(), (request, response) -> {
      QueryBuilder<JobResult> query = JobResult.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/job-test/dispatch", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("job", "required|string"));
      JobResult created = JobResult.create(validated);
      return response.json(created, 201);
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
