package dev.pluff.generated.spring_ledger;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Account extends Model {
  private static final ModelMeta META = ModelMeta.of("spring_ledger_accounts", "spring-ledger", List.of("name", "balance"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("balance", "decimal:2")), true, false);
  public Account() { super(META); }
  @Override protected QueryBuilder<Account> newQuery() { return QueryBuilder.forModel(META, Account::new); }
  public static QueryBuilder<Account> query() { return new Account().newQuery(); }
  public static Account find(Object id) { return query().find(id); }
  public static Account findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Account> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Account create(Map<String, Object> values) { return (Account) new Account().fill(values).save(); }
}
