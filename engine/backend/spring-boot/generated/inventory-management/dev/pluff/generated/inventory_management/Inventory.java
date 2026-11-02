package dev.pluff.generated.inventory_management;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Inventory extends Model {
  private static final ModelMeta META = ModelMeta.of("inventory_management_inventories", "inventory-management", List.of("name", "sku", "quantity", "price", "category", "description"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("quantity", "integer"), Map.entry("price", "decimal:2")), true, false);
  public Inventory() { super(META); }
  @Override protected QueryBuilder<Inventory> newQuery() { return QueryBuilder.forModel(META, Inventory::new); }
  public static QueryBuilder<Inventory> query() { return new Inventory().newQuery(); }
  public static Inventory find(Object id) { return query().find(id); }
  public static Inventory findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Inventory> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Inventory create(Map<String, Object> values) { return (Inventory) new Inventory().fill(values).save(); }
}
