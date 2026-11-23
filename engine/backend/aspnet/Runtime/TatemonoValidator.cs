using System.Data.Common;
using System.Globalization;
using System.Text.Json.Nodes;

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

        foreach (var (field, ruleText) in RuleEngine.ExpandRules(ruleSet, input))
        {
            // Everything that needs no I/O lives in RuleEngine (shared conformance vectors).
            var valueExists = RuleEngine.TryGetPath(input, field, out var value);
            foreach (var message in RuleEngine.ValidateField(field, input, valueExists, value, ruleText))
                AddError(errors, field, message);
            if (errors.ContainsKey(field) || RuleEngine.IsEmpty(valueExists, value)) continue;

            // unique / exists need the module database.
            var text = StringValue(value);
            foreach (var rule in ruleText.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Select(ParseRule))
            {
                if (rule.Name is not ("unique" or "exists")) continue;
                var message = await CheckDatabaseRuleAsync(
                    rule.Name, field, text, rule.Parameters.Split(',', StringSplitOptions.TrimEntries),
                    connection, slug, defaultTable, currentId, cancellationToken);
                if (message is not null) AddError(errors, field, message);
            }
        }

        return errors;
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
