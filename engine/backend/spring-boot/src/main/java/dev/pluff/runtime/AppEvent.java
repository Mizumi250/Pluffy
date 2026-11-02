package dev.pluff.runtime;

import java.util.LinkedHashMap;
import java.util.Map;

/** Event data passed to generated Java listener bodies. */
public final class AppEvent {
  public final String name;
  public final Map<String, Object> data;

  public AppEvent(String name, Map<String, Object> data) {
    this.name = name;
    this.data = data == null ? new LinkedHashMap<>() : new LinkedHashMap<>(data);
  }
}
