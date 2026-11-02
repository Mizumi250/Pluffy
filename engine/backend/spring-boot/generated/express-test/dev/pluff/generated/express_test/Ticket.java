package dev.pluff.generated.express_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Ticket extends Model {
  private static final ModelMeta META = ModelMeta.of("express_test_tickets", "express-test", List.of("user_id", "title", "status", "priority", "done"), List.of(), Map.ofEntries(Map.entry("user_id", "integer"), Map.entry("priority", "integer"), Map.entry("done", "boolean")), true, false);
  public Ticket() { super(META); }
  @Override protected QueryBuilder<Ticket> newQuery() { return QueryBuilder.forModel(META, Ticket::new); }
  public static QueryBuilder<Ticket> query() { return new Ticket().newQuery(); }
  public static Ticket find(Object id) { return query().find(id); }
  public static Ticket findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Ticket> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Ticket create(Map<String, Object> values) { return (Ticket) new Ticket().fill(values).save(); }
}
