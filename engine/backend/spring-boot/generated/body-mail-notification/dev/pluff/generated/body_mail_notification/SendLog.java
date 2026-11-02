package dev.pluff.generated.body_mail_notification;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class SendLog extends Model {
  private static final ModelMeta META = ModelMeta.of("body_mail_notification_send_log", "body-mail-notification", List.of("user_id", "to_email", "subject", "mail_class", "kind", "status", "error"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("user_id", "integer")), true, false);
  public SendLog() { super(META); }
  @Override protected QueryBuilder<SendLog> newQuery() { return QueryBuilder.forModel(META, SendLog::new); }
  public static QueryBuilder<SendLog> query() { return new SendLog().newQuery(); }
  public static SendLog find(Object id) { return query().find(id); }
  public static SendLog findOrFail(Object id) { return query().findOrFail(id); }
  public static List<SendLog> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static SendLog create(Map<String, Object> values) { return (SendLog) new SendLog().fill(values).save(); }
}
