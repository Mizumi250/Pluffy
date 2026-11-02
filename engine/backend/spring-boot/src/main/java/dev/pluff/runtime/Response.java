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

  public Result withHeader(Result response, String name, String value) {
    Map<String, String> headers = new LinkedHashMap<>(response.headers);
    headers.put(name, value);
    return new Result(response.body, response.status, headers);
  }
}
