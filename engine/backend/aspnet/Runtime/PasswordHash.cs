using System.Security.Cryptography;

namespace Pluff.AspNet.Runtime;

internal static class PasswordHash
{
    private const int Iterations = 120_000;

    public static string Create(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, 32);
        return $"$pluff$pbkdf2-sha256${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string password, string encoded)
    {
        var fields = encoded.Split('$', StringSplitOptions.RemoveEmptyEntries);
        if (fields.Length != 5 || fields[0] != "pluff" || fields[1] != "pbkdf2-sha256" ||
            !int.TryParse(fields[2], out var iterations) || iterations < 1)
            return false;
        try
        {
            var salt = Convert.FromBase64String(fields[3]);
            var expected = Convert.FromBase64String(fields[4]);
            var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
