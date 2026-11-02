package dev.pluff.generated.middleware_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class PingLog extends Model {
  private static final ModelMeta META = ModelMeta.of("middleware_test_ping_logs", "middleware-test", List.of("message", "headers_ok"), List.of(), Map.ofEntries(Map.entry("headers_ok", "boolean")), true, false);
  public PingLog() { super(META); }
  @Override protected QueryBuilder<PingLog> newQuery() { return QueryBuilder.forModel(META, PingLog::new); }
  public static QueryBuilder<PingLog> query() { return new PingLog().newQuery(); }
  public static PingLog find(Object id) { return query().find(id); }
  public static PingLog findOrFail(Object id) { return query().findOrFail(id); }
  public static List<PingLog> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static PingLog create(Map<String, Object> values) { return (PingLog) new PingLog().fill(values).save(); }
}
