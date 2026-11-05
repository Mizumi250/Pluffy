using System.Reflection;
using System.Runtime.Loader;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace Pluff.AspNet.Engine;

internal sealed record GeneratedApiRoute(
    JsonObject Api,
    string Name,
    JsonObject? Endpoint,
    string Method,
    string Pattern,
    string Controller,
    int ApiIndex);

internal sealed record GeneratedModule(
    IReadOnlyList<GeneratedApiRoute> Routes,
    IReadOnlyDictionary<string, string> Files,
    AssemblyLoadContext LoadContext);

internal static class ModuleSourceGenerator
{
    public static GeneratedModule Generate(JsonObject module)
    {
        var slug = module["name"]?.GetValue<string>() ?? throw new InvalidDataException("Module name is required for generation.");
        var files = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var routes = new List<GeneratedApiRoute>();
        var modelNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var controllerNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var apis = (module["apis"] as JsonArray ?? new JsonArray()).OfType<JsonObject>().ToArray();

        for (var apiIndex = 0; apiIndex < apis.Length; apiIndex++)
        {
            var api = apis[apiIndex];
            var model = api["model"]?.GetValue<string>() ?? "ApiModel";
            var controller = api["controller"]?.GetValue<string>() ?? $"{model}Controller";
            var modelType = UniqueIdentifier(model, modelNames.Values);
            modelNames[model] = modelType;
            var controllerType = UniqueIdentifier(controller, controllerNames);
            controllerNames.Add(controllerType);
            var prefix = api["prefix"]?.GetValue<string>();
            var resourcePrefix = string.IsNullOrWhiteSpace(prefix)
                ? $"/api/{slug}/{Pluralize(SnakeCase(model))}"
                : prefix;
            var controllerPrefix = api["endpoints"] is JsonObject { Count: > 0 }
                ? prefix ?? ""
                : resourcePrefix;
            var actions = new List<(string Name, string Method, string Route)>();

            if (api["endpoints"] is JsonObject endpoints && endpoints.Count > 0)
            {
                foreach (var (name, value) in endpoints)
                {
                    if (value is not JsonObject endpoint) continue;
                    var method = (endpoint["method"]?.GetValue<string>() ?? "GET").ToUpperInvariant();
                    var route = endpoint["route"]?.GetValue<string>() ?? "/";
                    routes.Add(new GeneratedApiRoute(api, name, endpoint, method, JoinPath(prefix ?? "", route), controllerType, apiIndex));
                    actions.Add((name, method, route));
                }
            }
            else
            {
                foreach (var (name, method, route) in new[]
                {
                    ("index", "GET", resourcePrefix),
                    ("show", "GET", JoinPath(resourcePrefix, "{id}")),
                    ("store", "POST", resourcePrefix),
                    ("update", "PUT", JoinPath(resourcePrefix, "{id}")),
                    ("destroy", "DELETE", JoinPath(resourcePrefix, "{id}"))
                })
                {
                    routes.Add(new GeneratedApiRoute(api, name, null, method, route, controllerType, apiIndex));
                    actions.Add((name, method, route));
                }
            }

            files[$"Controllers/{controllerType}.cs"] = GenerateController(slug, controllerType, modelType, controllerPrefix, actions);
        }

        foreach (var database in (module["databases"] as JsonArray ?? new JsonArray()).OfType<JsonObject>())
        {
            var table = database["table"]?.GetValue<string>();
            if (string.IsNullOrWhiteSpace(table)) continue;
            var model = modelNames.FirstOrDefault(entry =>
                string.Equals(SnakeCase(entry.Key), Singularize(table), StringComparison.OrdinalIgnoreCase) ||
                string.Equals(SnakeCase(entry.Key) + "s", table, StringComparison.OrdinalIgnoreCase)).Value;
            model ??= Identifier(Studly(Singularize(table)));
            files[$"Models/{model}.cs"] = GenerateModel(slug, model, database);
        }

        files["Routes.cs"] = GenerateRoutes(slug, routes);
        files["Module.cs"] = GenerateModule(slug, files.Keys);
        var loadContext = CompileAndLoad(slug, files);
        try
        {
            return new GeneratedModule(LoadRoutes(slug, module, loadContext), files, loadContext);
        }
        catch
        {
            loadContext.Unload();
            throw;
        }
    }

    private static string GenerateModel(string slug, string model, JsonObject database)
    {
        var builder = new StringBuilder();
        var propertyNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        builder.AppendLine($"namespace Pluff.AspNet.Generated.{Identifier(Studly(slug))}.Models;");
        builder.AppendLine();
        builder.AppendLine($"public sealed class {model}");
        builder.AppendLine("{");
        foreach (var (name, value) in (database["columns"] as JsonObject ?? new JsonObject()))
        {
            var column = value as JsonObject;
            var type = CSharpType(column?["type"]?.GetValue<string>());
            var nullable = column?["nullable"]?.GetValue<bool>() != false;
            var required = !nullable && (type is "string" or "System.Text.Json.Nodes.JsonNode") ? "required " : "";
            var propertyType = type + (nullable ? "?" : "");
            var propertyName = UniqueIdentifier(Studly(name), propertyNames);
            propertyNames.Add(propertyName);
            builder.AppendLine($"    public {required}{propertyType} {propertyName} {{ get; init; }}");
        }
        builder.AppendLine("}");
        return builder.ToString();
    }

    private static string GenerateController(
        string slug,
        string controller,
        string model,
        string prefix,
        IReadOnlyList<(string Name, string Method, string Route)> actions)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"namespace Pluff.AspNet.Generated.{Identifier(Studly(slug))}.Controllers;");
        builder.AppendLine();
        builder.AppendLine($"public static class {controller}");
        builder.AppendLine("{");
        builder.AppendLine($"    public const string Model = {Literal(model)};");
        builder.AppendLine($"    public const string Prefix = {Literal(prefix ?? "")};");
        builder.AppendLine("    public static readonly (string Name, string Method, string Route)[] Actions =");
        builder.AppendLine("    {");
        foreach (var action in actions)
            builder.AppendLine($"        ({Literal(action.Name)}, {Literal(action.Method)}, {Literal(action.Route)}),");
        builder.AppendLine("    };");
        builder.AppendLine("}");
        return builder.ToString();
    }

    private static string GenerateRoutes(string slug, IReadOnlyList<GeneratedApiRoute> routes)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"namespace Pluff.AspNet.Generated.{Identifier(Studly(slug))};");
        builder.AppendLine();
        builder.AppendLine("public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);");
        builder.AppendLine();
        builder.AppendLine("public static class Routes");
        builder.AppendLine("{");
        builder.AppendLine("    public static readonly RouteDefinition[] All =");
        builder.AppendLine("    {");
        foreach (var route in routes)
        {
            builder.AppendLine($"        new({route.ApiIndex}, {Literal(route.Name)}, {Literal(route.Method)}, {Literal(route.Pattern)}, {Literal(route.Controller)}),");
        }
        builder.AppendLine("    };");
        builder.AppendLine("}");
        return builder.ToString();
    }

    private static string GenerateModule(string slug, IEnumerable<string> files)
    {
        var fileNames = files.Append("Module.cs").OrderBy(file => file, StringComparer.Ordinal).ToArray();
        var builder = new StringBuilder();
        builder.AppendLine($"namespace Pluff.AspNet.Generated.{Identifier(Studly(slug))};");
        builder.AppendLine();
        builder.AppendLine("public static class Module");
        builder.AppendLine("{");
        builder.AppendLine($"    public const string Name = {Literal(slug)};");
        builder.AppendLine("    public static readonly string[] Files =");
        builder.AppendLine("    {");
        foreach (var file in fileNames) builder.AppendLine($"        {Literal(file)},");
        builder.AppendLine("    };");
        builder.AppendLine("}");
        return builder.ToString();
    }

    private static string CSharpType(string? type) => type?.ToLowerInvariant() switch
    {
        "integer" or "biginteger" or "foreignid" => "long",
        "boolean" => "bool",
        "float" => "double",
        "decimal" => "decimal",
        "date" => "global::System.DateOnly",
        "datetime" or "timestamp" => "global::System.DateTime",
        "json" => "System.Text.Json.Nodes.JsonNode",
        _ => "string"
    };

    private static AssemblyLoadContext CompileAndLoad(string slug, IReadOnlyDictionary<string, string> files)
    {
        var assemblyName = $"Pluff.Generated.{Identifier(Studly(slug))}.{Guid.NewGuid():N}";
        var syntaxTrees = files.Select(file =>
            CSharpSyntaxTree.ParseText(file.Value, CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.Latest), file.Key));
        var trustedAssemblies = (AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES") as string)?
            .Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries)
            ?? throw new InvalidOperationException("The .NET runtime did not provide trusted platform assemblies.");
        var references = trustedAssemblies
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(path => MetadataReference.CreateFromFile(path));
        var compilation = CSharpCompilation.Create(
            assemblyName,
            syntaxTrees,
            references,
            new CSharpCompilationOptions(
                OutputKind.DynamicallyLinkedLibrary,
                nullableContextOptions: NullableContextOptions.Enable));
        using var output = new MemoryStream();
        var result = compilation.Emit(output);
        if (!result.Success)
        {
            var diagnostics = result.Diagnostics
                .Where(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error)
                .Select(diagnostic => diagnostic.ToString());
            throw new InvalidDataException($"Generated ASP.NET module failed to compile: {string.Join(Environment.NewLine, diagnostics)}");
        }

        output.Position = 0;
        var loadContext = new AssemblyLoadContext(assemblyName, isCollectible: true);
        try
        {
            loadContext.LoadFromStream(output);
            return loadContext;
        }
        catch
        {
            loadContext.Unload();
            throw;
        }
    }

    private static IReadOnlyList<GeneratedApiRoute> LoadRoutes(
        string slug,
        JsonObject module,
        AssemblyLoadContext loadContext)
    {
        var assembly = loadContext.Assemblies.Single();
        var generatedNamespace = $"Pluff.AspNet.Generated.{Identifier(Studly(slug))}";
        var routeType = assembly.GetType($"{generatedNamespace}.Routes", throwOnError: true)!;
        var routeDefinitions = routeType.GetField("All", BindingFlags.Public | BindingFlags.Static)?.GetValue(null) as Array
            ?? throw new InvalidDataException("Generated ASP.NET route table was not found.");
        var apis = (module["apis"] as JsonArray ?? new JsonArray()).OfType<JsonObject>().ToArray();
        var routes = new List<GeneratedApiRoute>(routeDefinitions.Length);
        foreach (var definition in routeDefinitions)
        {
            if (definition is null) continue;
            var definitionType = definition.GetType();
            var apiIndex = (int)(definitionType.GetProperty("ApiIndex")?.GetValue(definition)
                ?? throw new InvalidDataException("Generated route has no API index."));
            if (apiIndex < 0 || apiIndex >= apis.Length)
                throw new InvalidDataException("Generated route references an invalid API index.");
            var api = apis[apiIndex];
            var name = (string)(definitionType.GetProperty("Name")?.GetValue(definition)
                ?? throw new InvalidDataException("Generated route has no name."));
            var endpoint = (api["endpoints"] as JsonObject)?[name] as JsonObject;
            routes.Add(new GeneratedApiRoute(
                api,
                name,
                endpoint,
                (string)(definitionType.GetProperty("Method")?.GetValue(definition) ?? "GET"),
                (string)(definitionType.GetProperty("Pattern")?.GetValue(definition) ?? "/"),
                (string)(definitionType.GetProperty("Controller")?.GetValue(definition) ?? ""),
                apiIndex));
        }
        return routes;
    }

    private static string UniqueIdentifier(string value, IEnumerable<string> used)
    {
        var identifier = Identifier(Studly(value));
        var existing = new HashSet<string>(used, StringComparer.OrdinalIgnoreCase);
        if (!existing.Contains(identifier)) return identifier;
        var suffix = 2;
        while (existing.Contains($"{identifier}{suffix}")) suffix++;
        return $"{identifier}{suffix}";
    }

    private static string Identifier(string value)
    {
        var normalized = Regex.Replace(value, "[^A-Za-z0-9_]", "_");
        if (normalized.Length == 0 || !char.IsLetter(normalized[0]) && normalized[0] != '_') normalized = "_" + normalized;
        return CSharpKeywords.Contains(normalized) ? "@" + normalized : normalized;
    }

    private static readonly HashSet<string> CSharpKeywords = new(StringComparer.Ordinal)
    {
        "abstract", "as", "base", "bool", "break", "byte", "case", "catch", "char", "checked", "class",
        "const", "continue", "decimal", "default", "delegate", "do", "double", "else", "enum", "event",
        "explicit", "extern", "false", "finally", "fixed", "float", "for", "foreach", "goto", "if", "implicit",
        "in", "int", "interface", "internal", "is", "lock", "long", "namespace", "new", "null", "object",
        "operator", "out", "override", "params", "private", "protected", "public", "readonly", "ref", "return",
        "sbyte", "sealed", "short", "sizeof", "stackalloc", "static", "string", "struct", "switch", "this",
        "throw", "true", "try", "typeof", "uint", "ulong", "unchecked", "unsafe", "ushort", "using", "virtual",
        "void", "volatile", "while"
    };

    private static string Studly(string value) => string.Concat(
        Regex.Split(value, "[-_\\s]+")
            .Where(part => part.Length > 0)
            .Select(part => char.ToUpperInvariant(part[0]) + part[1..]));

    private static string SnakeCase(string value) =>
        Regex.Replace(value, "([a-z0-9])([A-Z])", "$1_$2").Replace('-', '_').ToLowerInvariant();

    private static string Pluralize(string value) => value.EndsWith('y')
        ? value[..^1] + "ies"
        : value.EndsWith('s') ? value + "es" : value + "s";

    private static string Singularize(string value)
    {
        if (value.EndsWith("ies", StringComparison.OrdinalIgnoreCase)) return value[..^3] + "y";
        if (value.EndsWith("sses", StringComparison.OrdinalIgnoreCase)) return value[..^2];
        if (value.EndsWith('s') && !value.EndsWith("ss", StringComparison.OrdinalIgnoreCase) &&
            !value.EndsWith("us", StringComparison.OrdinalIgnoreCase)) return value[..^1];
        return value;
    }

    private static string JoinPath(string prefix, string route) =>
        "/" + string.Join("/", new[] { prefix.Trim('/'), route.Trim('/') }.Where(part => part.Length > 0));

    private static string Literal(string value) => JsonSerializer.Serialize(value);
}
