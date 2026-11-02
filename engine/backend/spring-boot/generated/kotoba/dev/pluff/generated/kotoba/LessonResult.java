package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class LessonResult extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_lesson_results", "kotoba", List.of("user_id", "lesson_id", "score", "best"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("user_id", "integer"), Map.entry("lesson_id", "integer"), Map.entry("score", "integer"), Map.entry("best", "integer")), true, false);
  public LessonResult() { super(META); }
  @Override protected QueryBuilder<LessonResult> newQuery() { return QueryBuilder.forModel(META, LessonResult::new); }
  public static QueryBuilder<LessonResult> query() { return new LessonResult().newQuery(); }
  public static LessonResult find(Object id) { return query().find(id); }
  public static LessonResult findOrFail(Object id) { return query().findOrFail(id); }
  public static List<LessonResult> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static LessonResult create(Map<String, Object> values) { return (LessonResult) new LessonResult().fill(values).save(); }
}
