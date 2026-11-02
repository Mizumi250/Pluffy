package dev.pluff.generated.crud_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    Router router = new Router("crud-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/crud-test/items", List.of(), (request, response) -> {
      QueryBuilder<Item> query = Item.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/crud-test/items", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("name", "required|string|max:255", "description", "nullable|string", "status", "sometimes|string|in:active,pending,archived", "priority", "sometimes|integer|min:0", "tags", "nullable|string"));
      Item created = Item.create(validated);
      return response.json(created, 201);
    });
    router.add("GET", "/api/crud-test/items/{id}", List.of(), (request, response) -> {
      Item item = Item.findOrFail(request.route("id"));
      return response.json(item);
    });
    router.add("PUT", "/api/crud-test/items/{id}", List.of(), (request, response) -> {
      Item item = Item.findOrFail(request.route("id"));
      Map<String, Object> validated = request.validate(Support.mapOf("name", "sometimes|string|max:255", "description", "nullable|string", "status", "sometimes|string|in:active,pending,archived", "priority", "sometimes|integer|min:0", "tags", "nullable|string"));
      item.update(validated);
      return response.json(item);
    });
    router.add("DELETE", "/api/crud-test/items/{id}", List.of(), (request, response) -> {
      Item item = Item.findOrFail(request.route("id"));
      item.delete();
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
}
