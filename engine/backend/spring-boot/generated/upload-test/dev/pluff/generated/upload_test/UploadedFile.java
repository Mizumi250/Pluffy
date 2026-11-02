package dev.pluff.generated.upload_test;
import dev.pluff.runtime.*;
import java.util.*;
import static dev.pluff.runtime.Support.*;
public final class UploadedFile extends Model {
  private static final ModelMeta META = ModelMeta.of("upload_test_uploaded_files", "upload-test", List.of("user_id", "original_name", "stored_name", "mime_type", "size_bytes", "disk_path", "is_image"), List.of(), Map.ofEntries(Map.entry("id", "integer"), Map.entry("user_id", "integer"), Map.entry("size_bytes", "integer"), Map.entry("is_image", "boolean")), true, false);
  public UploadedFile() { super(META); }
  @Override protected QueryBuilder<UploadedFile> newQuery() { return QueryBuilder.forModel(META, UploadedFile::new); }
  public static QueryBuilder<UploadedFile> query() { return new UploadedFile().newQuery(); }
  public static UploadedFile find(Object id) { return query().find(id); }
  public static UploadedFile findOrFail(Object id) { return query().findOrFail(id); }
  public static List<UploadedFile> all() { return query().get(); }
  public static long count() { return query().count(); }
  public static UploadedFile create(Map<String, Object> values) { return (UploadedFile) new UploadedFile().fill(values).save(); }
}
