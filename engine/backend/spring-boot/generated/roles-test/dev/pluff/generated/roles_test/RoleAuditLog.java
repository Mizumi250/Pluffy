package dev.pluff.generated.roles_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class RoleAuditLog extends Model {
  private static final ModelMeta META = ModelMeta.of("roles_test_role_audit_logs", "roles-test", List.of("user_id", "action", "role_required", "granted"), List.of(), Map.ofEntries(Map.entry("user_id", "integer"), Map.entry("granted", "boolean")), true, false);
  public RoleAuditLog() { super(META); }
  @Override protected QueryBuilder<RoleAuditLog> newQuery() { return QueryBuilder.forModel(META, RoleAuditLog::new); }
  public static QueryBuilder<RoleAuditLog> query() { return new RoleAuditLog().newQuery(); }
  public static RoleAuditLog find(Object id) { return query().find(id); }
  public static RoleAuditLog findOrFail(Object id) { return query().findOrFail(id); }
  public static List<RoleAuditLog> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static RoleAuditLog create(Map<String, Object> values) { return (RoleAuditLog) new RoleAuditLog().fill(values).save(); }
}
