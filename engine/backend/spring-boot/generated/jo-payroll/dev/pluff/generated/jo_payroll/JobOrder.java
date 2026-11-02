package dev.pluff.generated.jo_payroll;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class JobOrder extends Model {
  private static final ModelMeta META = ModelMeta.of("jo_payroll_job_orders", "jo-payroll", List.of("jor_number", "name_of_jo", "job_title", "funding", "basic_pay", "disbursement_type", "jor_pyrl_group", "hdmf_no", "cash_card", "cash_card_number", "sss_number", "sss_amount", "calamity_loan", "hdmf_mpl", "hdmf_premium", "last_name", "first_name", "middle_name", "appointment_date", "appointment_order", "status"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("jor_number", "integer"), Map.entry("basic_pay", "decimal:2"), Map.entry("sss_amount", "decimal:2"), Map.entry("calamity_loan", "decimal:2"), Map.entry("hdmf_mpl", "decimal:2"), Map.entry("hdmf_premium", "decimal:2"), Map.entry("appointment_date", "date"), Map.entry("appointment_order", "integer")), true, false);
  public JobOrder() { super(META); }
  @Override protected QueryBuilder<JobOrder> newQuery() { return QueryBuilder.forModel(META, JobOrder::new); }
  public static QueryBuilder<JobOrder> query() { return new JobOrder().newQuery(); }
  public static JobOrder find(Object id) { return query().find(id); }
  public static JobOrder findOrFail(Object id) { return query().findOrFail(id); }
  public static List<JobOrder> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static JobOrder create(Map<String, Object> values) { return (JobOrder) new JobOrder().fill(values).save(); }
}
