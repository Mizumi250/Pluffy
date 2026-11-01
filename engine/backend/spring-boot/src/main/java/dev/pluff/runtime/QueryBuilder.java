package dev.pluff.runtime;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * Eloquent-like query builder. Builds flat parameterised SQL, so where(a).orWhere(b).where(c)
 * means "a OR b AND c", exactly like Laravel / knex.
 */
public final class QueryBuilder<T> {
  private static final Set<String> OPS = Set.of("=", "<", ">", "<=", ">=", "<>", "!=", "like", "not like", "ilike", "not ilike");

  private static final class Where {
    final String bool, sql;
    Where(String bool, String sql) { this.bool = bool; this.sql = sql; }
  }

  private final ModelMeta meta;                 // null for raw table access (rows come back as maps)
  private final Conn conn;
  private final String table;
  private final Function<Map<String, Object>, T> hydrator;
  private final List<Object> params;            // positional; shared with nested where-groups
  private final List<Where> wheres = new ArrayList<>();
  private final List<String[]> orders = new ArrayList<>();
  private List<String> select = new ArrayList<>(List.of("*"));
  private Integer limit, offset;
  private Where scope;

  private QueryBuilder(ModelMeta meta, Conn conn, String table, Function<Map<String, Object>, T> hydrator, boolean scoped, List<Object> params) {
    this.meta = meta;
    this.conn = conn;
    this.table = table;
    this.hydrator = hydrator;
    this.params = params;
    if (scoped && meta != null && meta.softDeletes) {
      scope = new Where("and", Database.qi(table) + "." + Database.qi("deleted_at") + " IS NULL");
      wheres.add(scope);
    }
  }

  /** Query over a model (soft-delete scope applied). */
  public static <M extends Model> QueryBuilder<M> forModel(ModelMeta meta, Supplier<M> factory) {
    return new QueryBuilder<M>(meta, Database.connection(meta.connectionName), meta.table, row -> Model.hydrate(meta, factory, row), true, new ArrayList<>());
  }

  static QueryBuilder<Map<String, Object>> raw(Conn conn, String table) {
    return new QueryBuilder<Map<String, Object>>(null, conn, table, row -> row, false, new ArrayList<>());
  }

  public ModelMeta meta() { return meta; }

  // ── where family ──
  private QueryBuilder<T> add(String bool, String sql) {
    wheres.add(new Where(bool, sql));
    return this;
  }

  private String ph(Object v) {
    params.add(v);
    return "?";
  }

  private QueryBuilder<T> cmp(String bool, String col, String op, Object v) {
    String o = op.toLowerCase();
    if (!OPS.contains(o)) throw new IllegalArgumentException("Unsupported operator: " + op);
    if (v == null && (o.equals("=") || o.equals("!=") || o.equals("<>"))) {
      return add(bool, Database.qi(col) + " IS " + (o.equals("=") ? "" : "NOT ") + "NULL");
    }
    return add(bool, Database.qi(col) + " " + o.toUpperCase() + " " + ph(prep(v)));
  }

  private QueryBuilder<T> group(String bool, Consumer<QueryBuilder<T>> fn) {
    QueryBuilder<T> child = new QueryBuilder<>(meta, conn, table, hydrator, false, params);
    fn.accept(child);
    String sql = child.whereSql();
    return sql.isEmpty() ? this : add(bool, "(" + sql + ")");
  }

  public QueryBuilder<T> where(String col, Object val) { return cmp("and", col, "=", val); }

  public QueryBuilder<T> where(String col, String op, Object val) { return cmp("and", col, op, val); }

  public QueryBuilder<T> where(Map<String, Object> cols) {
    for (Map.Entry<String, Object> e : cols.entrySet()) cmp("and", e.getKey(), "=", e.getValue());
    return this;
  }

  public QueryBuilder<T> where(Consumer<QueryBuilder<T>> group) { return group("and", group); }

  public QueryBuilder<T> orWhere(String col, Object val) { return cmp("or", col, "=", val); }

  public QueryBuilder<T> orWhere(String col, String op, Object val) { return cmp("or", col, op, val); }

  public QueryBuilder<T> orWhere(Consumer<QueryBuilder<T>> group) { return group("or", group); }

  public QueryBuilder<T> whereIn(String col, Iterable<?> vals) {
    List<String> marks = new ArrayList<>();
    for (Object v : vals) marks.add(ph(prep(v)));
    return marks.isEmpty() ? add("and", "1 = 0") : add("and", Database.qi(col) + " IN (" + String.join(", ", marks) + ")");
  }

  public QueryBuilder<T> whereNotIn(String col, Iterable<?> vals) {
    List<String> marks = new ArrayList<>();
    for (Object v : vals) marks.add(ph(prep(v)));
    return marks.isEmpty() ? add("and", "1 = 1") : add("and", Database.qi(col) + " NOT IN (" + String.join(", ", marks) + ")");
  }

  public QueryBuilder<T> whereNull(String col) { return add("and", Database.qi(col) + " IS NULL"); }

  public QueryBuilder<T> whereNotNull(String col) { return add("and", Database.qi(col) + " IS NOT NULL"); }

  public QueryBuilder<T> whereBetween(String col, Object a, Object b) {
    return add("and", Database.qi(col) + " BETWEEN " + ph(prep(a)) + " AND " + ph(prep(b)));
  }

  /** Raw condition with ? placeholders, e.g. whereRaw("price > ? AND stock < ?", 10, 5). */
  public QueryBuilder<T> whereRaw(String sql, Object... bindings) {
    for (Object b : bindings) params.add(b);
    return add("and", "(" + sql + ")");
  }

  public QueryBuilder<T> when(Object cond, Consumer<QueryBuilder<T>> cb) {
    boolean truthy = cond != null && !Boolean.FALSE.equals(cond) && !"".equals(cond);
    if (truthy) cb.accept(this);
    return this;
  }

  private String whereSql() {
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < wheres.size(); i++) {
      if (i > 0) sb.append(' ').append(wheres.get(i).bool.toUpperCase()).append(' ');
      sb.append(wheres.get(i).sql);
    }
    return sb.toString();
  }

  // ── shaping ──
  public QueryBuilder<T> select(String... cols) {
    select = new ArrayList<>(cols.length == 0 ? List.of("*") : Arrays.asList(cols));
    return this;
  }

  public QueryBuilder<T> orderBy(String col, String direction) {
    orders.add(new String[] {col, "desc".equalsIgnoreCase(direction) ? "DESC" : "ASC"});
    return this;
  }

  public QueryBuilder<T> orderBy(String col) { return orderBy(col, "asc"); }

  public QueryBuilder<T> latest() { return orderBy("created_at", "desc"); }

  public QueryBuilder<T> latest(String col) { return orderBy(col, "desc"); }

  public QueryBuilder<T> oldest() { return orderBy("created_at", "asc"); }

  public QueryBuilder<T> limit(int n) { limit = n; return this; }

  public QueryBuilder<T> take(int n) { return limit(n); }

  public QueryBuilder<T> offset(int n) { offset = n; return this; }

  public QueryBuilder<T> withTrashed() {
    if (scope != null) { wheres.remove(scope); scope = null; }
    return this;
  }

  // ── SQL ──
  private String fromWhere() {
    String w = whereSql();
    return "FROM " + Database.qi(table) + (w.isEmpty() ? "" : " WHERE " + w);
  }

  private String compile(Integer lim, Integer off) {
    StringBuilder sb = new StringBuilder("SELECT ");
    for (int i = 0; i < select.size(); i++) { if (i > 0) sb.append(", "); sb.append(Database.qi(select.get(i))); }
    sb.append(' ').append(fromWhere());
    if (!orders.isEmpty()) {
      sb.append(" ORDER BY ");
      for (int i = 0; i < orders.size(); i++) {
        if (i > 0) sb.append(", ");
        sb.append(Database.qi(orders.get(i)[0])).append(' ').append(orders.get(i)[1]);
      }
    }
    Integer l = lim != null ? lim : limit;
    Integer o = off != null ? off : offset;
    if (l != null) sb.append(" LIMIT ").append(l);
    if (o != null) {
      if (l == null && !conn.isPg()) sb.append(" LIMIT -1");
      sb.append(" OFFSET ").append(o);
    }
    return sb.toString();
  }

  public String toSql() { return compile(null, null); }

  private List<Map<String, Object>> rows(String sql) { return conn.select(sql, params); }

  // ── reads ──
  public List<T> get() {
    List<T> out = new ArrayList<>();
    for (Map<String, Object> r : rows(compile(null, null))) out.add(hydrator.apply(r));
    return out;
  }

  public T first() {
    List<Map<String, Object>> r = rows(compile(1, null));
    return r.isEmpty() ? null : hydrator.apply(r.get(0));
  }

  public T firstOrFail() {
    T m = first();
    if (m == null) throw new Errors.ModelNotFoundException(meta != null ? Support.studly(meta.table) : table);
    return m;
  }

  public T find(Object id) { return where(meta != null ? meta.primaryKey : "id", id).first(); }

  public T findOrFail(Object id) {
    T m = find(id);
    if (m == null) throw new Errors.ModelNotFoundException(meta != null ? Support.studly(meta.table) : table, id);
    return m;
  }

  public long count() {
    List<Map<String, Object>> r = rows("SELECT COUNT(*) AS c " + fromWhere());
    return r.isEmpty() || r.get(0).get("c") == null ? 0L : ((Number) r.get(0).get("c")).longValue();
  }

  private Object agg(String fn, String col) {
    List<Map<String, Object>> r = rows("SELECT " + fn + "(" + Database.qi(col) + ") AS v " + fromWhere());
    return r.isEmpty() ? null : r.get(0).get("v");
  }

  public double sum(String col) { Object v = agg("SUM", col); return v == null ? 0 : ((Number) v).doubleValue(); }

  public Object max(String col) { return agg("MAX", col); }

  public Object min(String col) { return agg("MIN", col); }

  public Double avg(String col) { Object v = agg("AVG", col); return v == null ? null : ((Number) v).doubleValue(); }

  public boolean exists() { return count() > 0; }

  public List<Object> pluck(String col) {
    List<String> saved = select;
    select = new ArrayList<>(List.of(col));
    try {
      String key = col.contains(".") ? col.substring(col.lastIndexOf('.') + 1) : col;
      List<Object> out = new ArrayList<>();
      for (Map<String, Object> r : rows(compile(null, null))) out.add(r.get(key));
      return out;
    } finally {
      select = saved;
    }
  }

  /** Laravel's LengthAwarePaginator JSON shape. */
  public Map<String, Object> paginate(Object perPageIn, Object pageIn, String path) {
    int perPage = Math.max(1, Support.toInt(perPageIn, 15));
    int page = Math.max(1, Support.toInt(pageIn, 1));
    long total = count();
    List<T> data = new ArrayList<>();
    for (Map<String, Object> r : rows(compile(perPage, (page - 1) * perPage))) data.add(hydrator.apply(r));
    int last = (int) Math.max(1, Math.ceil(total / (double) perPage));
    Function<Integer, String> url = p -> path + "?page=" + p;
    List<Object> links = new ArrayList<>();
    links.add(link(page > 1 ? url.apply(page - 1) : null, "&laquo; Previous", false));
    for (int p = 1; p <= last; p++) links.add(link(url.apply(p), String.valueOf(p), p == page));
    links.add(link(page < last ? url.apply(page + 1) : null, "Next &raquo;", false));
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("current_page", page);
    out.put("data", data);
    out.put("first_page_url", url.apply(1));
    out.put("from", data.isEmpty() ? null : (Object) ((page - 1) * perPage + 1));
    out.put("last_page", last);
    out.put("last_page_url", url.apply(last));
    out.put("links", links);
    out.put("next_page_url", page < last ? url.apply(page + 1) : null);
    out.put("path", path);
    out.put("per_page", perPage);
    out.put("prev_page_url", page > 1 ? url.apply(page - 1) : null);
    out.put("to", data.isEmpty() ? null : (Object) ((page - 1) * perPage + data.size()));
    out.put("total", total);
    return out;
  }

  private static Map<String, Object> link(String url, String label, boolean active) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("url", url);
    m.put("label", label);
    m.put("active", active);
    return m;
  }

  // ── writes ──
  public int update(Map<String, Object> attrs) {
    Map<String, Object> row = new LinkedHashMap<>(attrs);
    if (meta != null) {
      Model.serializeForWrite(row);
      if (meta.timestamps) row.put("updated_at", Support.sqlNow());
    } else {
      Model.serializeForWrite(row);
    }
    return updateRaw(row);
  }

  private int updateRaw(Map<String, Object> row) {
    if (row.isEmpty()) return 0;
    List<Object> all = new ArrayList<>();
    StringBuilder sets = new StringBuilder();
    for (Map.Entry<String, Object> e : row.entrySet()) {
      if (sets.length() > 0) sets.append(", ");
      sets.append(Database.qi(e.getKey())).append(" = ?");
      all.add(e.getValue());
    }
    all.addAll(params);
    String w = whereSql();
    return conn.execute("UPDATE " + Database.qi(table) + " SET " + sets + (w.isEmpty() ? "" : " WHERE " + w), all);
  }

  public int delete() {
    if (meta != null && meta.softDeletes) {
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("deleted_at", Support.sqlNow());
      return updateRaw(row);
    }
    String w = whereSql();
    return conn.execute("DELETE FROM " + Database.qi(table) + (w.isEmpty() ? "" : " WHERE " + w), params);
  }

  /** Raw insert (no model): returns the generated key. */
  public Object insert(Map<String, Object> row) {
    Map<String, Object> copy = new LinkedHashMap<>(row);
    Model.serializeForWrite(copy);
    return conn.insert(table, copy, "id");
  }

  private static Object prep(Object v) {
    if (v instanceof Boolean && !Database.isPg()) return ((Boolean) v) ? 1 : 0;
    return v;
  }
}
