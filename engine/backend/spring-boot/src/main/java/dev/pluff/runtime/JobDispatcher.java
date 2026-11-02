package dev.pluff.runtime;

import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
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

  public static void register(String tatemono, String name, Factory factory) {
    FACTORIES.put(key(tatemono, name), factory);
  }

  public static void unregister(String tatemono) {
    FACTORIES.keySet().removeIf(key -> key.startsWith(tatemono + ":"));
  }

  public static void dispatch(String tatemono, String name, Map<String, Object> data) throws Exception {
    Factory factory = FACTORIES.get(key(tatemono, name));
    if (factory == null) throw new IllegalArgumentException("Unknown job: " + name);
    Job job = factory.create(data);
    if ("sync".equalsIgnoreCase(Support.env("QUEUE_CONNECTION", "database"))) {
      run(tatemono, job);
    } else {
      WORKERS.submit(() -> runWithRetries(tatemono, name, data, factory, job));
    }
  }

  private static void runWithRetries(String tatemono, String name, Map<String, Object> data, Factory factory, Job initial) {
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
        return;
      } catch (TimeoutException error) {
        if (task != null) task.cancel(true);
        if (attempt == initial.tries) Log.error("Job " + name + " timed out after " + job.timeout + "s");
        else Log.warn("Retrying timed out job " + name + " (" + (attempt + 1) + "/" + initial.tries + ")");
      } catch (Exception error) {
        Throwable cause = error instanceof ExecutionException && error.getCause() != null ? error.getCause() : error;
        if (attempt == initial.tries) {
          Log.error("Job " + name + " failed: " + cause.getMessage());
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
