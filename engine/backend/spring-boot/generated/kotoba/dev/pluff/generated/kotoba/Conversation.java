package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Conversation extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_conversations", "kotoba", List.of("user_a", "user_b", "last_message", "last_at"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("user_a", "integer"), Map.entry("user_b", "integer"), Map.entry("last_at", "datetime")), true, false);
  public Conversation() { super(META); }
  @Override protected QueryBuilder<Conversation> newQuery() { return QueryBuilder.forModel(META, Conversation::new); }
  public static QueryBuilder<Conversation> query() { return new Conversation().newQuery(); }
  public static Conversation find(Object id) { return query().find(id); }
  public static Conversation findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Conversation> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Conversation create(Map<String, Object> values) { return (Conversation) new Conversation().fill(values).save(); }
}
