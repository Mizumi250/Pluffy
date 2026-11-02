package dev.pluff.generated.inventory_management;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("inventory-management");
    EventDispatcher.unregister("inventory-management");
    CommandRegistry.unregister("inventory-management");
    Router router = new Router("inventory-management");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/inventories", List.of(), (request, response) -> {
      QueryBuilder<Inventory> query = Inventory.query();
      if (request.filled("search")) {
        String search = "%" + request.input("search") + "%";
        query.where(group -> group.orWhere("name", "like", search).orWhere("description", "like", search));
      }
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/inventories", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("name", "required|string|max:255", "sku", "required|string|unique:inventories", "quantity", "required|integer|min:0", "price", "required|numeric|min:0", "category", "nullable|string|max:100", "description", "nullable|string"));
      Inventory created = Inventory.create(validated);
      return response.json(created, 201);
    });
    router.add("GET", "/api/inventories/low-stock", List.of(), (request, response) -> {
      List<Inventory> items = Inventory.query()
          .where("quantity", "<", 20)
          .orderBy("quantity", "asc")
          .get();
      return response.json(mapOf("data", items, "count", items.size()));
    });
    router.add("GET", "/api/inventories/{id}", List.of(), (request, response) -> {
      Inventory inventory = Inventory.findOrFail(request.route("id"));
      return response.json(inventory);
    });
    router.add("PUT", "/api/inventories/{id}", List.of(), (request, response) -> {
      Inventory inventory = Inventory.findOrFail(request.route("id"));
      Map<String, Object> validated = request.validate(Support.mapOf("name", "sometimes|string|max:255", "quantity", "sometimes|integer|min:0", "price", "sometimes|numeric|min:0", "category", "nullable|string|max:100", "description", "nullable|string"));
      inventory.update(validated);
      return response.json(inventory);
    });
    router.add("DELETE", "/api/inventories/{id}", List.of(), (request, response) -> {
      Inventory inventory = Inventory.findOrFail(request.route("id"));
      inventory.delete();
      return response.json(mapOf("message", "Deleted successfully"));
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
