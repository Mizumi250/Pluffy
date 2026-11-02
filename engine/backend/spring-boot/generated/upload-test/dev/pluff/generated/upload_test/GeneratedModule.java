package dev.pluff.generated.upload_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("upload-test");
    EventDispatcher.unregister("upload-test");
    CommandRegistry.unregister("upload-test");
    Router router = new Router("upload-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/upload-test/files", List.of(), (request, response) -> {
      QueryBuilder<UploadedFile> query = UploadedFile.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/upload-test/files", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("files", "required|array", "files.*", "file|max:10240"));
      UploadedFile created = UploadedFile.create(validated);
      return response.json(created, 201);
    });
    router.add("DELETE", "/api/upload-test/files/{id}", List.of(), (request, response) -> {
      UploadedFile uploaded_file = UploadedFile.findOrFail(request.route("id"));
      uploaded_file.delete();
      return response.json(mapOf("message", "Deleted successfully"));
    });
    router.add("GET", "/api/upload-test/files/{id}/url", List.of(), (request, response) -> {
      return response.json(mapOf("message", "Endpoint fileUrl is not implemented yet"), 501);
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
