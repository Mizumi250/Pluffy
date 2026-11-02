package dev.pluff.generated.queue_flow;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Queue extends Model {
  private static final ModelMeta META = ModelMeta.of("queue_flow_queues", "queue-flow", List.of("name", "description", "prefix", "is_active", "avg_wait_minutes"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("is_active", "boolean"), Map.entry("avg_wait_minutes", "integer")), true, false);
  public Queue() { super(META); }
  @Override protected QueryBuilder<Queue> newQuery() { return QueryBuilder.forModel(META, Queue::new); }
  public static QueryBuilder<Queue> query() { return new Queue().newQuery(); }
  public static Queue find(Object id) { return query().find(id); }
  public static Queue findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Queue> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Queue create(Map<String, Object> values) { return (Queue) new Queue().fill(values).save(); }
}
