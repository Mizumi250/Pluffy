package dev.pluff.generated.dtr_geofencing;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Employee extends Model {
  private static final ModelMeta META = ModelMeta.of("dtr_geofencing_employees", "dtr-geofencing", List.of("name", "email", "avatar", "is_active"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("is_active", "boolean")), true, false);
  public Employee() { super(META); }
  @Override protected QueryBuilder<Employee> newQuery() { return QueryBuilder.forModel(META, Employee::new); }
  public static QueryBuilder<Employee> query() { return new Employee().newQuery(); }
  public static Employee find(Object id) { return query().find(id); }
  public static Employee findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Employee> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Employee create(Map<String, Object> values) { return (Employee) new Employee().fill(values).save(); }
}
