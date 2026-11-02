package dev.pluff.generated.shikaku;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class ShikakuProject extends Model {
  private static final ModelMeta META = ModelMeta.of("shikaku_projects", "shikaku", List.of("user_id", "name", "width", "height", "thumbnail"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("user_id", "integer"), Map.entry("width", "integer"), Map.entry("height", "integer")), true, false);
  public ShikakuProject() { super(META); }
  @Override protected QueryBuilder<ShikakuProject> newQuery() { return QueryBuilder.forModel(META, ShikakuProject::new); }
  public static QueryBuilder<ShikakuProject> query() { return new ShikakuProject().newQuery(); }
  public static ShikakuProject find(Object id) { return query().find(id); }
  public static ShikakuProject findOrFail(Object id) { return query().findOrFail(id); }
  public static List<ShikakuProject> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static ShikakuProject create(Map<String, Object> values) { return (ShikakuProject) new ShikakuProject().fill(values).save(); }
}
