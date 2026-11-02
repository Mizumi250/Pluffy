package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Comment extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_comments", "kotoba", List.of("post_id", "user_id", "author_name", "author_color", "body", "is_correction", "corrected", "explanation", "accepted"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("post_id", "integer"), Map.entry("user_id", "integer"), Map.entry("is_correction", "boolean"), Map.entry("accepted", "boolean")), true, false);
  public Comment() { super(META); }
  @Override protected QueryBuilder<Comment> newQuery() { return QueryBuilder.forModel(META, Comment::new); }
  public static QueryBuilder<Comment> query() { return new Comment().newQuery(); }
  public static Comment find(Object id) { return query().find(id); }
  public static Comment findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Comment> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Comment create(Map<String, Object> values) { return (Comment) new Comment().fill(values).save(); }
}
