package dev.pluff.runtime;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** One JDBC connection (synchronised): parameterised SQL in, plain maps out. */
public final class Conn {
  private final Connection c;
  public final String slug;
  private final boolean pg;

  Conn(Connection c, String slug, boolean pg) {
    this.c = c;
    this.slug = slug;
    this.pg = pg;
  }

  private static RuntimeException wrap(SQLException e, String sql) {
    return new RuntimeException("SQL error: " + e.getMessage() + "\n[SQL: " + sql + "]", e);
  }

  static Object normalize(Object v) {
    if (v instanceof Integer || v instanceof Short || v instanceof Byte) return ((Number) v).longValue();
    if (v instanceof Float) return ((Float) v).doubleValue();
    if (v instanceof java.sql.Timestamp) return Support.sqlTime(((java.sql.Timestamp) v).toLocalDateTime());
    if (v instanceof java.sql.Date) return v.toString();
    return v;
  }

  private static void bind(PreparedStatement ps, List<Object> params) throws SQLException {
    for (int i = 0; i < params.size(); i++) {
      Object v = params.get(i);
      int idx = i + 1;
      if (v == null) ps.setNull(idx, Types.NULL);
      else if (v instanceof Boolean) ps.setBoolean(idx, (Boolean) v);
      else if (v instanceof Map || v instanceof Iterable) ps.setString(idx, Json.stringify(v));
      else if (v instanceof java.time.temporal.TemporalAccessor || v instanceof java.util.Date) ps.setString(idx, Support.sqlTime(v));
      else if (v instanceof Character || v instanceof Enum) ps.setString(idx, v.toString());
      else ps.setObject(idx, v);
    }
  }

  public synchronized List<Map<String, Object>> select(String sql, List<Object> params) {
    try (PreparedStatement ps = c.prepareStatement(sql)) {
      bind(ps, params);
      try (ResultSet rs = ps.executeQuery()) {
        ResultSetMetaData md = rs.getMetaData();
        int n = md.getColumnCount();
        List<Map<String, Object>> out = new ArrayList<>();
        while (rs.next()) {
          Map<String, Object> row = new LinkedHashMap<>();
          for (int i = 1; i <= n; i++) row.put(md.getColumnLabel(i), normalize(rs.getObject(i)));
          out.add(row);
        }
        return out;
      }
    } catch (SQLException e) {
      throw wrap(e, sql);
    }
  }

  public List<Map<String, Object>> select(String sql) { return select(sql, new ArrayList<>()); }

  public synchronized int execute(String sql, List<Object> params) {
    try (PreparedStatement ps = c.prepareStatement(sql)) {
      bind(ps, params);
      return ps.executeUpdate();
    } catch (SQLException e) {
      throw wrap(e, sql);
    }
  }

  public int execute(String sql) { return execute(sql, new ArrayList<>()); }

  /** INSERT one row and return the new primary key (null when the table has no generated key). */
  public synchronized Object insert(String table, Map<String, Object> row, String pk) {
    List<Object> params = new ArrayList<>(row.values());
    StringBuilder cols = new StringBuilder(), marks = new StringBuilder();
    for (String k : row.keySet()) {
      if (cols.length() > 0) { cols.append(", "); marks.append(", "); }
      cols.append(Database.qi(k));
      marks.append('?');
    }
    String sql = row.isEmpty()
        ? "INSERT INTO " + Database.qi(table) + " DEFAULT VALUES"
        : "INSERT INTO " + Database.qi(table) + " (" + cols + ") VALUES (" + marks + ")";
    try {
      if (pg) {
        try (PreparedStatement ps = c.prepareStatement(sql + " RETURNING " + Database.qi(pk))) {
          bind(ps, params);
          try (ResultSet rs = ps.executeQuery()) { return rs.next() ? normalize(rs.getObject(1)) : null; }
        }
      }
      // SQLite: getGeneratedKeys() is not implemented in every sqlite-jdbc version, last_insert_rowid() always is.
      // This method is synchronized and owns the connection, so the rowid belongs to the INSERT above.
      try (PreparedStatement ps = c.prepareStatement(sql)) {
        bind(ps, params);
        ps.executeUpdate();
      }
      try (Statement st = c.createStatement(); ResultSet rs = st.executeQuery("SELECT last_insert_rowid()")) {
        return rs.next() ? normalize(rs.getObject(1)) : null;
      }
    } catch (SQLException e) {
      throw wrap(e, sql);
    }
  }

  /** Runs body in one transaction (commit on return, rollback on exception). Nested calls join the outer transaction. */
  public synchronized <T> T transaction(java.util.function.Supplier<T> body) {
    try {
      if (!c.getAutoCommit()) return body.get();
      c.setAutoCommit(false);
      try {
        T result = body.get();
        c.commit();
        return result;
      } catch (RuntimeException | Error e) {
        try { c.rollback(); } catch (SQLException ignored) { }
        throw e;
      } finally {
        c.setAutoCommit(true);
      }
    } catch (SQLException e) {
      throw wrap(e, "TRANSACTION");
    }
  }

  public synchronized boolean hasTable(String name) {
    try {
      DatabaseMetaData md = c.getMetaData();
      for (String candidate : new String[] {name, name.toLowerCase(Locale.ROOT)}) {
        try (ResultSet rs = md.getTables(null, null, candidate, new String[] {"TABLE"})) {
          if (rs.next()) return true;
        }
      }
      return false;
    } catch (SQLException e) {
      throw wrap(e, "getTables(" + name + ")");
    }
  }

  public synchronized List<String> columns(String table) {
    List<String> out = new ArrayList<>();
    try {
      DatabaseMetaData md = c.getMetaData();
      try (ResultSet rs = md.getColumns(null, null, table, null)) {
        while (rs.next()) out.add(rs.getString("COLUMN_NAME"));
      }
      return out;
    } catch (SQLException e) {
      throw wrap(e, "getColumns(" + table + ")");
    }
  }

  public boolean hasColumn(String table, String column) { return columns(table).contains(column); }

  /** DB("slug").table("x").where(...).get(): fluent access without a model (rows come back as maps). */
  public QueryBuilder<Map<String, Object>> table(String name) { return QueryBuilder.raw(this, name); }

  public synchronized void close() {
    try { c.close(); } catch (SQLException ignored) { /* already closed */ }
  }

  public boolean isPg() { return pg; }
}