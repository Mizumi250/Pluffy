using System.Net;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace Pluff.AspNet.Runtime;

/// <summary>
/// Mail helper for :cs bodies, matching the Spring Boot Mail runtime: Blade-style placeholders
/// ({{ $x }} escaped, {!! $x !!} raw), a log mailer by default, and optional SMTP delivery.
/// Set MAIL_MAILER=smtp plus MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD and MAIL_FROM_ADDRESS to deliver.
/// </summary>
public static class Mail
{
    private static readonly Regex Placeholder = new(
        @"\{\{\s*\$?([a-zA-Z0-9_.\-]+)\s*\}\}|\{!!\s*\$?([a-zA-Z0-9_.\-]+)\s*!!\}",
        RegexOptions.Compiled);

    public static string Render(string template, IReadOnlyDictionary<string, object?>? data = null) =>
        Placeholder.Replace(template, match =>
        {
            var escaped = match.Groups[1].Success;
            var key = escaped ? match.Groups[1].Value : match.Groups[2].Value;
            object? value = null;
            data?.TryGetValue(key, out value);
            var text = value?.ToString() ?? "";
            return escaped ? WebUtility.HtmlEncode(text) : text;
        });

    public static async Task SendAsync(
        string to,
        string subject,
        string template,
        IReadOnlyDictionary<string, object?>? data = null,
        CancellationToken cancellationToken = default)
    {
        var html = Render(template, data);
        var mailer = Environment.GetEnvironmentVariable("MAIL_MAILER") ?? "log";
        if (!string.Equals(mailer, "smtp", StringComparison.OrdinalIgnoreCase))
        {
            Console.WriteLine($"[mail:log] to={to} subject=\"{subject}\"");
            return;
        }

        var username = Environment.GetEnvironmentVariable("MAIL_USERNAME") ?? "";
        var port = int.TryParse(Environment.GetEnvironmentVariable("MAIL_PORT"), out var parsedPort) ? parsedPort : 587;
        using var client = new SmtpClient(Environment.GetEnvironmentVariable("MAIL_HOST") ?? "127.0.0.1", port)
        {
            Timeout = 20000,
            EnableSsl = username.Length > 0,
            Credentials = username.Length > 0
                ? new NetworkCredential(username, Environment.GetEnvironmentVariable("MAIL_PASSWORD") ?? "")
                : null
        };
        using var message = new MailMessage
        {
            From = new MailAddress(Environment.GetEnvironmentVariable("MAIL_FROM_ADDRESS") ?? "hello@example.com"),
            Subject = subject,
            Body = html,
            IsBodyHtml = true
        };
        message.To.Add(to);
        try
        {
            await client.SendMailAsync(message, cancellationToken);
        }
        catch (Exception error) when (error is not OperationCanceledException)
        {
            throw new InvalidOperationException("Email delivery failed: " + error.Message, error);
        }
    }
}