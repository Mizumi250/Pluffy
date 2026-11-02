package dev.pluff.generated.shikaku;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class ShikakuSave extends Model {
  private static final ModelMeta META = ModelMeta.of("shikaku_saves", "shikaku", List.of("project_id", "frames_json", "version"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("project_id", "integer"), Map.entry("version", "integer")), true, false);
  public ShikakuSave() { super(META); }
  @Override protected QueryBuilder<ShikakuSave> newQuery() { return QueryBuilder.forModel(META, ShikakuSave::new); }
  public static QueryBuilder<ShikakuSave> query() { return new ShikakuSave().newQuery(); }
  public static ShikakuSave find(Object id) { return query().find(id); }
  public static ShikakuSave findOrFail(Object id) { return query().findOrFail(id); }
  public static List<ShikakuSave> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static ShikakuSave create(Map<String, Object> values) { return (ShikakuSave) new ShikakuSave().fill(values).save(); }
}
