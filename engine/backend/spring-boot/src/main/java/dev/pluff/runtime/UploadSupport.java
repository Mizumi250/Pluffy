package dev.pluff.runtime;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

public final class UploadSupport {
  private UploadSupport() {}

  public static List<Map<String, Object>> store(Request request, String slug) throws Exception {
    List<Map<String, Object>> saved = new ArrayList<>();
    Path publicRoot = Support.BACKEND_DIR.resolve("storage").toAbsolutePath().normalize();
    Path moduleRoot = publicRoot.resolve("arkzen").resolve(slug).toAbsolutePath().normalize();
    Files.createDirectories(moduleRoot);

    for (Map<String, Object> file : request.files("files")) {
      Object bytesValue = file.get("bytes");
      if (!(bytesValue instanceof byte[] bytes)) continue;
      String original = sanitizeName(String.valueOf(file.getOrDefault("filename", "file")));
      String extension = extensionOf(original);
      String stored = UUID.randomUUID() + extension;
      Path target = moduleRoot.resolve(stored);
      Files.write(target, bytes);
      String contentType = String.valueOf(file.getOrDefault("contentType", "application/octet-stream"));
      String diskPath = "arkzen/" + slug + "/" + stored;
      boolean image = contentType.toLowerCase(Locale.ROOT).startsWith("image/");
      if (!image && extension.matches("(?i)\\.(png|jpe?g|gif|webp|bmp|svg)$")) image = true;
      Map<String, Object> metadata = new LinkedHashMap<>();
      metadata.put("original_name", original);
      metadata.put("stored_name", stored);
      metadata.put("mime_type", contentType);
      metadata.put("size_bytes", (long) bytes.length);
      metadata.put("disk_path", diskPath);
      metadata.put("is_image", image);
      saved.add(metadata);
    }
    return saved;
  }

  public static String publicUrl(String diskPath) {
    if (diskPath == null) return null;
    String safe = diskPath.replace('\\', '/').replaceAll("^/+|/+", "/");
    return "/storage/" + safe;
  }

  public static void delete(String diskPath) throws Exception {
    if (diskPath == null || diskPath.isBlank()) return;
    Path root = Support.BACKEND_DIR.resolve("storage").toAbsolutePath().normalize();
    Path file = root.resolve(diskPath.replace('\\', '/').replaceAll("^/+|/+", "/")).normalize();
    if (!file.startsWith(root)) throw new SecurityException("Invalid stored file path");
    Files.deleteIfExists(file);
  }

  public static byte[] read(String diskPath) throws Exception {
    if (diskPath == null || diskPath.isBlank()) throw new Errors.HttpException(404, "File not found");
    Path root = Support.BACKEND_DIR.resolve("storage").toAbsolutePath().normalize();
    Path file = root.resolve(diskPath.replace('\\', '/').replaceAll("^/+|/+", "/")).normalize();
    if (!file.startsWith(root) || !Files.isRegularFile(file))
      throw new Errors.HttpException(404, "File not found");
    return Files.readAllBytes(file);
  }

  public static String sanitizeName(String name) {
    String base = Path.of(name.replace('\\', '/')).getFileName().toString();
    return base.replaceAll("[\\r\\n\\x00-\\x1f]", "_").replaceAll("[^A-Za-z0-9._ -]", "_");
  }

  private static String extensionOf(String name) {
    int dot = name.lastIndexOf('.');
    if (dot < 0 || dot == name.length() - 1) return "";
    String ext = name.substring(dot).toLowerCase(Locale.ROOT);
    return ext.matches("\\.[a-z0-9]{1,10}") ? ext : "";
  }
}
