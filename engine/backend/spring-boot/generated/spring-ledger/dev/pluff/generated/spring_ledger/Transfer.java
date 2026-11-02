package dev.pluff.generated.spring_ledger;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Transfer extends Model {
  private static final ModelMeta META = ModelMeta.of("spring_ledger_transfers", "spring-ledger", List.of("from_account_id", "to_account_id", "amount", "status"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("from_account_id", "integer"), Map.entry("to_account_id", "integer"), Map.entry("amount", "decimal:2")), true, false);
  public Transfer() { super(META); }
  @Override protected QueryBuilder<Transfer> newQuery() { return QueryBuilder.forModel(META, Transfer::new); }
  public static QueryBuilder<Transfer> query() { return new Transfer().newQuery(); }
  public static Transfer find(Object id) { return query().find(id); }
  public static Transfer findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Transfer> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Transfer create(Map<String, Object> values) { return (Transfer) new Transfer().fill(values).save(); }
}
