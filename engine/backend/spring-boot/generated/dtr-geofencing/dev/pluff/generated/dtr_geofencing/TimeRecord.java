package dev.pluff.generated.dtr_geofencing;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class TimeRecord extends Model {
  private static final ModelMeta META = ModelMeta.of("dtr_geofencing_time_records", "dtr-geofencing", List.of("employee_id", "type", "timestamp", "latitude", "longitude", "within_geofence", "notes"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("employee_id", "integer"), Map.entry("timestamp", "datetime"), Map.entry("latitude", "decimal:2"), Map.entry("longitude", "decimal:2"), Map.entry("within_geofence", "boolean")), true, false);
  public TimeRecord() { super(META); }
  @Override protected QueryBuilder<TimeRecord> newQuery() { return QueryBuilder.forModel(META, TimeRecord::new); }
  public static QueryBuilder<TimeRecord> query() { return new TimeRecord().newQuery(); }
  public static TimeRecord find(Object id) { return query().find(id); }
  public static TimeRecord findOrFail(Object id) { return query().findOrFail(id); }
  public static List<TimeRecord> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static TimeRecord create(Map<String, Object> values) { return (TimeRecord) new TimeRecord().fill(values).save(); }
}
