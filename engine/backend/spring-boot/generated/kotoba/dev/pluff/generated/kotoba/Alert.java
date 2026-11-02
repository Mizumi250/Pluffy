package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Alert extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_alerts", "kotoba", List.of("user_id", "kind", "text", "ref", "is_read"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("user_id", "integer"), Map.entry("ref", "integer"), Map.entry("is_read", "boolean")), true, false);
  public Alert() { super(META); }
  @Override protected QueryBuilder<Alert> newQuery() { return QueryBuilder.forModel(META, Alert::new); }
  public static QueryBuilder<Alert> query() { return new Alert().newQuery(); }
  public static Alert find(Object id) { return query().find(id); }
  public static Alert findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Alert> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Alert create(Map<String, Object> values) { return (Alert) new Alert().fill(values).save(); }
}
