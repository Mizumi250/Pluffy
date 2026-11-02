package dev.pluff.generated.broadcast_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Message extends Model {
  private static final ModelMeta META = ModelMeta.of("broadcast_test_messages", "broadcast-test", List.of("content", "channel_type"), List.of(), Map.ofEntries(Map.entry("id", "integer")), true, false);
  public Message() { super(META); }
  @Override protected QueryBuilder<Message> newQuery() { return QueryBuilder.forModel(META, Message::new); }
  public static QueryBuilder<Message> query() { return new Message().newQuery(); }
  public static Message find(Object id) { return query().find(id); }
  public static Message findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Message> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Message create(Map<String, Object> values) { return (Message) new Message().fill(values).save(); }
}
