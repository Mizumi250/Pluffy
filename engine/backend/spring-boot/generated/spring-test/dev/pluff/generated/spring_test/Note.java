package dev.pluff.generated.spring_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Note extends Model {
  private static final ModelMeta META = ModelMeta.of("spring_test_notes", "spring-test", List.of("title", "body", "pinned"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("pinned", "boolean")), true, false);
  public Note() { super(META); }
  @Override protected QueryBuilder<Note> newQuery() { return QueryBuilder.forModel(META, Note::new); }
  public static QueryBuilder<Note> query() { return new Note().newQuery(); }
  public static Note find(Object id) { return query().find(id); }
  public static Note findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Note> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Note create(Map<String, Object> values) { return (Note) new Note().fill(values).save(); }
}
