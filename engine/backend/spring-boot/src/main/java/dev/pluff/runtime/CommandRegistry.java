package dev.pluff.runtime;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/** Registry and minute-resolution cron scheduler for generated commands. */
public final class CommandRegistry {
  @FunctionalInterface
  public interface Factory { Command create(); }

  private record Entry(String tatemono, Factory factory) {}
  private static final Map<String, Entry> COMMANDS = new ConcurrentHashMap<>();
  private static final Map<String, String> LAST_RUN = new ConcurrentHashMap<>();
  private static final ScheduledExecutorService SCHEDULER = Executors.newSingleThreadScheduledExecutor(r -> {
    Thread thread = new Thread(r, "pluff-command-scheduler");
    thread.setDaemon(true);
    return thread;
  });

  static {
    SCHEDULER.scheduleAtFixedRate(CommandRegistry::tick, 1, 1, TimeUnit.SECONDS);
  }

  private CommandRegistry() {}

  public static void register(String tatemono, Factory factory) {
    Command command = factory.create();
    COMMANDS.put(command.signature, new Entry(tatemono, factory));
  }

  public static void unregister(String tatemono) {
    COMMANDS.entrySet().removeIf(entry -> entry.getValue().tatemono.equals(tatemono));
    LAST_RUN.keySet().removeIf(signature -> !COMMANDS.containsKey(signature));
  }

  public static CommandResult run(String signature) throws Exception {
    Entry entry = COMMANDS.get(signature);
    if (entry == null) return null;
    Command command = entry.factory.create();
    int code = Router.withTatemono(entry.tatemono, command::handle);
    return new CommandResult(command.signature, code, command.output());
  }

  public static CommandResult runFor(String tatemono, String name) throws Exception {
    String normalizedName = normalize(name);
    for (String signature : COMMANDS.keySet()) {
      Entry entry = COMMANDS.get(signature);
      if (entry != null && entry.tatemono.equals(tatemono)) {
        int colon = signature.lastIndexOf(':');
        if (colon >= 0 && normalize(signature.substring(colon + 1)).equals(normalizedName)) return run(signature);
      }
    }
    return null;
  }

  private static String normalize(String value) {
    return value.replace('_', '-').toLowerCase(java.util.Locale.ROOT);
  }

  private static void tick() {
    LocalDateTime now = LocalDateTime.now();
    String minute = now.toString().substring(0, 16);
    for (Map.Entry<String, Entry> registered : COMMANDS.entrySet()) {
      try {
        Command command = registered.getValue().factory.create();
        if (command.schedule == null || command.schedule.isBlank() || !matches(command.schedule, now)) continue;
        if (minute.equals(LAST_RUN.put(command.signature, minute))) continue;
        run(command.signature);
      } catch (Exception error) {
        Log.error("Scheduled command failed: " + error.getMessage());
      }
    }
  }

  private static boolean matches(String cron, LocalDateTime time) {
    String[] fields = cron.trim().split("\\s+");
    if (fields.length != 5) return false;
    return field(fields[0], time.getMinute(), 0, 59)
        && field(fields[1], time.getHour(), 0, 23)
        && field(fields[2], time.getDayOfMonth(), 1, 31)
        && field(fields[3], time.getMonthValue(), 1, 12)
        && field(fields[4], time.getDayOfWeek().getValue() % 7, 0, 6);
  }

  private static boolean field(String expression, int value, int min, int max) {
    for (String part : expression.split(",")) {
      String[] stepParts = part.split("/", -1);
      int step = stepParts.length == 2 ? positive(stepParts[1]) : 1;
      if (step < 1) continue;
      String range = stepParts[0];
      int from, to;
      if (range.equals("*")) { from = min; to = max; }
      else if (range.contains("-")) {
        String[] bounds = range.split("-", -1);
        if (bounds.length != 2) continue;
        from = integer(bounds[0], -1);
        to = integer(bounds[1], -1);
      } else {
        from = integer(range, -1);
        to = from;
      }
      if (from >= min && to <= max && from <= to && value >= from && value <= to && (value - from) % step == 0) return true;
    }
    return false;
  }

  private static int positive(String value) { int n = integer(value, -1); return n > 0 ? n : -1; }
  private static int integer(String value, int fallback) {
    try { return Integer.parseInt(value); } catch (NumberFormatException ignored) { return fallback; }
  }

  public record CommandResult(String signature, int exitCode, String output) {}
}
