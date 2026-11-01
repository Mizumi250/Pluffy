package dev.pluff.runtime;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

/** Laravel-style validation: 'required|string|max:255', arrays, wildcards, unique/exists. Same messages as Laravel. */
public final class Validator {
  private Validator() {}

  private static final Object MISSING = new Object();
  private static final Map<String, String> MSG = new HashMap<>();

  static {
    MSG.put("required", "The :attribute field is required.");
    MSG.put("string", "The :attribute field must be a string.");
    MSG.put("integer", "The :attribute field must be an integer.");
    MSG.put("numeric", "The :attribute field must be a number.");
    MSG.put("boolean", "The :attribute field must be true or false.");
    MSG.put("email", "The :attribute field must be a valid email address.");
    MSG.put("url", "The :attribute field must be a valid URL.");
    MSG.put("array", "The :attribute field must be an array.");
    MSG.put("date", "The :attribute field must be a valid date.");
    MSG.put("json", "The :attribute field must be a valid JSON string.");
    MSG.put("uuid", "The :attribute field must be a valid UUID.");
    MSG.put("alpha", "The :attribute field must only contain letters.");
    MSG.put("alpha_num", "The :attribute field must only contain letters and numbers.");
    MSG.put("alpha_dash", "The :attribute field must only contain letters, numbers, dashes, and underscores.");
    MSG.put("in", "The selected :attribute is invalid.");
    MSG.put("not_in", "The selected :attribute is invalid.");
    MSG.put("exists", "The selected :attribute is invalid.");
    MSG.put("unique", "The :attribute has already been taken.");
    MSG.put("regex", "The :attribute field format is invalid.");
    MSG.put("confirmed", "The :attribute field confirmation does not match.");
    MSG.put("same", "The :attribute field and :other must match.");
    MSG.put("different", "The :attribute field and :other must be different.");
    MSG.put("accepted", "The :attribute field must be accepted.");
    MSG.put("filled", "The :attribute field must have a value.");
    MSG.put("digits", "The :attribute field must be :digits digits.");
    MSG.put("ip", "The :attribute field must be a valid IP address.");
    MSG.put("file", "The :attribute field must be a file.");
    MSG.put("image", "The :attribute field must be an image.");
    MSG.put("mimes", "The :attribute field must be a file of type: :values.");
  }

  private static final Pattern UUID = Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", Pattern.CASE_INSENSITIVE);
  private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
  private static final Pattern IP = Pattern.compile("^(\\d{1,3}\\.){3}\\d{1,3}$|^[0-9a-f:]+$", Pattern.CASE_INSENSITIVE);

  private static final class Ctx {
    Map<String, Object> data;
    Conn db;
    String slug;
  }

  private static String attr(String k) { return k.replace(".*", "").replace("_", " ").replace(".", " "); }

  private static boolean isEmpty(Object v) {
    return v == MISSING || v == null || (v instanceof String && ((String) v).trim().isEmpty()) || (v instanceof List && ((List<?>) v).isEmpty());
  }

  @SuppressWarnings("unchecked")
  private static Object getPath(Object o, String p) {
    Object cur = o;
    for (String k : p.split("\\.")) {
      if (cur == MISSING || cur == null) return MISSING;
      if (cur instanceof Map) {
        Map<String, Object> m = (Map<String, Object>) cur;
        if (!m.containsKey(k)) return MISSING;
        cur = m.get(k);
      } else if (cur instanceof List) {
        try {
          int i = Integer.parseInt(k);
          List<Object> l = (List<Object>) cur;
          if (i < 0 || i >= l.size()) return MISSING;
          cur = l.get(i);
        } catch (NumberFormatException e) {
          return MISSING;
        }
      } else return MISSING;
    }
    return cur;
  }

  private static Map<String, Object> expand(Map<String, ?> rules, Object data) {
    Map<String, Object> out = new LinkedHashMap<>();
    for (Map.Entry<String, ?> e : rules.entrySet()) {
      if (!e.getKey().contains("*")) { out.put(e.getKey(), e.getValue()); continue; }
      walk(out, "", new ArrayList<>(Arrays.asList(e.getKey().split("\\."))), data, e.getValue());
    }
    return out;
  }

  @SuppressWarnings("unchecked")
  private static void walk(Map<String, Object> out, String prefix, List<String> rest, Object cur, Object rule) {
    if (rest.isEmpty()) { out.put(prefix, rule); return; }
    String head = rest.get(0);
    List<String> tail = rest.subList(1, rest.size());
    if (head.equals("*")) {
      if (cur instanceof List) {
        List<Object> l = (List<Object>) cur;
        for (int i = 0; i < l.size(); i++) walk(out, prefix.isEmpty() ? String.valueOf(i) : prefix + "." + i, new ArrayList<>(tail), l.get(i), rule);
      }
    } else {
      Object nxt = cur instanceof Map ? ((Map<String, Object>) cur).get(head) : null;
      walk(out, prefix.isEmpty() ? head : prefix + "." + head, new ArrayList<>(tail), nxt, rule);
    }
  }

  private static boolean isNumberLike(Object v) {
    if (v == null || v instanceof Boolean) return false;
    if (v instanceof Number) return true;
    String s = String.valueOf(v).trim();
    if (s.isEmpty()) return false;
    try { Double.parseDouble(s); return true; } catch (NumberFormatException e) { return false; }
  }

  private static double toNum(Object v) {
    if (v instanceof Number) return ((Number) v).doubleValue();
    try { return Double.parseDouble(String.valueOf(v).trim()); } catch (NumberFormatException e) { return Double.NaN; }
  }

  @SuppressWarnings("unchecked")
  private static double sizeOf(Object v, boolean numeric) {
    if (v instanceof Number) return ((Number) v).doubleValue();
    if (numeric && isNumberLike(v)) return toNum(v);
    if (v instanceof List) return ((List<?>) v).size();
    if (v instanceof Map && ((Map<String, Object>) v).containsKey("size")) return Math.round(toNum(((Map<String, Object>) v).get("size")) / 1024);
    return Support.jsStr(v).length();
  }

  @SuppressWarnings("unchecked")
  private static String sizeMsg(String rule, Object v, boolean numeric, String key, String[] p) {
    String kind;
    if (v instanceof List) kind = "array";
    else if (v instanceof Number || numeric) kind = "numeric";
    else if (v instanceof Map && ((Map<String, Object>) v).containsKey("size")) kind = "file";
    else kind = "string";
    String unit = kind.equals("numeric") ? "" : kind.equals("string") ? " characters" : kind.equals("array") ? " items" : " kilobytes";
    String a = attr(key);
    switch (rule) {
      case "min": return "The " + a + " field must be at least " + p[0] + unit + ".";
      case "max": return "The " + a + " field must not be greater than " + p[0] + unit + ".";
      case "size": return "The " + a + " field must be " + p[0] + unit + ".";
      case "between": return "The " + a + " field must be between " + p[0] + " and " + p[1] + unit + ".";
      default: return "";
    }
  }

  private static boolean parsesAsDate(String s) {
    String t = s.trim();
    try { LocalDate.parse(t); return true; } catch (RuntimeException ignored) { /* try next */ }
    try { LocalDateTime.parse(t.replace(' ', 'T')); return true; } catch (RuntimeException ignored) { /* try next */ }
    try { OffsetDateTime.parse(t.replace(' ', 'T')); return true; } catch (RuntimeException ignored) { /* try next */ }
    for (String f : new String[] {"yyyy/MM/dd", "MM/dd/yyyy", "dd-MM-yyyy", "MMM d, yyyy", "MMMM d, yyyy"}) {
      try { LocalDate.parse(t, DateTimeFormatter.ofPattern(f, Locale.ENGLISH)); return true; } catch (RuntimeException ignored) { /* try next */ }
    }
    return false;
  }

  private static String fail(String rule, String key) {
    return MSG.getOrDefault(rule, "The :attribute field is invalid.").replace(":attribute", attr(key));
  }

  @SuppressWarnings("unchecked")
  private static String check(String rule, String[] p, Object v, String key, Ctx ctx, boolean numeric) {
    String sv = Support.jsStr(v);
    switch (rule) {
      case "string": return v instanceof String ? null : fail(rule, key);
      case "integer": {
        if (v instanceof Boolean) return fail(rule, key);
        boolean ok = v instanceof Number ? ((Number) v).doubleValue() == Math.rint(((Number) v).doubleValue()) : sv.matches("-?\\d+");
        return ok ? null : fail(rule, key);
      }
      case "numeric": return isNumberLike(v) ? null : fail(rule, key);
      case "boolean": {
        boolean ok = v instanceof Boolean
            || (v instanceof Number && (((Number) v).doubleValue() == 0 || ((Number) v).doubleValue() == 1))
            || (v instanceof String && Arrays.asList("1", "0", "true", "false").contains(v));
        return ok ? null : fail(rule, key);
      }
      case "accepted": {
        boolean ok = Boolean.TRUE.equals(v) || (v instanceof Number && ((Number) v).doubleValue() == 1)
            || (v instanceof String && Arrays.asList("yes", "on", "1", "true").contains(v));
        return ok ? null : fail(rule, key);
      }
      case "email": return EMAIL.matcher(sv).matches() ? null : fail(rule, key);
      case "url": {
        try {
          URI u = new URI(sv);
          return u.getScheme() != null && (u.getHost() != null || (u.getPath() != null && !u.getPath().isEmpty()) || u.getSchemeSpecificPart() != null) ? null : fail(rule, key);
        } catch (Exception e) {
          return fail(rule, key);
        }
      }
      case "array": return v instanceof List || v instanceof Map ? null : fail(rule, key);
      case "date": return parsesAsDate(sv) ? null : fail(rule, key);
      case "json": {
        try { Json.parse(sv); return null; } catch (Json.ParseException e) { return fail(rule, key); }
      }
      case "uuid": return UUID.matcher(sv).matches() ? null : fail(rule, key);
      case "alpha": return sv.matches("[A-Za-z]+") ? null : fail(rule, key);
      case "alpha_num": return sv.matches("[A-Za-z0-9]+") ? null : fail(rule, key);
      case "alpha_dash": return sv.matches("[A-Za-z0-9_-]+") ? null : fail(rule, key);
      case "ip": return IP.matcher(sv).matches() ? null : fail(rule, key);
      case "digits": return sv.matches("\\d{" + Support.toInt(p[0], 0) + "}") ? null : fail(rule, key).replace(":digits", p[0]);
      case "min": return sizeOf(v, numeric) >= toNum(p[0]) ? null : sizeMsg("min", v, numeric, key, p);
      case "max": return sizeOf(v, numeric) <= toNum(p[0]) ? null : sizeMsg("max", v, numeric, key, p);
      case "size": return sizeOf(v, numeric) == toNum(p[0]) ? null : sizeMsg("size", v, numeric, key, p);
      case "between": {
        double n = sizeOf(v, numeric);
        return n >= toNum(p[0]) && n <= toNum(p[1]) ? null : sizeMsg("between", v, numeric, key, p);
      }
      case "gt": case "gte": case "lt": case "lte": {
        double other = isNumberLike(p[0]) ? toNum(p[0]) : toNum(getPath(ctx.data, p[0]));
        double n = toNum(v);
        boolean ok = rule.equals("gt") ? n > other : rule.equals("gte") ? n >= other : rule.equals("lt") ? n < other : n <= other;
        String word = rule.equals("gt") ? "greater than" : rule.equals("gte") ? "greater than or equal to" : rule.equals("lt") ? "less than" : "less than or equal to";
        return ok ? null : "The " + attr(key) + " field must be " + word + " " + p[0] + ".";
      }
      case "in": return Arrays.asList(p).contains(sv) ? null : fail(rule, key);
      case "not_in": return !Arrays.asList(p).contains(sv) ? null : fail(rule, key);
      case "regex": {
        Matcher m = Pattern.compile("^/(.*)/([a-z]*)$", Pattern.DOTALL).matcher(String.join(",", p));
        if (!m.matches()) return fail(rule, key);
        int flags = (m.group(2).contains("i") ? Pattern.CASE_INSENSITIVE : 0) | (m.group(2).contains("m") ? Pattern.MULTILINE : 0) | (m.group(2).contains("s") ? Pattern.DOTALL : 0);
        try { return Pattern.compile(m.group(1), flags).matcher(sv).find() ? null : fail(rule, key); } catch (PatternSyntaxException e) { return fail(rule, key); }
      }
      case "confirmed": {
        Object other = ctx.data.get(key + "_confirmation");
        return java.util.Objects.equals(Support.jsStr(v), Support.jsStr(other)) && other != null ? null : fail(rule, key);
      }
      case "same": {
        Object other = getPath(ctx.data, p[0]);
        return other != MISSING && java.util.Objects.equals(v, other) ? null : fail(rule, key).replace(":other", p[0]);
      }
      case "different": {
        Object other = getPath(ctx.data, p[0]);
        return !java.util.Objects.equals(v, other) ? null : fail(rule, key).replace(":other", p[0]);
      }
      case "file": return v instanceof Map && ((Map<String, Object>) v).containsKey("size") ? null : fail(rule, key);
      case "image": return v instanceof Map && String.valueOf(((Map<String, Object>) v).get("mimetype")).startsWith("image/") ? null : fail(rule, key);
      case "mimes": case "mimetypes": {
        if (!(v instanceof Map)) return fail("mimes", key).replace(":values", String.join(", ", p));
        Map<String, Object> f = (Map<String, Object>) v;
        String name = String.valueOf(f.getOrDefault("originalname", ""));
        String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1).toLowerCase() : "";
        return Arrays.asList(p).contains(ext) || Arrays.asList(p).contains(String.valueOf(f.get("mimetype"))) ? null : fail("mimes", key).replace(":values", String.join(", ", p));
      }
      case "unique": {
        if (ctx.db == null) return null;
        String col = p.length > 1 && !p[1].isEmpty() ? p[1] : key.substring(key.lastIndexOf('.') + 1);
        String ignore = p.length > 2 ? p[2] : null;
        String idCol = p.length > 3 ? p[3] : "id";
        QueryBuilder<Map<String, Object>> q = ctx.db.table(resolveTable(ctx, p[0])).where(col, v);
        if (ignore != null && !ignore.equals("NULL")) q.where(idCol, "!=", ignore);
        return q.first() != null ? fail(rule, key) : null;
      }
      case "exists": {
        if (ctx.db == null) return null;
        String col = p.length > 1 && !p[1].isEmpty() ? p[1] : key.substring(key.lastIndexOf('.') + 1);
        return ctx.db.table(resolveTable(ctx, p[0])).where(col, v).first() != null ? null : fail(rule, key);
      }
      default: return null;
    }
  }

  private static String resolveTable(Ctx ctx, String table) {
    String t = table.contains("\\") ? table.substring(table.lastIndexOf('\\') + 1).toLowerCase() + "s" : table;
    if (ctx.db.hasTable(t)) return t;
    return ctx.slug != null ? Support.slugToConn(ctx.slug) + "_" + t : t;
  }

  @SuppressWarnings("unchecked")
  private static void setPath(Map<String, Object> root, String key, Object v) {
    String[] parts = key.split("\\.");
    Object cur = root;
    for (int i = 0; i < parts.length; i++) {
      boolean last = i == parts.length - 1;
      boolean nextIsIdx = !last && parts[i + 1].matches("\\d+");
      if (cur instanceof List) {
        List<Object> l = (List<Object>) cur;
        int idx = Integer.parseInt(parts[i]);
        while (l.size() <= idx) l.add(null);
        if (last) l.set(idx, v);
        else {
          if (l.get(idx) == null) l.set(idx, nextIsIdx ? new ArrayList<Object>() : new LinkedHashMap<String, Object>());
          cur = l.get(idx);
        }
      } else {
        Map<String, Object> m = (Map<String, Object>) cur;
        if (last) m.put(parts[i], v);
        else {
          if (m.get(parts[i]) == null) m.put(parts[i], nextIsIdx ? new ArrayList<Object>() : new LinkedHashMap<String, Object>());
          cur = m.get(parts[i]);
        }
      }
    }
  }

  public static Map<String, Object> validate(Map<String, Object> data, Map<String, ?> rules) { return validate(data, rules, null, null, null); }

  /** Returns only the keys that have rules (like Laravel's validated()). Throws ValidationException (422). */
  public static Map<String, Object> validate(Map<String, Object> data, Map<String, ?> rules, Conn db, String slug, Map<String, String> messages) {
    Map<String, String> msgs = messages == null ? new HashMap<>() : messages;
    Ctx ctx = new Ctx();
    ctx.data = new LinkedHashMap<>(data);
    ctx.db = db;
    ctx.slug = slug;
    Map<String, List<String>> errors = new LinkedHashMap<>();
    Map<String, Object> validated = new LinkedHashMap<>();

    for (Map.Entry<String, Object> entry : expand(rules, ctx.data).entrySet()) {
      String key = entry.getKey();
      Object spec = entry.getValue();
      List<String> list = new ArrayList<>();
      if (spec instanceof Iterable) for (Object o : (Iterable<?>) spec) list.add(String.valueOf(o));
      else list.addAll(Arrays.asList(String.valueOf(spec).split("\\|")));
      list.removeIf(String::isEmpty);

      List<String> names = new ArrayList<>();
      List<String[]> params = new ArrayList<>();
      for (String r : list) {
        int i = r.indexOf(':');
        names.add(i == -1 ? r : r.substring(0, i));
        params.add(i == -1 ? new String[0] : r.substring(i + 1).split(",", -1));
      }
      Object v = getPath(ctx.data, key);

      if (names.contains("sometimes") && v == MISSING) continue;
      boolean missing = isEmpty(v);
      int ri = names.indexOf("required_if");
      boolean mustHave = names.contains("required")
          || (ri >= 0 && params.get(ri).length > 1 && Support.jsStr(getPath(ctx.data, params.get(ri)[0])).equals(params.get(ri)[1]));
      if (missing) {
        if (mustHave) errors.computeIfAbsent(key, k -> new ArrayList<>()).add(msgs.containsKey(key + ".required") ? msgs.get(key + ".required") : MSG.get("required").replace(":attribute", attr(key)));
        else if (names.contains("filled") && v != MISSING) errors.computeIfAbsent(key, k -> new ArrayList<>()).add(MSG.get("filled").replace(":attribute", attr(key)));
        continue;
      }
      boolean numeric = names.contains("numeric") || names.contains("integer");
      for (int i = 0; i < names.size(); i++) {
        String n = names.get(i);
        if (n.equals("required") || n.equals("nullable") || n.equals("sometimes") || n.equals("bail") || n.equals("filled") || n.equals("required_if")) continue;
        String m = check(n, params.get(i), v, key, ctx, numeric);
        if (m != null) {
          errors.computeIfAbsent(key, k -> new ArrayList<>()).add(msgs.containsKey(key + "." + n) ? msgs.get(key + "." + n) : m);
          if (names.contains("bail")) break;
        }
      }
      if (!errors.containsKey(key)) setPath(validated, key, v == MISSING ? null : v);
    }
    if (!errors.isEmpty()) throw new Errors.ValidationException(errors);
    return validated;
  }
}
