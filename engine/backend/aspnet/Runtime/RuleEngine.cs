using System.Globalization;
using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Pluff.AspNet.Runtime;

/// <summary>
/// Laravel-style validation rules that need no I/O. Mirrors the rule set and messages of the
/// Express runtime (express/src/runtime/validation.ts) and the Rust/Go/FastAPI/Spring ports, and
/// is exercised by the shared vectors in engine/backend/conformance/validation-vectors.json.
/// Database rules (unique, exists) and upload rules (file, image, mimes, mimetypes) are accepted
/// here and evaluated by their owners.
/// Not supported anywhere: date_format, after*, before*, digits_between.
/// </summary>
public static class RuleEngine
{
    private sealed record Rule(string Name, string Raw, string[] Args);

    private static readonly HashSet<string> PresenceRules = new(StringComparer.Ordinal)
    {
        "required", "nullable", "sometimes", "bail", "filled", "present", "required_if", "required_unless",
        "required_with", "required_with_all", "required_without", "required_without_all", "prohibited",
        "prohibited_if", "prohibited_unless",
    };

    private static readonly Regex EmailRe = new(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", RegexOptions.CultureInvariant);
    private static readonly Regex UuidRe = new(
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        RegexOptions.CultureInvariant | RegexOptions.IgnoreCase);
    private static readonly Regex AlphaRe = new("^[A-Za-z]+$", RegexOptions.CultureInvariant);
    private static readonly Regex AlphaNumRe = new("^[A-Za-z0-9]+$", RegexOptions.CultureInvariant);
    private static readonly Regex AlphaDashRe = new("^[A-Za-z0-9_-]+$", RegexOptions.CultureInvariant);
    private static readonly Regex IntRe = new(@"^-?\d+$", RegexOptions.CultureInvariant);
    private static readonly Regex UrlRe = new(@"^[A-Za-z][A-Za-z0-9+.\-]*:\S+$", RegexOptions.CultureInvariant);
    private static readonly Regex HttpUrlRe = new(@"^https?://[^/\s?#]+", RegexOptions.CultureInvariant | RegexOptions.IgnoreCase);
    private static readonly Regex DateRe = new(
        @"^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$",
        RegexOptions.CultureInvariant);
    private static readonly Regex PatternRe = new(@"^/(.*)/([a-z]*)$", RegexOptions.CultureInvariant | RegexOptions.Singleline);

    // ------------------------------------------------------------------ public helpers

    /// <summary>Joins a rule node (string or array of strings) into the pipe-separated form.</summary>
    public static string RuleText(JsonNode? rule) => rule switch
    {
        JsonArray array => string.Join("|", array.Select(item => item?.ToString() ?? "")),
        null => "",
        _ => rule.ToString(),
    };

    /// <summary>Expands <c>items.*.name</c> style keys against the request body.</summary>
    public static List<(string Key, string Rules)> ExpandRules(JsonObject rules, JsonObject input)
    {
        var output = new List<(string, string)>();
        foreach (var (key, node) in rules)
        {
            var text = RuleText(node);
            if (!key.Contains('*'))
            {
                output.Add((key, text));
                continue;
            }
            var resolved = new List<string>();
            Walk(string.Empty, key.Split('.'), 0, input, resolved);
            foreach (var path in resolved) output.Add((path, text));
        }
        return output;
    }

    private static void Walk(string prefix, string[] parts, int index, JsonNode? current, List<string> output)
    {
        if (index == parts.Length)
        {
            output.Add(prefix);
            return;
        }
        var part = parts[index];
        string Join(string next) => prefix.Length == 0 ? next : prefix + "." + next;
        if (part == "*")
        {
            if (current is JsonArray array)
                for (var position = 0; position < array.Count; position++)
                    Walk(Join(position.ToString(CultureInfo.InvariantCulture)), parts, index + 1, array[position], output);
            return;
        }
        JsonNode? next2 = current is JsonObject obj && obj.TryGetPropertyValue(part, out var child) ? child : null;
        Walk(Join(part), parts, index + 1, next2, output);
    }

    /// <summary>Resolves a dotted path ("a.0.b"). Returns false when any segment is absent.</summary>
    public static bool TryGetPath(JsonNode? root, string path, out JsonNode? value)
    {
        value = root;
        foreach (var part in path.Split('.'))
        {
            switch (value)
            {
                case JsonObject obj when obj.TryGetPropertyValue(part, out var child):
                    value = child;
                    break;
                case JsonArray array when int.TryParse(part, NumberStyles.None, CultureInfo.InvariantCulture, out var index)
                                          && index >= 0 && index < array.Count:
                    value = array[index];
                    break;
                default:
                    value = null;
                    return false;
            }
        }
        return true;
    }

    public static bool IsEmpty(bool exists, JsonNode? value)
    {
        if (!exists || value is null) return true;
        return value.GetValueKind() switch
        {
            JsonValueKind.Null => true,
            JsonValueKind.String => string.IsNullOrWhiteSpace(value.GetValue<string>()),
            JsonValueKind.Array => value.AsArray().Count == 0,
            _ => false,
        };
    }

    /// <summary>True when every rule is known to this engine or handled elsewhere (unique, exists, uploads).</summary>
    public static bool IsSupported(string ruleSet) => Parse(ruleSet).All(rule => KnownRules.Contains(rule.Name));

    private static readonly HashSet<string> KnownRules = new(StringComparer.Ordinal)
    {
        "required", "nullable", "sometimes", "bail", "filled", "present", "prohibited", "string", "integer", "numeric",
        "boolean", "array", "email", "url", "json", "uuid", "alpha", "alpha_num", "alpha_dash", "ip", "ipv4", "ipv6",
        "accepted", "declined", "date", "lowercase", "uppercase", "file", "image", "confirmed", "distinct", "unique",
        "exists", "min", "max", "size", "between", "digits", "decimal", "in", "not_in", "same", "different",
        "starts_with", "ends_with", "doesnt_start_with", "doesnt_end_with", "regex", "not_regex", "gt", "gte", "lt",
        "lte", "required_if", "required_unless", "required_with", "required_with_all", "required_without",
        "required_without_all", "prohibited_if", "prohibited_unless", "accepted_if", "mimes", "mimetypes",
    };

    // ------------------------------------------------------------------ evaluation

    /// <summary>Validates one field; returns every failure message (empty = valid).</summary>
    public static List<string> ValidateField(string field, JsonObject input, bool exists, JsonNode? value, string ruleSet)
    {
        var rules = Parse(ruleSet);
        bool Has(string name) => rules.Any(rule => rule.Name == name);
        var name = Attribute(field);
        var errors = new List<string>();

        if (Has("sometimes") && !exists) return errors;
        if (Has("present") && !exists)
        {
            errors.Add($"The {name} field must be present.");
            return errors;
        }

        var missing = IsEmpty(exists, value);
        var prohibited = Has("prohibited")
            || rules.Any(rule => rule.Name == "prohibited_if" && DependencyIs(rule, input))
            || rules.Any(rule => rule.Name == "prohibited_unless" && !DependencyIs(rule, input));
        if (prohibited && !missing)
        {
            errors.Add($"The {name} field is prohibited.");
            return errors;
        }

        Rule? Find(string ruleName) => rules.FirstOrDefault(rule => rule.Name == ruleName);
        var acceptedIf = rules.FirstOrDefault(rule => rule.Name == "accepted_if" && DependencyIs(rule, input));
        var requiredIf = Find("required_if");
        var requiredUnless = Find("required_unless");
        var requiredWith = Find("required_with");
        var requiredWithAll = Find("required_with_all");
        var requiredWithout = Find("required_without");
        var requiredWithoutAll = Find("required_without_all");
        var mustHave = Has("required")
            || (requiredIf is not null && DependencyIs(requiredIf, input))
            || (requiredUnless is not null && !DependencyIs(requiredUnless, input))
            || (requiredWith is not null && PresentFlags(requiredWith, input).Any(flag => flag))
            || (requiredWithAll is not null && PresentFlags(requiredWithAll, input).All(flag => flag))
            || (requiredWithout is not null && PresentFlags(requiredWithout, input).Any(flag => !flag))
            || (requiredWithoutAll is not null && PresentFlags(requiredWithoutAll, input).All(flag => !flag))
            || acceptedIf is not null;

        if (missing)
        {
            if (mustHave) errors.Add($"The {name} field is required.");
            else if (Has("filled") && exists) errors.Add($"The {name} field must have a value.");
            return errors;
        }

        var numeric = Has("numeric") || Has("integer");
        foreach (var rule in rules)
        {
            if (PresenceRules.Contains(rule.Name)) continue;
            var effective = rule;
            if (rule.Name == "accepted_if")
            {
                if (acceptedIf is null) continue;
                effective = new Rule("accepted", "", Array.Empty<string>());
            }
            var message = Check(effective, value!, field, input, numeric);
            if (message is null) continue;
            errors.Add(message);
            if (Has("bail")) break;
        }
        return errors;
    }

    private static List<Rule> Parse(string ruleSet) =>
        ruleSet.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(text =>
            {
                var separator = text.IndexOf(':');
                return separator < 0
                    ? new Rule(text, "", Array.Empty<string>())
                    : new Rule(text[..separator], text[(separator + 1)..], text[(separator + 1)..].Split(','));
            })
            .ToList();

    private static string Attribute(string field) =>
        field.Replace(".*", "").Replace('_', ' ').Replace('.', ' ');

    private static string TextOf(JsonNode? node) => node is null
        ? ""
        : node.GetValueKind() switch
        {
            JsonValueKind.String => node.GetValue<string>(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            JsonValueKind.Null => "",
            _ => node.ToJsonString(),
        };

    private static double? NumberOf(JsonNode? node)
    {
        if (node is null) return null;
        switch (node.GetValueKind())
        {
            case JsonValueKind.Number:
                return double.TryParse(node.ToJsonString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var number)
                    ? number
                    : null;
            case JsonValueKind.String:
                var text = node.GetValue<string>().Trim();
                return text.Length > 0 && double.TryParse(text, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed)
                    ? parsed
                    : null;
            default:
                return null;
        }
    }

    private static bool DependencyIs(Rule rule, JsonObject input)
    {
        if (rule.Args.Length < 2) return false;
        var actual = TryGetPath(input, rule.Args[0], out var other) ? TextOf(other) : "";
        return rule.Args.Skip(1).Any(expected => expected == actual);
    }

    private static List<bool> PresentFlags(Rule rule, JsonObject input) =>
        rule.Args.Select(field => !IsEmpty(TryGetPath(input, field, out var other), other)).ToList();

    private static double SizeOf(JsonNode value, bool numeric)
    {
        if (value.GetValueKind() == JsonValueKind.Number) return NumberOf(value) ?? 0;
        if (numeric && NumberOf(value) is double number) return number;
        return value is JsonArray array ? array.Count : new StringInfo(TextOf(value)).LengthInTextElements;
    }

    private static bool IsValidDate(string text)
    {
        var match = DateRe.Match(text.Trim());
        if (!match.Success) return false;
        int Part(int index) => match.Groups[index].Success ? int.Parse(match.Groups[index].Value, CultureInfo.InvariantCulture) : -1;
        var (year, month, day) = (Part(1), Part(2), Part(3));
        if (month < 1 || month > 12) return false;
        var leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
        var days = month switch { 1 or 3 or 5 or 7 or 8 or 10 or 12 => 31, 4 or 6 or 9 or 11 => 30, _ => leap ? 29 : 28 };
        if (day < 1 || day > days) return false;
        var (hour, minute, second) = (Part(4), Part(5), Part(6));
        return (hour < 0 || hour < 24) && (minute < 0 || minute < 60) && (second < 0 || second < 60);
    }

    private static Regex? CompilePattern(string raw)
    {
        var match = PatternRe.Match(raw.Trim());
        if (!match.Success) return null;
        var options = RegexOptions.CultureInvariant;
        foreach (var flag in match.Groups[2].Value)
        {
            switch (flag)
            {
                case 'i': options |= RegexOptions.IgnoreCase; break;
                case 'm': options |= RegexOptions.Multiline; break;
                case 's': options |= RegexOptions.Singleline; break;
                case 'u': break;
                default: return null;
            }
        }
        try { return new Regex(match.Groups[1].Value, options); }
        catch (ArgumentException) { return null; }
    }

    private static IPAddress? ParseIp(string text) =>
        IPAddress.TryParse(text, out var address)
        && (address.AddressFamily == AddressFamily.InterNetworkV6
            || (address.AddressFamily == AddressFamily.InterNetwork && text.Count(c => c == '.') == 3))
            ? address
            : null;

    // ------------------------------------------------------------------ checks

    private static string? Check(Rule rule, JsonNode value, string field, JsonObject input, bool numeric)
    {
        var args = rule.Args;
        var text = TextOf(value);
        var kind = value.GetValueKind();
        var name = Attribute(field);
        bool ok;
        switch (rule.Name)
        {
            case "string": ok = kind == JsonValueKind.String; break;
            case "integer":
                ok = kind switch
                {
                    JsonValueKind.Number => NumberOf(value) is double n && Math.Abs(n % 1) < double.Epsilon,
                    JsonValueKind.String => IntRe.IsMatch(text),
                    _ => false,
                };
                break;
            case "numeric": ok = kind != JsonValueKind.True && kind != JsonValueKind.False && NumberOf(value) is not null; break;
            case "boolean":
                ok = kind switch
                {
                    JsonValueKind.True or JsonValueKind.False => true,
                    JsonValueKind.Number => NumberOf(value) is 0 or 1,
                    JsonValueKind.String => text is "0" or "1" or "true" or "false",
                    _ => false,
                };
                break;
            case "accepted":
                ok = kind switch
                {
                    JsonValueKind.True => true,
                    JsonValueKind.Number => NumberOf(value) == 1,
                    JsonValueKind.String => text is "yes" or "on" or "1" or "true",
                    _ => false,
                };
                break;
            case "declined":
                ok = kind switch
                {
                    JsonValueKind.False => true,
                    JsonValueKind.Number => NumberOf(value) == 0,
                    JsonValueKind.String => text is "no" or "off" or "0" or "false",
                    _ => false,
                };
                break;
            case "email": ok = EmailRe.IsMatch(text); break;
            case "url":
                ok = UrlRe.IsMatch(text) && (!text.StartsWith("http", StringComparison.OrdinalIgnoreCase) || HttpUrlRe.IsMatch(text));
                break;
            case "array": ok = kind is JsonValueKind.Array or JsonValueKind.Object; break;
            case "date": ok = IsValidDate(text); break;
            case "json":
                try { JsonDocument.Parse(text).Dispose(); ok = true; }
                catch (JsonException) { ok = false; }
                break;
            case "uuid": ok = UuidRe.IsMatch(text); break;
            case "alpha": ok = AlphaRe.IsMatch(text); break;
            case "alpha_num": ok = AlphaNumRe.IsMatch(text); break;
            case "alpha_dash": ok = AlphaDashRe.IsMatch(text); break;
            case "ip": ok = ParseIp(text) is not null; break;
            case "ipv4": ok = ParseIp(text)?.AddressFamily == AddressFamily.InterNetwork; break;
            case "ipv6": ok = ParseIp(text)?.AddressFamily == AddressFamily.InterNetworkV6; break;
            case "lowercase": ok = text == text.ToLowerInvariant(); break;
            case "uppercase": ok = text == text.ToUpperInvariant(); break;
            case "starts_with": ok = args.Any(prefix => text.StartsWith(prefix, StringComparison.Ordinal)); break;
            case "ends_with": ok = args.Any(suffix => text.EndsWith(suffix, StringComparison.Ordinal)); break;
            case "doesnt_start_with": ok = !args.Any(prefix => text.StartsWith(prefix, StringComparison.Ordinal)); break;
            case "doesnt_end_with": ok = !args.Any(suffix => text.EndsWith(suffix, StringComparison.Ordinal)); break;
            case "decimal":
            {
                var dot = text.IndexOf('.');
                var places = dot < 0 ? 0 : text.Length - dot - 1;
                var minimum = args.Length > 0 && int.TryParse(args[0], out var low) ? low : 0;
                ok = NumberOf(value) is not null
                    && places >= minimum
                    && (args.Length < 2 || !int.TryParse(args[1], out var high) || places <= high);
                break;
            }
            case "digits":
                ok = args.Length > 0 && int.TryParse(args[0], out var count)
                    && text.Length == count && text.All(char.IsAsciiDigit);
                break;
            case "min" or "max" or "size" or "between":
            {
                var size = SizeOf(value, numeric);
                double Bound(int index) => args.Length > index && double.TryParse(args[index], NumberStyles.Float, CultureInfo.InvariantCulture, out var b) ? b : double.NaN;
                var pass = rule.Name switch
                {
                    "min" => size >= Bound(0),
                    "max" => size <= Bound(0),
                    "size" => size == Bound(0),
                    _ => size >= Bound(0) && size <= Bound(1),
                };
                if (pass) return null;
                var unit = value is JsonArray ? " items" : kind == JsonValueKind.Number || numeric ? "" : " characters";
                return rule.Name switch
                {
                    "min" => $"The {name} field must be at least {args[0]}{unit}.",
                    "max" => $"The {name} field must not be greater than {args[0]}{unit}.",
                    "size" => $"The {name} field must be {args[0]}{unit}.",
                    _ => $"The {name} field must be between {args[0]} and {(args.Length > 1 ? args[1] : "")}{unit}.",
                };
            }
            case "gt" or "gte" or "lt" or "lte":
            {
                double? other = args.Length > 0 && double.TryParse(args[0], NumberStyles.Float, CultureInfo.InvariantCulture, out var literal)
                    ? literal
                    : args.Length > 0 && TryGetPath(input, args[0], out var node) ? NumberOf(node) : null;
                var current = NumberOf(value);
                var pass = current is double c && other is double o && rule.Name switch
                {
                    "gt" => c > o,
                    "gte" => c >= o,
                    "lt" => c < o,
                    _ => c <= o,
                };
                if (pass) return null;
                var relation = rule.Name switch
                {
                    "gt" => "greater than",
                    "gte" => "greater than or equal to",
                    "lt" => "less than",
                    _ => "less than or equal to",
                };
                return $"The {name} field must be {relation} {(args.Length > 0 ? args[0] : "")}.";
            }
            case "in": ok = args.Contains(text, StringComparer.Ordinal); break;
            case "not_in": ok = !args.Contains(text, StringComparer.Ordinal); break;
            case "regex": ok = CompilePattern(rule.Raw)?.IsMatch(text) == true; break;
            case "not_regex": ok = CompilePattern(rule.Raw) is { } notPattern && !notPattern.IsMatch(text); break;
            case "confirmed":
                ok = TryGetPath(input, field + "_confirmation", out var confirmation) && JsonNode.DeepEquals(value, confirmation);
                break;
            case "same":
                ok = args.Length > 0 && TryGetPath(input, args[0], out var sameNode) && JsonNode.DeepEquals(value, sameNode);
                if (!ok) return $"The {name} field and {(args.Length > 0 ? args[0] : "")} must match.";
                break;
            case "different":
                ok = args.Length > 0 && !(TryGetPath(input, args[0], out var differentNode) && JsonNode.DeepEquals(value, differentNode));
                if (!ok) return $"The {name} field and {(args.Length > 0 ? args[0] : "")} must be different.";
                break;
            case "distinct": ok = !HasDuplicate(field, value, rule, input); break;
            // Evaluated by TatemonoValidator (database) or the upload handler (file).
            case "unique" or "exists" or "file" or "image" or "mimes" or "mimetypes": return null;
            default: return $"Validation rule \"{rule.Name}\" is not supported by the ASP.NET engine.";
        }
        if (ok) return null;
        return rule.Name switch
        {
            "string" => $"The {name} field must be a string.",
            "integer" => $"The {name} field must be an integer.",
            "numeric" => $"The {name} field must be a number.",
            "boolean" => $"The {name} field must be true or false.",
            "accepted" => $"The {name} field must be accepted.",
            "declined" => $"The {name} field must be declined.",
            "email" => $"The {name} field must be a valid email address.",
            "url" => $"The {name} field must be a valid URL.",
            "array" => $"The {name} field must be an array.",
            "date" => $"The {name} field must be a valid date.",
            "json" => $"The {name} field must be a valid JSON string.",
            "uuid" => $"The {name} field must be a valid UUID.",
            "alpha" => $"The {name} field must only contain letters.",
            "alpha_num" => $"The {name} field must only contain letters and numbers.",
            "alpha_dash" => $"The {name} field must only contain letters, numbers, dashes, and underscores.",
            "ip" => $"The {name} field must be a valid IP address.",
            "ipv4" => $"The {name} field must be a valid IPv4 address.",
            "ipv6" => $"The {name} field must be a valid IPv6 address.",
            "lowercase" => $"The {name} field must be lowercase.",
            "uppercase" => $"The {name} field must be uppercase.",
            "starts_with" => $"The {name} field must start with one of the following: {string.Join(", ", args)}.",
            "ends_with" => $"The {name} field must end with one of the following: {string.Join(", ", args)}.",
            "doesnt_start_with" => $"The {name} field must not start with one of the following: {string.Join(", ", args)}.",
            "doesnt_end_with" => $"The {name} field must not end with one of the following: {string.Join(", ", args)}.",
            "decimal" => $"The {name} field must have the specified number of decimal places.",
            "digits" => $"The {name} field must be {(args.Length > 0 ? args[0] : "")} digits.",
            "in" or "not_in" => $"The selected {name} is invalid.",
            "regex" or "not_regex" => $"The {name} field format is invalid.",
            "confirmed" => $"The {name} field confirmation does not match.",
            "distinct" => $"The {name} field has a duplicate value.",
            _ => $"The {name} field is invalid.",
        };
    }

    private static bool HasDuplicate(string field, JsonNode value, Rule rule, JsonObject input)
    {
        var parts = field.Split('.');
        var index = Array.FindLastIndex(parts, part => part.Length > 0 && part.All(char.IsAsciiDigit));
        if (index < 0) return false;
        if (!TryGetPath(input, string.Join('.', parts[..index]), out var siblings) || siblings is not JsonArray array) return false;
        var rest = string.Join('.', parts[(index + 1)..]);
        var ignoreCase = rule.Args.Length > 0 && rule.Args[0] == "ignore_case";
        string Canonical(JsonNode? node) => ignoreCase ? TextOf(node).ToLowerInvariant() : TextOf(node);
        var current = Canonical(value);
        var matching = array.Count(item =>
        {
            JsonNode? candidate = item;
            if (rest.Length > 0 && !TryGetPath(item, rest, out candidate)) return false;
            return Canonical(candidate) == current;
        });
        return matching > 1;
    }
}
