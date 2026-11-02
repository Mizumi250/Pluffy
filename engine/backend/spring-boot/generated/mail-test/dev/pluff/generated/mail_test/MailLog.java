package dev.pluff.generated.mail_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class MailLog extends Model {
  private static final ModelMeta META = ModelMeta.of("mail_test_mail_logs", "mail-test", List.of("user_id", "to_email", "subject", "mail_class", "status", "error"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("user_id", "integer")), true, false);
  public MailLog() { super(META); }
  @Override protected QueryBuilder<MailLog> newQuery() { return QueryBuilder.forModel(META, MailLog::new); }
  public static QueryBuilder<MailLog> query() { return new MailLog().newQuery(); }
  public static MailLog find(Object id) { return query().find(id); }
  public static MailLog findOrFail(Object id) { return query().findOrFail(id); }
  public static List<MailLog> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static MailLog create(Map<String, Object> values) { return (MailLog) new MailLog().fill(values).save(); }
}
