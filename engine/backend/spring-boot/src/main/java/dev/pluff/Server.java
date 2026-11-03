package dev.pluff;

import dev.pluff.engine.Build;
import dev.pluff.runtime.Broadcast;
import dev.pluff.runtime.Errors;
import dev.pluff.runtime.Json;
import dev.pluff.runtime.Log;
import dev.pluff.runtime.Request;
import dev.pluff.runtime.Response;
import dev.pluff.runtime.Router;
import dev.pluff.runtime.Support;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@SpringBootApplication
public class Server implements CommandLineRunner {
  public static void main(String[] args) {
    SpringApplication.run(Server.class, args);
  }

  @Override
  public void run(String... args) {
    Build.loadAllGenerated();
    Broadcast.start(Support.toInt(Support.env("REVERB_PORT", "8080"), 8080));
    Log.info("Spring Boot backend on http://localhost:" + Support.env("PORT", "8000"));
  }

  @RestController
  @CrossOrigin(origins = "*", allowedHeaders = "*")
  public static class CatchAllController {
    private static final String SECRET = Support.env("ARKZEN_ENGINE_SECRET", "arkzen-engine-secret");
    private static final List<String> METHODS = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");

    @RequestMapping(value = "/**", method = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH,
        RequestMethod.DELETE, RequestMethod.OPTIONS
    })
    public ResponseEntity<?> dispatch(HttpServletRequest raw,
                                      @RequestBody(required = false) String rawBody) {
      try {
        String path = raw.getRequestURI();
        String method = raw.getMethod().toUpperCase();
        if (!METHODS.contains(method)) return json(Map.of("message", "Method Not Allowed"), 405);
        Map<String, Object> body = parseBody(raw, rawBody);

        if (path.startsWith("/arkzen/")) return engine(raw, path, method, body);
        for (Router router : Build.routers().values()) {
          Request request = new Request(raw, router.slug(), body, Map.of(), Map.of());
          Router.Dispatch result = router.dispatch(request, new Response());
          if (result.matched) return respond(result.result);
        }
        return json(Map.of("message", "Not Found"), 404);
      } catch (Exception error) {
        return renderError(error);
      }
    }

    private ResponseEntity<?> engine(HttpServletRequest request, String path, String method, Map<String, Object> body) throws Exception {
      if (path.equals("/arkzen/health") && method.equals("GET"))
        return json(Map.of("status", "ok", "engine", "Pluff Spring Boot Backend Engine",
            "backend", "spring-boot", "variant", "java", "version", "1.0.0"), 200);
      if (path.equals("/arkzen/registry") && method.equals("GET")) {
        return json(readHubRegistry(), 200);
      }
      if (path.equals("/arkzen/expo-registry") && method.equals("GET")) {
        Path registry = Support.REPO_ROOT.resolve("engine/frontend/expo/expo-registry.json");
        if (Files.exists(registry)) return json(Json.parseObject(Files.readString(registry)), 200);
        return json(Map.of("engine", "1.0.0", "project", "expo", "modules", List.of()), 200);
      }
      if (!"POST".equals(method)) return json(Map.of("message", "Not Found"), 404);
      if (!SECRET.equals(request.getHeader("x-arkzen-secret")))
        return json(Map.of("message", "Invalid engine secret."), 403);
      if (path.equals("/arkzen/build")) {
        Map<String, Object> result = Build.buildTatemono(body);
        int status = Support.toInt(result.remove("status"), 500);
        return json(result, status);
      }
      if (path.equals("/arkzen/remove")) return json(Build.removeTatemono(body), 200);
      return json(Map.of("message", "Not Found"), 404);
    }

    private static Map<String, Object> readHubRegistry() throws IOException {
      Path root = Support.REPO_ROOT.toAbsolutePath().normalize();
      Path registryPath = root.resolve("arkzen.json");
      Map<String, Object> registry = Files.exists(registryPath)
          ? Json.parseObject(Files.readString(registryPath))
          : new LinkedHashMap<>(Map.of("project", root.getFileName().toString()));
      String activeStack = String.valueOf(registry.getOrDefault("activeStack", "nextjs"));
      String activeBackend = activeStack.equals("react-inertia")
          ? "laravel-inertia"
          : String.valueOf(registry.getOrDefault("activeBackend", "laravel"));

      Map<String, Map<String, Object>> modules = new LinkedHashMap<>();
      Path tatemonos = root.resolve("tatemonos");
      if (Files.isDirectory(tatemonos)) {
        try (var entries = Files.list(tatemonos)) {
          for (Path directory : entries.filter(Files::isDirectory).toList()) {
            Path sourcePath = directory.resolve("core.tsx");
            if (!Files.isRegularFile(sourcePath)) continue;
            String source = Files.readString(sourcePath);
            Matcher meta = Pattern.compile("/\\* @arkzen:meta\\b([\\s\\S]*?)\\*/").matcher(source);
            if (!meta.find()) continue;
            String name = metaField(meta.group(1), "name");
            if (name == null || name.isBlank()) continue;
            Map<String, Object> module = modules.computeIfAbsent(name, ignored -> new LinkedHashMap<>());
            module.put("name", name);
            module.put("version", valueOr(metaField(meta.group(1), "version"), "1.0.0"));
            module.putIfAbsent("status", "active");
            module.put("filePath", root.relativize(sourcePath).toString().replace('\\', '/'));
            module.put("pages", hubPageNames(source));
            module.put("auth", "true".equalsIgnoreCase(metaField(meta.group(1), "auth")));
          }
        }
      }

      Object registeredModules = registry.get("modules");
      if (registeredModules instanceof List<?> list) {
        for (Object value : list) {
          if (!(value instanceof Map<?, ?> registered) || registered.get("name") == null) continue;
          String name = String.valueOf(registered.get("name"));
          Map<String, Object> module = modules.computeIfAbsent(name, ignored -> new LinkedHashMap<>());
          registered.forEach((key, item) -> module.put(String.valueOf(key), item));
        }
      }

      List<Map<String, Object>> enriched = new ArrayList<>();
      for (Map<String, Object> module : modules.values()) {
        String name = String.valueOf(module.get("name"));
        String relativePath = String.valueOf(module.getOrDefault("filePath", "tatemonos/" + name + "/core.tsx"));
        Path sourcePath = root.resolve(relativePath).normalize();
        if (!sourcePath.startsWith(root) || !Files.isRegularFile(sourcePath)) {
          module.put("frontend", List.of());
          module.put("backend", List.of());
          enriched.add(module);
          continue;
        }
        String source = Files.readString(sourcePath);
        List<String> frontend = new ArrayList<>();
        if (Pattern.compile("@arkzen:(?:web:|meta:web\\b)").matcher(source).find()) {
          frontend.addAll(List.of("Next.js", "React + Vite", "React + Inertia", "Astro", "TanStack Start", "Tauri", "Electron"));
        }
        if (Pattern.compile("@arkzen:(?:native:|meta:native\\b)").matcher(source).find()) {
          frontend.addAll(List.of("Expo", "React Native", "Lynx"));
        }
        module.put("frontend", new ArrayList<>(new LinkedHashSet<>(frontend)));
        module.put("pages", module.get("pages") instanceof List<?> pages && !pages.isEmpty()
            ? pages : hubPageNames(source));
        module.put("backend", hubBackendVariants(source, activeBackend));
        enriched.add(module);
      }
      registry.put("activeStack", activeStack);
      registry.put("activeBackend", activeBackend);
      registry.putIfAbsent("activeDatabase", "sqlite");
      registry.put("modules", enriched);
      return registry;
    }

    private static String metaField(String meta, String field) {
      Matcher matcher = Pattern.compile("^\\s*" + Pattern.quote(field)
          + ":\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s#]+))", Pattern.MULTILINE).matcher(meta);
      if (!matcher.find()) return null;
      for (int group = 1; group <= 3; group++) {
        if (matcher.group(group) != null) return matcher.group(group);
      }
      return null;
    }

    private static String valueOr(String value, String fallback) {
      return value == null || value.isBlank() ? fallback : value;
    }

    private static List<String> hubPageNames(String source) {
      Matcher matcher = Pattern.compile("/\\* @arkzen:(?:web|native):page:(?!layout:)([a-zA-Z0-9_-]+)").matcher(source);
      Set<String> names = new LinkedHashSet<>();
      while (matcher.find()) {
        String name = matcher.group(1);
        if (!name.equals("end") && !name.equals("layout")) names.add(name);
      }
      return new ArrayList<>(names);
    }

    private static List<String> hubBackendVariants(String source, String activeBackend) {
      Map<String, String> labels = Map.of(
          "php", "Laravel", "ts", "Express", "py", "FastAPI / Django",
          "java", "Spring Boot", "cs", "ASP.NET", "go", "Go", "rs", "Rust");
      Matcher matcher = Pattern.compile(
          "^/\\* @arkzen:(endpoint|handler|middleware|policy|listener|listeners|job|jobs|console|mail|notification|notifications):(?:(php|ts|py|java|cs|go|rs):)?([a-zA-Z0-9_-]+)(?:\\s+\\*/)?\\s*$",
          Pattern.MULTILINE).matcher(source);
      Set<String> variants = new LinkedHashSet<>();
      while (matcher.find()) {
        String marker = matcher.group(1);
        String variant = matcher.group(2);
        String name = matcher.group(3);
        String close = variant == null
            ? "/* @arkzen:" + marker + ":" + name + ":end */"
            : "/* @arkzen:" + marker + ":" + variant + ":" + name + ":end */";
        int inlineClose = matcher.group().indexOf("*/");
        int openingEnd = inlineClose >= 0
            ? matcher.start() + inlineClose
            : source.indexOf("*/", matcher.end());
        int closingStart = openingEnd < 0 ? -1 : source.indexOf(close, openingEnd + 2);
        if (openingEnd < 0 || closingStart < 0 || source.substring(openingEnd + 2, closingStart).isBlank()) continue;
        variants.add(labels.getOrDefault(variant == null ? "php" : variant, "Laravel"));
      }
      if (variants.isEmpty() && Pattern.compile(
          "auth:\\s*true|@arkzen:(?:api|database|auth|jobs|events|mail|notifications|routes|realtime|console|store)")
          .matcher(source).find()) {
        String label = switch (activeBackend) {
          case "express" -> "Express";
          case "fastapi", "django" -> "FastAPI / Django";
          case "spring-boot" -> "Spring Boot";
          case "aspnet" -> "ASP.NET";
          case "go" -> "Go";
          case "rust" -> "Rust";
          default -> "Laravel";
        };
        variants.add(label);
      }
      return new ArrayList<>(variants);
    }

    private static Map<String, Object> parseBody(HttpServletRequest request, String rawBody) {
      if (rawBody == null || rawBody.isBlank()) return new LinkedHashMap<>();
      String contentType = request.getContentType();
      if (contentType != null && contentType.toLowerCase().contains("json"))
        return Json.parseObject(rawBody);
      if (contentType != null && contentType.toLowerCase().contains("application/x-www-form-urlencoded")) {
        Map<String, Object> values = new LinkedHashMap<>();
        for (String part : rawBody.split("&")) {
          int index = part.indexOf('=');
          String key = java.net.URLDecoder.decode(index < 0 ? part : part.substring(0, index), java.nio.charset.StandardCharsets.UTF_8);
          String value = java.net.URLDecoder.decode(index < 0 ? "" : part.substring(index + 1), java.nio.charset.StandardCharsets.UTF_8);
          values.put(key, value);
        }
        return values;
      }
      return new LinkedHashMap<>();
    }

    private static ResponseEntity<?> respond(Object result) {
      if (result == null) return ResponseEntity.noContent().build();
      if (result instanceof Response.Result) {
        Response.Result response = (Response.Result) result;
        HttpHeaders headers = new HttpHeaders();
        response.headers.forEach(headers::set);
        Object body = response.body == null ? null : Json.parse(Json.stringify(response.body));
        return new ResponseEntity<>(body, headers, HttpStatus.valueOf(response.status));
      }
      Object body = Json.parse(Json.stringify(result));
      return ResponseEntity.ok(body);
    }

    private static ResponseEntity<?> json(Object body, int status) {
      Object normalized = body == null ? null : Json.parse(Json.stringify(body));
      return ResponseEntity.status(status).body(normalized);
    }

    private static ResponseEntity<?> renderError(Throwable error) {
      if (error instanceof Errors.ValidationException) {
        Errors.ValidationException validation = (Errors.ValidationException) error;
        return json(Map.of("message", validation.getMessage(), "errors", validation.errors), 422);
      }
      if (error instanceof Errors.AuthenticationException) return json(Map.of("message", "Unauthenticated."), 401);
      if (error instanceof Errors.AuthorizationException) return json(Map.of("message", error.getMessage()), 403);
      if (error instanceof Errors.ModelNotFoundException) return json(Map.of("message", error.getMessage()), 404);
      if (error instanceof Errors.HttpException) {
        Errors.HttpException http = (Errors.HttpException) error;
        Map<Integer, String> fallback = Map.of(401, "Unauthenticated.", 403, "This action is unauthorized.",
            404, "Not Found", 415, "Unsupported Media Type", 429, "Too Many Requests");
        String message = http.getMessage();
        if (message == null || message.isEmpty()) message = fallback.getOrDefault(http.status, "Error");
        return json(Map.of("message", message), http.status);
      }
      Log.error("Spring request failed: " + error.getMessage());
      return json(Map.of("message", error.getMessage() == null ? "Server Error" : error.getMessage()), 500);
    }
  }
}
