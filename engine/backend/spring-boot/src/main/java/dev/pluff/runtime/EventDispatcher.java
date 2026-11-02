package dev.pluff.runtime;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** In-process event dispatcher; registered listeners execute their generated bodies synchronously. */
public final class EventDispatcher {
  @FunctionalInterface
  public interface Listener {
    void handle(AppEvent event) throws Exception;
  }

  private EventDispatcher() {}

  private static final Map<String, List<Listener>> LISTENERS = new ConcurrentHashMap<>();
  private static final ExecutorService WORKERS = Executors.newCachedThreadPool(r -> {
    Thread thread = new Thread(r, "pluff-event-listener");
    thread.setDaemon(true);
    return thread;
  });

  public static void register(String tatemono, String eventName, Listener listener) {
    LISTENERS.computeIfAbsent(tatemono + ":" + eventName, ignored -> new java.util.concurrent.CopyOnWriteArrayList<>())
        .add(listener);
  }

  public static void unregister(String tatemono) {
    LISTENERS.keySet().removeIf(key -> key.startsWith(tatemono + ":"));
  }

  public static void fire(String tatemono, String eventName, Map<String, Object> data) throws Exception {
    AppEvent event = new AppEvent(eventName, data);
    for (Listener listener : LISTENERS.getOrDefault(tatemono + ":" + eventName, List.of())) {
      if ("sync".equalsIgnoreCase(Support.env("QUEUE_CONNECTION", "database"))) {
        Router.withTatemono(tatemono, () -> {
          listener.handle(event);
          return null;
        });
      } else {
        WORKERS.submit(() -> {
          try {
            Router.withTatemono(tatemono, () -> {
              listener.handle(event);
              return null;
            });
          } catch (Exception error) {
            Log.error("Event listener failed for " + eventName + ": " + error.getMessage());
          }
        });
      }
    }
  }
}
