package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Profile extends Model {
  private static final ModelMeta META = ModelMeta.of("kotoba_profiles", "kotoba", List.of("user_id", "display_name", "bio", "native_lang", "learning_lang", "level", "country", "interests", "avatar_color", "xp", "streak", "best_streak", "last_active", "daily_goal", "words_written", "messages_sent", "onboarded"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("user_id", "integer"), Map.entry("xp", "integer"), Map.entry("streak", "integer"), Map.entry("best_streak", "integer"), Map.entry("last_active", "date"), Map.entry("daily_goal", "integer"), Map.entry("words_written", "integer"), Map.entry("messages_sent", "integer"), Map.entry("onboarded", "boolean")), true, false);
  public Profile() { super(META); }
  @Override protected QueryBuilder<Profile> newQuery() { return QueryBuilder.forModel(META, Profile::new); }
  public static QueryBuilder<Profile> query() { return new Profile().newQuery(); }
  public static Profile find(Object id) { return query().find(id); }
  public static Profile findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Profile> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Profile create(Map<String, Object> values) { return (Profile) new Profile().fill(values).save(); }
}
