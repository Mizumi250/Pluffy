package dev.pluff.generated.job_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class JobResult extends Model {
  private static final ModelMeta META = ModelMeta.of("job_test_job_results", "job-test", List.of("job_name", "status", "result", "processed_at"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("processed_at", "datetime")), true, false);
  public JobResult() { super(META); }
  @Override protected QueryBuilder<JobResult> newQuery() { return QueryBuilder.forModel(META, JobResult::new); }
  public static QueryBuilder<JobResult> query() { return new JobResult().newQuery(); }
  public static JobResult find(Object id) { return query().find(id); }
  public static JobResult findOrFail(Object id) { return query().findOrFail(id); }
  public static List<JobResult> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static JobResult create(Map<String, Object> values) { return (JobResult) new JobResult().fill(values).save(); }
}
