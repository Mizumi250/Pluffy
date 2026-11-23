using System.Security.Cryptography;

namespace Pluff.AspNet.Runtime;

internal static class EngineSecret
{
    private static bool warned;

    public static bool IsValid(HttpContext context)
    {
        // No built-in password. If ARKZEN_ENGINE_SECRET is not set, /arkzen/build and /arkzen/remove stay closed.
        var expected = Environment.GetEnvironmentVariable("ARKZEN_ENGINE_SECRET");
        if (string.IsNullOrWhiteSpace(expected))
        {
            if (!warned)
            {
                warned = true;
                Console.Error.WriteLine("[Pluff] ARKZEN_ENGINE_SECRET is not set. /arkzen/build and /arkzen/remove are closed until you set it in .env.");
            }
            return false;
        }
        var provided = context.Request.Headers["X-Arkzen-Secret"].ToString();
        return provided.Length == expected.Length
            && CryptographicOperations.FixedTimeEquals(
                System.Text.Encoding.UTF8.GetBytes(provided),
                System.Text.Encoding.UTF8.GetBytes(expected));
    }
}
