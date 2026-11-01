package dev.pluff.engine;

import dev.pluff.runtime.Conn;
import dev.pluff.runtime.Database;
import dev.pluff.runtime.Hash;
import dev.pluff.runtime.Json;
import dev.pluff.runtime.Support;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

import static dev.pluff.runtime.Database.qi;

/**
 * Applies the DSL {@code database:<table>} blocks to the tatemono's isolated database.
 * Same behaviour as Laravel's MigrationBuilder and the FastAPI/Express ports: create missing tables, add missing
 * columns, parents before children, plus the isolated auth / notification tables. DDL is written per dialect.
 */
public final class Schema {
  private Schema() {}

  // ── helpers over the JSON payload (Map / List / String / Long / Double / Boolean) ──

  @SuppressWarnings("unchecked")
  static Map<String, Object> map(Object o) { return o instanceof Map ? (Map<String, Object>) o : new LinkedHashMap<>(); }

  @SuppressWarnings("unchecked")
  static List<Object> list(Object o) { return o instanceof List ? (List<Object>) o : new ArrayList<>(); }

  static String str(Object o) { return o == null ? null : o instanceof String ? (String) o : Support.jsStr(o); }

  static boolean truthy(Object o) {
    if (o == null || Boolean.FALSE.equals(o)) return false;
    if (o instanceof Number) return ((Number) o).doubleValue() != 0;
    if (o instanceof String) return !((String) o).isEmpty() && !"0".equals(o);
    return true;
  }

  // ── dependency order ──

  public static List<Map<String, Object>> sortByDependency(List<Object> dbs) {
    Map<String, Map<String, Object>> byTable = new LinkedHashMap<>();
    for (Object d : dbs) byTable.put(str(map(d).get("table")), map(d));
    List<Map<String, Object>> out = new ArrayList<>();
    Set<String> seen = new HashSet<>();
    for (Object d : dbs) visit(map(d), new HashSet<>(), byTable, seen, out);
    return out;
  }

  private static void visit(Map<String, Object> d, Set<String> stack, Map<String, Map<String, Object>> byTable,
                            Set<String> seen, List<Map<String, Object>> out) {
    String table = str(d.get("table"));
    if (seen.contains(table) || stack.contains(table)) return;
    Set<String> next = new HashSet<>(stack);
    next.add(table);
    for (Object c : map(d.get("columns")).values()) {
      Object foreign = map(c).get("foreign");
      if (!truthy(foreign)) continue;
      String ref = str(foreign).split("\\.")[0];
      if (!ref.equals(table) && byTable.containsKey(ref)) visit(byTable.get(ref), next, byTable, seen, out);
    }
    seen.add(table);
    out.add(d);
  }

  // ── DDL ──

  private static long num(Object o, long def) { return o instanceof Number ? ((Number) o).longValue() : truthy(o) ? Support.toLong(o, def) : def; }

  static String sqlType(Map<String, Object> c) {
    String t = c.get("type") == null ? "string" : str(c.get("type"));
    boolean pg = Database.isPg();
    switch (t) {
      case "integer": return "INTEGER";
      case "bigInteger": case "foreignId": return "BIGINT";
      case "string": return "VARCHAR(" + num(c.get("length"), 255) + ")";
      case "text": case "longText": return "TEXT";
      case "decimal": return "NUMERIC(" + num(c.get("precision"), 8) + "," + num(c.get("scale"), 2) + ")";
      case "float": return pg ? "DOUBLE PRECISION" : "REAL";
      case "boolean": return "BOOLEAN";
      case "date": return "DATE";
      case "datetime": case "timestamp": return pg ? "TIMESTAMP" : "DATETIME";
      case "json": return pg ? "JSON" : "TEXT";
      case "uuid": return pg ? "UUID" : "VARCHAR(36)";
      default: return "VARCHAR(255)";
    }
  }

  static String lit(Object v) {
    if (v instanceof Boolean) return Database.isPg() ? ((Boolean) v ? "true" : "false") : ((Boolean) v ? "1" : "0");
    if (v instanceof Number) return Support.jsStr(v);
    return "'" + str(v).replace("'", "''") + "'";
  }

  static String columnSql(String slug, String name, Map<String, Object> c, boolean alter) {
    boolean pg = Database.isPg();
    String t = str(c.get("type"));
    boolean intKey = t == null || t.equals("integer") || t.equals("bigInteger") || t.equals("foreignId");
    if (truthy(c.get("primary")) && !Boolean.FALSE.equals(c.get("autoIncrement")) && intKey) {
      return qi(name) + " " + (pg ? "SERIAL" : "INTEGER") + " PRIMARY KEY" + (pg ? "" : " AUTOINCREMENT");
    }
    List<String> parts = new ArrayList<>(List.of(qi(name), sqlType(c)));
    if (truthy(c.get("primary"))) parts.add("PRIMARY KEY");
    if (truthy(c.get("nullable")) || alter) parts.add("NULL");
    else if (!truthy(c.get("primary"))) parts.add("NOT NULL");
    if (c.get("default") != null) parts.add("DEFAULT " + lit(c.get("default")));
    if (truthy(c.get("unique"))) parts.add("UNIQUE");
    if (truthy(c.get("foreign")) && !alter) {
      String foreign = str(c.get("foreign"));
      int dot = foreign.indexOf('.');
      String refTable = dot < 0 ? foreign : foreign.substring(0, dot);
      String refCol = dot < 0 || dot == foreign.length() - 1 ? "id" : foreign.substring(dot + 1);
      String onDelete = truthy(c.get("onDelete")) ? str(c.get("onDelete")).toUpperCase() : "CASCADE";
      parts.add("REFERENCES " + qi(Support.prefixedTable(slug, refTable)) + " (" + qi(refCol) + ") ON DELETE " + onDelete);
    }
    return String.join(" ", parts);
  }

  private static void ensureTable(Conn db, String slug, Map<String, Object> d, List<String> steps) {
    boolean pg = Database.isPg();
    String table = Support.prefixedTable(slug, str(d.get("table")));
    Map<String, Object> cols = map(d.get("columns"));
    if (!db.hasTable(table)) {
      List<String> lines = new ArrayList<>();
      // Laravel's $table->id(): added unless the block declares its own primary key.
      boolean hasPrimary = cols.values().stream().anyMatch(c -> truthy(map(c).get("primary")));
      if (!hasPrimary) lines.add(qi("id") + " " + (pg ? "SERIAL PRIMARY KEY" : "INTEGER PRIMARY KEY AUTOINCREMENT"));
      for (Map.Entry<String, Object> e : cols.entrySet()) lines.add(columnSql(slug, e.getKey(), map(e.getValue()), false));
      String ts = pg ? "TIMESTAMP" : "DATETIME";
      if (!Boolean.FALSE.equals(d.get("timestamps")) && !cols.containsKey("created_at")) {
        lines.add(qi("created_at") + " " + ts + " NULL");
        lines.add(qi("updated_at") + " " + ts + " NULL");
      }
      if (truthy(d.get("softDeletes")) && !cols.containsKey("deleted_at")) lines.add(qi("deleted_at") + " " + ts + " NULL");
      db.execute("CREATE TABLE " + qi(table) + " (\n  " + String.join(",\n  ", lines) + "\n)");
      for (Object idx : list(d.get("indexes"))) {
        Object raw = idx instanceof List ? idx : map(idx).get("columns") != null ? map(idx).get("columns") : map(idx).get("column");
        List<Object> lst = raw instanceof List ? list(raw) : raw == null ? new ArrayList<>() : new ArrayList<>(List.of(raw));
        if (lst.isEmpty()) continue;
        boolean unique = idx instanceof Map && truthy(map(idx).get("unique"));
        List<String> names = new ArrayList<>();
        for (Object o : lst) names.add(str(o));
        String idxName = table + "_" + String.join("_", names) + "_" + (unique ? "unique" : "index");
        List<String> quoted = new ArrayList<>();
        for (String n : names) quoted.add(qi(n));
        db.execute("CREATE " + (unique ? "UNIQUE " : "") + "INDEX " + qi(idxName) + " ON " + qi(table) + " (" + String.join(", ", quoted) + ")");
      }
      steps.add("Table created: " + table);
    } else {
      Set<String> have = new HashSet<>(db.columns(table));
      List<String> added = new ArrayList<>();
      for (Map.Entry<String, Object> e : cols.entrySet()) {
        if (have.contains(e.getKey())) continue;
        db.execute("ALTER TABLE " + qi(table) + " ADD COLUMN " + columnSql(slug, e.getKey(), map(e.getValue()), true));
        added.add(e.getKey());
      }
      if (!added.isEmpty()) steps.add("Table updated: " + table + " (+" + String.join(", ", added) + ")");
    }
    try {
      Path out = Support.BACKEND_DIR.resolve("database").resolve("migrations").resolve("arkzen").resolve(slug);
      Support.ensureDir(out);
      Files.writeString(out.resolve(str(d.get("table")) + ".json"), Json.stringify(d));
    } catch (java.io.IOException e) {
      throw new RuntimeException("Cannot write migration record: " + e.getMessage(), e);
    }
  }

  public static void applySchema(Conn db, String slug, List<Object> dbs, List<String> steps) {
    for (Map<String, Object> d : sortByDependency(dbs)) ensureTable(db, slug, d, steps);
  }

  // ── isolated auth / notification tables ──

  public static void applyAuthTables(Conn db, String slug, boolean hasNotifications, List<String> steps) {
    boolean pg = Database.isPg();
    String users = Support.prefixedTable(slug, "users");
    String tokens = Support.prefixedTable(slug, "personal_access_tokens");
    String notifs = Support.prefixedTable(slug, "notifications");
    String pk = pg ? "SERIAL PRIMARY KEY" : "INTEGER PRIMARY KEY AUTOINCREMENT";
    String ts = pg ? "TIMESTAMP" : "DATETIME";
    if (!db.hasTable(users)) {
      db.execute("CREATE TABLE " + qi(users) + " (\n"
          + "  \"id\" " + pk + ", \"name\" VARCHAR(255) NOT NULL, \"email\" VARCHAR(255) NOT NULL UNIQUE,\n"
          + "  \"email_verified_at\" " + ts + " NULL, \"password\" VARCHAR(255) NOT NULL,\n"
          + "  \"role\" VARCHAR(20) NOT NULL DEFAULT 'user', \"remember_token\" VARCHAR(100) NULL,\n"
          + "  \"created_at\" " + ts + " NULL, \"updated_at\" " + ts + " NULL)");
      steps.add("Auth table created: " + users);
    } else if (!db.hasColumn(users, "role")) {
      db.execute("ALTER TABLE " + qi(users) + " ADD COLUMN \"role\" VARCHAR(20) DEFAULT 'user'");
      steps.add("Added role column: " + users);
    }
    if (!db.hasTable(tokens)) {
      db.execute("CREATE TABLE " + qi(tokens) + " (\n"
          + "  \"id\" " + pk + ", \"tokenable_type\" VARCHAR(255) NOT NULL, \"tokenable_id\" BIGINT NOT NULL,\n"
          + "  \"name\" VARCHAR(255) NOT NULL, \"token\" VARCHAR(64) NOT NULL UNIQUE, \"abilities\" TEXT NULL,\n"
          + "  \"last_used_at\" " + ts + " NULL, \"expires_at\" " + ts + " NULL, \"created_at\" " + ts + " NULL, \"updated_at\" " + ts + " NULL)");
      db.execute("CREATE INDEX " + qi(tokens + "_tokenable_id_index") + " ON " + qi(tokens) + " (\"tokenable_id\")");
      steps.add("Auth table created: " + tokens);
    }
    if (hasNotifications && !db.hasTable(notifs)) {
      db.execute("CREATE TABLE " + qi(notifs) + " (\n"
          + "  \"id\" " + (pg ? "UUID" : "VARCHAR(36)") + " PRIMARY KEY, \"type\" VARCHAR(255) NOT NULL,\n"
          + "  \"notifiable_type\" VARCHAR(255) NOT NULL, \"notifiable_id\" BIGINT NOT NULL, \"data\" TEXT NOT NULL,\n"
          + "  \"read_at\" " + ts + " NULL, \"created_at\" " + ts + " NULL, \"updated_at\" " + ts + " NULL)");
      steps.add("Table created: " + notifs);
    }
  }

  public static void seedAuthUsers(Conn db, String slug, Object seed, List<String> steps) {
    List<Object> usersSeed = seed instanceof List ? list(seed) : seed instanceof Map && map(seed).get("users") instanceof List ? list(map(seed).get("users")) : null;
    if (usersSeed == null) return;
    String users = Support.prefixedTable(slug, "users");
    for (Object o : usersSeed) {
      Map<String, Object> u = map(o);
      String email = str(u.get("email"));
      if (!truthy(email)) continue;
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("name", truthy(u.get("name")) ? str(u.get("name")) : email);
      row.put("email", email);
      row.put("password", Hash.make(truthy(u.get("password")) ? str(u.get("password")) : "password"));
      row.put("role", truthy(u.get("role")) ? str(u.get("role")) : "user");
      row.put("updated_at", Support.sqlNow());
      List<Map<String, Object>> existing = db.select("SELECT " + qi("id") + " FROM " + qi(users) + " WHERE " + qi("email") + " = ?", new ArrayList<>(List.of(email)));
      if (!existing.isEmpty()) {
        StringJoiner sets = new StringJoiner(", ");
        List<Object> params = new ArrayList<>();
        for (Map.Entry<String, Object> e : row.entrySet()) { sets.add(qi(e.getKey()) + " = ?"); params.add(e.getValue()); }
        params.add(email);
        db.execute("UPDATE " + qi(users) + " SET " + sets + " WHERE " + qi("email") + " = ?", params);
      } else {
        row.put("created_at", Support.sqlNow());
        db.insert(users, row, "id");
      }
      steps.add("Seeded user: " + email + " (role: " + row.get("role") + ")");
    }
  }

  // ── seeders ──

  public static void seedTables(Conn db, String slug, List<Object> dbs, List<String> steps) {
    boolean pg = Database.isPg();
    for (Object o : dbs) {
      Map<String, Object> d = map(o);
      List<Object> rows = list(map(d.get("seeder")).get("data"));
      if (rows.isEmpty()) continue;
      String table = Support.prefixedTable(slug, str(d.get("table")));
      db.execute("DELETE FROM " + qi(table));
      // The other backends leave the id counter running, so every rebuild shifted seeded ids (1,2 -> 13,14) and
      // broke screens that address a seeded row by id. Reset the counter so a rebuild is repeatable.
      if (pg) {
        if (!db.select("SELECT pg_get_serial_sequence(?, 'id') AS s", new ArrayList<>(List.of(qi(table)))).isEmpty()) {
          Object seq = db.select("SELECT pg_get_serial_sequence(?, 'id') AS s", new ArrayList<>(List.of(qi(table)))).get(0).get("s");
          if (seq != null) db.execute("ALTER SEQUENCE " + seq + " RESTART WITH 1");
        }
      } else if (!db.select("SELECT name FROM sqlite_master WHERE name = 'sqlite_sequence'").isEmpty()) {   // JDBC lists it as a system table, hasTable() misses it
        db.execute("DELETE FROM sqlite_sequence WHERE name = ?", new ArrayList<>(List.of(table)));
      }
      String ts = Support.sqlNow();
      for (Object r : rows) {
        Map<String, Object> row = new LinkedHashMap<>(map(r));
        for (Map.Entry<String, Object> e : row.entrySet()) {
          Object v = e.getValue();
          if (v instanceof Boolean && !pg) e.setValue(((Boolean) v) ? 1 : 0);
          else if (v instanceof Map || v instanceof List) e.setValue(Json.stringify(v));
        }
        if (!Boolean.FALSE.equals(d.get("timestamps"))) {
          row.putIfAbsent("created_at", ts);
          row.putIfAbsent("updated_at", ts);
        }
        db.insert(table, row, "id");
      }
      steps.add("Seeded " + rows.size() + " rows: " + table);
    }
  }
}
