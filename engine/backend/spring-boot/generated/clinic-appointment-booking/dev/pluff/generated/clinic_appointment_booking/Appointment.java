package dev.pluff.generated.clinic_appointment_booking;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Appointment extends Model {
  private static final ModelMeta META = ModelMeta.of("clinic_appointment_booking_appointments", "clinic-appointment-booking", List.of("patient_id", "doctor_name", "date_time", "status"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("patient_id", "integer"), Map.entry("date_time", "datetime")), true, false);
  public Appointment() { super(META); }
  @Override protected QueryBuilder<Appointment> newQuery() { return QueryBuilder.forModel(META, Appointment::new); }
  public static QueryBuilder<Appointment> query() { return new Appointment().newQuery(); }
  public static Appointment find(Object id) { return query().find(id); }
  public static Appointment findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Appointment> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Appointment create(Map<String, Object> values) { return (Appointment) new Appointment().fill(values).save(); }
}
