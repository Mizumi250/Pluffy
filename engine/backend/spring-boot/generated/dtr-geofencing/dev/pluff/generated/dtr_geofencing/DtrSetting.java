package dev.pluff.generated.dtr_geofencing;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class DtrSetting extends Model {
  private static final ModelMeta META = ModelMeta.of("dtr_geofencing_dtr_settings", "dtr-geofencing", List.of("key", "value"), List.of(), Map.ofEntries(Map.entry("id", "integer")), true, false);
  public DtrSetting() { super(META); }
  @Override protected QueryBuilder<DtrSetting> newQuery() { return QueryBuilder.forModel(META, DtrSetting::new); }
  public static QueryBuilder<DtrSetting> query() { return new DtrSetting().newQuery(); }
  public static DtrSetting find(Object id) { return query().find(id); }
  public static DtrSetting findOrFail(Object id) { return query().findOrFail(id); }
  public static List<DtrSetting> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static DtrSetting create(Map<String, Object> values) { return (DtrSetting) new DtrSetting().fill(values).save(); }
}
