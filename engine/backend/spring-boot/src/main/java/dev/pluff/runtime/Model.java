package dev.pluff.runtime;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;

/** Eloquent-like model: a map of attributes plus save / update / delete. Generated subclasses add the static finders. */
public abstract class Model implements Json.Serializable {
  private static final List<String> DATE_COLS = List.of("created_at", "updated_at", "deleted_at");

  protected final ModelMeta meta;
  Map<String, Object> attrs = new LinkedHashMap<>();
  Map<String, Object> orig = new LinkedHashMap<>();
  boolean exists = false;

  protected Model(ModelMeta meta) { this.meta = meta; }

  /** A fresh query for this model class (implemented by every generated model). */
  protected abstract QueryBuilder<? extends Model> newQuery();

  public ModelMeta meta() { return meta; }

  // ── attributes ──
  public Object get(String key) { return attrs.get(key); }

  public Object get(String key, Object def) { Object v = attrs.get(key); return v == null ? def : v; }

  public String str(String key) { Object v = attrs.get(key); return v == null ? null : Support.jsStr(v); }

  public Long longVal(String key) { Object v = attrs.get(key); return v == null ? null : Support.toLong(v, 0); }

  public Boolean bool(String key) { Object v = attrs.get(key); return v == null ? null : castBool(v); }

  public Model set(String key, Object value) { attrs.put(key, value); return this; }

  public Model fill(Map<String, Object> in) {
    for (Map.Entry<String, Object> e : in.entrySet()) {
      if (meta.fillable.isEmpty() || meta.fillable.contains(e.getKey())) attrs.put(e.getKey(), e.getValue());
    }
    return this;
  }

  public Object id() { return attrs.get(meta.primaryKey); }

  public boolean exists() { return exists; }

  public Map<String, Object> attributes() { return attrs; }

  public boolean isDirty() { return !attrs.equals(orig); }

  // ── persistence ──
  public Model save() {
    String ts = Support.sqlNow();
    Conn conn = Database.connection(meta.connectionName);
    if (!exists) {
      if (meta.timestamps) {
        if (attrs.get("created_at") == null) attrs.put("created_at", ts);
        if (attrs.get("updated_at") == null) attrs.put("updated_at", ts);
      }
      Map<String, Object> row = serializeForWrite(new LinkedHashMap<>(attrs));
      Object newId = conn.insert(meta.table, row, meta.primaryKey);
      if (attrs.get(meta.primaryKey) == null && newId != null) attrs.put(meta.primaryKey, newId);
      exists = true;
    } else {
      if (meta.timestamps) attrs.put("updated_at", ts);
      Map<String, Object> row = serializeForWrite(new LinkedHashMap<>(attrs));
      row.remove(meta.primaryKey);
      if (!row.isEmpty()) {
        List<Object> params = new ArrayList<>();
        StringBuilder sets = new StringBuilder();
        for (Map.Entry<String, Object> e : row.entrySet()) {
          if (sets.length() > 0) sets.append(", ");
          sets.append(Database.qi(e.getKey())).append(" = ?");
          params.add(e.getValue());
        }
        params.add(id());
        conn.execute("UPDATE " + Database.qi(meta.table) + " SET " + sets + " WHERE " + Database.qi(meta.primaryKey) + " = ?", params);
      }
    }
    orig = new LinkedHashMap<>(attrs);
    return this;
  }

  public Model update(Map<String, Object> in) {
    fill(in);
    return save();
  }

  public boolean delete() {
    Conn conn = Database.connection(meta.connectionName);
    List<Object> params = new ArrayList<>();
    if (meta.softDeletes) {
      params.add(Support.sqlNow());
      params.add(id());
      conn.execute("UPDATE " + Database.qi(meta.table) + " SET " + Database.qi("deleted_at") + " = ? WHERE " + Database.qi(meta.primaryKey) + " = ?", params);
    } else {
      params.add(id());
      conn.execute("DELETE FROM " + Database.qi(meta.table) + " WHERE " + Database.qi(meta.primaryKey) + " = ?", params);
    }
    exists = false;
    return true;
  }

  public Model fresh() { return newQuery().find(id()); }

  public Model refresh() {
    Model f = fresh();
    if (f != null) { attrs = f.attrs; orig = new LinkedHashMap<>(f.attrs); }
    return this;
  }

  // ── relations (generated models call these) ──
  protected <R> QueryBuilder<R> belongsTo(QueryBuilder<R> related, String fk) {
    return related.where(related.meta().primaryKey, attrs.get(fk));
  }

  protected <R> QueryBuilder<R> hasMany(QueryBuilder<R> related, String fk) {
    return related.where(fk, id());
  }

  // ── hydration / casting ──
  static <M extends Model> M hydrate(ModelMeta meta, Supplier<M> factory, Map<String, Object> row) {
    M m = factory.get();
    m.exists = true;
    m.attrs = castFromDb(meta, row);
    m.orig = new LinkedHashMap<>(m.attrs);
    return m;
  }

  private static boolean castBool(Object v) {
    if (v instanceof Boolean) return (Boolean) v;
    if (v instanceof Number) return ((Number) v).intValue() != 0;
    String s = String.valueOf(v);
    return s.equals("1") || s.equals("t") || s.equalsIgnoreCase("true");
  }

  static Map<String, Object> castFromDb(ModelMeta meta, Map<String, Object> row) {
    Map<String, Object> out = new LinkedHashMap<>();
    for (Map.Entry<String, Object> e : row.entrySet()) {
      String c = meta.casts.get(e.getKey());
      Object v = e.getValue();
      if (v == null || c == null) { out.put(e.getKey(), v); continue; }
      switch (c) {
        case "boolean": out.put(e.getKey(), castBool(v)); break;
        case "integer": out.put(e.getKey(), Support.toLong(v, 0)); break;
        case "float": out.put(e.getKey(), v instanceof Number ? ((Number) v).doubleValue() : Double.parseDouble(String.valueOf(v))); break;
        case "decimal:2": out.put(e.getKey(), String.format(Locale.ROOT, "%.2f", v instanceof Number ? ((Number) v).doubleValue() : Double.parseDouble(String.valueOf(v)))); break;
        case "array": {
          Object parsed = v;
          if (v instanceof String) { try { parsed = Json.parse((String) v); } catch (Json.ParseException ex) { parsed = v; } }
          out.put(e.getKey(), parsed);
          break;
        }
        default: out.put(e.getKey(), v);
      }
    }
    return out;
  }

  static Map<String, Object> serializeForWrite(Map<String, Object> row) {
    for (Map.Entry<String, Object> e : row.entrySet()) {
      Object v = e.getValue();
      if (v instanceof Boolean) e.setValue(Database.isPg() ? v : (Boolean) v ? 1 : 0);
      else if (v instanceof java.time.temporal.TemporalAccessor || v instanceof java.util.Date) e.setValue(Support.sqlTime(v));
      else if (v instanceof BigDecimal) e.setValue(((BigDecimal) v).toPlainString());
      else if (v instanceof Map || v instanceof Iterable) e.setValue(Json.stringify(v));
    }
    return row;
  }

  @Override
  public Object toJson() {
    Map<String, Object> out = new LinkedHashMap<>();
    for (Map.Entry<String, Object> e : attrs.entrySet()) {
      if (meta.hidden.contains(e.getKey())) continue;
      String cast = meta.casts.get(e.getKey());
      if (DATE_COLS.contains(e.getKey()) || "date".equals(cast) || "datetime".equals(cast)) out.put(e.getKey(), Support.toIsoMicro(e.getValue()));
      else out.put(e.getKey(), e.getValue());
    }
    return out;
  }

  @Override
  public String toString() { return getClass().getSimpleName() + attrs; }
}
