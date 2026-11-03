using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Pluff.AspNet.Runtime;

public static class DslSections
{
    private static readonly Regex NamePattern = new(
        @"(?m)^([a-zA-Z0-9_.{}-]+):\s*$",
        RegexOptions.Compiled);

    public static string? ReadName(string raw)
    {
        var match = NamePattern.Match(raw);
        return match.Success ? match.Groups[1].Value : null;
    }

    public static string? ReadValue(string raw, string key)
    {
        var match = Regex.Match(
            raw,
            $@"(?m)^\s+{Regex.Escape(key)}:\s*(?:""([^""]*)""|'([^']*)'|([^\s#]+))");
        if (!match.Success) return null;
        for (var index = 1; index <= 3; index++)
            if (match.Groups[index].Success) return match.Groups[index].Value;
        return null;
    }

    public static IReadOnlyList<string> ReadList(string raw, string key)
    {
        var match = Regex.Match(raw, $@"(?m)^\s+{Regex.Escape(key)}:\s*\[([^\]]*)\]");
        if (!match.Success) return [];
        return match.Groups[1].Value
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(value => value.Trim('"', '\''))
            .Where(value => value.Length > 0)
            .ToArray();
    }

    public static IEnumerable<string> ReadSections(JsonNode? sections) =>
        (sections as JsonArray ?? new JsonArray())
            .OfType<JsonValue>()
            .Select(value => value.TryGetValue<string>(out var raw) ? raw : null)
            .Where(raw => raw is not null)
            .Select(raw => raw!);

    public static string? FindSection(JsonNode? sections, string name) =>
        ReadSections(sections).FirstOrDefault(raw =>
            string.Equals(ReadName(raw), name, StringComparison.OrdinalIgnoreCase));
}
