package dev.pluff.runtime;

import jakarta.servlet.http.HttpServletRequest;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Framework-neutral request facade for generated controllers and :java DSL bodies. */
public final class Request {
  private final HttpServletRequest raw;
  private final String slug;
  private final Map<String, Object> body;
  private final Map<String, Object> params;
  private final Map<String, List<Map<String, Object>>> files;
  private final Map<String, Object> query;
  private Model user;
  private Object accessTokenId;

  public Request(HttpServletRequest raw, String slug, Map<String, Object> body,
                 Map<String, Object> params, Map<String, List<Map<String, Object>>> files) {
    this.raw = raw;
    this.slug = slug == null ? "" : slug;
    this.body = body == null ? new LinkedHashMap<>() : new LinkedHashMap<>(body);
    this.params = params == null ? new LinkedHashMap<>() : new LinkedHashMap<>(params);
    this.files = files == null ? new LinkedHashMap<>() : files;
    this.query = parseQuery(raw.getQueryString());
  }

  private static Map<String, Object> parseQuery(String query) {
    Map<String, Object> out = new LinkedHashMap<>();
    if (query == null || query.isEmpty()) return out;
    for (String part : query.split("&")) {
      if (part.isEmpty()) continue;
      int split = part.indexOf('=');
      String key = decode(split < 0 ? part : part.substring(0, split));
      String value = decode(split < 0 ? "" : part.substring(split + 1));
      out.put(key, value);
    }
    return out;
  }

  private static String decode(String value) {
    return URLDecoder.decode(value, StandardCharsets.UTF_8);
  }

  public Map<String, Object> all() {
    Map<String, Object> out = new LinkedHashMap<>(query);
    out.putAll(body);
    out.putAll(params);
    for (Map.Entry<String, List<Map<String, Object>>> entry : files.entrySet()) {
      out.put(entry.getKey(), entry.getValue());
    }
    return out;
  }

  public Object input(String key) { return input(key, null); }

  public Object input(String key, Object defaultValue) {
    Map<String, Object> all = all();
    return all.containsKey(key) ? all.get(key) : defaultValue;
  }

  public Object query(String key) { return query(key, null); }

  public Object query(String key, Object defaultValue) {
    return query.containsKey(key) ? query.get(key) : defaultValue;
  }

  public boolean has(String key) { return all().containsKey(key); }

  public boolean filled(String key) {
    Object value = input(key);
    return value != null && !(value instanceof String && ((String) value).isEmpty());
  }

  public boolean booleanValue(String key) {
    Object value = input(key);
    return Boolean.TRUE.equals(value) || "1".equals(value) || "true".equalsIgnoreCase(String.valueOf(value))
        || "on".equalsIgnoreCase(String.valueOf(value)) || "yes".equalsIgnoreCase(String.valueOf(value));
  }

  public Map<String, Object> only(String... keys) {
    Map<String, Object> all = all();
    Map<String, Object> out = new LinkedHashMap<>();
    for (String key : keys) if (all.containsKey(key)) out.put(key, all.get(key));
    return out;
  }

  public Map<String, Object> except(String... keys) {
    Map<String, Object> out = all();
    for (String key : keys) out.remove(key);
    return out;
  }

  public Map<String, Object> validate(Map<String, ?> rules) {
    return Validator.validate(all(), rules, slug.isEmpty() ? null : Database.connection(slug), slug, null);
  }

  public Map<String, Object> validate(Map<String, ?> rules, Map<String, String> messages) {
    return Validator.validate(all(), rules, slug.isEmpty() ? null : Database.connection(slug), slug, messages);
  }

  public String header(String name) { return raw.getHeader(name); }

  public Map<String, String> headers() {
    Map<String, String> out = new LinkedHashMap<>();
    java.util.Enumeration<String> names = raw.getHeaderNames();
    if (names == null) return out;
    while (names.hasMoreElements()) {
      String name = names.nextElement();
      out.put(name, raw.getHeader(name));
    }
    return out;
  }

  public String bearerToken() {
    String value = raw.getHeader("Authorization");
    return value != null && value.regionMatches(true, 0, "Bearer ", 0, 7)
        ? value.substring(7).trim() : null;
  }

  public boolean isJson() {
    String contentType = raw.getContentType();
    return contentType != null && contentType.toLowerCase().contains("json");
  }

  public String method() { return raw.getMethod(); }

  public String path() { return raw.getRequestURI(); }

  public String url() {
    String queryString = raw.getQueryString();
    return raw.getRequestURL() + (queryString == null || queryString.isEmpty() ? "" : "?" + queryString);
  }

  public String ip() { return raw.getRemoteAddr(); }

  public Object route(String name) {
    if (name == null || name.isEmpty()) return params;
    if (params.containsKey(name)) return params.get(name);
    return params.get("id");
  }

  public Map<String, Object> route() { return params; }

  public List<Map<String, Object>> files(String key) {
    return files.getOrDefault(key, new ArrayList<>());
  }

  public Map<String, List<Map<String, Object>>> files() { return files; }

  public Model user() { return user; }

  public Request setUser(Model value) {
    user = value;
    return this;
  }

  public Object accessTokenId() { return accessTokenId; }

  public Request setAccessTokenId(Object value) {
    accessTokenId = value;
    return this;
  }

  public Request setRouteParams(Map<String, Object> values) {
    params.clear();
    params.putAll(values);
    return this;
  }

  public Request merge(Map<String, Object> values) {
    body.putAll(values);
    return this;
  }

  public Model authUser() { return Auth.resolveUser(this); }

  public String slug() { return slug; }

  public HttpServletRequest raw() { return raw; }
}
