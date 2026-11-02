package dev.pluff.generated.scheduler_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("scheduler-test");
    EventDispatcher.unregister("scheduler-test");
    CommandRegistry.unregister("scheduler-test");
    Router router = new Router("scheduler-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    CommandRegistry.register("scheduler-test", () -> new CleanupTempCommand());
    CommandRegistry.register("scheduler-test", () -> new GenerateReportCommand());
    CommandRegistry.register("scheduler-test", () -> new PingHealthCommand());
    CommandRegistry.register("scheduler-test", () -> new SyncDataCommand());
    router.add("GET", "/api/scheduler-test/runs", List.of(), (request, response) -> {
      QueryBuilder<CommandRun> query = CommandRun.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/scheduler-test/run", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(mapOf("command", "required|string", "triggered_by", "sometimes|string"));
      String commandName = String.valueOf(validated.get("command")).replace('_', '-');
      long started = System.nanoTime();
      CommandRegistry.CommandResult run = CommandRegistry.runFor("scheduler-test", commandName);
      if (run == null) return response.json(mapOf("message", "Invalid command"), 400);
      CommandRun result = CommandRun.create(mapOf("command_name", commandName, "signature", run.signature(), "exit_code", run.exitCode(), "output", run.output(), "triggered_by", validated.getOrDefault("triggered_by", "manual"), "duration_ms", (System.nanoTime() - started) / 1_000_000));
      return response.json(result, 201);
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
  public static final class CleanupTempCommand extends Command {
    public CleanupTempCommand() { super("scheduler-test:cleanup-temp", "Deletes temporary files older than 24h", "0 * * * *"); }
    @Override public int handle() throws Exception {
      long start = System.nanoTime();
      this.info("[Arkzen:scheduler-test] Running cleanup-temp...");
      CommandRun.create(mapOf(
          "command_name", "cleanup-temp",
          "signature", "scheduler-test:cleanup-temp",
          "exit_code", 0,
          "output", "Cleanup completed successfully.",
          "triggered_by", "schedule",
          "duration_ms", (System.nanoTime() - start) / 1_000_000
      ));
      this.info("[Arkzen:scheduler-test] ✓ Done");
      return Command.SUCCESS;
    }
  }
  public static final class GenerateReportCommand extends Command {
    public GenerateReportCommand() { super("scheduler-test:generate-report", "Generates a daily activity report", "0 8 * * *"); }
    @Override public int handle() throws Exception {
      long start = System.nanoTime();
      this.info("[Arkzen:scheduler-test] Generating report...");
      CommandRun.create(mapOf(
          "command_name", "generate-report",
          "signature", "scheduler-test:generate-report",
          "exit_code", 0,
          "output", "Daily report generated successfully.",
          "triggered_by", "schedule",
          "duration_ms", (System.nanoTime() - start) / 1_000_000
      ));
      this.info("[Arkzen:scheduler-test] ✓ Done");
      return Command.SUCCESS;
    }
  }
  public static final class PingHealthCommand extends Command {
    public PingHealthCommand() { super("scheduler-test:ping-health", "Pings all services and records health status", "0-59/5 * * * *"); }
    @Override public int handle() throws Exception {
      long start = System.nanoTime();
      CommandRun.create(mapOf(
          "command_name", "ping-health",
          "signature", "scheduler-test:ping-health",
          "exit_code", 0,
          "output", "All services healthy.",
          "triggered_by", "schedule",
          "duration_ms", (System.nanoTime() - start) / 1_000_000
      ));
      this.info("[Arkzen:scheduler-test] ✓ Done");
      return Command.SUCCESS;
    }
  }
  public static final class SyncDataCommand extends Command {
    public SyncDataCommand() { super("scheduler-test:sync-data", "Syncs data from external source", "0-59/15 * * * *"); }
    @Override public int handle() throws Exception {
      long start = System.nanoTime();
      this.info("[Arkzen:scheduler-test] Syncing data...");
      CommandRun.create(mapOf(
          "command_name", "sync-data",
          "signature", "scheduler-test:sync-data",
          "exit_code", 0,
          "output", "Data synced successfully.",
          "triggered_by", "schedule",
          "duration_ms", (System.nanoTime() - start) / 1_000_000
      ));
      this.info("[Arkzen:scheduler-test] ✓ Done");
      return Command.SUCCESS;
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
