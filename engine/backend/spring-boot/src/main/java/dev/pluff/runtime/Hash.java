package dev.pluff.runtime;

import org.mindrot.jbcrypt.BCrypt;

/** Laravel's Hash facade: bcrypt, cost 12 like Laravel's default. Accepts Laravel's $2y$ hashes. */
public final class Hash {
  private Hash() {}

  public static String make(String plain) { return BCrypt.hashpw(plain, BCrypt.gensalt(12)); }

  public static boolean check(String plain, String hashed) {
    if (plain == null || hashed == null || hashed.isEmpty()) return false;
    String h = hashed.startsWith("$2y$") || hashed.startsWith("$2b$") ? "$2a$" + hashed.substring(4) : hashed;
    try { return BCrypt.checkpw(plain, h); } catch (IllegalArgumentException e) { return false; }
  }
}
