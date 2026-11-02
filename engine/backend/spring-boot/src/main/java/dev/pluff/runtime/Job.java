package dev.pluff.runtime;

import java.util.LinkedHashMap;
import java.util.Map;

/** Base type for generated Tatemono jobs. */
public abstract class Job {
  public final Map<String, Object> data;
  public final String queue;
  public final int tries;
  public final int timeout;

  protected Job(Map<String, Object> data, String queue, int tries, int timeout) {
    this.data = data == null ? new LinkedHashMap<>() : new LinkedHashMap<>(data);
    this.queue = queue == null || queue.isBlank() ? "default" : queue;
    this.tries = Math.max(1, tries);
    this.timeout = Math.max(1, timeout);
  }

  public abstract void handle() throws Exception;
}
