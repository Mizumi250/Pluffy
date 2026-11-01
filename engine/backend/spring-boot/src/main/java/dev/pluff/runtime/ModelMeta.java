package dev.pluff.runtime;

import java.util.List;
import java.util.Map;

/** Static description of a model (what Laravel keeps in $table, $fillable, $casts ...). */
public final class ModelMeta {
  public final String table;
  public final String connectionName;
  public final String primaryKey;
  public final List<String> fillable;
  public final List<String> hidden;
  public final Map<String, String> casts;
  public final boolean timestamps;
  public final boolean softDeletes;

  private ModelMeta(String table, String connectionName, List<String> fillable, List<String> hidden, Map<String, String> casts, boolean timestamps, boolean softDeletes) {
    this.table = table;
    this.connectionName = connectionName;
    this.primaryKey = "id";
    this.fillable = fillable;
    this.hidden = hidden;
    this.casts = casts;
    this.timestamps = timestamps;
    this.softDeletes = softDeletes;
  }

  public static ModelMeta of(String table, String connectionName, List<String> fillable, List<String> hidden, Map<String, String> casts, boolean timestamps, boolean softDeletes) {
    return new ModelMeta(table, connectionName, fillable, hidden, casts, timestamps, softDeletes);
  }
}
