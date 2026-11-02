package dev.pluff.generated.events_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class EventLog extends Model {
  private static final ModelMeta META = ModelMeta.of("events_test_event_log", "events-test", List.of("event_name", "listener_name", "status", "payload", "duration_ms"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("duration_ms", "integer")), true, false);
  public EventLog() { super(META); }
  @Override protected QueryBuilder<EventLog> newQuery() { return QueryBuilder.forModel(META, EventLog::new); }
  public static QueryBuilder<EventLog> query() { return new EventLog().newQuery(); }
  public static EventLog find(Object id) { return query().find(id); }
  public static EventLog findOrFail(Object id) { return query().findOrFail(id); }
  public static List<EventLog> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static EventLog create(Map<String, Object> values) { return (EventLog) new EventLog().fill(values).save(); }
}
