package dev.pluff.runtime;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/** Per-tatemono isolated databases (sqlite file or Postgres database), same model as Laravel's ArkzenDatabase. */
public final class Database {
  private Database() {}

  private static final Map<String, Conn> CONNS = new ConcurrentHashMap<>();
  private static volatile Conn main;
  private static final Pattern IDENT = Pattern.compile("^[A-Za-z_][A-Za-z0-9_]*$");

  public static String driver() { return "pgsql".equals(Support.env("ARKZEN_DB_DRIVER", "sqlite")) ? "pgsql" : "sqlite"; }

  public static boolean isPg() { return "pgsql".equals(driver()); }

  public static Path sqliteFile(String slug) { return Support.BACKEND_DIR.resolve("database").resolve("arkzen").resolve(slug + ".sqlite"); }

  public static String pgDatabaseName(String slug) {
    return (Support.env("ARKZEN_DB_PREFIX", "pluff") + "_" + Support.slugToConn(slug)).toLowerCase(Locale.ROOT);
  }

  /** Quote an identifier ('t.col' and '*' allowed). Rejects anything that is not a plain identifier. */
  public static String qi(String name) {
    if ("*".equals(name)) return "*";
    String[] parts = name.split("\\.", -1);
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < parts.length; i++) {
      if (i > 0) sb.append('.');
      if ("*".equals(parts[i])) sb.append('*');
      else if (IDENT.matcher(parts[i]).matches()) sb.append('"').append(parts[i]).append('"');
      else throw new IllegalArgumentException("Invalid identifier: " + name);
    }
    return sb.toString();
  }

  private static String pgUrl(String database) {
    return "jdbc:postgresql://" + Support.env("DB_HOST", "127.0.0.1") + ":" + Support.env("DB_PORT", "5432") + "/" + database;
  }

  private static Conn open(String slug, String database, Path file) {
    try {
      if (isPg()) {
        return new Conn(DriverManager.getConnection(pgUrl(database), Support.env("DB_USERNAME", "postgres"), Support.env("DB_PASSWORD", "")), slug, true);
      }
      Support.ensureDir(file.getParent());
      Conn c = new Conn(DriverManager.getConnection("jdbc:sqlite:" + file), slug, false);
      c.execute("PRAGMA foreign_keys=ON");   // knex / Laravel enforce foreign keys; keep that behaviour
      return c;
    } catch (SQLException e) {
      throw new RuntimeException("Cannot open database for " + slug + ": " + e.getMessage(), e);
    }
  }

  /** Connection for one tatemono. Call ensureDatabase() first when the database may not exist. */
  public static Conn connection(String slug) {
    return CONNS.computeIfAbsent(slug, s -> open(s, pgDatabaseName(s), sqliteFile(s)));
  }

  /** Main app database: queue tables, failed jobs. */
  public static Conn mainConnection() {
    Conn m = main;
    if (m == null) {
      synchronized (Database.class) {
        if (main == null) main = open("main", Support.env("DB_DATABASE", "pluff"), Support.BACKEND_DIR.resolve("database").resolve("pluff.sqlite"));
        m = main;
      }
    }
    return m;
  }

  public static Conn ensureDatabase(String slug) {
    if (isPg()) {
      String name = pgDatabaseName(slug);
      try (java.sql.Connection admin = DriverManager.getConnection(pgUrl("postgres"), Support.env("DB_USERNAME", "postgres"), Support.env("DB_PASSWORD", ""));
           Statement st = admin.createStatement()) {
        try (java.sql.ResultSet rs = st.executeQuery("select 1 from pg_database where datname = '" + name.replace("'", "''") + "'")) {
          if (!rs.next()) {
            st.execute("create database \"" + name + "\"");
            Log.info("Created isolated Postgres database: " + name);
          }
        }
      } catch (SQLException e) {
        throw new RuntimeException("Cannot create Postgres database " + name + ": " + e.getMessage(), e);
      }
    } else {
      Path f = sqliteFile(slug);
      Support.ensureDir(f.getParent());
      if (!Files.exists(f)) {
        try { Files.write(f, new byte[0]); } catch (IOException e) { throw new RuntimeException(e); }
        Log.info("Created isolated DB: database/arkzen/" + slug + ".sqlite");
      }
    }
    return connection(slug);
  }

  public static void dropDatabase(String slug) {
    Conn c = CONNS.remove(slug);
    if (c != null) c.close();
    if (isPg()) {
      try (java.sql.Connection admin = DriverManager.getConnection(pgUrl("postgres"), Support.env("DB_USERNAME", "postgres"), Support.env("DB_PASSWORD", ""));
           Statement st = admin.createStatement()) {
        st.execute("drop database if exists \"" + pgDatabaseName(slug) + "\" with (force)");
      } catch (SQLException e) {
        throw new RuntimeException("Cannot drop Postgres database: " + e.getMessage(), e);
      }
    }
    Path f = sqliteFile(slug);
    for (String suffix : new String[] {"", "-wal", "-shm", "-journal"}) {
      try { Files.deleteIfExists(Path.of(f + suffix)); } catch (IOException ignored) { /* best effort */ }
    }
  }
}
