package dev.pluff.runtime;

import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.util.Map;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class Mail {
  private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{\\s*\\$?([a-zA-Z0-9_.-]+)\\s*}}|\\{!!\\s*\\$?([a-zA-Z0-9_.-]+)\\s*!!}");

  private Mail() {}

  public static Map<String, Object> send(String to, Map<String, Object> config, Map<String, Object> data) {
    String subject = String.valueOf(config.getOrDefault("subject", "Mail"));
    String template = String.valueOf(config.getOrDefault("template", ""));
    String html = render(template, data);
    if (!"smtp".equalsIgnoreCase(Support.env("MAIL_MAILER", "log"))) {
      Log.info("[mail:log] to=" + to + " subject=\"" + subject + "\"");
      return Support.mapOf("to", to, "subject", subject);
    }

    try {
      JavaMailSenderImpl sender = new JavaMailSenderImpl();
      sender.setHost(Support.env("MAIL_HOST", "127.0.0.1"));
      sender.setPort(Support.toInt(Support.env("MAIL_PORT", "587"), 587));
      String username = Support.env("MAIL_USERNAME", "");
      if (!username.isBlank()) {
        sender.setUsername(username);
        sender.setPassword(Support.env("MAIL_PASSWORD", ""));
      }
      Properties properties = sender.getJavaMailProperties();
      properties.put("mail.smtp.auth", String.valueOf(!username.isBlank()));
      properties.put("mail.smtp.starttls.enable", String.valueOf(!username.isBlank()));
      properties.put("mail.smtp.connectiontimeout", "20000");
      properties.put("mail.smtp.timeout", "20000");
      properties.put("mail.smtp.writetimeout", "20000");

      var message = sender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
      helper.setFrom(Support.env("MAIL_FROM_ADDRESS", "hello@example.com"));
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(html, true);
      sender.send(message);
      return Support.mapOf("to", to, "subject", subject);
    } catch (Exception error) {
      throw new IllegalStateException("Email delivery failed: " + error.getMessage(), error);
    }
  }

  private static String render(String template, Map<String, Object> data) {
    Matcher matcher = PLACEHOLDER.matcher(template);
    StringBuilder output = new StringBuilder();
    while (matcher.find()) {
      String key = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
      Object value = data.get(key);
      String rendered = value == null ? "" : String.valueOf(value);
      if (matcher.group(1) != null) rendered = escapeHtml(rendered);
      matcher.appendReplacement(output, Matcher.quoteReplacement(rendered));
    }
    matcher.appendTail(output);
    return output.toString();
  }

  private static String escapeHtml(String value) {
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        .replace("\"", "&quot;").replace("'", "&#39;");
  }
}
