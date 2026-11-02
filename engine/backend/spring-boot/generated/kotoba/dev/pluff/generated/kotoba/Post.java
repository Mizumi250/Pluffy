package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Post extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_posts", "kotoba", List.of("user_id", "author_name", "author_color", "author_native", "lang", "kind", "mission_id", "body", "translation", "likes_count", "comments_count", "corrections_count"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("user_id", "integer"), Map.entry("mission_id", "integer"), Map.entry("likes_count", "integer"), Map.entry("comments_count", "integer"), Map.entry("corrections_count", "integer")), true, false);
  public Post() { super(META); }
  @Override protected QueryBuilder<Post> newQuery() { return QueryBuilder.forModel(META, Post::new); }
  public static QueryBuilder<Post> query() { return new Post().newQuery(); }
  public static Post find(Object id) { return query().find(id); }
  public static Post findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Post> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Post create(Map<String, Object> values) { return (Post) new Post().fill(values).save(); }
}
