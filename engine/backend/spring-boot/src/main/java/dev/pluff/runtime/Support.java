package dev.pluff.runtime;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Shared helpers for the Java runtime (Laravel-like support layer). */
public final class Support {
  private Support() {}

  /** engine/backend/spring-boot (the process is started from there). */
  public static final Path BACKEND_DIR = Paths.get("").toAbsolutePath().normalize();
  /** repo root (arkzen.json lives here). */
  public static final Path REPO_ROOT = findRepoRoot();
  private static final Map<String, String> DOTENV = loadDotenv();

  private static Path findRepoRoot() {
    Path p = BACKEND_DIR;
    for (int i = 0; i < 6 && p != null; i++) {
      if (Files.exists(p.resolve("arkzen.json"))) return p;
      p = p.getParent();
    }
    Path guess = BACKEND_DIR.getParent() != null && BACKEND_DIR.getParent().getParent() != null && BACKEND_DIR.getParent().getParent().getParent() != null
        ? BACKEND_DIR.getParent().getParent().getParent() : BACKEND_DIR;
    return guess;
  }

  private static Map<String, String> loadDotenv() {
    Map<String, String> out = new HashMap<>();
    Path f = BACKEND_DIR.resolve(".env");
    if (!Files.exists(f)) return out;
    try {
      for (String line : Files.readAllLines(f, StandardCharsets.UTF_8)) {
        String t = line.trim();
        if (t.isEmpty() || t.startsWith("#")) continue;
        int i = t.indexOf('=');
        if (i < 1) continue;
        String k = t.substring(0, i).trim();
        String v = t.substring(i + 1).trim();
        if (v.length() >= 2 && ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'")))) v = v.substring(1, v.length() - 1);
        out.put(k, v);
      }
    } catch (IOException ignored) { /* no .env */ }
    return out;
  }

  public static String env(String key, String def) {
    String v = System.getenv(key);
    if (v == null) v = DOTENV.get(key);
    return v == null ? def : v;
  }

  public static String env(String key) { return env(key, null); }

  public static void ensureDir(Path dir) {
    try { Files.createDirectories(dir); } catch (IOException e) { throw new RuntimeException(e); }
  }

  /** 'welcome-mail' / 'welcome_mail' -> 'WelcomeMail'. */
  public static String studly(String s) {
    StringBuilder sb = new StringBuilder();
    for (String w : s.split("[-_\\s]+")) if (!w.isEmpty()) sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1));
    return sb.toString();
  }

  public static String classNameFor(String name, String suffix) {
    String base = studly(name);
    return base.length() > suffix.length() && base.endsWith(suffix) ? base : base + suffix;
  }

  public static String slugToConn(String slug) { return slug.replace('-', '_'); }

  public static String prefixedTable(String slug, String raw) {
    String p = slugToConn(slug);
    return raw.startsWith(p + "_") ? raw : p + "_" + raw;
  }

  /** Insertion-ordered map from alternating key/value args; unlike Map.of it allows null values (used by :java tatemono bodies). */
  public static Map<String, Object> mapOf(Object... kv) {
    if (kv.length % 2 != 0) throw new IllegalArgumentException("mapOf needs key/value pairs");
    Map<String, Object> out = new java.util.LinkedHashMap<>();
    for (int i = 0; i < kv.length; i += 2) out.put(String.valueOf(kv[i]), kv[i + 1]);
    return out;
  }

  public static String lcfirst(String s) { return s.isEmpty() ? s : Character.toLowerCase(s.charAt(0)) + s.substring(1); }

  /** 'JobResult' -> 'job_result'. */
  public static String snake(String s) { return s.replaceAll("(?<!^)(?=[A-Z])", "_").toLowerCase(); }

  private static final DateTimeFormatter SQL_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

  /** 'YYYY-MM-DD HH:mm:ss' in UTC, the format Laravel writes to sqlite. */
  public static String sqlNow() { return SQL_FMT.format(LocalDateTime.now(ZoneOffset.UTC)); }

  public static String sqlTime(Object v) {
    if (v instanceof LocalDateTime) return SQL_FMT.format((LocalDateTime) v);
    if (v instanceof ZonedDateTime) return SQL_FMT.format(((ZonedDateTime) v).withZoneSameInstant(ZoneOffset.UTC));
    if (v instanceof OffsetDateTime) return SQL_FMT.format(((OffsetDateTime) v).withOffsetSameInstant(ZoneOffset.UTC));
    if (v instanceof Instant) return SQL_FMT.format(LocalDateTime.ofInstant((Instant) v, ZoneOffset.UTC));
    if (v instanceof java.util.Date) return SQL_FMT.format(LocalDateTime.ofInstant(((java.util.Date) v).toInstant(), ZoneOffset.UTC));
    return String.valueOf(v);
  }

  private static final Pattern TZ_SUFFIX = Pattern.compile("([zZ]|[+-]\\d\\d:?\\d\\d)$");

  /** Laravel serialises timestamps as 2026-10-30T07:54:06.000000Z */
  public static String toIsoMicro(Object v) {
    if (v == null || "".equals(v)) return null;
    LocalDateTime d;
    try {
      if (v instanceof LocalDateTime) d = (LocalDateTime) v;
      else if (v instanceof LocalDate) d = ((LocalDate) v).atStartOfDay();
      else if (v instanceof Instant) d = LocalDateTime.ofInstant((Instant) v, ZoneOffset.UTC);
      else if (v instanceof ZonedDateTime) d = ((ZonedDateTime) v).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
      else if (v instanceof OffsetDateTime) d = ((OffsetDateTime) v).withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime();
      else {
        String s = String.valueOf(v).trim();
        Matcher m = TZ_SUFFIX.matcher(s);
        if (m.find()) d = OffsetDateTime.parse(s.replace(' ', 'T')).withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime();
        else if (s.length() == 10) d = LocalDate.parse(s).atStartOfDay();
        else d = LocalDateTime.parse(s.replace(' ', 'T'));
      }
    } catch (RuntimeException e) {
      return String.valueOf(v);
    }
    return DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'").format(d);
  }

  public static int toInt(Object v, int def) {
    if (v == null) return def;
    if (v instanceof Number) return ((Number) v).intValue();
    try { return (int) Double.parseDouble(String.valueOf(v).trim()); } catch (NumberFormatException e) { return def; }
  }

  public static long toLong(Object v, long def) {
    if (v == null) return def;
    if (v instanceof Number) return ((Number) v).longValue();
    try { return (long) Double.parseDouble(String.valueOf(v).trim()); } catch (NumberFormatException e) { return def; }
  }

  /** String(v) as JavaScript would print it (whole doubles lose the ".0"). */
  public static String jsStr(Object v) {
    if (v == null) return "";
    if (v instanceof Double || v instanceof Float) {
      double d = ((Number) v).doubleValue();
      if (d == Math.rint(d) && !Double.isInfinite(d)) return String.valueOf((long) d);
    }
    return String.valueOf(v);
  }
}