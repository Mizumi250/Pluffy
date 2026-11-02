package dev.pluff.generated.job_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("job-test");
    EventDispatcher.unregister("job-test");
    CommandRegistry.unregister("job-test");
    Router router = new Router("job-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    JobDispatcher.register("job-test", "process-data", data -> new ProcessDataJob(data));
    JobDispatcher.register("job-test", "heavy-computation", data -> new HeavyComputationJob(data));
    JobDispatcher.register("job-test", "always-fails", data -> new AlwaysFailsJob(data));
    router.add("GET", "/api/job-test/results", List.of(), (request, response) -> {
      Map<String, Object> results = JobResult.query()
          .orderBy("created_at", "desc")
          .paginate(request.input("per_page", 15), request.input("page", 1), request.url());
      return response.json(results);
    });
    router.add("POST", "/api/job-test/dispatch", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(mapOf("job", "required|string"));
      String jobName = String.valueOf(validated.get("job")).replace('_', '-');
      Object rawData = request.input("data", Map.of());
      Map<String, Object> data = objectMap(rawData);
      JobDispatcher.dispatch("job-test", jobName, data);
      return response.json(mapOf("message", "Job dispatched"), 202);
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
  public static final class ProcessDataJob extends Job {
    public ProcessDataJob(Map<String, Object> data) { super(data, "default", 3, 30); }
    @Override public void handle() throws Exception {
      long start = System.nanoTime();
      Thread.sleep(2000);
      long elapsedMillis = (System.nanoTime() - start) / 1_000_000;
      JobResult.create(mapOf(
          "job_name", "process-data",
          "status", "completed",
          "result", "Data processed successfully in " + elapsedMillis + "ms",
          "processed_at", sqlNow()
      ));
    }
  }
  public static final class HeavyComputationJob extends Job {
    public HeavyComputationJob(Map<String, Object> data) { super(data, "heavy", 1, 120); }
    @Override public void handle() throws Exception {
      long start = System.nanoTime();
      Thread.sleep(5000);
      long elapsedMillis = (System.nanoTime() - start) / 1_000_000;
      JobResult.create(mapOf(
          "job_name", "heavy-computation",
          "status", "completed",
          "result", "Heavy computation completed in " + elapsedMillis + "ms",
          "processed_at", sqlNow()
      ));
    }
  }
  public static final class AlwaysFailsJob extends Job {
    public AlwaysFailsJob(Map<String, Object> data) { super(data, "default", 2, 10); }
    @Override public void handle() throws Exception {
      throw new IllegalStateException("This job always fails");
    }
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
