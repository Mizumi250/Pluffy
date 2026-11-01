package dev.pluff.runtime;

import java.math.BigDecimal;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Small self-contained JSON reader/writer (no external dependency). Objects keep insertion order. */
public final class Json {
  private Json() {}

  /** Anything that knows how to turn itself into plain maps/lists (models, paginators). */
  public interface Serializable { Object toJson(); }

  // ── writing ──
  public static String stringify(Object v) {
    StringBuilder sb = new StringBuilder();
    write(sb, v);
    return sb.toString();
  }

  @SuppressWarnings("unchecked")
  private static void write(StringBuilder sb, Object v) {
    if (v == null) { sb.append("null"); return; }
    if (v instanceof Serializable) { write(sb, ((Serializable) v).toJson()); return; }
    if (v instanceof String || v instanceof Character || v instanceof Enum) { quote(sb, v.toString()); return; }
    if (v instanceof Boolean) { sb.append(v); return; }
    if (v instanceof Double || v instanceof Float) {
      double d = ((Number) v).doubleValue();
      if (Double.isNaN(d) || Double.isInfinite(d)) sb.append("null");
      else if (d == Math.rint(d) && Math.abs(d) < 1e15) sb.append((long) d);
      else sb.append(v);
      return;
    }
    if (v instanceof BigDecimal) { sb.append(((BigDecimal) v).stripTrailingZeros().toPlainString()); return; }
    if (v instanceof Number) { sb.append(v); return; }
    if (v instanceof Map) {
      sb.append('{');
      boolean first = true;
      for (Map.Entry<Object, Object> e : ((Map<Object, Object>) v).entrySet()) {
        if (!first) sb.append(',');
        first = false;
        quote(sb, String.valueOf(e.getKey()));
        sb.append(':');
        write(sb, e.getValue());
      }
      sb.append('}');
      return;
    }
    if (v instanceof Iterable) {
      sb.append('[');
      boolean first = true;
      for (Object o : (Iterable<Object>) v) {
        if (!first) sb.append(',');
        first = false;
        write(sb, o);
      }
      sb.append(']');
      return;
    }
    if (v instanceof Object[]) {
      sb.append('[');
      Object[] arr = (Object[]) v;
      for (int i = 0; i < arr.length; i++) { if (i > 0) sb.append(','); write(sb, arr[i]); }
      sb.append(']');
      return;
    }
    if (v instanceof java.util.Date) { quote(sb, Support.toIsoMicro(((java.util.Date) v).toInstant())); return; }
    if (v instanceof TemporalAccessor) { quote(sb, Support.toIsoMicro(v)); return; }
    quote(sb, v.toString());
  }

  private static void quote(StringBuilder sb, String s) {
    sb.append('"');
    for (int i = 0; i < s.length(); i++) {
      char c = s.charAt(i);
      switch (c) {
        case '"': sb.append("\\\""); break;
        case '\\': sb.append("\\\\"); break;
        case '\n': sb.append("\\n"); break;
        case '\r': sb.append("\\r"); break;
        case '\t': sb.append("\\t"); break;
        case '\b': sb.append("\\b"); break;
        case '\f': sb.append("\\f"); break;
        default:
          if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
          else sb.append(c);
      }
    }
    sb.append('"');
  }

  // ── reading ──
  public static final class ParseException extends RuntimeException {
    public ParseException(String m) { super(m); }
  }

  /** Parses JSON text. Objects become LinkedHashMap, arrays ArrayList, integers Long, other numbers Double. */
  public static Object parse(String text) {
    Parser p = new Parser(text);
    p.ws();
    Object v = p.value();
    p.ws();
    if (p.i < p.s.length()) throw new ParseException("Unexpected trailing characters at " + p.i);
    return v;
  }

  /** Parses a JSON object; anything else (or invalid JSON) gives an empty map. */
  @SuppressWarnings("unchecked")
  public static Map<String, Object> parseObject(String text) {
    if (text == null || text.isBlank()) return new LinkedHashMap<>();
    try {
      Object v = parse(text);
      return v instanceof Map ? (Map<String, Object>) v : new LinkedHashMap<>();
    } catch (ParseException e) {
      return new LinkedHashMap<>();
    }
  }

  private static final class Parser {
    final String s;
    int i = 0;

    Parser(String s) { this.s = s; }

    void ws() { while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++; }

    Object value() {
      if (i >= s.length()) throw new ParseException("Unexpected end of JSON");
      char c = s.charAt(i);
      if (c == '{') return object();
      if (c == '[') return array();
      if (c == '"') return string();
      if (s.startsWith("true", i)) { i += 4; return Boolean.TRUE; }
      if (s.startsWith("false", i)) { i += 5; return Boolean.FALSE; }
      if (s.startsWith("null", i)) { i += 4; return null; }
      return number();
    }

    Map<String, Object> object() {
      Map<String, Object> m = new LinkedHashMap<>();
      i++;
      ws();
      if (i < s.length() && s.charAt(i) == '}') { i++; return m; }
      while (true) {
        ws();
        if (i >= s.length() || s.charAt(i) != '"') throw new ParseException("Expected string key at " + i);
        String k = string();
        ws();
        if (i >= s.length() || s.charAt(i) != ':') throw new ParseException("Expected ':' at " + i);
        i++;
        ws();
        m.put(k, value());
        ws();
        if (i >= s.length()) throw new ParseException("Unterminated object");
        char c = s.charAt(i++);
        if (c == '}') return m;
        if (c != ',') throw new ParseException("Expected ',' or '}' at " + (i - 1));
      }
    }

    List<Object> array() {
      List<Object> l = new ArrayList<>();
      i++;
      ws();
      if (i < s.length() && s.charAt(i) == ']') { i++; return l; }
      while (true) {
        ws();
        l.add(value());
        ws();
        if (i >= s.length()) throw new ParseException("Unterminated array");
        char c = s.charAt(i++);
        if (c == ']') return l;
        if (c != ',') throw new ParseException("Expected ',' or ']' at " + (i - 1));
      }
    }

    String string() {
      StringBuilder sb = new StringBuilder();
      i++;
      while (i < s.length()) {
        char c = s.charAt(i++);
        if (c == '"') return sb.toString();
        if (c == '\\') {
          if (i >= s.length()) break;
          char e = s.charAt(i++);
          switch (e) {
            case 'n': sb.append('\n'); break;
            case 'r': sb.append('\r'); break;
            case 't': sb.append('\t'); break;
            case 'b': sb.append('\b'); break;
            case 'f': sb.append('\f'); break;
            case 'u':
              if (i + 4 > s.length()) throw new ParseException("Bad unicode escape");
              sb.append((char) Integer.parseInt(s.substring(i, i + 4), 16));
              i += 4;
              break;
            default: sb.append(e);
          }
        } else sb.append(c);
      }
      throw new ParseException("Unterminated string");
    }

    Object number() {
      int st = i;
      while (i < s.length() && "+-0123456789.eE".indexOf(s.charAt(i)) >= 0) i++;
      if (st == i) throw new ParseException("Unexpected character '" + s.charAt(i) + "' at " + i);
      String t = s.substring(st, i);
      try {
        if (t.indexOf('.') < 0 && t.indexOf('e') < 0 && t.indexOf('E') < 0) return Long.parseLong(t);
        return Double.parseDouble(t);
      } catch (NumberFormatException e) {
        throw new ParseException("Bad number '" + t + "'");
      }
    }
  }
}
