using System.Security.Cryptography;

namespace Pluff.AspNet.Runtime;

internal static class EngineSecret
{
    public static bool IsValid(HttpContext context)
    {
        var configured = Environment.GetEnvironmentVariable("ARKZEN_ENGINE_SECRET");
        var expected = string.IsNullOrWhiteSpace(configured) ? "arkzen-engine-secret" : configured;
        var provided = context.Request.Headers["X-Arkzen-Secret"].ToString();
        return provided.Length == expected.Length
            && CryptographicOperations.FixedTimeEquals(
                System.Text.Encoding.UTF8.GetBytes(provided),
                System.Text.Encoding.UTF8.GetBytes(expected));
    }
}
