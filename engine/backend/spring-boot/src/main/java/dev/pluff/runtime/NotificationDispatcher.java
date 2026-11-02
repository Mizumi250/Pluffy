package dev.pluff.runtime;

import java.util.UUID;
import java.util.Map;

/** Delivers a generated notification to its configured database, mail, or broadcast channels. */
public final class NotificationDispatcher {
  private NotificationDispatcher() {}

  public static void notify(Model notifiable, Notification notification) {
    if (notifiable == null) throw new Errors.AuthenticationException();
    String slug = notification.tatemono();
    for (String channel : notification.channels()) {
      switch (channel) {
        case "database" -> store(notifiable, notification);
        case "mail" -> sendMail(notifiable, notification);
        case "broadcast" -> {
          String type = notification.channelType();
          String channelName = notification.channel();
          if ("private".equals(type) || "presence".equals(type))
            channelName = type + "-" + channelName + "." + notifiable.get("id");
          Broadcast.broadcastTo(channelName, slug + ".notification", notification.toBroadcast(notifiable), null);
        }
        default -> throw new IllegalArgumentException("Unsupported notification channel: " + channel);
      }
    }
  }

  private static void store(Model notifiable, Notification notification) {
    String now = Support.sqlNow();
    DB.table("notifications").insert(Support.mapOf(
        "id", UUID.randomUUID().toString(),
        "type", notification.name(),
        "notifiable_type", "user",
        "notifiable_id", notifiable.get("id"),
        "data", Json.stringify(notification.toDatabase(notifiable)),
        "read_at", null,
        "created_at", now,
        "updated_at", now
    ));
  }

  private static void sendMail(Model notifiable, Notification notification) {
    MailMessage message = notification.toMail(notifiable);
    if (message == null || notifiable.str("email") == null) return;
    Mail.send(notifiable.str("email"), Support.mapOf("subject", message.subject(), "template", message.html()), Map.of());
  }
}
