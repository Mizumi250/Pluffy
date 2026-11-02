package dev.pluff.generated.queue_flow;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Ticket extends Model {
  private static final ModelMeta META = ModelMeta.of("queue_flow_tickets", "queue-flow", List.of("queue_id", "ticket_number", "customer_name", "status", "position", "called_at", "served_at"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("queue_id", "integer"), Map.entry("position", "integer"), Map.entry("called_at", "datetime"), Map.entry("served_at", "datetime")), true, false);
  public Ticket() { super(META); }
  @Override protected QueryBuilder<Ticket> newQuery() { return QueryBuilder.forModel(META, Ticket::new); }
  public static QueryBuilder<Ticket> query() { return new Ticket().newQuery(); }
  public static Ticket find(Object id) { return query().find(id); }
  public static Ticket findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Ticket> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Ticket create(Map<String, Object> values) { return (Ticket) new Ticket().fill(values).save(); }
}
