package dev.pluff.generated.express_test;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("express-test");
    EventDispatcher.unregister("express-test");
    CommandRegistry.unregister("express-test");
    Router router = new Router("express-test");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    JobDispatcher.register("express-test", "record-result", data -> new RecordResultJob(data));
    EventDispatcher.register("express-test", "ticket-created", event -> {
      EventLog.create(mapOf(
          "event_name", "ticket-created",
          "listener", "LogTicket",
          "payload", Json.stringify(event.data)
      ));
    });
    EventDispatcher.register("express-test", "ticket-created", event -> {
      EventLog.create(mapOf(
          "event_name", "ticket-created",
          "listener", "CountTicket",
          "payload", String.valueOf(Ticket.count())
      ));
    });
    CommandRegistry.register("express-test", () -> new PingCommand());
    router.add("POST", "/api/express-test/auth/register", Auth.registerHandler("express-test"));
    router.add("POST", "/api/express-test/auth/login", Auth.loginHandler("express-test"));
    router.add("POST", "/api/express-test/auth/logout", List.of(Auth.authMiddleware("express-test")), Auth.logoutHandler("express-test"));
    router.add("GET", "/api/express-test/auth/me", List.of(Auth.authMiddleware("express-test")), Auth.meHandler());
    router.add("POST", "/api/express-test/auth/broadcasting/auth", List.of(Auth.authMiddleware("express-test")), Auth.broadcastingAuth("express-test", Map.ofEntries(Map.entry("express-test-public", Map.of("type", "public", "auth", "authenticated")))));
    router.add("GET", "/api/express-test/tickets", List.of(Auth.authMiddleware("express-test")), (request, response) -> {
      QueryBuilder<Ticket> query = Ticket.query();
      if (request.filled("search")) {
        String search = "%" + request.input("search") + "%";
        query.where(group -> group.orWhere("name", "like", search).orWhere("description", "like", search));
      }
      if (request.filled("status")) query.where("status", request.input("status"));
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/express-test/tickets", List.of(Auth.authMiddleware("express-test")), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("title", "required|string|max:255", "status", "sometimes|string|in:open,closed", "priority", "sometimes|integer|min:1", "done", "sometimes|boolean", "user_id", "sometimes|integer"));
      Ticket created = Ticket.create(validated);
      return response.json(created, 201);
    });
    router.add("GET", "/api/express-test/stats", List.of(Auth.authMiddleware("express-test")), (request, response) -> {
      long total = Ticket.count();
      long open = Ticket.query().where("status", "open").count();
      return response.json(mapOf(
          "total", total,
          "open", open,
          "closed", total - open,
          "by", request.user() == null ? null : request.user().str("email")
      ));
    });
    router.add("GET", "/api/express-test/ping", List.of(customMiddleware("requireJson")), (request, response) -> {
      QueryBuilder<JobResult> query = JobResult.query();
      return response.json(query.orderBy("created_at", "desc").get());
    });
    router.add("GET", "/api/express-test/tickets/{id}", List.of(Auth.authMiddleware("express-test")), (request, response) -> {
      Ticket ticket = Ticket.findOrFail(request.route("id"));
      return response.json(ticket);
    });
    router.add("PUT", "/api/express-test/tickets/{id}", List.of(Auth.authMiddleware("express-test")), (request, response) -> {
      Ticket ticket = Ticket.findOrFail(request.route("id"));
      Model user = request.authUser();
      if (!policyUpdateTicket(user, ticket)) throw new Errors.AuthorizationException();
      Map<String, Object> validated = request.validate(Support.mapOf("title", "sometimes|string|max:255", "status", "sometimes|string|in:open,closed"));
      ticket.update(validated);
      return response.json(ticket);
    });
    router.add("DELETE", "/api/express-test/tickets/{id}", List.of(Auth.authMiddleware("express-test")), (request, response) -> {
      Ticket ticket = Ticket.findOrFail(request.route("id"));
      Model user = request.authUser();
      if (!policyDeleteTicket(user, ticket)) throw new Errors.AuthorizationException();
      ticket.delete();
      return response.json(mapOf("message", "Deleted successfully"));
    });
    router.add("GET", "/api/express-test/probe/{name}", List.of(), (request, response) -> {
      return probe(request, response);
    });
    return router;
  }
  private static Map<String, Map<String, Object>> mailTemplates() {
    Map<String, Map<String, Object>> templates = new LinkedHashMap<>();
    templates.put("welcome-mail", mapOf("subject", "Welcome to Pluff", "data", "{username=string, app_name=string}", "template", "<p>welcome-mail</p>"));
    return templates;
  }
  private static Router.Middleware customMiddleware(String name) throws Exception {
    return switch (name) {
      case "requireJson" -> (request, response, next) -> {
        if (!request.isJson()) {
            return response.json(mapOf("message", "Content-Type: application/json is required."), 415);
        }
        return next.run();
      };
      default -> throw new IllegalArgumentException("Unknown middleware: " + name);
    };
  }
  private static boolean policyUpdateTicket(Model user, Model model) {
    Model item = model;
    return user != null && (java.util.Objects.equals(user.get("id"), item.get("user_id")) || "admin".equals(user.get("role")));
  }
  private static boolean policyDeleteTicket(Model user, Model model) {
    Model item = model;
    return user != null && "admin".equals(user.get("role"));
  }
  public static Object probe(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    return response.json(mapOf(
        "probe", request.route("name"),
        "params", params,
        "at", "express"
    ));
  }
  public static final class RecordResultJob extends Job {
    public RecordResultJob(Map<String, Object> data) { super(data, "default", 2, 20); }
    @Override public void handle() throws Exception {
      Object rawMode = this.data == null ? null : this.data.get("mode");
      String mode = rawMode == null ? "default" : String.valueOf(rawMode);
      JobResult.create(mapOf("job_name", "record-result", "status", "completed:" + mode));
    }
  }
  public static final class PingCommand extends Command {
    public PingCommand() { super("express-test:ping", "Writes a job_results row", "* * * * *"); }
    @Override public int handle() throws Exception {
      JobResult.create(mapOf("job_name", "ping", "status", "ran"));
      this.info("[express-test] ping done");
      return Command.SUCCESS;
    }
  }
  public static final class DbPingNotification extends Notification {
    @Override public String tatemono() { return "express-test"; }
    @Override public String name() { return "DbPingNotification"; }
    @Override public List<String> channels() { return List.of("database"); }
    @Override public String channelType() { return "private"; }
    @Override public String channel() { return "express-test.notifications"; }
    @Override public Map<String, Object> toDatabase(Model notifiable) { return mapOf("message", "You have a new database notification", "type", name()); }
    @Override public MailMessage toMail(Model notifiable) {
      return new MailMessage().subject("db-ping").line("db-ping");
    }
  }
  private static Notification notificationFor(String name) {
    return switch (name) {
      case "db-ping" -> new DbPingNotification();
      default -> null;
    };
  }
  private static Map<String, Object> objectMap(Object value) {
    Map<String, Object> out = new LinkedHashMap<>();
    if (value instanceof Map<?, ?> values) values.forEach((key, item) -> out.put(String.valueOf(key), item));
    return out;
  }
}
