package dev.pluff.generated.clinic_appointment_booking;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    Router router = new Router("clinic-appointment-booking");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/clinic-appointment-booking/patients", List.of(), (request, response) -> {
      QueryBuilder<Patient> query = Patient.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/clinic-appointment-booking/patients", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("first_name", "required|string|max:255", "last_name", "required|string|max:255", "email", "required|email|unique:patients,email", "phone_number", "sometimes|string|max:15"));
      Patient created = Patient.create(validated);
      return response.json(created, 201);
    });
    router.add("GET", "/api/clinic-appointment-booking/appointments", List.of(), (request, response) -> {
      QueryBuilder<Appointment> query = Appointment.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/clinic-appointment-booking/appointments", List.of(), (request, response) -> {
      Map<String, Object> validated = request.validate(Support.mapOf("patient_id", "required|integer|exists:patients,id", "doctor_name", "required|string|max:255", "date_time", "required|date_format:Y-m-d H:i:s", "status", "sometimes|string|in:pending,completed,cancelled"));
      Appointment created = Appointment.create(validated);
      return response.json(created, 201);
    });
    router.add("PUT", "/api/clinic-appointment-booking/patients/{id}", List.of(), (request, response) -> {
      Patient patient = Patient.findOrFail(request.route("id"));
      Map<String, Object> validated = request.validate(Support.mapOf("first_name", "sometimes|string|max:255", "last_name", "sometimes|string|max:255", "email", "sometimes|email|unique:patients,email", "phone_number", "sometimes|string|max:15"));
      patient.update(validated);
      return response.json(patient);
    });
    router.add("DELETE", "/api/clinic-appointment-booking/patients/{id}", List.of(), (request, response) -> {
      Patient patient = Patient.findOrFail(request.route("id"));
      patient.delete();
      return response.json(mapOf("message", "Deleted successfully"));
    });
    router.add("PUT", "/api/clinic-appointment-booking/appointments/{id}", List.of(), (request, response) -> {
      Appointment appointment = Appointment.findOrFail(request.route("id"));
      Map<String, Object> validated = request.validate(Support.mapOf("doctor_name", "nullable|string|max:255", "date_time", "nullable|date_format:Y-m-d H:i:s", "status", "nullable|string|in:pending,completed,cancelled"));
      appointment.update(validated);
      return response.json(appointment);
    });
    router.add("DELETE", "/api/clinic-appointment-booking/appointments/{id}", List.of(), (request, response) -> {
      Appointment appointment = Appointment.findOrFail(request.route("id"));
      appointment.delete();
      return response.json(mapOf("message", "Deleted successfully"));
    });
    return router;
  }
  private static Map<String, Map<String, Object>> mailTemplates() {
    Map<String, Map<String, Object>> templates = new LinkedHashMap<>();
    return templates;
  }
  private static Router.Middleware customMiddleware(String name) {
    throw new IllegalArgumentException("Unknown middleware: " + name);
  }
}
