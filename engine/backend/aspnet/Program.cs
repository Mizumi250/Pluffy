using System.Text.Json.Nodes;
using Pluff.AspNet.Engine;
using Pluff.AspNet.Runtime;

EnvironmentFile.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddSingleton<BackendEngine>();

var app = builder.Build();
app.UseCors();

app.MapGet("/arkzen/health", () => Results.Json(new
{
    status = "ok",
    engine = "Pluff ASP.NET Core Backend Engine",
    backend = "aspnet",
    variant = "cs",
    version = "1.0.0"
}));

app.MapGet("/arkzen/registry", (HttpContext context) =>
{
    if (!EngineSecret.IsValid(context)) return Results.Json(new { message = "Invalid engine secret." }, statusCode: 403);
    var file = Path.Combine(BackendEngine.FindRepositoryRoot(), "arkzen.json");
    if (!File.Exists(file)) return Results.Json(new { project = Path.GetFileName(Directory.GetCurrentDirectory()) });
    return Results.Json(JsonNode.Parse(File.ReadAllText(file)));
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

app.Run();
