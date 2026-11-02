package dev.pluff.runtime;

import java.util.function.Supplier;

/** Laravel-style database facade for generated Java endpoint bodies. */
public final class DB {
  private DB() {}

  public static <T> T transaction(Supplier<T> body) {
    String slug = Router.currentTatemono();
    if (slug == null || slug.isBlank()) throw new IllegalStateException("DB.transaction requires a Tatemono request context");
    return Database.connection(slug).transaction(body);
  }

  public static <T> T transaction(String slug, Supplier<T> body) {
    return Database.connection(slug).transaction(body);
  }

  public static Conn connection(String slug) { return Database.connection(slug); }

  public static QueryBuilder<java.util.Map<String, Object>> table(String table) {
    String slug = Router.currentTatemono();
    if (slug == null || slug.isBlank()) throw new IllegalStateException("DB.table requires a Tatemono request context");
    return Database.connection(slug).table(Support.prefixedTable(slug, table));
  }
}
