package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Circle extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_circles", "kotoba", List.of("name", "emoji", "lang", "level", "description", "owner_id", "members_count", "weekly_goal"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("owner_id", "integer"), Map.entry("members_count", "integer"), Map.entry("weekly_goal", "integer")), true, false);
  public Circle() { super(META); }
  @Override protected QueryBuilder<Circle> newQuery() { return QueryBuilder.forModel(META, Circle::new); }
  public static QueryBuilder<Circle> query() { return new Circle().newQuery(); }
  public static Circle find(Object id) { return query().find(id); }
  public static Circle findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Circle> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Circle create(Map<String, Object> values) { return (Circle) new Circle().fill(values).save(); }
}
