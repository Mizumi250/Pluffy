package dev.pluff.runtime;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Typed message builder returned by notification Java bodies. */
public final class MailMessage {
  private String subject = "";
  private final List<String> lines = new ArrayList<>();
  private String actionText = "";
  private String actionUrl = "";
  private String greeting = "";
  private String salutation = "";

  public MailMessage subject(String value) { subject = value == null ? "" : value; return this; }
  public MailMessage line(String value) { lines.add(value == null ? "" : value); return this; }
  public MailMessage action(String text, String url) {
    actionText = text == null ? "" : text;
    actionUrl = url == null ? "" : url;
    return this;
  }
  public MailMessage greeting(String value) { greeting = value == null ? "" : value; return this; }
  public MailMessage salutation(String value) { salutation = value == null ? "" : value; return this; }
  public String subject() { return subject; }
  public String html() {
    StringBuilder html = new StringBuilder();
    if (!greeting.isEmpty()) html.append("<p>").append(greeting).append("</p>");
    for (String line : lines) html.append("<p>").append(line).append("</p>");
    if (!actionUrl.isEmpty()) html.append("<p><a href=\"").append(actionUrl).append("\">").append(actionText).append("</a></p>");
    if (!salutation.isEmpty()) html.append("<p>").append(salutation).append("</p>");
    return html.toString();
  }

  public static MailMessage fromMap(Map<String, Object> data) {
    MailMessage message = new MailMessage();
    if (data == null) return message;
    message.subject(String.valueOf(data.getOrDefault("subject", "")));
    if (data.get("greeting") != null) message.greeting(String.valueOf(data.get("greeting")));
    Object lines = data.get("lines");
    if (lines instanceof Iterable<?> values) for (Object value : values) message.line(String.valueOf(value));
    if (data.get("salutation") != null) message.salutation(String.valueOf(data.get("salutation")));
    if (data.get("action") instanceof Map<?, ?> action) {
      Object label = action.get("label");
      Object url = action.get("url");
      message.action(label == null ? "" : String.valueOf(label), url == null ? "" : String.valueOf(url));
    }
    return message;
  }
}
