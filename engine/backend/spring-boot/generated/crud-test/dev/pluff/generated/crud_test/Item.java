package dev.pluff.generated.crud_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Item extends Model {
  private static final ModelMeta META = ModelMeta.of("crud_test_items", "crud-test", List.of("name", "description", "status", "priority", "tags"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("priority", "integer")), true, false);
  public Item() { super(META); }
  @Override protected QueryBuilder<Item> newQuery() { return QueryBuilder.forModel(META, Item::new); }
  public static QueryBuilder<Item> query() { return new Item().newQuery(); }
  public static Item find(Object id) { return query().find(id); }
  public static Item findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Item> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Item create(Map<String, Object> values) { return (Item) new Item().fill(values).save(); }
}
