using System.Collections.Concurrent;
using System.Data.Common;
using System.Reflection;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Http;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace Pluff.AspNet.Runtime;

public sealed class VariantGlobals
{
    public HttpContext Context { get; }
    public JsonObject Body { get; }
    public DbConnection Database { get; }
    public IReadOnlyDictionary<string, string> RouteValues { get; }
    public JsonObject? user { get; }
    public JsonObject? item { get; }

    public VariantGlobals(
        HttpContext context,
        JsonObject body,
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject? user = null,
        JsonObject? item = null)
    {
        Context = context;
        Body = body;
        Database = database;
        RouteValues = routeValues;
        this.user = user;
        this.item = item;
    }
}

public static class VariantExecutor
{
    private static readonly ConcurrentDictionary<string, Script<object?>> Scripts = new();
    private static readonly ScriptOptions Options = ScriptOptions.Default
        .AddReferences(
            typeof(HttpContext).Assembly,
            typeof(JsonNode).Assembly,
            typeof(DbConnection).Assembly,
            Assembly.GetExecutingAssembly())
        .AddImports(
            "System",
            "System.Linq",
            "System.Collections.Generic",
            "System.Text.Json",
            "System.Text.Json.Nodes",
            "Pluff.AspNet.Runtime",
            "Microsoft.AspNetCore.Http",
            "Microsoft.AspNetCore.Http.Results");

    private static Script<object?> GetScript(string source) =>
        Scripts.GetOrAdd(source, code => CSharpScript.Create<object?>(code, Options, typeof(VariantGlobals)));

    public static async Task<bool> ExecuteAsync(
        string source,
        HttpContext context,
        JsonObject body,
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject? user = null)
    {
        var state = await GetScript(source).RunAsync(
            new VariantGlobals(context, body, database, routeValues, user),
            cancellationToken: context.RequestAborted);
        if (context.Response.HasStarted) return true;

        switch (state.ReturnValue)
        {
            case IResult result:
                await result.ExecuteAsync(context);
                return true;
            case null:
                return false;
            default:
                await Results.Json(state.ReturnValue).ExecuteAsync(context);
                return true;
        }
    }

    public static async Task<object?> ExecuteValueAsync(
        string source,
        HttpContext context,
        JsonObject body,
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject? user = null)
    {
        var state = await GetScript(source).RunAsync(
            new VariantGlobals(context, body, database, routeValues, user),
            cancellationToken: context.RequestAborted);
        return state.ReturnValue;
    }

    public static async Task<bool> EvaluatePolicyAsync(
        string source,
        HttpContext context,
        JsonObject body,
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject? user,
        JsonObject item)
    {
        var state = await GetScript(source).RunAsync(
            new VariantGlobals(context, body, database, routeValues, user, item),
            cancellationToken: context.RequestAborted);
        return state.ReturnValue is bool allowed
            ? allowed
            : throw new InvalidOperationException("A C# policy must return true or false.");
    }
}
