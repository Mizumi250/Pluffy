using System.Data.Common;
using System.Globalization;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Pluff.AspNet.Runtime;

public static class TatemonoValidator
{
    public static async Task<Dictionary<string, string[]>> ValidateAsync(
        JsonObject input,
        JsonNode? rules,
        DbConnection connection,
        string slug,
        string defaultTable,
        object? currentId,
        CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);
        if (rules is not JsonObject ruleSet) return errors;

        foreach (var (field, ruleNode) in ruleSet)
        {
            var valueExists = input.TryGetPropertyValue(field, out var value);
            var ruleText = ruleNode is JsonArray ruleArray
                ? string.Join("|", ruleArray.Select(StringValue))
                : StringValue(ruleNode) ?? "";
            var rulesForField = ruleText.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(ParseRule)
                .ToArray();

            if (rulesForField.Any(rule => rule.Name == "sometimes") && !valueExists) continue;

            var isEmpty = !valueExists || value is null || value is JsonValue jsonValue &&
                jsonValue.TryGetValue<string>(out var text) && string.IsNullOrWhiteSpace(text);
            var nullable = rulesForField.Any(rule => rule.Name == "nullable");
            if (isEmpty)
            {
                if (rulesForField.Any(rule => rule.Name == "required"))
                    AddError(errors, field, $"The {field} field is required.");
                if (nullable || !valueExists || value is null) continue;
            }

            foreach (var rule in rulesForField)
            {
                if (rule.Name is "sometimes" or "nullable" or "required") continue;
                var message = await CheckRuleAsync(
                    rule, field, value, input, connection, slug, defaultTable, currentId, cancellationToken);
                if (message is not null) AddError(errors, field, message);
            }
        }

        return errors;
    }

    private static async Task<string?> CheckRuleAsync(
        (string Name, string Parameters) rule,
        string field,
        JsonNode? value,
        JsonObject input,
        DbConnection connection,
        string slug,
        string defaultTable,
        object? currentId,
        CancellationToken cancellationToken)
    {
        var text = StringValue(value);
        var parameters = rule.Parameters.Split(',', StringSplitOptions.TrimEntries);
        switch (rule.Name)
        {
            case "string":
                return value is JsonValue jsonValue && jsonValue.TryGetValue<string>(out _)
                    ? null
                    : $"The {field} field must be a string.";
            case "integer":
                return long.TryParse(text, NumberStyles.Integer, CultureInfo.InvariantCulture, out _)
                    ? null
                    : $"The {field} field must be an integer.";
            case "numeric":
                return decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out _)
                    ? null
                    : $"The {field} field must be a number.";
            case "boolean":
                return text is "0" or "1" or "true" or "false"
                    ? null
                    : $"The {field} field must be true or false.";
            case "email":
                return text is not null && Regex.IsMatch(text, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.CultureInvariant)
                    ? null
                    : $"The {field} field must be a valid email address.";
            case "url":
                return Uri.TryCreate(text, UriKind.Absolute, out var uri) && (uri.Scheme is "http" or "https")
                    ? null
                    : $"The {field} field must be a valid URL.";
            case "date":
                return DateTime.TryParse(text, CultureInfo.InvariantCulture, DateTimeStyles.None, out _)
                    ? null
                    : $"The {field} field is not a valid date.";
            case "array":
                return value is JsonArray ? null : $"The {field} field must be an array.";
            case "accepted":
                return text is "yes" or "on" or "1" or "true"
                    ? null
                    : $"The {field} field must be accepted.";
            case "confirmed":
                return string.Equals(text, StringValue(input[$"{field}_confirmation"]), StringComparison.Ordinal)
                    ? null
                    : $"The {field} field confirmation does not match.";
            case "same":
                return parameters.Length > 0 &&
                    string.Equals(text, StringValue(input[parameters[0]]), StringComparison.Ordinal)
                    ? null
                    : $"The {field} field and {parameters.FirstOrDefault() ?? "other field"} must match.";
            case "in":
                return parameters.Contains(text, StringComparer.Ordinal)
                    ? null
                    : $"The selected {field} is invalid.";
            case "min":
            case "max":
                return CheckBound(rule.Name, field, value, parameters.FirstOrDefault());
            case "unique":
            case "exists":
                return await CheckDatabaseRuleAsync(
                    rule.Name, field, text, parameters, connection, slug, defaultTable, currentId, cancellationToken);
            default:
                return $"The {field} field uses unsupported validation rule \"{rule.Name}\".";
        }
    }

    private static string? CheckBound(string rule, string field, JsonNode? value, string? boundText)
    {
        if (!decimal.TryParse(boundText, NumberStyles.Number, CultureInfo.InvariantCulture, out var bound))
            return $"The {field} field has an invalid {rule} rule.";
        var text = StringValue(value);
        var valid = decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out var numeric)
            ? rule == "min" ? numeric >= bound : numeric <= bound
            : rule == "min" ? (text?.Length ?? 0) >= bound : (text?.Length ?? 0) <= bound;
        if (valid) return null;
        return rule == "min"
            ? $"The {field} field must be at least {boundText}."
            : $"The {field} field must not be greater than {boundText}.";
    }

    private static async Task<string?> CheckDatabaseRuleAsync(
        string rule,
        string field,
        string? value,
        string[] parameters,
        DbConnection connection,
        string slug,
        string defaultTable,
        object? currentId,
        CancellationToken cancellationToken)
    {
        if (value is null) return null;
        var tableName = parameters.Length > 0 && parameters[0].Length > 0 ? parameters[0] : defaultTable;
        var columnName = parameters.Length > 1 && parameters[1].Length > 0 ? parameters[1] : field;
        var table = TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, tableName));
        var column = TatemonoDatabase.Quote(columnName);
        await using var command = connection.CreateCommand();
        var where = $"{column} = @value";
        TatemonoDatabase.AddParameter(command, "@value", value);

        if (rule == "unique")
        {
            var ignoredId = parameters.Length > 2 && parameters[2].Length > 0
                ? parameters[2]
                : currentId?.ToString();
            var idColumn = parameters.Length > 3 && parameters[3].Length > 0 ? parameters[3] : "id";
            if (!string.IsNullOrWhiteSpace(ignoredId))
            {
                where += $" AND {TatemonoDatabase.Quote(idColumn)} <> @ignore_id";
                TatemonoDatabase.AddParameter(command, "@ignore_id", ignoredId);
            }
        }

        command.CommandText = $"SELECT COUNT(*) FROM {table} WHERE {where}";
        var found = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken), CultureInfo.InvariantCulture) > 0;
        if (rule == "unique" && found) return $"The {field} has already been taken.";
        if (rule == "exists" && !found) return $"The selected {field} is invalid.";
        return null;
    }

    private static (string Name, string Parameters) ParseRule(string rule)
    {
        var separator = rule.IndexOf(':');
        return separator < 0
            ? (rule, "")
            : (rule[..separator], rule[(separator + 1)..]);
    }

    private static void AddError(Dictionary<string, string[]> errors, string field, string message)
    {
        errors[field] = errors.TryGetValue(field, out var existing)
            ? existing.Append(message).ToArray()
            : [message];
    }

    private static string? StringValue(JsonNode? value) =>
        value is JsonValue jsonValue ? jsonValue.ToString() : null;
}
