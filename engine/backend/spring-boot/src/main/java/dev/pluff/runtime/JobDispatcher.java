package dev.pluff.runtime;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/** Executes registered jobs through their real Java handlers. */
public final class JobDispatcher {
  @FunctionalInterface
  public interface Factory {
    Job create(Map<String, Object> data);
  }

  private JobDispatcher() {}

  private static final Map<String, Factory> FACTORIES = new java.util.concurrent.ConcurrentHashMap<>();
  private static final ExecutorService WORKERS = Executors.newCachedThreadPool(r -> {
    Thread thread = new Thread(r, "pluff-job-worker");
    thread.setDaemon(true);
    return thread;
  });
  private static final ExecutorService HANDLERS = Executors.newCachedThreadPool(r -> {
    Thread thread = new Thread(r, "pluff-job-handler");
    thread.setDaemon(true);
    return thread;
  });

  /** Tatemonos whose leftover queue rows were already recovered in this JVM. */
  private static final Set<String> RECOVERED = java.util.concurrent.ConcurrentHashMap.newKeySet();
  /** Row ids currently being worked on by this JVM (never re-run by recovery). */
  private static final Set<String> IN_FLIGHT = java.util.concurrent.ConcurrentHashMap.newKeySet();
  private static final ScheduledExecutorService RECOVERY = Executors.newSingleThreadScheduledExecutor(r -> {
    Thread thread = new Thread(r, "pluff-job-recovery");
    thread.setDaemon(true);
    return thread;
  });

  public static void register(String tatemono, String name, Factory factory) {
    FACTORIES.put(key(tatemono, name), factory);
    // Give the module a moment to register all of its jobs, then re-run what a crash or restart left behind.
    if (durable() && RECOVERED.add(tatemono)) {
      RECOVERY.schedule(() -> recover(tatemono), 3, TimeUnit.SECONDS);
    }
  }

  public static void unregister(String tatemono) {
    FACTORIES.keySet().removeIf(key -> key.startsWith(tatemono + ":"));
    RECOVERED.remove(tatemono);
  }

  /** database (default) persists jobs in the `jobs` table; sync runs inline. */
  private static boolean durable() {
    return !"sync".equalsIgnoreCase(Support.env("QUEUE_CONNECTION", "database"));
  }

  private static Conn queueConnection() {
    Conn connection = Database.mainConnection();
    String id = connection.isPg() ? "BIGSERIAL PRIMARY KEY" : "INTEGER PRIMARY KEY AUTOINCREMENT";
    connection.execute("CREATE TABLE IF NOT EXISTS \"jobs\" (\"id\" " + id + ", \"queue\" TEXT NOT NULL, \"payload\" TEXT NOT NULL, "
        + "\"attempts\" INTEGER NOT NULL DEFAULT 0, \"reserved_at\" TEXT NULL, \"available_at\" TEXT NOT NULL, \"created_at\" TEXT NOT NULL)");
    connection.execute("CREATE TABLE IF NOT EXISTS \"failed_jobs\" (\"id\" " + id + ", \"queue\" TEXT NOT NULL, \"payload\" TEXT NOT NULL, "
        + "\"exception\" TEXT NOT NULL, \"failed_at\" TEXT NOT NULL)");
    return connection;
  }

  /** Inserts the job row; returns its id, or null when persistence is unavailable (falls back to in-memory). */
  private static Object persist(String tatemono, String name, Map<String, Object> data, String queue) {
    try {
      Conn connection = queueConnection();
      Map<String, Object> payload = new java.util.LinkedHashMap<>();
      payload.put("tatemono", tatemono);
      payload.put("job", name);
      payload.put("data", data);
      Map<String, Object> row = new java.util.LinkedHashMap<>();
      row.put("queue", queue);
      row.put("payload", Json.stringify(payload));
      row.put("attempts", 0);
      row.put("reserved_at", Support.sqlNow());
      row.put("available_at", Support.sqlNow());
      row.put("created_at", Support.sqlNow());
      return connection.insert("jobs", row, "id");
    } catch (RuntimeException error) {
      Log.warn("Queue persistence unavailable, running job " + name + " in memory: " + error.getMessage());
      return null;
    }
  }

  private static void finish(Object rowId, String queue, String payload, String failure) {
    if (rowId == null) return;
    try {
      Conn connection = queueConnection();
      if (failure != null) {
        Map<String, Object> failed = new java.util.LinkedHashMap<>();
        failed.put("queue", queue);
        failed.put("payload", payload);
        failed.put("exception", failure);
        failed.put("failed_at", Support.sqlNow());
        connection.insert("failed_jobs", failed, "id");
      }
      connection.execute("DELETE FROM \"jobs\" WHERE \"id\" = ?", new ArrayList<>(List.of(rowId)));
    } catch (RuntimeException error) {
      Log.warn("Could not update queue row " + rowId + ": " + error.getMessage());
    } finally {
      IN_FLIGHT.remove(String.valueOf(rowId));
    }
  }

  /** Re-runs rows left in `jobs` by a previous process. Runs once per tatemono per JVM. */
  private static void recover(String tatemono) {
    try {
      List<Map<String, Object>> rows = queueConnection().select("SELECT * FROM \"jobs\" ORDER BY \"id\"");
      for (Map<String, Object> row : rows) {
        Object rowId = row.get("id");
        if (rowId == null || !IN_FLIGHT.add(String.valueOf(rowId))) continue;
        Map<String, Object> payload = Json.parseObject(String.valueOf(row.get("payload")));
        if (!tatemono.equals(String.valueOf(payload.get("tatemono")))) {
          IN_FLIGHT.remove(String.valueOf(rowId));
          continue;
        }
        String name = String.valueOf(payload.get("job"));
        Factory factory = FACTORIES.get(key(tatemono, name));
        if (factory == null) {
          Log.warn("Skipping queued job " + name + ": no handler registered for " + tatemono);
          IN_FLIGHT.remove(String.valueOf(rowId));
          continue;
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> data = payload.get("data") instanceof Map<?, ?> map ? (Map<String, Object>) map : new java.util.LinkedHashMap<>();
        Log.info("Recovering queued job " + name + " for " + tatemono);
        Job job = factory.create(data);
        String queue = String.valueOf(row.get("queue"));
        String raw = String.valueOf(row.get("payload"));
        WORKERS.submit(() -> runWithRetries(tatemono, name, data, factory, job, rowId, queue, raw));
      }
    } catch (RuntimeException error) {
      Log.warn("Queue recovery for " + tatemono + " failed: " + error.getMessage());
    }
  }

  public static void dispatch(String tatemono, String name, Map<String, Object> data) throws Exception {
    Factory factory = FACTORIES.get(key(tatemono, name));
    if (factory == null) throw new IllegalArgumentException("Unknown job: " + name);
    Job job = factory.create(data);
    if (!durable()) {
      run(tatemono, job);
    } else {
      String queue = "default";
      Object rowId = persist(tatemono, name, data, queue);
      if (rowId != null) IN_FLIGHT.add(String.valueOf(rowId));
      String raw = rowId == null ? "" : "{\"tatemono\":" + Json.stringify(tatemono) + ",\"job\":" + Json.stringify(name) + ",\"data\":" + Json.stringify(data) + "}";
      WORKERS.submit(() -> runWithRetries(tatemono, name, data, factory, job, rowId, queue, raw));
    }
  }

  private static void runWithRetries(String tatemono, String name, Map<String, Object> data, Factory factory, Job initial,
                                     Object rowId, String queue, String rawPayload) {
    for (int attempt = 1; attempt <= initial.tries; attempt++) {
      Job job = attempt == 1 ? initial : factory.create(data);
      Future<Void> task = null;
      try {
        task = HANDLERS.submit(() -> {
          Router.withTatemono(tatemono, () -> {
            job.handle();
            return null;
          });
          return null;
        });
        task.get(job.timeout, TimeUnit.SECONDS);
        finish(rowId, queue, rawPayload, null);
        return;
      } catch (TimeoutException error) {
        if (task != null) task.cancel(true);
        if (attempt == initial.tries) {
          Log.error("Job " + name + " timed out after " + job.timeout + "s");
          finish(rowId, queue, rawPayload, "Job timed out after " + job.timeout + "s");
        }
        else Log.warn("Retrying timed out job " + name + " (" + (attempt + 1) + "/" + initial.tries + ")");
      } catch (Exception error) {
        Throwable cause = error instanceof ExecutionException && error.getCause() != null ? error.getCause() : error;
        if (attempt == initial.tries) {
          Log.error("Job " + name + " failed: " + cause.getMessage());
          finish(rowId, queue, rawPayload, String.valueOf(cause));
          return;
        }
        Log.warn("Retrying job " + name + " (" + (attempt + 1) + "/" + initial.tries + "): " + cause.getMessage());
      }
    }
  }

  private static void run(String tatemono, Job job) throws Exception {
    Future<Void> task = HANDLERS.submit(() -> {
      Router.withTatemono(tatemono, () -> {
        job.handle();
        return null;
      });
      return null;
    });
    try {
      task.get(job.timeout, TimeUnit.SECONDS);
    } catch (TimeoutException error) {
      task.cancel(true);
      throw new IllegalStateException("Job timed out after " + job.timeout + "s", error);
    } catch (ExecutionException error) {
      Throwable cause = error.getCause();
      if (cause instanceof Exception exception) throw exception;
      throw new IllegalStateException(cause);
    }
  }

  private static String key(String tatemono, String name) {
    return tatemono + ":" + name.replace('_', '-').toLowerCase(java.util.Locale.ROOT);
  }
}
