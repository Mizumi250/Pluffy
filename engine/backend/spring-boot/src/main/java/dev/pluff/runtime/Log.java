package dev.pluff.runtime;

/** Minimal logger with the same "[Pluff]" prefix the other backends print. */
public final class Log {
  private Log() {}

  public static void info(String m) { System.out.println("[Pluff] " + m); }
  public static void info(String m, Object ctx) { System.out.println("[Pluff] " + m + (ctx == null ? "" : " " + ctx)); }
  public static void warn(String m) { System.err.println("[Pluff] ⚠ " + m); }
  public static void error(String m) { System.err.println("[Pluff] ✖ " + m); }
}
