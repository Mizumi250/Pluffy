using System.Data.Common;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Pluff.AspNet.Runtime;

public static class ScriptDatabase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static async Task<List<JsonObject>> QueryAsync(
        DbConnection connection,
        string sql,
        IReadOnlyDictionary<string, object?>? parameters = null,
        CancellationToken cancellationToken = default,
        DbTransaction? transaction = null)
    {
        await using var command = CreateCommand(connection, sql, parameters, transaction);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var rows = new List<JsonObject>();
        while (await reader.ReadAsync(cancellationToken))
        {
            var row = new JsonObject();
            for (var index = 0; index < reader.FieldCount; index++)
            {
                var value = await reader.IsDBNullAsync(index, cancellationToken) ? null : reader.GetValue(index);
                row[reader.GetName(index)] = value is null ? null : JsonSerializer.SerializeToNode(value, JsonOptions);
            }
            rows.Add(row);
        }
        return rows;
    }

    public static async Task<object?> ScalarAsync(
        DbConnection connection,
        string sql,
        IReadOnlyDictionary<string, object?>? parameters = null,
        CancellationToken cancellationToken = default,
        DbTransaction? transaction = null)
    {
        await using var command = CreateCommand(connection, sql, parameters, transaction);
        return await command.ExecuteScalarAsync(cancellationToken);
    }

    public static async Task<int> ExecuteAsync(
        DbConnection connection,
        string sql,
        IReadOnlyDictionary<string, object?>? parameters = null,
        CancellationToken cancellationToken = default,
        DbTransaction? transaction = null)
    {
        await using var command = CreateCommand(connection, sql, parameters, transaction);
        return await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static DbCommand CreateCommand(
        DbConnection connection,
        string sql,
        IReadOnlyDictionary<string, object?>? parameters,
        DbTransaction? transaction)
    {
        var command = connection.CreateCommand();
        command.CommandText = sql;
        command.Transaction = transaction;
        if (parameters is null) return command;

        foreach (var (name, value) in parameters)
        {
            var parameter = command.CreateParameter();
            parameter.ParameterName = name;
            parameter.Value = value ?? DBNull.Value;
            command.Parameters.Add(parameter);
        }
        return command;
    }
}
