package dev.pluff.generated.jo_payroll;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("jo-payroll");
    EventDispatcher.unregister("jo-payroll");
    CommandRegistry.unregister("jo-payroll");
    Router router = new Router("jo-payroll");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/jo-payroll/job-orders", List.of(), (request, response) -> {
      QueryBuilder<JobOrder> query = JobOrder.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/jo-payroll/job-orders", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("jor_number", "required|integer|min:0", "name_of_jo", "required|string|max:255", "job_title", "required|string|max:255", "funding", "required|string|max:255", "basic_pay", "required|numeric|min:0", "disbursement_type", "required|string|in:CASH,ATM", "status", "string|in:active,inactive"));
      JobOrder created = JobOrder.create(validated);
      return response.json(created, 201);
    });
    router.add("GET", "/api/jo-payroll/job-orders/stats/summary", List.of(), (request, response) -> {
      List<JobOrder> activeOrders = JobOrder.query().where("status", "active").get();
      long inactiveCount = JobOrder.query().where("status", "inactive").count();
      long totalCash = 0;
      long totalAtm = 0;
      double totalBasicPay = 0;
      double totalSss = 0;
      double totalHdmfPremium = 0;
      double totalHdmfMpl = 0;
      double totalCalamityLoan = 0;
      Map<String, Map<String, Object>> fundingBreakdown = new LinkedHashMap<>();
      Map<String, Integer> groupBreakdown = new LinkedHashMap<>();
      for (JobOrder order : activeOrders) {
          if ("CASH".equals(order.str("disbursement_type"))) totalCash++;
          if ("ATM".equals(order.str("disbursement_type"))) totalAtm++;
          Object basicPayValue = order.get("basic_pay");
          double basicPay = basicPayValue == null ? 0 : Double.parseDouble(String.valueOf(basicPayValue));
          Object sssValue = order.get("sss_amount");
          Object hdmfPremiumValue = order.get("hdmf_premium");
          Object hdmfMplValue = order.get("hdmf_mpl");
          Object calamityLoanValue = order.get("calamity_loan");
          totalBasicPay += basicPay;
          totalSss += sssValue == null ? 0 : Double.parseDouble(String.valueOf(sssValue));
          totalHdmfPremium += hdmfPremiumValue == null ? 0 : Double.parseDouble(String.valueOf(hdmfPremiumValue));
          totalHdmfMpl += hdmfMplValue == null ? 0 : Double.parseDouble(String.valueOf(hdmfMplValue));
          totalCalamityLoan += calamityLoanValue == null ? 0 : Double.parseDouble(String.valueOf(calamityLoanValue));
          String funding = order.str("funding") == null ? "" : order.str("funding");
          Map<String, Object> fundingTotals = fundingBreakdown.computeIfAbsent(funding, key -> mapOf("count", 0, "total_pay", 0.0));
          fundingTotals.put("count", ((Number) fundingTotals.get("count")).intValue() + 1);
          fundingTotals.put("total_pay", ((Number) fundingTotals.get("total_pay")).doubleValue() + basicPay);
          String group = order.str("jor_pyrl_group") == null ? "" : order.str("jor_pyrl_group");
          groupBreakdown.put(group, groupBreakdown.getOrDefault(group, 0) + 1);
      }
      double totalDeductions = totalSss + totalHdmfPremium + totalHdmfMpl + totalCalamityLoan;
      return response.json(mapOf(
          "total_active", activeOrders.size(),
          "total_inactive", inactiveCount,
          "total_atm", totalAtm,
          "total_cash", totalCash,
          "total_basic_pay", totalBasicPay,
          "total_sss", totalSss,
          "total_hdmf_premium", totalHdmfPremium,
          "total_hdmf_mpl", totalHdmfMpl,
          "total_calamity_loan", totalCalamityLoan,
          "total_deductions", totalDeductions,
          "net_pay", totalBasicPay - totalDeductions,
          "funding_breakdown", fundingBreakdown,
          "group_breakdown", groupBreakdown
      ));
    });
    router.add("GET", "/api/jo-payroll/job-orders/appointments/list", List.of(), (request, response) -> {
      List<JobOrder> orders = JobOrder.query()
          .whereNotNull("appointment_order")
          .orderBy("appointment_order")
          .get();
      return response.json(orders);
    });
    router.add("GET", "/api/jo-payroll/job-orders/{id}", List.of(), (request, response) -> {
      JobOrder job_order = JobOrder.findOrFail(request.route("id"));
      return response.json(job_order);
    });
    router.add("PUT", "/api/jo-payroll/job-orders/{id}", List.of(), (request, response) -> {
      JobOrder job_order = JobOrder.findOrFail(request.route("id"));
      Map<String, Object> validated = request.validate(Support.mapOf("jor_number", "integer|min:0", "name_of_jo", "string|max:255", "job_title", "string|max:255", "funding", "string|max:255", "basic_pay", "numeric|min:0", "disbursement_type", "string|in:CASH,ATM", "status", "string|in:active,inactive"));
      job_order.update(validated);
      return response.json(job_order);
    });
    router.add("DELETE", "/api/jo-payroll/job-orders/{id}", List.of(), (request, response) -> {
      JobOrder job_order = JobOrder.findOrFail(request.route("id"));
      job_order.delete();
      return response.json(mapOf("message", "Deleted successfully"));
    });
    router.add("GET", "/api/jo-payroll/job-orders/group/{group}", List.of(), (request, response) -> {
      Object group = request.route("group");
      List<JobOrder> orders = JobOrder.query()
          .where("jor_pyrl_group", group)
          .where("status", "active")
          .orderBy("jor_number")
          .get();
      return response.json(orders);
    });
    return router;
  }
  private static Map<String, Map<String, Object>> mailTemplates() {
    Map<String, Map<String, Object>> templates = new LinkedHashMap<>();
    return templates;
  }
  private static Router.Middleware customMiddleware(String name) {
    throw new IllegalArgumentException("Unknown middleware: " + name);
  }
  private static Notification notificationFor(String name) {
    return switch (name) {
      default -> null;
    };
  }
  private static Map<String, Object> objectMap(Object value) {
    Map<String, Object> out = new LinkedHashMap<>();
    if (value instanceof Map<?, ?> values) values.forEach((key, item) -> out.put(String.valueOf(key), item));
    return out;
  }
}
