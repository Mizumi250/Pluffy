package dev.pluff.runtime;

import java.util.LinkedHashMap;
import java.util.Map;

/** Laravel-style response helpers used by generated controllers and :java bodies. */
public final class Response {
  public static final class Result {
    public final Object body;
    public final int status;
    public final Map<String, String> headers;

    private Result(Object body, int status, Map<String, String> headers) {
      this.body = body;
      this.status = status;
      this.headers = headers;
    }
  }

  public Result json(Object body) { return json(body, 200); }

  public Result json(Object body, int status) {
    return new Result(body, status, new LinkedHashMap<>());
  }

  public Result text(String body) { return text(body, 200); }

  public Result text(String body, int status) {
    Map<String, String> headers = new LinkedHashMap<>();
    headers.put("Content-Type", "text/plain; charset=utf-8");
    return new Result(body, status, headers);
  }

  public Result download(byte[] body, String contentType, String filename) {
    Map<String, String> headers = new LinkedHashMap<>();
    headers.put("Content-Type", contentType == null || contentType.isBlank()
        ? "application/octet-stream" : contentType);
    String safe = filename == null ? "download" : filename;
    safe = safe.replaceAll("[\\\\/\\r\\n\\x00-\\x1f\\\"]", "_");
    headers.put("Content-Disposition", "attachment; filename=\"" + safe + "\"; filename*=UTF-8''"
        + java.net.URLEncoder.encode(safe, java.nio.charset.StandardCharsets.UTF_8).replace("+", "%20"));
    return new Result(body, 200, headers);
  }

  public Result withHeader(Result response, String name, String value) {
    Map<String, String> headers = new LinkedHashMap<>(response.headers);
    headers.put(name, value);
    return new Result(response.body, response.status, headers);
  }
}
