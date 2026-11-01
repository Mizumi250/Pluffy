using System.Collections.Concurrent;
using System.Data.Common;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Pluff.AspNet.Runtime;

namespace Pluff.AspNet.Engine;

public sealed record EngineResult(int Status, JsonObject Body);

public sealed class BackendEngine
{
    private static readonly ConcurrentDictionary<string, JsonObject> Modules = new(StringComparer.OrdinalIgnoreCase);
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly string _backendDirectory = Directory.GetCurrentDirectory();
    private readonly string _modulesDirectory;
    private readonly TatemonoDatabase _database;

    public BackendEngine()
    {
        _modulesDirectory = Path.Combine(_backendDirectory, "storage", "arkzen-modules");
        _database = new TatemonoDatabase(_backendDirectory);
        LoadModules();
    }

    public static string FindRepositoryRoot()
    {
        var configured = Environment.GetEnvironmentVariable("PLUFF_ROOT");
        if (!string.IsNullOrWhiteSpace(configured) && Directory.Exists(configured)) return Path.GetFullPath(configured);
        var directory = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (directory is not null)
        {
            if (File.Exists(Path.Combine(directory.FullName, "arkzen.json"))) return directory.FullName;
            directory = directory.Parent;
        }
        return Directory.GetCurrentDirectory();
    }

    public async Task<EngineResult> BuildAsync(JsonObject payload, CancellationToken cancellationToken)
    {
        var errors = Validate(payload);
        if (errors.Count != 0)
            return new EngineResult(422, new JsonObject
            {
                ["success"] = false,
                ["message"] = "Validation failed",
                ["errors"] = JsonSerializer.SerializeToNode(errors),
                ["steps"] = new JsonArray()
            });

        var slug = payload["name"]!.GetValue<string>();
        var steps = new List<string>();
        var warnings = BuildWarnings(payload);
        try
        {
            var databases = payload["databases"] as JsonArray ?? new JsonArray();
            await using var connection = await _database.OpenAsync(slug, cancellationToken);
            await _database.ApplySchemaAsync(connection, slug, databases, cancellationToken);
            await _database.SeedTablesAsync(connection, slug, databases, cancellationToken);
            steps.Add("Isolated database ready");
            steps.Add("Migrations applied");
            if (IsTruthy(payload["auth"]))
            {
                await _database.EnsureAuthTablesAsync(connection, slug, payload["authSeed"], cancellationToken);
                steps.Add("Auth tables and seed users ready");
            }

            Directory.CreateDirectory(_modulesDirectory);
            var moduleFile = Path.Combine(_modulesDirectory, $"{slug}.json");
            await File.WriteAllTextAsync(moduleFile, payload.ToJsonString(), cancellationToken);
            Modules[slug] = (JsonObject)payload.DeepClone();
            steps.Add("C# variant registered");

            return new EngineResult(200, new JsonObject
            {
                ["success"] = true,
                ["message"] = "Build complete",
                ["steps"] = JsonSerializer.SerializeToNode(steps),
                ["errors"] = new JsonArray(),
                ["warnings"] = JsonSerializer.SerializeToNode(warnings),
                ["registry"] = MakeRegistry(payload, slug)
            });
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            return new EngineResult(500, new JsonObject
            {
                ["success"] = false,
                ["message"] = "Build failed",
                ["steps"] = JsonSerializer.SerializeToNode(steps),
                ["errors"] = JsonSerializer.SerializeToNode(new[] { exception.Message }),
                ["warnings"] = JsonSerializer.SerializeToNode(warnings)
            });
        }
    }

    public async Task<EngineResult> RemoveAsync(JsonObject payload, CancellationToken cancellationToken)
    {
        var slug = payload["name"]?.GetValue<string>();
        if (!IsSlug(slug))
            return new EngineResult(422, new JsonObject { ["success"] = false, ["message"] = "Invalid tatemono name." });

        Modules.TryRemove(slug!, out _);
        var moduleFile = Path.Combine(_modulesDirectory, $"{slug}.json");
        if (File.Exists(moduleFile)) File.Delete(moduleFile);
        await _database.RemoveAsync(slug!, cancellationToken);

        return new EngineResult(200, new JsonObject
        {
            ["success"] = true,
            ["message"] = $"Removed {slug}",
            ["steps"] = new JsonArray("Routes + module definition removed", "Isolated database removed"),
            ["errors"] = new JsonArray()
        });
    }

    public async Task DispatchAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? "/";
        var method = context.Request.Method.ToUpperInvariant();
        try
        {
            foreach (var (slug, module) in Modules)
            {
                if (await TryAuthRouteAsync(context, module, method, path, slug)) return;
                if (await TryApiRoutesAsync(context, module, method, path, slug)) return;
                if (await TryCustomRoutesAsync(context, module, method, path, slug)) return;
            }
            await Results.Json(new { message = "Not Found" }, statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
        }
        catch (InvalidDataException exception)
        {
            await Results.Json(new { message = exception.Message }, statusCode: StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }
    }

    private async Task<bool> TryCustomRoutesAsync(HttpContext context, JsonObject module, string method, string path, string slug)
    {
        if (module["customRoutes"] is not JsonArray customRoutes) return false;
        foreach (var group in customRoutes.OfType<JsonObject>())
        {
            foreach (var route in (group["routes"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
            {
                if (!StringEquals(route["method"], method) ||
                    !TryMatch(StringValue(route["route"]) ?? "/", path, out var values)) continue;
                if (await RunMiddlewareAsync(context, module, group["middleware"] as JsonArray, slug, values)) return true;
                var source = DecodeBody(route["body"]);
                if (string.IsNullOrWhiteSpace(source))
                    return await RespondNotImplementedAsync(context, $"Handler {StringValue(route["handler"]) ?? "handle"}");
                await ExecuteSnippetAsync(context, slug, source, values);
                return true;
            }
        }
        return false;
    }

    private async Task<bool> TryAuthRouteAsync(HttpContext context, JsonObject module, string method, string path, string slug)
    {
        if (!IsTruthy(module["auth"])) return false;
        var prefix = $"/api/{slug}/auth";
        var route = path.StartsWith(prefix + "/", StringComparison.OrdinalIgnoreCase)
            ? path[(prefix.Length + 1)..]
            : "";
        var action = (method, route) switch
        {
            ("POST", "register") => "register",
            ("POST", "login") => "login",
            ("POST", "logout") => "logout",
            ("GET", "me") => "me",
            _ => null
        };
        if (action is null) return false;

        var body = action is "register" or "login" ? await ReadBodyAsync(context) : new JsonObject();
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        if (action == "register")
        {
            var name = StringValue(body["name"]);
            var email = StringValue(body["email"]);
            var password = StringValue(body["password"]);
            var confirmation = StringValue(body["password_confirmation"]);
            if (string.IsNullOrWhiteSpace(name) || !IsEmail(email) ||
                string.IsNullOrWhiteSpace(password) || password.Length < 8 || password != confirmation)
            {
                await AuthValidationErrorAsync(context, "Registration details are invalid.", "password");
                return true;
            }
            if (await FindUserByEmailAsync(connection, slug, email!, context.RequestAborted) is not null)
            {
                await AuthValidationErrorAsync(context, "The email has already been taken.", "email");
                return true;
            }

            var userId = await InsertUserAsync(connection, slug, name!, email!, password, context.RequestAborted);
            var token = await CreateAuthTokenAsync(connection, slug, userId, context.RequestAborted);
            var user = await FindUserByIdAsync(connection, slug, userId, context.RequestAborted);
            SetAuthCookie(context, slug, token);
            await Results.Json(new { user, token }, statusCode: StatusCodes.Status201Created).ExecuteAsync(context);
            return true;
        }

        if (action == "login")
        {
            var email = StringValue(body["email"]);
            var password = StringValue(body["password"]);
            if (!IsEmail(email) || string.IsNullOrEmpty(password))
            {
                await AuthValidationErrorAsync(context, "The provided credentials are incorrect.", "email");
                return true;
            }
            var row = await FindUserByEmailAsync(connection, slug, email!, context.RequestAborted);
            if (row is null || !PasswordHash.Verify(password, StringValue(row["password"]) ?? ""))
            {
                await AuthValidationErrorAsync(context, "The provided credentials are incorrect.", "email");
                return true;
            }

            var userId = long.Parse(StringValue(row["id"])!, System.Globalization.CultureInfo.InvariantCulture);
            await DeleteUserTokensAsync(connection, slug, userId, context.RequestAborted);
            var token = await CreateAuthTokenAsync(connection, slug, userId, context.RequestAborted);
            row.Remove("password");
            SetAuthCookie(context, slug, token);
            await Results.Json(new { user = row, token }).ExecuteAsync(context);
            return true;
        }

        var authenticated = await ResolveUserAsync(context, connection, slug, context.RequestAborted);
        if (authenticated.User is null)
        {
            await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
            return true;
        }
        if (action == "logout" && authenticated.TokenId is long tokenId)
        {
            await using var delete = connection.CreateCommand();
            delete.CommandText = $"DELETE FROM {TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "personal_access_tokens"))} WHERE id = @id";
            TatemonoDatabase.AddParameter(delete, "@id", tokenId);
            await delete.ExecuteNonQueryAsync(context.RequestAborted);
            context.Response.Cookies.Delete($"arkzen-auth-{slug}", new CookieOptions { Path = "/" });
            await Results.Json(new { message = "Logged out successfully" }).ExecuteAsync(context);
            return true;
        }

        await Results.Json(authenticated.User).ExecuteAsync(context);
        return true;
    }

    private async Task<bool> TryApiRoutesAsync(HttpContext context, JsonObject module, string method, string path, string slug)
    {
        if (module["apis"] is not JsonArray apis) return false;
        foreach (var api in apis.OfType<JsonObject>())
        {
            var prefix = StringValue(api["prefix"]);
            if (api["endpoints"] is JsonObject endpoints && endpoints.Count > 0)
            {
                foreach (var (name, value) in endpoints)
                {
                    if (value is not JsonObject endpoint) continue;
                    var routeMethod = (StringValue(endpoint["method"]) ?? "GET").ToUpperInvariant();
                    var route = JoinPath(prefix, StringValue(endpoint["route"]) ?? "/");
                    if (method != routeMethod || !TryMatch(route, path, out var values)) continue;
                    if (api["policy"]?.GetValue<bool>() == true)
                        return await RespondNotImplementedAsync(context, $"Policy for {StringValue(api["model"]) ?? "API"}");
                    if (await RunMiddlewareAsync(context, module, api["middleware"] as JsonArray, slug, values)) return true;
                    var source = DecodeBody(endpoint["body"]);
                    if (string.IsNullOrWhiteSpace(source))
                    {
                        var type = StringValue(endpoint["type"]);
                        if (type is not ("index" or "show" or "store" or "update" or "destroy"))
                            return await RespondNotImplementedAsync(context, $"Endpoint {name}");
                        await ExecuteCrudAsync(context, slug, api, module, type!, values);
                    }
                    else
                    {
                        await ExecuteSnippetAsync(context, slug, source, values);
                    }
                    return true;
                }
                continue;
            }

            var model = StringValue(api["model"]);
            if (string.IsNullOrWhiteSpace(model)) continue;
            var resourcePath = string.IsNullOrWhiteSpace(prefix)
                ? $"/api/{slug}/{Pluralize(SnakeCase(model))}"
                : prefix!;
            var idRoute = JoinPath(resourcePath, "{id}");
            var crudType = method switch
            {
                "GET" when TryMatch(resourcePath, path, out _) => "index",
                "GET" when TryMatch(idRoute, path, out _) => "show",
                "POST" when TryMatch(resourcePath, path, out _) => "store",
                "PUT" or "PATCH" when TryMatch(idRoute, path, out _) => "update",
                "DELETE" when TryMatch(idRoute, path, out _) => "destroy",
                _ => null
            };
            if (crudType is null) continue;
            TryMatch(crudType is "show" or "update" or "destroy" ? idRoute : resourcePath, path, out var routeValues);
            if (api["policy"]?.GetValue<bool>() == true)
                return await RespondNotImplementedAsync(context, $"Policy for {model}");
            if (await RunMiddlewareAsync(context, module, api["middleware"] as JsonArray, slug, routeValues)) return true;
            await ExecuteCrudAsync(context, slug, api, module, crudType, routeValues);
            return true;
        }
        return false;
    }

    private async Task ExecuteCrudAsync(HttpContext context, string slug, JsonObject api, JsonObject module, string action, IReadOnlyDictionary<string, string> routeValues)
    {
        var model = StringValue(api["model"]) ?? "";
        var definition = FindDatabaseDefinition(model, module);
        var declaredColumns = definition?["columns"] as JsonObject;
        var table = FindTable(slug, model, module);
        var body = await ReadBodyAsync(context);
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        var tableSql = TatemonoDatabase.Quote(table);
        var id = routeValues.TryGetValue("id", out var routeId) ? DbRouteValue(routeId) : null;
        switch (action)
        {
            case "index":
            {
                await using var command = connection.CreateCommand();
                command.CommandText = $"SELECT * FROM {tableSql} ORDER BY id DESC";
                await using var reader = await command.ExecuteReaderAsync(context.RequestAborted);
                var rows = await ReadRowsAsync(reader, context.RequestAborted);
                await Results.Json(rows).ExecuteAsync(context);
                return;
            }
            case "show":
            {
                await using var command = connection.CreateCommand();
                command.CommandText = $"SELECT * FROM {tableSql} WHERE id = @id";
                TatemonoDatabase.AddParameter(command, "@id", id);
                await using var reader = await command.ExecuteReaderAsync(context.RequestAborted);
                if (!await reader.ReadAsync(context.RequestAborted))
                {
                    await Results.Json(new { message = "Not Found" }, statusCode: 404).ExecuteAsync(context);
                    return;
                }
                await Results.Json(await ReadRowAsync(reader, context.RequestAborted)).ExecuteAsync(context);
                return;
            }
            case "store":
            {
                var values = WritableColumns(body, declaredColumns);
                if (values.Count == 0)
                {
                    await Results.BadRequest(new { message = "Request body must contain writable fields." }).ExecuteAsync(context);
                    return;
                }
                if (definition?["timestamps"]?.GetValue<bool>() != false)
                {
                    var now = DateTime.UtcNow;
                    values.TryAdd("created_at", now);
                    values.TryAdd("updated_at", now);
                }
                var names = values.Keys.Select(TatemonoDatabase.Quote).ToArray();
                await using var command = connection.CreateCommand();
                command.CommandText = $"INSERT INTO {tableSql} ({string.Join(", ", names)}) VALUES ({string.Join(", ", values.Keys.Select((_, index) => $"@p{index}"))}) RETURNING *";
                AddValues(command, values);
                await using var reader = await command.ExecuteReaderAsync(context.RequestAborted);
                if (!await reader.ReadAsync(context.RequestAborted))
                    throw new InvalidOperationException($"Insert into {table} returned no row.");
                await Results.Json(await ReadRowAsync(reader, context.RequestAborted), statusCode: 201).ExecuteAsync(context);
                return;
            }
            case "update":
            {
                var values = WritableColumns(body, declaredColumns);
                if (values.Count == 0)
                {
                    await Results.BadRequest(new { message = "Request body must contain writable fields." }).ExecuteAsync(context);
                    return;
                }
                if (definition?["timestamps"]?.GetValue<bool>() != false)
                    values.TryAdd("updated_at", DateTime.UtcNow);
                await using var command = connection.CreateCommand();
                command.CommandText = $"UPDATE {tableSql} SET {string.Join(", ", values.Keys.Select((name, index) => $"{TatemonoDatabase.Quote(name)} = @p{index}"))} WHERE id = @id RETURNING *";
                AddValues(command, values);
                TatemonoDatabase.AddParameter(command, "@id", id);
                await using var reader = await command.ExecuteReaderAsync(context.RequestAborted);
                if (!await reader.ReadAsync(context.RequestAborted))
                {
                    await Results.Json(new { message = "Not Found" }, statusCode: 404).ExecuteAsync(context);
                    return;
                }
                await Results.Json(await ReadRowAsync(reader, context.RequestAborted)).ExecuteAsync(context);
                return;
            }
            case "destroy":
            {
                await using var command = connection.CreateCommand();
                command.CommandText = $"DELETE FROM {tableSql} WHERE id = @id";
                TatemonoDatabase.AddParameter(command, "@id", id);
                var deleted = await command.ExecuteNonQueryAsync(context.RequestAborted);
                if (deleted == 0)
                {
                    await Results.Json(new { message = "Not Found" }, statusCode: 404).ExecuteAsync(context);
                    return;
                }
                await Results.Json(new { message = $"{model} deleted successfully" }).ExecuteAsync(context);
                return;
            }
        }
    }

    private async Task ExecuteSnippetAsync(HttpContext context, string slug, string source, IReadOnlyDictionary<string, string> routeValues)
    {
        var body = await ReadBodyAsync(context);
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        try
        {
            if (!await VariantExecutor.ExecuteAsync(source, context, body, connection, routeValues))
                context.Response.StatusCode = StatusCodes.Status204NoContent;
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            Console.Error.WriteLine($"[ASP.NET variant] {exception}");
            if (!context.Response.HasStarted)
                await Results.Json(new { message = "C# DSL handler failed.", error = exception.Message }, statusCode: 500).ExecuteAsync(context);
        }
    }

    private static async Task<bool> RespondNotImplementedAsync(HttpContext context, string target)
    {
        await Results.Json(new { message = $"{target} has no :cs implementation." }, statusCode: 501).ExecuteAsync(context);
        return true;
    }

    private async Task<bool> RunMiddlewareAsync(
        HttpContext context,
        JsonObject module,
        JsonArray? middleware,
        string slug,
        IReadOnlyDictionary<string, string> routeValues)
    {
        foreach (var middlewareNode in middleware ?? new JsonArray())
        {
            var name = StringValue(middlewareNode)?.Trim();
            if (string.IsNullOrEmpty(name)) continue;
            if (name == "auth" || name.StartsWith("auth:", StringComparison.Ordinal))
            {
                if (!IsTruthy(module["auth"]))
                {
                    await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                    return true;
                }
                await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
                var user = await ResolveUserAsync(context, connection, slug, context.RequestAborted);
                if (user.User is not null) continue;
                await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return true;
            }
            if (name.StartsWith("role:", StringComparison.Ordinal))
            {
                if (!IsTruthy(module["auth"]))
                {
                    await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                    return true;
                }
                await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
                var authenticated = await ResolveUserAsync(context, connection, slug, context.RequestAborted);
                if (authenticated.User is null)
                {
                    await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                    return true;
                }
                var roles = name[5..].Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                if (!roles.Contains(StringValue(authenticated.User["role"]), StringComparer.OrdinalIgnoreCase))
                {
                    await Results.Json(new { message = "Forbidden." }, statusCode: StatusCodes.Status403Forbidden).ExecuteAsync(context);
                    return true;
                }
                continue;
            }

            var snippets = module["middlewareSnippets"] as JsonObject;
            var source = DecodeBody(snippets?[name]);
            if (string.IsNullOrWhiteSpace(source))
                return await RespondNotImplementedAsync(context, $"Middleware {name}");

            var body = await ReadBodyAsync(context);
            await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
            try
            {
                if (await VariantExecutor.ExecuteAsync(source, context, body, connection, routeValues)) return true;
            }
            catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception exception)
            {
                Console.Error.WriteLine($"[ASP.NET middleware:{name}] {exception}");
                if (!context.Response.HasStarted)
                    await Results.Json(new { message = $"C# middleware {name} failed.", error = exception.Message }, statusCode: 500).ExecuteAsync(context);
                return true;
            }
        }
        return false;
    }

    private List<string> Validate(JsonObject payload)
    {
        var errors = new List<string>();
        var slug = StringValue(payload["name"]);
        if (!IsSlug(slug)) errors.Add("Missing or invalid \"name\" (use lowercase letters, digits, and dashes).");
        if (StringValue(payload["backendVariant"]) is { } variant && variant != "cs")
            errors.Add($"This backend reads :cs variants; received :{variant}.");
        foreach (var database in (payload["databases"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
            if (string.IsNullOrWhiteSpace(StringValue(database["table"]))) errors.Add("database block without a table");
        foreach (var api in (payload["apis"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
            if (string.IsNullOrWhiteSpace(StringValue(api["model"])) || string.IsNullOrWhiteSpace(StringValue(api["controller"])))
                errors.Add("api block needs model and controller");
        return errors;
    }

    private static List<string> BuildWarnings(JsonObject payload)
    {
        var warnings = new List<string>();
        foreach (var feature in new[] { "events", "realtimes", "jobs", "notifications", "mails", "consoles" })
        {
            if (payload[feature] is JsonArray { Count: > 0 })
                warnings.Add($"ASP.NET does not yet execute the {feature} DSL sections.");
        }
        foreach (var database in (payload["databases"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
        {
            if (database["indexes"] is JsonArray { Count: > 0 } ||
                (database["columns"] as JsonObject)?.Any(column => column.Value?["foreign"] is not null) == true)
                warnings.Add($"ASP.NET does not yet apply indexes/foreign keys for table {StringValue(database["table"])}.");
        }
        foreach (var api in (payload["apis"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
        {
            var model = StringValue(api["model"]) ?? "API";
            if (api["policy"]?.GetValue<bool>() == true)
                warnings.Add($"ASP.NET policy execution is not implemented for {model}; protected policy routes return HTTP 501.");
            if (api["factory"]?.GetValue<bool>() == true)
                warnings.Add($"ASP.NET factory generation is not implemented for {model}.");
        }
        foreach (var group in (payload["customRoutes"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
        {
            foreach (var route in (group["routes"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
            {
                if (string.IsNullOrWhiteSpace(DecodeBody(route["body"])))
                    warnings.Add($"Custom route handler {StringValue(route["handler"]) ?? "handle"} has no :cs body and returns HTTP 501.");
            }
        }
        return warnings.Distinct(StringComparer.Ordinal).ToList();
    }

    private static JsonObject MakeRegistry(JsonObject payload, string slug)
    {
        var models = new JsonArray();
        var controllers = new JsonArray();
        var tables = new JsonArray();
        foreach (var api in (payload["apis"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
        {
            AddUnique(models, StringValue(api["model"]));
            AddUnique(controllers, StringValue(api["controller"]));
        }
        foreach (var database in (payload["databases"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
        {
            var table = StringValue(database["table"]);
            if (table is not null) AddUnique(tables, TatemonoDatabase.PrefixedTable(slug, table));
        }
        return new JsonObject { ["models"] = models, ["controllers"] = controllers, ["tables"] = tables };
    }

    private void LoadModules()
    {
        if (!Directory.Exists(_modulesDirectory)) return;
        foreach (var file in Directory.EnumerateFiles(_modulesDirectory, "*.json"))
        {
            try
            {
                if (JsonNode.Parse(File.ReadAllText(file)) is JsonObject module &&
                    IsSlug(StringValue(module["name"])) &&
                    StringValue(module["backendVariant"]) == "cs")
                    Modules[StringValue(module["name"])!] = module;
            }
            catch (JsonException exception)
            {
                Console.Error.WriteLine($"[ASP.NET registry] Could not load {file}: {exception.Message}");
            }
        }
    }

    private static JsonObject? FindDatabaseDefinition(string model, JsonObject module)
    {
        var databases = module["databases"] as JsonArray;
        var modelKey = SnakeCase(model);
        return databases?.OfType<JsonObject>().FirstOrDefault(database =>
        {
            var tableName = StringValue(database["table"]);
            return string.Equals(tableName, Pluralize(modelKey), StringComparison.OrdinalIgnoreCase) ||
                string.Equals(tableName, modelKey, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(tableName?.TrimEnd('s'), modelKey.TrimEnd('s'), StringComparison.OrdinalIgnoreCase);
        });
    }

    private static string FindTable(string slug, string model, JsonObject module)
    {
        var modelKey = SnakeCase(model);
        return TatemonoDatabase.PrefixedTable(slug, StringValue(FindDatabaseDefinition(model, module)?["table"]) ?? Pluralize(modelKey));
    }

    private static string JoinPath(string? prefix, string route)
    {
        var left = (prefix ?? "").Trim('/');
        var right = route.Trim('/');
        var joined = string.Join('/', new[] { left, right }.Where(part => part.Length > 0));
        return "/" + joined;
    }

    private static bool TryMatch(string template, string path, out IReadOnlyDictionary<string, string> values)
    {
        var names = new List<string>();
        var parameter = new Regex(@"\{([A-Za-z0-9_]+)\??\}|:([A-Za-z0-9_]+)", RegexOptions.CultureInvariant);
        var pattern = new StringBuilder("^");
        var position = 0;
        foreach (Match match in parameter.Matches(template))
        {
            var name = match.Groups[1].Success ? match.Groups[1].Value : match.Groups[2].Value;
            names.Add(name);
            pattern.Append(Regex.Escape(template[position..match.Index]));
            pattern.Append("([^/]+)");
            position = match.Index + match.Length;
        }
        pattern.Append(Regex.Escape(template[position..].TrimEnd('/')));
        pattern.Append("/?$");
        var matchResult = Regex.Match(path, pattern.ToString(), RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
        if (!matchResult.Success)
        {
            values = new Dictionary<string, string>();
            return false;
        }

        var found = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        for (var index = 0; index < names.Count; index++)
            found[names[index]] = Uri.UnescapeDataString(matchResult.Groups[index + 1].Value);
        values = found;
        return true;
    }

    private static async Task<JsonObject> ReadBodyAsync(HttpContext context)
    {
        if (!context.Request.HasJsonContentType()) return new JsonObject();
        context.Request.EnableBuffering();
        try
        {
            if (await JsonNode.ParseAsync(context.Request.Body, cancellationToken: context.RequestAborted) is JsonObject body) return body;
            throw new InvalidDataException("Request body must be a JSON object.");
        }
        catch (JsonException)
        {
            throw new InvalidDataException("Request body must contain valid JSON.");
        }
        finally
        {
            if (context.Request.Body.CanSeek) context.Request.Body.Position = 0;
        }
    }

    private static async Task<long> InsertUserAsync(DbConnection connection, string slug, string name, string email, string password, CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = $"""
            INSERT INTO {TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "users"))}
                ("name", "email", "password", "role", "created_at", "updated_at")
            VALUES (@name, @email, @password, 'user', @created, @updated)
            RETURNING id
            """;
        var now = DateTime.UtcNow;
        TatemonoDatabase.AddParameter(command, "@name", name);
        TatemonoDatabase.AddParameter(command, "@email", email);
        TatemonoDatabase.AddParameter(command, "@password", PasswordHash.Create(password));
        TatemonoDatabase.AddParameter(command, "@created", now);
        TatemonoDatabase.AddParameter(command, "@updated", now);
        return Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken), System.Globalization.CultureInfo.InvariantCulture);
    }

    private static Task<JsonObject?> FindUserByEmailAsync(DbConnection connection, string slug, string email, CancellationToken cancellationToken) =>
        FindUserRecordAsync(connection, slug, "email", email, cancellationToken);

    private static async Task<JsonObject?> FindUserByIdAsync(DbConnection connection, string slug, long id, CancellationToken cancellationToken)
    {
        var user = await FindUserRecordAsync(connection, slug, "id", id, cancellationToken);
        user?.Remove("password");
        return user;
    }

    private static async Task<JsonObject?> FindUserRecordAsync(DbConnection connection, string slug, string column, object value, CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = $"SELECT * FROM {TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "users"))} WHERE {TatemonoDatabase.Quote(column)} = @value";
        TatemonoDatabase.AddParameter(command, "@value", value);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? await ReadRowAsync(reader, cancellationToken) : null;
    }

    private static async Task<string> CreateAuthTokenAsync(DbConnection connection, string slug, long userId, CancellationToken cancellationToken)
    {
        var plain = Convert.ToHexString(RandomNumberGenerator.GetBytes(20)).ToLowerInvariant();
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(plain))).ToLowerInvariant();
        await using var command = connection.CreateCommand();
        command.CommandText = $"""
            INSERT INTO {TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "personal_access_tokens"))}
                ("tokenable_type", "tokenable_id", "name", "token", "abilities", "created_at", "updated_at")
            VALUES ('user', @user_id, 'arkzen-token', @token, '["*"]', @created, @updated)
            RETURNING id
            """;
        var now = DateTime.UtcNow;
        TatemonoDatabase.AddParameter(command, "@user_id", userId);
        TatemonoDatabase.AddParameter(command, "@token", tokenHash);
        TatemonoDatabase.AddParameter(command, "@created", now);
        TatemonoDatabase.AddParameter(command, "@updated", now);
        var id = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken), System.Globalization.CultureInfo.InvariantCulture);
        return $"{id}|{plain}";
    }

    private static async Task DeleteUserTokensAsync(DbConnection connection, string slug, long userId, CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = $"DELETE FROM {TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "personal_access_tokens"))} WHERE tokenable_id = @user_id";
        TatemonoDatabase.AddParameter(command, "@user_id", userId);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task<(JsonObject? User, long? TokenId)> ResolveUserAsync(HttpContext context, DbConnection connection, string slug, CancellationToken cancellationToken)
    {
        var bearer = context.Request.Headers["Authorization"].ToString();
        if (bearer.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)) bearer = bearer[7..].Trim();
        else bearer = context.Request.Cookies[$"arkzen-auth-{slug}"] ?? "";
        if (string.IsNullOrWhiteSpace(bearer)) return (null, null);

        var tokenParts = bearer.Split('|', 2);
        var tokenId = tokenParts.Length == 2 && long.TryParse(tokenParts[0], out var parsedId) ? parsedId : (long?)null;
        var plain = tokenParts.Length == 2 ? tokenParts[1] : tokenParts[0];
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(plain))).ToLowerInvariant();
        await using var command = connection.CreateCommand();
        command.CommandText = $"""
            SELECT u.*, t.id AS "__token_id"
            FROM {TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "users"))} u
            INNER JOIN {TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "personal_access_tokens"))} t
                ON t.tokenable_id = u.id AND t.tokenable_type = 'user'
            WHERE t.token = @token { (tokenId is null ? "" : "AND t.id = @token_id") }
            """;
        TatemonoDatabase.AddParameter(command, "@token", tokenHash);
        if (tokenId is not null) TatemonoDatabase.AddParameter(command, "@token_id", tokenId.Value);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken)) return (null, null);
        var row = await ReadRowAsync(reader, cancellationToken);
        var resolvedTokenId = long.TryParse(StringValue(row["__token_id"]), out var foundId) ? foundId : (long?)null;
        row.Remove("__token_id");
        row.Remove("password");
        return (row, resolvedTokenId);
    }

    private static async Task AuthValidationErrorAsync(HttpContext context, string message, string field)
    {
        await Results.Json(new { message, errors = new Dictionary<string, string[]> { [field] = [message] } },
            statusCode: StatusCodes.Status422UnprocessableEntity).ExecuteAsync(context);
    }

    private static void SetAuthCookie(HttpContext context, string slug, string token) =>
        context.Response.Cookies.Append($"arkzen-auth-{slug}", token, new CookieOptions { Path = "/", SameSite = SameSiteMode.Lax });

    private static async Task<List<JsonObject>> ReadRowsAsync(DbDataReader reader, CancellationToken cancellationToken)
    {
        var rows = new List<JsonObject>();
        while (await reader.ReadAsync(cancellationToken)) rows.Add(await ReadRowAsync(reader, cancellationToken));
        return rows;
    }

    private static async Task<JsonObject> ReadRowAsync(DbDataReader reader, CancellationToken cancellationToken)
    {
        var row = new JsonObject();
        for (var index = 0; index < reader.FieldCount; index++)
        {
            var value = await reader.IsDBNullAsync(index, cancellationToken) ? null : reader.GetValue(index);
            row[reader.GetName(index)] = value is null ? null : JsonSerializer.SerializeToNode(value, JsonOptions);
        }
        return row;
    }

    private static Dictionary<string, object?> WritableColumns(JsonObject body, JsonObject? declaredColumns) =>
        body.Where(pair => declaredColumns?.ContainsKey(pair.Key) == true &&
                pair.Key is not ("id" or "created_at" or "updated_at" or "deleted_at") &&
                declaredColumns[pair.Key]?["primary"]?.GetValue<bool>() != true)
            .ToDictionary(pair => pair.Key, pair => ToDbValue(pair.Value), StringComparer.Ordinal);

    private static object DbRouteValue(string value) =>
        long.TryParse(value, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var number)
            ? number
            : value;

    private static object? ToDbValue(JsonNode? value)
    {
        if (value is null) return null;
        if (value is JsonValue jsonValue)
        {
            if (jsonValue.TryGetValue<string>(out var text)) return text;
            if (jsonValue.TryGetValue<bool>(out var boolean)) return boolean;
            if (jsonValue.TryGetValue<int>(out var smallInteger)) return smallInteger;
            if (jsonValue.TryGetValue<long>(out var integer)) return integer;
            if (jsonValue.TryGetValue<double>(out var number)) return number;
        }
        return value.ToJsonString();
    }

    private static void AddValues(DbCommand command, IReadOnlyDictionary<string, object?> values)
    {
        var index = 0;
        foreach (var value in values.Values) TatemonoDatabase.AddParameter(command, $"@p{index++}", value);
    }

    private static string DecodeBody(JsonNode? body)
    {
        var encoded = StringValue(body);
        if (string.IsNullOrWhiteSpace(encoded)) return "";
        try { return System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(encoded)); }
        catch (FormatException) { return encoded; }
    }

    private static void AddUnique(JsonArray values, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value) && !values.Any(item => StringValue(item) == value))
            values.Add(value);
    }

    private static string Pluralize(string value) =>
        value.EndsWith('y') ? value[..^1] + "ies" : value.EndsWith('s') ? value + "es" : value + "s";

    private static string SnakeCase(string value) =>
        Regex.Replace(value, @"([a-z0-9])([A-Z])", "$1_$2").ToLowerInvariant();

    private static bool StringEquals(JsonNode? value, string expected) =>
        string.Equals(StringValue(value), expected, StringComparison.OrdinalIgnoreCase);

    private static string? StringValue(JsonNode? value) => value is JsonValue jsonValue ? jsonValue.ToString() : null;

    private static bool IsTruthy(JsonNode? value)
    {
        if (value is JsonValue jsonValue && jsonValue.TryGetValue<bool>(out var boolean)) return boolean;
        var text = StringValue(value);
        return !string.IsNullOrWhiteSpace(text) && text is not ("false" or "0");
    }

    private static bool IsEmail(string? value) =>
        value is not null && Regex.IsMatch(value, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.CultureInvariant);

    private static bool IsSlug(string? value) =>
        value is not null && Regex.IsMatch(value, "^[a-z0-9][a-z0-9-]*$");
}
