package dev.pluff.engine;

import dev.pluff.runtime.Support;
import dev.pluff.runtime.Json;

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

  private static String classNameFor(String value, String suffix) {
    return Support.classNameFor(value, suffix);
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

  private static Map<String, Map<String, Object>> sections(Object rawSections) {
    Map<String, Map<String, Object>> result = new LinkedHashMap<>();
    for (Object raw : list(rawSections)) {
      if (!(raw instanceof String)) continue;
      Object parsed = new org.yaml.snakeyaml.Yaml().load(String.valueOf(raw));
      for (Map.Entry<String, Object> entry : map(parsed).entrySet()) {
        if (entry.getValue() instanceof Map<?, ?>) result.put(entry.getKey(), map(entry.getValue()));
      }
    }
    return result;
  }

  private static Map<String, Object> objectMap(Object value) {
    Map<String, Object> result = new LinkedHashMap<>();
    if (value instanceof Map<?, ?> values) {
      values.forEach((key, item) -> result.put(String.valueOf(key), item));
    }
    return result;
  }

  private static String perPage(Map<String, Object> query) {
    String raw = text(query.get("per_page"), "15");
    java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(?:default:)?(\\d+)").matcher(raw);
    return matcher.matches() ? matcher.group(1) : "15";
  }

  private static String broadcastEndpointBody(String model, Map<String, Object> endpoint, String slug,
                                             List<Object> rawRealtimes) {
    Map<String, String> channels = new LinkedHashMap<>();
    Map<String, String> eventNames = new LinkedHashMap<>();
    Map<String, Boolean> channelHasIds = new LinkedHashMap<>();
    for (Map.Entry<String, Map<String, Object>> entry : sections(rawRealtimes).entrySet()) {
      Map<String, Object> config = entry.getValue();
      if (!config.containsKey("channel")) continue;
      String type = text(config.get("type"), "public");
      if (!Set.of("public", "private", "presence").contains(type) || channels.containsKey(type)) continue;
      String channel = String.valueOf(config.get("channel"));
      boolean hasId = channel.endsWith(".{id}");
      if (hasId) channel = channel.substring(0, channel.length() - ".{id}".length());
      channels.put(type, channel);
      eventNames.put(type, slug + "." + entry.getKey());
      channelHasIds.put(type, hasId);
    }

    Map<String, Object> rules = map(endpoint.get("validation"));
    List<String> channelIdEntries = new ArrayList<>();
    for (Map.Entry<String, Boolean> entry : channelHasIds.entrySet()) {
      channelIdEntries.add("Map.entry(" + quote(entry.getKey()) + ", " + entry.getValue() + ")");
    }
    String channelIdLiteral = channelIdEntries.isEmpty()
        ? "Map.of()"
        : "Map.ofEntries(" + String.join(", ", channelIdEntries) + ")";
    return "Map<String, Object> validated = request.validate(" + mapLiteral(rules) + ");\n"
        + "Object rawChannelType = validated.get(\"channel_type\");\n"
        + "String channelType = rawChannelType == null || String.valueOf(rawChannelType).isBlank() "
        + "? \"public\" : String.valueOf(rawChannelType);\n"
        + "Map<String, String> channels = " + stringMapLiteral(channels) + ";\n"
        + "Map<String, String> eventNames = " + stringMapLiteral(eventNames) + ";\n"
        + "Map<String, Boolean> channelHasIds = " + channelIdLiteral + ";\n"
        + "if (!channels.containsKey(channelType)) return response.json(mapOf(\"message\", "
        + quote("channel_type must be " + String.join(", ", channels.keySet()) + ".") + "), 422);\n"
        + "Map<String, Object> messageValues = new LinkedHashMap<>(validated);\n"
        + "messageValues.put(\"channel_type\", channelType);\n"
        + model + " message = " + model + ".create(messageValues);\n"
        + "Model user = request.authUser();\n"
        + "Broadcast.Event broadcastEvent = new Broadcast.Event() {};\n"
        + "broadcastEvent.tatemono = " + quote(slug) + ";\n"
        + "broadcastEvent.eventName = eventNames.get(channelType);\n"
        + "broadcastEvent.channelType = channelType;\n"
        + "broadcastEvent.channel = channels.get(channelType);\n"
        + "broadcastEvent.channelHasId = Boolean.TRUE.equals(channelHasIds.get(channelType));\n"
        + "broadcastEvent.userId = user == null ? null : user.id();\n"
        + "broadcastEvent.data = objectMap(message.toJson());\n"
        + "Broadcast.broadcast(broadcastEvent);\n"
        + "return response.json(message, 201);";
  }

  private static String endpointBody(String model, String endpointName, Map<String, Object> endpoint,
                                     String slug, boolean usePolicy, List<Object> rawRealtimes) {
    String body = bodyStatements(text(endpoint.get("body"), null));
    if (body != null) return body;

    String variable = snake(model);
    String name = endpointName.toLowerCase();
    String type = text(endpoint.get("type"), "");
    if ("upload_index".equals(type)) {
      return "List<" + model + "> files = " + model + ".query().orderBy(\"created_at\", \"desc\").get();\n"
          + "for (" + model + " file : files) {\n"
          + "  if (Boolean.TRUE.equals(file.get(\"is_image\"))) file.set(\"url\", UploadSupport.publicUrl(file.str(\"disk_path\")));\n"
          + "  else file.set(\"url\", null);\n"
          + "}\n"
          + "return response.json(mapOf(\"data\", files));";
    }
    if ("upload".equals(type)) {
      Map<String, Object> rules = map(endpoint.get("validation"));
      String validation = rules.isEmpty() ? "Map.of()" : mapLiteral(rules);
      return "Map<String, Object> validated = request.validate(" + validation + ");\n"
          + "if (request.files(\"files\").isEmpty()) throw Errors.ValidationException.withMessages(mapOf(\"files\", \"The files field is required.\"));\n"
          + "List<" + model + "> createdFiles = new ArrayList<>();\n"
          + "for (Map<String, Object> metadata : UploadSupport.store(request, " + quote(slug) + ")) {\n"
          + "  Model user = request.authUser();\n"
          + "  if (user != null) metadata.put(\"user_id\", user.get(\"id\"));\n"
          + "  " + model + " created = " + model + ".create(metadata);\n"
          + "  created.set(\"url\", UploadSupport.publicUrl(created.str(\"disk_path\")));\n"
          + "  createdFiles.add(created);\n"
          + "}\n"
          + "return response.json(mapOf(\"data\", createdFiles), 201);";
    }
    if ("upload_destroy".equals(type)) {
      return model + " uploaded_file = " + model + ".findOrFail(request.route(\"id\"));\n"
          + "UploadSupport.delete(uploaded_file.str(\"disk_path\"));\n"
          + "uploaded_file.delete();\n"
          + "return response.json(mapOf(\"message\", \"File deleted\"));";
    }
    if ("upload_url".equals(type)) {
      return model + " uploaded_file = " + model + ".findOrFail(request.route(\"id\"));\n"
          + "byte[] bytes = UploadSupport.read(uploaded_file.str(\"disk_path\"));\n"
          + "return response.download(bytes, uploaded_file.str(\"mime_type\"), uploaded_file.str(\"original_name\"));";
    }
    if ("broadcast".equals(type)) return broadcastEndpointBody(model, endpoint, slug, rawRealtimes);
    if ("job_dispatch".equals(type)) {
      return "Map<String, Object> validated = request.validate(mapOf(\"job\", \"required|string\"));\n"
          + "String jobName = String.valueOf(validated.get(\"job\")).replace('_', '-');\n"
          + "Object rawData = request.input(\"data\", Map.of());\n"
          + "Map<String, Object> data = objectMap(rawData);\n"
          + "JobDispatcher.dispatch(" + quote(slug) + ", jobName, data);\n"
          + "return response.json(mapOf(\"message\", \"Job dispatched\"), 202);";
    }
    if ("event_fire".equals(type)) {
      return "Map<String, Object> validated = request.validate(mapOf(\"event\", \"required|string\", \"payload\", \"sometimes|array\"));\n"
          + "String eventName = String.valueOf(validated.get(\"event\")).replace('_', '-');\n"
          + "EventDispatcher.fire(" + quote(slug) + ", eventName, objectMap(validated.get(\"payload\")));\n"
          + "return response.json(mapOf(\"message\", \"Event fired\"), 202);";
    }
    if ("command_run".equals(type)) {
      return "Map<String, Object> validated = request.validate(mapOf(\"command\", \"required|string\", \"triggered_by\", \"sometimes|string\"));\n"
          + "String commandName = String.valueOf(validated.get(\"command\")).replace('_', '-');\n"
          + "long started = System.nanoTime();\n"
          + "CommandRegistry.CommandResult run = CommandRegistry.runFor(" + quote(slug) + ", commandName);\n"
          + "if (run == null) return response.json(mapOf(\"message\", \"Invalid command\"), 400);\n"
          + model + " result = " + model + ".create(mapOf(\"command_name\", commandName, \"signature\", run.signature(), "
          + "\"exit_code\", run.exitCode(), \"output\", run.output(), \"triggered_by\", validated.getOrDefault(\"triggered_by\", \"manual\"), "
          + "\"duration_ms\", (System.nanoTime() - started) / 1_000_000));\n"
          + "return response.json(result, 201);";
    }
    if ("notification_trigger".equals(type)) {
      return "Map<String, Object> validated = request.validate(mapOf(\"notification\", \"required|string\"));\n"
          + "Model user = request.authUser();\n"
          + "Notification notification = notificationFor(String.valueOf(validated.get(\"notification\")).replace('_', '-'));\n"
          + "if (notification == null) return response.json(mapOf(\"message\", \"Unknown notification: \" + validated.get(\"notification\")), 400);\n"
          + "NotificationDispatcher.notify(user, notification);\n"
          + "return response.json(mapOf(\"message\", \"Notification triggered successfully\", \"type\", validated.get(\"notification\")), 201);";
    }
    if ("Notification".equals(model)) {
      if (name.equals("index")) {
        return "Model user = request.authUser();\n"
            + "List<Map<String, Object>> records = DB.table(\"notifications\")\n"
            + "    .where(\"notifiable_type\", \"user\")\n"
            + "    .where(\"notifiable_id\", user.get(\"id\"))\n"
            + "    .latest()\n"
            + "    .get();\n"
            + "for (Map<String, Object> record : records) {\n"
            + "    Object data = record.get(\"data\");\n"
            + "    if (data instanceof String json) record.put(\"data\", Json.parseObject(json));\n"
            + "}\n"
            + "return response.json(mapOf(\"data\", records));";
      }
      if (name.equals("destroy")) {
        return "Model user = request.authUser();\n"
            + "Map<String, Object> record = DB.table(\"notifications\")\n"
            + "    .where(\"id\", request.route(\"id\"))\n"
            + "    .where(\"notifiable_type\", \"user\")\n"
            + "    .where(\"notifiable_id\", user.get(\"id\"))\n"
            + "    .first();\n"
            + "if (record == null) throw new Errors.ModelNotFoundException(\"Notification\", request.route(\"id\"));\n"
            + "DB.table(\"notifications\").where(\"id\", record.get(\"id\")).delete();\n"
            + "return response.json(mapOf(\"message\", \"Notification deleted\"));";
      }
      if (name.equals("readall")) {
        return "Model user = request.authUser();\n"
            + "DB.table(\"notifications\")\n"
            + "    .where(\"notifiable_type\", \"user\")\n"
            + "    .where(\"notifiable_id\", user.get(\"id\"))\n"
            + "    .where(\"read_at\", null)\n"
            + "    .update(mapOf(\"read_at\", sqlNow()));\n"
            + "return response.json(mapOf(\"message\", \"All notifications marked as read\"));";
      }
    }
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
          + "\"mail_class\", classNameFor(mailKey, \"Mail\"), \"status\", \"sent\"));\n"
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
      String policy = usePolicy
          ? "Model user = request.authUser();\nif (!policyUpdate" + model + "(user, " + variable + ")) throw new Errors.AuthorizationException();\n"
          : "";
      return model + " " + variable + " = " + model + ".findOrFail(request.route(\"id\"));\n"
          + policy
          + "Map<String, Object> validated = request.validate(" + mapLiteral(rules) + ");\n"
          + variable + ".update(validated);\nreturn response.json(" + variable + ");";
    }
    if (name.equals("destroy")) {
      String policy = usePolicy
          ? "Model user = request.authUser();\nif (!policyDelete" + model + "(user, " + variable + ")) throw new Errors.AuthorizationException();\n"
          : "";
      return model + " " + variable + " = " + model + ".findOrFail(request.route(\"id\"));\n"
          + policy
          + variable + ".delete();\nreturn response.json(mapOf(\"message\", \"Deleted successfully\"));";
    }
    return "return response.json(mapOf(\"message\", "
        + quote("Endpoint " + endpointName + " is not implemented yet") + "), 501);";
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
        String code = endpointBody(model, endpointEntry.getKey(), endpoint,
            text(payload.get("name"), ""), enabled(api.get("policy")), list(payload.get("realtimes")));
        routes.add(new RouterRoute(method, path, middleware, code));
      }
    }
    for (Object rawCustomRoute : list(payload.get("customRoutes"))) {
      Map<String, Object> customRoute = map(rawCustomRoute);
      List<String> middleware = new ArrayList<>();
      for (Object rawName : list(customRoute.get("middleware"))) middleware.add(String.valueOf(rawName).trim());
      for (Object rawEntry : list(customRoute.get("routes"))) {
        Map<String, Object> entry = map(rawEntry);
        String body = bodyStatements(text(entry.get("body"), null));
        if (body == null) {
          throw new IllegalArgumentException("Custom route handler " + text(entry.get("handler"), "handle")
              + " is missing its :java body");
        }
        routes.add(new RouterRoute(text(entry.get("method"), "GET").toUpperCase(),
            normalizedPath(text(entry.get("route"), "/")), middleware,
            "return " + identifier(text(entry.get("handler"), "handle")) + "(request, response);"));
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
    Map<String, Map<String, Object>> jobs = sections(payload.get("jobs"));
    Map<String, Map<String, Object>> events = sections(payload.get("events"));
    Map<String, Map<String, Object>> consoles = sections(payload.get("consoles"));
    Map<String, Map<String, Object>> notifications = sections(payload.get("notifications"));
    StringBuilder out = new StringBuilder("package ").append(pkg).append(";\n")
        .append("import dev.pluff.runtime.*;\nimport java.util.*;\nimport java.math.*;\nimport static dev.pluff.runtime.Support.*;\n")
        .append("public final class GeneratedModule {\n")
        .append("  private GeneratedModule() {}\n")
        .append("  public static Router createRouter() throws Exception {\n")
        .append("    JobDispatcher.unregister(").append(quote(slug)).append(");\n")
        .append("    EventDispatcher.unregister(").append(quote(slug)).append(");\n")
        .append("    CommandRegistry.unregister(").append(quote(slug)).append(");\n")
        .append("    Router router = new Router(").append(quote(slug)).append(");\n")
        .append("    Map<String, Map<String, Object>> mailTemplates = mailTemplates();\n");
    for (Map.Entry<String, Map<String, Object>> entry : jobs.entrySet()) {
      String body = decode(text(entry.getValue().get("body"), "")).trim();
      if (body.isEmpty()) continue;
      String cls = identifier(classNameFor(entry.getKey(), "Job"));
      String queue = text(entry.getValue().get("queue"), "default");
      int tries = Support.toInt(entry.getValue().get("tries"), 3);
      int timeout = Support.toInt(entry.getValue().get("timeout"), 60);
      out.append("    JobDispatcher.register(").append(quote(slug)).append(", ").append(quote(entry.getKey()))
          .append(", data -> new ").append(cls).append("(data));\n");
    }
    for (Map.Entry<String, Map<String, Object>> entry : events.entrySet()) {
      List<Object> listeners = list(entry.getValue().get("listeners"));
      Map<String, Object> bodies = decodedBodies(entry.getValue().get("listener_bodies"));
      for (Object rawListener : listeners) {
        String listener = identifier(String.valueOf(rawListener));
        String body = decode(text(bodies.get(listener), "")).trim();
        if (body.isEmpty())
          throw new IllegalArgumentException("Event " + entry.getKey() + " listener " + listener + " is missing its :java body");
        out.append("    EventDispatcher.register(").append(quote(slug)).append(", ")
            .append(quote(entry.getKey())).append(", event -> {\n")
            .append(indent(body, 6)).append("\n    });\n");
      }
    }
    for (Map.Entry<String, Map<String, Object>> entry : consoles.entrySet()) {
      String body = decode(text(entry.getValue().get("body"), "")).trim();
      if (body.isEmpty()) continue;
      String cls = identifier(studly(entry.getKey()) + "Command");
      String signature = text(entry.getValue().get("signature"), slug + ":" + entry.getKey());
      String description = text(entry.getValue().get("description"), "");
      String schedule = text(entry.getValue().get("schedule"), null);
      out.append("    CommandRegistry.register(").append(quote(slug)).append(", ")
          .append("() -> new ").append(cls).append("());\n");
    }
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
    out.append(policyMethods(payload));
    out.append(customHandlerMethods(payload));
    out.append(jobClasses(jobs));
    out.append(commandClasses(slug, consoles));
    out.append(notificationClasses(slug, notifications));
    out.append("  private static Notification notificationFor(String name) {\n    return switch (name) {\n");
    for (String notification : notifications.keySet()) {
      out.append("      case ").append(quote(notification)).append(" -> new ")
          .append(identifier(classNameFor(notification, "Notification"))).append("();\n");
    }
    out.append("      default -> null;\n    };\n  }\n")
        .append("  private static Map<String, Object> objectMap(Object value) {\n")
        .append("    Map<String, Object> out = new LinkedHashMap<>();\n")
        .append("    if (value instanceof Map<?, ?> values) values.forEach((key, item) -> out.put(String.valueOf(key), item));\n")
        .append("    return out;\n  }\n");
    out.append("}\n");
    return out.toString();
  }

  private static Map<String, Object> decodedBodies(Object encoded) {
    String raw = decode(text(encoded, ""));
    if (raw.isBlank()) return Map.of();
    return objectMap(Json.parse(raw));
  }

  private static String customHandlerMethods(Map<String, Object> payload) {
    Map<String, String> handlers = new LinkedHashMap<>();
    for (Object rawGroup : list(payload.get("customRoutes"))) {
      for (Object rawEntry : list(map(rawGroup).get("routes"))) {
        Map<String, Object> route = map(rawEntry);
        String handler = identifier(text(route.get("handler"), "handle"));
        String body = bodyStatements(text(route.get("body"), null));
        if (body == null) throw new IllegalArgumentException("Custom route handler " + handler + " is missing its :java body");
        String previous = handlers.putIfAbsent(handler, body);
        if (previous != null && !previous.equals(body))
          throw new IllegalArgumentException("Custom route handler name has multiple Java bodies: " + handler);
      }
    }

    StringBuilder out = new StringBuilder();
    boolean canSeed = handlers.containsKey("community_seed");
    for (Map.Entry<String, String> entry : handlers.entrySet()) {
      String handler = entry.getKey();
      String body = entry.getValue();
      if (canSeed && List.of("me", "home").contains(handler)) {
        body = "if (Post.count() == 0) community_seed(request, response);\n" + body;
      }
      out.append("  public static Object ").append(handler)
          .append("(Request request, Response response) throws Exception {\n")
          .append("    List<Object> params = new ArrayList<>(request.route().values());\n")
          .append(indent(body, 4)).append("\n  }\n");
    }
    return out.toString();
  }

  private static String policyMethods(Map<String, Object> payload) {
    Map<String, Object> snippets = map(payload.get("policySnippets"));
    List<Object> databases = list(payload.get("databases"));
    StringBuilder out = new StringBuilder();
    for (Object rawApi : list(payload.get("apis"))) {
      Map<String, Object> api = map(rawApi);
      if (!enabled(api.get("policy"))) continue;
      String model = identifier(text(api.get("model"), ""));
      String table = findTable(databases, model);
      Map<String, Object> database = new LinkedHashMap<>();
      for (Object rawDatabase : databases) {
        Map<String, Object> candidate = map(rawDatabase);
        if (table != null && table.equals(text(candidate.get("table"), ""))) {
          database = candidate;
          break;
        }
      }
      String owner = null;
      Map<String, Object> columns = map(database.get("columns"));
      for (String column : List.of("user_id", "owner_id", "created_by", "author_id")) {
        if (columns.containsKey(column)) { owner = column; break; }
      }
      String update = decode(text(snippets.get("update"), "")).trim();
      String delete = decode(text(snippets.get("delete"), "")).trim();
      String defaultPolicy = owner == null
          ? "return user != null && \"admin\".equals(user.get(\"role\"));"
          : "return user != null && (java.util.Objects.equals(user.get(\"id\"), item.get(" + quote(owner)
              + ")) || \"admin\".equals(user.get(\"role\")));";
      if (update.isEmpty()) update = defaultPolicy;
      if (delete.isEmpty()) delete = defaultPolicy;
      out.append("  private static boolean policyUpdate").append(model).append("(Model user, Model model) {\n")
          .append("    Model item = model;\n").append(indent(update, 4)).append("\n  }\n")
          .append("  private static boolean policyDelete").append(model).append("(Model user, Model model) {\n")
          .append("    Model item = model;\n").append(indent(delete, 4)).append("\n  }\n");
    }
    return out.toString();
  }

  private static String jobClasses(Map<String, Map<String, Object>> jobs) {
    StringBuilder out = new StringBuilder();
    for (Map.Entry<String, Map<String, Object>> entry : jobs.entrySet()) {
      Map<String, Object> config = entry.getValue();
      String body = decode(text(config.get("body"), "")).trim();
      if (body.isEmpty()) continue;
      String cls = identifier(classNameFor(entry.getKey(), "Job"));
      String queue = quote(text(config.get("queue"), "default"));
      int tries = Support.toInt(config.get("tries"), 3);
      int timeout = Support.toInt(config.get("timeout"), 60);
      out.append("  public static final class ").append(cls).append(" extends Job {\n")
          .append("    public ").append(cls).append("(Map<String, Object> data) { super(data, ").append(queue)
          .append(", ").append(tries).append(", ").append(timeout).append("); }\n")
          .append("    @Override public void handle() throws Exception {\n").append(indent(body, 6))
          .append("\n    }\n  }\n");
    }
    return out.toString();
  }

  private static String commandClasses(String slug, Map<String, Map<String, Object>> commands) {
    StringBuilder out = new StringBuilder();
    for (Map.Entry<String, Map<String, Object>> entry : commands.entrySet()) {
      Map<String, Object> config = entry.getValue();
      String body = decode(text(config.get("body"), "")).trim();
      if (body.isEmpty()) continue;
      String cls = identifier(studly(entry.getKey()) + "Command");
      String signature = quote(text(config.get("signature"), slug + ":" + entry.getKey()));
      String description = quote(text(config.get("description"), ""));
      String schedule = config.get("schedule") == null ? "null" : quote(String.valueOf(config.get("schedule")));
      out.append("  public static final class ").append(cls).append(" extends Command {\n")
          .append("    public ").append(cls).append("() { super(").append(signature).append(", ")
          .append(description).append(", ").append(schedule).append("); }\n")
          .append("    @Override public int handle() throws Exception {\n").append(indent(body, 6))
          .append("\n    }\n  }\n");
    }
    return out.toString();
  }

  private static String notificationClasses(String slug, Map<String, Map<String, Object>> notifications) {
    StringBuilder out = new StringBuilder();
    for (Map.Entry<String, Map<String, Object>> entry : notifications.entrySet()) {
      Map<String, Object> config = entry.getValue();
      String cls = identifier(classNameFor(entry.getKey(), "Notification"));
      List<String> channels = new ArrayList<>();
      Object rawChannels = config.get("channels");
      if (rawChannels instanceof List<?>) {
        for (Object channel : list(rawChannels)) channels.add(String.valueOf(channel));
      } else {
        String raw = text(rawChannels, "database");
        for (String channel : raw.split(",")) if (!channel.isBlank()) channels.add(channel.trim());
      }
      String channelType = text(config.get("channel_type"), "private");
      String channel = "public".equals(channelType) ? slug + ".notifications" : slug;
      String message = text(config.get("message"), "You have a new notification.");
      String subject = text(config.get("subject"), cls);
      String body = decode(text(config.get("toMail_body"), "")).trim();
      if (body.startsWith("return mapOf(") && body.endsWith(");"))
        body = body.replaceFirst("^return mapOf\\(", "return MailMessage.fromMap(mapOf(")
            .replaceFirst("\\);\\s*$", "));");
      if (body.isEmpty()) body = "return new MailMessage().subject(" + quote(subject) + ").line(" + quote(message) + ");";
      out.append("  public static final class ").append(cls).append(" extends Notification {\n")
          .append("    @Override public String tatemono() { return ").append(quote(slug)).append("; }\n")
          .append("    @Override public String name() { return ").append(quote(cls)).append("; }\n")
          .append("    @Override public List<String> channels() { return ").append(listLiteral(channels)).append("; }\n")
          .append("    @Override public String channelType() { return ").append(quote(channelType)).append("; }\n")
          .append("    @Override public String channel() { return ").append(quote(channel)).append("; }\n")
          .append("    @Override public Map<String, Object> toDatabase(Model notifiable) { return mapOf(\"message\", ")
          .append(quote(message)).append(", \"type\", name()); }\n")
          .append("    @Override public MailMessage toMail(Model notifiable) {\n").append(indent(body, 6))
          .append("\n    }\n  }\n");
    }
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
    if (enabled(payload.get("auth")) && !list(payload.get("notifications")).isEmpty()) {
      String slug = text(payload.get("name"), "");
      result.putIfAbsent(slug + ".{id}", Map.of("type", "private", "auth", "owner"));
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
    Map<String, String> modelNames = new LinkedHashMap<>();
    for (Object rawApi : list(payload.get("apis"))) {
      Map<String, Object> api = map(rawApi);
      String model = identifier(text(api.get("model"), ""));
      if ("Notification".equals(model)) continue;
      String table = findTable(databases, model);
      if (table == null) throw new IllegalArgumentException("No database block found for model " + model);
      modelNames.put(table, model);
    }
    Set<String> generatedModels = new java.util.LinkedHashSet<>();
    for (Object rawDb : databases) {
      Map<String, Object> db = map(rawDb);
      String table = text(db.get("table"), "");
      String model = identifier(modelNames.getOrDefault(table, modelForTable(table)));
      if (!generatedModels.add(model)) {
        throw new IllegalArgumentException("Multiple database tables map to Java model " + model);
      }
      files.put(sourceRoot + model + ".java", modelSource(slug, model, db));
    }
    List<RouterRoute> routes = routes(payload);
    files.put(sourceRoot + "GeneratedModule.java", moduleSource(payload, routes));
    return files;
  }
}
