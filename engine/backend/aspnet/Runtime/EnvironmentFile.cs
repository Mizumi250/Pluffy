namespace Pluff.AspNet.Runtime;

internal static class EnvironmentFile
{
    public static void Load(string path)
    {
        if (!File.Exists(path)) return;
        foreach (var line in File.ReadLines(path))
        {
            var value = line.Trim();
            if (value.Length == 0 || value.StartsWith('#')) continue;
            var split = value.IndexOf('=');
            if (split <= 0) continue;
            var name = value[..split].Trim();
            var content = value[(split + 1)..].Trim().Trim('"', '\'');
            if (Environment.GetEnvironmentVariable(name) is null)
                Environment.SetEnvironmentVariable(name, content);
        }
    }
}
