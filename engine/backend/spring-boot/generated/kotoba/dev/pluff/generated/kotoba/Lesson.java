package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Lesson extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_lessons", "kotoba", List.of("lang", "unit", "title", "emoji", "level", "position", "xp", "content"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("position", "integer"), Map.entry("xp", "integer")), true, false);
  public Lesson() { super(META); }
  @Override protected QueryBuilder<Lesson> newQuery() { return QueryBuilder.forModel(META, Lesson::new); }
  public static QueryBuilder<Lesson> query() { return new Lesson().newQuery(); }
  public static Lesson find(Object id) { return query().find(id); }
  public static Lesson findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Lesson> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Lesson create(Map<String, Object> values) { return (Lesson) new Lesson().fill(values).save(); }
}
