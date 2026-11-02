package dev.pluff.generated.clinic_appointment_booking;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class Patient extends Model {
  private static final ModelMeta META = ModelMeta.of("clinic_appointment_booking_patients", "clinic-appointment-booking", List.of("first_name", "last_name", "email", "phone_number"), List.of(), Map.ofEntries(Map.entry("id", "integer")), true, false);
  public Patient() { super(META); }
  @Override protected QueryBuilder<Patient> newQuery() { return QueryBuilder.forModel(META, Patient::new); }
  public static QueryBuilder<Patient> query() { return new Patient().newQuery(); }
  public static Patient find(Object id) { return query().find(id); }
  public static Patient findOrFail(Object id) { return query().findOrFail(id); }
  public static List<Patient> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static Patient create(Map<String, Object> values) { return (Patient) new Patient().fill(values).save(); }
}
