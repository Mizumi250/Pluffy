package dev.pluff.runtime;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

/** Per-tatemono Sanctum-style personal access tokens and common auth middleware. */
public final class Auth {
  private Auth() {}

  private static final class User extends Model {
    private User(ModelMeta meta) { super(meta); }

    @Override
    protected QueryBuilder<User> newQuery() {
      return QueryBuilder.forModel(meta, () -> new User(meta));
    }
  }

  private static User user(String slug, Object id) {
    String table = Support.prefixedTable(slug, "users");
    ModelMeta meta = ModelMeta.of(table, slug, List.of("name", "email", "password", "role"),
        List.of("password", "remember_token"), Map.of(), true, false);
    return newQuery(meta).find(id);
  }

  private static QueryBuilder<User> newQuery(ModelMeta meta) {
    return QueryBuilder.forModel(meta, () -> new User(meta));
  }

  public static String createToken(String slug, Object userId) {
    byte[] bytes = new byte[32];
    new java.security.SecureRandom().nextBytes(bytes);
    String plain = HexFormat.of().formatHex(bytes);
    String digest = sha256(plain);
    String table = Support.prefixedTable(slug, "personal_access_tokens");
    Object id = Database.connection(slug).insert(table, Support.mapOf(
        "tokenable_type", "user",
        "tokenable_id", userId,
        "name", "arkzen-token",
        "token", digest,
        "abilities", "[\"*\"]",
        "created_at", Support.sqlNow(),
        "updated_at", Support.sqlNow()
    ), "id");
    return id + "|" + plain;
  }

  public static Map<String, Object> register(String slug, Map<String, Object> values) {
    String table = Support.prefixedTable(slug, "users");
    Map<String, Object> userData = new java.util.LinkedHashMap<>();
    userData.put("name", values.get("name"));
    userData.put("email", values.get("email"));
    userData.put("password", Hash.make(String.valueOf(values.get("password"))));
    userData.put("role", values.getOrDefault("role", "user"));
    userData.put("created_at", Support.sqlNow());
    userData.put("updated_at", Support.sqlNow());
    Object id = Database.connection(slug).insert(table, userData, "id");
    return tokenResponse(slug, id);
  }

  public static Map<String, Object> login(String slug, Map<String, Object> credentials) {
    String users = Support.prefixedTable(slug, "users");
    List<Map<String, Object>> rows = Database.connection(slug).select(
        "SELECT * FROM " + Database.qi(users) + " WHERE " + Database.qi("email") + " = ? LIMIT 1",
        List.of(credentials.get("email")));
    if (rows.isEmpty() || !Hash.check(String.valueOf(credentials.get("password")), String.valueOf(rows.get(0).get("password"))))
      throw Errors.ValidationException.withMessages(Map.of("email", List.of("The provided credentials are incorrect.")));
    Database.connection(slug).execute("DELETE FROM " + Database.qi(Support.prefixedTable(slug, "personal_access_tokens"))
        + " WHERE " + Database.qi("tokenable_id") + " = ?", List.of(rows.get(0).get("id")));
    return tokenResponse(slug, rows.get(0).get("id"));
  }

  private static Map<String, Object> tokenResponse(String slug, Object id) {
    return Support.mapOf("user", user(slug, id), "token", createToken(slug, id));
  }

  public static Router.Handler broadcastingAuth(String slug, Map<String, Map<String, String>> rules) {
    return (request, response) -> {
      Model user = request.user();
      if (user == null) throw new Errors.AuthenticationException();
      Object socketId = request.input("socket_id");
      Object channelName = request.input("channel_name");
      if (socketId == null || channelName == null || String.valueOf(socketId).isEmpty() || String.valueOf(channelName).isEmpty())
        return response.json(Map.of("message", "Missing socket_id or channel_name."), 422);

      String channel = String.valueOf(channelName);
      for (Map.Entry<String, Map<String, String>> entry : rules.entrySet()) {
        String type = entry.getValue().getOrDefault("type", "private");
        String prefix = switch (type) {
          case "private" -> "private-";
          case "presence" -> "presence-";
          case "public" -> "";
          default -> null;
        };
        if (prefix == null || !channel.startsWith(prefix)) continue;
        java.util.regex.Matcher placeholders = java.util.regex.Pattern.compile("\\{([A-Za-z0-9_]+)}")
            .matcher(entry.getKey());
        StringBuilder regex = new StringBuilder("^");
        int offset = 0;
        List<String> names = new java.util.ArrayList<>();
        while (placeholders.find()) {
          regex.append(java.util.regex.Pattern.quote(entry.getKey().substring(offset, placeholders.start())));
          names.add(placeholders.group(1));
          regex.append("([^.]+)");
          offset = placeholders.end();
        }
        regex.append(java.util.regex.Pattern.quote(entry.getKey().substring(offset))).append("$");
        java.util.regex.Matcher match = java.util.regex.Pattern.compile(regex.toString())
            .matcher(channel.substring(prefix.length()));
        if (!match.matches()) continue;
        String policy = entry.getValue().getOrDefault("auth", "authenticated");
        if ("owner".equals(policy)) {
          int ownerIndex = names.indexOf("id");
          if (ownerIndex < 0 && !names.isEmpty()) ownerIndex = 0;
          if (ownerIndex < 0 || !String.valueOf(user.id()).equals(match.group(ownerIndex + 1)))
            return response.json(Map.of("message", "Forbidden."), 403);
        } else if ("admin".equals(policy) && !"admin".equals(user.str("role"))) {
          return response.json(Map.of("message", "Forbidden."), 403);
        }
        if ("presence".equals(type)) {
          String channelData = Json.stringify(Support.mapOf("user_id", user.id(),
              "user_info", Support.mapOf("name", user.get("name", user.get("email")))));
          String signature = Broadcast.signChannel(String.valueOf(socketId), channel, channelData);
          return response.json(Support.mapOf("auth", signature, "channel_data", channelData));
        }
        return response.json(Map.of("auth", Broadcast.signChannel(String.valueOf(socketId), channel, null)));
      }
      return response.json(Map.of("message", "Invalid channel or unauthorized."), 403);
    };
  }

  public static Model resolveUser(Request request) {
    if (request.user() != null) return request.user();
    String bearer = request.bearerToken();
    if (bearer == null || bearer.isEmpty() || request.slug().isEmpty()) return null;

    String idPart = null;
    String plain = bearer;
    int separator = bearer.indexOf('|');
    if (separator >= 0) {
      idPart = bearer.substring(0, separator);
      plain = bearer.substring(separator + 1);
    }
    String table = Support.prefixedTable(request.slug(), "personal_access_tokens");
    Conn database = Database.connection(request.slug());
    if (!database.hasTable(table)) return null;
    QueryBuilder<Map<String, Object>> query = database.table(table)
        .where("token", sha256(plain));
    if (idPart != null) query.where("id", idPart);
    Map<String, Object> token = query.first();
    if (token == null) return null;
    Model user = user(request.slug(), token.get("tokenable_id"));
    request.setUser(user);
    request.setAccessTokenId(token.get("id"));
    return user;
  }

  public static Router.Handler registerHandler(String slug) {
    return (request, response) -> {
      Map<String, Object> values = request.validate(Support.mapOf(
          "name", "required|string|max:255",
          "email", "required|email|unique:users,email",
          "password", "required|string|min:8|confirmed"
      ));
      return response.json(register(slug, values), 201);
    };
  }

  public static Router.Handler loginHandler(String slug) {
    return (request, response) -> response.json(login(slug, request.validate(Support.mapOf(
        "email", "required|email",
        "password", "required|string"
    ))));
  }

  public static Router.Handler meHandler() {
    return (request, response) -> response.json(request.user());
  }

  public static Router.Handler logoutHandler(String slug) {
    return (request, response) -> {
      if (request.accessTokenId() != null) {
        Database.connection(slug).execute("DELETE FROM "
            + Database.qi(Support.prefixedTable(slug, "personal_access_tokens"))
            + " WHERE " + Database.qi("id") + " = ?", List.of(request.accessTokenId()));
      }
      return response.json(Map.of("message", "Logged out successfully"));
    };
  }

  public static Router.Middleware authMiddleware(String slug) {
    return (request, response, next) -> {
      request.setUser(resolveUser(request));
      if (request.user() == null) throw new Errors.AuthenticationException();
      return next.run();
    };
  }

  public static Router.Middleware roleMiddleware(String... roles) {
    return (request, response, next) -> {
      Model user = request.user();
      if (user == null) throw new Errors.AuthenticationException();
      String role = user.str("role");
      for (String allowed : roles) if (allowed.equals(role)) return next.run();
      throw new Errors.HttpException(403, "Forbidden");
    };
  }

  private static String sha256(String text) {
    try {
      byte[] digest = MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(digest);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 is unavailable", e);
    }
  }
}
