package dev.pluff.generated.scheduler_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class CommandRun extends Model {
  private static final ModelMeta META = ModelMeta.of("scheduler_test_command_runs", "scheduler-test", List.of("command_name", "signature", "exit_code", "output", "triggered_by", "duration_ms"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("exit_code", "integer"), Map.entry("duration_ms", "integer")), true, false);
  public CommandRun() { super(META); }
  @Override protected QueryBuilder<CommandRun> newQuery() { return QueryBuilder.forModel(META, CommandRun::new); }
  public static QueryBuilder<CommandRun> query() { return new CommandRun().newQuery(); }
  public static CommandRun find(Object id) { return query().find(id); }
  public static CommandRun findOrFail(Object id) { return query().findOrFail(id); }
  public static List<CommandRun> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static CommandRun create(Map<String, Object> values) { return (CommandRun) new CommandRun().fill(values).save(); }
}
