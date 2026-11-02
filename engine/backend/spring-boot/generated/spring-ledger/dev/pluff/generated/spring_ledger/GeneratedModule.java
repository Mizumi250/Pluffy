package dev.pluff.generated.spring_ledger;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("spring-ledger");
    EventDispatcher.unregister("spring-ledger");
    CommandRegistry.unregister("spring-ledger");
    Router router = new Router("spring-ledger");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/spring-ledger/accounts", List.of(), (request, response) -> {
      QueryBuilder<Account> query = Account.query();
      return response.json(query.orderBy("created_at", "desc").get());
    });
    router.add("POST", "/api/spring-ledger/accounts/transfer", List.of(), (request, response) -> {
      Map<String, Object> input = request.validate(mapOf(
          "from_account_id", "required|integer",
          "to_account_id", "required|integer",
          "amount", "required|numeric|min:0.01"
      ));
      BigDecimal amount = new BigDecimal(String.valueOf(input.get("amount")));
      if (amount.signum() <= 0) throw new Errors.HttpException(422, "Transfer amount must be positive.");
      if (String.valueOf(input.get("from_account_id")).equals(String.valueOf(input.get("to_account_id"))))
          throw new Errors.HttpException(422, "Choose two different accounts for a transfer.");

      return DB.transaction(() -> {
          Account source = Account.findOrFail(input.get("from_account_id"));
          Account destination = Account.findOrFail(input.get("to_account_id"));
          BigDecimal sourceBalance = new BigDecimal(source.str("balance"));
          BigDecimal destinationBalance = new BigDecimal(destination.str("balance"));
          if (sourceBalance.compareTo(amount) < 0)
              throw new Errors.HttpException(422, "Insufficient funds.");

          source.set("balance", sourceBalance.subtract(amount)).save();
          destination.set("balance", destinationBalance.add(amount)).save();
          Transfer transfer = Transfer.create(mapOf(
              "from_account_id", source.id(),
              "to_account_id", destination.id(),
              "amount", amount,
              "status", "completed"
          ));
          return response.json(mapOf(
              "transfer", transfer,
              "from_balance", source.str("balance"),
              "to_balance", destination.str("balance")
          ), 201);
      });
    });
    router.add("GET", "/api/spring-ledger/transfers", List.of(), (request, response) -> {
      QueryBuilder<Transfer> query = Transfer.query();
      return response.json(query.orderBy("created_at", "desc").get());
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
