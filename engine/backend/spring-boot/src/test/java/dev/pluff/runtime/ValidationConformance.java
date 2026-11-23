package dev.pluff.runtime;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Runs the shared validation vectors (engine/backend/conformance/validation-vectors.json)
 * against {@link Validator}. Plain main() so it needs no test framework:
 *
 *   javac -d out -sourcepath src/main/java src/test/java/dev/pluff/runtime/ValidationConformance.java
 *   java -cp out dev.pluff.runtime.ValidationConformance src/test/resources/validation-vectors.json
 */
public final class ValidationConformance {
  public static void main(String[] args) throws Exception {
    String raw = Files.readString(Path.of(args.length > 0 ? args[0] : "src/test/resources/validation-vectors.json"));
    Object parsed = Json.parse(raw);
    List<?> vectors = (List<?>) parsed;
    int bad = 0;
    for (Object item : vectors) {
      Map<?, ?> vector = (Map<?, ?>) item;
      Map<String, Object> data = new HashMap<>();
      if (vector.get("data") instanceof Map<?, ?> extra) for (Map.Entry<?, ?> e : extra.entrySet()) data.put(String.valueOf(e.getKey()), e.getValue());
      if (vector.containsKey("value")) data.put("field", vector.get("value"));
      boolean expected = Boolean.TRUE.equals(vector.get("pass"));
      boolean passed;
      try {
        Validator.validate(data, Map.of("field", String.valueOf(vector.get("rule"))));
        passed = true;
      } catch (Errors.ValidationException e) {
        passed = false;
      }
      if (passed != expected) {
        bad++;
        System.out.println("MISMATCH rule=" + vector.get("rule") + " value=" + (vector.containsKey("value") ? vector.get("value") : "<missing>") + " data=" + vector.get("data") + " expected pass=" + expected);
      }
    }
    System.out.println("spring: " + (vectors.size() - bad) + "/" + vectors.size() + " vectors agree");
    if (bad > 0) System.exit(1);
  }
}
