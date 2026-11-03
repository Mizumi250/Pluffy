using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Pluff.AspNet.Engine;
using Pluff.AspNet.Runtime;

EnvironmentFile.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddSingleton<BackgroundTaskQueue>();
builder.Services.AddHostedService(services => services.GetRequiredService<BackgroundTaskQueue>());
builder.Services.AddSingleton<BackendEngine>();

var app = builder.Build();
app.UseCors();

static string? HubMetaField(string meta, string field)
{
    var match = Regex.Match(meta, $@"^\s*{Regex.Escape(field)}:\s*(?:""([^""]*)""|'([^']*)'|([^\s#]+))", RegexOptions.Multiline);
    if (!match.Success) return null;
    for (var index = 1; index <= 3; index++)
        if (match.Groups[index].Success) return match.Groups[index].Value;
    return null;
}

static string[] HubPageNames(string source) =>
    Regex.Matches(source, @"/\* @arkzen:(?:web|native):page:(?!layout:|lynx:)([a-zA-Z0-9_-]+)")
        .Cast<Match>()
        .Select(match => match.Groups[1].Value)
        .Where(name => name is not "end" and not "layout")
        .Distinct()
        .ToArray();

static string[] HubLynxPageNames(JsonArray? pages) =>
    (pages ?? new JsonArray())
        .OfType<JsonObject>()
        .Select(page => page["page"]?.GetValue<string>())
        .Where(name => !string.IsNullOrWhiteSpace(name))
        .Select(name => name!)
        .Distinct()
        .ToArray();

static string[] HubFrontendVariants(string source)
{
    var frontend = new List<string>();
    if (Regex.IsMatch(source, @"@arkzen:(?:web:|meta:web\b)"))
        frontend.AddRange(["Next.js", "React + Vite", "React + Inertia", "Astro", "TanStack Start"]);
    if (Regex.IsMatch(source, @"/\* @arkzen:native:page:(?!lynx:)[a-zA-Z0-9_-]+"))
        frontend.AddRange(["Expo", "React Native"]);
    if (Regex.IsMatch(source, @"/\* @arkzen:native:page:lynx:[a-zA-Z0-9_-]+"))
        frontend.Add("Lynx");
    if (Regex.IsMatch(source, @"@arkzen:(?:web:|meta:web\b)") ||
        Regex.IsMatch(source, @"@arkzen:desktop:|desktopConfig|@arkzen:meta:desktop"))
        frontend.AddRange(["Tauri", "Electron"]);
    return frontend.Distinct().ToArray();
}

static string[] HubBackendVariants(string source, string activeBackend)
{
    var labels = new Dictionary<string, string>
    {
        ["php"] = "Laravel",
        ["ts"] = "Express",
        ["py"] = "FastAPI / Django",
        ["java"] = "Spring Boot",
        ["cs"] = "ASP.NET",
        ["go"] = "Go",
        ["rs"] = "Rust"
    };
    const string markers = "endpoint|handler|middleware|policy|listener|listeners|job|jobs|console|mail|notification|notifications";
    var variants = new List<string>();
    var pattern = $@"^/\* @arkzen:({markers}):(?:(php|ts|py|java|cs|go|rs):)?([a-zA-Z0-9_-]+)(?:\s+\*/)?\s*$";
    foreach (Match match in Regex.Matches(source, pattern, RegexOptions.Multiline))
    {
        var marker = match.Groups[1].Value;
        var variant = match.Groups[2].Value;
        var name = match.Groups[3].Value;
        var close = variant.Length == 0
            ? $"/* @arkzen:{marker}:{name}:end */"
            : $"/* @arkzen:{marker}:{variant}:{name}:end */";
        var inlineClose = match.Value.IndexOf("*/", StringComparison.Ordinal);
        var openingEnd = inlineClose >= 0 ? match.Index + inlineClose : source.IndexOf("*/", match.Index + match.Length, StringComparison.Ordinal);
        var closingStart = openingEnd < 0 ? -1 : source.IndexOf(close, openingEnd + 2, StringComparison.Ordinal);
        if (openingEnd < 0 || closingStart < 0 || string.IsNullOrWhiteSpace(source[(openingEnd + 2)..closingStart])) continue;
        variants.Add(labels[variant.Length == 0 ? "php" : variant]);
    }

    if (variants.Count == 0 && Regex.IsMatch(source, @"auth:\s*true|@arkzen:(?:api|database|auth|jobs|events|mail|notifications|routes|realtime|console|store)"))
    {
        variants.Add(activeBackend switch
        {
            "express" => "Express",
            "fastapi" or "django" => "FastAPI / Django",
            "spring-boot" => "Spring Boot",
            "aspnet" => "ASP.NET",
            "go" => "Go",
            "rust" => "Rust",
            _ => "Laravel"
        });
    }
    return variants.Distinct().ToArray();
}

static JsonObject ReadHubRegistry(string repoRoot)
{
    var root = Path.GetFullPath(repoRoot);
    var registryPath = Path.Combine(root, "arkzen.json");
    var registry = File.Exists(registryPath)
        ? JsonNode.Parse(File.ReadAllText(registryPath)) as JsonObject ?? new JsonObject()
        : new JsonObject { ["project"] = Path.GetFileName(root) };
    var activeStack = registry["activeStack"]?.GetValue<string>() ?? "nextjs";
    var activeBackend = activeStack == "react-inertia" ? "laravel-inertia" : registry["activeBackend"]?.GetValue<string>() ?? "laravel";
    var modules = new Dictionary<string, JsonObject>();
    var tatemonos = Path.Combine(root, "tatemonos");
    if (Directory.Exists(tatemonos))
    {
        foreach (var sourcePath in Directory.EnumerateDirectories(tatemonos)
                     .Select(directory => Path.Combine(directory, "core.tsx"))
                     .Where(File.Exists))
        {
            var source = File.ReadAllText(sourcePath);
            var meta = Regex.Match(source, @"/\* @arkzen:meta\b([\s\S]*?)\*/");
            if (!meta.Success) continue;
            var name = HubMetaField(meta.Groups[1].Value, "name");
            if (string.IsNullOrWhiteSpace(name)) continue;
            modules[name] = new JsonObject
            {
                ["name"] = name,
                ["version"] = HubMetaField(meta.Groups[1].Value, "version") ?? "1.0.0",
                ["status"] = "active",
                ["filePath"] = Path.GetRelativePath(root, sourcePath).Replace('\\', '/'),
                ["pages"] = new JsonArray(HubPageNames(source).Select(value => (JsonNode?)JsonValue.Create(value)).ToArray()),
                ["auth"] = string.Equals(HubMetaField(meta.Groups[1].Value, "auth"), "true", StringComparison.OrdinalIgnoreCase)
            };
        }
    }

    if (registry["modules"] is JsonArray registeredModules)
    {
        foreach (var registered in registeredModules.OfType<JsonObject>())
        {
            var name = registered["name"]?.GetValue<string>();
            if (string.IsNullOrWhiteSpace(name)) continue;
            var merged = modules.TryGetValue(name, out var discovered) ? (JsonObject)discovered.DeepClone() : new JsonObject();
            foreach (var (key, value) in registered) merged[key] = value?.DeepClone();
            modules[name] = merged;
        }
    }

    var enrichedModules = new JsonArray();
    foreach (var (name, module) in modules)
    {
        var relativePath = module["filePath"]?.GetValue<string>() ?? $"tatemonos/{name}/core.tsx";
        var sourcePath = Path.GetFullPath(Path.Combine(root, relativePath));
        if (!sourcePath.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase) || !File.Exists(sourcePath))
        {
            module["frontend"] = new JsonArray();
            module["backend"] = new JsonArray();
            enrichedModules.Add(module);
            continue;
        }
        var source = File.ReadAllText(sourcePath);
        module["frontend"] = new JsonArray(HubFrontendVariants(source).Select(value => (JsonNode?)JsonValue.Create(value)).ToArray());
        module["backend"] = new JsonArray(HubBackendVariants(source, activeBackend).Select(value => (JsonNode?)JsonValue.Create(value)).ToArray());
        enrichedModules.Add(module);
    }

    registry["activeStack"] = activeStack;
    registry["activeBackend"] = activeBackend;
    registry["activeDatabase"] ??= "sqlite";
    registry["modules"] = enrichedModules;
    return registry;
}

app.MapGet("/arkzen/health", () => Results.Json(new
{
    status = "ok",
    engine = "Pluff ASP.NET Core Backend Engine",
    backend = "aspnet",
    variant = "cs",
    version = "1.0.0"
}));

app.MapGet("/arkzen/registry", () =>
{
    var root = BackendEngine.FindRepositoryRoot();
    return Results.Json(ReadHubRegistry(root));
});

app.MapGet("/arkzen/expo-registry", () =>
{
    var root = BackendEngine.FindRepositoryRoot();
    var registryPath = Path.Combine(root, "engine", "frontend", "expo", "expo-registry.json");
    if (!File.Exists(registryPath))
        return Results.NotFound(new { message = "Expo registry was not found." });

    var registry = JsonNode.Parse(File.ReadAllText(registryPath)) as JsonObject
        ?? throw new InvalidDataException("Expo registry must contain a JSON object.");
    return Results.Json(registry);
});

app.MapGet("/arkzen/lynx-registry", () =>
{
    var root = BackendEngine.FindRepositoryRoot();
    var hubRegistry = ReadHubRegistry(root);
    var activeBackend = hubRegistry["activeBackend"]?.GetValue<string>() ?? "aspnet";
    var routesPath = Path.Combine(root, "engine", "frontend", "lynx", "src", "arkzen", "generated", "routes.meta.json");
    if (!File.Exists(routesPath))
        return Results.NotFound(new { message = "Lynx route registry was not found." });

    var routes = JsonNode.Parse(File.ReadAllText(routesPath)) as JsonObject
        ?? throw new InvalidDataException("Lynx route registry must contain a JSON object.");
    var storedRegistryPath = Path.Combine(root, "engine", "frontend", "lynx", "lynx-registry.json");
    var storedRegistry = File.Exists(storedRegistryPath)
        ? JsonNode.Parse(File.ReadAllText(storedRegistryPath)) as JsonObject
        : null;
    var storedModules = (storedRegistry?["modules"] as JsonArray ?? new JsonArray())
        .OfType<JsonObject>()
        .Where(module => module["name"] is JsonValue)
        .ToDictionary(module => module["name"]!.GetValue<string>(), StringComparer.OrdinalIgnoreCase);
    var modules = new JsonArray();

    foreach (var (name, routeNode) in routes)
    {
        if (!Regex.IsMatch(name, @"^[a-zA-Z0-9][a-zA-Z0-9-]*$") || routeNode is not JsonObject route ||
            route["pages"] is not JsonArray pages)
            continue;

        var sourcePath = Path.GetFullPath(Path.Combine(root, "tatemonos", name, "core.tsx"));
        if (!sourcePath.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase) ||
            !File.Exists(sourcePath))
            continue;

        var source = File.ReadAllText(sourcePath);
        var meta = Regex.Match(source, @"/\* @arkzen:meta\b([\s\S]*?)\*/");
        if (!meta.Success || !string.Equals(HubMetaField(meta.Groups[1].Value, "name"), name, StringComparison.OrdinalIgnoreCase))
            continue;

        storedModules.TryGetValue(name, out var stored);
        var file = new FileInfo(sourcePath);
        var module = new JsonObject
        {
            ["name"] = name,
            ["version"] = HubMetaField(meta.Groups[1].Value, "version") ?? "1.0.0",
            ["status"] = "active",
            ["filePath"] = Path.GetRelativePath(root, sourcePath).Replace('\\', '/'),
            ["pages"] = new JsonArray(HubLynxPageNames(pages).Select(page => (JsonNode?)JsonValue.Create(page)).ToArray()),
            ["auth"] = string.Equals(HubMetaField(meta.Groups[1].Value, "auth"), "true", StringComparison.OrdinalIgnoreCase),
            ["registered"] = stored?["registered"]?.DeepClone() ?? JsonValue.Create(file.CreationTimeUtc),
            ["lastUpdated"] = JsonValue.Create(file.LastWriteTimeUtc),
            ["frontend"] = new JsonArray(HubFrontendVariants(source).Select(value => (JsonNode?)JsonValue.Create(value)).ToArray()),
            ["backend"] = new JsonArray(HubBackendVariants(source, activeBackend).Select(value => (JsonNode?)JsonValue.Create(value)).ToArray())
        };
        modules.Add(module);
    }

    return Results.Json(new JsonObject
    {
        ["engine"] = storedRegistry?["engine"]?.DeepClone() ?? JsonValue.Create("1.0.0"),
        ["project"] = "lynx",
        ["modules"] = modules,
        ["activeStack"] = "lynx",
        ["activeBackend"] = hubRegistry["activeBackend"]?.DeepClone(),
        ["activeDatabase"] = hubRegistry["activeDatabase"]?.DeepClone()
    });
});

app.MapPost("/arkzen/build", async (HttpContext context, BackendEngine engine) =>
{
    if (!EngineSecret.IsValid(context)) return Results.Json(new { message = "Invalid engine secret." }, statusCode: 403);
    var payload = await JsonNode.ParseAsync(context.Request.Body, cancellationToken: context.RequestAborted) as JsonObject;
    if (payload is null) return Results.BadRequest(new { success = false, message = "Expected a JSON object payload." });
    var result = await engine.BuildAsync(payload, context.RequestAborted);
    return Results.Json(result.Body, statusCode: result.Status);
});

app.MapPost("/arkzen/remove", async (HttpContext context, BackendEngine engine) =>
{
    if (!EngineSecret.IsValid(context)) return Results.Json(new { message = "Invalid engine secret." }, statusCode: 403);
    var payload = await JsonNode.ParseAsync(context.Request.Body, cancellationToken: context.RequestAborted) as JsonObject;
    if (payload is null) return Results.BadRequest(new { success = false, message = "Expected a JSON object payload." });
    var result = await engine.RemoveAsync(payload, context.RequestAborted);
    return Results.Json(result.Body, statusCode: result.Status);
});

app.Map("/{**path}", async context =>
{
    var engine = context.RequestServices.GetRequiredService<BackendEngine>();
    await engine.DispatchAsync(context);
});

var realtimePort = int.TryParse(Environment.GetEnvironmentVariable("REVERB_PORT"), out var configuredRealtimePort)
    ? configuredRealtimePort
    : 8080;
var realtimeServer = BroadcastHub.CreateServer(realtimePort, app.Logger);
try
{
    await realtimeServer.StartAsync();
}
catch (System.IO.IOException exception)
{
    app.Logger.LogError(exception, "ASP.NET realtime server could not start on port {Port}.", realtimePort);
    await realtimeServer.DisposeAsync();
    realtimeServer = null!;
}

await app.RunAsync();
if (realtimeServer is not null)
{
    await realtimeServer.StopAsync();
    await realtimeServer.DisposeAsync();
}
