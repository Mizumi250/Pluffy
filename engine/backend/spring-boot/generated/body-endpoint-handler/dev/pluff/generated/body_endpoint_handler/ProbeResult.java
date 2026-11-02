package dev.pluff.generated.body_endpoint_handler;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class ProbeResult extends Model {
  private static final ModelMeta META = ModelMeta.of("body_endpoint_handler_probe_results", "body-endpoint-handler", List.of("source", "probe", "payload", "result", "ok"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("ok", "boolean")), true, false);
  public ProbeResult() { super(META); }
  @Override protected QueryBuilder<ProbeResult> newQuery() { return QueryBuilder.forModel(META, ProbeResult::new); }
  public static QueryBuilder<ProbeResult> query() { return new ProbeResult().newQuery(); }
  public static ProbeResult find(Object id) { return query().find(id); }
  public static ProbeResult findOrFail(Object id) { return query().findOrFail(id); }
  public static List<ProbeResult> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static ProbeResult create(Map<String, Object> values) { return (ProbeResult) new ProbeResult().fill(values).save(); }
}
