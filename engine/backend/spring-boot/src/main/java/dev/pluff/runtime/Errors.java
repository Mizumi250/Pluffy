package dev.pluff.runtime;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Exceptions that map to Laravel's default JSON error responses. All unchecked. */
public final class Errors {
  private Errors() {}

  public static class HttpException extends RuntimeException {
    public final int status;
    public final Map<String, String> headers;

    public HttpException(int status, String message) { this(status, message, new LinkedHashMap<>()); }

    public HttpException(int status, String message, Map<String, String> headers) {
      super(message == null ? "" : message);
      this.status = status;
      this.headers = headers;
    }
  }

  public static class ValidationException extends RuntimeException {
    public final Map<String, List<String>> errors;

    public ValidationException(Map<String, List<String>> errors) {
      super("The given data was invalid.");
      this.errors = errors;
    }

    public static ValidationException withMessages(Map<String, ?> errors) {
      Map<String, List<String>> out = new LinkedHashMap<>();
      for (Map.Entry<String, ?> e : errors.entrySet()) {
        List<String> l = new ArrayList<>();
        if (e.getValue() instanceof Iterable) for (Object o : (Iterable<?>) e.getValue()) l.add(String.valueOf(o));
        else l.add(String.valueOf(e.getValue()));
        out.put(e.getKey(), l);
      }
      return new ValidationException(out);
    }

    public String summary() {
      List<String> all = new ArrayList<>();
      for (List<String> l : errors.values()) all.addAll(l);
      int extra = all.size() - 1;
      if (extra > 0) return all.get(0) + " (and " + extra + " more error" + (extra > 1 ? "s" : "") + ")";
      return all.isEmpty() ? getMessage() : all.get(0);
    }
  }

  public static class AuthenticationException extends RuntimeException {
    public AuthenticationException() { super("Unauthenticated."); }
  }

  public static class AuthorizationException extends RuntimeException {
    public AuthorizationException() { this("This action is unauthorized."); }
    public AuthorizationException(String m) { super(m); }
  }

  public static class ModelNotFoundException extends RuntimeException {
    public ModelNotFoundException(String model, Object... ids) {
      super("No query results for model [" + model + "]" + (ids.length > 0 ? " " + joinIds(ids) : ""));
    }

    private static String joinIds(Object[] ids) {
      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < ids.length; i++) { if (i > 0) sb.append(", "); sb.append(ids[i]); }
      return sb.toString();
    }
  }
}
