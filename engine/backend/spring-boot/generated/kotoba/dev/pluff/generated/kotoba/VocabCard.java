package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class VocabCard extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_vocab_cards", "kotoba", List.of("user_id", "lang", "term", "meaning", "example", "source", "ease", "interval_days", "reps", "lapses", "due_date"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("user_id", "integer"), Map.entry("ease", "float"), Map.entry("interval_days", "integer"), Map.entry("reps", "integer"), Map.entry("lapses", "integer"), Map.entry("due_date", "date")), true, false);
  public VocabCard() { super(META); }
  @Override protected QueryBuilder<VocabCard> newQuery() { return QueryBuilder.forModel(META, VocabCard::new); }
  public static QueryBuilder<VocabCard> query() { return new VocabCard().newQuery(); }
  public static VocabCard find(Object id) { return query().find(id); }
  public static VocabCard findOrFail(Object id) { return query().findOrFail(id); }
  public static List<VocabCard> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static VocabCard create(Map<String, Object> values) { return (VocabCard) new VocabCard().fill(values).save(); }
}
