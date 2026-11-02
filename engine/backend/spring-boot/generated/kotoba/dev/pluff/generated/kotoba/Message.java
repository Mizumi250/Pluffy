package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Message extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_messages", "kotoba", List.of("conversation_id", "circle_id", "sender_id", "sender_name", "sender_color", "body", "lang", "corrected", "note", "corrected_by"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("conversation_id", "integer"), Map.entry("circle_id", "integer"), Map.entry("sender_id", "integer"), Map.entry("corrected_by", "integer")), true, false);
  public Message() { super(META); }
  @Override protected QueryBuilder<Message> newQuery() { return QueryBuilder.forModel(META, Message::new); }
  public static QueryBuilder<Message> query() { return new Message().newQuery(); }
  public static Message find(Object id) { return query().find(id); }
  public static Message findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Message> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Message create(Map<String, Object> values) { return (Message) new Message().fill(values).save(); }
}
