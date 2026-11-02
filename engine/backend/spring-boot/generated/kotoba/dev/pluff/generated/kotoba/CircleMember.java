package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class CircleMember extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_circle_members", "kotoba", List.of("circle_id", "user_id"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("circle_id", "integer"), Map.entry("user_id", "integer")), true, false);
  public CircleMember() { super(META); }
  @Override protected QueryBuilder<CircleMember> newQuery() { return QueryBuilder.forModel(META, CircleMember::new); }
  public static QueryBuilder<CircleMember> query() { return new CircleMember().newQuery(); }
  public static CircleMember find(Object id) { return query().find(id); }
  public static CircleMember findOrFail(Object id) { return query().findOrFail(id); }
  public static List<CircleMember> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static CircleMember create(Map<String, Object> values) { return (CircleMember) new CircleMember().fill(values).save(); }
}
