package dev.pluff.generated.dtr_geofencing;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("dtr-geofencing");
    EventDispatcher.unregister("dtr-geofencing");
    CommandRegistry.unregister("dtr-geofencing");
    Router router = new Router("dtr-geofencing");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("GET", "/api/dtr/employees", List.of(), (request, response) -> {
      QueryBuilder<Employee> query = Employee.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("GET", "/api/dtr/records", List.of(), (request, response) -> {
      QueryBuilder<TimeRecord> query = TimeRecord.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/dtr/check-in", List.of(), (request, response) -> {
      Object employeeId = request.input("employee_id");
      Object latitude = request.input("latitude");
      Object longitude = request.input("longitude");
      Object notes = request.input("notes");
      DtrSetting geofenceSetting = DtrSetting.query().where("key", "geofencing_enabled").first();
      boolean geofencingEnabled = geofenceSetting != null && "true".equals(String.valueOf(geofenceSetting.get("value")));
      boolean withinGeofence = true;
      if (geofencingEnabled && latitude != null && longitude != null) {
          DtrSetting officeLatitudeSetting = DtrSetting.query().where("key", "office_latitude").first();
          DtrSetting officeLongitudeSetting = DtrSetting.query().where("key", "office_longitude").first();
          DtrSetting radiusSetting = DtrSetting.query().where("key", "geofence_radius_meters").first();
          Object rawOfficeLatitude = officeLatitudeSetting == null ? null : officeLatitudeSetting.get("value");
          Object rawOfficeLongitude = officeLongitudeSetting == null ? null : officeLongitudeSetting.get("value");
          Object rawRadius = radiusSetting == null ? null : radiusSetting.get("value");
          double officeLatitude = rawOfficeLatitude == null || String.valueOf(rawOfficeLatitude).isBlank() ? 0.0 : Double.parseDouble(String.valueOf(rawOfficeLatitude));
          double officeLongitude = rawOfficeLongitude == null || String.valueOf(rawOfficeLongitude).isBlank() ? 0.0 : Double.parseDouble(String.valueOf(rawOfficeLongitude));
          double radius = rawRadius == null || String.valueOf(rawRadius).isBlank() ? 0.0 : Double.parseDouble(String.valueOf(rawRadius));
          double lat1 = Math.toRadians(officeLatitude);
          double lon1 = Math.toRadians(officeLongitude);
          double lat2 = Math.toRadians(latitude == null || String.valueOf(latitude).isBlank() ? 0.0 : Double.parseDouble(String.valueOf(latitude)));
          double lon2 = Math.toRadians(longitude == null || String.valueOf(longitude).isBlank() ? 0.0 : Double.parseDouble(String.valueOf(longitude)));
          double dlat = lat2 - lat1;
          double dlon = lon2 - lon1;
          double a = Math.pow(Math.sin(dlat / 2), 2)
              + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
          double distance = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0.0, 1.0 - a)));
          withinGeofence = distance <= radius;
          if (!withinGeofence) {
              return response.json(mapOf(
                  "error", "Geofence violation",
                  "message", "You must be within " + radius + " meters of the office to check in.",
                  "distance", Math.round(distance * 10.0) / 10.0
              ), 403);
          }
      }
      TimeRecord record = TimeRecord.create(mapOf(
          "employee_id", employeeId,
          "type", "in",
          "timestamp", sqlNow(),
          "latitude", latitude,
          "longitude", longitude,
          "within_geofence", withinGeofence,
          "notes", notes
      ));
      Map<String, Object> recordJson = Json.parseObject(Json.stringify(record));
      recordJson.put("employee", Employee.find(employeeId));
      return response.json(mapOf(
          "success", true,
          "record", recordJson,
          "within_geofence", withinGeofence,
          "geofencing_enabled", geofencingEnabled
      ));
    });
    router.add("POST", "/api/dtr/check-out", List.of(), (request, response) -> {
      Object employeeId = request.input("employee_id");
      Object latitude = request.input("latitude");
      Object longitude = request.input("longitude");
      Object notes = request.input("notes");
      DtrSetting geofenceSetting = DtrSetting.query().where("key", "geofencing_enabled").first();
      boolean geofencingEnabled = geofenceSetting != null && "true".equals(String.valueOf(geofenceSetting.get("value")));
      boolean withinGeofence = true;
      if (geofencingEnabled && latitude != null && longitude != null) {
          DtrSetting officeLatitudeSetting = DtrSetting.query().where("key", "office_latitude").first();
          DtrSetting officeLongitudeSetting = DtrSetting.query().where("key", "office_longitude").first();
          DtrSetting radiusSetting = DtrSetting.query().where("key", "geofence_radius_meters").first();
          Object rawOfficeLatitude = officeLatitudeSetting == null ? null : officeLatitudeSetting.get("value");
          Object rawOfficeLongitude = officeLongitudeSetting == null ? null : officeLongitudeSetting.get("value");
          Object rawRadius = radiusSetting == null ? null : radiusSetting.get("value");
          double officeLatitude = rawOfficeLatitude == null || String.valueOf(rawOfficeLatitude).isBlank() ? 0.0 : Double.parseDouble(String.valueOf(rawOfficeLatitude));
          double officeLongitude = rawOfficeLongitude == null || String.valueOf(rawOfficeLongitude).isBlank() ? 0.0 : Double.parseDouble(String.valueOf(rawOfficeLongitude));
          double radius = rawRadius == null || String.valueOf(rawRadius).isBlank() ? 0.0 : Double.parseDouble(String.valueOf(rawRadius));
          double lat1 = Math.toRadians(officeLatitude);
          double lon1 = Math.toRadians(officeLongitude);
          double lat2 = Math.toRadians(latitude == null || String.valueOf(latitude).isBlank() ? 0.0 : Double.parseDouble(String.valueOf(latitude)));
          double lon2 = Math.toRadians(longitude == null || String.valueOf(longitude).isBlank() ? 0.0 : Double.parseDouble(String.valueOf(longitude)));
          double dlat = lat2 - lat1;
          double dlon = lon2 - lon1;
          double a = Math.pow(Math.sin(dlat / 2), 2)
              + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
          double distance = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0.0, 1.0 - a)));
          withinGeofence = distance <= radius;
          if (!withinGeofence) {
              return response.json(mapOf(
                  "error", "Geofence violation",
                  "message", "You must be within " + radius + " meters of the office to check out.",
                  "distance", Math.round(distance * 10.0) / 10.0
              ), 403);
          }
      }
      TimeRecord record = TimeRecord.create(mapOf(
          "employee_id", employeeId,
          "type", "out",
          "timestamp", sqlNow(),
          "latitude", latitude,
          "longitude", longitude,
          "within_geofence", withinGeofence,
          "notes", notes
      ));
      Map<String, Object> recordJson = Json.parseObject(Json.stringify(record));
      recordJson.put("employee", Employee.find(employeeId));
      return response.json(mapOf(
          "success", true,
          "record", recordJson,
          "within_geofence", withinGeofence,
          "geofencing_enabled", geofencingEnabled
      ));
    });
    router.add("GET", "/api/dtr/settings", List.of(), (request, response) -> {
      QueryBuilder<DtrSetting> query = DtrSetting.query();
      return response.json(query.orderBy("created_at", "desc").paginate(request.input("per_page", 15), request.input("page", 1), request.url()));
    });
    router.add("POST", "/api/dtr/settings/toggle-geofencing", List.of(), (request, response) -> {
      Object enabledValue = request.input("enabled");
      boolean enabled = !(enabledValue == null || Boolean.FALSE.equals(enabledValue)
          || enabledValue instanceof Number && ((Number) enabledValue).doubleValue() == 0.0
          || enabledValue instanceof String && ("".equals(enabledValue) || "0".equals(enabledValue)));
      DtrSetting geofencingSetting = DtrSetting.query().where("key", "geofencing_enabled").first();
      if (geofencingSetting == null) {
          DtrSetting.create(mapOf("key", "geofencing_enabled", "value", enabled ? "true" : "false"));
      } else {
          geofencingSetting.update(mapOf("value", enabled ? "true" : "false"));
      }
      return response.json(mapOf("success", true, "geofencing_enabled", enabledValue));
    });
    router.add("POST", "/api/dtr/settings/office", List.of(), (request, response) -> {
      String[] settingKeys = {"office_latitude", "office_longitude", "geofence_radius_meters"};
      String[] inputKeys = {"lat", "lng", "radius"};
      for (int i = 0; i < settingKeys.length; i++) {
          Object inputValue = request.input(inputKeys[i]);
          String value = inputValue == null ? "" : String.valueOf(inputValue);
          DtrSetting setting = DtrSetting.query().where("key", settingKeys[i]).first();
          if (setting == null) {
              DtrSetting.create(mapOf("key", settingKeys[i], "value", value));
          } else {
              setting.update(mapOf("value", value));
          }
      }
      return response.json(mapOf("success", true));
    });
    router.add("GET", "/api/dtr/employees/{id}", List.of(), (request, response) -> {
      Employee employee = Employee.findOrFail(request.route("id"));
      return response.json(employee);
    });
    router.add("GET", "/api/dtr/my-records/{employee_id}", List.of(), (request, response) -> {
      Object employeeId = request.route("employee_id");
      List<TimeRecord> records = TimeRecord.query()
          .where("employee_id", employeeId)
          .orderBy("timestamp", "desc")
          .take(50)
          .get();
      List<Map<String, Object>> results = new ArrayList<>();
      for (TimeRecord record : records) {
          Map<String, Object> row = Json.parseObject(Json.stringify(record));
          row.put("employee", Employee.find(record.get("employee_id")));
          results.add(row);
      }
      return response.json(results);
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
  private static Notification notificationFor(String name) {
    return switch (name) {
      default -> null;
    };
  }
  private static Map<String, Object> objectMap(Object value) {
    Map<String, Object> out = new LinkedHashMap<>();
    if (value instanceof Map<?, ?> values) values.forEach((key, item) -> out.put(String.valueOf(key), item));
    return out;
  }
}
