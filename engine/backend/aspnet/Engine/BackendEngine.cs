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
    private readonly BackgroundTaskQueue _backgroundTasks;

    public BackendEngine(BackgroundTaskQueue backgroundTasks)
    {
        _backgroundTasks = backgroundTasks;
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
            if (payload["notifications"] is JsonArray { Count: > 0 })
            {
                await _database.EnsureNotificationsTableAsync(connection, slug, cancellationToken);
                steps.Add("Database notifications table ready");
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
                if (await TryBroadcastAuthAsync(context, module, method, path, slug)) return;
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
                await ExecuteSnippetAsync(context, slug, module, source, values);
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

    private async Task<bool> TryBroadcastAuthAsync(HttpContext context, JsonObject module, string method, string path, string slug)
    {
        if (method != "POST" || path != $"/api/{slug}/auth/broadcasting/auth") return false;
        if (!IsTruthy(module["auth"]))
        {
            await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
            return true;
        }

        var body = await ReadBodyAsync(context);
        var socketId = StringValue(body["socket_id"]);
        var channel = StringValue(body["channel_name"]);
        if (string.IsNullOrWhiteSpace(socketId) || string.IsNullOrWhiteSpace(channel))
        {
            await Results.Json(new { message = "Missing socket_id or channel_name." },
                statusCode: StatusCodes.Status422UnprocessableEntity).ExecuteAsync(context);
            return true;
        }

        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        var authenticated = await ResolveUserAsync(context, connection, slug, context.RequestAborted);
        if (authenticated.User is null)
        {
            await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
            return true;
        }

        var authorization = BroadcastHub.AuthorizeChannel(
            socketId,
            channel,
            authenticated.User,
            ReadBroadcastChannelRules(module, slug));
        if (authorization is null)
        {
            await Results.Json(new { message = "Forbidden." }, statusCode: StatusCodes.Status403Forbidden).ExecuteAsync(context);
            return true;
        }

        authorization.Remove("channel_data", out var channelData);
        await Results.Json(new
        {
            auth = StringValue(authorization["auth"]),
            channel_data = channelData?.GetValue<string>()
        }, statusCode: StatusCodes.Status200OK).ExecuteAsync(context);
        return true;
    }

    private async Task<bool> TryApiRoutesAsync(HttpContext context, JsonObject module, string method, string path, string slug)
    {
        if (module["apis"] is not JsonArray apis) return false;
        foreach (var api in apis.OfType<JsonObject>())
        {
            var prefix = StringValue(api["prefix"]);
            if (method == "GET" &&
                api["endpoints"] is JsonObject broadcastEndpoints &&
                broadcastEndpoints.Any(endpoint => StringEquals(endpoint.Value?["type"], "broadcast")) &&
                TryMatch($"/api/{slug}/sse-poll/{{channelType}}", path, out var pollValues))
                return await PollBroadcastMessagesAsync(context, module, api, slug, pollValues);
            if (api["endpoints"] is JsonObject endpoints && endpoints.Count > 0)
            {
                foreach (var (name, value) in endpoints)
                {
                    if (value is not JsonObject endpoint) continue;
                    var routeMethod = (StringValue(endpoint["method"]) ?? "GET").ToUpperInvariant();
                    var route = JoinPath(prefix, StringValue(endpoint["route"]) ?? "/");
                    if (method != routeMethod || !TryMatch(route, path, out var values)) continue;
                    if (await RunMiddlewareAsync(context, module, api["middleware"] as JsonArray, slug, values)) return true;
                    var type = StringValue(endpoint["type"]) ?? (name.ToLowerInvariant() switch
                    {
                        "index" => "index",
                        "show" => "show",
                        "store" => "store",
                        "update" => "update",
                        "destroy" => "destroy",
                        _ => null
                    });
                    if (IsPolicyProtectedAction(type) &&
                        await RunPolicyAsync(context, slug, api, module, type!, values)) return true;
                    if (type is "mail_send" or "notification_trigger")
                        return await ExecuteMessageEndpointAsync(context, slug, module, api, type, values);
                    if (StringEquals(api["model"], "Notification") &&
                        HasNotificationTrigger(api))
                        return await ExecuteNativeNotificationEndpointAsync(
                            context, slug, api, module, name, type, values, endpoint["response"]);
                    if (type is "job_dispatch" or "event_fire" or "command_run")
                        return await ExecuteDslEndpointAsync(context, slug, module, api, endpoint, type, values);
                    var source = DecodeBody(endpoint["body"]);
                    if (string.IsNullOrWhiteSpace(source))
                    {
                        if (type is not ("index" or "show" or "store" or "update" or "destroy" or "broadcast"))
                            return await RespondNotImplementedAsync(context, $"Endpoint {name}");
                        await ExecuteCrudAsync(
                            context, slug, api, module, type!, values,
                            endpoint["validation"], endpoint["query"] as JsonObject, endpoint["response"] as JsonObject);
                    }
                    else
                    {
                        if (endpoint["validation"] is not null &&
                            (routeMethod is "POST" or "PUT" or "PATCH") &&
                            !await ValidateSnippetAsync(context, slug, api, module, endpoint, values))
                            return true;
                        await ExecuteSnippetAsync(context, slug, module, source, values);
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
            if (await RunMiddlewareAsync(context, module, api["middleware"] as JsonArray, slug, routeValues)) return true;
            if (IsPolicyProtectedAction(crudType) &&
                await RunPolicyAsync(context, slug, api, module, crudType, routeValues)) return true;
            await ExecuteCrudAsync(context, slug, api, module, crudType, routeValues);
            return true;
        }
        return false;
    }

    private async Task<bool> RunPolicyAsync(
        HttpContext context,
        string slug,
        JsonObject api,
        JsonObject module,
        string action,
        IReadOnlyDictionary<string, string> routeValues)
    {
        if (api["policy"]?.GetValue<bool>() != true) return false;
        if (!routeValues.TryGetValue("id", out var routeId))
            return await RespondNotImplementedAsync(context, $"Policy for {StringValue(api["model"]) ?? "API"} requires an id route value");

        var model = StringValue(api["model"]) ?? "API";
        var table = TatemonoDatabase.Quote(FindTable(slug, model, module));
        var id = DbRouteValue(routeId);
        var body = await ReadBodyAsync(context);
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        var authenticated = await ResolveUserAsync(context, connection, slug, context.RequestAborted);

        await using var find = connection.CreateCommand();
        find.CommandText = $"SELECT * FROM {table} WHERE id = @id";
        TatemonoDatabase.AddParameter(find, "@id", id);
        await using var reader = await find.ExecuteReaderAsync(context.RequestAborted);
        if (!await reader.ReadAsync(context.RequestAborted))
        {
            await Results.Json(new { message = "Not Found" }, statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
            return true;
        }
        var item = await ReadRowAsync(reader, context.RequestAborted);
        await reader.DisposeAsync();

        var policyName = action == "update" ? "update" : "delete";
        var snippets = module["policySnippets"] as JsonObject;
        var source = DecodeBody(snippets?[policyName]);
        bool allowed;
        if (!string.IsNullOrWhiteSpace(source))
        {
            try
            {
                allowed = await VariantExecutor.EvaluatePolicyAsync(
                    source, context, body, connection, routeValues, authenticated.User, item);
            }
            catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception exception)
            {
                Console.Error.WriteLine($"[ASP.NET policy:{model}.{policyName}] {exception}");
                if (!context.Response.HasStarted)
                    await Results.Json(new { message = $"C# policy {model}.{policyName} failed.", error = exception.Message },
                        statusCode: StatusCodes.Status500InternalServerError).ExecuteAsync(context);
                return true;
            }
        }
        else
        {
            var definition = FindDatabaseDefinition(model, module);
            var columns = definition?["columns"] as JsonObject;
            var ownerColumn = new[] { "user_id", "owner_id", "created_by", "author_id" }
                .FirstOrDefault(name => columns?.ContainsKey(name) == true);
            var isAdmin = string.Equals(StringValue(authenticated.User?["role"]), "admin", StringComparison.OrdinalIgnoreCase);
            var isOwner = ownerColumn is not null &&
                string.Equals(StringValue(authenticated.User?["id"]), StringValue(item[ownerColumn]), StringComparison.Ordinal);
            allowed = authenticated.User is not null && (isAdmin || isOwner);
        }

        if (allowed) return false;
        await Results.Json(new { message = "This action is unauthorized." }, statusCode: StatusCodes.Status403Forbidden).ExecuteAsync(context);
        return true;
    }

    private static bool IsPolicyProtectedAction(string? action) => action is "update" or "destroy";

    private async Task<bool> ValidateSnippetAsync(
        HttpContext context,
        string slug,
        JsonObject api,
        JsonObject module,
        JsonObject endpoint,
        IReadOnlyDictionary<string, string> routeValues)
    {
        var model = StringValue(api["model"]) ?? "";
        var definition = FindDatabaseDefinition(model, module);
        var body = await ReadBodyAsync(context);
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        var errors = await TatemonoValidator.ValidateAsync(
            body,
            endpoint["validation"],
            connection,
            slug,
            StringValue(definition?["table"]) ?? Pluralize(SnakeCase(model)),
            routeValues.TryGetValue("id", out var routeId) ? DbRouteValue(routeId) : null,
            context.RequestAborted);
        if (errors.Count == 0) return true;

        await Results.Json(new { message = "The given data was invalid.", errors },
            statusCode: StatusCodes.Status422UnprocessableEntity).ExecuteAsync(context);
        return false;
    }

    private async Task ExecuteCrudAsync(
        HttpContext context,
        string slug,
        JsonObject api,
        JsonObject module,
        string action,
        IReadOnlyDictionary<string, string> routeValues,
        JsonNode? validationRules = null,
        JsonObject? queryConfig = null,
        JsonObject? responseConfig = null)
    {
        var model = StringValue(api["model"]) ?? "";
        var definition = FindDatabaseDefinition(model, module);
        var declaredColumns = definition?["columns"] as JsonObject;
        var table = FindTable(slug, model, module);
        var body = await ReadBodyAsync(context);
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        var tableSql = TatemonoDatabase.Quote(table);
        var id = routeValues.TryGetValue("id", out var routeId) ? DbRouteValue(routeId) : null;
        if (action is "store" or "update" or "broadcast" && validationRules is not null)
        {
            var errors = await TatemonoValidator.ValidateAsync(
                body, validationRules, connection, slug,
                StringValue(definition?["table"]) ?? Pluralize(SnakeCase(model)),
                id,
                context.RequestAborted);
            if (errors.Count != 0)
            {
                await Results.Json(new { message = "The given data was invalid.", errors },
                    statusCode: StatusCodes.Status422UnprocessableEntity).ExecuteAsync(context);
                return;
            }
        }
        switch (action)
        {
            case "index":
            {
                await using var command = connection.CreateCommand();
                var where = new List<string>();
                if (context.Request.Query.TryGetValue("search", out var searchValue) &&
                    !string.IsNullOrWhiteSpace(searchValue.ToString()))
                {
                    var searchableColumns = new[] { "name", "description" }
                        .Where(column => declaredColumns?.ContainsKey(column) == true)
                        .ToArray();
                    if (searchableColumns.Length > 0)
                    {
                        where.Add("(" + string.Join(" OR ", searchableColumns.Select(column => $"{TatemonoDatabase.Quote(column)} LIKE @search")) + ")");
                        TatemonoDatabase.AddParameter(command, "@search", $"%{searchValue}%");
                    }
                }

                if (queryConfig is not null)
                {
                    foreach (var (column, _) in queryConfig)
                    {
                        if (column is "search" or "per_page" ||
                            declaredColumns?.ContainsKey(column) != true ||
                            !context.Request.Query.TryGetValue(column, out var filter) ||
                            string.IsNullOrWhiteSpace(filter.ToString())) continue;
                        var parameter = $"@filter{command.Parameters.Count}";
                        where.Add($"{TatemonoDatabase.Quote(column)} = {parameter}");
                        TatemonoDatabase.AddParameter(command, parameter, filter.ToString());
                    }
                }

                var whereSql = where.Count == 0 ? "" : " WHERE " + string.Join(" AND ", where);
                command.CommandText = $"SELECT * FROM {tableSql}{whereSql} ORDER BY {(declaredColumns?.ContainsKey("created_at") == true ? "\"created_at\"" : "\"id\"")} DESC";
                var perPage = ReadPageSize(context, queryConfig);
                var page = ReadPositiveInt(context.Request.Query["page"], 1);
                var paginated = !string.Equals(StringValue(responseConfig?["type"]), "array", StringComparison.OrdinalIgnoreCase);
                long total = 0;
                if (paginated)
                {
                    await using var count = connection.CreateCommand();
                    count.CommandText = $"SELECT COUNT(*) FROM {tableSql}{whereSql}";
                    foreach (DbParameter parameter in command.Parameters)
                    {
                        var cloned = count.CreateParameter();
                        cloned.ParameterName = parameter.ParameterName;
                        cloned.Value = parameter.Value;
                        count.Parameters.Add(cloned);
                    }
                    total = Convert.ToInt64(await count.ExecuteScalarAsync(context.RequestAborted), System.Globalization.CultureInfo.InvariantCulture);
                    command.CommandText += " LIMIT @limit OFFSET @offset";
                    TatemonoDatabase.AddParameter(command, "@limit", perPage);
                    TatemonoDatabase.AddParameter(command, "@offset", (page - 1) * perPage);
                }
                await using var reader = await command.ExecuteReaderAsync(context.RequestAborted);
                var rows = await ReadRowsAsync(reader, context.RequestAborted);
                if (!paginated)
                {
                    await Results.Json(rows).ExecuteAsync(context);
                    return;
                }
                await Results.Json(new
                {
                    current_page = page,
                    data = rows,
                    first_page_url = PageUrl(context, 1),
                    from = rows.Count == 0 ? (long?)null : (long)((page - 1) * perPage + 1),
                    last_page = Math.Max(1L, (long)Math.Ceiling(total / (double)perPage)),
                    last_page_url = PageUrl(context, Math.Max(1L, (long)Math.Ceiling(total / (double)perPage))),
                    next_page_url = page * (long)perPage < total ? PageUrl(context, page + 1) : null,
                    path = context.Request.Path.Value,
                    per_page = perPage,
                    prev_page_url = page > 1 ? PageUrl(context, page - 1) : null,
                    to = rows.Count == 0 ? (long?)null : (long)((page - 1) * perPage + rows.Count),
                    total
                }).ExecuteAsync(context);
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
            case "broadcast":
            {
                var values = WritableColumns(body, declaredColumns);
                var channelType = StringValue(body["channel_type"]) ?? "public";
                JsonObject? authenticatedUser = null;
                if (IsTruthy(module["auth"]))
                    authenticatedUser = (await ResolveUserAsync(context, connection, slug, context.RequestAborted)).User;
                if ((channelType is "private" or "presence") && authenticatedUser is null)
                {
                    await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                    return;
                }
                if (declaredColumns?.ContainsKey("user_id") == true)
                    values["user_id"] = authenticatedUser?["id"] is { } userId
                        ? DbRouteValue(userId.ToString())
                        : null;
                values["channel_type"] = channelType;
                if (definition?["timestamps"]?.GetValue<bool>() != false)
                {
                    var now = DateTime.UtcNow;
                    values.TryAdd("created_at", now);
                    values.TryAdd("updated_at", now);
                }

                var eventTarget = BroadcastHub.ResolveEvent(module["realtimes"], slug, channelType, authenticatedUser);
                if (eventTarget is null)
                {
                    await Results.Json(new { message = $"No {channelType} broadcast channel is configured." },
                        statusCode: StatusCodes.Status422UnprocessableEntity).ExecuteAsync(context);
                    return;
                }

                await using var command = connection.CreateCommand();
                var names = values.Keys.Select(TatemonoDatabase.Quote).ToArray();
                command.CommandText = $"INSERT INTO {tableSql} ({string.Join(", ", names)}) VALUES ({string.Join(", ", values.Keys.Select((_, index) => $"@p{index}"))}) RETURNING *";
                AddValues(command, values);
                await using var reader = await command.ExecuteReaderAsync(context.RequestAborted);
                if (!await reader.ReadAsync(context.RequestAborted))
                    throw new InvalidOperationException($"Insert into {table} returned no row.");
                var message = await ReadRowAsync(reader, context.RequestAborted);
                await reader.DisposeAsync();
                await BroadcastHub.BroadcastToAsync(
                    eventTarget.Value.Channel,
                    eventTarget.Value.Event,
                    message,
                    context.RequestAborted,
                    context.Request.Headers["X-Socket-ID"].ToString());
                await Results.Json(message, statusCode: StatusCodes.Status201Created).ExecuteAsync(context);
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

    private async Task<bool> PollBroadcastMessagesAsync(
        HttpContext context,
        JsonObject module,
        JsonObject api,
        string slug,
        IReadOnlyDictionary<string, string> routeValues)
    {
        var channelType = routeValues.TryGetValue("channelType", out var requestedType) ? requestedType : "";
        if (channelType is not ("public" or "private" or "presence"))
        {
            await Results.BadRequest(new { message = "Unknown broadcast channel type." }).ExecuteAsync(context);
            return true;
        }

        var model = StringValue(api["model"]) ?? "";
        var definition = FindDatabaseDefinition(model, module);
        var declaredColumns = definition?["columns"] as JsonObject;
        if (channelType == "private" && declaredColumns?.ContainsKey("user_id") != true)
        {
            await Results.Json(new { message = "Private broadcast polling requires a user_id column." },
                statusCode: StatusCodes.Status501NotImplemented).ExecuteAsync(context);
            return true;
        }

        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        JsonObject? user = null;
        if (channelType is "private" or "presence")
        {
            user = (await ResolveUserAsync(context, connection, slug, context.RequestAborted)).User;
            if (user is null)
            {
                await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return true;
            }
        }

        var afterId = ReadPositiveLong(context.Request.Query["after_id"], 0);
        var table = TatemonoDatabase.Quote(FindTable(slug, model, module));
        await using var command = connection.CreateCommand();
        command.CommandText = $"SELECT * FROM {table} WHERE channel_type = @channel_type AND id > @after_id";
        TatemonoDatabase.AddParameter(command, "@channel_type", channelType);
        TatemonoDatabase.AddParameter(command, "@after_id", afterId);
        if (channelType == "private")
        {
            command.CommandText += " AND user_id = @user_id";
            TatemonoDatabase.AddParameter(command, "@user_id", user?["id"]?.ToString());
        }
        command.CommandText += " ORDER BY id LIMIT 50";
        await using var reader = await command.ExecuteReaderAsync(context.RequestAborted);
        var rows = await ReadRowsAsync(reader, context.RequestAborted);
        var eventTarget = BroadcastHub.ResolveEvent(module["realtimes"], slug, channelType, user);
        var messages = new JsonArray();
        var lastId = afterId;
        foreach (var row in rows)
        {
            if (long.TryParse(StringValue(row["id"]), out var id)) lastId = Math.Max(lastId, id);
            messages.Add(new JsonObject
            {
                ["event"] = eventTarget?.Event,
                ["data"] = row
            });
        }
        await Results.Json(new { messages, last_id = lastId }).ExecuteAsync(context);
        return true;
    }

    private async Task ExecuteSnippetAsync(
        HttpContext context,
        string slug,
        JsonObject module,
        string source,
        IReadOnlyDictionary<string, string> routeValues)
    {
        var body = await ReadBodyAsync(context);
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        try
        {
            JsonObject? user = null;
            if (IsTruthy(module["auth"]))
                user = (await ResolveUserAsync(context, connection, slug, context.RequestAborted)).User;
            if (!await VariantExecutor.ExecuteAsync(source, context, body, connection, routeValues, user))
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
                await using var authConnection = await _database.OpenAsync(slug, context.RequestAborted);
                var user = await ResolveUserAsync(context, authConnection, slug, context.RequestAborted);
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
                await using var roleConnection = await _database.OpenAsync(slug, context.RequestAborted);
                var authenticated = await ResolveUserAsync(context, roleConnection, slug, context.RequestAborted);
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
                JsonObject? user = null;
                if (IsTruthy(module["auth"]))
                    user = (await ResolveUserAsync(context, connection, slug, context.RequestAborted)).User;
                if (await VariantExecutor.ExecuteAsync(source, context, body, connection, routeValues, user)) return true;
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
        foreach (var feature in new[] { "events", "jobs", "consoles" })
        {
            if (payload[feature] is JsonArray { Count: > 0 })
            {
                var message = feature switch
                {
                    "events" => "ASP.NET queues event listeners in-process; queued work is not durable across restarts.",
                    "jobs" => "ASP.NET supports queued retries in-process; queue persistence and queue isolation are not implemented.",
                    "consoles" => "ASP.NET runs console bodies only when manually requested; cron scheduling is not implemented.",
                    _ => $"ASP.NET does not yet execute the {feature} DSL sections."
                };
                warnings.Add(message);
            }
        }
        foreach (var api in (payload["apis"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
        {
            var model = StringValue(api["model"]) ?? "API";
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

    private async Task<bool> ExecuteMessageEndpointAsync(
        HttpContext context,
        string slug,
        JsonObject module,
        JsonObject api,
        string type,
        IReadOnlyDictionary<string, string> routeValues)
    {
        var body = await ReadBodyAsync(context);
        var keyName = type == "mail_send" ? "mail" : "notification";
        var requestedName = StringValue(body[keyName]);
        if (string.IsNullOrWhiteSpace(requestedName))
        {
            await Results.BadRequest(new { message = $"A {keyName} name is required." }).ExecuteAsync(context);
            return true;
        }

        var sectionKey = type == "mail_send" ? "mails" : "notifications";
        var section = DslSections.FindSection(module[sectionKey], requestedName);
        if (section is null)
        {
            await Results.BadRequest(new { message = $"Unknown {keyName} type: {requestedName}" }).ExecuteAsync(context);
            return true;
        }

        try
        {
            JsonObject? user = null;
            await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
            if (IsTruthy(module["auth"]))
                user = (await ResolveUserAsync(context, connection, slug, context.RequestAborted)).User;

            if (type == "notification_trigger" && user is null)
            {
                await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized)
                    .ExecuteAsync(context);
                return true;
            }

            var subject = DslSections.ReadValue(section, "subject") ?? requestedName;
            var message = DslSections.ReadValue(section, "message") ?? "You have a new notification.";
            object? renderedBody = null;
            if (type == "notification_trigger")
            {
                var script = DecodeBody(JsonValue.Create(DslSections.ReadValue(section, "toMail_body")));
                if (!string.IsNullOrWhiteSpace(script))
                    renderedBody = await VariantExecutor.ExecuteValueAsync(
                        script, context, body, connection, routeValues, user);
            }

            if (type == "mail_send")
            {
                var to = StringValue(body["to"]);
                if (!IsEmail(to))
                {
                    await Results.Json(new { message = "A valid recipient email is required." },
                        statusCode: StatusCodes.Status422UnprocessableEntity).ExecuteAsync(context);
                    return true;
                }
                var data = ReadObjectValues(body["data"]);
                var template = DecodeBody(JsonValue.Create(DslSections.ReadValue(section, "blade_body")));
                await Mail.SendAsync(to!, subject, template, data, context.RequestAborted);

                var logTable = TatemonoDatabase.Quote(FindTable(slug, StringValue(api["model"]) ?? "", module));
                var log = new Dictionary<string, object?>
                {
                    ["user_id"] = user?["id"] is { } userId ? DbRouteValue(userId.ToString()) : null,
                    ["to_email"] = to,
                    ["subject"] = subject,
                    ["mail_class"] = requestedName,
                    ["status"] = "sent"
                };
                var now = DateTime.UtcNow;
                if (FindDatabaseDefinition(StringValue(api["model"]) ?? "", module)?["timestamps"]?.GetValue<bool>() != false)
                {
                    log["created_at"] = now;
                    log["updated_at"] = now;
                }
                var rows = await InsertRowAsync(connection, logTable, log, context.RequestAborted);
                await Results.Json(rows, statusCode: StatusCodes.Status201Created).ExecuteAsync(context);
                return true;
            }

            var channels = DslSections.ReadList(section, "channels");
            var channelType = DslSections.ReadValue(section, "channel_type") ?? "private";
            var dataObject = NotificationData(requestedName, message, renderedBody);
            if (channels.Contains("database", StringComparer.OrdinalIgnoreCase))
                await InsertNotificationAsync(connection, slug, user!, requestedName, dataObject, context.RequestAborted);

            if (channels.Contains("mail", StringComparer.OrdinalIgnoreCase) && IsEmail(StringValue(user!["email"])))
            {
                var html = NotificationHtml(renderedBody, message);
                await Mail.SendAsync(
                    StringValue(user!["email"])!,
                    JsonDataString(renderedBody, "subject") ?? subject,
                    html,
                    cancellationToken: context.RequestAborted);
            }

            if (channels.Contains("broadcast", StringComparer.OrdinalIgnoreCase))
            {
                var channel = channelType switch
                {
                    "public" => $"{slug}.notifications",
                    "presence" => $"presence-{slug}.{user!["id"]}",
                    _ => $"private-{slug}.{user!["id"]}"
                };
                await BroadcastHub.BroadcastToAsync(
                    channel,
                    $"{slug}.notification",
                    dataObject,
                    context.RequestAborted,
                    context.Request.Headers["X-Socket-ID"].ToString());
            }

            await Results.Json(new { message = "Notification triggered successfully", type = requestedName },
                statusCode: StatusCodes.Status201Created).ExecuteAsync(context);
            return true;
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            Console.Error.WriteLine($"[ASP.NET {type}:{requestedName}] {exception}");
            await Results.Json(new { message = $"C# {type} execution failed.", error = exception.Message },
                statusCode: StatusCodes.Status500InternalServerError).ExecuteAsync(context);
            return true;
        }
    }

    private async Task<bool> ExecuteNativeNotificationEndpointAsync(
        HttpContext context,
        string slug,
        JsonObject api,
        JsonObject module,
        string endpointName,
        string? endpointType,
        IReadOnlyDictionary<string, string> routeValues,
        JsonNode? response)
    {
        var operation = endpointType ?? endpointName;
        if (operation is not ("index" or "destroy" or "readAll")) return false;
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        var authenticated = await ResolveUserAsync(context, connection, slug, context.RequestAborted);
        if (authenticated.User is null)
        {
            await Results.Json(new { message = "Unauthenticated." }, statusCode: StatusCodes.Status401Unauthorized)
                .ExecuteAsync(context);
            return true;
        }

        var table = TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "notifications"));
        var userId = DbRouteValue(authenticated.User["id"]?.ToString() ?? "");
        if (operation == "index")
        {
            var rows = await ScriptDatabase.QueryAsync(
                connection,
                $"SELECT * FROM {table} WHERE notifiable_type = 'user' AND notifiable_id = @user_id ORDER BY created_at DESC",
                new Dictionary<string, object?> { ["@user_id"] = userId },
                context.RequestAborted);
            foreach (var row in rows)
                if (StringValue(row["data"]) is { } json) row["data"] = JsonNode.Parse(json);
            await Results.Json(new { data = rows }).ExecuteAsync(context);
            return true;
        }

        if (operation == "destroy")
        {
            if (!routeValues.TryGetValue("id", out var id))
            {
                await Results.BadRequest(new { message = "A notification id is required." }).ExecuteAsync(context);
                return true;
            }
            await using var delete = connection.CreateCommand();
            delete.CommandText = $"DELETE FROM {table} WHERE id = @id AND notifiable_type = 'user' AND notifiable_id = @user_id";
            TatemonoDatabase.AddParameter(delete, "@id", id);
            TatemonoDatabase.AddParameter(delete, "@user_id", userId);
            if (await delete.ExecuteNonQueryAsync(context.RequestAborted) == 0)
            {
                await Results.Json(new { message = "Not Found" }, statusCode: StatusCodes.Status404NotFound)
                    .ExecuteAsync(context);
                return true;
            }
            await Results.Json(new { message = StringValue(response?["value"]) ?? "Notification deleted" })
                .ExecuteAsync(context);
            return true;
        }

        await using (var update = connection.CreateCommand())
        {
            update.CommandText = $"UPDATE {table} SET read_at = @read_at WHERE notifiable_type = 'user' AND notifiable_id = @user_id AND read_at IS NULL";
            TatemonoDatabase.AddParameter(update, "@read_at", DateTime.UtcNow);
            TatemonoDatabase.AddParameter(update, "@user_id", userId);
            await update.ExecuteNonQueryAsync(context.RequestAborted);
        }
        await Results.Json(new { message = StringValue(response?["value"]) ?? "All notifications marked as read" })
            .ExecuteAsync(context);
        return true;
    }

    private static bool HasNotificationTrigger(JsonObject api) =>
        (api["endpoints"] as JsonObject)?.Any(endpoint =>
            StringEquals(endpoint.Value?["type"], "notification_trigger")) == true;

    private static IReadOnlyList<BroadcastChannelRule> ReadBroadcastChannelRules(JsonObject module, string slug)
    {
        var rules = BroadcastHub.ReadChannelRules(module["realtimes"]);
        if (!IsTruthy(module["auth"])) return rules;
        foreach (var section in DslSections.ReadSections(module["notifications"]))
        {
            if (!DslSections.ReadList(section, "channels").Contains("broadcast", StringComparer.OrdinalIgnoreCase))
                continue;
            var type = DslSections.ReadValue(section, "channel_type") ?? "private";
            if (type is not ("private" or "presence")) continue;
            var channelName = $"{slug}.{{id}}";
            if (!rules.Any(rule => rule.Channel == channelName && rule.Type == type))
                rules.Add(new BroadcastChannelRule(channelName, type, "owner"));
        }
        return rules;
    }

    private async Task<JsonObject> InsertNotificationAsync(
        DbConnection connection,
        string slug,
        JsonObject user,
        string notificationType,
        JsonObject data,
        CancellationToken cancellationToken)
    {
        var table = TatemonoDatabase.Quote(TatemonoDatabase.PrefixedTable(slug, "notifications"));
        var now = DateTime.UtcNow;
        var id = Guid.NewGuid().ToString();
        await ScriptDatabase.ExecuteAsync(
            connection,
            $"""
            INSERT INTO {table} (id, type, notifiable_type, notifiable_id, data, read_at, created_at, updated_at)
            VALUES (@id, @type, 'user', @user_id, @data, NULL, @created, @created)
            """,
            new Dictionary<string, object?>
            {
                ["@id"] = id,
                ["@type"] = notificationType,
                ["@user_id"] = DbRouteValue(user["id"]?.ToString() ?? ""),
                ["@data"] = data.ToJsonString(),
                ["@created"] = now
            },
            cancellationToken);
        return new JsonObject
        {
            ["id"] = id,
            ["type"] = notificationType,
            ["notifiable_type"] = "user",
            ["notifiable_id"] = user["id"]?.DeepClone(),
            ["data"] = data.DeepClone(),
            ["read_at"] = null,
            ["created_at"] = System.Text.Json.JsonSerializer.SerializeToNode(now),
            ["updated_at"] = System.Text.Json.JsonSerializer.SerializeToNode(now)
        };
    }

    private static JsonObject NotificationData(string type, string message, object? renderedBody)
    {
        var data = new JsonObject { ["type"] = type, ["message"] = message };
        if (renderedBody is not IDictionary<string, object?> values) return data;
        foreach (var (key, value) in values)
        {
            if (key is "lines" or "subject" or "greeting" or "salutation" or "action") continue;
            data[key] = System.Text.Json.JsonSerializer.SerializeToNode(value);
        }
        return data;
    }

    private static string NotificationHtml(object? renderedBody, string fallbackMessage)
    {
        if (renderedBody is not IDictionary<string, object?> values)
            return $"<p>{System.Net.WebUtility.HtmlEncode(fallbackMessage)}</p>";
        var html = new System.Text.StringBuilder();
        if (values.TryGetValue("greeting", out var greeting) && greeting is not null)
            html.Append("<p>").Append(System.Net.WebUtility.HtmlEncode(greeting.ToString())).Append("</p>");
        if (values.TryGetValue("lines", out var lines) && lines is IEnumerable<string> messages)
            foreach (var line in messages)
                html.Append("<p>").Append(System.Net.WebUtility.HtmlEncode(line)).Append("</p>");
        if (values.TryGetValue("action", out var action) &&
            action is IDictionary<string, object?> actionValues &&
            actionValues.TryGetValue("label", out var label) &&
            actionValues.TryGetValue("url", out var url))
            html.Append("<p><a href=\"").Append(System.Net.WebUtility.HtmlEncode(url?.ToString() ?? ""))
                .Append("\">").Append(System.Net.WebUtility.HtmlEncode(label?.ToString() ?? "")).Append("</a></p>");
        if (values.TryGetValue("salutation", out var salutation) && salutation is not null)
            html.Append("<p>").Append(System.Net.WebUtility.HtmlEncode(salutation.ToString())).Append("</p>");
        return html.ToString();
    }

    private static string? JsonDataString(object? data, string key) =>
        data is IDictionary<string, object?> values && values.TryGetValue(key, out var value)
            ? value?.ToString()
            : null;

    private static Dictionary<string, object?> ReadObjectValues(JsonNode? node) =>
        (node as JsonObject ?? new JsonObject()).ToDictionary(
            entry => entry.Key,
            entry => (object?)entry.Value?.DeepClone(),
            StringComparer.Ordinal);

    private async Task<JsonObject> InsertRowAsync(
        DbConnection connection,
        string table,
        IReadOnlyDictionary<string, object?> values,
        CancellationToken cancellationToken)
    {
        var names = values.Keys.Select(TatemonoDatabase.Quote).ToArray();
        await using var command = connection.CreateCommand();
        command.CommandText = $"INSERT INTO {table} ({string.Join(", ", names)}) VALUES ({string.Join(", ", values.Keys.Select((_, index) => $"@p{index}"))}) RETURNING *";
        AddValues(command, values);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
            throw new InvalidOperationException($"Insert into {table} returned no row.");
        return await ReadRowAsync(reader, cancellationToken);
    }

    private async Task<bool> ExecuteDslEndpointAsync(
        HttpContext context,
        string slug,
        JsonObject module,
        JsonObject api,
        JsonObject endpoint,
        string type,
        IReadOnlyDictionary<string, string> routeValues)
    {
        var body = await ReadBodyAsync(context);
        var valueKey = type switch
        {
            "job_dispatch" => "job",
            "event_fire" => "event",
            _ => "command"
        };
        var requestedName = StringValue(body[valueKey]);
        if (string.IsNullOrWhiteSpace(requestedName))
        {
            await Results.BadRequest(new { message = $"A {valueKey} name is required." }).ExecuteAsync(context);
            return true;
        }

        var sectionsKey = type switch
        {
            "job_dispatch" => "jobs",
            "event_fire" => "events",
            _ => "consoles"
        };
        var section = DslSections.ReadSections(module[sectionsKey]).FirstOrDefault(raw =>
            MatchesDslName(DslSections.ReadName(raw), requestedName));
        if (section is null)
        {
            await Results.BadRequest(new { message = $"Unknown {valueKey}: {requestedName}" }).ExecuteAsync(context);
            return true;
        }

        try
        {
            if (type == "event_fire")
            {
                var listeners = DslSections.ReadList(section, "listeners");
                var listenerBodies = DecodeListenerBodies(section);
                var tries = int.TryParse(DslSections.ReadValue(section, "tries"), out var configuredTries)
                    ? Math.Max(1, configuredTries)
                    : 3;
                foreach (var listener in listeners)
                {
                    if (!listenerBodies.TryGetValue(listener, out var encodedBody) ||
                        string.IsNullOrWhiteSpace(DecodeBody(JsonValue.Create(encodedBody))))
                    {
                        await RespondNotImplementedAsync(context, $"Listener {listener}");
                        return true;
                    }
                    var listenerBody = (JsonObject)body.DeepClone();
                    var listenerSource = DecodeBody(JsonValue.Create(encodedBody));
                    var moduleSnapshot = (JsonObject)module.DeepClone();
                    var routeSnapshot = new Dictionary<string, string>(routeValues);
                    _backgroundTasks.Enqueue(
                        cancellationToken => RunDslBodyAsync(
                            listenerSource, slug, moduleSnapshot, listenerBody, routeSnapshot, null, cancellationToken),
                        tries,
                        TimeSpan.FromSeconds(60));
                }
                await Results.Json(new { message = "Event fired", @event = requestedName, listeners }, statusCode: 202)
                    .ExecuteAsync(context);
                return true;
            }

            var source = DecodeBody(JsonValue.Create(DslSections.ReadValue(section, "body")));
            if (string.IsNullOrWhiteSpace(source))
                return await RespondNotImplementedAsync(context, $"{type} {requestedName}");

            if (type == "job_dispatch")
            {
                body["job"] = requestedName;
                var tries = int.TryParse(DslSections.ReadValue(section, "tries"), out var configuredTries)
                    ? Math.Max(1, configuredTries)
                    : 1;
                var timeoutSeconds = int.TryParse(DslSections.ReadValue(section, "timeout"), out var configuredTimeout)
                    ? Math.Max(1, configuredTimeout)
                    : 60;
                var moduleSnapshot = (JsonObject)module.DeepClone();
                var bodySnapshot = (JsonObject)body.DeepClone();
                var routeSnapshot = new Dictionary<string, string>(routeValues);
                _backgroundTasks.Enqueue(
                    cancellationToken => RunDslBodyAsync(
                        source, slug, moduleSnapshot, bodySnapshot, routeSnapshot, null, cancellationToken),
                    tries,
                    TimeSpan.FromSeconds(timeoutSeconds),
                    cancellationToken => RecordJobFailureAsync(
                        slug, api, module, requestedName, "Job failed after all configured attempts.", cancellationToken));
                await Results.Json(new { message = "Job dispatched", job = requestedName }, statusCode: StatusCodes.Status202Accepted)
                    .ExecuteAsync(context);
                return true;
            }

            body["command"] = requestedName;
            var previousId = await ReadLatestIdAsync(context, slug, api, module, requestedName);
            await RunDslBodyAsync(source, context, slug, module, body, routeValues);
            var row = await ReadLatestCommandAsync(context, slug, api, module, requestedName, previousId);
            await Results.Json(row ?? new JsonObject
            {
                ["command_name"] = requestedName,
                ["signature"] = DslSections.ReadValue(section, "signature") ?? requestedName,
                ["exit_code"] = 0,
                ["triggered_by"] = StringValue(body["triggered_by"]) ?? "manual"
            }, statusCode: StatusCodes.Status201Created).ExecuteAsync(context);
            return true;
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            Console.Error.WriteLine($"[ASP.NET {type}:{requestedName}] {exception}");
            await Results.Json(new { message = $"C# {type} execution failed.", error = exception.Message },
                statusCode: StatusCodes.Status500InternalServerError).ExecuteAsync(context);
            return true;
        }
    }

    private async Task RunDslBodyAsync(
        string source,
        HttpContext context,
        string slug,
        JsonObject module,
        JsonObject body,
        IReadOnlyDictionary<string, string> routeValues)
    {
        JsonObject? user = null;
        if (IsTruthy(module["auth"]))
        {
            await using var authConnection = await _database.OpenAsync(slug, context.RequestAborted);
            user = (await ResolveUserAsync(context, authConnection, slug, context.RequestAborted)).User;
        }
        await RunDslBodyAsync(source, slug, module, body, routeValues, user, context.RequestAborted);
    }

    private async Task RunDslBodyAsync(
        string source,
        string slug,
        JsonObject module,
        JsonObject body,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject? user,
        CancellationToken cancellationToken)
    {
        var context = new DefaultHttpContext();
        context.RequestAborted = cancellationToken;
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        await VariantExecutor.ExecuteValueAsync(source, context, body, connection, routeValues, user);
    }

    private async Task<long> ReadLatestIdAsync(
        HttpContext context,
        string slug,
        JsonObject api,
        JsonObject module,
        string commandName)
    {
        var table = TatemonoDatabase.Quote(FindTable(slug, StringValue(api["model"]) ?? "", module));
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        var value = await ScriptDatabase.ScalarAsync(
            connection,
            $"SELECT COALESCE(MAX(id), 0) FROM {table} WHERE command_name = @command",
            new Dictionary<string, object?> { ["@command"] = commandName },
            context.RequestAborted);
        return value is null or DBNull ? 0 : Convert.ToInt64(value, System.Globalization.CultureInfo.InvariantCulture);
    }

    private async Task<JsonObject?> ReadLatestCommandAsync(
        HttpContext context,
        string slug,
        JsonObject api,
        JsonObject module,
        string commandName,
        long previousId)
    {
        var table = TatemonoDatabase.Quote(FindTable(slug, StringValue(api["model"]) ?? "", module));
        await using var connection = await _database.OpenAsync(slug, context.RequestAborted);
        var rows = await ScriptDatabase.QueryAsync(
            connection,
            $"SELECT * FROM {table} WHERE command_name = @command AND id > @previous ORDER BY id DESC LIMIT 1",
            new Dictionary<string, object?> { ["@command"] = commandName, ["@previous"] = previousId },
            context.RequestAborted);
        return rows.FirstOrDefault();
    }

    private async Task RecordJobFailureAsync(
        string slug,
        JsonObject api,
        JsonObject module,
        string jobName,
        string error,
        CancellationToken cancellationToken)
    {
        var table = TatemonoDatabase.Quote(FindTable(slug, StringValue(api["model"]) ?? "", module));
        var now = DateTime.UtcNow;
        await using var connection = await _database.OpenAsync(slug, cancellationToken);
        await ScriptDatabase.ExecuteAsync(
            connection,
            $"""
            INSERT INTO {table} (job_name, status, result, processed_at, created_at, updated_at)
            VALUES (@name, 'failed', @error, @processed, @processed, @processed)
            """,
            new Dictionary<string, object?>
            {
                ["@name"] = jobName,
                ["@error"] = error,
                ["@processed"] = now
            },
            cancellationToken);
    }

    private static Dictionary<string, string> DecodeListenerBodies(string section)
    {
        var encoded = DslSections.ReadValue(section, "listener_bodies");
        if (string.IsNullOrWhiteSpace(encoded)) return new Dictionary<string, string>();
        var json = DecodeBody(JsonValue.Create(encoded));
        var bodies = JsonNode.Parse(json) as JsonObject;
        return bodies?.ToDictionary(
            entry => entry.Key,
            entry => StringValue(entry.Value) ?? "",
            StringComparer.OrdinalIgnoreCase) ?? new Dictionary<string, string>();
    }

    private static bool MatchesDslName(string? sectionName, string requestedName)
    {
        if (string.IsNullOrWhiteSpace(sectionName)) return false;
        static string Normalize(string value) => Regex.Replace(value, @"[-_]", "").ToLowerInvariant();
        return string.Equals(sectionName, requestedName, StringComparison.OrdinalIgnoreCase) ||
               string.Equals(Normalize(sectionName), Normalize(requestedName), StringComparison.Ordinal);
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
        var joined = string.Join("/", new[] { left, right }.Where(part => part.Length > 0));
        return "/" + joined;
    }

    private static int ReadPageSize(HttpContext context, JsonObject? queryConfig)
    {
        var fallback = 15;
        var configured = StringValue(queryConfig?["per_page"]);
        if (configured is not null)
        {
            var match = Regex.Match(configured, @"default\s*:?\s*(\d+)", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
            if (match.Success && int.TryParse(match.Groups[1].Value, out var defaultPageSize) && defaultPageSize > 0)
                fallback = defaultPageSize;
        }
        return ReadPositiveInt(context.Request.Query["per_page"], fallback);
    }

    private static int ReadPositiveInt(string? value, int fallback) =>
        int.TryParse(value, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var parsed) &&
        parsed > 0
            ? parsed
            : fallback;

    private static long ReadPositiveLong(string? value, long fallback) =>
        long.TryParse(value, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var parsed) &&
        parsed >= 0
            ? parsed
            : fallback;

    private static string PageUrl(HttpContext context, long page)
    {
        var query = context.Request.Query.ToDictionary(pair => pair.Key, pair => (string?)pair.Value.ToString(),
            StringComparer.OrdinalIgnoreCase);
        query["page"] = page.ToString(System.Globalization.CultureInfo.InvariantCulture);
        return (context.Request.Path.Value ?? "/") + QueryString.Create(query).Value;
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
            // GET/DELETE clients often send a JSON Content-Type with no body at all.
            using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
            var text = await reader.ReadToEndAsync(context.RequestAborted);
            if (string.IsNullOrWhiteSpace(text)) return new JsonObject();
            if (JsonNode.Parse(text) is JsonObject body) return body;
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
        await Results.Json(new
        {
            message = "The given data was invalid.",
            errors = new Dictionary<string, string[]> { [field] = [message] }
        },
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