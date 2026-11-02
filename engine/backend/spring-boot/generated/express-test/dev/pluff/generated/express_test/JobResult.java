package dev.pluff.generated.express_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class JobResult extends Model {
  private static final ModelMeta META = ModelMeta.of("express_test_job_results", "express-test", List.of("job_name", "status"), List.of(), Map.of(), true, false);
  public JobResult() { super(META); }
  @Override protected QueryBuilder<JobResult> newQuery() { return QueryBuilder.forModel(META, JobResult::new); }
  public static QueryBuilder<JobResult> query() { return new JobResult().newQuery(); }
  public static JobResult find(Object id) { return query().find(id); }
  public static JobResult findOrFail(Object id) { return query().findOrFail(id); }
  public static List<JobResult> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static JobResult create(Map<String, Object> values) { return (JobResult) new JobResult().fill(values).save(); }
}
