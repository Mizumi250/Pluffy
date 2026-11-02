package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Like extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_likes", "kotoba", List.of("post_id", "user_id"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("post_id", "integer"), Map.entry("user_id", "integer")), true, false);
  public Like() { super(META); }
  @Override protected QueryBuilder<Like> newQuery() { return QueryBuilder.forModel(META, Like::new); }
  public static QueryBuilder<Like> query() { return new Like().newQuery(); }
  public static Like find(Object id) { return query().find(id); }
  public static Like findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Like> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Like create(Map<String, Object> values) { return (Like) new Like().fill(values).save(); }
}
