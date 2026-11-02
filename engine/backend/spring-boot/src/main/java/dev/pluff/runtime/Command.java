package dev.pluff.runtime;

/** Base class for generated console commands. */
public abstract class Command {
  public static final int SUCCESS = 0;
  public static final int FAILURE = 1;

  public final String signature;
  public final String description;
  public final String schedule;
  private final StringBuilder output = new StringBuilder();

  protected Command(String signature, String description, String schedule) {
    this.signature = signature;
    this.description = description == null ? "" : description;
    this.schedule = schedule;
  }

  public abstract int handle() throws Exception;

  public void info(String message) { append(message, false); }
  public void line(String message) { append(message, false); }
  public void warn(String message) { append(message, true); }
  public void error(String message) { append(message, true); }

  private void append(String message, boolean warning) {
    String text = message == null ? "" : message;
    if (output.length() > 0) output.append('\n');
    output.append(text);
    if (warning) Log.warn("[cmd] " + text);
    else Log.info("[cmd] " + text);
  }

  public String output() { return output.toString(); }
}
