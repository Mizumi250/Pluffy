package dev.pluff.engine;

import dev.pluff.runtime.Database;
import dev.pluff.runtime.CommandRegistry;
import dev.pluff.runtime.EventDispatcher;
import dev.pluff.runtime.JobDispatcher;
import dev.pluff.runtime.Log;
import dev.pluff.runtime.Router;
import dev.pluff.runtime.Support;

import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Validates, migrates, generates, compiles, and hot-loads Java Tatemono modules. */
public final class Build {
  private Build() {}

  private static final Path GENERATED = Support.BACKEND_DIR.resolve("generated");
  private static final Map<String, Router> ROUTERS = new java.util.concurrent.ConcurrentHashMap<>();
  private static final Map<String, URLClassLoader> LOADERS = new java.util.concurrent.ConcurrentHashMap<>();

  public static Map<String, Router> routers() { return Map.copyOf(ROUTERS); }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> map(Object value) {
    return value instanceof Map ? (Map<String, Object>) value : new LinkedHashMap<>();
  }

  @SuppressWarnings("unchecked")
  private static List<Object> list(Object value) {
    return value instanceof List ? (List<Object>) value : new ArrayList<>();
  }

  private static String name(Map<String, Object> payload) { return String.valueOf(payload.getOrDefault("name", "")); }

  public static List<String> validatePayload(Map<String, Object> payload) {
    List<String> errors = new ArrayList<>();
    String slug = name(payload);
    if (slug.isEmpty()) errors.add("Missing \"name\"");
    else if (!slug.matches("[a-z0-9][a-z0-9-]*"))
      errors.add("Invalid tatemono name \"" + slug + "\" (lowercase letters, digits, dashes)");
    Object variant = payload.get("backendVariant");
    if (variant != null && !"java".equals(variant))
      errors.add("Payload was parsed for the :" + variant + " variant but this backend (spring-boot) reads :java. Switch the active backend and let the watcher rebuild.");
    for (Object raw : list(payload.get("databases")))
      if (map(raw).get("table") == null) errors.add("database block without a table");
    for (Object raw : list(payload.get("apis"))) {
      Map<String, Object> api = map(raw);
      if (api.get("model") == null || api.get("controller") == null)
        errors.add("api block needs model and controller");
    }
    return errors;
  }

  public static Map<String, Object> buildTatemono(Map<String, Object> payload) {
    List<String> steps = new ArrayList<>();
    List<String> errors = validatePayload(payload);
    if (!errors.isEmpty()) return result(false, "Validation failed", steps, errors, Map.of(), 422);

    String slug = name(payload);
    List<Object> databases = list(payload.get("databases"));
    List<String> dbSteps = new ArrayList<>();
    try {
      Database.ensureDatabase(slug);
      steps.add("Database ready");
      Schema.applySchema(Database.connection(slug), slug, databases, dbSteps);
      steps.add("Migrations");
      if (Boolean.TRUE.equals(payload.get("auth"))) {
        Schema.applyAuthTables(Database.connection(slug), slug, !list(payload.get("notifications")).isEmpty(), dbSteps);
        steps.add("Auth tables");
        Schema.seedAuthUsers(Database.connection(slug), slug, payload.get("authSeed"), dbSteps);
        steps.add("Auth seed");
      } else if (!list(payload.get("notifications")).isEmpty()) {
        Schema.applyAuthTables(Database.connection(slug), slug, true, dbSteps);
        steps.add("Notification table");
      }
      Schema.seedTables(Database.connection(slug), slug, databases, dbSteps);
      steps.add("Seeders");
      steps.addAll(dbSteps);

      Map<String, String> generated = Generate.generate(payload);
      writeSources(slug, generated);
      steps.add("Generate " + generated.size() + " files");
      loadModule(slug);
      steps.add("Compile + load routes");
      Map<String, Object> registry = new LinkedHashMap<>();
      registry.put("models", list(payload.get("apis")).stream().map(api -> map(api).get("model")).toList());
      registry.put("controllers", list(payload.get("apis")).stream().map(api -> map(api).get("controller")).toList());
      registry.put("tables", databases.stream().map(database -> map(database).get("table")).toList());
      return result(true, "Build complete", steps, errors, registry, 200);
    } catch (Exception e) {
      errors.add(e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage());
      Log.error("Spring build failed for " + slug + ": " + errors.get(errors.size() - 1));
      return result(false, "Build finished with errors", steps, errors, Map.of(), 500);
    }
  }

  private static Map<String, Object> result(boolean success, String message, List<String> steps,
                                             List<String> errors, Map<String, Object> registry, int status) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("success", success);
    body.put("message", message);
    body.put("steps", steps);
    body.put("errors", errors);
    if (!registry.isEmpty()) body.put("registry", registry);
    body.put("status", status);
    return body;
  }

  private static void writeSources(String slug, Map<String, String> sources) throws IOException {
    Path root = GENERATED.resolve(slug);
    deleteTree(root);
    for (Map.Entry<String, String> source : sources.entrySet()) {
      Path file = root.resolve(source.getKey()).normalize();
      if (!file.startsWith(root.normalize())) throw new IllegalArgumentException("Generated source path escaped module directory");
      Support.ensureDir(file.getParent());
      Files.writeString(file, source.getValue());
    }
  }

  public static void loadModule(String slug) throws Exception {
    Path sourceRoot = GENERATED.resolve(slug);
    if (!Files.isDirectory(sourceRoot)) throw new IllegalStateException("Generated sources not found for " + slug);
    Path classes = sourceRoot.resolve("classes");
    deleteTree(classes);
    Support.ensureDir(classes);
    List<String> sources = new ArrayList<>();
    try (var files = Files.walk(sourceRoot)) {
      files.filter(file -> file.toString().endsWith(".java"))
          .forEach(file -> sources.add(file.toString()));
    }
    if (sources.isEmpty()) throw new IllegalStateException("No generated Java sources for " + slug);
    JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
    if (compiler == null) throw new IllegalStateException("A JDK is required to compile generated Java modules");
    List<String> args = new ArrayList<>(List.of("--release", "17", "-classpath",
        System.getProperty("java.class.path"), "-d", classes.toString()));
    args.addAll(sources);
    int status = compiler.run(null, null, null, args.toArray(String[]::new));
    if (status != 0) throw new IllegalStateException("Generated Java compilation failed with exit code " + status);

    URLClassLoader loader = new URLClassLoader(new URL[] {classes.toUri().toURL()}, Build.class.getClassLoader());
    try {
      Class<?> module = Class.forName("dev.pluff.generated." + slug.replace('-', '_') + ".GeneratedModule", true, loader);
      Router router = (Router) module.getMethod("createRouter").invoke(null);
      URLClassLoader old = LOADERS.put(slug, loader);
      ROUTERS.put(slug, router);
      if (old != null) old.close();
    } catch (Exception e) {
      loader.close();
      throw e;
    }
  }

  public static Map<String, Object> removeTatemono(Map<String, Object> payload) throws Exception {
    String slug = name(payload);
    if (!slug.matches("[a-z0-9][a-z0-9-]*")) throw new IllegalArgumentException("Invalid tatemono name: " + slug);
    ROUTERS.remove(slug);
    CommandRegistry.unregister(slug);
    JobDispatcher.unregister(slug);
    EventDispatcher.unregister(slug);
    URLClassLoader loader = LOADERS.remove(slug);
    if (loader != null) loader.close();
    deleteTree(GENERATED.resolve(slug));
    deleteTree(Support.BACKEND_DIR.resolve("database").resolve("migrations").resolve("arkzen").resolve(slug));
    Database.dropDatabase(slug);
    return Map.of("success", true, "message", "Removed " + slug,
        "steps", List.of("Routes + generated files removed", "Isolated database dropped"), "errors", List.of());
  }

  public static void loadAllGenerated() {
    if (!Files.isDirectory(GENERATED)) return;
    try (var modules = Files.list(GENERATED)) {
      modules.filter(Files::isDirectory).forEach(path -> {
        try {
          loadModule(path.getFileName().toString());
          Log.info("Loaded module: " + path.getFileName());
        } catch (Exception e) {
          Log.error("Failed to load " + path.getFileName() + ": " + e.getMessage());
        }
      });
    } catch (IOException e) {
      throw new IllegalStateException("Cannot read generated modules", e);
    }
  }

  private static void deleteTree(Path path) throws IOException {
    if (!Files.exists(path)) return;
    try (var files = Files.walk(path)) {
      for (Path file : files.sorted(Comparator.reverseOrder()).toList()) Files.deleteIfExists(file);
    }
  }
}
