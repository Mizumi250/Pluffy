package dev.pluff.engine;

import dev.pluff.runtime.Support;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Generates Java model and route sources from one parsed Tatemono payload. */
public final class Generate {
  private Generate() {}

  @SuppressWarnings("unchecked")
  private static Map<String, Object> map(Object value) {
    return value instanceof Map ? (Map<String, Object>) value : new LinkedHashMap<>();
  }

  @SuppressWarnings("unchecked")
  private static List<Object> list(Object value) {
    return value instanceof List ? (List<Object>) value : new ArrayList<>();
  }

  private static String text(Object value, String fallback) {
    return value == null ? fallback : String.valueOf(value);
  }

  private static boolean enabled(Object value) { return Boolean.TRUE.equals(value); }

  private static String quote(String value) {
    return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"")
        .replace("\r", "\\r").replace("\n", "\\n").replace("\t", "\\t") + "\"";
  }

  private static String identifier(String value) {
    if (value == null || !value.matches("[A-Za-z_$][A-Za-z0-9_$]*"))
      throw new IllegalArgumentException("Invalid Java identifier in DSL: " + value);
    return value;
  }

  private static String snake(String value) {
    return value.replaceAll("([a-z0-9])([A-Z])", "$1_$2").replace('-', '_').toLowerCase();
  }

  private static String studly(String value) {
    StringBuilder out = new StringBuilder();
    for (String part : value.split("[-_\\s]+")) {
      if (!part.isEmpty()) out.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
    }
    return out.toString();
  }

  private static String modelForTable(String table) {
    String base = table.endsWith("ies") ? table.substring(0, table.length() - 3) + "y"
        : table.endsWith("s") ? table.substring(0, table.length() - 1) : table;
    return studly(base);
  }

  private static String findTable(List<Object> databases, String model) {
    String expected = snake(model);
    for (Object raw : databases) {
      String table = text(map(raw).get("table"), "");
      if (table.equals(expected) || table.equals(expected + "s")
          || model.equalsIgnoreCase(modelForTable(table))) return table;
    }
    if (databases.size() == 1) return text(map(databases.get(0)).get("table"), null);
    return null;
  }

  private static String decode(String encoded) {
    if (encoded == null || encoded.isBlank()) return "";
    try {
      return new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException("Invalid base64 Java DSL body", e);
    }
  }

  private static String mapLiteral(Map<String, ?> values) {
    if (values.isEmpty()) return "Map.of()";
    List<String> entries = new ArrayList<>();
    for (Map.Entry<String, ?> entry : values.entrySet()) {
      entries.add(quote(entry.getKey()) + ", " + quote(String.valueOf(entry.getValue())));
    }
    return "Support.mapOf(" + String.join(", ", entries) + ")";
  }

  private static String stringMapLiteral(Map<String, String> values) {
    if (values.isEmpty()) return "Map.of()";
    List<String> entries = new ArrayList<>();
    for (Map.Entry<String, String> entry : values.entrySet())
      entries.add(quote(entry.getKey()) + ", " + quote(entry.getValue()));
    return "Map.ofEntries(" + String.join(", ", entries.stream()
        .map(entry -> {
          int split = entry.indexOf(", ");
          return "Map.entry(" + entry.substring(0, split) + ", " + entry.substring(split + 2) + ")";
        }).toList()) + ")";
  }

  private static String listLiteral(List<String> values) {
    if (values.isEmpty()) return "List.of()";
    List<String> quoted = new ArrayList<>();
    for (String value : values) quoted.add(quote(value));
    return "List.of(" + String.join(", ", quoted) + ")";
  }

  private static String modelSource(String slug, String model, Map<String, Object> database) {
    String cls = identifier(model);
    String table = text(database.get("table"), "");
    Map<String, Object> columns = map(database.get("columns"));
    List<String> fillable = new ArrayList<>();
    Map<String, String> casts = new LinkedHashMap<>();
    for (Map.Entry<String, Object> column : columns.entrySet()) {
      Map<String, Object> config = map(column.getValue());
      if (!enabled(config.get("primary"))) fillable.add(column.getKey());
      String type = text(config.get("type"), "string");
      String cast = switch (type) {
        case "integer", "bigInteger", "foreignId" -> "integer";
        case "boolean" -> "boolean";
        case "float" -> "float";
        case "decimal" -> "decimal:2";
        case "json" -> "array";
        case "date" -> "date";
        case "datetime", "timestamp" -> "datetime";
        default -> null;
      };
      if (cast != null) casts.put(column.getKey(), cast);
    }
    List<String> castEntries = new ArrayList<>();
    for (Map.Entry<String, String> entry : casts.entrySet())
      castEntries.add(quote(entry.getKey()) + ", " + quote(entry.getValue()));
    String castMap = castEntries.isEmpty() ? "Map.of()" : "Support.mapOf(" + String.join(", ", castEntries) + ")";
    boolean timestamps = !Boolean.FALSE.equals(database.get("timestamps"));
    boolean softDeletes = enabled(database.get("softDeletes"));
    String fullTable = Support.prefixedTable(slug, table);
    return "package dev.pluff.generated." + slug.replace('-', '_') + ";\n"
        + "import dev.pluff.runtime.*;\nimport java.util.*;\nimport static dev.pluff.runtime.Support.*;\n"
        + "public final class " + cls + " extends Model {\n"
        + "  private static final ModelMeta META = ModelMeta.of(" + quote(fullTable) + ", " + quote(slug) + ", "
        + listLiteral(fillable) + ", List.of(), " + stringMapLiteral(casts) + ", " + timestamps + ", " + softDeletes + ");\n"
        + "  public " + cls + "() { super(META); }\n"
        + "  @Override protected QueryBuilder<" + cls + "> newQuery() { return QueryBuilder.forModel(META, " + cls + "::new); }\n"
        + "  public static QueryBuilder<" + cls + "> query() { return new " + cls + "().newQuery(); }\n"
        + "  public static " + cls + " find(Object id) { return query().find(id); }\n"
        + "  public static " + cls + " findOrFail(Object id) { return query().findOrFail(id); }\n"
        + "  public static List<" + cls + "> all() { return query().get(); }\n"
        + "  public static long count() { return query().count(); }\n"
        + "  public static " + cls + " create(Map<String, Object> values) { return (" + cls + ") new " + cls + "().fill(values).save(); }\n"
        + "}\n";
  }

  private static String normalizedPath(String path) {
    String result = path.replaceAll("/{2,}", "/");
    if (!result.startsWith("/")) result = "/" + result;
    return result.length() > 1 ? result.replaceAll("/+$", "") : result;
  }

  private static String bodyStatements(String encodedBody) {
    String body = decode(encodedBody).trim();
    return body.isEmpty() ? null : body;
  }

  private static String perPage(Map<String, Object> query) {
    String raw = text(query.get("per_page"), "15");
    java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(?:default:)?(\\d+)").matcher(raw);
    return matcher.matches() ? matcher.group(1) : "15";
  }

  private static String endpointBody(String model, String endpointName, Map<String, Object> endpoint) {
    String body = bodyStatements(text(endpoint.get("body"), null));
    if (body != null) return body;

    String variable = snake(model);
    String name = endpointName.toLowerCase();
    if ("mail_send".equals(text(endpoint.get("type"), ""))) {
      Map<String, Object> rules = map(endpoint.get("validation"));
      return "Map<String, Object> validated = request.validate(" + mapLiteral(rules) + ");\n"
          + "String mailKey = String.valueOf(validated.get(\"mail\"));\n"
          + "Map<String, Object> mail = mailTemplates.get(mailKey);\n"
          + "if (mail == null) throw new IllegalArgumentException(\"Unknown mail type: \" + mailKey);\n"
          + "Object rawData = validated.get(\"data\");\n"
          + "Map<String, Object> data = new LinkedHashMap<>();\n"
          + "if (rawData instanceof Map<?, ?> values) values.forEach((key, value) -> data.put(String.valueOf(key), value));\n"
          + "Model user = request.authUser();\n"
          + "Mail.send(String.valueOf(validated.get(\"to\")), mail, data);\n"
          + model + " sent = " + model + ".create(mapOf(\"user_id\", user == null ? null : user.get(\"id\"), "
          + "\"to_email\", validated.get(\"to\"), \"subject\", mail.getOrDefault(\"subject\", mailKey), "
          + "\"mail_class\", studly(mailKey) + \"Mail\", \"status\", \"sent\"));\n"
          + "return response.json(sent, 201);";
    }
    if (name.equals("index")) {
      Object query = endpoint.get("query");
      Map<String, Object> queryConfig = map(query);
      StringBuilder generatedBody = new StringBuilder("QueryBuilder<").append(model).append("> query = ")
          .append(model).append(".query();\n");
      if (queryConfig.containsKey("search")) {
        generatedBody.append("if (request.filled(\"search\")) {\n")
            .append("  String search = \"%\" + request.input(\"search\") + \"%\";\n")
            .append("  query.where(group -> group.orWhere(\"name\", \"like\", search).orWhere(\"description\", \"like\", search));\n")
            .append("}\n");
      }
      for (String key : queryConfig.keySet()) {
        if (key.equals("per_page") || key.equals("search")) continue;
        generatedBody.append("if (request.filled(").append(quote(key)).append(")) query.where(")
            .append(quote(key)).append(", request.input(").append(quote(key)).append("));\n");
      }
      if ("array".equals(map(endpoint.get("response")).get("type"))) {
        generatedBody.append("return response.json(query.orderBy(\"created_at\", \"desc\").get());");
      } else {
        generatedBody.append("return response.json(query.orderBy(\"created_at\", \"desc\").paginate(")
            .append("request.input(\"per_page\", ").append(perPage(queryConfig)).append("), ")
            .append("request.input(\"page\", 1), request.url()));");
      }
      return generatedBody.toString();
    }
    if (name.equals("store")) {
      Map<String, Object> rules = map(endpoint.get("validation"));
      return "Map<String, Object> validated = request.validate(" + mapLiteral(rules) + ");\n"
          + model + " created = " + model + ".create(validated);\nreturn response.json(created, 201);";
    }
    if (name.equals("show"))
      return model + " " + variable + " = " + model + ".findOrFail(request.route(\"id\"));\nreturn response.json(" + variable + ");";
    if (name.equals("update")) {
      Map<String, Object> rules = map(endpoint.get("validation"));
      return model + " " + variable + " = " + model + ".findOrFail(request.route(\"id\"));\n"
          + "Map<String, Object> validated = request.validate(" + mapLiteral(rules) + ");\n"
          + variable + ".update(validated);\nreturn response.json(" + variable + ");";
    }
    if (name.equals("destroy"))
      return model + " " + variable + " = " + model + ".findOrFail(request.route(\"id\"));\n"
          + variable + ".delete();\nreturn response.json(mapOf(\"message\", \"Deleted successfully\"));";
    throw new IllegalArgumentException("Endpoint " + model + "." + endpointName
        + " needs an @arkzen:endpoint:java body or a supported CRUD name");
  }

  private static String middlewareBody(Map<String, Object> snippets) {
    StringBuilder out = new StringBuilder();
    if (snippets.isEmpty()) {
      return "  private static Router.Middleware customMiddleware(String name) {\n"
          + "    throw new IllegalArgumentException(\"Unknown middleware: \" + name);\n  }\n";
    }
    out.append("  private static Router.Middleware customMiddleware(String name) throws Exception {\n    return switch (name) {\n");
    for (Map.Entry<String, Object> entry : snippets.entrySet()) {
      String body = decode(text(entry.getValue(), "")).trim();
      out.append("      case ").append(quote(entry.getKey())).append(" -> (request, response, next) -> {\n");
      out.append(indent(body.isEmpty() ? "return next.run();" : body, 8)).append("\n      };\n");
    }
    out.append("      default -> throw new IllegalArgumentException(\"Unknown middleware: \" + name);\n")
        .append("    };\n  }\n");
    return out.toString();
  }

  private static String indent(String body, int spaces) {
    String prefix = " ".repeat(spaces);
    List<String> lines = new ArrayList<>();
    for (String line : body.split("\\R", -1)) lines.add(line.isBlank() ? "" : prefix + line);
    return String.join("\n", lines);
  }

  private static List<RouterRoute> routes(Map<String, Object> payload) {
    List<RouterRoute> routes = new ArrayList<>();
    for (Object rawApi : list(payload.get("apis"))) {
      Map<String, Object> api = map(rawApi);
      String model = identifier(text(api.get("model"), ""));
      String prefix = text(api.get("prefix"), "");
      Map<String, Object> endpoints = map(api.get("endpoints"));
      for (Map.Entry<String, Object> endpointEntry : endpoints.entrySet()) {
        Map<String, Object> endpoint = map(endpointEntry.getValue());
        String method = text(endpoint.get("method"), "GET").toUpperCase();
        String route = text(endpoint.get("route"), "/");
        String path = normalizedPath(prefix + "/" + route);
        List<String> middleware = new ArrayList<>();
        for (Object rawName : list(api.get("middleware"))) middleware.add(String.valueOf(rawName).trim());
        String code = endpointBody(model, endpointEntry.getKey(), endpoint);
        routes.add(new RouterRoute(method, path, middleware, code));
      }
    }
    routes.sort((a, b) -> Integer.compare(dynamicSegments(a.path), dynamicSegments(b.path)));
    return routes;
  }

  private static int dynamicSegments(String path) {
    int count = 0;
    for (int i = 0; i < path.length(); i++) if (path.charAt(i) == '{') count++;
    return count;
  }

  private static final class RouterRoute {
    final String method, path, code;
    final List<String> middleware;
    RouterRoute(String method, String path, List<String> middleware, String code) {
      this.method = method; this.path = path; this.middleware = middleware; this.code = code;
    }
  }

  private static String moduleSource(Map<String, Object> payload, List<RouterRoute> routes) {
    String slug = text(payload.get("name"), "");
    String pkg = "dev.pluff.generated." + slug.replace('-', '_');
    StringBuilder out = new StringBuilder("package ").append(pkg).append(";\n")
        .append("import dev.pluff.runtime.*;\nimport java.util.*;\nimport java.math.*;\nimport static dev.pluff.runtime.Support.*;\n")
        .append("public final class GeneratedModule {\n")
        .append("  private GeneratedModule() {}\n")
        .append("  public static Router createRouter() throws Exception {\n")
        .append("    Router router = new Router(").append(quote(slug)).append(");\n")
        .append("    Map<String, Map<String, Object>> mailTemplates = mailTemplates();\n");
    if (enabled(payload.get("auth"))) {
      out.append("    router.add(\"POST\", ").append(quote("/api/" + slug + "/auth/register"))
          .append(", Auth.registerHandler(").append(quote(slug)).append("));\n")
          .append("    router.add(\"POST\", ").append(quote("/api/" + slug + "/auth/login"))
          .append(", Auth.loginHandler(").append(quote(slug)).append("));\n")
          .append("    router.add(\"POST\", ").append(quote("/api/" + slug + "/auth/logout"))
          .append(", List.of(Auth.authMiddleware(").append(quote(slug)).append(")), Auth.logoutHandler(")
          .append(quote(slug)).append("));\n")
          .append("    router.add(\"GET\", ").append(quote("/api/" + slug + "/auth/me"))
          .append(", List.of(Auth.authMiddleware(").append(quote(slug)).append(")), Auth.meHandler());\n");
      Map<String, Map<String, String>> rules = authRules(payload);
      out.append("    router.add(\"POST\", ").append(quote("/api/" + slug + "/auth/broadcasting/auth"))
          .append(", List.of(Auth.authMiddleware(").append(quote(slug)).append(")), Auth.broadcastingAuth(")
          .append(quote(slug)).append(", ").append(authRuleLiteral(rules)).append("));\n");
    }
    for (RouterRoute route : routes) {
      List<String> middleware = new ArrayList<>();
      for (String name : route.middleware) {
        if (name.equals("auth") || name.startsWith("auth:") || name.equals("auth:sanctum"))
          middleware.add("Auth.authMiddleware(" + quote(slug) + ")");
        else if (name.startsWith("role:")) {
          List<String> roles = new ArrayList<>();
          for (String role : name.substring(5).split(",")) roles.add(quote(role));
          middleware.add("Auth.roleMiddleware(" + String.join(", ", roles) + ")");
        }
        else middleware.add("customMiddleware(" + quote(name) + ")");
      }
      out.append("    router.add(").append(quote(route.method)).append(", ").append(quote(route.path)).append(", ")
          .append(middleware.isEmpty() ? "List.of()" : "List.of(" + String.join(", ", middleware) + ")")
          .append(", (request, response) -> {\n")
          .append(indent(route.code, 6)).append("\n    });\n");
    }
    out.append("    return router;\n  }\n")
        .append("  private static Map<String, Map<String, Object>> mailTemplates() {\n")
        .append("    Map<String, Map<String, Object>> templates = new LinkedHashMap<>();\n");
    out.append(mailTemplateEntries(payload));
    out.append("    return templates;\n  }\n");
    out.append(middlewareBody(map(payload.get("middlewareSnippets"))));
    out.append("}\n");
    return out.toString();
  }

  private static String mailTemplateEntries(Map<String, Object> payload) {
    StringBuilder out = new StringBuilder();
    for (Object raw : list(payload.get("mails"))) {
      if (!(raw instanceof String)) continue;
      Object parsed = new org.yaml.snakeyaml.Yaml().load(String.valueOf(raw));
      for (Map.Entry<String, Object> section : map(parsed).entrySet()) {
        Map<String, Object> config = new LinkedHashMap<>(map(section.getValue()));
        Object encodedTemplate = config.remove("blade_body");
        String template = decode(text(encodedTemplate, ""));
        config.put("template", template);
        List<String> entries = new ArrayList<>();
        for (Map.Entry<String, Object> entry : config.entrySet()) {
          entries.add(quote(entry.getKey()) + ", " + quote(String.valueOf(entry.getValue())));
        }
        out.append("    templates.put(").append(quote(section.getKey()))
            .append(", mapOf(").append(String.join(", ", entries)).append("));\n");
      }
    }
    return out.toString();
  }

  private static Map<String, Map<String, String>> authRules(Map<String, Object> payload) {
    Map<String, Map<String, String>> result = new LinkedHashMap<>();
    for (Object raw : list(payload.get("realtimes"))) {
      if (!(raw instanceof String)) continue;
      Object parsed = new org.yaml.snakeyaml.Yaml().load(String.valueOf(raw));
      Map<String, Object> sections = map(parsed);
      for (Map.Entry<String, Object> section : sections.entrySet()) {
        Map<String, Object> config = map(section.getValue());
        if (config.containsKey("channel")) continue;
        String type = text(config.get("type"), "private");
        String auth = text(config.get("auth"), "authenticated");
        result.put(section.getKey(), Map.of("type", type, "auth", auth));
      }
    }
    return result;
  }

  private static String authRuleLiteral(Map<String, Map<String, String>> rules) {
    if (rules.isEmpty()) return "Map.of()";
    List<String> entries = new ArrayList<>();
    for (Map.Entry<String, Map<String, String>> entry : rules.entrySet()) {
      entries.add("Map.entry(" + quote(entry.getKey()) + ", Map.of(\"type\", "
          + quote(entry.getValue().get("type")) + ", \"auth\", " + quote(entry.getValue().get("auth")) + "))");
    }
    return "Map.ofEntries(" + String.join(", ", entries) + ")";
  }

  public static Map<String, String> generate(Map<String, Object> payload) {
    String slug = text(payload.get("name"), "");
    if (!slug.matches("[a-z0-9][a-z0-9-]*")) throw new IllegalArgumentException("Invalid tatemono name: " + slug);
    List<Object> databases = list(payload.get("databases"));
    Map<String, String> files = new LinkedHashMap<>();
    String sourceRoot = "dev/pluff/generated/" + slug.replace('-', '_') + "/";
    Set<String> generatedModels = new java.util.LinkedHashSet<>();
    for (Object rawApi : list(payload.get("apis"))) {
      String model = identifier(text(map(rawApi).get("model"), ""));
      String table = findTable(databases, model);
      if (table == null) throw new IllegalArgumentException("No database block found for model " + model);
      for (Object rawDb : databases) {
        Map<String, Object> db = map(rawDb);
        if (table.equals(text(db.get("table"), ""))) {
          if (generatedModels.add(model)) files.put(sourceRoot + model + ".java", modelSource(slug, model, db));
          break;
        }
      }
    }
    List<RouterRoute> routes = routes(payload);
    files.put(sourceRoot + "GeneratedModule.java", moduleSource(payload, routes));
    return files;
  }
}
