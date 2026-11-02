package dev.pluff.runtime;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.concurrent.Callable;

/** Small method/path router used by generated tatemono modules. */
public final class Router {
  @FunctionalInterface
  public interface Handler {
    Object handle(Request request, Response response) throws Exception;
  }

  @FunctionalInterface
  public interface Middleware {
    Object handle(Request request, Response response, Next next) throws Exception;
  }

  @FunctionalInterface
  public interface Next {
    Object run() throws Exception;
  }

  public static final class Dispatch {
    public final boolean matched;
    public final Object result;

    private Dispatch(boolean matched, Object result) {
      this.matched = matched;
      this.result = result;
    }
  }

  private static final class Route {
    final String method;
    final Pattern pattern;
    final List<String> names;
    final List<Middleware> middleware;
    final Handler handler;

    Route(String method, Pattern pattern, List<String> names, List<Middleware> middleware, Handler handler) {
      this.method = method;
      this.pattern = pattern;
      this.names = names;
      this.middleware = middleware;
      this.handler = handler;
    }
  }

  private final String slug;
  private static final ThreadLocal<String> CURRENT_TATEMONO = new ThreadLocal<>();
  private final List<Route> routes = new ArrayList<>();

  public Router(String slug) { this.slug = slug; }

  public String slug() { return slug; }

  public static String currentTatemono() { return CURRENT_TATEMONO.get(); }

  public static <T> T withTatemono(String slug, Callable<T> body) throws Exception {
    String previous = CURRENT_TATEMONO.get();
    CURRENT_TATEMONO.set(slug);
    try {
      return body.call();
    } finally {
      if (previous == null) CURRENT_TATEMONO.remove();
      else CURRENT_TATEMONO.set(previous);
    }
  }

  public Router add(String method, String path, List<Middleware> middleware, Handler handler) {
    List<String> names = new ArrayList<>();
    StringBuilder regex = new StringBuilder("^");
    String normalized = normalize(path);
    Matcher matcher = Pattern.compile("\\{([A-Za-z_][A-Za-z0-9_]*)(\\?)?\\}").matcher(normalized);
    int from = 0;
    while (matcher.find()) {
      regex.append(Pattern.quote(normalized.substring(from, matcher.start())));
      names.add(matcher.group(1));
      regex.append(matcher.group(2) == null ? "([^/]+)" : "([^/]*)");
      from = matcher.end();
    }
    regex.append(Pattern.quote(normalized.substring(from))).append("/?$");
    routes.add(new Route(method.toUpperCase(), Pattern.compile(regex.toString()),
        names, middleware == null ? List.of() : List.copyOf(middleware), handler));
    return this;
  }

  public Router add(String method, String path, Handler handler) {
    return add(method, path, List.of(), handler);
  }

  public Dispatch dispatch(Request request, Response response) throws Exception {
    String actualPath = normalize(request.path());
    for (Route route : routes) {
      if (!route.method.equalsIgnoreCase(request.method())) continue;
      Matcher matcher = route.pattern.matcher(actualPath);
      if (!matcher.matches()) continue;
      Map<String, Object> params = new LinkedHashMap<>();
      for (int i = 0; i < route.names.size(); i++) params.put(route.names.get(i), matcher.group(i + 1));
      request.setRouteParams(params);
      try {
        return new Dispatch(true, withTatemono(slug, () -> invoke(route, 0, request, response)));
      } catch (Exception error) {
        throw error;
      }
    }
    return new Dispatch(false, null);
  }

  private static Object invoke(Route route, int index, Request request, Response response) throws Exception {
    if (index >= route.middleware.size()) return route.handler.handle(request, response);
    Middleware middleware = route.middleware.get(index);
    return middleware.handle(request, response, () -> invoke(route, index + 1, request, response));
  }

  private static String normalize(String path) {
    if (path == null || path.isEmpty()) return "/";
    String normalized = path.startsWith("/") ? path : "/" + path;
    return normalized.length() > 1 ? normalized.replaceAll("/+$", "") : normalized;
  }
}
