package dev.pluff.runtime;

import java.util.List;
import java.util.Map;

/** Base type for generated notification bodies. */
public abstract class Notification {
  public abstract String tatemono();
  public abstract String name();
  public abstract List<String> channels();
  public abstract Map<String, Object> toDatabase(Model notifiable);
  public abstract MailMessage toMail(Model notifiable);

  public String channelType() { return "private"; }
  public String channel() { return tatemono() + ".notifications"; }
  public Map<String, Object> toBroadcast(Model notifiable) { return toDatabase(notifiable); }
}
