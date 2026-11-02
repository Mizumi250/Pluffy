package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Mission extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_missions", "kotoba", List.of("lang", "level", "title", "prompt", "hint", "position"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("position", "integer")), true, false);
  public Mission() { super(META); }
  @Override protected QueryBuilder<Mission> newQuery() { return QueryBuilder.forModel(META, Mission::new); }
  public static QueryBuilder<Mission> query() { return new Mission().newQuery(); }
  public static Mission find(Object id) { return query().find(id); }
  public static Mission findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Mission> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Mission create(Map<String, Object> values) { return (Mission) new Mission().fill(values).save(); }
}
