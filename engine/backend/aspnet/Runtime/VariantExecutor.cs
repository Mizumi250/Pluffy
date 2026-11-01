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

    public VariantGlobals(HttpContext context, JsonObject body, DbConnection database, IReadOnlyDictionary<string, string> routeValues)
    {
        Context = context;
        Body = body;
        Database = database;
        RouteValues = routeValues;
    }
}

public static class VariantExecutor
{
    private static readonly ConcurrentDictionary<string, ScriptRunner<object?>> Runners = new();
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
            "Microsoft.AspNetCore.Http",
            "Microsoft.AspNetCore.Http.Results");

    public static async Task<bool> ExecuteAsync(
        string source,
        HttpContext context,
        JsonObject body,
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues)
    {
        var runner = Runners.GetOrAdd(source, code =>
        {
            var script = CSharpScript.Create<object?>(code, Options, typeof(VariantGlobals));
            return script.CreateDelegate();
        });

        var state = await runner(
            new VariantGlobals(context, body, database, routeValues),
            context.RequestAborted);
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
}
