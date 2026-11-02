package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Follow extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_follows", "kotoba", List.of("follower_id", "following_id"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("follower_id", "integer"), Map.entry("following_id", "integer")), true, false);
  public Follow() { super(META); }
  @Override protected QueryBuilder<Follow> newQuery() { return QueryBuilder.forModel(META, Follow::new); }
  public static QueryBuilder<Follow> query() { return new Follow().newQuery(); }
  public static Follow find(Object id) { return query().find(id); }
  public static Follow findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Follow> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Follow create(Map<String, Object> values) { return (Follow) new Follow().fill(values).save(); }
}
